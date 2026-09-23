import { NextRequest, NextResponse } from "next/server";
import { findVerifiedRoute, verifiedRouteCount } from "@/lib/verified-routes";

type Point = { label?: string };

function calculateLeg(fromLabel: string, toLabel: string) {
  const result = findVerifiedRoute(fromLabel, toLabel);
  if (!result.from || !result.to) {
    return {
      status: "missing" as const,
      from: result.from?.name ?? fromLabel,
      to: result.to?.name ?? toLabel,
      reason: "Для одного из городов пока нет записи в проверенной базе.",
    };
  }
  if (!result.route) {
    return {
      status: "missing" as const,
      from: result.from.name,
      to: result.to.name,
      reason: "Эта пара городов ещё не сверена с Яндекс Картами.",
    };
  }
  return {
    status: "verified" as const,
    from: result.from.name,
    to: result.to.name,
    fast: { meters: result.route.fastKm * 1000, seconds: result.route.fastMinutes * 60 },
    free: { meters: result.route.freeKm * 1000, seconds: result.route.freeMinutes * 60 },
    tollRub: result.route.tollRub,
    source: result.route.source,
    verifiedAt: result.route.verifiedAt,
    accuracyPercent: result.route.accuracyPercent,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { mode?: "standard" | "dual"; from?: Point; via?: Point; to?: Point };
    const from = body.from?.label?.trim();
    const via = body.via?.label?.trim();
    const to = body.to?.label?.trim();
    if (!from || !to || (body.mode === "dual" && !via)) {
      return NextResponse.json({ error: "Заполните все точки маршрута" }, { status: 400 });
    }
    const legs = body.mode === "dual" && via
      ? [calculateLeg(from, via), calculateLeg(via, to)]
      : [calculateLeg(from, to)];
    return NextResponse.json({ legs, verifiedRouteCount: verifiedRouteCount(), tolerancePercent: 3 });
  } catch {
    return NextResponse.json({ error: "Не удалось проверить маршрут по базе" }, { status: 500 });
  }
}
