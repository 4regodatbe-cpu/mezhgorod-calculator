import test from 'node:test';
import assert from 'node:assert/strict';
import {m4TariffPeriodAt} from '../toll-od-matrix/m4-fare-calendar-2026.mjs';

test('Order 58 does not price trips before its effective date',()=>{
 for(const date of ['2026-01-15T12:00:00+03:00','2026-03-01T23:59:59+03:00']){
  assert.deepEqual(m4TariffPeriodAt(date),{
   status:'unknown',reason:'tariff_not_effective_on_travel_date',date:null,profile:null,timezone:'Europe/Moscow'
  });
 }
});

test('Order 58 becomes eligible on its effective date and selects that date profile',()=>{
 const resolved=m4TariffPeriodAt('2026-03-02T00:00:00+03:00');
 assert.equal(resolved.status,'resolved');
 assert.equal(resolved.date,'2026-03-02');
 assert.equal(resolved.profile,'monThu');
});
