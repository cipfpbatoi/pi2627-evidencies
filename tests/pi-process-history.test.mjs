import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseProcessHistory, genericMessage, messageAreas } from '../scripts/pi/lib/process-history.mjs';

test('resumeix la distribució temporal i una seqüència orientativa', () => {
  const process = analyseProcessHistory([
    { commit: 'a'.repeat(40), committed_at: '2026-10-01T08:00:00Z', author: 'anna', message: 'Investiga la necessitat #12' },
    { commit: 'b'.repeat(40), committed_at: '2026-10-03T08:00:00Z', author: 'pau', message: 'Decidix l’arquitectura #18' },
    { commit: 'c'.repeat(40), committed_at: '2026-10-05T08:00:00Z', author: 'anna', message: 'Registra la prova del prototip #24' }
  ]);
  assert.equal(process.summary.total_commits, 3);
  assert.equal(process.summary.active_days, 3);
  assert.equal(process.summary.span_hours, 96);
  assert.equal(process.summary.commits_with_issue_reference, 3);
  assert.deepEqual(process.summary.contributors, ['anna', 'pau']);
  assert.deepEqual(process.daily_activity.map((item) => item.date), ['2026-10-01', '2026-10-03', '2026-10-05']);
  assert.deepEqual(process.timeline.map((item) => item.areas[0]), ['proposta', 'disseny', 'execucio-control']);
  assert.deepEqual(process.observations, []);
});

test('assenyala concentració i missatges que no permeten reconstruir el procés', () => {
  const process = analyseProcessHistory([
    { commit: 'a'.repeat(40), committed_at: '2026-10-14T08:00:00Z', author: 'anna', message: 'wip' },
    { commit: 'b'.repeat(40), committed_at: '2026-10-14T09:00:00Z', author: 'anna', message: 'canvis' }
  ], { baseline: { requested_ref: 'pla-v1.0', commit: 'd'.repeat(40), status: 'ahead' } });
  assert.equal(process.summary.active_days, 1);
  assert.equal(process.summary.generic_messages, 2);
  assert.match(process.observations.join('\n'), /únic dia/);
  assert.match(process.observations.join('\n'), /massa genèric/);
  assert.equal(genericMessage('Actualitza el pla de proves #31'), false);
  assert.deepEqual(messageAreas('Tanca la memòria i prepara la defensa'), ['tancament']);
});
