import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=resolve('.');
const server=http.createServer(async(req,res)=>{
 const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
 if(!path.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{
  const content=await readFile(path);
  const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf'};
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'}).end(content);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch(process.env.PORTFOLIO_CHROMIUM_PATH?{executablePath:process.env.PORTFOLIO_CHROMIUM_PATH}:{});
await mkdir('screenshots',{recursive:true});
try{
 for(const width of [360,768,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],failedLocal=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400) failedLocal.push(response.url());});
  await page.goto(origin,{waitUntil:'networkidle'});
  assert.match(await page.title(),/Farès Benamar.*Communication/);
  assert.equal(await page.locator('.hero-actions a').count(),2,'Two primary recruitment actions');
  assert.equal(await page.locator('.hero-actions a').first().innerText(),'Voir mes réalisations');
  assert.equal(await page.locator('.hero-actions a').last().getAttribute('href'),'#contact');
  assert.equal(await page.locator('.experience-row').count(),4,'Two employment experiences and two independent projects');
  assert.match(await page.locator('.experience-row').first().innerText(),/FNK Location/);
  assert.equal(await page.locator('a[download]').count(),0,'Outdated CV is preserved on disk, not offered as a current download');
  assert.equal(await page.locator('.project-contribution').count(),4,'Exact role visible on each selected project');
  assert.equal(await page.locator('.additional-project').count(),2,'Both earlier case studies retained');
  assert.equal(await page.locator('.hero-portrait img').getAttribute('src'),'assets/portrait-fares-benamar.webp');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
  assert.equal(await page.locator('.menu-toggle').isVisible(),width<=760);
  if(width<=760){
   await page.locator('.menu-toggle').focus();
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
   assert.ok(await page.locator('.menu-toggle').evaluate(el=>el===document.activeElement),'Escape restores menu focus');
  }else assert.ok(await page.locator('#navigation').isVisible());
  assert.ok((await page.locator('.hero-portrait').boundingBox()).width<=341);
  const portraitImage=await page.locator('.hero-portrait img').boundingBox();
  assert.ok(portraitImage.height<=portraitImage.width*1.25,'Portrait keeps a natural crop');
  for(const image of await page.locator('.project-visual img').all()) {
   const bounds=await image.boundingBox();
   assert.ok(Math.abs(bounds.width/bounds.height-1.6)<0.02,'Project previews keep a consistent ratio');
  }
  await page.screenshot({path:'screenshots/hero-'+width+'.png'});
  for(const [filter,expected] of [['institutionnel',2],['digital',2],['all',4]]){
   await page.locator('[data-filter="'+filter+'"]').click();
   assert.equal(await page.locator('.project:visible').count(),expected);
   assert.equal(await page.locator('.filters [aria-pressed="true"]').count(),1);
   assert.match(await page.locator('#filter-status').innerText(),new RegExp('^'+expected));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Filtered layout');
  }
  // Skill links must reveal a case even when the active filter hides it.
  await page.locator('[data-filter="digital"]').click();
  await page.locator('.expertise-grid a[href="#projet-1"]').click();
  assert.ok(await page.locator('#projet-1').isVisible());
  assert.equal(await page.locator('[data-filter="all"]').getAttribute('aria-pressed'),'true');
  const firstSummary=page.locator('.project summary').first();
  await firstSummary.focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.project details').first().getAttribute('open'),'');
  assert.ok(await page.locator('.project .case-content').first().isVisible());
  await page.keyboard.press('Enter');
  await page.locator('.additional-projects>summary').focus();
  await page.keyboard.press('Enter');
  assert.ok(await page.locator('#projet-3').isVisible());
  assert.ok(await page.locator('#projet-7').isVisible());
  await page.locator('.earlier-experience>summary').click();
  assert.equal(await page.locator('.earlier-grid article:visible').count(),3);
  // Force lazy images to load before validating and capturing the whole page.
  for(const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(audit.violations.map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.map(n=>n.target)})),[],'Accessibility including color contrast');
  await page.locator('.additional-projects>summary').click();
  await page.locator('.earlier-experience>summary').click();
  await page.locator('#projets').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.screenshot({path:'screenshots/projects-'+width+'.png'});
  await page.screenshot({path:'screenshots/site-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[]);
  assert.deepEqual(failedLocal,[],'All local resources load');
  console.log('PASS '+width+'px: keyboard menu, filters, anchor recovery, cases, real images, recruitment actions and axe');
  await context.close();
 }
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:1000}});
 await plain.goto(origin);
 assert.ok(await plain.locator('#navigation').isVisible());
 assert.equal(await plain.locator('.project:visible').count(),4);
 await plain.locator('.project summary').first().click();
 assert.ok(await plain.locator('.project .case-content').first().isVisible());
 await plain.locator('.additional-projects>summary').click();
 assert.equal(await plain.locator('.additional-project:visible').count(),2);
 console.log('PASS content, case studies and navigation without JavaScript');
 const deep=await browser.newPage({viewport:{width:360,height:1000}});
 await deep.goto(origin+'/#projet-7');
 assert.ok(await deep.locator('#projet-7').isVisible(),'Direct hash reveals complementary case');
 assert.ok(await deep.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const reduced=await browser.newPage({viewport:{width:360,height:1000},reducedMotion:'reduce'});
 await reduced.goto(origin);
 assert.equal(await reduced.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 console.log('PASS complementary deep links and reduced-motion preference');
}finally{await browser.close();await new Promise(r=>server.close(r));}
