import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export function validId(value) {
  return /^[a-z0-9][a-z0-9-]*$/.test(String(value || ''));
}

export async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

export function validateProject(project) {
  const errors = [];
  if (!validId(project?.id)) errors.push('identificador invàlid');
  if (!String(project?.name || '').trim()) errors.push('falta el nom del projecte');
  if (!/^[^/\s]+\/[^/\s]+$/.test(String(project?.repository || ''))) errors.push('repositori invàlid; usa organitzacio/nom');
  return errors;
}

export function validateCheckpoint(checkpoint) {
  const errors = [];
  if (!validId(checkpoint?.id)) errors.push('identificador invàlid');
  if (!String(checkpoint?.name || '').trim()) errors.push('falta el nom');
  if (!String(checkpoint?.phase || '').trim()) errors.push('falta la fase');
  if (!['formative', 'teacher_review'].includes(checkpoint?.assessment)) errors.push('assessment invàlid');
  if (!Array.isArray(checkpoint?.required_files)) errors.push('required_files ha de ser una llista');
  if (!Array.isArray(checkpoint?.required_globs)) errors.push('required_globs ha de ser una llista');
  if (!Array.isArray(checkpoint?.candidate_ra_ca)) errors.push('candidate_ra_ca ha de ser una llista');
  return errors;
}

export async function loadConfiguration(root) {
  const registry = await readJson(path.join(root, 'course/projects.json'));
  if (registry.version !== 1 || !Array.isArray(registry.projects)) throw new Error('course/projects.json no té el format esperat.');
  const projects = new Map();
  for (const project of registry.projects) {
    const errors = validateProject(project);
    if (errors.length) throw new Error(`Projecte ${project?.id || '(sense id)'}: ${errors.join(', ')}.`);
    if (projects.has(project.id)) throw new Error(`Projecte duplicat: ${project.id}.`);
    projects.set(project.id, project);
  }
  const checkpoints = new Map();
  const checkpointDir = path.join(root, 'pi/checkpoints');
  for (const entry of await readdir(checkpointDir)) {
    if (!entry.endsWith('.json')) continue;
    const checkpoint = await readJson(path.join(checkpointDir, entry));
    const errors = validateCheckpoint(checkpoint);
    if (errors.length) throw new Error(`Punt de control ${entry}: ${errors.join(', ')}.`);
    if (checkpoints.has(checkpoint.id)) throw new Error(`Punt de control duplicat: ${checkpoint.id}.`);
    checkpoints.set(checkpoint.id, checkpoint);
  }
  return { registry, projects, checkpoints };
}
