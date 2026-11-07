#!/usr/bin/env python3
"""Verify the retained raw OSM objects and their acquisition metadata."""
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path
root = Path(__file__).resolve().parents[1] / 'geometry' / 'raw-osm'
proof = json.loads((Path(__file__).resolve().parents[1] / 'geometry' / 'western-exits-physical-proof.json').read_text())
for item in proof['rawHashes']:
    path = root / Path(item['path']).name
    raw = path.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == item['sha256'], path
    ET.fromstring(raw)
    meta = json.loads(path.with_suffix('.metadata.json').read_text())
    assert meta['sha256'] == item['sha256']
    assert meta['status'] == 200
print(f"M12_RAW_OSM_PASS objects={len(proof['rawHashes'])} metadata_and_xml=valid")
