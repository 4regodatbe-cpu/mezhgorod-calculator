# Isolated corridor switch interface — LOCAL

Owner requested a separate testing interface before possible publication: two special endpoints enable a direct/external switch, with one selected calculation and time/price comparison. Parent 2fb94c48; Production a05fba10 unchanged.

Added experiments/rational-corridor/demo.html, pure demo-model, standalone builder/output and loopback-only static server. No app/lib imports the experiment. Generic explicitly synthetic endpoints/data; no live provider, safety claim or operator fare assertion. 2:1 recommendation initializes selection; user can override. Reset/swap clears prior choice. One result region displays the selected route, separate differences, explicit unavailable route, and unknown total when tolls missing. Ordinary/special example kilometre pricing remains split.

Checks: comparator 6 PASS plus demo-model 5 PASS, scoped ESLint; standalone inline JS syntax checked. Model checks gate, recommendation/override, split price, unknown and failed alternative. Mobile Chromium 390x844 timed out (exit124, recurring TLS net_error -202); no screenshot or visual-browser PASS. Responsive CSS/accessibility implemented but actual visual acceptance remains open.

Standalone demo-preview.html is the owner-review artifact. Full geocoding/live route comparison is NOT implemented in this interface prototype. Next: owner UI review and bounded real candidate integration; preserve one selected result and obtain actual per-leg territory times before enabling weight-based choices. No push or Production deployment in this block.
