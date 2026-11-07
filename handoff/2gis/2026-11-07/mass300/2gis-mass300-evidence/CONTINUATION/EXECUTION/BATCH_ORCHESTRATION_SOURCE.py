import os,json,time,subprocess,sys,hashlib
from pathlib import Path
r=Path(__file__).resolve().parents[3];exp=r/'experiments/2gis-diagnostics';c=r/'2gis-mass300-evidence/CONTINUATION';out=c/'EXECUTION'
campaign_state=json.loads((out/'LIVE_STATE.json').read_text())
if campaign_state.get('status','').startswith('PAUSED_'):
 print('BLOCKED:campaign paused; no Routing call; requires genuine platform/preflight resolution, not automatic retry',flush=True);sys.exit(3)
assert os.environ.get('DGIS_HTTP_API_KEY')
assert hashlib.sha256((c/'MASS300_APPROVAL_MANIFEST.json').read_bytes()).hexdigest()=='eaeccffd2a4a0e9515026f5a8e9e552fa7014f2176994caa3a317c87c6fa499f'
num=int(sys.argv[1]);batch={'newIds':json.loads((out/'NEXT_APPROVED_QUEUE.json').read_text())[:25]} if num>1 else json.loads((c/f'BATCH_RESULTS/{num:02}.json').read_text());auths={x['ownerApproval']['windowIds'][0]:x for x in json.loads((out/'OWNER_APPROVALS.json').read_text())};candidates={x['id']:x for x in json.loads((c/'MASS300_CANDIDATES.json').read_text())};pm=json.loads((out/'PM_PREFLIGHT_LIVE.json').read_text())
start=time.time()
for ident in batch['newIds']:
 history=json.loads((exp/'.query-history.json').read_text())['attempts']
 if any(x['id']==ident for x in history):print('SKIP_ALREADY_RESERVED',ident,flush=True);continue
 new=[x for x in history if x['id'].startswith('MASS-CONT-')];assert len(new)<289
 last=max([0]+[__import__('datetime').datetime.fromisoformat(x['startedAt'].replace('Z','+00:00')).timestamp() for x in history if x.get('startedAt')]);delay=15.2-(time.time()-last)
 if delay>0:time.sleep(delay)
 now=__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat().replace('+00:00','Z')
 pre={'demoKey':True,'paidAccess':False,'checkedAt':pm['checkedAt'],'keyExpiresAt':'2026-12-03T00:00:00+03:00','termsCheckedAt':'2026-11-07T13:23:44.830074Z','remainingUnits':pm['conservativeRemaining']-(len(new)-pm.get('newReservedAtCheck',0)),'unitsPerRequest':1,'termsReference':'Existing checked terms; owner exactmanifest; transient in-memory processing only, no raw WKT/responses retained','quotaReference':f"Live Opera PM{pm['routingUsed']}/1000; DemoActive, monthlyBlocking, no activepaidplan; conservative{pm['conservativeRemaining']} less reservations since readback",'ownerApproval':auths[ident]['ownerApproval']}
 (exp/'preflight.local.json').write_text(json.dumps(pre,indent=2)+'\n');os.chmod(exp/'preflight.local.json',0o600)
 before=len(history)
 p=subprocess.run(['node',str(exp/'diagnose.mjs'),'--case',ident,'--execute'],cwd=r,env={**os.environ,'NODE_USE_ENV_PROXY':'1'},capture_output=True,text=True)
 hist=json.loads((exp/'.query-history.json').read_text())['attempts'];attempt=next((x for x in hist if x['id']==ident),None)
 if p.returncode:
  rec={'id':ident,'batch':num,'runnerExit':p.returncode,'status':attempt['status'] if attempt else 'BLOCKED_BEFORE_RESERVATION','reservedUnits':1 if attempt else 0,'error':'existing runner failed; no retry','safeMessage':p.stderr.strip()[:500]}
 else:
  rec=json.loads(p.stdout);rec.update(batch=num,reservedUnits=1,status=attempt['status'])
  scope=rec.get('routeScope',{}).get('status');typ=candidates[ident]['type']
  rec['evidenceAssessment']={'hypothesisType':typ,'directedScope':scope,'usefulForTariffComparison':scope=='SOURCE_CORRIDOR_SUPPORTED' and rec.get('routeBuildStatus')=='OK' and not rec.get('windowDistanceLimitExceeded',False),'paymentInterpretation':'route aggregate only; not independent tariff truth or individual PVP price','directionAndLaneLimit':'Source-direction support is conditional on geometry checks; no lane/operator product certification','nextAction':'Keep only scoped comparisons; discard price inference on mismatch/inconclusive.'}
 with (out/'LIVE_RESULTS.jsonl').open('a') as f:f.write(json.dumps(rec,ensure_ascii=False)+'\n');f.flush();os.fsync(f.fileno())
 state=json.loads((out/'LIVE_STATE.json').read_text());state.update(status='IN_PROGRESS' if not p.returncode else 'PAUSED_RUNNER_FAILURE',lastId=ident,newRoutingAttempts=sum(x['id'].startswith('MASS-CONT-') for x in hist),lastResult=rec.get('routeScope',{}).get('status'),batch=num);(out/'LIVE_STATE.json').write_text(json.dumps(state,indent=2)+'\n')
 print(json.dumps({'id':ident,'http':rec.get('httpStatus'),'status':rec.get('status'),'distanceM':rec.get('distanceM'),'scope':rec.get('routeScope',{}).get('status'),'aggregate':rec.get('routeAggregate'),'newReserved':state['newRoutingAttempts']}),flush=True)
 if p.returncode or rec.get('httpStatus') != 200 or rec.get('demoDistanceLimitExceeded'):print('STOP_NO_RETRY',flush=True);sys.exit(2)
print('BATCH_FINISHED',num,flush=True)
