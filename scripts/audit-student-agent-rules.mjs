#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'src/AGENTS.md',
  'src/CLAUDE.md',
  'src/GEMINI.md'
];

const FORBIDDEN_EXACT = new Set([
  '.cursorrules',
  '.windsurfrules',
  '.gemini/settings.json',
  '.github/copilot-instructions.md',
  '.junie/AGENTS.md',
  '.junie/guidelines.md'
]);

const FORBIDDEN_PREFIXES = [
  '.cursor/rules/',
  '.windsurf/rules/',
  '.junie/rules/',
  '.clinerules/',
  '.amazonq/rules/',
  '.github/instructions/'
];

function usage() {
  console.error('Ús: node scripts/audit-student-agent-rules.mjs --repo-dir DIR --policy-dir DIR [--repo owner/name] [--output FILE]');
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!['--repo-dir', '--policy-dir', '--repo', '--output'].includes(key) || index + 1 >= argv.length) {
      usage();
      process.exit(2);
    }
    result[key.slice(2).replaceAll('-', '_')] = argv[index + 1];
    index += 1;
  }
  if (!result.repo_dir || !result.policy_dir) {
    usage();
    process.exit(2);
  }
  return result;
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function collectPaths(root, relative = '') {
  const directory = path.join(root, relative);
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    if (!relative && ['.git', 'node_modules'].includes(entry.name)) continue;
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    paths.push(child);
    if (entry.isDirectory()) paths.push(...await collectPaths(root, child));
  }
  return paths;
}

async function audit({ repo_dir: repoDir, policy_dir: policyDir, repo = null }) {
  const findings = [];
  const expectedHashes = {};

  for (const relative of REQUIRED_FILES) {
    const expectedPath = path.join(policyDir, relative);
    const actualPath = path.join(repoDir, relative);
    let expected;
    try {
      expected = await readFile(expectedPath);
    } catch {
      throw new Error(`Falta el fitxer canònic ${expectedPath}`);
    }
    expectedHashes[relative] = sha256(expected);

    try {
      const stats = await lstat(actualPath);
      if (stats.isSymbolicLink()) {
        findings.push({ code: 'protected_symlink', path: relative, message: 'El fitxer protegit és un enllaç simbòlic.' });
        continue;
      }
      const actual = await readFile(actualPath);
      if (!actual.equals(expected)) {
        findings.push({ code: 'protected_modified', path: relative, message: 'El contingut no coincidix amb la política docent.' });
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        findings.push({ code: 'protected_missing', path: relative, message: 'Falta el fitxer protegit.' });
      } else {
        throw error;
      }
    }
  }

  const allPaths = await collectPaths(repoDir);
  const requiredSet = new Set(REQUIRED_FILES);
  for (const relative of allPaths) {
    const base = path.posix.basename(relative);
    if (base === 'AGENTS.override.md' || base === 'CLAUDE.local.md') {
      findings.push({ code: 'override_found', path: relative, message: "S'ha trobat un fitxer d'override prohibit." });
      continue;
    }
    if (['AGENTS.md', 'CLAUDE.md', 'GEMINI.md'].includes(base) && !requiredSet.has(relative)) {
      findings.push({ code: 'unexpected_instruction_file', path: relative, message: "S'ha trobat un fitxer d'instruccions no autoritzat." });
      continue;
    }
    if (FORBIDDEN_EXACT.has(relative) || FORBIDDEN_PREFIXES.some((prefix) => relative.startsWith(prefix))) {
      findings.push({ code: 'alternative_rules_found', path: relative, message: "S'ha trobat una configuració alternativa d'agent." });
    }
  }

  return {
    schema_version: 1,
    repository: repo,
    audited_at: new Date().toISOString(),
    status: findings.length === 0 ? 'pass' : 'review_required',
    required_files: REQUIRED_FILES,
    expected_sha256: expectedHashes,
    findings_count: findings.length,
    findings
  };
}

const args = parseArgs(process.argv.slice(2));
try {
  const result = await audit(args);
  const serialized = `${JSON.stringify(result, null, 2)}\n`;
  if (args.output) {
    await mkdir(path.dirname(path.resolve(args.output)), { recursive: true });
    await writeFile(args.output, serialized, 'utf8');
  }
  process.stdout.write(serialized);
  process.exitCode = result.status === 'pass' ? 0 : 1;
} catch (error) {
  console.error(`No s'ha pogut completar l'auditoria: ${error.message}`);
  process.exitCode = 2;
}
