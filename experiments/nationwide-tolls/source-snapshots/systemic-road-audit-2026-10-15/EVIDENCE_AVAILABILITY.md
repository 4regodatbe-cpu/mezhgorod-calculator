# Наличие сохранённых доказательств

File existence, gzip/JSON readability and recovery SHA only. No live routing, replay, pricing parity or fare verification performed.

| Регион | План | Audited в старом manifest | Raw доступен | Все 4 файла доступны |
|---|---:|---:|---:|---:|
| dnr | 40 | 25 | 25 | 25 |
| kherson | 40 | 25 | 25 | 25 |
| lnr | 40 | 13 | 13 | 12 |
| zaporizhzhia | 40 | 10 | 10 | 10 |

Raw captures: 75; разных каталогов OD: 73; повреждённых raw: 0; отсутствующих файлов по ссылкам: 55.

Наличие четырёх файлов не означает корректность тарифа или проверенный parity. Старые статусы corpus сохранены как история. Повторно запрашивать raw только там, где нужный capture утрачен; при наличии raw восстанавливать summary/replay офлайн.

Точные пути, SHA и отсутствующие ссылки: [EVIDENCE_AVAILABILITY.json](EVIDENCE_AVAILABILITY.json).
