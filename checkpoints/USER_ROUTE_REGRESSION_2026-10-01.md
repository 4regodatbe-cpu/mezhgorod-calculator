# Real user route regression controls — 2026-10-01

Source: screenshots supplied by the calculator tester on 2026-10-01. These are external QA controls only; they must not be hard-coded as live route answers.

## Golubitskaya → Saint Petersburg
- Calculator before systemic fix: 2214.7 km; toll 3220 RUB Mon–Thu / 3810 RUB Fri–Sun.
- Yandex screenshot: 2214 km; toll estimate ~13350 RUB.
- Diagnostic meaning: route distance was excellent (~0.03% difference), but toll composition was grossly incomplete. This is the primary long-route toll composition check.

## Krasnodar → Moscow
- Calculator before systemic fix: 1334.1 km; 5040 / 6090 RUB.
- Existing verified control already expects 5040 / 6090 RUB for the matching current route family.
- Diagnostic meaning: M-4 route-specific control behaves plausibly and must remain green after composition changes.

## Krasnodar → Saint Petersburg
- Calculator before systemic fix: 2066.9 km; 10803 RUB shown as one total in the later tester screenshot; an earlier build also demonstrated the M-4-only/partial-price failure mode.
- Diagnostic meaning: the final price must represent all detected paid-road families, never first-success wins. If connector/M-11 coverage is incomplete, the API must return unknown rather than a partial numeric total.

## Vityazevo → Saint Petersburg
- Tester reported a value around 3000+ RUB before systemic fix.
- Diagnostic meaning: another southern-origin → Saint Petersburg check for the same systemic composition defect; no route-specific hard-coded correction is allowed.

## Kazan → Yalta
- Calculator screenshot: 2269.6 km, 32 h 19 min, toll 1360 RUB Mon–Thu / 1550 RUB Fri–Sun, route quality = one service.
- Yandex screenshot: 2135 km, about 32 h, toll estimate ~1763 RUB.
- Distance deviation: about +134.6 km / +6.3% versus the Yandex reference.
- Toll deviation before the A-289 no-transponder correction: -403 RUB (-22.9%) against the 1360 weekday value; the current A-289 mode correction adds 303 RUB on a full A-289 traversal, which materially explains much of the toll gap but does not by itself prove full-route exactness.
- Diagnostic meaning: this route is a dual check: (1) A-289/toll-family composition, and (2) degraded fast-route quality when only one live routing service succeeds. The latter is a separate routing reliability issue and must not be hidden by toll fixes.

## Release rule
No production release may claim this regression set is solved merely because a numeric value is returned. Mixed-family routes require complete composition or `pricingStatus=unknown`; single-provider route quality remains explicitly degraded until a second live provider or a safe fallback confirms the route.
