from pathlib import Path
import json,gzip,xml.etree.ElementTree as E,hashlib,math,csv
R=Path('2gis-mass300-evidence/CONTINUATION');N={};W={};sources=[];fail=[]
paths=list(Path('2gis-mass300-evidence/CONTINUATION/PRIMARY_INTAKE').glob('*.osm'))+list(Path('2gis-mass300-evidence/CONTINUATION/PRIMARY_INTAKE_OTHER').glob('*.osm'))+list(Path('2gis-mass300-evidence/CONTINUATION/PRIMARY_INTAKE_EXPANDED').glob('*.osm'))
for p in paths:
 if p.stat().st_size>12000000:continue
 try:
  b=p.read_bytes();t=E.fromstring(gzip.decompress(b) if p.suffix=='.gz' else b)
  for n in t.findall('node'):
   tags={x.attrib['k']:x.attrib['v'] for x in n.findall('tag')}
   if 'lat' in n.attrib:N[n.attrib['id']]={'coordinate':[float(n.attrib['lon']),float(n.attrib['lat'])],'tags':tags,'source':str(p)}
  for w in t.findall('way'):W[w.attrib['id']]={'nodes':[n.attrib['ref'] for n in w.findall('nd')],'tags':{x.attrib['k']:x.attrib['v'] for x in w.findall('tag')},'source':str(p)}
  sources.append({'path':str(p),'sha256':hashlib.sha256(b).hexdigest()})
 except Exception as e:fail.append({'path':str(p),'error':type(e).__name__})
def dist(a,b):
 l1,p1,l2,p2=map(math.radians,a+b);return 12742*math.asin(min(1,math.sqrt(math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin((l2-l1)/2)**2)))
old=json.load(open('2gis-final-api-sprint/HISTORY_SANITIZED.json'))['attempts'];old+=json.loads(Path('2gis-mass300-evidence/REQUEST_RESULTS.jsonl').read_text().splitlines()[0]) .get('attempts',[])
finger=set()
for a in old:
 ps=a.get('requestParameters',{}).get('points',[])
 if len(ps)==2:finger.add(tuple(round(v,7) for p in ps for v in [p['lon'],p['lat']]))
for line in Path('2gis-mass300-evidence/REQUEST_RESULTS.jsonl').read_text().splitlines():
 ps=json.loads(line)['requestParameters']['points'];finger.add(tuple(round(v,7) for p in ps for v in [p['lon'],p['lat']]))
inv=[];cand=[];reject=[]
for id,n in N.items():
 if n['tags'].get('highway') not in ['toll_booth','toll_gantry'] and n['tags'].get('barrier')!='toll_booth':continue
 ways=[(wid,w) for wid,w in W.items() if id in w['nodes']];inv.append({'id':id,**n,'ways':[wid for wid,w in ways],'roadRefs':sorted({w['tags'].get('ref','UNKNOWN') for wid,w in ways}),'operator':n['tags'].get('operator'),'tariffEdition':'requires road-specific official registry join','status':'SOURCE_INVENTORIED_NOT_PROVIDER_VERIFIED'})
 for wid,w in ways:
  ns=w['nodes'];i=ns.index(id)
  if w['tags'].get('oneway') not in ['yes','-1']:reject.append({'object':id,'way':wid,'reason':'direction not independently established'});continue
  if w['tags'].get('oneway')=='-1':ns=list(reversed(ns));i=ns.index(id)
  chain=ns[max(0,i-8):min(len(ns),i+9)]
  if i==0 or i==len(ns)-1 or not all(x in N for x in chain):reject.append({'object':id,'way':wid,'reason':'insufficient approach/departure node coordinates'});continue
  coords=[N[x]['coordinate'] for x in chain];length=sum(dist(a,b) for a,b in zip(coords,coords[1:]));fp=tuple(round(v,7) for v in coords[0]+coords[-1])
  if length<.1 or length>30 or fp in finger:reject.append({'object':id,'way':wid,'reason':'short/overlong/duplicate'});continue
  finger.add(fp);cand.append({'id':f'MASS-CONT-{len(cand)+1:04}','object':id,'way':wid,'roadRef':w['tags'].get('ref','UNKNOWN'),'from':coords[0],'to':coords[-1],'orderedNodes':chain,'sourcePolylineLonLat':coords,'sourceLengthKm':length,'hypothesis':'Directed selected route crosses this source toll boundary via the retained road rather than a neighboring branch','confirm':'Ordered source corridor and crossing supported without additional route scope','refute':'Other carriageway,detour or missed boundary','ambiguous':'No price/product inference','v3Effect':'Boundary recognition fixture only','source':w['source'],'preflight':'PARTIAL_LOCAL_ONEWAY_CHAIN','remainingChecks':['turn/access restrictions and competing corridors','current source revision conflicts','official road/product identity','exact manifest approval'],'execution':'BLOCKED_BY_APPROVAL_AND_PREFLIGHT'})
for name,x in [('ROAD_OBJECT_INVENTORY.json',inv),('MASS300_CANDIDATES.json',cand),('REJECTED_PREFLIGHT.json',reject),('SOURCE_SCAN.json',{'sources':sources,'failures':fail}),('MASS300_APPROVED_WINDOWS.json',{'approved':[],'reason':'Previous permission exact11 only; no new singleton consent fabricated','remainingCampaignBudget':289})]: (R/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
with (R/'MASS300_PRIORITY_MATRIX.csv').open('w') as f:
 wr=csv.writer(f);wr.writerow(['id','road','object','priority','status'])
 for c in cand:wr.writerow([c['id'],c['roadRef'],c['object'],'MEDIUM_PENDING_SCOPE_REVIEW',c['execution']])
print({'sourceFiles':len(sources),'objects':len(inv),'candidates':len(cand),'rejected':len(reject),'failures':len(fail)})
