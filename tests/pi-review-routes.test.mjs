import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle } from '../teacher-dashboard/pi-server.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function request(method, url, body = '') {
  const authorization = `Basic ${Buffer.from('professor:contrasenya').toString('base64')}`;
  return {
    method,
    url,
    headers: { authorization, host: 'localhost' },
    async *[Symbol.asyncIterator]() {
      if (body) yield Buffer.from(body);
    }
  };
}

function response() {
  return {
    status: null,
    headers: null,
    body: '',
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(body = '') { this.body += body; }
  };
}

test('les rutes del dashboard guarden i exporten la revisió vinculada al commit', async () => {
  process.env.DASHBOARD_USER = 'professor';
  process.env.DASHBOARD_PASSWORD = 'contrasenya';
  const filename = 'test-review-layer-b2.json';
  const commit = '7'.repeat(40);
  const reportFile = path.join(root, 'tmp/pi', filename);
  const reviewFile = path.join(root, 'reviews/pi', `test-review-layer-b2-dossier-1-${commit}.json`);
  const report = {
    schema_version: 2,
    project: { id: 'test-review-layer', name: 'Prova', repository: 'org/prova' },
    checkpoint: { id: 'b2-dossier-1', name: 'Dossier 1', phase: 'proposta', assessment: 'teacher_review' },
    version: { requested_ref: 'dossier-1-v1.0', commit },
    candidate_evidence: [{ ra_ca: 'RA1.c', scope: 'candidate', expected_evidence: ['docs/dossier.md'], evidence: ['docs/dossier.md'] }],
    checks: [], warnings: [], blocking_flags: [], status: 'complete',
    process: null,
    teacher_review_required: true,
    qualification: null
  };
  try {
    await mkdir(path.dirname(reportFile), { recursive: true });
    await writeFile(reportFile, JSON.stringify(report));

    const addResponse = response();
    await handle(request('POST', `/reports/${filename}/review/people`, 'person=Anna+Puig&function=Autora'), addResponse);
    assert.equal(addResponse.status, 303);
    const stored = JSON.parse(await readFile(reviewFile, 'utf8'));
    assert.equal(stored.entries.length, 1);
    assert.equal(stored.entries[0].scope, 'pending');

    const updateResponse = response();
    const updateBody = new URLSearchParams({ function: 'Autora', scope: 'partial', evidence: 'docs/dossier.md', observation: 'Falta contrast.', reobservation_date: '2026-11-02' }).toString();
    await handle(request('POST', `/reports/${filename}/review/entries/${stored.entries[0].id}`, updateBody), updateResponse);
    assert.equal(updateResponse.status, 303);
    assert.equal(JSON.parse(await readFile(reviewFile, 'utf8')).entries[0].scope, 'partial');

    const exportResponse = response();
    await handle(request('GET', `/api/reports/${filename}/review.csv`), exportResponse);
    assert.equal(exportResponse.status, 200);
    assert.match(exportResponse.body, /Anna Puig,Autora,RA1.c,partial/);
    assert.equal(exportResponse.headers['cache-control'], 'no-store');
  } finally {
    await rm(reportFile, { force: true });
    await rm(reviewFile, { force: true });
  }
});
