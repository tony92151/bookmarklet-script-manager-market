import './navigation.js';
import { createLanguageController } from './language.js';

const converter = !!document.getElementById('converter-input');
export const language = createLanguageController({
  messages: {
    en: {
      documentTitle: converter ? 'URL Encoding Converter | Bookmarklet Market' : 'Privacy Policy | Bookmarklet Market',
      converterTitle: 'URL Encoding Converter', converterDescription: 'Convert JavaScript or a bookmarklet URL. Nothing is uploaded.',
      input: 'Input', output: 'Output', encode: 'Encode as bookmarklet', decode: 'Decode', clear: 'Clear', copyOutput: 'Copy output',
      encodeEmpty: 'Paste JavaScript before encoding.', decodeEmpty: 'Paste a bookmarklet before decoding.',
      encoded: 'Bookmarklet URL created.', decoded: 'Bookmarklet decoded.', decodeError: 'Invalid bookmarklet encoding. Check the input.',
      outputCopied: 'Output copied.', outputFallback: 'Clipboard access failed. The output is selected for manual copying.',
    },
    'zh-TW': {
      documentTitle: converter ? '網址轉換器 | Bookmarklet Market' : '隱私權政策 | Bookmarklet Market',
      converterTitle: '網址轉換器', converterDescription: '轉換 JavaScript 或書籤網址，所有處理都在本機完成。',
      input: '輸入', output: '轉換結果', encode: '編碼為書籤網址', decode: '解碼', clear: '清除', copyOutput: '複製結果',
      encodeEmpty: '請先貼上 JavaScript。', decodeEmpty: '請先貼上書籤網址。',
      encoded: '已產生書籤網址。', decoded: '已解碼書籤網址。', decodeError: '書籤網址編碼無效，請檢查輸入內容。',
      outputCopied: '已複製結果。', outputFallback: '無法存取剪貼簿，已選取結果，請手動複製。',
    },
  },
  onChange() {
    const status = document.getElementById('converter-status');
    if (status) status.textContent = '';
  },
});
language.initialize();
