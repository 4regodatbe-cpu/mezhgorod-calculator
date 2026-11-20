from pathlib import Path
import json,xml.etree.ElementTree as E,hashlib
b=Path('experiments/nationwide-tolls/source-snapshots/ckad/2026-10-18-ramenskoe-exit');nodes={};ways={};sources=[]
for k in ['886019081','886019063','119881263']:
 p=b/(k+'.osm');raw=p.read_bytes();m=json.loads(Path(str(p)+'.metadata.json').read_text());assert m['status']==200 and hashlib.sha256(raw).hexdigest()==m['sha256'];sources.append({'path':str(p),'sha256':m['sha256'],'url':m['url']})
 for e in E.fromstring(raw):
  if e.tag=='node':nodes[e.get('id')]=e
  if e.tag=='way':ways[e.get('id')]=e
slices=[('886019081','10782061695','10832306578'),('886019063','10832306578','8914828064'),('119881263','8914828064','3140785578')];allrefs=[];topology=[]
for k,begin,end in slices:
 w=ways[k];refs=[n.get('ref')for n in w.findall('nd')];tags={t.get('k'):t.get('v')for t in w.findall('tag')};assert tags['oneway']=='yes';start=refs.index(begin);stop=refs.index(end);assert start<stop;chosen=refs[start:stop+1]
 if allrefs:assert allrefs[-1]==chosen[0]
 allrefs.extend(chosen if not allrefs else chosen[1:]);topology.append({'wayId':k,'sourceFirstNode':refs[0],'sourceLastNode':refs[-1],'selectedFirstNode':begin,'selectedLastNode':end,'tags':tags})
points=[{'nodeId':k,'lon':float(nodes[k].get('lon')),'lat':float(nodes[k].get('lat'))}for k in allrefs];out={'status':'DONE_PHYSICAL_ONLY','junctionNodeId':'10832306578','lastCkadWayId':'886019081','connectorWayId':'886019063','afterA107WayId':'119881263','topology':topology,'witnesses':points,'sources':sources,'billingPoint':None,'scope':'Own directed physical exit toward A107; published operator tariff-point alias is not yet independently bound. Source way886019081 extends beyond the actual exit; only selected slice is retained.'};(b/'physical-exit.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n');print(json.dumps({'points':len(points),'junction':next(p for p in points if p['nodeId']=='10832306578')}))
