(() => {
  'use strict';

  const STORAGE_KEY = 'bookmarklet-launcher-language';
  const GITHUB_SOURCE_ROOT = 'https://github.com/tony92151/bookmarklet-script-manager-market/blob/main/';
  const SUPPORTED_LANGUAGES = ['en', 'zh-TW'];
  const state = {
    language: 'en',
    cards: new Map()
  };

  const translations = {
    en: {
      documentTitle: 'Bookmarklet Market — Browse browser tools',
      github: 'GitHub',
      extension: 'Extension',
      eyebrow: 'Browser tools',
      heroTitle: 'Explore useful scripts for the web',
      heroDescription: 'Browse the collection and copy a GitHub link to review or share each script.',
      browse: 'Browse bookmarklets',
      installExtension: 'Install Bookmarklet Manager',
      securityTitle: 'Security:',
      securityText: 'Review a script before running it.',
      catalogEyebrow: 'Available tools',
      catalogTitle: 'Bookmarklets',
      catalogDescription: 'Each script has a GitHub source page you can review and share.',
      footerText: 'Review a script and its intended websites before running it.',
      source: 'Source',
      license: 'License',
      manualCopyTitle: 'Copy GitHub link',
      manualCopyDescription: 'Copy the GitHub link below.',
      selectAll: 'Select all',
      close: 'Close',
      loadingCatalog: 'Loading bookmarklets…',
      catalogError: 'Unable to load the bookmarklet catalog.',
      retry: 'Retry',
      empty: 'No bookmarklets are available yet.',
      worksOn: 'Works on',
      copyGithubLink: 'Copy GitHub link',
      copied: 'GitHub link copied.',
      copyFailed: 'Clipboard access was unavailable. Copy the link from the dialog.',
      version: 'Version',
      updated: 'Updated',
      before: 'Before',
      after: 'After'
    },
    'zh-TW': {
      documentTitle: 'Bookmarklet Market — 瀏覽書籤工具',
      github: 'GitHub',
      extension: '擴充功能',
      eyebrow: '瀏覽器工具',
      heroTitle: '探索實用的網頁腳本',
      heroDescription: '瀏覽工具清單，複製 GitHub 連結來查看或分享腳本。',
      browse: '瀏覽書籤工具',
      installExtension: '安裝 Bookmarklet Manager',
      securityTitle: '安全提醒：',
      securityText: '執行腳本前，請先檢視內容。',
      catalogEyebrow: '可用工具',
      catalogTitle: '書籤工具',
      catalogDescription: '每個腳本都有可供檢視和分享的 GitHub 原始碼頁面。',
      footerText: '執行腳本前，請檢視內容及適用網站。',
      source: '原始碼',
      license: '授權條款',
      manualCopyTitle: '複製 GitHub 連結',
      manualCopyDescription: '複製下方 GitHub 連結。',
      selectAll: '全選',
      close: '關閉',
      loadingCatalog: '正在載入書籤工具…',
      catalogError: '無法載入書籤工具清單。',
      retry: '重試',
      empty: '目前還沒有可用的書籤工具。',
      worksOn: '適用網站',
      copyGithubLink: '複製Github連結',
      copied: '已複製 GitHub 連結。',
      copyFailed: '無法使用剪貼簿，請在視窗中手動複製連結。',
      version: '版本',
      updated: '更新日期',
      before: '使用前',
      after: '使用後'
    }
  };

  const elements = {
    list: document.getElementById('bookmarklet-list'),
    catalogStatus: document.getElementById('catalog-status'),
    template: document.getElementById('bookmarklet-card-template'),
    dialog: document.getElementById('copy-dialog'),
    textarea: document.getElementById('copy-textarea'),
    selectButton: document.getElementById('select-code-button'),
    languageButtons: [...document.querySelectorAll('[data-language]')]
  };

  const t = (key) => translations[state.language][key] || translations.en[key] || key;

  const localized = (value) => {
    if (!value || typeof value !== 'object') return '';
    return value[state.language] || value.en || Object.values(value).find((item) => typeof item === 'string') || '';
  };

  const detectLanguage = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(saved)) return saved;
    return navigator.language?.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en';
  };

  const setMessage = (element, message, kind = '') => {
    element.textContent = message;
    element.classList.remove('is-success', 'is-error');
    if (kind) element.classList.add(`is-${kind}`);
  };

  const applyStaticTranslations = () => {
    document.documentElement.lang = state.language;
    document.title = t('documentTitle');
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    elements.languageButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === state.language));
    });
  };

  const refreshDynamicTranslations = () => {
    state.cards.forEach(({ record, nodes }) => {
      nodes.name.textContent = localized(record.name);
      nodes.description.textContent = localized(record.description);
      nodes.copy.textContent = t('copyGithubLink');
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

  const setLanguage = (language) => {
    if (!SUPPORTED_LANGUAGES.includes(language)) return;
    state.language = language;
    localStorage.setItem(STORAGE_KEY, language);
    applyStaticTranslations();
    refreshDynamicTranslations();
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
      setMessage(cardState.nodes.message, t('copied'), 'success');
    } catch (error) {
      console.warn('[Bookmarklet Launcher] Clipboard fallback:', error);
      setMessage(cardState.nodes.message, t('copyFailed'), 'error');
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

  const renderCatalogError = () => {
    elements.list.replaceChildren();
    elements.list.setAttribute('aria-busy', 'false');
    elements.catalogStatus.replaceChildren();

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
    elements.catalogStatus.textContent = t('loadingCatalog');

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

      elements.catalogStatus.textContent = validRecords.length ? '' : t('empty');
      validRecords.forEach(renderCard);
      elements.list.setAttribute('aria-busy', 'false');
    } catch (error) {
      console.error('[Bookmarklet Launcher] Catalog load failed:', error);
      renderCatalogError();
    }
  };

  elements.languageButtons.forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  elements.selectButton.addEventListener('click', () => {
    elements.textarea.focus();
    elements.textarea.select();
  });

  state.language = detectLanguage();
  applyStaticTranslations();
  loadCatalog();
})();
