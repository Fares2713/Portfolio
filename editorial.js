'use strict';
(() => {
 const root=document.documentElement;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const reduced=()=>motion.matches||root.classList.contains('motion-reduced');
 const flights=new Set();
 function clearFlights(){for(const flight of flights){flight.animation.cancel();flight.image.remove()}flights.clear()}
 function onScreen(rect){return rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<innerHeight&&rect.right>0&&rect.left<innerWidth}
 function flight(image,from,to,host,duration){
  if(reduced()||!image.animate||!onScreen(from)||!onScreen(to)||!image.complete||!image.naturalWidth)return;
  clearFlights();
  const ghost=image.cloneNode();ghost.removeAttribute('id');ghost.removeAttribute('loading');ghost.alt='';ghost.setAttribute('aria-hidden','true');ghost.className='shared-image-flight';ghost.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;host.append(ghost);
  // Resize one isolated image frame so different source/destination crops never stretch the image.
  const destination={transform:`translate3d(${to.left-from.left}px,${to.top-from.top}px,0)`,width:to.width+'px',height:to.height+'px'};
  const animation=ghost.animate([{transform:'translate3d(0,0,0)',width:from.width+'px',height:from.height+'px',opacity:1},{...destination,opacity:1,offset:.86},{...destination,opacity:0}],{duration,easing:'cubic-bezier(.22,.8,.25,1)',fill:'forwards'});
  const item={image:ghost,animation};flights.add(item);animation.finished.catch(()=>{}).finally(()=>{ghost.remove();flights.delete(item)});
 }
 document.addEventListener('portfolio:caseopen',event=>{
  const {card,dialog,carousel}=event.detail;
  if(carousel||reduced())return;
  const source=card.querySelector('.project-visual img');
  const target=dialog.querySelector('.case-cover img,.dialog-media img');
  if(source&&target)flight(source,source.getBoundingClientRect(),target.getBoundingClientRect(),dialog,430);
 });
 document.addEventListener('portfolio:caseclose',event=>{
  const {card,dialog}=event.detail;if(!card||reduced())return;
  const source=dialog.querySelector('.case-cover img,.dialog-media img');
  const target=card.querySelector('.project-visual img');
  if(source&&target)flight(source,source.getBoundingClientRect(),target.getBoundingClientRect(),document.body,270);
 });
 motion.addEventListener('change',()=>{if(reduced())clearFlights()});
 new MutationObserver(()=>{if(reduced())clearFlights()}).observe(root,{attributes:true,attributeFilter:['class']});
 // A reading marker follows the current experience. It never changes the reading order.
 const rows=[...document.querySelectorAll('.experience-row')];
 let scheduled=false;
 function updateTimeline(){
  scheduled=false;
  const header=document.querySelector('.site-header').getBoundingClientRect().height;
  const line=header+Math.min(innerHeight*.28,250);
  let current=rows.find(row=>{const rect=row.getBoundingClientRect();return rect.top<=line&&rect.bottom>line});
  if(!current)current=rows.find(row=>{const rect=row.getBoundingClientRect();return rect.top>header&&rect.top<innerHeight*.8});
  for(const row of rows)row.classList.toggle('is-current',row===current);
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(updateTimeline)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);updateTimeline();
 // Copying is a local convenience. The mailto link remains the no-script fallback.
 const copy=document.querySelector('.copy-email');
 if(copy){
  copy.hidden=false;
  copy.addEventListener('click',async()=>{
   const feedback=document.querySelector('.copy-feedback');
   const email=document.querySelector('.contact-links a[href^="mailto:"]').getAttribute('href').slice(7);
   let success=false;
   try{await navigator.clipboard.writeText(email);success=true}catch{}
   if(!success){
    const field=document.createElement('textarea');field.value=email;field.readOnly=true;field.setAttribute('aria-label','Adresse e-mail à copier');field.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(field);field.select();
    try{success=document.execCommand('copy')}catch{}finally{field.remove();copy.focus({preventScroll:true})}
   }
   feedback.textContent=success?'Adresse e-mail copiée.':'La copie est indisponible. Utilisez le lien e-mail ci-dessus.';
  });
 }
})();
