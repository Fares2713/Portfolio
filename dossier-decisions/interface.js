import {normalize,decide,toMarkdown,compareDecisions,toWorkshop} from './moteur.mjs';
const $=selector=>document.querySelector(selector);
const form=$('#choices'),result=$('#result'),status=$('#status');
const views={synthese:'L’essentiel',supports:'Les supports',plan:'Le plan d’action',preuves:'Les preuves & limites'};
let data,current,pinned=null,activeView='synthese';
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function button(text,action,style='secondary'){const el=node('button',text,style);el.type='button';el.dataset.action=action;return el;}
function list(items){const ul=node('ul');items.forEach(text=>ul.append(node('li',text)));return ul;}
function section(label,title){const el=node('section',undefined,'report-section');el.append(node('p',label,'eyebrow'),node('h3',title));return el;}
function sync(state){for(const [key,value]of Object.entries(state))form.elements[key].value=value;document.querySelectorAll('.case-option').forEach(el=>el.classList.toggle('selected',el.querySelector('input').checked));}
function setURL(push=false){const url=new URL(location.href);for(const[k,v]of Object.entries(current.state))url.searchParams.set(k,v);url.searchParams.set('onglet',activeView);history[push?'pushState':'replaceState'](null,'',url);}
function setView(key,{focus=false,url=true}={}){
 activeView=Object.hasOwn(views,key)?key:'synthese';
 result.querySelectorAll('[data-report-tab]').forEach(tab=>{const selected=tab.dataset.reportTab===activeView;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
 result.querySelectorAll('[data-report-panel]').forEach(panel=>{panel.hidden=panel.dataset.reportPanel!==activeView;});
 if(url)setURL();
 if(focus)result.querySelector('[data-report-tab="'+activeView+'"]').focus();
}
function createPanel(key){const panel=node('div',undefined,'decision-panel');panel.id='report-panel-'+key;panel.dataset.reportPanel=key;panel.setAttribute('role','tabpanel');panel.tabIndex=0;panel.setAttribute('aria-labelledby','report-tab-'+key);return panel;}
function renderComparison(container){
 if(!pinned)return;
 const reference=decide(data,pinned),comparison=section('Comparer deux décisions','Ce qui change, et pourquoi');comparison.classList.add('comparison');
 comparison.append(node('p','Référence épinglée : '+reference.c.title+' · '+reference.a.label+' · '+reference.constraint.short,'muted'));
 const rows=compareDecisions(reference,current),changed=rows.filter(row=>row.changed);
 comparison.append(node('p',changed.length?'Les différences ci-dessous viennent de vos choix de public, de canal ou de contrainte. Elles ne constituent pas un classement des situations.':'Ce parcours est épinglé. Modifiez un choix pour voir ce qui change.','comparison-intro'));
 const grid=node('div',undefined,'comparison-grid');
 for(const row of changed){const card=node('article');card.append(node('h4',row.label));const before=node('div'),after=node('div');before.append(node('p','Parcours épinglé','eyebrow'),node('p',row.before));after.append(node('p','Parcours actuel','eyebrow'),node('p',row.after));card.append(before,after);grid.append(card);}
 comparison.append(grid,button('Retirer la comparaison','unpin'));
 container.append(comparison);
}
function render(state,{focus=false}={}){
 current=decide(data,state);sync(current.state);const r=current;result.replaceChildren();
 const toolbar=node('div',undefined,'decision-tools');toolbar.append(node('p','Votre dossier de travail','eyebrow'),button(pinned?'Épingler le parcours actuel':'Épingler pour comparer','pin'),button('Préparer ce cas dans l’atelier','atelier','primary'));result.append(toolbar);
 const head=node('section',undefined,'decision');
 head.append(node('p',r.pending?'Une information manque · décision adaptée':'Une recommandation conditionnée à la vérification','eyebrow'),node('h2',r.title));
 head.querySelector('h2').id='result-title';head.querySelector('h2').tabIndex=-1;head.append(node('p',r.reason),node('p',r.constraint.principle,'principle'));result.append(head);
 const meta=node('div',undefined,'decision-context');
 for(const[label,value]of [['Situation',r.c.title],['Public',r.a.label],['Canal retenu',r.channel.label],['Contrainte',r.constraint.short]]){const part=node('div');part.append(node('span',label),node('strong',value));meta.append(part);}result.append(meta);
 const tablist=node('div',undefined,'report-tabs');tablist.setAttribute('role','tablist');tablist.setAttribute('aria-label','Explorer la recommandation');
 for(const[key,label]of Object.entries(views)){const tab=node('button',label);tab.type='button';tab.id='report-tab-'+key;tab.dataset.reportTab=key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','report-panel-'+key);tablist.append(tab);}result.append(tablist);
 const overview=createPanel('synthese'),supports=createPanel('supports'),plan=createPanel('plan'),proof=createPanel('preuves');
 const brief=section('01 / Le cas en bref',r.c.question);brief.append(node('p',r.c.context));overview.append(brief);
 const essential=node('div',undefined,'essential-grid');
 for(const[label,title,body]of [['La priorité',r.a.need,r.c.problem],['La condition de diffusion','Ce qu’il faut confirmer',r.gate],['Le choix assumé','Ce que je ne promets pas',r.refusal]]){const card=node('article');card.append(node('p',label,'eyebrow'),node('h4',title),node('p',body));essential.append(card);}overview.append(essential);
 const message=section('02 / Le cœur du message','Ce que le public doit retenir');message.append(node('blockquote',r.message,'central-message'));if(r.redirected)message.append(node('p',r.channelDecision,'access-note'));overview.append(message);
 const options=section('03 / Les options évaluées','Un choix, avec ses contreparties');const optionList=node('div',undefined,'option-list');
 for(const option of r.options){const card=node('article',undefined,'decision-option'+(option.selected?' is-chosen':''));card.append(node('p',option.selected?'Option retenue':'Alternative examinée','option-status'),node('h4',option.label),node('p',option.benefit));const details=node('details');details.append(node('summary','Comprendre l’arbitrage'),node('p','Risque : '+option.risk),node('p','Condition : '+option.condition));card.append(details);optionList.append(card);}options.append(optionList);overview.append(options);renderComparison(overview);
 const sample=section('Un support, prêt à relire','Le contenu suit la décision');sample.append(node('p',r.restriction,'sample-restriction'));
 const channelPicker=node('div',undefined,'support-channels');channelPicker.setAttribute('role','group');channelPicker.setAttribute('aria-label','Explorer un autre canal');
 for(const[key,value]of Object.entries(data.channels)){const b=button(value.label,'channel');b.dataset.channelChoice=key;b.setAttribute('aria-pressed',String(r.state.canal===key));channelPicker.append(b);}sample.append(channelPicker);
 sample.append(node('p',r.channelDecision,'channel-choice'));
 const preview=node('article',undefined,'content-preview');preview.dataset.channel=r.redirected?'email':r.state.canal;preview.append(node('p','MAISON DES SERVICES LES RIVES / '+r.format,'preview-label'),node('h4',r.headline),node('p',r.body,'preview-body'),node('p','EXERCICE DE CONCEPTION · CONTENU FICTIF','preview-footer'));sample.append(preview);
 const copyRow=node('div',undefined,'copy-row');copyRow.append(button('Copier ce contenu','copy'),node('p','Le texte reste une maquette à faire relire.','muted'));sample.append(copyRow);
 const faq=node('div',undefined,'faq');faq.append(node('h4','La réponse commune de l’accueil'));r.questions.forEach(q=>{const details=node('details');details.append(node('summary',q.q),node('p',q.a));faq.append(details);});sample.append(faq);supports.append(sample);
 const route=section('La chaîne de publication','Qui intervient, dans quel ordre ?');route.append(node('p',r.channel.limit,'muted'));const ol=node('ol',undefined,'timeline');
 r.timeline.forEach(t=>{const li=node('li');li.append(node('strong',t.when),node('p',t.text),node('p','Référent : '+t.owner,'step-owner'),node('p','Livrable attendu : '+t.deliverable,'step-deliverable'));ol.append(li);});route.append(ol);const access=node('div',undefined,'access-note');access.append(node('strong','Garder une porte ouverte'),node('p',r.access),node('p',r.channel.guard));route.append(access);plan.append(route);
 const evaluation=section('Boucle d’apprentissage','Observer pour pouvoir corriger');evaluation.append(node('p','Ces critères décrivent une méthode d’évaluation proposée. Aucun résultat de campagne n’est présenté.','muted'));r.metrics.forEach(m=>{const item=node('article',undefined,'metric');item.append(node('h4',m.name),node('p',m.method),node('p',m.rule,'metric-rule'));evaluation.append(item);});plan.append(evaluation);
 const facts=section('Les vérifications','La preuve avant la promesse');facts.append(node('p','Les pièces et leurs référents sont fictifs. Ils montrent les vérifications à demander dans une mission réelle.','muted'));const factList=node('div',undefined,'facts');r.verification.forEach((f,i)=>{const item=node('article');item.id='fait-'+i;item.append(node('p',f.state,'fact-status'),node('h4',f.item),node('p',f.detail),node('p',f.source+' · '+f.owner,'source'));factList.append(item);});facts.append(factList);proof.append(facts);
 const gate=section('Le point d’arrêt','Avant de diffuser');gate.append(node('div',r.gate,'gate'),node('p',r.c.learning,'takeaway'),node('p',data.notice,'muted'));proof.append(gate);
 result.append(overview,supports,plan,proof);
 const actions=node('div',undefined,'result-actions');for(const[id,label]of [['choose','Modifier mes choix'],['download','Télécharger ce parcours (.md)'],['share','Copier le lien du parcours'],['print','Imprimer / enregistrer en PDF']])actions.append(button(label,id,id==='download'?'primary':'secondary'));result.append(actions);
 $('#result-wrap').hidden=false;setView(activeView,{url:false});
 $('#pending-hint').textContent='Le dossier se met à jour dès que vous changez un choix.';
 status.textContent='Parcours actualisé : '+r.c.title+', '+r.a.label.toLowerCase()+', '+r.constraint.short.toLowerCase()+'.';
 if(focus){$('#result-title').focus({preventScroll:true});$('#result-wrap').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
}
function refreshFromForm(push=true){if(!data)return;const state=normalize(data,Object.fromEntries(new FormData(form)));render(state);setURL(push);}
form.addEventListener('change',()=>refreshFromForm());$('#scenario-options').addEventListener('change',()=>refreshFromForm());
form.addEventListener('submit',event=>{event.preventDefault();activeView='synthese';render(normalize(data,Object.fromEntries(new FormData(form))),{focus:true});setURL();});
window.addEventListener('popstate',()=>{if(!data)return;const params=new URLSearchParams(location.search);activeView=Object.hasOwn(views,params.get('onglet'))?params.get('onglet'):'synthese';render(normalize(data,Object.fromEntries(params)));});
result.addEventListener('keydown',event=>{const tab=event.target.closest('[data-report-tab]');if(!tab)return;const keys=Object.keys(views);let index=keys.indexOf(tab.dataset.reportTab);if(event.key==='ArrowRight')index=(index+1)%keys.length;else if(event.key==='ArrowLeft')index=(index+keys.length-1)%keys.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=keys.length-1;else return;event.preventDefault();setView(keys[index],{focus:true});});
function download(content,name,type='text/markdown;charset=utf-8'){const url=URL.createObjectURL(new Blob([content],{type}));const link=node('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
async function copy(text,trigger,label){try{await navigator.clipboard.writeText(text);status.textContent=label+' copié.';}catch{const field=node('textarea');field.value=text;field.readOnly=true;field.setAttribute('aria-label',label+' à copier');field.className='copy-fallback';trigger.after(field);field.focus();field.select();status.textContent='Copiez le texte sélectionné. Le presse-papiers automatique est indisponible.';}}
result.addEventListener('click',async event=>{
 const tab=event.target.closest('[data-report-tab]');if(tab){setView(tab.dataset.reportTab);return;}
 const trigger=event.target.closest('[data-action]');if(!trigger||!current)return;const action=trigger.dataset.action;
 if(action==='channel'){form.elements.canal.value=trigger.dataset.channelChoice;activeView='supports';refreshFromForm();result.querySelector('[data-channel-choice="'+form.elements.canal.value+'"]').focus({preventScroll:true});}
 if(action==='pin'){pinned={...current.state};try{sessionStorage.setItem('portfolio-decision-pinned',JSON.stringify(pinned));}catch{}activeView='synthese';render(current.state);status.textContent='Parcours épinglé. Modifiez un choix pour comparer les décisions.';result.querySelector('[data-action=pin]').focus({preventScroll:true});}
 if(action==='unpin'){pinned=null;try{sessionStorage.removeItem('portfolio-decision-pinned');}catch{}render(current.state);status.textContent='Comparaison retirée.';result.querySelector('[data-action=pin]').focus({preventScroll:true});}
 if(action==='download')download(toMarkdown(data,current),'decision-'+Object.values(current.state).join('-')+'.md');
 if(action==='copy')await copy(current.headline+'\n\n'+current.body,trigger,'Contenu');
 if(action==='share'){setURL();await copy(location.href,trigger,'Lien du parcours');}
 if(action==='choose'){$('input[name=cas]:checked').focus();$('#scenario-options').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 if(action==='print')window.print();
 if(action==='atelier'){
  try{const workspace=toWorkshop(data,current,location.href);try{sessionStorage.setItem('portfolio-atelier-transfer',JSON.stringify(workspace));location.assign('../atelier-editorial/?origine=decisions#espace');}catch{download(JSON.stringify(workspace,null,2),'cas-pour-atelier.json','application/json');status.replaceChildren(node('span','Le transfert local est indisponible. Importez le fichier téléchargé dans '));const link=node('a','l’atelier éditorial');link.href='../atelier-editorial/#espace';status.append(link);}}catch(error){status.textContent=error.message;}
 }
});
try{
 const response=await fetch('./contenus.json');if(!response.ok)throw new Error('Chargement impossible');data=await response.json();
 try{const saved=sessionStorage.getItem('portfolio-decision-pinned');if(saved)pinned=normalize(data,JSON.parse(saved));}catch{}
 const params=new URLSearchParams(location.search);activeView=Object.hasOwn(views,params.get('onglet'))?params.get('onglet'):'synthese';form.hidden=false;$('#scenario-options').hidden=false;render(normalize(data,Object.fromEntries(params)));$('#loading').hidden=true;
 if(location.hash.startsWith('#fait-')){activeView='preuves';setView(activeView,{url:false});document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'});}
}catch{$('#loading').textContent='Le dossier interactif ne peut pas se charger. Les trois fiches PDF et le dossier complet restent accessibles ci-dessous.';}
