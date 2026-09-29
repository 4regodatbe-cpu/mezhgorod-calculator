const SPREADSHEET_ID = "15krZvB44lLEopTCyOAvQe3ynwF2f-PoSiYcOATs6Z-w";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const expectedToken = PropertiesService.getScriptProperties().getProperty("WEBHOOK_TOKEN");
    if (!expectedToken || data.token !== expectedToken) return json({ ok: false, error: "unauthorized" });

    const book = SpreadsheetApp.openById(SPREADSHEET_ID);
    const now = new Date().toISOString();
    const routes = ensureSheet(book, "Маршруты", ["Дата и время (UTC)", "Город / регион A", "Город / регион B", "Расстояние, км", "Время, мин", "Тариф, ₽/км", "Стоимость, ₽", "Версия", "Вариант маршрута", "Стандарт, ₽", "Комфорт, ₽", "Комфорт+, ₽", "Минивэн, ₽", "Платная дорога Пн–Чт, ₽", "Платная дорога Пт–Вс, ₽"]);
    const feedback = ensureSheet(book, "Предложения", ["Дата и время (UTC)", "Категория", "Предложение", "Статус"]);
    const visits = ensureVisitsSheet(book);
    if (data.type === "route") {
      routes.appendRow([now, data.fromRegion, data.toRegion, data.distanceKm, data.durationMin, data.rate, data.total, "1.0"]);
    } else if (data.type === "route_v2") {
      routes.appendRow([now, data.fromRegion, data.toRegion, data.distanceKm, data.durationMin, "", "", "2.0", data.routeType, data.totals.standard, data.totals.comfort, data.totals.comfortPlus, data.totals.minivan, data.tollWeekday, data.tollWeekend]);
    } else if (data.type === "feedback") {
      feedback.appendRow([now, data.category, data.message, "Новое"]);
    } else if (data.type === "visit") {
      const visitorId = String(data.visitorId || "").slice(0, 64);
      if (!visitorId) return json({ ok: false, error: "missing_visitor_id" });
      const lastRow = visits.getLastRow();
      if (lastRow > 1) {
        const existing = visits.getRange(2, 2, lastRow - 1, 1).getValues().flat();
        if (existing.indexOf(visitorId) !== -1) return json({ ok: true, duplicate: true });
      }
      visits.appendRow([now, visitorId, String(data.version || "").slice(0, 10)]);
    } else return json({ ok: false, error: "unknown_type" });
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

function ensureSheet(book, name, headers) {
  let sheet = book.getSheetByName(name);
  if (!sheet) sheet = book.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  else if (sheet.getLastColumn() < headers.length) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureVisitsSheet(book) {
  let sheet = book.getSheetByName("Посещения");
  if (!sheet) {
    sheet = book.insertSheet("Посещения");
    sheet.getRange("A1").setValue("Уникальные входы (браузеры)");
    sheet.getRange("B1").setFormula("=MAX(0;COUNTA(A4:A))");
    sheet.getRange("A2").setValue("Один браузер учитывается один раз. Очистка данных или другое устройство создают новый вход.");
    sheet.getRange("A3:C3").setValues([["Дата и время первого входа (UTC)", "Анонимный ID браузера", "Версия"]]);
  } else {
    sheet.getRange("A3:C3").setValues([["Дата и время первого входа (UTC)", "Анонимный ID браузера", "Версия"]]);
  }
  sheet.setFrozenRows(3);
  return sheet;
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}