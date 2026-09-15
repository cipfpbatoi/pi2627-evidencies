import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeProjectJson, renderDashboard, renderDeleteProject, renderReport, templateProjectInput, validateProjectDeletion } from '../teacher-dashboard/pi-server.mjs';

test('el dashboard mostra el nom del projecte i no una qualificació', () => {
  const projects = new Map([['hort', { id: 'hort', name: 'Hort urbà', repository: 'org/hort' }]]);
  const checkpoints = new Map([['b1', { id: 'b1', name: 'Dossier 0' }]]);
  const html = renderDashboard(projects, checkpoints, [], '', false);
  assert.match(html, /Hort urbà/);
  assert.match(html, /No gestiona parelles ni assigna qualificacions/);
  assert.match(html, /Registrar un repositori que ja existix/);
  assert.match(html, /Crear un repositori des de la plantilla/);
  assert.match(html, /Falta configurar GITHUB_TOKEN/);
  assert.match(html, /Recopilar evidències/);
  assert.match(html, /https:\/\/github.com\/org\/hort/);
  assert.match(html, /\/projects\/hort\/delete/);
  assert.match(html, /Documentació alumnat/);
  assert.match(html, /https:\/\/cipfpbatoi.github.io\/pi2627\//);
  assert.match(html, /Documentació professorat/);
  assert.match(html, /https:\/\/cipfpbatoi.github.io\/pi2627-professorat\//);
});

test('l’esborrat exigix el repositori exacte i separa GitHub del registre', () => {
  const project = { id: 'hort', name: 'Hort urbà', repository: 'org/hort' };
  const html = renderDeleteProject(project, true);
  assert.match(html, /acció irreversible/);
  assert.match(html, /org\/hort/);
  assert.deepEqual(validateProjectDeletion(project, { 'confirm-repository': 'org/hort' }), { deleteRepository: false });
  assert.deepEqual(validateProjectDeletion(project, { 'confirm-repository': 'org/hort', 'delete-repository': 'on' }), { deleteRepository: true });
  assert.throws(() => validateProjectDeletion(project, { 'confirm-repository': 'org/altre' }), /no coincidix/);
});

test('valida les dades abans de crear un repositori des de la plantilla', () => {
  assert.deepEqual(templateProjectInput({ id: 'hort-urba', name: 'Hort urbà', owner: 'cipfpbatoi', 'repo-name': 'pi-hort-urba', private: 'on' }), {
    project: { id: 'hort-urba', name: 'Hort urbà', repository: 'cipfpbatoi/pi-hort-urba' },
    owner: 'cipfpbatoi', repoName: 'pi-hort-urba', private: true
  });
  assert.throws(() => templateProjectInput({ id: '../hort', name: '', owner: 'cipf/batoi', 'repo-name': 'hort.git' }), /invàlid|falta/);
});

test('inicialitza project.json amb les mateixes dades registrades', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (!options.method) return new Response(JSON.stringify({ sha: 'sha-plantilla' }), { status: 200 });
    return new Response('', { status: 200 });
  };
  try {
    const project = { id: 'hort-urba', name: 'Hort urbà', repository: 'org/pi-hort' };
    await initializeProjectJson(project, 'main', 'token-prova');
    assert.equal(calls.length, 2);
    const update = JSON.parse(calls[1].options.body);
    assert.equal(update.sha, 'sha-plantilla');
    assert.equal(update.branch, 'main');
    assert.deepEqual(JSON.parse(Buffer.from(update.content, 'base64').toString('utf8')), project);
  } finally {
    globalThis.fetch = originalFetch;
  }
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
