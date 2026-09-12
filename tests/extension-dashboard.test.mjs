import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, symlinkSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

// Entirely isolated course/database: never touches real grades or calls external APIs.
test('dashboard: només l’últim microrepte valida; proposta → nota global sense alterar RA', { timeout: 20000 }, async t => {
 const fixture=mkdtempSync(path.join(tmpdir(),'dwes-extension-http-'));
 for(const dir of ['teacher-dashboard','scripts','microreptes','global']) cpSync(dir,path.join(fixture,dir),{recursive:true});
 mkdirSync(path.join(fixture,'docs/programacio_aula'),{recursive:true});
 writeFileSync(path.join(fixture,'docs/programacio_aula/programacio_aula_r2s1_test.md'),'# R2S1. Test\n\n- **Microrepte**: `R2M1`\n');
 writeFileSync(path.join(fixture,'docs/programacio_aula/programacio_aula_r2s0_test.md'),'# R2S0. Introducció\n');
 mkdirSync(path.join(fixture,'grades'));mkdirSync(path.join(fixture,'course'));
 symlinkSync(path.resolve('node_modules'),path.join(fixture,'node_modules'),'dir');
 const first='r1-s01-model-client-servidor-stack',last='r1-s02-entorn-executable';
 const grades=[first,last].map(challenge_id=>({repo:'test/alumne',student:'test/alumne',group:'TEST',challenge_id,score:10,ra_scores:[{ra_id:'RA1',score:10}],commit:challenge_id,timestamp:'2026-09-01',source:'openai',confidence:1,provisional:false,teacher_review_required:false}));
 grades[1].repte_extension={proposed_score:1,core_ready:true,reason:'Segona ruta provada',evidence:['src/about.php'],presentation_checks:['Explicar la navegació']};
 writeFileSync(path.join(fixture,'grades/latest-grades.json'),JSON.stringify(grades));
 const child=spawn(process.execPath,['teacher-dashboard/server.mjs'],{cwd:fixture,env:{PATH:process.env.PATH,DASHBOARD_PORT:'0',DASHBOARD_HOST:'127.0.0.1'}});
 t.after(async()=>{child.kill('SIGINT');if(child.exitCode===null) await once(child,'exit');rmSync(fixture,{recursive:true,force:true});});
 let logs='';child.stderr.on('data',data=>{logs+=data;});
 const base=await new Promise((resolve,reject)=>{
  child.stdout.on('data',data=>{logs+=data;const match=logs.match(/Dashboard disponible en (http:\/\/[^\s]+)/);if(match)resolve(match[1]);});
  child.on('exit',()=>reject(new Error(logs)));
 });
 const get=async url=>{const r=await fetch(base+url);assert.equal(r.status,200);return r.json();};
 const earlier=(await get('/api/repte-grades?challenge='+first)).repte_grades[0];
 assert.equal(earlier.can_review_extension,false);
 let record=(await get('/api/repte-grades?challenge='+last)).repte_grades[0];
 assert.equal(record.can_review_extension,true);assert.equal(record.extension.base_score,9);assert.equal(record.extension.final_score,null);
 const body={repo:'test/alumne',repte_id:'r1-kickoff-backend',teacher_score:'',extension_review:{source_challenge_id:first,snapshot:record.extension.snapshot,validated_score:1,core_requirements_met:true,comment:'Demo comprovada'}};
 const post=()=>fetch(base+'/api/repte-grades/teacher',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
 assert.notEqual((await post()).status,200);
 body.extension_review.source_challenge_id=last;assert.equal((await post()).status,200);
 record=(await get('/api/repte-grades?challenge='+last)).repte_grades[0];
 assert.equal(record.extension.final_score,10);assert.equal(record.extension.status,'validated');
 assert.equal((await get('/api/ra-grades')).ra_grades[0].score,10);
 const html=await (await fetch(base)).text();
 for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) assert.doesNotThrow(()=>new Function(match[1]));
 assert.ok(html.includes('data-extension-score'));
 const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
 const renderer = new Function('window', 'escapeHtml', script.slice(script.indexOf('    function renderMarkdownLinks('), script.indexOf('    function compareMicrorepteOrder(')) + '; return renderMarkdown;')(
  {location:{href:base}}, value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')
 );
 const source = 'https://igomis.github.io/reestructuracioModul/01_programacio_modul/session.md';
 const rendered = renderer('[Rúbrica](../03_avaluacio/rubrica.md#criteris) i [PDF](https://example.org/material.pdf) i [Apartat](#final)', source);
 assert.ok(rendered.includes('href="https://igomis.github.io/reestructuracioModul/03_avaluacio/rubrica/#criteris"'));
 assert.ok(rendered.includes('href="https://example.org/material.pdf"'));
 assert.ok(rendered.includes('href="https://igomis.github.io/reestructuracioModul/01_programacio_modul/session/#final"'));
 assert.ok(!renderer('[Maliciós](javascript:alert) [Dades](data:text/html,test)', source).includes('<a '));
 assert.ok(!renderer('`[Codi](https://example.org)`', source).includes('<a '));
 assert.ok(html.includes('Obrir la sessió en la documentació del professorat'));

 const consolidationUrl=base+'/api/programacio-aula/R2S1/consolidacio';
 const saveSheet=markdown=>fetch(consolidationUrl,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({markdown})});
 assert.equal((await (await fetch(consolidationUrl)).json()).has_draft,false);
 assert.equal((await saveSheet('# Fitxa de prova')).status,200);
 assert.equal((await (await fetch(consolidationUrl)).json()).markdown,'# Fitxa de prova\n');
 assert.equal((await fetch(base+'/api/programacio-aula/NO/consolidacio')).status,404);
 assert.equal((await (await fetch(base+'/api/programacio-aula/R2S0/consolidacio')).json()).code,null);
 assert.ok(html.includes('Publicar fitxa per a tot l’alumnat'));
 assert.ok(html.includes('Retirar de la web'));
 const linkRenderer=new Function('escapeHtml',script.slice(script.indexOf('    function repositoryLink('),script.indexOf('    function renderInlineMarkdown('))+'; return repositoryLink;')(value=>String(value).replaceAll('<','&lt;'));
 assert.ok(linkRenderer('test/alumne').includes('href="https://github.com/test/alumne"'));
 assert.ok(!linkRenderer('javascript:alert(1)').includes('<a '));
 const removal=await fetch(consolidationUrl,{method:'DELETE'});
 assert.notEqual(removal.status,200);
 assert.equal((await (await fetch(consolidationUrl)).json()).markdown,'# Fitxa de prova\n');
 const noteUrl = base + '/api/programacio-aula/R1S1/notes';
 const saveNote = body => fetch(noteUrl, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
 for (const group_name of [undefined, '', 'all', 'desconegut']) {
  assert.equal((await saveNote({session_date:'2026-09-07',comment:'Nota',group_name})).status,400);
 }
 for (const group_name of ['2DAW-A','2DAW-C']) {
  assert.equal((await saveNote({session_date:'2026-09-07',comment:'Comentari de '+group_name,group_name})).status,200);
 }
 const notes=(await get('/api/programacio-aula/R1S1/notes')).notes;
 assert.equal(notes.length,2);
 assert.deepEqual(notes.map(n=>n.group_name).sort(),['2DAW-A','2DAW-C']);
 assert.ok(html.includes('programacioNoteGroup'));
 const choices=await get('/api/microreptes');assert.ok(!choices.microreptes.some(m=>m.id==='r2-ampliacio-9-10'));
});
