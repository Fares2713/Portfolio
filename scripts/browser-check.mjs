import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=resolve('.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer(async(request,response)=>{
 const path=resolve(root,'.'+new URL(request.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
 if(!path.startsWith(root+'/')){response.writeHead(403).end();return;}
 try{response.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'}).end(await readFile(path));}
 catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();
await mkdir('screenshots',{recursive:true});
const casePaths=(await readdir('projets')).filter(name=>name.endsWith('.html')).map(name=>'projets/'+name);
const paths=['index.html','projets.html','profil.html','contact.html',...casePaths];
try{
 for(const width of [360,768,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const path of paths){
   await page.goto(origin+'/'+path,{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('h1').count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow: '+width+' '+path);
   for(const image of await page.locator('img').all()){
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(image=>image.decode());
   }
   const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   const issues=result.violations.filter(issue=>['serious','critical'].includes(issue.impact));
   assert.deepEqual(issues.map(issue=>({id:issue.id,nodes:issue.nodes.map(node=>node.target)})),[],'Accessibility: '+path+' '+width);
   if(path==='projets.html'){
    for(const [filter,expected] of [['institutionnel',4],['creation',1],['digital',1],['all',6]]){
     await page.locator('[data-filter="'+filter+'"]').click();
     assert.equal(await page.locator('.project:visible').count(),expected);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Filtered overflow');
    }
   }
   if(width<=760){
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
   }
   await page.evaluate(()=>scrollTo(0,0));
   if(!path.startsWith('projets/')||path==='projets/inria-archives.html'){
    await page.screenshot({path:'screenshots/'+path.replaceAll('/','-').replace('.html','')+'-'+width+'.png',fullPage:true});
   }
   console.log('PASS '+width+'px '+path+': layout, images, accessibility and menu');
  }
  assert.deepEqual(errors,[],'Browser errors');
  // Follow a real visitor journey across separate documents.
  await page.goto(origin+'/index.html');
  await page.locator('.hero-copy a').click();
  await page.waitForURL('**/projets.html');
  await page.locator('.project-link').first().click();
  await page.waitForURL('**/projets/inria-archives.html');
  await page.locator('.next-project-link').click();
  await page.waitForURL('**/projets/glow-center.html');
  await page.locator('.footer-invitation a').click();
  await page.waitForURL('**/contact.html');
  console.log('PASS native navigation journey at '+width+'px');
  await page.close();
 }
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:1000}});
 for(const path of paths){
  await plain.goto(origin+'/'+path);
  assert.ok(await plain.locator('#navigation').isVisible());
  assert.ok(await plain.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No-JS overflow: '+path);
 }
 await plain.goto(origin+'/projets.html');
 assert.equal(await plain.locator('.project:visible').count(),6);
 await plain.locator('.project-link').first().click();
 await plain.waitForURL('**/projets/inria-archives.html');
 console.log('PASS without JavaScript: all pages, navigation and case study');
 await plain.close();
 const zoom=await browser.newPage({viewport:{width:1440,height:1000}});
 await zoom.goto(origin+'/index.html');
 await zoom.evaluate(()=>document.documentElement.style.zoom='2');
 assert.ok(await zoom.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% CSS zoom overflow');
 console.log('PASS 200% CSS zoom');
 await zoom.close();
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
