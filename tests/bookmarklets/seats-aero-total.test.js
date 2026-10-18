import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the standalone parser without adding exports to the bookmarklet.
const path = new URL('../../bookmarklets/seats-aero-total.js', import.meta.url);
const source = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
const start = source.indexOf('  const parseTotal =');
const end = source.indexOf('\n  const TARGET', start);
const parse = start < 0 ? () => null : vm.runInNewContext(`${source.slice(start, end)}; parseTotal;`);

test('uses exact tooltip points, USD cents, and does not multiply by seat count', () => {
  assert.equal(parse('8,000 pts + $50.98 USD BR 1 seat'), '130.98');
  assert.equal(parse('9,850 pts + $50.98 USD BR 2 seats'), '149.48');
  assert.equal(parse('20,000 pts + $0.00 USD BR 1 seat'), '200.00');
  assert.equal(parse('100,000 pts + $1,050.98 USD BR 1 seat'), '2050.98');
});

test('never treats missing, foreign, or ambiguous fees as USD zero', () => {
  for (const value of ['8k', '8,000 pts', '8,000 pts + $50.98 CAD', '8,000 pts + $50.98', '8,000 pts + $50.98 USD 9,000 pts + $70.00 USD']) {
    assert.equal(parse(value), null, value);
  }
});

test('parses captured seats.aero tooltip with adjacent airline and seat text', () => {
  assert.equal(parse('8,000 pts+ $50.98 USDBR1 seat'), '130.98');
  assert.equal(parse('8,000 pts+ $50.98 USDBR2 seats'), '130.98');
  assert.equal(parse('8,000 pts+ $50.98 USD1 seat'), '130.98');
  assert.equal(parse('8,000 pts+ $50.98 USDT'), null);
  assert.equal(parse('8,000 pts+ $50.98 USDBR1 seat8,000 pts+ $50.98 USDBR1 seat'), null);
});
