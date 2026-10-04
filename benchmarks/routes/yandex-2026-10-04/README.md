# Yandex route observations — 2026-10-04

- Six routes, 15 visible Yandex route-card candidates, transcribed from the user screenshots named in `screenshot-observations.json`.
- Captured fields: distance, duration, approximate toll price only when readable.
- The screenshots do not contain route geometry. A blank price is recorded as “no amount shown” or “unreadable”, never as free.
- Approximate route input coordinates were taken from the calculator V2 autocomplete on 2026-10-04. Zaporizhzhia and Kharkiv required Ukrainian spelling to find the intended city. The live probe compares router output to Yandex’s first visible candidate; it cannot prove exact route identity.
- Intended for offline comparison and live CI diagnostics only. Do not use these observations for runtime route serving, customer pricing, or to claim a route is verified.

The V2 autocomplete currently fails to return the Zaporizhzhia city for the Russian query “Запорожье”. For “Харьков, Украина”, the first result is a same-name settlement in Crimea while Kharkiv proper appears later. These are separate address-search findings and can affect user-selected endpoints.
