import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
// Inline displayed images; keep original downloads beside the checkout. No deployment.
const root=fileURLToPath(new URL('../',import.meta.url));
const output=process.argv[2]?resolve(process.argv[2]):resolve(root,'..','portfolio-apercu.html');
let html=await readFile(resolve(root,'index.html'),'utf8');
const css=await readFile(resolve(root,'styles.css'),'utf8');
const script=await readFile(resolve(root,'script.js'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>');
html=html.replace('<script src="script.js" defer></script>','');
html=html.replace('</body>','<script>'+script.replaceAll('</script','<\\/script')+'</script></body>');
const assets=[...new Set([...html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)].map(match=>match[1]))];
const types={'.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.zip':'application/zip','.html':'text/html'};
for(const asset of assets){
 const bytes=await readFile(resolve(root,asset));
 const type=types[extname(asset)];
 if(!type) throw new Error('Unsupported preview asset: '+asset);
 const imageUse = new RegExp('src="' + asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"', 'g');
 html=html.replace(imageUse, 'src="data:'+type+';base64,'+bytes.toString('base64')+'"');
 // Downloads keep their filenames and do not inflate the preview by 200 MB.
 const {relative, dirname} = await import('node:path');
 const linkedPath = relative(dirname(output), resolve(root, asset)).split('\\').join('/');
 html=html.replaceAll('"'+asset+'"','"'+linkedPath+'"');
}
await writeFile(output,html);
console.log('Portable preview saved: '+output);
