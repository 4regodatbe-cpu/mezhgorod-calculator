#!/usr/bin/env python3
import hashlib,json,tarfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'SOURCES.json').read_text())
for item in [m['historicalEdition'],m['currentEdition'],m['passageRules']]:
 for field in ('matrix','officialPdf','file'):
  if field in item:
   p=root/item[field]
   assert p.is_file(), p
   assert hashlib.sha256(p.read_bytes()).hexdigest()==item.get({'matrix':'matrixSha256','officialPdf':'officialPdfSha256','file':'sha256'}[field])
assert m['currentEdition']['directedPairs']*5==m['currentEdition']['profileCells']==210
assert m['historicalPatch']['verifiedBase']=='3a000f64c82a7e89715cdea09a13e1edf9354bef'
archive=root/m['originalPacket']['file']
assert hashlib.sha256(archive.read_bytes()).hexdigest()==m['originalPacket']['sha256']
with tarfile.open(archive,'r:gz') as tf:
 names=set(tf.getnames())
 assert {'2gis-stage8-packet/README.md','2gis-stage8-packet/STAGE8.patch','2gis-stage8-packet/source-files.tar.gz','2gis-stage8-packet/SHA256SUMS'}<=names
 patch=root/m['historicalPatch']['file']
 assert hashlib.sha256(patch.read_bytes()).hexdigest()==m['historicalPatch']['sha256']
print('M11_SOURCE_HASHES_PASS editions=2 rules=1 original_packet=exact patch=verified')
