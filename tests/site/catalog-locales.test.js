import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const locales = ['en', 'zh-TW', 'pt-BR', 'es', 'ja'];
const catalog = JSON.parse(await readFile('bookmarklets/catalog.json', 'utf8'));

for (const id of ['klook-booking-category', 'staymiles-rate-helper-zh', 'eva-mileage-hotel-helper-zh']) {
  test(`${id} has complete catalog text in all five languages`, () => {
    const entry = catalog.bookmarklets.find((record) => record.id === id);
    assert.ok(entry, `${id} should appear in the catalog`);
    const fields = { name: entry.name, description: entry.description };
    for (const [stage, screenshot] of Object.entries(entry.screenshots ?? {})) {
      fields[`screenshots.${stage}.alt`] = screenshot.alt;
    }
    for (const [field, translations] of Object.entries(fields)) {
      for (const locale of locales) {
        assert.equal(typeof translations?.[locale], 'string', `${field}.${locale} must be text`);
        assert.ok(translations[locale].trim(), `${field}.${locale} must not be empty`);
      }
    }
  });
}
