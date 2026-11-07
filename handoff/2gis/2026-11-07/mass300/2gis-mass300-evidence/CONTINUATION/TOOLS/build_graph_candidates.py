from pathlib import Path
exec(open(Path(__file__).with_name('scan_primary.py')).read().split('inv=[];cand=[];reject=[]')[0])
import heapq,collections
R=Path('2gis-mass300-evidence/CONTINUATION');adj=collections.defaultdict(list);rev=collections.defaultdict(list)
allowed={'motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','unclassified','residential','service'}
for wid,w in W.items():
 t=w['tags']
 if t.get('highway') not in allowed or t.get('access') in ['no','private'] or t.get('motor_vehicle')=='no' or t.get('motorcar')=='no':continue
 ns=w['nodes'];dirs=[ns] if t.get('oneway')=='yes' else [list(reversed(ns))] if t.get('oneway')=='-1' else [ns,list(reversed(ns))]
 for ns in dirs:
  for a,b in zip(ns,ns[1:]):
   if a not in N or b not in N:continue
   d=dist(N[a]['coordinate'],N[b]['coordinate']);adj[a].append((b,d,wid));rev[b].append((a,d,wid))
def reach(g,graph,target=.35):
 q=[(0,g,[])];seen={}
 while q:
  d,n,path=heapq.heappop(q)
  if n in seen:continue
  seen[n]=d
  if d>=target:return path,d
  if d>1.5:continue
  for b,c,w in graph[n]:
   if b not in seen:heapq.heappush(q,(d+c,b,path+[(n,b,w)]))
 return [],None
turns=[]
for src in sources:
 p=Path(src['path']);raw=p.read_bytes();root=E.fromstring(gzip.decompress(raw) if p.suffix=='.gz' else raw)
 for rel in root.findall('relation'):
  ts={t.attrib['k']:t.attrib['v'] for t in rel.findall('tag')}
  if ts.get('type')=='restriction':turns.append({'tags':ts,'members':[m.attrib for m in rel.findall('member')]})
def checkturn(path):
 for a,b in zip(path,path[1:]):
  for r in turns:
   m=r['members'];via=[z['ref'] for z in m if z.get('role')=='via' and z.get('type')=='node'];fr=[z['ref'] for z in m if z.get('role')=='from'];to=[z['ref'] for z in m if z.get('role')=='to'];rule=r['tags'].get('restriction','')
   if a[1] in via and a[2] in fr and ((rule.startswith('no_') and b[2] in to) or (rule.startswith('only_') and b[2] not in to)):return False
 return True
inv=[];candidates=[];reject=[];cluster=[]
for gate,n in sorted(N.items()):
 if n['tags'].get('highway') not in ['toll_booth','toll_gantry'] and n['tags'].get('barrier')!='toll_booth':continue
 inc,_=reach(gate,rev);out,_=reach(gate,adj)
 inv.append({'id':gate,**n,'connectedIncomingEdges':len(rev[gate]),'connectedOutgoingEdges':len(adj[gate])})
 if not inc or not out:reject.append({'object':gate,'reason':'No350m reachable directed approach or departure in retained graph'});continue
 before=[(b,a,w) for a,b,w in reversed(inc)];cross=before+out
 if not checkturn(cross):reject.append({'object':gate,'reason':'Known no/only turn restriction'});continue
 # Co-located lanes with same travel heading are one hypothesis family.
 v=[N[out[-1][1]]['coordinate'][i]-n['coordinate'][i] for i in [0,1]];ang=math.atan2(v[1],v[0]);similar=False
 for cn,ca in cluster:
  if dist(cn,n['coordinate'])<.075 and abs(math.atan2(math.sin(ang-ca),math.cos(ang-ca)))<.55:similar=True;break
 if similar:reject.append({'object':gate,'reason':'Co-located lane, same travel orientation; redundant hypothesis'});continue
 cluster.append((n['coordinate'],ang))
 # Exclude touching gate itself for before/after controls.
 options=[('cross',cross),('before',before[:-1]),('after',out[1:])]
 for typ,path in options:
  if not path:continue
  ns=[path[0][0]]+[x[1] for x in path];coords=[N[k]['coordinate'] for k in ns];length=sum(dist(a,b) for a,b in zip(coords,coords[1:]));fp=tuple(round(v,7) for v in coords[0]+coords[-1])
  if fp in finger or length<.1 or length>30:reject.append({'object':gate,'type':typ,'reason':'Repeated/too short/overlong'});continue
  finger.add(fp);wid=[x[2] for x in path];viaway=any(any(m.get('role')=='via' and m.get('type')=='way' and m['ref'] in wid for m in r['members']) for r in turns)
  candidates.append({'id':f'MASS-CONT-{len(candidates)+1:04}','object':gate,'name':n['tags'].get('name'),'operator':n['tags'].get('operator'),'type':typ,'from':coords[0],'to':coords[-1],'orderedNodes':ns,'orderedWays':wid,'sourcePolylineLonLat':coords,'sourceLengthKm':length,'direction':'directed graph edge order','hypothesis':f'{typ}: selected route preserves the source-directed toll-boundary scope rather than another corridor','confirm':'Directed scope and source boundary inclusion/absence agree','refute':'Detour/other branch/forbidden turn','ambiguous':'No tariff inference or free-route claim','v3Effect':'Boundary recognition and false-charge control','preflight':{'directedConnectivity':True,'knownNodeTurnRestrictionsPass':True,'viaWayRestrictionsNeedReview':viaway,'possibleUnretainedRestrictions':True,'alternativeRouteScopeReview':'PENDING','status':'PARTIAL_REQUIRES_SCOPE_REVIEW'},'execution':'BLOCKED_BY_APPROVAL_AND_PREFLIGHT'})
for name,x in [('ROAD_OBJECT_INVENTORY.json',inv),('MASS300_CANDIDATES.json',candidates),('REJECTED_PREFLIGHT.json',reject),('SOURCE_SCAN.json',{'sources':sources,'failures':fail,'restrictionRelations':len(turns)}),('MASS300_APPROVED_WINDOWS.json',{'approved':[],'remainingCampaignBudget':289,'reason':'Exact new manifest not yet approved; provisional candidates not execution-ready'})]: (R/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
with (R/'MASS300_PRIORITY_MATRIX.csv').open('w') as f:
 wr=csv.writer(f);wr.writerow(['id','object','type','sourceLengthKm','priority','status'])
 for c in candidates:wr.writerow([c['id'],c['object'],c['type'],c['sourceLengthKm'],'MEDIUM_PENDING_SCOPE_REVIEW',c['execution']])
print({'sources':len(sources),'objects':len(inv),'hypotheses':len(candidates),'rejectedDesigns':len(reject),'restrictions':len(turns)})
