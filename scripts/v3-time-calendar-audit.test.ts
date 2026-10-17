import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateTolls} from '../lib/tolls.ts';
import {section15Amount} from '../lib/toll-engine/m11-moscow-schedule.ts';
import {matrixM4Component} from '../experiments/nationwide-tolls/engine/m4-route-adapter.mjs';
import {composeSelectedM4A289} from '../lib/v3-calculation/m4-a289-composition.ts';
import {m4TariffPeriodAt} from '../experiments/toll-od-matrix/m4-fare-calendar-2026.mjs';
import {matrixM11Component} from '../experiments/nationwide-tolls/engine/m11-route-adapter.mjs';

test('legacy toll weekday display uses Moscow time independently of the host timezone',()=>{
 const original=process.env.TZ;
 try {for(const tz of ['UTC','America/Los_Angeles','Asia/Tokyo']) {
  process.env.TZ=tz;
  assert.equal(estimateTolls([], '2026-10-15T22:00:00Z').period,'пятница–воскресенье');
  assert.equal(estimateTolls([], '2026-10-18T21:30:00Z').period,'понедельник–четверг');
 }}finally{if(original===undefined)delete process.env.TZ;else process.env.TZ=original;}
});
test('M11 head respects exact 01:00 and 06:00 Moscow night boundaries and its own stored special days',()=>{
 assert.equal(section15Amount(new Date('2026-10-13T00:59:59+03:00')).amount,1130);
 assert.equal(section15Amount(new Date('2026-10-13T01:00:00+03:00')).amount,880);
 assert.equal(section15Amount(new Date('2026-10-13T05:59:59+03:00')).amount,880);
 assert.equal(section15Amount(new Date('2026-10-13T06:00:00+03:00')).amount,1130);
 assert.equal(section15Amount(new Date('2026-11-03T12:00:00+03:00')).profile,'friday');
 assert.equal(section15Amount(new Date('2026-11-04T12:00:00+03:00')).profile,'saturday');
});
test('M4 and known A289 retain Thursday fares; missing M4, invalid dates and durations still block',()=>{
 const p={candidate:true,exact:true,tolls:{amount:850,weekdayAmount:850,weekendAmount:1000,period:'понедельник–четверг',confidence:'matched' as const,segments:['М-4: test']},m4PvpPreview:{confirmedPvps:['m4-1223','m4-1184','m4-1093']}};
 const route:[number,number][]=[[38.13,45.25],[38.5327744,45.171408],[39.7015,47.2357]];
 const date='2026-10-15T23:30:00+03:00';
 const m=matrixM4Component(p,date,3600);
 assert.equal(m.tolls?.amount,850);
 assert.equal(composeSelectedM4A289(route,p,m,[],date)?.tolls?.amount,1265);
 assert.equal(composeSelectedM4A289(route,p,{tolls:null,reason:'missing exact M4 fare'},[],date)?.tolls,null);
 assert.equal(matrixM4Component(p,'2027-10-13T12:00:00+03:00',900).tolls,null);
 assert.equal(matrixM4Component(p,'2026-10-13T12:00:00+03:00',Number.MAX_VALUE).tolls,null);
});
test('M4 calendar rejects normalized impossible dates before tariff lookup',()=>{
 for(const date of ['2026-02-30T12:00:00+03:00','2026-04-31T12:00:00Z'])assert.equal(m4TariffPeriodAt(date).status,'unknown');
 assert.equal(m4TariffPeriodAt('2026-11-03T12:00:00+03:00').profile,'friSun');
});
test('M11 date-only cannot fabricate an entry hour or a midnight transition',()=>{
 const production={boundaryStatus:'resolved',traversal:{entryPointId:'p593',exitPointId:'p679'}};
 assert.equal(matrixM11Component(production,'2026-10-13',3600).tolls,null);
 assert.ok(matrixM11Component(production,'2026-10-13T12:00:00+03:00',3600).tolls);
});

test('M11 mainline uses its own verified order274 holiday schedule and rejects unsupported years',()=>{
 const p={boundaryStatus:'resolved',traversal:{entryPointId:'p593',exitPointId:'p679'}};
 for(const date of ['2026-11-03T12:00:00+03:00','2026-11-04T12:00:00+03:00'])assert.equal(matrixM11Component(p,date,900).tolls.period,'пятница–воскресенье');
 assert.equal(matrixM11Component(p,'2027-10-13T12:00:00+03:00',900).tolls,null);
 assert.equal(section15Amount(new Date('2026-11-03T12:00:00+03:00')).amount,1650);
});
