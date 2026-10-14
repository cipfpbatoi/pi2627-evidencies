import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubSnapshot } from '../scripts/pi/lib/github-source.mjs';

const exec = promisify(execFile);
const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/pi/collect-evidence.mjs');

test('recopila una versió immutable d’un projecte amb nom i no genera nota', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'pi-evidence-'));
  const repo = path.join(root, 'repo');
  try {
    await mkdir(path.join(root, 'course'), { recursive: true });
    await mkdir(path.join(root, 'pi/checkpoints'), { recursive: true });
    await mkdir(path.join(repo, 'docs'), { recursive: true });
    await writeFile(path.join(root, 'course/projects.json'), JSON.stringify({ version: 1, projects: [{ id: 'hort', name: 'Hort urbà', repository: 'org/hort' }] }));
    await writeFile(path.join(root, 'pi/checkpoints/control.json'), JSON.stringify({ id: 'control', name: 'Control', phase: 'proposta', assessment: 'formative', required_files: ['project.json', 'docs/dossier.md'], required_globs: [], candidate_ra_ca: ['RA2.a'], evidence_by_ra_ca: { 'RA2.a': ['docs/dossier.md'] } }));
    await writeFile(path.join(repo, 'project.json'), JSON.stringify({ id: 'hort', name: 'Hort urbà', repository: 'org/hort' }));
    await writeFile(path.join(repo, 'docs/dossier.md'), '# Dossier\n');
    await exec('git', ['init'], { cwd: repo });
    await exec('git', ['add', '.'], { cwd: repo });
    await exec('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'prova'], { cwd: repo });
    await exec(process.execPath, [script, '--repo-dir', repo, '--project-id', 'hort', '--checkpoint', 'control', '--ref', 'HEAD'], { cwd: root });
    const report = JSON.parse(await readFile(path.join(root, 'tmp/pi/hort-control.json'), 'utf8'));
    assert.equal(report.project.name, 'Hort urbà');
    assert.equal(report.status, 'complete_with_warnings');
    assert.equal(report.qualification, null);
    assert.equal(report.teacher_review_required, true);
    assert.equal(report.candidate_evidence[0].scope, 'candidate');
    assert.deepEqual(report.candidate_evidence[0].evidence, ['docs/dossier.md']);
    assert.deepEqual(report.candidate_evidence[0].expected_evidence, ['docs/dossier.md']);
    assert.equal(report.process.summary.total_commits, 1);
    assert.equal(report.process.interpretation_required, true);
    assert.match(report.warnings.join('\n'), /\[Procés\].*únic commit/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('recopila l’arbre i project.json des de GitHub sense clonar el repositori', async () => {
  const commit = 'a'.repeat(40);
  const tree = 'b'.repeat(40);
  const blob = 'c'.repeat(40);
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(url);
    if (url.endsWith('/commits/dossier-1-v1.0')) return new Response(JSON.stringify({ sha: commit, commit: { tree: { sha: tree } } }), { status: 200 });
    if (url.includes(`/git/trees/${tree}?recursive=1`)) return new Response(JSON.stringify({ truncated: false, tree: [{ path: 'project.json', type: 'blob', sha: blob }, { path: 'docs/dossier.md', type: 'blob', sha: 'd'.repeat(40) }] }), { status: 200 });
    if (url.endsWith(`/git/blobs/${blob}`)) return new Response(JSON.stringify({ encoding: 'base64', content: Buffer.from(JSON.stringify({ id: 'hort', name: 'Hort urbà' })).toString('base64') }), { status: 200 });
    if (url.includes(`/commits?sha=${commit}`)) return new Response(JSON.stringify([{ sha: commit, commit: { committer: { date: '2026-10-14T08:00:00Z' }, message: 'Completa el dossier #12' }, author: { login: 'anna' } }]), { status: 200 });
    return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
  };
  const snapshot = await githubSnapshot({ repository: 'org/hort', ref: 'dossier-1-v1.0', token: 'secret', fetchImpl });
  assert.equal(snapshot.commit, commit);
  assert.deepEqual(snapshot.files, ['project.json', 'docs/dossier.md']);
  assert.equal(JSON.parse(snapshot.projectFile).name, 'Hort urbà');
  assert.equal(snapshot.history.length, 1);
  assert.equal(snapshot.history[0].author, 'anna');
  assert.equal(requested.length, 4);
});

test('delimita la cronologia de GitHub amb el punt de control anterior', async () => {
  const commit = 'a'.repeat(40);
  const baseline = '9'.repeat(40);
  const tree = 'b'.repeat(40);
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(url);
    if (url.endsWith('/commits/pla-v1.0')) return new Response(JSON.stringify({ sha: baseline, commit: { tree: { sha: '8'.repeat(40) } } }), { status: 200 });
    if (url.endsWith('/commits/prototip-v1.0')) return new Response(JSON.stringify({ sha: commit, commit: { tree: { sha: tree } } }), { status: 200 });
    if (url.includes(`/git/trees/${tree}?recursive=1`)) return new Response(JSON.stringify({ truncated: false, tree: [] }), { status: 200 });
    if (url.includes(`/compare/${baseline}...${commit}`)) return new Response(JSON.stringify({
      status: 'ahead', ahead_by: 2, behind_by: 0, total_commits: 2,
      commits: [
        { sha: 'c'.repeat(40), commit: { committer: { date: '2026-10-10T08:00:00Z' }, message: 'Inicia la iteració #31' }, author: { login: 'anna' } },
        { sha: commit, commit: { committer: { date: '2026-10-14T08:00:00Z' }, message: 'Valida el prototip #42' }, author: { login: 'pau' } }
      ]
    }), { status: 200 });
    return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
  };
  const snapshot = await githubSnapshot({ repository: 'org/hort', ref: 'prototip-v1.0', baselineRef: 'pla-v1.0', token: 'secret', fetchImpl });
  assert.equal(snapshot.baseline.commit, baseline);
  assert.equal(snapshot.baseline.status, 'ahead');
  assert.equal(snapshot.history.length, 2);
  assert.equal(snapshot.historyTruncated, false);
  assert.equal(requested.length, 4);
});
