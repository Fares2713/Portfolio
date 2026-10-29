import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=resolve('.'),out=process.env.PORTFOLIO_EDITORIAL_OUTPUT||'screenshots/editorial';
const server=http.createServer(async(req,res)=>{const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!file.startsWith(root+'/'))return res.writeHead(403).end();try{const content=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff':'font/woff','.mp4':'video/mp4','.webp':'image/webp','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream'}).end(content)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch(process.env.PORTFOLIO_CHROMIUM_PATH?{executablePath:process.env.PORTFOLIO_CHROMIUM_PATH}:{});await mkdir(out,{recursive:true});
async function settle(page){await page.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await Promise.all(document.getAnimations().filter(a=>a.effect.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))})}
async function topOf(page,selector){await page.locator(selector).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-document.querySelector('.site-header').getBoundingClientRect().height-25,behavior:'instant'}))}
try{
 for(const width of [320,768,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference',permissions:['clipboard-read','clipboard-write']});const page=await context.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)failed.push(r.url())});
  await page.goto(origin,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  assert.ok(await page.evaluate(()=>document.fonts.check('500 16px Manrope')&&document.fonts.check('italic 400 24px "Instrument Serif"')));
  assert.match(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily),/Manrope/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Fonts preserve responsive hero');
  await page.locator('.portrait-stage').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));await settle(page);await page.screenshot({path:out+'/hero-'+width+'.png'});
  await page.locator('[data-project-view=visual]').click();await topOf(page,'#projets');await page.locator('#projet-1 img').evaluate(img=>img.decode());await settle(page);await page.screenshot({path:out+'/realisations-'+width+'.png'});
  const source=page.locator('#projet-2');await topOf(page,'#projet-2');await source.locator('img').evaluate(img=>img.decode());
  // Opening from a visible thumbnail produces a bounded visual flight in the native dialog.
  await source.locator('summary').focus();await page.keyboard.press('Enter');assert.ok(await page.locator('#project-dialog').isVisible());assert.equal(await page.locator('.case-cover img').getAttribute('src'),'assets/inria-evenement.webp');assert.equal(await page.locator('.case-snapshot dd').count(),2);assert.match(await page.locator('.case-snapshot').innerText(),/Coordination événementielle/);
  assert.ok(await page.locator('.shared-image-flight').count()>=1,'Shared image transition starts');await page.waitForFunction(()=>!document.querySelector('.shared-image-flight'));
  await settle(page);await page.screenshot({path:out+'/projet-'+width+'.png'});await page.keyboard.press('Escape');assert.ok(!(await page.locator('#project-dialog').isVisible()));await page.waitForFunction(()=>!document.querySelector('.shared-image-flight'));assert.ok(await source.locator('summary').evaluate(el=>el===document.activeElement));
  // Closing while an entrance is running must not leave fixed images or lock scrolling.
  await source.locator('summary').click();await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.shared-image-flight'));assert.ok(!(await page.locator('html').evaluate(el=>el.classList.contains('dialog-open'))));
  await page.emulateMedia({reducedMotion:'reduce'});await source.locator('summary').click();assert.equal(await page.locator('.shared-image-flight').count(),0);await page.keyboard.press('Escape');
  await topOf(page,'#experience-inria');await page.waitForFunction(()=>document.querySelector('#experience-inria').classList.contains('is-current'));assert.equal(await page.locator('.experience-row.is-current').count(),1);await settle(page);await page.screenshot({path:out+'/parcours-'+width+'.png'});
  await topOf(page,'#contact');await page.locator('.copy-email').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'contact.pro.faresb@gmail.com');assert.match(await page.locator('.copy-feedback').innerText(),/copiée/);await settle(page);await page.screenshot({path:out+'/contact-'+width+'.png'});
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await context.close();console.log(`PASS ${width}px: local fonts, framed gallery, image transitions, rapid close, keyboard focus, reduced motion, timeline, clipboard and axe`);
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage();await page.goto(origin,{waitUntil:'networkidle'});await page.locator('#projet-1 summary').click();assert.ok(await page.locator('#projet-1 details').evaluate(el=>el.open));assert.ok(await page.locator('.copy-email').isHidden());assert.equal(await page.locator('.contact-links a[href^="mailto:"]').getAttribute('href'),'mailto:contact.pro.faresb@gmail.com');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await context.close();console.log('PASS no JavaScript: readable headings, project disclosures, local fonts and email link');
 const fallback=await browser.newContext(),fallbackPage=await fallback.newPage();await fallbackPage.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('Unavailable'))}});document.execCommand=()=>false});await fallbackPage.goto(origin,{waitUntil:'networkidle'});await fallbackPage.locator('.copy-email').click();assert.match(await fallbackPage.locator('.copy-feedback').innerText(),/indisponible/);assert.equal(await fallbackPage.locator('textarea[aria-label="Adresse e-mail à copier"]').count(),0);assert.ok(await fallbackPage.locator('.copy-email').evaluate(el=>el===document.activeElement));await fallback.close();console.log('PASS denied clipboard: useful fallback, temporary field removed and focus retained');
}finally{await browser.close();server.close()}
