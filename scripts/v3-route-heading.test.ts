import test from 'node:test';
import assert from 'node:assert/strict';
import {v3RouteHeading} from '../app/v2/components/route-heading.ts';
import type {Result,Leg} from '../app/v2/components/types.ts';
const leg={corridor:'mainland'} as Leg;
test('ordinary routes retain fastest heading; verified internal routes override misleading corridor name',()=>{
 assert.equal(v3RouteHeading({legs:[leg]},leg),'Выбран маршрут с минимальным временем');
 assert.equal(v3RouteHeading({legs:[leg],specialEndpoint:true,specialOnly:true},leg),'Выбран маршрут по новым территориям');
});
test('mixed routes describe the actual selected corridor, never infer Krasnodar from endpoint names',()=>{
 const result:Result={legs:[leg],specialEndpoint:true,preferredCorridor:'crimea'};
 assert.equal(v3RouteHeading(result,leg),'Выбран маршрут через материк');
 assert.equal(v3RouteHeading(result,{...leg,corridor:'crimea'}),'Выбран маршрут через Крым');
 assert.equal(v3RouteHeading({legs:[],specialEndpoint:true},{} as Leg),'Выбран маршрут с учётом особых территорий');
});
