# Experiment5 — virtual boundary: documentary result

27.10.2026. PARTIAL: accounting interface documented; exact directed graph cut not established. Source bbeb379812ead03292b6ade2f84bbdaf0f5cd869. PR14 Draft; CI40490652289 SUCCESS before work. No runtime changes.

## Two originals, not two coordinate proofs

| Original operator document | Inspected locations | Meaning / limits |
| --- | --- | --- |
| [2024 rules](https://m11-neva.ru/upload/iblock/311/4hw1aeccglhdprdbt6f5opqhpj1vxoua.pdf), Appendix2, order U0222.01,09.08.2024;25pages | Cover visually; §2.2/p3 local text; p6 text and visual schematic | Consecutive paid sections can have no physical mainline plaza at their interface. Entry/exit and actual path determine charges. After Солнечногорск the document identifies a virtual connection15–58↔Section1. No coordinates, OSM IDs, directed cut-line or engineering chainage tolerance provided. |
| [2022 rules](https://m11-neva.ru/upload/iblock/8b7/tgn9c0whre2rdu2ub90es3vx22st88h5.pdf), order U0231.01,19.08.2022;22pages | Original PDF web extraction cover/§2.2/p3 and p5 | Same virtual connection stated on p5; §2.2 has shorter entry/exit description than2024. This is historical corroboration, not independent current geometry or a second operator authority. |

The2024 original is already retained at `experiments/nationwide-tolls/source-documents/m11-head-passage-rules-retrieved-2026-10-14.pdf`; no redownload or repeated tariff/PDF hash audit. Older original read through web PDF tool; original bytes not locally retained and no byte hash claimed. No evidence of repeal or latest-version exclusivity established by merely opening either URL.

2024p6 schematic shows road interchange branches and tariff-plaza labels; it is not a georeferenced engineering plan. Geometric scaling of this diagram cannot locate a virtual line. `data/tolls/m11/2026-02-24-15-58-facility-evidence.json` already records virtual-boundary-after-pvp58 with coordinate/routeKm/direction null; documentary existence is **reconfirmed, not newly discovered**.

## Distinct objects

- Physical plaza: observable lane/booth crossed by the vehicle, with directed approach and exit edges.
- Product boundary: legal/accounting partition between adjacent charged domains. Not necessarily a physical plaza and not necessarily positioned at a toll-product's rounded label.
- Virtual accounting point: system transaction identity used to allocate a through journey between sections. It may have no OSM toll_booth object. Existence alone does not prove the location or crossing of a particular graph edge.

Thus absence of58km booth events is **compatible with** through-section collection architecture; it is not proof of crossing and does not prove the saved trace missed a booth for this reason. MethodA requiring a booth at every internal domain interface can have false negatives. Replacing it with a kilometre radius would introduce false positives.

## Required independent bridge

Prefer dated operator/concession interface act or as-built road passport identifying the15–58/Section1 split, chainage system and both carriageways; an official junction/collection diagram must distinguish mainline from Солнечногорск/Солнечногорск-2 access lanes. Link that to retained OSM parent-way/node order using independently named road junctions and exact surveyed anchors. Also establish the neighboring operator's product definition mapping that interface to p58 in the applicable matrix. For October2026 check document revision applicability separately; do not infer it from2024 publication date.

Alternative evidence can certify a unique continuous directed path between independently identified product entry/exit that necessarily traverses the documented interface, even without a measured crossing coordinate. It still needs an authoritative section partition and exhaustive branch exclusion; route label, city label and distance are insufficient.

## Bounded work sequence

1. This documentary comparison and textual checks; preserve before next block.
2. Existing three traces and parent ways around58km: separate observable path from missing official partition; compareA/physical,B/certified cut,C/unique section-path proof. Build a detector only if inputs can be certified, not a new synthetic generic engine.
3. If unlocated: record precise missing inputs and move to another B04–B09 pair with new primary evidence. No tariff edits or public integration.

Checks actually run: `pdftotext -f3 -l3 ... - | rg -n 'границах|отсутствуют|маршрута'` matches p3; `pdftotext -f6 -l6 ... - | rg -n 'Виртуального|Секцией 1'` matches p6; older PDF original extraction separately inspected. `git diff --check` required before commit. These are documentary checks, not route replay or pricing tests.

New located physical/virtual boundaries0; newly established complete pairs0; monetary components0; functional blockers removed0. One documented virtual interface is reused. Prices remain unknown/null where route applicability is incomplete.
