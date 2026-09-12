import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {};
  const allowed = new Set([
    '--student',
    '--group',
    '--challenge-id',
    '--repo',
    '--commit',
    '--repo-signals',
    '--evidence-summary'
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];

    if (allowed.has(key) && value && !value.startsWith('--')) {
      args[key.slice(2)] = value;
      index += 1;
    }
  }

  return args;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readOptionalJson(rootDir, filePath) {
  if (!filePath) {
    return null;
  }

  try {
    return await readJson(path.resolve(rootDir, filePath));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function resolveChallengeId(rootDir, student, group, challengeIdOverride = '') {
  if (challengeIdOverride) {
    return challengeIdOverride;
  }

  const config = await readJson(path.join(rootDir, 'course', 'active-challenges.json'));
  const studentAssignment = student ? config.students?.[student] : null;

  if (studentAssignment?.challenge_id) {
    return studentAssignment.challenge_id;
  }

  const groupAssignment = group ? config.groups?.[group] : null;
  if (groupAssignment?.challenge_id) {
    return groupAssignment.challenge_id;
  }

  throw new Error(`No s'ha trobat autocorrecció activa per a student=${student || '(sense)'} group=${group || '(sense)'}`);
}

function normalizeToken(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function summaryMatchesActiveTokens(summary, tokens) {
  if (!summary || tokens.length === 0) {
    return false;
  }

  const text = [
    summary.path,
    summary.excerpt
  ].filter(Boolean).join('\n');
  const lowerText = text.toLowerCase();
  const normalizedText = normalizeToken(text);

  return tokens.some((token) => lowerText.includes(token) || normalizedText.includes(token));
}

function isUnfilledTemplateReadme(summary) {
  const excerpt = String(summary?.excerpt || '');

  return excerpt.includes("Este és el fitxer que has d'actualitzar en cada entrega.")
    && excerpt.includes('| Què he fet |  |')
    && excerpt.includes('| Com provar-ho |  |')
    && excerpt.includes('| Evidències principals |  |');
}

function countEvidenceFiles(evidenceSummary) {
  if (!evidenceSummary) {
    return 0;
  }

  const activeTokens = Array.isArray(evidenceSummary.evidence_scope?.active_tokens)
    ? evidenceSummary.evidence_scope.active_tokens
    : [];
  const fileSectionCount = [
    evidenceSummary.docs_files,
    evidenceSummary.evidence_files,
    evidenceSummary.test_files,
    evidenceSummary.source_files
  ].reduce((total, section) => total + (Array.isArray(section) ? section.length : 0), 0);
  const activeMainFilesCount = [
    evidenceSummary.ai_log
  ].filter((summary) => summaryMatchesActiveTokens(summary, activeTokens)).length;
  const activeReadmeCount = summaryMatchesActiveTokens(evidenceSummary.readme, activeTokens)
    && !isUnfilledTemplateReadme(evidenceSummary.readme)
    ? 1
    : 0;

  return fileSectionCount + activeMainFilesCount + activeReadmeCount;
}

function requireArgs(args) {
  const missing = ['student', 'group', 'repo', 'commit'].filter((key) => !args[key]);
  if (missing.length > 0) {
    throw new Error(`Falten arguments obligatoris: ${missing.map((key) => `--${key}`).join(', ')}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  requireArgs(args);

  const rootDir = process.cwd();
  const challengeId = await resolveChallengeId(rootDir, args.student, args.group, args['challenge-id']);
  const challengeDir = path.join(rootDir, 'microreptes', challengeId);

  const [policies, challenge, rubric] = await Promise.all([
    readJson(path.join(rootDir, 'global', 'policies.json')),
    readJson(path.join(challengeDir, 'challenge.json')),
    readJson(path.join(challengeDir, 'rubric.json'))
  ]);
  if (challenge.deprecated) throw new Error(`Autocorrecció retirada; usa ${challenge.replacement_challenge_id}`);
  const [repoSignals, evidenceSummary] = await Promise.all([
    readOptionalJson(rootDir, args['repo-signals']),
    readOptionalJson(rootDir, args['evidence-summary'])
  ]);

  const payload = {
    student: args.student,
    group: args.group,
    repo: args.repo,
    commit: args.commit,
    challenge_id: challengeId,
    microrepte_code: challenge.microrepte_code,
    challenge_title: challenge.title,
    primary_ra: challenge.primary_ra,
    assessed_ca: challenge.assessed_ca,
    assessed_ra: Array.isArray(challenge.assessed_ra) ? challenge.assessed_ra : [
      {
        ra_id: challenge.primary_ra,
        assessed_ca: challenge.assessed_ca,
        weight: 1
      }
    ],
    context_ra: challenge.context_ra,
    repte_extension: challenge.repte_extension || null,
    rubric_id: rubric.rubric_id,
    policies_version: policies.version,
    expected_signals: challenge.expected_signals,
    required_evidence: challenge.required_evidence,
    dimensions: rubric.dimensions,
    scoring_guardrails: {
      active_microrepte_only: true,
      active_evidence_files_count: countEvidenceFiles(evidenceSummary),
      rule: 'Avalua nomes evidencies vinculades al challenge_id o microrepte_code actiu. El treball de microreptes anteriors pot servir de context, pero no ha de sumar punts si no demostra el microrepte actual.',
      max_score_without_active_evidence: 2,
      max_score_with_only_previous_microrepte_evidence: 2
    },
    delivery_contract: {
      main_readme: 'README.md de l_arrel es la fitxa de l_entrega actual. Ha d_identificar el microrepte, resumir que s_ha fet, explicar com provar-ho i enllacar evidencies concretes.',
      overwrite_rule: 'En cada microrepte l_alumnat pot sobreescriure README.md. No penalitzes que no mantinga historial complet en README.md si els fitxers del microrepte actual estan localitzables.',
      linked_evidence_rule: 'Docs, evidencies i tests del microrepte han d_estar en fitxers o carpetes amb el nom/codi del microrepte, per exemple docs/r2m3.md, evidence/r2m3/ o tests/r2m3.test.php, i idealment enllacats des de README.md.',
      folder_readmes_rule: 'docs/README.md, evidence/README.md i tests/README.md son guies de carpeta del template. No els puntues com a entrega del microrepte ni penalitzes que no estiguen modificats.',
      tests_rule: 'Els tests compten quan son executables i comproven comportament observable. Si el microrepte encara no exigeix test automatic, accepta una prova manual reproduible amb passos, dades i resultat esperat.'
    },
    student_repository_evidence: {
      repo_signals: repoSignals,
      evidence_summary: evidenceSummary
    }
  };

  const outputDir = path.join(rootDir, 'tmp');
  const outputPath = path.join(outputDir, 'evaluation-payload.json');
  const formatted = `${JSON.stringify(payload, null, 2)}\n`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, formatted, 'utf8');
  console.log(formatted.trimEnd());
}

main().catch((error) => {
  console.error(`No s'ha pogut construir el payload d'avaluacio: ${error.message}`);
  process.exit(1);
});
