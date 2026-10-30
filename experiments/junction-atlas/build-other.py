"""Project one bounded retained case to the research atlas; no network/runtime I/O."""
import hashlib
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
BASE = 'experiments/junction-atlas/2026-10-30/'
SNAP = 'experiments/nationwide-tolls/source-snapshots/'


def raw(p):
    return (ROOT / p).read_bytes()


def data(p):
    return json.loads(raw(p))


def xml(p):
    return ET.fromstring(raw(p))


def tags(element):
    return {t.get('k'): t.get('v') for t in element.findall('tag')}


def point(road, node_id, lat, lon, kind, title, path, direction, way_ids, roads, visual='not newly viewed as an image'):
    return {'id': road + '-' + str(node_id), 'road': road, 'kind': kind, 'title': title,
            'position': {'lat': float(lat), 'lon': float(lon)}, 'direction': direction,
            'osm': {'nodeId': str(node_id), 'wayIds': [str(w) for w in way_ids]}, 'crossingRoads': roads,
            'coordinateSource': {'path': path, 'field': 'original OSM node lat/lon, not a map centre or operator chainage'},
            'mapUrl': f'https://yandex.ru/maps/?ll={lon}%2C{lat}&z=18', 'operatorScheme': None,
            'evidence': {'coordinate': 'original OSM node', 'visual': visual, 'operatorTariffBoundary': 'unknown'},
            'tariffPair': None, 'priceRub': None}


def xp(road, tree, node_id, kind, title, path, direction, way_ids, roads, visual='not newly viewed as an image'):
    n = tree.find(f'node[@id="{node_id}"]')
    assert n is not None, node_id
    return point(road, node_id, n.get('lat'), n.get('lon'), kind, title, path, direction, way_ids, roads, visual)


def jp(road, source, node_id, kind, title, path, direction, way_ids, roads, visual='not newly viewed as an image'):
    n = next(x for x in source['elements'] if x['type'] == 'node' and str(x['id']) == str(node_id))
    return point(road, node_id, n['lat'], n['lon'], kind, title, path, direction, way_ids, roads, visual)


def finish(road, paths, points, **details):
    return {'schemaVersion': 1, 'road': road, 'date': '2026-10-30', 'mode': 'research_only_not_runtime',
            'sources': [{'path': p, 'sha256': hashlib.sha256(raw(p)).hexdigest()} for p in paths],
            'points': points, 'newTariffBindings': 0, 'appRuntimeChanged': False, **details}


def m12():
    p = SNAP + 'm12/2026-10-18-western-boundaries/'
    ramp_path = p + 'c0ab136d60afb7d92ae6.osm'
    t = xml(ramp_path)
    way = t.find('way[@id="1550561305"]')
    order = [n.get('ref') for n in way.findall('nd')]
    assert order[0] == '10090995838' and order[-1] == '14102954884'
    assert tags(way).get('oneway') is None  # OSM nd enumeration is NOT a traffic direction.
    pts = [xp('M12', t, node, kind, title, ramp_path, 'retained_selected_M12_to_22Н-0239', ['1550561305'], ['М-12 «Восток»', '22Н-0239'], 'ramp-area raster only, not legal motorway-turn proof')
           for node, kind, title in [('14102954884', 'technical', 'Узел примыкания съезда к М12; текущая доступность не разрешена доказательствами'),
                                     ('14102954883', 'technical', 'Промежуточный исходный узел съезда'),
                                     ('10090995838', 'exit', 'Соединение сохранённого съезда с22Н-0239')]]
    frame_paths = [p + name for name in ['039cfde37fa14ee9ffff.osm', 'e421784129ac6308b39c.osm', '1f1c1ebc00b9a06c10ea.osm']]
    for node in ['10782165529', '11214930528', '11157985901']:
        path, tree = next((path, xml(path)) for path in frame_paths if xml(path).find(f'node[@id="{node}"]') is not None)
        n = tree.find(f'node[@id="{node}"]')
        assert tags(n).get('highway') == 'toll_gantry'
        x = xp('M12', tree, node, 'technical', 'Западная регистрационная рамка; операторскийID неизвестен', path, 'not assigned from node alone', [], ['М-12'])
        x['operatorRegistrationId'] = None
        pts.append(x)
    return finish('M12', [ramp_path] + frame_paths + [BASE + 'raw/m12-exit-short-route-accessibility.txt', BASE + 'raw/m12-ramp-interior-short-route-accessibility.txt', BASE + 'raw/m12-ramp-osm-z16-40699-20569.png'], pts,
                  directedRamp={'wayId': '1550561305', 'osmNodeOrder': order, 'selectedTraversalNodeOrder': list(reversed(order)), 'onewayTag': None, 'source': 'experiments/tariff-proof-selection/M12_DIRECTIONAL_REGISTRATION_REVIEW.md', 'traceCallIndex': 5, 'edgesInclusive': [77, 79]},
                  mapControls=[{'scope': 'mainline junction to22Н-0239', 'meters': 57000, 'minutes': 53, 'status': 'UNRESOLVED_DETOUR', 'polylineSnapRetrieved': False},
                               {'scope': 'ramp interior to22Н-0239', 'meters': 165, 'minutes': 1, 'status': 'SHORT_CONTROL_CONSTRUCTED', 'polylineSnapRetrieved': False}],
                  geographyStatus='Original coordinates/topology and selected traversal confirmed; independent current motorway→ramp routability unresolved. No specific cause established.',
                  operatorGap='Three physical frames have no registered operator IDs; actual22Н-0239 is not automatically order302 Арзамас/Р158. No individual frame price or nearest tariff endpoint assigned.')


def m11():
    p = SNAP + 'm11/2026-10-18-ckad47-entry/'
    node_path, merge_path = p + 'node8087316065.osm', p + 'way1270188032.osm'
    entry = data(p + 'directed-ckad47-entry.json')
    recovered_path = BASE + 'raw/m11-exit-way1307036920-full.json'
    recovered = data(recovered_path)
    w = next(x for x in recovered['elements'] if x['type'] == 'way')
    assert w['id'] == 1307036920 and w['tags']['oneway'] == 'yes' and w['tags']['destination:ref'] == 'М-10'
    pts = [xp('M11', xml(node_path), '8087316065', 'entry', 'ПВП18 ЦКАД47; не виртуальная58', node_path, 'CKAD_approach_toward_M11_northbound', ['954011576'], ['ЦКАД', 'М-11']),
           xp('M11', xml(merge_path), '3566326245', 'technical', 'Merge со стороныЦКАД на М11', merge_path, 'toward_M11_northbound', ['791520973', '1270188032'], ['ЦКАД', 'М-11']),
           jp('M11', recovered, '6588472831', 'plaza', 'Воскресенское147, выходная северного маршрута касса', recovered_path, 'from_M11_northbound_to_M10', ['1307036920'], ['М-11', 'М-10']),
           jp('M11', recovered, str(w['nodes'][-1]), 'technical', 'Конец кассовой части съезда, не конечный узел М10', recovered_path, 'from_M11_northbound_to_M10', ['1307036920'], ['М-11', 'М-10'])]
    pts[0]['operatorScheme'] = entry['officialIdentity']['path'] + '#page=5'
    pts[0]['operatorFacilityIdentity'] = entry['officialIdentity']['fact']
    return finish('M11', [node_path, merge_path, p + 'directed-ckad47-entry.json', p + 'entry-local-map.osm', recovered_path, BASE + 'raw/m11-entry-short-route-accessibility.txt'], pts,
                  directedEntry=entry['wayConnectivity'], exitGateWay={'id': str(w['id']), 'nodeOrder': [str(n) for n in w['nodes']], 'tags': w['tags']},
                  sourceRecovery='Gate coordinate already known from inventory report; new full-way200 recovers missing original raw proof, not a newly discovered physical gate.',
                  mapControl={'scope': 'PVP18 approach to merge', 'meters': 29900, 'minutes': 22, 'status': 'UNRESOLVED_DETOUR', 'polylineSnapRetrieved': False},
                  virtual58={'position': None, 'operatorPartition': None, 'notEquivalentTo': ['PVP18/CKAD47', 'nearby Solnechnogorsk facility']},
                  operatorGap='p58→p147 cells610/750 retained, but this exact CKAD→58head/mainline→147 vector remains unbound. A physical booth at virtual58 is not required.',
                  geographyStatus='Original directed entry and saved northbound exit are documented; current map control detour is unresolved, not proof that all existing M11 routes are wrong.')


def ckad():
    path = BASE + 'raw/ckad-way1080462753-full.json'
    source = data(path)
    way = next(x for x in source['elements'] if x['type'] == 'way')
    assert way['id'] == 1080462753 and way['tags']['oneway'] == 'yes'
    pts = [jp('CKAD', source, node, 'technical', title, path, 'selected_southbound_A113', ['1080462753'], ['А-113/ЦКАД'], 'inspected local A113 raster, not operator free-domain boundary')
           for node, title in [('9903493812', 'Начало точного OSMway внутри сохранённого блока'), ('12443433262', 'Рамка по OSM; не доказательство отдельной оплаты'), ('9903493803', 'Конец точного OSMway внутри сохранённого блока')]]
    assert way['nodes'].index(12443433262) < way['nodes'].index(9903493803)
    return finish('CKAD', [path, 'experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c4-ckad.json', BASE + 'raw/ckad-local-short-route-accessibility.txt', BASE + 'raw/ckad-local-osm-z15-19752-10264.png'], pts,
                  directedWay={'wayId': str(way['id']), 'nodeOrder': [str(n) for n in way['nodes']], 'tags': way['tags']},
                  mapControl={'meters': 570, 'minutes': 1, 'fromLabel': 'ЦКАД,275-й километр', 'toLabel': 'ЦКАД,274-й километр', 'status': 'SHORT_CONTROL_CONSTRUCTED', 'operatorChainageCertified': False},
                  operatorGap='General PK5 free status is retained; this exact block still lacks an official free-domain crosswalk or payable pair. OSM fee/toll and map address km cannot establish a charge or zero.',
                  geographyStatus='Exact gantry and parent-way coordinates/order bound to the retained contiguous block; endpoints are not separately proven interchange or operator endpoints.')


def zsd_extended():
    path = BASE + 'raw/zsd-planernaya-way355755817-full.json'
    source = data(path)
    way = next(x for x in source['elements'] if x['type'] == 'way')
    assert way['id'] == 355755817 and way['tags']['oneway'] == 'yes'
    rvp_path = SNAP + 'zsd/2026-10-18-shkipersky/way351741889.osm'
    rvp = xml(rvp_path)
    pts = [jp('ZSD', source, str(n), 'plaza' if n == 1766158781 else 'technical', 'Планерная: локальная кассовая ветвь', path, 'northbound_exit', ['355755817'], ['ЗСД', 'Планерный/Богатырский выход']) for n in way['nodes']]
    pts.append(xp('ZSD', rvp, '13020687195', 'technical', 'РВП64/64E на проспектеКрузенштерна; не кассовый шлагбаум', rvp_path, 'westbound_toward_ZSD', ['351741889'], ['проспект Крузенштерна', 'ЗСД']))
    rvptags = tags(rvp.find('node[@id="13020687195"]'))
    assert rvptags['ref:rutoll'] == '64E'
    return finish('ZSD_EXTENDED', [path, rvp_path, 'experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c4-zsd.json', BASE + 'raw/zsd-planernaya-short-route-accessibility.txt'], pts,
                  directedGate={'wayId': str(way['id']), 'nodeOrder': [str(n) for n in way['nodes']], 'tags': way['tags']}, rvp64={'tags': rvptags, 'sourceNodeOrder': [n.get('ref') for n in rvp.find('way').findall('nd')]},
                  selectedPlanernayaWitness={'caseId': 'max-chain-m12-ckad-m11-zsd-arzamas-to-prim', 'capturePath': SNAP + 'systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-arzamas-to-prim/2026-10-15T23-58-33-171Z-capture.json.gz', 'callIndex': 11, 'gateEdgeIndex': 109, 'orderedLocalWays': ['252148968', '355755817', '151490266', '355755820', '192140964', '151490260']},
                  mapControl={'meters': 172, 'minutes': 1, 'status': 'SHORT_CONTROL_CONSTRUCTED', 'scope': 'gate-area to local urban-fork reference from another saved motif; not the whole Arzamas route or proof of reentry', 'polylineSnapRetrieved': False},
                  operatorGap='Full entry/exit cash-card zone/payment bundle and any applicable receipt treatment still unknown. RVP64/64E is registration infrastructure; do not import finished600 or isolated300/zero.',
                  geographyStatus='Exact Planernaya gate and RVP64 primary coordinates retained; full larger route outer operator boundary and legal/payment scope not inferred.')


builders = {'m12': m12, 'm11': m11, 'ckad': ckad, 'zsd-extended': zsd_extended}
assert len(sys.argv) == 2 and sys.argv[1] in builders
print(json.dumps(builders[sys.argv[1]](), ensure_ascii=False, indent=2))
