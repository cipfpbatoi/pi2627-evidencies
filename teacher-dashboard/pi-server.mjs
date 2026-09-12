import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadConfiguration } from '../scripts/pi/lib/config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = process.env.DASHBOARD_HOST || '127.0.0.1';
const port = Number(process.env.DASHBOARD_PORT || 4173);

if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
  throw new Error('El dashboard PI només es pot escoltar en local; no inclou autenticació ni s’ha d’exposar a la xarxa.');
}

function escape(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

async function reports() {
  const dir = path.join(root, 'tmp/pi');
  if (!existsSync(dir)) return [];
  const result = [];
  for (const entry of await readdir(dir)) {
    if (!entry.endsWith('.json')) continue;
    try { result.push(JSON.parse(await readFile(path.join(dir, entry), 'utf8'))); } catch { /* informe incomplet ignorat */ }
  }
  return result.sort((a, b) => String(b.generated_at).localeCompare(String(a.generated_at)));
}

export function renderDashboard(projects, checkpoints, evidenceReports) {
  const projectRows = [...projects.values()].map((project) => `<tr><td>${escape(project.name)}</td><td><code>${escape(project.id)}</code></td><td>${escape(project.repository)}</td></tr>`).join('');
  const reportRows = evidenceReports.map((report) => `<tr><td>${escape(report.project.name)}</td><td>${escape(report.checkpoint.name)}</td><td>${escape(report.version.requested_ref)}</td><td>${escape(report.status)}</td><td>${escape(report.generated_at)}</td></tr>`).join('');
  return `<!doctype html><html lang="ca"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Evidències PI</title><style>body{font:16px system-ui;max-width:1100px;margin:2rem auto;padding:0 1rem;color:#17202a}table{border-collapse:collapse;width:100%;margin-bottom:2rem}th,td{border:1px solid #ccd1d1;padding:.55rem;text-align:left}th{background:#eaf2f8}code{background:#f4f6f7;padding:.15rem .3rem}</style><body><h1>Evidències del Projecte Intermodular</h1><p>L'aplicatiu analitza projectes i versions. No gestiona parelles ni assigna qualificacions.</p><h2>Projectes (${projects.size})</h2><table><thead><tr><th>Nom</th><th>ID</th><th>Repositori</th></tr></thead><tbody>${projectRows || '<tr><td colspan="3">No hi ha projectes registrats.</td></tr>'}</tbody></table><h2>Punts de control (${checkpoints.size})</h2><ul>${[...checkpoints.values()].map((item) => `<li><code>${escape(item.id)}</code> — ${escape(item.name)}</li>`).join('')}</ul><h2>Últims informes</h2><table><thead><tr><th>Projecte</th><th>Punt de control</th><th>Versió</th><th>Estat</th><th>Data</th></tr></thead><tbody>${reportRows || '<tr><td colspan="5">Encara no hi ha informes.</td></tr>'}</tbody></table></body></html>`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createServer(async (request, response) => {
    try {
      if (request.url === '/api/state') {
        const { projects, checkpoints } = await loadConfiguration(root);
        response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
        response.end(`${JSON.stringify({ projects: [...projects.values()], checkpoints: [...checkpoints.values()], reports: await reports() }, null, 2)}\n`);
        return;
      }
      const { projects, checkpoints } = await loadConfiguration(root);
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(renderDashboard(projects, checkpoints, await reports()));
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(`Error: ${error.message}\n`);
    }
  });
  server.listen(port, host, () => console.log(`Dashboard PI: http://${host}:${port}`));
}
