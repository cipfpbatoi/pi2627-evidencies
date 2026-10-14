import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { addReviewPerson, emptyTeacherReview, loadTeacherReview, removeReviewPerson, reviewPath, saveTeacherReview, teacherReviewCsv, teacherReviewSummary, updateReviewEntry } from '../scripts/pi/lib/teacher-review.mjs';

const report = {
  project: { id: 'hort', name: 'Hort urbà', repository: 'org/hort' },
  checkpoint: { id: 'b2-dossier-1', name: 'Dossier 1' },
  version: { requested_ref: 'dossier-1-v1.0', commit: 'a'.repeat(40) },
  candidate_evidence: [
    { ra_ca: 'RA1.c', evidence: ['docs/01-proposta/dossier-1.md'] },
    { ra_ca: 'RA1.e', evidence: ['docs/01-proposta/dossier-1.md'] }
  ]
};

test('prepara una fila pendent per cada CA candidat i persona', () => {
  const review = emptyTeacherReview(report, '2026-10-14T08:00:00Z');
  addReviewPerson(review, report, { person: 'Anna Puig', function: 'Parella autora' }, '2026-10-14T09:00:00Z');
  assert.equal(review.entries.length, 2);
  assert.equal(review.entries[0].person, 'Anna Puig');
  assert.equal(review.entries[0].scope, 'pending');
  assert.equal(review.qualification, null);
  assert.throws(() => addReviewPerson(review, report, { person: 'anna puig' }), /ja està incorporada/);
});

test('valida evidència i observació abans de confirmar l’abast', () => {
  const review = emptyTeacherReview(report);
  addReviewPerson(review, report, { person: 'Anna Puig' });
  const entry = review.entries[0];
  assert.throws(() => updateReviewEntry(review, report, entry.id, { scope: 'sufficient', observation: 'Ho defensa.' }), /evidència/);
  assert.throws(() => updateReviewEntry(review, report, entry.id, { scope: 'not_evidenced' }), /observació/);
  assert.throws(() => updateReviewEntry(review, report, entry.id, { scope: 'not_evidenced', observation: 'No hi ha evidència.', reobservation_date: '2026-02-31' }), /data/);
  updateReviewEntry(review, report, entry.id, {
    scope: 'partial',
    function: 'Parella autora',
    evidence: 'docs/01-proposta/dossier-1.md',
    observation: 'Identifica la necessitat, però falta contrast.',
    reobservation_date: '2026-11-02'
  });
  assert.equal(entry.scope, 'partial');
  assert.equal(entry.reobservation_date, '2026-11-02');
  assert.equal(review.qualification, null);
  assert.deepEqual(teacherReviewSummary(review).map(({ ra, total, pending, partial }) => ({ ra, total, pending, partial })), [{ ra: 'RA1', total: 2, pending: 1, partial: 1 }]);
});

test('exporta la matriu i permet retirar totes les files d’una persona', () => {
  const review = emptyTeacherReview(report);
  addReviewPerson(review, report, { person: 'Anna, Puig' });
  assert.match(teacherReviewCsv(review), /"Anna, Puig"/);
  const personId = review.entries[0].person_id;
  assert.throws(() => removeReviewPerson(review, personId, 'Una altra persona'), /confirmació/);
  removeReviewPerson(review, personId, 'Anna, Puig');
  assert.equal(review.entries.length, 0);
});

test('guarda cada esborrany vinculat al commit immutable', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'pi-review-'));
  try {
    const review = emptyTeacherReview(report);
    addReviewPerson(review, report, { person: 'Anna Puig' });
    await saveTeacherReview(root, report, review);
    const loaded = await loadTeacherReview(root, report);
    assert.equal(loaded.report.commit, report.version.commit);
    assert.equal(loaded.entries.length, 2);
    const otherReport = { ...report, version: { ...report.version, commit: 'b'.repeat(40) } };
    assert.equal((await loadTeacherReview(root, otherReport)).entries.length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rebutja identificadors que podrien escapar del directori de revisions', () => {
  assert.throws(() => reviewPath('/tmp', { ...report, project: { ...report.project, id: '../hort' } }), /identificadors/);
  assert.throws(() => reviewPath('/tmp', { ...report, version: { ...report.version, commit: '../../fora' } }), /commit/);
});
