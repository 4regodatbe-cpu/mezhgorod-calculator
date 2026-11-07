import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import april from '../source-snapshots/2026-04-24-15-58-category1.json' with {type:'json'};
import november from '../../../data/tolls/m11/2026-11-02-15-58-category1-no-transponder.json' with {type:'json'};
import {m11HeadTariffAt,matrixM11HeadComponent} from './m11-head-route-adapter.mjs';

const resolved=(from,to,paymentWindowSeconds=0)=>({boundaryStatus:'resolved',from,to,paymentWindowSeconds});
const path=new URL('../../../data/tolls/m11/2026-11-02-15-58-category1-no-transponder.json',import.meta.url);

test('M11 15–58 source matrices are complete directed Category I/no-transponder editions',()=>{
 for(const matrix of [april,november]){
  assert.equal(matrix.systemId,'m11-15-58-ossp');
  assert.equal(matrix.vehicleCategory.id,'group1');
  assert.equal(matrix.paymentModel,'without_transponder');
  assert.equal(matrix.extraction.directional,true);
  assert.equal(matrix.extraction.routePairCount,42);
  const cells=Object.values(matrix.tariffs).flatMap(destinations=>Object.values(destinations)).flatMap(profiles=>Object.values(profiles));
  assert.equal(cells.length,210);
  assert.ok(cells.every(value=>Number.isSafeInteger(value)&&value>=0));
 }
 const hash=createHash('sha256').update(readFileSync(path)).digest('hex');
 assert.equal(hash,'b801eb896b4a29848e49164498d4b25041adda54950dbb708c1c23185c519279');
});

test('M11 15–58 edition changes at the exact Nov 2 01:00 Moscow boundary',()=>{
 const before=matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'2026-11-02T00:59:59+03:00');
 const at=matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'2026-11-02T01:00:00+03:00');
 const after=matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'2026-11-02T01:00:01+03:00');
 assert.equal(before.tolls?.amount,1260); // April edition, Nov 1 Sunday tariff day.
 assert.equal(at.tolls?.amount,850); // New edition, night profile starts at 01:00.
 assert.equal(after.tolls?.amount,850);
 assert.equal(m11HeadTariffAt('2026-11-02T00:59:59+03:00').editionEffectiveFrom,april.effectiveFrom);
 assert.equal(m11HeadTariffAt('2026-11-02T01:00:00+03:00').editionEffectiveFrom,november.effectiveFrom);
});

test('M11 15–58 honors separate weekday, Friday, Saturday, Sunday and special-day profiles',()=>{
 assert.equal(matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'2026-11-03T12:00:00+03:00').tolls?.amount,1500); // Tue uses Friday override.
 assert.equal(matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'2026-11-04T12:00:00+03:00').tolls?.amount,1500); // Wed uses Saturday override.
 assert.equal(m11HeadTariffAt('2026-11-05T12:00:00+03:00').profile,'monThu');
 assert.equal(m11HeadTariffAt('2026-11-06T12:00:00+03:00').profile,'fri');
 assert.equal(m11HeadTariffAt('2026-11-07T12:00:00+03:00').profile,'sat');
 assert.equal(m11HeadTariffAt('2026-11-08T12:00:00+03:00').profile,'sun');
 assert.equal(m11HeadTariffAt('2026-11-02T03:00:00+03:00').profile,'night');
});

test('M11 15–58 lookup is directed and fail-closed for unsupported physical/tariff points',()=>{
 assert.equal(matrixM11HeadComponent(resolved('moscow','sheremetyevo2'),'2026-11-05T12:00:00+03:00').tolls?.amount,500);
 assert.equal(matrixM11HeadComponent(resolved('sheremetyevo2','moscow'),'2026-11-05T12:00:00+03:00').tolls?.amount,490);
 assert.equal(matrixM11HeadComponent(resolved('solnechnogorsk','tskad'),'2026-11-06T12:00:00+03:00').tolls?.amount,210);
 assert.equal(matrixM11HeadComponent(resolved('tskad','solnechnogorsk'),'2026-11-06T12:00:00+03:00').tolls?.amount,300);
 assert.equal(matrixM11HeadComponent(resolved('p214','p58'),'2026-11-06T12:00:00+03:00').tolls,null);
 assert.equal(matrixM11HeadComponent(resolved('unknown','solnechnogorsk'),'2026-11-06T12:00:00+03:00').tolls,null);
 assert.equal(matrixM11HeadComponent(resolved('moscow','moscow'),'2026-11-06T12:00:00+03:00').tolls,null);
});

test('M11 15–58 historical lower bound and unsupported future dates remain unknown',()=>{
 assert.equal(matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'2026-04-24T00:59:59+03:00').tolls,null);
 assert.equal(matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'2026-04-24T01:00:00+03:00').tolls?.amount,880);
 assert.equal(matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'2027-01-01T12:00:00+03:00').tolls,null);
 assert.equal(matrixM11HeadComponent(resolved('moscow','solnechnogorsk'),'not-a-date').tolls,null);
});

test('M11 head result explicitly identifies departure-time estimate and exit-PVP limitation',()=>{
 const result=matrixM11HeadComponent(resolved('moscow','solnechnogorsk',1200),'2026-11-05T12:00:00+03:00');
 assert.equal(result.tolls?.amount,1130);
 assert.match(result.tolls?.period??'',/оценка по времени отправления/u);
 assert.match(result.tolls?.period??'',/оператор применяет тариф при выезде с ПВП/u);
});
