"""Compile saved GeoNames country/language ZIPs offline; no runtime admission."""
import argparse, collections, datetime, hashlib, io, json, math, pathlib, re, time, zipfile

ACTIVE={'PPL','PPLA','PPLA2','PPLA3','PPLA4','PPLA5','PPLC','PPLF','PPLG','PPLL','PPLR'}
def validate_manifest(manifest,aliases=False):
    files=manifest.get('files',[])
    if len(files)!=2 or {s.get('country') for s in files}!={'RU','UA'}:raise ValueError('manifest country coverage')
    for source in files:
        expected='https://download.geonames.org/export/dump/'+('alternatenames/' if aliases else '')+source['country']+'.zip'
        if source.get('url')!=expected or not re.fullmatch('[a-f0-9]{64}',source.get('sha256','')):raise ValueError('manifest source identity')
def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()
def lines(path,country,max_rows):
    with zipfile.ZipFile(path) as z:
        info=z.getinfo(country+'.txt')
        if info.file_size>200*1024*1024:raise ValueError('source byte cap')
        with z.open(info) as raw,io.TextIOWrapper(raw,encoding='utf-8') as text:
            for number,line in enumerate(text,1):
                if number>max_rows:raise ValueError('source row cap')
                yield number,line.rstrip('\r\n').split('\t')
def main():
    p=argparse.ArgumentParser();p.add_argument('--country-dir',required=True);p.add_argument('--alias-dir',required=True);p.add_argument('--output',required=True)
    p.add_argument('--country-manifest');p.add_argument('--alias-manifest');p.add_argument('--source-date',default='2026-10-24');args=p.parse_args()
    root=pathlib.Path(__file__).resolve().parents[2]
    old=root/'experiments/road-ref-boundaries/checks'
    manifests=[json.loads(pathlib.Path(args.country_manifest or old/'2026-10-24-geonames-country-download/manifest.json').read_text()),json.loads(pathlib.Path(args.alias_manifest or old/'2026-10-24-geonames-alias-download/manifest.json').read_text())]
    for index,manifest in enumerate(manifests):validate_manifest(manifest,aliases=index==1)
    sources=[]
    for directory,manifest in zip([args.country_dir,args.alias_dir],manifests):
        for source in manifest['files']:
            path=pathlib.Path(directory)/(source['country']+'.zip')
            if sha(path)!=source['sha256']:raise ValueError('source SHA mismatch')
            sources.append({k:source[k] for k in ['url','sha256','receivedAt']})
    started=time.perf_counter();cities={};admins={};stats=collections.Counter()
    for cc in ['RU','UA']:
        for number,f in lines(pathlib.Path(args.country_dir)/(cc+'.zip'),cc,600000):
            stats['countryRows']+=1
            if len(f)!=19:raise ValueError('country field count')
            if f[6]=='A' and f[7] in ['ADM1','ADM2','ADM3','ADM4']:
                level=int(f[7][-1]);key='.'.join([f[8]]+f[10:10+level]);admins[key]=f
            if f[6]!='P':continue
            stats['populatedRows']+=1
            if f[7] not in ACTIVE:stats['inactiveOrSubdivisionExcluded']+=1;continue
            lat,lng=float(f[4]),float(f[5])
            if not all(map(math.isfinite,[lat,lng])) or abs(lat)>90 or abs(lng)>180:raise ValueError('invalid source coordinate')
            ident=int(f[0]);value=(f,number,cc)
            if ident in cities:
                if cities[ident][0][4:6]!=f[4:6]:raise ValueError('conflicting duplicate ID')
                stats['duplicateIds']+=1;continue
            cities[ident]=value
    wanted=set(cities)|{int(f[0]) for f in admins.values()};aliases=collections.defaultdict(list)
    source_date=datetime.date.fromisoformat(args.source_date)
    def in_period(value,lower):
        if not value:return True
        try:
            if len(value)==4:return int(value)<=source_date.year if lower else int(value)>=source_date.year
            return datetime.date.fromisoformat(value)<=source_date if lower else datetime.date.fromisoformat(value)>=source_date
        except ValueError:return False
    for cc in ['RU','UA']:
        for _,f in lines(pathlib.Path(args.alias_dir)/(cc+'.zip'),cc,3000000):
            stats['aliasRows']+=1
            if len(f)!=10:raise ValueError('alias field count')
            ident=int(f[1])
            if ident not in wanted or f[2]!='ru' or f[7]=='1' or not in_period(f[8],True) or not in_period(f[9],False):continue
            if not f[3].strip() or len(f[3])>300:continue
            aliases[ident].append((f[4]!='1',f[6]=='1',f[5]!='1',f[3]))
    def russian(ident):return [x[3] for x in sorted(aliases.get(int(ident),[]))]
    records=[]
    for ident,(f,number,dump) in sorted(cities.items()):
        names=russian(ident);flags=[]
        if not names:flags.append('ru_name_unverified');stats['missingRuName']+=1
        name=names[0] if names else f[1]
        search=list(dict.fromkeys([name]+names+[f[1],f[2]]))
        if len(search)>32:stats['aliasCappedRecords']+=1;search=search[:32]
        admin_labels=[]
        for level in range(1,5):
            if not f[9+level]:continue
            key='.'.join([f[8]]+f[10:10+level]);admin=admins.get(key)
            if admin:
                translated=russian(admin[0]);admin_labels.append(translated[0] if translated else admin[1])
                if not translated:flags.append('admin_ru_unverified')
            else:flags.append('admin_binding_missing')
        records.append([ident,name,search,float(f[4]),float(f[5]),f[8],list(dict.fromkeys(admin_labels)),int(f[14] or 0),f[7],f[10:14],number,f[18],dump,sorted(set(flags))])
    data={'schemaVersion':1,'sourceDate':source_date.isoformat(),'runtimeApproved':False,'coordinateAccuracy':'source-reported-settlement-point-unverified',
          'license':{'name':'CC-BY-4.0','url':'https://creativecommons.org/licenses/by/4.0/','attribution':'GeoNames; filtered and indexed by Mezhgorod Calculator'},
          'sources':sources,'records':records}
    out=pathlib.Path(args.output);out.parent.mkdir(parents=True,exist_ok=True)
    encoded=json.dumps(data,ensure_ascii=False,separators=(',',':')).encode()
    if len(encoded)>80*1024*1024:raise ValueError('compiled size cap')
    tmp=out.with_suffix('.tmp');tmp.write_bytes(encoded);tmp.replace(out)
    result={'status':'PROTOTYPE_ONLY','records':len(records),'stats':dict(stats),'jsonBytes':len(encoded),'sha256':sha(out),'elapsedSeconds':round(time.perf_counter()-started,3),'runtimeApproved':False}
    out.with_suffix('.manifest.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':main()
