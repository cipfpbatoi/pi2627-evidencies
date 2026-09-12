import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { appendGrade } from './lib/grades-store.mjs';

const requiredArgs = ['result', 'markdown', 'payload', 'repo', 'group', 'source', 'batch-id'];

function parseArgs(argv) {
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

function safeName(input) {
  return input.replace(/[^a-zA-Z0-9._-]+/g, '__');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function buildGradeRecord(result, args, historyDirRelative) {
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
    source: args.source,
    batch_id: args['batch-id'],
    history_dir: historyDirRelative
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  requireArgs(args);

  const rootDir = process.cwd();
  const resultPath = path.resolve(rootDir, args.result);
  const markdownPath = path.resolve(rootDir, args.markdown);
  const payloadPath = path.resolve(rootDir, args.payload);
  const result = await readJson(resultPath);
  const repoSafeName = safeName(args.repo);
  const historyDirRelative = path.join('grades', 'history', args['batch-id'], repoSafeName);
  const historyDir = path.join(rootDir, historyDirRelative);

  await mkdir(historyDir, { recursive: true });
  await copyFile(resultPath, path.join(historyDir, 'autograde-result.json'));
  await copyFile(markdownPath, path.join(historyDir, 'autograde-result.md'));
  await copyFile(payloadPath, path.join(historyDir, 'evaluation-payload.json'));

  const rawResponsePath = path.resolve(rootDir, path.dirname(resultPath), 'openai-raw-response.json');
  if (existsSync(rawResponsePath)) {
    await copyFile(rawResponsePath, path.join(historyDir, 'openai-raw-response.json'));
  }

  const grade = buildGradeRecord(result, args, historyDirRelative);
  await appendGrade(grade, rootDir);
  await writeFile(path.join(historyDir, 'grade-record.json'), `${JSON.stringify(grade, null, 2)}\n`, 'utf8');

  console.log(`Resultat guardat en ${historyDirRelative}`);
}

main().catch((error) => {
  console.error(`No s'ha pogut guardar el resultat d'autograding: ${error.message}`);
  process.exit(1);
});
