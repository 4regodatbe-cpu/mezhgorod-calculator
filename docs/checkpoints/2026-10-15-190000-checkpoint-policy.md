# Уточнение обязательного checkpoint-протокола

Статус: DONE — инструкция подготовлена; durable remote-сохранение проверяется при публикации этого commit.

Источник: прямое уточнение пользователя 15.10.2026 19:00 МСК. Branch `fix/v3-missing-route-prices-2026-10-15`, PR14, исходный remote commit `499f2ee83580f9136d850ad6fe52ae7489756324`.

## Сделано

- В AGENTS.md добавлено обязательное правило каждого небольшого шага; прежний запрет журналировать мелкие операции явно superseded.
- Создана отдельная постоянная инструкция `docs/CHECKPOINT_PROTOCOL.md` с единицей сохранения, STARTED/DONE/FAILED, отдельными записями, кодом/данными/проверками/следующим шагом и обязательным remote read-back.
- Сохранение unreferenced blobs/tree и один local commit не считаются durable checkpoint.
- Массовые серии без remote checkpoints между случаями далее не запускаются. Техническое journal/single-step ограничение runner ещё предстоит внедрить отдельным маленьким шагом.

## Проверки и ограничения

Это docs-only изменение. Проверяются `git diff --check`, наличие ссылки из AGENTS, WORK_STATE и NEXT_STEPS. Build для самой инструкции не требуется. До этого в восстановленном checkout отдельно восстановлен шестой IO test: его SHA `d1357b484219d27cbe7d758ffe35c4529efc20e1` точно совпал с исходным manifest, focused6/6 PASS; этот тест будет сохранён следующим отдельным checkpoint, а не смешан с docs-only задачей.

Offline install завершился отсутствием metadata; обычный `pnpm install --frozen-lockfile` прошёл с pnpm11.25.0 без отключения policy checks. Это не является новым build PASS.

Следующий шаг: сохранить восстановленный шестой тест отдельным checkpoint, затем восстановить evidence links/summaries из имеющихся raw captures. Не повторять имеющиеся live captures без необходимости; утраченные данные явно помечать.
