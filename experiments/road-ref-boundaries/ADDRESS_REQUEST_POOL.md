# Необязательный слой устойчивости поиска адресов

Введён24.10.2026 в рабочей ветке. Не изменяет координаты, набор Photon query variants, ранжирование, подписи регионов или тарифы. Ограничивает нагрузку на единственный существующий origin Photon. Поля A/B используют общий компонент и один backend; отдельная подтверждённая B-only причина пока не найдена.

## Подключение и границы

lib/photon-request-pool.ts — независимый process-local pool; lib/address-search-service.ts — coordinator общего бюджета; app/api/suggest/route.ts вызывает collectAddressFeatures и прежний rankPhotonFeatures. POST/r уже обращается к тому же endpoint, сохраняя caller signal. Switch data/toll-feature-switches.json → addressRequestPool:false отключает очередь/cache/singleflight/cooldown и возвращает прямые Photon fetches. Общий конечный20сbudget coordinator остаётся защитой ответа; его не считать тарифным модулем или временем полного маршрута.

Для полного удаления слоя заменить collectAddressFeatures прежним Promise.allSettled(photonSearchUrls(q).map(fetchPhotonFeatures)), вернуть соответствующие imports/сводку ошибок, удалить два новых файла и tests. Низкоуровневый guard pre-aborted caller можно сохранить независимо. Ни один модуль платных дорог не зависит от этого слоя.

## Инварианты

- Не более2 активных upstream fetches на один тёплый server process; очередь не более64 новых URL tasks. Это не глобальный лимит всех replicas/развёртываний.
- Одинаковый полный URL с несколькими подписчиками выполняется один раз. Очистка одного поля отсоединяет только его подписчика. Последний подписчик отменяет shared fetch или удаляет queued task. Мгновенное повторное введение не получает брошенный task, старый finally не удаляет новый task того же URL.
- Positive-only cache:128URL entries, TTL5мин, LRU. Пустые ответы и ошибки не кэшируются. Это не128 полных запросов города, каждый город имеет7–13variants. Existing client cache128queries/5мин и Next fetch revalidate300 сохранены.
- HTTP503/429 создаёт origin cooldown15с. Queued варианты того же origin завершаются structured failure без нового fetch. Нет автоматического ретрая или фонового probe. После срока следующий пользовательский запрос может попробовать снова. Доступные свежие cache entries используются и во время cooldown. Другой origin в общем library contract не блокируется; новый production provider не добавлен.
- Общий coordinator deadline20с включает очередь, body и некооперативные injected fetches. Клиентская отмена освобождает его задания. Это сохраняет ранее доказанный usable prefix11.3с и не увеличивает прежний per-source20с worst-case, но не обещает10с. На здоровом сервере ограничение параллельности может увеличить время холодного запроса; кэш/отмена уменьшают повторную работу.
- Успешно завершённые variants сохраняются при частичном сбое. Если все источники rejected —502 и прежняя кнопка повтора; не маскировать failure под «нет такого адреса». Failure labels: deadline/cancelled/http_503/http_429/source_cooldown/queue_full/budget. Частичный и полный отказ логируются summary без текста запроса/URL/исходной ошибки.
- Никаких новых адресов, центроидов, offline фиктивных coordinates, сторонних API, секретов или user-facing технических настроек. Расчёт платных дорог/километраж не меняется.

## Что доказано и что остаётся

Диагноз и counts с live0: checks/2026-10-24-address-pool/diagnosis.json. Focused contracts и full gate в той же папке. Доказаны поведение очереди/подписок/cache/cooldown/budget и отсутствие лишнего pre-aborted fetch. Не доказаны текущая доступность Photon, отсутствие блокировки конкретного IP, исправление исходного mobile UI сбоя или одинаковая задержка всех реальных адресов. Сохранённые503/timeouts — факты, высокая fan-out нагрузка — выявленный недостаток; причинность каждого503 и запрет пользователя не установлены.

Официальный PhotonREADME предупреждает о throttling/ban интенсивного использования и отсутствии availability guarantee: https://github.com/komoot/photon/blob/master/README.md (прочитан24.10web). Library concurrency ограничивает нашу нагрузку, но не устраняет внешнюю зависимость. Свой геокодер/полная дорожная сеть остаются вне этого этапа.

## Финальный endpoint regression24.10

checks/2026-10-24-address-endpoint/sequence.json:NextPOST/r→suggest→pool→mockPhoton,40fetches/peak2/live0. Последовательнаязамена/clearDonetsk/cache/sharedcancel/partial503/cooldownPASS. Initialfixturefailurelowercasevariantsсохранёнвinitial-fixture-failure.log; assertionнеослаблялся. Финальныйполныйgate864PASS/buildPASS. Этоservercontract,неbrowser/mobile/liveproof.
