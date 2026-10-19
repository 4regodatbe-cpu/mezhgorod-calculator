# Address-search next steps

1. **BLOCKED — remote save.** Obtain explicit approval to write the locally verified patch to the authorized public branch. Before writing, verify branch head and PR #14 again; stop if either changed.
2. Save code, tests, checkpoint, and work-state handoff; verify remote commit/tree and exact file SHAs.
3. Run required full audit/build and relevant lint/type checks; inspect the actual GitHub Actions result.
4. Leave PR #14 draft and Production unchanged unless the user directly requests publication.
5. If the deployed change still misses point B, collect the exact typed address and reproduce through `/api/suggest` before changing query/ranking behavior.

The local browser cache speeds repeated exact searches across A/B. It does not improve first-time Photon latency; a first-query optimization needs a separately verified faster provider or a staged UI design that preserves territory ranking.
