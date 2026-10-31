# Repeated address search — bounded UI evidence, 2026-10-20

Status: IN_PROGRESS. Production source 4b647bfe01c903352f3842072ceafb23ea6d10a2, alias https://mezhgorod-calculator.vercel.app/v3; working branch source 71c1eb18267263ba20396e78ed93f2ebfaa658e1. No release or main change.

## Observed UI sequence (cloud Chrome, ~13:00–13:05 UTC)

1. Select Анапа in A and Краснодар in B; calculate: 166.7 km, 2h26m, toll620 RUB.
2. Clear B with X, select Ростов-на-Дону; calculate:429.6 km,5h59m,toll1880 RUB.
3. Clear A with X, type Донецк;20 suggestions, first Донецк—ДНР, second Донецк Ростовская область. No error on this first attempt.
4. Select Донецк—ДНР, clear A, type Дон; suggestions returned.
5. Replace prefix with Доне, wait; UI shows Сервис поиска временно недоступен / Повторить.
6. Replace with full Донецк; cached suggestions appear immediately.

This reproduces a failed fresh search after repeated edits, not a permanent broken clear button. Both fields share the same component/proxy. Browser console filtered502 gave no records; extension metadata errors are unrelated and excluded. Vercel grouped runtime errors5m: none; runtime logs5m: none. A1h query failed due retention, not empty evidence. Current suggest handler silently catches provider errors, so runtime diagnostics cannot distinguish all-source timeout, HTTP503, invalid payload, or browser-to-proxy failure. Do not claim a specific upstream status or rate limit yet.

## Code facts

Each of Анапа, Краснодар, Ростов-на-Дону, Дон, Доне, Донецк generates7 concurrent Photon calls to one provider. Each has10s deadline; Promise.allSettled waits for all. All failures produce502; UI shows one generic error and manual retry. Only successful nonempty browser responses are cached. No cap on number of address edits exists. Seven-way fanout is an amplification risk, not proven root cause.

## Next bounded step

Inspect one server response for the failing prefix; add sanitized failure-stage diagnostics if needed, and test resilience/cancellation without changing territory priorities or tariffs. Preserve all failed/unknown distinctions. Do not repeat route/tariff audits. No new Production release authorized by this diagnostic request.
