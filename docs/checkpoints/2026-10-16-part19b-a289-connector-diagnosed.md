# Часть19B: частичный A289, фактическая развязка установлена

DONE16.10.2026 06:50МСК. Parent2b6da15c, рабочаяветка/PR14draft. Remote/PRпроверены; queuejob116729992063 SUCCESS, активногоwriterнет. Локальныйcheckoutчист, treeсовпадалсremote, выполненfetch/switchбезпотериправок. AGENTS/protocol/state/план/журналы/decisionsпрочитаны. Текущийcode ещёнеисправлен.

Selectedprovider обеихсторон — **Valhalla**, неOSRM. Не смешиватьманёврыOSRMсselectedgeometry! Москва→Тамань: выбраннаягеометриявходитс03К-252вA289 у38.293165,45.206594; едетпоплатнойА28985.806км, далееA290. Обратновыходиту38.292057,45.206371. РВП23 удалён отselectedshape более13.5км, двеостальныерамки82/103действительнопроходятся. Это неполный800-вектор, а восточнаяграницаврайонеSlavyansk(13.6кмотсуществующегоконтролягорода,вегорадиусе18км). [Точныеbefore/join/afterконтроли,rawSHA/манёвры](evidence/2026-10-16-part19b-a289-connector-diagnosis.json).

Причинаunknown: easternM4TraversalбезусловноназначаетMaryanskaya любомунеизвестномувосточномуконцу, хотяselectedrouteобходитРВП23. МатрицадляMaryanskaya↔TamanBridgeтребуеттрирамки. ПравильныйSlavyansk↔TamanBridge385ужезадан существующимпрямымоператорскимOD+continuationalias, но егоНЕЛЬЗЯ выбиратьтолькопофактуотсутствия23.

STARTED узкаяпроверяемаяправка: геометрическоедоказательствоименноэтогонаправленногосъезда03К-252↔A289 через3контролиbefore/join/after срадиусом25м, правильнымпорядком, неповторнымпроездомикороткимисегментами(неинтерполироватьдлинныйchord). Толькоеслиодинвнешнийконецнеопределён,другойTamanBridge,наборрамокстрого82→103/103→82иconnectorдоказан, связатьнеизвестныйконецсSlavyanskпередобщимfallbackМ4. Дату/цены/проверкиматрицы/unknownдругихдорогсохранить.

Следующиймалыйшаг: fixture-based RED tests наобоихсуществующихcaptures, portal/order/near-miss/long-chord/repeatguards; затемimplementation+focused/fullgate/lint. Wholeenginereplayкаждогонаправленияотдельносcheckpoint,непереписыватьbaseline. Иныеfindingsнерасширятьвтомжешаге. No main/merge/Production/Android.
