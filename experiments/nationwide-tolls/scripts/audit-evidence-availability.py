"""Read-only evidence inventory; historic execution status does not prove availability."""
import gzip
import hashlib
import json
from collections import Counter
from pathlib import Path

BASE = Path('experiments/nationwide-tolls')
ROOT = BASE / 'source-snapshots/systemic-road-audit-2026-10-15'
manifest = json.loads((ROOT / 'recovery-manifest.json').read_text())
expected = {row['path']: row['sha'] for row in manifest['available'] + manifest['missing']}


def inspect(file):
    row = {'path': str(file), 'exists': file.is_file()}
    if not row['exists']:
        return row
    raw = file.read_bytes()
    sha = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
    row.update(bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest(), gitBlobSha=sha,
               recoveryShaMatches=sha == expected[str(file)] if str(file) in expected else None)
    try:
        data = json.loads(gzip.decompress(raw) if file.suffix == '.gz' else raw)
        row['readableJson'] = True
        if file.suffix == '.gz':
            row['schemaVersion'] = data.get('schemaVersion')
            row['recordedCalls'] = len(data.get('calls', []))
    except (OSError, ValueError, EOFError) as error:
        row.update(readableJson=False, error=str(error))
    return row


def resolve(value, live=None):
    p = Path(value)
    if p.parts[0] == 'experiments':
        return p
    if p.parts[0] == 'source-snapshots':
        return BASE / p
    return live.parent / p if live else ROOT / p


corpus = json.loads((ROOT / 'corpus.json').read_text())
rows = []
for case in corpus['routes']:
    audit = case.get('auditEvidence', {})
    live_evidence = case.get('liveEvidence', {})
    live_value = audit.get('live') or live_evidence.get('result')
    live = resolve(live_value) if live_value else None
    refs = {'live': live_value, 'capture': audit.get('capture') or live_evidence.get('capture'),
            'sameDateReplay': audit.get('sameDateReplay'), 'weekendReplay': audit.get('weekendReplay')}
    artifacts = {key: inspect(resolve(value, live)) for key, value in refs.items() if value}
    raw_ok = bool(artifacts.get('capture', {}).get('readableJson'))
    complete = len(artifacts) == 4 and all(a.get('readableJson') and a.get('recoveryShaMatches') is not False for a in artifacts.values())
    rows.append({'caseId': case['id'], 'region': case['region'], 'historicalStatus': case['status'],
                 'rawAvailable': raw_ok, 'fourArtifactsAvailable': complete, 'artifacts': artifacts})

raw_files = [inspect(p) for p in sorted((ROOT / 'runs').rglob('*capture.json.gz'))]
batches = []
for file in sorted(ROOT.glob('batch-*.json')):
    data = json.loads(file.read_text())
    for case in data['cases']:
        artifacts = {key: inspect(resolve(case[key], resolve(case['live']) if case.get('live') else None))
                     for key in ['live', 'capture', 'sameDateReplay', 'weekendReplay'] if case.get(key)}
        batches.append({'batch': str(file), 'caseId': case['caseId'], 'historicalStatus': case.get('status'), 'artifacts': artifacts})
regions = {region: {'planned': len(group), 'historicallyAudited': sum(r['historicalStatus'] == 'audited' for r in group),
                    'rawAvailable': sum(r['rawAvailable'] for r in group), 'fourArtifactsAvailable': sum(r['fourArtifactsAvailable'] for r in group)}
           for region in sorted({r['region'] for r in rows}) if (group := [r for r in rows if r['region'] == region])}
missing = sorted({a['path'] for row in rows + batches for a in row['artifacts'].values() if not a['exists']})
report = {'scope': 'File existence, gzip/JSON readability and recovery SHA only. No live routing, replay, pricing parity or fare verification performed.',
          'regions': regions, 'rawCaptureCount': len(raw_files),
          'rawCaptureCaseCount': len({str(Path(r['path']).parent) for r in raw_files}),
          'invalidRawCaptures': [r for r in raw_files if not r.get('readableJson') or r.get('recoveryShaMatches') is False],
          'missingReferencedFiles': missing, 'cases': rows, 'batchEntries': batches, 'rawCaptures': raw_files}
(ROOT / 'EVIDENCE_AVAILABILITY.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
lines = ['# Наличие сохранённых доказательств', '', report['scope'], '',
         '| Регион | План | Audited в старом manifest | Raw доступен | Все 4 файла доступны |', '|---|---:|---:|---:|---:|']
lines += [f"| {region} | {r['planned']} | {r['historicallyAudited']} | {r['rawAvailable']} | {r['fourArtifactsAvailable']} |" for region, r in regions.items()]
lines += ['', f"Raw captures: {len(raw_files)}; разных каталогов OD: {report['rawCaptureCaseCount']}; повреждённых raw: {len(report['invalidRawCaptures'])}; отсутствующих файлов по ссылкам: {len(missing)}.", '',
          'Наличие четырёх файлов не означает корректность тарифа или проверенный parity. Старые статусы corpus сохранены как история. Повторно запрашивать raw только там, где нужный capture утрачен; при наличии raw восстанавливать summary/replay офлайн.', '',
          'Точные пути, SHA и отсутствующие ссылки: [EVIDENCE_AVAILABILITY.json](EVIDENCE_AVAILABILITY.json).', '']
(ROOT / 'EVIDENCE_AVAILABILITY.md').write_text('\n'.join(lines))
print(json.dumps({k: report[k] for k in ['regions', 'rawCaptureCount', 'rawCaptureCaseCount', 'invalidRawCaptures']}))
print('missingReferencedFiles:', len(missing))
