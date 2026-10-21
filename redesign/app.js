import { createLanguageController } from '../assets/language.js';
import { landingMessages } from './locales.js';

const scriptIds = ['staymiles-rate-helper-zh', 'eva-mileage-hotel-helper-zh', 'seats-aero-total', 'klook-booking-category'];
let catalog = [];
function renderCatalog(language) {
  const code = language.language;
  scriptIds.forEach((id, index) => {
    const record = catalog.find(item => item.id === id);
    if (!record) return;
    const name = record.name[code] || record.name.en;
    document.querySelector(`[data-catalog-name="${index + 1}"]`).textContent = name;
    document.querySelector(`[data-catalog-description="${index + 1}"]`).textContent = record.description[code] || record.description.en;
    document.querySelectorAll(`[data-catalog-alt^="${index + 1}_"]`).forEach(image => {
      image.alt = `${name} — ${language.t(image.dataset.catalogAlt.endsWith('_1') ? 'before' : 'after')}`;
    });
  });
}
const messages = Object.fromEntries(Object.entries(landingMessages).map(([code, values]) => [code, {
  ...values, documentTitle: values.landingTitle,
}]));
const language = createLanguageController({
  messages,
  onChange() {
    renderCatalog(language);
    document.querySelectorAll('[data-version]').forEach(element => {
      element.textContent = `${language.t('version')} ${element.dataset.version} · ${language.t('updated')} ${element.dataset.updated}`;
    });
    document.querySelectorAll('.copy-status').forEach(element => { element.textContent = ''; });
  },
});
language.initialize();
fetch('../bookmarklets/catalog.json').then(response => {
  if (!response.ok) throw new Error('Catalog unavailable');
  return response.json();
}).then(data => { catalog = data.bookmarklets; renderCatalog(language); }).catch(() => {
  // The static script descriptions and links remain usable if the catalog cannot load.
});

const controls = document.querySelector('.capability-controls');
const buttons = [...controls.querySelectorAll('button')];
const panels = [...document.querySelectorAll('.capability-panel')];
function selectPanel(button) {
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  panels.forEach(panel => { panel.hidden = panel.id !== button.dataset.panel; });
}
buttons.forEach(button => {
  button.setAttribute('aria-controls', button.dataset.panel);
  button.addEventListener('click', () => selectPanel(button));
});
controls.hidden = false;
selectPanel(buttons[0]);

const dialog = document.querySelector('#copy-dialog');
const copyValue = document.querySelector('#copy-value');
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = button.parentElement.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      status.textContent = language.t('copied');
    } catch {
      copyValue.value = button.dataset.copy;
      dialog.showModal();
      copyValue.focus();
      copyValue.select();
      status.textContent = language.t('copyFailed');
    }
  });
});

// Elements stay visible even if JavaScript or the observer is unavailable.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const animated = new Set();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (reducedMotion.matches) return;
      const siblings = [...entry.target.parentElement.children];
      const delay = Math.min(siblings.indexOf(entry.target), 3) * 70;
      const animation = entry.target.animate([
        { opacity: 0.65, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 760, delay, easing: 'cubic-bezier(.2,.7,.2,1)' });
      animated.add(animation);
      animation.finished.then(() => animated.delete(animation)).catch(() => animated.delete(animation));
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-top > *, .story-block, .story-end, .comparison, .tool-row, .steps li, .make h2, .make p, .make-links a, .footer-top, .footer-word').forEach(element => observer.observe(element));
  reducedMotion.addEventListener('change', event => {
    if (event.matches) animated.forEach(animation => animation.cancel());
  });
}
