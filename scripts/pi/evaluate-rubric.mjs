import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import OpenAI from 'openai';
import { loadConfiguration } from './lib/config.mjs';
import { githubFileAtCommit } from './lib/github-source.mjs';
import { buildEvidencePacket, buildRubricAssessment, evaluationMessages, modelResponseSchema, saveRubricAssessment } from './lib/rubric-assessment.mjs';

const execFileAsync = promisify(execFile);

function args(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith('--')) continue;
    const value = argv[index + 1];
    if (value && !value.startsWith('--')) {
      result[key.slice(2)] = value;
      index += 1;
    } else result[key.slice(2)] = 'true';
  }
  return result;
}

function parseModelJson(response) {
  const message = response.choices?.[0]?.message;
  if (message?.refusal) throw new Error(`El model ha refusat la revisió: ${message.refusal}`);
  if (!message?.content) throw new Error('La resposta del model no conté JSON.');
  try { return JSON.parse(message.content); }
  catch (error) { throw new Error(`No s’ha pogut interpretar la proposta del model: ${error.message}`); }
}

async function localReader(repoDir, commit, file) {
  try {
    const { stdout } = await execFileAsync('git', ['show', `${commit}:${file}`], { cwd: repoDir, maxBuffer: 2 * 1024 * 1024 });
    return stdout;
  } catch {
    return null;
  }
}

async function main() {
  const input = args(process.argv.slice(2));
  if (!input.input) throw new Error('Falta --input amb l’informe d’evidències.');
  if (!input['repo-dir'] && input.github !== 'true') throw new Error('Indica --repo-dir o --github true.');
  if (input['repo-dir'] && input.github === 'true') throw new Error('Usa només --repo-dir o --github true.');

  const root = process.cwd();
  const report = JSON.parse(await readFile(path.resolve(input.input), 'utf8'));
  const { checkpoints, rubrics } = await loadConfiguration(root);
  const checkpoint = checkpoints.get(report.checkpoint?.id);
  if (!checkpoint || checkpoint.rubric_id !== report.checkpoint?.rubric_id) throw new Error('L’informe no correspon a una rúbrica automatitzable vigent.');
  const rubric = rubrics.get(checkpoint.rubric_id);
  if (!rubric) throw new Error(`No s’ha trobat la rúbrica ${checkpoint.rubric_id}.`);
  if (rubric.checkpoint_id !== report.checkpoint.id) throw new Error('La rúbrica no correspon al punt de control de l’informe.');

  let reader;
  if (input['repo-dir']) {
    const repoDir = path.resolve(input['repo-dir']);
    reader = (file) => localReader(repoDir, report.version.commit, file);
  } else {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('Falta GITHUB_TOKEN per llegir les evidències del repositori.');
    reader = (file) => githubFileAtCommit({ repository: report.project.repository, commit: report.version.commit, file, token });
  }
  const packet = await buildEvidencePacket(report, rubric, reader);
  if (!packet.files.length) throw new Error('No s’ha pogut llegir cap evidència prevista per la rúbrica.');

  let proposal;
  if (input['mock-result']) {
    proposal = JSON.parse(await readFile(path.resolve(input['mock-result']), 'utf8'));
  } else {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Falta OPENAI_API_KEY per generar la proposta d’avaluació.');
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_PI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: evaluationMessages(packet),
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'pi_rubric_evaluation_proposal',
          strict: true,
          schema: modelResponseSchema(rubric)
        }
      }
    });
    proposal = parseModelJson(response);
  }

  const assessment = buildRubricAssessment(report, rubric, proposal, packet);
  const file = await saveRubricAssessment(root, report, assessment, input.output || '');
  console.log(JSON.stringify({ output: file, assessment }, null, 2));
}

main().catch((error) => {
  console.error(`No s’ha pogut generar la proposta de rúbrica: ${error.message}`);
  process.exit(1);
});
