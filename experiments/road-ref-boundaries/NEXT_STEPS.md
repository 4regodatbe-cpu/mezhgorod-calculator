# Следующие действия

Точная привязка М4 к графовым переходам реализована23.10.2026. Манёвры навигатора — диагностика; активный новый вектор требует node+directed way IDs полного matching выбранной геометрии.840 тестов и сборка PASS.

1. Recovery24.10: source f2abc85/PR14 подтверждён; CI39997833752 завершён, verify success, live_probe failure (Photon503/timeouts; последующие audits skipped). См. docs/checkpoints/2026-10-24-road-ref-recovery-DONE.md. После durable readback выполнить только ограниченный offline анализ Photon fan-out/fallback; перед длительной новой проверкой сохранить STARTED. Не повторять готовые route replays и не считать общий success доказательством доступности поиска.
2. Заполнить недостающие operator scope/цены независимо от определения границ. Активных цен в M4_GRAPH_ENDPOINT_REGISTER.json пока0, pending содержит одну пару для шести случаев. Новые rows требуют точных osm-transition ключей, двух профилей, источника/даты, scopeBindingStatus=reviewed и runtimeEligible=true. Не копировать соседний ПВП и не подставлять0.
3. Ключи, полные capture SHA и результаты6/6 сохранены в checks/2026-10-23-graph; не повторять эти replay без материального отличия кода/данных. Остальные направления не считать проверенными по одной паре.545/operator collection scope остаётся отдельным пробелом.
4. При неполной trace, разрыве внутри М4 или отсутствии точного узла оставитьunknown. Не переносить чужую геометрию или индексы request shape в output shape. Совместимость с источником геометрии обеспечивается общим matching; реальные шесть кейсов — Valhalla, BRouter контракт проверен синтетически.

Backup backup/algorithm-before-road-ref-2026-10-23 @c7048e0 сохранён. PR14 draft; Production/main/merge требуют отдельного поручения. Долгосрочная собственная карта остаётся DEFERRED.
