import { consolidationCode, readConsolidation, saveConsolidation, publishConsolidation, withdrawConsolidation, recordConsolidationPublication } from './consolidation.mjs';
import { calculateRepteExtension, makeExtensionReview, readChallengeMetadata } from '../scripts/lib/repte-extension.mjs';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { createHash, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import {
  initDb,
  getDb,
  closeDb,
  upsertStudent,
  updateStudent,
  deleteStudent,
  deleteGrade,
  getStudents,
  upsertChallenge,
  getChallenges,
  getLatestGrades,
  getGradeById,
  getStudentGrades,
  getStatistics,
  migrateFromJson,
  getClassroomSessionNotes,
  insertClassroomSessionNote
} from './db.mjs';
import { readGrades, writeGrades } from '../scripts/lib/grades-store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const localClassroomProgrammingDir = path.resolve(rootDir, 'docs/programacio_aula');
const externalClassroomProgrammingDir = path.resolve(rootDir, '../dwes-restructuracio-modul/docs/01_programacio_modul');
const execFileAsync = promisify(execFile);
const correctionWorkflowFile = 'batch-autograde-students.yml';
const agentRulesAuditWorkflowFile = 'audit-student-agent-rules.yml';
const defaultPort = 4173;
const groupFiles = {
  all: 'course/student-repositories.txt',
  '2DAW-A': 'course/student-repositories-2dawa.txt',
  '2DAW-B': 'course/student-repositories-2dawb.txt',
  '2DAW-C': 'course/student-repositories-2dawc.txt',
  '2DAW-D': 'course/student-repositories-2dawd.txt'
};

function loadDotEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!existsSync(envPath)) {
    return;
  }

  return readFile(envPath, 'utf8')
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
          continue;
        }

        const [key, ...valueParts] = trimmed.split('=');
        if (!process.env[key]) {
          process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
        }
      }
    });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendHtml(response, html) {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(html);
}

function sendUnauthorized(response) {
  response.writeHead(401, {
    'content-type': 'text/plain; charset=utf-8',
    'www-authenticate': 'Basic realm="DWES Autocorreccio Dashboard", charset="UTF-8"'
  });
  response.end('Autenticacio requerida.\n');
}

function envFlag(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function isLocalHost(host) {
  return ['127.0.0.1', 'localhost', '::1'].includes(String(host || '').toLowerCase());
}

function dashboardAuthRequired(host) {
  return envFlag('DASHBOARD_AUTH_REQUIRED', !isLocalHost(host));
}

function hashValue(value) {
  return createHash('sha256').update(String(value)).digest();
}

function constantTimeTextEqual(left, right) {
  const leftHash = hashValue(left);
  const rightHash = hashValue(right);
  return timingSafeEqual(leftHash, rightHash);
}

function parseBasicAuth(header) {
  const match = String(header || '').match(/^Basic\s+(.+)$/i);
  if (!match) {
    return null;
  }

  let decoded = '';
  try {
    decoded = Buffer.from(match[1], 'base64').toString('utf8');
  } catch {
    return null;
  }

  const separator = decoded.indexOf(':');
  if (separator < 0) {
    return null;
  }

  return {
    user: decoded.slice(0, separator),
    password: decoded.slice(separator + 1)
  };
}

function dashboardCredentialsConfigured() {
  return Boolean(process.env.DASHBOARD_USER && process.env.DASHBOARD_PASSWORD);
}

function envText(name) {
  return String(process.env[name] || '').trim();
}

function envUrl(name) {
  const value = envText(name);
  if (!value) {
    return '';
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function dashboardDocLinks() {
  return {
    professorat_url: envUrl('DASHBOARD_DOCS_PROFESSORAT_URL'),
    alumnat_url: envUrl('DASHBOARD_DOCS_ALUMNAT_URL')
  };
}

function githubCliEnv() {
  const env = { ...process.env };
  if (!env.GH_TOKEN) {
    delete env.GITHUB_TOKEN;
  }
  return env;
}

function formatCommandError(error) {
  return [error.stderr, error.stdout, error.message]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join('\n');
}

function escapeHtmlServer(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isDashboardRequestAuthorized(request, host) {
  if (!dashboardAuthRequired(host)) {
    return true;
  }

  if (!dashboardCredentialsConfigured()) {
    return false;
  }

  const credentials = parseBasicAuth(request.headers.authorization);
  if (!credentials) {
    return false;
  }

  return constantTimeTextEqual(credentials.user, process.env.DASHBOARD_USER) &&
    constantTimeTextEqual(credentials.password, process.env.DASHBOARD_PASSWORD);
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(rootDir, relativePath), 'utf8'));
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readTextIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return readFile(filePath, 'utf8');
}

function extractRepteWeight(challenge) {
  if (typeof challenge.repte_weight === 'number') {
    return challenge.repte_weight;
  }

  const sourceAlignment = Array.isArray(challenge.source_alignment) ? challenge.source_alignment : [];
  for (const item of sourceAlignment) {
    const match = String(item).match(/pes[^0-9]*(\d+(?:[.,]\d+)?)\s*%/i);
    if (match) {
      return Number(match[1].replace(',', '.')) / 100;
    }
  }

  return null;
}

function criterionRaPrefix(criterion) {
  const match = String(criterion || '').match(/^(RA\d+)/i);
  return match ? match[1].toUpperCase() : null;
}

function validateMicrorepte(challenge, rubric, prompt) {
  const issues = [];
  const dimensionWeightSum = Array.isArray(rubric?.dimensions)
    ? rubric.dimensions.reduce((sum, dimension) => sum + Number(dimension.weight || 0), 0)
    : 0;
  const repteWeight = challenge ? extractRepteWeight(challenge) : null;

  if (!challenge) {
    issues.push('Falta challenge.json.');
  }

  if (!rubric) {
    issues.push('Falta rubric.json.');
  }

  if (!prompt) {
    issues.push('Falta prompt.md.');
  }

  if (challenge && rubric && challenge.challenge_id !== rubric.challenge_id) {
    issues.push('challenge_id no coincideix entre challenge.json i rubric.json.');
  }

  if (rubric && Math.abs(dimensionWeightSum - 1) > 0.001) {
    issues.push(`Els pesos de la rúbrica sumen ${dimensionWeightSum.toFixed(3)} en lloc de 1.`);
  }

  if (challenge && repteWeight === null) {
    issues.push('No hi ha pes estructurat del microrepte dins del repte.');
  }

  if (challenge && /^R\d+M\d+$/i.test(String(challenge.microrepte_code || ''))) {
    const primaryRa = String(challenge.primary_ra || '').toUpperCase();
    if (!/^RA\d+$/.test(primaryRa)) {
      issues.push('Falta RA avaluat únic (`primary_ra`).');
    }

    if (!Array.isArray(challenge.assessed_ca) || challenge.assessed_ca.length === 0) {
      issues.push('Falten CA avaluats (`assessed_ca`).');
    } else {
      for (const criterion of challenge.assessed_ca) {
        if (criterionRaPrefix(criterion) !== primaryRa) {
          issues.push(`El CA ${criterion} no pertany al RA avaluat ${primaryRa || '(sense RA)'}.`);
        }
      }
    }
  }

  return {
    status: issues.length === 0 ? 'ok' : 'warning',
    issues,
    dimension_weight_sum: Number(dimensionWeightSum.toFixed(3)),
    repte_weight: repteWeight
  };
}

async function readMicrorepteDir(dirName) {
  const microrepteDir = path.join(rootDir, 'microreptes', dirName);
  const challengePath = path.join(microrepteDir, 'challenge.json');
  const rubricPath = path.join(microrepteDir, 'rubric.json');
  const promptPath = path.join(microrepteDir, 'prompt.md');
  const challenge = await readJsonIfExists(challengePath);
  const rubric = await readJsonIfExists(rubricPath);
  const prompt = await readTextIfExists(promptPath);
  const validation = validateMicrorepte(challenge, rubric, prompt);
  const dimensions = Array.isArray(rubric?.dimensions) ? rubric.dimensions : [];

  return {
    id: challenge?.challenge_id || dirName,
    dir: dirName,
    repte_id: challenge?.repte_id || '',
    session_code: challenge?.session_code || '',
    microrepte_code: challenge?.microrepte_code || '',
    title: challenge?.title || '',
    summary: challenge?.summary || '',
    repte_weight: validation.repte_weight,
    dimension_count: dimensions.length,
    dimension_weight_sum: validation.dimension_weight_sum,
    assessment_criteria: Array.isArray(challenge?.assessment_criteria) ? challenge.assessment_criteria : dimensions,
    validation,
    files: {
      challenge: path.relative(rootDir, challengePath),
      rubric: path.relative(rootDir, rubricPath),
      prompt: path.relative(rootDir, promptPath)
    },
    challenge,
    rubric,
    prompt
  };
}

async function readMicroreptes() {
  const microreptesDir = path.join(rootDir, 'microreptes');
  const entries = await readdir(microreptesDir, { withFileTypes: true });
  const microreptes = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const item = await readMicrorepteDir(entry.name);
      if (!item.challenge?.deprecated) microreptes.push(item);
    }
  }

  microreptes.sort((left, right) => {
    const leftKey = [left.repte_id, left.session_code, left.microrepte_code, left.id].join('\u0000');
    const rightKey = [right.repte_id, right.session_code, right.microrepte_code, right.id].join('\u0000');
    return leftKey.localeCompare(rightKey);
  });

  return microreptes;
}

async function readMicrorepteDetail(challengeId) {
  const microreptes = await readMicroreptes();
  return microreptes.find((microrepte) => microrepte.id === challengeId || microrepte.dir === challengeId) || null;
}

function extractFirstMarkdownHeading(markdown) {
  const match = String(markdown || '').match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function extractSessionCode(value) {
  const match = String(value || '').match(/\b(R\d+S(?:\d+[A-Z]?|X))\b/i);
  return match ? match[1].toUpperCase() : '';
}

function extractRepteId(value) {
  const match = String(value || '').match(/\b(R\d+)(?:S(?:\d+[A-Z]?|X))?\b/i);
  return match ? match[1].toUpperCase() : '';
}

function extractInlineField(markdown, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^- \\*\\*${escapedLabel}\\*\\*:\\s*(.+)$`, 'mi');
  const match = String(markdown || '').match(regex);
  return match ? match[1].replaceAll('`', '').trim() : '';
}

function extractSessionDuration(markdown) {
  return extractInlineField(markdown, 'Duració orientativa') ||
    extractInlineField(markdown, 'Duracio orientativa') ||
    extractInlineField(markdown, 'Durada orientativa') ||
    '3 hores';
}

function classroomProgrammingSourceDir() {
  if (existsSync(localClassroomProgrammingDir)) {
    return localClassroomProgrammingDir;
  }

  return externalClassroomProgrammingDir;
}

function resolveClassroomProgrammingPath(relativeFile) {
  const absolutePath = path.resolve(rootDir, relativeFile);
  const allowedDirs = [localClassroomProgrammingDir, externalClassroomProgrammingDir];
  if (!allowedDirs.some((dir) => absolutePath.startsWith(dir + path.sep))) {
    throw new Error('Ruta de programació d’aula no permesa.');
  }
  return absolutePath;
}

async function readClassroomProgramming() {
  const classroomProgrammingDir = classroomProgrammingSourceDir();
  if (!existsSync(classroomProgrammingDir)) {
    return [];
  }

  const entries = await readdir(classroomProgrammingDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && /^programacio_aula_r\d+s(?:\d+[a-z]?|x)_.*\.md$/i.test(entry.name))
    .map((entry) => entry.name);

  const sessions = [];
  for (const fileName of files) {
    const absolutePath = path.join(classroomProgrammingDir, fileName);
    const markdown = await readFile(absolutePath, 'utf8');
    const title = extractFirstMarkdownHeading(markdown) || fileName.replace(/\.md$/, '');
    const sessionCode = extractSessionCode(title) || extractSessionCode(fileName);
    const repteId = extractRepteId(sessionCode) || extractRepteId(title);

    sessions.push({
      id: sessionCode || fileName.replace(/\.md$/, ''),
      repte_id: repteId,
      session_code: sessionCode,
      title,
      microrepte: extractInlineField(markdown, 'Microrepte'),
      duration: extractSessionDuration(markdown),
      focus: extractInlineField(markdown, 'Focus'),
      documentation_url: 'https://igomis.github.io/reestructuracioModul/01_programacio_modul/' + fileName.replace(/\.md$/, '/'),
      markdown_url: 'https://igomis.github.io/reestructuracioModul/01_programacio_modul/' + fileName,
      file: path.relative(rootDir, absolutePath),
      source: classroomProgrammingDir === localClassroomProgrammingDir ? 'snapshot' : 'external',
      markdown
    });
  }

  sessions.sort((left, right) => {
    const leftKey = [left.repte_id, left.session_code, left.title].join('\u0000');
    const rightKey = [right.repte_id, right.session_code, right.title].join('\u0000');
    return leftKey.localeCompare(rightKey, 'ca', { numeric: true, sensitivity: 'base' });
  });

  return sessions;
}

async function readClassroomSession(sessionId) {
  const sessions = await readClassroomProgramming();
  return sessions.find((session) => session.id === sessionId || session.session_code === sessionId) || null;
}

async function updateClassroomSessionMarkdown(sessionId, markdown) {
  const session = await readClassroomSession(sessionId);
  if (!session) {
    throw new Error('Sessió de programació no trobada.');
  }

  const normalizedMarkdown = String(markdown || '').trimEnd() + '\n';
  await writeFile(resolveClassroomProgrammingPath(session.file), normalizedMarkdown, 'utf8');
  return readClassroomSession(sessionId);
}

function normalizeTextList(value, fieldName) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }

  throw new Error(`${fieldName} ha de ser una llista o text amb una entrada per línia.`);
}

function normalizeRepteWeight(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 1) {
    throw new Error('El pes dins del repte ha de ser un número entre 0 i 1.');
  }

  return numberValue;
}

function normalizeRubricDimensions(dimensions) {
  if (!Array.isArray(dimensions) || dimensions.length === 0) {
    throw new Error('La rúbrica ha de tindre almenys una dimensió.');
  }

  const normalized = dimensions.map((dimension) => {
    const id = String(dimension.id || '').trim();
    const label = String(dimension.label || '').trim();
    const weight = Number(dimension.weight);
    const mustCheck = String(dimension.must_check || '').trim();

    if (!id) {
      throw new Error('Cada dimensió ha de tindre id.');
    }

    if (!label) {
      throw new Error(`La dimensió ${id} ha de tindre etiqueta.`);
    }

    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
      throw new Error(`El pes de la dimensió ${id} ha de ser un número entre 0 i 1.`);
    }

    if (!mustCheck) {
      throw new Error(`La dimensió ${id} ha de tindre criteri must_check.`);
    }

    return {
      ...dimension,
      id,
      label,
      weight,
      must_check: mustCheck
    };
  });

  const weightSum = normalized.reduce((sum, dimension) => sum + dimension.weight, 0);
  if (Math.abs(weightSum - 1) > 0.001) {
    throw new Error(`Els pesos de la rúbrica han de sumar 1. Ara sumen ${weightSum.toFixed(3)}.`);
  }

  return normalized;
}

function updateSourceAlignmentWeight(sourceAlignment, repteWeight) {
  const text = `Pes orientatiu dins del repte: ${Math.round(repteWeight * 1000) / 10}%`;
  const alignment = Array.isArray(sourceAlignment) ? [...sourceAlignment] : [];
  const index = alignment.findIndex((item) => /pes[^0-9]*\d+(?:[.,]\d+)?\s*%/i.test(String(item)));

  if (index >= 0) {
    alignment[index] = text;
  } else {
    alignment.push(text);
  }

  return alignment;
}

function buildUpdatedMicrorepte(current, body) {
  const challenge = { ...current.challenge };
  const rubric = { ...current.rubric };
  const repteWeight = normalizeRepteWeight(body.repte_weight);

  challenge.title = String(body.title || '').trim();
  challenge.summary = String(body.summary || '').trim();
  challenge.pedagogical_goal = String(body.pedagogical_goal || '').trim();
  challenge.recommended_test_strategy = String(body.recommended_test_strategy || '').trim();
  challenge.repte_weight = repteWeight;
  challenge.required_evidence = normalizeTextList(body.required_evidence, 'Evidències requerides');
  challenge.expected_signals = normalizeTextList(body.expected_signals, 'Senyals esperats');
  challenge.source_alignment = updateSourceAlignmentWeight(
    normalizeTextList(body.source_alignment, 'Alineació d’origen'),
    repteWeight
  );

  if (!challenge.title || !challenge.summary || !challenge.pedagogical_goal) {
    throw new Error('Títol, resum i objectiu pedagògic són obligatoris.');
  }

  rubric.dimensions = normalizeRubricDimensions(body.dimensions);
  rubric.hard_rules = normalizeTextList(body.hard_rules, 'Regles dures');

  if (challenge.challenge_id !== rubric.challenge_id) {
    throw new Error('challenge_id no coincideix entre challenge.json i rubric.json.');
  }

  return { challenge, rubric };
}

async function validateRepositoryConfig() {
  try {
    await execFileAsync('npm', ['run', 'validate'], { cwd: rootDir });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: [error.stdout, error.stderr, error.message].filter(Boolean).join('\n').trim()
    };
  }
}

async function updateMicrorepte(challengeId, body) {
  const current = await readMicrorepteDetail(challengeId);

  if (!current || !current.challenge || !current.rubric) {
    throw new Error('Microrepte no trobat o incomplet.');
  }

  const challengePath = path.join(rootDir, current.files.challenge);
  const rubricPath = path.join(rootDir, current.files.rubric);
  const originalChallenge = await readFile(challengePath, 'utf8');
  const originalRubric = await readFile(rubricPath, 'utf8');
  const updated = buildUpdatedMicrorepte(current, body);

  await writeFile(challengePath, `${JSON.stringify(updated.challenge, null, 2)}\n`, 'utf8');
  await writeFile(rubricPath, `${JSON.stringify(updated.rubric, null, 2)}\n`, 'utf8');

  const validation = await validateRepositoryConfig();
  if (!validation.ok) {
    await writeFile(challengePath, originalChallenge, 'utf8');
    await writeFile(rubricPath, originalRubric, 'utf8');
    throw new Error(`La validació ha fallat i s'han restaurat els fitxers originals.\n${validation.message}`);
  }

  return readMicrorepteDetail(challengeId);
}

function resolveHistoryPath(historyDir, fileName) {
  if (!historyDir) {
    return null;
  }

  const fullPath = path.resolve(rootDir, historyDir, fileName);
  const allowedRoot = path.resolve(rootDir, 'grades', 'history');

  if (!fullPath.startsWith(`${allowedRoot}${path.sep}`)) {
    throw new Error('Ruta de resultat no permesa.');
  }

  return fullPath;
}

async function readGradeDetail(gradeId) {
  const grade = getGradeById(gradeId);

  if (!grade) {
    return null;
  }

  const resultPath = resolveHistoryPath(grade.history_dir, 'autograde-result.json');
  const markdownPath = resolveHistoryPath(grade.history_dir, 'autograde-result.md');
  const payloadPath = resolveHistoryPath(grade.history_dir, 'evaluation-payload.json');
  const resultRaw = resultPath ? await readTextIfExists(resultPath) : null;
  const markdown = markdownPath ? await readTextIfExists(markdownPath) : null;
  const evaluationPayloadRaw = payloadPath ? await readTextIfExists(payloadPath) : null;

  return {
    grade,
    result: resultRaw ? JSON.parse(resultRaw) : null,
    markdown,
    evaluation_payload: evaluationPayloadRaw ? JSON.parse(evaluationPayloadRaw) : null,
    files: {
      result: resultRaw ? path.relative(rootDir, resultPath) : null,
      markdown: markdown ? path.relative(rootDir, markdownPath) : null,
      evaluation_payload: evaluationPayloadRaw ? path.relative(rootDir, payloadPath) : null
    }
  };
}

async function parseRepositoryFile(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  if (!existsSync(fullPath)) {
    return [];
  }

  const content = await readFile(fullPath, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const [repo, group = '', ...nameParts] = line.split(/\s+/);
      return { repo, group, name: nameParts.join(' ') };
    });
}

function validateStudentPayload(body) {
  const repo = String(body.repo || '').trim();
  const groupName = String(body.group_name || body.group || '').trim();
  const studentName = String(body.student_name || body.name || '').trim();

  if (!repo) {
    throw new Error('El repositori és obligatori.');
  }

  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error('El repositori ha de tindre format owner/repo.');
  }

  if (!groupName) {
    throw new Error('El grup és obligatori.');
  }

  if (!Object.hasOwn(groupFiles, groupName) || groupName === 'all') {
    throw new Error(`Grup no valid: ${groupName}`);
  }

  return {
    repo,
    group_name: groupName,
    student_name: studentName || null
  };
}

async function importStudentsFromCourseFiles() {
  const repositories = await parseRepositoryFile(groupFiles.all);

  for (const student of repositories) {
    upsertStudent(student.repo, student.group, student.name || null);
  }

  return getStudents();
}

function buildRepositoryFileContent(students, title) {
  const lines = [
    `# ${title}`,
    '# Format: repositori grup',
    ''
  ];

  for (const student of students) {
    lines.push(`${student.repo} ${student.group_name}`);
  }

  return `${lines.join('\n')}\n`;
}

async function syncStudentRepositoryFiles() {
  const students = getStudents();
  const byGroup = new Map();

  for (const student of students) {
    if (!student.group_name) {
      continue;
    }

    if (!byGroup.has(student.group_name)) {
      byGroup.set(student.group_name, []);
    }

    byGroup.get(student.group_name).push(student);
  }

  await writeFile(
    path.join(rootDir, groupFiles.all),
    buildRepositoryFileContent(students, 'Repositoris de tots els grups per a correccio massiva.'),
    'utf8'
  );

  for (const [group, file] of Object.entries(groupFiles)) {
    if (group === 'all') {
      continue;
    }

    await writeFile(
      path.join(rootDir, file),
      buildRepositoryFileContent(byGroup.get(group) || [], `Repositoris d'alumnes de ${group} per a correccio massiva.`),
      'utf8'
    );
  }

  return {
    students: students.length,
    files: Object.values(groupFiles)
  };
}

async function createStudentReposFromCsv(body) {
  const csv = String(body.csv || '').trim();
  const org = String(body.org || '').trim();
  const template = String(body.template || '').trim();
  const repoPrefix = String(body.repo_prefix || 'microreptes-').trim();
  const defaultGroup = String(body.default_group || '').trim();
  const permission = String(body.permission || 'push').trim();
  const dryRun = body.dry_run !== false;
  const noInvite = Boolean(body.no_invite);

  if (!csv) {
    throw new Error("Cal pujar o enganxar un CSV d'alumnes.");
  }

  if (!/^[\w.-]+$/.test(org)) {
    throw new Error("L'organització ha de ser un nom GitHub valid.");
  }

  if (!/^[\w.-]+\/[\w.-]+$/.test(template)) {
    throw new Error('La plantilla ha de tindre format owner/repo.');
  }

  if (!['pull', 'push', 'maintain', 'admin'].includes(permission)) {
    throw new Error('Permís no valid. Usa pull, push, maintain o admin.');
  }

  await mkdir(path.join(rootDir, 'tmp'), { recursive: true });
  await writeFile(path.join(rootDir, 'tmp', 'create-student-repos-dashboard.csv'), `${csv}\n`, 'utf8');

  const args = [
    'scripts/create-student-repos.mjs',
    '--input',
    path.join(rootDir, 'tmp', 'create-student-repos-dashboard.csv'),
    '--org',
    org,
    '--template',
    template,
    '--repo-prefix',
    repoPrefix,
    '--permission',
    permission
  ];

  if (defaultGroup) {
    args.push('--default-group', defaultGroup);
  }
  if (dryRun) {
    args.push('--dry-run');
  }
  if (noInvite) {
    args.push('--no-invite');
  }

  const result = await execFileAsync(process.execPath, args, {
    cwd: rootDir,
    maxBuffer: 1024 * 1024 * 10
  });

  const students = dryRun ? [] : await importStudentsFromCourseFiles();

  return {
    dry_run: dryRun,
    stdout: result.stdout,
    stderr: result.stderr,
    students
  };
}

async function deleteGithubRepository(repo) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error('El repositori GitHub no té format owner/repo.');
  }

  const ghBin = process.env.GH_BIN || 'gh';
  let result;
  try {
    result = await execFileAsync(ghBin, ['repo', 'delete', repo, '--yes'], {
      cwd: rootDir,
      env: githubCliEnv(),
      maxBuffer: 1024 * 1024 * 10
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`No s'ha trobat GitHub CLI (${ghBin}). Instal·la gh al servidor o configura GH_BIN=/ruta/al/gh en .env.`);
    }
    const details = formatCommandError(error);
    throw new Error(`No s'ha pogut esborrar "${repo}". Revisa que GH_TOKEN o l'usuari autenticat amb gh tinga administració sobre el repositori i permís per eliminar repositoris en l'organització.${details ? `\n${details}` : ''}`);
  }

  return {
    repo,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

async function readRequestJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function resolveWorkflowInputs(body) {
  const targetGroup = body.target_group || 'all';
  let repositories = String(body.repositories || '').trim();
  const repositoriesFile = body.repositories_file || '';
  const challengeId = String(body.challenge_id || '').trim();
  const mode = body.mode || 'mock';
  const studentRef = body.student_ref || 'main';
  const publishToStudentRepo = String(body.publish_to_student_repo ?? false);
  const defaultGroup = body.group || (targetGroup === 'all' ? '2DAW-A' : targetGroup);

  if (!Object.hasOwn(groupFiles, targetGroup)) {
    throw new Error(`target_group no valid: ${targetGroup}`);
  }

  if (!['mock', 'openai'].includes(mode)) {
    throw new Error(`mode no valid: ${mode}`);
  }

  if (!repositories && !repositoriesFile) {
    repositories = getStudents()
      .filter((student) => targetGroup === 'all' || student.group_name === targetGroup)
      .map((student) => `${student.repo} ${student.group_name || defaultGroup}`)
      .join('\n');
    if (!repositories) {
      throw new Error('No hi ha alumnes registrats per al grup seleccionat.');
    }
  }

  return {
    repositories,
    target_group: targetGroup,
    repositories_file: repositoriesFile,
    challenge_id: challengeId,
    group: defaultGroup,
    mode,
    student_ref: studentRef,
    publish_to_student_repo: publishToStudentRepo
  };
}

async function dispatchWorkflow(inputs, selectedWorkflowFile = correctionWorkflowFile) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'igomis';
  const repo = process.env.GITHUB_REPO || 'dwes-microreptes-autocorreccio';
  const ref = process.env.GITHUB_REF || 'main';
  const dispatchedAt = new Date().toISOString();

  if (!token) {
    throw new Error('Falta GITHUB_TOKEN en .env o en l_entorn del dashboard. Este token ha de poder llançar workflows en el repositori docent.');
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${selectedWorkflowFile}/dispatches`;
  const githubResponse = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28'
    },
    body: JSON.stringify({ ref, inputs })
  });

  if (!githubResponse.ok) {
    const errorText = await githubResponse.text();
    throw new Error(`GitHub ha retornat ${githubResponse.status}: ${errorText}`);
  }

  const run = await findDispatchedWorkflowRun({ token, owner, repo, ref, dispatchedAt, selectedWorkflowFile });

  return {
    actions_url: `https://github.com/${owner}/${repo}/actions/workflows/${selectedWorkflowFile}`,
    run_url: run?.html_url || '',
    run_status: run?.status || '',
    owner,
    repo,
    ref
  };
}

async function findDispatchedWorkflowRun({ token, owner, repo, ref, dispatchedAt, selectedWorkflowFile }) {
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${selectedWorkflowFile}/runs`);
  url.searchParams.set('branch', ref);
  url.searchParams.set('event', 'workflow_dispatch');
  url.searchParams.set('per_page', '5');

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'x-github-api-version': '2022-11-28'
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const run = (payload.workflow_runs || []).find((item) => (
      new Date(item.created_at).getTime() >= new Date(dispatchedAt).getTime() - 10000
    ));

    if (run) {
      return run;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  return null;
}

async function buildConfigPayload() {
  const activeChallenges = await readJson('course/active-challenges.json');
  const repositoriesByTarget = {};
  const students = getStudents();

  for (const [target, file] of Object.entries(groupFiles)) {
    repositoriesByTarget[target] = {
      file,
      repositories: students
        .filter((student) => target === 'all' || student.group_name === target)
        .map((student) => ({ repo: student.repo, group: student.group_name, name: student.student_name || '' }))
    };
  }

  return {
    active_challenges: activeChallenges,
    group_files: groupFiles,
    repositories_by_target: repositoriesByTarget,
    docs: dashboardDocLinks(),
    github: {
      owner: process.env.GITHUB_OWNER || 'igomis',
      repo: process.env.GITHUB_REPO || 'dwes-microreptes-autocorreccio',
      ref: process.env.GITHUB_REF || 'main',
      classroom_org: envText('GITHUB_CLASSROOM_ORG'),
      student_template: envText('GITHUB_STUDENT_TEMPLATE'),
      token_configured: Boolean(process.env.GITHUB_TOKEN)
    }
  };
}

async function readLatestGrades(filters = {}, limit = 200) {
  return getLatestGrades(limit, filters);
}

async function importLatestGradeArtifact() {
  const env = { ...process.env };
  if (!env.GH_TOKEN && env.GITHUB_TOKEN) {
    env.GH_TOKEN = env.GITHUB_TOKEN;
  }

  const result = await execFileAsync('npm', [
    'run',
    'grades:download-latest',
    '--',
    '--include-failed'
  ], {
    cwd: rootDir,
    env,
    maxBuffer: 1024 * 1024 * 20
  });

  return {
    stdout: result.stdout,
    stderr: result.stderr
  };
}

async function buildClassFollowupReport(body) {
  const group = String(body.group || '').trim();
  const challengeId = String(body.challenge_id || '').trim();

  if (!group || group === 'all') {
    throw new Error('Cal seleccionar un grup concret per generar l_informe posterior.');
  }

  if (!challengeId) {
    throw new Error('Cal seleccionar un microrepte concret per generar l_informe posterior.');
  }

  const result = await execFileAsync(process.execPath, [
    'scripts/build-class-followup-report.mjs',
    '--group',
    group,
    '--challenge-id',
    challengeId
  ], {
    cwd: rootDir,
    maxBuffer: 1024 * 1024 * 10
  });
  const safeGroup = group.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const reportRelativePath = path.join('grades', 'reports', `${challengeId}-${safeGroup}.md`);
  const reportPath = path.join(rootDir, reportRelativePath);
  const markdown = await readFile(reportPath, 'utf8');

  return {
    group,
    challenge_id: challengeId,
    report_path: reportRelativePath,
    markdown,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function parseRaScores(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function scoreEntriesForGrade(grade, microrepte) {
  const raScores = parseRaScores(grade.ra_scores)
    .filter((item) => item?.ra_id && typeof item.score === 'number');

  if (raScores.length > 0) {
    return raScores.map((item) => ({
      ra_id: String(item.ra_id).toUpperCase(),
      score: item.score,
      assessed_ca: Array.isArray(item.assessed_ca) ? item.assessed_ca : []
    }));
  }

  const primaryRa = microrepte?.challenge?.primary_ra;
  if (!primaryRa) {
    return [];
  }

  return [{
    ra_id: primaryRa,
    score: Number(grade.score || 0),
    assessed_ca: Array.isArray(microrepte?.challenge?.assessed_ca) ? microrepte.challenge.assessed_ca : []
  }];
}

async function readRaGrades(filters = {}) {
  const [grades, microreptes] = await Promise.all([
    readLatestGrades(filters, -1),
    readMicroreptes()
  ]);
  const challengeMap = new Map(microreptes.map((microrepte) => [microrepte.id, microrepte]));
  const latestByRepoChallenge = new Map();

  for (const grade of grades) {
    const key = `${grade.repo || ''}\u0000${grade.challenge_id || ''}`;
    if (!latestByRepoChallenge.has(key)) {
      latestByRepoChallenge.set(key, grade);
    }
  }

  const groups = new Map();
  for (const grade of latestByRepoChallenge.values()) {
    const microrepte = challengeMap.get(grade.challenge_id);
    if (!microrepte) {
      continue;
    }

    const scoreEntries = scoreEntriesForGrade(grade, microrepte);

    if (scoreEntries.length === 0) {
      continue;
    }

    const weight = Number.isFinite(microrepte.repte_weight) && microrepte.repte_weight > 0
      ? microrepte.repte_weight
      : 1;

    for (const scoreEntry of scoreEntries) {
      const groupKey = [
        grade.repo || '',
        grade.group_name || '',
        microrepte.repte_id || '',
        scoreEntry.ra_id
      ].join('\u0000');

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          repo: grade.repo || '',
          group_name: grade.group_name || '',
          repte_id: microrepte.repte_id || '',
          primary_ra: scoreEntry.ra_id,
          weighted_score: 0,
          weight_sum: 0,
          microreptes: []
        });
      }

      const group = groups.get(groupKey);
      group.weighted_score += Number(scoreEntry.score || 0) * weight;
      group.weight_sum += weight;
      group.microreptes.push({
        challenge_id: grade.challenge_id,
        microrepte_code: microrepte.microrepte_code,
        score: scoreEntry.score,
        assessed_ca: scoreEntry.assessed_ca,
        weight
      });
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      score: group.weight_sum > 0 ? Number((group.weighted_score / group.weight_sum).toFixed(2)) : null,
      weight_sum: Number(group.weight_sum.toFixed(3))
    }))
    .sort((left, right) => [left.group_name, left.repo, left.repte_id, left.primary_ra].join('\u0000')
      .localeCompare([right.group_name, right.repo, right.repte_id, right.primary_ra].join('\u0000'), 'ca', { numeric: true }));
}

function normalizeTeacherRepteGrades(records) {
  const teacherGrades = new Map();
  for (const record of Array.isArray(records) ? records : []) {
    if (!record.repo || !record.repte_id) {
      continue;
    }

    teacherGrades.set(`${record.repo}\u0000${record.repte_id}`, {
      extension_review: record.extension_review || null,
      teacher_score: typeof record.teacher_score === 'number' ? record.teacher_score : null,
      teacher_comment: record.teacher_comment || '',
      teacher_review_required: Boolean(record.teacher_review_required),
      teacher_source: record.source || 'teacher'
    });
  }
  return teacherGrades;
}

async function readTeacherRepteGrades() {
  const records = await readTeacherRepteGradeRecords();
  return normalizeTeacherRepteGrades(records);
}

async function readTeacherRepteGradeRecords() {
  const filePath = path.join(rootDir, 'grades', 'teacher-repte-grades.json');
  const records = await readJsonIfExists(filePath);
  return Array.isArray(records) ? records : [];
}

async function removeStudentAggregateResults(repo) {
  const latestGrades = await readGrades(rootDir);
  const nextGrades = latestGrades.filter((grade) => (grade.repo || grade.student || '') !== repo);
  await writeGrades(nextGrades, rootDir);

  const teacherGradesPath = path.join(rootDir, 'grades', 'teacher-repte-grades.json');
  const teacherGrades = await readJsonIfExists(teacherGradesPath);
  let deletedTeacherGrades = 0;

  if (Array.isArray(teacherGrades)) {
    const nextTeacherGrades = teacherGrades.filter((grade) => grade.repo !== repo);
    deletedTeacherGrades = teacherGrades.length - nextTeacherGrades.length;
    await writeFile(teacherGradesPath, `${JSON.stringify(nextTeacherGrades, null, 2)}\n`, 'utf8');
  }

  const aggregateArgs = ['scripts/aggregate-repte-grades.mjs'];
  if (existsSync(teacherGradesPath)) {
    aggregateArgs.push('--teacher-input', teacherGradesPath);
  }
  await execFileAsync(process.execPath, aggregateArgs, { cwd: rootDir });

  return {
    deleted_latest_grades: latestGrades.length - nextGrades.length,
    deleted_teacher_repte_grades: deletedTeacherGrades
  };
}

function sameGradeRecord(fileGrade, deletedGrade) {
  const repo = fileGrade.repo || fileGrade.student || '';
  const commit = fileGrade.commit || fileGrade.commit_hash || '';

  return repo === deletedGrade.repo
    && fileGrade.challenge_id === deletedGrade.challenge_id
    && commit === (deletedGrade.commit_hash || '')
    && (fileGrade.source || '') === (deletedGrade.source || '')
    && (fileGrade.timestamp || '') === (deletedGrade.timestamp || '');
}

async function regenerateRepteGradeFiles() {
  const teacherGradesPath = path.join(rootDir, 'grades', 'teacher-repte-grades.json');
  const aggregateArgs = ['scripts/aggregate-repte-grades.mjs'];
  if (existsSync(teacherGradesPath)) {
    aggregateArgs.push('--teacher-input', teacherGradesPath);
  }
  await execFileAsync(process.execPath, aggregateArgs, { cwd: rootDir });
}

async function removeGradeAggregateResult(grade) {
  const latestGrades = await readGrades(rootDir);
  const nextGrades = latestGrades.filter((fileGrade) => !sameGradeRecord(fileGrade, grade));

  if (nextGrades.length !== latestGrades.length) {
    await writeGrades(nextGrades, rootDir);
  }

  await regenerateRepteGradeFiles();

  return {
    deleted_latest_grades: latestGrades.length - nextGrades.length
  };
}

async function deleteGradeAndAggregateResult(gradeId) {
  const result = deleteGrade(gradeId);
  if (!result.grade) {
    return result;
  }

  const aggregateCleanup = await removeGradeAggregateResult(result.grade);

  return {
    ...result,
    ...aggregateCleanup
  };
}

async function deleteStudentAndAssociatedResults(studentId, options = {}) {
  const result = deleteStudent(studentId);
  if (!result.student) {
    return result;
  }

  const aggregateCleanup = await removeStudentAggregateResults(result.student.repo);
  const syncResult = await syncStudentRepositoryFiles();
  let github = null;

  if (options.deleteGithubRepo) {
    try {
      github = {
        deleted: true,
        ...(await deleteGithubRepository(result.student.repo))
      };
    } catch (error) {
      github = {
        deleted: false,
        repo: result.student.repo,
        error: error.message
      };
    }
  }

  return {
    ...result,
    ...aggregateCleanup,
    synced_course_files: syncResult.files,
    github
  };
}

async function saveTeacherRepteGrade(body) {
  const repo = String(body.repo || '').trim();
  const group = String(body.group_name || body.group || '').trim();
  const repteId = String(body.repte_id || '').trim();
  const rawScore = body.teacher_score;
  const teacherScore = rawScore === null || rawScore === undefined || rawScore === ''
    ? null
    : Number(rawScore);

  if (!repo || !repteId) {
    throw new Error('Falten repo o repte_id.');
  }

  if (teacherScore !== null && (!Number.isFinite(teacherScore) || teacherScore < 0 || teacherScore > 10)) {
    throw new Error('La nota docent ha de ser un número entre 0 i 10.');
  }

  const records = await readTeacherRepteGradeRecords();
  const index = records.findIndex((record) => record.repo === repo && record.repte_id === repteId);
  const previous = index >= 0 ? records[index] : {};
  let extensionReview = previous.extension_review || null;
  const history = previous.extension_review_history || [];
  if (body.extension_review) {
    const grades = (await readLatestGrades({}, -1)).filter(g => g.repo === repo);
    const metadata = await readChallengeMetadata(rootDir);
    const calculation = calculateRepteExtension(grades, metadata, repteId, extensionReview);
    extensionReview = makeExtensionReview(body.extension_review, calculation);
    history.push(extensionReview);
  }
  const nextRecord = {
    ...previous,
    extension_review: extensionReview,
    extension_review_history: history,
    repo,
    group,
    repte_id: repteId,
    teacher_score: teacherScore,
    teacher_comment: String(body.teacher_comment || '').trim(),
    teacher_review_required: Boolean(body.teacher_review_required),
    source: 'dashboard'
  };

  if (index >= 0) {
    records[index] = nextRecord;
  } else {
    records.push(nextRecord);
  }

  records.sort((left, right) => [left.group || '', left.repo || '', left.repte_id || ''].join('\u0000')
    .localeCompare([right.group || '', right.repo || '', right.repte_id || ''].join('\u0000'), 'ca', { numeric: true }));

  await writeFile(path.join(rootDir, 'grades', 'teacher-repte-grades.json'), `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  return nextRecord;
}

async function repteIdForChallenge(challengeId) {
  if (!challengeId) {
    return '';
  }

  const microrepte = await readMicrorepteDetail(challengeId);
  return microrepte?.repte_id || '';
}

async function readRepteGrades(filters = {}) {
  const repteId = await repteIdForChallenge(filters.challenge_id);
  const raFilters = { ...filters };
  delete raFilters.challenge_id;

  const [raGrades, teacherGrades, allGrades, metadata] = await Promise.all([
    readRaGrades(raFilters), readTeacherRepteGrades(), readLatestGrades({}, -1), readChallengeMetadata(rootDir)
  ]);
  const groups = new Map();

  for (const raGrade of raGrades) {
    if (repteId && raGrade.repte_id !== repteId) {
      continue;
    }

    const key = `${raGrade.repo || ''}\u0000${raGrade.group_name || ''}\u0000${raGrade.repte_id || ''}`;
    if (!groups.has(key)) {
      groups.set(key, {
        repo: raGrade.repo || '',
        group_name: raGrade.group_name || '',
        repte_id: raGrade.repte_id || '',
        ra_scores: [],
        teacher_score: null,
        teacher_comment: '',
        teacher_review_required: false,
        teacher_source: ''
      });
    }

    groups.get(key).ra_scores.push({
      ra_id: raGrade.primary_ra,
      auto_score: raGrade.score,
      weight_sum: raGrade.weight_sum,
      microreptes: raGrade.microreptes
    });
  }

  return [...groups.values()]
    .map((record) => {
      const teacherData = teacherGrades.get(`${record.repo}\u0000${record.repte_id}`);
      if (teacherData) {
        record.teacher_score = teacherData.teacher_score;
        record.teacher_comment = teacherData.teacher_comment;
        record.teacher_review_required = teacherData.teacher_review_required;
        record.teacher_source = teacherData.teacher_source;
      }
      record.extension = calculateRepteExtension(allGrades.filter(g => g.repo === record.repo), metadata, record.repte_id, teacherData?.extension_review);
      record.can_review_extension = Boolean(record.extension) && (!filters.challenge_id || filters.challenge_id === record.extension.source_challenge_id);
      record.ra_scores.sort((left, right) => String(left.ra_id).localeCompare(String(right.ra_id), 'ca', { numeric: true }));
      return record;
    })
    .sort((left, right) => [left.group_name, left.repo, left.repte_id].join('\u0000')
      .localeCompare([right.group_name, right.repo, right.repte_id].join('\u0000'), 'ca', { numeric: true }));
}

function pageHtml() {
  const docs = dashboardDocLinks();
  const alumnatNavLink = docs.alumnat_url
    ? '<a class="nav-button nav-link" href="' + escapeHtmlServer(docs.alumnat_url) + '" target="_blank" rel="noreferrer">Doc alumnat</a>'
    : '';
  const professoratProgramacioLink = docs.professorat_url
    ? '<a class="secondary nav-link" href="' + escapeHtmlServer(docs.professorat_url) + '" target="_blank" rel="noreferrer">Documentació professorat</a>'
    : '';

  return `<!doctype html>
<html lang="ca">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DWES Autocorrecció</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f9;
      --panel: #ffffff;
      --text: #18202a;
      --muted: #657282;
      --border: #d7dde5;
      --accent: #0f766e;
      --accent-dark: #0b5d56;
      --danger: #b42318;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.4;
    }
    header {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      padding: 18px 28px;
    }
    .topbar {
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    h1 { font-size: 22px; margin: 0; }
    nav {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .nav-button {
      background: #eef2f6;
      color: #253244;
    }
    .nav-link {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      border-radius: 6px;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .nav-button:hover,
    .nav-button.active {
      background: var(--accent);
      color: #fff;
    }
    main {
      max-width: 1180px;
      margin: 0 auto;
      padding: 24px;
      display: grid;
      gap: 18px;
    }
    section {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 18px;
    }
    h2 {
      font-size: 17px;
      margin: 0 0 14px;
    }
    .grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    label {
      display: grid;
      gap: 6px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
    }
    select, input, textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 9px 10px;
      font: inherit;
      color: var(--text);
      background: #fff;
    }
    input[type="checkbox"] {
      width: auto;
      margin-right: 6px;
    }
    textarea {
      min-height: 110px;
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
    }
    button {
      border: 0;
      border-radius: 6px;
      padding: 10px 14px;
      background: var(--accent);
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }
    button:hover { background: var(--accent-dark); }
    button:disabled { opacity: .6; cursor: wait; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      text-align: left;
      border-bottom: 1px solid var(--border);
      padding: 9px 8px;
      vertical-align: top;
    }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; }
    .actions {
      display: flex;
      align-items: end;
      gap: 10px;
    }
    .secondary {
      background: #e7eef5;
      color: #253244;
    }
    .secondary:hover { background: #d8e2ec; }
    .status {
      color: var(--muted);
      font-size: 14px;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .error { color: var(--danger); }
    .ok { color: var(--accent-dark); }
    .filters {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-bottom: 14px;
      align-items: end;
    }
    .filters button {
      grid-column: 3;
    }
    table tbody tr:hover {
      background: #f9fafb;
    }
    tr.review-required {
      background: #fff3cd;
    }
    .score-low { color: #b42318; font-weight: 600; }
    .score-medium { color: #f97316; font-weight: 600; }
    .score-high { color: #22c55e; font-weight: 600; }
    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 3px 8px;
      font-size: 12px;
      font-weight: 700;
      background: #e7eef5;
      color: #253244;
    }
    .badge.ok {
      background: #dcfce7;
      color: #166534;
    }
    .badge.warning {
      background: #fef3c7;
      color: #92400e;
    }
    .viewer {
      display: grid;
      gap: 16px;
    }
    .viewer-empty {
      color: var(--muted);
      border: 1px dashed var(--border);
      border-radius: 8px;
      padding: 18px;
      text-align: center;
    }
    .result-header {
      display: grid;
      gap: 10px;
      grid-template-columns: 1.4fr repeat(3, minmax(120px, .5fr));
      align-items: stretch;
    }
    .metric {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      background: #fbfcfd;
    }
    .metric span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .metric strong {
      display: block;
      margin-top: 4px;
      font-size: 18px;
    }
    .feedback-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }
    .feedback-box {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
    }
    .feedback-box h3 {
      margin: 0 0 10px;
      font-size: 15px;
    }
    .feedback-box ul {
      margin: 0;
      padding-left: 18px;
    }
    .markdown-preview {
      white-space: pre-wrap;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #fbfcfd;
      padding: 14px;
      font-size: 14px;
      overflow: auto;
      max-height: 360px;
    }
    .markdown-rendered {
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #fff;
      padding: 14px;
      font-size: 14px;
      line-height: 1.55;
      max-height: 720px;
      overflow: auto;
    }
    .markdown-rendered h2,
    .markdown-rendered h3,
    .markdown-rendered h4,
    .markdown-rendered h5 {
      margin-top: 18px;
      margin-bottom: 8px;
    }
    .markdown-rendered p {
      margin: 8px 0;
    }
    .json-preview {
      white-space: pre-wrap;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #0f172a;
      color: #e5e7eb;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
      overflow: auto;
      max-height: 360px;
    }
    .file-note {
      color: var(--muted);
      font-size: 13px;
      overflow-wrap: anywhere;
    }
    .hidden { display: none; }
    .compact-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    @media (max-width: 820px) {
      .topbar { align-items: flex-start; flex-direction: column; }
      main { padding: 14px; }
      .grid { grid-template-columns: 1fr; }
      .filters { grid-template-columns: 1fr; }
      .filters button { grid-column: auto; }
      .result-header, .feedback-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="topbar">
      <h1>DWES Autocorrecció</h1>
      <nav aria-label="Seccions del dashboard">
        <button class="nav-button active" type="button" data-nav-view="correction">Correcció</button>
        <button class="nav-button" type="button" data-nav-view="results">Resultats</button>
        <button class="nav-button" type="button" data-nav-view="students">Alumnes</button>
        <button class="nav-button" type="button" data-nav-view="microreptes">Microreptes</button>
        <button class="nav-button" type="button" data-nav-view="programacio">Programació</button>
        ${alumnatNavLink}
      </nav>
    </div>
  </header>
  <main>
    <section class="view-panel" data-view="correction">
      <h2>Llançar correcció</h2>
      <div class="grid">
        <label>Grup
          <select id="targetGroup">
            <option value="all">Tots</option>
            <option value="2DAW-A">2DAW-A</option>
            <option value="2DAW-B">2DAW-B</option>
            <option value="2DAW-C">2DAW-C</option>
            <option value="2DAW-D">2DAW-D</option>
          </select>
        </label>
        <label>Mode
          <select id="mode">
            <option value="mock">mock</option>
            <option value="openai">openai</option>
          </select>
        </label>
        <label>Branca alumne
          <input id="studentRef" value="main">
        </label>
        <label>Microrepte a corregir
          <select id="correctionChallenge">
            <option value="">Configuració activa</option>
          </select>
        </label>
        <label>Alumne concret
          <select id="correctionStudent">
            <option value="">Tot el grup seleccionat</option>
          </select>
        </label>
        <label>Publicar en repo alumne
          <select id="publish">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </label>
      </div>
      <div id="correctionPreview" class="feedback-box"></div>
      <label>Repositoris puntuals
        <textarea id="repositories" placeholder="Opcional. Si ho deixes buit, s'usen els alumnes registrats del grup seleccionat."></textarea>
      </label>
      <div class="actions">
        <button id="runButton">Llançar workflow</button>
        <span class="status" id="runStatus"></span>
      </div>
    </section>

    <section class="view-panel" data-view="correction">
      <h2>Auditoria de regles d’IA</h2>
      <p>Comprova manualment que les instruccions dels agents no han sigut eliminades, modificades o substituïdes als repositoris de l’alumnat.</p>
      <div class="actions">
        <button id="auditAgentRulesButton" type="button">Auditar regles d’IA</button>
        <span class="status" id="auditAgentRulesStatus"></span>
      </div>
    </section>

    <section class="view-panel" data-view="correction">
      <h2>Repositoris seleccionats</h2>
      <table>
        <thead><tr><th>Repositori</th><th>Grup</th><th>Branca</th><th>Microrepte que es corregirà</th><th>RA</th><th>Origen</th></tr></thead>
        <tbody id="repoRows"></tbody>
      </table>
    </section>

    <section class="view-panel hidden" data-view="results">
      <div class="toolbar">
        <h2>Últims resultats</h2>
        <button id="refreshGrades" type="button">Actualitzar</button>
        <button id="recalculateFilteredGrades" type="button">Recalcular seleccionats</button>
        <button id="buildClassReport" type="button">Informe classe</button>
      </div>
      <div class="filters">
        <label>Filtre per grup
          <select id="filterGroup">
            <option value="">Tots</option>
            <option value="2DAW-A">2DAW-A</option>
            <option value="2DAW-B">2DAW-B</option>
            <option value="2DAW-C">2DAW-C</option>
            <option value="2DAW-D">2DAW-D</option>
          </select>
        </label>
        <label>Filtre per repte
          <select id="filterChallenge">
            <option value="">Tots</option>
          </select>
        </label>
        <label>Filtre per repositori
          <input id="filterRepo" type="text" placeholder="Buscar repositori...">
        </label>
        <button id="applyFilters" type="button">Aplicar filtres</button>
      </div>
      <table>
        <thead><tr><th>Data</th><th>Repo</th><th>Grup</th><th>Repte</th><th>Nota</th><th>Confiança</th><th>Mode</th><th>Accions</th></tr></thead>
        <tbody id="gradeRows"></tbody>
      </table>
      <div id="gradesInfo" class="status"></div>
      <div id="classReportPanel" class="markdown-rendered hidden"></div>
      <h3>Notes orientatives per RA</h3>
      <table>
        <thead><tr><th>Repo</th><th>Grup</th><th>Repte</th><th>RA</th><th>Nota RA</th><th>Microreptes computats</th></tr></thead>
        <tbody id="raGradeRows"></tbody>
      </table>
      <h3>Notes per repte</h3>
      <table>
        <thead><tr><th>Repo</th><th>Grup</th><th>Repte</th><th>Notes RA automàtiques</th><th>Nota del repte i ampliació</th><th>Nota docent</th><th>Comentari docent</th><th>Revisió</th><th>Accions</th></tr></thead>
        <tbody id="repteGradeRows"></tbody>
      </table>
    </section>

    <section class="view-panel hidden" data-view="results">
      <div class="toolbar">
        <h2>Visor del resultat</h2>
        <button id="clearViewer" class="secondary" type="button">Netejar</button>
      </div>
      <div id="resultViewer" class="viewer">
        <div class="viewer-empty">Selecciona un resultat amb el botó Veure.</div>
      </div>
    </section>

    <section class="view-panel hidden" data-view="students">
      <div class="toolbar">
        <h2>Manteniment d'alumnes</h2>
        <div class="compact-actions">
          <button id="importStudents" class="secondary" type="button">Importar de course</button>
          <button id="syncStudents" type="button">Sincronitzar course</button>
        </div>
      </div>
      <div class="grid">
        <label>Nom
          <input id="studentName" placeholder="Nom de l'alumne">
        </label>
        <label>Repositori
          <input id="studentRepo" placeholder="owner/repo">
        </label>
        <label>Grup
          <select id="studentGroup">
            <option value="2DAW-A">2DAW-A</option>
            <option value="2DAW-B">2DAW-B</option>
            <option value="2DAW-C">2DAW-C</option>
            <option value="2DAW-D">2DAW-D</option>
          </select>
        </label>
        <div class="actions">
          <button id="saveStudent" type="button">Guardar</button>
          <button id="clearStudentForm" class="secondary" type="button">Netejar</button>
        </div>
      </div>
      <p class="status" id="studentStatus"></p>
      <div class="filters">
        <label>Filtre per grup
          <select id="studentFilterGroup">
            <option value="">Tots</option>
            <option value="2DAW-A">2DAW-A</option>
            <option value="2DAW-B">2DAW-B</option>
            <option value="2DAW-C">2DAW-C</option>
            <option value="2DAW-D">2DAW-D</option>
          </select>
        </label>
        <label>Buscar
          <input id="studentSearch" placeholder="Nom o repositori">
        </label>
        <button id="applyStudentFilters" type="button">Aplicar filtres</button>
      </div>
      <table>
        <thead><tr><th>Nom</th><th>Repositori</th><th>Grup</th><th>Resultats</th><th>Accions</th></tr></thead>
        <tbody id="studentRows"></tbody>
      </table>
      <div class="feedback-box">
        <h3>Crear repositoris des de CSV</h3>
        <div class="grid">
          <label>Organització
            <input id="createReposOrg" placeholder="batoi-dwes-2026">
          </label>
          <label>Plantilla
            <input id="createReposTemplate" placeholder="igomis/dwes-microreptes-alumnes">
          </label>
          <label>Prefix repositori
            <input id="createReposPrefix" value="microreptes-">
          </label>
          <label>Grup per defecte
            <select id="createReposDefaultGroup">
              <option value="">El CSV indica el grup</option>
              <option value="2DAW-A">2DAW-A</option>
              <option value="2DAW-B">2DAW-B</option>
              <option value="2DAW-C">2DAW-C</option>
              <option value="2DAW-D">2DAW-D</option>
            </select>
          </label>
          <label>Permís
            <select id="createReposPermission">
              <option value="push">push</option>
              <option value="pull">pull</option>
              <option value="maintain">maintain</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label>CSV
            <input id="createReposCsvFile" type="file" accept=".csv,text/csv">
          </label>
          <label>
            Opcions
            <span><input id="createReposDryRun" type="checkbox" checked> Prova sense crear</span>
          </label>
          <label>
            Invitacions
            <span><input id="createReposNoInvite" type="checkbox"> No convidar encara</span>
          </label>
        </div>
        <textarea id="createReposCsvText" placeholder="github_user,group,student_name&#10;alumne01,2DAW-A,Ana Marti&#10;alumne02,2DAW-B,Pau Garcia">github_user,group,student_name
</textarea>
        <div class="actions">
          <button id="createReposRun" type="button">Executar creació</button>
          <span id="createReposStatus" class="status"></span>
        </div>
        <div id="createReposOutput" class="markdown-preview hidden"></div>
      </div>
    </section>

    <section class="view-panel hidden" data-view="microreptes">
      <div class="toolbar">
        <h2>Microreptes</h2>
        <button id="refreshMicroreptes" type="button">Actualitzar</button>
      </div>
      <div class="filters">
        <label>Filtre per repte
          <select id="microrepteFilterRepte">
            <option value="">Tots</option>
          </select>
        </label>
        <label>Buscar
          <input id="microrepteSearch" placeholder="Títol, codi o sessió">
        </label>
        <button id="applyMicrorepteFilters" type="button">Aplicar filtres</button>
      </div>
      <table>
        <thead><tr><th>Repte</th><th>Sessió</th><th>MP</th><th>RA</th><th>Títol</th><th>Pes repte</th><th>Rúbrica</th><th>Estat</th><th>Accions</th></tr></thead>
        <tbody id="microrepteRows"></tbody>
      </table>
      <div id="microreptesInfo" class="status"></div>
    </section>

    <section class="view-panel hidden" data-view="microreptes">
      <div class="toolbar">
        <h2>Visor del microrepte</h2>
        <button id="clearMicrorepteViewer" class="secondary" type="button">Netejar</button>
      </div>
      <div id="microrepteViewer" class="viewer">
        <div class="viewer-empty">Selecciona un microrepte amb el botó Veure.</div>
      </div>
    </section>

    <section class="view-panel hidden" data-view="programacio">
      <div class="toolbar">
        <h2>Programació d'aula</h2>
        <div class="actions">
          ${professoratProgramacioLink}
          <button id="refreshProgramacio" type="button">Actualitzar</button>
        </div>
      </div>
      <div class="filters">
        <label>Repte
          <select id="programacioFilterRepte"></select>
        </label>
      </div>
      <div id="programacioInfo" class="status"></div>
      <div id="programacioViewer" class="viewer">
        <div class="viewer-empty">Selecciona un repte per consultar la programació d'aula.</div>
      </div>
    </section>

    <section class="view-panel" data-view="correction">
      <h2>Configuració</h2>
      <p class="status" id="githubStatus"></p>
    </section>
  </main>
  <script>
    let config = null;
    let allChallenges = [];
    let students = [];
    let microreptes = [];
    let classroomProgramming = [];
    let currentMicrorepte = null;
    let editingStudentId = null;

    function showView(view) {
      document.querySelectorAll('.view-panel').forEach((panel) => {
        panel.classList.toggle('hidden', panel.dataset.view !== view);
      });
      document.querySelectorAll('[data-nav-view]').forEach((button) => {
        button.classList.toggle('active', button.dataset.navView === view);
      });

      if (view === 'results') loadGrades();
      if (view === 'students') loadStudents();
      if (view === 'microreptes') loadMicroreptes();
      if (view === 'programacio') loadProgramacio();
    }

    function challengeFor(repo, group) {
      const override = document.querySelector('#correctionChallenge')?.value || '';
      if (override) return override;

      const student = config.active_challenges.students[repo];
      if (student && student.challenge_id) return student.challenge_id;
      const groupConfig = config.active_challenges.groups[group];
      return groupConfig && groupConfig.challenge_id ? groupConfig.challenge_id : 'sense assignació';
    }

    function challengeOriginFor(repo, group) {
      const override = document.querySelector('#correctionChallenge')?.value || '';
      if (override) return 'selecció manual per a esta execució';

      const student = config.active_challenges.students[repo];
      if (student && student.challenge_id) return 'assignació individual';
      const groupConfig = config.active_challenges.groups[group];
      if (groupConfig && groupConfig.challenge_id) return 'grup ' + group;
      return 'sense assignació';
    }

    function microrepteLabel(challengeId) {
      const microrepte = microreptes.find((item) => item.id === challengeId);
      if (!microrepte) return '<code>' + escapeHtml(challengeId || 'sense assignació') + '</code>';
      const code = microrepte.microrepte_code || microrepte.challenge?.microrepte_code || '';
      return '<code>' + escapeHtml(code || challengeId) + '</code> · ' + escapeHtml(microrepte.title || challengeId);
    }

    function microrepteRa(challengeId) {
      const microrepte = microreptes.find((item) => item.id === challengeId);
      return microrepte?.challenge?.primary_ra || '';
    }

    function refreshCorrectionChallengeSelect() {
      const select = document.querySelector('#correctionChallenge');
      if (!select) return;

      const current = select.value;
      const options = microreptes.map((microrepte) => {
        const code = microrepte.microrepte_code || microrepte.challenge?.microrepte_code || microrepte.id;
        const ra = microrepte.challenge?.primary_ra || microrepte.challenge?.assessment_role || '';
        const label = code + (ra ? ' · ' + ra : '') + ' · ' + (microrepte.title || microrepte.id);
        return '<option value="' + escapeHtml(microrepte.id) + '">' + escapeHtml(label) + '</option>';
      }).join('');

      select.innerHTML = '<option value="">Configuració activa per grup/alumne</option>' + options;
      select.value = microreptes.some((microrepte) => microrepte.id === current) ? current : '';
    }

    function refreshCorrectionStudentSelect() {
      const select = document.querySelector('#correctionStudent');
      if (!select || !config) return;

      const current = select.value;
      const repositories = config.repositories_by_target.all?.repositories || [];
      const options = repositories.map((item) => {
        const labelParts = [item.repo, item.group].filter(Boolean);
        if (item.name) labelParts.push(item.name);
        return '<option value="' + escapeHtml(item.repo) + '">' + escapeHtml(labelParts.join(' · ')) + '</option>';
      }).join('');

      select.innerHTML = '<option value="">Tot el grup seleccionat</option>' + options;
      select.value = repositories.some((item) => item.repo === current) ? current : '';
    }

    function getScoreClass(score) {
      if (score >= 7) return 'score-high';
      if (score >= 5) return 'score-medium';
      return 'score-low';
    }

    function formatTimestamp(ts) {
      if (!ts) return '';
      return new Date(ts).toLocaleString('ca-ES');
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function renderList(items, emptyText) {
      if (!Array.isArray(items) || items.length === 0) {
        return '<p class="status">' + escapeHtml(emptyText) + '</p>';
      }

      return '<ul>' + items.map((item) => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
    }

    function renderDimensions(dimensions) {
      if (!Array.isArray(dimensions) || dimensions.length === 0) {
        return '<p class="status">No hi ha puntuació per dimensions.</p>';
      }

      const rows = dimensions.map((dimension) => (
        '<tr>' +
          '<td><code>' + escapeHtml(dimension.id || dimension.name || '') + '</code></td>' +
          '<td>' + escapeHtml(dimension.score ?? '-') + ' / ' + escapeHtml(dimension.max_score ?? '-') + '</td>' +
          '<td>' + escapeHtml(dimension.reason || dimension.feedback || '') + '</td>' +
        '</tr>'
      ));

      return '<table>' +
        '<thead><tr><th>Dimensió</th><th>Punts</th><th>Comentari</th></tr></thead>' +
        '<tbody>' + rows.join('') + '</tbody>' +
      '</table>';
    }

    function formatPercent(value) {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return 'n/d';
      }

      return Math.round(Number(value) * 1000) / 10 + '%';
    }

    function renderMicrorepteValidation(validation) {
      const issues = validation?.issues || [];
      const status = validation?.status || 'warning';
      const label = status === 'ok' ? 'Complet' : 'Avisos';

      if (issues.length === 0) {
        return '<span class="badge ok">' + label + '</span>';
      }

      return '<span class="badge warning">' + label + '</span>';
    }

    function renderMicrorepteList(items, emptyText) {
      if (!Array.isArray(items) || items.length === 0) {
        return '<p class="status">' + escapeHtml(emptyText) + '</p>';
      }

      return renderList(items.map((item) => {
        if (typeof item === 'string') return item;
        return item.label || item.id || JSON.stringify(item);
      }), emptyText);
    }

    function renderRubricDimensions(dimensions) {
      if (!Array.isArray(dimensions) || dimensions.length === 0) {
        return '<p class="status">No hi ha dimensions de rúbrica.</p>';
      }

      const rows = dimensions.map((dimension) => (
        '<tr>' +
          '<td><code>' + escapeHtml(dimension.id || '') + '</code></td>' +
          '<td>' + escapeHtml(dimension.label || '') + '</td>' +
          '<td>' + formatPercent(dimension.weight) + '</td>' +
          '<td>' + escapeHtml(dimension.must_check || '') + '</td>' +
        '</tr>'
      ));

      return '<table>' +
        '<thead><tr><th>ID</th><th>Criteri</th><th>Pes</th><th>Què comprova</th></tr></thead>' +
        '<tbody>' + rows.join('') + '</tbody>' +
      '</table>';
    }

    function renderAssessedRaBlocks(assessedRa) {
      if (!Array.isArray(assessedRa) || assessedRa.length === 0) {
        return '';
      }

      return '<h4>Blocs RA avaluats</h4>' + assessedRa.map((item) => (
        '<p><strong><code>' + escapeHtml(item.ra_id || '') + '</code></strong>: ' +
        escapeHtml((item.assessed_ca || []).join(', ') || 'Sense CA') +
        '</p>'
      )).join('');
    }

    function renderMarkdownLinks(value, baseUrl) {
      const pattern = /\\[([^\\]]+)\\]\\(([^\\s)]+)\\)/g;
      let html = '';
      let cursor = 0;
      for (const match of value.matchAll(pattern)) {
        html += escapeHtml(value.slice(cursor, match.index));
        let url;
        try {
          url = new URL(match[2], baseUrl || window.location.href);
          if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) url = null;
          if (url && baseUrl && url.origin === new URL(baseUrl).origin) {
            url.pathname = url.pathname.replace(/\\.md$/, '/');
          }
        } catch { url = null; }
        html += url
          ? '<a href="' + escapeHtml(url.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(match[1]) + '</a>'
          : escapeHtml(match[0]);
        cursor = match.index + match[0].length;
      }
      return html + escapeHtml(value.slice(cursor));
    }

    function repositoryLink(repo) {
      const value = String(repo || '');
      if (!/^[A-Za-z0-9_.-]+\\/[A-Za-z0-9_.-]+$/.test(value)) return '<code>' + escapeHtml(value) + '</code>';
      return '<a href="https://github.com/' + value + '" target="_blank" rel="noopener noreferrer"><code>' + escapeHtml(value) + '</code></a>';
    }

    function renderInlineMarkdown(value, baseUrl) {
      const source = String(value || '');
      const segments = [];
      const tick = String.fromCharCode(96);
      const pattern = new RegExp('(\\\\*\\\\*[^*]+\\\\*\\\\*|' + tick + '[^' + tick + ']+' + tick + ')', 'g');
      let cursor = 0;

      for (const match of source.matchAll(pattern)) {
        segments.push(renderMarkdownLinks(source.slice(cursor, match.index), baseUrl));
        const token = match[0];
        if (token.startsWith('**')) {
          segments.push('<strong>' + escapeHtml(token.slice(2, -2)) + '</strong>');
        } else {
          segments.push('<code>' + escapeHtml(token.slice(1, -1)) + '</code>');
        }
        cursor = match.index + token.length;
      }

      segments.push(renderMarkdownLinks(source.slice(cursor), baseUrl));
      return segments.join('');
    }

    function renderMarkdown(markdown, baseUrl) {
      const lines = String(markdown || '').split('\\n');
      const html = [];
      let listOpen = false;
      let tableLines = [];

      const closeList = () => {
        if (listOpen) {
          html.push('</ul>');
          listOpen = false;
        }
      };
      const flushTable = () => {
        if (tableLines.length === 0) return;
        const rows = tableLines.filter((line) => !/^\\|\\s*-/.test(line));
        const renderedRows = rows.map((line, index) => {
          const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
          const tag = index === 0 ? 'th' : 'td';
          return '<tr>' + cells.map((cell) => '<' + tag + '>' + renderInlineMarkdown(cell, baseUrl) + '</' + tag + '>').join('') + '</tr>';
        });
        html.push('<table>' + renderedRows.join('') + '</table>');
        tableLines = [];
      };

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          closeList();
          tableLines.push(trimmed);
          continue;
        }
        flushTable();

        if (!trimmed) {
          closeList();
          continue;
        }
        const heading = trimmed.match(/^(#{1,4})\\s+(.+)$/);
        if (heading) {
          closeList();
          const level = Math.min(heading[1].length + 1, 5);
          html.push('<h' + level + '>' + escapeHtml(heading[2]) + '</h' + level + '>');
          continue;
        }
        const bullet = trimmed.match(/^-\\s+(.+)$/);
        if (bullet) {
          if (!listOpen) {
            html.push('<ul>');
            listOpen = true;
          }
          html.push('<li>' + renderInlineMarkdown(bullet[1], baseUrl) + '</li>');
          continue;
        }
        closeList();
        html.push('<p>' + renderInlineMarkdown(trimmed, baseUrl) + '</p>');
      }
      closeList();
      flushTable();
      return html.join('');
    }

    function compareMicrorepteOrder(a, b) {
      return [
        a.session_code || '',
        a.microrepte_code || '',
        a.id || ''
      ].join(' ').localeCompare([
        b.session_code || '',
        b.microrepte_code || '',
        b.id || ''
      ].join(' '), 'ca', { numeric: true, sensitivity: 'base' });
    }

    function refreshProgramacioRepteFilter() {
      const select = document.querySelector('#programacioFilterRepte');
      const current = select.value;
      const reptes = [...new Set(classroomProgramming.map((session) => session.repte_id).filter(Boolean))].sort();
      select.innerHTML = reptes.map((repte) => (
        '<option value="' + escapeHtml(repte) + '">' + escapeHtml(repte) + '</option>'
      )).join('');
      select.value = reptes.includes(current) ? current : (reptes[0] || '');
    }

    function markdownBulletList(items, fallback) {
      if (!Array.isArray(items) || items.length === 0) {
        return '- ' + fallback;
      }

      return items.map((item) => '- ' + String(item)).join('\\n');
    }

    function uniqueList(items) {
      return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];
    }

    function groupProgramacioSessions(items) {
      const groups = new Map();
      for (const microrepte of items) {
        const challenge = microrepte.challenge || {};
        const rubric = microrepte.rubric || {};
        const sessionCode = challenge.session_code || microrepte.session_code || 'Sense sessió';
        const current = groups.get(sessionCode) || {
          code: sessionCode,
          titles: [],
          summaries: [],
          goals: [],
          associatedWork: [],
          evidences: [],
          signals: [],
          hardRules: [],
          testStrategies: [],
          sourceAlignment: [],
          dimensions: [],
          weight: 0
        };

        current.titles.push(challenge.title || microrepte.title || '');
        current.summaries.push(challenge.summary || '');
        current.goals.push(challenge.pedagogical_goal || '');
        current.associatedWork.push((challenge.microrepte_code || microrepte.microrepte_code || microrepte.id || '') + ': ' + (challenge.title || microrepte.title || ''));
        current.evidences.push(...(Array.isArray(challenge.required_evidence) ? challenge.required_evidence : []));
        current.signals.push(...(Array.isArray(challenge.expected_signals) ? challenge.expected_signals : []));
        current.hardRules.push(...(Array.isArray(rubric.hard_rules) ? rubric.hard_rules : []));
        current.testStrategies.push(challenge.recommended_test_strategy || '');
        current.sourceAlignment.push(...(Array.isArray(challenge.source_alignment) ? challenge.source_alignment : []));
        current.dimensions.push(...(Array.isArray(rubric.dimensions) ? rubric.dimensions : []));
        current.weight += Number(microrepte.repte_weight) || 0;
        groups.set(sessionCode, current);
      }

      return [...groups.values()].map((session) => ({
        ...session,
        title: uniqueList(session.titles).join(' / ') || session.code,
        summary: uniqueList(session.summaries).join(' '),
        goals: uniqueList(session.goals),
        associatedWork: uniqueList(session.associatedWork),
        evidences: uniqueList(session.evidences),
        signals: uniqueList(session.signals),
        hardRules: uniqueList(session.hardRules),
        testStrategies: uniqueList(session.testStrategies),
        sourceAlignment: uniqueList(session.sourceAlignment)
      })).sort((a, b) => a.code.localeCompare(b.code, 'ca', { numeric: true, sensitivity: 'base' }));
    }

    function renderSessionActivityTable(session) {
      const firstGoal = session.goals[0] || session.summary || 'objectiu de la sessió';
      return '<table>' +
        '<thead><tr><th>Moment</th><th>Treball d’aula</th><th>Paper docent</th><th>Evidència o control</th></tr></thead>' +
        '<tbody>' +
          '<tr><td>Arrencada</td><td>Situar el propòsit: ' + escapeHtml(firstGoal) + '</td><td>Explicitar criteris, límits i producte esperat.</td><td>Dubtes inicials i criteris compartits.</td></tr>' +
          '<tr><td>Desenvolupament</td><td>Construcció del treball associat a la sessió.</td><td>Acompanyar decisions, revisar bloquejos i demanar justificació tècnica.</td><td>' + renderMicrorepteList(session.evidences.slice(0, 3), 'Evidència de progrés observable.') + '</td></tr>' +
          '<tr><td>Tancament</td><td>Comprovació, revisió de qualitat i registre de decisions.</td><td>Contrastar evidències amb rúbrica i marcar següents passos.</td><td>' + renderMicrorepteList(session.signals.slice(0, 3), 'Senyals de sessió assolida.') + '</td></tr>' +
        '</tbody>' +
      '</table>';
    }

    function renderSessionCriteria(dimensions) {
      if (!Array.isArray(dimensions) || dimensions.length === 0) {
        return '<p class="status">Sense criteris de rúbrica documentats.</p>';
      }

      const rows = dimensions.map((dimension) => (
        '<tr>' +
          '<td>' + escapeHtml(dimension.label || dimension.id || '') + '</td>' +
          '<td>' + formatPercent(dimension.weight) + '</td>' +
          '<td>' + escapeHtml(dimension.must_check || '') + '</td>' +
        '</tr>'
      ));
      return '<table><thead><tr><th>Criteri</th><th>Pes</th><th>Comprovació</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>';
    }

    function renderProgramacioMarkdown(repte, sessions) {
      const totalWeight = sessions.reduce((sum, session) => sum + (Number(session.weight) || 0), 0);
      const lines = [
        '# Programació d’aula ' + repte,
        '',
        '- Sessions: ' + sessions.length,
        '- Pes total documentat: ' + formatPercent(totalWeight),
        '',
        '## Sessions'
      ];

      for (const session of sessions) {
        lines.push(
          '',
          '### ' + session.code + ' · ' + session.title,
          '',
          '- Pes dins del repte: ' + formatPercent(session.weight),
          '- Finalitat de la sessió: ' + (session.summary || 'No documentada.'),
          '- Verificació recomanada: ' + (session.testStrategies.join(' / ') || 'No documentada.'),
          '',
          '**Objectius de sessió**',
          markdownBulletList(session.goals, 'Sense objectius documentats.'),
          '',
          '**Seqüència d’aula**',
          '| Moment | Treball d’aula | Evidència |',
          '| --- | --- | --- |',
          '| Arrencada | Presentació del propòsit, criteris i producte esperat. | Criteris compartits i dubtes inicials. |',
          '| Desenvolupament | Construcció del treball associat amb seguiment docent. | Evidències parcials del treball. |',
          '| Tancament | Comprovació, registre de decisions i següents passos. | Senyals d’assoliment i incidències. |',
          '',
          '**Evidències mínimes**',
          markdownBulletList(session.evidences, 'Sense evidències requerides documentades.'),
          '',
          '**Senyals esperats**',
          markdownBulletList(session.signals, 'Sense senyals esperats documentats.'),
          '',
          '**Criteris de rúbrica**',
          markdownBulletList(session.dimensions.map((dimension) => (
            (dimension.label || dimension.id || 'Dimensió') + ' (' + formatPercent(dimension.weight) + '): ' + (dimension.must_check || 'Sense comprovació documentada.')
          )), 'Sense dimensions de rúbrica documentades.'),
          '',
          '**Regles dures**',
          markdownBulletList(session.hardRules, 'Sense regles dures documentades.'),
          '',
          '**Treball associat que alimenta la sessió**',
          markdownBulletList(session.associatedWork, 'Sense treball associat documentat.')
        );
      }

      return lines.join('\\n');
    }

    function renderProgramacio() {
      const repte = document.querySelector('#programacioFilterRepte').value;
      const viewer = document.querySelector('#programacioViewer');
      const sessions = classroomProgramming
        .filter((session) => session.repte_id === repte)
        .sort((left, right) => (left.session_code || left.title).localeCompare(right.session_code || right.title, 'ca', { numeric: true, sensitivity: 'base' }));

      if (!repte || sessions.length === 0) {
        viewer.innerHTML = '<div class="viewer-empty">No hi ha programacions d’aula Markdown per a aquest repte.</div>';
        document.querySelector('#programacioInfo').textContent = '';
        return;
      }

      const rows = sessions.map((session) => {
        return '<tr>' +
          '<td><code>' + escapeHtml(session.session_code) + '</code></td>' +
          '<td>' + escapeHtml(session.title) + '<p class="status">' + escapeHtml(session.focus || '') + '</p></td>' +
          '<td>' + escapeHtml(session.microrepte || 'Sessió sense microrepte específic') + '</td>' +
          '<td>' + escapeHtml(session.duration || 'n/d') + '</td>' +
          '<td><button class="secondary" type="button" data-programacio-session="' + escapeHtml(session.id) + '">Veure</button></td>' +
        '</tr>';
      });

      const sourceLabel = sessions[0]?.source === 'snapshot'
        ? 'còpia versionada en docs/programacio_aula'
        : 'dwes-restructuracio-modul';
      document.querySelector('#programacioInfo').textContent = 'Programació d’aula llegida des de ' + sourceLabel + ': ' + sessions.length + ' sessions';
      viewer.innerHTML =
        '<div class="result-header">' +
          '<div class="metric"><span>Repte</span><strong><code>' + escapeHtml(repte) + '</code></strong></div>' +
          '<div class="metric"><span>Sessions</span><strong>' + escapeHtml(sessions.length) + '</strong></div>' +
          '<div class="metric"><span>Font</span><strong>' + escapeHtml(sourceLabel) + '</strong></div>' +
          '<div class="metric"><span>Format</span><strong>Markdown</strong></div>' +
        '</div>' +
        '<div class="feedback-box"><h3>Mapa de sessions</h3>' +
          '<table><thead><tr><th>Sessió</th><th>Programació</th><th>Microrepte</th><th>Duració</th><th>Accions</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>' +
        '</div>' +
        '<div id="programacioSessionViewer" class="feedback-box"><div class="viewer-empty">Selecciona una sessió amb el botó Veure.</div></div>';

      document.querySelectorAll('[data-programacio-session]').forEach((button) => {
        button.addEventListener('click', () => renderProgramacioSession(button.dataset.programacioSession));
      });
      renderProgramacioSession(sessions[0].id);
    }

    function renderProgramacioSession(sessionId) {
      const session = classroomProgramming.find((item) => item.id === sessionId);
      const target = document.querySelector('#programacioSessionViewer');
      if (!session || !target) return;
      const today = new Date().toISOString().slice(0, 10);

      target.innerHTML =
        '<div class="toolbar"><h3>' + escapeHtml(session.title) + '</h3><span class="file-note">' + escapeHtml(session.file) + '</span></div>' +
        '<p><a href="' + escapeHtml(session.documentation_url) + '" target="_blank" rel="noopener noreferrer">Obrir la sessió en la documentació del professorat</a></p>' +
        '<div id="consolidationPanel" class="feedback-box"></div>' +
        '<div class="feedback-grid">' +
          '<div><h4>Vista docent</h4><div class="markdown-rendered">' + renderMarkdown(session.markdown, session.markdown_url) + '</div></div>' +
          '<div><h4>Edició del Markdown font</h4>' +
            '<textarea id="programacioMarkdownEditor" data-session-id="' + escapeHtml(session.id) + '">' + escapeHtml(session.markdown) + '</textarea>' +
            '<div class="actions"><button id="saveProgramacioMarkdown" type="button">Guardar Markdown</button><span id="programacioMarkdownStatus" class="status"></span></div>' +
          '</div>' +
        '</div>' +
        '<div class="feedback-box">' +
          '<h4>Comentari docent de la sessió</h4>' +
          '<div class="grid">' +
            '<label>Grup<select id="programacioNoteGroup" required><option value="">Selecciona un grup</option>${Object.keys(groupFiles).filter(group => group !== 'all').map(group => '<option value="' + group + '">' + group + '</option>').join('')}</select></label>' +
            '<label>Dia de realització<input id="programacioNoteDate" type="date" value="' + escapeHtml(today) + '"></label>' +
            '<label>Comentari<textarea id="programacioNoteComment" placeholder="Com ha anat la sessió, ajustos, incidències, ritme, acords o canvis per a la pròxima vegada."></textarea></label>' +
          '</div>' +
          '<div class="actions"><button id="saveProgramacioNote" type="button">Guardar comentari</button><span id="programacioNoteStatus" class="status"></span></div>' +
          '<div id="programacioNotes" class="markdown-rendered"><p class="status">Carregant comentaris...</p></div>' +
        '</div>';
      document.querySelector('#saveProgramacioMarkdown').addEventListener('click', saveProgramacioMarkdown);
      document.querySelector('#saveProgramacioNote').addEventListener('click', saveProgramacioNote);
      loadProgramacioNotes(session.id);
      loadConsolidation(session.id);
    }

    async function loadConsolidation(sessionId) {
      const panel = document.querySelector('#consolidationPanel');
      panel.textContent = 'Carregant fitxa de consolidació...';
      try {
        const response = await fetch('/api/programacio-aula/' + encodeURIComponent(sessionId) + '/consolidacio');
        const data = await response.json();
        if (!panel.isConnected) return;
        if (!response.ok) throw new Error(data.error || 'No s’ha pogut carregar la fitxa.');
        if (!data.code) { panel.textContent = 'Sessió sense fitxa de microrepte pròpia.'; return; }
        panel.innerHTML = '<h4>Consolidació de ' + escapeHtml(data.code.toUpperCase()) + '</h4>' +
          '<p>Material posterior a classe, comú per a tot l’alumnat. Guardar conserva l’esborrany; publicar el fa accessible en la web.</p>' +
          '<textarea id="consolidationEditor" aria-label="Fitxa de consolidació en Markdown" placeholder="Escriu la fitxa: aprenentatges, exemple explicat, errors, pràctica, comprovació i connexió següent.">' + escapeHtml(data.markdown) + '</textarea>' +
          '<div class="actions"><button type="button" data-consolidation-action="save">Guardar esborrany</button><button type="button" data-consolidation-action="publish">Publicar fitxa per a tot l’alumnat</button><button type="button" data-consolidation-action="withdraw">Retirar de la web</button></div>' +
          '<p data-consolidation-status class="status">' + (data.has_draft ? 'Esborrany carregat.' : 'Encara no hi ha cap fitxa preparada.') + '</p>';
        if (data.publication && !data.publication.withdrawn) {
          const previous = document.createElement('p'); previous.dataset.publicationLink = ''; previous.textContent = 'Darrera publicació des d’este dashboard: ';
          const link = document.createElement('a'); link.href = data.publication.url; link.textContent = 'Obrir fitxa'; link.target = '_blank'; link.rel = 'noopener noreferrer'; previous.append(link); panel.append(previous);
        }
        panel.querySelectorAll('[data-consolidation-action]').forEach(button => button.addEventListener('click', async () => {
          const status = panel.querySelector('[data-consolidation-status]');
          const buttons = panel.querySelectorAll('button');
          const editor = panel.querySelector('textarea');
          const markdown = editor.value;
          const withdrawing = button.dataset.consolidationAction === 'withdraw';
          if (withdrawing && !confirm('Retirar la fitxa de la web de tot l’alumnat? L’esborrany es conserva.')) return;
          if (!withdrawing && !markdown.trim()) { status.textContent = 'Escriu la fitxa abans de guardar o publicar.'; return; }
          buttons.forEach(item => item.disabled = true);
          editor.disabled = true;
          status.textContent = withdrawing ? 'Retirant...' : button.dataset.consolidationAction === 'publish' ? 'Publicant...' : 'Guardant...';
          try {
            const result = await fetch('/api/programacio-aula/' + encodeURIComponent(sessionId) + '/consolidacio', {
              method: withdrawing ? 'DELETE' : button.dataset.consolidationAction === 'publish' ? 'POST' : 'PUT',
              headers: {'content-type': 'application/json'}, body: JSON.stringify({markdown})
            });
            const payload = await result.json();
            if (!result.ok) throw new Error(payload.error || 'No s’ha pogut completar l’acció.');
            if (payload.withdrawn) panel.querySelector('[data-publication-link]')?.remove();
            status.textContent = payload.withdrawn ? (payload.unchanged ? 'La fitxa ja estava retirada. L’esborrany es conserva. ' : 'Retirada enviada a GitHub. Desapareixerà de la web quan acabe la construcció. L’esborrany es conserva. ') : payload.url ? (payload.unchanged ? 'La mateixa versió ja està en GitHub. ' : 'Enviada a GitHub. La web s’actualitzarà quan acabe la construcció. ') : 'Esborrany guardat.';
            if (payload.url || payload.withdrawn) {
              if (payload.warning) status.append(document.createTextNode(payload.warning + ' '));
              if (payload.url) { const link = document.createElement('a'); link.href = payload.url; link.textContent = 'Obrir fitxa'; link.target = '_blank'; link.rel = 'noopener noreferrer'; status.append(link); }
              const actions = document.createElement('a'); actions.href = payload.actions_url; actions.textContent = ' · Comprovar publicació'; actions.target = '_blank'; actions.rel = 'noopener noreferrer'; status.append(actions);
            }
          } catch (error) { status.textContent = error.message; }
          finally { buttons.forEach(item => item.disabled = false); editor.disabled = false; }
        }));
      } catch (error) { if (panel.isConnected) panel.textContent = error.message; }
    }

    async function saveProgramacioMarkdown() {
      const editor = document.querySelector('#programacioMarkdownEditor');
      const status = document.querySelector('#programacioMarkdownStatus');
      const sessionId = editor?.dataset.sessionId;
      if (!editor || !sessionId) return;
      status.textContent = 'Guardant...';

      try {
        const response = await fetch('/api/programacio-aula/' + encodeURIComponent(sessionId), {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ markdown: editor.value })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut guardar el Markdown.');
        const index = classroomProgramming.findIndex((item) => item.id === sessionId);
        if (index >= 0) classroomProgramming[index] = payload.session;
        renderProgramacioSession(sessionId);
        document.querySelector('#programacioInfo').innerHTML = '<span class="ok">Markdown guardat en el fitxer font.</span>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    async function loadProgramacioNotes(sessionId) {
      const target = document.querySelector('#programacioNotes');
      if (!target) return;

      try {
        const response = await fetch('/api/programacio-aula/' + encodeURIComponent(sessionId) + '/notes');
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’han pogut carregar els comentaris.');
        const notes = payload.notes || [];
        if (notes.length === 0) {
          target.innerHTML = '<p class="status">Encara no hi ha comentaris guardats per a esta sessió.</p>';
          return;
        }
        target.innerHTML = notes.map((note) => (
          '<div class="feedback-box">' +
            '<p><strong>' + escapeHtml(note.session_date) + '</strong> · ' + escapeHtml(note.group_name || 'Grup no indicat (comentari anterior)') + ' <span class="status">' + escapeHtml(formatTimestamp(note.created_at)) + '</span></p>' +
            '<p>' + escapeHtml(note.comment) + '</p>' +
          '</div>'
        )).join('');
      } catch (error) {
        target.innerHTML = '<p class="error">' + escapeHtml(error.message) + '</p>';
      }
    }

    async function saveProgramacioNote() {
      const editor = document.querySelector('#programacioMarkdownEditor');
      const date = document.querySelector('#programacioNoteDate');
      const group = document.querySelector('#programacioNoteGroup');
      const comment = document.querySelector('#programacioNoteComment');
      const status = document.querySelector('#programacioNoteStatus');
      const sessionId = editor?.dataset.sessionId;
      if (!sessionId || !date || !comment || !group) return;
      if (!group.reportValidity()) return;
      status.textContent = 'Guardant...';

      try {
        const response = await fetch('/api/programacio-aula/' + encodeURIComponent(sessionId) + '/notes', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session_date: date.value, group_name: group.value, comment: comment.value })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut guardar el comentari.');
        comment.value = '';
        status.innerHTML = '<span class="ok">Comentari guardat.</span>';
        await loadProgramacioNotes(sessionId);
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    async function loadProgramacio() {
      try {
        const response = await fetch('/api/programacio-aula');
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut carregar la programació d’aula.');
        classroomProgramming = payload.sessions || [];
        refreshProgramacioRepteFilter();
        renderProgramacio();
      } catch (error) {
        document.querySelector('#programacioInfo').innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    function clearMicrorepteViewer() {
      currentMicrorepte = null;
      document.querySelector('#microrepteViewer').innerHTML = '<div class="viewer-empty">Selecciona un microrepte amb el botó Veure.</div>';
    }

    function listToText(items) {
      return Array.isArray(items) ? items.join('\\n') : '';
    }

    function renderMicrorepteEditForm(microrepte) {
      const challenge = microrepte.challenge || {};
      const rubric = microrepte.rubric || {};
      const dimensions = Array.isArray(rubric.dimensions) ? rubric.dimensions : [];
      const dimensionRows = dimensions.map((dimension, index) => (
        '<tr data-edit-dimension="' + index + '">' +
          '<td><input data-dimension-field="id" value="' + escapeHtml(dimension.id || '') + '" readonly></td>' +
          '<td><input data-dimension-field="label" value="' + escapeHtml(dimension.label || '') + '"></td>' +
          '<td><input data-dimension-field="weight" type="number" min="0" max="1" step="0.01" value="' + escapeHtml(dimension.weight ?? '') + '"></td>' +
          '<td><textarea data-dimension-field="must_check">' + escapeHtml(dimension.must_check || '') + '</textarea></td>' +
        '</tr>'
      ));

      return '<div class="feedback-box" id="microrepteEditForm">' +
        '<h3>Edició guiada</h3>' +
        '<div class="grid">' +
          '<label>Títol<input id="editMicrorepteTitle" value="' + escapeHtml(challenge.title || '') + '"></label>' +
          '<label>Pes dins del repte (0-1)<input id="editMicrorepteWeight" type="number" min="0" max="1" step="0.01" value="' + escapeHtml(microrepte.repte_weight ?? '') + '"></label>' +
          '<label>Estratègia de prova<input id="editMicrorepteTestStrategy" value="' + escapeHtml(challenge.recommended_test_strategy || '') + '"></label>' +
        '</div>' +
        '<label>Resum<textarea id="editMicrorepteSummary">' + escapeHtml(challenge.summary || '') + '</textarea></label>' +
        '<label>Objectiu pedagògic<textarea id="editMicrorepteGoal">' + escapeHtml(challenge.pedagogical_goal || '') + '</textarea></label>' +
        '<div class="feedback-grid">' +
          '<label>Evidències requerides<textarea id="editMicrorepteEvidence">' + escapeHtml(listToText(challenge.required_evidence)) + '</textarea></label>' +
          '<label>Senyals esperats<textarea id="editMicrorepteSignals">' + escapeHtml(listToText(challenge.expected_signals)) + '</textarea></label>' +
        '</div>' +
        '<div class="feedback-grid">' +
          '<label>Regles dures<textarea id="editMicrorepteHardRules">' + escapeHtml(listToText(rubric.hard_rules)) + '</textarea></label>' +
          '<label>Alineació d’origen<textarea id="editMicrorepteSourceAlignment">' + escapeHtml(listToText(challenge.source_alignment)) + '</textarea></label>' +
        '</div>' +
        '<h3>Dimensions de rúbrica</h3>' +
        '<table><thead><tr><th>ID</th><th>Criteri</th><th>Pes</th><th>Què comprova</th></tr></thead><tbody>' + dimensionRows.join('') + '</tbody></table>' +
        '<div class="actions">' +
          '<button id="saveMicrorepte" type="button">Guardar canvis</button>' +
          '<button id="cancelMicrorepteEdit" class="secondary" type="button">Cancel·lar</button>' +
          '<span id="microrepteEditStatus" class="status"></span>' +
        '</div>' +
      '</div>';
    }

    function collectMicrorepteEditForm() {
      const dimensions = Array.from(document.querySelectorAll('[data-edit-dimension]')).map((row) => {
        const field = (name) => row.querySelector('[data-dimension-field="' + name + '"]').value;
        return {
          id: field('id'),
          label: field('label'),
          weight: Number(field('weight')),
          must_check: field('must_check')
        };
      });

      return {
        title: document.querySelector('#editMicrorepteTitle').value,
        repte_weight: Number(document.querySelector('#editMicrorepteWeight').value),
        recommended_test_strategy: document.querySelector('#editMicrorepteTestStrategy').value,
        summary: document.querySelector('#editMicrorepteSummary').value,
        pedagogical_goal: document.querySelector('#editMicrorepteGoal').value,
        required_evidence: document.querySelector('#editMicrorepteEvidence').value,
        expected_signals: document.querySelector('#editMicrorepteSignals').value,
        hard_rules: document.querySelector('#editMicrorepteHardRules').value,
        source_alignment: document.querySelector('#editMicrorepteSourceAlignment').value,
        dimensions
      };
    }

    function attachMicrorepteDetailListeners(microrepte) {
      const editButton = document.querySelector('#editMicrorepte');
      if (editButton) {
        editButton.addEventListener('click', () => {
          const container = document.querySelector('#microrepteEditContainer');
          container.innerHTML = renderMicrorepteEditForm(microrepte);
          attachMicrorepteEditListeners();
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.querySelector('#editMicrorepteTitle')?.focus({ preventScroll: true });
        });
      }
    }

    function attachMicrorepteEditListeners() {
      document.querySelector('#cancelMicrorepteEdit').addEventListener('click', () => {
        document.querySelector('#microrepteEditContainer').innerHTML = '';
      });
      document.querySelector('#saveMicrorepte').addEventListener('click', saveMicrorepte);
    }

    async function saveMicrorepte() {
      const status = document.querySelector('#microrepteEditStatus');
      status.textContent = 'Guardant i validant...';

      try {
        const body = collectMicrorepteEditForm();
        const response = await fetch('/api/microreptes/' + encodeURIComponent(currentMicrorepte.id), {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut guardar el microrepte.');
        currentMicrorepte = payload;
        await loadMicroreptes();
        renderMicrorepteDetail(payload);
        document.querySelector('#microreptesInfo').innerHTML = '<span class="ok">Microrepte guardat i validat.</span>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    function renderMicrorepteDetail(microrepte) {
      currentMicrorepte = microrepte;
      const challenge = microrepte.challenge || {};
      const rubric = microrepte.rubric || {};
      const validation = microrepte.validation || {};
      const issues = validation.issues || [];

      document.querySelector('#microrepteViewer').innerHTML =
        '<div class="actions"><button id="editMicrorepte" type="button">Editar</button><span class="status">Edició guiada amb validació i rollback.</span></div>' +
        '<div class="result-header">' +
          '<div class="metric"><span>Microrepte</span><strong><code>' + escapeHtml(microrepte.id) + '</code></strong><p class="status">' + escapeHtml(microrepte.title || '') + '</p></div>' +
          '<div class="metric"><span>Repte</span><strong>' + escapeHtml(microrepte.repte_id || 'n/d') + '</strong></div>' +
          '<div class="metric"><span>RA avaluat</span><strong><code>' + escapeHtml(challenge.primary_ra || 'n/d') + '</code></strong></div>' +
          '<div class="metric"><span>Pes dins repte</span><strong>' + formatPercent(microrepte.repte_weight) + '</strong></div>' +
          '<div class="metric"><span>Pes rúbrica</span><strong>' + escapeHtml(validation.dimension_weight_sum ?? 'n/d') + '</strong></div>' +
        '</div>' +
        '<div class="feedback-grid">' +
          '<div class="feedback-box"><h3>Dades generals</h3>' +
            '<p><strong>Sessió:</strong> ' + escapeHtml(challenge.session_code || '') + '</p>' +
            '<p><strong>Codi:</strong> ' + escapeHtml(challenge.microrepte_code || '') + '</p>' +
            '<p><strong>Model d’avaluació:</strong> ' + escapeHtml(challenge.assessment_model || challenge.assessment_role || '') + '</p>' +
            '<p><strong>Resum:</strong> ' + escapeHtml(challenge.summary || '') + '</p>' +
            '<p><strong>Objectiu:</strong> ' + escapeHtml(challenge.pedagogical_goal || '') + '</p>' +
          '</div>' +
          '<div class="feedback-box"><h3>RA i CA qualificables</h3>' +
            '<p><strong>RA avaluat:</strong> <code>' + escapeHtml(challenge.primary_ra || '') + '</code></p>' +
            '<h4>CA avaluats</h4>' + renderMicrorepteList(challenge.assessed_ca, 'Sense CA avaluats.') +
            renderAssessedRaBlocks(challenge.assessed_ra) +
            '<h4>RA de context</h4>' + renderMicrorepteList(challenge.context_ra, 'Sense RA de context.') +
          '</div>' +
          '<div class="feedback-box"><h3>Validació</h3>' +
            renderList(issues, 'Sense avisos de validació.') +
          '</div>' +
        '</div>' +
        '<div class="feedback-box"><h3>Criteris d’avaluació / dimensions de rúbrica</h3>' + renderRubricDimensions(rubric.dimensions) + '</div>' +
        '<div class="feedback-grid">' +
          '<div class="feedback-box"><h3>Evidències requerides</h3>' + renderMicrorepteList(challenge.required_evidence, 'Sense evidències requerides.') + '</div>' +
          '<div class="feedback-box"><h3>Senyals esperats</h3>' + renderMicrorepteList(challenge.expected_signals, 'Sense senyals esperats.') + '</div>' +
        '</div>' +
        '<div class="feedback-grid">' +
          '<div class="feedback-box"><h3>Regles dures</h3>' + renderMicrorepteList(rubric.hard_rules, 'Sense regles dures.') + '</div>' +
          '<div class="feedback-box"><h3>Alineació d’origen</h3>' + renderMicrorepteList(challenge.source_alignment, 'Sense alineació documentada.') + '</div>' +
        '</div>' +
        '<div class="file-note">Fitxers: ' + escapeHtml(microrepte.files?.challenge || '') + ' · ' + escapeHtml(microrepte.files?.rubric || '') + ' · ' + escapeHtml(microrepte.files?.prompt || '') + '</div>' +
        '<div><h3>Prompt</h3><div class="markdown-preview">' + escapeHtml(microrepte.prompt || '') + '</div></div>' +
        '<div class="feedback-grid">' +
          '<div><h3>challenge.json</h3><div class="json-preview">' + escapeHtml(JSON.stringify(challenge, null, 2)) + '</div></div>' +
          '<div><h3>rubric.json</h3><div class="json-preview">' + escapeHtml(JSON.stringify(rubric, null, 2)) + '</div></div>' +
        '</div>' +
        '<div id="microrepteEditContainer"></div>';
      attachMicrorepteDetailListeners(microrepte);
    }

    async function showMicrorepteDetail(challengeId) {
      const viewer = document.querySelector('#microrepteViewer');
      viewer.innerHTML = '<div class="viewer-empty">Carregant microrepte...</div>';

      try {
        const response = await fetch('/api/microreptes/' + encodeURIComponent(challengeId));
        const microrepte = await response.json();
        if (!response.ok) throw new Error(microrepte.error || 'No s’ha pogut carregar el microrepte.');
        renderMicrorepteDetail(microrepte);
      } catch (error) {
        viewer.innerHTML = '<div class="viewer-empty error">' + escapeHtml(error.message) + '</div>';
      }
    }

    async function editMicrorepteFromTable(challengeId) {
      const viewer = document.querySelector('#microrepteViewer');
      viewer.innerHTML = '<div class="viewer-empty">Carregant edició...</div>';

      try {
        const response = await fetch('/api/microreptes/' + encodeURIComponent(challengeId));
        const microrepte = await response.json();
        if (!response.ok) throw new Error(microrepte.error || 'No s’ha pogut carregar el microrepte.');
        renderMicrorepteDetail(microrepte);
        document.querySelector('#editMicrorepte')?.click();
      } catch (error) {
        viewer.innerHTML = '<div class="viewer-empty error">' + escapeHtml(error.message) + '</div>';
      }
    }

    function clearViewer() {
      document.querySelector('#resultViewer').innerHTML = '<div class="viewer-empty">Selecciona un resultat amb el botó Veure.</div>';
    }

    function renderGradeDetail(detail) {
      const grade = detail.grade || {};
      const result = detail.result || {};
      const score = result.final_score_over_10 ?? grade.score ?? '-';
      const confidence = result.confidence ?? grade.confidence ?? 0;
      const reviewRequired = Boolean(result.teacher_review_required ?? grade.teacher_review_required);
      const markdown = detail.markdown || result.short_feedback_md || grade.feedback || '';
      const flags = result.blocking_flags || [];

      document.querySelector('#resultViewer').innerHTML =
        '<div class="result-header">' +
          '<div class="metric"><span>Repositori</span><strong>' + repositoryLink(grade.repo) + '</strong><p class="status">' + escapeHtml(grade.challenge_id) + '</p></div>' +
          '<div class="metric"><span>Nota</span><strong class="' + getScoreClass(Number(score) || 0) + '">' + escapeHtml(score) + '/10</strong></div>' +
          '<div class="metric"><span>Confiança</span><strong>' + Math.round((Number(confidence) || 0) * 100) + '%</strong></div>' +
          '<div class="metric"><span>Revisió</span><strong class="' + (reviewRequired ? 'error' : 'ok') + '">' + (reviewRequired ? 'Sí' : 'No') + '</strong></div>' +
        '</div>' +
        '<div class="file-note">Resultat: ' + escapeHtml(detail.files?.result || 'no disponible') + '</div>' +
        '<div>' +
          '<h3>Dimensions</h3>' +
          renderDimensions(result.dimension_scores) +
        '</div>' +
        '<div class="feedback-grid">' +
          '<div class="feedback-box"><h3>Punts forts</h3>' + renderList(result.strengths, 'Sense punts forts detallats.') + '</div>' +
          '<div class="feedback-box"><h3>Millores recomanades</h3>' + renderList(result.weaknesses, 'Sense millores detallades.') + '</div>' +
        '</div>' +
        '<div class="feedback-box"><h3>Flags bloquejants</h3>' + renderList(flags, 'Sense flags bloquejants.') + '</div>' +
        '<div>' +
          '<h3>Feedback complet</h3>' +
          '<div class="markdown-preview">' + escapeHtml(markdown) + '</div>' +
        '</div>';
    }

    async function showGradeDetail(gradeId) {
      const viewer = document.querySelector('#resultViewer');
      viewer.innerHTML = '<div class="viewer-empty">Carregant resultat...</div>';

      try {
        const response = await fetch('/api/grades/' + encodeURIComponent(gradeId));
        const detail = await response.json();
        if (!response.ok) throw new Error(detail.error || 'No s’ha pogut carregar el resultat.');
        renderGradeDetail(detail);
      } catch (error) {
        viewer.innerHTML = '<div class="viewer-empty error">' + escapeHtml(error.message) + '</div>';
      }
    }

    function clearStudentForm() {
      editingStudentId = null;
      document.querySelector('#studentName').value = '';
      document.querySelector('#studentRepo').value = '';
      document.querySelector('#studentGroup').value = '2DAW-A';
      document.querySelector('#saveStudent').textContent = 'Guardar';
      document.querySelector('#studentStatus').textContent = '';
    }

    function editStudent(studentId) {
      const student = students.find((item) => String(item.id) === String(studentId));
      if (!student) return;

      editingStudentId = student.id;
      document.querySelector('#studentName').value = student.student_name || '';
      document.querySelector('#studentRepo').value = student.repo || '';
      document.querySelector('#studentGroup').value = student.group_name || '2DAW-A';
      document.querySelector('#saveStudent').textContent = 'Actualitzar';
      document.querySelector('#studentStatus').textContent = 'Editant ' + (student.student_name || student.repo);
    }

    async function deleteStudentRow(studentId) {
      const student = students.find((item) => String(item.id) === String(studentId));
      if (!student) return;

      const gradeCount = Number(student.grade_count || 0);
      const warning = gradeCount > 0
        ? ' Té ' + gradeCount + ' resultat(s) associat(s), que també s’esborraran.'
        : '';

      if (!confirm('Eliminar ' + (student.student_name || student.repo) + '?' + warning)) {
        return;
      }

      let deleteGithubRepo = false;
      if (confirm('Vols eliminar també el repositori de GitHub ' + student.repo + '? Aquesta acció és destructiva i no es pot desfer des del dashboard.')) {
        const typedRepo = prompt('Escriu el nom exacte del repositori per confirmar l’esborrat remot:', '');
        if (typedRepo !== student.repo) {
          throw new Error('No s’ha eliminat res: el repositori escrit no coincideix.');
        }
        deleteGithubRepo = true;
      }

      const params = new URLSearchParams();
      if (deleteGithubRepo) {
        params.set('delete_github_repo', 'true');
      }

      const requestUrl = '/api/students/' + encodeURIComponent(studentId) + (params.toString() ? '?' + params.toString() : '');
      const response = await fetch(requestUrl, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No s’ha pogut eliminar l’alumne.');
      clearStudentForm();
      await loadStudents();
      return payload;
    }

    async function loadStudents() {
      const group = document.querySelector('#studentFilterGroup').value;
      const search = document.querySelector('#studentSearch').value;
      const params = new URLSearchParams();
      if (group) params.append('group', group);
      if (search) params.append('search', search);

      try {
        const response = await fetch('/api/students?' + params.toString());
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’han pogut carregar els alumnes.');
        students = payload.students || [];
        const rows = students.map((student) => (
          '<tr>' +
            '<td>' + escapeHtml(student.student_name || '') + '</td>' +
            '<td>' + repositoryLink(student.repo || '') + '</td>' +
            '<td>' + escapeHtml(student.group_name || '') + '</td>' +
            '<td>' + escapeHtml(student.grade_count ?? 0) + '</td>' +
            '<td><div class="compact-actions">' +
              '<button class="secondary" type="button" data-student-edit="' + escapeHtml(student.id) + '">Editar</button>' +
              '<button class="secondary" type="button" data-student-delete="' + escapeHtml(student.id) + '">Eliminar</button>' +
            '</div></td>' +
          '</tr>'
        ));
        document.querySelector('#studentRows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="5">No hi ha alumnes.</td></tr>';
        document.querySelectorAll('[data-student-edit]').forEach((button) => {
          button.addEventListener('click', () => editStudent(button.dataset.studentEdit));
        });
        document.querySelectorAll('[data-student-delete]').forEach((button) => {
          button.addEventListener('click', async () => {
            try {
              const result = await deleteStudentRow(button.dataset.studentDelete);
              if (result) {
                const githubMessage = result.github
                  ? (result.github.deleted
                    ? ' Repositori GitHub eliminat: ' + escapeHtml(result.github.repo) + '.'
                    : ' No s’ha pogut eliminar el repositori GitHub: ' + escapeHtml(result.github.error || 'error desconegut') + '.')
                  : '';
                document.querySelector('#studentStatus').innerHTML = '<span class="ok">Alumne eliminat. Resultats esborrats: ' + escapeHtml(result.deleted_grades || 0) + '.' + githubMessage + '</span>';
              }
            } catch (error) {
              document.querySelector('#studentStatus').innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
            }
          });
        });
        document.querySelector('#studentStatus').textContent = 'Mostrant ' + students.length + ' alumnes';
      } catch (error) {
        document.querySelector('#studentStatus').innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    async function saveStudent() {
      const status = document.querySelector('#studentStatus');
      const student = {
        student_name: document.querySelector('#studentName').value,
        repo: document.querySelector('#studentRepo').value,
        group_name: document.querySelector('#studentGroup').value
      };
      const url = editingStudentId ? '/api/students/' + encodeURIComponent(editingStudentId) : '/api/students';
      const method = editingStudentId ? 'PUT' : 'POST';

      try {
        const response = await fetch(url, {
          method,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(student)
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut guardar l’alumne.');
        clearStudentForm();
        await loadStudents();
        await loadConfig();
        status.innerHTML = '<span class="ok">Alumne guardat.</span>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    async function importStudents() {
      const status = document.querySelector('#studentStatus');
      try {
        const response = await fetch('/api/students/import-course', { method: 'POST' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’han pogut importar els alumnes.');
        await loadStudents();
        status.innerHTML = '<span class="ok">Alumnes importats des de course.</span>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    async function syncStudents() {
      const status = document.querySelector('#studentStatus');
      try {
        const response = await fetch('/api/students/sync-course', { method: 'POST' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’han pogut sincronitzar els fitxers.');
        await loadConfig();
        status.innerHTML = '<span class="ok">Fitxers course sincronitzats (' + payload.students + ' alumnes).</span>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    async function readCreateReposCsv() {
      const fileInput = document.querySelector('#createReposCsvFile');
      const textInput = document.querySelector('#createReposCsvText');
      const file = fileInput?.files?.[0];
      if (file) {
        return file.text();
      }

      return textInput.value;
    }

    async function runCreateStudentRepos() {
      const status = document.querySelector('#createReposStatus');
      const output = document.querySelector('#createReposOutput');
      const button = document.querySelector('#createReposRun');
      const dryRun = document.querySelector('#createReposDryRun').checked;
      const body = {
        org: document.querySelector('#createReposOrg').value,
        template: document.querySelector('#createReposTemplate').value,
        repo_prefix: document.querySelector('#createReposPrefix').value,
        default_group: document.querySelector('#createReposDefaultGroup').value,
        permission: document.querySelector('#createReposPermission').value,
        dry_run: dryRun,
        no_invite: document.querySelector('#createReposNoInvite').checked,
        csv: await readCreateReposCsv()
      };

      if (!dryRun && !confirm('Aquesta execució crearà repositoris a GitHub, enviarà invitacions si no ho has desactivat i actualitzarà els fitxers course. Vols continuar?')) {
        return;
      }

      button.disabled = true;
      status.textContent = dryRun ? 'Executant prova...' : 'Creant repositoris...';
      output.classList.remove('hidden');
      output.textContent = '';

      try {
        const response = await fetch('/api/students/create-repos', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut executar el script.');
        output.textContent = [payload.stdout || '', payload.stderr || ''].filter(Boolean).join('\\n');
        if (!dryRun) {
          await loadStudents();
        }
        status.innerHTML = '<span class="ok">' + (dryRun ? 'Prova completada.' : 'Repositoris processats i alumnes importats.') + '</span>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      } finally {
        button.disabled = false;
      }
    }

    function refreshMicrorepteRepteFilter() {
      const select = document.querySelector('#microrepteFilterRepte');
      const current = select.value;
      const reptes = [...new Set(microreptes.map((microrepte) => microrepte.repte_id).filter(Boolean))].sort();
      select.innerHTML = '<option value="">Tots</option>' + reptes.map((repte) => (
        '<option value="' + escapeHtml(repte) + '">' + escapeHtml(repte) + '</option>'
      )).join('');
      select.value = reptes.includes(current) ? current : '';
    }

    function renderMicrorepteRows() {
      const repte = document.querySelector('#microrepteFilterRepte').value;
      const search = document.querySelector('#microrepteSearch').value.trim().toLowerCase();
      const filtered = microreptes.filter((microrepte) => {
        const matchesRepte = !repte || microrepte.repte_id === repte;
        const haystack = [
          microrepte.id,
          microrepte.repte_id,
          microrepte.session_code,
          microrepte.microrepte_code,
          microrepte.title
        ].join(' ').toLowerCase();
        return matchesRepte && (!search || haystack.includes(search));
      });

      const rows = filtered.map((microrepte) => (
        '<tr>' +
          '<td><code>' + escapeHtml(microrepte.repte_id || '') + '</code></td>' +
          '<td>' + escapeHtml(microrepte.session_code || '') + '</td>' +
          '<td>' + escapeHtml(microrepte.microrepte_code || '') + '</td>' +
          '<td><code>' + escapeHtml(microrepte.challenge?.primary_ra || '') + '</code></td>' +
          '<td>' + escapeHtml(microrepte.title || '') + '</td>' +
          '<td>' + formatPercent(microrepte.repte_weight) + '</td>' +
          '<td>' + escapeHtml(microrepte.dimension_count) + ' dims · ' + escapeHtml(microrepte.dimension_weight_sum) + '</td>' +
          '<td>' + renderMicrorepteValidation(microrepte.validation) + '</td>' +
          '<td><div class="compact-actions">' +
            '<button class="secondary" type="button" data-microrepte-id="' + escapeHtml(microrepte.id) + '">Veure</button>' +
            '<button type="button" data-microrepte-edit="' + escapeHtml(microrepte.id) + '">Editar</button>' +
          '</div></td>' +
        '</tr>'
      ));

      document.querySelector('#microrepteRows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="9">No hi ha microreptes.</td></tr>';
      document.querySelectorAll('[data-microrepte-id]').forEach((button) => {
        button.addEventListener('click', () => showMicrorepteDetail(button.dataset.microrepteId));
      });
      document.querySelectorAll('[data-microrepte-edit]').forEach((button) => {
        button.addEventListener('click', () => editMicrorepteFromTable(button.dataset.microrepteEdit));
      });
      document.querySelector('#microreptesInfo').textContent = 'Mostrant ' + filtered.length + ' de ' + microreptes.length + ' microreptes';
    }

    async function loadMicroreptes() {
      try {
        const response = await fetch('/api/microreptes');
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’han pogut carregar els microreptes.');
        microreptes = payload.microreptes || [];
        refreshCorrectionChallengeSelect();
        refreshMicrorepteRepteFilter();
        renderMicrorepteRows();
      } catch (error) {
        document.querySelector('#microreptesInfo').innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    function parseManualRepositoriesInput() {
      const target = document.querySelector('#targetGroup').value;
      const defaultGroup = target === 'all' ? '2DAW-A' : target;
      const raw = document.querySelector('#repositories').value.trim();

      if (!raw) {
        return null;
      }

      return raw
        .split(/[\\s,;]+/)
        .filter(Boolean)
        .reduce((items, token, index, tokens) => {
          if (!token.includes('/')) {
            return items;
          }
          const next = tokens[index + 1];
          const group = /^2DAW-[A-D]$/.test(next || '') ? next : defaultGroup;
          items.push({ repo: token, group, name: '' });
          return items;
        }, []);
    }

    function selectedRepositories() {
      const target = document.querySelector('#targetGroup').value;
      const selectedStudent = document.querySelector('#correctionStudent')?.value || '';
      if (selectedStudent) {
        const allRepositories = config.repositories_by_target.all?.repositories || [];
        const student = allRepositories.find((item) => item.repo === selectedStudent) || {
          repo: selectedStudent,
          group: target === 'all' ? '2DAW-A' : target,
          name: ''
        };

        return {
          source_type: 'student',
          source: 'Alumne concret seleccionat',
          repositories: [student]
        };
      }

      const manual = parseManualRepositoriesInput();
      if (manual) {
        return {
          source_type: 'manual',
          source: 'Repositoris puntuals escrits manualment',
          repositories: manual
        };
      }

      const entry = config.repositories_by_target[target];
      return {
        source_type: 'students',
        source: 'Alumnes registrats: ' + target,
        repositories: entry.repositories
      };
    }

    function refreshTable() {
      const selected = selectedRepositories();
      const target = document.querySelector('#targetGroup').value;
      const branch = document.querySelector('#studentRef').value.trim() || 'main';
      const selectedChallenge = document.querySelector('#correctionChallenge')?.value || '';
      const rows = selected.repositories.map((item) => {
        const group = item.group || (target === 'all' ? '' : target);
        const challengeId = challengeFor(item.repo, group);
        return '<tr>' +
          '<td>' + repositoryLink(item.repo) + '</td>' +
          '<td>' + escapeHtml(group || 'n/d') + '</td>' +
          '<td><code>' + escapeHtml(branch) + '</code></td>' +
          '<td>' + microrepteLabel(challengeId) + '</td>' +
          '<td><code>' + escapeHtml(microrepteRa(challengeId)) + '</code></td>' +
          '<td>' + escapeHtml(challengeOriginFor(item.repo, group)) + '</td>' +
        '</tr>';
      });
      document.querySelector('#repoRows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="6">No hi ha repositoris seleccionats.</td></tr>';
      document.querySelector('#correctionPreview').innerHTML =
        '<h3>Què es corregirà</h3>' +
        '<p><strong>Repositoris:</strong> ' + escapeHtml(selected.source) + '</p>' +
        '<p><strong>Branca corregible:</strong> <code>' + escapeHtml(branch) + '</code></p>' +
        '<p><strong>Microrepte:</strong> ' + (selectedChallenge ? 'selecció manual per a esta execució.' : 'configuració activa: assignació individual en <code>course/active-challenges.json</code>; si no existeix, assignació del grup.') + '</p>' +
        '<p><strong>Criteri de branques:</strong> el lliurament corregible ha d’estar integrat en <code>main</code>. Les branques de treball són opcionals i no es corregeixen si no s’indiquen explícitament.</p>';
    }

    async function loadConfig() {
      const response = await fetch('/api/config');
      config = await response.json();
      if (microreptes.length === 0) {
        const microrepteResponse = await fetch('/api/microreptes');
        const payload = await microrepteResponse.json();
        microreptes = payload.microreptes || [];
      }
      refreshCorrectionChallengeSelect();
      refreshCorrectionStudentSelect();
      document.querySelector('#githubStatus').innerHTML =
        'GitHub: <code>' + config.github.owner + '/' + config.github.repo + '@' + config.github.ref + '</code> · Token configurat: ' +
        (config.github.token_configured ? '<span class="ok">sí</span>' : '<span class="error">no</span>');
      document.querySelector('#createReposOrg').value = config.github.classroom_org || '';
      document.querySelector('#createReposTemplate').value = config.github.student_template || '';
      refreshTable();
    }

    async function loadChallenges() {
      try {
        const response = await fetch('/api/challenges');
        const data = await response.json();
        allChallenges = data.challenges || [];
        const select = document.querySelector('#filterChallenge');
        const current = select.value;
        select.innerHTML = '<option value="">Tots</option>' + 
          allChallenges.map(c => '<option value="' + escapeHtml(c.challenge_id) + '">' + escapeHtml(c.challenge_id) + '</option>').join('');
        select.value = current;
      } catch (error) {
        console.error('Error cargando reptes:', error);
      }
    }

    async function loadGrades() {
      const group = document.querySelector('#filterGroup').value;
      const challenge = document.querySelector('#filterChallenge').value;
      const repo = document.querySelector('#filterRepo').value;

      const params = new URLSearchParams();
      if (group) params.append('group', group);
      if (challenge) params.append('challenge', challenge);
      if (repo) params.append('repo', repo);

      try {
        const response = await fetch('/api/grades?' + params.toString());
        const payload = await response.json();
        const grades = payload.grades || [];
        const rows = grades.slice(0, 100).map((grade) => {
          const scoreClass = getScoreClass(grade.score || 0);
          const reviewClass = grade.teacher_review_required ? 'review-required' : '';
          return '<tr class="' + reviewClass + '">' +
            '<td>' + formatTimestamp(grade.timestamp) + '</td>' +
            '<td>' + repositoryLink(grade.repo || '') + '</td>' +
            '<td>' + escapeHtml(grade.group_name || '') + '</td>' +
            '<td><code>' + escapeHtml(grade.challenge_id || '') + '</code></td>' +
            '<td class="' + scoreClass + '">' + escapeHtml(grade.score ?? '-') + '</td>' +
            '<td>' + Math.round((grade.confidence || 0) * 100) + '%</td>' +
            '<td>' + escapeHtml(grade.source || '') + '</td>' +
            '<td><div class="compact-actions">' +
              '<button class="secondary" type="button" data-grade-id="' + escapeHtml(grade.id) + '" data-grade-repo="' + escapeHtml(grade.repo || '') + '" data-grade-challenge="' + escapeHtml(grade.challenge_id || '') + '">Veure</button>' +
              '<button class="secondary" type="button" data-grade-recalc="' + escapeHtml(grade.id) + '" data-grade-repo="' + escapeHtml(grade.repo || '') + '" data-grade-challenge="' + escapeHtml(grade.challenge_id || '') + '" data-grade-group="' + escapeHtml(grade.group_name || '') + '" data-grade-source="' + escapeHtml(grade.source || '') + '">Recalcular</button>' +
              '<button class="secondary" type="button" data-grade-delete="' + escapeHtml(grade.id) + '" data-grade-repo="' + escapeHtml(grade.repo || '') + '" data-grade-challenge="' + escapeHtml(grade.challenge_id || '') + '">Esborrar</button>' +
            '</div></td>' +
            '</tr>';
        });
        document.querySelector('#gradeRows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="8">No hi ha resultats.</td></tr>';
        document.querySelectorAll('[data-grade-id]').forEach((button) => {
          button.addEventListener('click', () => showGradeDetail(button.dataset.gradeId));
        });
        document.querySelectorAll('[data-grade-recalc]').forEach((button) => {
          button.addEventListener('click', () => recalculateGrade(button.dataset.gradeRepo, button.dataset.gradeChallenge, button.dataset.gradeGroup, button.dataset.gradeSource));
        });
        document.querySelectorAll('[data-grade-delete]').forEach((button) => {
          button.addEventListener('click', () => deleteGradeRow(button.dataset.gradeDelete, button.dataset.gradeRepo, button.dataset.gradeChallenge));
        });
        document.querySelector('#gradesInfo').textContent = 'Mostrant ' + grades.length + ' resultats';
        await loadRaGrades(params);
        await loadRepteGrades(params);
      } catch (error) {
        document.querySelector('#gradesInfo').textContent = 'Error: ' + error.message;
      }
    }

    async function importLatestGrades() {
      const button = document.querySelector('#refreshGrades');
      const status = document.querySelector('#gradesInfo');
      button.disabled = true;
      status.textContent = 'Important últim artifact de correcció...';
      try {
        const response = await fetch('/api/grades/import-latest', { method: 'POST' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut importar l’artifact.');
        status.textContent = 'Resultats importats. Actualitzant vista...';
        await loadGrades();
      } catch (error) {
        status.textContent = 'Error important resultats: ' + error.message;
      } finally {
        button.disabled = false;
      }
    }

    async function buildClassReport() {
      const button = document.querySelector('#buildClassReport');
      const status = document.querySelector('#gradesInfo');
      const panel = document.querySelector('#classReportPanel');
      const group = document.querySelector('#filterGroup').value;
      const challengeId = document.querySelector('#filterChallenge').value;

      if (!group) {
        status.innerHTML = '<span class="error">Selecciona un grup concret per generar l’informe de classe.</span>';
        return;
      }

      if (!challengeId) {
        status.innerHTML = '<span class="error">Selecciona un microrepte concret per generar l’informe de classe.</span>';
        return;
      }

      button.disabled = true;
      status.textContent = 'Generant informe de classe...';
      panel.classList.add('hidden');
      panel.innerHTML = '';

      try {
        const response = await fetch('/api/grades/class-report', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            group,
            challenge_id: challengeId
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut generar l’informe.');
        panel.innerHTML = renderMarkdown(payload.markdown || '');
        panel.classList.remove('hidden');
        status.innerHTML = '<span class="ok">Informe generat: <code>' + escapeHtml(payload.report_path || '') + '</code></span>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      } finally {
        button.disabled = false;
      }
    }

    async function loadRaGrades(params) {
      const response = await fetch('/api/ra-grades?' + params.toString());
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No s’han pogut carregar les notes per RA.');

      const rows = (payload.ra_grades || []).map((item) => {
        const microreptesText = item.microreptes.map((microrepte) => (
          microrepte.microrepte_code + ' ' + Number(microrepte.score ?? 0).toFixed(2) + ' x ' + Math.round(microrepte.weight * 100) + '%'
        )).join(', ');

        return '<tr>' +
          '<td>' + repositoryLink(item.repo || '') + '</td>' +
          '<td>' + escapeHtml(item.group_name || '') + '</td>' +
          '<td><code>' + escapeHtml(item.repte_id || '') + '</code></td>' +
          '<td><code>' + escapeHtml(item.primary_ra || '') + '</code></td>' +
          '<td class="' + getScoreClass(item.score || 0) + '">' + escapeHtml(item.score ?? '-') + '</td>' +
          '<td>' + escapeHtml(microreptesText) + '</td>' +
        '</tr>';
      });

      document.querySelector('#raGradeRows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="6">No hi ha notes amb RA avaluat.</td></tr>';
    }

    function renderExtension(item) {
      const ext = item.extension;
      if (!ext) return 'Sense ampliació configurada';
      const state = { pending: 'Pendent de presentació', stale: 'Revisió anterior desactualitzada', incomplete: 'Falten microreptes', validated: 'Ampliació validada' }[ext.status];
      let html = '<p>Nucli /10: <strong>' + escapeHtml(ext.core_score ?? '—') + '</strong> · Base /9: ' + escapeHtml(ext.base_score ?? '—') + '</p>' +
        '<p>Nota calculada /10: <strong>' + escapeHtml(ext.final_score ?? 'pendent') + '</strong>' + (ext.provisional ? ' · provisional' : '') + '</p>' +
        '<p>' + escapeHtml(state) + ' · ' + escapeHtml(ext.source_microrepte_code) + '</p>';
      if (!item.can_review_extension) return html;
      html += '<p>Proposta IA /1: ' + escapeHtml(ext.proposed_score ?? 'sense proposta') + '</p>';
      if (ext.proposal) {
        html += '<details><summary>Evidències i punts per a la presentació</summary><p>' + escapeHtml(ext.proposal.reason) + '</p><ul>' +
          [...ext.proposal.evidence, ...ext.proposal.presentation_checks].map(x => '<li>' + escapeHtml(x) + '</li>').join('') + '</ul></details>';
      }
      const disabled = ext.core_complete ? '' : ' disabled';
      html += '<label>Ampliació validada /1 <select data-extension-score data-source="' + escapeHtml(ext.source_challenge_id) + '" data-snapshot="' + escapeHtml(ext.snapshot) + '"' + disabled + '>' +
        '<option value="" disabled>Pendent</option>' + [0, 0.25, 0.5, 0.75, 1].map(x => '<option value="' + x + '"' + (ext.validated_score === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label>' +
        '<label><input type="checkbox" data-extension-core' + (ext.review?.core_requirements_met ? ' checked' : '') + disabled + '> Mínims del repte comprovats</label>' +
        '<label>Observació de la presentació<textarea data-extension-comment rows="2"' + disabled + '>' + escapeHtml(ext.review?.comment || '') + '</textarea></label>';
      return html;
    }

    async function loadRepteGrades(params) {
      const response = await fetch('/api/repte-grades?' + params.toString());
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No s’han pogut carregar les notes per repte.');

      const rows = (payload.repte_grades || []).map((item) => {
        const raText = item.ra_scores.map((raScore) => (
          raScore.ra_id + ': ' + Number(raScore.auto_score ?? 0).toFixed(2)
        )).join(', ');
        const teacherScore = typeof item.teacher_score === 'number'
          ? Number(item.teacher_score).toFixed(2)
          : '';

        return '<tr>' +
          '<td>' + repositoryLink(item.repo || '') + '</td>' +
          '<td>' + escapeHtml(item.group_name || '') + '</td>' +
          '<td><code>' + escapeHtml(item.repte_id || '') + '</code></td>' +
          '<td>' + escapeHtml(raText || 'Sense notes RA') + '</td>' +
          '<td>' + renderExtension(item) + '</td>' +
          '<td><input data-teacher-score type="number" min="0" max="10" step="0.01" value="' + escapeHtml(teacherScore) + '"></td>' +
          '<td><textarea data-teacher-comment rows="2">' + escapeHtml(item.teacher_comment || '') + '</textarea></td>' +
          '<td><input data-teacher-review type="checkbox"' + (item.teacher_review_required ? ' checked' : '') + '></td>' +
          '<td><button class="secondary" type="button" data-save-teacher-repte data-repo="' + escapeHtml(item.repo || '') + '" data-group="' + escapeHtml(item.group_name || '') + '" data-repte="' + escapeHtml(item.repte_id || '') + '">Guardar</button></td>' +
        '</tr>';
      });

      document.querySelector('#repteGradeRows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="9">No hi ha notes agregades per repte.</td></tr>';
      document.querySelectorAll('[data-save-teacher-repte]').forEach((button) => {
        button.addEventListener('click', () => saveTeacherRepteGrade(button));
      });
    }

    async function saveTeacherRepteGrade(button) {
      const row = button.closest('tr');
      const status = document.querySelector('#gradesInfo');
      const scoreInput = row.querySelector('[data-teacher-score]');
      const commentInput = row.querySelector('[data-teacher-comment]');
      const reviewInput = row.querySelector('[data-teacher-review]');
      const extensionInput = row.querySelector('[data-extension-score]');
      button.disabled = true;
      status.className = 'status';
      status.textContent = 'Guardant nota docent...';

      try {
        const response = await fetch('/api/repte-grades/teacher', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            repo: button.dataset.repo,
            group_name: button.dataset.group,
            repte_id: button.dataset.repte,
            teacher_score: scoreInput.value,
            teacher_comment: commentInput.value,
            teacher_review_required: reviewInput.checked,
            extension_review: extensionInput && extensionInput.value !== '' ? {
              source_challenge_id: extensionInput.dataset.source,
              snapshot: extensionInput.dataset.snapshot,
              validated_score: Number(extensionInput.value),
              core_requirements_met: row.querySelector('[data-extension-core]').checked,
              comment: row.querySelector('[data-extension-comment]').value
            } : undefined
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No s’ha pogut guardar la nota docent.');
        status.innerHTML = '<span class="ok">Nota docent guardada.</span>';
        await loadGrades();
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      } finally {
        button.disabled = false;
      }
    }

    async function recalculateWorkflow(inputs, statusElement) {
      statusElement.className = 'status';
      statusElement.textContent = 'Llançant recalcul...';
      try {
        const response = await fetch('/api/run', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(inputs)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error desconegut');
        const actionLink = result.run_url || result.actions_url;
        const linkText = result.run_url ? 'Obrir run' : 'Obrir Actions';
        const statusText = result.run_status ? ' Estat inicial: ' + escapeHtml(result.run_status) + '.' : '';
        statusElement.innerHTML = '<span class="ok">Recalcul enviat a GitHub Actions.</span>' + statusText + ' Pot estar esperant runner. <a href="' + escapeHtml(actionLink) + '" target="_blank" rel="noreferrer">' + linkText + '</a>. Quan acabe, prem Actualitzar per importar el resultat.';
      } catch (error) {
        statusElement.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    async function deleteGradeRow(gradeId, repo, challengeId) {
      const status = document.querySelector('#gradesInfo');
      if (!confirm('Esborrar el resultat de ' + repo + ' per a ' + challengeId + '? La nota agregada del microrepte es recalcularà.')) {
        return;
      }

      status.className = 'status';
      status.textContent = 'Esborrant resultat i recalculant agregats...';
      try {
        const response = await fetch('/api/grades/' + encodeURIComponent(gradeId), { method: 'DELETE' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’ha pogut esborrar el resultat.');
        await loadGrades();
        status.innerHTML = '<span class="ok">Resultat esborrat. Agregats recalculats.</span>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
      }
    }

    async function recalculateGrade(repo, challengeId, groupName, source) {
      const status = document.querySelector('#gradesInfo');
      if (!repo || !challengeId) {
        status.innerHTML = '<span class="error">No es pot recalcular: falta repositori o repte.</span>';
        return;
      }
      const mode = String(source || '').toLowerCase() === 'openai' ? 'openai' : 'mock';
      const targetGroup = groupName || document.querySelector('#filterGroup')?.value || 'all';
      await recalculateWorkflow({
        target_group: targetGroup || 'all',
        challenge_id: challengeId,
        mode,
        student_ref: 'main',
        publish_to_student_repo: false,
        repositories: repo + ' ' + (groupName || targetGroup || 'all')
      }, status);
    }

    async function recalculateFilteredGrades() {
      const status = document.querySelector('#gradesInfo');
      const group = document.querySelector('#filterGroup').value || 'all';
      const challenge = document.querySelector('#filterChallenge').value;
      const repo = document.querySelector('#filterRepo').value.trim();

      if (!challenge) {
        status.innerHTML = '<span class="error">Selecciona un repte per recalcular.</span>';
        return;
      }

      const mode = document.querySelector('#mode')?.value || 'mock';
      if (repo) {
        await recalculateWorkflow({
          target_group: group,
          challenge_id: challenge,
          mode,
          student_ref: 'main',
          publish_to_student_repo: false,
          repositories: repo + ' ' + group
        }, status);
        return;
      }

      const groupInfo = config.repositories_by_target[group] || config.repositories_by_target.all;
      if (!groupInfo || !groupInfo.repositories.length) {
        status.innerHTML = '<span class="error">No hi ha repositoris disponibles per al grup seleccionat.</span>';
        return;
      }

      await recalculateWorkflow({
        target_group: group,
        challenge_id: challenge,
        mode,
        student_ref: 'main',
        publish_to_student_repo: false,
        repositories: groupInfo.repositories.map((item) => item.repo + ' ' + item.group).join('\\n')
      }, status);
    }

    async function runWorkflow() {
      const button = document.querySelector('#runButton');
      const status = document.querySelector('#runStatus');
      button.disabled = true;
      status.className = 'status';
      status.textContent = 'Llançant...';
      try {
        await loadConfig();
        const selected = selectedRepositories();
        if (!selected.repositories.length) throw new Error('No hi ha alumnes per a corregir en la selecció.');
        const body = {
          target_group: document.querySelector('#targetGroup').value,
          challenge_id: document.querySelector('#correctionChallenge').value,
          mode: document.querySelector('#mode').value,
          student_ref: document.querySelector('#studentRef').value,
          publish_to_student_repo: document.querySelector('#publish').value === 'true',
          repositories: selected.repositories.map((item) => [item.repo, item.group].filter(Boolean).join(' ')).join('\\n')
        };
        const response = await fetch('/api/run', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error desconegut');
        status.innerHTML = '<span class="ok">Workflow llançat.</span> <a href="' + result.actions_url + '" target="_blank" rel="noreferrer">Obrir Actions</a>';
        await loadGrades();
      } catch (error) {
        status.innerHTML = '<span class="error">' + error.message + '</span>';
      } finally {
        button.disabled = false;
      }
    }

    async function auditAgentRules() {
      const button = document.querySelector('#auditAgentRulesButton');
      const status = document.querySelector('#auditAgentRulesStatus');
      button.disabled = true;
      status.className = 'status';
      status.textContent = 'Llançant auditoria...';
      try {
        const response = await fetch('/api/audit-agent-rules', { method: 'POST' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error desconegut');
        const targetUrl = result.run_url || result.actions_url;
        status.innerHTML = '<span class="ok">Auditoria llançada.</span> <a href="' + targetUrl + '" target="_blank" rel="noreferrer">Veure execució</a>';
      } catch (error) {
        status.innerHTML = '<span class="error">' + error.message + '</span>';
      } finally {
        button.disabled = false;
      }
    }

    document.querySelector('#targetGroup').addEventListener('change', refreshTable);
    document.querySelector('#studentRef').addEventListener('input', refreshTable);
    document.querySelector('#correctionChallenge').addEventListener('change', refreshTable);
    document.querySelector('#correctionStudent').addEventListener('change', refreshTable);
    document.querySelector('#repositories').addEventListener('input', refreshTable);
    document.querySelectorAll('[data-nav-view]').forEach((button) => {
      button.addEventListener('click', () => showView(button.dataset.navView));
    });
    document.querySelector('#runButton').addEventListener('click', runWorkflow);
    document.querySelector('#auditAgentRulesButton').addEventListener('click', auditAgentRules);
    document.querySelector('#refreshGrades').addEventListener('click', importLatestGrades);
    document.querySelector('#recalculateFilteredGrades').addEventListener('click', recalculateFilteredGrades);
    document.querySelector('#buildClassReport').addEventListener('click', buildClassReport);
    document.querySelector('#applyFilters').addEventListener('click', () => loadGrades());
    document.querySelector('#clearViewer').addEventListener('click', clearViewer);
    document.querySelector('#saveStudent').addEventListener('click', saveStudent);
    document.querySelector('#clearStudentForm').addEventListener('click', clearStudentForm);
    document.querySelector('#applyStudentFilters').addEventListener('click', loadStudents);
    document.querySelector('#importStudents').addEventListener('click', importStudents);
    document.querySelector('#syncStudents').addEventListener('click', syncStudents);
    document.querySelector('#createReposRun').addEventListener('click', runCreateStudentRepos);
    document.querySelector('#refreshMicroreptes').addEventListener('click', loadMicroreptes);
    document.querySelector('#applyMicrorepteFilters').addEventListener('click', renderMicrorepteRows);
    document.querySelector('#clearMicrorepteViewer').addEventListener('click', clearMicrorepteViewer);
    document.querySelector('#refreshProgramacio').addEventListener('click', loadProgramacio);
    document.querySelector('#programacioFilterRepte').addEventListener('change', renderProgramacio);
    document.querySelector('#filterGroup').addEventListener('change', () => {
      document.querySelector('#filterChallenge').value = '';
    });

    loadConfig().catch((error) => {
      document.querySelector('#runStatus').innerHTML = '<span class="error">' + error.message + '</span>';
    });
    loadChallenges().catch(() => {});
    loadGrades().catch(() => {});
  </script>
</body>
</html>`;
}

async function handleRequest(request, response) {
  const url = new URL(request.url, 'http://localhost');
  const host = process.env.DASHBOARD_HOST || '127.0.0.1';

  if (!isDashboardRequestAuthorized(request, host)) {
    sendUnauthorized(response);
    return;
  }

  try {
    if (request.method === 'GET' && url.pathname === '/') {
      sendHtml(response, pageHtml());
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/config') {
      sendJson(response, 200, await buildConfigPayload());
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/grades') {
      const filters = {};
      if (url.searchParams.has('group')) filters.group_name = url.searchParams.get('group');
      if (url.searchParams.has('challenge')) filters.challenge_id = url.searchParams.get('challenge');
      if (url.searchParams.has('repo')) filters.repo = url.searchParams.get('repo');
      sendJson(response, 200, { grades: await readLatestGrades(filters) });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/grades/import-latest') {
      sendJson(response, 200, { import: await importLatestGradeArtifact() });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/grades/class-report') {
      const body = await readRequestJson(request);
      sendJson(response, 200, await buildClassFollowupReport(body));
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/ra-grades') {
      const filters = {};
      if (url.searchParams.has('group')) filters.group_name = url.searchParams.get('group');
      if (url.searchParams.has('challenge')) filters.challenge_id = url.searchParams.get('challenge');
      if (url.searchParams.has('repo')) filters.repo = url.searchParams.get('repo');
      sendJson(response, 200, { ra_grades: await readRaGrades(filters) });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/repte-grades') {
      const filters = {};
      if (url.searchParams.has('group')) filters.group_name = url.searchParams.get('group');
      if (url.searchParams.has('challenge')) filters.challenge_id = url.searchParams.get('challenge');
      if (url.searchParams.has('repo')) filters.repo = url.searchParams.get('repo');
      sendJson(response, 200, { repte_grades: await readRepteGrades(filters) });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/repte-grades/teacher') {
      const body = await readRequestJson(request);
      sendJson(response, 200, { teacher_grade: await saveTeacherRepteGrade(body) });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/microreptes') {
      const microreptes = await readMicroreptes();
      sendJson(response, 200, { microreptes });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/programacio-aula') {
      const sessions = await readClassroomProgramming();
      const repte = url.searchParams.get('repte');
      sendJson(response, 200, {
        sessions: repte ? sessions.filter((session) => session.repte_id === repte) : sessions
      });
      return;
    }

    const consolidationMatch = url.pathname.match(/^\/api\/programacio-aula\/([^/]+)\/consolidacio$/);
    if (consolidationMatch && ['GET', 'PUT', 'POST', 'DELETE'].includes(request.method)) {
      const session = await readClassroomSession(decodeURIComponent(consolidationMatch[1]));
      if (!session) { sendJson(response, 404, { error: 'Sessió no trobada.' }); return; }
      const code = consolidationCode(session);
      if (!code) {
        sendJson(response, request.method === 'GET' ? 200 : 400, { code: null, error: 'Esta sessió no té microrepte propi.' }); return;
      }
      if (request.method === 'GET') { sendJson(response, 200, await readConsolidation(rootDir, code)); return; }
      if (request.method === 'DELETE') {
        const withdrawn = await withdrawConsolidation({ code, token: process.env.GITHUB_TOKEN });
        try { await recordConsolidationPublication(rootDir, code, withdrawn); }
        catch { withdrawn.warning = 'Retirada enviada, però no s’ha pogut actualitzar el registre local.'; }
        sendJson(response, 200, withdrawn);
        return;
      }
      const body = await readRequestJson(request);
      const draft = await saveConsolidation(rootDir, code, body.markdown);
      if (request.method === 'PUT') { sendJson(response, 200, draft); return; }
      const published = await publishConsolidation({ code, markdown: draft.markdown, token: process.env.GITHUB_TOKEN });
      try { await recordConsolidationPublication(rootDir, code, published); }
      catch { published.warning = 'Publicació enviada, però no s’ha pogut guardar l’enllaç local. Consulta l’índex web.'; }
      sendJson(response, 200, published);
      return;
    }

    const classroomSessionMatch = url.pathname.match(/^\/api\/programacio-aula\/([^/]+)$/);
    if (request.method === 'PUT' && classroomSessionMatch) {
      const body = await readRequestJson(request);
      const markdown = String(body.markdown || '');
      if (!markdown.trim()) {
        sendJson(response, 400, { error: 'El Markdown no pot estar buit.' });
        return;
      }
      const session = await updateClassroomSessionMarkdown(decodeURIComponent(classroomSessionMatch[1]), markdown);
      sendJson(response, 200, { session });
      return;
    }

    const classroomNotesMatch = url.pathname.match(/^\/api\/programacio-aula\/([^/]+)\/notes$/);
    if (request.method === 'GET' && classroomNotesMatch) {
      const sessionId = decodeURIComponent(classroomNotesMatch[1]);
      sendJson(response, 200, { notes: getClassroomSessionNotes(sessionId) });
      return;
    }

    if (request.method === 'POST' && classroomNotesMatch) {
      const sessionId = decodeURIComponent(classroomNotesMatch[1]);
      const body = await readRequestJson(request);
      const sessionDate = String(body.session_date || '').trim();
      const groupName = typeof body.group_name === 'string' ? body.group_name.trim() : '';
      if (!groupName || groupName === 'all' || !Object.hasOwn(groupFiles, groupName)) {
        sendJson(response, 400, { error: 'Selecciona un grup vàlid per al comentari.' });
        return;
      }
      const comment = String(body.comment || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
        sendJson(response, 400, { error: 'La data ha de tindre format YYYY-MM-DD.' });
        return;
      }
      if (!comment) {
        sendJson(response, 400, { error: 'El comentari no pot estar buit.' });
        return;
      }
      insertClassroomSessionNote(sessionId, sessionDate, comment, groupName);
      sendJson(response, 200, { notes: getClassroomSessionNotes(sessionId) });
      return;
    }

    const microrepteMatch = url.pathname.match(/^\/api\/microreptes\/([^/]+)$/);
    if (request.method === 'GET' && microrepteMatch) {
      const microrepte = await readMicrorepteDetail(decodeURIComponent(microrepteMatch[1]));
      if (!microrepte) {
        sendJson(response, 404, { error: 'Microrepte no trobat' });
        return;
      }

      sendJson(response, 200, microrepte);
      return;
    }

    if (request.method === 'PUT' && microrepteMatch) {
      const body = await readRequestJson(request);
      const microrepte = await updateMicrorepte(decodeURIComponent(microrepteMatch[1]), body);
      sendJson(response, 200, microrepte);
      return;
    }

    const gradeDetailMatch = url.pathname.match(/^\/api\/grades\/(\d+)$/);
    if (request.method === 'GET' && gradeDetailMatch) {
      const detail = await readGradeDetail(Number(gradeDetailMatch[1]));
      if (!detail) {
        sendJson(response, 404, { error: 'Resultat no trobat' });
        return;
      }

      sendJson(response, 200, detail);
      return;
    }

    if (request.method === 'DELETE' && gradeDetailMatch) {
      const result = await deleteGradeAndAggregateResult(Number(gradeDetailMatch[1]));
      if (!result.grade) {
        sendJson(response, 404, { error: 'Resultat no trobat' });
        return;
      }

      sendJson(response, 200, {
        deleted: result.changes > 0,
        deleted_criteria: result.deleted_criteria || 0,
        deleted_latest_grades: result.deleted_latest_grades || 0,
        grade: result.grade
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/students') {
      const students = getStudents({
        group_name: url.searchParams.get('group') || null,
        search: url.searchParams.get('search') || null
      });
      sendJson(response, 200, { students });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/students') {
      const body = await readRequestJson(request);
      const student = validateStudentPayload(body);
      upsertStudent(student.repo, student.group_name, student.student_name);
      sendJson(response, 200, { student });
      return;
    }

    const studentMatch = url.pathname.match(/^\/api\/students\/(\d+)$/);
    if (studentMatch && request.method === 'PUT') {
      const body = await readRequestJson(request);
      const student = validateStudentPayload(body);
      updateStudent(Number(studentMatch[1]), student);
      sendJson(response, 200, { student });
      return;
    }

    if (studentMatch && request.method === 'DELETE') {
      const result = await deleteStudentAndAssociatedResults(Number(studentMatch[1]), {
        deleteGithubRepo: url.searchParams.get('delete_github_repo') === 'true'
      });
      sendJson(response, 200, {
        deleted: result.changes > 0,
        deleted_grades: result.deleted_grades || 0,
        deleted_criteria: result.deleted_criteria || 0,
        deleted_latest_grades: result.deleted_latest_grades || 0,
        deleted_teacher_repte_grades: result.deleted_teacher_repte_grades || 0,
        synced_course_files: result.synced_course_files || [],
        github: result.github || null
      });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/students/import-course') {
      const students = await importStudentsFromCourseFiles();
      sendJson(response, 200, { students });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/students/sync-course') {
      const result = await syncStudentRepositoryFiles();
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/students/create-repos') {
      const body = await readRequestJson(request);
      const result = await createStudentReposFromCsv(body);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/challenges') {
      const challenges = getChallenges();
      sendJson(response, 200, { challenges });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/statistics') {
      const group = url.searchParams.get('group') || null;
      const stats = getStatistics(group);
      sendJson(response, 200, { statistics: stats });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/run') {
      const body = await readRequestJson(request);
      const inputs = resolveWorkflowInputs(body);
      const result = await dispatchWorkflow(inputs);
      sendJson(response, 200, { ...result, inputs });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/audit-agent-rules') {
      const inputs = {
        organization: process.env.GITHUB_CLASSROOM_ORG || 'batoi-dwes-2026',
        repository_prefix: 'microreptes-',
        student_ref: 'main'
      };
      const result = await dispatchWorkflow(inputs, agentRulesAuditWorkflowFile);
      sendJson(response, 200, { ...result, inputs });
      return;
    }

    sendJson(response, 404, { error: 'Ruta no trobada' });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

await loadDotEnv();

// Inicialitzar BD i migrar dades si és la primera vegada
console.log('Inicialitzant BD...');
initDb();

try {
  if (getStudents().length === 0) {
    const importedStudents = await importStudentsFromCourseFiles();
    console.log(`Importats ${importedStudents.length} alumnes des dels fitxers course`);
  }
} catch (error) {
  console.warn('No s\'han pogut importar els alumnes des de course:', error.message);
}

// Migrar dades de JSON si existeix i la BD està buida
try {
  const grades = getLatestGrades(1);
  if (grades.length === 0) {
    console.log('Migrant dades de JSON a BD...');
    try {
      const jsonGrades = await readJson('grades/latest-grades.json');
      if (jsonGrades.length > 0) {
        migrateFromJson(jsonGrades);
        console.log(`Migrades ${jsonGrades.length} notes de JSON a BD`);
      }
    } catch (readError) {
      console.log('Archivo JSON no existe o no se puede leer, BD inicializada vacía');
    }
  }
} catch (error) {
  console.warn('No s\'han pogut migrar les dades:', error.message);
}

const port = Number(process.env.DASHBOARD_PORT || defaultPort);
const host = process.env.DASHBOARD_HOST || '127.0.0.1';
if (dashboardAuthRequired(host) && !dashboardCredentialsConfigured()) {
  console.error('DASHBOARD_USER i DASHBOARD_PASSWORD són obligatoris quan el dashboard no és només local.');
  process.exit(1);
}

const server = createServer((request, response) => {
  handleRequest(request, response);
});

server.listen(port, host, () => {
  console.log(`Dashboard disponible en http://${host}:${server.address().port}`);
  if (dashboardAuthRequired(host)) {
    console.log('Autenticació del dashboard activada.');
  }
});

// Tancar BD al finalitzar
process.on('SIGINT', () => {
  console.log('\nTancant BD...');
  closeDb();
  process.exit(0);
});
