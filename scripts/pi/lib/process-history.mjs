const GENERIC_MESSAGES = new Set([
  'actualitza',
  'canvis',
  'canvi',
  'commit',
  'correcció',
  'correccions',
  'fix',
  'modificacions',
  'prova',
  'test',
  'treball',
  'update',
  'wip'
]);

const AREA_PATTERNS = [
  ['proposta', /necessitat|propost|dossier[ -]?1/i],
  ['disseny', /avantproject|arquitect|disseny|dossier[ -]?2|interf[ií]cie|viabil/i],
  ['planificacio', /cronograma|despleg|estimaci|\bpla\b|planific|pressupost|risc/i],
  ['execucio-control', /incid|implement|iteraci|prototip|prova|seguiment|\btest|validaci/i],
  ['tancament', /conclus|defensa|mem[oò]ria|tancament/i],
  ['transversal', /decisi|evid[eè]n|font|\bia\b|revisi|trasp[aà]s/i]
];

function round(value, digits = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function dayKey(value, timeZone) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((item) => [item.type, item.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function title(message) {
  return String(message || '').split(/\r?\n/, 1)[0].trim();
}

export function messageAreas(message) {
  const value = title(message);
  const matches = AREA_PATTERNS.filter(([, pattern]) => pattern.test(value)).map(([area]) => area);
  return matches.length ? matches : ['no-determinada'];
}

export function genericMessage(message) {
  const value = title(message).toLocaleLowerCase('ca').replace(/[.!]+$/, '').trim();
  return value.length < 8 || GENERIC_MESSAGES.has(value);
}

export function analyseProcessHistory(history, {
  baseline = null,
  historyTruncated = false,
  timeZone = 'Europe/Madrid'
} = {}) {
  const timeline = [...(history || [])]
    .filter((item) => item?.commit && item?.committed_at)
    .sort((left, right) => new Date(left.committed_at) - new Date(right.committed_at))
    .map((item) => ({
      commit: item.commit,
      committed_at: item.committed_at,
      author: String(item.author || 'No identificat'),
      message: title(item.message),
      areas: messageAreas(item.message),
      generic_message: genericMessage(item.message),
      issue_references: [...new Set(title(item.message).match(/#\d+/g) || [])]
    }));

  const dayCounts = new Map();
  for (const item of timeline) {
    const day = dayKey(item.committed_at, timeZone);
    if (day) dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  }
  const dailyActivity = [...dayCounts.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([date, commits]) => ({ date, commits }));
  const busiest = dailyActivity.reduce((current, item) => !current || item.commits > current.commits ? item : current, null);
  const times = timeline.map((item) => new Date(item.committed_at).getTime());
  const gaps = times.slice(1).map((value, index) => (value - times[index]) / 3_600_000);
  const contributors = [...new Set(timeline.map((item) => item.author))];
  const genericMessages = timeline.filter((item) => item.generic_message).length;
  const issueReferences = timeline.filter((item) => item.issue_references.length).length;
  const areaCounts = new Map();
  for (const item of timeline) {
    for (const area of item.areas) areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
  }

  const summary = {
    total_commits: timeline.length,
    active_days: dailyActivity.length,
    contributors,
    first_commit_at: timeline[0]?.committed_at || null,
    last_commit_at: timeline.at(-1)?.committed_at || null,
    span_hours: times.length > 1 ? round((times.at(-1) - times[0]) / 3_600_000) : 0,
    largest_gap_hours: gaps.length ? round(Math.max(...gaps)) : 0,
    busiest_day: busiest?.date || null,
    busiest_day_commits: busiest?.commits || 0,
    busiest_day_share: timeline.length ? round((busiest?.commits || 0) / timeline.length, 2) : 0,
    generic_messages: genericMessages,
    commits_with_issue_reference: issueReferences
  };

  const observations = [];
  if (!timeline.length) observations.push('No s’han identificat commits posteriors al punt de partida del control.');
  else if (timeline.length === 1) observations.push('El tram analitzat conté un únic commit; cal contrastar com s’ha desenvolupat i revisat el treball.');
  if (timeline.length > 1 && dailyActivity.length === 1) observations.push('Tots els commits del tram analitzat es concentren en un únic dia.');
  else if (timeline.length >= 5 && summary.busiest_day_share >= 0.8) observations.push('Almenys el 80 % dels commits del tram analitzat es concentra en un mateix dia.');
  if (genericMessages) observations.push(`${genericMessages} commit(s) tenen un missatge massa genèric per reconstruir amb claredat la seqüència de treball.`);
  if (!issueReferences && timeline.length >= 3) observations.push('Els missatges dels commits no contenen referències a issues; reviseu la traçabilitat amb les tasques per altres vies.');
  if (historyTruncated) observations.push('La cronologia s’ha truncat; cal consultar GitHub per revisar l’historial complet.');
  if (baseline?.status === 'missing') observations.push(`No s’ha trobat el punt de partida ${baseline.requested_ref}; les mètriques inclouen l’historial disponible fins a l’entrega.`);
  if (baseline && ['behind', 'diverged'].includes(baseline.status)) observations.push(`La versió entregada no continua linealment des de ${baseline.requested_ref} (${baseline.status}).`);

  return {
    scope: baseline || { requested_ref: null, commit: null, status: 'repository-history' },
    summary,
    daily_activity: dailyActivity,
    areas: [...areaCounts.entries()].map(([area, commits]) => ({ area, commits })).sort((left, right) => right.commits - left.commits || left.area.localeCompare(right.area)),
    timeline,
    observations,
    interpretation_required: true
  };
}
