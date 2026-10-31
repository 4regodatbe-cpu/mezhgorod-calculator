import assert from 'node:assert/strict';

const base = process.argv[2];
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(base ?? '')) throw new Error('Pass a local 127.0.0.1 origin');
const results = [];
for (const path of ['/v2', '/v3']) {
  const response = await fetch(`${base}${path}`);
  const html = await response.text();
  assert.equal(response.status, 200, `${path} status`);
  assert.ok(html.length > 1000 && html.includes('__next'), `${path} body`);
  results.push({ path, status: response.status, htmlBytes: Buffer.byteLength(html) });
}
for (const query of ['Краснодар', 'Донецк', 'Волноваха', 'Мариуполь', 'Мелитополь', 'Ялта', 'Москва', 'Санкт-Петербург']) {
  const response = await fetch(`${base}/r`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }) });
  const data = await response.json();
  assert.equal(response.status, 200, `${query} status`);
  assert.equal(data.localSource?.provider, 'geonames', `${query} local source`);
  assert.ok(data.items?.length, `${query} results`);
  assert.ok(data.items.some(item => item.title.toLocaleLowerCase('ru') === query.toLocaleLowerCase('ru')), `${query} exact result`);
  for (const item of data.items) assert.ok(Number.isFinite(item.position?.lat) && Number.isFinite(item.position?.lng), `${query} coordinates`);
  if (query === 'Донецк') {
    assert.match(data.items[0].label, /ДНР/);
    assert.ok(data.items.some(item => /Ростовская область/i.test(item.label)), 'Rostov homonym preserved');
  }
  results.push({ query, status: response.status, count: data.items.length, first: data.items[0].label, source: data.localSource.provider });
}
console.log(JSON.stringify({ status: 'PASS', origin: base, results }));
