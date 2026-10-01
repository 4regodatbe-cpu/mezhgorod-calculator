# Segment 8 — route-distance quality — PLAN

Date: 2026-10-01
Branch: `optimize-calculator-2`

## Goal
Improve distance/time reliability independently of toll pricing, without replacing live routing with stored answers.

## Audit finding at segment start
`/api/v2/calculate` already queries Valhalla + OSRM for the fast route and Valhalla + BRouter for the avoid-toll route. However, `selectRoute(..., known)` currently returns the stored known route itself. That makes the control database a hidden replacement for live routing on matched routes, contrary to the master-plan requirement that controls be QA/reference only.

## Invariants
1. A golden/known route is never returned as the live route solely because it matches endpoint radii.
2. Live distance/time always comes from a live routing provider result.
3. Golden controls may classify live output as within-band/outside-band and help choose among live providers when they disagree.
4. Provider disagreement is explicit and deterministic; no arbitrary silent provider switch.
5. Distance and time quality are separate dimensions. Traffic-independent router durations are QA signals, not promises of current ETA.
6. Toll pricing/evidence semantics are untouched by Segment 8.
7. Stored controls carry expected corridor/reference distance and explicit acceptable bands/provenance.
8. Provider failure is represented as single-provider/degraded quality, never fabricated distance.
9. Production `main` remains unchanged.

## Subsegments
- 8A — pure route-quality classifier and provider comparison model.
- 8B — convert verified-route controls into QA/golden references with explicit distance bands.
- 8C — remove hidden known-route substitution from `/api/v2/calculate`; use controls only to assess/select live candidates.
- 8D — deterministic regression corpus for agreement, disagreement, one-provider, golden-band and no-provider cases.
- 8E — workflow/build gate, checkpoint and master-plan update.
