import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { readGrades } from './lib/grades-store.mjs';

function parseArgs(argv) {
  const args = {
    'output-dir': path.join('grades', 'reports')
  };
  const allowed = new Set(['--challenge-id', '--group', '--output-dir', '--help']);

  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!allowed.has(key)) {
      throw new Error(`Argument no reconegut: ${key}`);
    }

    if (key === '--help') {
      args.help = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Falta valor per a ${key}`);
    }

    args[key.slice(2)] = value;
    index += 1;
  }

  return args;
}

function printUsage() {
  console.log(`Ús:
node scripts/build-class-followup-report.mjs \\
  --challenge-id r2-s03-logica-flux-regles-projecte \\
  --group 2DAW-C

Genera un informe docent per preparar la classe posterior a un microrepte.
El resultat es guarda en grades/reports/.`);
}

function requireArgs(args) {
  const missing = ['challenge-id', 'group'].filter((key) => !args[key]);
  if (missing.length > 0) {
    throw new Error(`Falten arguments obligatoris: ${missing.map((key) => `--${key}`).join(', ')}`);
  }
}

async function readJsonIfExists(filePath) {
  if (!filePath || !existsSync(filePath)) {
    return null;
  }

  return JSON.parse(await readFile(filePath, 'utf8'));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function scoreBand(score) {
  const numeric = Number(score);
  if (!Number.isFinite(numeric)) {
    return 'sense nota';
  }
  if (numeric < 4) {
    return '<4';
  }
  if (numeric < 5) {
    return '4-4.9';
  }
  if (numeric < 7) {
    return '5-6.9';
  }
  if (numeric < 9) {
    return '7-8.9';
  }
  return '9-10';
}

function shortRepo(repo) {
  return String(repo || '').split('/').pop() || String(repo || '');
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncate(value, max = 220) {
  const text = normalizeText(value);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function addCount(map, text, repo) {
  const key = normalizeText(text);
  if (!key) {
    return;
  }

  if (!map.has(key)) {
    map.set(key, { text: key, count: 0, repos: [] });
  }

  const entry = map.get(key);
  entry.count += 1;
  if (repo && entry.repos.length < 6) {
    entry.repos.push(shortRepo(repo));
  }
}

function sortedCounts(map) {
  return [...map.values()].sort((left, right) =>
    right.count - left.count || left.text.localeCompare(right.text, 'ca')
  );
}

function collectQuestionLines(excerpt) {
  const lines = String(excerpt || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const questions = [];
  let inPromptBlock = false;
  let promptBuffer = [];

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inPromptBlock && promptBuffer.length > 0) {
        questions.push(promptBuffer.join(' '));
      }
      inPromptBlock = !inPromptBlock;
      promptBuffer = [];
      continue;
    }

    if (inPromptBlock) {
      promptBuffer.push(line);
      continue;
    }

    if (line.includes('?') || /^[-*]\s*(Pregunta|Prompte|Prompt)/i.test(line)) {
      questions.push(line.replace(/^[-*]\s*/, ''));
    }
  }

  return questions.map((question) => truncate(question, 260)).filter(Boolean);
}

function collectDoubtLines(excerpt) {
  return String(excerpt || '')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ''))
    .filter((line) => /dubte|no he ent[eé]s|no entenc|no queda clar|pendent/i.test(line))
    .map((line) => truncate(line, 260));
}

function lowDimensions(result) {
  return asArray(result?.dimension_scores)
    .filter((dimension) => Number(dimension.score) < 5)
    .map((dimension) => `${dimension.id}: ${dimension.reason}`);
}

function activeEvidenceFiles(payload) {
  const summary = payload?.student_repository_evidence?.evidence_summary || {};
  return [
    ...asArray(summary.docs_files),
    ...asArray(summary.evidence_files),
    ...asArray(summary.test_files)
  ].map((file) => file.path).filter(Boolean);
}

async function loadGradeDetail(rootDir, grade) {
  const historyDir = grade.history_dir ? path.join(rootDir, grade.history_dir) : '';
  const result = await readJsonIfExists(path.join(historyDir, 'autograde-result.json'));
  const payload = await readJsonIfExists(path.join(historyDir, 'evaluation-payload.json'));
  const aiLogExcerpt = payload?.student_repository_evidence?.evidence_summary?.ai_log?.excerpt || '';

  return {
    grade,
    result,
    payload,
    aiLogQuestions: collectQuestionLines(aiLogExcerpt),
    aiLogDoubts: collectDoubtLines(aiLogExcerpt),
    activeFiles: activeEvidenceFiles(payload)
  };
}

function markdownList(items, emptyText) {
  if (items.length === 0) {
    return `- ${emptyText}\n`;
  }

  return `${items.map((item) => `- ${item}`).join('\n')}\n`;
}

function renderCountList(entries, emptyText) {
  return markdownList(
    entries.map((entry) => `${entry.text} (${entry.count}; ${entry.repos.join(', ') || 'grup'})`),
    emptyText
  );
}

function renderStudentTable(details) {
  const header = '| Alumne | Nota | Revisió | Confiança | Punts a treballar |\n|---|---:|---|---:|---|\n';
  const rows = details.map(({ grade, result }) => {
    const score = Number.isFinite(Number(grade.score)) ? Number(grade.score).toFixed(1) : 'n/d';
    const weaknesses = asArray(result?.weaknesses).slice(0, 2).map(truncate).join('<br>');
    const review = grade.teacher_review_required ? 'sí' : 'no';
    const confidence = Math.round((Number(grade.confidence) || 0) * 100);
    return `| ${grade.repo || grade.student} | ${score} | ${review} | ${confidence}% | ${weaknesses || 'n/d'} |`;
  });

  return `${header}${rows.join('\n')}\n`;
}

function buildReport({ challengeId, group, details }) {
  const generatedAt = new Date().toISOString();
  const scores = details.map(({ grade }) => Number(grade.score)).filter(Number.isFinite);
  const average = scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : 0;
  const bands = new Map();
  const weaknessCounts = new Map();
  const flagCounts = new Map();
  const lowDimensionCounts = new Map();
  const aiQuestionCounts = new Map();
  const aiDoubtCounts = new Map();
  const missingAiLog = [];
  const missingEvidenceLinks = [];

  for (const detail of details) {
    const { grade, result, payload, aiLogQuestions, aiLogDoubts, activeFiles } = detail;
    addCount(bands, scoreBand(grade.score), '');

    for (const weakness of asArray(result?.weaknesses)) {
      addCount(weaknessCounts, weakness, grade.repo);
    }
    for (const flag of asArray(result?.blocking_flags)) {
      addCount(flagCounts, flag, grade.repo);
    }
    for (const dimension of lowDimensions(result)) {
      addCount(lowDimensionCounts, dimension, grade.repo);
    }
    for (const question of aiLogQuestions) {
      addCount(aiQuestionCounts, question, grade.repo);
    }
    for (const doubt of aiLogDoubts) {
      addCount(aiDoubtCounts, doubt, grade.repo);
    }

    const hasAiLog = Boolean(payload?.student_repository_evidence?.evidence_summary?.ai_log);
    if (!hasAiLog) {
      missingAiLog.push(shortRepo(grade.repo || grade.student));
    }
    if (activeFiles.length === 0) {
      missingEvidenceLinks.push(shortRepo(grade.repo || grade.student));
    }
  }

  return `# Informe posterior de microrepte

| Camp | Valor |
|---|---|
| Grup | ${group} |
| Microrepte | ${challengeId} |
| Generat | ${generatedAt} |
| Alumnes amb resultat | ${details.length} |
| Mitjana provisional | ${average.toFixed(2)} |

## Distribució de notes

${renderCountList(sortedCounts(bands), 'Sense notes disponibles.')}

## Fallades recurrents

${renderCountList(sortedCounts(weaknessCounts).slice(0, 12), 'Sense fallades recurrents detectades.')}

## Bloquejos a revisar en classe

${renderCountList(sortedCounts(flagCounts).slice(0, 12), 'Sense bloquejos comuns detectats.')}

## Dimensions amb més dificultat

${renderCountList(sortedCounts(lowDimensionCounts).slice(0, 12), 'Sense dimensions baixes destacades.')}

## Preguntes o prompts d'IA detectats

${renderCountList(sortedCounts(aiQuestionCounts).slice(0, 12), 'No s’han detectat preguntes d’IA en els AI logs recollits.')}

## Dubtes o punts no entesos detectats

${renderCountList(sortedCounts(aiDoubtCounts).slice(0, 12), 'No s’han detectat dubtes explícits en els AI logs recollits.')}

## Seguiment d'AI log

${markdownList(
  missingAiLog.map((repo) => `${repo}: no consta \`docs/ai-log.md\` actiu o no referencia el microrepte.`),
  'Tots els resultats revisats tenen AI log actiu o no era necessari.'
)}

## Evidència activa no localitzada

${markdownList(
  missingEvidenceLinks.map((repo) => `${repo}: no s'han recollit fitxers actius de docs/evidence/tests vinculats al microrepte.`),
  'Tots els resultats tenen alguna evidència activa recollida.'
)}

## Detall per alumne

${renderStudentTable(details)}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }
  requireArgs(args);

  const rootDir = process.cwd();
  const grades = await readGrades(rootDir);
  const group = String(args.group || '').toUpperCase();
  const filtered = grades.filter((grade) =>
    grade.challenge_id === args['challenge-id']
    && String(grade.group || '').toUpperCase() === group
  );

  if (filtered.length === 0) {
    throw new Error(`No hi ha resultats per a ${group} i ${args['challenge-id']} en grades/latest-grades.json`);
  }

  const details = [];
  for (const grade of filtered) {
    details.push(await loadGradeDetail(rootDir, grade));
  }

  const report = buildReport({ challengeId: args['challenge-id'], group, details });
  const outputDir = path.resolve(rootDir, args['output-dir']);
  const safeGroup = group.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const outputPath = path.join(outputDir, `${args['challenge-id']}-${safeGroup}.md`);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, report, 'utf8');

  console.log(`Informe generat: ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error(`No s'ha pogut generar l'informe posterior: ${error.message}`);
  process.exit(1);
});
