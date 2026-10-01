import fs from "node:fs";

const asOf = process.env.TARIFF_AS_OF || new Date().toISOString().slice(0,10);
const registryText = fs.readFileSync("lib/toll-engine/tariff-registry.ts", "utf8");
const rows = [...registryText.matchAll(/id: "([^"]+)"[\s\S]*?observedAt: "([^"]+)"[\s\S]*?effectiveFrom: (null|"[^"]+")[\s\S]*?staleAfterDays: (\d+)/g)]
  .map((m)=>({id:m[1], observedAt:m[2], effectiveFrom:m[3] === "null" ? null : m[3].slice(1,-1), staleAfterDays:Number(m[4])}));
if (!rows.length) throw new Error("No tariff registry rows parsed");
const day = (s)=>Date.parse(`${s}T00:00:00Z`);
let stale = 0;
let incomplete = 0;
for (const row of rows) {
  const age = Math.floor((day(asOf)-day(row.observedAt))/86400000);
  const status = age < 0 ? "FUTURE_OBSERVATION" : age > row.staleAfterDays ? "STALE" : "FRESH";
  if (status === "STALE") stale++;
  if (!row.effectiveFrom) incomplete++;
  console.log(`${status}\t${row.id}\tage=${age}d\tthreshold=${row.staleAfterDays}d\teffectiveFrom=${row.effectiveFrom ?? "UNKNOWN"}`);
}
console.log(`SUMMARY asOf=${asOf} snapshots=${rows.length} stale=${stale} effectiveDateUnknown=${incomplete}`);
if (process.env.TARIFF_STALE_STRICT === "1" && stale > 0) process.exitCode = 2;
