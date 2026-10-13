import test from 'node:test';
import assert from 'node:assert/strict';
import {quoteA289SelectedRoute as quote} from './a289-route-adapter.mjs';

const base={routeId:'r',selectedRouteId:'r',exitBindingComplete:true,localDate:'2026-10-13'};
test('direct A-289 pairs, reverse, bridge vector and unknown exits',()=>{
  assert.equal(quote({...base,from:'Maryanskaya',to:'Slavyansk',frames:['23']})?.rub,555);
  assert.equal(quote({...base,from:'Slavyansk',to:'Maryanskaya',frames:['23']})?.rub,555);
  assert.equal(quote({...base,from:'Slavyansk',to:'Temryuk',frames:['82','103']})?.rub,548);
  assert.equal(quote({...base,from:'TamanBridge',to:'Maryanskaya',frames:['103','82','23']})?.rub,800);
  assert.equal(quote({...base,from:'Maryanskaya',to:'AnapaExit',frames:['23','82']}),null);
  assert.equal(quote({...base,from:'Slavyansk',to:'TamanBridge',frames:['82','103']}),null);
});
test('city Temryuk control cannot be inferred from three free-flow frames',()=>{
  assert.equal(quote({...base,from:'Maryanskaya',to:'Temryuk',frames:['23','82','103']}),null);
  assert.equal(quote({...base,from:'Maryanskaya',to:'Temryuk',temryukFastestControlMatched:true})?.rub,620);
  assert.equal(quote({...base,from:'Maryanskaya',to:'Slavyansk',frames:['23'],exitBindingComplete:false}),null);
  assert.equal(quote({...base,from:'Maryanskaya',to:'Slavyansk',frames:['23'],selectedRouteId:'other'}),null);
});
