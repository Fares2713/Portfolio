import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const html=await readFile(resolve(root,'index.html'),'utf8');
const css=await readFile(resolve(root,'styles.css'),'utf8');
const script=await readFile(resolve(root,'script.js'),'utf8');
const marker='// Interactive concept prototypes.';
const interaction=script.slice(script.indexOf(marker));
if(!interaction.startsWith(marker)) throw new Error('Missing prototype interaction source');
await mkdir(resolve(root,'assets/concepts'),{recursive:true});
for(const [slug,title] of [['clair','Clair — studio éditorial'],['tempo','Tempo — pilotage événementiel']]){
 let panel=html.split(`<!-- prototype:${slug} -->`)[1]?.split(`<!-- /prototype:${slug} -->`)[0];
 if(!panel) throw new Error('Missing prototype '+slug);
 panel=panel.replace(/<a href="assets\/concepts\/[^"]+".*?<\/a>/s,'').replace(/<h3>/g,'<h2>').replace(/<\/h3>/g,'</h2>').replace(/<h4([^>]*)>/g,'<h3$1>').replace(/<\/h4>/g,'</h3>');
 const document=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${title}, un concept personnel interactif de Farès Benamar."><title>${title} | Farès Benamar</title><style>${css}</style></head><body class="prototype-body"><header class="prototype-header"><strong>${slug==='clair'?'Clair.':'Tempo.'}</strong><a href="../../index.html#atelier">Retour au portfolio ↗</a></header><main class="prototype-stage"><h1 class="sr-only">${title} · Projet conceptuel personnel</h1>${panel}</main><script>${interaction.replaceAll('</script','<\\/script')}</script></body></html>`;
 await writeFile(resolve(root,`assets/concepts/${slug}.html`),document);
}
const start=(label)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#edf0f3"/><g font-family="Arial,sans-serif" fill="#23272d"><text x="74" y="85" font-size="15" fill="#657180" letter-spacing="3">CONCEPT PERSONNEL / ${label}</text>`;
let clair=start('CLAIR');
clair+='<text x="74" y="158" font-size="44" letter-spacing="-2">Un message, le bon angle.</text>';
for(const [i,label,sub] of [[0,'Grand public','Donner envie'],[1,'Partenaires','Fédérer'],[2,'Équipe','Mobiliser']]){
 const y=265+i*125;
 clair+=`<rect x="74" y="${y}" width="270" height="100" rx="18" fill="${i===0?'#fff':'#f7f9fb'}"/><circle cx="111" cy="${y+50}" r="20" fill="${['#eaf5ff','#f2eaff','#ebf6e9'][i]}"/><path d="M101 ${y+50}l10-8 10 8-10 8z" fill="none" stroke="${['#218bfa','#9472db','#63a35b'][i]}" stroke-width="2"/><text x="145" y="${y+43}" font-size="18">${label}</text><text x="145" y="${y+68}" font-size="13" fill="#657180">${sub}</text>`;
}
clair+='<rect x="380" y="221" width="746" height="574" rx="22" fill="#fff"/><circle cx="408" cy="250" r="5" fill="#ff6a60"/><circle cx="425" cy="250" r="5" fill="#ffbf3d"/><circle cx="442" cy="250" r="5" fill="#40c86e"/><path d="M380 278h746" stroke="#edf0f3"/><rect x="421" y="318" width="47" height="47" rx="13" fill="#edf6ff"/><text x="435" y="350" font-size="24" fill="#218bfa">C.</text><text x="485" y="338" font-size="18">Clair</text><text x="485" y="361" font-size="13" fill="#657180">Publication · Grand public</text><text x="421" y="429" font-size="13" letter-spacing="2" fill="#2675be">UNE JOURNÉE POUR EXPLORER</text><text x="421" y="501" font-size="53" letter-spacing="-2">Le numérique,</text><text x="421" y="562" font-size="53" letter-spacing="-2">pour tout le monde.</text><text x="421" y="619" font-size="17" fill="#657180">Samedi, de 10 h à 18 h. C’est gratuit,</text><text x="421" y="646" font-size="17" fill="#657180">et la curiosité suffit.</text><rect x="421" y="692" width="139" height="35" rx="7" fill="#edf6ff"/><text x="436" y="715" font-size="13" fill="#316d9f">Ton accessible</text><rect x="571" y="692" width="104" height="35" rx="7" fill="#edf6ff"/><text x="587" y="715" font-size="13" fill="#316d9f">Invitation</text><text x="74" y="845" font-size="14" fill="#657180">PROTOTYPE INTERACTIF · FARÈS BENAMAR</text></g></svg>';
await writeFile(resolve(root,'assets/concepts/clair.svg'),clair);
let tempo=start('TEMPO');tempo+='<text x="74" y="158" font-size="44" letter-spacing="-2">Du brief au jour J.</text><rect x="74" y="221" width="1052" height="574" rx="22" fill="#fff"/><circle cx="104" cy="250" r="5" fill="#ff6a60"/><circle cx="121" cy="250" r="5" fill="#ffbf3d"/><circle cx="138" cy="250" r="5" fill="#40c86e"/><text x="164" y="256" font-size="14" fill="#657180">Journée découverte / Scénario de démonstration</text><path d="M74 278h1052" stroke="#edf0f3"/><rect x="103" y="305" width="425" height="457" rx="15" fill="#fcfdfe" stroke="#e6eaf0"/><rect x="549" y="305" width="547" height="457" rx="15" fill="#fcfdfe" stroke="#e6eaf0"/><text x="132" y="350" font-size="21">Préparation</text><text x="428" y="349" font-size="14" fill="#657180">2 / 3</text><rect x="132" y="377" width="368" height="7" rx="3" fill="#edf1f6"/><rect x="132" y="377" width="246" height="7" rx="3" fill="#218bfa"/>';
for(const [i,label,sub] of [[0,'Confirmer le lieu','Logistique'],[1,'Valider les supports','Communication'],[2,'Briefer l’équipe','Coordination']]){
 const y=427+i*96;
 tempo+=`<rect x="132" y="${y}" width="22" height="22" rx="5" fill="${i<2?'#218bfa':'white'}" stroke="${i<2?'#218bfa':'#bcc8d7'}"/>${i<2?`<path d="M137 ${y+11}l4 4 8-9" fill="none" stroke="white" stroke-width="2"/>`:''}<text x="173" y="${y+18}" font-size="18">${label}</text><text x="173" y="${y+45}" font-size="13" fill="#657180">${sub}</text>`;
}
tempo+='<text x="579" y="350" font-size="21">Budget prévisionnel</text><text x="579" y="389" font-size="13" fill="#657180">Total prévu</text><text x="579" y="443" font-size="43" letter-spacing="-2">1 500 €</text><text x="929" y="389" font-size="13" fill="#657180">Disponible</text><text x="929" y="438" font-size="28" fill="#27824f">300 €</text><rect x="579" y="477" width="225" height="100" rx="7" fill="#218bfa"/><rect x="809" y="503" width="111" height="74" rx="7" fill="#70b5ff"/><rect x="925" y="527" width="61" height="50" rx="7" fill="#accfff"/><rect x="991" y="548" width="75" height="29" rx="7" fill="#e5edf7"/>';
for(const [i,label,value] of [[0,'Lieu &amp; logistique','850 €'],[1,'Communication','420 €'],[2,'Accueil','230 €']]){const y=618+i*45;tempo+=`<circle cx="584" cy="${y-5}" r="4" fill="${['#218bfa','#70b5ff','#accfff'][i]}"/><text x="601" y="${y}" font-size="15" fill="#536171">${label}</text><text x="1000" y="${y}" font-size="16">${value}</text>`;}
tempo+='<text x="74" y="845" font-size="14" fill="#657180">PROTOTYPE INTERACTIF · BUDGET HYPOTHÉTIQUE ET MODIFIABLE</text></g></svg>';
await writeFile(resolve(root,'assets/concepts/tempo.svg'),tempo);
console.log('Built: Clair and Tempo standalone prototypes and SVG previews.');
