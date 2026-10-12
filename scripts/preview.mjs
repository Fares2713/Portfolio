import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
// Generate a portable, offline preview outside the checkout. No deployment.
const root=fileURLToPath(new URL('../',import.meta.url));
const output=process.argv[2]?resolve(process.argv[2]):resolve(root,'..','portfolio-apercu.html');
let html=await readFile(resolve(root,'index.html'),'utf8');
const css=await readFile(resolve(root,'styles.css'),'utf8');
const script=await readFile(resolve(root,'script.js'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>');
html=html.replace('<script src="script.js" defer></script>','');
html=html.replace('</body>','<script>'+script.replaceAll('</script','<\\/script')+'</script></body>');
const assets=[...new Set([...html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)].map(match=>match[1]))];
const types={'.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
for(const asset of assets){
 const bytes=await readFile(resolve(root,asset));
 const type=types[extname(asset)];
 if(!type) throw new Error('Unsupported preview asset: '+asset);
 html=html.replaceAll('"'+asset+'"','"data:'+type+';base64,'+bytes.toString('base64')+'"');
}
await writeFile(output,html);
console.log('Portable preview saved: '+output);
