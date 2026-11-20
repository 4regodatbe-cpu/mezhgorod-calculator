# Repeated address search — verified Preview, 2026-10-20

Status: timeout regression fixed and verified in Preview for bounded controls. Source4f62abf4d325fa450dd876efba1fd02c1dbdd785, exact remote/local tree0808d21e2c43cef95ebdf677035e81e36e1ae1af. Previewdpl_646vu3uc3f4dJzFmQDLpaPRL9svL READY, Vercel status success. PR14open/draft, no main/merge/Production release.

URL: https://mezhgorod-calculator-24yo70y00-4regodatbe-5310.vercel.app/v3

## Full story, actual browser / POST /r

Authenticated Preview through Vercel connector temporary share URL; the access token is not stored in repo. In fresh Preview origin/cache, type Доне into A:20 selectable suggestions including Донецк—ДНР and Донецк Ростовская область; the same prefix failed in Production. Then clear A and execute exact user sequence:

1. A=Анапа, B=Краснодар, select top locality results; calculate. UI166.7km/2h26m/toll620RUB.
2. Clear B via X; type/select Ростов-на-Дону; calculate. UI429.6km/5h59m/toll1880RUB.
3. Clear A via X; type Донецк with sequential keyboard input.20 suggestions appear; select Донецк—ДНР. UI accepts selection and shows appropriate special-zone tariff inputs. No unavailable/retry message in patched sequence.

Screenshot experiments/address-search/2026-10-20-repeated-address-preview.jpg shows final Donetsk suggestions with B still Ростов-на-Дону. A locator wait during Анапа search hit tool selector deadline; following UI snapshot showed actual successful suggestions. This was a test-control wait timeout, not an app error, and no duplicate search was submitted.

## Checks / scope

Local focused45/45, full819/819, quote/API contracts, targeted ESLint, webpack production build allPASS. Vercel standard build independently819/819, compile4.6s/static16/16/Build Completed. Build proof saved2026-10-20-preview-build-proof.json. Runtime diagnostic scan for address_search_unavailable5m returnedNo logs found (limited negative evidence, not guarantee).

Cause:10s hard deadline introduced previously rejects valid provider replies; observed direct prefix response11.272841s. Patch20s retains cancellation and finite timeout. Controlled regression confirms slower valid results survive; original failing prefix and exact UI sequence now pass. Historical Production failure remains unclassified at individual-source level because old code did not log safe failure types; do not claim specific503/429 or that every provider/network failure is eliminated. New all-source diagnostics allow classification of future deadline/connect-timeout/HTTP/network failures. No address text logged. No permanent edit count/X-state lock reproduced; seven-request amplification remains known architecture, unchanged to preserve coverage/ranking.

Next: a direct current-task publication request is needed before releasing source4f62abf (also contains prior verified Crimea/M4 bypass fix). No more live probes or route audits required for this completed bounded verification. If another failure occurs after release, use sanitized diagnostics first, not another unexplained timeout increase.
