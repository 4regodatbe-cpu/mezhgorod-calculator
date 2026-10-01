# Segment 6A3B2D — M-11 stable OSM toll-object inventory result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PARTIAL GREEN / CONTROL METHOD PROVEN 3 OF 5 / NO PRODUCTION CHANGE
Production `main`: unchanged.

## Goal

Test whether stable OpenStreetMap toll-facility objects can provide a trustworthy physical anchor layer for M-11 tariff boundaries without deriving coordinates from kilometre labels or route-provider geometry.

Control facilities:

- PVP 58;
- PVP 147;
- PVP 545;
- PVP 593;
- PVP 679.

## Accepted inventory run

Workflow: `Segment 6A3B2D M11 OSM toll object inventory`
Run: `36848648128`
Job: `110324792255`
Head: `6220cc01594cb24faa75a4eb734053743a8c4ec5`
Result: SUCCESS
Artifact: `11154876262` (`m11-osm-toll-object-inventory`)

Observed:

- bounded corridor query completed against `https://overpass-api.de/api/interpreter`;
- 413 toll-infrastructure objects returned;
- 71 objects matched the initial M-11 text heuristic;
- diagnostic-only / no-production-import gate passed;
- the artifact contains stable OSM object IDs, tags and coordinates.

The inventory also exposed clearly named M-11 controls outside the five-facility test set (for example PVP 159, 177, 258, 330, 348, 385 and 649), demonstrating that object-level OSM toll evidence is available on this corridor.

## Rejected broad rerun

Run `36849261373` attempted the broad corridor query again only because the workflow had been extended with parent-context inspection.

Observed:

- `overpass-api.de`: HTTP 504;
- `overpass.kumi.systems`: timeout/abort.

Decision:

- reject the rerun as an external-provider availability failure;
- do not repeat the same broad request again;
- retain the already accepted artifact from run `36848648128`.

## Narrow context run

Run: `36849513645`
Head: `d65395261cd29aea8207b43acd5703d2ae1ec8ab`

The run queried only already-discovered stable OSM object IDs and nearby parent-road context. It completed three controls before an external Overpass failure occurred on PVP 593.

Valid completed control evidence from the run is retained; the failed later request does not invalidate earlier completed results.

### PVP 58 — method proven

Observed toll-booth anchor groups include stable OSM nodes around two distinct physical 58-km facilities.

Named OSM ways in the same local context include:

- `way/580575025` — `ПВП-7 «Солнечногорск» - 58 км`;
- `way/795559452` — `ПВП «Солнечногорск - 2» 58 км`;
- `way/795563883` — `ПВП «Солнечногорск» - 58 км`.

The same context contains multiple M-11 motorway/trunk-link ways.

Official operator infrastructure data independently lists both `ПВП «Солнечногорск» – 58 км` and `ПВП «Солнечногорск – 2» – 58 км`.

Decision:

- PVP 58 proves that one tariff boundary may map to multiple physical facility/anchor groups;
- use an anchor-set model, not one fabricated centroid coordinate.

### PVP 147 — method proven

Stable toll-booth nodes:

- `node/6588472831` — `56.7331188, 36.2530645`;
- `node/6588472832` — `56.7339197, 36.2537629`.

Named OSM facility way:

- `way/795249782` — `ПВП «Воскресенское» - 147 км`.

Nearby context includes `Воскресенское`, M-10/trunk links, and the M-11 route relation. Official/operator infrastructure evidence independently identifies PVP 147 in the same route context.

Decision:

- stable object identity + explicit coordinates + named facility context + independent official identity are sufficient to prove the anchor-set method for this control.

### PVP 545 — method proven

Stable toll-booth nodes:

- `node/4348992194` — `58.8001469, 31.4709777`;
- `node/4348992195` — `58.8001850, 31.4707594`;
- `node/4348992196` — `58.8002094, 31.4705152`;
- `node/4348992197` — `58.8002258, 31.4702981`;
- `node/13267626813` — `58.8001201, 31.4711795`.

The local context contains M-11 `Нева` motorway ways plus trunk-link/service access and an `Автодор` object. Current operator infrastructure pages independently identify the M-11 km-545 junction/PVP context and customer-service access after PVP 545.

Decision:

- anchor-set method proven for PVP 545.

### PVP 593 — candidate discovered, context unfinished

Stable OSM toll-booth candidates from the accepted broad inventory:

- `node/13249401006` — `59.1976987, 31.2534812`;
- `node/14162143275` — `59.2039200, 31.2595577`.

Official operator news independently confirms the new PVP associated with the km-593 interchange opened on 18.09.2026 in the closed toll system.

The narrow parent-context request failed before this control could be completed because both public Overpass endpoints were unavailable.

Decision:

- candidates remain diagnostic only;
- do not promote until exact local road/facility context is proved by a changed, narrower method.

### PVP 679 — candidate discovered, context unfinished

Stable toll-booth cluster from the accepted inventory:

- `node/7014845625` — `59.7749278, 30.3590860`;
- `node/7014845624` — `59.7749529, 30.3591969`;
- `node/7014845623` — `59.7749750, 30.3592940`;
- `node/7014845622` — `59.7749969, 30.3593907`;
- `node/7014845621` — `59.7750199, 30.3594921`;
- `node/7014845620` — `59.7750406, 30.3595836`;
- `node/7014845619` — `59.7750634, 30.3596840`;
- `node/2492861243` — `59.7750977, 30.3598352`;
- `node/2492861246` — `59.7751615, 30.3601165`;
- `node/7014845616` — `59.7751841, 30.3602159`;
- `node/7014845615` — `59.7752048, 30.3603074`;
- `node/7014845614` — `59.7752303, 30.3604199`.

The accepted inventory separately contains two named Pulkovo toll gantries around `59.7902, 30.33446`:

- `node/13377945035` — `М-11 - Аэр. Пулково`;
- `node/13377945036` — `Аэр. Пулково - М-11`.

Current official tariff material treats the Pulkovo approach as a separate charged component, so these named gantries must not be silently merged into PVP 679.

Official/operator infrastructure evidence independently identifies PVP 679 / the km-679 service context.

Decision:

- main booth cluster is a strong PVP-679 candidate;
- Pulkovo gantries remain a separate evidence group;
- do not promote PVP 679 until narrow parent-road context confirms the main cluster identity.

## Promotion threshold

Original control rule: prove at least three of five controls with no false-match pattern before scaling the method.

Observed:

- PVP 58 — proven;
- PVP 147 — proven;
- PVP 545 — proven;
- PVP 593 — unresolved pending narrow context;
- PVP 679 — unresolved pending narrow context.

Threshold result: **3 / 5 — PASSED**.

The stable OSM anchor-set method is therefore proven enough to scale, but only verified controls may be persisted as promoted evidence. Unresolved controls remain unresolved.

## Architecture decision

A toll boundary must support an **anchor set**, not a single synthetic coordinate.

Reasons:

- a physical PVP can contain multiple lane-level toll-booth nodes;
- one tariff point can map to more than one physical facility (PVP 58 proves this officially);
- computing and storing an artificial centroid would throw away source identity and could blur distinct facilities.

The spatial evidence layer should retain stable source object IDs and their explicit coordinates.

## Truth constraints preserved

- no kilometre-to-coordinate derivation;
- no city-centre coordinate substitution;
- no nearest-road substitution;
- no route-provider endpoint relabelled as a PVP;
- no legacy coordinate promoted without independent proof;
- unresolved PVP 593/679 candidates remain unpromoted;
- no M-11 pricing change;
- no import into `/api/v2/calculate`.

## Next safe action

Use a changed, narrower query method only for the unresolved PVP 593 / PVP 679 candidates and the separate Pulkovo gantry control. Persist partial results even if one provider request fails. Do not rerun the broad 413-object corridor inventory.

After those two controls are classified, create a versioned M-11 OSM anchor-set evidence file and deterministic validation gate before any production resolver work.
