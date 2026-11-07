#!/usr/bin/env python3
"""Offline assertions that tariff RVP labels are not auto-matched to exit km."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'sources-2026-10-08-matrix.json').read_text())
p=json.loads((root/'physical-tariff-mapping.json').read_text())
expected={281:522,314:205,392:510,420:311}
assert {x['tariffRvpKm']:x['rub'] for x in p['tariffRows']}==expected
order=m['pointOrder']; rows=m['directRowsByOrigin']
assert rows['gus_khrustalny_p132'][order.index('melenki')]==522
assert rows['melenki'][order.index('murom')]==205
assert rows['murom'][order.index('diveevo')]==510
assert rows['diveevo'][order.index('arzamas_p158')]==311
assert all(x['evidenceStatus']=='UNKNOWN' for x in p['unverifiedPhysicalLabels'])
assert all(x['bindingStatus']=='UNKNOWN' for x in p['physicalEvidence'])
anchors=json.loads((root/'sources/rvp-calibrated-anchors-2026-09-30.json').read_text())
assert {x['rvpKm'] for x in anchors['anchors'] if x['rvpKm'] in (281,314,392,420)}=={281,314,392,420}
interchanges={x['physicalKm']:x for x in p['physicalInterchanges']}
assert interchanges[442]['sourceStatus']=='OFFICIAL_PHYSICAL_INVENTORY'
assert interchanges[442]['tariffMapping'].startswith('UNKNOWN')
assert interchanges[287]['sourceStatus']=='UNKNOWN'
assert all(x['physicalKm']!=x['tariffRvpKm'] for x in json.loads((root/'regressions/expected-unknown-cases.json').read_text())['cases'][:4])
assert m['order']['number']==302 and m['effectiveFrom']=='2026-10-08T00:00:00+03:00'
print('M12_CROSSWALK_GUARD_PASS tariff_rows=4 physical_labels=4 auto_matches=0')
