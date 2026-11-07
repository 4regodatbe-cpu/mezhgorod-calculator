#!/usr/bin/env python3
"""Check JSON syntax, per-file manifest digests, and SHA256SUMS."""
from pathlib import Path
import hashlib, json
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'MANIFEST.json').read_text())
assert len(manifest['files'])==manifest['fileCount']
for item in manifest['files']:
    p=root/item['path']
    b=p.read_bytes()
    assert len(b)==item['sizeBytes'], item['path']
    assert hashlib.sha256(b).hexdigest()==item['sha256'], item['path']
for p in root.rglob('*.json'):
    json.loads(p.read_text())
for line in (root/'SHA256SUMS').read_text().splitlines():
    digest, rel=line.split('  ',1)
    assert hashlib.sha256((root/rel).read_bytes()).hexdigest()==digest, rel
print(f"PACKAGE_PASS files={manifest['fileCount']} JSON=valid sha256=valid")
