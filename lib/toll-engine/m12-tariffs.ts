import snapshot from "../../data/tolls/m12-2026-03-02-category1.json" with { type: "json" };

export type M12TariffStatus = "priced" | "same_rvp" | "unknown";

export type M12TariffResult = {
  status: M12TariffStatus;
  amountRub: number | null;
  fromId: string;
  toId: string;
  fromName: string | null;
  toName: string | null;
  direction: "forward" | "reverse" | "none" | null;
  effectiveFrom: string;
  sourceOrder: string;
  reason: string | null;
};

const stops = snapshot.stops;
const adjacent = snapshot.adjacentCategory1Rub;
const indexById = new Map(stops.map((stop, index) => [stop.id, index]));

if (adjacent.length !== stops.length - 1) {
  throw new Error(`M12 tariff snapshot malformed: ${adjacent.length} adjacent tariffs for ${stops.length} stops`);
}
if (adjacent.some((amount) => !Number.isFinite(amount) || amount < 0)) {
  throw new Error("M12 tariff snapshot malformed: adjacent tariff must be a non-negative finite number");
}

export function priceM12Category1(fromId: string, toId: string): M12TariffResult {
  const fromIndex = indexById.get(fromId);
  const toIndex = indexById.get(toId);
  const fromName = fromIndex == null ? null : stops[fromIndex].name;
  const toName = toIndex == null ? null : stops[toIndex].name;
  const common = {
    fromId,
    toId,
    fromName,
    toName,
    effectiveFrom: snapshot.order.effectiveFrom,
    sourceOrder: `${snapshot.order.number} / ${snapshot.order.date}`,
  };

  if (fromIndex == null || toIndex == null) {
    return {
      ...common,
      status: "unknown",
      amountRub: null,
      direction: null,
      reason: "Unknown M-12 official RVP id",
    };
  }

  if (fromIndex === toIndex) {
    return {
      ...common,
      status: "same_rvp",
      amountRub: 0,
      direction: "none",
      reason: "Entry and exit are the same official RVP; this is not evidence that an arbitrary route is toll-free",
    };
  }

  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  let amountRub = 0;
  for (let index = start; index < end; index += 1) amountRub += adjacent[index];

  return {
    ...common,
    status: "priced",
    amountRub,
    direction: fromIndex < toIndex ? "forward" : "reverse",
    reason: null,
  };
}

export function m12Category1TariffSnapshot() {
  return snapshot;
}
