import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { loadConfiguration } from './lib/config.mjs';
import { githubSnapshot } from './lib/github-source.mjs';
import { analyseProcessHistory } from './lib/process-history.mjs';

const execFileAsync = promisify(execFile);

function args(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 2) result[argv[i]?.replace(/^--/, '')] = argv[i + 1];
  return result;
}

async function git(repoDir, parameters) {
  const { stdout } = await execFileAsync('git', parameters, { cwd: repoDir, maxBuffer: 10 * 1024 * 1024 });
  return stdout.trim();
}

function matches(pattern, file) {
  const escaped = pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*');
  return new RegExp(`^${escaped}$`).test(file);
}

async function readAt(repoDir, commit, file) {
  try { return await git(repoDir, ['show', `${commit}:${file}`]); } catch { return null; }
}

function parseHistory(value) {
  if (!value.trim()) return [];
  return value.trim().split('\n').map((line) => {
    const [commit, committedAt, author, ...message] = line.split('\u001f');
    return { commit, committed_at: committedAt, author, message: message.join('\u001f') };
  });
}

async function localHistory(repoDir, commit, baselineRef) {
  const format = '%H%x1f%cI%x1f%an%x1f%s';
  if (baselineRef) {
    try {
      const baselineCommit = await git(repoDir, ['rev-parse', '--verify', `${baselineRef}^{commit}`]);
      try {
        await git(repoDir, ['merge-base', '--is-ancestor', baselineCommit, commit]);
        const total = Number(await git(repoDir, ['rev-list', '--count', `${baselineCommit}..${commit}`]));
        const log = await git(repoDir, ['log', '--reverse', '--max-count=250', `--format=${format}`, `${baselineCommit}..${commit}`]);
        return {
          history: parseHistory(log),
          historyTruncated: total > 250,
          baseline: { requested_ref: baselineRef, commit: baselineCommit, status: total ? 'ahead' : 'identical', ahead_by: total, behind_by: 0 }
        };
      } catch {
        const log = await git(repoDir, ['log', '--reverse', '--max-count=100', `--format=${format}`, commit]);
        return {
          history: parseHistory(log),
          historyTruncated: Number(await git(repoDir, ['rev-list', '--count', commit])) > 100,
          baseline: { requested_ref: baselineRef, commit: baselineCommit, status: 'diverged', ahead_by: null, behind_by: null }
        };
      }
    } catch {
      const log = await git(repoDir, ['log', '--reverse', '--max-count=100', `--format=${format}`, commit]);
      return {
        history: parseHistory(log),
        historyTruncated: Number(await git(repoDir, ['rev-list', '--count', commit])) > 100,
        baseline: { requested_ref: baselineRef, commit: null, status: 'missing', ahead_by: null, behind_by: null }
      };
    }
  }
  const total = Number(await git(repoDir, ['rev-list', '--count', commit]));
  const log = await git(repoDir, ['log', '--reverse', '--max-count=100', `--format=${format}`, commit]);
  return { history: parseHistory(log), historyTruncated: total > 100, baseline: null };
}

function meaningfulFiles(files) {
  return files.filter((file) => !path.basename(file).startsWith('plantilla') && !file.endsWith('/README.md'));
}

function candidateFiles(patterns, files) {
  return [...new Set((patterns || []).flatMap((pattern) => files.filter((file) => matches(pattern, file) && !path.basename(file).startsWith('plantilla'))))];
}

async function main() {
  const input = args(process.argv.slice(2));
  const missing = ['project-id', 'checkpoint', 'ref'].filter((key) => !input[key]);
  if (missing.length) throw new Error(`Falten arguments: ${missing.map((key) => `--${key}`).join(', ')}.`);
  if (!input['repo-dir'] && !input.github) throw new Error('Indica --repo-dir o --github.');
  if (input['repo-dir'] && input.github) throw new Error('Usa només --repo-dir o --github.');

  const root = process.cwd();
  const { projects, checkpoints } = await loadConfiguration(root);
  const project = projects.get(input['project-id']);
  const checkpoint = checkpoints.get(input.checkpoint);
  if (!project) throw new Error(`Projecte no registrat: ${input['project-id']}.`);
  if (!checkpoint) throw new Error(`Punt de control desconegut: ${input.checkpoint}.`);

  let commit;
  let files;
  let projectFile;
  let history;
  let historyTruncated;
  let baseline;
  if (input.github) {
    ({ commit, files, projectFile, history, historyTruncated, baseline } = await githubSnapshot({
      repository: project.repository,
      ref: input.ref,
      baselineRef: checkpoint.baseline_ref,
      token: process.env.GITHUB_TOKEN
    }));
  } else {
    const repoDir = path.resolve(input['repo-dir']);
    commit = await git(repoDir, ['rev-parse', '--verify', `${input.ref}^{commit}`]);
    const filesText = await git(repoDir, ['ls-tree', '-r', '--name-only', commit]);
    files = filesText ? filesText.split('\n') : [];
    projectFile = await readAt(repoDir, commit, 'project.json');
    ({ history, historyTruncated, baseline } = await localHistory(repoDir, commit, checkpoint.baseline_ref));
  }
  let repositoryProject = null;
  try { repositoryProject = projectFile ? JSON.parse(projectFile) : null; } catch { /* check below */ }

  const checks = [];
  const blockingFlags = [];
  for (const file of checkpoint.required_files) {
    const found = files.includes(file);
    checks.push({ id: `file:${file}`, status: found ? 'passed' : 'failed', message: found ? 'Fitxer present.' : 'Falta el fitxer obligatori.', evidence: [file] });
    if (!found) blockingFlags.push(`Falta ${file}.`);
  }
  for (const pattern of checkpoint.required_globs) {
    let found = files.filter((file) => matches(pattern, file));
    found = meaningfulFiles(found);
    checks.push({ id: `glob:${pattern}`, status: found.length ? 'passed' : 'failed', message: found.length ? `${found.length} coincidència/es.` : 'No hi ha cap evidència.', evidence: found });
    if (!found.length) blockingFlags.push(`No hi ha evidències per a ${pattern}.`);
  }

  if (!repositoryProject || repositoryProject.id !== project.id || !String(repositoryProject.name || '').trim()) {
    blockingFlags.push('project.json no identifica correctament el projecte i el seu nom.');
    checks.push({ id: 'project-metadata', status: 'failed', message: 'Metadades absents, invàlides o incoherents.', evidence: ['project.json'] });
  } else {
    checks.push({ id: 'project-metadata', status: 'passed', message: `Projecte identificat com “${repositoryProject.name}”.`, evidence: ['project.json'] });
  }

  const processEvidence = analyseProcessHistory(history, { baseline, historyTruncated });
  const warnings = processEvidence.observations.map((item) => `[Procés] ${item}`);
  const contributors = files.filter((file) => /^evidencies\/alumnat\/[^/]+\.md$/.test(file) && !file.endsWith('/plantilla.md'));
  if (contributors.length < 2) warnings.push('Hi ha menys de dos registres individuals identificables; cal revisar si és una excepció autoritzada.');
  const candidateEvidence = checkpoint.candidate_ra_ca.map((raCa) => {
    const expected = checkpoint.evidence_by_ra_ca?.[raCa] || [];
    return {
      ra_ca: raCa,
      scope: 'candidate',
      expected_evidence: expected,
      evidence: expected.length ? candidateFiles(expected, files) : checks.filter((check) => check.status === 'passed').flatMap((check) => check.evidence)
    };
  });
  const report = {
    schema_version: 2,
    generated_at: new Date().toISOString(),
    project: { id: project.id, name: project.name, repository: project.repository },
    checkpoint: { id: checkpoint.id, name: checkpoint.name, phase: checkpoint.phase, assessment: checkpoint.assessment, rubric_id: checkpoint.rubric_id || null },
    version: { requested_ref: input.ref, commit },
    status: blockingFlags.length ? 'incomplete' : warnings.length ? 'complete_with_warnings' : 'complete',
    checks,
    candidate_evidence: candidateEvidence,
    process: processEvidence,
    warnings,
    blocking_flags: [...new Set(blockingFlags)],
    teacher_review_required: true,
    qualification: null
  };

  const output = path.resolve(input.output || `tmp/pi/${project.id}-${checkpoint.id}.json`);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(`No s'han pogut recopilar les evidències: ${error.message}`);
  process.exit(1);
});
