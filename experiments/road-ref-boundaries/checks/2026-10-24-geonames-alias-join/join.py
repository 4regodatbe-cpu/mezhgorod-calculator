"""Offline language/admin join only. Never produces runtime-eligible records."""
import collections,hashlib,io,json,pathlib,sys,time,zipfile
ROOT=pathlib.Path(__file__).resolve().parent
CHECKS=ROOT.parent
ALIASES_SHA='f0e8e40b4ef31ad6fcb0e0d2fa1c9be3a567cdb4e2fee9d20dfd2bb07f2a9f35'
GEOGRAPHY_SHA='0c92e4e0e21c5e39355344264cadcbba6640d06db64fff6c055adc1944814ce8'
def sha(b):return hashlib.sha256(b).hexdigest()
def atomic(name,obj):
 p=ROOT/name;t=p.with_suffix(p.suffix+'.tmp');t.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def parse_alias(raw):
 f=raw.rstrip('\r\n').split('\t')
 if len(f) not in (8,10):raise ValueError('alias_field_count')
 if not f[0].isdecimal() or not f[1].isdecimal():raise ValueError('alias_identity')
 if any(x not in ('','0','1') for x in f[4:8]):raise ValueError('alias_flag')
 return f
def name_choice(rows):
 # Blank historical flag is not a guarantee of current usage.
 allowed=[r for r in rows if r['rawFields'][2]=='ru' and r['rawFields'][7]!='1' and r['rawFields'][6]!='1'
          and (len(r['rawFields'])==8 or not any(r['rawFields'][8:10]))]
 preferred={r['rawFields'][3] for r in allowed if r['rawFields'][4]=='1'}
 names={r['rawFields'][3] for r in allowed}
 if len(preferred)==1:return dict(status='PREFERRED_CANDIDATE',name=next(iter(preferred)),currentUsageVerified=False)
 if len(preferred)>1:return dict(status='AMBIGUOUS_PREFERRED',names=sorted(preferred),currentUsageVerified=False)
 if len(names)==1:return dict(status='SINGLE_UNFLAGGED_CANDIDATE',name=next(iter(names)),currentUsageVerified=False)
 return dict(status='MISSING' if not names else 'AMBIGUOUS_UNFLAGGED',names=sorted(names),currentUsageVerified=False)
def selftest():
 f=['1','2','ru','Тест','','','','']
 assert len(parse_alias('\t'.join(f)))==8
 assert len(parse_alias('\t'.join(f+['',''])))==10
 for bad in ['1\t2', '\t'.join(['x']+f[1:]), '\t'.join(f[:4]+['yes']+f[5:])]:
  try:parse_alias(bad);raise AssertionError('accepted malformed alias')
  except ValueError:pass
 def r(lang='ru',history='',pref='',name='Тест',dates=None):
  return {'rawFields':['1','2',lang,name,pref,'','',history]+([] if dates is None else dates)}
 assert name_choice([r('uk')])['status']=='MISSING'
 assert name_choice([r(history='1')])['status']=='MISSING'
 assert name_choice([r(dates=['','1990'])])['status']=='MISSING'
 assert name_choice([r(pref='1'),r(pref='1',name='Другой')])['status']=='AMBIGUOUS_PREFERRED'
 assert name_choice([r()])['name']=='Тест'
 print('8/10field/identity/flag/language/history/date/ambiguouspreferred tests PASS')
def main(aliaspath,geopath):
 start=time.monotonic()
 def budget():
  if time.monotonic()-start>110:raise TimeoutError('join budget exceeded')
 src=json.loads((CHECKS/'2026-10-24-geonames-review/selected-records.json').read_text())['queries']
 cities={r['id']:r for rows in src.values() for r in rows}
 requests={}
 for r in cities.values():
  requests.setdefault(('ADM1',r['countryCode'],r['admin1']),[])
  if r['admin2']:requests.setdefault(('ADM2',r['countryCode'],r['admin1'],r['admin2']),[])
 gb=pathlib.Path(geopath).read_bytes();assert sha(gb)==GEOGRAPHY_SHA
 with zipfile.ZipFile(io.BytesIO(gb)) as outer:
  m=json.loads(outer.read('result.json'))
  for country in ['RU','UA']:
   b=outer.read(country+'.zip');assert sha(b)==next(f['sha256'] for f in m['files'] if f['country']==country)
   with zipfile.ZipFile(io.BytesIO(b)) as z:
    with z.open(country+'.txt') as stream:
     for line,raw in enumerate(io.TextIOWrapper(stream,encoding='utf-8'),1):
      budget();f=raw.rstrip('\r\n').split('\t')
      if len(f)!=19:raise ValueError('geography schema')
      if f[6]!='A' or f[7] not in ('ADM1','ADM2'):continue
      key=(f[7],f[8],f[10]) if f[7]=='ADM1' else (f[7],f[8],f[10],f[11])
      if key in requests:requests[key].append(dict(id=f[0],dump=country,line=line,rowSha256=sha(raw.rstrip('\r\n').encode()),rawFields=f))
 atomic('admin-bindings.json',{'scope':'OFFLINE_EVIDENCE_ONLY','keys':[dict(key=list(k),records=v) for k,v in sorted(requests.items())]})
 target=set(cities)|{r['id'] for rows in requests.values() for r in rows}
 ru={ident:[] for ident in target};stats={};invalid=[];invalid_count=0;seen=set();dups=[]
 ab=pathlib.Path(aliaspath).read_bytes();assert sha(ab)==ALIASES_SHA
 with zipfile.ZipFile(io.BytesIO(ab)) as outer:
  manifest=json.loads(outer.read('result.json'))
  for country in ['RU','UA']:
   body=outer.read(country+'.zip');assert sha(body)==next(f['sha256'] for f in manifest['files'] if f['country']==country)
   stat={'rows':0,'fieldCounts':collections.Counter(),'ruRows':0,'targetRuRows':0}
   with zipfile.ZipFile(io.BytesIO(body)) as z:
    assert sum(x.file_size for x in z.infolist())<=256*1024*1024
    with z.open(country+'.txt') as stream:
     for line,raw in enumerate(io.TextIOWrapper(stream,encoding='utf-8'),1):
      budget();stat['rows']+=1
      try:f=parse_alias(raw)
      except ValueError as e:
       invalid_count+=1
       if len(invalid)<10:invalid.append(dict(country=country,line=line,reason=str(e)))
       continue
      stat['fieldCounts'][str(len(f))]+=1
      if f[0] in seen:dups.append(dict(aliasId=f[0],country=country,line=line))
      seen.add(f[0])
      if f[2]=='ru':
       stat['ruRows']+=1
       if f[1] in target:
        stat['targetRuRows']+=1
        ru[f[1]].append(dict(aliasId=f[0],geonameid=f[1],dump=country,line=line,rowSha256=sha(raw.rstrip('\r\n').encode()),rawFields=f,
            language='ru',historic=f[7]=='1',dateFieldsPresent=len(f)==10,fromValue=f[8] if len(f)==10 else None,toValue=f[9] if len(f)==10 else None))
   stats[country]=stat;atomic('progress.json',{'status':'country_parsed','country':country,'stats':stats})
 choices={ident:name_choice(rows) for ident,rows in ru.items()}
 labels=[];collisions=collections.defaultdict(list)
 for ident,r in cities.items():
  keys=[('ADM1',r['countryCode'],r['admin1'])]
  if r['admin2']:keys.append(('ADM2',r['countryCode'],r['admin1'],r['admin2']))
  city=choices[ident];regions=[];issues=[]
  for key in keys:
   admins=requests[key]
   if len(admins)!=1:issues.append(dict(key=key,reason='MISSING_ADMIN_BINDING' if not admins else 'AMBIGUOUS_ADMIN_BINDING'));continue
   choice=choices[admins[0]['id']]
   if 'name' not in choice:issues.append(dict(key=key,reason='NO_UNIQUE_RU_ADMIN_NAME',status=choice['status']));continue
   regions.append(dict(key=key,id=admins[0]['id'],name=choice['name'],status=choice['status']))
  if 'name' not in city:issues.append(dict(reason='NO_UNIQUE_RU_CITY_NAME',status=city['status']))
  label=' — '.join([city.get('name',r['name'])]+[x['name'] for x in regions])
  row=dict(id=ident,cityNameChoice=city,adminNames=regions,issues=issues,draftLabel=label,
    territory=r['territory'],queryMatched=[q for q,rows in src.items() if any(x['id']==ident for x in rows)],
    runtimeEligible=False,currentUsageVerified=False,coordinateAccuracy='UNVERIFIED')
  labels.append(row);collisions[label].append(ident)
 atomic('ru-aliases.json',{'scope':'OFFLINE_EVIDENCE_ONLY','records':ru})
 atomic('draft-labels.json',{'scope':'OFFLINE_EVIDENCE_ONLY_NOT_UI','records':labels})
 result=dict(status='OFFLINE_ALIAS_ADMIN_JOIN_DONE_NOT_RUNTIME_APPROVED',stats=stats,invalidCount=invalid_count,invalidSamples=invalid,
  duplicateAliasIdCount=len(dups),duplicateSamples=dups[:10],selectedCityIds=len(cities),targetIds=len(target),
  citiesWithAnyRuAlias=sum(bool(ru[x]) for x in cities),citiesWithUniqueUndatedNonhistoricName=sum('name' in choices[x] for x in cities),
  adminBindingKeys=len(requests),missingAdminKeys=[list(k) for k,v in requests.items() if not v],ambiguousAdminKeys=[list(k) for k,v in requests.items() if len(v)>1],
  adminTargetIds=len(target-set(cities)),adminIdsWithAnyRuAlias=sum(bool(ru[x]) for x in target-set(cities)),
  labelIssueCityCount=sum(bool(r['issues']) for r in labels),draftLabelCollisions={k:v for k,v in collisions.items() if len(v)>1},
  nameStatuses=collections.Counter(choices[x]['status'] for x in cities),runtimeApproved=False,
  fieldSemantics='8 fields: date interval unknown; 10 fields: from/to explicitly present; blank historic does not certify current usage',
  elapsedSeconds=round(time.monotonic()-start,3))
 atomic('result.json',result);atomic('progress.json',dict(status='DONE',result='result.json'));print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':
 if sys.argv[1:] == ['--selftest']:selftest()
 else:main(sys.argv[1],sys.argv[2])
