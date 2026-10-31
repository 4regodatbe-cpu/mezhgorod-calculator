from pathlib import Path
import xml.etree.ElementTree as E,json,hashlib
base=Path('experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-exit');existing=Path('experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-entry/entry-local-map.osm');nodes={};ways={};sources=[]
for p in [existing,*[base/(x+'.osm')for x in ['1148492112','1148492111','791520971','620063414']]]:
 raw=p.read_bytes();sha=hashlib.sha256(raw).hexdigest();meta=json.loads(Path(str(p)+'.metadata.json').read_text());assert meta['sha256']==sha and meta['status']==200;sources.append({'path':str(p),'sha256':sha,'url':meta['url']})
 for e in E.fromstring(raw):
  if e.tag=='node':nodes[e.get('id')]=e
  if e.tag=='way':ways[e.get('id')]=e
ids=['1148492112','1148492111','791520971','620063414','476099617','620063413','1270188044','1270188043','1270188042','1270188041'];ordered=[];top=[]
for k in ids:
 w=ways[k];refs=[n.get('ref')for n in w.findall('nd')];tags={t.get('k'):t.get('v')for t in w.findall('tag')};assert tags['oneway']=='yes'
 if ordered:assert ordered[-1]==refs[0]
 ordered.extend(refs if not ordered else refs[1:]);top.append({'wayId':k,'firstNode':refs[0],'lastNode':refs[-1],'oneway':tags['oneway']})
assert ordered[0]=='9556466755' and '8087316064'in ordered
coords=[{'nodeId':k,'coordinate':[float(nodes[k].get('lon')),float(nodes[k].get('lat'))]}for k in ordered]
physical={'gateNodeId':'8087316064','gateWayId':'1270188041','strictJunction':coords[0],'orderedWayIds':ids,'sourceCorridor':coords}
(base/'directed-exit.json').write_text(json.dumps(physical,indent=2)+'\n');(base/'source-proof.json').write_text(json.dumps({'status':'DONE_PRIMARY_CHAIN','sources':sources,'directedWayConnectivity':top,'operatorIdentity':'Same PVP18 CKAD47 facility as retained official page5; direction-specific lane is primary mapped southbound exit, not the northbound entry.'},indent=2)+'\n')
print(json.dumps({'ways':len(ids),'corridorPoints':len(coords),'first':ordered[0],'last':ordered[-1]}))
