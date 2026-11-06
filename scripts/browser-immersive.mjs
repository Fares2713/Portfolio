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
 for (const width of [360, 768, 1440]) {
  const context=await browser.newContext({viewport:{width,height:1000}});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.waitForTimeout(1300);
  assert.equal(await page.locator('.spatial-panel').count(),4);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1440){
   for(let i=0;i<4;i++){
    await page.evaluate(index=>{
     const story=document.querySelector('.spatial-story'),stage=story.querySelector('.spatial-stage');
     const header=document.querySelector('.site-header').offsetHeight+12;
     scrollTo({top:story.getBoundingClientRect().top+scrollY-header+index/3*(story.offsetHeight-stage.offsetHeight),behavior:'instant'});
    },i);
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.spatial-panel:not([inert])').count(),1);
    assert.equal(await page.locator('.spatial-steps button').nth(i).getAttribute('aria-pressed'),'true');
    assert.ok(await page.locator('.spatial-panel').nth(i).evaluate(el=>Number(getComputedStyle(el).opacity)>.95));
   }
   // The chapter controls also work from the keyboard.
   await page.locator('.spatial-steps button').first().focus();
   await page.keyboard.press('Enter');await page.waitForTimeout(1100);
   assert.equal(await page.locator('.spatial-steps button').first().getAttribute('aria-pressed'),'true');
   await page.locator('.spatial-top a').click();await page.waitForTimeout(1100);
   assert.equal(await page.evaluate(()=>location.hash),'#selection-complete');
   assert.ok(await page.locator('#selection-complete').evaluate(el=>el.getBoundingClientRect().top<innerHeight));
  }else{
   assert.equal(await page.locator('.spatial-story.is-spatial').count(),0);
   await page.locator('.spatial-steps button').last().click();await page.waitForTimeout(800);
   assert.ok(await page.locator('.spatial-window').evaluate(el=>el.scrollLeft>0));
  }
  await page.locator('.motion-toggle').click();
  assert.equal(await page.locator('.spatial-story.is-spatial').count(),0);
  assert.equal(await page.locator('.spatial-panel[inert]').count(),0);
  assert.equal(await page.locator('.spatial-enabled').count(),0);
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(accessibility.violations.map(x=>x.id),[]);
  await page.locator('.motion-toggle').click();
  assert.equal(await page.locator('.spatial-story.is-spatial').count(),width===1440?1:0);
  if(width===1440){
   await page.setViewportSize({width:800,height:1000});
   assert.equal(await page.locator('.spatial-story.is-spatial').count(),0);
   assert.equal(await page.locator('.spatial-panel[inert]').count(),0);
   await page.setViewportSize({width:1440,height:1000});
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForTimeout(100);
   assert.equal(await page.locator('.spatial-story.is-spatial').count(),0);
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width}px: spatial chapters, native navigation, motion switch and axe`);
  await context.close();
 }
 const reduced=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await reduced.newPage();await page.goto(origin);
 assert.equal(await page.locator('.spatial-story.is-spatial').count(),0);
 assert.equal(await page.locator('.spatial-panel[inert]').count(),0);
 assert.equal(await page.locator('.motion-toggle').isDisabled(),true);
 await reduced.close();
 console.log('PASS system reduced-motion fallback');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
