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
  '## Avisos',
  '',
  ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ['- Cap avís automàtic.']),
  '',
  '## Bloquejos',
  '',
  ...(report.blocking_flags.length ? report.blocking_flags.map((item) => `- ${item}`) : ['- Cap bloqueig automàtic.']),
  '',
  '## Revisió docent',
  '',
  'Els RA/CA indicats són candidats. Cal revisar la qualitat, l’autoria, l’abast i la defensa abans de registrar qualsevol assoliment o qualificació.',
  ''
];
const markdown = lines.join('\n');
if (outputIndex >= 0 && process.argv[outputIndex + 1]) await writeFile(path.resolve(process.argv[outputIndex + 1]), markdown, 'utf8');
console.log(markdown.trimEnd());
