'use strict';
// One set of project content, presented as a selector on desktop and disclosures on mobile.
(() => {
 const grid=document.querySelector('#projets .project-grid');
 if(!grid||!matchMedia)return;
 const cards=[...grid.querySelectorAll('.project')];
 const desktop=matchMedia('(min-width:1000px)');
 let selected=null;
 let view='detail';
 try{if(localStorage.getItem('portfolio-project-view')==='overview')view='overview'}catch{}
 const viewControls=document.querySelector('.project-view-options');
 viewControls.hidden=false;
 viewControls.querySelectorAll('[data-project-view]').forEach(button=>{
  button.addEventListener('click',()=>{
   setView(button.dataset.projectView);
   try{localStorage.setItem('portfolio-project-view',button.dataset.projectView)}catch{}
  });
 });
 function setView(value){
  view=value;grid.classList.toggle('is-overview',view==='overview');
  viewControls.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.projectView===view)));
  if(view==='overview')cards.forEach(card=>card.classList.add('is-revealed'));
 }
 const labels={communication:'Communication',evenementiel:'Événementiel',audiovisuel:'Audiovisuel',digital:'Digital'};
 const entries=cards.map((card,index)=>{
  const entry=document.createElement('div');entry.className='project-entry';
  if(card.id==='projet-1')entry.classList.add('project-entry-featured');
  const button=document.createElement('button');button.type='button';button.className='project-choice';
  button.id='choose-'+card.id;button.setAttribute('aria-controls',card.id);
  const number=document.createElement('span');number.className='choice-number';number.textContent=String(index+1).padStart(2,'0');
  const image=card.querySelector('.project-visual img').cloneNode();image.alt='';image.loading='lazy';
  const copy=document.createElement('span');copy.className='choice-copy';
  const title=document.createElement('span');title.className='choice-title';title.textContent=card.querySelector('h3').textContent;
  const category=document.createElement('span');category.className='choice-category';category.textContent=card.dataset.category.split(' ').map(key=>labels[key]||key).join(' · ');
  const icon=document.querySelector('.hero-actions .direction-icon').cloneNode(true);icon.classList.add('choice-arrow');
  copy.append(title,category);button.append(number,image,copy,icon);
  grid.insertBefore(entry,card);entry.append(button,card);
  button.addEventListener('click',()=>select(!desktop.matches&&selected===card?null:card));
  return {entry,button,card};
 });
 function select(card){
  selected=card;
  entries.forEach(item=>{
   const active=item.card===card;
   item.entry.classList.toggle('is-selected',active);
   item.button.setAttribute('aria-expanded',String(active));
   if(desktop.matches)item.button.setAttribute('aria-pressed',String(active));else item.button.removeAttribute('aria-pressed');
   if(active)item.card.classList.add('is-revealed');
  });
 }
 function sync(){
  let row=0;
  entries.forEach(item=>{if(item.entry.hidden!==item.card.hidden)item.entry.hidden=item.card.hidden;if(!item.card.hidden)item.entry.style.setProperty('--project-row',++row)});
  grid.style.setProperty('--project-rows',row);
  if(!selected||selected.hidden)select(desktop.matches?cards.find(card=>!card.hidden):null);
 }
 // The existing filter controller is still responsible for which projects belong to the selection.
 new MutationObserver(sync).observe(grid,{subtree:true,attributes:true,attributeFilter:['hidden']});
 document.addEventListener('portfolio:projectselect',event=>{const card=event.detail.card;if(cards.includes(card)){sync();select(card)}});
 document.addEventListener('portfolio:caseopen',event=>{if(cards.includes(event.detail.card))select(event.detail.card)});
 desktop.addEventListener('change',()=>{if(desktop.matches&&!selected)select(cards.find(card=>!card.hidden));else select(selected)});
 grid.classList.add('project-browser');
 setView(view);
 const note=document.querySelector('.projects-heading>p');
 if(note)note.textContent='Dix projets à parcourir. Choisissez une réalisation pour découvrir mon rôle, les supports et les résultats.';
 let initial=null;
 try{initial=document.getElementById(decodeURIComponent(location.hash.slice(1)))?.closest('.project')}catch{}
 select(initial||(desktop.matches?cards.find(card=>!card.hidden):null));sync();
})();
