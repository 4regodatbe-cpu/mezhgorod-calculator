import switches from "../data/toll-feature-switches.json";

const STAGES = ["request_body", "geocoding", "special_options", "route_leg", "routing", "provider_valhalla",
  "provider_osrm", "provider_brouter", "toll_matching", "toll_pricing", "response_pricing"] as const;
export type CalculationStage = typeof STAGES[number];
type StageTiming = { stage: CalculationStage; calls: number; errors: number; totalMs: number; maxMs: number };
export type CalculationTimingSummary = {
  status: number; handlerElapsedMs: number | null; targetMs: number; overTarget: boolean | null;
  stages: StageTiming[]; stops: string[];
};
const round = (n: number) => Math.round(n * 1000) / 1000;

/** Observes only. No deadlines, cancellation, retries, route/price decisions or
 * user data. Parallel stage durations overlap and must NOT be added together. */
export function createCalculationTiming({ enabled = switches.calculationTiming, clock = () => performance.now(),
  logger = (summary: CalculationTimingSummary) => console.info("calculation_timing", summary), targetMs = 10_000 }: {
    enabled?: boolean; clock?: () => number; logger?: (summary: CalculationTimingSummary) => void; targetMs?: number;
  } = {}) {
  const rows = new Map<CalculationStage, StageTiming>();
  const stops = new Set<string>();
  let finished: { header: string | null; summary: CalculationTimingSummary } | null = null;
  function read(): number | null {
    try { const n = clock(); if (Number.isFinite(n)) return n; } catch { /* Optional timing cannot break a calculation. */ }
    stops.add("timing_clock_unavailable"); return null;
  }
  const started = enabled ? read() : null;
  const duration = (from: number | null, to: number | null): number | null => {
    if (from !== null && to !== null && to >= from) return to - from;
    stops.add("timing_clock_unavailable"); return null;
  };
  function record(stage: CalculationStage, at: number | null, failed: boolean) {
    if (finished) return;
    if (!STAGES.includes(stage)) { stops.add("timing_stage_unknown"); return; }
    const ms = duration(at, read());
    if (ms === null) return;
    const row = rows.get(stage) ?? { stage, calls: 0, errors: 0, totalMs: 0, maxMs: 0 };
    row.calls++; row.errors += Number(failed); row.totalMs += ms; row.maxMs = Math.max(row.maxMs, ms); rows.set(stage, row);
  }
  async function measure<T>(stage: CalculationStage, operation: () => Promise<T> | T): Promise<T> {
    if (!enabled) return operation();
    const at = read(); let failed = true;
    try { const result = await operation(); failed = false; return result; }
    finally { record(stage, at, failed); }
  }
  function measureSync<T>(stage: CalculationStage, operation: () => T): T {
    if (!enabled) return operation();
    const at = read(); let failed = true;
    try { const result = operation(); failed = false; return result; }
    finally { record(stage, at, failed); }
  }
  function finish(status: number) {
    if (!enabled) return null;
    if (finished) return finished;
    const elapsed = duration(started, read());
    const target = Number.isFinite(targetMs) && targetMs > 0 ? targetMs : 10_000;
    const stages = STAGES.flatMap(stage => {
      const row = rows.get(stage); return row ? [{ ...row, totalMs: round(row.totalMs), maxMs: round(row.maxMs) }] : [];
    });
    const summary: CalculationTimingSummary = { status, handlerElapsedMs: elapsed === null ? null : round(elapsed),
      targetMs: target, overTarget: elapsed === null || stops.has("timing_clock_unavailable") ? null : elapsed > target,
      stages, stops: [...stops] };
    const parts = [...(elapsed === null ? [] : [`calc_total;dur=${round(elapsed)}`]), ...stages.map(row => `${row.stage};dur=${row.totalMs}`)];
    finished = { summary, header: parts.length ? parts.join(", ") : null };
    try { logger(summary); } catch { summary.stops.push("timing_log_unavailable"); }
    return finished;
  }
  return { enabled, measure, measureSync, finish };
}
export type CalculationTiming = ReturnType<typeof createCalculationTiming>;
