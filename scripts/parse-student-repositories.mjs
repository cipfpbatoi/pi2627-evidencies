#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import process from 'node:process';

const groupPattern = /^2DAW-[A-D]$/i;

function parseArgs(argv) {
  const args = {};
  const allowed = new Set(['--input', '--file', '--default-group']);

  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];

    if (allowed.has(key) && value && !value.startsWith('--')) {
      args[key.slice(2)] = value;
      index += 1;
    }
  }

  return args;
}

function stripComment(line) {
  return line.replace(/#.*$/, '');
}

function normalizeRepo(token) {
  let repo = token.trim().replace(/^['"]|['"]$/g, '');

  repo = repo.replace(/^https?:\/\/github\.com\//i, '');
  repo = repo.replace(/^git@github\.com:/i, '');
  repo = repo.replace(/\.git$/i, '');
  repo = repo.replace(/^\/+|\/+$/g, '');

  return repo;
}

function isGroup(token) {
  return groupPattern.test(token.trim());
}

function isRepo(token) {
  const repo = normalizeRepo(token);
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo);
}

function tokenizeLine(line) {
  return stripComment(line)
    .replace(/[,;]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function parseRepositories(text, defaultGroup) {
  const rows = [];
  const seen = new Set();

  for (const rawLine of text.split(/\r?\n/)) {
    const tokens = tokenizeLine(rawLine);

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];

      if (!isRepo(token)) {
        throw new Error(`Entrada de repositori no valida: ${token}`);
      }

      const repo = normalizeRepo(token);
      const next = tokens[index + 1] || '';
      const group = isGroup(next) ? next.toUpperCase() : defaultGroup;

      if (isGroup(next)) {
        index += 1;
      }

      const key = `${repo} ${group}`;
      if (!seen.has(key)) {
        rows.push({ repo, group });
        seen.add(key);
      }
    }
  }

  return rows.sort((a, b) => `${a.repo} ${a.group}`.localeCompare(`${b.repo} ${b.group}`));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const defaultGroup = (args['default-group'] || '').trim();

  if (!defaultGroup) {
    throw new Error('Falta --default-group');
  }

  if (args.input && args.file) {
    throw new Error('Usa nomes --input o --file, no els dos alhora');
  }

  const text = args.file ? await readFile(args.file, 'utf8') : (args.input || '');
  const rows = parseRepositories(text, defaultGroup);

  for (const row of rows) {
    console.log(`${row.repo} ${row.group}`);
  }
}

main().catch((error) => {
  console.error(`No s'ha pogut preparar la llista de repositoris: ${error.message}`);
  process.exit(1);
});
