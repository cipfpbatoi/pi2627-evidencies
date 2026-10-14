import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizationAccepted, collaboratorNames, initializeProjectJson, inviteCollaborators, renderDashboard, renderDeleteProject, renderProjectAccess, renderReport, templateProjectInput, validateProjectDeletion } from '../teacher-dashboard/pi-server.mjs';

test('el dashboard exigix usuari i contrasenya correctes', () => {
  const valid = `Basic ${Buffer.from('professor:contrasenya-segura').toString('base64')}`;
  const invalid = `Basic ${Buffer.from('professor:incorrecta').toString('base64')}`;
  assert.equal(authorizationAccepted(valid, 'professor', 'contrasenya-segura'), true);
  assert.equal(authorizationAccepted(invalid, 'professor', 'contrasenya-segura'), false);
  assert.equal(authorizationAccepted('', 'professor', 'contrasenya-segura'), false);
  assert.equal(authorizationAccepted(valid, '', ''), false);
});

test('el dashboard mostra el nom del projecte i no una qualificació', () => {
  const projects = new Map([['hort', { id: 'hort', name: 'Hort urbà', repository: 'org/hort' }]]);
  const checkpoints = new Map([['b1', { id: 'b1', name: 'Dossier 0' }]]);
  const html = renderDashboard(projects, checkpoints, [], '', false);
  assert.match(html, /Hort urbà/);
  assert.match(html, /No gestiona parelles ni assigna qualificacions/);
  assert.match(html, /Registrar un repositori que ja existix/);
  assert.match(html, /Crear un repositori des de la plantilla/);
  assert.match(html, /value="batoi-pi-2026"/);
  assert.match(html, /pi2627:last-project-form/);
  assert.match(html, /L'última alta es conserva en este navegador/);
  assert.match(html, /Falta configurar GITHUB_TOKEN/);
  assert.match(html, /Recopilar evidències/);
  assert.match(html, /https:\/\/github.com\/org\/hort/);
  assert.match(html, /\/projects\/hort\/delete/);
  assert.match(html, /\/projects\/hort\/access/);
  assert.match(html, /Usuaris de GitHub de l'equip/);
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
    owner: 'cipfpbatoi', repoName: 'pi-hort-urba', private: true, collaborators: []
  });
  assert.throws(() => templateProjectInput({ id: '../hort', name: '', owner: 'cipf/batoi', 'repo-name': 'hort.git' }), /invàlid|falta/);
});

test('normalitza i valida els usuaris de GitHub de l’equip', () => {
  assert.deepEqual(collaboratorNames('anna\npau,anna;joan-2'), ['anna', 'pau', 'joan-2']);
  assert.throws(() => collaboratorNames('usuari_incorrecte'), /invàlid/);
  assert.throws(() => collaboratorNames('u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11'), /més de 10/);
});

test('la gestió d’accés convida amb permís write i informa dels errors', async () => {
  const project = { id: 'hort', name: 'Hort urbà', repository: 'org/hort' };
  assert.match(renderProjectAccess(project, true), /Rebran el rol <code>write<\/code>/);
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return url.endsWith('/pau')
      ? new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 })
      : new Response('', { status: 201 });
  };
  try {
    const result = await inviteCollaborators('org/hort', ['anna', 'pau'], 'token-prova');
    assert.deepEqual(result, [{ username: 'anna', ok: true }, { username: 'pau', ok: false, error: 'Not Found' }]);
    assert.deepEqual(calls.map((call) => JSON.parse(call.options.body)), [{ permission: 'push' }, { permission: 'push' }]);
  } finally {
    globalThis.fetch = originalFetch;
  }
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
    warnings: [], blocking_flags: [], candidate_evidence: [{ ra_ca: 'RA1.c' }],
    process: {
      scope: { requested_ref: null, commit: null, status: 'repository-history' },
      summary: { total_commits: 2, active_days: 2, span_hours: 24, largest_gap_hours: 24, busiest_day: '2026-10-14', busiest_day_commits: 1, busiest_day_share: 0.5, generic_messages: 0, commits_with_issue_reference: 1 },
      observations: [],
      timeline: [{ commit: 'b'.repeat(40), committed_at: '2026-10-14T08:00:00Z', author: 'anna', message: 'Completa el dossier #12', areas: ['proposta'] }]
    }
  };
  const home = renderDashboard(new Map([['hort', report.project]]), new Map([['b1', report.checkpoint]]), [report]);
  assert.match(home, /href="\/reports\/hort-b1.json"/);
  const detail = renderReport(report);
  assert.match(detail, /Obrir esta versió a GitHub/);
  assert.match(detail, /Descarregar JSON/);
  assert.match(detail, /RA1.c/);
  assert.match(detail, /Traça temporal i seqüència/);
  assert.match(detail, /Completa el dossier #12/);
  assert.match(detail, /Dia més actiu/);
  assert.match(detail, /indicis per reconstruir el procés/);
  assert.match(detail, /Matriu de revisió docent individual/);
  assert.match(detail, /Preparar els CA candidats/);
  assert.match(detail, /no calcula una nota/);
  assert.match(detail, /no acredita assoliments ni assigna qualificacions/);
});

test('mostra la proposta documental i deixa el criteri mixt pendent de defensa', () => {
  const commit = 'a'.repeat(40);
  const report = {
    filename: `hort-b3-dossier-2-${commit}.json`,
    project: { id: 'hort', name: 'Hort urbà', repository: 'org/hort' },
    checkpoint: { id: 'b3-dossier-2', name: 'Bloc 3', rubric_id: 'b3-dossier-2' },
    version: { requested_ref: 'dossier-2-v1.0', commit },
    status: 'complete', checks: [], warnings: [], blocking_flags: [], candidate_evidence: [], process: null
  };
  const assessment = {
    generated_at: '2026-10-14T20:00:00Z',
    rubric: { id: 'b3-dossier-2', instrument: 'PR-Q.3.1.x', name: 'Dossier 2' },
    criteria: [{
      criterion_id: 'authorship-sources-ai-defense',
      title: 'Autoria, fonts, ús d’IA i defensa individual',
      source: 'mixed', status: 'needs_observation',
      document_assessment: {
        level: 3, confidence: 0.82, reason: 'La traça documental és suficient.', missing: [],
        evidence: [{ path: 'docs/02-avantprojecte/dossier-2.md', location: 'apartat 13', excerpt: 'Aportació verificable.' }]
      },
      observation_guide: { focus: ['Confirmar autoria.'], questions: ['Quina decisió pròpia pots explicar?'] },
      teacher_decision: null
    }]
  };
  const html = renderReport(report, undefined, '', assessment, false);
  assert.match(html, /Proposta automàtica de la rúbrica/);
  assert.match(html, /Nivell documental/);
  assert.match(html, /Mixta/);
  assert.match(html, /82 %/);
  assert.match(html, /Quina decisió pròpia pots explicar/);
  assert.match(html, /no es tanquen fins al contrast/);
});

test('manté els criteris del Bloc 2 pendents fins a observar la defensa', () => {
  const commit = 'b'.repeat(40);
  const report = {
    filename: `hort-b2-dossier-1-${commit}.json`,
    project: { id: 'hort', name: 'Hort urbà', repository: 'org/hort' },
    checkpoint: { id: 'b2-dossier-1', name: 'Bloc 2', rubric_id: 'b2-proposta-defensa' },
    version: { requested_ref: 'dossier-1-v1.0', commit },
    status: 'complete', checks: [], warnings: [], blocking_flags: [], candidate_evidence: [], process: null
  };
  const assessment = {
    generated_at: '2026-10-14T20:00:00Z',
    rubric: { id: 'b2-proposta-defensa', instrument: 'PR-Q.2.1.x + DO-Q.2.2.x', name: 'Bloc 2' },
    criteria: [{
      criterion_id: 'defense-comparison-decision', title: 'Defensa de la comparació i la decisió',
      source: 'defense', status: 'pending_observation',
      document_assessment: { level: null, confidence: null, reason: 'Requerix observació directa.', evidence: [], missing: [] },
      observation_guide: { focus: ['Explicar els descartes.'], questions: ['Què faria canviar la selecció?'] },
      teacher_decision: null
    }]
  };
  const html = renderReport(report, undefined, '', assessment, false);
  assert.match(html, /Actuació o defensa/);
  assert.match(html, /pending_observation/);
  assert.match(html, /Què faria canviar la selecció/);
  assert.match(html, /queden pendents i sense nivell/);
});
