import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    await writeFile(path.join(root, 'pi/checkpoints/control.json'), JSON.stringify({ id: 'control', name: 'Control', phase: 'proposta', assessment: 'formative', required_files: ['project.json', 'docs/dossier.md'], required_globs: [], candidate_ra_ca: ['RA2.a'] }));
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
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
