import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, chmodSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { repositories, syncRepository } from '../scripts/sincronitza-repositoris.mjs';

const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
test('llista de curs: comentaris, grups, URLs, duplicats i rutes invàlides', () => {
  assert.deepEqual(repositories('# exemple\nOrg/Repo 2DAW-C\nhttps://github.com/org/repo.git\ngit@github.com:org/alt.git;2DAW-A'), ['org/alt', 'org/repo']);
  assert.throws(() => repositories('../fora'));
  assert.throws(() => repositories('org/../../fora'));
});

test('clonació i actualització reals; conserva canvis, branques i commits locals', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'dwes-sync-'));
  const previous = process.env.PATH;
  const realGit = execFileSync('which', ['git'], { encoding: 'utf8' }).trim();
  try {
    const upstream = path.join(tmp, 'upstream');
    const source = path.join(tmp, 'source');
    const dest = path.join(tmp, 'dest');
    mkdirSync(path.join(upstream, 'org'), { recursive: true });
    mkdirSync(source); mkdirSync(dest);
    const bin = path.join(tmp, 'bin'); mkdirSync(bin);
    const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";
    writeFileSync(path.join(bin, 'git'), `#!/bin/sh\nexec ${quote(realGit)} -c ${quote(`url.file://${upstream}/.insteadOf=https://github.com/`)} -c user.name=Test -c user.email=test@example.invalid "$@"\n`);
    chmodSync(path.join(bin, 'git'), 0o755);
    process.env.PATH = `${bin}:${previous}`;
    git(source, 'init'); git(source, 'symbolic-ref', 'HEAD', 'refs/heads/main');
    writeFileSync(path.join(source, 'README.md'), 'initial');
    git(source, 'add', '.'); git(source, 'commit', '-m', 'initial');
    git(tmp, 'clone', '--bare', source, path.join(upstream, 'org/repo.git'));
    git(source, 'remote', 'add', 'origin', path.join(upstream, 'org/repo.git'));
    assert.match(syncRepository(dest, 'org/repo', { dryRun: true }), /CLONARIA/);
    assert.equal(existsSync(path.join(dest, 'org')), false);
    assert.equal(syncRepository(dest, 'org/repo'), 'CLONAT');
    const checkout = path.join(dest, 'org/repo');
    git(checkout, 'config', 'remote.origin.url', 'https://github.com/org/repo.git');
    assert.equal(syncRepository(dest, 'org/repo'), 'AL DIA');
    writeFileSync(path.join(source, 'README.md'), 'new');
    git(source, 'add', '.'); git(source, 'commit', '-m', 'new'); git(source, 'push', 'origin', 'main');
    assert.equal(syncRepository(dest, 'org/repo'), 'ACTUALITZAT');
    assert.equal(readFileSync(path.join(checkout, 'README.md'), 'utf8'), 'new');
    writeFileSync(path.join(checkout, 'local.txt'), 'keep');
    assert.throws(() => syncRepository(dest, 'org/repo'), /canvis locals/);
    assert.equal(readFileSync(path.join(checkout, 'local.txt'), 'utf8'), 'keep');
    rmSync(path.join(checkout, 'local.txt'));
    git(checkout, 'checkout', '-b', 'review');
    assert.throws(() => syncRepository(dest, 'org/repo'), /no és main/);
    git(checkout, 'checkout', 'main');
    writeFileSync(path.join(checkout, 'local.txt'), 'commit');
    git(checkout, 'add', '.'); git(checkout, 'commit', '-m', 'local');
    const head = git(checkout, 'rev-parse', 'HEAD');
    assert.throws(() => syncRepository(dest, 'org/repo'), /commits locals/);
    assert.equal(git(checkout, 'rev-parse', 'HEAD'), head);
    git(checkout, 'config', 'remote.origin.url', 'https://github.com/org/other.git');
    assert.throws(() => syncRepository(dest, 'org/repo'), /origin/);
    const list = path.join(tmp, 'list.txt');
    writeFileSync(list, 'org/missing\norg/second');
    git(tmp, 'clone', '--bare', source, path.join(upstream, 'org/second.git'));
    try {
      execFileSync(process.execPath, ['scripts/sincronitza-repositoris.mjs', dest, '--file', list], { encoding: 'utf8', stdio: 'pipe' });
      assert.fail('expected partial failure');
    } catch (error) {
      assert.equal(error.status, 1);
      assert.match(error.stdout, /org\/second: CLONAT/);
      assert.match(error.stdout, /1 correctes, 1 omesos/);
    }
  } finally {
    process.env.PATH = previous;
    rmSync(tmp, { recursive: true, force: true });
  }
});
