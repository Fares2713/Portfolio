import {normalize,decide,toMarkdown} from './moteur.mjs';
const $=s=>document.querySelector(s);
const form=$('#choices'),result=$('#result'),status=$('#status');
let data,current;
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function list(items){const ul=node('ul');items.forEach(t=>ul.append(node('li',t)));return ul;}
function section(label,title){const s=node('section',undefined,'report-section');s.append(node('p',label,'eyebrow'),node('h3',title));return s;}
function sync(state){form.elements.cas.value=state.cas;form.elements.public.value=state.public;form.elements.canal.value=state.canal;form.elements.contrainte.value=state.contrainte;document.querySelectorAll('.case-option').forEach(el=>el.classList.toggle('selected',el.querySelector('input').checked));}
function render(state,focus=false){
 current=decide(data,state);sync(current.state);const r=current;
 result.replaceChildren();
 const head=node('section',undefined,'decision');
 head.append(node('p',r.pending?'Le point de vigilance':'Mon arbitrage','eyebrow'),node('h2',r.title));
 head.querySelector('h2').id='result-title';head.querySelector('h2').tabIndex=-1;
 head.append(node('p',r.reason),node('p',r.constraint.principle,'principle'));
 result.append(head);
 const meta=node('p',`${r.c.number} / ${r.c.title} · ${r.a.label} · ${data.channels[r.state.canal].label} · ${r.constraint.short}`,'selection-summary');result.append(meta);
 const problem=section('01 / Cadrer','Le problème à résoudre');problem.append(node('p',r.c.context),node('p',r.c.problem),node('p','Pour ce public : '+r.a.need,'muted'),node('blockquote',r.c.question));result.append(problem);
 const facts=section('02 / Vérifier','La preuve avant la promesse');facts.append(node('p','Les pièces ci-dessous sont des éléments fictifs du cas. Elles indiquent ce qu’il faudrait faire confirmer dans une mission réelle.','muted'));
 const factList=node('div',undefined,'facts');r.verification.forEach(f=>{const item=node('article');item.append(node('p',f.state,'fact-status'),node('h4',f.item),node('p',f.detail),node('p',`${f.source} · ${f.owner}`,'source'));factList.append(item);});facts.append(factList);const gate=node('div',undefined,'gate');gate.append(node('strong','Avant de diffuser'),node('p',r.gate));facts.append(gate);result.append(facts);
 const message=section('03 / Dire','Un message central');message.append(node('blockquote',r.message,'central-message'));result.append(message);
 const route=section('04 / Ordonner','Le bon message, au bon moment');route.append(node('p',r.channelDecision),node('p',r.channel.limit,'muted'));const ol=node('ol',undefined,'timeline');r.timeline.forEach(t=>{const li=node('li');li.append(node('strong',t.when),node('p',t.text));ol.append(li);});route.append(ol);const access=node('div',undefined,'access-note');access.append(node('strong','Garder une porte ouverte'),node('p',r.access),node('p',r.channel.guard));route.append(access);result.append(route);
 const sample=section('05 / Donner à voir','Les supports qui en découlent');sample.append(node('p',r.restriction,'sample-restriction'));const preview=node('article',undefined,'content-preview');preview.dataset.channel=r.redirected?'email':r.state.canal;preview.append(node('p','LES RIVES / '+r.format,'preview-label'),node('h4',r.headline),node('p',r.body,'preview-body'),node('p','EXERCICE DE CONCEPTION · CONTENU FICTIF','preview-footer'));sample.append(preview);const faq=node('div',undefined,'faq');faq.append(node('h4','La réponse de l’accueil'));r.questions.forEach(q=>{const d=node('details');d.append(node('summary',q.q),node('p',q.a));faq.append(d);});sample.append(faq);result.append(sample);
 const refusal=section('06 / Arbitrer','Ce que je choisis de ne pas faire');refusal.classList.add('refusal');refusal.append(node('p',r.refusal));result.append(refusal);
 const evaluation=section('07 / Apprendre','Comment savoir si cela fonctionne ?');evaluation.append(node('p','Des critères à observer et des décisions à prendre. Aucun résultat de campagne n’est présenté.','muted'));r.metrics.forEach(m=>{const item=node('article',undefined,'metric');item.append(node('h4',m.name),node('p',m.method),node('p',m.rule,'metric-rule'));evaluation.append(item);});result.append(evaluation);
 const takeaway=node('p',r.c.learning,'takeaway');result.append(takeaway);
 const actions=node('div',undefined,'result-actions');[['choose','Modifier mes choix'],['download','Télécharger ce parcours (.md)'],['share','Copier le lien du parcours'],['print','Imprimer / enregistrer en PDF']].forEach(([id,label])=>{const b=node('button',label,id==='download'?'primary':'secondary');b.type='button';b.dataset.action=id;actions.append(b);});result.append(actions);
 $('#result-wrap').hidden=false;status.textContent=`Parcours affiché : ${r.c.title}, ${r.a.label.toLowerCase()}, ${r.constraint.short.toLowerCase()}.`;
 if(focus){$('#result-title').focus({preventScroll:true});$('#result-wrap').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
}
function setUrl(state){const url=new URL(location.href);for(const [k,v]of Object.entries(state))url.searchParams.set(k,v);history.pushState(state,'',url);}
function markPending(){document.querySelectorAll('.case-option').forEach(el=>el.classList.toggle('selected',el.querySelector('input').checked));$('#pending-hint').textContent='Vos choix sont prêts. Affichez l’arbitrage pour actualiser le dossier.';}
form.addEventListener('change',markPending);
$('#scenario-options').addEventListener('change',markPending);
form.addEventListener('submit',event=>{event.preventDefault();if(!data)return;const state=normalize(data,Object.fromEntries(new FormData(form)));setUrl(state);render(state,true);$('#pending-hint').textContent='Le dossier correspond à vos choix.';});
window.addEventListener('popstate',()=>{if(data)render(normalize(data,Object.fromEntries(new URLSearchParams(location.search))));});
result.addEventListener('click',async event=>{const button=event.target.closest('[data-action]');if(!button||!current)return;const action=button.dataset.action;
 if(action==='download'){const url=URL.createObjectURL(new Blob([toMarkdown(data,current)],{type:'text/markdown;charset=utf-8'}));const link=node('a');link.href=url;link.download=`decision-${Object.values(current.state).join('-')}.md`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Le parcours a été exporté avec les choix affichés.';}
 if(action==='choose'){document.querySelector('input[name=cas]:checked').focus();$('#scenario-options').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 if(action==='print')window.print();
 if(action==='share'){const url=new URL(location.href);for(const[k,v]of Object.entries(current.state))url.searchParams.set(k,v);try{await navigator.clipboard.writeText(url.href);status.textContent='Lien du parcours copié.';}catch{const input=node('input');input.type='text';input.value=url.href;input.readOnly=true;input.setAttribute('aria-label','Lien du parcours à copier');button.after(input);input.focus();input.select();status.textContent='Copiez le lien sélectionné. Le presse-papiers automatique est indisponible.';}}
});
try{
 const response=await fetch('./contenus.json');if(!response.ok)throw new Error('Chargement impossible');data=await response.json();
 form.hidden=false;$('#scenario-options').hidden=false;render(normalize(data,Object.fromEntries(new URLSearchParams(location.search))));$('#loading').hidden=true;
}catch(error){$('#loading').textContent='Le dossier interactif ne peut pas se charger. Les trois fiches PDF et le dossier complet restent accessibles ci-dessous.';}
