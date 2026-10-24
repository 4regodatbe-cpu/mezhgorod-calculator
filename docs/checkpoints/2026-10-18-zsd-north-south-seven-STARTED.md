# STARTED — семь ZSD boundary exception checks, КАД-север→КАД-юг

18.10.2026. Source5372689322bda1a5ad8e36e0cedabcc7ca459c53/tree25aa2a6e1c84e261cb94c8ab37f9daecd3b952cf; branch/PR14draft совпали, workflow_runs пуст. Только разрешённая ветка.

У группы1e954c437e46 ранее проверен один представитель; семь sibling cases явноunchecked. Входы/frozenreportSHA/representativeSHA/точныеcaseIDs: experiments/nationwide-tolls/checks/2026-10-18-zsd-north-south-seven/inputs.json. Проверить каждыйowncaptureSHA, exactselectedprovidergeometry, completeowntrace, orderedtollbooths и фактическиеentry/exitinstructions. Не выдавать одинаковыйwayset за доказанныйтариф; исключения не скрывать.

Бюджет7cases,30с/case,120сtotal. Сеть/providerrequests/pricingcalls/fullroute replay0; старые74/76/309пакеты и представитель не перезапускаются. Missingcapture восстанавливать только из localGit сGIT_NO_LAZY_FETCH=1, точныйblobSHA+SHA256. Per-caseJSON/progress писатьатомарно. После остановки — толькоremainingcases; после save failure — толькопередача. ОдинитоговыйDONE/commit/readback на пакет. Fullgate не требуется дляevidence-only. ЭтотdocsSTARTED[skip ci] не меняетCIsettings.
