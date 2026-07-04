import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPriceFilter } from '../src/controllers/productController.js';

test('buildPriceFilter returns both bounds when valid', () => {
  assert.deepEqual(buildPriceFilter('100', '200'), { $gte: 100, $lte: 200 });
});

test('buildPriceFilter returns only max when min is invalid', () => {
  assert.deepEqual(buildPriceFilter('abc', '200'), { $lte: 200 });
});

test('buildPriceFilter returns only min when max is invalid', () => {
  assert.deepEqual(buildPriceFilter('100', 'xyz'), { $gte: 100 });
});

test('buildPriceFilter returns undefined when both values are invalid', () => {
  assert.equal(buildPriceFilter('abc', 'xyz'), undefined);
});

test('buildPriceFilter returns undefined when no values provided', () => {
  assert.equal(buildPriceFilter(undefined, undefined), undefined);
});
