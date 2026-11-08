# Crimea routing P1: bounded real-provider controls

2026-11-02 departure; current city-centre coordinates are recorded in each JSON (not exact user-entered street addresses). No provider responses mocked. Node's standard environment-proxy support enabled for this execution environment. JSON contains API response; gzip contains routing provider responses and geometry. No fixed distances or prices added to runtime.

| Direction | km | seconds | provider | toll total RUB |
|---|---:|---:|---|---|
| Anapa→Kerch |133.153|7789|OSRM|0|
| Kerch→Anapa |134.167|7584|OSRM|0|
| Anapa→Yalta |387.857|20288|OSRM|0|
| Yalta→Anapa |387.518|20019|OSRM|0|
| Yalta→Adler |739.289|39617|OSRM|0|
| Adler→Yalta |738.937|39540|OSRM|0|
| Yalta→Moscow |1817.393|88476|Valhalla|unknown|
| Moscow→Yalta |1819.029|88127|Valhalla|unknown|
| Yalta→Rostov |765.331|37804|OSRM|unknown|
| Rostov→Yalta |763.788|37906|OSRM|unknown|
| Donetsk→Volnovakha |56.678|3414|OSRM|0|
| Volnovakha→Donetsk |58.259|3515|OSRM|0|
| Donetsk→Melitopol |298.593|16830|OSRM|0|
| Melitopol→Donetsk |299.036|16857|OSRM|0|

All 14 API results HTTP200. Six short Crimea routes replay against bridge controls and A289 evidence: no A289 frames crossed. The existing recorded Yalta–Rostov paid-bypass fixture still proves the full A289 vector 415+205+180=800; price values unchanged. Proximity or planned waypoints do not authorize charging it.

Baseline user reports Anapa→Kerch 445.6km and Anapa→Yalta 700.8km came from forced Krasnodar controls. Saved real geometry is the reproducible road reference here; no fresh Yandex/operator road-length audit was performed. Moscow/Rostov totals remain honestly unknown because complete selected M4/A289 fare applicability is unresolved; see per-route diagnostic reasons. A shorter direct bridge plan permits providers to use Krasnodar naturally, without prescribing a paid plaza.
