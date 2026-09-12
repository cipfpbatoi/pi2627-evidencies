import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const requiredArgs = ['student-dir', 'result', 'markdown', 'repo', 'group', 'source'];

function parseArgs(argv) {
  const args = {};
  const allowed = new Set([...requiredArgs, 'batch-id'].map((arg) => `--${arg}`));

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
  const missing = requiredArgs.filter((arg) => !args[arg]);

  if (missing.length > 0) {
    throw new Error(`Falten arguments obligatoris: ${missing.map((arg) => `--${arg}`).join(', ')}`);
  }
}

function safeName(input) {
  return String(input || 'nd').replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function compactTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function displayTimestampFromFile(file) {
  const timestamp = file.replace(/\.json$/, '').split('__')[0];
  const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/);

  if (!match) {
    return timestamp;
  }

  const [, year, month, day, hour, minute, second, millisecond] = match;
  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}Z`;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readHistoryEntries(historyDir) {
  let files = [];

  try {
    files = await readdir(historyDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }

  const jsonFiles = files.filter((file) => file.endsWith('.json')).sort().reverse();
  const entries = [];

  for (const file of jsonFiles) {
    const jsonPath = path.join(historyDir, file);
    const markdownFile = file.replace(/\.json$/, '.md');

    try {
      const result = await readJson(jsonPath);
      entries.push({
        file,
        markdownFile,
        challengeId: result.challenge_id || 'n/d',
        score: result.final_score_over_10 ?? 'n/d',
        confidence: result.confidence ?? 'n/d',
        review: result.teacher_review_required === true ? 'Sí' : result.teacher_review_required === false ? 'No' : 'n/d',
        commit: result.commit || 'n/d'
      });
    } catch {
      entries.push({
        file,
        markdownFile,
        challengeId: 'n/d',
        score: 'n/d',
        confidence: 'n/d',
        review: 'n/d',
        commit: 'n/d'
      });
    }
  }

  return entries;
}

function tableCell(input) {
  return String(input ?? '')
    .replace(/\r?\n/g, '<br>')
    .replace(/\|/g, '\\|');
}

async function renderIndex(autogradeDir, context) {
  const entries = await readHistoryEntries(path.join(autogradeDir, 'history'));
  const lines = [];

  lines.push('# Autocorreccions');
  lines.push('');
  lines.push(`- Repositori: \`${context.repo}\``);
  lines.push(`- Grup: \`${context.group}\``);
  lines.push(`- Última correcció: [autograde/latest.md](latest.md)`);
  lines.push('');
  lines.push('## Historial');
  lines.push('');

  if (entries.length === 0) {
    lines.push('Encara no hi ha autocorreccions guardades en l\'historial.');
    lines.push('');
  } else {
    lines.push('| Data | Microrepte | Nota | Revisió docent | Commit | Resultat | JSON |');
    lines.push('|---|---|---:|---|---|---|---|');

    for (const entry of entries) {
      const date = displayTimestampFromFile(entry.file);
      const commit = String(entry.commit);
      const shortCommit = commit.length > 12 ? commit.slice(0, 12) : commit;
      lines.push(`| ${tableCell(date)} | \`${tableCell(entry.challengeId)}\` | ${tableCell(entry.score)}/10 | ${tableCell(entry.review)} | \`${tableCell(shortCommit)}\` | [Markdown](history/${entry.markdownFile}) | [JSON](history/${entry.file}) |`);
    }

    lines.push('');
  }

  lines.push('`latest.md` mostra sempre l\'última correcció. La carpeta `history/` conserva les valoracions anteriors del microrepte.');
  lines.push('');

  await writeFile(path.join(autogradeDir, 'README.md'), `${lines.join('\n')}`, 'utf8');
}

export async function publishStudentAutograde(args) {
  requireArgs(args);

  const studentDir = path.resolve(args['student-dir']);
  const resultPath = path.resolve(args.result);
  const markdownPath = path.resolve(args.markdown);
  const result = await readJson(resultPath);
  const autogradeDir = path.join(studentDir, 'autograde');
  const historyDir = path.join(autogradeDir, 'history');
  const attemptName = [
    compactTimestamp(),
    safeName(result.challenge_id),
    safeName((result.commit || '').slice(0, 12)),
    safeName(args.source)
  ].filter(Boolean).join('__');

  await mkdir(historyDir, { recursive: true });
  await copyFile(resultPath, path.join(autogradeDir, 'latest.json'));
  await copyFile(markdownPath, path.join(autogradeDir, 'latest.md'));
  await copyFile(resultPath, path.join(historyDir, `${attemptName}.json`));
  await copyFile(markdownPath, path.join(historyDir, `${attemptName}.md`));
  await renderIndex(autogradeDir, {
    repo: args.repo,
    group: args.group,
    batchId: args['batch-id'],
    source: args.source
  });

  return {
    latestMarkdown: path.join('autograde', 'latest.md'),
    indexMarkdown: path.join('autograde', 'README.md'),
    historyMarkdown: path.join('autograde', 'history', `${attemptName}.md`)
  };
}

async function main() {
  const published = await publishStudentAutograde(parseArgs(process.argv.slice(2)));
  console.log(`Autocorrecció publicada: ${published.latestMarkdown}`);
  console.log(`Historial actualitzat: ${published.indexMarkdown}`);
  console.log(`Intent guardat: ${published.historyMarkdown}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`No s'ha pogut publicar l'autocorrecció en el repositori de l'alumne: ${error.message}`);
    process.exit(1);
  });
}
