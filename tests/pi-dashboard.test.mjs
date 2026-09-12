import test from 'node:test';
import assert from 'node:assert/strict';
import { renderDashboard } from '../teacher-dashboard/pi-server.mjs';

test('el dashboard mostra el nom del projecte i no una qualificació', () => {
  const projects = new Map([['hort', { id: 'hort', name: 'Hort urbà', repository: 'org/hort' }]]);
  const checkpoints = new Map([['b1', { id: 'b1', name: 'Dossier 0' }]]);
  const html = renderDashboard(projects, checkpoints, []);
  assert.match(html, /Hort urbà/);
  assert.match(html, /No gestiona parelles ni assigna qualificacions/);
});
