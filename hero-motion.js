'use strict';
// A decorative, local video. Its source is attached only when playback is appropriate.
(() => {
 const hero=document.querySelector('.hero-scene');
 const video=document.querySelector('#hero-background-video');
 if(!hero||!video||!window.matchMedia)return;
 const root=document.documentElement;
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection;
 let failed=false,loaded=false,visible=hero.getBoundingClientRect().bottom>0,pending=false;
 video.muted=true;video.defaultMuted=true;
 function restricted(){return preference.matches||root.classList.contains('motion-reduced')||Boolean(connection?.saveData)||['slow-2g','2g'].includes(connection?.effectiveType)}
 function allowed(){return !restricted()&&!failed&&visible&&!document.hidden&&!root.classList.contains('dialog-open')}
 function sync(){
  hero.classList.toggle('hero-video-static',restricted()||failed);
  if(!allowed()){video.pause();return}
  if(!loaded){const source=video.querySelector('source');source.src=source.dataset.src;loaded=true;video.load()}
  if(!pending&&video.paused){
   pending=true;
   const play=video.play();
   Promise.resolve(play).then(()=>{if(!allowed())video.pause()}).catch(error=>{
    // A visibility or preference change may interrupt a pending play: that is expected.
    if(error.name!=='AbortError'&&allowed()){failed=true;hero.classList.add('hero-video-static')}
   }).finally(()=>{pending=false;if(allowed()&&video.paused&&!failed)sync()});
  }
 }
 video.addEventListener('playing',()=>hero.classList.add('hero-video-ready'));
 video.addEventListener('error',()=>{if(loaded){failed=true;sync()}});
 video.querySelector('source').addEventListener('error',()=>{if(loaded){failed=true;sync()}});
 preference.addEventListener('change',sync);
 connection?.addEventListener('change',sync);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>video.pause());
 window.addEventListener('pageshow',sync);
 if('IntersectionObserver' in window){
  const header=document.querySelector('.site-header');
  let observer;
  function observeVisibility(){
   observer?.disconnect();
   const obscured=Math.ceil(header?.getBoundingClientRect().height||0);
   observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRect.height>1;sync()},{rootMargin:`-${obscured}px 0px 0px 0px`,threshold:0});
   observer.observe(hero);
  }
  observeVisibility();
  if(header&&'ResizeObserver' in window)new ResizeObserver(observeVisibility).observe(header);
 }
 sync();
})();

// Bounded pointer depth on the project previews; no continuous animation loop.
(() => {
 const hero=document.querySelector('.hero--signature');
 const stage=hero?.querySelector('.hero-workstage');
 if(!stage||!window.matchMedia||!window.requestAnimationFrame)return;
 const root=document.documentElement;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const pointer=window.matchMedia('(hover: hover) and (pointer: fine)');
 let frame=0,x=0,y=0;
 const allowed=()=>pointer.matches&&!reduced.matches&&!root.classList.contains('motion-reduced')&&!document.hidden;
 function reset(){
  if(frame)cancelAnimationFrame(frame);frame=0;
  stage.style.removeProperty('--hero-drift-x');stage.style.removeProperty('--hero-drift-y');
 }
 function update(){
  frame=0;if(!allowed()){reset();return;}
  const bounds=hero.getBoundingClientRect();
  const dx=Math.max(-1,Math.min(1,(x-bounds.left)/bounds.width*2-1));
  const dy=Math.max(-1,Math.min(1,(y-bounds.top)/bounds.height*2-1));
  stage.style.setProperty('--hero-drift-x',(dx*7).toFixed(2)+'px');
  stage.style.setProperty('--hero-drift-y',(dy*5).toFixed(2)+'px');
 }
 hero.addEventListener('pointermove',event=>{
  if(!allowed()||event.pointerType==='touch')return;
  x=event.clientX;y=event.clientY;if(!frame)frame=requestAnimationFrame(update);
 },{passive:true});
 hero.addEventListener('pointerleave',reset);
 reduced.addEventListener('change',reset);pointer.addEventListener('change',reset);
 new MutationObserver(()=>{if(!allowed())reset()}).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
 window.addEventListener('pagehide',reset);
})();
