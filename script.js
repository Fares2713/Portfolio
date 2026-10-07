'use strict';
document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
if (toggle && nav) {
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
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.addEventListener('pageshow', closeMenu);
}
const filters = document.querySelector('.filters');
if (filters) {
  const cards = [...document.querySelectorAll('.project')];
  const status = document.querySelector('#filter-status');
  const countLabel = document.querySelector('#project-count');
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    const filter = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    let count = 0;
    cards.forEach(card => {
      const visible = filter === 'all' || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) count++;
    });
    const label = count + (count > 1 ? ' réalisations' : ' réalisation');
    countLabel.textContent = String(count).padStart(2,'0') + (count > 1 ? ' réalisations' : ' réalisation');
    status.textContent = label + (count > 1 ? ' affichées.' : ' affichée.');
  });
}
