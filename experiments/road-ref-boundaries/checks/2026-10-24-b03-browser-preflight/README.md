# B03 browser preflight — BLOCKED

Дата: 24.10.2026 21:56 МСК. Source: `35ad16caaaa11b41ba191cdeb889424fccf468c2`.

Цель ограниченного preflight — проверить, способен ли доступный системный Chromium создать headless-страницу до установки зависимостей и запуска восьми UI-сценариев. Внешняя сеть, приложение, маршрутизация и тарифы не использовались.

Команда:

```text
timeout 20s /usr/bin/chromium --headless --disable-gpu --no-first-run --no-default-browser-check --user-data-dir=<mktemp> --dump-dom about:blank
```

Фактический результат:

```text
[...:ERROR:third_party/crashpad/crashpad/util/linux/socket.cc:45] setsockopt: Operation not permitted (1)
Trace/breakpoint trap
exit=133
```

Среда:

- Chromium `154.0.8037.57` (Debian 13);
- Node `v24.19.0`;
- pnpm `11.25.0`;
- проектный `node_modules` отсутствует.

Итог: `BLOCKED_BY_ENVIRONMENT_BROWSER_RUNTIME`. Бинарник теперь существует, но процесс падает до создания DOM. Восемь сценариев `ADDRESS_CITY_SNAPSHOT.md` — `NOT_RUN`; установка зависимостей не выполнялась, потому что browser launch prerequisite не пройден. SSR/API проверки не повторялись. `addressCitySnapshot` остаётся `false`.

Recovery: повторить один launch smoke только в среде, где Chromium разрешён sandbox policy. Лишь после появления DOM сохранить отдельный STARTED и выполнить восемь уже описанных mocked `/r` сценариев с внешней сетью, заблокированной на уровне теста.
