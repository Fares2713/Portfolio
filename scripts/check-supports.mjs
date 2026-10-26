import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const data=JSON.parse(readFileSync('assets/supports-editoriaux/contenus.json','utf8'));
assert.equal(data.author,'Farès Benamar');assert.equal(data.supports.length,5);
for(const support of data.supports){
 const base='assets/supports-editoriaux/'+support.id;
 const html=readFileSync(base+'.html','utf8');assert.match(html,/Création pour le portfolio/);assert.match(html,/26 octobre 2026/);assert.ok(html.includes(support.title));
 const pdf=readFileSync(base+'.pdf');assert.equal(pdf.subarray(0,5).toString(),'%PDF-');const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;assert.equal(pages,support.id==='preparation'?3:1);
 assert.ok(existsSync(base+'-apercu.jpg'));assert.ok(support.blocks.length>=3);
}
const availability=JSON.parse(readFileSync('tools-availability.json','utf8'));
if(availability.paused)for(const app of availability.apps){const html=readFileSync(app+'/index.html','utf8');assert.match(html,/Temporairement indisponible/);assert.ok(!/<script\b/.test(html));const source=readFileSync('scripts/paused-apps/'+app+'.html.source','utf8');assert.ok(source.length>10000);assert.match(source,/<script\b/)}
console.log('PASS original supports: five readable HTML views, 1/1/1/1/3-page PDFs, source context, previews and preserved paused applications.');
