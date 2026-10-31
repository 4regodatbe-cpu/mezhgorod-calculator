# Experiment4: observed opposite direction and alternate exit

27.10.2026; source remote a090b4cf1d1fa74d9fa0be14fb207a0334cc8740. Offline retained-capture review, not a new replay or routing request. Previous CI40490154733 verify/classifier SUCCESS; live jobs SKIPPED.

## Opposite booth direction now observed, not inferred

Retained `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/single-m11-tver-to-moscow/2026-10-16T00-21-53-115Z-capture.json.gz`, SHA256 `0c65966fffb33ef1e3afd404e485db07b11ccff9a06736c34db79525c20d1d52`, selected OSRM, validation.complete=true.

Parsed `calls[3].text.edges`: M10 way900434349 (index221) →900434351→900434352→423187299→900434353→**900434354 / toll_booth6588472832 (index226)**→900434354→1301779283→1119701787→1301600019→1119701786→1119701790→1119701788→**M11 way1307036914 (index234)**.

Together with independent operator147km/M10 identity and the already accepted OSM facility inventory, this establishes6588472832 as an observed **M10→M11 entry** on this route. It is distinct from6588472831 M11→M10 exit proven in M11_PHYSICAL_CROSSWALK.md. No inference from nearest lane or reverse price equality. Named facility way795249782 is retained facility context, not asserted to be the vehicle's traversed road way.

Neither this trace nor the corresponding Moscow→Тверь trace contains the original15-anchor58km inventory node set as an edge-end event. This is absence from saved trace evidence, not proof that the route missed the tariff extent or that the original inventory is exhaustive. A mainline/virtual tariff boundary may not be a toll booth event; independent operator boundary-to-mainline graph evidence is still required. Do not invent a booth crossing or admit a complete p147→p58 physical pair from the fare alone.

## Same city does not mean same tariff exit

Retained `single-m11-moscow-to-tver/2026-10-16T00-21-05-808Z-capture.json.gz` in the same runs directory; SHA256 `fdabe3231a0504f174a1b478b2eefbc1b940bb13ee74ed0bef163f0d447f3031`.
Parsed `calls[4].text.edges`: M11 way120838676(index30) →1220146778→1295769242→**1220146782 / toll_booth12007034961(index33)**. This journey does not observe either147km inventory booth6588472831/2. Its destination Тверь cannot identify that exit as p147; no official identity has been established for12007034961 in inspected retained inventory. It must not receive p58→p147 price merely because of city label.

The [operator's bypass announcement](https://m11-neva.ru/blog/otkryto-dvizhenie-po-severnomu-obkhodu-tveri-na-m-11-neva/) describes additional159/177km exits after the bypass opened; this is an alternative-exit lead only, not a node12007034961→p159 binding. Search for that exact node yielded no primary node-identity source; unrelated search results excluded.

## Result and next evidence

Now two **new route-to-existing-facility directed cross-references**, zero new facility identities, zero new tariff boundaries, zero complete pairs, zero new eligible monetary components, zero functional blockers removed. Existing direct money without complete directed physical proof remains separate. No real compose positive is possible yet without inventing missing boundaries; no production integration.

Needed next: original official scheme or retained OSM parent-node order connecting the58km mainline/product boundary to the relevant branch and exact selected trace; independently named narrow parent-road evidence for alternate booth12007034961. For M4 retain separate missing Platov/Р-260 legal coverage mapping. All existing evidence paths are in NEXT_STEPS.md; do not repeat completed PDF/capture audits.

Verification: m11-direction-controls.test.mjs checks original capture digests, ordered entry versus exit identities, alternate booth and missing58km anchor events. Test output counts one file aggregate, not three hosted route runs. Two earlier ad-hoc inspection commands had a JavaScript extra-brace SyntaxError before reading data; corrected read-only command succeeded. No application failure is attributed to those inspection errors.
