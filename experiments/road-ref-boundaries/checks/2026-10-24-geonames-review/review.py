"""Bounded offline source review; no runtime dataset or network requests."""
import argparse, collections, hashlib, io, json, math, pathlib, subprocess, tempfile, time, zipfile
NAMES = ['Москва','Краснодар','Донецк','Луганск','Ялта','Севастополь','Тарасовка','Черноморское']
EXPECTED_OUTER = '0c92e4e0e21c5e39355344264cadcbba6640d06db64fff6c055adc1944814ce8'
def norm(s): return s.casefold().replace('ё','е').strip()
def parse(raw):
    fields = raw.rstrip('\r\n').split('\t')
    if len(fields) != 19: raise ValueError('field_count')
    if not fields[0].isdecimal(): raise ValueError('identity')
    if fields[6] != 'P': return fields, None
    lat, lng = float(fields[4]), float(fields[5])
    if not math.isfinite(lat) or not math.isfinite(lng) or not -90 <= lat <= 90 or not -180 <= lng <= 180:
        raise ValueError('invalid_wgs84')
    return fields, (lat,lng)
def atomic(path, value):
    tmp = path.with_suffix(path.suffix+'.tmp');tmp.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');tmp.replace(path)
def selftest():
    row=['1','X','X','X','1','2','P','PPL','RU','','1','2','','','0','','0','Europe/Moscow','2026-10-24']
    assert parse('\t'.join(row))[1] == (1,2)
    for bad in ['nan','inf','91']:
        altered=row.copy();altered[4]=bad
        try: parse('\t'.join(altered));raise AssertionError('accepted invalid coordinate')
        except ValueError: pass
    try:parse('1\tX');raise AssertionError('accepted malformed row')
    except ValueError:pass
    assert norm('  ЧЕРНОМОРСКОЕ ')==norm('Черноморское')
    # Same normalized name must preserve distinct identities.
    groups=collections.defaultdict(set)
    for ident in ['1','2']:groups[norm('Донецк')].add(ident)
    assert len(groups[norm('Донецк')])==2
    print('parser/invalid coordinates/malformed/homonym checks PASS')
def main(archive_path, output):
    started=time.monotonic();out=pathlib.Path(output);out.mkdir(parents=True,exist_ok=True)
    archive=pathlib.Path(archive_path);assert hashlib.sha256(archive.read_bytes()).hexdigest()==EXPECTED_OUTER
    selected={n:[] for n in NAMES};target={norm(n):n for n in NAMES}
    points=[];seen={};duplicates=[];stats={};invalid=[];invalid_count=0;provenance=[]
    with zipfile.ZipFile(archive) as outer:
        manifest=json.loads(outer.read('result.json'))
        for source in manifest['files']:
            country=source['country'];body=outer.read(country+'.zip')
            assert len(body)==source['bytes'] and hashlib.sha256(body).hexdigest()==source['sha256']
            stat={'rows':0,'P':0,'featureCodes':collections.Counter(),'countryCodes':collections.Counter(),'primaryContainsCyrillic':0}
            with zipfile.ZipFile(io.BytesIO(body)) as inner:
                assert sum(x.file_size for x in inner.infolist()) <=256*1024*1024
                provenance.append({'country':country,'readmeSha256':hashlib.sha256(inner.read('readme.txt')).hexdigest()})
                with inner.open(country+'.txt') as stream:
                    for line_no, raw in enumerate(io.TextIOWrapper(stream,encoding='utf-8'),1):
                        if time.monotonic()-started>115:raise TimeoutError('offline review budget exceeded')
                        stat['rows']+=1
                        try: fields,position=parse(raw)
                        except ValueError as e:
                            invalid_count+=1
                            if len(invalid)<20:invalid.append({'dump':country,'line':line_no,'reason':str(e)})
                            continue
                        ident=fields[0]
                        if ident in seen:duplicates.append({'id':ident,'first':seen[ident],'duplicate':[country,line_no]})
                        else:seen[ident]=[country,line_no]
                        if position is None:continue
                        stat['P']+=1;stat['featureCodes'][fields[7]]+=1;stat['countryCodes'][fields[8]]+=1
                        if any('\u0400'<=c<='\u04ff' for c in fields[1]):stat['primaryContainsCyrillic']+=1
                        lat,lng=position;points.append([ident,country,lat,lng])
                        names={norm(fields[1]):'primary'}
                        for alias in fields[3].split(','):names.setdefault(norm(alias),'untyped_country_alias')
                        for key in set(names)&target.keys():
                            selected[target[key]].append({'id':ident,'dump':country,'line':line_no,
                                'rowSha256':hashlib.sha256(raw.rstrip('\r\n').encode()).hexdigest(),
                                'name':fields[1],'ascii':fields[2],'match':names[key],
                                'lat':lat,'lng':lng,'featureCode':fields[7],'countryCode':fields[8],
                                'admin1':fields[10],'admin2':fields[11],'admin3':fields[12],'admin4':fields[13],
                                'modificationDate':fields[18], 'rawFields':fields,
                                'ruLanguageVerified':False,'coordinateAccuracy':'UNVERIFIED','runtimeEligible':False})
            stats[country]=stat
            atomic(out/'progress.json',{'status':'parsed_country','country':country,'stats':stats,'matchedCounts':{k:len(v) for k,v in selected.items()}})
    with tempfile.TemporaryDirectory() as tmp:
        inp=pathlib.Path(tmp)/'points.json';geom=pathlib.Path(tmp)/'geometry.json'
        inp.write_text(json.dumps({'points':points,'selectedIds':list({r['id'] for rows in selected.values() for r in rows})}))
        subprocess.run(['node',str(out/'classify.mjs'),str(inp),str(geom)],check=True,timeout=max(1,115-(time.monotonic()-started)))
        geometry=json.loads(geom.read_text())
    for rows in selected.values():
        for row in rows:row['territory']=geometry['selected'].get(row['id'],'UNKNOWN')
    atomic(out/'selected-records.json',{'scope':'OFFLINE_EVIDENCE_ONLY','queries':selected})
    boundary=pathlib.Path('data/special-territory-boundaries.json')
    result={'status':'OFFLINE_REVIEW_DONE_NOT_RUNTIME_APPROVED','outerSha256':EXPECTED_OUTER,
        'stats':stats,'duplicateCount':len(duplicates),'duplicateSamples':duplicates[:20],
        'invalidCount':invalid_count,'invalidSamples':invalid,'readme':provenance,
        'queryVerdicts':{k:{'records':len(v),'distinctIds':len({r['id'] for r in v}),
            'identityStatus':'MISSING' if not v else 'AMBIGUOUS' if len({r['id'] for r in v})>1 else 'SINGLE_CANDIDATE_UNVERIFIED',
            'coordinateAccuracy':'UNVERIFIED','ruAliases':'UNVERIFIED'} for k,v in selected.items()},
        'geometry':geometry,'polygonSha256':hashlib.sha256(boundary.read_bytes()).hexdigest(),
        'polygonSource':'HDX/UN OCHA Ukraine COD-AB ADM1 v05 valid2025-09-01; existing repository verified four polygons',
        'crimeaCoverage':'UNKNOWN_NO_REVIEWED_CRIMEA_POLYGON_IN_FOUR_REGION_DATASET',
        'coverageCompleteness':'UNKNOWN_NO_INDEPENDENT_DENOMINATOR','aliasesV2Downloaded':False,
        'runtimeApproved':False,'elapsedSeconds':round(time.monotonic()-started,3)}
    atomic(out/'result.json',result);atomic(out/'progress.json',{'status':'DONE','result':'result.json'})
    print(json.dumps({k:result[k] for k in ['status','stats','queryVerdicts','invalidCount','duplicateCount','elapsedSeconds']},ensure_ascii=False,indent=2))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--selftest',action='store_true');p.add_argument('archive',nargs='?');p.add_argument('output',nargs='?');a=p.parse_args()
    if a.selftest:selftest()
    else:main(a.archive,a.output)
