import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import core from './quote.cjs';
import {matrixM12Component} from './m12-route-adapter.mjs';
const root=new URL('../',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root)));
const input=(road,from,to,date='2026-10-14',extra={})=>({routeId:'r',evidenceComplete:true,components:[{road,from,to,profile:'allDays',routeId:'r',traversalId:road,exactTraversal:true,profileResolved:true,localDate:date,...extra}]});
test('uploaded sources retain exact original hashes, including reused duplicate PDFs',()=>{
 const batch=read('source-snapshots/uploaded-pdf-batch-2026-10-14.json');
 assert.equal(batch.files.length,7);assert.equal(batch.files.filter(f=>f.duplicate).length,2);
 for(const f of batch.files)assert.equal(createHash('sha256').update(readFileSync(new URL(f.sourceFile,root))).digest('hex'),f.sha256);
});
test('all210 CKAD classI direct prices survive generator and dated quote without classII leakage',()=>{
 const source=read('source-snapshots/ckad-2026-03-02-category1-direct-pair-matrix.json');
 let count=0;
 for(const[from,row]of Object.entries(source.directFareRub))for(const[to,rub]of Object.entries(row))if(rub!==null){
  const c=core.quote(input('ckad',from,to,'2026-10-14',{tariffContextResolved:true}));
  assert.equal(c.rub,rub,`${from}→${to}`);count++;
  assert.notEqual(rub,source.supersededCategory2MislabeledAs1.directFareRub[from][to]);
 }
 assert.equal(count,210);
 assert.equal(core.quote(input('ckad','М-10 Россия','ПК-5')).rub,2278);
 assert.equal(core.quote(input('ckad','М-4 Дон','М-11 Нева')).rub,1800);
 assert.equal(core.quote(input('ckad','М-10 Россия','ПК-5','2026-03-01')).rub,null);
});
test('CKAD M12 endpoint prices require operator footnote context; unknown blocks a mixed total',()=>{
 const c=input('ckad','М-12 Восток','Носовихинское шоссе');
 assert.equal(core.quote(c).reason,'unresolved-operator-tariff-context');
 assert.equal(core.quote(input('ckad','Носовихинское шоссе','М-12 Восток')).rub,null);
 assert.equal(core.quote(input('ckad','М-12 Восток','Носовихинское шоссе','2026-10-14',{tariffContextResolved:true})).rub,156);
 c.components.push(input('tolyatti','17','97').components[0]);
 assert.equal(core.quote(c).rub,null);
});
test('M12 order302 supplies380 direct dated cells, never a stale price beforeOctober8',()=>{
 const source=read('source-snapshots/m12-order302-2026-10-08-category1-direct-pair-matrix.json');
 let count=0;
 for(const[from,row]of Object.entries(source.directRowsByOrigin))row.forEach((rub,i)=>{if(rub!==null){assert.equal(core.quote(input('m12',from,source.pointOrder[i],'2026-10-08')).rub,rub);count++;}});
 assert.equal(count,380);
 for(const [from,to,rub]of [['moscow','shali',5946],['shali','moscow',5946],['kazan_p239','shali',99],['shali','kazan_p239',99],['moscow','kazan_p239',5847]])assert.equal(core.quote(input('m12',from,to)).rub,rub);
 assert.equal(core.quote(input('m12','moscow','shali','2026-10-07')).rub,null);
 assert.equal(core.quote(input('m12','moscow','sokury_exit')).rub,null);
 // Receiving a new fare does not prove that the old physical marker is the new boundary.
 assert.equal(matrixM12Component({core:{status:'priced',finalMarkers:[832]},tolls:{}},'2026-10-14T10:00:00+03:00').tolls,null);
});
test('separate CKAD bypass and Tolyatti direct fare remain distinct, dated products',()=>{
 assert.equal(core.quote(input('ckad-small-vyazemy','М-1 Беларусь','Звенигород')).rub,103);
 assert.equal(core.quote(input('ckad-small-vyazemy','Звенигород','М-1 Беларусь')).rub,103);
 assert.equal(core.quote(input('tolyatti','17','97','2026-03-01')).rub,320);
 assert.equal(core.quote(input('tolyatti','97','17','2026-03-01')).rub,320);
 assert.equal(core.quote(input('tolyatti','17','97','2026-02-28')).rub,null);
});
