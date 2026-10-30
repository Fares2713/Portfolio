'use strict';
// A bounded pointer response. Native scrolling, clicks and system motion settings stay in charge.
(() => {
 const hero=document.querySelector('.hero-atelier');
 const stage=hero?.querySelector('.portrait-stage');
 if(!hero||!stage||!window.matchMedia)return;
 const pointer=matchMedia('(hover: hover) and (pointer: fine)');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 let frame=0,point=null;
 const enabled=()=>pointer.matches&&!motion.matches&&!root.classList.contains('motion-reduced');
 function reset(){
  point=null;
  if(frame)cancelAnimationFrame(frame);
  frame=0;
  for(const property of ['--portrait-rx','--portrait-ry'])stage.style.removeProperty(property);
 }
 function render(){
  frame=0;if(!point||!enabled())return;
  const bounds=hero.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(point.x-bounds.left)/bounds.width));
  const y=Math.max(0,Math.min(1,(point.y-bounds.top)/bounds.height));
  stage.style.setProperty('--portrait-rx',((.5-y)*3).toFixed(2)+'deg');
  stage.style.setProperty('--portrait-ry',((x-.5)*4).toFixed(2)+'deg');
 }
 hero.addEventListener('pointermove',event=>{if(!enabled())return;point={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(render)},{passive:true});
 hero.addEventListener('pointerleave',reset);
 motion.addEventListener('change',reset);pointer.addEventListener('change',reset);
 new MutationObserver(()=>{if(!enabled())reset()}).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
})();
