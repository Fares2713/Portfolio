'use strict';
// A native-scroll scene: no wheel interception, cloned canvases or external runtime.
(() => {
  const root = document.documentElement;
  const projects = document.querySelector('#projets');
  if (!projects || !window.matchMedia || !window.IntersectionObserver) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const spacious = matchMedia('(min-width: 1100px) and (min-height: 650px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const sources = ['projet-1', 'projet-2', 'projet-lenjeu', 'projet-10'].map(id => document.getElementById(id));
  if (sources.some(card => !card)) return;
  const arrow = document.querySelector('.hero-actions .direction-icon').cloneNode(true);
  const story = document.createElement('section');
  story.className = 'spatial-story';
  story.setAttribute('aria-label', 'Traversée de quatre réalisations');
  story.innerHTML = '<div class="spatial-stage"><div class="spatial-top"><p class="eyebrow">Quatre projets · Quatre perspectives</p><a href="#selection-complete">Aller à la sélection complète</a></div><div class="spatial-window"><div class="spatial-guide" aria-hidden="true"></div></div><div class="spatial-bottom"><p class="spatial-hint">Au fil du scroll, entrez dans les projets.</p><div class="spatial-steps" role="group" aria-label="Choisir une perspective"></div></div></div>';
  const stage = story.querySelector('.spatial-stage');
  const scene = story.querySelector('.spatial-window');
  const steps = story.querySelector('.spatial-steps');
  const chapters = ['Transmettre', 'Rassembler', 'Informer', 'Développer'];
  const panels = sources.map((card, index) => {
    const panel = document.createElement('article');
    panel.className = 'spatial-panel spatial-panel-' + index;
    const visual = document.createElement('a');
    visual.className = 'spatial-art';
    visual.href = '#' + card.id;
    visual.setAttribute('aria-label', 'Découvrir : ' + card.querySelector('h3').textContent);
    const image = card.querySelector('.project-visual img').cloneNode();
    image.alt = card.querySelector('.project-visual img').alt;
    image.loading = 'lazy';
    const mount = document.createElement('span');
    mount.className = 'spatial-mount';
    mount.append(image);
    const number = document.createElement('span');
    number.className = 'spatial-number';
    number.textContent = '0' + (index + 1);
    number.setAttribute('aria-hidden', 'true');
    visual.append(mount, number);
    const copy = document.createElement('div');
    copy.className = 'spatial-copy';
    const category = document.createElement('p');
    category.className = 'eyebrow';
    category.textContent = card.querySelector('.eyebrow').textContent;
    const chapter = document.createElement('p');
    chapter.className = 'spatial-chapter';
    chapter.textContent = chapters[index] + '.';
    const title = document.createElement('h3');
    title.textContent = card.querySelector('h3').textContent;
    const description = document.createElement('p');
    description.textContent = card.querySelector('.project-subtitle').textContent;
    const link = document.createElement('a');
    link.className = 'text-link';
    link.href = '#' + card.id;
    link.append('Explorer le projet ', arrow.cloneNode(true));
    copy.append(category, chapter, title, description, link);
    panel.append(visual, copy);
    scene.append(panel);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '0' + (index + 1);
    button.setAttribute('aria-label', chapters[index] + ' : ' + title.textContent);
    button.addEventListener('click', () => {
      if (isSpatial()) {
        const top = story.getBoundingClientRect().top + scrollY;
        window.scrollTo({top: top - headerHeight() + index / 3 * (story.offsetHeight - stage.offsetHeight), behavior: 'smooth'});
      } else scene.scrollTo({left: panel.offsetLeft - scene.offsetLeft, behavior: isReduced() ? 'instant' : 'smooth'});
    });
    steps.append(button);
    return panel;
  });
  projects.querySelector('.section-heading').after(story);
  const toolbar = projects.querySelector('.project-toolbar');
  toolbar.id = 'selection-complete';
  toolbar.tabIndex = -1;
  const isReduced = () => reduced.matches || root.classList.contains('motion-reduced');
  const isSpatial = () => spacious.matches && !isReduced();
  const headerHeight = () => document.querySelector('.site-header').offsetHeight + 12;
  const hero = document.querySelector('#accueil');
  const portrait = hero.querySelector('.portrait-stage');
  const headings = [...document.querySelectorAll('main > section .section-heading h2, .contact-intro h2')];
  let pending = 0;
  let current = -1;
  let nearStory = true;
  const visible = new Set();
  const cards = [...document.querySelectorAll('.project')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === story) nearStory = entry.isIntersecting;
      else if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    schedule();
  }, {rootMargin: '180px'});
  observer.observe(story);
  cards.forEach(card => observer.observe(card));
  function select(index) {
    if (current === index) return;
    current = index;
    [...steps.children].forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === index));
    });
    panels.forEach((panel, i) => {
      panel.inert = isSpatial() && i !== index;
      if (isSpatial() && i !== index) panel.setAttribute('aria-hidden', 'true');
      else panel.removeAttribute('aria-hidden');
    });
  }
  function render() {
    pending = 0;
    if (document.hidden) return;
    if (isReduced()) return;
    const height = innerHeight;
    const heroRect = hero.getBoundingClientRect();
    if (heroRect.bottom > 0) {
      const progress = Math.max(0, Math.min(1, -heroRect.top / height));
      portrait.style.setProperty('--spatial-hero', progress.toFixed(4));
    }
    if (isSpatial() && nearStory) {
      const rect = story.getBoundingClientRect();
      const progress = Math.max(0, Math.min(3, (headerHeight() - rect.top) / Math.max(1, story.offsetHeight - stage.offsetHeight) * 3));
      story.style.setProperty('--journey', (progress / 3).toFixed(4));
      panels.forEach((panel, i) => {
        const distance = i - progress;
        panel.style.setProperty('--distance', distance.toFixed(4));
        panel.style.opacity = Math.max(0, 1 - Math.abs(distance) * .15).toFixed(4);
      });
      select(Math.round(progress));
    }
    if (!spacious.matches) return;
    for (const card of visible) {
      const rect = card.getBoundingClientRect();
      const position = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - height / 2) / height));
      card.style.setProperty('--image-depth', (position * 5).toFixed(3) + 'deg');
    }
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top < height && rect.bottom > 0) {
        heading.style.setProperty('--heading-depth', (Math.max(0, Math.min(1, rect.top / height)) * 6).toFixed(3) + 'deg');
      }
    });
  }
  function schedule() { if (!pending) pending = requestAnimationFrame(render); }
  function configure() {
    root.classList.toggle('spatial-enabled', !isReduced());
    story.classList.toggle('is-spatial', isSpatial());
    story.querySelector('.spatial-hint').textContent = isSpatial() ? 'Au fil du scroll, entrez dans les projets.' : 'Faites glisser pour explorer les projets.';
    story.style.setProperty('--spatial-top', headerHeight() + 'px');
    current = -1;
    panels.forEach(panel => { panel.style.removeProperty('opacity'); panel.style.removeProperty('--distance'); panel.inert = false; panel.removeAttribute('aria-hidden'); });
    portrait.style.removeProperty('--spatial-hero');
    cards.forEach(card => { card.style.removeProperty('--image-depth'); card.style.removeProperty('--hover-x'); card.style.removeProperty('--hover-y'); });
    headings.forEach(heading => heading.style.removeProperty('--heading-depth'));
    select(0);
    schedule();
  }
  scene.addEventListener('scroll', () => {
    if (!isSpatial()) select(Math.max(0, panels.findIndex(panel => panel.offsetLeft + panel.offsetWidth / 2 > scene.scrollLeft + scene.offsetLeft)));
  }, {passive: true});
  cards.forEach(card => {
    let point = null, frame = 0;
    card.addEventListener('pointermove', event => {
      if (!fine.matches || !spacious.matches || isReduced()) return;
      point = {x: event.clientX, y: event.clientY};
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        if (!point || isReduced()) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--hover-x', ((point.x - rect.left) / rect.width * 2 - 1).toFixed(3));
        card.style.setProperty('--hover-y', ((point.y - rect.top) / rect.height * 2 - 1).toFixed(3));
      });
    }, {passive: true});
    card.addEventListener('pointerleave', () => { point = null; card.style.removeProperty('--hover-x'); card.style.removeProperty('--hover-y'); });
  });
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', configure, {passive: true});
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', configure);
  spacious.addEventListener('change', configure);
  // The existing site-wide motion switch remains the single source of truth.
  new MutationObserver(configure).observe(root, {attributes: true, attributeFilter: ['class']});
  configure();
})();
