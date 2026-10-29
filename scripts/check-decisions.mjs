import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {decide,normalize,toMarkdown,compareDecisions,toWorkshop} from '../dossier-decisions/moteur.mjs';
const data=JSON.parse(readFileSync('dossier-decisions/contenus.json','utf8'));
import {readWorkspace} from '../atelier-editorial/modele.mjs';
let count=0;
for(const c of data.cases)for(const publicId of Object.keys(data.audiences))for(const canal of Object.keys(data.channels))for(const contrainte of Object.keys(data.constraints)){
 const r=decide(data,{cas:c.id,public:publicId,canal,contrainte});
 assert.equal(r.c.id,c.id);assert.equal(r.timeline.length,4);assert.ok(r.metrics.every(m=>m.method&&m.rule));
 assert.ok(!toMarkdown(data,r).includes('undefined'));
 if(contrainte==='incomplet'){
  assert.match(r.gate,/valid|confirm/);
  if(c.id==='service'){assert.doesNotMatch(r.body,/4 mai|14 h|Prenez rendez-vous/);assert.match(r.title,/Différer/);}
  if(c.id==='rectification'){assert.doesNotMatch(r.message,/est gratuit/);assert.match(r.message,/vérifions/);}
  if(c.id==='controverse'){assert.match(r.message,/horaires actuels restent applicables/);assert.match(r.message,/ne sont pas encore confirmés/);}
 }
 if(contrainte==='accessibilite')assert.match(r.access,/réponse orale/);
 if(publicId==='agents'&&canal==='social'){assert.equal(r.channel.label,'Un e-mail');assert.equal(r.redirected,true);assert.match(r.body,/Réponse commune/);}
 if(c.id==='rectification'&&contrainte!=='incomplet')assert.match(r.restriction,/limitée/);
 assert.equal(r.options.filter(o=>o.selected).length,1);assert.ok(r.timeline.every(t=>t.owner&&t.deliverable));
 const handoff=readWorkspace(JSON.stringify(toWorkshop(data,r,'https://portfolio.example/dossier-decisions/')));assert.equal(handoff.items.length,3);assert.ok(handoff.items.every(i=>i.status==='brouillon'&&!i.approval&&!i.date&&!i.owner));assert.ok(handoff.sources.every(s=>!s.checked&&s.title.startsWith('Pièce fictive')));assert.equal(handoff.origin.kind,'fictional-decision-case');
 count++;
}
assert.equal(count,81);
const comparison=compareDecisions(decide(data,{cas:'service'}),decide(data,{cas:'service',contrainte:'incomplet'}));assert.ok(comparison.find(r=>r.label==='Décision').changed);assert.ok(comparison.find(r=>r.label==='Message').changed);assert.equal(comparison.find(r=>r.label==='Public').changed,false);assert.throws(()=>toWorkshop(data,decide(data,{}),'file:///tmp/index.html'),/HTTP/);
assert.deepEqual(normalize(data,{cas:'missing',public:'__proto__',canal:'toString',contrainte:'constructor'}),{cas:'service',public:'usagers',canal:'email',contrainte:'urgence'});
for(const file of ['index.html','dossier-decisions/index.html']){
 const html=readFileSync(file,'utf8');const dir=file.includes('/')?'dossier-decisions/':'';
 for(const m of html.matchAll(/(?:href|src)="([^"#?]+)"/g)){
  if(/^(https?:|mailto:|tel:)/.test(m[1]))continue;
  assert.ok(existsSync(dir+m[1]),`${file}: resource ${m[1]}`);
 }
}
for(const c of data.cases){const pdf=readFileSync(`assets/dossier-decisions/${c.number}-${c.id}.pdf`);assert.equal(pdf.subarray(0,5).toString(),'%PDF-');}
const zip=readFileSync('assets/dossier-decisions/dossier-complet.zip');assert.equal(zip.subarray(0,2).toString(),'PK');
console.log(`PASS ${count} decision paths: withheld promises, internal channel redirection, offline access, traceable exports and local documents.`);
