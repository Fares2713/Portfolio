import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync('index.html', 'utf8');
const script = readFileSync('script.js', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'One main heading');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), 'Anchor target: ' + match[1]);
for (const match of html.matchAll(/(?:src|href)="((?:assets\/|styles\.css|script\.js)[^"]*)"/g)) assert.ok(existsSync(match[1]), 'Local resource: ' + match[1]);
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
 assert.match(match[0], /\balt="/, 'Images need alternatives');
 assert.match(match[0], /\bwidth="/, 'Images reserve width');
 assert.match(match[0], /\bheight="/, 'Images reserve height');
}
assert.ok(!html.includes('text/babel') && !html.includes('unpkg.com'), 'Content must not depend on CDN runtime compilation');

function check(condition, message) { if (!condition) throw new Error(message); }
function element() {
 const attributes = {};
 const classes = new Set();
 return {
  hidden: true, dataset: {}, attributes, handlers: {},
  classList: { add: key => classes.add(key), remove: key => classes.delete(key),
    toggle(key, force) { if (force) classes.add(key); else classes.delete(key); }, contains: key => classes.has(key) },
  setAttribute(key, value) { attributes[key] = value; },
  getAttribute(key) { return attributes[key]; },
  removeAttribute(key) { delete attributes[key]; },
  addEventListener(key, handler) { this.handlers[key] = handler; },
  focus() { this.focused = true; }
 };
}
const menu = element(), navigation = element(), filterGroup = element(), status = element();
const cardList = ['institutionnel', 'digital', 'institutionnel', 'creation', 'institutionnel', 'institutionnel'].map(category => {
 const item = element(); item.dataset.category = category; return item;
});
const filterButtons = ['all', 'institutionnel', 'creation', 'digital'].map(filter => {
 const item = element(); item.dataset.filter = filter; return item;
});
filterGroup.querySelectorAll = () => filterButtons;
const doc = element();
doc.documentElement = element();
doc.querySelector = selector => ({'.menu-toggle': menu, '#navigation': navigation, '.filters': filterGroup, '#filter-status': status}[selector]);
doc.querySelectorAll = selector => selector === '.project' ? cardList : [];

vm.runInNewContext(script, {document:doc, window:{}});
check(!menu.hidden && !filterGroup.hidden, 'Enhancement controls visible');
menu.handlers.click();
check(menu.getAttribute('aria-expanded') === 'true' && navigation.classList.contains('is-open'), 'Menu opens');
doc.handlers.keydown({key:'Escape'});
check(menu.getAttribute('aria-expanded') === 'false' && menu.focused, 'Escape closes menu and restores focus');
menu.handlers.click();
navigation.handlers.click({target:{closest: () => ({})}});
check(menu.getAttribute('aria-expanded') === 'false', 'Navigation closes menu');
filterButtons.forEach(button => {
 filterGroup.handlers.click({target:{closest: () => button}});
 const expected = button.dataset.filter === 'all' ? 6 : button.dataset.filter === 'institutionnel' ? 4 : 1;
 check(cardList.filter(card => !card.hidden).length === expected, 'Filter result count: ' + button.dataset.filter);
 check(filterButtons.filter(item => item.getAttribute('aria-pressed') === 'true').length === 1, 'Exclusive filter state');
 check(status.textContent.startsWith(String(expected)), 'Announced result count');
});
console.log('Passed: resources, anchors, headings, image metadata, mobile menu and all project filters.');
