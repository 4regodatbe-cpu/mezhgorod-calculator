#!/usr/bin/env python3
"""Verify the stored real M-4 path summary is a geometry positive, tariff unknown."""
import json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
e=json.loads((root/'evidence.json').read_text())
r=json.loads((root/'geometry/route-history-review.json').read_text())
assert r['caseId']=='pair-m4-a289-taman-to-voronezh'
assert r['captureSha256']=='db7ce8f0d256d7e2583644611c3a00adae58c5367735a146a4f9005867b9404a'
assert r['traceValidation']['complete'] and r['traceValidation']['chunkCount']==8 and r['traceValidation']['failedChunkCount']==0
h=r['reviewedFinalChunk']
assert h['gate']['nodeId']=='5818209495' and h['firstR298EdgeIndex']==71
case=e['routeExample']
assert case['candidateProductKeys']==['m4-545-a','m4-545-b']
assert case['confirmedChargedProducts']==[] and case['routeFareRub'] is None and case['pricingStatus']=='unknown'
assert hashlib.sha256((root/'geometry/route-capture.json.gz').read_bytes()).hexdigest()==r['captureSha256']
print('M4_SAVED_ROUTE_PASS directed_gate=5818209495 candidates=2 confirmed_products=0 fare=null')
