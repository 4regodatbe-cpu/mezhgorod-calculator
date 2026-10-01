# M-12 Segment 5B2B-2 — partial-route maneuver-span result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / STANDALONE APPROACH REJECTED

## Run

- workflow: `Segment 5B2B-2 M12 partial span`
- run id: `36763360079`
- head: `53e0794519eacc376eb0c85bc51d8060d095354f`
- artifact id: `11119388022`
- result: expected diagnostic failure
- duration: seconds, well below 10 minute limit

## Controls

- Vladimir <-> Kazan
- Murom <-> Kazan
- Arzamas <-> Kazan
- Moscow <-> Arzamas
- Moscow <-> Kazan

## Results

Four route pairs exposed strongly mirrored M-12 labeled spans:

- Murom <-> Kazan: mirror residual `0.001392`, distance spread `0.000361`;
- Arzamas <-> Kazan: mirror residual `0.001140`, distance spread `0.002088`;
- Moscow <-> Arzamas: mirror residual `0.002110`, distance spread `0.009189`;
- Moscow <-> Kazan: mirror residual `0.001478`, distance spread `0.001350`.

Counterexample:

- Vladimir -> Kazan: `642.446 km`, `3` strict M-12 maneuvers, span `18.310–574.376 km`;
- Kazan -> Vladimir: `635.515 km`, `0` strict M-12 maneuvers, no labeled span;
- route-distance spread is only `~1.08%`, so this is not explained by a radically different corridor.

## Conclusion

Normal Valhalla maneuver names are useful supporting evidence but are directionally incomplete. They must NOT be the sole production proof of M-12 traversal or entry/exit.

The 5B2B-1 full-route success remains valid as a capability finding, but 5B2B-2 proves that the method cannot be promoted standalone.

## Decision

Do not weaken the test and do not exclude Vladimir<->Kazan. Pivot to an RVP-first detector:

1. official RVP identities/prices remain authoritative;
2. route-relative physical RVP evidence is primary traversal proof;
3. maneuver labels are secondary context/fallback hints only;
4. missing road names in one direction must not turn a traversed paid road into 0 RUB;
5. unknown/incomplete evidence remains unknown, never zero.

## Next

Segment 5B2B-3: persist the 5B2A calibrated RVP evidence as a versioned evidence snapshot and build a route-shape crossing detector for those proven RVPs. First target is the actual current Moscow<->Kazan Valhalla route; no user API promotion until forward/reverse crossing sets and official tariff sum are proven.
