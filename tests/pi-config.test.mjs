import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfiguration, validateProject, validateCheckpoint } from '../scripts/pi/lib/config.mjs';

test('el projecte requerix identificador, nom i repositori', () => {
  assert.deepEqual(validateProject({ id: 'hort-urba', name: 'Hort urbà', repository: 'org/hort-urba' }), []);
  assert.ok(validateProject({ id: 'Hort Urbà', name: '', repository: 'sense-barra' }).length >= 3);
});

test('el punt de control diferencia formació i revisió docent', () => {
  const base = { id: 'b1-dossier-0', name: 'Dossier 0', phase: 'reactivacio', assessment: 'formative', required_files: [], required_globs: [], candidate_ra_ca: [] };
  assert.deepEqual(validateCheckpoint(base), []);
  assert.ok(validateCheckpoint({ ...base, assessment: 'automatic_grade' }).includes('assessment invàlid'));
  assert.deepEqual(validateCheckpoint({ ...base, baseline_ref: 'dossier-0-v1.0' }), []);
  assert.ok(validateCheckpoint({ ...base, baseline_ref: '' }).includes('baseline_ref ha de ser una referència no buida'));
  assert.deepEqual(validateCheckpoint({ ...base, candidate_ra_ca: ['RA1.a'], evidence_by_ra_ca: { 'RA1.a': ['docs/dossier.md'] } }), []);
  assert.ok(validateCheckpoint({ ...base, candidate_ra_ca: ['RA1.a'], evidence_by_ra_ca: {} }).some((error) => error.includes('RA1.a')));
  assert.ok(validateCheckpoint({ ...base, candidate_ra_ca: ['RA5.z'] }).includes('candidate_ra_ca conté un codi invàlid'));
  assert.ok(validateCheckpoint({ ...base, candidate_ra_ca: ['RA1.a', 'RA1.a'] }).includes('candidate_ra_ca conté duplicats'));
});

test('el Bloc 2 només proposa CA sustentats per les evidències demanades', async () => {
  const { checkpoints } = await loadConfiguration(process.cwd());
  const candidateCa = checkpoints.get('b2-dossier-1').candidate_ra_ca;
  assert.deepEqual(candidateCa, [
    'RA1.c', 'RA1.e', 'RA1.f',
    'RA2.a', 'RA2.b', 'RA2.c', 'RA2.d', 'RA2.e', 'RA2.i'
  ]);
  assert.deepEqual(candidateCa.filter((ca) => ['RA1.a', 'RA1.b', 'RA1.d', 'RA1.g', 'RA1.h', 'RA1.i'].includes(ca)), []);
});

test('el Bloc 3 no proposa finançament si el Dossier 2 no el demana', async () => {
  const { checkpoints } = await loadConfiguration(process.cwd());
  const candidateCa = checkpoints.get('b3-dossier-2').candidate_ra_ca;
  assert.deepEqual(candidateCa, [
    'RA1.f',
    'RA2.a', 'RA2.b', 'RA2.c', 'RA2.d', 'RA2.e', 'RA2.f', 'RA2.h', 'RA2.i'
  ]);
  assert.equal(candidateCa.includes('RA2.g'), false);
});
