#!/usr/bin/env python3
"""Offline source-data regression for the dated M-11 15–58 Cat-I matrices."""
import csv, json, sys
from datetime import datetime, timezone
from pathlib import Path
root=Path(__file__).resolve().parents[1]
historical=json.loads((root/'sources/2026-04-24-15-58-category1.json').read_text())
current=json.loads((root/'sources/2026-11-02-15-58-category1.json').read_text())
assert historical['systemId']==current['systemId']=='m11-15-58-ossp'
assert historical['sectionKm']==current['sectionKm']=={'from':15,'to':58}
assert current['effectiveFrom']=='2026-11-02T01:00:00+03:00'
assert current['extraction']['routePairCount']==42 and current['extraction']['cellCount']==210
assert current['holidayProfileOverrides2026']['2026-11-03']=='fri'
assert current['holidayProfileOverrides2026']['2026-11-04']=='sat'
profiles=('night','monThu','fri','sat','sun')
changes=[]; cells=0
for origin,dests in historical['tariffs'].items():
  assert origin in current['tariffs']
  for destination,old_profiles in dests.items():
    assert destination in current['tariffs'][origin]
    for profile in profiles:
      cells+=1
      old=old_profiles[profile]; new=current['tariffs'][origin][destination][profile]
      if old!=new: changes.append((origin,destination,profile,old,new))
assert cells==210, cells
assert len(changes)==60, len(changes)
assert historical['tariffs']['moscow']['solnechnogorsk']['night']==880
assert current['tariffs']['moscow']['solnechnogorsk']['night']==850
assert historical['tariffs']['moscow']['solnechnogorsk']['fri']==1650
assert current['tariffs']['moscow']['solnechnogorsk']['fri']==1500
# The exclusive old/new edition boundary: prior instant is old; exact effective instant is new.
effective=datetime.fromisoformat(current['effectiveFrom'])
assert datetime.fromisoformat('2026-11-02T00:59:00+03:00')<effective
assert datetime.fromisoformat('2026-11-02T01:00:00+03:00')==effective
def selected(instant): return current if instant>=effective else historical
assert selected(datetime.fromisoformat('2026-11-02T00:59:59+03:00')) is historical
assert selected(datetime.fromisoformat('2026-11-02T01:00:00+03:00')) is current
assert selected(datetime.fromisoformat('2026-11-02T01:00:01+03:00')) is current
out=root/'evidence/changed-60-cells.csv'
with out.open('w',newline='') as f:
  w=csv.writer(f); w.writerow(['from','to','profile','april_rub','november_rub'])
  w.writerows(changes)
print(f'M11_SOURCE_MATRIX_PASS pairs=42 cells={cells} changed={len(changes)} boundary={effective.isoformat()} special_days=2')
