import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { createHash, timingSafeEqual } from 'node:crypto';
import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import { constants, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { loadConfiguration, validId, validateProject } from '../scripts/pi/lib/config.mjs';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadDotEnv() {
  const file = path.join(root, '.env');
  if (!existsSync(file)) return;
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();
const host = process.env.DASHBOARD_HOST || '127.0.0.1';
const port = Number(process.env.DASHBOARD_PORT || 4173);

if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
  throw new Error('El dashboard PI només es pot escoltar en local; publiqueu-lo únicament mitjançant HTTPS i un proxy controlat.');
}

function hashValue(value) {
  return createHash('sha256').update(String(value)).digest();
}

function constantTimeTextEqual(left, right) {
  return timingSafeEqual(hashValue(left), hashValue(right));
}

function parseBasicAuth(header) {
  const match = String(header || '').match(/^Basic\s+(.+)$/i);
  if (!match) return null;
  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return null;
    return { user: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
  } catch {
    return null;
  }
}

function credentialsConfigured() {
  return Boolean(process.env.DASHBOARD_USER && process.env.DASHBOARD_PASSWORD);
}

export function authorizationAccepted(header, user = process.env.DASHBOARD_USER, password = process.env.DASHBOARD_PASSWORD) {
  if (!user || !password) return false;
  const credentials = parseBasicAuth(header);
  return Boolean(credentials) && constantTimeTextEqual(credentials.user, user) && constantTimeTextEqual(credentials.password, password);
}

function sendUnauthorized(response) {
  response.writeHead(401, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'www-authenticate': 'Basic realm="Evidencies PI", charset="UTF-8"'
  });
  response.end('Autenticació requerida.\n');
}

function escape(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function externalUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function layout(title, content) {
  const alumnatUrl = externalUrl(process.env.DASHBOARD_DOCS_ALUMNAT_URL || 'https://cipfpbatoi.github.io/pi2627/');
  const professoratUrl = externalUrl(process.env.DASHBOARD_DOCS_PROFESSORAT_URL || 'https://cipfpbatoi.github.io/pi2627-professorat/');
  return `<!doctype html><html lang="ca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(title)}</title><style>
  :root{color-scheme:light;--ink:#17202a;--muted:#566573;--line:#ccd1d1;--soft:#f4f6f7;--accent:#1769aa;--ok:#18794e;--bad:#b42318;--warn:#9a6700}*{box-sizing:border-box}body{font:16px/1.45 system-ui;max-width:1180px;margin:0 auto;padding:1.5rem;color:var(--ink)}nav{display:flex;gap:1rem;align-items:center;margin-bottom:2rem}nav a{font-weight:700}a{color:var(--accent)}h1{margin:.2rem 0}.lead{color:var(--muted);margin-top:.25rem}table{border-collapse:collapse;width:100%;margin:1rem 0 2rem}th,td{border:1px solid var(--line);padding:.6rem;text-align:left;vertical-align:top}th{background:#eaf2f8}code{background:var(--soft);padding:.15rem .3rem;overflow-wrap:anywhere}form{background:var(--soft);padding:1rem;border:1px solid var(--line);border-radius:.4rem;margin:1rem 0 2rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.8rem}label{display:block;font-weight:650}input,select{display:block;width:100%;padding:.55rem;margin-top:.2rem;border:1px solid #899;border-radius:.25rem;background:white}button{padding:.6rem .9rem;background:var(--accent);color:white;border:0;border-radius:.25rem;font-weight:700;cursor:pointer}.status-complete,.passed{color:var(--ok)}.status-incomplete,.failed{color:var(--bad)}.status-complete_with_warnings,.warning{color:var(--warn)}.notice{padding:.8rem;border-left:4px solid var(--accent);background:#eef6fc}.error{border-color:var(--bad);background:#fff1f0}.evidence{font-size:.92rem;color:var(--muted)}
  </style></head><body><nav><a href="/">Evidències PI</a><a href="/#projectes">Projectes</a><a href="/#recopilar">Recopilar</a>${alumnatUrl ? `<a href="${escape(alumnatUrl)}" rel="noreferrer">Documentació alumnat ↗</a>` : ''}${professoratUrl ? `<a href="${escape(professoratUrl)}" rel="noreferrer">Documentació professorat ↗</a>` : ''}</nav>${content}</body></html>`;
}

async function reports() {
  const dir = path.join(root, 'tmp/pi');
  if (!existsSync(dir)) return [];
  const result = [];
  for (const entry of await readdir(dir)) {
    if (!entry.endsWith('.json')) continue;
    try {
      const report = JSON.parse(await readFile(path.join(dir, entry), 'utf8'));
      result.push({ ...report, filename: entry });
    } catch { /* informe incomplet ignorat */ }
  }
  return result.sort((a, b) => String(b.generated_at).localeCompare(String(a.generated_at)));
}

function notice(searchParams) {
  if (searchParams.get('error')) return `<p class="notice error"><strong>Error:</strong> ${escape(searchParams.get('error'))}</p>`;
  if (searchParams.get('ok')) return `<p class="notice">${escape(searchParams.get('ok'))}</p>`;
  return '';
}

export function renderDashboard(projects, checkpoints, evidenceReports, message = '', githubConfigured = Boolean(process.env.GITHUB_TOKEN)) {
  const projectRows = [...projects.values()].map((project) => `<tr><td>${escape(project.name)}</td><td><code>${escape(project.id)}</code></td><td><a href="${escape(`https://github.com/${project.repository}`)}" rel="noreferrer">${escape(project.repository)}</a></td><td><a href="/projects/${encodeURIComponent(project.id)}/delete">Esborrar…</a></td></tr>`).join('');
  const reportRows = evidenceReports.map((report) => `<tr><td><a href="/reports/${encodeURIComponent(report.filename)}">${escape(report.project.name)}</a></td><td>${escape(report.checkpoint.name)}</td><td><code>${escape(report.version.requested_ref)}</code></td><td class="status-${escape(report.status)}">${escape(report.status)}</td><td>${escape(report.generated_at)}</td></tr>`).join('');
  const projectOptions = [...projects.values()].map((item) => `<option value="${escape(item.id)}">${escape(item.name)} (${escape(item.id)})</option>`).join('');
  const checkpointOptions = [...checkpoints.values()].map((item) => `<option value="${escape(item.id)}">${escape(item.name)}</option>`).join('');
  return layout('Evidències PI', `${message}<h1>Evidències del Projecte Intermodular</h1><p class="lead">Analitza una versió immutable d’un projecte i prepara evidències candidates per a la revisió docent. No gestiona parelles ni assigna qualificacions.</p>
  <h2 id="projectes">Projectes (${projects.size})</h2><table><thead><tr><th>Nom</th><th>ID</th><th>Repositori</th><th>Accions</th></tr></thead><tbody>${projectRows || '<tr><td colspan="4">No hi ha projectes registrats.</td></tr>'}</tbody></table>
  <details><summary><strong>Crear un repositori des de la plantilla</strong></summary><form method="post" action="/projects/from-template"><div class="grid"><label>Identificador del projecte<input name="id" required pattern="[a-z0-9][a-z0-9-]*" placeholder="hort-urba"></label><label>Nom del projecte<input name="name" required placeholder="Hort urbà col·laboratiu"></label><label>Organització GitHub<input name="owner" required value="${escape(process.env.PI_GITHUB_ORG || 'cipfpbatoi')}"></label><label>Nom del repositori<input name="repo-name" required pattern="[A-Za-z0-9._-]+" placeholder="pi-hort-urba"></label></div><p><label><input name="private" type="checkbox" checked style="display:inline;width:auto"> Repositori privat</label></p><p class="evidence">Plantilla: <code>${escape(process.env.PI_PROJECT_TEMPLATE || 'cipfpbatoi/pi2627-plantilla-projecte')}</code>. En crear-lo, també queda registrat en Evidències.</p>${githubConfigured ? '<button type="submit">Crear repositori i registrar-lo</button>' : '<p class="notice error">Falta configurar GITHUB_TOKEN en el servidor.</p>'}</form></details>
  <details><summary><strong>Registrar un repositori que ja existix</strong></summary><form method="post" action="/projects"><div class="grid"><label>Identificador<input name="id" required pattern="[a-z0-9][a-z0-9-]*" placeholder="hort-urba"></label><label>Nom<input name="name" required placeholder="Hort urbà col·laboratiu"></label><label>Repositori GitHub<input name="repository" required placeholder="organitzacio/repositori"></label></div><p><button type="submit">Guardar projecte</button></p></form></details>
  <h2>Punts de control (${checkpoints.size})</h2><ul>${[...checkpoints.values()].map((item) => `<li><code>${escape(item.id)}</code> — ${escape(item.name)}</li>`).join('')}</ul>
  <h2 id="recopilar">Recopilar evidències</h2>${projects.size ? `<form method="post" action="/reports"><div class="grid"><label>Projecte<select name="project-id" required>${projectOptions}</select></label><label>Punt de control<select name="checkpoint" required>${checkpointOptions}</select></label><label>Directori del repositori al servidor<input name="repo-dir" required placeholder="/var/www/projectes/hort-urba"></label><label>Etiqueta, branca o commit<input name="ref" required placeholder="dossier-0-v1.0"></label></div><p class="evidence">La referència es resol a un commit concret; l’informe no altera el repositori analitzat.</p><button type="submit">Recopilar i mostrar l’informe</button></form>` : '<p class="notice">Registra almenys un projecte abans de recopilar evidències.</p>'}
  <h2>Últims informes</h2><table><thead><tr><th>Projecte</th><th>Punt de control</th><th>Versió</th><th>Estat</th><th>Data</th></tr></thead><tbody>${reportRows || '<tr><td colspan="5">Encara no hi ha informes.</td></tr>'}</tbody></table>`);
}

export function renderDeleteProject(project, githubConfigured = Boolean(process.env.GITHUB_TOKEN)) {
  return layout(`Esborrar — ${project.name}`, `<h1>Esborrar el projecte</h1><p>Retiraràs <strong>${escape(project.name)}</strong> (<code>${escape(project.id)}</code>) del registre d’Evidències.</p><p class="notice">Els informes locals es conservaran com a traça docent. El repositori de GitHub només s’eliminarà si marques l’opció corresponent.</p><form method="post" action="/projects/${encodeURIComponent(project.id)}/delete"><label>Escriu exactament <code>${escape(project.repository)}</code> per confirmar<input name="confirm-repository" required autocomplete="off"></label><p><label><input name="delete-repository" type="checkbox" ${githubConfigured ? '' : 'disabled'} style="display:inline;width:auto"> Eliminar també el repositori de GitHub (acció irreversible)</label></p>${githubConfigured ? '' : '<p class="notice error">Sense GITHUB_TOKEN només es pot retirar el projecte del registre local.</p>'}<p class="actions"><button type="submit" style="background:var(--bad)">Confirmar l’esborrat</button> <a href="/#projectes">Cancel·lar</a></p></form>`);
}

export function renderReport(report) {
  const checks = report.checks.map((check) => `<tr><td class="${escape(check.status)}">${escape(check.status)}</td><td><code>${escape(check.id)}</code></td><td>${escape(check.message)}</td><td class="evidence">${(check.evidence || []).map(escape).join('<br>') || '—'}</td></tr>`).join('');
  const list = (items, empty) => items?.length ? `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>` : `<p>${empty}</p>`;
  return layout(`Informe — ${report.project.name}`, `<h1>${escape(report.project.name)}</h1><p class="lead">${escape(report.checkpoint.name)} · <code>${escape(report.version.requested_ref)}</code></p><p><strong>Estat:</strong> <span class="status-${escape(report.status)}">${escape(report.status)}</span> · <strong>Commit:</strong> <code>${escape(report.version.commit)}</code></p><p><a href="${escape(`https://github.com/${report.project.repository}/tree/${report.version.commit}`)}" rel="noreferrer">Obrir esta versió a GitHub</a> · <a href="/api/reports/${encodeURIComponent(report.filename)}">Descarregar JSON</a></p><h2>Comprovacions</h2><table><thead><tr><th>Estat</th><th>Comprovació</th><th>Resultat</th><th>Evidència</th></tr></thead><tbody>${checks}</tbody></table><h2>Avisos</h2>${list(report.warnings, 'Cap avís automàtic.')}<h2>Bloquejos</h2>${list(report.blocking_flags, 'Cap bloqueig automàtic.')}<h2>RA/CA candidats</h2>${list(report.candidate_evidence?.map((item) => item.ra_ca), 'No se n’han identificat.')}<p class="notice">Cal revisar qualitat, autoria, abast i defensa. Este informe no acredita assoliments ni assigna qualificacions.</p>`);
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 32_768) throw new Error('El formulari supera la mida permesa.');
  }
  return Object.fromEntries(new URLSearchParams(body));
}

function redirect(response, location) {
  response.writeHead(303, { location });
  response.end();
}

async function registerProject(input) {
  const project = { id: input.id?.trim(), name: input.name?.trim(), repository: input.repository?.trim() };
  const errors = validateProject(project);
  if (errors.length) throw new Error(errors.join(', '));
  await execFileAsync(process.execPath, ['scripts/pi/register-project.mjs', '--id', project.id, '--name', project.name, '--repository', project.repository], { cwd: root });
  return project;
}

function validGithubName(value) {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(String(value || '')) && !String(value).endsWith('.git');
}

export function templateProjectInput(input) {
  const project = { id: input.id?.trim(), name: input.name?.trim(), repository: `${input.owner?.trim()}/${input['repo-name']?.trim()}` };
  const errors = validateProject(project);
  if (!validGithubName(input.owner)) errors.push('organització GitHub invàlida');
  if (!validGithubName(input['repo-name'])) errors.push('nom de repositori invàlid');
  if (errors.length) throw new Error([...new Set(errors)].join(', '));
  return { project, owner: input.owner.trim(), repoName: input['repo-name'].trim(), private: input.private === 'on' || input.private === 'true' };
}

async function createProjectFromTemplate(input) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('Falta GITHUB_TOKEN per crear repositoris.');
  const template = process.env.PI_PROJECT_TEMPLATE || 'cipfpbatoi/pi2627-plantilla-projecte';
  const [templateOwner, templateRepo, extra] = template.split('/');
  if (!validGithubName(templateOwner) || !validGithubName(templateRepo) || extra) throw new Error('PI_PROJECT_TEMPLATE ha de tindre el format organitzacio/repositori.');
  const data = templateProjectInput(input);

  await access(path.join(root, 'course/projects.json'), constants.W_OK);
  const response = await fetch(`https://api.github.com/repos/${templateOwner}/${templateRepo}/generate`, {
    method: 'POST',
    headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'pi2627-evidencies', 'x-github-api-version': '2022-11-28' },
    body: JSON.stringify({ owner: data.owner, name: data.repoName, description: `Projecte Intermodular: ${data.project.name}`, private: data.private, include_all_branches: false })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const detail = payload.errors?.map((item) => item.message || item.code).filter(Boolean).join(', ') || payload.message || `HTTP ${response.status}`;
    throw new Error(`GitHub no ha creat el repositori: ${detail}.`);
  }
  const createdRepository = await response.json();
  await registerProject(data.project);
  let initializationWarning = '';
  try {
    await initializeProjectJson(data.project, createdRepository.default_branch || 'main', token);
  } catch (error) {
    initializationWarning = ` El repositori està creat i registrat, però project.json requerix revisió manual: ${error.message}`;
  }
  return { ...data, initializationWarning };
}

export async function initializeProjectJson(project, branch, token) {
  const [owner, repository] = project.repository.split('/');
  const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents/project.json`;
  const headers = { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'user-agent': 'pi2627-evidencies', 'x-github-api-version': '2022-11-28' };
  let current;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, { headers });
    if (response.ok) {
      current = await response.json();
      break;
    }
    if (response.status !== 404 || attempt === 4) throw new Error(`no s'ha pogut llegir el fitxer de la plantilla (HTTP ${response.status})`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const content = `${JSON.stringify(project, null, 2)}\n`;
  const response = await fetch(endpoint, {
    method: 'PUT', headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'Inicialitza la identificació del projecte', content: Buffer.from(content).toString('base64'), sha: current.sha, branch })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `no s'ha pogut actualitzar project.json (HTTP ${response.status})`);
  }
}

export function validateProjectDeletion(project, input) {
  if (!project) throw new Error('El projecte no existix.');
  if (String(input['confirm-repository'] || '').trim() !== project.repository) throw new Error(`La confirmació no coincidix amb ${project.repository}.`);
  return { deleteRepository: input['delete-repository'] === 'on' || input['delete-repository'] === 'true' };
}

async function deleteProject(projectId, input) {
  const file = path.join(root, 'course/projects.json');
  const { registry, projects } = await loadConfiguration(root);
  const project = projects.get(projectId);
  const options = validateProjectDeletion(project, input);
  await access(file, constants.W_OK);

  if (options.deleteRepository) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('Falta GITHUB_TOKEN per eliminar el repositori de GitHub.');
    const [owner, repository] = project.repository.split('/');
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`, {
      method: 'DELETE',
      headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'user-agent': 'pi2627-evidencies', 'x-github-api-version': '2022-11-28' }
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(`GitHub no ha eliminat el repositori: ${payload.message || `HTTP ${response.status}`}.`);
    }
  }

  registry.projects = registry.projects.filter((item) => item.id !== projectId);
  await writeFile(file, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  return { project, repositoryDeleted: options.deleteRepository };
}

async function collectReport(input) {
  if (!validId(input['project-id']) || !validId(input.checkpoint)) throw new Error('Projecte o punt de control invàlid.');
  if (!String(input.ref || '').trim() || /[\0\r\n]/.test(input.ref)) throw new Error('Referència invàlida.');
  const repoDir = path.resolve(String(input['repo-dir'] || ''));
  if (!path.isAbsolute(String(input['repo-dir'] || '')) || !existsSync(repoDir)) throw new Error('El directori del repositori no existix o no és absolut.');
  const filename = `${input['project-id']}-${input.checkpoint}.json`;
  await execFileAsync(process.execPath, ['scripts/pi/collect-evidence.mjs', '--repo-dir', repoDir, '--project-id', input['project-id'], '--checkpoint', input.checkpoint, '--ref', input.ref, '--output', `tmp/pi/${filename}`], { cwd: root, maxBuffer: 12 * 1024 * 1024 });
  return filename;
}

async function handle(request, response) {
  if (!authorizationAccepted(request.headers.authorization)) {
    sendUnauthorized(response);
    return;
  }
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (request.method === 'GET' && url.pathname === '/') {
      const { projects, checkpoints } = await loadConfiguration(root);
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(renderDashboard(projects, checkpoints, await reports(), notice(url.searchParams)));
      return;
    }
    if (request.method === 'POST' && url.pathname === '/projects') {
      const project = await registerProject(await readBody(request));
      redirect(response, `/?ok=${encodeURIComponent(`Projecte “${project.name}” guardat.`)}#projectes`);
      return;
    }
    if (request.method === 'POST' && url.pathname === '/projects/from-template') {
      const data = await createProjectFromTemplate(await readBody(request));
      redirect(response, `/?ok=${encodeURIComponent(`Repositori ${data.project.repository} creat i projecte “${data.project.name}” registrat.${data.initializationWarning}`)}#projectes`);
      return;
    }
    const deleteProjectMatch = url.pathname.match(/^\/projects\/([a-z0-9][a-z0-9-]*)\/delete$/);
    if (request.method === 'GET' && deleteProjectMatch) {
      const { projects } = await loadConfiguration(root);
      const project = projects.get(deleteProjectMatch[1]);
      if (!project) throw Object.assign(new Error('El projecte no existix.'), { code: 'ENOENT' });
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(renderDeleteProject(project));
      return;
    }
    if (request.method === 'POST' && deleteProjectMatch) {
      const result = await deleteProject(deleteProjectMatch[1], await readBody(request));
      const detail = result.repositoryDeleted ? ' i el repositori de GitHub s’ha eliminat' : '';
      redirect(response, `/?ok=${encodeURIComponent(`El projecte “${result.project.name}” s’ha retirat del registre${detail}.`)}#projectes`);
      return;
    }
    if (request.method === 'POST' && url.pathname === '/reports') {
      const filename = await collectReport(await readBody(request));
      redirect(response, `/reports/${encodeURIComponent(filename)}`);
      return;
    }
    const reportMatch = url.pathname.match(/^\/(api\/)?reports\/([^/]+\.json)$/);
    if (request.method === 'GET' && reportMatch) {
      const filename = path.basename(decodeURIComponent(reportMatch[2]));
      const report = { ...JSON.parse(await readFile(path.join(root, 'tmp/pi', filename), 'utf8')), filename };
      if (reportMatch[1]) {
        response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="${filename}"` });
        response.end(`${JSON.stringify(report, null, 2)}\n`);
      } else {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end(renderReport(report));
      }
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/state') {
      const { projects, checkpoints } = await loadConfiguration(root);
      response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      response.end(`${JSON.stringify({ projects: [...projects.values()], checkpoints: [...checkpoints.values()], reports: await reports() }, null, 2)}\n`);
      return;
    }
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('No trobat.\n');
  } catch (error) {
    if (request.method === 'POST') {
      redirect(response, `/?error=${encodeURIComponent(error.message)}`);
      return;
    }
    response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(`Error: ${error.message}\n`);
  }
}

export function createDashboardServer() {
  return createServer(handle);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!credentialsConfigured()) {
    console.error('DASHBOARD_USER i DASHBOARD_PASSWORD són obligatoris per arrancar el dashboard PI.');
    process.exit(1);
  }
  createDashboardServer().listen(port, host, () => console.log(`Dashboard PI: http://${host}:${port}`));
}
