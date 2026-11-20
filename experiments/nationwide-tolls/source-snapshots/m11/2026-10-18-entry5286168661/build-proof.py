from pathlib import Path
import xml.etree.ElementTree as E,collections,json,hashlib
base=Path('experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-entry5286168661');r=E.parse(base/'d512775be7772bd315e2.osm').getroot();nodes={n.attrib['id']:n for n in r.findall('node')};ways={w.attrib['id']:w for w in r.findall('way')};g=collections.defaultdict(list)
tags=lambda el:{x.attrib['k']:x.attrib['v'] for x in el.findall('tag')}
for wid,w in ways.items():
 ns=[x.attrib['ref'] for x in w.findall('nd')];t=tags(w)
 if 'highway'not in t:continue
 for a,b in zip(ns,ns[1:]):
  if t.get('oneway')!='-1':g[a].append((b,wid))
  if t.get('oneway')not in ['yes','1']:g[b].append((a,wid))
q=collections.deque([('5286168661',[])]);seen=set();path=None
while q and path is None:
 n,p=q.popleft()
 if n in seen:continue
 seen.add(n)
 for dst,wid in g[n]:
  t=tags(ways[wid]);nxt=p+[(n,dst,wid)]
  if t.get('toll')=='yes'and t.get('highway')=='motorway'and'11'in t.get('ref',''):path=nxt;break
  q.append((dst,nxt))
assert path
ids=['7153719524',path[0][0]]+[e[1]for e in path]
point=lambda i:{'osmNodeId':i,'coordinate':[float(nodes[i].attrib['lon']),float(nodes[i].attrib['lat'])]}
orderedWays=list(dict.fromkeys(e[2]for e in path));assert orderedWays==['766468434','766468433','547081894','496959520','1205158257'];assert all(tags(ways[i]).get('oneway')=='yes'for i in orderedWays)
physical={'schemaVersion':1,'gate':{'osmNodeId':'5286168661','wayId':'766468434','coordinate':point('5286168661')['coordinate']},'strictJunction':point('4886068970'),'orderedWayIds':orderedWays,'sourceCorridor':[point(i)for i in ids],'orderedWays':[{'wayId':i,'tags':tags(ways[i])}for i in orderedWays],'tariffPointCandidate':'p214','scope':'Physical southbound access only; tariff binding and integration require separate review. Gate building is a neighboring complex label, not proof of containment.'}
(base/'directed-entry.json').write_text(json.dumps(physical,ensure_ascii=False,indent=2)+'\n')
b=ways['655195663'];building={'osmWayId':'655195663','tags':tags(b),'polygon':[point(x.attrib['ref'])for x in b.findall('nd')]}
review={'status':'SOURCE_REVIEW_IN_PROGRESS','durableStartedCommit':'a6018ad2e74a760edcfb8a428fd83f4265defef0','requestCount':3,'httpStatuses':[json.loads(p.read_text())['status']for p in sorted(base.glob('*.metadata.json'))],'sourceSha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(base.glob('*.osm'))},'gateTags':tags(nodes['5286168661']),'nearbyComplex':building,'physicalWayCount':len(orderedWays),'corridorPoints':len(ids),'runtimeChanged':False,'newPricedComponents':0,'confirmedWholeTripFares':0,'operatorControlPath':'experiments/nationwide-tolls/source-snapshots/m11/2026-10-12-58-679-category1-a1-current.json','mappingStatus':'p214_candidate_from_neighboring_complex_214km_label; not yet enabled'}
(base/'binding-proof.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'ways':orderedWays,'points':len(ids),'complex':building['tags']},ensure_ascii=False))
