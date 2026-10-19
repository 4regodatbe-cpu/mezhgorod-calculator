# STARTED — live address suggestions fail on Photon connect timeout

2026-10-19 22:09 MSK. User supplied three screenshots from the calculator: point B shows “Сервис поиска временно недоступен” for «Ростов», partial «Красн…», and partial «Моск…». This supersedes the earlier control-only confirmation; the prior patch alone did not fix the user-visible failure.

## Evidence

- Source PR #14 head before this follow-up: `b8aee34a3dd5622265790609f5c3c0d2f5898ab0`, open/draft.
- Latest preview API probes: «Ростов» HTTP 502, «Красн» HTTP 502, «Моск» HTTP 502; «Краснодар» HTTP 200 with suggestions during the same test window.
- Vercel runtime diagnostics for the preview: 8 errors / 1 user / route `/api/suggest`; `TypeError: fetch failed`, cause `ConnectTimeoutError` to `photon.komoot.io:443` at 10 seconds. Affected function ran in `iad1`.
- UI sends `POST /r`. That proxy reconstructed `NextRequest` without carrying over the incoming abort signal. Vercel Node request cancellation is opt-in; the prior configuration had not enabled it.

## Local remediation

- Configure only `app/r/route.ts` and `app/api/suggest/route.ts` functions for `fra1` (Frankfurt), near the Photon service; retain the existing project default for other functions.
- Enable `supportsCancellation` for those function paths and pass the `/r` request signal into the forwarded `NextRequest`.
- Add `scripts/address-search-proxy.test.ts` covering propagated cancellation and forwarded query.
- Decisions: do not invent offline coordinates or change ranking/geography; first test whether moving the outbound call to Europe resolves the proven connection timeout. If not, choose a supported backup geocoder in a separate evidence-backed step.

## Local checks

- `node --import ./scripts/register-ts-paths.mjs --test scripts/address-search-proxy.test.ts scripts/photon-fetch.test.ts scripts/address-search.test.ts scripts/address-suggestion-cache.test.ts`: 43/43 passed.
- Targeted ESLint: exit 0.
- `vercel.json` JSON parse and `git diff --check`: passed.
- Preview build/live verification for this remediation: pending; do not claim fixed until tested.

## First preview attempt — failed to verify

Commit `df460e7f5a3a00224cd6029bb7dcdb48207702ba` reached READY, but live results were mixed: «Ростов» and «Моск» returned HTTP 200; «Красн» and «Краснодар» returned HTTP 502. The response header had `x-vercel-id: fra1:iad1:...`, showing the request entered Frankfurt edge while the function still ran in `iad1`. Do not treat this as fixed.

## Corrective attempt

Added `export const preferredRegion = "fra1"` to both Next route handlers (`app/r/route.ts`, `app/api/suggest/route.ts`), retaining `supportsCancellation` in `vercel.json`. This uses Next's Route Segment Config; the new deployment and live verification are pending.

## Next step

Commit to the already authorized branch after confirming the remote head still equals the recorded PR head. Then inspect the new Vercel deployment's function region and test the three failing queries through both GET `/api/suggest` and POST `/r`. Review runtime logs for new Photon connect timeouts. Leave PR draft and Production unchanged.
