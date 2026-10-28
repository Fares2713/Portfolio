'use strict';
const root = document.documentElement;
root.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
menu.hidden = false;
function closeMenu(restore = false) {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
  if (restore) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

const cards = [...document.querySelectorAll('.project')];
const filters = document.querySelector('.filters');
const status = document.querySelector('#filter-status');
let currentFilter = 'selection';
function applyFilter(value) {
  const valid = [...filters.querySelectorAll('button')].some(button => button.dataset.filter === value);
  currentFilter = valid ? value : 'selection';
  filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === currentFilter)));
  cards.forEach(card => {
    card.hidden = currentFilter === 'selection' ? card.dataset.selected !== 'true' : currentFilter !== 'all' && !card.dataset.category.split(' ').includes(currentFilter);
  });
  const count = cards.filter(card => !card.hidden).length;
  status.textContent = `${String(count).padStart(2, '0')} projet${count > 1 ? 's' : ''} à explorer`;
}
filters.hidden = false;
applyFilter('selection');
filters.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (button) applyFilter(button.dataset.filter);
});

const dialog = document.querySelector('#project-dialog');
const content = document.querySelector('#project-dialog-content');
const close = dialog.querySelector('.dialog-close');
let activeCard = null;
let trigger = null;
let returnHash = '#projets';
function stripIds(node) {
  node.removeAttribute('id');
  node.querySelectorAll('[id]').forEach(item => item.removeAttribute('id'));
  return node;
}
function renderProject(card, mode = 'case') {
  activeCard = card;
  document.querySelector('#project-dialog-title').textContent = card.querySelector('h3').textContent;
  document.querySelector('#project-dialog-kind').textContent = card.dataset.category.includes('concept') ? 'Exploration créative · Concept fictif' : 'Étude de cas · Réalisation';
  const visible = cards.filter(item => !item.hidden);
  document.querySelector('#dialog-counter').textContent = `${String(visible.indexOf(card) + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
  document.querySelector('#dialog-role').textContent = card.querySelector('.project-contribution strong')?.textContent || '';
  content.replaceChildren();
  const hero = document.createElement('figure');
  hero.className = 'dialog-hero';
  const image = card.querySelector('.project-visual img').cloneNode();
  image.loading = 'eager';
  hero.append(image, card.querySelector('figcaption').cloneNode(true));
  content.append(hero);
  if (mode !== 'media') {
    const study = stripIds(card.querySelector('.case-content').cloneNode(true));
    // The reader has an h2 title; case subsections follow at h3.
    study.querySelectorAll('h4').forEach(heading => {
      const replacement = document.createElement('h3');
      replacement.className = 'case-heading';
      replacement.append(...heading.childNodes);
      heading.replaceWith(replacement);
    });
    content.append(study);
  }
  dialog.scrollTop = 0;
}
function openProject(card, source, mode = 'case', setHistory = true) {
  if (!dialog.showModal) { card.querySelector('details').open = true; return; }
  if (card.hidden) applyFilter('all');
  if (!dialog.open) {
    trigger = source || card.querySelector('summary');
    returnHash = location.hash && !cards.some(item => location.hash.startsWith('#' + item.id)) ? location.hash : '#projets';
  }
  renderProject(card, mode);
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  close.focus({preventScroll:true});
  if (setHistory) history.pushState({project:card.id}, '', '#' + card.id);
}
function closeProject() { dialog.close(); }
close.addEventListener('click', closeProject);
dialog.querySelector('.dialog-return').addEventListener('click', event => { event.preventDefault(); closeProject(); });
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (cards.some(card => location.hash === '#' + card.id || location.hash === '#' + card.id + '-details')) history.replaceState(null, '', returnHash);
  content.replaceChildren();
  if (trigger?.isConnected && !trigger.closest('[hidden]')) trigger.focus({preventScroll:true});
  activeCard = null;
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();
});
function stepProject(step) {
  const visible = cards.filter(card => !card.hidden);
  const index = visible.indexOf(activeCard);
  const next = visible[(index + step + visible.length) % visible.length];
  if (!next) return;
  renderProject(next);
  history.replaceState({project:next.id}, '', '#' + next.id);
}
dialog.querySelectorAll('[data-project-step]').forEach(button => button.addEventListener('click', () => { stepProject(Number(button.dataset.projectStep)); close.focus({preventScroll:true}); }));
document.addEventListener('click', event => {
  const carouselButton = event.target.closest('[data-carousel-step]');
  if (carouselButton) {
    const track = carouselButton.closest('.editorial-carousel').querySelector('.carousel-track');
    track.scrollBy({left:Number(carouselButton.dataset.carouselStep) * track.clientWidth,behavior:root.classList.contains('motion-reduced') ? 'instant' : 'smooth'});
    return;
  }
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const summary = event.target.closest('.project summary');
  const link = event.target.closest('a[href]');
  let card = summary?.closest('.project');
  let mode = 'case';
  if (link && !dialog.contains(link)) {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) card = cards.find(item => href === '#' + item.id || href === '#' + item.id + '-details') || card;
    if (link.hasAttribute('data-case')) card = link.closest('.project');
    if (link.hasAttribute('data-media')) { card = link.closest('.project'); mode = 'media'; }
  }
  if (card) { event.preventDefault(); openProject(card, summary || link, mode); }
});
function syncHash() {
  const hash = location.hash;
  const card = cards.find(item => hash === '#' + item.id || hash === '#' + item.id + '-details');
  if (card) openProject(card, null, 'case', false);
  else if (dialog.open) dialog.close();
}
window.addEventListener('popstate', syncHash);
window.addEventListener('hashchange', syncHash);
syncHash();

const motion = document.querySelector('.motion-toggle');
const system = window.matchMedia('(prefers-reduced-motion: reduce)');
let savedReduction = false;
try { savedReduction = localStorage.getItem('portfolio-reduce-motion') === 'true'; } catch {}
function updateMotion() {
  const reduced = system.matches || savedReduction;
  root.classList.toggle('motion-reduced', reduced);
  motion.setAttribute('aria-pressed', String(reduced));
  motion.textContent = reduced ? 'Animations réduites' : 'Réduire les animations';
  motion.disabled = system.matches;
}
motion.hidden = false;
motion.addEventListener('click', () => {
  savedReduction = !savedReduction;
  try { localStorage.setItem('portfolio-reduce-motion', String(savedReduction)); } catch {}
  updateMotion();
});
system.addEventListener('change', updateMotion);
updateMotion();

// Restore the original light portrait movement; system/manual reduction stays authoritative.
const heroPortrait = document.querySelector('.hero-portrait');
const originalHero = document.querySelector('.hero-original');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let portraitFrame = 0;
function updatePortrait() {
  portraitFrame = 0;
  if (!heroPortrait) return;
  if (root.classList.contains('motion-reduced') || !finePointer.matches) {
    heroPortrait.style.removeProperty('--portrait-shift');
    return;
  }
  if (originalHero.getBoundingClientRect().bottom > 0) {
    heroPortrait.style.setProperty('--portrait-shift', Math.min(window.scrollY * .065, 26) + 'px');
  }
}
function requestPortraitUpdate() {
  if (!portraitFrame) portraitFrame = requestAnimationFrame(updatePortrait);
}
window.addEventListener('scroll', requestPortraitUpdate, {passive:true});
window.addEventListener('resize', requestPortraitUpdate, {passive:true});
system.addEventListener('change', requestPortraitUpdate);
finePointer.addEventListener('change', requestPortraitUpdate);
motion.addEventListener('click', requestPortraitUpdate);
requestPortraitUpdate();
