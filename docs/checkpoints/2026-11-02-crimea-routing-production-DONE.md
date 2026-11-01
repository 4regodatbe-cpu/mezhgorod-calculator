# Crimea routing P1 — released and checked on Production

2026-11-02 MSK. Owner authorized code, working-branch push and Production. Source SHA `a05fba100055787e9351122eaafa1471bffc44ff`; GitHub tree matches local `bdf5ec5a9526388151bf15cc99df25c358d3e7c7`. PR14 OPEN/Draft. Main and Android V2 unchanged.

Actions 41354565031 SUCCESS (verify/browser), 41354565036 overall SUCCESS: mandatory offline 1099 PASS, 0 FAIL, 1 SKIP, TypeScript/build PASS, calculation timing PASS. Separate live_probe FAILED on the known Photon Donetsk SOURCE_UNAVAILABLE (four HTTP503, three cooldown); route geometry step PASS. No manual broad audit or rerun.

Preview `dpl_i152A8p8rKSd2xeM8yYYXmLUeVV2` READY; HTTP302 Deployment Protection limited Preview acceptance. Separate Production build on the exact source, `dpl_VdMSM7rCqAvwK4jHAV9pasDXDm8x`, READY, main domain alias verified. `/api/version` returned source SHA and environment production. Previous `dpl_7YckGZayaDjZLPQgiSJ6JGws3w5p` retained for rollback; rollback not needed.

All 14 real main-site POST controls returned HTTP200. Exact API responses saved under `experiments/crimea-routing-2026-11-02/production/`; local provider geometry under the parent directory. All distances/durations matched the local captured controls. Main outcomes, forward/reverse:

- Anapa–Kerch: 133.153/134.167 km, 7789/7584 seconds, OSRM, free/0.
- Anapa–Yalta: 387.857/387.518 km, 20288/20019 seconds, OSRM, free/0.
- Yalta–Adler: 739.289/738.937 km, 39617/39540 seconds, OSRM, free/0.
- Yalta–Moscow: 1817.393/1819.029 km, 88476/88127 seconds, Valhalla, unknown/null.
- Yalta–Rostov: 765.331/763.788 km, 37804/37906 seconds, OSRM, unknown/null.
- Donetsk–Volnovakha: 56.678/58.259 km, 3414/3515 seconds, OSRM, free/0.
- Donetsk–Melitopol: 298.593/299.036 km, 16830/16857 seconds, OSRM, free/0.

Bridge-only plans remove the compulsory Krasnodar detour; the ordinary API evaluates all available plans by actual provider seconds. Captured road steps show A290/bridge, A291 to Yalta, and A147 toward Adler. Six short Crimea geometry replays prove bridge passage and no A289 frames. The original recorded paid-route regression still verifies 415+205+180=800 only on the corresponding crossing geometry; tariff values unchanged. Long-route M4/A289 completeness remains unresolved, never zeroed or replaced by a partial amount.

No new independent operator distance survey or Yandex comparison performed. Coordinates are the recorded city-centre controls, not unspecified screenshot street addresses. Photon outage remains separate. Final acceptance documents/results are a local follow-up commit; running Production source stays a05fba10.
