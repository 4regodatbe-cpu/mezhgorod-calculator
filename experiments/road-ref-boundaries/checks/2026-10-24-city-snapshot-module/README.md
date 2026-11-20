# Optional local city snapshot — 24.10.2026

ImplementationSTARTED97cb1507ea1643910ec42d2ec439b5f9e20954d4прочитанremoteпередкодом. data/address-city-snapshot.jsonпокрываетровно4реальныеранееуспешныеcitySuggestion,новыхкоординат/benchmarkpromotion0. Код/lib/address-city-snapshot.ts;флагfalse;интеграция/api/suggestприfullunavailableиобщийsharedAddressFieldsource/coverage/OSMcredit.

Actualchecks:7focused/core+NextGET/rс65mockfetches/live0;полныйnpmruntest:audit894/894+quote/APIadapterPASS;ESLint6изменённыхcodefilesPASS;Nextwebpackbuild+TypeScript+static16/16PASS. Exactdates/IDs/positionsизcapturesпроверены;флагпо-прежнемуfalse. Source/commands/границы: ../../ADDRESS_CITY_SNAPSHOT.md.

ПолныйESLintрепозиторияFAIL:19ошибок/5предупреждений,всеreportedfilesимеюттотжеHEADblob,configне менялся. Подробноeslint.log/eslint-baseline-comparison.json. НЕподменятьwhole-repoPASSузкимPASS. Модульостаётсявыключенным;baselinecleanupне делалсяпопутно.

Одинintermediateполныйrunодновременносwebpackдал893PASS/1FAILвстаром25мсbudgettestaddress-probe-timeout.test.ts:125 (completed0вместо1). Rawfull-tests-concurrent-build-failed.logсохранён. Отдельноtimeoutfile8/8PASS,послеокончанияbuildполный894/894PASS. ПричинностьCPUконтеншентольконаблюдение,неустановленнаяrootcause;assertions/таймаутынеослаблялись. Последнийloggingprivacyassertionпрошёлвфинальномполномrun.

Детерминированныекомандыизкорняrepo:
- `node --import ./scripts/register-ts-paths.mjs --test scripts/address-city-snapshot.test.ts scripts/address-city-snapshot-endpoint.test.ts`;
- `npm run test:audit` (безодновременнойтяжёлойсборки,чтобыминимизироватьtimingsensitivefixturevariation);
- `node node_modules/eslint/bin/eslint.js app/api/suggest/route.ts app/v2/components/address-field.tsx app/v2/components/types.ts lib/address-city-snapshot.ts scripts/address-city-snapshot.test.ts scripts/address-city-snapshot-endpoint.test.ts`;
- `node node_modules/eslint/bin/eslint.js . --ignore-pattern .next` → известныйFAIL19/5;
- `node node_modules/next/dist/bin/next build --webpack`.

Проверенонеспискомзаявлений,авыходами:verification.jsonхранитSHA256каждогоlog;build-artifacts.jsonBuildID/маршруты. NextpreferredRegiondeprecatedwarningужеотноситсяксуществующемуconfig;неустранялсяэтимблоком. UIскомпилирован/прочитан,настоящеготелефонного/браузерногоE2Eнебыло. CIновогокода не запускалсяэтимskipciсохранением,старыйCI40094656564неверифицируетновыйmodule. Production/main/Android/backupне менялись.

NEXTотдельноразобратьобщийlintgate;еслионзакрыт,дальнейшаяпроверкаdefault-offUI/ограничения/атрибуциинаPreviewсактуальнымснимком. Неактивироватьегоавтоматическикакполныйгеокодер. Срокистечения31.10.2026,sourcecapture/reviewпередrenew. GeoNameslabels/coordinatevalidationостаютсяотдельнымиблокерами.
