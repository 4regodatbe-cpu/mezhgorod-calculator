# Nationwide three-test diagnostic — 26.10.2026

- GitHub Actions run: [40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721), workflow `Nationwide three-test diagnostic`, event `push`, branch `fix/v3-missing-route-prices-2026-10-15`, head `2907a409305834c4cb9b25bc717978f049bb22f9`.
- Conclusion: `success`; hosted runner Ubuntu 24.04, Node `v24.21.0`; frozen install succeeded. Job `isolated-tests` and the test and artifact-upload steps all succeeded.
- Raw per-test stdout, stderr and exit codes are preserved in [`nationwide-three-test-diagnostic-40332405721.zip`](nationwide-three-test-diagnostic-40332405721.zip). SHA-256: `3fa758f4bfafc1c895dc599f4a3881eab69de707723750e8bac9b4f95e90001c` (also GitHub artifact digest). GitHub artifact ID `12654889085`, expires 26.11.2026 13:39 UTC / 16:39 MSK.

| Test file | Result | Exit | stderr |
|---|---:|---:|---:|
| `audit-child-process.test.mjs` | 3/3 PASS | 0 | empty |
| `automatic-policy-replay-integration.test.mjs` | 3/3 PASS | 0 | empty |
| `systemic-audit-report.test.mjs` | 1/1 PASS | 0 | empty |

Total: 7/7 PASS, 0 FAIL. This runner result confirms the earlier local `spawnSync ... EPERM` was a Codex environment restriction, not a reproducible test failure. Do not rerun these tests absent a new cause. No assertions or application code changed.
