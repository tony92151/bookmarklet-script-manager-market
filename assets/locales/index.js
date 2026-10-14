import en from './en.js';
import zhTW from './zh-TW.js';
import ptBR from './pt-BR.js';
import es from './es.js';
import ja from './ja.js';
import zhCN from './zh-CN.js';
import ko from './ko.js';
import de from './de.js';
import fr from './fr.js';

// Keep codes, names and aliases aligned with bookmarklet-launcher.
export const supportedLanguages = [
  { code: 'en', name: 'English', messages: en },
  { code: 'zh-TW', name: '繁體中文', aliases: ['zh', 'zh-Hant'], messages: zhTW },
  { code: 'pt-BR', name: 'Português (Brasil)', aliases: ['pt'], messages: ptBR },
  { code: 'es', name: 'Español', messages: es },
  { code: 'ja', name: '日本語', messages: ja },
  { code: 'zh-CN', name: '简体中文', aliases: ['zh-Hans', 'zh-SG'], messages: zhCN },
  { code: 'ko', name: '한국어', messages: ko },
  { code: 'de', name: 'Deutsch', messages: de },
  { code: 'fr', name: 'Français', messages: fr },
];
