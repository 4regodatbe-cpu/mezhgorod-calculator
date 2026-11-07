# Baseline ESLint repair — 24.10.2026

SourceSTARTED81dfe59297846d7b25d489cbcfaab3bc181f5f17сохранён/прочитанпередправкой. НикакихновыхPhoton/routequeries,APK/Production/main/backupне менялись.

Причины19ошибок:18no-require-importsв7существующих.cjsфайлах,1prefer-constвmixedPromise.all-destructure. eslint.config.mjsтеперьзадаётNodeCommonJSsourceType+разрешаетnative requireтолькоподexperiments/nationwide-tolls/**/*.cjs. TypeScript/ESM/внешниекscopeCJSпродолжаютотклонятьrequireвреальномESLintlintText. Нетglobaldisable/ignore файлов. ПервыйpolicytestпоймалsourceType=moduleотpreset;исправленконфиг,а неassertion,rawfailureсохранён.

Вroute-leg.tsPromise.allосталсятемже/втомжеместе;consttuple(initialSelectedFree,diagnosticFastValidation)+отдельныйletselectedFree. Веткимаршрутов/числоfetch/fastestOnly/тарифыне менялись. Из10отслеживаемыхCJS9побайтнопрежние;вquote.cjsудалентолькоустаревшийeslint-disablecomment,теперьдававшийлишнеепредупреждение. ИсполняемоетелоравноHEADпослеудаленияпервойкомментарнойстроки(cjs-byte-proof.json). Первоначальноеуказание8файловвSTARTEDбылоestimate;actualtracked10.

Actualgates:
- `node --test scripts/eslint-commonjs-policy.test.mjs` →1/1PASS,включая3negativecases;
- полныйselector test:auditчерез`node --import ./scripts/register-ts-paths.mjs --test --test-concurrency=2 scripts/*test.ts scripts/*.test.mjs lib/v3-calculation/*.test.ts experiments/toll-od-matrix/*.test.mjs experiments/nationwide-tolls/*.test.mjs experiments/nationwide-tolls/engine/*.test.mjs` →895/895PASS;состав/таймауты/25мсfixtureне менялись;
- `node experiments/nationwide-tolls/scripts/quote.test.cjs` →quote/APIadapterPASS;повторёнпослекомментарнойправки;
- `node node_modules/eslint/bin/eslint.js . --ignore-pattern .next` →exit0/0errors/5existingwarnings;
- `node node_modules/next/dist/bin/next build --webpack` →exit0/TypeScript/static16/16PASS.

Тяжёлаяпроверка/sборканепараллелиласьсfulltests. Финальнаячисто-комментарнаяправкаquote.cjsсделанапослеbuild/fulltests;нулевоеизменениеисполняемоготела+quote/APIповторноподтверждены,лишнегоfullreplayнет. Все5warningотносятсякпрежнимunusedvars;неподавлялись.НовыйordinaryCIне запускалсяskipciкоммитом;этиданныеlocal,нестатусGitHubCI.

МодульaddressCitySnapshotпо-прежнемуfalse.LINT-001закрыт,ноэтонеразрешениеактивации. Следующийшаг—проверкаUI/покрытия/атрибуцииприактуальном4citysnapshot;локальнаяbrowserпредпосылкапроверяетсяотдельно. GeoNameslabels/coordinatecoverageнеисправлялисьэтимlintблоком.
