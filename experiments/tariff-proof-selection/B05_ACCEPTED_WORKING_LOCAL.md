# B05 accepted working component —28.10.2026 — LOCAL ONLY

New owner decision in TARIFF_SOURCE_POLICY supersedes prior experimental demand
for certified cash-lane mapping. For the retained northbound Taman→Voronezh
witness through5818209495→bypass→R298,73.9km interpretation is accepted.
Order58 categoryI cash/card cells517–544(140/160) and544–589(180/250) give
**320RUB Thursday15Oct /410RUB Saturday17Oct replay**, not the whole trip total
and not a verified receipt. No need to research that cash-lane mapping again.

Executable `m4-545-accepted-working.mjs` consumes actual provided trace evidence,
reuses the existing reviewed directional inspector, reads the accepted price
basis JSON unchanged and emits a separate product-scoped component. It does not
key off city labels, capture name/hash, route benchmark or a plausible subtotal.
Tariff/day selection uses existing Moscow-time `highwayTariffPeriod`; no new
holiday calendar rule is claimed. The approved Thursday/Saturday cases are
tested; general public holiday handling outside that profile is not certified
by this experiment. No missing effectiveFrom invented.

Explicit payment-coverage context is required. Previously charged either
product causes overlap stop, not addition; repeated gate/alternative branch/
reverse/different exit/incomplete trace/wrong category/payment/invalid date
remain unknown. Output coverageKeys names both products exactly once,
isWholeRouteTotal=false,receiptVerified=false,status=accepted_working_calculation.

Current engine comparison: M4 local pricing skips545 and resolves it via
flanking context (`m4-local-pricing.ts`, `m4-route-context.ts`). Its legacy data
has different545values and cannot simply supply this accepted order58quote.
UpperV3 uses `matrixM4Component` and `composeSelectedM4A289` to treat M4/A289/
Krasnodar bypass independently. **Do not append320to an existing M4 aggregate**.
Future integration must replace the covered545product obligation inside the
chosen M4 component and preserve all other unpriced roads; the current runtime
validation does not expose the full unpaid onward directed-edge witness used
here. Carry that existing trace evidence forward before generic live admission;
this is a technical data-contract step, not another certification requirement.

Tests `node --import ./scripts/register-ts-paths.mjs scripts/b05-accepted-working.test.mjs`:
5/5PASS, one real immutable6540-point source case (archiveSHA
db7ce8f0d256d7e2583644611c3a00adae58c5367735a146a4f9005867b9404a),
one same-geometry Saturday replay and negative controls. No22route audit,
oldexperiment8/9suite, freshcapture, tariffPDF or externalrequest. Old
history/pricingStatus/rub:null JSON remains archival and unchanged.

Transport security review still blocks publication. This source/tests/portable
patch are local preparation, **not public runtime integration or all-B05 DONE**.
No app/lib/price-basis edit. ScopedESLint0errors/0warnings; fullmandatorygate
will run once for this new implementation and the B11 tests, with explicit
source/limits. Next boundedB06–B09 primary-source leads, Opera if available.
