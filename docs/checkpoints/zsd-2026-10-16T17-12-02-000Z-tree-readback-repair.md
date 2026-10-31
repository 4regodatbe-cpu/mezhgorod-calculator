# ZSD diagnosis persistence repair BLOCKED

2026-10-16T17:12:02Z. Branch `fix/v3-missing-route-prices-2026-10-15`, draft PR14. The diagnosis itself is unchanged; its result remains `single-zsd-blag-to-sest` selected trace extends outside ZSD zone 1 across 57 unreviewed way IDs. No tariff or zone was inferred.

**Persistence check found and corrected a transport truncation.** After commit `1a215cc1dbd97f834b1c1c19ce2532d783c38df9` was referenced by PR14, Git fetch showed tree `35eecba59e1faac4613a4ce0a48a8188464af065`, not local diagnosis tree `30d25946739467c909269b84b30c89f19b03fc53`. Blob readback differed on three large append-only ledgers: `NEXT_STEPS.md` expected `c974f3de9e1add964d0d545a049178723cf0421d`, `PART19_FINDINGS_QUEUE.json` expected `20b16cef3324552f3c808ad1081226b40720f75c`, `WORK_LOG.md` expected `bcf51ce0147a5633a7df3ac1b61c6e3bb3f9a3ab`. The encoded shell output was truncated before upload; those three GitHub blobs therefore did not match local Git objects. The diagnosis checkpoint and evidence files were not affected.

Recovery is in progress: upload the exact complete local blob data in bounded chunks, recreate the branch tree on the then-current verified head without force, and compare the resulting remote tree plus all changed path blob SHAs with local Git objects. Do not start the next route until those checks pass. No runtime files changed; no full test/build was run or claimed. Plan progress remains **90% (18/20 parts)**, not fare coverage.

NEXT: finish exact blob restoration, record a DONE repair checkpoint and verify PR14 head/tree before starting ZSD case `single-zsd-peterhof-to-prim` using the saved-capture two-profile workflow.
