import { createLanguageController } from './language.js';
import { supportedLanguages } from './locales/index.js';
import { privacyMessages } from './privacy-locales.js';

const messages = Object.fromEntries(supportedLanguages.map(({ code, messages }) => [code, {
  documentTitle: `${messages.privacy} — Bookmarklet Script Manager`,
}]));
const language = createLanguageController({ messages, onChange(code) {
  const terms = privacyMessages[code];
  document.querySelectorAll('[data-policy]').forEach(element => {
    const text = terms[element.dataset.policy];
    if (element.dataset.policy === 'supportText') {
      const [before, after] = text.split('GitHub Issues');
      const link = document.createElement('a');
      link.href = 'https://github.com/tony92151/bookmarklet-script-manager-market/issues';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'GitHub Issues';
      element.replaceChildren(document.createTextNode(before), link, document.createTextNode(after || ''));
    } else {
      element.textContent = text;
    }
  });
  document.querySelectorAll('[data-policy-reference]').forEach(element => { element.hidden = true; });
  document.querySelector('[data-policy-date]').textContent = `${language.t('updated')}: ${new Intl.DateTimeFormat(code, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date('2026-09-26T00:00:00Z'))}`;
} });
language.initialize();
