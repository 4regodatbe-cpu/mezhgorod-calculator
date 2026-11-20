"""Offline XML/JSON atlas projection; no network, application or tariff mutation."""
import gzip
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
BASE = 'experiments/junction-atlas/2026-10-30/'
PREFIX = 'experiments/nationwide-tolls/source-snapshots/zsd/'
NODE_PATH = PREFIX + '2026-10-15-zone1/selected-paid-nodes.osm.gz'
WAY_PATH = PREFIX + '2026-10-15-zone1/selected-paid-ways.osm.gz'
EXIT_PATH = PREFIX + '2026-10-17-kad-ekateringofka/exit-way183902370.osm'
READY_PATH = PREFIX + '2026-10-17-kad-ekateringofka/readiness.json'
CAPTURE = ('experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/'
           'dnr-гранитное-saint-petersburg-center/2026-10-15T11-56-56-059Z-capture.json.gz')


def raw(path):
    return (ROOT / path).read_bytes()


def xml(path):
    data = raw(path)
    return ET.fromstring(gzip.decompress(data) if path.endswith('.gz') else data)


def tags(element):
    return {t.get('k'): t.get('v') for t in element.findall('tag')}


node_root, way_root, exit_root = xml(NODE_PATH), xml(WAY_PATH), xml(EXIT_PATH)
nodes = {n.get('id'): n for tree in [node_root, exit_root] for n in tree.findall('node')}
ways = {w.get('id'): w for tree in [way_root, exit_root] for w in tree.findall('way')}
ready = json.loads(raw(READY_PATH))
capture = json.loads(gzip.decompress(raw(CAPTURE)))


def segment(way_id, label, node_source):
    w = ways[way_id]
    ids = [n.get('ref') for n in w.findall('nd')]
    assert tags(w).get('oneway') == 'yes'
    return {'wayId': way_id, 'label': label, 'oneway': True, 'nodeOrder': ids,
            'sourceWayPath': EXIT_PATH if way_id == '183902370' else WAY_PATH,
            'sourceNodePath': node_source, 'tags': tags(w)}


segments = [segment('1122966006', 'КАДюг→ЗСД на север', NODE_PATH),
            segment('381576632', 'ПВП5 по OSM; северное направление', NODE_PATH),
            segment('183902370', 'ЗСД→набережная реки Екатерингофки', EXIT_PATH)]
assert segments[0]['nodeOrder'] == ['10270133471', '2326313083', '1833109726']
assert segments[1]['nodeOrder'] == ['3847689344', '933974870', '3847689346']
assert segments[2]['nodeOrder'][0] == '1339782267'
assert segments[2]['nodeOrder'][-1] == '25893875'
assert tags(nodes['933974870'])['name'] == 'ПВП 5'
assert 'Екатерингофка' in segments[2]['tags']['description']


def point(node_id, kind, name, way_id, source, roads):
    n = nodes[node_id]
    position = {'lat': float(n.get('lat')), 'lon': float(n.get('lon'))}
    return {'id': 'zsd-' + node_id, 'road': 'ZSD', 'kind': kind, 'title': name,
            'position': position, 'direction': 'northbound', 'crossingRoads': roads,
            'osm': {'nodeId': node_id, 'wayIds': [way_id]},
            'coordinateSource': {'path': source, 'field': 'osm/node[@id="' + node_id + '"]/@lat,@lon'},
            'mapUrl': ('https://yandex.ru/maps/?ll=' + str(position['lon']) + '%2C' + str(position['lat']) + '&z=18'),
            'evidence': {'visual': 'exit-area map corroboration only' if source == EXIT_PATH else 'not independently viewed at this point',
                         'directed': 'exact source OSM one-way order plus retained selected-trace witness',
                         'operatorBoundary': 'existing complete vector only; point alone is not a tariff endpoint'},
            'operatorScheme': 'experiments/tariff-proof-selection/ZSD_EXPERIMENT6_SOURCE_REVIEW.md',
            'tariffPair': None, 'tariffReason': 'Use complete reviewed entry→exit vector, not an isolated node/plaza count.'}


points = [point('10270133471', 'entry', 'Начало сохранённого соединительного въезда с КАДюг', '1122966006', NODE_PATH, ['А-118/КАД (юг)', 'ЗСД']),
          point('1833109726', 'technical', 'Конец сохранённого соединительного въезда', '1122966006', NODE_PATH, ['КАДюг', 'ЗСД']),
          point('933974870', 'plaza', 'ПВП5 — номер подтверждён OSM, не новым операторским перечнем', '381576632', NODE_PATH, ['ЗСД']),
          point('1339782267', 'technical', 'Начало направленного выхода к Екатерингофке', '183902370', EXIT_PATH, ['ЗСД', 'набережная реки Екатерингофки']),
          point('25893875', 'exit', 'Конец направленного выхода к Екатерингофке', '183902370', EXIT_PATH, ['ЗСД', 'набережная реки Екатерингофки'])]


def compact(values):
    result = []
    for value in values:
        if not result or result[-1] != value:
            result.append(value)
    return result


witnesses = []
for call_index, first, last, expected in [(16, 191, 193, ['27462229', '1122966006', '1122966005']),
                                        (17, 12, 15, ['80056716', '381576632', '381576631']),
                                        (17, 31, 36, ['435710010', '183902370', '119176972'])]:
    edges = json.loads(capture['calls'][call_index]['text'])['edges'][first:last + 1]
    actual = compact([str(e['way_id']) for e in edges])
    assert actual == expected, (call_index, first, actual)
    witnesses.append({'capturePath': CAPTURE, 'callIndex': call_index, 'edgeRangeInclusive': [first, last],
                      'orderedWayIds': actual, 'proof': 'retained selected-route trace, not new route calculation'})

for witness in ready['entry']['witnesses'] + ready['exit']['witnesses'] + [ready['gate']['gate']]:
    n = nodes[witness['id']]
    assert [float(n.get('lat')), float(n.get('lon'))] == [witness['lat'], witness['lon']]

source_paths = [NODE_PATH, WAY_PATH, EXIT_PATH, READY_PATH, CAPTURE,
                BASE + 'raw/zsd-operator-map-accessibility.txt',
                BASE + 'raw/zsd-operator-pvp-accessibility.txt',
                BASE + 'raw/zsd-exit-short-route-accessibility.txt',
                BASE + 'raw/zsd-exit-osm-z16-38274-19067.png']
assert ready['rub'] == 600 and ready['tariffZones'] == ['zone-1', 'zone-2']
result = {'schemaVersion': 1, 'road': 'ZSD', 'date': '2026-10-30', 'mode': 'research_only_not_runtime',
          'sources': [{'path': p, 'sha256': hashlib.sha256(raw(p)).hexdigest()} for p in source_paths],
          'points': points, 'segments': segments, 'selectedTraceWitnesses': witnesses,
          'operatorMap': {'url': 'https://www.nch-spb.com/about/map/', 'status': 'technical maintenance notice; no operator map geometry exposed'},
          'operatorPvpPage': {'url': 'https://www.nch-spb.com/travel/pvp/', 'status': 'generic lane/payment guidance, no specific PVP5 location crosswalk found'},
          'pvp5Name': {'value': 'ПВП 5', 'basis': NODE_PATH, 'field': 'node933974870/tag[name]', 'independentlyOperatorConfirmed': False},
          'mapControl': {'constructed': True, 'fromLabel': 'ЗСД, съезд С2', 'toLabel': 'набережная реки Екатерингофки', 'meters': 257, 'minutes': 1,
                         'exactPolylineOrSnapRetrieved': False, 'scope': 'exit connector only, not a full-route or toll-payment proof'},
          'tariffBindings': [{'id': 'existing-kad-south-ekateringofka', 'status': 'retained_existing_finished_vector', 'from': 'kad-south', 'to': 'ekateringofka',
                              'zones': ready['tariffZones'], 'amount': ready['rub'], 'payment': ready['paymentMethod'],
                              'basis': READY_PATH, 'introducedByAtlas': False, 'receiptVerified': False,
                              'ruleLimit': '6.2.17 receipt exception is the specified Auto→Blagodatnaya movement, not a universal60minute waiver'}],
          'summary': {'pointRecords': len(points), 'directedEntryExits': 2, 'selectedDirectedSegments': 3, 'newTariffBindings': 0,
                      'newOsmRequests': 0, 'standardOsmTileViews': 1, 'newRouteProviderCalls': 0},
          'limitations': ['No exact operator tariff boundary is inferred from an OSM endpoint alone.',
                          'PVP5 is the retained OSM name; operator numbering/geographic crosswalk remains unconfirmed.',
                          'Retained600 is a finished source-backed vector, not a count of barriers or arbitrary crossed zones.',
                          'Extended Planernaya and RVP64/64E cases do not inherit this price or payment bundle.',
                          'Entry/PVP not newly viewed as images; only exit-area raster inspected.']}
print(json.dumps(result, ensure_ascii=False, indent=2))
