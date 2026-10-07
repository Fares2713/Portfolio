import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import vm from 'node:vm';
const pages = ['index.html','projets.html','profil.html','contact.html',...readdirSync('projets').filter(name=>name.endsWith('.html')).map(name=>'projets/'+name)];
assert.equal(pages.length,10,'Four main pages and six case studies');
const contents = new Map(pages.map(path=>[resolve(path),readFileSync(path,'utf8')]));
for (const [path, html] of contents) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,'Unique IDs: '+path);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,'Main heading: '+path);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value=match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
    const [file,hash]=value.split('#');
    const target=resolve(dirname(path),file||path);
    assert.ok(existsSync(target),'Local resource '+value+' in '+path);
    if(hash&&contents.has(target)) assert.ok(contents.get(target).includes('id="'+hash+'"'),'Anchor '+value);
  }
  for(const match of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(match[0],/\balt="/);
    assert.match(match[0],/\bwidth="/);
    assert.match(match[0],/\bheight="/);
  }
  assert.equal((html.match(/aria-current="page"/g)||[]).length,1,'One current navigation item');
}
const css=readFileSync('styles.css','utf8');
assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,'CSS braces');
function element(){
  const attributes={},classes=new Set();
  return {hidden:true,dataset:{},handlers:{},
    classList:{add:key=>classes.add(key),remove:key=>classes.delete(key),toggle:(key,force)=>force?classes.add(key):classes.delete(key),contains:key=>classes.has(key)},
    setAttribute:(key,value)=>attributes[key]=value,getAttribute:key=>attributes[key],
    addEventListener(key,fn){this.handlers[key]=fn;},focus(){this.focused=true;}};
}
const script=readFileSync('script.js','utf8');
for(const withFilters of [false,true]){
 const menu=element(),nav=element(),filters=element(),status=element(),count=element(),doc=element(),win=element();
 doc.documentElement=element();
 const cards=['institutionnel','creation','digital','institutionnel','institutionnel','institutionnel'].map(category=>{const x=element();x.dataset.category=category;return x;});
 const buttons=['all','institutionnel','creation','digital'].map(filter=>{const x=element();x.dataset.filter=filter;return x;});
 filters.querySelectorAll=()=>buttons;
 doc.querySelector=selector=>({'.menu-toggle':menu,'#navigation':nav,'.filters':withFilters?filters:null,'#filter-status':status,'#project-count':count}[selector]);
 doc.querySelectorAll=()=>cards;
 vm.runInNewContext(script,{document:doc,window:win});
 assert.equal(menu.hidden,false);
 menu.handlers.click(); assert.equal(menu.getAttribute('aria-expanded'),'true');
 doc.handlers.keydown({key:'Escape'}); assert.equal(menu.getAttribute('aria-expanded'),'false'); assert.ok(menu.focused);
 menu.handlers.click(); win.handlers.pageshow(); assert.equal(menu.getAttribute('aria-expanded'),'false');
 if(withFilters) for(const button of buttons){
  filters.handlers.click({target:{closest:()=>button}});
  const expected=button.dataset.filter==='all'?6:button.dataset.filter==='institutionnel'?4:1;
  assert.equal(cards.filter(card=>!card.hidden).length,expected);
  assert.equal(buttons.filter(item=>item.getAttribute('aria-pressed')==='true').length,1);
  assert.ok(status.textContent.startsWith(String(expected)));
 }
}
console.log('PASS 10 pages: resources, cross-page links, fragments, image metadata, headings, navigation, menu and filters.');
