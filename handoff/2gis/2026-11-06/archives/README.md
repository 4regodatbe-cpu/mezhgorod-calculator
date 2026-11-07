# Original Stage archives

- `stage9-geometry-original.tar.gz` preserves the Stage 9 portable archive exactly as received from the local project workspace. SHA-256: `d142ec25c6dfc53314c75fb12bf32bae514eea002706782606b39f2ef0a7bf39`. Its internal `SHA256SUMS` covers its original files.
- The exact Stage 8 packet is preserved at `../m11-stage8/patches/stage8-original-packet.tar.gz`; its SHA-256 is recorded in `../m11-stage8/SOURCES.json`.

The saved OSRM route capture is not duplicated in this handoff. The exact project-relative source path and SHA-256 remain in `../m4-pvp545/geometry/route-history-review.json`; that path exists in the branch base commit `d60e733313860d2412d8be64f4be10ef71f7de28`. No external router API payload is added by this handoff commit.
