# City + optional street — bounded evidence, 29.10.2026

Current scope is [ADDRESS_SEARCH_SCOPE.md](../ADDRESS_SEARCH_SCOPE.md). No house completeness requirement, push/deployment/CI edit or invented coordinate. This record accompanies the four runtime files and twelve focused new regressions; all source fixtures and prior evidence remain unchanged.

## Actual provider requests: five total, no additional retries

`capture-review.json` pins four global Photon requests with q=the four requested city/street controls, layer=street and limit20, each bounded20s/sequential. `street-0.body` through `street-3.body` are original bodies; all200, approximately6.19/9.48/5.56/7.22s. `followup-review.json` records exactly one UA-country window for Donetsk (6.09s/HTTP200), justified by the global window only containing Rostov Donetsk. `donetsk-UA.body` is original. No claim of a city boundary certificate or provider SLA follows from these five observations.

| Input | Actual source observation | Correct local handler replay |
|---|---|---|
| Краснодар | Bundled admitted GeoNames | Actual settlement, zero upstream calls |
| Краснодар, Красная улица |5street features with city Краснодар, actual coordinates | Requested city/street first; approximate street label |
| Москва | Bundled admitted GeoNames | Actual settlement, zero upstream calls |
| Москва, Тверская улица | Actual Тверская street features with city Москва | Requested street first, not a similarly named street; approximate point |
| Донецк, ДНР | Bundled admitted GeoNames after comma-intent correction | DNR city first, zero upstream calls |
| Донецк, улица Артёма | Global window only Rostov city; UA window no proved DNR target | City-only Donetsk/DNR, partial/unconfirmed/settlement-centre; never pretend a Rostov point is DNR |
| Ялта | Bundled admitted GeoNames | Crimea city first, zero upstream calls |
| Ялта, улица Кирова | Source city `город Ялта`, actual Crimea street points | Street point with source-backed admitted Russian city context, not an invented translation |

Donetsk negative result is limited to the saved windows, not an assertion of universal source absence. New production URLs use the captured street layer for explicit nonnumeric street inputs while retaining the original three variants; no fan-out increase. Existing more-detailed numeric queries remain compatible. City fallback is conservative: explicit city-first, separated street input with admitted local city, pilot gate enabled. It is not a universal free-form postal parser or a new street reserve.

## Contracts and handler replay

`handler-replay.json` runs the actual current Next GET and actual admitted local corpus. **Provider I/O is controlled** and replays saved real bodies. Eight200 responses, four city-only queries zero provider calls; original source point/ID preserved for every selected street. It is not a real newly deployed Preview or new live server-to-Photon check. Full outage/cancel/deadline cases are deterministic simulated contracts. Source-file SHA256 values pin the exact runtime independently of later documentation commits.

`logs/regressions-before.log`:3PASS/4FAIL before the three original root-cause fixes. Additional pre-fix street-window contract and fixture/caching failures are preserved separately. No failing assertion was simply dropped. Final targeted output93PASS/1SKIP; mandatory full offline gate1025PASS/1SKIP/0FAIL plus quote/API checksPASS. TypeScript, scoped lint and webpack build exit0; lint has one unchanged warning. Raw logs retain original terminal whitespace/CR and are not reformatted just to pass whitespace checks.

Commands and exact scope: [code checkpoint](../../../docs/checkpoints/2026-10-29-stage-A-street-code-LOCAL-PASS.md). Original environment-specific capture/replay drivers are included for provenance; they use absolute workspace paths and are not automatic retry instructions. The capture quota is consumed; do not rerun them without a new reason.

## Geography and remaining evidence

Street membership is checked against source city/locality and region fields plus actual coordinate classification of the five priority regions, not just province-name coincidence. Original provider coordinates are never generated, shifted or copied between candidates. **Full municipal boundary geometry for every Russian city is not independently certified** by this sample. Missing/contradictory association or invalid coordinates fail to a truthful admitted city option where available.

Desktop/mobile clear/swap and one real route from the earlier A4 archive may be reused only after unchanged-file/input verification; new bounded UI acceptance is recorded separately and distinguishes any response replay. No new route request or claim of all routing providers/tariffs passing. Corrected-code hosted Preview, DNR/Artyoma coverage and an independent free **street** reserve remain unverified/blocked, not marked DONE merely by dropping houses.

Source attribution: © OpenStreetMap contributors, ODbL, https://www.openstreetmap.org/copyright ; Photon https://photon.komoot.io ; GeoNames CC BY4.0 attribution retained in API/UI. No keys, paid API, share URL or protection change used.
