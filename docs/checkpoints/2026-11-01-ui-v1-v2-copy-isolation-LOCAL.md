# V1/V2 copy isolation — LOCAL DONE

01.11.2026 МСК. Base `7be708ebe81e3de120da8b76e1dec8360ffdef29`. `CalculatorForm` и `DonationCard` общие для /v2 и /v3. Необязательный `releaseCopy` включён только в `app/v3/page.tsx`: V1 Release получает согласованные UI-06/07 строки, /v2 сохраняет исходные надписи и неизменную ссылку. Расчётные hooks/API не менялись.

SSR tests 9/9 PASS, включая обе версии; TypeScript PASS, scoped ESLint exit0, `git diff --check` PASS. React review: новые hooks, побочные эффекты, запросы и DOM-обработчики не добавлены; условие только статический текст. Full offline gate/build не повторялись при неизменном известном EPERM; hosted acceptance после разрешённого push. Только локальный commit/bundle. Далее остальные UI-блоки.
