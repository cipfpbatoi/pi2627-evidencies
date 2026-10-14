import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const inputIndex = process.argv.indexOf('--input');
const outputIndex = process.argv.indexOf('--output');
if (inputIndex < 0 || !process.argv[inputIndex + 1]) {
  console.error('Cal indicar --input INFORME.json.');
  process.exit(1);
}

const report = JSON.parse(await readFile(path.resolve(process.argv[inputIndex + 1]), 'utf8'));
const icon = (status) => status === 'passed' ? '✅' : status === 'warning' ? '⚠️' : '❌';
const processSummary = report.process?.summary;
const processLines = processSummary ? [
  '## Traça temporal i seqüència',
  '',
  `- **Tram:** ${report.process.scope?.requested_ref ? `des de ${report.process.scope.requested_ref}` : 'historial disponible'}`,
  `- **Commits:** ${processSummary.total_commits}`,
  `- **Dies actius:** ${processSummary.active_days}`,
  `- **Interval:** ${processSummary.span_hours} hores`,
  `- **Buit màxim entre commits:** ${processSummary.largest_gap_hours} hores`,
  `- **Dia més actiu:** ${processSummary.busiest_day || '—'} (${processSummary.busiest_day_commits} commits; ${Math.round(processSummary.busiest_day_share * 100)} %)`,
  `- **Missatges genèrics:** ${processSummary.generic_messages}`,
  `- **Commits amb referència a issue:** ${processSummary.commits_with_issue_reference}`,
  '',
  ...(report.process.timeline?.length ? report.process.timeline.map((item) => `- ${item.committed_at} · \`${item.commit.slice(0, 12)}\` · ${item.author} · ${item.message || '(sense missatge)'} · ${item.areas.join(', ')}`) : ['- No hi ha commits en el tram analitzat.']),
  '',
  '> La distribució i els missatges són indicis de procés. No acrediten autoria, qualitat ni assoliment sense contrast docent.',
  ''
] : [];
const lines = [
  `# Informe d'evidències — ${report.project.name}`,
  '',
  `- **Projecte:** ${report.project.id}`,
  `- **Repositori:** ${report.project.repository}`,
  `- **Punt de control:** ${report.checkpoint.name}`,
  `- **Versió:** ${report.version.requested_ref} (${report.version.commit.slice(0, 12)})`,
  `- **Estat:** ${report.status}`,
  `- **Qualificació automàtica:** no s'aplica`,
  '',
  '## Comprovacions',
  '',
  ...report.checks.map((check) => `- ${icon(check.status)} **${check.id}:** ${check.message}`),
  '',
  ...processLines,
  '## Avisos',
  '',
  ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ['- Cap avís automàtic.']),
  '',
  '## Bloquejos',
  '',
  ...(report.blocking_flags.length ? report.blocking_flags.map((item) => `- ${item}`) : ['- Cap bloqueig automàtic.']),
  '',
  '## RA/CA candidats i evidències localitzades',
  '',
  ...(report.candidate_evidence?.length ? report.candidate_evidence.map((item) => `- **${item.ra_ca}:** ${item.evidence?.length ? item.evidence.map((evidence) => `\`${evidence}\``).join(', ') : 'no localitzada en esta versió'}`) : ['- No se n’han identificat.']),
  '',
  '## Revisió docent',
  '',
  'Els RA/CA indicats són candidats. Cal revisar la qualitat, l’autoria, l’abast i la defensa abans de registrar qualsevol assoliment o qualificació.',
  ''
];
const markdown = lines.join('\n');
if (outputIndex >= 0 && process.argv[outputIndex + 1]) await writeFile(path.resolve(process.argv[outputIndex + 1]), markdown, 'utf8');
console.log(markdown.trimEnd());
