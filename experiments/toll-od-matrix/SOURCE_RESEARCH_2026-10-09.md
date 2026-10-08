# M-4 official tariff source research — 2026-10-09

This is **source discovery and provenance**, not a verified directed tariff-matrix import. The source material must be matched to the **identical actual chosen route and exact PVP sequence** before entering the approved compiler intake.

## Operator references checked

1. **Official Avtodor announcement, 27 February 2026**, tariffs indexed effective **2 March 2026**: https://avtodor-tr.ru/press-center/news/na-m-12-vostok-vvodyatsya-novye-abonementy-/ . The announcement explicitly states **5 040 RUB** for a passenger car on the complete Moscow–Krasnodar M-4 corridor, **Monday–Thursday** after indexation. It also discusses loyalty/transponder discounts; the discount amount is NOT applicable to our untranspondered category-I schedule. The announcement is a **global control value**, not the full list of gate crossings or arbitrary partial-corridor cost. No matching PVP event-sequence evidence was extracted.
2. Official current tariff landing page: https://avtodor-tr.ru/road/tariffs/ . Web index shows M-4 category-I weekday/weekend breakdown and links to detailed PDFs. **Direct retrieval attempted on 2026-10-09 returned HTTP 403**; complete current tariff PDF and its effective date were **not** successfully inspected in this session.
3. Official charging rules: https://avtodor-tr.ru/info/legal-info/pravila-proezda/ . Indexed page describes predominantly **open charging at actual PVPs** on M-4, except mixed sections approximately 414–464 and 633–741. An alternative official rules path https://avtodor-tr.ru/company/docs/proezd/ describes 401–464 and 633–741; discrepancy in start chainage must be audited, not silently erased.
4. Official historical source about PVP 545 with two possible charge portions: https://avtodor-tr.ru/press-center/news/rezhim-platnosti-vveden-na-uchastke-avtomobilnoy-dorogi-m-4-don-v-obkhod-sela-novaya-usman-i-sela-ro/ . Historical rules support that a physical 545 crossing can correspond to more than one published tariff row. Its 2016-era prices must NOT be treated as 2026 fares.
5. Existing copied source snapshot `sources/m4-data.ts`, dated 2026-09-29 in the source comment. Treat it as prior code evidence, not proof that the *combination of selected PVP gates and official aggregate charge* is correct.

## Status and next verification

- Official current **complete Moscow–Krasnodar weekday control** found: 5 040 RUB. Relevant tariff **period date** established from announcement: 2 March 2026.
- Official *complete PVP signature of that exact trip*: **NOT VERIFIED**.
- Current official full *weekday and weekend* amount pair for the **exact same directed/geometry-defined PVP signature**: **NOT VERIFIED**.
- Individual specific route entry/exit proof, receipt context 339/355, double-row 545, mixed-zone elapsed time: **NOT VERIFIED together with a matching total**.
- **Accepted M4 directed `priceCells`: 0.** Do not fill a record from the 5 040 ₽ headline alone.

## Source lifecycle checklist

1. Open operator tariff document or accessible full page with dated source; capture title/document id, page/section, effective date and payment conditions.
2. Pair with same-route proof: selected route ID, map-matched exact all actual PVP events, direction and mixed-zone status.
3. Independently confirm whole-corridor operator cost for that exact route; enter complete per-PVP ledger and separate documented total.
4. Run offline compiler; run Node test corpus; compare generated cell with direct control; record provenance and SHA in WORK_LOG.
5. Keep all uncertain routes at `unknown/null`, never `0 ₽`.

## 2026-10-09 — current calendar exception list and contradictory time limits

**2026 tariff category (operator official tariff landing page):** https://avtodor-tr.ru/road/tariffs/
- Mon–Thu does NOT include public holidays, weekends, and official pre-holiday days; Fri–Sun tariff applies to those exception dates.
- Operator explicitly lists weekday exceptions in **2026**: **March 9, April 30, May 11, June 11, November 3, December 30 and 31**. Federal fixed holidays Jan 1–8, Feb 23, Mar 8, May 1/9, Jun 12, Nov 4 also excluded from Mon–Thu when applicable.
- This supports `m4-fare-calendar-2026.mjs`. Do not extrapolate complete 2027 holiday schedule without verifying official calendar. The quoted tariffs take the *actual passage timestamp* of each PVP, not just the route's departure date.

**Conflicting operator pages (both indexed in October 2026):**
1. https://avtodor-tr.ru/info/legal-info/pravila-proezda/ — for 633–672 km: **60 minutes** grace before another payment; first mixed area described as 414–464 km.
2. https://avtodor-tr.ru/company/docs/proezd/ — for 633–672 km: **120 minutes** grace; first area described as 401–464 km.
3. Both say **12 hours** for the first mixed section.

This is a **real provenance conflict**, not a reason to decide one value by intuition. The exact operator document effective date and any revision/mode-specific rule must be resolved. Conservative sandbox solution: if two specific mixed gate events are verified, elapsed time ≤60 min => within window regardless of which text applies; >120 min => exceeding both; **(60, 120] minutes => unknown**. A single gate cannot prove the entry/exit receipt status. Even known window does not by itself authenticate a fare.

**Historical context:** https://avtodor-tr.ru/press-center/news/rezhim-platnosti-vveden-na-uchastke-avtomobilnoy-dorogi-m-4-don-v-obkhod-sela-novaya-usman-i-sela-ro/ (2016) explains that **physical PVP 545** historically collects for two segments based on the actual route. Never use the 2016 prices as current 2026 fares; evidence of two row possible is not permission to charge both on every 545 crossing.

**Open needs:** operator 2026 M4 detailed tariff PDF/document with effective date and exact rate rows; independent same-route PVP sequence; verified timing. No full tariff cell imported.
