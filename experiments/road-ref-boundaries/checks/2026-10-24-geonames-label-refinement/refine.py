"""Refine only unresolved offline draft labels with exact ADM3/ADM4 joins."""
import collections,hashlib,importlib.util,io,json,pathlib,re,sys,time,zipfile
ROOT=pathlib.Path(__file__).resolve().parent
BASE=ROOT.parent/'2026-10-24-geonames-alias-join'
spec=importlib.util.spec_from_file_location('prior_join',BASE/'join.py');prior=importlib.util.module_from_spec(spec);spec.loader.exec_module(prior)
def sha(b):return hashlib.sha256(b).hexdigest()
def write(name,d):
 p=ROOT/name;t=p.with_suffix(p.suffix+'.tmp');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def russian_script(s):return bool(re.search('[А-Яа-яЁё]',s)) and not re.search('[A-Za-z]',s)
def choice(rows):return prior.name_choice([r for r in rows if russian_script(r['rawFields'][3])])
def main(aliaspath,geopath):
 start=time.monotonic()
 def budget():
  if time.monotonic()-start>110:raise TimeoutError('refinement budget exceeded')
 baseline=json.loads((BASE/'draft-labels.json').read_text())['records']
 aliases=json.loads((BASE/'ru-aliases.json').read_text())['records']
 result0=json.loads((BASE/'result.json').read_text())
 source=json.loads((ROOT.parent/'2026-10-24-geonames-review/selected-records.json').read_text())['queries']
 cities={r['id']:r for rows in source.values() for r in rows}
 collision_ids={i for ids in result0['draftLabelCollisions'].values() for i in ids}
 remainder={r['id'] for r in baseline if r['issues'] or r['id'] in collision_ids or any(not russian_script(n['name']) for n in r['adminNames'])}
 requests={};missing_codes=[]
 for ident in remainder:
  row=cities[ident];codes=[row['countryCode'],row['admin1'],row['admin2'],row['admin3'],row['admin4']]
  for level in [3,4]:
   if not all(codes[:level+1]):missing_codes.append(dict(cityId=ident,level=level,reason='MISSING_EXACT_ADMIN_CODE'));continue
   requests.setdefault(tuple(['ADM'+str(level)]+codes[:level+1]),[])
 geo=pathlib.Path(geopath).read_bytes();assert sha(geo)==prior.GEOGRAPHY_SHA
 with zipfile.ZipFile(io.BytesIO(geo)) as outer:
  for country in ['RU','UA']:
   with zipfile.ZipFile(io.BytesIO(outer.read(country+'.zip'))) as z:
    with z.open(country+'.txt') as f:
     for line,raw in enumerate(io.TextIOWrapper(f,encoding='utf-8'),1):
      budget();fields=raw.rstrip('\r\n').split('\t')
      if fields[6]!='A' or fields[7] not in ['ADM3','ADM4']:continue
      level=int(fields[7][-1]);key=tuple([fields[7],fields[8]]+fields[10:10+level])
      if key in requests:requests[key].append(dict(id=fields[0],dump=country,line=line,rowSha256=sha(raw.rstrip('\r\n').encode()),rawFields=fields))
 target={r['id'] for rows in requests.values() for r in rows};newids=target-set(aliases)
 fresh={i:[] for i in newids}
 ar=pathlib.Path(aliaspath).read_bytes();assert sha(ar)==prior.ALIASES_SHA
 with zipfile.ZipFile(io.BytesIO(ar)) as outer:
  for country in ['RU','UA']:
   with zipfile.ZipFile(io.BytesIO(outer.read(country+'.zip'))) as z:
    with z.open(country+'.txt') as stream:
     for line,raw in enumerate(io.TextIOWrapper(stream,encoding='utf-8'),1):
      budget();fields=prior.parse_alias(raw)
      if fields[1] in newids and fields[2]=='ru':
       fresh[fields[1]].append(dict(aliasId=fields[0],geonameid=fields[1],dump=country,line=line,rowSha256=sha(raw.rstrip('\r\n').encode()),rawFields=fields))
 aliases={**aliases,**fresh};newlabels=[];collisions=collections.defaultdict(list)
 for base in baseline:
  ident=base['id'];city=cities[ident]
  if ident not in remainder:
   newlabels.append(dict(**base,refinement='NOT_IN_REMAINDER'));collisions[base['draftLabel']].append(ident);continue
  parts=[];issues=[];extra=[];changed=[]
  cc=choice(aliases[ident])
  if 'name' in cc:parts.append(cc['name'])
  else:parts.append(city['name']);issues.append('NO_UNIQUE_RUSSIAN_SCRIPT_CITY_NAME')
  for admin in base['adminNames']:
   ac=choice(aliases[admin['id']])
   if 'name' in ac:parts.append(ac['name'])
   else:issues.append('ADMIN_NAME_UNUSABLE:'+admin['id'])
  for issue in base['issues']:
   if issue.get('key'):issues.append('BASE_ADMIN_GAP:'+':'.join(issue['key']))
  codes=[city['countryCode'],city['admin1'],city['admin2'],city['admin3'],city['admin4']]
  for level in [3,4]:
   key=tuple(['ADM'+str(level)]+codes[:level+1]);rows=requests.get(key,[])
   if len(rows)!=1:
    extra.append(dict(level=level,status='NO_UNIQUE_EXACT_BINDING',key=key));continue
   ac=choice(aliases.get(rows[0]['id'],[]))
   if 'name' not in ac:
    extra.append(dict(level=level,status='NO_UNIQUE_RUSSIAN_SCRIPT_NAME',id=rows[0]['id'],key=key));continue
   if ac['name'] not in parts:parts.append(ac['name']);changed.append(level)
   extra.append(dict(level=level,status='CANDIDATE_NAME_ADDED',id=rows[0]['id'],name=ac['name'],key=key))
  label=' — '.join(parts);newlabels.append(dict(id=ident,priorDraftLabel=base['draftLabel'],draftLabel=label,extraAdmins=extra,issues=issues,addedLevels=changed,refinement='REVIEWED_REMAINDER',runtimeEligible=False,coordinateAccuracy='UNVERIFIED'));collisions[label].append(ident)
 out_collisions={k:v for k,v in collisions.items() if len(v)>1}
 result=dict(status='OFFLINE_REMAINDER_DONE_NOT_RUNTIME_APPROVED',baselineCityCount=93,remainderCount=len(remainder),requestedExtraAdminKeys=len(requests),
  missingExtraAdminKeys=[list(k) for k,v in requests.items() if not v],ambiguousExtraAdminKeys=[list(k) for k,v in requests.items() if len(v)>1],
  newAdminIds=len(newids),newAdminIdsWithRu=sum(bool(x) for x in fresh.values()),newAdminIdsWithRussianScriptChoice=sum('name' in choice(x) for x in fresh.values()),
  missingCodeEntries=len(missing_codes),baselineCollisionGroups=len(result0['draftLabelCollisions']),refinedCollisionGroups=len(out_collisions),refinedCollisions=out_collisions,
  cityIdsWithAddedLevel=[r['id'] for r in newlabels if r.get('addedLevels')],runtimeApproved=False,elapsedSeconds=round(time.monotonic()-start,3))
 write('new-admin-bindings.json',{'scope':'OFFLINE_EVIDENCE_ONLY','keys':[dict(key=k,records=v) for k,v in requests.items()],'missingCodes':missing_codes})
 write('new-ru-aliases.json',{'scope':'OFFLINE_EVIDENCE_ONLY','records':fresh});write('draft-labels.json',{'scope':'OFFLINE_EVIDENCE_ONLY_NOT_UI','records':newlabels})
 write('result.json',result);write('progress.json',dict(status='DONE',result='result.json'));print(json.dumps(result,ensure_ascii=False,indent=2))
def selftest():
 assert russian_script('Волновахский район') and not russian_script('Volnovakhskiy Rayon') and not russian_script('Волноваха Rayon')
 def r(s):return {'rawFields':['1','2','ru',s,'','','','','','']}
 assert 'name' not in choice([r('Volnovakhskiy Rayon')]);assert choice([r('Район')])['name']=='Район'
 print('Russian-script quality/Latin/mixed/alias-choice checks PASS')
if __name__=='__main__':
 if sys.argv[1:]==['--selftest']:selftest()
 else:main(sys.argv[1],sys.argv[2])
