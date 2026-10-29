# CLI and Trusted Sources verification — BLOCKED_BY_CLI_AUTH

29.10.2026 MSK. No push/deployment/Production/main/Android/backup/CI/security setting changes. Existing Preview dpl_7pAvNNZBoH7UGkNBfUZSEmMaaH8N remainsREADY/source d5be124153f649454dbb4fc55b4af427e7ab7d94. Earlier local/CI checks not repeated or relabelled as realPreview acceptance.

## Commands and observed results

1. Direct `vercel whoami`:exit127, binary not installed. This was NOT treated as absence of authentication.
2. Official npm registry `npm --cache /tmp/geonames-vercel-cli-cache view vercel version`:exit0,65.7.0. Official CLI pinned and executed from that temporarycache; no package.json/lockfile/dependency change.
3. First pinned `vercel whoami --format json --non-interactive`:exit1 BEFORE auth check because default /home/agent/.local/share/com.vercel.cli could not be created (ENOENT). Fixed only missing default local CLI directory using supported scoped filesystem permission; did not repurpose HOME/change proxy/TLS or copy credentials.
4. Pinned `vercel whoami --format json --non-interactive` after directory initialization:exit1, exactJSON `{"loggedIn":false,"cliVersion":"65.7.0","linkedProject":null}`. This is actual authentication evidence, not inference from missing environment variables.
5. Named read-only `vercel project inspect mezhgorod-calculator --scope 4regodatbe-5310 --non-interactive` reported `No existing credentials found. Starting login flow...`. Despite noninteractive mode CLI proposed an authentication challenge; it was NOT approved/completed. Own pending read-command process stoppedSIGTERM (exit143), no existing Actions cancelled. Challenge URL/code redacted before log output; no authentication material in repository. No automatic linking/login follow-up was executed.
6. `vercel env run --help`:exit0. Official65.7help supports development default, `-e/--environment`, `--git-branch`, `-p/--project`, `--` childcommand separator. Presence-only check: processVERCEL_OIDC_TOKEN=false,VERCEL_TOKEN=false,.vercel/project.json=false,.env.local=false. No secret file contents inspected.

Pinned invocation used: `npm --cache /tmp/geonames-vercel-cli-cache exec --yes --package=vercel@65.7.0 -- vercel <command>`. Global default local CLI metadata directory was initialized, but no identity/session created. Standard inherited proxy/CA/TLS retained. CLI/cache installed only outside Git tracked source. Workingtree initially clean.

## Trusted Sources path and exact blocker

Official existing-project mechanism: authenticate CLI under existing account/team, verify intended project, then `vercel env run -e development -p prj_JbuIKFQNjD3FvAcX2I65Dm5OBKie -- <test command>` with explicit known team scope. It injects project development OIDC into child process without .env file. Browser driver must read VERCEL_OIDC_TOKEN only in memory and send `x-vercel-trusted-oidc-idp-token` solely to immutablePrevieworigin. It must not print header/token, capture authentication traces or send to third-party origins. Same-project development→Preview is the documented default; actual customized trust policy has NOT been validated without a token. No TRUSTED_SOURCES_ENVIRONMENT_MISMATCH response observed; do not invent one or broaden trust rules.

Current blocker is missing CLI identity (confirmed whoami), plus no available development OIDC. `vercel curl` is conditional on authenticated CLI; it was NOT misleadingly run as a successful protected request when whoami saysfalse. `env run`/`env pull` requiring authenticated project access were not used to start another identical login attempt. The connected Vercel management MCP can inspect project/deployments but exposes no documented devOIDC mint/export tool; its web_fetch_vercel_url creates/reuses a23hshare link and was NOT used. No credential extraction from connector/browser, no protection disable/bypass/share, no new trusted-source permissions or paid services.

Required next coordination is deliberate standard CLI authentication of the existing account with this project's existing access (or existing authorized project development-OIDC provisioning), not a token pasted into chat and not a new publication. No request for browser login was made in this task before/after these checks. Do not claim automatic continuation after session end. After valid CLI whoami, inspect exact project/team and use vercelcurl on exactimmutablePreview, then origin-scoped short-livedOIDC browser tests. Only then confirm cities/Photonindependence/details/A-B/desktop/mobile/onefullroute and measure actual cold/warm responses.

## Independent accessible evidence

Management API confirmed exactPreviewREADY/iad1/source d5be and noaliaserror. Bounded error/fatal runtime-log query for this deployment/last30m returned no records; no application request was authenticated in this task, so empty logs are not a successful functional test. Productionpublichostname remains prior051d51ea deployment; PR14Draft/remoteunchanged checked separately. No second rawcurl/SSO attempts or browser-login requests.

Function coldstart/searchlatency/peakmemory/exacthostedfunctionbytes remain UNMEASURED, not0. Prior localNFT26.39MB/RSS218MiB/coldHTTP490ms are local results only. Earlier hosted build accepted output and buildcache344.62MB is not function size. Ready state does not replace actual API data-access/response evidence. All requested realPreview scenarios remainBLOCKED_BY_AUTH, not GeoNamesFAIL.
