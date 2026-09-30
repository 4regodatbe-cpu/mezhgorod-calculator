from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)


page_path = Path("app/v2/page.tsx")
page = page_path.read_text()

page = replace_once(
    page,
    'type TollView = { amount: number; weekdayAmount: number; weekendAmount: number; period: string; segments: string[]; confidence: "matched" | "none" };',
    'type TollView = { amount: number | null; weekdayAmount: number | null; weekendAmount: number | null; period: string; segments: string[]; confidence: "matched" | "none"; pricingStatus: "priced" | "free" | "unknown" };',
    "TollView type",
)

page = replace_once(
    page,
    'const standardHasTolls = (standardLeg?.fast.tolls.segments.length ?? 0) > 0;',
    'const standardHasTolls = standardLeg ? standardLeg.fast.tolls.pricingStatus !== "free" : false;',
    "standard toll attention",
)
page = replace_once(
    page,
    'const dualHasTolls = result?.legs.some((leg) => leg.fast.tolls.segments.length > 0) ?? false;',
    'const dualHasTolls = result?.legs.some((leg) => leg.fast.tolls.pricingStatus !== "free") ?? false;',
    "dual toll attention",
)

page = replace_once(
    page,
    'const variants = leg.fast.tolls.segments.length > 0 ? [{ type: "Платный", trip: leg.fast, tolls: leg.fast.tolls },',
    'const variants = leg.fast.tolls.pricingStatus !== "free" ? [{ type: leg.fast.tolls.pricingStatus === "unknown" ? "Быстрый, цена дорог ?" : "Платный", trip: leg.fast, tolls: leg.fast.tolls },',
    "analytics variants",
)
page = replace_once(
    page,
    'tollWeekday: tolls?.weekdayAmount ?? 0, tollWeekend: tolls?.weekendAmount ?? 0',
    'tollWeekday: tolls ? tolls.weekdayAmount : 0, tollWeekend: tolls ? tolls.weekendAmount : 0, tollPricingStatus: tolls?.pricingStatus ?? "free"',
    "analytics toll payload",
)

page = replace_once(
    page,
    'placeholder={toll.amount > 0 ? String(toll.amount) : "Сумма"}',
    'placeholder={(toll.amount ?? 0) > 0 ? String(toll.amount) : "Сумма"}',
    "manual toll placeholder",
)
page = page.replace("money(toll.weekdayAmount)", "money(toll.weekdayAmount ?? 0)")
page = page.replace("money(toll.weekendAmount)", "money(toll.weekendAmount ?? 0)")
page = page.replace("money(toll.amount)", "money(toll.amount ?? 0)")

copy_pattern = re.compile(
    r"  async function copyStandard\(.*?\n  async function copyDual\(.*?\n\n  return <main",
    re.S,
)
copy_replacement = (
    '  async function copyStandard(key: string, title: string, leg: Leg, trip: Trip, toll?: TollView, warning?: string) { const lines = [`Калькулятор межгород`, `${title}: ${leg.from} → ${leg.to}`, `${distance(trip.meters)} · ${duration(trip.seconds)}`, ...((Object.keys(defaults) as Array<keyof typeof defaults>).map((rate) => `${tariffNames[rate]}: ${money(trip.meters / 1000 * rates[rate] * multiplier)}`))]; if (toll) { if (toll.pricingStatus === "unknown") lines.push("Платная дорога: стоимость не определена"); else if (toll.weekdayAmount !== toll.weekendAmount) lines.push(`Платная дорога: Пн–Чт ${money(toll.weekdayAmount ?? 0)}, Пт–Вс ${money(toll.weekendAmount ?? 0)}`); else if (toll.pricingStatus === "priced") lines.push(`Платная дорога: ${money(toll.amount ?? 0)}`); } if (warning) lines.push(`Важно: ${warning}`); await navigator.clipboard.writeText(lines.join("\\n")); setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1800); }\n'
    '  async function copyDual(key: string, title: string, trips: Trip[], total: number, tollWeekday: number, tollWeekend: number, tollUnknown: boolean) { const lines = [`Калькулятор межгород`, title, ...result!.legs.map((leg, index) => `Участок ${index + 1}: ${leg.from} → ${leg.to} · ${distance(trips[index].meters)} · ${duration(trips[index].seconds)} · ${money(trips[index].meters / 1000 * (index === 0 ? rate1 : rate2) * multiplier)}`), `Итого: ${money(total)}`]; if (tollUnknown) lines.push("Платная дорога: стоимость не определена"); else if (tollWeekday > 0) lines.push(tollWeekday !== tollWeekend ? `Платная дорога: Пн–Чт ${money(tollWeekday)}, Пт–Вс ${money(tollWeekend)}` : `Платная дорога: ${money(tollWeekday)}`); await navigator.clipboard.writeText(lines.join("\\n")); setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1800); }\n\n'
    '  return <main'
)
page, count = copy_pattern.subn(copy_replacement, page, count=1)
if count != 1:
    raise SystemExit(f"copy functions: expected 1 replacement, found {count}")

page = replace_once(
    page,
    'title="По платной дороге" accent="blue" trip={standardLeg.fast}',
    'title={standardLeg.fast.tolls.pricingStatus === "unknown" ? "Быстрый маршрут" : "По платной дороге"} accent="blue" trip={standardLeg.fast}',
    "standard fast title",
)
page = replace_once(
    page,
    'onCopy={() => copyStandard("standard-fast", "По платной дороге", standardLeg, standardLeg.fast, standardLeg.fast.tolls)}',
    'onCopy={() => copyStandard("standard-fast", standardLeg.fast.tolls.pricingStatus === "unknown" ? "Быстрый маршрут" : "По платной дороге", standardLeg, standardLeg.fast, standardLeg.fast.tolls)}',
    "standard fast copy title",
)

page = replace_once(
    page,
    'const tollWeekday = result.legs.reduce((sum, leg) => sum + (fast ? leg.fast.tolls.weekdayAmount : 0), 0); const tollWeekend = result.legs.reduce((sum, leg) => sum + (fast ? leg.fast.tolls.weekendAmount : 0), 0);',
    'const tollUnknown = fast && result.legs.some((leg) => leg.fast.tolls.pricingStatus === "unknown"); const tollWeekday = result.legs.reduce((sum, leg) => sum + (fast ? (leg.fast.tolls.weekdayAmount ?? 0) : 0), 0); const tollWeekend = result.legs.reduce((sum, leg) => sum + (fast ? (leg.fast.tolls.weekendAmount ?? 0) : 0), 0);',
    "dual toll aggregate",
)
page = replace_once(
    page,
    'onClick={() => copyDual(`dual-${variant}`, title, trips, total, tollWeekday, tollWeekend)}',
    'onClick={() => copyDual(`dual-${variant}`, title, trips, total, tollWeekday, tollWeekend, tollUnknown)}',
    "dual copy truth",
)

old_dual_display = '{fast && tollWeekday > 0 && <div className="mt-2 text-right text-xs text-amber-700 dark:text-amber-300">{tollWeekday !== tollWeekend ? <><p>Пн–Чт: + {money(tollWeekday)} платные дороги</p><p>Пт–Вс: + {money(tollWeekend)} платные дороги</p></> : <p>+ {money(tollWeekday)} платные дороги, ориентировочно</p>}</div>}'
new_dual_display = '{fast && tollUnknown ? <div className="mt-2 text-right text-xs font-semibold text-amber-700 dark:text-amber-300">Стоимость платных дорог не определена</div> : fast && tollWeekday > 0 ? <div className="mt-2 text-right text-xs text-amber-700 dark:text-amber-300">{tollWeekday !== tollWeekend ? <><p>Пн–Чт: + {money(tollWeekday)} платные дороги</p><p>Пт–Вс: + {money(tollWeekend)} платные дороги</p></> : <p>+ {money(tollWeekday)} платные дороги, ориентировочно</p>}</div> : null}'
page = replace_once(page, old_dual_display, new_dual_display, "dual display truth")

page_path.write_text(page)

collect_path = Path("app/api/collect/route.ts")
collect = collect_path.read_text()
collect = replace_once(
    collect,
    'type RouteV2Event = { type: "route_v2"; fromRegion: string; toRegion: string; distanceKm: number; durationMin: number; routeType: string; totals: { standard: number; comfort: number; comfortPlus: number; minivan: number }; tollWeekday: number; tollWeekend: number };',
    'type RouteV2Event = { type: "route_v2"; fromRegion: string; toRegion: string; distanceKm: number; durationMin: number; routeType: string; totals: { standard: number; comfort: number; comfortPlus: number; minivan: number }; tollWeekday: number | null; tollWeekend: number | null; tollPricingStatus?: "priced" | "free" | "unknown" };',
    "route_v2 analytics type",
)
old_validation = '''      const numbers = [body.distanceKm, body.durationMin, body.tollWeekday, body.tollWeekend, ...Object.values(body.totals ?? {})];
      if (!clean(body.fromRegion, 120) || !clean(body.toRegion, 120) || !clean(body.routeType, 30) || numbers.length !== 8 || numbers.some((n) => !Number.isFinite(n) || n < 0)) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });'''
new_validation = '''      const baseNumbers = [body.distanceKm, body.durationMin, ...Object.values(body.totals ?? {})];
      const tollValues = [body.tollWeekday, body.tollWeekend];
      const pricingStatus = body.tollPricingStatus;
      const invalidStatus = pricingStatus !== undefined && !["priced", "free", "unknown"].includes(pricingStatus);
      const invalidTolls = pricingStatus === "unknown"
        ? tollValues.some((value) => value !== null)
        : tollValues.some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0);
      const invalidFree = pricingStatus === "free" && tollValues.some((value) => value !== 0);
      if (!clean(body.fromRegion, 120) || !clean(body.toRegion, 120) || !clean(body.routeType, 30) || baseNumbers.length !== 6 || baseNumbers.some((n) => !Number.isFinite(n) || n < 0) || invalidStatus || invalidTolls || invalidFree) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });'''
collect = replace_once(collect, old_validation, new_validation, "route_v2 validation")
collect_path.write_text(collect)

page_check = page_path.read_text()
collect_check = collect_path.read_text()
required_page = [
    'pricingStatus: "priced" | "free" | "unknown"',
    'fast.tolls.pricingStatus !== "free"',
    'tollPricingStatus: tolls?.pricingStatus ?? "free"',
    'Платная дорога: стоимость не определена',
    'tollUnknown',
]
for needle in required_page:
    if needle not in page_check:
        raise SystemExit(f"Missing UI truth invariant: {needle}")
if 'fast.tolls.segments.length > 0' in page_check:
    raise SystemExit("Unsafe toll classification by segment length remains in V2 page")
required_collect = ['tollWeekday: number | null', 'tollPricingStatus?', 'pricingStatus === "unknown"']
for needle in required_collect:
    if needle not in collect_check:
        raise SystemExit(f"Missing analytics truth invariant: {needle}")
