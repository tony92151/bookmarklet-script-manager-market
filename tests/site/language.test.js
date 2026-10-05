import test from 'node:test';
import assert from 'node:assert/strict';

const module = await import('../../assets/language.js').catch(() => ({}));

function page({ search = '', saved, languages = [], language, brokenStorage = false, fallbackLanguage } = {}) {
  const nodes = { title: { dataset: { i18n: 'heroTitle' } }, select: { children: [], replaceChildren(...items) { this.children = items; }, addEventListener(type, fn) { this[type] = fn; } }, link: { dataset: { languageLink: 'install.html' } } };
  const document = { documentElement: {}, createElement: () => ({}), querySelectorAll(selector) {
    return ({ '[data-i18n]': [nodes.title], '[data-language-select]': [nodes.select], '[data-language-link]': [nodes.link] })[selector] || [];
  } };
  const values = { 'bookmarklet-launcher-language': saved };
  const storage = { getItem(key) { if (brokenStorage) throw Error('Blocked'); return values[key]; }, setItem(key, value) { if (brokenStorage) throw Error('Blocked'); values[key] = value; } };
  const location = { href: `https://example.com/market/index.html${search}`, search };
  const history = { replaceState(_state, _title, url) { location.href = new URL(url, location.href).href; location.search = new URL(location.href).search; } };
  const changes = [];
  assert.equal(typeof module.createLanguageController, 'function', 'language controller must exist');
  const controller = module.createLanguageController({ document, navigator: { languages, language }, storage, location, history, fallbackLanguage, onChange: (code) => changes.push(code) });
  controller.initialize();
  return { controller, document, nodes, values, changes, location };
}

test('explicit URL overrides saved selection, which overrides browser preferences', () => {
  assert.equal(page({ search: '?lang=ja', saved: 'es', languages: ['pt-BR'] }).controller.language, 'ja');
  assert.equal(page({ saved: 'es', languages: ['pt-BR'] }).controller.language, 'es');
  assert.equal(page({ search: '?lang=invalid', saved: 'ja', languages: ['es'] }).controller.language, 'ja');
});

test('browser preference order, regional aliases and unsupported languages resolve correctly', () => {
  for (const [languages, expected] of [
    [['ko-KR', 'ja-JP', 'es'], 'ja'], [['pt-PT'], 'pt-BR'], [['pt'], 'pt-BR'],
    [['es-MX'], 'es'], [['ZH-hant-TW'], 'zh-TW'], [['zh-CN'], 'zh-TW'],
    [['en-GB', 'zh-TW'], 'en'], [['ko-KR'], 'en'],
  ]) assert.equal(page({ languages }).controller.language, expected);
  assert.equal(page({ language: 'ja-JP' }).controller.language, 'ja');
  assert.equal(page({ fallbackLanguage: 'zh-TW' }).controller.language, 'zh-TW');
  assert.equal(page({ fallbackLanguage: 'zh-TW', languages: ['en'] }).controller.language, 'en');
});

test('manual switch updates document, navigation, current URL and saved preference', () => {
  const ui = page({ search: '?lang=en&view=cards#bookmarklets' });
  ui.controller.setLanguage('ja');
  assert.equal(ui.controller.language, 'ja');
  assert.equal(ui.document.documentElement.lang, 'ja');
  assert.equal(ui.nodes.select.value, 'ja');
  assert.equal(ui.values['bookmarklet-launcher-language'], 'ja');
  assert.equal(new URL(ui.location.href).searchParams.get('lang'), 'ja');
  assert.equal(new URL(ui.location.href).searchParams.get('view'), 'cards');
  assert.equal(new URL(ui.location.href).hash, '#bookmarklets');
  assert.equal(ui.nodes.link.href, 'install.html?lang=ja');
  assert.equal(ui.controller.link('./?view=all#tools'), './?view=all&lang=ja#tools');
  assert.deepEqual(ui.changes, ['en', 'ja']);
  ui.controller.setLanguage('unknown');
  assert.equal(ui.controller.language, 'ja');
  assert.equal(ui.nodes.select.children.length, 5);
  assert.equal(ui.nodes.select.children.find((option) => option.value === 'pt-BR').textContent, 'Português (Brasil)');
});

test('blocked local storage still allows detection, rendering and manual language changes', () => {
  const ui = page({ languages: ['es'], brokenStorage: true });
  assert.equal(ui.controller.language, 'es');
  assert.doesNotThrow(() => ui.controller.setLanguage('pt-BR'));
  assert.equal(ui.document.documentElement.lang, 'pt-BR');
  assert.ok(ui.nodes.title.textContent);
});

test('all shipped site dictionaries have complete keys and interpolation parameters', async () => {
  const { supportedLanguages } = await import('../../assets/locales/index.js');
  const english = supportedLanguages.find(({ code }) => code === 'en').messages;
  const parameters = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const locale of supportedLanguages) {
    assert.deepEqual(Object.keys(locale.messages).sort(), Object.keys(english).sort(), locale.code);
    for (const key of Object.keys(english)) {
      assert.equal(typeof locale.messages[key], 'string', `${locale.code}.${key}`);
      assert.ok(locale.messages[key].trim(), `${locale.code}.${key}`);
      assert.deepEqual(parameters(locale.messages[key]), parameters(english[key]), `${locale.code}.${key}`);
    }
  }
});
