# 01.11.2026 — Android V1.01 оболочка, сборка GitHub Actions

- Исходная ветка: `fix/v3-missing-route-prices-2026-10-15`, проверенный до изменения HEAD: `3f185c7b0fcffc003347f7b35dff32ea1c620851`, PR №14 Draft.
- В `android-app` обновлён launcher WebView с корня сайта на явный `https://mezhgorod-calculator.vercel.app/v3` (V1.01 на Production).
- Application ID `ru.mezhgorod.calculator` сохранён; versionCode 4→5, versionName 1.0.3→1.01; название «Из А в Б».
- Удалено принудительное затемнение WebView, чтобы сайт сам управлял светлой и тёмной темами. Предыдущая сохранённая страница вне /v3 больше не открывается после обновления, внешние ссылки остаются во внешнем браузере.
- `android-app-v2` (исторический /v2) и существующий workflow Android APK 2.0 не менялись.
- Добавлен отдельный workflow `android-v101-apk.yml` для рабочей ветки: Gradle assembleDebug, проверка APK/aapt, SHA256, загрузка артефакта без GitHub Release, без main/Production изменений.
- Подпись: стандартная DEBUG-подпись GitHub runner, **не стабильная release-подпись**; совместимость обновления поверх прежнего APK не гарантируется. Для бесшовного обновления потребуется существующий release keystore/сертификат.
- Локальная Android-сборка не запускалась: в текущей среде нет Android SDK и Gradle. Hosted Actions и реальная установка на устройстве необходимы.
- Следующий шаг: выполнить workflow, проверить APK metadata, SHA256 и дать пользователю фактический артефакт; Android V2 и Production сайта не изменять.

## 01.11.2026 — hosted build: DONE (user-device acceptance OPEN)

- Фактически опубликованный SHA исходного Android кода: `d306f5b8a283f7f192295b2dbc0c5b4f4f085670`; remote readback PASS; PR №14 Draft.
- GitHub Actions: https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41340511993 — SUCCESS, все этапы, включая `gradle assembleDebug` и Upload artifact, завершились успешно.
- GitHub Actions artifact ID `13097107982`, `Iz-A-v-B-V1.01-APK` (ZIP), expires 2026-12-01. APK `Iz-A-v-B-V1.01-debug.apk`, размер 819945 байт.
- `aapt dump badging`: package `ru.mezhgorod.calculator`, `versionCode=5`, `versionName=1.01`, `compileSdk=35`; целевой gradle `minSdk=24`.
- `unzip -t` артефакта и APK: PASS. SHA-256 APK: `a7a44d60a68940fa695532aec8482cd98111bd8841f2ec921205861ff1b6c69a`, совпал с файлом контрольной суммы в артефакте.
- Пользователю передан проверенный APK и SHA256; **Android-девайс и обновление поверх существующей установки не тестировались**, debug signing может отличаться от прежнего APK.
- Production сайта, Android V2, main и резервные ветки не менялись. Следующий шаг: установить на пользовательском устройстве и проверить тему/поиск/расчёт; для обновления без удаления рассмотреть стабильный подписывающий ключ, не публикуя его в репозитории.
