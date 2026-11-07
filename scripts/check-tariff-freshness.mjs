import fs from "node:fs";
import { pathToFileURL } from "node:url";

const DAY_MS = 86_400_000;

function parseDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value ? parsed : null;
}

export function resolveTariffAsOf(override = process.env.TARIFF_AS_OF, now = new Date()) {
  if (override != null && override !== "") {
    if (parseDay(override) == null) throw new Error(`Invalid TARIFF_AS_OF calendar date: ${override}`);
    return override;
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error("Invalid current date for tariff freshness");
  return now.toISOString().slice(0, 10);
}

export function parseTariffRows(registryText) {
  return [...registryText.matchAll(/id: "([^"]+)"[\s\S]*?observedAt: "([^"]+)"[\s\S]*?effectiveFrom: (null|"[^"]+")[\s\S]*?staleAfterDays: (\d+)/g)]
    .map((match) => ({
      id: match[1],
      observedAt: match[2],
      effectiveFrom: match[3] === "null" ? null : match[3].slice(1, -1),
      staleAfterDays: Number(match[4]),
    }));
}

export function evaluateTariffFreshness(registryText, asOf) {
  const asOfMs = parseDay(asOf);
  if (asOfMs == null) throw new Error(`Invalid tariff freshness date: ${asOf}`);
  const rows = parseTariffRows(registryText);
  if (!rows.length) throw new Error("No tariff registry rows parsed");

  const results = rows.map((row) => {
    const observedMs = parseDay(row.observedAt);
    const effectiveDateStatus = row.effectiveFrom == null
      ? "UNKNOWN"
      : parseDay(row.effectiveFrom) == null ? "INVALID" : "KNOWN";
    if (observedMs == null || effectiveDateStatus === "INVALID" || !Number.isInteger(row.staleAfterDays) || row.staleAfterDays <= 0) {
      return { ...row, status: "INVALID", ageDays: null, effectiveDateStatus };
    }
    const ageDays = Math.floor((asOfMs - observedMs) / DAY_MS);
    const status = ageDays < 0 ? "FUTURE_OBSERVATION" : ageDays > row.staleAfterDays ? "STALE" : "FRESH";
    return { ...row, status, ageDays, effectiveDateStatus };
  });

  return {
    asOf,
    rows: results,
    stale: results.filter((row) => row.status === "STALE").length,
    invalid: results.filter((row) => row.status === "INVALID").length,
    effectiveDateUnknown: results.filter((row) => row.effectiveDateStatus === "UNKNOWN").length,
  };
}

export function freshnessExitCode(report, strict = process.env.TARIFF_STALE_STRICT === "1") {
  return strict && (report.stale > 0 || report.invalid > 0) ? 2 : 0;
}

function run() {
  const asOf = resolveTariffAsOf();
  const registryText = fs.readFileSync("lib/toll-engine/tariff-registry.ts", "utf8");
  const report = evaluateTariffFreshness(registryText, asOf);
  for (const row of report.rows) {
    console.log(`${row.status}\t${row.id}\tage=${row.ageDays ?? "UNKNOWN"}d\tthreshold=${row.staleAfterDays}d\teffectiveFromStatus=${row.effectiveDateStatus}\teffectiveFrom=${row.effectiveFrom ?? "UNKNOWN"}`);
  }
  console.log(`SUMMARY asOf=${report.asOf} snapshots=${report.rows.length} stale=${report.stale} invalid=${report.invalid} effectiveDateUnknown=${report.effectiveDateUnknown}`);
  process.exitCode = freshnessExitCode(report);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
