import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('all public pages expose the shared brand, navigation and language controls', async () => {
  for (const path of ['index.html', 'install.html', 'install.en.html', 'skill.html', 'privacy.html', 'converter/index.html']) {
    const html = await readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
    assert.match(html, /class="brand-name">Bookmarklet Market/, path);
    assert.match(html, /id="site-navigation"/, path);
    assert.match(html, /data-language-select/, path);
    assert.match(html, /assets\/market.css/, path);
  }
});

test('tutorial controls precede the browser and Skill starts with the prompt', async () => {
  for (const path of ['install.html', 'install.en.html']) {
    const html = await readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
    assert.ok(html.indexOf('class="controls"') < html.indexOf('class="browser"'));
    assert.ok(html.indexOf('class="footnote"') > html.indexOf('class="browser"'));
  }
  const skill = await readFile(new URL('../../skill.html', import.meta.url), 'utf8');
  assert.ok(skill.indexOf('id="starter-prompt"') < skill.indexOf('class="skill-ideas"'));
});
