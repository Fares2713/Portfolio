import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const html = readFileSync('index.html', 'utf8');
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

console.log('Passed: unique IDs, anchors, local resources, heading hierarchy and image metadata.');
