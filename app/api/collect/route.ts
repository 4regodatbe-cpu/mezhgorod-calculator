import { NextRequest, NextResponse } from "next/server";

type RouteEvent = { type: "route"; fromRegion: string; toRegion: string; distanceKm: number; durationMin: number; rate: number; total: number };
type RouteV2Event = { type: "route_v2"; fromRegion: string; toRegion: string; distanceKm: number; durationMin: number; routeType: string; totals: { standard: number; comfort: number; comfortPlus: number; minivan: number }; tollWeekday: number | null; tollWeekend: number | null; tollPricingStatus?: "priced" | "free" | "unknown" };
type FeedbackEvent = { type: "feedback"; category: string; message: string; website?: string };
type VisitEvent = { type: "visit"; visitorId: string; version?: string };

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const ADDRESS_PART = /(?:\b\d{1,6}[а-яa-z]?\b|\b(?:ул(?:ица)?|просп(?:ект)?|пр-т|пер(?:еулок)?|шоссе|наб(?:ережная)?|бульвар|бул\.?|проезд|дом|д\.|корп(?:ус)?|кв\.)\b)/i;
function coarseRegion(value: unknown) {
  const parts = clean(value, 240).split(",").map((part) => part.trim()).filter(Boolean);
  const safe = parts.filter((part) => !ADDRESS_PART.test(part) && !/^\d{5,6}$/.test(part));
  return safe.slice(-3).join(", ").slice(0, 120);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RouteEvent | RouteV2Event | FeedbackEvent | VisitEvent;
    if (body.type === "feedback") {
      if (body.website) return NextResponse.json({ ok: true });
      const message = clean(body.message, 1000);
      const category = clean(body.category, 40);
      if (message.length < 10 || !category) return NextResponse.json({ error: "Напишите предложение не короче 10 символов" }, { status: 400 });
    } else if (body.type === "route") {
      const numbers = [body.distanceKm, body.durationMin, body.rate, body.total];
      if (!coarseRegion(body.fromRegion) || !coarseRegion(body.toRegion) || numbers.some((n) => !Number.isFinite(n) || n < 0)) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    } else if (body.type === "route_v2") {
      const baseNumbers = [body.distanceKm, body.durationMin, ...Object.values(body.totals ?? {})];
      const tollValues = [body.tollWeekday, body.tollWeekend];
      const pricingStatus = body.tollPricingStatus;
      const validTotalKeys = body.totals && typeof body.totals === "object" && Object.keys(body.totals).length === 4 && ["standard", "comfort", "comfortPlus", "minivan"].every((key) => Object.prototype.hasOwnProperty.call(body.totals, key));
      const invalidStatus = !["priced", "free", "unknown"].includes(pricingStatus ?? "");
      const invalidTolls = pricingStatus === "unknown"
        ? tollValues.some((value) => value !== null)
        : tollValues.some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0);
      const invalidFree = pricingStatus === "free" && tollValues.some((value) => value !== 0);
      if (!coarseRegion(body.fromRegion) || !coarseRegion(body.toRegion) || !clean(body.routeType, 30) || !validTotalKeys || baseNumbers.length !== 6 || baseNumbers.some((n) => !Number.isFinite(n) || n < 0) || invalidStatus || invalidTolls || invalidFree) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    } else if (body.type === "visit") {
      if (!/^[a-zA-Z0-9-]{16,64}$/.test(clean(body.visitorId, 64))) return NextResponse.json({ error: "Некорректный идентификатор" }, { status: 400 });
    } else return NextResponse.json({ error: "Неизвестный тип данных" }, { status: 400 });

    const endpoint = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const token = process.env.GOOGLE_SHEETS_TOKEN;
    if (!endpoint || !token) return NextResponse.json({ error: "Сбор данных ещё настраивается" }, { status: 503 });

    const webhookBody = body.type === "route_v2"
      ? { type: "route", version: "2.0", fromRegion: coarseRegion(body.fromRegion), toRegion: coarseRegion(body.toRegion), distanceKm: body.distanceKm, rate: 0, total: body.totals.standard }
      : body.type === "route"
        ? { type: "route", fromRegion: coarseRegion(body.fromRegion), toRegion: coarseRegion(body.toRegion), distanceKm: body.distanceKm, rate: body.rate, total: body.total }
        : body.type === "feedback"
          ? { type: "feedback", category: clean(body.category, 40), message: clean(body.message, 1000) }
          : { type: "visit", visitorId: clean(body.visitorId, 64), version: clean(body.version, 20) };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token, ...webhookBody }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({ ok: false }));
    if (!response.ok || !result.ok) throw new Error("WEBHOOK_FAILED");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
    return NextResponse.json({ error: "Не удалось сохранить данные. Попробуйте позже." }, { status: 502 });
  }
}
