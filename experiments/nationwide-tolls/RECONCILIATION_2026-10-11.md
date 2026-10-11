# Toll source consistency audit — 2026-10-11

## Findings

1. national-registry.json snapshot asOf 2026-10-10 lists M3 rows: 65-86 =100, 112-150=190, 150-194=190 Mon-Thu /230 Fri-Sun. Sum on Friday =520 RUB, not 800 RUB.
2. M1_M3_EVIDENCE_2026-10-09.md describes a distinct source-day 2026-10-09 M3 shadow 200+320+280=800 RUB from data/tolls/2026-10-01-avtodor-other-roads-category1.json. These are different snapshots and values. No conclusion can be drawn about which applies without primary operator version and exact charge semantics. Never combine either set into customer money.
3. M1 mainline km46 and Odintsovo bypass local km4.6 are different operator charging systems. See M1_OPERATOR_SCOPE_AUDIT_2026-10-11.md.

## Required release gate

- Explicit tariff effective-from and valid-through evidence; operator category/payment/direction; exact selected-route PVP/entry-exit mapping; full operator receipt; regression in both directions.
- Until independently reconciled: UNKNOWN, not zero or 520/800, and no production cutover.

## Work status

Documentation/source consistency inspection only. No Node tests, Next build, Valhalla live route, browser E2E, deployment or operator receipt verification performed. Next: obtain operator dated primary tariff and same-route M1 physical evidence.
