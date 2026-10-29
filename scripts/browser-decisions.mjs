import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=resolve('.'),output=resolve(process.env.PORTFOLIO_DECISIONS_OUTPUT||'screenshots/decisions');
const server=http.createServer(async(req,res)=>{
 const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
 if(!path.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{const data=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.pdf':'application/pdf','.md':'text/markdown; charset=utf-8','.zip':'application/zip','.csv':'text/csv; charset=utf-8','.webp':'image/webp'})[extname(path)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch(process.env.PORTFOLIO_CHROMIUM_PATH?{executablePath:process.env.PORTFOLIO_CHROMIUM_PATH}:{});await mkdir(output,{recursive:true});
try{
 for(const width of [320,768,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/dossier-decisions/');await page.locator('#choices').waitFor({state:'visible'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.match(await page.locator('#result-title').innerText(),/Annoncer/);
  await page.locator('[data-action=pin]').click();await page.locator('#contrainte').selectOption('incomplet');assert.match(await page.locator('#result-title').innerText(),/Différer/);assert.match(await page.locator('.comparison').innerText(),/Parcours épinglé/i);assert.match(await page.locator('.comparison').innerText(),/Différer/);
  await page.locator('#report-tab-synthese').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#report-tab-supports').getAttribute('aria-selected'),'true');assert.ok(await page.locator('#report-panel-supports').isVisible());assert.doesNotMatch(await page.locator('.preview-body').innerText(),/4 mai|Prenez rendez-vous/);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action=download]').click()]);const markdown=(await readFile(await download.path())).toString();assert.match(markdown,/Différer l’annonce/);assert.match(markdown,/Les options évaluées/);assert.match(markdown,/Livrable attendu/);
  await page.locator('input[value=rectification]').check();await page.locator('#public').selectOption('agents');await page.locator('#canal').selectOption('social');assert.match(await page.locator('#report-panel-supports').innerText(),/Je remplace le réseau social/);assert.match(await page.locator('.preview-body').innerText(),/vérifions/);
  const url=page.url();await page.reload();await page.locator('#choices').waitFor({state:'visible'});assert.equal(await page.locator('#public').inputValue(),'agents');assert.equal(await page.locator('#canal').inputValue(),'social');assert.equal(page.url(),url);assert.ok(await page.locator('#report-panel-supports').isVisible());
  await page.locator('input[value=controverse]').focus();await page.keyboard.press('Space');await page.locator('#public').selectOption('usagers');await page.locator('#canal').selectOption('affiche');await page.locator('#contrainte').selectOption('accessibilite');assert.match(await page.locator('#result-title').innerText(),/Ouvrir l’explication/);
  await page.locator('#report-tab-plan').click();assert.match(await page.locator('.access-note').last().innerText(),/réponse orale/);assert.equal(await page.locator('.step-owner').count(),4);await page.goBack();assert.equal(await page.locator('#contrainte').inputValue(),'incomplet');
  await page.locator('[data-action=choose]').click();assert.ok(await page.locator('input[value=controverse]').evaluate(el=>el===document.activeElement));await page.locator('#report-tab-synthese').click();await page.locator('[data-action=unpin]').click();assert.equal(await page.locator('.comparison').count(),0);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  await page.goto(origin+'/dossier-decisions/');await page.locator('#choices').waitFor({state:'visible'});await page.screenshot({path:output+'/hero-'+width+'.png'});await page.locator('#report-tab-supports').click();await page.locator('.content-preview').scrollIntoViewIfNeeded();await page.screenshot({path:output+'/support-'+width+'.png'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(origin+'/#decisions');await page.waitForFunction(()=>document.getElementById('decisions-title').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().height);assert.ok(await page.evaluate(()=>document.getElementById('decisions-title').getBoundingClientRect().top<document.querySelector('.site-header').getBoundingClientRect().height+90));await page.screenshot({path:output+'/portfolio-entry-'+width+'.png'});assert.equal(await page.locator('#decisions a[href="dossier-decisions/"]').getAttribute('href'),'dossier-decisions/');
  assert.deepEqual(errors,[]);console.log('PASS '+width+'px: immediate updates, pinned comparison, keyboard tabs, exports, deep links, history, safe copy and axe');await context.close();
 }
 const page=await browser.newPage({javaScriptEnabled:false});await page.goto(origin+'/dossier-decisions/');await page.locator('.fallback summary').click();assert.equal(await page.locator('.fallback article:visible').count(),3);
 for(const href of await page.locator('#ressources a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')))){
 const r=await page.request.get(new URL(href,origin+'/dossier-decisions/').href);assert.equal(r.status(),200);const body=await r.body();if(href.endsWith('.pdf'))assert.equal(body.subarray(0,5).toString(),'%PDF-');if(href.endsWith('.zip')||href.endsWith('.docx'))assert.equal(body.subarray(0,2).toString(),'PK');
 }
 console.log('PASS without JavaScript: all three summaries and every PDF, DOCX, CSV, Markdown and ZIP link');
 const printable=await browser.newPage();await printable.goto(origin+'/dossier-decisions/?cas=rectification&public=usagers&canal=affiche&contrainte=incomplet');await printable.locator('#choices').waitFor({state:'visible'});await printable.emulateMedia({media:'print'});assert.ok(await printable.locator('.print-notice').isVisible());assert.ok(!(await printable.locator('#choices').isVisible()));assert.ok(await printable.locator('#result-title').isVisible());await printable.pdf({path:output+'/parcours-imprime.pdf',format:'A4',printBackground:true});
 await printable.emulateMedia({media:'screen'});await printable.goto(origin+'/dossier-decisions/?cas=absent&public=__proto__&canal=constructor');await printable.locator('#choices').waitFor({state:'visible'});assert.equal(await printable.locator('#public').inputValue(),'usagers');console.log('PASS print export and invalid URL recovery');
 const failure=await browser.newPage();await failure.route('**/contenus.json',r=>r.abort());await failure.goto(origin+'/dossier-decisions/');await failure.getByText('Le dossier interactif ne peut pas se charger.',{exact:false}).waitFor();assert.ok(await failure.locator('#ressources').isVisible());console.log('PASS failed data load retains document access');
}finally{await browser.close();await new Promise(r=>server.close(r));}
