// Metadata/integrity verification only: no application execution or external requests.
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const base=new URL('./',import.meta.url);
const read=name=>readFileSync(new URL(name,base));
const json=name=>JSON.parse(read(name).toString('utf8'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const example=json('d1-example.json');
const d3=json('d3-primary-ledger.json');
const checks=[];
function check(name,run){run();checks.push({name,status:'PASS'});}
check('saved negative regression baseline is retained',()=>{
 assert.match(read('d1-before.log').toString('utf8'),/pass 0/u);
 assert.match(read('d1-before.log').toString('utf8'),/fail 8/u);
});
check('saved focused and offline gate counts, not a test rerun',()=>{
 assert.match(read('d1-focused.log').toString('utf8'),/pass 26/u);
 const audit=read('d1-audit.log').toString('utf8');
 for(const expected of ['tests 1048','pass 1047','fail 0','skipped 1','PASS quote:','PASS API adapter:'])assert.ok(audit.includes(expected),expected);
});
check('exact reported query retains admitted DNR city with explicit unconfirmed street precision',()=>{
 assert.equal(example.query,'Донецк ДНР улица Артёма');
 assert.equal(example.execution.externalRequests,0);
 assert.equal(example.response.httpStatus,200);
 const body=example.response.body;
 assert.equal(body.items[0].id,'geonames-709717');
 assert.equal(body.items[0].region,'ДНР');
 assert.deepEqual(body.items[0].position,{lat:48.023,lng:37.80224});
 assert.equal(body.streetSearch.status,'unconfirmed');
 assert.equal(body.streetSearch.precision,'settlement-centre');
 assert.ok(body.items.every(item=>!item.label.includes('Ростовская')));
});
check('retained real Photon example source bytes still match their pinned SHA',()=>{
 const bytes=readFileSync(new URL('../../../'+example.source.path,base));
 assert.equal(digest(bytes),example.source.sha256);
});
check('new M11 original PDF size and SHA match successful retrieval record',()=>{
 const original=read('m11-new-scheme.pdf');
 assert.equal(original.length,d3.m11.source.download.bytes);
 assert.equal(digest(original),d3.m11.source.download.sha256);
 assert.equal(original.subarray(0,4).toString('ascii'),'%PDF');
 assert.equal(d3.m11.source.download.httpStatus,200);
 assert.equal(d3.m11.source.download.curlExit,0);
});
check('M11 extraction limitation and exact raw HTTP line endings are preserved',()=>{
 assert.equal(read('m11-new-scheme.txt').toString('utf8'),'\f'.repeat(25));
 const headers=read('m11-new-scheme.headers').toString('utf8');
 assert.ok(headers.includes('HTTP/2 200'));
 assert.ok(headers.includes('content-length: 9573142\r\n'));
 assert.ok(!/(?<!\r)\n/u.test(headers),'original HTTP CRLF retained');
});
check('M12 failure is not misrepresented as downloaded primary evidence',()=>{
 const failed=d3.m12.sourceAttempt;
 assert.equal(failed.httpStatus,403);assert.equal(failed.curlExit,22);
 assert.equal(failed.primaryBodyBytes,0);assert.equal(failed.sha256,null);
 const headers=read('m12-registration-lead.headers').toString('utf8');
 assert.match(headers,/HTTP\/2 403/u);
 assert.doesNotMatch(headers,/set-cookie:/iu);
});
check('four unresolved D3 bindings remain unknown, without invented prices or new routing requests',()=>{
 assert.match(d3.m11.source.status,/^BLOCKED_BY_DATA/u);
 for(const road of ['m12','ckad','zsd'])assert.match(d3[road].status,/^BLOCKED_BY_DATA/u);
 for(const key of ['newCompleteOperatorBindings','newPrices','routingRequests','osmRequests','oldFailedUrlsRetried'])assert.equal(d3.conclusion[key],0,key);
 assert.equal(d3.conclusion.ageAloneUsedAsBlocker,false);
 assert.equal(d3.conclusion.requiresEveryCashLaneCertificate,false);
});
const artifacts=readdirSync(base).filter(name=>name!=='final-review.json'&&statSync(new URL(name,base)).isFile()).sort().map(name=>{
 const bytes=read(name);return {path:name,bytes:bytes.length,sha256:digest(bytes)};
});
console.log(JSON.stringify({
 stage:'D4',date:'2026-10-30',timezone:'Europe/Moscow',
 scope:'local saved-evidence integrity only; no repeated app test, provider call or road audit',
 sourceRuntimeCommit:'ae5203df',sourceStageCCommit:'210d46695d83c05e6ecb4c85d54897cc05a22874',
 publishedHead:'c2f52ee93cd98a81ecd05efa0358fb38c6704124',
 localParentBeforeConsolidation:'2208cb93bdc5f6f5e628e42b85f3523e43566361',
 pr:{number:14,state:'open',draft:true,merged:false,verification:'GitHub Connector readback on30Oct2026; no mutation'},
 checks,artifacts,
 limitations:['Not a real Preview acceptance or confirmation of actual DNR street coverage.',
  'Prior gate exit statuses/Node version are recorded in D1 checkpoint; empty compiler logs alone do not prove success.',
  'D3 M11 document is supplementary facility evidence, not a new virtual product boundary.',
  'Original negative-test/build/lint logs and raw HTTP headers include whitespace/CRLF that default git checks flag; source bytes are preserved, not normalized.',
  'Publication is not authorized. All StageC/D commits remain local.'],
 externalRequests:0,
 evidenceDirectory:fileURLToPath(base).replace(/\/$/u,'')
},null,2));
