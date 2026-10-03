import { NextRequest, NextResponse } from "next/server";
import { geocode, type Point } from "@/lib/route-providers";
import { calculateLeg } from "@/lib/v2-calculation/route-leg";
import { calculateRoutePricing, type PricingVehicle } from "@/lib/route-pricing-integration";

type UserRates = { standard: number; comfort: number; comfortPlus: number; minivan: number };
const VEHICLES: PricingVehicle[] = ["standard", "comfort", "comfort_plus", "minivan"];

function validPoint(point: Point | undefined): point is Point {
  if (!point || typeof point.label !== "string" || !point.label.trim()) return false;
  if (!point.position) return true;
  const { lat, lng } = point.position;
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
function validRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 10000;
}
function validUserRates(value: unknown): value is UserRates {
  if (!value || typeof value !== "object") return false;
  const rates = value as Partial<UserRates>;
  return validRate(rates.standard) && validRate(rates.comfort) && validRate(rates.comfortPlus) && validRate(rates.minivan);
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      from?: Point;
      via?: Point;
      to?: Point;
      mode?: "standard" | "dual";
      departureAt?: string;
      diagnostics?: boolean;
      vehicle?: PricingVehicle;
      rates?: UserRates;
      manualRates?: number[];
      multiplier?: number;
    };
    if (body.mode !== undefined && body.mode !== "standard" && body.mode !== "dual") return NextResponse.json({ error: "Некорректный режим расчёта" }, { status: 400 });
    if (body.departureAt !== undefined && (typeof body.departureAt !== "string" || Number.isNaN(new Date(body.departureAt).getTime()))) return NextResponse.json({ error: "Некорректная дата поездки" }, { status: 400 });
    if (body.vehicle !== undefined && !VEHICLES.includes(body.vehicle)) return NextResponse.json({ error: "Некорректный класс автомобиля" }, { status: 400 });
    if (body.rates !== undefined && !validUserRates(body.rates)) return NextResponse.json({ error: "Некорректные тарифы" }, { status: 400 });
    if (body.manualRates !== undefined && (!Array.isArray(body.manualRates) || body.manualRates.length !== 2 || !body.manualRates.every(validRate))) return NextResponse.json({ error: "Некорректные тарифы участков" }, { status: 400 });
    if (body.multiplier !== undefined && (typeof body.multiplier !== "number" || !Number.isFinite(body.multiplier) || body.multiplier < 1 || body.multiplier > 6)) return NextResponse.json({ error: "Некорректная наценка" }, { status: 400 });
    if (!validPoint(body.from) || !validPoint(body.to) || (body.mode === "dual" && !validPoint(body.via))) return NextResponse.json({ error: "Проверьте точки маршрута" }, { status: 400 });

    const located = await Promise.all([geocode(body.from), ...(body.mode === "dual" && body.via ? [geocode(body.via)] : []), geocode(body.to)]);
    const legs = body.mode === "dual"
      ? await Promise.all([calculateLeg(located[0], located[1], body.departureAt, body.diagnostics === true), calculateLeg(located[1], located[2], body.departureAt, body.diagnostics === true)])
      : [await calculateLeg(located[0], located[1], body.departureAt, body.diagnostics === true)];

    const normalRateOverrides = body.rates ? {
      standard: body.rates.standard,
      comfort: body.rates.comfort,
      comfort_plus: body.rates.comfortPlus,
      minivan: body.rates.minivan,
    } : undefined;
    const multiplier = body.multiplier ?? 1;
    const pricedLegs = legs.map((leg, index) => {
      const manualRate = body.mode === "dual" ? body.manualRates?.[index] : undefined;
      const attachPricing = <T extends { meters: number }>(trip: T) => ({
        ...trip,
        pricingByVehicle: Object.fromEntries(VEHICLES.map((vehicle) => [vehicle, calculateRoutePricing({
          from: leg.from,
          to: leg.to,
          vehicle,
          normalRateOverrides: body.mode === "standard" ? normalRateOverrides : undefined,
          manualRateByLeg: manualRate === undefined ? undefined : [manualRate],
          multiplier,
          legs: [{ from: leg.from, to: leg.to, distanceKm: trip.meters / 1000 }],
        })])),
      });
      return {
        ...leg,
        fast: attachPricing(leg.fast),
        free: leg.free ? attachPricing(leg.free) : null,
        freeCandidate: leg.freeCandidate ? attachPricing(leg.freeCandidate) : null,
      };
    });

    const pricing = calculateRoutePricing({
      from: located[0].label,
      to: located[located.length - 1].label,
      vehicle: body.vehicle,
      normalRateOverrides: body.mode === "standard" ? normalRateOverrides : undefined,
      manualRateByLeg: body.mode === "dual" ? body.manualRates : undefined,
      multiplier,
      legs: legs.map((route, index) => ({
        from: located[index].label,
        to: located[index + 1].label,
        distanceKm: route.fast.meters / 1000,
      })),
    });
    return NextResponse.json({ legs: pricedLegs, ...pricing });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = {
      ADDRESS_NOT_FOUND: "Адрес не найден. Уточните город или населённый пункт.",
      GEOCODE_UNAVAILABLE: "Поиск адресов временно недоступен.",
      ROUTE_NOT_FOUND: "Не удалось построить автомобильный маршрут.",
      ROUTE_UNAVAILABLE: "Сервис маршрутов временно недоступен. Попробуйте позже.",
    };
    return NextResponse.json({ error: messages[code] ?? "Не удалось выполнить расчёт." }, { status: code.endsWith("UNAVAILABLE") ? 502 : 400 });
  }
}
