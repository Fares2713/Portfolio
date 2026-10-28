import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=process.env.PORTFOLIO_ROOT || resolve('.');
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
try {
 for (const width of [360, 768, 1440, 1920]) {
  const context = await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin, {waitUntil:'networkidle'});
  assert.equal(await page.locator('.project:visible').count(), 6, 'Curated initial selection');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow');
  if(width <= 760) {
   await page.locator('.menu-toggle').click();
   assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
   assert.ok(await page.locator('.menu-toggle').evaluate(el => el === document.activeElement));
  }
  await page.screenshot({path:`screenshots/redesign-hero-${width}.png`});
  for (const [filter,count] of [['all',15],['concept',4],['audiovisuel',1],['selection',6]]) {
   await page.locator(`[data-filter="${filter}"]`).click();
   assert.equal(await page.locator('.project:visible').count(),count);
   assert.equal(await page.locator('.filters [aria-pressed="true"]').count(),1);
  }
  const clair=page.locator('[data-demo="clair"]');
  await clair.locator('[data-audience="partners"]').click();
  assert.match(await clair.locator('[data-demo-title]').innerText(),/Avec vous/);
  assert.equal(await clair.locator('[aria-pressed="true"]').count(),1);
  await clair.locator('[data-audience="team"]').click();
  assert.match(await clair.locator('[data-demo-copy]').innerText(),/accueillir et orienter/);
  await clair.locator('[data-audience="public"]').click();
  const tempo=page.locator('[data-demo="tempo"]');
  await tempo.locator('[data-demo-task]').last().check();
  assert.equal(await tempo.locator('[role="progressbar"]').getAttribute('aria-valuenow'),'3');
  await tempo.locator('[data-demo-task]').last().uncheck();
  await tempo.locator('[data-demo-expense]').first().fill('2000');
  assert.match(await tempo.locator('[data-demo-budget-status]').innerText(),/dépasse/);
  assert.match(await tempo.locator('[data-demo-total]').innerText(),/2.?650/);
  await tempo.locator('[data-demo-expense]').first().fill('850');
  assert.match(await tempo.locator('[data-demo-budget-status]').innerText(),/300/);
  await page.locator('#atelier').scrollIntoViewIfNeeded();
  await page.screenshot({path:`screenshots/atelier-${width}.png`});
  // Verify all real and concept cases, including the original downloadable materials.
  await page.locator('[data-filter="all"]').click();
  for (const card of await page.locator('.project').all()) {
   await card.locator('.project-image-link').scrollIntoViewIfNeeded();
   await card.locator('.project-visual img').evaluate(async img => { if (!img.complete) await new Promise((resolve,reject) => {img.onload=resolve;img.onerror=reject;}); });
   assert.ok(await card.locator('.project-visual img').evaluate(img => img.naturalWidth > 0),'Preview loads');
   await card.locator('summary').click();
   assert.ok(await page.locator('#project-dialog').isVisible());
   assert.equal(await page.locator('#project-dialog-title').innerText(), await card.locator('h3').innerText());
   assert.ok(await page.locator('#project-dialog-content .case-content').isVisible());
   assert.ok(await page.locator('.dialog-close').evaluate(el=>el===document.activeElement));
   await page.keyboard.press('Escape');
   assert.ok(!await page.locator('#project-dialog').isVisible());
   assert.ok(await card.locator('summary').evaluate(el=>el===document.activeElement),'Focus returns to opened case');
  }
  await page.locator('[data-filter="selection"]').click();
  await page.locator('#projet-lenjeu summary').click();
  await page.locator('[data-project-step="1"]').click();
  assert.match(await page.locator('#project-dialog-title').innerText(),/Archives/);
  await page.locator('[data-project-step="-1"]').click();
  assert.match(await page.locator('#project-dialog-title').innerText(),/Enjeu/);
  // Existing carousel controls must still work in the case reader.
  const track=page.locator('#project-dialog .carousel-track').first();
  await track.scrollIntoViewIfNeeded();
  const carousel=page.locator('#project-dialog .editorial-carousel').first();
  await carousel.locator('[data-carousel-step="1"]').click();
  await page.waitForTimeout(100);
  assert.ok(await track.evaluate(el=>el.scrollLeft>0),'Carousel advances');
  const modalAxe=await new AxeBuilder({page}).analyze();
  assert.deepEqual(modalAxe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],'Accessible case reader');
  await page.keyboard.press('Escape');
  await page.goto(origin+'/#projet-fnk');
  assert.ok(await page.locator('#project-dialog').isVisible(),'Deep link reveals a project outside the initial selection');
  assert.match(await page.locator('#project-dialog-title').innerText(),/FNK/);
  await page.locator('.dialog-close').click();
  await page.goto(origin);
  const axe=await new AxeBuilder({page}).analyze();
  assert.deepEqual(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],'Accessible main page');
  assert.equal(errors.length,0,errors.join('\n'));
  await context.close();
  console.log(`PASS ${width}px: layout, menu, 15 cases, filters, focus, carousel, navigation, deep links and axe`);
 }
 const motionContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 const motionPage=await motionContext.newPage();
 await motionPage.goto(origin);
 assert.equal(await motionPage.locator('.portrait-stage').evaluate(el=>getComputedStyle(el).animationName),'original-portrait-enter','Original portrait entrance is restored');
 await motionPage.evaluate(()=>scrollTo(0,160));
 await motionPage.waitForTimeout(100);
 assert.ok(await motionPage.locator('.hero-portrait').evaluate(el=>parseFloat(el.style.getPropertyValue('--portrait-shift'))>0),'Portrait follows scrolling lightly');
 await motionPage.locator('.motion-toggle').click();
 await motionPage.waitForTimeout(50);
 assert.equal(await motionPage.locator('.hero-portrait').evaluate(el=>getComputedStyle(el).transform),'none','Manual reduction disables portrait motion');
 await motionPage.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await motionPage.locator('.portrait-stage').evaluate(el=>getComputedStyle(el).animationName),'none','System reduction disables the entrance');
 await motionContext.close();
 console.log('PASS original blue hero entrance, scroll movement and reduced motion');
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:900}});
 const page=await noJS.newPage();
 await page.goto(origin);
 assert.equal(await page.locator('.project:visible').count(),15);
 await page.locator('#concept-sillage summary').click();
 assert.ok(await page.locator('#concept-sillage .case-content').isVisible(),'Cases are available without JavaScript');
 await noJS.close();
 console.log('PASS progressive enhancement without JavaScript');
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
