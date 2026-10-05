import test from 'node:test';
import assert from 'node:assert/strict';

// Removing localization from a scene or allowing an old timer to update a new
// language must fail these tests. Timers and the DOM are the browser boundaries.
async function tutorial() {
  const module = await import('../../assets/tutorial.js').catch(() => null);
  assert.ok(module, 'the shared tutorial module must be importable');
  return module;
}

test('every language renders all five scenes with the matching extension terms', async () => {
  const { createScenes, tutorialMessages } = await tutorial();
  const cases = [['en', 'Manage Scripts', 'Save'], ['zh-TW', '管理指令碼', '儲存'], ['pt-BR', 'Gerenciar scripts', 'Salvar'], ['es', 'Gestionar scripts', 'Guardar'], ['ja', 'スクリプトを管理', '保存']];
  for (const [language, manage, save] of cases) {
    const t = (key) => { assert.equal(typeof tutorialMessages[language][key], 'string', `${language}: ${key}`); return tutorialMessages[language][key]; };
    const scenes = createScenes(t, language);
    assert.equal(scenes.length, 5);
    assert.ok(scenes[2].includes(manage));
    assert.ok(scenes[3].includes(save));
    assert.match(scenes[4], /staymiles-rate-helper-zh/);
    assert.match(scenes[4], /staymiles-page-v2.webp/);
    for (const index of [0, 2, 3, 4]) {
      assert.match(scenes[index], /<select[^>]*disabled/);
      assert.ok(scenes[index].includes(`value="${language}" selected`));
    }
  }
});

function browserFixture() {
  const nodes = new Map();
  const node = (id) => {
    if (!nodes.has(id)) nodes.set(id, { textContent: '', style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} }, remove() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }), insertAdjacentHTML() {} });
    return nodes.get(id);
  };
  node('viewport').parentElement = node('browser');
  const steps = Array.from({ length: 5 }, (_, i) => ({ ...node(`step${i}`), dataset: { scene: String(i) } }));
  const document = { getElementById: node, querySelector: () => node('tab'), querySelectorAll: () => steps };
  let clock = 0, serial = 0;
  const jobs = new Map();
  return { document, node, steps,
    setTimeout(fn, delay) { jobs.set(++serial, { at: clock + delay, fn }); return serial; },
    clearTimeout(id) { jobs.delete(id); },
    tick(ms) { const end = clock + ms; while (true) { const job = [...jobs].filter(([, j]) => j.at <= end).sort((a, b) => a[1].at - b[1].at)[0]; if (!job) break; jobs.delete(job[0]); clock = job[1].at; job[1].fn(); } clock = end; },
  };
}

test('language switch cancels pending callbacks and replays the current running step', async () => {
  const { createWalkthrough, tutorialMessages } = await tutorial();
  const browser = browserFixture();
  let language = 'en';
  const walkthrough = createWalkthrough({ ...browser, t: (key) => tutorialMessages[language][key], language: () => language });
  walkthrough.initialize();
  browser.steps[3].onclick();
  browser.node('replay').onclick();
  browser.tick(4400);
  language = 'ja';
  walkthrough.languageChanged();
  assert.match(browser.node('viewport').innerHTML, /スクリプトを追加/);
  const initialCaption = browser.node('caption').textContent;
  browser.tick(200);
  assert.equal(browser.node('caption').textContent, initialCaption, 'old save callback must not fire');
  browser.tick(4400);
  assert.equal(browser.node('caption').textContent, tutorialMessages.ja.captionSaved);
  browser.tick(1200);
  assert.equal(browser.node('play').textContent, tutorialMessages.ja.play);
  browser.steps[1].onclick();
  language = 'es';
  walkthrough.languageChanged();
  browser.tick(6000);
  assert.equal(browser.node('caption').textContent, tutorialMessages.es.label1, 'an idle scene stays idle after switching');
});

test('playback reaches every step and preserves auto-advance after changing language', async () => {
  const { createWalkthrough, tutorialMessages } = await tutorial();
  const browser = browserFixture();
  let language = 'en';
  const walkthrough = createWalkthrough({ ...browser, t: (key) => tutorialMessages[language][key], language: () => language });
  walkthrough.initialize();
  browser.node('play').onclick();
  browser.tick(3200);
  assert.equal(browser.node('install').textContent, 'Added to Chrome');
  browser.tick(2300);
  assert.equal(browser.node('caption').textContent, tutorialMessages.en.captionCopied);
  language = 'pt-BR';
  walkthrough.languageChanged();
  browser.tick(3000);
  assert.equal(browser.node('caption').textContent, tutorialMessages['pt-BR'].label2);
  browser.tick(1400);
  assert.equal(browser.node('launcher-popup').style.opacity, 1);
  browser.tick(3400);
  assert.equal(browser.node('caption').textContent, tutorialMessages['pt-BR'].label3);
  browser.tick(4500);
  assert.equal(browser.node('done').style.opacity, 1);
  browser.tick(1100);
  assert.equal(browser.node('caption').textContent, tutorialMessages['pt-BR'].label4);
  browser.tick(6500);
  assert.equal(browser.node('caption').textContent, tutorialMessages['pt-BR'].captionComplete);
  assert.equal(browser.node('play').textContent, tutorialMessages['pt-BR'].play);
});

test('browser bootstrap initializes the requested language and native selector', async () => {
  const browser = browserFixture();
  const select = { value: '', options: [], replaceChildren(...options) { this.options = options; }, addEventListener() {} };
  browser.document.documentElement = { dataset: { defaultLanguage: 'zh-TW' }, lang: 'zh-TW' };
  browser.document.createElement = () => ({});
  browser.document.querySelectorAll = (selector) => selector === '.step' ? browser.steps : selector === '[data-language-select]' ? [select] : [];
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const previousLocation = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: browser.document });
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { search: '?lang=en', href: 'https://example.test/install.html?lang=en' } });
  try {
    await import('../../assets/tutorial.js?browser-bootstrap-test');
    assert.equal(browser.document.documentElement.lang, 'en');
    assert.equal(select.options.length, 5);
    assert.equal(select.value, 'en');
    assert.equal(browser.node('play').textContent, 'Play all steps');
    assert.match(browser.node('viewport').innerHTML, /Manage Scripts/);
  } finally {
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else delete globalThis.document;
    if (previousLocation) Object.defineProperty(globalThis, 'location', previousLocation); else delete globalThis.location;
  }
});
