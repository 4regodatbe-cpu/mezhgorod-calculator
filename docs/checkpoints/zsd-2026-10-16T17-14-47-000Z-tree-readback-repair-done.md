# ZSD diagnosis persistence repair DONE

2026-10-16T17:14:47Z. Branch `fix/v3-missing-route-prices-2026-10-15`, draft PR14. Restored full exact Git blobs for the seven-path diagnosis/repair snapshot after the prior connector transfer truncated three large append-only ledgers.

Verified PR14 remote head `c2e744d030b9a6f1c3cbc3ed5ac20674458dbb67`, tree `433ea764ea17d4f5cd4b41a37e2b59902a31586a`. Local companion commit `119c592ba82b34e6bc2ce7861c715ecf83ed147a` has the same tree. Git fetch confirmed all seven changed path blob SHAs exactly match local Git objects; working tree clean. This repairs the incomplete snapshot at `1a215cc...` without force and records the prior failed readback transparently; no route result or source data was dropped.

Case 68 remains an offline scope finding: `single-zsd-blag-to-sest` crosses zone 1 and includes 57 unreviewed way IDs. It does not prove a tariff, free status, or runtime defect. No runtime file changed; no test/build was run for this audit-only repair. Plan **90% (18/20)**; not tariff coverage.

NEXT STARTED: ZSD case 69 `single-zsd-peterhof-to-prim`, one saved capture replayed under the two offline date profiles; retain fail-closed unknown behavior and verify durable tree before any following case.
