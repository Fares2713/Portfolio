import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=resolve('.'),out=process.env.PORTFOLIO_HERO_OUTPUT||'screenshots/hero-motion';
const server=http.createServer(async(req,res)=>{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!path.startsWith(root+'/'))return res.writeHead(403).end();try{const bytes=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4'})[extname(path)]||'application/octet-stream'}).end(bytes)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch(process.env.PORTFOLIO_CHROMIUM_PATH?{executablePath:process.env.PORTFOLIO_CHROMIUM_PATH}:{});await mkdir(out,{recursive:true});
async function playing(page){await page.waitForFunction(()=>{const v=document.querySelector('video');return !v.paused&&v.currentTime>0&&v.readyState>=2})}
try{
 for(const width of [320,768,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin,{waitUntil:'networkidle'});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await playing(page);const video=page.locator('#hero-background-video');
  assert.ok(await video.evaluate(v=>v.muted&&v.defaultMuted&&v.autoplay&&v.loop&&v.playsInline));
  assert.equal(await page.locator('.hero-actions a').count(),2);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  // Wait for the finite entrance animation before inspecting the completed composition.
  await page.locator('.portrait-stage').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
  if(width===1440){
   await page.locator('[data-project-filter="digital"]').click();
   assert.equal(await page.locator('.project:visible').count(),5,'Hero pathway filters actual projects');
   assert.equal(await page.locator('[data-filter="digital"]').getAttribute('aria-pressed'),'true');
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await playing(page);
   await page.locator('.hero-actions a').first().click();
   assert.equal(await page.locator('.project:visible').count(),10,'All-project action restores the full selection');
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await playing(page);
  }
  await page.screenshot({path:out+'/hero-'+width+'.png'});
  assert.equal(await page.locator('.hero-motion-control').count(),0,'No pause button in the Hero');
  await page.evaluate(()=>localStorage.setItem('portfolio-hero-paused','true'));
  await page.goto(origin,{waitUntil:'networkidle'});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await playing(page);
  await page.locator('#projets').evaluate(el=>el.scrollIntoView({behavior:'instant'}));await page.waitForFunction(()=>document.querySelector('video').paused);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await playing(page);
  await page.evaluate(()=>document.querySelector('.motion-toggle').click());assert.ok(await video.evaluate(v=>v.paused));
  await page.evaluate(()=>document.querySelector('.motion-toggle').click());await playing(page);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('video').paused);
  await page.emulateMedia({reducedMotion:'no-preference'});await playing(page);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});assert.ok(await video.evaluate(v=>v.paused));
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await playing(page);
  await page.emulateMedia({reducedMotion:'reduce'});
  const audit=await new AxeBuilder({page}).include('.hero-scene').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${width}px: silent inline playback, no Hero control, obsolete pause ignored, global motion control, off-screen/tab pause, live motion preferences, reflow and axe`);
 }
 for(const mode of ['system-reduction','saved-reduction','save-data','slow-network','no-javascript']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:mode==='system-reduction'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-javascript'});
  if(mode==='saved-reduction')await context.addInitScript(()=>localStorage.setItem('portfolio-reduce-motion','true'));
  if(['save-data','slow-network'].includes(mode))await context.addInitScript(({save})=>Object.defineProperty(navigator,'connection',{value:Object.assign(new EventTarget(),{saveData:save,effectiveType:save?'4g':'2g'})}),{save:mode==='save-data'});
  const page=await context.newPage(),requests=[];page.on('request',r=>{if(r.url().endsWith('.mp4'))requests.push(r.url())});await page.goto(origin,{waitUntil:'networkidle'});
  assert.equal(requests.length,0,mode+' must not download the video');assert.equal(await page.locator('video source').getAttribute('src'),null);assert.equal(await page.locator('.hero-motion-control').count(),0);
  assert.match(await page.locator('.hero-ambient').evaluate(el=>getComputedStyle(el).backgroundImage),/background-poster/);assert.ok(await page.locator('h1').isVisible());
  if(mode==='system-reduction')await page.screenshot({path:out+'/hero-static-mobile.png'});
  await context.close();console.log('PASS '+mode+': still image and no video download');
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();await page.route('**/background-video.mp4',route=>route.abort());await page.goto(origin,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('.hero-scene').classList.contains('hero-video-static'));assert.equal(await page.locator('.hero-motion-control').count(),0);assert.ok(await page.locator('.hero-description').isVisible());await context.close();console.log('PASS video load failure: still image and usable hero');
}finally{await browser.close();server.close()}
