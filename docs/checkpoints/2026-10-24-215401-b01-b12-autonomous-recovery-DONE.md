# DONE — безопасное восстановление B01–B12

Статус: DONE, 24.10.2026 21:54 МСК.

## Входы и границы

- Репозиторий: `4regodatbe-cpu/mezhgorod-calculator`.
- Разрешённая ветка: `fix/v3-missing-route-prices-2026-10-15`.
- Подтверждённый исходный remote/PR head: `70ab6b840862fa40f090b960ee650b058e83b768`, tree `e3aacf86025930940cc9a2aae9e04ab11c7f60f5`.
- PR №14 остаётся draft. `main`, Android, `backup/algorithm-before-road-ref-2026-10-23`, merge и Production не входят в работу.

## Выполнено

1. Повторно проверены `refs/heads/fix/v3-missing-route-prices-2026-10-15` и `refs/pull/14/head`: оба указывали на `70ab6b840862fa40f090b960ee650b058e83b768`.
2. Перед созданием копии и перед записью проверены Actions: `queued=0`, `in_progress=0`, `waiting=0`, `requested=0`, `pending=0`.
3. Создана отдельная чистая копия `/workspace/mezhgorod-calculator-fix` непосредственно из разрешённой ветки. Исходный checkout `/workspace/mezhgorod-calculator` на ветке `work` не изменялся.
4. Полностью прочитаны `AGENTS.md`, `docs/WORK_STATE.md`, `docs/WORKFLOW_RULES.md`, `docs/CHECKPOINT_PROTOCOL.md`, `docs/OPTIONAL_MODULES.md` и `docs/contractor-brief/BRIEF.md`.
5. Запущены четыре read-only исполнителя: ADDRESS B01–B03, TOLL-GIS B04–B06, TOLL-RESEARCH B07–B09, QUALITY B10–B12. Единственный writer — главный агент; исполнителям запрещены изменения, commit/push и широкие тесты.

## Проверки и ограничения

- Чистая копия: текущая ветка и upstream совпадают, рабочее дерево до этой записи было чистым.
- Широкие тесты, маршрутизация и live-аудит не запускались.
- Git CLI authentication не считается настроенной; durable-запись выполняется существующим GitHub connector с non-force lease и exact tree readback.
- Новая предпосылка от QUALITY: `/usr/bin/chromium` доступен (`154.0.8037.57`), но зависимости в чистой копии ещё не установлены. Это только основание заново выполнить ограниченный B03 browser block, не PASS.

## Последовательность малых блоков

1. B03: STARTED → frozen dependencies → восемь уже описанных mocked `/r` browser-сценариев → DONE/BLOCKED; флаг `addressCitySnapshot` остаётся `false`.
2. Затем первый независимый bounded block, выбранный по read-only выводам B01–B12; не повторять завершённые аудиты и downloads.
3. После каждого блока: focused checks, checkpoint, журнал/state, commit, remote update без force и exact readback. При active/queued CI запись останавливается до завершения.

Следующий шаг: после durable readback этой записи создать отдельный B03 STARTED checkpoint с точными командами, лимитами и recovery action.
