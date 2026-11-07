from pathlib import Path
import json,hashlib,datetime,collections,csv
r=Path(__file__).resolve().parents[1];o=r/'EXECUTION';load=lambda p:json.loads(p.read_text());m=load(r/'MASS300_APPROVAL_MANIFEST.json');c={x['id']:x for x in load(r/'MASS300_CANDIDATES.json')};a=load(o/'OWNER_APPROVALS.json');history=load(o/'CAMPAIGN_HISTORY.json')['attempts'];rows=[json.loads(l) for l in (o/'LIVE_RESULTS.jsonl').read_text().splitlines()]
assert hashlib.sha256((r/'MASS300_APPROVAL_MANIFEST.json').read_bytes()).hexdigest()=='eaeccffd2a4a0e9515026f5a8e9e552fa7014f2176994caa3a317c87c6fa499f'
assert len(rows)==44 and len({x['id'] for x in rows})==44
assert sum(x.get('httpStatus')==200 for x in rows)==43
assert rows[-1]['httpStatus']==429 and rows[-1]['id']=='MASS-CONT-748f1bd38810'
assert len(history)==len({x['id'] for x in history})
assert all(x['id'] in m['primaryQueueIds'] for x in rows)
scopes=collections.Counter(x.get('routeScope',{}).get('status') for x in rows);assert scopes=={'SOURCE_CORRIDOR_SUPPORTED':35,'ROUTE_SCOPE_MISMATCH':8,'INCONCLUSIVE':1}
new=[x for x in history if x['id'].startswith('MASS-CONT-')];assert len(new)==44
old=[x for x in history if x['id'].startswith('MASS-') and not x['id'].startswith('MASS-CONT-')];assert len(old)==11
assert any(x['id']=='ckad-m11-m12' and x['status']=='outcome_unknown' for x in history)
# No repeats by body across retained actual history; missing old pilot raw inputs remain explicit limitation.
bodies=[json.dumps(x['requestParameters'],sort_keys=True,separators=(',',':')) for x in history if x.get('requestParameters')];assert len(bodies)==len(set(bodies))
starts=sorted(datetime.datetime.fromisoformat(x['startedAt'].replace('Z','+00:00')) for x in new);assert min((b-a).total_seconds() for a,b in zip(starts,starts[1:]))>=15
for x in new:
 b=x['requestParameters'];assert b['points']==[{'type':'stop','lon':p[0],'lat':p[1]} for p in [c[x['id']]['from'],c[x['id']]['to']]]
 assert b['alternative']==0 and b['output']=='detailed' and b['need_payment_info'] is True
 ap=next(q['ownerApproval'] for q in a if q['ownerApproval']['windowIds']==[x['id']]);at=datetime.datetime.fromisoformat(ap['approvedAt'].replace('Z','+00:00'));st=datetime.datetime.fromisoformat(x['startedAt'].replace('Z','+00:00'));assert 0<=(st-at).total_seconds()<=86400
 assert x['expectedUnits']==1
for x in rows:assert x.get('perPvpPrice') is None and not x.get('demoDistanceLimitExceeded',False)
assert len({c[x['id']]['roadId'] for x in rows})==9
pairs=load(o/'CROSS_CONTROL_COMPARISONS.json');assert len(pairs)==8
for x in pairs:assert x['controlBoundaryDistanceM']>25 and x['sameAggregateValues']
skipped=load(o/'SKIPPED_WINDOWS.json');assert len(skipped)==13 and not {x['id'] for x in skipped}&{x['id'] for x in rows}
assert len(load(o/'NEXT_APPROVED_QUEUE.json'))==232
pm=load(o/'PM_PREFLIGHT_LIVE.json');assert pm['routingUsed']==65 and pm['conservativeRemaining']==930 and pm['unreconciledCampaignReserved']==5
print('LIVE_AUDIT_PASS:44unique attempts/43HTTP200/1HTTP429;35scoped/8mismatch/1inconclusive; exact approvals,bodies,no duplicates,>=15sec,old11/CKAD retained;8paired comparisons;55reserved/50observed/5unreconciled; no API calls in verifier.')
