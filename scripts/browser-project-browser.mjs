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
try {
 for(const width of [360,768,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.project-choice').count(),10);
  assert.equal(await page.locator('.project:visible').count(),width>=1000?1:0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('.project-choice').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:`screenshots/project-browser-${width}.png`});
  for(let i=0;i<10;i++){
   const button=page.locator('.project-choice').nth(i);
   if(i===1){await button.focus();await page.keyboard.press('Enter')}else await button.click();
   assert.equal(await page.locator('.project:visible').count(),1);
   assert.equal(await button.getAttribute('aria-expanded'),'true');
   await page.locator('.project:visible summary').click();
   assert.ok(await page.locator('#project-dialog').isVisible());
   assert.ok(await page.locator('#project-dialog .case-content').isVisible());
   await page.keyboard.press('Escape');
   assert.ok(await button.evaluate(el=>el.closest('.project-entry').querySelector('summary')===document.activeElement));
   if(width<1000){await button.click();assert.equal(await page.locator('.project:visible').count(),0)}
  }
  for(const [filter,count] of [['communication',6],['evenementiel',3],['audiovisuel',1],['digital',5],['all',10]]){
   await page.locator(`[data-filter="${filter}"]`).click();
   assert.equal(await page.locator('.project-choice:visible').count(),count);
   assert.ok(await page.locator('.project:visible').count()<=1);
   if(width>=1000)assert.equal(await page.locator('.project:visible').count(),1);
  }
  await page.locator('[data-filter="digital"]').click();
  await page.locator('.expertise-grid a[href="#projet-1"]').click();
  assert.ok(await page.locator('#projet-1').isVisible());
  assert.equal(await page.locator('.filters [aria-pressed=true]').getAttribute('data-filter'),'all');
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(audit.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[]);
  await page.setViewportSize({width:width<1000?1440:390,height:1000});
  assert.ok(await page.locator('#projet-1').isVisible());
  assert.deepEqual(errors,[]);
  console.log('PASS',width,'selection, ten cases, filters, anchors, responsive and axe');
  await context.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1000}});
 const page=await context.newPage();await page.goto(origin);
 assert.equal(await page.locator('.project:visible').count(),10);
 await page.locator('#projet-fnk summary').click();assert.ok(await page.locator('#projet-fnk .case-content').isVisible());
 await context.close();
 const deep=await browser.newContext({viewport:{width:390,height:900}});const dp=await deep.newPage();await dp.goto(origin+'/#projet-fnk');
 assert.ok(await dp.locator('#projet-fnk').isVisible());await deep.close();
 console.log('PASS no-JavaScript and initial mobile deep link');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
