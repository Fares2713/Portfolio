import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=resolve('.'),out=process.env.PORTFOLIO_CONTENT_OUTPUT||'screenshots/content';await mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{const p=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!p.startsWith(root+'/'))return res.writeHead(403).end();try{const bytes=await readFile(p);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.woff':'font/woff','.pdf':'application/pdf','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4'})[extname(p)]||'application/octet-stream'}).end(bytes)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch(process.env.PORTFOLIO_CHROMIUM_PATH?{executablePath:process.env.PORTFOLIO_CHROMIUM_PATH}:{});
try{
 for(const width of [320,768,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  assert.match(await page.locator('h1').innerText(),/Des idées claires.[\s\S]*Des projets concrets./);assert.equal(await page.locator('.credentials strong').count(),3);assert.ok(await page.locator('.credentials').isVisible());assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(await page.locator('.project').count(),10);assert.equal(await page.locator('.project[data-priority=primary]').count(),4);assert.equal(await page.locator('#project-index li').count(),10);assert.equal(await page.locator('#supports,.portfolio-supports').count(),0,'Removed editorial-support section stays absent from the home page');
  assert.equal(await page.locator('#decisions,.methods-section,.method-card,a[href="#decisions"]').count(),0,'Removed method section and links stay absent');
  await page.screenshot({path:out+'/hero-'+width+'.png'});await page.locator('#projets').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/projects-'+width+'.png'});
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  await page.goto(origin+'/#projet-conferences',{waitUntil:'networkidle'});assert.ok(await page.locator('#projet-2 details').evaluate(el=>el.open));assert.equal(await page.locator('.project#projet-conferences').count(),0);assert.ok(await page.locator('#projet-conferences h5').isVisible());
  for(const app of ['dossier-decisions','atelier-editorial']){await page.goto(origin+'/'+app+'/');assert.match(await page.locator('h1').innerText(),app==='dossier-decisions'?/dossier de décisions/:/atelier éditorial/);assert.match(await page.locator('.state').innerText(),/Temporairement indisponible/);assert.equal(await page.locator('script,input,textarea,video').count(),0);const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[])}
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${width}px: professional headline, research proof, 4/10 hierarchy, merged anchors, removed support section, paused tools and axe`);
 }
}finally{await browser.close();server.close()}
