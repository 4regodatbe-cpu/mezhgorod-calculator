# Segment 6A3A — M-11 official tariff snapshot plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED / DATA ONLY
Production `main`: unchanged.

## Goal

Freeze current official Category-I M-11 tariff data in versioned repository files before any monetary integration.

Routing evidence and tariff money remain separate domains:

- Valhalla/OSRM road evidence says where the vehicle travels;
- official operator documents say what a proven entry/exit traversal costs.

No tariff file created in 6A3A is imported into `/api/v2/calculate`.

## Why 6A3A is split

The 15–58 concession table is a manageable directional 7-point matrix with day/time rules and can be transcribed/validated completely in one bounded segment.

The 58–679 Avtodor document contains two large Category-I entry/exit matrices (Mon–Thu and Fri–Sun). Manually copying hundreds of cells in one step creates an unacceptable transcription risk.

Therefore:

- **6A3A1** freezes the complete 15–58 Category-I matrix, the official 58–679 point inventory plus the fully verified km58-origin control row, and the separate 679–684/Pulkovo tariff;
- **6A3A2** freezes the complete 58–679 Category-I matrices with independent structural/control validation before they can be used by a pricing core.

Incomplete 58–679 data in A1 is explicitly marked diagnostic/incomplete and must never be used as a fallback for arbitrary entry/exit pairs.

## 6A3A1 official source set

### M-11 section 15–58

Operator/source domain: `m11-neva.ru`.

Official current document:

`https://m11-neva.ru/upload/iblock/c7f/dqr24p9c4pctph5s4897if1r05agru30.pdf`

Document states:

- tariffs valid from 01:00 24 April 2026;
- no-transponder users;
- Category/Group 1 includes passenger cars and vans/minibuses up to 11 seats;
- night band: all days 01:00–06:00;
- day band runs 06:00–01:00 next day;
- day profiles: Mon–Thu, Friday, Saturday, Sunday;
- direction matters;
- special 2026 holiday/pre-holiday profile overrides are listed in the document.

The operator news page additionally states the seasonal tariff period is from 24 April through 1 November 2026. The tariff PDF itself gives a start date but no explicit end timestamp, so repository metadata must keep `effectiveTo=null` and store the announced seasonal window separately rather than inventing an exclusive end instant.

### M-11 section 58–679

Operator/source domain: `avtodor-tr.ru`.

Official detailed tariff PDF:

`https://avtodor-tr.ru/upload/iblock/402/k44r7q8jiukdw84ropm7pgd9khjh5o4h.pdf`

Approved by State Company Russian Highways order dated 27 February 2026 No. 35.

Category-I matrices are separated into:

- Mon–Thu, except weekends, non-working holidays and pre-holiday days;
- Fri–Sun, weekends, non-working holidays and pre-holiday days.

A1 will persist the ordered official tariff-point inventory and the exact km58-origin row only. Full arbitrary-pair matrices remain unavailable until A2.

### M-11 section 679–684 / Pulkovo approach

Same official order/PDF, Appendix No. 2.

Category I:

- official listed amount: 94 RUB;
- applies to the separately defined Pulkovo approach / km679–681 / km681–684 system under the operator's RVP fixation rule;
- must not be added merely because a route reaches Saint Petersburg.

Exact applicability remains a 6A3B route-evidence problem.

## Data model requirements

Every snapshot must carry:

- system/section id;
- operator;
- vehicle category;
- payment assumptions;
- effective-from date/time where published;
- effective-to only if explicitly known;
- source URL;
- source document/order metadata;
- extraction completeness;
- day/time profile semantics;
- tariff points / directed routes;
- explicit notes where road km and PVP km differ.

Money is integer RUB only.

## A1 validation controls

### 15–58

At minimum assert:

- Moscow→Solnechnogorsk: 880 night, 1130 Mon–Thu, 1650 Fri, 1650 Sat, 1260 Sun;
- Solnechnogorsk→Moscow: 880, 1130, 1260, 1500, 1650;
- Moscow→TsKAD: 110, 880, 1320, 1320, 940;
- TsKAD→Moscow: 110, 880, 940, 1100, 1320;
- all 42 directed non-diagonal Category-I route pairs are present;
- holiday overrides exactly match the current official document.

### 58–679 A1 control row

Assert Category-I amounts from km58/PVP58 to:

- 67: 70 / 100;
- 89: 200 / 260;
- 149/PVP147 (Tver): 610 / 750;
- 334/PVP330: 1910 / 2050;
- 543/PVP545: 3160 / 3320;
- 646/PVP647: 3600 / 3890;
- 668: 3790 / 4070;
- 679: 3900 / 4200;

where each pair is Mon–Thu / Fri–Sun.

### 679–684/Pulkovo

Assert Category I = 94 RUB and keep route applicability separate from amount.

## A2 requirements before full 58–679 matrix is accepted

1. two complete Category-I matrices are transcribed from the official PDF;
2. point order is identical across both matrices;
3. diagonal is absent/zero by representation, never a fabricated toll;
4. matrix symmetry is checked where the official table is symmetric;
5. km58-origin rows exactly reproduce A1 controls;
6. multiple interior pairs are independently cross-checked against the PDF;
7. every amount is integer/non-negative;
8. no missing cell is interpolated;
9. any unreadable/ambiguous cell blocks A2 completion rather than being guessed.

## Gates

- data/checkpoint/test files only;
- no production pricing import;
- deterministic data assertions green;
- production `pnpm build` green;
- each workflow <=20 minutes;
- production `main` unchanged.

## Next

Execute 6A3A1, validate it, save a result checkpoint, then proceed to 6A3A2 full 58–679 matrix extraction.
