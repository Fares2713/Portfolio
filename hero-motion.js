'use strict';
// A decorative, local video. Its source is attached only when playback is appropriate.
(() => {
 const hero=document.querySelector('.hero-scene');
 const video=document.querySelector('#hero-background-video');
 const control=document.querySelector('.hero-motion-control');
 if(!hero||!video||!control||!window.matchMedia)return;
 const root=document.documentElement;
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection;
 let userPaused=false,failed=false,loaded=false,visible=hero.getBoundingClientRect().bottom>0,pending=false;
 try{userPaused=localStorage.getItem('portfolio-hero-paused')==='true'}catch{}
 video.muted=true;video.defaultMuted=true;
 function restricted(){return preference.matches||root.classList.contains('motion-reduced')||Boolean(connection?.saveData)||['slow-2g','2g'].includes(connection?.effectiveType)}
 function allowed(){return !restricted()&&!userPaused&&!failed&&visible&&!document.hidden&&!root.classList.contains('dialog-open')}
 function showState(){
  const paused=video.paused;
  hero.classList.toggle('hero-video-paused',paused);
  const label=paused?'Animer le fond':'Mettre le fond en pause';
  control.querySelector('[data-motion-label]').textContent=label;
  control.setAttribute('aria-label',paused?'Animer le fond':'Mettre le fond animé en pause');
  control.hidden=restricted()||failed||(!loaded&&!userPaused);
 }
 function sync(){
  hero.classList.toggle('hero-video-static',restricted()||failed);
  if(!allowed()){video.pause();showState();return}
  if(!loaded){const source=video.querySelector('source');source.src=source.dataset.src;loaded=true;video.load()}
  if(!pending&&video.paused){
   pending=true;
   const play=video.play();
   Promise.resolve(play).then(()=>{if(!allowed())video.pause()}).catch(error=>{
    // A visibility or preference change may interrupt a pending play: that is expected.
    if(error.name!=='AbortError'&&allowed()){failed=true;hero.classList.add('hero-video-static')}
   }).finally(()=>{pending=false;showState();if(allowed()&&video.paused&&!failed)sync()});
  }
  showState();
 }
 control.addEventListener('click',()=>{
  userPaused=!video.paused;
  try{localStorage.setItem('portfolio-hero-paused',String(userPaused))}catch{}
  sync();
 });
 video.addEventListener('playing',()=>{hero.classList.add('hero-video-ready');showState()});
 video.addEventListener('pause',showState);
 video.addEventListener('error',()=>{if(loaded){failed=true;sync()}});
 video.querySelector('source').addEventListener('error',()=>{if(loaded){failed=true;sync()}});
 preference.addEventListener('change',sync);
 connection?.addEventListener('change',sync);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>video.pause());
 window.addEventListener('pageshow',sync);
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}).observe(hero)}
 sync();
})();
