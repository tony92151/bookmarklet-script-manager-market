import en from './en.js';
import zhTW from './zh-TW.js';
import ptBR from './pt-BR.js';
import es from './es.js';
import ja from './ja.js';

// Keep codes, names and aliases aligned with bookmarklet-launcher.
export const supportedLanguages = [
  { code: 'en', name: 'English', messages: en },
  { code: 'zh-TW', name: '繁體中文', aliases: ['zh'], messages: zhTW },
  { code: 'pt-BR', name: 'Português (Brasil)', aliases: ['pt'], messages: ptBR },
  { code: 'es', name: 'Español', messages: es },
  { code: 'ja', name: '日本語', messages: ja },
];
