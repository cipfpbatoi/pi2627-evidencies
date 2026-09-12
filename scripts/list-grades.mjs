import process from 'node:process';

import { readGrades } from './lib/grades-store.mjs';

function formatValue(value) {
  if (value === true) {
    return 'si';
  }

  if (value === false) {
    return 'no';
  }

  return value === null || value === undefined ? '' : String(value);
}

function pickPrintableFields(grade) {
  return {
    student: grade.student,
    challenge_id: grade.challenge_id,
    score: grade.score,
    confidence: grade.confidence,
    teacher_review_required: grade.teacher_review_required,
    timestamp: grade.timestamp
  };
}

async function main() {
  const grades = await readGrades(process.cwd());

  if (grades.length === 0) {
    console.log('No hi ha notes provisionals importades.');
    return;
  }

  const rows = grades.map(pickPrintableFields);
  const fields = Object.keys(rows[0]);

  console.log(fields.join('\t'));

  for (const row of rows) {
    console.log(fields.map((field) => formatValue(row[field])).join('\t'));
  }
}

main().catch((error) => {
  console.error(`No s'han pogut llistar les notes provisionals: ${error.message}`);
  process.exit(1);
});
