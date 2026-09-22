import { NextRequest, NextResponse } from "next/server";

type RouteEvent = { type: "route"; fromRegion: string; toRegion: string; distanceKm: number; durationMin: number; rate: number; total: number };
type FeedbackEvent = { type: "feedback"; category: string; message: string; website?: string };

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RouteEvent | FeedbackEvent;
    if (body.type === "feedback") {
      if (body.website) return NextResponse.json({ ok: true });
      const message = clean(body.message, 1000);
      const category = clean(body.category, 40);
      if (message.length < 10 || !category) return NextResponse.json({ error: "Напишите предложение не короче 10 символов" }, { status: 400 });
    } else if (body.type === "route") {
      const numbers = [body.distanceKm, body.durationMin, body.rate, body.total];
      if (!clean(body.fromRegion, 120) || !clean(body.toRegion, 120) || numbers.some((n) => !Number.isFinite(n) || n < 0)) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    } else return NextResponse.json({ error: "Неизвестный тип данных" }, { status: 400 });

    const endpoint = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const token = process.env.GOOGLE_SHEETS_TOKEN;
    if (!endpoint || !token) return NextResponse.json({ error: "Сбор данных ещё настраивается" }, { status: 503 });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token, ...body }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({ ok: false }));
    if (!response.ok || !result.ok) throw new Error("WEBHOOK_FAILED");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить данные. Попробуйте позже." }, { status: 502 });
  }
}
