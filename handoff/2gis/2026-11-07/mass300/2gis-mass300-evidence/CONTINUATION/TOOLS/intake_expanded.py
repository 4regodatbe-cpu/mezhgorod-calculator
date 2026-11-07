from pathlib import Path
exec(open(Path(__file__).with_name('intake_m4.py')).read().split('xs=json.load')[0])
R=Path('2gis-mass300-evidence/CONTINUATION/PRIMARY_INTAKE_EXPANDED');R.mkdir(parents=True,exist_ok=True)
import re
spec=[]
prior=[]
for p in Path('2gis-mass300-evidence/CONTINUATION').glob('PRIMARY_INTAKE*/*.metadata.json'):
 x=json.loads(p.read_text());u=x.get('url','')
 if 'bbox=' in u and x.get('status')==200:
  z=list(map(float,u.split('bbox=')[-1].split(',')));prior.append(((z[0]+z[2])/2,(z[1]+z[3])/2))
for m in re.finditer(r'lat:\s*([0-9.]+),\s*lon:\s*([0-9.]+)',Path('lib/toll-engine/a289-engine.ts').read_text()+'\n'+Path('lib/toll-engine/m4-plaza-nodes.ts').read_text()):
 lat,lon=map(float,m.groups())
 if any(abs(lon-a)<.01 and abs(lat-b)<.01 for a,b in prior):continue
 if not any(abs(lon-a)<.01 and abs(lat-b)<.01 for _,a,b in spec):spec.append((f'anchor-{len(spec)+1}',lon,lat))
for a in json.load(open('data/tolls/m12-rvp-evidence-2026-09-30.json'))['anchors']:
 lon,lat=a['center']
 if not any(abs(lon-x)<.01 and abs(lat-y)<.01 for x,y in prior):spec.append(('m12-'+str(a['rvpKm']),lon,lat))
spec=spec[:30]
(R/'intake-plan.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n');print('bounded public OSM maps',len(spec),flush=True)
records=[]
for id,lon,lat in spec:
 url=f'https://api.openstreetmap.org/api/0.6/map?bbox={lon-.006:.7f},{lat-.006:.7f},{lon+.006:.7f},{lat+.006:.7f}';dest=R/(id+'.osm');meta={'object':id,'url':url,'attemptedAt':time.time()}
 if dest.exists() or dest.with_suffix('.metadata.json').exists():continue
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'IzAvB-road-evidence-research/1.0'}),timeout=20) as r:raw=r.read();meta['status']=r.status
  t=E.fromstring(raw)
  for n in t.iter():
   for k in ['user','uid','changeset','timestamp']:n.attrib.pop(k,None)
  clean=E.tostring(t,encoding='utf-8',xml_declaration=True);dest.write_bytes(clean);meta.update(sourceSha256=hashlib.sha256(raw).hexdigest(),sanitizedSha256=hashlib.sha256(clean).hexdigest(),bytes=len(clean))
 except Exception as e:meta.update(status=getattr(e,'code',None),error=type(e).__name__)
 dest.with_suffix('.metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n');records.append(meta);print(json.dumps({'object':id,'status':meta.get('status'),'error':meta.get('error')}),flush=True)
 if meta.get('status') in [403,429]:break
 time.sleep(1)
(R/'summary.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
