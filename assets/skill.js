import { createLanguageController } from './language.js';
import { skillMessages } from './skill-locales.js';

const language = createLanguageController({
  messages: skillMessages,
  onChange(code) {
    document.getElementById('starter-prompt').value = skillMessages[code].prompt;
    document.getElementById('fix-prompt').value = skillMessages[code].fixPrompt;
    document.querySelectorAll('[data-copy-status]').forEach((status) => { status.textContent = ''; });
  },
});
language.initialize();

document.querySelectorAll('[data-copy-prompt]').forEach((button) => {
  button.addEventListener('click', async () => {
    const id = button.dataset.copyPrompt;
    const prompt = document.getElementById(id);
    const status = document.querySelector(`[data-copy-status="${id}"]`);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(prompt.value);
      status.textContent = language.t('copied');
    } catch {
      prompt.focus();
      prompt.select();
      status.textContent = language.t('copyFallback');
    }
  });
});
