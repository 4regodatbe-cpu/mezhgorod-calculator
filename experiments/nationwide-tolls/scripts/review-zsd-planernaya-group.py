"""Bounded offline evidence review; no component execution or provider calls."""
import gzip
import hashlib
import json
import math
import subprocess
import argparse
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('experiments/nationwide-tolls')
OLD = BASE / 'checks/2026-10-17-zsd-batch74'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output-dir', type=Path, default=BASE / 'checks/2026-10-17-zsd-planernaya-group9')
OUT = parser.parse_args().output_dir
if (OUT / 'summary.json').exists():
    raise SystemExit('Historical output already exists; use --output-dir with a new directory.')
FINGERPRINT = '0c0e778a8622dfc6a3f57032f70fd16bc29fa010f3785c0215b8bb7ffae9c6c4'
HEAD = '567090bf34db7ba9dc343469398d53682048bb48'
sha = lambda b: hashlib.sha256(b).hexdigest()
named = lambda e: any(n in ['ЗСД', 'Западный скоростной диаметр'] for n in e['roadNames'])

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def nearest(route, witness):
    # Local tangent plane segment projection; reported evidence only, never pricing.
    lon, lat = witness
    sx = 111320 * math.cos(math.radians(lat))
    sy = 111320
    best = (float('inf'), -1, float('inf'))
    for i, (a, b) in enumerate(zip(route, route[1:])):
        ax, ay = (a[0]-lon)*sx, (a[1]-lat)*sy
        bx, by = (b[0]-lon)*sx, (b[1]-lat)*sy
        dx, dy = bx-ax, by-ay
        length2 = dx*dx + dy*dy
        t = max(0, min(1, -(ax*dx+ay*dy)/length2)) if length2 else 0
        match = (math.hypot(ax+t*dx, ay+t*dy), i+t, math.sqrt(length2))
        if match < best:
            best = match
    return {'distanceMeters': round(best[0], 3), 'index': best[1], 'segmentMeters': round(best[2], 3)}

assert subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip() == 'fix/v3-missing-route-prices-2026-10-15'
summary = json.loads((OLD / 'summary.json').read_text())
ids = summary['physicalScopeGroups'][FINGERPRINT]
assert len(ids) == 9
hashes = {r['caseId']: r['sha256'] for r in summary['caseResults']}
snapshot_path = BASE / 'source-snapshots/zsd/2026-10-17-kad-ekateringofka/readiness.json'
snapshot = json.loads(snapshot_path.read_text())
assert all(sha(Path(p).read_bytes()) == h for p, h in summary['sourceHashes'].items())
identity_path = Path('docs/checkpoints/evidence/2026-10-16-zsd-planernaya-identity-proof.json')
identity = json.loads(identity_path.read_text())
elements = {}
for source in identity['sources']:
    raw = Path(source['path']).read_bytes()
    assert sha(raw) == source['sha256']
    for e in json.loads(raw)['elements']:
        elements[(e['type'], str(e['id']))] = e
chain = [elements[('way', w)] for w in ['721839717', '165031082', '252148968', '355755817']]
assert all(w['tags'].get('oneway') == 'yes' and w['tags'].get('toll') == 'yes' for w in chain)
assert all(a['nodes'][-1] == b['nodes'][0] for a, b in zip(chain, chain[1:]))
assert chain[-1]['nodes'][-1] == 1766158781
assert chain[1]['tags']['destination:street'] == 'Богатырский проспект;Планерная улица'
entry = [(n['lon'], n['lat']) for n in snapshot['entry']['witnesses']]
main = [(snapshot['gate'][k]['lon'], snapshot['gate'][k]['lat']) for k in ['before', 'gate', 'after']]
exit_nodes = [elements[('node', k)] for k in ['3612944330', '1766158781']]
witnesses = entry + main + [(n['lon'], n['lat']) for n in exit_nodes]
save(OUT / 'STARTED.json', {'sourceHead': HEAD, 'mode': 'short_offline_saved_evidence_review',
    'remotePersistence': 'pending_active_CI_39031962573', 'inputs': ids,
    'newComponentExecutions': 0, 'newRouteReplays': 0, 'newProviderCalls': 0})
results = []
for case_id in ids:
    old_path = OLD / 'cases' / (case_id + '.json')
    raw = old_path.read_bytes()
    assert sha(raw) == hashes[case_id]
    old = json.loads(raw)
    path = Path(old['capture'])
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(subprocess.check_output(['git', 'show', HEAD+':'+str(path)], timeout=30))
    capture_raw = path.read_bytes()
    assert sha(capture_raw) == old['actualCaptureSha256'] == old['expectedCaptureSha256']
    r = json.loads(gzip.decompress(capture_raw))['record']
    v = r['validation']
    ways = sorted(set(e['wayId'] for e in v['paidRoadEdges'] if named(e)))
    booths = [{k: b[k] for k in ['osmNodeId', 'wayId', 'edgeToll']}
              for b in v['tollBooths'] if named(b) or b['osmNodeId'] == '1766158781']
    fp = sha(json.dumps({'ways': ways, 'booths': booths}, ensure_ascii=False, separators=(',', ':')).encode())
    assert fp == FINGERPRINT
    assert v['complete'] and v['boothEventCoverage'] == 'complete'
    selected = [e['wayId'] for e in v['paidRoadEdges']]
    chain_indices = [selected.index(str(w['id'])) for w in chain]
    assert chain_indices == sorted(set(chain_indices))
    matches = [nearest(r['route']['coordinates'], w) for w in witnesses]
    assert all(m['distanceMeters'] <= 25 and m['segmentMeters'] <= 500 for m in matches)
    assert all(a['index'] < b['index'] for a, b in zip(matches, matches[1:]))
    assert snapshot['exit']['wayId'] not in selected
    assert len(booths) == 2 and all(b['edgeToll'] for b in booths)
    assert all(p['amount'] is None and p['reason'] == 'zsd_finished_vector_scope_not_reviewed' for p in old['profiles'])
    out = {'caseId': case_id, 'capture': str(path), 'captureSha256': sha(capture_raw),
        'priorResultPath': str(old_path), 'priorResultSha256': sha(raw), 'physicalScopeFingerprint': fp,
        'checked': True, 'mode': 'saved_evidence_boundary_exception_check', 'sourceHead': HEAD,
        'traceComplete': True, 'boothCoverage': 'complete', 'zsdWayCount': len(ways),
        'directedExitChainIndices': chain_indices, 'orderedEntryMainExitWitnesses': matches,
        'booths': booths, 'ekateringofkaExitAbsent': True, 'materialExceptionFound': False,
        'entry': 'KAD south, northbound', 'exit': 'northbound ramp to Bogatyrsky/Planernaya; plaza1766158781',
        'priorComponentProfiles': old['profiles'], 'newComponentExecutions': 0,
        'newFullRouteReplays': 0, 'newProviderCalls': 0,
        'outcome': 'blocked_by_missing_reliable_data', 'fareRub': None,
        'missing': 'Owner directional cash/card collection-zone bundle and any receipt credit at this finished entry/exit pair; general per-zone rates do not identify the payment bundle.'}
    save(OUT / 'cases' / (case_id+'.json'), out)
    results.append(out)
    save(OUT / 'progress.json', {'processed': len(results), 'total': 9, 'lastCase': case_id, 'sourceHead': HEAD})
save(OUT / 'summary.json', {'atUtc': datetime.now(timezone.utc).isoformat(), 'sourceHead': HEAD,
    'fingerprint': FINGERPRINT, 'representative': ids[0], 'representativeCases': 1,
    'exceptionCases': 8, 'checkedCases': 9, 'materialExceptions': 0,
    'pricedNewComponents': 0, 'remainingUnknownInGroup': 9, 'confirmedFullTripFares': 0,
    'reusedPriorComponentDateResults': 18, 'newComponentDateChecks': 0,
    'newFullRouteReplays': 0, 'newLiveRouteRequests': 0,
    'outcome': 'blocked_by_missing_reliable_data',
    'caseResults': [{'caseId': r['caseId'], 'sha256': sha((OUT/'cases'/(r['caseId']+'.json')).read_bytes())} for r in results],
    'limits': ['Boundary checks do not establish the cash/card collection bundle.',
               'Not a new tariff replay; the 18 prior component/date results are only reused with unchanged source hashes.',
               'The pre-existing 26 priced / 50 unknown baseline count remains unchanged.']})
print(json.dumps({'checkedCases': len(results), 'exceptions': 0, 'newPricedComponents': 0, 'outcome': 'blocked_by_missing_reliable_data'}))
