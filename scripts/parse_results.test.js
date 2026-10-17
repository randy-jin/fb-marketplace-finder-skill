// Offline behavioral checks; no Facebook session or browser required.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const parse = vm.runInNewContext(
  '(' + fs.readFileSync(path.join(__dirname, 'parse_results.js'), 'utf8') + ')'
);
const read = async (html) => JSON.parse(JSON.stringify(await parse({ content: async () => html })));
const sample = JSON.parse(fs.readFileSync(path.join(__dirname, '../examples/sample-output.json'), 'utf8'));
const payload = (edges, page_info = {}) => ({ marketplace_search: { feed_units: { edges, page_info } } });

test('normalizes the documented sample and reads page info/location', async () => {
  const result = await read('<script>' + JSON.stringify({
    params: { location_id: sample.location_id },
    ...payload(sample.edges, sample.page_info)
  }) + '</script>');
  assert.deepEqual(result, {
    edges: sample.edges, page_info: sample.page_info,
    location_id: sample.location_id, listings: sample.listings
  });
});

test('handles nested JSON, braces, escaped quotes, duplicates, and tracking', async () => {
  const listing = { ...sample.edges[0].node.listing, marketplace_listing_title: 'A } desk "quoted" \\ brace {' };
  const edge = { node: { listing, tracking: { private: 'remove me' } }, tracking: 'also remove' };
  const result = await read(JSON.stringify({ params: { location_id: 123 }, ...payload([
    edge, edge, { node: { ad: true } }, null, { node: { listing: { id: 'invalid/id' } } }
  ], { nested: { values: [1, { a: '}' }] }, has_next_page: true }) }));
  assert.equal(result.listings.length, 1);
  assert.equal(result.listings[0].title, listing.marketplace_listing_title);
  assert.equal(result.location_id, '123');
  assert.equal(result.page_info.has_next_page, true);
  assert.equal(JSON.stringify(result).includes('remove me'), false);
  assert.equal(JSON.stringify(result).includes('tracking'), false);
});

test('preserves unknown fields as null rather than false or zero', async () => {
  const result = await read(JSON.stringify(payload([{ node: { listing: { id: '42' } } }])));
  assert.deepEqual(result.listings[0], {
    id: '42', title: null, price: null, city: null, state: null, photo: null,
    delivery_types: null, is_sold: null, is_pending: null,
    url: 'https://www.facebook.com/marketplace/item/42/'
  });
  assert.equal(result.location_id, null);
});

test('distinguishes empty feed from missing or malformed HTML data', async () => {
  assert.deepEqual((await read(JSON.stringify(payload([])))).edges, []);
  for (const html of ['<html>Log in to continue</html>',
    '"marketplace_search":{"feed_units":{"edges": [',
    '"marketplace_search":{invalid}',
    JSON.stringify({ marketplace_search: { feed_units: {} } })]) {
    const result = await read(html);
    assert.equal(result.edges, null);
    assert.deepEqual(result.listings, []);
  }
});

test('accepts whitespace, reordered keys, and a following location echo', async () => {
  const html = JSON.stringify({
    marketplace_search: { other: {}, feed_units: { page_info: { has_next_page: false }, edges: sample.edges } },
    params: { location_id: 'calgary' }
  }, null, 2);
  const result = await read(html);
  assert.equal(result.listings.length, 1);
  assert.equal(result.location_id, 'calgary');
});

test('skips an empty placeholder and uses the nearby location echo', async () => {
  const html = JSON.stringify({ params: { location_id: 'austin' }, ...payload([]) }) +
    JSON.stringify({ params: { location_id: 'calgary' }, ...payload(sample.edges) });
  const result = await read(html);
  assert.equal(result.location_id, 'calgary');
  assert.equal(result.listings.length, 1);
});
