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

function safeRepositoryPath(file) {
  const value = String(file || '');
  if (!value || value.startsWith('/') || /(^|\/)\.\.(\/|$)/.test(value) || /[\u0000-\u001f]/.test(value)) throw new Error('Ruta d’evidència invàlida.');
  return value.split('/').map(encodeURIComponent).join('/');
}

export async function githubFileAtCommit({ repository, commit, file, token, fetchImpl = fetch }) {
  if (!token) throw new Error('Falta GITHUB_TOKEN per llegir el repositori de GitHub.');
  if (!/^[0-9a-f]{40}$/i.test(String(commit || ''))) throw new Error('Commit invàlid per llegir l’evidència.');
  const payload = await request(endpoint(repository, `/contents/${safeRepositoryPath(file)}?ref=${encodeURIComponent(commit)}`), token, fetchImpl);
  if (payload.type !== 'file' || payload.encoding !== 'base64' || typeof payload.content !== 'string') throw new Error(`GitHub no ha retornat un fitxer de text vàlid per a ${file}.`);
  return Buffer.from(payload.content, 'base64').toString('utf8');
}

function commitRecord(item) {
  return {
    commit: item.sha,
    committed_at: item.commit?.committer?.date || item.commit?.author?.date,
    author: item.author?.login || item.commit?.author?.name || 'No identificat',
    message: item.commit?.message || ''
  };
}

async function availableHistory(repository, commit, token, fetchImpl) {
  const commits = await request(endpoint(repository, `/commits?sha=${encodeURIComponent(commit)}&per_page=100`), token, fetchImpl);
  return {
    history: (Array.isArray(commits) ? commits : []).map(commitRecord).reverse(),
    historyTruncated: Array.isArray(commits) && commits.length === 100
  };
}

export async function githubSnapshot({ repository, ref, baselineRef = null, token, fetchImpl = fetch }) {
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

  let history;
  let historyTruncated;
  let baseline = null;
  if (baselineRef) {
    let baselineCommit = null;
    try {
      baselineCommit = await request(endpoint(repository, `/commits/${encodeURIComponent(baselineRef)}`), token, fetchImpl);
    } catch {
      baseline = { requested_ref: baselineRef, commit: null, status: 'missing', ahead_by: null, behind_by: null };
    }
    if (baselineCommit) {
      const compare = await request(endpoint(repository, `/compare/${encodeURIComponent(baselineCommit.sha)}...${encodeURIComponent(sha)}`), token, fetchImpl);
      history = (Array.isArray(compare.commits) ? compare.commits : []).map(commitRecord);
      historyTruncated = Number(compare.total_commits || 0) > history.length;
      baseline = {
        requested_ref: baselineRef,
        commit: baselineCommit.sha,
        status: compare.status || 'unknown',
        ahead_by: Number(compare.ahead_by || 0),
        behind_by: Number(compare.behind_by || 0)
      };
    } else {
      ({ history, historyTruncated } = await availableHistory(repository, sha, token, fetchImpl));
    }
  } else {
    ({ history, historyTruncated } = await availableHistory(repository, sha, token, fetchImpl));
  }
  return { commit: sha, files, projectFile, history, historyTruncated, baseline };
}
