import { validateProposal, readChallengeMetadata } from './lib/repte-extension.mjs';
import { readFile } from 'node:fs/promises';
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

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateRequiredFields(result, schema, errors) {
  for (const field of schema.required || []) {
    if (!(field in result)) {
      errors.push(`falta el camp obligatori "${field}"`);
    }
  }
}

function validateBasicTypes(result, errors) {
  const expectedTypes = {
    challenge_id: 'string',
    student: 'string',
    commit: 'string',
    final_score_over_10: 'number',
    provisional: 'boolean',
    teacher_review_required: 'boolean',
    confidence: 'number',
    short_feedback_md: 'string'
  };

  for (const [field, expectedType] of Object.entries(expectedTypes)) {
    if (field in result && typeof result[field] !== expectedType) {
      errors.push(`"${field}" ha de ser ${expectedType}`);
    }
  }

  for (const field of ['strengths', 'weaknesses', 'blocking_flags']) {
    if (field in result && !Array.isArray(result[field])) {
      errors.push(`"${field}" ha de ser array`);
    }
  }

  if ('dimension_scores' in result && !Array.isArray(result.dimension_scores)) {
    errors.push('"dimension_scores" ha de ser array segons global/grading-schema.json');
  }

  if ('ra_scores' in result && !Array.isArray(result.ra_scores)) {
    errors.push('"ra_scores" ha de ser array');
  }
}

function validateNumberRanges(result, errors) {
  if (typeof result.final_score_over_10 === 'number' && (result.final_score_over_10 < 0 || result.final_score_over_10 > 10)) {
    errors.push('"final_score_over_10" ha d_estar entre 0 i 10');
  }

  if (typeof result.confidence === 'number' && (result.confidence < 0 || result.confidence > 1)) {
    errors.push('"confidence" ha d_estar entre 0 i 1');
  }
}

function validateDimensionScores(result, errors) {
  if (!Array.isArray(result.dimension_scores)) {
    return;
  }

  if (result.dimension_scores.length === 0) {
    errors.push('"dimension_scores" ha de tindre almenys un element');
    return;
  }

  result.dimension_scores.forEach((dimension, index) => {
    const prefix = `dimension_scores[${index}]`;

    if (!isPlainObject(dimension)) {
      errors.push(`${prefix} ha de ser objecte`);
      return;
    }

    for (const field of ['id', 'score', 'max_score', 'reason']) {
      if (!(field in dimension)) {
        errors.push(`${prefix}: falta "${field}"`);
      }
    }

    if ('id' in dimension && typeof dimension.id !== 'string') {
      errors.push(`${prefix}.id ha de ser string`);
    }

    if ('score' in dimension && typeof dimension.score !== 'number') {
      errors.push(`${prefix}.score ha de ser number`);
    }

    if ('max_score' in dimension && typeof dimension.max_score !== 'number') {
      errors.push(`${prefix}.max_score ha de ser number`);
    }

    if ('reason' in dimension && typeof dimension.reason !== 'string') {
      errors.push(`${prefix}.reason ha de ser string`);
    }
  });
}

function validateRaScores(result, errors) {
  if (!Array.isArray(result.ra_scores)) {
    return;
  }

  result.ra_scores.forEach((raScore, index) => {
    const prefix = `ra_scores[${index}]`;
    if (!isPlainObject(raScore)) {
      errors.push(`${prefix} ha de ser objecte`);
      return;
    }

    for (const field of ['ra_id', 'score', 'assessed_ca', 'reason']) {
      if (!(field in raScore)) {
        errors.push(`${prefix}: falta "${field}"`);
      }
    }

    if ('ra_id' in raScore && !/^RA\d+$/i.test(String(raScore.ra_id))) {
      errors.push(`${prefix}.ra_id ha de tindre format RA<n>`);
    }

    if ('score' in raScore && (typeof raScore.score !== 'number' || raScore.score < 0 || raScore.score > 10)) {
      errors.push(`${prefix}.score ha de ser number entre 0 i 10`);
    }

    if ('assessed_ca' in raScore && !Array.isArray(raScore.assessed_ca)) {
      errors.push(`${prefix}.assessed_ca ha de ser array`);
    }

    if ('reason' in raScore && typeof raScore.reason !== 'string') {
      errors.push(`${prefix}.reason ha de ser string`);
    }
  });
}

function validateResult(result, schema) {
  const errors = [];

  if (!isPlainObject(result)) {
    return ['el resultat ha de ser un objecte JSON'];
  }

  validateRequiredFields(result, schema, errors);
  validateBasicTypes(result, errors);
  validateNumberRanges(result, errors);
  validateDimensionScores(result, errors);
  validateRaScores(result, errors);

  return errors;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  requireArgs(args);

  const rootDir = process.cwd();
  const [result, schema] = await Promise.all([
    readJson(path.resolve(rootDir, args.input)),
    readJson(path.join(rootDir, 'global', 'grading-schema.json'))
  ]);
  const errors = validateResult(result, schema);
  if (result.repte_extension) {
    try {
      validateProposal(result.repte_extension);
      const metadata = await readChallengeMetadata(rootDir);
      if (!metadata.get(result.challenge_id)?.repte_extension) throw new Error('Ampliació fora de l’últim microrepte');
    } catch (error) { errors.push(error.message); }
  }

  if (errors.length > 0) {
    console.error('Resultat d_autograding invalid:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Resultat d_autograding valid: ${args.input}`);
}

main().catch((error) => {
  console.error(`No s'ha pogut validar el resultat d'autograding: ${error.message}`);
  process.exit(1);
});
