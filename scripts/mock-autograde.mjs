import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {};
  const allowed = new Set(['--input']);

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

function requireArgs(args) {
  if (!args.input) {
    throw new Error('Falta argument obligatori: --input');
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function buildDimensionScores(dimensions) {
  const usableDimensions = isNonEmptyArray(dimensions)
    ? dimensions
    : [{ id: 'manual_review', weight: 1, must_check: 'Cal revisio docent per falta de dimensions.' }];

  return usableDimensions.map((dimension, index) => {
    const maxScore = Number.isFinite(dimension.weight) && dimension.weight > 0
      ? Number((dimension.weight * 10).toFixed(2))
      : 1;
    const simulatedRatio = index % 2 === 0 ? 0.82 : 0.74;

    return {
      id: dimension.id || `dimension_${index + 1}`,
      score: Number((maxScore * simulatedRatio).toFixed(2)),
      max_score: maxScore,
      reason: `Valor simulat a partir de la rubrica: ${normalizeSentence(dimension.must_check || 'criteri pendent de revisar')}.`
    };
  });
}

function normalizeSentence(value) {
  return String(value).trim().replace(/[.!?]+$/u, '');
}

function calculateFinalScore(dimensionScores) {
  const totalScore = dimensionScores.reduce((sum, dimension) => sum + dimension.score, 0);
  const totalMax = dimensionScores.reduce((sum, dimension) => sum + dimension.max_score, 0);

  if (totalMax === 0) {
    return 0;
  }

  return Number(((totalScore / totalMax) * 10).toFixed(1));
}

function buildRaScores(payload, finalScore) {
  const assessedRa = Array.isArray(payload.assessed_ra) && payload.assessed_ra.length > 0
    ? payload.assessed_ra
    : [{
      ra_id: payload.primary_ra,
      assessed_ca: payload.assessed_ca,
      weight: 1
    }];

  return assessedRa
    .filter((item) => item?.ra_id)
    .map((item, index) => {
      const adjustment = assessedRa.length > 1 ? (index % 2 === 0 ? 0.2 : -0.2) : 0;
      const score = Math.max(0, Math.min(10, Number((finalScore + adjustment).toFixed(1))));

      return {
        ra_id: item.ra_id,
        score,
        assessed_ca: Array.isArray(item.assessed_ca) ? item.assessed_ca : [],
        reason: `Nota simulada per a ${item.ra_id} a partir dels criteris declarats del microrepte.`
      };
    });
}

function buildResult(payload) {
  const dimensions = Array.isArray(payload.dimensions) ? payload.dimensions : [];
  const hasRequiredEvidence = isNonEmptyArray(payload.required_evidence);
  const hasEnoughDimensions = dimensions.length >= 6;
  const dimensionScores = buildDimensionScores(dimensions);
  const calculatedFinalScore = calculateFinalScore(dimensionScores);
  const guardrails = payload.scoring_guardrails || {};
  const hasActiveEvidence = Number(guardrails.active_evidence_files_count || 0) > 0;
  const maxScoreWithoutActiveEvidence = Number.isFinite(guardrails.max_score_without_active_evidence)
    ? guardrails.max_score_without_active_evidence
    : 2;
  const finalScore = guardrails.active_microrepte_only && !hasActiveEvidence
    ? Math.min(calculatedFinalScore, maxScoreWithoutActiveEvidence)
    : calculatedFinalScore;
  const blockingFlags = [];

  if (!hasRequiredEvidence) {
    blockingFlags.push('missing_required_evidence');
  }

  if (!hasEnoughDimensions) {
    blockingFlags.push('rubric_has_less_than_6_dimensions');
  }

  if (guardrails.active_microrepte_only && !hasActiveEvidence) {
    blockingFlags.push('missing_active_microrepte_evidence');
  }

  return {
    challenge_id: payload.challenge_id || 'unknown-challenge',
    student: payload.student || 'unknown-student',
    commit: payload.commit || 'unknown',
    final_score_over_10: finalScore,
    ra_scores: buildRaScores(payload, finalScore),
    provisional: true,
    dimension_scores: dimensionScores,
    strengths: [
      'Payload d_avaluacio llegit correctament.',
      'La rubrica permet generar una estimacio inicial coherent.'
    ],
    weaknesses: [
      guardrails.active_microrepte_only && !hasActiveEvidence
        ? 'No s_han detectat evidencies especifiques del microrepte actiu.'
        : 'Resultat simulat: encara no revisa codi real ni executa proves del repositori de l_alumne.'
    ],
    blocking_flags: blockingFlags,
    teacher_review_required: !hasRequiredEvidence || (guardrails.active_microrepte_only && !hasActiveEvidence),
    confidence: hasEnoughDimensions && hasActiveEvidence ? 0.78 : 0.48,
    short_feedback_md: '### Feedback provisional\n\nAutograding simulat sense OpenAI. La qualificacio es basa en les dimensions de la rubrica i ha de ser revisada abans de considerar-la definitiva.'
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  requireArgs(args);

  const rootDir = process.cwd();
  const payload = await readJson(path.resolve(rootDir, args.input));
  const result = buildResult(payload);
  const outputDir = path.join(rootDir, 'tmp');
  const outputPath = path.join(outputDir, 'autograde-result.json');
  const formatted = `${JSON.stringify(result, null, 2)}\n`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, formatted, 'utf8');
  console.log(formatted.trimEnd());
}

main().catch((error) => {
  console.error(`No s'ha pogut executar l'autograding simulat: ${error.message}`);
  process.exit(1);
});
