import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const folder = 'docs/04_materials/consolidacio';
export function consolidationCode(session) {
  const code = session?.microrepte;
  return /^R[1-5]M\d+$/.test(code || '') ? code.toLowerCase() : null;
}
function validate(code, markdown) {
  if (!/^r[1-5]m\d+$/.test(code)) throw new Error('Microrepte no vàlid.');
  if (typeof markdown !== 'string' || !markdown.trim() || Buffer.byteLength(markdown) > 150000) {
    throw new Error('La fitxa ha de contindre text i ocupar menys de 150 KB.');
  }
  return markdown.trimEnd() + '\n';
}
async function optionalRead(file) {
  try { return await readFile(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return ''; throw error; }
}
export async function readConsolidation(root, code) {
  validate(code, 'valid');
  const local = await optionalRead(path.join(root, 'tmp/consolidacio', code + '.md'));
  const seed = await optionalRead(path.join(root, 'consolidation-drafts', code + '.md'));
  const publication = await optionalRead(path.join(root, 'tmp/consolidacio', code + '.json'));
  return { code, markdown: local || seed, has_draft: Boolean(local || seed), publication: publication ? JSON.parse(publication) : null };
}
export async function saveConsolidation(root, code, markdown) {
  const content = validate(code, markdown);
  const dir = path.join(root, 'tmp/consolidacio');
  await mkdir(dir, { recursive: true });
  const temp = path.join(dir, code + '.' + randomUUID() + '.tmp');
  await writeFile(temp, content, 'utf8');
  await rename(temp, path.join(dir, code + '.md'));
  return { code, markdown: content, has_draft: true };
}

export async function recordConsolidationPublication(root, code, publication) {
  validate(code, 'valid');
  const dir = path.join(root, 'tmp/consolidacio');
  await mkdir(dir, {recursive:true});
  const temp = path.join(dir, code + '.' + randomUUID() + '.tmp');
  await writeFile(temp, JSON.stringify(publication), 'utf8');
  await rename(temp, path.join(dir, code + '.json'));
}

// One commit updates both the sheet and its index. A concurrent remote edit
// rejects the non-fast-forward update; it never gets overwritten.
export async function publishConsolidation(options) {
  return changeConsolidation(options, false);
}
export async function withdrawConsolidation(options) {
  return changeConsolidation(options, true);
}
async function changeConsolidation({ code, markdown, token, request = fetch }, withdraw) {
  const content = validate(code, withdraw ? 'valid' : markdown);
  if (!token) throw new Error('Cal GITHUB_TOKEN amb permís Contents: write en cipfpbatoi/dwes2627.');
  const repo = 'cipfpbatoi/dwes2627';
  const api = async (route, method = 'GET', body, allowMissing = false) => {
    const result = await request(`https://api.github.com/repos/${repo}/${route}`, {
      method, headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`,
        'content-type': 'application/json', 'x-github-api-version': '2022-11-28' },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000)
    });
    if (allowMissing && result.status === 404) return null;
    if (!result.ok) throw new Error(`No s’ha pogut actualitzar la publicació (GitHub ${result.status}). Comprova permisos i torna a provar si la branca ha canviat.`);
    return result.json();
  };
  const ref = await api('git/ref/heads/master');
  const head = ref.object.sha;
  const commit = await api('git/commits/' + head);
  const indexFile = await api(`contents/${folder}/index.md?ref=${head}`);
  const originalIndex = Buffer.from(indexFile.content, 'base64').toString('utf8');
  const link = `- [${code.toUpperCase()}. Consolidació](${code}.md)`;
  let entries;
  if (withdraw) {
    const sheet = await api(`contents/${folder}/${code}.md?ref=${head}`, 'GET', undefined, true);
    const index = originalIndex.split('\n').filter(line => !line.includes(`](${code}.md)`)).join('\n');
    entries = [{ path: `${folder}/index.md`, mode: '100644', type: 'blob', content: index }];
    if (sheet) entries.push({ path: `${folder}/${code}.md`, mode: '100644', type: 'blob', sha: null });
  } else {
    const index = originalIndex.includes(`](${code}.md)`) ? originalIndex : originalIndex.trimEnd() + '\n\n' + link + '\n';
    entries = [
      { path: `${folder}/${code}.md`, mode: '100644', type: 'blob', content },
      { path: `${folder}/index.md`, mode: '100644', type: 'blob', content: index }
    ];
  }
  const tree = await api('git/trees', 'POST', { base_tree: commit.tree.sha, tree: entries });
  const links = withdraw ? { withdrawn: true, actions_url: publicationLinks(repo, code).actions_url } : publicationLinks(repo, code);
  // GitHub returns the existing tree for identical files; avoid empty commits.
  if (tree.sha === commit.tree.sha) return { unchanged: true, commit: head, ...links };
  const next = await api('git/commits', 'POST', { message: `docs: ${withdraw ? 'retira' : 'publica'} consolidació de ${code.toUpperCase()}`, tree: tree.sha, parents: [head] });
  await api('git/refs/heads/master', 'PATCH', { sha: next.sha, force: false });
  return { unchanged: false, commit: next.sha, ...links };
}
function publicationLinks(repo, code) {
  return { url: `https://cipfpbatoi.github.io/dwes2627/04_materials/consolidacio/${code}.html`,
    actions_url: `https://github.com/${repo}/actions` };
}
