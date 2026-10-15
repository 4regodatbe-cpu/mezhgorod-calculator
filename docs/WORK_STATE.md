# Текущее состояние калькулятора «Из А в Б»

2026-10-15T22:30:22.511770+03:00. Ветка fix/v3-missing-route-prices-2026-10-15, PR14draft. Последнийподтверждённыйremote5d2dcf1f0b092231f6d223586842e5eb134ac434. [Checkpoint](checkpoints/2026-10-15-223022-resume-install-pass.md).

## DONE

СредавосстановленаизGitHubпослеутратыcheckout. FrozeninstallPASS. ИсторияWORK_LOG/NEXT_STEPSсохраненацеликомв*_HISTORY_2026-10-15_2228.md, текущиеиндексыкороткие.

Прямоеправило21:48МСК: всеV3платныекомпонентыпотарифудаты/времениотправления, сменадня/профиля/часаоплатывпутиценуне меняет. Основнойкодреализован; геометрия/границы/датавалидностиисточникасохраняются. Междорожныевекторыотложеныполностью.

## IN PROGRESS / NEXT

Восстановленыassert1265+missingM4guard иtrip-departure-v1marker. Новыйfocused **59/59PASS**. [Checkpoint](checkpoints/2026-10-15-223101-resumed-focused-pass-build-started.md). STARTED pnpm build/targetedESLint; результата полногоbuildпоканет. Послеgate—offlineГуляйполе→Москва(четверг/суббота),затемliveБахмут→Казань.

Аудит: этап1 **8/155**, этап2 **154** не начат; [точнаяочередь](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json).40rawOD/39originalcomplete; originalЛисичанск→Москва summaryутрачен,offlineреконструкциянеоригинальныйlive. Старыеценывычислялисьдоновогоправила;нетутвержденияо39повторныхпроверкахновойсемантики.

[CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md):каждыйнебольшойшаг→отдельныйcheckpoint→commit→GitHub→проверкаhead/tree,толькопотомследующий. ConsentpublicGitHub/routingValhalla/OSRM/BRouterдействует,непереспрашивать. Unknownнебесплатный,subtotalнеполныйитог. Неmerge/main/Production/Androidбеззапроса.

[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md),[NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md),[DECISIONS](../experiments/nationwide-tolls/DECISIONS.md). ИсторическийHANDOFF_TWO_STAGE_AUDIT.md читатьпослеэтогофайла:старыеtimeblockзамечания superseded решением21:48.
