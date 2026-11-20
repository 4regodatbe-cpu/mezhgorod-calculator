import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import compiler from './scripts/build-m4-endpoint-register.cjs';
import restore from './scripts/restore-m4-order58-endpoint-register.cjs';

const read=(name)=>JSON.parse(readFileSync(new URL(name,import.meta.url)));
const order=read('source-snapshots/m4-order58-2026-03-02-category1-verified.json');
const stageWTranscription=read('source-snapshots/m4-posted-category1-tariffs-2026-09-29.json');
const active=read('M4_ACTIVE_ENDPOINT_REGISTER.json');
const selected=read('TARIFF_SELECTION_REGISTER.json');
const selectedBase=read('source-snapshots/m4-order58-v3-selected-rows-from-d60.json');
const activeBase=compiler.compileEndpoints(
 read('TARIFF_VECTOR_MATRIX_2026-10-12.json'),
 read('M4_REVIEWED_ENDPOINT_CELLS_2026-10-13.json'),
 read('M4_OPERATOR_ENDPOINT_CELLS.json'));

test('Order 58 source columns are vehicle category rows and two time profiles, not transponder columns',()=>{
 assert.equal(order.effectiveFrom,'2026-03-02T00:00:00+03:00');
 assert.equal(order.category,1);
 assert.match(order.payment,/cash or bank card without transponder/);
 assert.deepEqual(order.profileColumns,{monThu:'Monday–Thursday excluding holidays and preceding special days',friSun:'Friday–Sunday and holidays/special preceding days'});
 const controls={
  'm4-62':[220,220], 'm4-71':[310,400], 'm4-133':[400,500],
  'm4-803':[560,620], 'm4-1184':[300,350], 'm4-1223':[400,500],
 };
 for(const [id,expected] of Object.entries(controls))
  assert.deepEqual([order.cells[id].monThu,order.cells[id].friSun],expected,id);
 assert.deepEqual([order.cells['m4-dzok-46'].monThu,order.cells['m4-dzok-46'].friSun],[410,410]);
 assert.deepEqual([order.cells['m4-355'].monThu,order.cells['m4-355'].friSun],[220,220]);
});

test('shared M4 tariff dataset matches every verified category-I PDF row',()=>{
 const code=readFileSync(new URL('../../lib/toll-engine/m4-data.ts',import.meta.url),'utf8');
 const rate=(id)=>{
  const mixed=id==='m4-416+m4-460'||id==='m4-636';
  const start=id==='m4-416+m4-460'?code.indexOf('id: "m4-401-464"'):id==='m4-636'?code.indexOf('id: "m4-633-741"'):id==='m4-672'?code.indexOf('km: 672'):code.indexOf(`id: "${id}"`);
  assert.notEqual(start,-1,`dataset marker for ${id}`);
  const field=mixed?'fullSectionTariff':'tariff';
  const match=code.slice(start,start+900).match(new RegExp(`${field}: rub\\((\\d+), (\\d+)\\)`));
  assert.ok(match,`dataset amount for ${id}`);
  return [Number(match[1]),Number(match[2])];
 };
 for(const [id,row] of Object.entries(order.cells)){
  if(id==='m4-dzok-46')continue;
  assert.deepEqual(rate(id),[row.monThu,row.friSun],id);
 }
});

test('Stage W four-column transcription is retained only as invalid historical evidence',()=>{
 assert.deepEqual(stageWTranscription.paymentColumns,{monThu:['with-transponder','without-transponder'],friSun:['with-transponder','without-transponder']});
 assert.deepEqual([
  stageWTranscription.products['m4-71'].monThu.withTransponder,
  stageWTranscription.products['m4-71'].monThu.withoutTransponder,
  stageWTranscription.products['m4-71'].friSun.withTransponder,
  stageWTranscription.products['m4-71'].friSun.withoutTransponder,
 ],[310,400,450,500]);
 assert.deepEqual([order.cells['m4-71'].monThu,order.cells['m4-71'].friSun],[310,400]);
});

test('restored active endpoint register equals the immutable source-matrix compilation',()=>{
 const expected=restore.keepExternalControlsUnknown(activeBase);
 assert.deepEqual(active,expected);
 assert.equal(active.rows.length,728);
 assert.equal(active.rows.filter(row=>row.priceConfirmation==='unknown').length,4);
 assert.equal(active.rows.filter(row=>row.sourceFareStatus==='verified-operator-rows').length,722);
 assert.ok(active.rows.every(row=>!row.currentTariffSnapshot&&!row.previousFare&&!row.tariffEffectiveFrom));
});

test('all 36 Stage W-selected south/DZOK entries are restored from the d60 source snapshot',()=>{
 const restored=restore.restoreSelectedM4Rows(selected,selectedBase.rows);
 assert.deepEqual(restored,selected);
 assert.equal(selectedBase.sourceCommit,'d60e733313860d2412d8be64f4be10ef71f7de28');
 assert.equal(selectedBase.rows.length,36);
 assert.deepEqual(selected.selected.filter(row=>row.road==='m4-dzok').map(row=>[row.from,row.to,row.profile,row.rub]),[
  ['0','51','monThu',410],['51','0','monThu',410],['0','51','friSun',410],['51','0','friSun',410],
 ]);
 assert.ok(selected.selected.filter(row=>row.road==='m4-dzok').every(row=>row.runtimeApproved===false));
});

test('restoration is independent of the invalid Stage W current-table transcription',()=>{
 const before=JSON.stringify(activeBase);
 const after=JSON.stringify(compiler.compileEndpoints(
  read('TARIFF_VECTOR_MATRIX_2026-10-12.json'),
  read('M4_REVIEWED_ENDPOINT_CELLS_2026-10-13.json'),
  read('M4_OPERATOR_ENDPOINT_CELLS.json')));
 assert.equal(after,before);
 assert.equal(restore.restoreSelectedM4Rows(selected,selectedBase.rows).selected.length,selected.selected.length);
});
