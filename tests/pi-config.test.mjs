import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProject, validateCheckpoint } from '../scripts/pi/lib/config.mjs';

test('el projecte requerix identificador, nom i repositori', () => {
  assert.deepEqual(validateProject({ id: 'hort-urba', name: 'Hort urbà', repository: 'org/hort-urba' }), []);
  assert.ok(validateProject({ id: 'Hort Urbà', name: '', repository: 'sense-barra' }).length >= 3);
});

test('el punt de control diferencia formació i revisió docent', () => {
  const base = { id: 'b1-dossier-0', name: 'Dossier 0', phase: 'reactivacio', assessment: 'formative', required_files: [], required_globs: [], candidate_ra_ca: [] };
  assert.deepEqual(validateCheckpoint(base), []);
  assert.ok(validateCheckpoint({ ...base, assessment: 'automatic_grade' }).includes('assessment invàlid'));
});
