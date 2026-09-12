import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { validateProject } from './lib/config.mjs';

function args(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 2) result[argv[i]?.replace(/^--/, '')] = argv[i + 1];
  return result;
}

try {
  const input = args(process.argv.slice(2));
  const project = { id: input.id, name: input.name, repository: input.repository };
  const errors = validateProject(project);
  if (errors.length) throw new Error(errors.join(', '));
  const file = path.join(process.cwd(), 'course/projects.json');
  const registry = JSON.parse(await readFile(file, 'utf8'));
  const existing = registry.projects.findIndex((item) => item.id === project.id);
  if (existing >= 0) registry.projects[existing] = project;
  else registry.projects.push(project);
  registry.projects.sort((a, b) => a.name.localeCompare(b.name, 'ca'));
  await writeFile(file, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  console.log(`${existing >= 0 ? 'Actualitzat' : 'Registrat'}: ${project.name} (${project.id}) — ${project.repository}`);
} catch (error) {
  console.error(`No s'ha pogut registrar el projecte: ${error.message}`);
  process.exit(1);
}
