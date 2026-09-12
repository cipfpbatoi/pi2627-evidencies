import process from 'node:process';

import { readGrades, writeGrades } from './lib/grades-store.mjs';

function gradeKey(grade) {
  return [
    grade.repo || grade.student || '',
    grade.challenge_id || ''
  ].join('\u0000');
}

function isNewer(left, right) {
  return String(left.timestamp || '').localeCompare(String(right.timestamp || '')) >= 0;
}

async function main() {
  const grades = await readGrades(process.cwd());
  const latestByKey = new Map();

  for (const grade of grades) {
    const key = gradeKey(grade);
    const current = latestByKey.get(key);
    if (!current || isNewer(grade, current)) {
      latestByKey.set(key, grade);
    }
  }

  const compacted = [...latestByKey.values()].sort((left, right) => {
    return String(left.timestamp || '').localeCompare(String(right.timestamp || ''));
  });

  await writeGrades(compacted, process.cwd());
  console.log(`Registres abans: ${grades.length}`);
  console.log(`Registres després: ${compacted.length}`);
}

main().catch((error) => {
  console.error(`No s'han pogut compactar les notes vigents: ${error.message}`);
  process.exit(1);
});
