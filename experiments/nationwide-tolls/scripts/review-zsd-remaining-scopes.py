"""Review only nine untouched ZSD representatives and five reentry exceptions offline."""
import argparse
import gzip
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

SOURCE = '97d165fe4d071e68d2a30b341babc16fb1c2af56'
BASE = Path('experiments/nationwide-tolls')
OLD = BASE / 'checks/2026-10-17-zsd-batch74'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output-dir', type=Path, default=BASE / 'checks/2026-10-17-zsd-remaining-scopes')
OUT = parser.parse_args().output_dir
if (OUT / 'summary.json').exists():
    raise SystemExit('Historical output exists: use --output-dir with a new directory.')
sha = lambda b: hashlib.sha256(b).hexdigest()

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def decode_polyline(encoded):
    result, index, lat, lon = [], 0, 0, 0
    while index < len(encoded):
        deltas = []
        for _ in range(2):
            value, shift = 0, 0
            while True:
                byte = ord(encoded[index]) - 63
                index += 1
                value |= (byte & 31) << shift
                shift += 5
                if byte < 32:
                    break
            deltas.append(~(value >> 1) if value & 1 else value >> 1)
        lat += deltas[0]
        lon += deltas[1]
        result.append([lon / 1e6, lat / 1e6])
    return result

summary_raw = (OLD / 'summary.json').read_bytes()
old_summary = json.loads(summary_raw)
sealed_hashes = {r['caseId']: r['sha256'] for r in old_summary['caseResults']}
groups = [(fp, ids) for fp, ids in old_summary['physicalScopeGroups'].items()
          if not fp.startswith(('5538', '0c0e', '258e'))]
assert len(groups) == 9
assert sum(len(ids) for _, ids in groups) == 34
runtime_hashes = old_summary['sourceHashes']
assert all(sha(Path(p).read_bytes()) == h for p, h in runtime_hashes.items())
pattern = ['944399839', '493643653', '721839717', '165031082', '252148968', '355755817',
           '151490266', '355755820', '192140964', '784207300', '784207299', '355755821',
           '312063993', '192140957', '355755818', '191727240', '355755819', '721839718',
           '252148969', '233006897']
specs = {
    '1e954': ('КАД-север → КАД-юг, на юг', 'entry4–exit1', 'blocked_by_missing_reliable_data'),
    '3493': ('КАД-юг → КАД-север, OSRM, другая полоса северного ПВП', 'entry1–exit4', 'blocked_by_missing_reliable_data'),
    '3404': ('КАД-север → КАД-юг, OSRM, другая полоса северного ПВП', 'entry4–exit1', 'blocked_by_missing_reliable_data'),
    '2c00': ('Въезд со стороны проспекта Крузенштерна / Шкиперского протока → КАД-юг', 'entry2-plus-interchange–exit1', 'blocked_by_missing_reliable_data'),
    '5733': ('Приморский → съезд Богатырский/Планерная → городской разворот → ЗСД на юг → КАД-юг', 'multiple-traversals', 'deferred_route_policy_fix'),
    'e996': ('Благодатная, въезд на север → Богатырский/Планерная', 'entry2–exit3', 'blocked_by_missing_reliable_data'),
    '9494': ('Благодатная, въезд на север → КАД-север', 'entry2–exit4', 'blocked_by_missing_reliable_data'),
    '31bd': ('КАД-юг со стороны Петергофа/Таллинского → Богатырский/Планерная', 'entry1-west-approach–exit3', 'blocked_by_missing_reliable_data'),
    'd377': ('КАД-север → съезд Благодатная/Кубинская, на юг', 'entry4–exit2', 'blocked_by_missing_reliable_data'),
}
save(OUT / 'STARTED.json', {'sourceHead': SOURCE, 'mode': 'bounded_short_offline_evidence_review',
    'representatives': [ids[0] for _, ids in groups], 'reentrySiblings': 5,
    'priorSummarySha256': sha(summary_raw), 'newComponentChecks': 0, 'newProviderCalls': 0})
results, group_results = [], []
for fp, ids in groups:
    key = next(k for k in specs if fp.startswith(k))
    scope, zone_candidate, outcome = specs[key]
    targets = ids if key == '5733' else ids[:1]
    for case_id in targets:
        sealed_path = OLD / 'cases' / (case_id + '.json')
        sealed_raw = sealed_path.read_bytes()
        assert sha(sealed_raw) == sealed_hashes[case_id]
        prior = json.loads(sealed_raw)
        capture_path = Path(prior['capture'])
        if not capture_path.exists():
            capture_path.parent.mkdir(parents=True, exist_ok=True)
            capture_path.write_bytes(subprocess.check_output(['git', 'show', SOURCE+':'+str(capture_path)], timeout=30))
        raw = capture_path.read_bytes()
        assert sha(raw) == prior['actualCaptureSha256'] == prior['expectedCaptureSha256']
        capture = json.loads(gzip.decompress(raw))
        record, calls = capture['record'], capture['calls']
        validation, provider = record['validation'], record['provider']
        assert validation['complete'] and validation['boothEventCoverage'] == 'complete'
        assert all(p['amount'] is None for p in prior['profiles'])
        # Instructions must belong to the selected provider, not to a slower candidate.
        if provider == 'Valhalla':
            route = next(json.loads(c['text'])['trip'] for c in calls
                         if 'valhalla' in c['url'] and '/route?' in c['url'] and c['status'] == 200)
            meters = route['summary']['length'] * 1000
            decoded, instructions = [], []
            for leg in route['legs']:
                points = decode_polyline(leg['shape'])
                decoded.extend(points if not decoded else points[1:])
                instructions.extend(leg['maneuvers'])
            selected_steps = [x for i, x in enumerate(instructions)
                              if any('ЗСД' in n.get('instruction', '') for n in instructions[max(0,i-1):i+2])]
            selected_steps = [{k: x[k] for k in ['instruction', 'begin_shape_index', 'end_shape_index', 'length'] if k in x} for x in selected_steps]
        else:
            assert provider == 'OSRM'
            route = next(json.loads(c['text'])['routes'][0] for c in calls
                         if 'osrm' in c['url'] and c['status'] == 200)
            meters = route['distance']
            geometry = route['geometry']
            decoded = geometry['coordinates'] if isinstance(geometry, dict) else decode_polyline(geometry)
            steps = [x for leg in route['legs'] for x in leg['steps']]
            selected_steps = [{k: x[k] for k in ['name', 'destinations', 'maneuver', 'distance'] if k in x}
                              for i, x in enumerate(steps)
                              if any('ЗСД' in (n.get('name', '') + n.get('destinations', '')).upper()
                                     for n in steps[max(0,i-1):i+2])]
        assert abs(meters - record['route']['meters']) <= 1
        assert len(decoded) == len(record['route']['coordinates'])
        assert all(abs(a[0]-b[0]) < 1e-8 and abs(a[1]-b[1]) < 1e-8
                   for a, b in zip(decoded, record['route']['coordinates']))
        reentries, gantries = [], []
        for ci, call in enumerate(calls):
            if 'trace_attributes' not in call['url']:
                continue
            edges = json.loads(call['text']).get('edges', [])
            collapsed = []
            for e in edges:
                if not collapsed or collapsed[-1]['way_id'] != e['way_id']:
                    collapsed.append(e)
                if str(e.get('end_node', {}).get('node_id')) == '13020687195':
                    gantries.append({'captureCallIndex': ci, 'edge': e})
            ways = [str(e['way_id']) for e in collapsed]
            for start in range(len(ways)-len(pattern)+1):
                if ways[start:start+len(pattern)] == pattern:
                    motif = collapsed[start:start+len(pattern)]
                    assert all(not x['toll'] for x in motif[6:12])
                    assert all(x['toll'] for x in motif[:6]+motif[12:])
                    reentries.append({'captureCallIndex': ci, 'edges': motif})
        if key == '5733':
            assert reentries, case_id
        if key == '2c00':
            assert gantries and gantries[0]['edge']['way_id'] == 351741889
            assert gantries[0]['edge']['end_node']['type'] == 'toll_gantry'
        result = {'caseId': case_id, 'sourceHead': SOURCE, 'capture': str(capture_path),
            'captureSha256': sha(raw), 'priorResultPath': str(sealed_path), 'priorResultSha256': sha(sealed_raw),
            'fingerprint': fp, 'selectedProvider': provider, 'selectedProviderGeometryIdentity': 'exact',
            'coordinateCount': len(decoded), 'selectedProviderSteps': selected_steps,
            'traceComplete': True, 'boothCoverage': 'complete', 'recordedZsdBooths': prior['zsdBooths'],
            'scopeReview': scope, 'ownerZoneCandidateOnly': zone_candidate,
            'outcome': outcome, 'readyTariffRub': None, 'newPricedComponents': 0,
            'priorComponentProfiles': prior['profiles'], 'newComponentDateChecks': 0,
            'newLiveRouteRequests': 0, 'newFullRouteReplays': 0,
            'reentryProof': reentries, 'separateInterchangeGantryEvidence': gantries,
            'traceIndexLimit': 'Do not apply trace end_shape_index to input shape: matched trace indices differ. No such coordinate mapping used.',
            'missing': ('Route selection must enforce the no-reentry policy before any finished-vector binding; current amount remains unknown.'
                        if reentries else 'Primary directed cash/card collection bundle for these entry/exit boundaries; separate interchange fee where applicable.')}
        save(OUT / 'cases' / (case_id+'.json'), result)
        results.append(result)
        save(OUT / 'progress.json', {'processed': len(results), 'expectedUniqueCases': 14, 'lastCase': case_id})
    group_results.append({'fingerprint': fp, 'representative': ids[0], 'groupSize': len(ids),
        'checkedCases': len(targets), 'uncheckedSiblings': ids[len(targets):], 'scopeReview': scope,
        'outcome': outcome, 'readyTariffRub': None})
assert len(results) == 14 and len({r['caseId'] for r in results}) == 14
save(OUT / 'summary.json', {'atUtc': datetime.now(timezone.utc).isoformat(), 'sourceHead': SOURCE,
    'oldSummarySha256': sha(summary_raw), 'runtimeSourceHashes': runtime_hashes,
    'newRepresentativeReviews': 9, 'newSiblingExceptionChecks': 5, 'newUniqueCasesReviewed': 14,
    'selectedProviderGeometryIdentityChecks': 14, 'groups': group_results,
    'confirmedReentryCases': 6, 'sourceBlockedRepresentatives': 8,
    'cumulativeUnknownGroupsRepresented': 11, 'cumulativeBoundaryReviewedUniqueCases': 24,
    'unknownSiblingCasesNotBoundaryReviewed': 26,
    'newComponentDateChecks': 0, 'priorComponentProfilesReferenced': 28,
    'newLiveRouteRequests': 0, 'newFullRouteReplays': 0, 'newPricedComponents': 0,
    'confirmedFullTripFares': 0, 'baselinePricedZsdComponents': 26, 'baselineUnknownZsdComponents': 50,
    'caseResults': [{'caseId': r['caseId'], 'sha256': sha((OUT/'cases'/(r['caseId']+'.json')).read_bytes())} for r in results],
    'limits': ['Representative review is not a sibling check or new tariff execution.',
               'Provider geometry identity and recorded trace do not confirm payment bundle or price.',
               'Interchange gantry with toll=false is not proof that the interchange is free.']})
print(json.dumps({'representatives': 9, 'siblingExceptionChecks': 5, 'uniqueCases': 14,
                  'confirmedReentryCases': 6, 'newPricedComponents': 0}))
