import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const microreptesDir = path.join(process.cwd(), 'microreptes');

async function readChallenge(challengeDir) {
  const challengePath = path.join(microreptesDir, challengeDir, 'challenge.json');
  const raw = await readFile(challengePath, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const entries = await readdir(microreptesDir, { withFileTypes: true });
  const challengeDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  console.log('Autocorreccions disponibles:');

  for (const challengeDir of challengeDirs) {
    const challenge = await readChallenge(challengeDir);
    if (challenge.deprecated) continue;
    const code = challenge.microrepte_code || 'sense codi';
    const primaryRa = challenge.primary_ra || challenge.assessment_role || 'sense RA';
    console.log(`- ${challenge.challenge_id} [${code} · ${primaryRa}]: ${challenge.title}`);
  }
}

main().catch((error) => {
  console.error(`No s'han pogut llistar els microreptes: ${error.message}`);
  process.exit(1);
});
