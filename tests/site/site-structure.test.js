import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('site loads its sibling catalog directory', async () => {
  const catalog = JSON.parse(await readFile('bookmarklets/catalog.json', 'utf8'));
  assert.equal(catalog.bookmarklets[0].source, 'bookmarklets/klook-booking-category-label.js');
});
