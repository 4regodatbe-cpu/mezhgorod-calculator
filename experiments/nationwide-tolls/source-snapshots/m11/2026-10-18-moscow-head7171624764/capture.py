import urllib.request,urllib.error,json,time,hashlib,pathlib,datetime
b=pathlib.Path('experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-moscow-head7171624764');progress=[]
for name,url in [('node7171624764.osm','https://api.openstreetmap.org/api/0.6/node/7171624764'),('way502872285-full.osm','https://api.openstreetmap.org/api/0.6/way/502872285/full')]:
 t=time.monotonic();m={'url':url,'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durableStartedCommit':'e42a00eb23a4e1006a2a39924ac880da79ebb71b'}
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'IzAvB-source-audit/1.0'}),timeout=20)as r:
   raw=r.read(2000001)
   if len(raw)>2000000:raise ValueError('max body exceeded')
   (b/name).write_bytes(raw);m.update(status=r.status,bodyFile=name,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),contentType=r.headers.get('Content-Type'))
 except Exception as e:m.update(error=type(e).__name__+': '+str(e)[:250],status=getattr(e,'code',None))
 m['elapsedMs']=round((time.monotonic()-t)*1000);(b/(name+'.metadata.json')).write_text(json.dumps(m,indent=2)+'\n');progress.append(m);(b/'progress.json').write_text(json.dumps(progress,indent=2)+'\n');print(json.dumps(m),flush=True)
