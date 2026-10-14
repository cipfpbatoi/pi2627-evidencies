import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { loadConfiguration } from '../scripts/pi/lib/config.mjs';
import { buildEvidencePacket, buildRubricAssessment, criterionEvidenceFiles, validateModelProposal } from '../scripts/pi/lib/rubric-assessment.mjs';

const exec = promisify(execFile);

const commit = 'a'.repeat(40);
const report = {
  project: { id: 'hort', name: 'Hort urbà', repository: 'org/hort' },
  checkpoint: { id: 'b3-dossier-2', name: 'Bloc 3', rubric_id: 'b3-dossier-2' },
  version: { requested_ref: 'dossier-2-v1.0', commit },
  checks: [
    { evidence: ['docs/02-avantprojecte/dossier-2.md'] },
    { evidence: ['docs/00-control/decisions.md'] },
    { evidence: ['docs/00-control/fonts-ia.md'] },
    { evidence: ['evidencies/alumnat/anna-puig.md'] }
  ],
  candidate_evidence: []
};

function proposalFor(rubric, packet) {
  return {
    criteria: rubric.criteria.map((criterion) => {
      const paths = criterionEvidenceFiles(criterion, packet.files.map((file) => file.path));
      const selected = paths[0];
      return {
        criterion_id: criterion.id,
        document_level: criterion.source === 'defense' ? null : 3,
        confidence: criterion.source === 'defense' ? null : 0.82,
        reason: criterion.source === 'mixed' ? 'La traça documental és orientativa i necessita contrast.' : 'El producte respon de manera suficient al descriptor.',
        evidence: selected ? [{ path: selected, location: 'apartat de prova', excerpt: `Evidència literal de ${selected}` }] : [],
        missing: [],
        observation_focus: criterion.source === 'mixed' ? ['Confirmar autoria i comprensió.'] : [],
        orientation_questions: criterion.source === 'mixed' ? ['Quina decisió pròpia pots localitzar i explicar?'] : []
      };
    })
  };
}

test('la rúbrica automatitzable del Bloc 3 conserva huit entregables i un criteri mixt', async () => {
  const { checkpoints, rubrics } = await loadConfiguration(process.cwd());
  assert.equal(checkpoints.get('b3-dossier-2').rubric_id, 'b3-dossier-2');
  const rubric = rubrics.get('b3-dossier-2');
  assert.equal(rubric.criteria.filter((criterion) => criterion.source === 'deliverable').length, 8);
  assert.equal(rubric.criteria.filter((criterion) => criterion.source === 'mixed').length, 1);
  assert.equal(rubric.criteria.filter((criterion) => criterion.source === 'defense').length, 0);
});

test('genera nivells documentals i deixa el criteri mixt pendent de contrast', async () => {
  const { rubrics } = await loadConfiguration(process.cwd());
  const rubric = rubrics.get('b3-dossier-2');
  const packet = await buildEvidencePacket(report, rubric, async (file) => `Evidència literal de ${file}\nContingut de prova.\n`);
  const proposal = proposalFor(rubric, packet);
  const assessment = buildRubricAssessment(report, rubric, proposal, packet, '2026-10-14T20:00:00Z');
  assert.equal(assessment.qualification, null);
  assert.equal(assessment.teacher_review_required, true);
  assert.equal(assessment.criteria.filter((criterion) => criterion.status === 'proposed').length, 8);
  const mixed = assessment.criteria.find((criterion) => criterion.source === 'mixed');
  assert.equal(mixed.status, 'needs_observation');
  assert.equal(mixed.document_assessment.level, 3);
  assert.equal(mixed.teacher_decision, null);
  assert.match(mixed.observation_guide.questions[0], /decisió pròpia/);
});

test('rebutja cites inventades o fitxers que no corresponen al criteri', async () => {
  const { rubrics } = await loadConfiguration(process.cwd());
  const rubric = rubrics.get('b3-dossier-2');
  const packet = await buildEvidencePacket(report, rubric, async (file) => `Evidència literal de ${file}\n`);
  const invented = proposalFor(rubric, packet);
  invented.criteria[0].evidence[0].excerpt = 'Fragment que no existix';
  assert.throws(() => validateModelProposal(invented, rubric, packet), /no és literal/);
  const wrongFile = proposalFor(rubric, packet);
  wrongFile.criteria[0].evidence[0] = {
    path: 'docs/00-control/decisions.md',
    location: 'decisió',
    excerpt: 'Evidència literal de docs/00-control/decisions.md'
  };
  assert.throws(() => validateModelProposal(wrongFile, rubric, packet), /no permesa/);
});

test('no accepta un nivell documental sense cita ni un N sense mancança explícita', async () => {
  const { rubrics } = await loadConfiguration(process.cwd());
  const rubric = rubrics.get('b3-dossier-2');
  const packet = await buildEvidencePacket(report, rubric, async (file) => `Evidència literal de ${file}\n`);
  const unsupported = proposalFor(rubric, packet);
  unsupported.criteria[0].evidence = [];
  assert.throws(() => validateModelProposal(unsupported, rubric, packet), /necessita almenys una cita literal/);
  const absentWithoutReason = proposalFor(rubric, packet);
  absentWithoutReason.criteria[0].document_level = 'N';
  absentWithoutReason.criteria[0].evidence = [];
  assert.throws(() => validateModelProposal(absentWithoutReason, rubric, packet), /ha d’explicitar l’evidència absent/);
});

test('executa el pilot local sobre el commit immutable i guarda la proposta separada', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'pi-rubric-'));
  const repo = path.join(temporary, 'repo');
  try {
    const files = [
      'docs/02-avantprojecte/dossier-2.md',
      'docs/00-control/decisions.md',
      'docs/00-control/fonts-ia.md',
      'evidencies/alumnat/anna-puig.md'
    ];
    for (const file of files) {
      await mkdir(path.dirname(path.join(repo, file)), { recursive: true });
      await writeFile(path.join(repo, file), `Evidència literal de ${file}\nContingut de prova.\n`);
    }
    await exec('git', ['init'], { cwd: repo });
    await exec('git', ['add', '.'], { cwd: repo });
    await exec('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'dossier'], { cwd: repo });
    const { stdout } = await exec('git', ['rev-parse', 'HEAD'], { cwd: repo });
    const immutableReport = { ...report, version: { ...report.version, commit: stdout.trim() } };
    const { rubrics } = await loadConfiguration(process.cwd());
    const rubric = rubrics.get('b3-dossier-2');
    const packet = await buildEvidencePacket(immutableReport, rubric, async (file) => `Evidència literal de ${file}\nContingut de prova.\n`);
    const reportFile = path.join(temporary, 'report.json');
    const mockFile = path.join(temporary, 'mock.json');
    const outputFile = path.join(temporary, 'assessment.json');
    await writeFile(reportFile, JSON.stringify(immutableReport));
    await writeFile(mockFile, JSON.stringify(proposalFor(rubric, packet)));
    await exec(process.execPath, ['scripts/pi/evaluate-rubric.mjs', '--input', reportFile, '--repo-dir', repo, '--mock-result', mockFile, '--output', outputFile], { cwd: process.cwd() });
    const assessment = JSON.parse(await readFile(outputFile, 'utf8'));
    assert.equal(assessment.report.commit, stdout.trim());
    assert.equal(assessment.criteria.length, 9);
    assert.equal(assessment.qualification, null);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
