# Address search Preview verification — 2026-10-19

## Result

The latest authorized branch deployment serves point-B address suggestions on the API path. Vercel Preview deployment `dpl_B9R6u4Y4eMiVrFEumgQwb4Qigwyf` (branch head `b82e951875284b3ef1cacbf09b78be0811d1365a`) is READY with successful Vercel status.

GET `/api/suggest` returned HTTP 200 for «Ростов», «Красн», «Моск», and «Краснодар». «Ростов-на-Дону» appears among the first three ranked suggestions for the partial query «Ростов». Response `x-vercel-id` headers included `::fra1::`.

## Validation and limits

- Focused address search, proxy, Photon fetch and cache tests: 43 passed, 0 failed.
- The proxy regression test verifies that `POST /r` preserves the original abort signal.
- The available protected-preview fetch connector can issue GET requests only, so the live POST path was not directly replayed. No claim of a live POST test is made.
- PR #14 remains open/draft. Production was not changed.
- If the UI still shows an unavailable message, collect the exact full query and approximate request time to diagnose the corresponding POST.
