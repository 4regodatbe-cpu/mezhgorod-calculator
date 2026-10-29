import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
test('bundled local pilot preserves receipt, bounded shards and source attribution',()=>{
 const root=new URL('../data/local-settlements/',import.meta.url),bytes=readFileSync(new URL('manifest.json',root)),manifest=JSON.parse(bytes),receipt=JSON.parse(readFileSync(new URL('admission.json',root)));
 assert.equal(receipt.scope,'local-pilot-only');assert.equal(createHash('sha256').update(bytes).digest('hex'),receipt.manifestSha256);
 assert.equal(manifest.recordCount,169431);assert.equal(manifest.license.name,'CC-BY-4.0');
 const checked=new Set();
 for(const meta of Object.values(manifest.shards)){
  assert.match(meta.file,/^[a-f0-9]{64}\.json\.gz$/);if(checked.has(meta.file))continue;checked.add(meta.file);
  const shard=readFileSync(new URL(meta.file,root));assert.equal(shard.length,meta.bytes);assert.equal(createHash('sha256').update(shard).digest('hex'),meta.sha256);
  assert.ok(meta.rawBytes<=32*1024*1024);assert.equal(gunzipSync(shard,{maxOutputLength:meta.rawBytes}).length,meta.rawBytes);
 }
 assert.match(readFileSync(new URL('ATTRIBUTION.md',root),'utf8'),/CC BY4.0/);
 const page=readFileSync(new URL('../app/v3/page.tsx',import.meta.url),'utf8');assert.ok(page.includes('https://www.geonames.org/'));assert.ok(page.includes('https://creativecommons.org/licenses/by/4.0/'));
});
