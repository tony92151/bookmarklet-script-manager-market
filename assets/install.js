import { createLanguageController } from './language.js';

(() => {
  'use strict';

  const GITHUB_SOURCE_ROOT = 'https://github.com/tony92151/bookmarklet-script-manager-market/blob/main/';
  const state = {
    catalogStatus: 'loading',
    cards: new Map()
  };

  const elements = {
    list: document.getElementById('bookmarklet-list'),
    catalogStatus: document.getElementById('catalog-status'),
    template: document.getElementById('bookmarklet-card-template'),
    dialog: document.getElementById('copy-dialog'),
    textarea: document.getElementById('copy-textarea'),
    selectButton: document.getElementById('select-code-button')
  };

  const language = createLanguageController({ onChange: () => {
    refreshDynamicTranslations();
    renderCatalogStatus();
  } });
  const t = (key) => language.t(key);

  const localized = (value) => {
    if (!value || typeof value !== 'object') return '';
    return value[language.language] || value.en || Object.values(value).find((item) => typeof item === 'string') || '';
  };

  const setMessage = (element, key, kind = '') => {
    element.dataset.messageKey = key;
    element.textContent = key ? t(key) : '';
    element.classList.remove('is-success', 'is-error');
    if (kind) element.classList.add(`is-${kind}`);
  };

  const refreshDynamicTranslations = () => {
    state.cards.forEach(({ record, nodes }) => {
      nodes.name.textContent = localized(record.name);
      nodes.description.textContent = localized(record.description);
      nodes.copy.textContent = t('copyGithubLink');
      nodes.guide.textContent = t('installGuide');
      nodes.guide.href = language.link('install.html');
      if (nodes.message.dataset.messageKey) nodes.message.textContent = t(nodes.message.dataset.messageKey);
      nodes.worksOn.textContent = t('worksOn');
      nodes.version.textContent = [
        record.version ? `${t('version')} ${record.version}` : '',
        record.updated ? `${t('updated')} ${record.updated}` : ''
      ].filter(Boolean).join(' · ');
      nodes.screenshots.querySelectorAll('[data-stage]').forEach((figure) => {
        const stage = figure.dataset.stage;
        figure.querySelector('figcaption').textContent = t(stage);
        figure.querySelector('img').alt = localized(record.screenshots[stage].alt);
        figure.querySelector('a').setAttribute('aria-label', `${localized(record.name)} — ${t(stage)}`);
      });
    });
  };

  const isSafeSourcePath = (source) => {
    if (typeof source !== 'string' || !source.trim()) return false;
    if (/^(?:[a-z]+:)?\/\//i.test(source)) return false;
    if (/^(?:data|javascript):/i.test(source)) return false;

    try {
      const sourceRoot = new URL('bookmarklets/', location.href);
      const resolved = new URL(source, location.href);
      return resolved.origin === sourceRoot.origin &&
        resolved.href.startsWith(sourceRoot.href) &&
        resolved.pathname.endsWith('.js') &&
        !resolved.search && !resolved.hash;
    } catch {
      return false;
    }
  };

  const isValidRecord = (record) => Boolean(
    record &&
    typeof record.id === 'string' && record.id.trim() &&
    record.name && typeof record.name === 'object' &&
    record.description && typeof record.description === 'object' &&
    isSafeSourcePath(record.source) &&
    (!record.screenshots || ['before', 'after'].every((stage) => {
      const screenshot = record.screenshots[stage];
      if (!screenshot || typeof screenshot.src !== 'string' || !screenshot.alt || typeof screenshot.alt !== 'object') return false;
      try {
        const root = new URL('bookmarklets_screenshot/', location.href);
        const resolved = new URL(screenshot.src, location.href);
        return resolved.origin === root.origin && resolved.href.startsWith(root.href) &&
          /\.(?:png|jpe?g|webp)$/i.test(resolved.pathname) && !resolved.search && !resolved.hash;
      } catch {
        return false;
      }
    })) &&
    Array.isArray(record.matches) && record.matches.every((match) => typeof match === 'string')
  );

  const openManualCopyDialog = (githubUrl) => {
    elements.textarea.value = githubUrl;
    if (typeof elements.dialog.showModal === 'function') {
      elements.dialog.showModal();
      requestAnimationFrame(() => {
        elements.textarea.focus();
        elements.textarea.select();
      });
    } else {
      window.prompt(t('manualCopyDescription'), githubUrl);
    }
  };

  const copyGithubLink = async (cardState) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(cardState.githubUrl);
      setMessage(cardState.nodes.message, 'copied', 'success');
    } catch (error) {
      console.warn('[Bookmarklet Launcher] Clipboard fallback:', error);
      setMessage(cardState.nodes.message, 'copyFailed', 'error');
      openManualCopyDialog(cardState.githubUrl);
    }
  };

  const renderCard = (record) => {
    const fragment = elements.template.content.cloneNode(true);
    const card = fragment.querySelector('.bookmarklet-card');
    const nodes = {
      name: card.querySelector('[data-role="name"]'),
      description: card.querySelector('[data-role="description"]'),
      version: card.querySelector('[data-role="version"]'),
      matches: card.querySelector('[data-role="matches"]'),
      copy: card.querySelector('[data-role="copy-github-link"]'),
      guide: card.querySelector('.card-help-link'),
      message: card.querySelector('[data-role="message"]'),
      worksOn: card.querySelector('[data-i18n-dynamic="worksOn"]'),
      screenshots: card.querySelector('[data-role="screenshots"]')
    };

    if (record.screenshots) {
      nodes.screenshots.hidden = false;
      for (const stage of ['before', 'after']) {
        const figure = document.createElement('figure');
        figure.className = 'screenshot-item';
        figure.dataset.stage = stage;
        const caption = document.createElement('figcaption');
        const link = document.createElement('a');
        link.href = record.screenshots[stage].src;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const image = document.createElement('img');
        image.src = record.screenshots[stage].src;
        image.loading = 'lazy';
        image.decoding = 'async';
        link.appendChild(image);
        figure.append(caption, link);
        nodes.screenshots.appendChild(figure);
      }
    }

    record.matches.forEach((match) => {
      const pattern = document.createElement('code');
      pattern.className = 'pattern';
      pattern.textContent = match;
      nodes.matches.appendChild(pattern);
    });

    const cardState = {
      record,
      nodes,
      githubUrl: new URL(record.source, GITHUB_SOURCE_ROOT).href
    };
    nodes.copy.addEventListener('click', () => copyGithubLink(cardState));
    state.cards.set(record.id, cardState);
    elements.list.appendChild(fragment);
    refreshDynamicTranslations();
  };

  const renderCatalogStatus = () => {
    elements.catalogStatus.replaceChildren();
    if (state.catalogStatus !== 'error') {
      const key = { loading: 'loadingCatalog', empty: 'empty' }[state.catalogStatus];
      elements.catalogStatus.textContent = key ? t(key) : '';
      return;
    }
    const message = document.createElement('span');
    message.textContent = t('catalogError');
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'secondary-button retry-button';
    retry.textContent = t('retry');
    retry.addEventListener('click', loadCatalog);
    elements.catalogStatus.append(message, document.createElement('br'), retry);
  };

  const loadCatalog = async () => {
    state.cards.clear();
    elements.list.replaceChildren();
    elements.list.setAttribute('aria-busy', 'true');
    state.catalogStatus = 'loading';
    renderCatalogStatus();

    try {
      const response = await fetch('bookmarklets/catalog.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || !Array.isArray(data.bookmarklets)) throw new Error('Invalid catalog shape');

      const validRecords = data.bookmarklets.filter((record) => {
        const valid = isValidRecord(record);
        if (!valid) console.warn('[Bookmarklet Launcher] Skipping invalid record:', record);
        return valid;
      });

      state.catalogStatus = validRecords.length ? 'ready' : 'empty';
      renderCatalogStatus();
      validRecords
        .sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
        .forEach(renderCard);
      elements.list.setAttribute('aria-busy', 'false');
    } catch (error) {
      console.error('[Bookmarklet Launcher] Catalog load failed:', error);
      elements.list.replaceChildren();
      state.cards.clear();
      elements.list.setAttribute('aria-busy', 'false');
      state.catalogStatus = 'error';
      renderCatalogStatus();
    }
  };

  elements.selectButton.addEventListener('click', () => {
    elements.textarea.focus();
    elements.textarea.select();
  });

  language.initialize();
  loadCatalog();
})();
