const SPREADSHEET_ID = "15krZvB44lLEopTCyOAvQe3ynwF2f-PoSiYcOATs6Z-w";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const expectedToken = PropertiesService.getScriptProperties().getProperty("WEBHOOK_TOKEN");
    if (!expectedToken || data.token !== expectedToken) return json({ ok: false, error: "unauthorized" });

    const book = SpreadsheetApp.openById(SPREADSHEET_ID);
    const now = new Date().toISOString();
    if (data.type === "route") {
      book.getSheetByName("Маршруты").appendRow([now, data.fromRegion, data.toRegion, data.distanceKm, data.durationMin, data.rate, data.total]);
    } else if (data.type === "feedback") {
      book.getSheetByName("Предложения").appendRow([now, data.category, data.message, "Новое"]);
    } else return json({ ok: false, error: "unknown_type" });
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
