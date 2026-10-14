import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {createRequire} from 'node:module';import vm from 'node:vm';
import {load,root} from './helpers/load-ts.mjs';
const require=createRequire(import.meta.url),ts=require('typescript');
function harness(fetch,clipboard={writeText:async()=>{}}){
 const states=[],cleanups=[];
 const react={useRef:current=>({current}),useState:initial=>{const index=states.length;states.push(initial);return [initial,value=>{states[index]=typeof value==='function'?value(states[index]):value;}];},useEffect:effect=>{const cleanup=effect();if(cleanup)cleanups.push(cleanup);}};
 const file=resolve(root,'app/v3/components/use-v3-calculation.ts');const mod={exports:{}};
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module:mod,exports:mod.exports,AbortController,fetch,navigator:{clipboard},setTimeout,clearTimeout,require:name=>name==='react'?react:name.startsWith('.')?load(resolve(dirname(file),name)):require(name)});
 const hook=mod.exports.useV3Calculation({from:{label:'A'},to:{label:'B'},rates:{},specialRates:{},requestMode:()=>({mode:'standard',modeOverride:false}),onServerMode:()=>{},multiplier:1});
 return {hook,states,cleanup:()=>cleanups.forEach(f=>f())};
}
const fare={totalPrice:100,requiresSplit:false,reviewRequired:false,dualTariff:false,pricingSegments:[{distanceKm:10,ratePerKm:10,amount:100,tariffType:'normal',from:'A',to:'B'}]};
const toll={amount:880,weekdayAmount:1130,weekendAmount:1650,period:'ночной проезд',segments:['М-11'],confidence:'matched',pricingStatus:'priced',priceConfirmation:'unconfirmed'};
const data=name=>({legs:[{from:name,to:'B',fast:{meters:10000,seconds:1000,tolls:toll,pricingByVehicle:Object.fromEntries(['standard','comfort','comfort_plus','minivan'].map(k=>[k,fare]))},free:null}]});
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
test('late response ignoring abort cannot replace a newer calculation',async()=>{
 const first=deferred(),second=deferred();let calls=0;
 const h=harness(url=>url==='/api/collect'?Promise.resolve(Response.json({})):calls++===0?first.promise:second.promise);
 const a=h.hook.calculate(),b=h.hook.calculate();second.resolve(Response.json(data('new')));await b;
 first.resolve(Response.json(data('old')));await a;assert.equal(h.states[0].legs[0].from,'new');h.cleanup();
});
test('reset and unmount prevent late response commitment',async()=>{
 for(const unmount of [false,true]){const pending=deferred();const h=harness(()=>pending.promise);const done=h.hook.calculate();if(unmount)h.cleanup();else h.hook.clearResult();pending.resolve(Response.json(data('late')));await done;assert.equal(h.states[0],null);h.cleanup();}
});
test('clipboard failure is handled and never reports success',async()=>{
 const h=harness(async()=>Response.json({}),{writeText:async()=>{throw Error('denied');}});
 const d=data('A'),leg=d.legs[0];await h.hook.copyStandard('k','title',leg,leg.fast,toll,undefined,'actual');
 assert.equal(h.states[5],'');assert.match(h.states[1],/буферу обмена/);h.cleanup();
});
test('clipboard contains the same actual toll and warning as the displayed quote',async()=>{
 let copied='';const h=harness(async()=>Response.json({}),{writeText:async text=>{copied=text;}});
 const d=data('A'),leg=d.legs[0];await h.hook.copyStandard('k','title',leg,leg.fast,toll,undefined,'actual');
 assert.match(copied,/880/);assert.match(copied,/980/);assert.doesNotMatch(copied,/1130|1650/);assert.match(copied,/Стоимость не подтверждена/);h.cleanup();
});

test('a late clipboard completion cannot mark a reset quote copied',async()=>{
 const pending=deferred(),d=data('A');
 const h=harness(async url=>Response.json(url==='/api/collect'?{}:d),{writeText:()=>pending.promise});
 await h.hook.calculate();const leg=d.legs[0];const copy=h.hook.copyStandard('old','title',leg,leg.fast,toll,undefined,'actual');
 h.hook.clearResult();pending.resolve();await copy;assert.equal(h.states[5],'');assert.equal(h.states[0],null);h.cleanup();
});


test('unknown road charge preserves a calculated special fare in copied text',async()=>{
 let copied='';const h=harness(async()=>Response.json({}),{writeText:async text=>{copied=text;}});
 const d=data('Волноваха'),leg=d.legs[0];
 const unknown={...toll,amount:null,weekdayAmount:null,weekendAmount:null,pricingStatus:'unknown',priceConfirmation:'unknown'};
 for(const vehicle of Object.keys(leg.fast.pricingByVehicle))leg.fast.pricingByVehicle[vehicle]={...fare,totalPrice:55299,dualTariff:true};
 await h.hook.copyStandard('k','title',leg,leg.fast,unknown,undefined,'actual');
 assert.match(copied,/55[\s\u00a0\u202f]?299 ₽ без платных дорог/);
 assert.doesNotMatch(copied,/итого не рассчитано|= 0/);
 assert.match(copied,/Стоимость платных дорог не подтверждена/);h.cleanup();
});
