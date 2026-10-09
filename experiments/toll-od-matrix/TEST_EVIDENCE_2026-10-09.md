# Confirmed native Node test evidence — 2026-10-09

## Why this file exists

The previous 145/145 checks ran under a V8 assertion shim inside the GitHub connector environment, **not** the native Node runner. A separate working container has Node.js `v22.16.0`; GitHub DNS access is blocked in that container, so code/tests and JSON were reconstructed *exactly* from the GitHub connector, and their Git blob SHA-1 hashes were verified against the checked-in sources before the tests were executed.

## Exact copied-file identity (Git blob SHA)

| File in `experiments/toll-od-matrix/` | Actual local SHA-1 | GitHub SHA |
|---|---|---|
| `m4-pvp-corridor-inventory.mjs` | `8795bf2fd1c950833311b0f1ea1dcaa03eee37bf` | same |
| `m4-pvp-corridor-inventory.test.mjs` | `92bc0bc70c1526589997f9901f2be7eb314cda6a` | same |
| `m4-fare-calendar-2026.mjs` | `f3a8237cb121b8fd9a68d8973030774c6d56052d` | same |
| `m4-fare-calendar-2026.test.mjs` | `0ee66dfdfa0a2575d3e23c3def777360c182745c` | same |
| `m4-mixed-time-policy.mjs` | `8fad48823b02665be8a1827ae3192b19a53c8f53` | same |
| `m4-mixed-time-policy.test.mjs` | `30c7b9345e6153a556e8ff6e638bd7292cdc3a9a` | same |
| `matrix/m4-pvp-corridors.json` | `55972729345e7875eaa330edea229c4b916ed0ae` | same |

## Native test command actually executed

```bash
node -v # v22.16.0
node --test \
  experiments/toll-od-matrix/m4-pvp-corridor-inventory.test.mjs \
  experiments/toll-od-matrix/m4-fare-calendar-2026.test.mjs \
  experiments/toll-od-matrix/m4-mixed-time-policy.test.mjs
```

Observed final TAP summary:

```text
1..38
# tests 38
# suites 0
# pass 38
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Original 3-suite component counts: 11 inventory, 14 calendar, 13 mixed-zone tests. All used **exact** GitHub blob copies. These are offline deterministic tests, **not** a route/geography operator-price match or a Next.js release build.

## What was NOT executed

The remaining `engine.test.mjs`, `od-geometry.test.mjs`, `od-sandbox-quote.test.mjs`, `m4-pvp-corridor.test.mjs`, `m4-pvp-evidence-adapter.test.mjs`, `m4-pvp-compiler.test.mjs`, `m4-pvp-timed-quote.test.mjs` were previously validated under a V8 shim, but have **not** been run with native Node in this environment. Full `node --test experiments/toll-od-matrix/*.test.mjs`, CI, TypeScript, pnpm build and real-route price tests are **not certified**.

## Further audit

Whenever a future agent gets working Git checkout, run the entire native suite on the **actual remote branch SHA**, log exact results/failing tests, then run prescribed app gates before any release. The isolated browser successfully found an official M-4 tariff PDF link but the document body could not be retrieved; no source-backed price rows have been approved.

## Added native M-11 lookup tests — same verified Git blob files

Additional exact source files transferred from the GitHub branch and independently SHA checked:

| File | SHA |
|---|---|
| `engine.mjs` | `ac1e9c09ead8c1b57334c8ae7d59d8db8119059e` |
| `engine.test.mjs` | `44f805eff5e23b1b34d1f4ba784271ac0a725c1b` |
| `matrix/m11.json` | `e2bcd3defd6e93b8ea63b163b76c967e9bd51df6` |

Actually executed `node --test experiments/toll-od-matrix/engine.test.mjs` → 16/16 pass. A subsequent combined **four-file** native run gave **54/54 pass**:

```bash
node --test \
  experiments/toll-od-matrix/engine.test.mjs \
  experiments/toll-od-matrix/m4-pvp-corridor-inventory.test.mjs \
  experiments/toll-od-matrix/m4-fare-calendar-2026.test.mjs \
  experiments/toll-od-matrix/m4-mixed-time-policy.test.mjs
```

TAP: `# tests 54`; `# pass 54`; `# fail 0`. No full Node suite or CI/Next build ran. These are all synthetic/offline tests, not verified real-route pricing.
