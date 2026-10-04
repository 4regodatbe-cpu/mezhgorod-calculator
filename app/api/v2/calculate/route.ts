import { NextRequest, NextResponse } from "next/server";
import { geocode, type Point } from "@/lib/route-providers";
import { calculateLeg } from "@/lib/v2-calculation/route-leg";
import { calculateRoutePricing, type PricingVehicle } from "@/lib/route-pricing-integration";

import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "@/lib/special-territory-boundaries";
import { analyzeRoute, candidatePlans, endpointPolicy } from "@/lib/special-territory-policy";
import { calculateSpecialOptions } from "@/lib/v2-calculation/special-options";
import type { Coordinate } from "@/lib/tolls";

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

export const maxDuration = 120;

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
      specialRates?: UserRates;
      modeOverride?: boolean;
      manualRates?: number[];
      multiplier?: number;
    };
    if (body.mode !== undefined && body.mode !== "standard" && body.mode !== "dual") return NextResponse.json({ error: "Некорректный режим расчёта" }, { status: 400 });
    if (body.departureAt !== undefined && (typeof body.departureAt !== "string" || Number.isNaN(new Date(body.departureAt).getTime()))) return NextResponse.json({ error: "Некорректная дата поездки" }, { status: 400 });
    if (body.vehicle !== undefined && !VEHICLES.includes(body.vehicle)) return NextResponse.json({ error: "Некорректный класс автомобиля" }, { status: 400 });
    if (body.modeOverride !== undefined && typeof body.modeOverride !== "boolean") return NextResponse.json({error:"Некорректный режим"},{status:400});
    if (body.specialRates !== undefined && !validUserRates(body.specialRates)) return NextResponse.json({error:"Некорректные особые тарифы"},{status:400});
    if (body.rates !== undefined && !validUserRates(body.rates)) return NextResponse.json({ error: "Некорректные тарифы" }, { status: 400 });
    if (body.manualRates !== undefined && (!Array.isArray(body.manualRates) || body.manualRates.length !== 2 || !body.manualRates.every(validRate))) return NextResponse.json({ error: "Некорректные тарифы участков" }, { status: 400 });
    if (body.multiplier !== undefined && (typeof body.multiplier !== "number" || !Number.isFinite(body.multiplier) || body.multiplier < 1 || body.multiplier > 6)) return NextResponse.json({ error: "Некорректная наценка" }, { status: 400 });
    if (!validPoint(body.from) || !validPoint(body.to)) return NextResponse.json({ error: "Проверьте точки маршрута" }, { status: 400 });

    const [from,to] = await Promise.all([geocode(body.from),geocode(body.to)]);
    const policy = endpointPolicy(from.position,to.position,zones);
    const automaticMode = policy.specialEndpoint ? "dual" : "standard";
    const mode = body.modeOverride === true && body.mode ? body.mode : policy.specialEndpoint ? "dual" : "standard";
    const normalRateOverrides = body.rates ? { ...body.rates, comfort_plus:body.rates.comfortPlus } : undefined;
    const specialRateOverrides = body.specialRates ? { ...body.specialRates, comfort_plus:body.specialRates.comfortPlus } : undefined;
    const attachPricing = <T extends { meters:number; seconds:number; coordinates:Coordinate[]; legs?:unknown }>(trip:T) => {
      // Policy is independent of manual pricing mode, including every alternative.
      const territorySplit = analyzeRoute(trip.coordinates,trip.meters,trip.seconds,from.position,to.position,zones);
      const {coordinates, legs, ...summary} = trip;
      void coordinates; void legs;
      return {...summary, pricingByVehicle:Object.fromEntries(VEHICLES.map(vehicle=>[vehicle,calculateRoutePricing({
        from:from.label,to:to.label,vehicle,mode,normalRateOverrides,specialRateOverrides,multiplier:body.multiplier,
        legs:[{from:from.label,to:to.label,distanceKm:trip.meters/1000,territorySplit}],
      })]))};
    };
    if(policy.specialEndpoint) {
      const special=await calculateSpecialOptions(from,to,body.departureAt);
      const options=special.options.map(option=>({from:option.from,to:option.to,fast:attachPricing(option.fast),free:null,freeCandidate:null}));
      if(!options.length)throw new Error("MAINLAND_UNAVAILABLE");
      return NextResponse.json({legs:options,options,mode,automaticMode,specialEndpoint:true,preferredCorridor:special.preferredCorridor,routePolicy:special.routePolicy});
    }
    const plan=candidatePlans(from.position,to.position,zones)[0];
    const leg=await calculateLeg(from,to,body.departureAt,body.diagnostics===true,plan.positions);
    const attachAlternative = <T extends { meters:number;seconds:number;coordinates:Coordinate[] }>(trip:T|null) => {
      if(!trip)return null;
      try { return attachPricing(trip); } catch {return null;}
    };
    const priced={...leg,fast:attachPricing(leg.fast),free:attachAlternative(leg.free),freeCandidate:attachAlternative(leg.freeCandidate)};
    return NextResponse.json({legs:[priced],mode,automaticMode,specialEndpoint:false});
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = {
      PREFERRED_ROUTE_UNAVAILABLE: "Не удалось построить маршрут выбранного направления. Попробуйте позже.",
      SPECIAL_TRANSIT_EXCLUDED: "Маршрут проходит через особую тарифную зону и исключён.",
      ADDRESS_NOT_FOUND: "Адрес не найден. Уточните город или населённый пункт.",
      GEOCODE_UNAVAILABLE: "Поиск адресов временно недоступен.",
      ROUTE_NOT_FOUND: "Не удалось построить автомобильный маршрут.",
      ROUTE_UNAVAILABLE: "Сервис маршрутов временно недоступен. Попробуйте позже.",
    };
    return NextResponse.json({ error: messages[code] ?? "Не удалось выполнить расчёт." }, { status: code.endsWith("UNAVAILABLE") ? 502 : 400 });
  }
}
