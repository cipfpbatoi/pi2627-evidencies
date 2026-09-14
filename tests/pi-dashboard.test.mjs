import test from 'node:test';
import assert from 'node:assert/strict';
import { renderDashboard, renderReport } from '../teacher-dashboard/pi-server.mjs';

test('el dashboard mostra el nom del projecte i no una qualificació', () => {
  const projects = new Map([['hort', { id: 'hort', name: 'Hort urbà', repository: 'org/hort' }]]);
  const checkpoints = new Map([['b1', { id: 'b1', name: 'Dossier 0' }]]);
  const html = renderDashboard(projects, checkpoints, []);
  assert.match(html, /Hort urbà/);
  assert.match(html, /No gestiona parelles ni assigna qualificacions/);
  assert.match(html, /Registrar o actualitzar un projecte/);
  assert.match(html, /Recopilar evidències/);
  assert.match(html, /https:\/\/github.com\/org\/hort/);
});

test('els informes del dashboard són navegables i mantenen la revisió docent', () => {
  const report = {
    filename: 'hort-b1.json',
    project: { id: 'hort', name: 'Hort urbà', repository: 'org/hort' },
    checkpoint: { id: 'b1', name: 'Dossier 0' },
    version: { requested_ref: 'dossier-0-v1.0', commit: 'a'.repeat(40) },
    status: 'complete', checks: [{ id: 'file:project.json', status: 'passed', message: 'Fitxer present.', evidence: ['project.json'] }],
    warnings: [], blocking_flags: [], candidate_evidence: [{ ra_ca: 'RA1.c' }]
  };
  const home = renderDashboard(new Map([['hort', report.project]]), new Map([['b1', report.checkpoint]]), [report]);
  assert.match(home, /href="\/reports\/hort-b1.json"/);
  const detail = renderReport(report);
  assert.match(detail, /Obrir esta versió a GitHub/);
  assert.match(detail, /Descarregar JSON/);
  assert.match(detail, /RA1.c/);
  assert.match(detail, /no acredita assoliments ni assigna qualificacions/);
});
