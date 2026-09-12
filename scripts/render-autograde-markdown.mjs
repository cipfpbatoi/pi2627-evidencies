import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {};
  const allowed = new Set(['--input', '--output', '--repo', '--group', '--source']);

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
  const missing = ['input', 'output'].filter((key) => !args[key]);
  if (missing.length > 0) {
    throw new Error(`Falten arguments obligatoris: ${missing.map((key) => `--${key}`).join(', ')}`);
  }
}

function value(input, fallback = 'n/d') {
  return input ?? fallback;
}

function yesNo(input) {
  return input === true ? 'Sí' : input === false ? 'No' : 'n/d';
}

function tableCell(input) {
  return String(value(input, ''))
    .replace(/\r?\n/g, '<br>')
    .replace(/\|/g, '\\|');
}

function list(items, emptyText) {
  if (!Array.isArray(items) || items.length === 0) {
    return `${emptyText}\n`;
  }

  return `${items.map((item) => `- ${item}`).join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  requireArgs(args);

  const result = JSON.parse(await readFile(path.resolve(args.input), 'utf8'));
  const lines = [];

  lines.push('# Autocorrecció provisional');
  lines.push('');
  lines.push(`- Repositori: \`${args.repo || result.student || 'n/d'}\``);
  lines.push(`- Alumne: \`${result.student || 'n/d'}\``);
  lines.push(`- Grup: \`${args.group || 'n/d'}\``);
  lines.push(`- Autocorrecció: \`${result.challenge_id || 'n/d'}\``);
  lines.push(`- Commit avaluat: \`${result.commit || 'n/d'}\``);
  lines.push(`- Motor: \`${args.source || 'n/d'}\``);
  lines.push(`- Nota provisional: **${value(result.final_score_over_10)}/10**`);
  lines.push(`- Confiança: **${value(result.confidence)}**`);
  lines.push(`- Requereix revisió docent: **${yesNo(result.teacher_review_required)}**`);
  lines.push('');

  if (result.short_feedback_md) {
    lines.push('## Feedback');
    lines.push('');
    lines.push(result.short_feedback_md);
    lines.push('');
  }

  if (result.repte_extension) {
    lines.push('## Proposta d’ampliació del repte (pendent de validació docent)', '',
      `Proposta: **${result.repte_extension.proposed_score}/1**. No suma a la nota del microrepte.`, '',
      result.repte_extension.reason, '', list(result.repte_extension.evidence, 'Sense evidències'),
      list(result.repte_extension.presentation_checks, 'Revisió docent pendent'), '');
  }

  lines.push('## Puntuació per dimensions');
  lines.push('');
  lines.push('| Dimensió | Punts | Comentari |');
  lines.push('|---|---:|---|');
  for (const dimension of result.dimension_scores || []) {
    const score = `${value(dimension.score, 0)}/${value(dimension.max_score, '?')}`;
    lines.push(`| ${tableCell(dimension.id)} | ${tableCell(score)} | ${tableCell(dimension.reason)} |`);
  }
  lines.push('');

  if (Array.isArray(result.ra_scores) && result.ra_scores.length > 0) {
    lines.push('## Puntuació per RA');
    lines.push('');
    lines.push('| RA | Nota | CA | Comentari |');
    lines.push('|---|---:|---|---|');
    for (const raScore of result.ra_scores) {
      lines.push(`| ${tableCell(raScore.ra_id)} | ${tableCell(`${value(raScore.score, 0)}/10`)} | ${tableCell((raScore.assessed_ca || []).join(', '))} | ${tableCell(raScore.reason)} |`);
    }
    lines.push('');
  }

  lines.push('## Punts forts');
  lines.push('');
  lines.push(list(result.strengths, 'Sense punts forts destacats en aquesta execució.').trimEnd());
  lines.push('');

  lines.push('## Millores recomanades');
  lines.push('');
  lines.push(list(result.weaknesses, 'Sense millores concretes en aquesta execució.').trimEnd());
  lines.push('');

  if (Array.isArray(result.blocking_flags) && result.blocking_flags.length > 0) {
    lines.push('## Bloquejos detectats');
    lines.push('');
    lines.push(list(result.blocking_flags, '').trimEnd());
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('Resultat generat automàticament. La qualificació és provisional fins a la revisió docent.');
  lines.push('');

  const outputPath = path.resolve(args.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${lines.join('\n')}`, 'utf8');
}

main().catch((error) => {
  console.error(`No s'ha pogut generar el resum Markdown: ${error.message}`);
  process.exit(1);
});
