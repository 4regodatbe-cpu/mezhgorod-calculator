# Реорганизация D — консервативная очистка BLOCKED

31.10.2026 МСК. База remote `dba9cdd39ff5ce31e51fd2d6fd535a4faf04f343`, PR №14 OPEN/Draft. Research archive/manifest remote tree/blob readback PASS. Восстановление 61 архивного файла локально PASS, но исторические документы содержат ссылки на оригинальные пути; при их удалении ссылки и воспроизводимость старых результатов будут нарушены.

Непосредственные runtime зависимости: `app/v3/page.tsx` и `app/v3/components/use-v3-calculation.ts` импортируют `app/v2/components`; `lib/v3-calculation` импортирует `experiments/nationwide-tolls`, `experiments/toll-estimates`, `experiments/toll-od-matrix`. `package.json` и CI используют другие пути experiments. `data/local-settlements` включён в Next output tracing. Не установлена польза от перемещения общих V2-компонентов; это создало бы риск без функционального изменения.

Решение по требованию владельца: не объявлять неподтверждённые файлы ненужными, не менять алгоритмы. Перемещено **0** файлов, удалено **0**, сокращение активного дерева **0 байт**. D не DONE. Полный V3 source archive пока только локален; GitHub Release upload получил HTTP401. Следующее независимое действие — E: обязательные проверки текущего неизменённого runtime и сборки. Очистку возобновить после решения хранения V3 и точного обзора исторических ссылок/кандидатов.
