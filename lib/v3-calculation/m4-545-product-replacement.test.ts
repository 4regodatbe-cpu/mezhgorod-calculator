import assert from "node:assert/strict";
import test from "node:test";
import { splitM4MatrixAt545 } from "./m4-545-product-replacement";
import { composeRouteTolls } from "../toll-engine/route-toll-composition";

const vector=["m4-515","m4-545-a","m4-545-b","m4-620"];
const accepted={status:"accepted_working_calculation",amount:320,weekdayAmount:320,weekendAmount:410,
  period:"понедельник–четверг",coverageKeys:["m4-545-a","m4-545-b"],isWholeRouteTotal:false};
const matrix={reason:"exact endpoint estimate",priceConfirmation:"unconfirmed",productCoverage:{sectionVector:vector},
  tolls:{amount:650,weekdayAmount:650,weekendAmount:830,period:"понедельник–четверг",
    segments:["М-4: m4-515 → m4-620 · Стоимость не подтверждена"],confidence:"matched" as const}};

test("exact 545 coverage is replaced once; aggregate remainder plus accepted products preserves matrix totals",()=>{
  const split=splitM4MatrixAt545(matrix,accepted);
  assert.equal(split.product?.amount,320);assert.equal(split.product?.weekendAmount,410);
  assert.equal(split.matrix?.tolls?.amount,330);assert.equal(split.matrix?.tolls?.weekdayAmount,330);
  assert.equal(split.matrix?.tolls?.weekendAmount,420);
  assert.match(split.matrix?.tolls?.segments[0]??"",/исключает отдельно выделенный ПВП 545/u);
  const composed=composeRouteTolls([
    {id:"m4",detected:true,tolls:split.matrix!.tolls},
    {id:"m4-545",detected:true,tolls:split.product},
  ]);
  assert.equal(composed.status,"priced");assert.equal(composed.tolls?.amount,650);
  assert.equal(composed.tolls?.weekdayAmount,650);assert.equal(composed.tolls?.weekendAmount,830);
});

test("missing, partial, duplicate, reversed or fare-period-mismatched coverage never leaves the overlapping M4 amount priced",()=>{
  const badVectors=[undefined,["m4-515","m4-545-a","m4-620"],
    ["m4-515","m4-545-a","m4-545-a","m4-545-b","m4-620"],
    ["m4-515","m4-545-b","m4-545-a","m4-620"]];
  for(const sectionVector of badVectors){
    const split=splitM4MatrixAt545({...matrix,productCoverage:sectionVector?{sectionVector}:null},accepted);
    assert.equal(split.product?.amount,320);assert.equal(split.matrix?.tolls,null);
    assert.equal(composeRouteTolls([{id:"m4",detected:true,tolls:split.matrix!.tolls},
      {id:"m4-545",detected:true,tolls:split.product}]).status,"unknown");
  }
  const mismatch=splitM4MatrixAt545({...matrix,tolls:{...matrix.tolls,period:"пятница–воскресенье"}},accepted);
  assert.equal(mismatch.matrix?.tolls,null);
});

test("Saturday price splits the same exact products using the existing weekend matrix profile",()=>{
  const saturday={...accepted,amount:410,period:"пятница–воскресенье"};
  const weekendMatrix={...matrix,tolls:{...matrix.tolls,amount:830,period:"пятница–воскресенье"}};
  const split=splitM4MatrixAt545(weekendMatrix,saturday);
  assert.equal(split.product?.amount,410);assert.equal(split.matrix?.tolls?.amount,420);
  assert.equal(split.matrix?.tolls?.weekdayAmount,330);assert.equal(split.matrix?.tolls?.weekendAmount,420);
  const total=composeRouteTolls([{id:"m4",detected:true,tolls:split.matrix!.tolls},
    {id:"m4-545",detected:true,tolls:split.product}]);
  assert.equal(total.tolls?.amount,830);assert.equal(total.tolls?.weekdayAmount,650);
  assert.equal(total.tolls?.weekendAmount,830);
});

test("another unknown detected road keeps the route total null after a valid 545 split",()=>{
  const split=splitM4MatrixAt545(matrix,accepted);
  const composition=composeRouteTolls([
    {id:"m4",detected:true,tolls:split.matrix!.tolls},
    {id:"m4-545",detected:true,tolls:split.product},
    {id:"m11-58-679",detected:true,tolls:null,reason:"unpriced separate road"},
  ]);
  assert.equal(composition.status,"unknown");assert.equal(composition.tolls,null);
  assert.ok(composition.priced.includes("m4-545"));
});
