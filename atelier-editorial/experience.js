import {health,guidance,duplicateItem,archiveItem,restoreItem,versionDiff,proposeSchedule,applySchedule,readWorkspace,importWorkspace} from './modele.mjs';
const $=s=>document.querySelector(s),stepIds={overview:'overview-section',brief:'brief-section',sources:'sources-section',production:'production-section',calendar:'calendar-section',exports:'exports-section'};
const labels={brouillon:'Brouillon','en-relecture':'En relecture',valide:'Validé'};
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function button(text,action,cls='secondary'){const b=node('button',text,cls);b.type='button';b.dataset.workspaceAction=action;return b;}
function shortDate(value){return value?value.split('-').reverse().join('/'):'Non planifié';}
export function setupExperience(api){
 let activeStep='overview',board='publics',candidate=null,proposal=null,proposalSignature='',versionItem=null,versionTrigger=null;
 const initialHash=location.hash.slice(1);for(const[key,id]of Object.entries(stepIds))if(initialHash===id)activeStep=key;
 try{const stored=localStorage.getItem('atelier-production-view');if(['publics','status','list'].includes(stored))board=stored;}catch{}
 try{const pending=sessionStorage.getItem('portfolio-atelier-transfer');if(pending)candidate=readWorkspace(pending);}catch{}
 $('.workspace-actions').hidden=false;
 const header=$('.topbar');
 function updateHeader(){document.documentElement.style.setProperty('--tool-header',header.getBoundingClientRect().height+'px');}
 if('ResizeObserver'in window)new ResizeObserver(updateHeader).observe(header);updateHeader();
 function showStep(key,{scroll=true,focus=true,updateURL=true}={}){
  activeStep=Object.hasOwn(stepIds,key)?key:'overview';
  for(const[name,id]of Object.entries(stepIds)){const panel=document.getElementById(id);panel.hidden=name!==activeStep;}
  document.querySelectorAll('.workspace-grid>div').forEach(wrapper=>wrapper.hidden=[...wrapper.querySelectorAll('section.panel')].every(panel=>panel.hidden));
  document.querySelectorAll('[data-workspace-step]').forEach(link=>{if(link.dataset.workspaceStep===activeStep)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
  $('.journal-panel').hidden=!['overview','exports'].includes(activeStep);
  if(updateURL){const url=new URL(location.href);url.hash=stepIds[activeStep];history.replaceState(null,'',url);}
  const panel=document.getElementById(stepIds[activeStep]),heading=[...panel.querySelectorAll('h3')].find(el=>el.getClientRects().length)||panel;
  if(focus)api.focusNode(heading);
  if(scroll){const offset=header.getBoundingClientRect().height+$('.workspace-nav').getBoundingClientRect().height+24;window.scrollTo({top:Math.max(0,panel.getBoundingClientRect().top+scrollY-offset),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 }
 function ensureProduction(){
  $('#audience-filter').value='';$('#status-filter').value='';$('#production-search').value='';api.renderItems();showStep('production',{scroll:false,focus:false});
 }
 function openSupport(id){ensureProduction();const card=document.getElementById('card-'+id);api.openItem(id,card?.querySelector('[data-action=edit]')||$('#add-item'));}
 function renderIntake(){
  const target=$('#transfer-intake');target.replaceChildren();target.hidden=!candidate;
  if(!candidate)return;target.append(node('p','Un cas arrive du dossier de décisions','eyebrow'),node('h3',candidate.brief.subject),node('p','Trois supports, des références fictives et des conditions de diffusion sont préparés. Les sources, dates et responsables restent à revoir. Votre dossier actuel ne sera pas remplacé sans confirmation.'));
  const row=node('div',undefined,'intake-actions');row.append(button('Ouvrir ce cas dans l’atelier','accept-transfer','primary'),button('Garder mon dossier actuel','dismiss-transfer'));target.append(row);
 }
 function renderOverview(){
  const w=api.getWorkspace(),stats=health(w),hasProject=Boolean(w.brief.subject||w.items.length||w.sources.length||stats.archived);
  $('#overview-section').setAttribute('aria-labelledby',hasProject?'overview-subject':'overview-title');$('#welcome-empty').hidden=hasProject;$('#overview-project').hidden=!hasProject;$('#overview-subject').textContent=w.title;$('#overview-goal').textContent=w.brief.goal||'Précisez l’objectif du dossier pour cadrer la production.';
  const metrics=$('#workspace-metrics');metrics.replaceChildren();metrics.hidden=!hasProject;
  for(const[value,label,step]of [[stats.total,'supports actifs','production'],[stats.sourceReview,'sources à revoir','sources'],[stats.review,'en relecture','production'],[stats.validated,'versions validées','production']]){const card=button('', 'step','metric-tile');card.dataset.targetStep=step;card.append(node('strong',String(value)),node('span',label));metrics.append(card);}
  const actions=$('#next-actions');actions.replaceChildren();
  function next(title,detail,action,id){const b=button('',action,'next-action');if(id)b.dataset.item=id;b.append(node('strong',title),node('span',detail));actions.append(b);}
  if(!w.sources.length&&w.items.length)next('Étayer les messages','Ajoutez au moins une source pour relier le contenu à une référence.','sources');
  if(stats.sourceReview)next('Revoir '+stats.sourceReview+' source'+(stats.sourceReview>1?'s':''),'Une note de revue doit étayer les affirmations reprises.','sources');
  if(stats.unassigned){const item=w.items.find(i=>!i.owner.trim());next('Nommer '+stats.unassigned+' responsable'+(stats.unassigned>1?'s':''),'Commencer par « '+item.title+' ».','edit',item.id);}
  if(stats.unplanned)next('Planifier '+stats.unplanned+' support'+(stats.unplanned>1?'s':''),'Prévisualiser des dates avant de les appliquer.','calendar');
  if(stats.review)next('Prendre une décision de relecture','Valider exige une décision explicite sur la version affichée.','reviews');
  if(stats.readyForReview)next('Préparer les relectures','Les champs requis sont renseignés ; la décision reste humaine.','production');
  if(stats.archived&&!w.items.length)next('Retrouver les supports archivés','Les archives sont conservées et peuvent être restaurées en brouillon.','production');
  if(!w.items.length&&hasProject)next('Construire le plan de production','Un brouillon par public, à partir du message de départ.','brief');
  if(w.items.length&&stats.validated===stats.total)next('Préparer la transmission','Exporter les supports et les décisions déclarées, sans publication automatique.','exports');
  if(!actions.children.length)next('Relire les supports','Affiner les angles et les conditions de diffusion.','production');
  const notice=$('#fiction-notice');notice.hidden=w.origin?.kind!=='fictional-decision-case';notice.textContent=notice.hidden?'':'Exercice fictif — '+w.origin.label+'. Les pièces sont des références de conception, pas des preuves réelles. Aucune mission ni publication effective n’est revendiquée.';
 }
 function refreshProduction(){
  const w=api.getWorkspace(),list=$('#production-list'),cards=[...list.querySelectorAll('.production-card')];
  for(const card of cards){const item=w.items.find(i=>'card-'+i.id===card.id);if(!item)continue;
   const actionRow=card.querySelector('.card-actions');if(!card.querySelector('[data-workspace-action=duplicate]')){for(const[label,action]of [['Décliner','duplicate'],['Copier le texte','copy'],['Archiver','archive']]){const b=button(label,action,'text-action');b.dataset.item=item.id;actionRow.append(b);}}
   if(item.history.length&&!card.querySelector('[data-workspace-action=compare]')){const b=button('Comparer les versions','compare','version-compare');b.dataset.item=item.id;card.querySelector('.history').before(b);}
   const tips=guidance(w,item);let old=card.querySelector('.editorial-hints');old?.remove();
   if(tips.length){const details=node('details',undefined,'editorial-hints');details.append(node('summary','Repères de préparation · '+tips.length));for(const tip of tips){const part=node('div');part.append(node('strong',tip.label),node('p',tip.text));details.append(part);}card.append(details);}
   if(!card.querySelector('.assignment-line')){const assignment=node('p',(item.owner||'Responsable à nommer')+' · '+shortDate(item.date),'assignment-line');card.querySelector('.card-meta').after(assignment);}
  }
  const empty=list.querySelector('.empty-state');list.replaceChildren();list.className='production-board '+(board==='list'?'is-list':'is-board');
  if(!cards.length){if(empty)list.append(empty);}
  else if(board==='list')list.append(...cards);
  else{
   const keys=board==='status'?['brouillon','en-relecture','valide']:[...new Set(cards.map(card=>w.items.find(i=>'card-'+i.id===card.id).public))];
   for(const key of keys){const group=node('div',undefined,'production-group');group.setAttribute('role','group');group.setAttribute('aria-label',board==='status'?labels[key]:key);const selected=cards.filter(card=>{const item=w.items.find(i=>'card-'+i.id===card.id);return(board==='status'?item.status:item.public)===key;});const heading=node('div',undefined,'group-heading');heading.append(node('p',board==='status'?labels[key]:key),node('span',String(selected.length)));group.append(heading,...selected);if(!selected.length)group.append(node('p','Aucun support dans cet état.','group-empty'));list.append(group);}
  }
  document.querySelectorAll('[data-board-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.boardView===board)));
  const archives=$('#archives-list');archives.replaceChildren();$('.archive-tray').hidden=!(w.archivedItems||[]).length;$('#archives-title').textContent='Archives · '+(w.archivedItems||[]).length;
  for(const item of w.archivedItems||[]){const row=node('article');row.append(node('h4',item.title),node('p',item.public+' · v'+item.version+' · '+item.history.length+' version(s) précédente(s)'));const restore=button('Restaurer en brouillon','restore');restore.dataset.item=item.id;row.append(restore);archives.append(row);}
 }
 function refreshCalendar(){
  const w=api.getWorkspace(),rows=[...$('#calendar-body').children];calendarItems().forEach((item,index)=>{const row=rows[index];if(!row)return;const cell=node('td'),edit=button('Ajuster','edit','calendar-edit');edit.dataset.item=item.id;cell.append(edit);row.append(cell);});
  if(!$('#schedule-start').value)$('#schedule-start').value=w.brief.start;
  function calendarItems(){return [...w.items].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.title.localeCompare(b.title,'fr'));}
 }
 function refresh(){renderOverview();refreshProduction();refreshCalendar();renderIntake();showStep(activeStep,{scroll:false,focus:false,updateURL:false});}
 function editPreview(item){
  const form=$('#support-form'),context=$('#edit-version-context');context.replaceChildren(node('span','v'+item.version+' · '+labels[item.status]),node('p',item.approval?'Cette version a une décision déclarée. Toute modification demandera une nouvelle relecture.':'Vous travaillez sur un support qui reste à relire.'));
  renderDraftPreview();
  function renderDraftPreview(){const p=$('#draft-preview'),content=form.elements.content.value;p.replaceChildren(node('p','Aperçu du texte saisi · aucune rédaction automatique','eyebrow'),node('h3',form.elements.title.value||'Votre titre'),node('p',content||'Votre contenu apparaîtra ici.','draft-text'),node('small',Array.from(content).length+' caractères · '+form.elements.format.value));}
  form.oninput=renderDraftPreview;
 }
 function renderVersion(item,previous){
  const target=$('#version-content');target.replaceChildren();const intro=node('div',undefined,'version-intro');intro.append(node('p','v'+previous.version+' → v'+item.version,'eyebrow'),node('h3',item.title),node('p','Version précédente : '+(labels[previous.status]||previous.status)+' · Version actuelle : '+labels[item.status]));target.append(intro);
  const diff=versionDiff(previous,item);
  if(!diff.length)target.append(node('p','Le texte et les champs du support sont identiques. Une évolution du brief, d’une source ou de la revue peut avoir remis la validation à faire. Consultez les décisions et le journal pour en connaître le contexte.','version-no-text-change'));
  for(const field of diff){const part=node('section',undefined,'version-field');part.append(node('h4',field.label));const before=node('div'),after=node('div');before.append(node('p','v'+previous.version,'eyebrow'),node('p',field.before,'old-value'));after.append(node('p','v'+item.version,'eyebrow'),node('p',field.after,'new-value'));part.append(before,after);target.append(part);}
  if(previous.approval){const note=node('aside',undefined,'approval-note');note.append(node('strong','Décision précédente : '+previous.approval.reviewer),node('p',previous.approval.note));target.append(note);}
 }
 function openVersion(itemId,trigger){const item=api.getWorkspace().items.find(i=>i.id===itemId);if(!item?.history.length)return;versionItem=itemId;versionTrigger=trigger;renderVersion(item,item.history.at(-1));const select=node('select');select.id='compare-version';select.setAttribute('aria-label','Version précédente à comparer');for(const snapshot of [...item.history].reverse())select.add(new Option('Comparer avec v'+snapshot.version,String(snapshot.version)));select.addEventListener('change',()=>renderSelectedVersion());$('#version-content').before(select);$('#version-dialog').showModal();document.documentElement.classList.add('editor-open');}
 function renderSelectedVersion(){const item=api.getWorkspace().items.find(i=>i.id===versionItem),previous=item.history.find(h=>h.version===Number($('#compare-version').value));if(previous)renderVersion(item,previous);}
 $('#close-version').addEventListener('click',()=>$('#version-dialog').close());$('#version-dialog').addEventListener('close',()=>{$('#compare-version')?.remove();if(!$('#support-dialog').open)document.documentElement.classList.remove('editor-open');if(versionTrigger?.isConnected)versionTrigger.focus();});
 function printDocument(){
  const w=api.getWorkspace(),target=$('#print-dossier');target.replaceChildren(node('p','ATELIER ÉDITORIAL / FARÈS BENAMAR','eyebrow'),node('h1',w.title),node('p','Synthèse des données enregistrées. Les validations sont déclaratives et locales. Aucun support n’est publié par cet outil.'));
  if(w.origin?.notice)target.append(node('p',w.origin.notice));
  for(const[title,value]of [['Objectif',w.brief.goal],['Publics',w.brief.audiences.join(', ')],['Message de départ',w.brief.message]]){target.append(node('h2',title),node('p',value));}
  target.append(node('h2','Les sources'));
  for(const source of w.sources){const part=node('section');part.append(node('h3',source.title),node('p',source.url),node('p',source.claim),node('p',(source.checked?'Revue déclarée':'À revoir')+' · v'+source.version),node('p',source.note));target.append(part);}
  target.append(node('h2','La production'));
  for(const item of w.items){const part=node('section');part.append(node('h3',item.title),node('p',item.public+' · '+item.format+' · '+labels[item.status]+' · v'+item.version),node('p',(item.owner||'Responsable à nommer')+' · '+shortDate(item.date)),node('p',item.angle),node('p',item.content,'print-content'));if(item.approval)part.append(node('p','Décision déclarée : '+item.approval.reviewer+' — '+item.approval.note));target.append(part);}
  target.append(node('p','Les versions, les archives et le journal complet sont conservés dans l’export JSON.'));window.print();
 }
 function signature(){return api.getWorkspace().items.map(i=>i.id+':'+i.version+':'+i.date).join('|');}
 $('#schedule-form').addEventListener('submit',event=>{event.preventDefault();const target=$('#schedule-preview');target.replaceChildren();try{proposal=proposeSchedule(api.getWorkspace(),$('#schedule-start').value,Number($('#schedule-spacing').value),$('#schedule-weekdays').checked);proposalSignature=signature();if(!proposal.length)throw new Error('Ajoutez des supports avant de proposer des dates.');const ul=node('ul');for(const p of proposal)ul.append(node('li',p.title+' : '+shortDate(p.before)+' → '+shortDate(p.date)));target.append(ul,node('p','Appliquer ces dates crée les versions nécessaires et retire les validations concernées.'),button('Appliquer les '+proposal.length+' dates proposées','apply-schedule','primary'));}catch(error){api.feedback(error.message,true);proposal=null;}});
 $('#status-filter').addEventListener('change',api.renderItems);$('#production-search').addEventListener('input',api.renderItems);
 document.addEventListener('click',async event=>{
  const step=event.target.closest('[data-workspace-step]');if(step){event.preventDefault();showStep(step.dataset.workspaceStep);return;}
  const view=event.target.closest('[data-board-view]');if(view){board=view.dataset.boardView;try{localStorage.setItem('atelier-production-view',board);}catch{}refreshProduction();return;}
  const b=event.target.closest('[data-workspace-action]');if(!b)return;const action=b.dataset.workspaceAction,w=api.getWorkspace();
  try{
   if(Object.hasOwn(stepIds,action)){showStep(action);return;}
   if(action==='step'){showStep(b.dataset.targetStep);return;}
   if(action==='example'){$('#load-demo').click();return;}
   if(action==='edit'){openSupport(b.dataset.item);return;}
   if(action==='reviews'){ensureProduction();$('#status-filter').value='en-relecture';api.renderItems();showStep('production');return;}
   if(action==='duplicate'){const copy=duplicateItem(w,b.dataset.item);api.persist();api.render();openSupport(copy.id);api.feedback('Déclinaison créée en brouillon. Adaptez son public et son angle.');return;}
   if(action==='archive'){archiveItem(w,b.dataset.item);api.persist();api.render();api.focusNode($('#production-section h3'));api.feedback('Support archivé ; ses versions restent conservées.');const undo=button('Annuler l’archivage','restore');undo.dataset.item=b.dataset.item;$('#feedback').append(undo);return;}
   if(action==='restore'){restoreItem(w,b.dataset.item);api.persist();api.render();api.feedback('Support restauré en brouillon. Une nouvelle revue est nécessaire.');return;}
   if(action==='compare'){openVersion(b.dataset.item,b);return;}
   if(action==='copy'){const item=w.items.find(i=>i.id===b.dataset.item);try{await navigator.clipboard.writeText(item.title+'\n\n'+item.content);api.feedback('Texte copié.');}catch{const textarea=node('textarea');textarea.value=item.title+'\n\n'+item.content;textarea.readOnly=true;textarea.setAttribute('aria-label','Texte à copier');b.after(textarea);textarea.select();api.feedback('Copiez le texte sélectionné.');}return;}
   if(action==='print'){if(api.dirty.size)api.feedback('Le document reprend les données enregistrées ; enregistrez les formulaires en cours pour y inclure les modifications.',true);printDocument();return;}
   if(action==='apply-schedule'){if(api.dirty.size)throw new Error('Enregistrez les formulaires en cours avant d’appliquer le calendrier.');if(!proposal||proposalSignature!==signature())throw new Error('Le dossier a changé. Prévisualisez à nouveau les dates.');applySchedule(w,proposal);proposal=null;$('#schedule-preview').replaceChildren();api.persist();api.render();api.focusNode($('#calendar-section h3'));api.feedback('Calendrier appliqué ; les supports concernés sont à relire.');return;}
   if(action==='accept-transfer'){const next=importWorkspace(JSON.stringify(candidate));if(api.replace(next)){candidate=null;try{sessionStorage.removeItem('portfolio-atelier-transfer');}catch{}api.render();ensureProduction();showStep('production');api.feedback('Cas fictif ouvert. Sources, responsables et dates restent à revoir.');}return;}
   if(action==='dismiss-transfer'){candidate=null;try{sessionStorage.removeItem('portfolio-atelier-transfer');}catch{}renderIntake();api.feedback('Votre dossier actuel est conservé.');return;}
  }catch(error){api.feedback(error.message,true);}
 });
 const extras=node('button','Réinitialiser les filtres','reset-filters');extras.type='button';extras.addEventListener('click',()=>{ensureProduction();api.feedback('Tous les supports actifs sont affichés.');});$('.production-controls').append(extras);
 if(Object.values(stepIds).includes(initialHash))requestAnimationFrame(()=>showStep(activeStep,{updateURL:false}));
 return {refresh,refreshProduction,editPreview,showStep,ensureProduction};
}
