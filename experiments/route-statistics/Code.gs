const SPREADSHEET_ID = "15krZvB44lLEopTCyOAvQe3ynwF2f-PoSiYcOATs6Z-w";
const ROUTE_SHEET = "Маршруты";
const FEEDBACK_SHEET = "Предложения";
// Existing production schema A:O is preserved. No migration or header rewrite.
const ROUTE_HEADERS = [
  "Дата и время (UTC)", "Город / регион A", "Город / регион B", "Расстояние, км",
  "Время, мин", "Тариф, ₽/км", "Стоимость, ₽", "Версия", "Вариант маршрута",
  "Стандарт, ₽", "Комфорт, ₽", "Комфорт+, ₽", "Минивэн, ₽",
  "Платная дорога Пн–Чт, ₽", "Платная дорога Пт–Вс, ₽"
];
const FEEDBACK_HEADERS = ["Дата и время (UTC)", "Категория", "Предложение", "Статус", "ID сообщения"];

function doPost(e) {
  let eventType = "unknown";
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    eventType = String(data && data.type || "unknown");

    const properties = PropertiesService.getScriptProperties();
    const activeToken = String(properties.getProperty("WEBHOOK_TOKEN") || "");
    // Keep this overlap only until Vercel has switched GOOGLE_SHEETS_TOKEN and been verified.
    const previousToken = String(properties.getProperty("WEBHOOK_TOKEN_PREVIOUS") || "");
    if (!activeToken || (data.token !== activeToken && (!previousToken || data.token !== previousToken))) {
      return json({ ok: false, error: "unauthorized" });
    }

    const book = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (data.type === "route") return saveRoute(book, data);
    if (data.type === "feedback") return saveFeedback(book, data);
    if (data.type === "visit") return saveVisit(book, data);
    return json({ ok: false, error: "unknown_type" });
  } catch (error) {
    console.error("collect_failed", eventType, safeErrorName(error));
    return json({ ok: false, error: "internal_error" });
  }
}

function saveRoute(book, data) {
  const sheet = book.getSheetByName(ROUTE_SHEET);
  if (!sheet) return json({ ok: false, error: "routes_sheet_missing" });
  const headers = sheet.getRange(1, 1, 1, ROUTE_HEADERS.length).getValues()[0];
  if (headers.some((value, index) => String(value || "").trim() !== ROUTE_HEADERS[index])) {
    return json({ ok: false, error: "route_schema_mismatch" });
  }
  if (typeof data.durationMin !== "number" || !Number.isFinite(data.durationMin) || data.durationMin < 0) {
    return json({ ok: false, error: "invalid_route_duration" });
  }
  const totals = data.totals || {};
  const numberOrBlank = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : "";
  // Labels are text; prevent a spreadsheet formula from being evaluated.
  const safeCell = (value) => {
    const text = String(value || "").trim().slice(0, 120);
    return /^[=+@-]/.test(text) ? "'" + text : text;
  };
  const row = [new Date().toISOString(), safeCell(data.fromRegion), safeCell(data.toRegion),
    numberOrBlank(data.distanceKm), data.durationMin, numberOrBlank(data.rate), numberOrBlank(data.total),
    safeCell(data.version), safeCell(data.routeType), numberOrBlank(totals.standard),
    numberOrBlank(totals.comfort), numberOrBlank(totals.comfortPlus), numberOrBlank(totals.minivan),
    numberOrBlank(data.tollWeekday), numberOrBlank(data.tollWeekend)];
  sheet.appendRow(row);
  return json({ ok: true, saved: true });
}

function saveFeedback(book, data) {
  const sheet = getOrCreateSheet(book, FEEDBACK_SHEET, FEEDBACK_HEADERS);
  ensureFeedbackIdColumn(sheet);

  const suppliedMessageId = String(data.messageId || "").toLowerCase();
  // The old /api/collect payload had no ID; accept it during the staged rollout.
  const legacyCompatibility = !suppliedMessageId;
  const messageId = legacyCompatibility ? Utilities.getUuid().toLowerCase() : suppliedMessageId;
  const message = String(data.message || "").trim().slice(0, 1000);
  const category = String(data.category || "").trim().slice(0, 80);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(messageId)) {
    return json({ ok: false, error: "invalid_message_id" });
  }
  if (message.length < 10 || !category) return json({ ok: false, error: "invalid_feedback" });

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (error) {
    console.warn("feedback_lock_unavailable", safeErrorName(error));
    return json({ ok: false, error: "temporarily_busy" });
  }

  try {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingIds = sheet.getRange(2, 5, lastRow - 1, 1).getValues().flat().map(String);
      if (existingIds.includes(messageId)) return json({ ok: true, saved: true, duplicate: true });
    }
    sheet.appendRow([new Date().toISOString(), category, message, "Новое", messageId]);
    return json({ ok: true, saved: true, duplicate: false, legacyCompatibility });
  } finally {
    lock.releaseLock();
  }
}

function saveVisit(book, data) {
  const sheet = getOrCreateVisitsSheet(book);
  const visitorId = String(data.visitorId || "").slice(0, 64);
  if (!visitorId) return json({ ok: false, error: "missing_visitor_id" });
  const lastRow = sheet.getLastRow();
  if (lastRow > 3) {
    const existing = sheet.getRange(4, 2, lastRow - 3, 1).getValues().flat();
    if (existing.indexOf(visitorId) !== -1) return json({ ok: true, duplicate: true });
  }
  sheet.appendRow([new Date().toISOString(), visitorId, String(data.version || "").slice(0, 10)]);
  return json({ ok: true });
}

function formatDurationMinutes(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) throw new Error("invalid_duration_minutes");
  const totalMinutes = Math.floor(numeric);
  if (totalMinutes === 0) return "0 мин";
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days) parts.push(days + " д");
  if (hours) parts.push(hours + " ч");
  if (minutes) parts.push(minutes + " мин");
  return parts.join(" ");
}

function getOrCreateSheet(book, name, headers) {
  let sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureFeedbackIdColumn(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, FEEDBACK_HEADERS.length).setValues([FEEDBACK_HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }
  const idHeader = String(sheet.getRange(1, 5).getValue() || "").trim();
  if (!idHeader) sheet.getRange(1, 5).setValue("ID сообщения");
  else if (idHeader !== "ID сообщения") throw new Error("feedback_id_column_conflict");
}

function getOrCreateVisitsSheet(book) {
  let sheet = book.getSheetByName("Посещения");
  if (sheet) return sheet;
  sheet = book.insertSheet("Посещения");
  sheet.getRange("A1").setValue("Уникальные входы (браузеры)");
  sheet.getRange("B1").setFormula("=MAX(0;COUNTA(A4:A))");
  sheet.getRange("A2").setValue("Один браузер учитывается один раз. Очистка данных или другое устройство создают новый вход.");
  sheet.getRange("A3:C3").setValues([["Дата и время первого входа (UTC)", "Анонимный ID браузера", "Версия"]]);
  sheet.setFrozenRows(3);
  return sheet;
}

function safeErrorName(error) {
  const name = error && typeof error.name === "string" ? error.name : "Error";
  return name.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 48) || "Error";
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
