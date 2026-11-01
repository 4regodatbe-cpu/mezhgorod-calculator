# V1 Release — один push, CI/Preview FAILED; локальный follow-up

01.11.2026 МСК. Разрешён один обычный push. Перед записью local `55aa69ae42097da37283677b7dd6f00f1a97058a`, clean; remote `beb57c803424cbf9993bdefe8e3a9d8c7ef4a39d`, ancestor PASS; PR №14 OPEN/Draft. Diff 34 файлов (+439/-46): UI shared components/V3 page/hook, UI tests, документация, два ограниченных AUDIT-01 ответа. Нет изменений тарифной матрицы, routing, CI, main/Production/Android/backup. `git diff --check` PASS; bundle проверки PASS. Единственный `git push origin HEAD:refs/heads/fix/v3-missing-route-prices-2026-10-15` выполнен fast-forward; remote HEAD/PR SHA после записи совпали с `55aa69ae…`. GitHub contents readback двух файлов `docs/ui-v1-release/ACCEPTANCE_STATUS.md` и `app/v3/page.tsx`: SHA256 идентичны локальным.

Автоматические Actions на этом SHA:

| Run | Workflow | Итог | Причина/доказательство |
| --- | --- | --- | --- |
| [41288602244](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41288602244) | B03 push | FAILURE | `address-ui` SUCCESS, `verify` FAILURE: offline gate 1080 PASS/2 FAIL/1 SKIP |
| [41288607999](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41288607999) | B03 PR | FAILURE | `address-ui` SUCCESS, legacy eight + current ten сценариев, current 10/10 PASS; artifact 13075659201. `verify` те же 2 FAIL |
| [41288602256](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41288602256) | Segment 8 route quality | FAILURE | `Production build` вызывает offline gate и останавливается на тех же 2 FAIL до Next build |
| [41288608013](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41288608013) | Special territory PR | FAILURE | `classify_live_scope` SUCCESS, `calculation_timing` SUCCESS, `verify` те же 2 FAIL; `live_probe` отдельно FAILURE: Ростов PASS, Красн PASS, Донецк `SOURCE_UNAVAILABLE` с `http_503:4`, `source_cooldown:3`. Далее 50-settlement/Yandex не выполнены |

Точные два offline failures: `scripts/v3-hook-race-audit.test.mjs` тесты clipboard failure и late clipboard completion ожидали `h.states[5] === ''`, получили `undefined`. UI-05 удалил один пользовательский `useState` (`deepTollDiagnostics`) из V3 hook, поэтому `copiedKey` переместился с индекса 5 на 4 **только в тестовом harness**. Рабочая логика clipboard не менялась. Локально исправлены ровно два индекса без удаления или смягчения assertions; целевой test 9/9 PASS, TypeScript PASS, scoped ESLint exit0, diff check PASS. Это исправление **не опубликовано**, обязательный hosted gate для нового локального SHA не проходил. Второй push не выполнялся — текущее разрешение ограничено одним.

Vercel Preview `dpl_GksaLeCZEyz3BLRfkYqy981ibnVh` для точного SHA `55aa69ae…` создан, URL `https://mezhgorod-calculator-7fowiofgc-4regodatbe-5310.vercel.app/v3`, но state **ERROR**: `pnpm run build` завершился exit1 на тех же двух offline assertions. URL не является рабочим Preview для приёмки. Desktop/mobile light/dark, dual/standard, прокрутка, клавиатура, кнопки и результаты в новом Preview **NOT_RUN**; B03 контролируемые браузерные сценарии не заменяют реальную пользовательскую приёмку. Production deployment остался READY на `e3ca3783a8ba9de3271851959eba213bf7a76868`; PR14 Draft.

AUDIT-01 остаётся отдельным PARTIAL по `2026-11-01-ui-v1-audit01-route-reproduction-PARTIAL-LOCAL.md`. Photon 503/cooldown live_probe — отдельный известный серверный поиск, не подтверждение причин AUDIT-01.

Следующий шаг: после отдельного разрешения на ещё один обычный push — сначала сверить remote HEAD/fast-forward, опубликовать локальный узкий test fix, дождаться обязательных Actions и READY Preview именно нового SHA, затем выполнить реальные desktop/mobile проверки. Не публиковать Production и не объявлять интерфейс принятым до успешного gate.
