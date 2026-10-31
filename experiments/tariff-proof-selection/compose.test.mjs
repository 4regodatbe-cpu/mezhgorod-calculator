import test from 'node:test';
import assert from 'node:assert/strict';
import { admitRegistry, admitPolicy, compose, digest } from './compose.mjs';
const document=Buffer.from('SYNTHETIC TEST DOCUMENT; NOT AN OPERATOR TARIFF');
const base={operator:'synthetic-op',url:'https://example.invalid/synthetic',document:'fixture',documentHash:digest(document),entry:'in',exit:'out',direction:'forward',vehicle:'I',payment:'cash',validFrom:'2026-01-01',validTo:'2026-12-31'};
const q=(id,domain,covers,amount)=>({...base,id,domain,covers,amount});
const registry=records=>admitRegistry(records,{fixture:document},records.map(r=>({id:r.id,recordHash:digest(JSON.stringify(r)),reviewer:'synthetic-reviewer',reviewRef:'synthetic-test'})));
const context=domains=>({date:'2026-10-27',vehicle:'I',payment:'cash',traversals:domains.map(domain=>({domain,operator:base.operator,entry:'in',exit:'out',direction:'forward'}))});
const certify=p=>{const value={...p,source:'synthetic-test-policy',documentHash:digest(document)};return admitPolicy(value,document,{reviewer:'synthetic',reviewRef:'synthetic',recordHash:digest(JSON.stringify(value))});};
const policy=certify({additiveDomains:[],independentPairs:[['m4','m11'],['m4','a289'],['m11','ckad']]});
test('one whole pair covers multiple atomic charge obligations',()=>{
 assert.equal(compose(['a','b'],['pair'],registry([q('pair','m4',['a','b'],100)]),context(['m4']),policy).amount,100);
});
test('M4+M11, M4+A289 and M11+CKAD compose only independent synthetic charges',()=>{
 for(const domains of policy.independentPairs){const rs=domains.map((d,i)=>q(d,d,[String(i)],(i+1)*100));assert.equal(compose(['0','1'],domains,registry(rs),context(domains),policy).amount,300);}
});
test('partial unknown coverage never becomes complete',()=>assert.equal(compose(['a','b'],['a'],registry([q('a','m4',['a'],100)]),context(['m4']),policy).amount,null));
test('wrong date, direction, vehicle or payment rejects monetary evidence',()=>{
 const rs=[q('a','m4',['a'],100)],r=registry(rs);
 for(const change of [{date:'2027-01-01'},{date:'2026-02-30'},{vehicle:'II'},{payment:'card'},{traversals:[{...context(['m4']).traversals[0],direction:'reverse'}]}])assert.equal(compose(['a'],['a'],r,{...context(['m4']),...change},policy).amount,null);
});
test('same-domain edge sum needs admitted additivity policy',()=>{
 const rs=[q('a','m4',['a'],100),q('b','m4',['b'],200)],r=registry(rs);
 assert.equal(compose(['a','b'],['a','b'],r,context(['m4']),policy).amount,null);
 assert.equal(compose(['a','b'],['a','b'],r,context(['m4']),certify({...policy,additiveDomains:['m4']})).amount,300);
});
test('overlap and duplicate IDs cannot double charge',()=>{
 const rs=[q('a','m4',['a','b'],100),q('b','m11',['b','c'],200)];
 assert.equal(compose(['a','b','c'],['a','a','b'],registry(rs),context(['m4','m11']),policy).amount,null);
});
test('equal alternate covers agree; differing covers conflict without choosing cheaper',()=>{
 for(const value of [100,101]){const rs=[q('a','m4',['a'],100),q('b','m4',['a'],value)];assert.equal(compose(['a'],['a','b'],registry(rs),context(['m4']),policy).amount,value===100?100:null);}
});
test('record mutation and document substitution fail admission despite reviewed flags',()=>{
 const r=q('a','m4',['a'],100), manifest=[{id:r.id,recordHash:digest(JSON.stringify(r)),reviewer:'test',reviewRef:'test'}];
 assert.throws(()=>admitRegistry([{...r,amount:1,reviewed:true}],{fixture:document},manifest));
 assert.throws(()=>admitRegistry([r],{fixture:Buffer.from('replacement')},manifest));
 assert.throws(()=>admitRegistry([{...r,reviewed:true}],{fixture:document},[]));
});
test('independence must be explicitly admitted; different operator names are insufficient',()=>{
 const rs=[q('a','m4',['a'],100),q('b','m11',['b'],200)];assert.equal(compose(['a','b'],['a','b'],registry(rs),context(['m4','m11']),certify({...policy,independentPairs:[]})).amount,null);
});
test('admitted policy cannot be mutated or substituted by caller flags',()=>{
 assert.throws(()=>policy.additiveDomains.push('m4'));
 assert.equal(compose(['a'],['a'],registry([q('a','m4',['a'],100)]),context(['m4']),{...policy,reviewed:true}).amount,null);
 assert.equal(compose(['a'],['a'],{get:()=>q('a','m4',['a'],100)},context(['m4']),policy).amount,null);
});
