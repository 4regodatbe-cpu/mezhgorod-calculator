import assert from 'node:assert/strict';import {test} from 'node:test';import {matrixM12Component} from './m12-route-adapter.mjs';
const p=markers=>({core:{status:'priced',finalMarkers:markers,boundary:{status:'proven',direction:'forward',firstRvpKm:markers[0],lastRvpKm:markers.at(-1)}},tolls:{}});
test('current exact M12 endpoint pair uses published direct matrix estimate',()=>assert.equal(matrixM12Component(p([33,65]),'2026-10-13T09:00:00Z').tolls.amount,498));
test('expired Shali never falls back to stale native price',()=>assert.equal(matrixM12Component(p([832]),'2026-10-13T09:00:00Z').tolls,null));
test('missing date rejects estimate',()=>assert.equal(matrixM12Component(p([33]),undefined).tolls,null));
test('unpriced native geometry never gains invented traversal',()=>assert.equal(matrixM12Component({core:{status:'unknown'}},'2026-10-13T09:00:00Z').tolls,null));
