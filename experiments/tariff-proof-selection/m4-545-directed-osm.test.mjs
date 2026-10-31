import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

// Evidence consistency tests, NOT a production detector or tariff admission.
const snapshot = JSON.parse(readFileSync(new URL('./m4-545-directed-osm.json', import.meta.url)));
const ways = new Map(snapshot.ways.map(w => [w.id, w]));
const nodes = new Map(snapshot.nodes.map(n => [n.id, n]));
const target = ['799492317','615270676','615270691','615270694','1043769287','799492323'];
const northern = ['799492326','799492325','606838738','799492324','1043769289','702218809','787089819','1043769288'];
const adjacent = ['522875739','799492316','467980114','467980113','1043769286','432522383','1043769285'];
function chain(ids, start, end) {
  let cursor = start;
  const visited = [];
  for (const id of ids) {
    const w = ways.get(id);
    assert.ok(w, `missing way ${id}`);
    assert.equal(w.tags.oneway, 'yes');
    assert.equal(w.nodes[0], cursor, `disconnected/reversed way ${id}`);
    for (const n of w.nodes) assert.ok(nodes.has(n), `missing node ${n}`);
    visited.push(...w.nodes.slice(0, -1));
    cursor = w.nodes.at(-1);
  }
  assert.equal(cursor, end);
  visited.push(cursor);
  return visited;
}
test('retained target is a continuous northbound five-lane gate branch', () => {
  const path = chain(target, '4522140254', '4513805004');
  assert.equal(path.filter(n => n === '5818209495').length, 1);
  const gate = ways.get('615270691');
  assert.equal(gate.tags.lanes, '5');
  assert.deepEqual(gate.nodes, ['5818209500','5818209495','5818209499']);
  assert.ok(nodes.get(gate.nodes[0]).lat < nodes.get(gate.nodes[2]).lat);
  assert.deepEqual([nodes.get('5818209495').lat, nodes.get('5818209495').lon], [51.4702718,39.554704]);
});
test('same fork and merge also permit northern gate, without target gate', () => {
  const path = chain(northern, '4522140254', '4513805004');
  assert.ok(path.includes('3504914294'));
  assert.ok(!path.includes('5818209495'));
  assert.ok(!chain(target, '4522140254', '4513805004').includes('3504914294'));
});
test('adjacent southern gate leads to a distinct northward corridor', () => {
  const path = chain(adjacent, '4522140254', '4512436102');
  assert.ok(path.includes('9620416636'));
  assert.ok(!path.includes('5818209495'));
  assert.ok(!path.includes('4513805004'));
});
test('reversal, missing link, neighbouring branch and repeated gate are not the target chain', () => {
  assert.throws(() => chain([...target].reverse(), '4513805004', '4522140254'));
  assert.throws(() => chain(target.filter(id => id !== '615270694'), '4522140254', '4513805004'));
  assert.throws(() => chain(adjacent, '4522140254', '4513805004'));
  assert.throws(() => chain([...target.slice(0,3),'615270691',...target.slice(3)], '4522140254', '4513805004'));
});
test('opposing southern booth has reversed north/south traversal, not target identity', () => {
  const w = ways.get('467980112');
  assert.ok(w.nodes.includes('365274796'));
  assert.equal(w.tags.oneway, 'yes');
  assert.ok(nodes.get(w.nodes[0]).lat > nodes.get(w.nodes.at(-1)).lat);
  assert.ok(!w.nodes.includes('5818209495'));
});
