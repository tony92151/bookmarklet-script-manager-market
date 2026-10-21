import { createLanguageController } from './language.js';
import { pageMessages } from './page-locales.js';
import { decodeBookmarklet, toBookmarkletUrl } from '../shared/bookmarklet.js';

(() => {
  'use strict';

  const input = document.getElementById('converter-input');
  const output = document.getElementById('converter-output');
  const status = document.getElementById('converter-status');
  const encodeButton = document.getElementById('encode-button');
  const decodeButton = document.getElementById('decode-button');
  const copyButton = document.getElementById('copy-output-button');
  const clearButton = document.getElementById('clear-button');

  let statusKey = '';
  const language = createLanguageController({
    messages: Object.fromEntries(Object.entries(pageMessages).map(([code, m]) => [code, { documentTitle: m.converterTitle }])),
    onChange() { status.textContent = statusKey ? language.t(statusKey) : ''; },
  });
  language.initialize();

  const setStatus = (message, kind = '') => {
    statusKey = message;
    status.textContent = message ? language.t(message) : '';
    status.classList.remove('is-success', 'is-error');
    if (kind) status.classList.add(`is-${kind}`);
  };

  const setOutput = (value) => {
    output.value = value;
    copyButton.disabled = !value;
  };

  encodeButton.addEventListener('click', () => {
    if (!input.value) {
      setStatus('needCode', 'error');
      return;
    }

    setOutput(toBookmarkletUrl(input.value));
    setStatus('encoded', 'success');
  });

  decodeButton.addEventListener('click', () => {
    if (!input.value) {
      setStatus('needEncoded', 'error');
      return;
    }

    try {
      setOutput(decodeBookmarklet(input.value));
      setStatus('decoded', 'success');
    } catch (error) {
      setOutput('');
      setStatus('decodeError', 'error');
    }
  });

  copyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(output.value);
      setStatus('outputCopied', 'success');
    } catch {
      output.focus();
      output.select();
      setStatus('outputFallback', 'error');
    }
  });

  clearButton.addEventListener('click', () => {
    input.value = '';
    setOutput('');
    setStatus('');
    input.focus();
  });
})();
