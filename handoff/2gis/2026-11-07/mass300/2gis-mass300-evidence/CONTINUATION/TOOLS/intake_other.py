from pathlib import Path
exec(open(Path(__file__).with_name('intake_m4.py')).read().split('xs=json.load')[0])
R=Path('2gis-mass300-evidence/CONTINUATION/PRIMARY_INTAKE_OTHER');R.mkdir(parents=True,exist_ok=True)
old=json.load(open('2gis-mass300-evidence/CONTINUATION/ROAD_OBJECT_INVENTORY.json'));spec=[]
for x in old:
 if 'PRIMARY_INTAKE' in x['source']:continue
 lon,lat=x['coordinate']
 if any(abs(lon-a)<.01 and abs(lat-b)<.01 for _,a,b in spec):continue
 spec.append((x['id'],lon,lat))
for g in json.load(open('experiments/nationwide-tolls/m1-m3-official-gates.json'))['gates']:
 if g.get('coordinateAnchor'):spec.append((g['id'],g['coordinateAnchor']['lon'],g['coordinateAnchor']['lat']))
for f in json.load(open('data/tolls/m11/2026-10-01-58-679-spatial-anchors.json'))['facilities']:
 for a in f['anchors']:
  lon,lat=a['lon'],a['lat']
  if not any(abs(lon-x)<.01 and abs(lat-y)<.01 for _,x,y in spec):spec.append((a['anchorId'],lon,lat))
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
