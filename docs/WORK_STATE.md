# Калькулятор: часть19, последовательная проверка М-4

2026-10-16T07:47:47.368Z. Ветка fix/v3-missing-route-prices-2026-10-15, PR14 draft. Фаза **PART19_M4_POLICY_DONE**; current-policy **12/25**.

**NEXT:** dnr-широкино-saint-petersburg-center. При active/queued workflow не писать в ветку и не запускать второго writer. После завершения читать actual job/checkpoint, затем продолжать часть19, часть20 ещё не начата.

Части1–18 DONE:155/155+154/154, frozenREPORT340/340. 19A/19B A289 binding fixes сохранены,57helper-only+2whole-route cases; это не59полных тарифов. Runtime fare source79df66d8; новый workflow build проверяет актуальные scripts/tests перед очередью.

Каждый case: STARTED→два saved-capture профиля→verify→DONE/FAILED→commit/push/exacthead/tree readback→сразу следующий. TIME_LIMIT возобновляем; не повторять завершённую309livequeue.

Полные тарифы могут оставаться unknown из-за ЗСД/других компонентов; не подставлять0 и не выдавать subtotal за итог. Whole trip uses departure instant. Corrected offline replay не является fresh live, parity с историческим buggy live или независимой проверкой цены. Исходные raw/live/replay/REPORT и append-only история сохранены.

[Состояние](../experiments/nationwide-tolls/AUTO_QUEUE_STATE.json) · [Checkpoint](checkpoints/policy-2026-10-16T07-47-47-368Z-part19_m4_policy_done.json) · [Findings](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json) · [Журнал](../experiments/nationwide-tolls/WORK_LOG.md) · [Протокол](CHECKPOINT_PROTOCOL.md).

No main/merge/Production/Android/messages. После всех25 cases проверить остальные категории находок; не считать часть19 законченной. Автоматическое продолжение всех20частей подтверждено пользователем16.10.2026 10:27МСК.
