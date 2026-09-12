import { execFileSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { calculateRepteExtension as calc, makeExtensionReview, normalizeExtensionProposal, validateExtensionOwners, validateProposal, readChallengeMetadata } from '../scripts/lib/repte-extension.mjs';
import { aggregateRepteGrades } from '../scripts/aggregate-repte-grades.mjs';
import { initDb, closeDb, migrateFromJson, getLatestGrades } from '../teacher-dashboard/db.mjs';

const repte = 'r1';
const metadata = new Map([
 ['m1', { challenge_id: 'm1', repte_id: repte, microrepte_code: 'R1M1', primary_ra: 'RA1', repte_weight: .25 }],
 ['m2', { challenge_id: 'm2', repte_id: repte, microrepte_code: 'R1M2', primary_ra: 'RA1', repte_weight: .75, repte_extension: { scope: 'repte' } }]
]);
const proposal = { proposed_score: 1, core_ready: true, reason: 'Demo navegable', evidence: ['src/about.php'], presentation_checks: ['Explica la ruta'] };
const grades = (a = 10, b = 10) => [
 { repo: 'a/b', student: 'a/b', group: 'C', challenge_id: 'm1', score: a, commit: 'abc', timestamp: '2026-09-01', ra_scores: [{ ra_id: 'RA1', score: a }] },
 { repo: 'a/b', student: 'a/b', group: 'C', challenge_id: 'm2', score: b, commit: 'def', timestamp: '2026-09-02', ra_scores: [{ ra_id: 'RA1', score: b }], repte_extension: proposal }
];
function review(gs, score = 1, core = true) {
 const c = calc(gs, metadata, repte);
 return makeExtensionReview({ source_challenge_id: 'm2', snapshot: c.snapshot, validated_score: score, core_requirements_met: core, comment: 'Demo i defensa comprovades.' }, c);
}

test('nucli perfecte: 9 sense ampliació, 10 amb ampliació validada', () => {
 const gs = grades();
 assert.equal(calc(gs, metadata, repte, review(gs, 0)).final_score, 9);
 assert.equal(calc(gs, metadata, repte, review(gs, 1)).final_score, 10);
 assert.equal(calc(gs, metadata, repte).final_score, null);
 assert.equal(calc(gs, metadata, repte).proposed_score, 1);
});
test('els sis casos usen els pesos i s’arredonix al final', () => {
 for (const [a, b, base] of [[3.3,1.1,1.49],[3.6,1.5,1.82],[6.7,3.2,3.67],[6.1,8.1,6.84],[8.9,8.8,7.94],[8.9,8.85,7.98]]) {
  const gs = grades(a,b);assert.equal(calc(gs, metadata, repte,review(gs,0)).final_score,base);
 }
 const gs = grades(8.9, 8.85);assert.equal(calc(gs, metadata, repte,review(gs,1)).final_score,8.98);
});
test('microrepte pendent no és un zero ni permet validació', () => {
 const c = calc(grades().slice(0,1),metadata,repte);
 assert.equal(c.status,'incomplete');assert.equal(c.final_score,null);assert.deepEqual(c.missing_microreptes,['R1M2']);
 assert.throws(() => makeExtensionReview({source_challenge_id:'m2'},c));
});
test('només l’últim microrepte pot proposar i validar', () => {
 const gs=grades();gs[0].repte_extension=proposal;delete gs[1].repte_extension;
 const c=calc(gs,metadata,repte);assert.equal(c.proposed_score,null);
 assert.throws(()=>makeExtensionReview({source_challenge_id:'m1'},c));
 assert.doesNotThrow(()=>validateExtensionOwners(metadata));
 const invalid=structuredClone(metadata);invalid.get('m1').repte_extension={};
 assert.throws(()=>validateExtensionOwners(invalid));
});
test('una correcció canviada invalida la revisió, també si és anterior a l’últim microrepte', () => {
 const gs=grades();const r=review(gs);gs[0].score=9;
 const c=calc(gs,metadata,repte,r);assert.equal(c.status,'stale');assert.equal(c.final_score,null);
 assert.throws(()=>makeExtensionReview({...r,comment:'vella'},c));
});
test('no suma punts sense mínims confirmats i valida escala i comentari', () => {
 const gs=grades();assert.throws(()=>review(gs,1,false));assert.throws(()=>review(gs,2));assert.throws(()=>review(gs,NaN));
 assert.equal(calc(gs,metadata,repte,review(gs,0,false)).final_score,9);
 assert.throws(()=>validateProposal({...proposal,proposed_score:.3}));
 assert.throws(()=>validateProposal({...proposal,core_ready:false}));
 assert.throws(()=>validateProposal({...proposal,evidence:[]}));
 const c=calc(gs,metadata,repte);assert.throws(()=>makeExtensionReview({...review(gs),comment:''},c));
});
test('la proposta IA no s’aplica i la validació manual funciona amb resultats antics', () => {
 const gs=grades(8,8);delete gs[1].repte_extension;
 assert.equal(calc(gs,metadata,repte).proposed_score,null);
 assert.equal(calc(gs,metadata,repte,review(gs,.5)).final_score,7.7);
});
test('no altera RA ni duplica la suma en agregació CLI', () => {
 const gs=grades();const r=review(gs);const teacher=new Map([['a/b\u0000r1',{extension_review:r}]]);
 const result=aggregateRepteGrades(gs,metadata,teacher);
 assert.equal(result.raRecords[0].auto_score,10);assert.equal(result.repteRecords[0].final_score,10);
 assert.equal(result.repteRecords[0].auto_score,9);
 assert.equal(gs[1].score,10);
});
test('configuració real: propietari únic en el darrer microrepte de cada repte',async()=>{
 const config=await readChallengeMetadata(process.cwd());validateExtensionOwners(config);
 assert.deepEqual([...config.values()].filter(c=>c.repte_extension).map(c=>c.microrepte_code),['R1M2','R2M9','R3M7','R4M5','R5M5']);
});
test('SQLite conserva proposta i actualitza una recorrecció del mateix commit',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'dwes-extension-db-'));
 try {
  initDb(path.join(dir,'db.sqlite'));migrateFromJson(grades());
  let row=getLatestGrades(-1).find(g=>g.challenge_id==='m2');assert.deepEqual(JSON.parse(row.repte_extension),proposal);
  const gs=grades();gs[1].timestamp='2026-09-03';gs[1].repte_extension={...proposal,proposed_score:.75};
  migrateFromJson(gs);row=getLatestGrades(-1).find(g=>g.challenge_id==='m2');assert.equal(JSON.parse(row.repte_extension).proposed_score,.75);
 } finally {closeDb();rmSync(dir,{recursive:true,force:true});}
});

test('instantània compartida entre JSON/CLI i SQLite/dashboard',()=>{
 const gs=grades();const r=review(gs);
 const dbRows=gs.map(g=>({...g,commit_hash:g.commit,commit:undefined,repte_extension:JSON.stringify(g.repte_extension || null)}));
 assert.equal(calc(dbRows,metadata,repte,r).status,'validated');
});

test('recull fitxers enllaçats de l’ampliació sense exigir-los el codi del microrepte',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'dwes-extension-evidence-'));
 try {
  mkdirSync(path.join(dir,'docs'));mkdirSync(path.join(dir,'src'));
  writeFileSync(path.join(dir,'docs/r1-ampliacio.md'),'# Ampliació\n[Implementació](../src/about.php)');
  writeFileSync(path.join(dir,'src/about.php'),'<?php echo "Com funciona";');
  execFileSync('git',['init','-q'],{cwd:dir});execFileSync('git',['add','.'],{cwd:dir});
  const run=(challenge,code)=>execFileSync(process.execPath,['scripts/collect-repo-evidence.mjs','--repo-dir',dir,'--repo','a/b','--commit','test','--challenge-id',challenge,'--microrepte-code',code,'--repo-signals',path.join(dir,'signals.json'),'--evidence-summary',path.join(dir,'summary.json')]);
  run('r1-s02-entorn-executable','R1M2');
  assert.equal(JSON.parse(readFileSync(path.join(dir,'summary.json'))).repte_extension.referenced_files[0].path,'src/about.php');
  run('r1-s01-model-client-servidor-stack','R1M1');
  assert.equal(JSON.parse(readFileSync(path.join(dir,'summary.json'))).repte_extension,null);
 } finally {rmSync(dir,{recursive:true,force:true});}
});

test('proposta incoherent no elimina la nota del nucli ni valida punts',()=>{
 for (const invalid of [{...proposal,core_ready:false}, {...proposal,evidence:[]}, null, {...proposal,proposed_score:2}]) {
  const result={final_score_over_10:8.1,ra_scores:[{ra_id:'RA1',score:8.1}],repte_extension:invalid,blocking_flags:[]};
  normalizeExtensionProposal(result);
  assert.equal(result.final_score_over_10,8.1);
  assert.deepEqual(result.ra_scores,[{ra_id:'RA1',score:8.1}]);
  assert.equal(result.repte_extension.proposed_score,0);
  assert.equal(result.teacher_review_required,true);
  assert.doesNotThrow(()=>validateProposal(result.repte_extension));
  const gs=grades();gs[1].repte_extension=result.repte_extension;
  assert.equal(calc(gs,metadata,repte).final_score,null);
 }
 const valid={repte_extension:structuredClone(proposal)};
 const before=structuredClone(valid);normalizeExtensionProposal(valid);assert.deepEqual(valid,before);
});
