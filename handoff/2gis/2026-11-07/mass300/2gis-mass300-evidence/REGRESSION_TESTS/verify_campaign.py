from pathlib import Path
import json,csv,math,unittest,xml.etree.ElementTree as E
R=Path(__file__).resolve().parents[1]
def read(p):return json.loads((R/p).read_text())
P=read('CAMPAIGN_PLAN.json');H=read('HYPOTHESES.json')
class Campaign(unittest.TestCase):
 def test_budget_and_all_slots(self):
  self.assertEqual(P['budgetUnits'],300);self.assertEqual(len(P['plan']),300);self.assertEqual(len({x['id'] for x in P['plan']}),300)
  self.assertEqual(sum(x['slotBudget'] for x in P['plan']),300)
  for i in range(1,13):self.assertEqual(len(read(f'BATCH_RESULTS/{i:02}.json')['ids']),25)
 def test_execution_and_independent_quota_accounting(self):
  self.assertEqual(P['httpAttempts'],11);self.assertEqual(P['reservedUnits'],11);self.assertLessEqual(P['reservedUnits'],300)
  lines=[json.loads(x) for x in (R/'REQUEST_RESULTS.jsonl').read_text().splitlines()];self.assertEqual(len(lines),11);self.assertEqual(len({x['id'] for x in lines}),11)
  self.assertTrue(all(x['summary']['httpStatus']==200 and x['summary']['routeBuildStatus']=='OK' for x in lines))
  times=sorted((x['startedAt'],x['completedAt']) for x in lines)
  from datetime import datetime
  for a,b in zip(times,times[1:]):self.assertGreaterEqual((datetime.fromisoformat(b[0].replace('Z','+00:00'))-datetime.fromisoformat(a[1].replace('Z','+00:00'))).total_seconds(),15)
  q=read('QUOTA_RECONCILIATION.json');self.assertEqual(q['observedIncrease'],q['lastObservedUsed']-q['initialUsed']);self.assertEqual(q['reservedUnits'],q['observedIncrease']+q['pendingUnreflectedUnits']);self.assertEqual(q['conservativeRemaining'],q['initialRemaining']-11)
  self.assertEqual(len(read('PAYMENT_OBSERVATIONS.json')),11);self.assertEqual(len(read('PHYSICAL_BOUNDARIES.json')),2)
  with (R/'REQUEST_LEDGER.csv').open() as f:rows=list(csv.DictReader(f))
  self.assertEqual(len(rows),300);self.assertEqual(sum(int(x['reservedUnits']) for x in rows),11)
 def test_no_old_exact_window_replay(self):
  def fp(pts):return tuple(round(v,7) for p in pts for v in p)
  old=set()
  for a in read('SOURCES/prior-history.json')['attempts']:
   pts=a.get('requestParameters',{}).get('points',[])
   if len(pts)==2:old.add(fp([[p['lon'],p['lat']] for p in pts]))
  old.add(fp([[37.1996241,56.0900701],[37.214862,56.0915116]]))
  new=[fp([x['fromPoint'],x['toPoint']]) for x in H]
  self.assertEqual(len(new),len(set(new)));self.assertFalse(old&set(new))
 def test_direction_and_source_edges(self):
  edges=set();coords={}
  for g in ['C','F']:
   x=read(f'SOURCES/{g}-directed-index.json')
   for n,v in x['nodes'].items():coords[n]=v['coordinate']
   for w in x['ways'].values():
    if w['tags'].get('oneway')=='yes':edges.update(zip(map(str,w['nodes']),map(str,w['nodes'][1:])))
  for p in (R/'SOURCES').glob('*.osm'):
   t=E.parse(p).getroot()
   for n in t.findall('node'):coords[n.attrib['id']]=[float(n.attrib['lon']),float(n.attrib['lat'])]
   for w in t.findall('way'):
    tags={t.attrib['k']:t.attrib['v'] for t in w.findall('tag')};ns=[n.attrib['ref'] for n in w.findall('nd')]
    if tags.get('oneway')=='yes':edges.update(zip(ns,ns[1:]))
  for x in H:
   ns=x['orderedNodeIds'];self.assertTrue(all(e in edges for e in zip(ns,ns[1:])),x['id'])
   self.assertEqual(x['sourcePolylineLonLat'],[coords[n] for n in ns]);self.assertEqual(x['fromPoint'],coords[ns[0]]);self.assertEqual(x['toPoint'],coords[ns[-1]])
 def test_length_and_hypothesis_scope(self):
  for x in H:
   length=0
   for a,b in zip(x['sourcePolylineLonLat'],x['sourcePolylineLonLat'][1:]):
    l1,p1,l2,p2=map(math.radians,[*a,*b]);q=math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin((l2-l1)/2)**2;length+=6371*2*math.asin(min(1,math.sqrt(q)))
   self.assertAlmostEqual(length,x['sourceLengthKm'],places=4);self.assertLess(length,35);self.assertLess(x['maxResponseKm'],50)
   for k in ['hypothesis','confirm','refute','ambiguous','v3Effect','direction']:self.assertTrue(x[k])
   self.assertEqual(x['status'],'HTTP200_ROUTE_OK')
 def test_unallocated_not_approved(self):
  self.assertEqual(len(H),11);self.assertEqual(sum(x['status']=='UNALLOCATED_NO_VALIDATED_HYPOTHESIS' for x in P['plan']),289)
  self.assertEqual(read('APPROVAL_MANIFEST.json')['maximumUnits'],11)
if __name__=='__main__':unittest.main(verbosity=2)
