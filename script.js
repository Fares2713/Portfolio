'use strict';
// The content and case studies remain available when JavaScript is disabled.
document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
toggle.hidden = false;
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});

const filters = document.querySelector('.filters');
const cards = [...document.querySelectorAll('.project')];
const filterStatus = document.querySelector('#filter-status');
filters.hidden = false;
function applyFilter(filter) {
  filters.querySelectorAll('button').forEach(item => {
    item.setAttribute('aria-pressed', String(item.dataset.filter === filter));
  });
  let count = 0;
  cards.forEach(card => {
    const visible = filter === 'all' || card.dataset.category.split(' ').includes(filter);
    card.hidden = !visible;
    if (visible) count++;
  });
  filterStatus.textContent = count + (count > 1 ? ' réalisations affichées.' : ' réalisation affichée.');
}
filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (button) applyFilter(button.dataset.filter);
});
function revealAnchor(hash) {
  if (!hash || hash === '#') return;
  let target;
  try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
  catch { return; }
  if (!target) return;
  const project = target.closest('.project');
  if (project && project.hidden) applyFilter('all');
  // Reveal any case hidden by the active skill filter.
  for (let parent = target.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') parent.open = true;
  }
}
document.addEventListener('click', event => {
  const step = event.target.closest('[data-carousel-step]');
  if (step) {
    const track = step.closest('.editorial-carousel').querySelector('.carousel-track');
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({left: Number(step.dataset.carouselStep) * track.clientWidth, behavior: reduced ? 'auto' : 'smooth'});
  }
  if (!event.target.closest('.site-header')) closeMenu();
  const link = event.target.closest('a[href^="#"]');
  if (link && !event.defaultPrevented) revealAnchor(link.getAttribute('href'));
});
if (window.addEventListener) {
  window.addEventListener('hashchange', () => revealAnchor(window.location.hash));
  revealAnchor(window.location.hash);
}
if ('IntersectionObserver' in window) {
  const sections = document.querySelectorAll('main > section[id]');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach(link => {
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

// Native disclosures and image links remain the fallback without JavaScript.
const projectDialog = document.querySelector('#project-dialog');
if (projectDialog && typeof projectDialog.showModal === 'function') {
  const dialogTitle = document.querySelector('#project-dialog-title');
  const dialogContent = document.querySelector('#project-dialog-content');
  const dialogKind = document.querySelector('#project-dialog-kind');
  const dialogClose = projectDialog.querySelector('.dialog-close');
  let dialogTrigger = null;
  function openProjectDialog(card, trigger, media) {
    dialogTrigger = trigger;
    const carousel = trigger.hasAttribute('data-case');
    dialogTitle.textContent = carousel ? (trigger.dataset.caseTitle || 'L’Enjeu · Carrousels éditoriaux') : card.querySelector('h3').textContent;
    dialogKind.textContent = carousel ? (trigger.dataset.caseKind || 'Carrousel éditorial') : media ? 'Aperçu visuel' : 'Étude de cas';
    dialogContent.replaceChildren();
    if (media) {
      const figure = document.createElement('figure');
      figure.className = 'dialog-media';
      const image = card.querySelector('.project-visual img').cloneNode();
      image.loading = 'eager';
      const caption = card.querySelector('figcaption').cloneNode(true);
      figure.append(image, caption);
      dialogContent.append(figure);
    } else {
      const content = card.querySelector('.case-content').cloneNode(true);
      content.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      dialogContent.append(content);
    }
    projectDialog.showModal();
    projectDialog.scrollTop = 0;
    dialogClose.focus();
    if (carousel) {
      const gallery = dialogContent.querySelector('.editorial-carousel');
      if (gallery) {
        const bar = projectDialog.querySelector('.dialog-bar');
        projectDialog.scrollTop = gallery.getBoundingClientRect().top - projectDialog.getBoundingClientRect().top
          + projectDialog.scrollTop - bar.getBoundingClientRect().height - 24;
      }
    }
  }
  cards.forEach(card => {
    const summary = card.querySelector('summary');
    summary.setAttribute('aria-haspopup', 'dialog');
    summary.addEventListener('click', event => {
      event.preventDefault();
      openProjectDialog(card, summary, false);
    });
    card.querySelectorAll('[data-case]').forEach(caseLink => {
      caseLink.setAttribute('aria-haspopup', 'dialog');
      caseLink.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openProjectDialog(card, caseLink, false);
      });
    });
    card.querySelectorAll('[data-media]').forEach(mediaLink => {
      mediaLink.setAttribute('aria-haspopup', 'dialog');
      mediaLink.addEventListener('click', event => {
        // Preserve modified-click browser behavior for the original image URL.
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openProjectDialog(card, mediaLink, true);
      });
    });
  });
  dialogClose.addEventListener('click', () => projectDialog.close());
  projectDialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...projectDialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')]
      .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  projectDialog.addEventListener('click', event => {
    if (event.target !== projectDialog) return;
    const bounds = projectDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) projectDialog.close();
  });
  projectDialog.addEventListener('close', () => {
    dialogContent.replaceChildren();
    if (dialogTrigger) dialogTrigger.focus();
  });
}

// Motion enhances native scrolling; content remains usable without it.
(() => {
  if (!window.matchMedia || !window.requestAnimationFrame) return;
  const root = document.documentElement;
  const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.querySelector('.motion-toggle');
  const header = document.querySelector('.site-header');
  const portrait = document.querySelector('.hero-portrait');
  const hero = document.querySelector('.hero');
  let savedReduction = false;
  try { savedReduction = localStorage.getItem('portfolio-reduce-motion') === 'true'; } catch {}
  let reduced = systemMotion.matches || savedReduction;
  let frame = 0;
  let revealObserver;
  function updateMotion() {
    reduced = systemMotion.matches || savedReduction;
    root.classList.toggle('motion-reduced', reduced);
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.textContent = reduced ? 'Animations réduites' : 'Réduire les animations';
    motionButton.disabled = systemMotion.matches;
    if (reduced) {
      document.querySelectorAll('.reveal-ready').forEach(item => item.classList.add('is-revealed'));
      portrait.style.removeProperty('--portrait-shift');
    }
    requestUpdate();
  }
  function updateScroll() {
    frame = 0;
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty('--read-progress', max > 0 ? Math.min(1, y / max) : 0);
    header.classList.toggle('is-scrolled', y > 24);
    if (!reduced && pointer.matches && hero.getBoundingClientRect().bottom > 0) {
      portrait.style.setProperty('--portrait-shift', Math.min(y * .065, 26) + 'px');
    }
  }
  function requestUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateScroll);
  }
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => {
    savedReduction = !reduced;
    try { localStorage.setItem('portfolio-reduce-motion', String(savedReduction)); } catch {}
    updateMotion();
  });
  systemMotion.addEventListener('change', updateMotion);
  window.addEventListener('scroll', requestUpdate, {passive: true});
  window.addEventListener('resize', requestUpdate, {passive: true});
  if ('ResizeObserver' in window) new ResizeObserver(requestUpdate).observe(document.body);
  if ('IntersectionObserver' in window && !reduced) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold: .06, rootMargin: '0px 0px 36px 0px'});
    document.querySelectorAll('.section-heading, .project, .experience-row, .expertise-grid article, .about-intro, .profile-panel, .contact-inner>div').forEach(item => {
      item.classList.add('reveal-ready');
      revealObserver.observe(item);
      item.addEventListener('focusin', () => item.classList.add('is-revealed'));
    });
  }
  filters.addEventListener('click', event => {
    if (!event.target.closest('[data-filter]')) return;
    cards.forEach(card => {
      card.classList.remove('filter-enter');
      if (!card.hidden) {
        card.classList.add('is-revealed');
        if (!reduced) card.classList.add('filter-enter');
      }
    });
    requestUpdate();
  });
  updateMotion();
})();
