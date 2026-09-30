function endpoint(repository, route) {
  const [owner, name] = String(repository || '').split('/');
  if (!owner || !name) throw new Error('Repositori GitHub invàlid.');
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}${route}`;
}

async function request(url, token, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'pi2627-evidencies',
      'x-github-api-version': '2022-11-28'
    }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`GitHub no ha pogut llegir l'evidència: ${body.message || `HTTP ${response.status}`}.`);
  }
  return response.json();
}

export async function githubSnapshot({ repository, ref, token, fetchImpl = fetch }) {
  if (!token) throw new Error('Falta GITHUB_TOKEN per llegir el repositori de GitHub.');
  const commit = await request(endpoint(repository, `/commits/${encodeURIComponent(ref)}`), token, fetchImpl);
  const sha = commit.sha;
  const treeSha = commit.commit?.tree?.sha;
  if (!/^[0-9a-f]{40}$/i.test(String(sha)) || !treeSha) throw new Error('GitHub no ha retornat un commit vàlid.');
  const tree = await request(endpoint(repository, `/git/trees/${encodeURIComponent(treeSha)}?recursive=1`), token, fetchImpl);
  if (tree.truncated) throw new Error('L’arbre del repositori és massa gran per a comprovar-lo completament amb GitHub.');
  const entries = Array.isArray(tree.tree) ? tree.tree : [];
  const files = entries.filter((entry) => entry.type === 'blob').map((entry) => entry.path);
  const projectEntry = entries.find((entry) => entry.type === 'blob' && entry.path === 'project.json');
  let projectFile = null;
  if (projectEntry?.sha) {
    const blob = await request(endpoint(repository, `/git/blobs/${encodeURIComponent(projectEntry.sha)}`), token, fetchImpl);
    if (blob.encoding === 'base64' && typeof blob.content === 'string') projectFile = Buffer.from(blob.content, 'base64').toString('utf8');
  }
  return { commit: sha, files, projectFile };
}
