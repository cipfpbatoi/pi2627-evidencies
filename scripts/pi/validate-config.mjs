import path from 'node:path';
import process from 'node:process';
import { loadConfiguration, readJson } from './lib/config.mjs';

try {
  const root = process.cwd();
  const { projects, checkpoints, rubrics } = await loadConfiguration(root);
  await readJson(path.join(root, 'global/evidence-report-schema.json'));
  await readJson(path.join(root, 'global/teacher-review-schema.json'));
  await readJson(path.join(root, 'global/pi-rubric-evaluation-schema.json'));
  console.log(`Configuració PI vàlida: ${projects.size} projectes, ${checkpoints.size} punts de control i ${rubrics.size} rúbriques automatitzables.`);
  for (const checkpoint of checkpoints.values()) console.log(`- ${checkpoint.id}: ${checkpoint.name}`);
} catch (error) {
  console.error(`Configuració PI invàlida: ${error.message}`);
  process.exit(1);
}
