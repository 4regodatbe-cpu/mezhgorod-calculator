# Address-search next steps

**Preview API verification complete.** On branch head `b82e951`, GET `/api/suggest` returned HTTP 200 for «Ростов», «Красн», «Моск» and «Краснодар»; «Ростов-на-Дону» appeared in the first three results for «Ростов». Local signal-propagation regression is included in the 43/43 passing focused suite. The protected-preview connector only supports GET, so `POST /r` was not live-tested. PR #14 remains open/draft; no merge or Production release was made.

If the user still sees the unavailable message in the same Preview, capture the full point-B input and attempt time, then correlate it to the POST request/runtime error. The shared browser cache speeds repeated exact searches across A/B; a first lookup still depends on Photon.
