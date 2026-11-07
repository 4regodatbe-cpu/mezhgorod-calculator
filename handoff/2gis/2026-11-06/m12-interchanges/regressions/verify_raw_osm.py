#!/usr/bin/env python3
"""Verify redacted OSM geometry copies against retained original response hashes."""
import hashlib, json, xml.etree.ElementTree as ET
from pathlib import Path
base=Path(__file__).resolve().parents[1]
raw=base/'geometry/raw-osm'
proof=json.loads((base/'geometry/western-exits-physical-proof.json').read_text())
for item in proof['rawHashes']:
    path=raw/Path(item['path']).name
    metadata=json.loads(path.with_suffix('.metadata.json').read_text())
    assert metadata['sourceResponseSha256']==item['sha256']
    assert metadata['sanitizedFileSha256']==hashlib.sha256(path.read_bytes()).hexdigest()
    assert metadata['redactedAttributes']==['user','uid','changeset','timestamp']
    root=ET.parse(path).getroot()
    for element in root:
        assert not {'user','uid','changeset','timestamp'} & set(element.attrib)
    assert root.attrib.get('license','').endswith('/odbl/1-0/')
print(f"M12_REDACTED_OSM_PASS objects={len(proof['rawHashes'])} source_hashes=preserved contributor_fields=removed")
