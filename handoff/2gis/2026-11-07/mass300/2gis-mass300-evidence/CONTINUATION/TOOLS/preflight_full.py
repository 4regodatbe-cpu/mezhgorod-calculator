from pathlib import Path
exec(open(Path(__file__).with_name('build_graph_candidates.py')).read().split('inv=[];candidates=[];reject=[];cluster=[]')[0])
import re,collections
R=Path('2gis-mass300-evidence/CONTINUATION');draft=json.load(open(R/'MASS300_CANDIDATES.json'));rawdraft=draft
(R/'GENERATED_DRAFTS.json').write_text(json.dumps(draft,ensure_ascii=False,indent=2)+'\n')
known=json.load(open('data/m4-pvp-osm-partial.json'));m4ids={str(n['osmNodeId']) for p in known['verifiedNamedPlazas'] for n in p['laneNodes']}
forbidden=collections.defaultdict(list)
for r in turns:
 ms=r['members'];via=[m['ref'] for m in ms if m.get('role')=='via' and m.get('type')=='node'];fr=[m['ref'] for m in ms if m.get('role')=='from'];to=[m['ref'] for m in ms if m.get('role')=='to']
 for n in via:
  for f in fr:forbidden[(n,f)].append((r['tags'].get('restriction',''),set(to)))
def legal(n,prev,w):
 if prev is None:return True
 return all(not ((r.startswith('no_') and w in tos) or (r.startswith('only_') and w not in tos)) for r,tos in forbidden.get((n,prev),[]))
def route(a,b,prev,finalway,cap=3):
 q=[(0,a,prev,[])];seen=set()
 while q:
  d,n,p,path=heapq.heappop(q)
  if (n,p) in seen:continue
  seen.add((n,p))
  if d>cap:continue
  if n==b and legal(n,p,finalway):return path,d
  for v,c,w in adj[n]:
   if legal(n,p,w) and (v,w) not in seen:heapq.heappush(q,(d+c,v,w,path+[(n,v,w)]))
 return None,None
def road(case):
 if 'Новое качество дорог' in str(case.get('operator','')) or 'Одинцов' in str(case.get('name','')):return 'odintsovo'
 tags=[W[w]['tags'] for w in case['orderedWays']];ss=' '.join(t.get('ref','')+' '+t.get('name','')+' '+t.get('short_name','') for t in tags)+' '+str(case.get('name',''))
 if 'Дальний западный обход' in ss or 'ДЗОК' in ss:return'dzok'
 for code in ['289','12','11','4','3','1']:
  if re.search(r'(?:М|M|А|A)[-– ]?'+code+r'(?!\d)',ss):return'a289' if code=='289' else'm'+code
 for key,val in [('Восток','m12'),('Нева','m11'),('«Дон»','m4'),('Центральная кольцевая','ckad'),('А-113','ckad'),('Западный скоростной','zsd'),('ЗСД','zsd'),('Северный обход Одинцова','odintsovo')]:
  if key in ss:return val
 if case['object'] in m4ids or case['object']=='5818209495':return'm4'
 if case['object']=='6761599487':return'dzok'
 # Follow actual graph connectivity to named road edges, never kilometre proximity.
 q=[(0,case['object'])];seen=set();refs=set()
 while q:
  d,n=heapq.heappop(q)
  if n in seen or d>2:continue
  seen.add(n)
  for v,c,w in adj[n]+rev[n]:
   text=' '.join(W[w]['tags'].get(k,'') for k in ['ref','name','short_name'])
   if 'Одинцов' in text:refs.add('odintsovo')
   elif 'ДЗОК' in text or 'Дальний западный обход' in text:refs.add('dzok')
   elif 'ЗСД' in text or 'Западный скоростной' in text:refs.add('zsd')
   else:
    for code in ['289','113','12','11','4','3','1']:
     if re.search(r'(?:М|M|А|A)[-– ]?'+code+r'(?!\d)',text):refs.add('a289' if code=='289' else'ckad' if code=='113' else'm'+code)
   if v not in seen:heapq.heappush(q,(d+c,v))
 if refs:return '+'.join(sorted(refs))
 return'UNRESOLVED'
# Already useful non-mismatch hypothesis families must not be repeated under shifted endpoints.
oldcases=json.load(open('2gis-mass300-evidence/HYPOTHESES.json'));oldfam=[]
for c in oldcases:
 if c.get('result',{}).get('geometryStatus')=='EXTRA_ROUTING_SCOPE_NOT_COMPARABLE':continue
 if ':' not in c['object']:continue
 g=c['object'].split(':')[-1]
 if g not in N:continue
 v=[c['toPoint'][i]-c['fromPoint'][i] for i in [0,1]];oldfam.append((N[g]['coordinate'],math.atan2(v[1],v[0]),c['type'],c['id']))
accepted=[];rejected=[];finger_new=set(finger)
for c in draft:
 ns=c['orderedNodes'];ws=c['orderedWays'];coords=c['sourcePolylineLonLat'];reasons=[];rd=road(c)
 if rd=='UNRESOLVED':reasons.append('Road/operator scope unresolved by retained named/ref geometry')
 if len(set(ns))!=len(ns):reasons.append('Planned walk repeats nodes; possible loop')
 if c['preflight']['viaWayRestrictionsNeedReview']:reasons.append('Via-way restriction unresolved')
 for n in ns:
  if N[n]['tags'].get('access') in ['no','private'] or N[n]['tags'].get('motor_vehicle') in ['no','private'] or N[n]['tags'].get('barrier') in ['bollard','block','cycle_barrier']:reasons.append('Node access/barrier prohibits car passage');break
 for w in set(ws):
  if W[w]['tags'].get('oneway') in ['reversible','alternating','tidal']:reasons.append('Reversible direction not established for requested time');break
  if W[w]['tags'].get('vehicle') in ['no','private'] or W[w]['tags'].get('motor_vehicle') in ['private','agricultural','forestry','delivery']:reasons.append('Vehicle access restricted');break
  if any(':conditional' in k for k in W[w]['tags']):reasons.append('Conditional access/direction needs temporal review');break
 # Use interior source-edge points, explicitly derived from real OSM segments.
 eligible=[i for i in range(len(ns)-1) if dist(coords[i],coords[i+1])>=.015]
 if not eligible:reasons.append('No sufficiently long source edge for unambiguous interior endpoints')
 if reasons:rejected.append({'id':c['id'],'object':c['object'],'reasons':reasons});continue
 l=eligible[0];r=eligible[-1]
 single=l==r and c['type'] in ['before','after']
 if l>r or (l==r and not single):rejected.append({'id':c['id'],'object':c['object'],'reasons':['Insufficient separate source geometry']});continue
 if single:
  path=[];d=0;a=[.75*coords[l][i]+.25*coords[l+1][i] for i in [0,1]];b=[.25*coords[l][i]+.75*coords[l+1][i] for i in [0,1]];total=dist(a,b);planned=total;sourceLine=[a,b];actualEdges=[(ns[l],ns[l+1],ws[l])]
 else:
  path,d=route(ns[l+1],ns[r],ws[l],ws[r])
  if path is None:rejected.append({'id':c['id'],'object':c['object'],'reasons':['No legal directed path under3km between interior endpoint edges']});continue
  a=[(coords[l][i]+coords[l+1][i])/2 for i in [0,1]];b=[(coords[r][i]+coords[r+1][i])/2 for i in [0,1]]
  total=dist(a,coords[l+1])+d+dist(coords[r],b);planned=dist(a,coords[l+1])+sum(dist(coords[i],coords[i+1]) for i in range(l+1,r))+dist(coords[r],b);sourceLine=[a]+coords[l+1:r+1]+[b];actualEdges=[(ns[l],ns[l+1],ws[l])]+path+[(ns[r],ns[r+1],ws[r])]
 # Validate the selected alternative path as well as the intended source path.
 bad=False
 for aa,bb,ww in actualEdges:
  ts=W[ww]['tags']
  if ts.get('oneway') in ['reversible','alternating','tidal'] or any(':conditional' in k for k in ts) or ts.get('access') in ['no','private'] or ts.get('vehicle') in ['no','private'] or ts.get('motor_vehicle') in ['no','private','agricultural','forestry','delivery']:bad=True
  for nn in [aa,bb]:
   tt=N[nn]['tags']
   if tt.get('access') in ['no','private'] or tt.get('motor_vehicle') in ['no','private'] or tt.get('barrier') in ['bollard','block','cycle_barrier'] or any(':conditional' in k for k in tt):bad=True
 for rr in turns:
  if any(':conditional' in k for k in rr['tags']) and any(m.get('role')=='via' and m.get('type')=='node' and m['ref'] in {n for e in actualEdges for n in e[:2]} for m in rr['members']):bad=True
 if bad:rejected.append({'id':c['id'],'object':c['object'],'reasons':['Selected graph path has access/conditional constraint']});continue
 if total<.1 or total>3:rejected.append({'id':c['id'],'object':c['object'],'reasons':['Verified network window too short or over3km margin']});continue
 if total<planned*.7:rejected.append({'id':c['id'],'object':c['object'],'reasons':['Known substantially shorter alternative changes intended boundary scope']});continue
 angle=math.atan2(b[1]-a[1],b[0]-a[0]);oldmatch=[id for xy,ang,t,id in oldfam if t==c['type'] and dist(xy,N[c['object']]['coordinate'])<.075 and abs(math.atan2(math.sin(angle-ang),math.cos(angle-ang)))<.55]
 if oldmatch:rejected.append({'id':c['id'],'object':c['object'],'reasons':['Already successfully tested same boundary/control family; point shift is low value'],'priorIds':oldmatch});continue
 if c['type']=='cross' and c['object'] in {'5818209495','8087316064','8087316065','13377945035','13377945036','13020687195'}:rejected.append({'id':c['id'],'object':c['object'],'reasons':['Protected previous crossing family (success or outcome_unknown); endpoint shift does not justify repeat']});continue
 fp=tuple(round(v,7) for v in a+b)
 if fp in finger_new:rejected.append({'id':c['id'],'object':c['object'],'reasons':['Duplicate endpoint pair']});continue
 finger_new.add(fp)
 c.update(id='MASS-CONT-'+hashlib.sha256(json.dumps([c['object'],c['type'],a,b]).encode()).hexdigest()[:12],roadId=rd,**{'from':a,'to':b},endpointDerivation={'kind':'interior midpoint of actual source segment,not guessed coordinates','fromEdge':[ns[l],ns[l+1]],'toEdge':[ns[r],ns[r+1]],'fromFraction':.25 if single else .5,'toFraction':.75 if single else .5},verifiedNetworkLengthKm=total,plannedNetworkLengthKm=planned,verifiedDirectedEdges=actualEdges,originalSourcePolylineLonLat=coords,sourcePolylineLonLat=sourceLine,sourceLengthKm=planned,sourceNodeCoordinates={n:N[n]['coordinate'] for n in set([ns[l],ns[l+1],ns[r],ns[r+1]]+[k for e in path for k in e[:2]])},preflight={'status':'PASS_LOCAL_DIRECTED_GRAPH','interiorEndpointsOnKnownRoad':True,'nodeTurnRestrictionsPass':True,'viaWayRestrictionUnresolved':False,'conditionalRestrictionsUnresolved':False,'knownAlternativeScopeMismatch':False,'networkMax3km':True,'limitations':'Current primary OSM graph,not guarantee of provider model. Full response scope must be checked; no exact lane/product/receipt conclusion.'},execution='BLOCKED_BY_APPROVAL',priority='HIGH' if set(rd.split('+'))&{'m12','m4'} else'MEDIUM',expectedUnits=1,requestParameters={'transport':'driving','route_mode':'fastest','output':'detailed','need_payment_info':True,'locale':'ru','alternative':0},tariffBasis='Latest retained official road-specific tariff; exact product unknown until physical scope and operator rules suffice. No amount guessed.')
 accepted.append(c)
accepted.sort(key=lambda c:(c['priority']!='HIGH',c['roadId'],c['object'],c['type']))
for name,obj in [('MASS300_CANDIDATES.json',accepted),('PREFLIGHT_REJECTIONS.json',rejected),('MASS300_APPROVED_WINDOWS.json',{'approved':[],'readyForSingleManifestApproval':[x['id'] for x in accepted[:289]],'reserve':[x['id'] for x in accepted[289:]],'maximumNewUnits':min(289,len(accepted)),'remainingCampaignBudget':289,'status':'BLOCKED_BY_APPROVAL'})]:
 (R/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print('PREFLIGHT',len(accepted),'PASS;',len(rejected),'rejected;',collections.Counter(c['roadId'] for c in accepted))
