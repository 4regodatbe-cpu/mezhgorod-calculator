import assert from "node:assert/strict";
import test from "node:test";
import {NextRequest} from "next/server";
import {POST} from "../app/r/route.ts";
import {cacheAddressSuggestions,clearAddressSuggestionCache,getCachedAddressSuggestions} from "../lib/address-suggestion-cache.ts";

test("partial provider results must not hide recovered homonyms for five minutes",()=>{
  clearAddressSuggestionCache();
  const dnr={id:"R-1413957",title:"Донецк",label:"Донецк — ДНР",region:"ДНР",position:{lat:48.0158753,lng:37.8013407}};
  cacheAddressSuggestions("Донецк",[dnr],{partial:true});
  assert.equal(getCachedAddressSuggestions("Донецк"),null);
  const rostov={...dnr,id:"R-1517207",label:"Донецк, Ростовская область",position:{lat:48.3382864,lng:39.9509488}};
  cacheAddressSuggestions("Донецк",[dnr,rostov],{partial:false});
  assert.equal(getCachedAddressSuggestions("Донецк")?.length,2);
  clearAddressSuggestionCache();
});

test("API identifies usable but incomplete suggestions after provider503",async()=>{
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{
    if(++calls!==1)return new Response("{}",{status:503});
    return new Response(JSON.stringify({features:[{properties:{name:"Донецк",osm_type:"R",osm_id:1413957,osm_key:"place",osm_value:"city",state:"Донецкая область"},geometry:{coordinates:[37.8013407,48.0158753]}}]}));
  };
  try{
    const response=await POST(new NextRequest("https://calculator.test/r",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:"Донецк"})}));
    assert.equal(response.status,200);const body=await response.json();
    assert.equal(body.items[0].id,"R-1413957");assert.equal(body.partial,true);
  }finally{globalThis.fetch=original;}
});
