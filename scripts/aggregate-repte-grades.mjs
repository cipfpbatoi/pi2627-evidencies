import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import process from 'node:process';

import { calculateRepteExtension, readChallengeMetadata } from './lib/repte-extension.mjs';

const rootDir = process.cwd();
const gradesDir = path.join(rootDir, 'grades');

function parseArgs(argv) {
  const args = {};
  const allowed = new Set(['--teacher-input', '--output-dir', '--help', '--verbose']);

  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];

    if (allowed.has(key)) {
      if (key === '--help' || key === '--verbose') {
        args[key.slice(2)] = true;
      } else if (value && !value.startsWith('--')) {
        args[key.slice(2)] = value;
        index += 1;
      }
    }
  }

  return args;
}

function printUsage() {
  console.log('Ús: node scripts/aggregate-repte-grades.mjs [--teacher-input path] [--output-dir path] [--verbose]');
  console.log('');
  console.log('Aquesta script agrupa les notes de microreptes per repte i RA, i genera fitxers agregats.');
  console.log('Si es passa --teacher-input, s_inclou la nota docent de repte en conjunt.');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function csvEscape(value) {
  const text = value === null || value === undefined ? '' : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function writeCsv(pathname, rows, fields) {
  const header = `${fields.join(',')}\n`;
  const body = rows.map((row) => fields.map((field) => csvEscape(row[field])).join(',')).join('\n');
  return writeFile(pathname, `${header}${body}\n`, 'utf8');
}

function normalizeTeacherGrades(teacherGrades) {
  const map = new Map();
  for (const grade of Array.isArray(teacherGrades) ? teacherGrades : []) {
    if (!grade.repo || !grade.repte_id) {
      continue;
    }
    const key = `${grade.repo}\u0000${grade.repte_id}`;
    map.set(key, {
      extension_review: grade.extension_review || null,
      teacher_score: typeof grade.teacher_score === 'number' ? grade.teacher_score : null,
      teacher_comment: grade.teacher_comment || '',
      teacher_review_required: Boolean(grade.teacher_review_required),
      teacher_source: grade.source || 'teacher'
    });
  }
  return map;
}

function teacherGradeKey(repo, repteId) {
  return `${repo}\u0000${repteId}`;
}

function averageScores(items) {
  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

  if (totalWeight > 0) {
    return items.reduce((sum, item) => sum + (Number(item.score) || 0) * (Number(item.weight) || 0), 0) / totalWeight;
  }

  if (items.length === 0) {
    return null;
  }

  return items.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / items.length;
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }
  return Number(value).toFixed(2);
}

function normalizeRaScores(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item?.ra_id && typeof item.score === 'number')
    .map((item) => ({
      ra_id: String(item.ra_id).toUpperCase(),
      score: item.score,
      assessed_ca: Array.isArray(item.assessed_ca) ? item.assessed_ca : []
    }));
}

export function aggregateRepteGrades(latestGrades, challengeMetadata, teacherGrades) {
  const raGroups = new Map();

  for (const grade of latestGrades) {
    const metadata = challengeMetadata.get(grade.challenge_id);
    if (!metadata || !metadata.repte_id || metadata.deprecated) {
      continue;
    }

    const repteId = metadata.repte_id;
    const repo = grade.repo || grade.student;
    const group = grade.group || '';
    const scoreEntries = normalizeRaScores(grade.ra_scores);
    const entries = scoreEntries.length > 0
      ? scoreEntries
      : [{
        ra_id: metadata.primary_ra || 'UNKNOWN',
        score: Number(grade.score),
        assessed_ca: []
      }];

    for (const scoreEntry of entries) {
      const raId = scoreEntry.ra_id;
      const key = `${repo}\u0000${group}\u0000${repteId}\u0000${raId}`;
      const existing = raGroups.get(key) || {
        student: grade.student,
        repo,
        group,
        repte_id: repteId,
        repte_title: metadata.repte_title || '',
        ra_id: raId,
        record_type: 'ra',
        auto_score: null,
        auto_score_mode: null,
        microrepte_scores: [],
        teacher_score: null,
        teacher_comment: '',
        teacher_review_required: false,
        teacher_source: '',
        timestamp: grade.timestamp || null
      };

      existing.microrepte_scores.push({
        challenge_id: grade.challenge_id,
        score: Number(scoreEntry.score),
        assessed_ca: scoreEntry.assessed_ca,
        weight: metadata.repte_weight || 1,
        assessment_model: metadata.assessment_model
      });

      if (!existing.timestamp || grade.timestamp > existing.timestamp) {
        existing.timestamp = grade.timestamp;
      }

      raGroups.set(key, existing);
    }
  }

  const raRecords = [];
  const repteGroups = new Map();

  for (const record of raGroups.values()) {
    const score = averageScores(record.microrepte_scores);
    record.auto_score = score !== null ? Number(score.toFixed(2)) : null;
    record.auto_score_mode = record.microrepte_scores.some((item) => item.weight && item.weight !== 1)
      ? 'weighted_by_repte_weight'
      : 'equal';

    const repteKey = `${record.repo}\u0000${record.group}\u0000${record.repte_id}`;
    const currentRepte = repteGroups.get(repteKey) || {
      student: record.student,
      repo: record.repo,
      group: record.group,
      repte_id: record.repte_id,
      repte_title: record.repte_title,
      record_type: 'repte',
      ra_scores: [],
      auto_score: null,
      auto_score_mode: 'average_of_ra',
      teacher_score: null,
      teacher_comment: '',
      teacher_review_required: false,
      teacher_source: '',
      timestamp: record.timestamp || null
    };

    currentRepte.ra_scores.push({ ra_id: record.ra_id, score: record.auto_score });

    if (!currentRepte.timestamp || record.timestamp > currentRepte.timestamp) {
      currentRepte.timestamp = record.timestamp;
    }

    repteGroups.set(repteKey, currentRepte);
    raRecords.push(record);
  }

  const repteRecords = [];

  for (const repteRecord of repteGroups.values()) {
    const teacherKey = teacherGradeKey(repteRecord.repo, repteRecord.repte_id);
    const teacherData = teacherGrades.get(teacherKey);

    repteRecord.auto_score = null;
    repteRecord.auto_score_mode = 'not_calculated_without_ra_weights';
    const extension = calculateRepteExtension(latestGrades.filter(g => (g.repo || g.student) === repteRecord.repo), challengeMetadata, repteRecord.repte_id, teacherData?.extension_review);
    if (extension) {
      repteRecord.extension = extension;
      repteRecord.auto_score = extension.base_score;
      repteRecord.final_score = extension.final_score;
      repteRecord.provisional = extension.provisional;
      repteRecord.auto_score_mode = 'core_weighted_times_0.9_plus_validated_extension';
    }

    if (teacherData) {
      repteRecord.teacher_score = teacherData.teacher_score;
      repteRecord.teacher_comment = teacherData.teacher_comment;
      repteRecord.teacher_review_required = teacherData.teacher_review_required;
      repteRecord.teacher_source = teacherData.teacher_source;
    }

    repteRecords.push(repteRecord);
  }

  return { raRecords, repteRecords };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  const inputPath = path.join(gradesDir, 'latest-grades.json');
  const latestGrades = await readJson(inputPath);
  const teacherGrades = args['teacher-input'] ? normalizeTeacherGrades(await readJson(path.resolve(args['teacher-input']))) : new Map();
  const challengeMetadata = await readChallengeMetadata(rootDir);

  const { raRecords, repteRecords } = aggregateRepteGrades(latestGrades, challengeMetadata, teacherGrades);
  const outputDir = args['output-dir'] ? path.resolve(args['output-dir']) : gradesDir;

  const outputPathJson = path.join(outputDir, 'latest-repte-grades.json');
  const outputPathCsv = path.join(outputDir, 'latest-repte-grades.csv');

  await writeFile(outputPathJson, `${JSON.stringify({ ra_records: raRecords, repte_records: repteRecords }, null, 2)}\n`, 'utf8');

  const rows = [...raRecords, ...repteRecords].map((record) => ({
    student: record.student,
    repo: record.repo,
    group: record.group,
    repte_id: record.repte_id,
    repte_title: record.repte_title,
    ra_id: record.record_type === 'ra' ? record.ra_id : '',
    record_type: record.record_type,
    auto_score: formatNumber(record.auto_score),
    auto_score_mode: record.auto_score_mode,
    final_score: formatNumber(record.final_score),
    extension_status: record.extension?.status || '',
    extension_validated: record.extension?.validated_score ?? '',
    teacher_score: formatNumber(record.teacher_score),
    teacher_comment: record.teacher_comment,
    teacher_review_required: record.teacher_review_required,
    timestamp: record.timestamp || ''
  }));
  const csvFields = [
    'student',
    'repo',
    'group',
    'repte_id',
    'repte_title',
    'ra_id',
    'record_type',
    'auto_score',
    'auto_score_mode',
    'final_score',
    'extension_status',
    'extension_validated',
    'teacher_score',
    'teacher_comment',
    'teacher_review_required',
    'timestamp'
  ];

  await writeCsv(outputPathCsv, rows, csvFields);

  console.log(`S'han generat:
- ${path.relative(rootDir, outputPathJson)}
- ${path.relative(rootDir, outputPathCsv)}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`No s'ha pogut agregar les notes per repte: ${error.message}`);
    process.exit(1);
  });
}
