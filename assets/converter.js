import { decodeBookmarklet, toBookmarkletUrl } from '../shared/bookmarklet.js';
import { language } from './utility-language.js';

(() => {
  'use strict';

  const input = document.getElementById('converter-input');
  const output = document.getElementById('converter-output');
  const status = document.getElementById('converter-status');
  const encodeButton = document.getElementById('encode-button');
  const decodeButton = document.getElementById('decode-button');
  const copyButton = document.getElementById('copy-output-button');
  const clearButton = document.getElementById('clear-button');

  const setStatus = (message, kind = '') => {
    status.textContent = message;
    status.classList.remove('is-success', 'is-error');
    if (kind) status.classList.add(`is-${kind}`);
  };

  const setOutput = (value) => {
    output.value = value;
    copyButton.disabled = !value;
  };

  input.addEventListener('input', () => {
    setOutput('');
    setStatus('');
  });

  encodeButton.addEventListener('click', () => {
    if (!input.value.trim()) {
      setOutput('');
      setStatus(language.t('encodeEmpty'), 'error');
      return;
    }

    setOutput(toBookmarkletUrl(input.value));
    setStatus(language.t('encoded'), 'success');
  });

  decodeButton.addEventListener('click', () => {
    if (!input.value.trim()) {
      setOutput('');
      setStatus(language.t('decodeEmpty'), 'error');
      return;
    }

    try {
      setOutput(decodeBookmarklet(input.value));
      setStatus(language.t('decoded'), 'success');
    } catch (error) {
      setOutput('');
      setStatus(language.t('decodeError'), 'error');
    }
  });

  copyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(output.value);
      setStatus(language.t('outputCopied'), 'success');
    } catch {
      output.focus();
      output.select();
      setStatus(language.t('outputFallback'), 'error');
    }
  });

  clearButton.addEventListener('click', () => {
    input.value = '';
    setOutput('');
    setStatus('');
    input.focus();
  });
})();
