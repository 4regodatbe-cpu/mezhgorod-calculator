#!/usr/bin/env python3
"""Offline structural checks for retained PVP545 OSM branch witnesses."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
e=json.loads((root/'geometry/osm-directed-subset.json').read_text())
ways={w['id']:w for w in e['ways']}; nodes={n['id']:n for n in e['nodes']}
chains={
 'south_north_bypass':['799492317','615270676','615270691','615270694','1043769287','799492323'],
 'central_north_gate':['799492326','799492325','606838738','799492324','1043769289','702218809','787089819'],
 'neighbor_old_corridor':['522875739','799492316','467980114','467980113','1043769286','432522383','1043769285'],
}
for label,chain in chains.items():
  for a,b in zip(chain,chain[1:]):
    na=ways[a]['nodes']; nb=ways[b]['nodes']
    assert na[-1]==nb[0], (label,a,b,na[-1],nb[0])
for wid in ('615270676','615270691','615270694','1043769287','799492323','467980114','467980113','1043769286'):
  assert ways[wid]['tags'].get('oneway')=='yes'
assert '5818209495' in ways['615270691']['nodes']
assert '3504914294' in ways['702218809']['nodes']
assert '9620416636' in ways['467980114']['nodes']
assert nodes['5818209495']['tags'].get('name')=='ПВП 545 км'
assert nodes['365274796']['tags'].get('name')=='ПВП 545 км'
sc=json.loads((root/'directed-scenarios.json').read_text())['scenarios']
assert len(sc)>=6
assert all(x['productBinding'] in ('UNKNOWN','PARTIAL_HISTORICAL_ONLY') for x in sc if 'productBinding' in x)
print('M4_PVP545_GEOMETRY_PASS chains=3 gate_nodes=3 tariff_assignments=0')
