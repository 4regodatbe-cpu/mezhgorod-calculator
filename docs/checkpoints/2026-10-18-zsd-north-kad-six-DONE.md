# DONE — шесть ZSD sibling exit/trace exceptions

# ЗСД: шесть недостающих проверок границы северного КАД

18.10.2026. Группа258ee8… имела одного подробно проверенного представителяКазань→Сестрорецк и шесть явно непроверенныхsiblings. Проверены только их собственные сохранённыеcapture/trace/exit instructions; прежние74component checks не запускались повторно.

**Результат6/6:** rawcapture SHA и frozenreport SHA совпали; own selected Valhalla response geometry точно совпадает с каждой выбраннойroute geometry. Trace complete/booth coveragecomplete; в собственныхrawtrace подтверждён порядок933974870/way381576632 →1766158812/way458501101. Все76ZSDways соответствуют sealed priorreport; собственныеинструкции ведуткЛевашовскому/КАД/Приморскому иА118. Это реальный съездкКАД-север, а не продолжение доСкандинавии, независимо отto-sest вcaseID. Materialexceptions0, errors0. Подробно проверена вся группа7/7 с учётом ранее готового представителя; новых siblingchecks6, не7.

**Outcome: blocked_by_missing_reliable_data.** Не хватает направленного operatorcash/card collection bundle/готового вектора для этих точныхграниц. Физическийtrace не доказывает сумму;300₽/зона не присваивается. Новыхpricedcomponents/confirmedfullfares0. Исторические26priced/50unknown не пересчитывались и не стали новыми результатами.

Шестьcapture-файлов отсутствовали вsparseworkingtree, но ихblobs были вlocalGit. Они восстановлены безlazyfetch и проверены поGitblobSHA+SHA256. Сетевыхзапросов/providerrequests/replay/pricingcalls0. ПервоначальныйFileNotFound припробесхемы отмечен вrecovery-progress.json; это не потеря исходногоcapture и не повод повторять live. Per-caseoutputs/progress записывалисьатомарно, весь пакет0.124с. Новыйruntimeкод не менялся; fulltests/build не требовались и не запускались. ПровереныJSON/6caseSHAs/6captureSHA+Gitblobs/diff.

Source STARTED1f5dbd9d…/treec2439975…,13path/head/PR14draft readback. Метод выборки следует existingreview-zsd-remaining-scopes.py: decode selected-provider shape, compare own record, use own maneuver indices; trace-output shapeindices не применялиськвходнойгеометрии. Reproduction inputs/отдельныефакты/хэши сохранены; один-offline Pythonанализ не подключёнкприложению.

NEXT: следующая отдельно незавершённая группа1e954c437e46 (КАД-север→КАД-юг),7unchecked siblings. До пакетногочтения отдельныйSTARTED сточнымиcaseIDs/frozenpaths; толькоowncapture exceptionchecks,безreplay/сети. М3datesource иМ4sourcepass удерживатьBLOCKED,неповторять безнезависимогоисточника.

Команда единицы: python /tmp/review_zsd_north_six.py, локальный анализ по inputspaths; outputs summary.json/progress.json/cases/*.json/recovery-progress.json. Runtime/source utility не изменялись. Durable commit/tree/path/head readback после этой записи.
