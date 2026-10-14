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
  const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.zip':'application/zip'};
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
  assert.equal(await page.locator('a[download][href*="cv-fares"]').count(),0,'Outdated CV is preserved on disk, not offered as a current download');
  assert.equal(await page.locator('.project-contribution').count(),11,'Exact role visible on each selected project');
  assert.ok(await page.locator('#projet-fnk').isVisible(),'FNK mission added without fabricated visuals');
  assert.equal(await page.locator('#projet-fnk .project-visual img').getAttribute('src'),'assets/fnk-agence.jpg','FNK agency visual');
  assert.equal(await page.locator('#projet-fnk .project-image-link').getAttribute('href'),'https://fnklocation.com');
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
  for(const image of await page.locator('.project:not(.project-featured) .project-visual img').all()) {
   const bounds=await image.boundingBox();
   assert.ok(Math.abs(bounds.width/bounds.height-1.6)<0.02,'Project previews keep a consistent ratio');
  }
  await page.screenshot({path:'screenshots/hero-'+width+'.png'});
  for(const [filter,expected] of [['communication',5],['evenementiel',5],['audiovisuel',1],['digital',5],['all',11]]){
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
  const dialog=page.locator('#project-dialog');
  assert.ok(await dialog.isVisible(),'Case opens in a native modal');
  assert.equal(await dialog.locator('h4').count(),5,'Objective, role, actions, deliverables and results');
  const caseAudit=await new AxeBuilder({page}).include('#project-dialog').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(caseAudit.violations.map(x=>x.id),[],'Accessible case dialog');
  await page.keyboard.press('Tab');
  assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)),'Keyboard focus stays inside modal');
  await page.keyboard.press('Escape');
  assert.ok(!(await dialog.isVisible()));
  assert.ok(await firstSummary.evaluate(el=>el===document.activeElement),'Case restores focus');
  const media=page.locator('#projet-1 .project-media-action');
  await media.click();
  assert.ok(await dialog.isVisible());
  assert.equal(await dialog.locator('.dialog-media img').getAttribute('src'),'assets/archives-orales.webp');
  const mediaAudit=await new AxeBuilder({page}).include('#project-dialog').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(mediaAudit.violations.map(x=>x.id),[],'Accessible image dialog');
  await dialog.locator('.dialog-close').click();
  assert.ok(await media.evaluate(el=>el===document.activeElement),'Gallery restores focus');
  await page.locator('#projet-petites-mains .project-image-link').click();
  assert.equal(await dialog.locator('.dialog-media img').getAttribute('src'),'assets/petites-mains-equipe.jpg');
  assert.ok(await dialog.locator('.dialog-media img').evaluate(img=>img.complete&&img.naturalWidth===1240),'Original team photo loads in the gallery');
  await page.keyboard.press('Escape');
  await page.locator('#projet-fnk .project-media-action').click();
  assert.equal(await dialog.locator('.dialog-media img').getAttribute('src'),'assets/fnk-agence.jpg');
  await page.keyboard.press('Escape');
  await page.locator('#projet-fnk summary').click();
  assert.match(await dialog.innerText(),/visuel présenté provient du site public/);
  assert.equal(await dialog.locator('.case-content > ul > li').count(),6,'All FNK missions are represented');
  await page.mouse.click(3,3);
  assert.ok(!(await dialog.isVisible()),'Backdrop closes the modal');
  assert.ok(await page.locator('#projet-3').isVisible());
  assert.ok(await page.locator('#projet-7').isVisible());
  await page.locator('#projet-lenjeu [data-case]').click();
  const carousel=dialog.locator('.editorial-carousel').first();
  assert.equal(await carousel.locator('.carousel-track>li').count(),5,'Five economy slides');
  assert.equal(await dialog.locator('.editorial-carousel').count(),5,'Five distinct editorial carousels');
  for(const [index,count] of [[1,5],[2,5],[3,5],[4,6]]) {
    assert.equal(await dialog.locator('.editorial-carousel').nth(index).locator('.carousel-track>li').count(),count,'Retained and new carousel slide count');
  }
  await carousel.locator('.carousel-track img').first().evaluate(img=>img.decode());
  await carousel.locator('[data-carousel-step="1"]').click();
  await page.waitForFunction(()=>document.querySelector('#project-dialog .carousel-track').scrollLeft>0);
  assert.equal(await carousel.locator('.carousel-links a').count(),3);
  const carouselAudit=await new AxeBuilder({page}).include('#project-dialog').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(carouselAudit.violations.map(x=>x.id),[],'Accessible editorial carousel');
  await page.screenshot({path:'screenshots/carousel-'+width+'.png'});
  await page.keyboard.press('Escape');
  assert.ok(await page.locator('#projet-lenjeu [data-case]').evaluate(el=>el===document.activeElement),'Carousel restores focus');
  const carouselPdf=await context.request.get(origin+'/assets/lenjeu-autoroutes-carrousel/carrousel.pdf');
  assert.ok(carouselPdf.ok());
  assert.equal((await carouselPdf.body()).subarray(0,4).toString(),'%PDF');
  const spacePdf=await context.request.get(origin+'/assets/lenjeu-iss-carrousel/carrousel.pdf');
  assert.equal((await spacePdf.body()).subarray(0,4).toString(),'%PDF');

  await page.locator('#projet-rencontres-enjeu summary').click();
  assert.match(await dialog.innerText(),/avril 2027/);
  assert.match(await dialog.innerText(),/hypothèses de travail/);
  const resourcesAudit=await new AxeBuilder({page}).include('#project-dialog').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(resourcesAudit.violations.map(x=>x.id),[],'Accessible project documents');
  const [download]=await Promise.all([page.waitForEvent('download'),dialog.locator('a[download="01-dossier-conception.pdf"]').click()]);
  assert.equal(download.suggestedFilename(),'01-dossier-conception.pdf');
  assert.ok((await readFile(await download.path())).subarray(0,5).toString()==='%PDF-','Real downloadable dossier');
  const closeBounds=await dialog.locator('.dialog-close').boundingBox();
  const dialogBounds=await dialog.boundingBox();
  assert.ok(closeBounds.y>=dialogBounds.y&&closeBounds.y+closeBounds.height<=dialogBounds.y+dialogBounds.height,'Close control remains accessible while reading documents');
  await page.keyboard.press('Escape');
  const pack=await context.request.get(origin+'/assets/rencontres-enjeu/dossier-complet.zip');
  assert.equal(pack.status(),200);
  assert.equal((await pack.body()).subarray(0,2).toString(),'PK','Valid archive response');
  await page.locator('.earlier-experience>summary').click();
  assert.equal(await page.locator('.earlier-grid article:visible').count(),3);
  // Force lazy images to load before validating and capturing the whole page.
  await page.evaluate(()=>[...document.images].forEach(image=>{image.loading='eager';}));
  for(const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(audit.violations.map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.map(n=>n.target)})),[],'Accessibility including color contrast');
  await page.locator('.earlier-experience>summary').click();
  await page.locator('#projets').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.screenshot({path:'screenshots/projects-'+width+'.png'});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:'screenshots/site-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[]);
  assert.deepEqual(failedLocal,[],'All local resources load');
  console.log('PASS '+width+'px: keyboard menu, skill filters, hidden-case recovery, modals, gallery, images and axe');
  await context.close();
 }
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:1000}});
 await plain.goto(origin);
 assert.ok(await plain.locator('#navigation').isVisible());
 assert.equal(await plain.locator('.project:visible').count(),11);
 await plain.locator('.project summary').first().click();
 assert.ok(await plain.locator('.project .case-content').first().isVisible());
 await plain.locator('#projet-fnk summary').click();
 assert.ok(await plain.locator('#projet-fnk .case-content').isVisible());
 console.log('PASS content, case studies and navigation without JavaScript');
 const deep=await browser.newPage({viewport:{width:360,height:1000}});
 await deep.goto(origin+'/#projet-7');
 assert.ok(await deep.locator('#projet-7').isVisible(),'Direct hash reaches the retained case');
 assert.ok(await deep.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const reduced=await browser.newPage({viewport:{width:360,height:1000},reducedMotion:'reduce'});
 await reduced.goto(origin);
 assert.equal(await reduced.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 console.log('PASS retained deep links and reduced-motion preference');
}finally{await browser.close();await new Promise(r=>server.close(r));}
