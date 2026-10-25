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
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}).observe(hero)}
 sync();
})();
