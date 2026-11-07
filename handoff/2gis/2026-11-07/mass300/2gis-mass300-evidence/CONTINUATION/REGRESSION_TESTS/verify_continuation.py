from pathlib import Path
import json,hashlib,math,xml.etree.ElementTree as E,csv,unittest
R=Path(__file__).resolve().parents[1]
def read(p):return json.loads((R/p).read_text())
C=read('MASS300_CANDIDATES.json');G=read('PREFLIGHT_GRAPH_PROOF.json');M=read('MASS300_APPROVAL_MANIFEST.json')
def dist(a,b):
 l1,p1,l2,p2=map(math.radians,a+b);return 12742*math.asin(min(1,math.sqrt(math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin((l2-l1)/2)**2)))
class Continuation(unittest.TestCase):
 def test_inventory_counts_and_scope(self):
  s=read('PREPARATION_STATS.json');self.assertEqual(len(C),293);self.assertEqual(len(read('GENERATED_DRAFTS.json')),339);self.assertEqual(len(read('PREFLIGHT_REJECTIONS.json')),46);self.assertEqual(len(read('ROAD_OBJECT_INVENTORY.json')),304);self.assertEqual(len({c['id'] for c in C}),293);self.assertEqual(len({c['roadId'] for c in C}),9);self.assertEqual(s['newRoutingCalls'],0)
 def test_draft_partition(self):
  drafts={x['id'] for x in read('GENERATED_DRAFTS.json')};passed={x['draftId'] for x in C};rejected={x['id'] for x in read('PREFLIGHT_REJECTIONS.json')};self.assertFalse(passed&rejected);self.assertEqual(passed|rejected,drafts)
 def test_budget_queue_and_reserve(self):
  p=read('CAMPAIGN_PLAN.json');self.assertEqual(p['campaignBudget'],300);self.assertEqual(p['priorReserved']+len(p['primaryPlan']),300);self.assertEqual(len(p['reserve']),4);self.assertEqual(len(read('MASS300_SELECTED_WINDOWS.json')),289)
  self.assertEqual(len(read('BATCH_RESULTS/01.json')['newIds']),14)
  for i in range(2,13):self.assertEqual(len(read(f'BATCH_RESULTS/{i:02}.json')['newIds']),25)
  with (R/'REQUEST_LEDGER.csv').open() as f:rows=list(csv.DictReader(f))
  self.assertEqual(len(rows),304);self.assertEqual(sum(int(x['httpAttempts']) for x in rows),11);self.assertEqual(sum(int(x['reservedUnits']) for x in rows),11)
 def test_directed_real_edges_and_interior_coordinates(self):
  for c in C:
   edges=c['verifiedDirectedEdges'];self.assertTrue(edges)
   for a,b,w in edges:
    way=G['ways'][w];ns=way['nodes'];pairs=set(zip(ns,ns[1:]));one=way['tags'].get('oneway');self.assertNotIn(one,['reversible','alternating','tidal'])
    if one=='-1':pairs={(b,a) for a,b in pairs}
    elif one not in ['yes','1','true']:pairs|={(b,a) for a,b in pairs}
    self.assertIn((a,b),pairs,c['id'])
   for a,b in zip(edges,edges[1:]):self.assertEqual(a[1],b[0],c['id'])
   d=c['endpointDerivation']
   for field,edge,fraction in [('from',d['fromEdge'],d['fromFraction']),('to',d['toEdge'],d['toFraction'])]:
    aa,bb=[G['nodes'][n]['coordinate'] for n in edge];expected=[(1-fraction)*aa[i]+fraction*bb[i] for i in [0,1]]
    for x,y in zip(c[field],expected):self.assertAlmostEqual(x,y,places=10)
   self.assertEqual(c['sourcePolylineLonLat'][0],c['from']);self.assertEqual(c['sourcePolylineLonLat'][-1],c['to'])
 def test_network_lengths_and_margin(self):
  for c in C:
   for point in [c['from'],c['to']]:self.assertTrue(-180<=point[0]<=180 and -90<=point[1]<=90)
   e=c['verifiedDirectedEdges'];lens=[dist(G['nodes'][a]['coordinate'],G['nodes'][b]['coordinate']) for a,b,w in e];d=c['endpointDerivation']
   length=dist(c['from'],c['to']) if len(e)==1 else dist(c['from'],G['nodes'][e[0][1]]['coordinate'])+sum(lens[1:-1])+dist(G['nodes'][e[-1][0]]['coordinate'],c['to'])
   self.assertAlmostEqual(length,c['verifiedNetworkLengthKm'],delta=.00000001);self.assertGreaterEqual(length,.1);self.assertLessEqual(length,3);self.assertLess(c['maxKm'],50)
   source=sum(dist(a,b) for a,b in zip(c['sourcePolylineLonLat'],c['sourcePolylineLonLat'][1:]));self.assertAlmostEqual(source,c['sourceLengthKm'],places=8);self.assertGreaterEqual(length+.000001,.7*source)
 def test_access_and_known_turn_constraints(self):
  for c in C:
   edges=c['verifiedDirectedEdges']
   for a,b,w in edges:
    tags=G['ways'][w]['tags'];self.assertNotIn(tags.get('access'),['no','private']);self.assertNotIn(tags.get('motor_vehicle'),['no','private','agricultural','forestry','delivery']);self.assertNotIn(tags.get('vehicle'),['no','private']);self.assertFalse(any(':conditional' in k for k in tags))
    for n in [a,b]:
     t=G['nodes'][n]['tags'];self.assertNotIn(t.get('access'),['no','private']);self.assertNotIn(t.get('motor_vehicle'),['no','private']);self.assertNotIn(t.get('barrier'),['bollard','block','cycle_barrier'])
   for rr in G['restrictionRelations'].values():
    viaways={m['ref'] for m in rr['members'] if m.get('role')=='via' and m.get('type')=='way'}
    self.assertFalse(viaways & {e[2] for e in edges},c['id'])
   for a,b in zip(edges,edges[1:]):
    for r in G['restrictionRelations'].values():
     ms=r['members'];via={m['ref'] for m in ms if m.get('role')=='via' and m.get('type')=='node'};fr={m['ref'] for m in ms if m.get('role')=='from'};to={m['ref'] for m in ms if m.get('role')=='to'};rule=r['tags'].get('restriction','')
     if a[1] in via and a[2] in fr:
      if rule.startswith('no_'):self.assertNotIn(b[2],to,c['id'])
      if rule.startswith('only_'):self.assertIn(b[2],to,c['id'])
 def test_exact_and_semantic_dedup(self):
  fp=lambda ps:tuple(round(v,7) for p in ps for v in p)
  old=set();prior=read('../SOURCES/prior-history.json')['attempts']
  prior +=[json.loads(x) for x in (R.parent/'REQUEST_RESULTS.jsonl').read_text().splitlines()]
  for x in prior:
   ps=x.get('requestParameters',{}).get('points',[])
   if len(ps)==2:old.add(fp([[p['lon'],p['lat']] for p in ps]))
  old.add(fp([[37.1996241,56.0900701],[37.214862,56.0915116]]));new=[fp([c['from'],c['to']]) for c in C];self.assertFalse(old&set(new));self.assertEqual(len(set(new)),len(C))
  forbidden={'5818209495','8087316064','8087316065','13377945035','13377945036','13020687195'};self.assertFalse(any(c['type']=='cross' and c['object'] in forbidden for c in C))
 def test_primary_provenance_and_redaction(self):
  count=0
  for p in R.glob('PRIMARY_INTAKE*/*.metadata.json'):
   m=json.loads(p.read_text());source=p.with_name(p.name.replace('.metadata.json','.osm'))
   if m.get('status')!=200:self.assertFalse(source.exists());continue
   count+=1;self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(),m['roadOnlySha256'])
   for node in E.parse(source).getroot().findall('node'):
    if node.attrib['id'] in G['nodes']:self.assertEqual(G['nodes'][node.attrib['id']]['coordinate'],[float(node.attrib['lon']),float(node.attrib['lat'])])
   for node in E.parse(source).getroot().iter():
    for field in ['user','uid','changeset','timestamp']:self.assertNotIn(field,node.attrib)
  self.assertEqual(count,62)
 def test_manifest_hash_and_no_new_approval(self):
  sha=hashlib.sha256((R/'MASS300_APPROVAL_MANIFEST.json').read_bytes()).hexdigest();self.assertEqual(sha,read('MASS300_APPROVED_WINDOWS.json')['pendingManifestSha256']);self.assertEqual(read('MASS300_APPROVED_WINDOWS.json')['newApproved'],[]);self.assertEqual(M['maximumNewUnits'],289);self.assertEqual(len(M['windows']),293)
  for c in C:
   self.assertEqual(c['execution'],'BLOCKED_BY_APPROVAL');self.assertEqual(c['preflight']['status'],'PASS_LOCAL_DIRECTED_GRAPH')
   digest=hashlib.sha256(json.dumps({'sourcePolylineLonLat':c['sourcePolylineLonLat'],'verifiedDirectedEdges':c['verifiedDirectedEdges']},sort_keys=True,separators=(',',':')).encode()).hexdigest();self.assertEqual(c['geometryProofSha256'],digest)
 def test_original_evidence_unchanged(self):
  manifest=read('../MANIFEST.json')
  for item in manifest['files']:self.assertEqual(hashlib.sha256((R.parent/item['path']).read_bytes()).hexdigest(),item['sha256'],item['path'])
if __name__=='__main__':unittest.main(verbosity=2)
