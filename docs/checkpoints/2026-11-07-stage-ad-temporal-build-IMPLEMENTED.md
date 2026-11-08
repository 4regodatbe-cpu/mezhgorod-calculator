# Stage AD implementation checkpoint

Base Stage AC `2400f760…`; isolated `codex/stage-ad-reliability`. Implemented abort-bounded transport/body waits and late-response disposal; V3 shared 90s budget includes body/geocode/routing/special/toll asynchronous path. Existing 25s provider deadline retained. No retries/geometry/tariff edits. Native real-clock all-three-hung test completed ~25s with HTTP502; early/late/body cancellation helper tests passed. Full gate pending final code.

Clean pnpm11.25.0 frozen install succeeded after ordinary sandbox EPERM network retry through authorized command. node_modules is local directory, no external parent symlink; lockfile unchanged. Playwright-core1.56.1 installed separately at `/workspace/stage-ad-tools`; no project dependency added.

Found V3 long duration displayed as 25h; new day/hour/minute presentation applies only fastest-summary and V3 clipboard, preserving V2 formatting default. Browser controlled harness and isolated freshness proposal prepared; neither replaces live-provider evidence nor changes mandatory freshness gate.
