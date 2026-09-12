import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const script = path.resolve('scripts/audit-student-agent-rules.mjs');
const required = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'src/AGENTS.md', 'src/CLAUDE.md', 'src/GEMINI.md'];

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'audit-agent-rules-'));
  const policy = path.join(root, 'policy');
  const repo = path.join(root, 'repo');
  for (const relative of required) {
    mkdirSync(path.dirname(path.join(policy, relative)), { recursive: true });
    writeFileSync(path.join(policy, relative), `policy:${relative}\n`);
  }
  cpSync(policy, repo, { recursive: true });
  return { root, policy, repo };
}

function run(policy, repo, output) {
  return spawnSync(process.execPath, [script, '--repo-dir', repo, '--policy-dir', policy, '--repo', 'org/student', '--output', output], { encoding: 'utf8' });
}

test('accepta els sis fitxers canònics sense configuracions alternatives', () => {
  const item = fixture();
  try {
    const output = path.join(item.root, 'result.json');
    execFileSync(process.execPath, [script, '--repo-dir', item.repo, '--policy-dir', item.policy, '--output', output]);
    const result = JSON.parse(readFileSync(output, 'utf8'));
    assert.equal(result.status, 'pass');
    assert.equal(result.findings_count, 0);
  } finally {
    rmSync(item.root, { recursive: true, force: true });
  }
});

test('detecta modificacions, absències i regles alternatives', () => {
  const item = fixture();
  try {
    writeFileSync(path.join(item.repo, 'AGENTS.md'), 'manipulat\n');
    rmSync(path.join(item.repo, 'src/GEMINI.md'));
    mkdirSync(path.join(item.repo, '.cursor/rules'), { recursive: true });
    writeFileSync(path.join(item.repo, '.cursor/rules/bypass.mdc'), 'override');
    writeFileSync(path.join(item.repo, 'src/AGENTS.override.md'), 'override');
    const output = path.join(item.root, 'result.json');
    const execution = run(item.policy, item.repo, output);
    assert.equal(execution.status, 1);
    const result = JSON.parse(readFileSync(output, 'utf8'));
    assert.equal(result.status, 'review_required');
    assert.deepEqual(new Set(result.findings.map((finding) => finding.code)), new Set([
      'protected_modified',
      'protected_missing',
      'alternative_rules_found',
      'override_found'
    ]));
  } finally {
    rmSync(item.root, { recursive: true, force: true });
  }
});
