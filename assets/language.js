import { supportedLanguages } from './locales/index.js';

const STORAGE_KEY = 'bookmarklet-launcher-language';

function matchLanguage(code) {
  if (typeof code !== 'string') return;
  let candidate = code.toLowerCase();
  while (candidate) {
    const match = supportedLanguages.find((entry) => entry.code.toLowerCase() === candidate)
      || supportedLanguages.find((entry) => entry.aliases?.includes(candidate));
    if (match) return match.code;
    const separator = candidate.lastIndexOf('-');
    candidate = separator < 0 ? '' : candidate.slice(0, separator);
  }
}

export function createLanguageController({
  document = globalThis.document, navigator = globalThis.navigator,
  storage, location = globalThis.location, history = globalThis.history,
  onChange = () => {}, fallbackLanguage = 'en', messages = {},
} = {}) {
  // Accessing window.localStorage itself can throw when storage is restricted.
  if (storage === undefined) {
    try { storage = globalThis.localStorage; } catch { /* Session-only preference. */ }
  }
  let language = 'en';
  const dictionary = (code) => supportedLanguages.find((entry) => entry.code === code)?.messages || {};
  const t = (key, values = {}) => (messages[language]?.[key] || dictionary(language)[key]
    || messages.en?.[key] || dictionary('en')[key] || key)
    .replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));

  function link(path) {
    const [beforeHash, ...hash] = path.split('#');
    const queryStart = beforeHash.indexOf('?');
    const pathname = queryStart < 0 ? beforeHash : beforeHash.slice(0, queryStart);
    const params = new URLSearchParams(queryStart < 0 ? '' : beforeHash.slice(queryStart + 1));
    params.set('lang', language);
    return `${pathname}?${params}${hash.length ? `#${hash.join('#')}` : ''}`;
  }

  function render() {
    document.documentElement.lang = language;
    document.title = t('documentTitle');
    for (const [selector, property, attribute] of [
      ['[data-i18n]', 'i18n', null],
      ['[data-i18n-aria-label]', 'i18nAriaLabel', 'aria-label'],
      ['[data-i18n-alt]', 'i18nAlt', 'alt'],
      ['[data-i18n-placeholder]', 'i18nPlaceholder', 'placeholder'],
      ['[data-i18n-content]', 'i18nContent', 'content'],
    ]) {
      document.querySelectorAll(selector).forEach((element) => {
        if (attribute) element.setAttribute(attribute, t(element.dataset[property]));
        else element.textContent = t(element.dataset[property]);
      });
    }
    document.querySelectorAll('[data-language-select]').forEach((select) => { select.value = language; });
    document.querySelectorAll('[data-language-link]').forEach((element) => { element.href = link(element.dataset.languageLink); });
    onChange(language);
  }

  function save() {
    try { storage?.setItem(STORAGE_KEY, language); } catch { /* Keep working without persistent storage. */ }
  }

  function setLanguage(code) {
    if (!supportedLanguages.some((entry) => entry.code === code)) return;
    language = code;
    save();
    // Replace a previous explicit URL language too, so reload keeps this choice.
    try { history?.replaceState(history.state, '', link(location.href)); } catch { /* Navigation is optional. */ }
    render();
  }

  function initialize() {
    document.querySelectorAll('[data-language-select]').forEach((select) => {
      select.replaceChildren(...supportedLanguages.map(({ code, name }) => {
        const option = document.createElement('option');
        option.value = code;
        option.lang = code;
        option.textContent = name;
        return option;
      }));
      select.addEventListener('change', () => setLanguage(select.value));
    });
    let saved;
    try { saved = storage?.getItem(STORAGE_KEY); } catch { /* Use browser preferences. */ }
    const requested = new URLSearchParams(location?.search).get('lang');
    const isSupported = (code) => supportedLanguages.some((entry) => entry.code === code);
    const preferences = navigator?.languages?.length ? navigator.languages : [navigator?.language];
    language = (isSupported(requested) && requested) || (isSupported(saved) && saved)
      || preferences.map(matchLanguage).find(Boolean) || (isSupported(fallbackLanguage) ? fallbackLanguage : 'en');
    if (isSupported(requested)) save();
    render();
  }

  return { initialize, setLanguage, t, link, get language() { return language; } };
}
