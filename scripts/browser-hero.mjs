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
try {
 for (const width of [320, 360, 768, 1440, 1920]) {
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],videoRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.url().endsWith('.mp4'))videoRequests.push(r.url())});
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  assert.match(await page.locator('h1').innerText(),/Communication, création[\s\S]*et coordination de projets\./);
  const intro=await page.locator('.hero-description').innerText();
  assert.doesNotMatch(intro,/Inria|FNK/);
  for(const topic of ['audiovisuels','réseaux sociaux','événements','prestataires','budgets','développement commercial'])assert.ok(intro.includes(topic),topic);
  assert.equal(await page.locator('.hero-actions a').count(),2);
  assert.equal(await page.locator('.hero video').count(),0);
  assert.deepEqual(videoRequests,[],'No decorative video download');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No overflow');
  await page.screenshot({path:out+'/hero-'+width+'.png'});
  await page.locator('.hero-actions a').first().click();
  assert.ok(await page.locator('#projets').isVisible());
  const audit=await new AxeBuilder({page}).include('.hero').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  assert.deepEqual(errors,[]);await context.close();
  console.log('PASS '+width+'px: introduction, no company names, project action, reflow and axe');
 }
 const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:1000}});
 await page.goto(origin);
 assert.ok(await page.locator('h1').isVisible());
 assert.ok(await page.locator('.hero-actions a').first().isVisible());
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 console.log('PASS introduction and actions without JavaScript');
} finally {await browser.close();server.close()}
