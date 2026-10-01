# Segment 6A3B2B — M-11 58–679 physical facility inventory plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED / DATA + MODEL ONLY
Production `main`: unchanged.

## Goal

Persist authoritative physical PVP identity/chainage for the M-11 58–679 tariff system without inventing coordinates and without forcing newly opened infrastructure into an older tariff snapshot.

## New source-drift fact

The March 2026 official Avtodor tariff PDF explicitly identifies 21 tariff/PVP points for km 58–679.

On 18 September 2026, official operator/state-road sources announced a new PVP opened at M-11 km 593 as part of the new interchange. That point does not exist in the March matrix currently stored in the repository.

Therefore the current March tariff inventory is structurally stale for October 2026 even before monetary freshness is considered.

## Safe model rule

Facility evidence and tariff-point inventory are separate layers.

- Existing 21 March points may receive attached physical PVP evidence because the official tariff PDF itself labels them as PVP points.
- The new PVP 593 must be persisted as authoritative facility evidence but remain **unbound** to a tariff point until a current official tariff snapshot proves its tariff-point identity and matrix relationships.
- An unbound facility must never become priceable by inference.
- Coordinates stay `null / unresolved` unless independently proven.

## Implementation

1. Add `2026-03-02-58-679-facility-evidence.json` containing the 21 official PVP identities/chainages from the Avtodor PDF.
2. Add `2026-09-18-58-679-facility-delta.json` containing the newly opened PVP 593 with `tariffPointId=null`.
3. Extend `m11-boundaries.ts` so evidence may contain an authoritative unbound facility.
4. Expose unbound facilities separately on the tariff system; never attach them to the nearest/adjacent tariff point automatically.
5. Preserve strict rejection for an unknown **non-null** tariffPointId.
6. Extend deterministic tests:
   - 21 attached 58–679 facilities;
   - 1 unbound PVP 593;
   - all coordinates unresolved;
   - p593 is not present in the March tariff-point list;
   - no production API integration;
   - no monetary fields in the boundary model.
7. Run the <=20 minute workflow and production build.

## Sources

- March tariff matrix: `https://avtodor-tr.ru/upload/iblock/402/k44r7q8jiukdw84ropm7pgd9khjh5o4h.pdf` — approved by State Company Russian Highways order 27.02.2026 No. 35.
- Official operator opening notice for PVP 593: `https://unitoll.ru/about/press/news/na-593-km-dorogi-m-11-neva-otkrylas-transportnaya-razvyazka/`.
- State transport confirmation of the 593-km interchange opening: `https://mintrans.gov.ru/eye/press-center/news/12987`.

## Stop condition

Do not begin exact arbitrary-pair 58–679 pricing while the current tariff snapshot lacks the new 593 point or while a current complete matrix has not been captured and validated.
