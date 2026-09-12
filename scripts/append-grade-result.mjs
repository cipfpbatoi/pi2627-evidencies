import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import process from 'node:process';

import { appendGrade } from './lib/grades-store.mjs';

const requiredArgs = ['input', 'repo', 'group', 'source'];
const requiredResultFields = [
  'student',
  'challenge_id',
  'commit',
  'final_score_over_10',
  'confidence',
  'teacher_review_required',
  'provisional'
];

export function parseArgs(argv) {
  const args = {};
  const allowed = new Set(requiredArgs.map((arg) => `--${arg}`));

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
  const missing = requiredArgs.filter((arg) => !args[arg]);

  if (missing.length > 0) {
    throw new Error(`Falten arguments obligatoris: ${missing.map((arg) => `--${arg}`).join(', ')}`);
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateAutogradeResult(result) {
  if (!isPlainObject(result)) {
    throw new Error("El fitxer d'entrada ha de contindre un objecte JSON");
  }

  const missing = requiredResultFields.filter((field) => !(field in result));

  if (missing.length > 0) {
    throw new Error(`Falten camps obligatoris en autograde-result.json: ${missing.join(', ')}`);
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export function buildGradeRecord(result, args) {
  return {
    student: result.student,
    repo: args.repo,
    group: args.group,
    challenge_id: result.challenge_id,
    score: result.final_score_over_10,
    repte_extension: result.repte_extension || null,
    ra_scores: Array.isArray(result.ra_scores) ? result.ra_scores : [],
    confidence: result.confidence,
    teacher_review_required: result.teacher_review_required,
    provisional: result.provisional,
    commit: result.commit,
    timestamp: new Date().toISOString(),
    source: args.source
  };
}

export async function appendGradeResult(args, rootDir = process.cwd()) {
  requireArgs(args);

  const inputPath = path.resolve(rootDir, args.input);
  const result = await readJson(inputPath);
  validateAutogradeResult(result);

  const grade = buildGradeRecord(result, args);
  await appendGrade(grade, rootDir);

  return grade;
}

export async function runAppendGradeResult(argv = process.argv.slice(2), rootDir = process.cwd()) {
  const args = parseArgs(argv);
  const grade = await appendGradeResult(args, rootDir);

  console.log(`Nota provisional afegida: ${grade.student} ${grade.challenge_id} ${grade.score}/10`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAppendGradeResult().catch((error) => {
    console.error(`No s'ha pogut afegir la nota provisional: ${error.message}`);
    process.exit(1);
  });
}
