import { tutorialMessages } from './tutorial-locales.js';
import { supportedLanguages } from './locales/index.js';
export { tutorialMessages } from './tutorial-locales.js';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function createScenes(translate, language) {
  const t = (key) => escapeHtml(translate(key));
  const languageSelect = `<select class="scene-language-select" disabled tabindex="-1" aria-hidden="true" aria-label="${t('ext_language')}">${supportedLanguages.map(({ code, name }) => `<option value="${code}"${code === language ? ' selected' : ''}>${name}</option>`).join('')}</select>`;
  const icon = '<img class="appicon" src="assets/tutorial/launcher-icon.png" alt="">';
  const brand = `<div class="marketnav"><img src="assets/tutorial/launcher-icon.png" alt=""><div><small class="scene-eyebrow">BOOKMARKLET</small><strong>${t('ext_brandName')}</strong></div>${languageSelect}</div>`;
  const marketBrand = '<div class="marketnav"><img src="assets/tutorial/launcher-icon.png" alt=""><div><small class="scene-eyebrow">BOOKMARKLET</small><strong class="scene-market-name">Market</strong></div></div>';
  const popupHeading = `<div class="launcher-heading"><img src="assets/tutorial/launcher-icon.png" alt=""><div><small>BOOKMARKLET</small><b>${t('ext_brandName')}</b></div>${languageSelect}</div>`;
  const hotelPage = `<div class="hotel-scene"><div class="hotel-canvas" id="hotel-canvas"><img class="hotel-reference" src="assets/tutorial/staymiles-page-v2.webp" alt="${t('hotelAlt')}"><span class="mileage-tag first">${t('perMile')}</span><span class="mileage-tag second">${t('perMile')}</span></div></div>`;
  return [
    `<div class="scene"><div class="storehead"><i class="storemark"></i><b>Chrome Web Store</b><div class="search">${t('search')}</div></div><div class="listing">${icon}<div><h2>Bookmarklet<br>Script Manager</h2><div class="muted">${t('category')}</div></div><span class="action blue" id="install">${t('install')}</span></div><div class="showcase"><div class="popup"><div class="pophead"><img src="assets/tutorial/launcher-icon.png" alt=""></div><div class="popbody"><img class="miniicon" src="assets/tutorial/launcher-icon.png" alt=""><b class="scene-block">${t('ext_brandName')}</b>${languageSelect}<div class="empty">${t('ext_noScripts')}<br><br><span class="action scene-small-action">${t('ext_addFirst')}</span></div></div></div></div></div><div class="overlay" id="confirm"><div class="dialog"><strong>${t('confirmTitle')}</strong><p>${t('confirmDescription')}</p><div class="dialogfooter"><span>${t('ext_cancel')}</span><span class="confirm" id="confirm-action">${t('confirmAction')}</span></div></div></div>`,
    `<div class="scene market">${marketBrand}<h2>${t('marketHero')}</h2><div class="muted">${t('marketDescription')}</div><div class="toolcard"><div class="muted">BOOKMARKLET</div><h3>${t('toolName')}</h3><p class="muted">${t('toolDescription')}</p><div class="target">${t('worksOn')}</div><span class="action wide" id="copy">${t('copy')}</span><div class="notice" id="copied">✓ ${t('copied')}</div></div></div>`,
    `<div class="scene market launcher-backdrop">${marketBrand}<h2>${t('marketHero')}</h2><div class="toolcard"><h3>${t('toolName')}</h3><div class="target">${t('worksOn')}</div><span class="action wide">${t('copy')}</span><p class="muted">${t('copied')}</p></div></div><div class="launcher-shade"></div><div class="launcher-popup" id="launcher-popup">${popupHeading}<div class="launcher-content"><strong>${t('ext_savedScripts')}</strong><div class="launcher-empty"><span class="empty-symbol">›_</span><strong>${t('ext_collectionStarts')}</strong><p>${t('ext_addToLaunch')}</p><span class="action">${t('ext_addFirst')}</span></div></div><div class="manage-entry" id="manage-entry"><div>${t('ext_manage')}<small>${t('openManager')}</small></div><span>→</span></div></div>`,
    `<div class="scene manager">${brand}<h2>${t('ext_heroTitle')}</h2><div class="workspace"><div class="panel"><h3>${t('ext_addScript')}</h3><div class="tabs"><span id="manual" class="selected">${t('ext_manual')}</span><span id="github">GitHub</span></div><div id="manual-area"><div class="fieldlabel">${t('ext_scriptName')}</div><div class="field">${t('ext_scriptNameExample')}</div><div class="fieldlabel">${t('ext_scriptCode')}</div><div class="field">javascript:(()=>{ … })();</div></div><div id="github-area" style="display:none"><div class="fieldlabel">${t('ext_githubFileUrl')}</div><div class="field" id="url"></div><div class="fine">${t('ext_githubCopyHint')}</div><span class="action" id="save">${t('ext_save')}</span><div class="notice" id="done">${t('ext_githubSaved')}</div></div></div><div class="panel"><h3>${t('ext_savedScripts')}</h3><div class="saved" id="saved">staymiles-rate-helper-zh<div class="muted">${t('ext_githubSaved')}</div></div></div></div></div>`,
    hotelPage + `<div class="launcher-popup" id="run-popup">${popupHeading}<div class="launcher-content"><strong>${t('ext_savedScripts')}</strong><div class="run-list" id="run-script">staymiles-rate-helper-zh<small>${t('ext_runScriptTitle')}</small></div></div><div class="manage-entry"><span>${t('ext_manage')}</span><span>→</span></div></div>`,
  ];
}

export function createWalkthrough({ document, t, language, setTimeout = globalThis.setTimeout, clearTimeout = globalThis.clearTimeout }) {
  const viewport = document.getElementById('viewport');
  const caption = document.getElementById('caption');
  const play = document.getElementById('play');
  let scene = 4, timers = [], playing = false, advanceAll = false, generation = 0;
  function stop() {
    generation++;
    timers.forEach(clearTimeout);
    timers = [];
    playing = false;
    play.textContent = t('play');
  }
  function render() {
    document.getElementById('cursor')?.remove();
    viewport.innerHTML = createScenes(t, language())[scene];
    viewport.parentElement.insertAdjacentHTML('beforeend', '<div class="cursor" id="cursor" aria-hidden="true"></div>');
    caption.textContent = t(`label${scene}`);
    document.getElementById('address').textContent = ['chromewebstore.google.com', 'tony92151.github.io/bookmarklet-script-manager-market/', 'tony92151.github.io/bookmarklet-script-manager-market/', `${t('ext_brandName')} — ${t('ext_manage')}`, 'www.staymiles.china-airlines.com/search'][scene];
    document.querySelector('.chrome-tab.active span').textContent = ['Chrome Web Store', 'Bookmarklet Market', 'Bookmarklet Market', t('ext_manage'), t('hotelSearch')][scene];
    document.querySelectorAll('.step').forEach((el, i) => el.classList.toggle('active', i === scene));
  }
  function later(ms, fn) {
    const scheduledGeneration = generation;
    timers.push(setTimeout(() => { if (generation === scheduledGeneration) fn(); }, ms));
  }
  function move(id) {
    const el = document.getElementById(id), r = el.getBoundingClientRect(), v = viewport.parentElement.getBoundingClientRect(), cursor = document.getElementById('cursor');
    cursor.style.left = (r.left - v.left + r.width * .65) + 'px';
    cursor.style.top = (r.top - v.top + r.height * .6) + 'px';
  }
  function click() {
    const cursor = document.getElementById('cursor');
    cursor.classList.remove('click');
    void cursor.offsetWidth;
    cursor.classList.add('click');
  }
  function start(advance = false) {
    stop();
    render();
    playing = true;
    advanceAll = advance;
    play.textContent = t('stop');
    if (scene === 0) {
      later(300, () => move('install'));
      later(1200, () => {
        click();
        document.getElementById('confirm').style.opacity = 1;
        caption.textContent = t('captionConfirm');
      });
      later(2100, () => move('confirm-action'));
      later(3100, () => {
        click();
        document.getElementById('confirm').style.opacity = 0;
        document.getElementById('install').textContent = t('installed');
        caption.textContent = t('captionInstalled');
      });
    } else if (scene === 1) {
      later(350, () => move('copy'));
      later(1400, () => {
        click();
        document.getElementById('copied').style.opacity = 1;
        caption.textContent = t('captionCopied');
      });
    } else if (scene === 2) {
      later(350, () => move('toolbar-extension'));
      later(1400, () => {
        click();
        const popup = document.getElementById('launcher-popup');
        popup.style.opacity = 1;
        popup.style.transform = 'none';
        caption.textContent = t('captionFindManage');
      });
      later(2600, () => move('manage-entry'));
      later(3700, () => {
        click();
        document.getElementById('manage-entry').style.background = '#eee5ff';
        caption.textContent = t('captionManage');
      });
    } else if (scene === 4) {
      later(400, () => move('toolbar-extension'));
      later(1400, () => {
        click();
        document.getElementById('run-popup').style.opacity = 1;
        document.getElementById('run-popup').style.transform = 'none';
        caption.textContent = t('captionSelect');
      });
      later(2400, () => move('run-script'));
      later(3400, () => {
        click();
        document.getElementById('run-script').style.background = '#eee5ff';
        caption.textContent = t('captionRun');
      });
      later(3900, () => {
        document.getElementById('run-popup').style.opacity = 0;
        document.getElementById('hotel-canvas').classList.add('executed');
        caption.textContent = t('captionResult');
      });
    } else {
      later(300, () => move('github'));
      later(1200, () => {
        click();
        document.getElementById('manual').classList.remove('selected');
        document.getElementById('github').classList.add('selected');
        document.getElementById('manual-area').style.display = 'none';
        document.getElementById('github-area').style.display = 'block';
      });
      later(1900, () => move('url'));
      later(2700, () => {
        click();
        document.getElementById('url').textContent = 'https://github.com/tony92151/bookmarklet-script-manager-market/blob/main/bookmarklets/staymiles-rate-helper-zh.js';
        caption.textContent = t('captionPaste');
      });
      later(3600, () => move('save'));
      later(4500, () => {
        click();
        document.getElementById('saved').style.opacity = 1;
        document.getElementById('saved').style.transform = 'none';
        document.getElementById('done').style.opacity = 1;
        caption.textContent = t('captionSaved');
      });
    }
    later([4100, 2900, 4800, 5600, 6500][scene], () => {
      if (advance && scene < 4) { scene++; start(true); }
      else {
        stop();
        if (advance) caption.textContent = t('captionComplete');
      }
    });
  }
  return {
    initialize() {
      document.querySelectorAll('.step').forEach((el) => { el.onclick = () => { stop(); scene = Number(el.dataset.scene); render(); }; });
      play.onclick = () => { if (playing) stop(); else { scene = 0; start(true); } };
      document.getElementById('replay').onclick = () => start(false);
      document.getElementById('next').onclick = () => { stop(); scene = (scene + 1) % 5; render(); };
      render();
      stop();
    },
    languageChanged() {
      const resume = playing;
      const advance = advanceAll;
      stop();
      if (resume) start(advance);
      else render();
    },
  };
}

if (typeof document !== 'undefined') {
  const { createLanguageController } = await import('./language.js');
  let walkthrough;
  const controller = createLanguageController({
    fallbackLanguage: document.documentElement.dataset.defaultLanguage || 'en',
    messages: tutorialMessages,
    onChange() { walkthrough?.languageChanged(); },
  });
  walkthrough = createWalkthrough({ document, t: (key) => controller.t(key), language: () => controller.language });
  // Bind before initialization; initialize invokes onChange with the chosen locale.
  walkthrough.initialize();
  controller.initialize();
}
