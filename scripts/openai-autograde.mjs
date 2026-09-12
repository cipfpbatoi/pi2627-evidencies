import { extensionSchema, validateProposal, normalizeExtensionProposal } from './lib/repte-extension.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import OpenAI from 'openai';

const defaultModel = 'gpt-4o-mini';

function parseArgs(argv) {
  const args = {};
  const allowed = new Set(['--input']);

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
  if (!args.input) {
    throw new Error('Falta argument obligatori: --input');
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readOptionalText(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateResult(result, schema) {
  const errors = [];

  if (!isPlainObject(result)) {
    return ['el resultat ha de ser un objecte JSON'];
  }

  for (const field of schema.required || []) {
    if (!(field in result)) {
      errors.push(`falta el camp obligatori "${field}"`);
    }
  }

  const expectedTypes = {
    challenge_id: 'string',
    student: 'string',
    commit: 'string',
    final_score_over_10: 'number',
    provisional: 'boolean',
    teacher_review_required: 'boolean',
    confidence: 'number',
    short_feedback_md: 'string'
  };

  for (const [field, expectedType] of Object.entries(expectedTypes)) {
    if (field in result && typeof result[field] !== expectedType) {
      errors.push(`"${field}" ha de ser ${expectedType}`);
    }
  }

  for (const field of ['dimension_scores', 'ra_scores', 'strengths', 'weaknesses', 'blocking_flags']) {
    if (field in result && !Array.isArray(result[field])) {
      errors.push(`"${field}" ha de ser array`);
    }
  }

  if (typeof result.final_score_over_10 === 'number' && (result.final_score_over_10 < 0 || result.final_score_over_10 > 10)) {
    errors.push('"final_score_over_10" ha d_estar entre 0 i 10');
  }

  if (typeof result.confidence === 'number' && (result.confidence < 0 || result.confidence > 1)) {
    errors.push('"confidence" ha d_estar entre 0 i 1');
  }

  if (Array.isArray(result.dimension_scores) && result.dimension_scores.length === 0) {
    errors.push('"dimension_scores" ha de tindre almenys un element');
  }

  if (Array.isArray(result.ra_scores)) {
    result.ra_scores.forEach((raScore, index) => {
      const prefix = `ra_scores[${index}]`;
      if (!isPlainObject(raScore)) {
        errors.push(`${prefix} ha de ser objecte`);
        return;
      }
      if (!/^RA\d+$/i.test(String(raScore.ra_id || ''))) {
        errors.push(`${prefix}.ra_id ha de tindre format RA<n>`);
      }
      if (typeof raScore.score !== 'number' || raScore.score < 0 || raScore.score > 10) {
        errors.push(`${prefix}.score ha de ser number entre 0 i 10`);
      }
    });
  }

  return errors;
}

function toOpenAiResponseSchema(schema) {
  if (Array.isArray(schema)) {
    return schema.map((item) => toOpenAiResponseSchema(item));
  }

  if (!isPlainObject(schema)) {
    return schema;
  }

  const unsupportedStrictKeywords = new Set([
    '$schema',
    '$id',
    'title',
    'minLength',
    'minimum',
    'maximum',
    'exclusiveMinimum'
  ]);
  const nextSchema = {};

  for (const [key, value] of Object.entries(schema)) {
    if (!unsupportedStrictKeywords.has(key)) {
      nextSchema[key] = toOpenAiResponseSchema(value);
    }
  }

  return nextSchema;
}

function buildMessages(payload, schema, promptText) {
  const basePromptSection = promptText
    ? `\n\nPrompt base del microrepte:\n${promptText}`
    : '\n\nNo s_ha trobat prompt base del microrepte.';

  return [
    {
      role: 'system',
      content: [
        'Eres un motor d_autograding per a microreptes DWES.',
        'Has de tornar exclusivament un objecte JSON compatible amb l_esquema proporcionat.',
        'No canvies el contracte d_eixida. Marca sempre provisional=true si no hi ha revisio docent final.',
        'Avalua de manera prudent i explica cada dimensio amb una rao curta.',
        'No penalitzes no usar IA: una declaració de no ús satisfà el registre d’IA quan es demana, sense exigir consultes fictícies. La generació declarada d’HTML estàtic i CSS de presentació està permesa; no inclou lògica de servidor. La norma prohibix delegar el backend, la configuració avaluable o les proves en xats o agents. No inferisques infraccions per estil del codi o nom de ferramenta: descriu només evidències concretes per a revisió docent, sense deduccions automàtiques noves per sospita d’IA.',
        'No puntues treball de microreptes anteriors com si fora evidencia del microrepte actiu. Excepció: la proposta separada repte_extension usa evidències del repte complet, només quan el payload l’habilita. Mai suma a les dimensions ni a les notes del microrepte.',
        'Si el payload no conte evidencia especifica vinculada al challenge_id o microrepte_code actiu, la nota maxima orientativa es 2/10 encara que el repositori tinga treball anterior.',
        'Interpreta README.md de l_arrel com la fitxa de l_entrega actual: ha d_orientar la correccio i enllacar docs, evidence i tests concrets del microrepte actiu.',
        'No tractes ENTREGA.md ni docs/README.md, evidence/README.md o tests/README.md com a evidencia puntuable del microrepte; son guies del template.',
        'Valora positivament que docs, evidence i tests usen noms del microrepte actiu, com docs/r2m3.md, evidence/r2m3/ o tests/r2m3.test.php.',
        'Els tests nomes compten com a tests si son executables o descriuen una prova manual reproduible amb passos, dades i resultat esperat quan encara no toca automatitzar.',
        'Ompli sempre ra_scores: una entrada per cada RA present en assessed_ra del payload; si nomes hi ha un RA, torna una sola entrada.'
      ].join(' ')
    },
    {
      role: 'user',
      content: [
        'Genera el resultat d_autograding per a este payload.',
        basePromptSection,
        `\n\nPayload JSON:\n${JSON.stringify(payload, null, 2)}`,
        `\n\nEsquema JSON obligatori:\n${JSON.stringify(schema, null, 2)}`
      ].join('\n')
    }
  ];
}

function parseModelJson(response) {
  const message = response.choices?.[0]?.message;

  if (message?.refusal) {
    throw new Error(`El model ha refusat la peticio: ${message.refusal}`);
  }

  const content = message?.content;
  if (!content) {
    throw new Error('La resposta d_OpenAI no conte contingut JSON');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`No s'ha pogut parsejar el JSON retornat per OpenAI: ${error.message}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  requireArgs(args);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Falta OPENAI_API_KEY. Defineix la variable d_entorn abans d_executar openai-autograde.mjs');
  }

  const rootDir = process.cwd();
  const outputDir = path.join(rootDir, 'tmp');
  const rawOutputPath = path.join(outputDir, 'openai-raw-response.json');
  const resultOutputPath = path.join(outputDir, 'autograde-result.json');
  const [payload, schema] = await Promise.all([
    readJson(path.resolve(rootDir, args.input)),
    readJson(path.join(rootDir, 'global', 'grading-schema.json'))
  ]);
  if (payload.repte_extension) {
    schema.properties.repte_extension = extensionSchema;
    schema.required.push('repte_extension');
  } else {
    delete schema.properties.repte_extension;
  }
  const promptPath = payload.challenge_id
    ? path.join(rootDir, 'microreptes', payload.challenge_id, 'prompt.md')
    : null;
  const promptText = promptPath ? await readOptionalText(promptPath) : null;
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || defaultModel;

  const response = await client.chat.completions.create({
    model,
    messages: buildMessages(payload, schema, promptText),
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'dwes_microrepte_grading_response',
        strict: true,
        schema: toOpenAiResponseSchema(schema)
      }
    }
  });

  await mkdir(outputDir, { recursive: true });
  await writeFile(rawOutputPath, `${JSON.stringify(response, null, 2)}\n`, 'utf8');

  const result = parseModelJson(response);
  const errors = validateResult(result, { ...schema, required: schema.required.filter(field => field !== 'repte_extension') });
  if (payload.repte_extension && errors.length === 0) normalizeExtensionProposal(result);
  if (payload.repte_extension) {
    try { validateProposal(result.repte_extension); } catch (error) { errors.push(error.message); }
  } else if (result.repte_extension) errors.push('Ampliació fora de l’últim microrepte');
  if (errors.length > 0) {
    console.error('La resposta d_OpenAI no compleix l_esquema esperat:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const formatted = `${JSON.stringify(result, null, 2)}\n`;
  await writeFile(resultOutputPath, formatted, 'utf8');
  console.log(formatted.trimEnd());
}

main().catch((error) => {
  console.error(`No s'ha pogut executar l'autograding amb OpenAI: ${error.message}`);
  process.exit(1);
});
