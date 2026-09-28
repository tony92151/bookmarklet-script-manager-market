import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

test('site loads its sibling catalog directory', async () => {
  const catalog = JSON.parse(await readFile('bookmarklets/catalog.json', 'utf8'));
  assert.equal(catalog.bookmarklets[0].source, 'bookmarklets/klook-booking-category-label.js');
});

test('mileage hotel catalog entries provide before/after previews', async () => {
  const catalog = JSON.parse(await readFile('bookmarklets/catalog.json', 'utf8'));
  for (const id of ['staymiles-rate-helper-zh', 'eva-mileage-hotel-helper-zh']) {
    const entry = catalog.bookmarklets.find((record) => record.id === id);
    assert.ok(entry, `${id} should appear in the catalog`);
    assert.equal((await stat(entry.source)).isFile(), true);
    for (const stage of ['before', 'after']) {
      assert.equal((await stat(entry.screenshots[stage].src)).isFile(), true, `${id} ${stage} image exists`);
      assert.ok(entry.screenshots[stage].alt.en);
      assert.ok(entry.screenshots[stage].alt['zh-TW']);
    }
  }
});
