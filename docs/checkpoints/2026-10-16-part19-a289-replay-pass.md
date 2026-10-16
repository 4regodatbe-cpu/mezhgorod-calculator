# A289: corrected-engine whole-route offline replay PASS

DONE16.10.2026. Parente350e579, ветка/PR14draft. ОдинcaseАскания-Нова→Казань, двапрофиля, обаreplayexit0/complete=true/missingResponses=[]; точныефайлы/SHA256/inputs/actualtolls в [verified evidence](evidence/2026-10-16-part19-a289-replay-verified.json). RawSHA совпадаетмеждупрофилями; originalbaseline/raw неизменны.

15.10.2026 09:00МСК: M4=1990,A289=800,M12=850,весьсохранённыйroute=3640. 17.10.2026 09:00МСК:M4=2320,A289=800,M12=850,total3970. Прежнийbaselineвобоихпрофиляхunknownиз-заA289. Это correctedcode offline total, не новыйlive и не независимый операторский/Яндексэталон. Незнакомаяплатнаячастьне замаскирована, здесьвсе3компонентарассчитаны.

Fullgate673/673+API/Next/TypeScript/static16/16PASS; focused20PASS; scopedlint3/diffPASS ранее сохранены, расчётныйкодпосленихне менялся. Production/main/mergeне трогались. Часть19/A289 основнаяошибкаисправленаипроверена; всеостальныеfindings ещёне закрыты.

Следующее STARTED отдельный analysis: оценить влияние этого helper на59caseID из historical REPORT.findings[a289:unpriced], прочитав каждый existing live+егоrawrecord.route.coordinates и вызвавтолькоa289ShortRoute(geometry,[],live.departureAt,Boolean(live.m4PvpPreview.confirmedPvps.length)). Сохранитьbefore/afterA289reason/amount,rawSHA исчётчикив evidence/2026-10-16-part19-a289-impact.json. Не выполнятьновыйlive,не менятьbaseline/REPORT,не утверждатьwhole-routeитоги дляостальныхcases. Послеэтого составитьточный NEXT по оставшимсяfindings, а не повторять всю309очередь.
