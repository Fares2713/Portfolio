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
 try{const content=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream'}).end(content);}
 catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();
await mkdir('screenshots',{recursive:true});
try{
 for(const width of [360,768,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin,{waitUntil:'networkidle'});
  assert.ok(!(await page.title()).includes('—'),'No em dash in tab title');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
  assert.equal(await page.locator('.menu-toggle').isVisible(),width<=760,'Menu only appears on mobile');
  if(width<=760){
   await page.locator('.menu-toggle').click();
   assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  }else assert.ok(await page.locator('#navigation').isVisible(),'Desktop navigation');
  const photo=await page.locator('.hero-portrait').boundingBox();
  assert.ok(photo.width<=401,'Portrait width stays balanced');
  await page.screenshot({path:'screenshots/hero-'+width+'.png'});
  if(width===360||width===1440){
   const shot=await page.screenshot({type:'jpeg',quality:35});
   console.log('VISUAL_REVIEW '+width+' '+shot.toString('base64'));
  }
  for(const [filter,expected] of [['institutionnel',4],['creation',1],['digital',1],['all',6]]){
   await page.locator('[data-filter="'+filter+'"]').click();
   assert.equal(await page.locator('.project:visible').count(),expected);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Filtered layout');
  }
  await page.locator('.project summary').first().click();
  assert.equal(await page.locator('.project details').first().getAttribute('open'),'');
  await page.locator('.project summary').first().click();
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(audit.violations.filter(x=>['serious','critical'].includes(x.impact)).map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],'Accessibility');
  await page.screenshot({path:'screenshots/site-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS '+width+'px: title, desktop/mobile menu, portrait, filters, case details and accessibility');
  await context.close();
 }
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:1000}});
 await plain.goto(origin);
 assert.ok(await plain.locator('#navigation').isVisible());
 assert.equal(await plain.locator('.project:visible').count(),6);
 console.log('PASS content and navigation without JavaScript');
}finally{await browser.close();await new Promise(r=>server.close(r));}
