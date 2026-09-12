#!/usr/bin/env node
import process from 'node:process';

function parseArgs(argv) {
  const args = {};
  const allowed = new Set(['--repo', '--ref']);

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

function requireArgs(args) {
  const missing = ['repo', 'ref'].filter((key) => !args[key]);
  if (missing.length > 0) {
    throw new Error(`Falten arguments obligatoris: ${missing.map((key) => `--${key}`).join(', ')}`);
  }
}

async function github(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28'
    }
  });
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  return { response, data };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  requireArgs(args);

  const token = process.env.STUDENT_READ_TOKEN;
  if (!token) {
    throw new Error('Falta STUDENT_READ_TOKEN');
  }

  const userResult = await github('/user', token);
  if (!userResult.response.ok) {
    console.error(`El token CLASSROOM_AUTOGRADE_TOKEN no és valid per a l'API de GitHub: HTTP ${userResult.response.status}.`);
    if (userResult.data.message) {
      console.error(userResult.data.message);
    }
    process.exit(1);
  }

  const repoResult = await github(`/repos/${args.repo}`, token);
  if (!repoResult.response.ok) {
    console.error(`El token no pot llegir ${args.repo}: HTTP ${repoResult.response.status}.`);
    if (repoResult.data.message) {
      console.error(repoResult.data.message);
    }
    console.error("Revisa que el fine-grained token estiga aprovat per l'organització i incloga este repositori amb Contents: read.");
    process.exit(1);
  }

  const branchResult = await github(`/repos/${args.repo}/branches/${encodeURIComponent(args.ref)}`, token);
  if (!branchResult.response.ok) {
    console.error(`El token pot llegir ${args.repo}, però no s'ha trobat la branca ${args.ref}: HTTP ${branchResult.response.status}.`);
    if (branchResult.data.message) {
      console.error(branchResult.data.message);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`No s'ha pogut comprovar l'accés al repositori d'alumne: ${error.message}`);
  process.exit(1);
});
