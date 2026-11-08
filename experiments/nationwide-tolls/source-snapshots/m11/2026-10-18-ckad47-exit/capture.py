import urllib.request,urllib.error,json,time,hashlib,pathlib,datetime
base=pathlib.Path('experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-exit');progress=[]
for way in ['1148492112','1148492111','791520971','620063414']:
 name=way+'.osm';url='https://api.openstreetmap.org/api/0.6/way/'+way+'/full';started=time.monotonic();m={'url':url,'durableStartedCommit':'98c3869fb7a7eeaf8c66076864ca37e7f8ea39c1','atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'IzAvB-source-audit/1.0'}),timeout=20)as r:
   raw=r.read(1000001)
   if len(raw)>1000000:raise ValueError('body limit exceeded')
   (base/name).write_bytes(raw);m.update(status=r.status,bodyFile=name,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
 except Exception as e:m.update(status=getattr(e,'code',None),error=type(e).__name__+': '+str(e)[:250])
 m['elapsedMs']=round((time.monotonic()-started)*1000);(base/(name+'.metadata.json')).write_text(json.dumps(m,indent=2)+'\n');progress.append(m);(base/'progress.json').write_text(json.dumps(progress,indent=2)+'\n');print(json.dumps(m),flush=True)
