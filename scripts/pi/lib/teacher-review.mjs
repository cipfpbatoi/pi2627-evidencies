import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const REVIEW_SCOPES = ['pending', 'diagnostic', 'partial', 'sufficient', 'not_evidenced'];

function text(value, field, { required = false, max = 2000 } = {}) {
  const result = String(value || '').trim();
  if (required && !result) throw new Error(`Falta ${field}.`);
  if (result.length > max) throw new Error(`${field} supera els ${max} caràcters.`);
  return result;
}

function date(value) {
  const result = String(value || '').trim();
  if (result) {
    const parsed = new Date(`${result}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) throw new Error('La data de reobservació no és vàlida.');
  }
  return result || null;
}

function reportIdentity(report) {
  return {
    project_id: report.project.id,
    checkpoint_id: report.checkpoint.id,
    requested_ref: report.version.requested_ref,
    commit: report.version.commit
  };
}

export function reviewPath(root, report) {
  const projectId = String(report.project?.id || '');
  const checkpointId = String(report.checkpoint?.id || '');
  const commit = String(report.version?.commit || '');
  const safeId = /^[a-z0-9][a-z0-9-]*$/;
  if (!safeId.test(projectId) || !safeId.test(checkpointId)) throw new Error('L’informe no conté identificadors vàlids.');
  if (!/^[0-9a-f]{40}$/i.test(commit)) throw new Error('L’informe no conté un commit vàlid.');
  return path.join(root, 'reviews/pi', `${projectId}-${checkpointId}-${commit}.json`);
}

export function emptyTeacherReview(report, now = new Date().toISOString()) {
  return {
    schema_version: 1,
    report: reportIdentity(report),
    updated_at: now,
    entries: [],
    qualification: null,
    official_record: 'Aules'
  };
}

export async function loadTeacherReview(root, report) {
  const file = reviewPath(root, report);
  try {
    const review = JSON.parse(await readFile(file, 'utf8'));
    if (review.report?.commit !== report.version.commit || review.report?.project_id !== report.project.id || review.report?.checkpoint_id !== report.checkpoint.id) {
      throw new Error('La matriu guardada no correspon a este informe immutable.');
    }
    return review;
  } catch (error) {
    if (error.code === 'ENOENT') return emptyTeacherReview(report);
    throw error;
  }
}

export async function saveTeacherReview(root, report, review) {
  const file = reviewPath(root, report);
  const dir = path.dirname(file);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  review.updated_at = new Date().toISOString();
  review.qualification = null;
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(review, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, file);
  return review;
}

export function addReviewPerson(review, report, input, now = new Date().toISOString()) {
  const person = text(input.person, 'la persona', { required: true, max: 120 });
  const defaultFunction = text(input.function, 'la funció', { max: 160 });
  if (review.entries.some((entry) => entry.person.toLocaleLowerCase('ca') === person.toLocaleLowerCase('ca'))) {
    throw new Error('La persona ja està incorporada a la matriu.');
  }
  const personId = randomUUID();
  for (const candidate of report.candidate_evidence || []) {
    review.entries.push({
      id: randomUUID(),
      person_id: personId,
      person,
      function: defaultFunction,
      ra_ca: candidate.ra_ca,
      evidence: '',
      scope: 'pending',
      observation: '',
      reobservation_date: null,
      updated_at: now
    });
  }
  return review;
}

export function updateReviewEntry(review, report, entryId, input, now = new Date().toISOString()) {
  const entry = review.entries.find((item) => item.id === entryId);
  if (!entry) throw new Error('La fila de revisió no existix.');
  if (!(report.candidate_evidence || []).some((item) => item.ra_ca === entry.ra_ca)) throw new Error('El CA ja no forma part d’este punt de control.');
  const scope = String(input.scope || '').trim();
  if (!REVIEW_SCOPES.includes(scope)) throw new Error('L’abast seleccionat no és vàlid.');
  const evidence = text(input.evidence, 'l’evidència', { max: 500 });
  const observation = text(input.observation, 'l’observació', { max: 2000 });
  if (!['pending', 'not_evidenced'].includes(scope) && !evidence) throw new Error('Cal indicar una evidència per a un abast diagnòstic, parcial o suficient.');
  if (scope !== 'pending' && !observation) throw new Error('Cal justificar la valoració amb una observació.');
  entry.function = text(input.function, 'la funció', { max: 160 });
  entry.evidence = evidence;
  entry.scope = scope;
  entry.observation = observation;
  entry.reobservation_date = date(input.reobservation_date);
  entry.updated_at = now;
  return review;
}

export function removeReviewPerson(review, personId, confirmation) {
  const person = review.entries.find((entry) => entry.person_id === personId)?.person;
  if (!person) throw new Error('La persona no existix en la matriu.');
  if (String(confirmation || '') !== person) throw new Error('La confirmació no coincidix amb la persona que es vol retirar.');
  const before = review.entries.length;
  review.entries = review.entries.filter((entry) => entry.person_id !== personId);
  if (review.entries.length === before) throw new Error('No s’ha retirat cap fila de la matriu.');
  return review;
}

function csvCell(value) {
  const result = String(value ?? '');
  return /[",\r\n]/.test(result) ? `"${result.replaceAll('"', '""')}"` : result;
}

export function teacherReviewCsv(review) {
  const header = ['persona', 'funcio', 'ra_ca', 'abast', 'evidencia', 'observacio', 'reobservacio', 'commit'];
  const rows = review.entries.map((entry) => [entry.person, entry.function, entry.ra_ca, entry.scope, entry.evidence, entry.observation, entry.reobservation_date || '', review.report.commit]);
  return `${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

export function teacherReviewSummary(review) {
  const groups = new Map();
  for (const entry of review.entries) {
    const ra = entry.ra_ca.split('.')[0];
    const key = `${entry.person_id}:${ra}`;
    if (!groups.has(key)) groups.set(key, { person_id: entry.person_id, person: entry.person, ra, total: 0, pending: 0, diagnostic: 0, partial: 0, sufficient: 0, not_evidenced: 0 });
    const group = groups.get(key);
    group.total += 1;
    group[entry.scope] += 1;
  }
  return [...groups.values()].sort((left, right) => left.person.localeCompare(right.person, 'ca') || left.ra.localeCompare(right.ra, 'ca'));
}
