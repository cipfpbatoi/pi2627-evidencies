#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const help = `Ús: ./scripts/sincronitza-repositoris.sh DESTÍ [--group 2DAW-C] [--file LLISTA] [--ssh] [--dry-run]
Clona main o actualitza sense sobreescriure treball local.
Per defecte: course/student-repositories.txt. --file i --group són alternatius.
--dry-run mostra la llista sense crear carpetes ni contactar amb GitHub.`;

export function repositories(text) {
  const found = new Set();
  for (const line of text.split(/\r?\n/)) {
    const tokens = line.replace(/#.*$/, '').replace(/[,;]/g, ' ').trim().split(/\s+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const repo = tokens[i].replace(/^['"]|['"]$/g, '').replace(/^https?:\/\/github\.com\//i, '').replace(/^git@github\.com:/i, '').replace(/\/$/, '').replace(/\.git$/i, '');
      if (!/^[A-Za-z0-9_-][A-Za-z0-9_.-]*\/[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(repo)) throw new Error(`Repositori no vàlid: ${tokens[i]}`);
      found.add(repo.toLowerCase());
      if (/^2DAW-[A-D]$/i.test(tokens[i + 1] || '')) i++;
    }
  }
  return [...found].sort();
}

function git(cwd, ...args) {
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-C', cwd, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  }).trim();
}

export function syncRepository(destination, repo, { ssh = false, dryRun = false } = {}) {
  const folder = path.join(destination, repo);
  const url = ssh ? `git@github.com:${repo}.git` : `https://github.com/${repo}.git`;
  // Do not follow an existing symlink into an unrelated checkout.
  for (const part of [path.dirname(folder), folder]) {
    if (existsSync(part) && lstatSync(part).isSymbolicLink()) throw new Error('La carpeta és un enllaç simbòlic; revisa-la manualment.');
  }
  if (dryRun) return `${existsSync(folder) ? 'REVISARIA/ACTUALITZARIA' : 'CLONARIA'} ${folder}`;
  if (!existsSync(folder)) {
    mkdirSync(path.dirname(folder), { recursive: true });
    git(destination, 'clone', '--branch', 'main', '--', url, folder);
    return 'CLONAT';
  }
  if (git(folder, 'rev-parse', '--show-toplevel') !== realpathSync(folder)) throw new Error('La carpeta no és l’arrel d’un repositori.');
  const origin = git(folder, 'config', '--get', 'remote.origin.url');
  if (![ `https://github.com/${repo}`, `https://github.com/${repo}.git`, `git@github.com:${repo}`, `git@github.com:${repo}.git`, `ssh://git@github.com/${repo}.git` ].includes(origin.toLowerCase())) throw new Error('origin no correspon al repositori esperat.');
  if (git(folder, 'symbolic-ref', '--short', 'HEAD') !== 'main') throw new Error('La branca activa no és main.');
  if (git(folder, 'status', '--porcelain')) throw new Error('Hi ha canvis locals o fitxers sense seguiment.');
  for (const state of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply']) {
    if (existsSync(path.resolve(folder, git(folder, 'rev-parse', '--git-path', state)))) throw new Error('Hi ha una operació Git pendent.');
  }
  git(folder, 'fetch', 'origin', 'refs/heads/main');
  try { git(folder, 'merge-base', '--is-ancestor', 'HEAD', 'FETCH_HEAD'); }
  catch { throw new Error('Hi ha commits locals o històries divergents; revisa-ho manualment.'); }
  const before = git(folder, 'rev-parse', 'HEAD');
  git(folder, 'merge', '--ff-only', 'FETCH_HEAD');
  return before === git(folder, 'rev-parse', 'HEAD') ? 'AL DIA' : 'ACTUALITZAT';
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) { console.log(help); return; }
  let destination, group, file, ssh = false, dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--ssh') ssh = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg === '--group' || arg === '--file') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`Falta el valor de ${arg}`);
      if (arg === '--group') group = value.toUpperCase(); else file = value;
    } else if (arg.startsWith('-') || destination) throw new Error(`Argument desconegut: ${arg}`);
    else destination = path.resolve(arg);
  }
  if (!destination) throw new Error(help);
  if (group && file) throw new Error('Usa --group o --file, no els dos.');
  if (group && !/^2DAW-[A-D]$/.test(group)) throw new Error('Grup no vàlid: usa 2DAW-A, B, C o D.');
  const list = file ? path.resolve(file) : path.join(root, 'course', group ? `student-repositories-${group.toLowerCase().replace('-', '')}.txt` : 'student-repositories.txt');
  const repos = repositories(readFileSync(list, 'utf8'));
  console.log(`Llista: ${list} · ${repos.length} repositoris`);
  if (!repos.length) throw new Error('La llista està buida.');
  if (!dryRun) mkdirSync(destination, { recursive: true });
  let errors = 0;
  for (const repo of repos) {
    try { console.log(`${repo}: ${syncRepository(destination, repo, { ssh, dryRun })}`); }
    catch (error) {
      errors++;
      // Git errors can contain credential-bearing URLs: do not print raw stderr.
      const message = error.status !== undefined ? 'Ha fallat Git. Comprova accés, connexió, branca main i estat de la carpeta.' : error.message;
      console.error(`${repo}: OMÉS — ${message}`);
    }
  }
  console.log(`Final: ${repos.length - errors} correctes, ${errors} omesos/errors.`);
  if (errors) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
