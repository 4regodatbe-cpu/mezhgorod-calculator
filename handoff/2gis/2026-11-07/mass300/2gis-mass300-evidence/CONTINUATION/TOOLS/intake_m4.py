from pathlib import Path
import json,time,urllib.request,urllib.error,hashlib,xml.etree.ElementTree as E
R=Path('2gis-mass300-evidence/CONTINUATION/PRIMARY_INTAKE');R.mkdir(parents=True,exist_ok=True)
xs=json.load(open('data/m4-pvp-osm-partial.json'))['verifiedNamedPlazas'];records=[]
for p in xs:
 coords=[(n['lon'],n['lat']) for n in p['laneNodes']];lon=sum(c[0] for c in coords)/len(coords);lat=sum(c[1] for c in coords)/len(coords);bbox=[min(c[0] for c in coords)-.004,min(c[1] for c in coords)-.004,max(c[0] for c in coords)+.004,max(c[1] for c in coords)+.004];url='https://api.openstreetmap.org/api/0.6/map?bbox='+','.join(f'{v:.7f}' for v in bbox)
 dest=R/f'm4-{p["km"]}.osm';meta={'road':'M4','km':p['km'],'url':url,'attemptedAt':time.time()}
 if dest.exists() or dest.with_suffix('.metadata.json').exists():continue
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'IzAvB-road-evidence-research/1.0'})
  with urllib.request.urlopen(req,timeout=20) as r:raw=r.read();meta['status']=r.status
  t=E.fromstring(raw)
  for n in t.iter():
   for k in ['user','uid','changeset','timestamp']:n.attrib.pop(k,None)
  clean=E.tostring(t,encoding='utf-8',xml_declaration=True);dest.write_bytes(clean);meta.update(sourceSha256=hashlib.sha256(raw).hexdigest(),sanitizedSha256=hashlib.sha256(clean).hexdigest(),bytes=len(clean),sourceContributorFieldsRemoved=True)
 except Exception as e:meta.update(status=getattr(e,'code',None),error=type(e).__name__)
 (dest.with_suffix('.metadata.json')).write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n');records.append(meta);print(json.dumps({'km':p['km'],'status':meta.get('status'),'error':meta.get('error')},ensure_ascii=False),flush=True)
 if meta.get('status') in [403,429]:break
 time.sleep(1)
(R/'summary.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
