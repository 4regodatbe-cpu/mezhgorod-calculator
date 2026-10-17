// One fixed primary-object batch. No routing, tracing, price lookup or retries.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";

const planPath = "experiments/nationwide-tolls/checks/2026-10-18-m12-western-boundaries/inputs.json";
const directory = process.argv[2];
assert.ok(directory && process.env.M12_DURABLE_STARTED_COMMIT, "Require output directory and durable STARTED SHA");
const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
for (const [file, expected] of Object.entries(plan.sourceHashes)) assert.equal(sha(fs.readFileSync(file)), expected, file);
assert.equal(plan.primaryUrls.length, 9);
assert.equal(new Set(plan.primaryUrls).size, 9);
fs.mkdirSync(directory, { recursive: true });
const save = (name, value) => {
  const file = path.join(directory, name), text = JSON.stringify(value, null, 2) + "\n";
  fs.writeFileSync(`${file}.tmp`, text);
  fs.renameSync(`${file}.tmp`, file);
  assert.equal(fs.readFileSync(file, "utf8"), text, "Atomic progress readback");
};
const completed = fs.readdirSync(directory).filter(file => file.endsWith(".metadata.json"))
  .map(file => JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")));
assert.ok(completed.every(record => plan.primaryUrls.includes(record.url)));
assert.equal(new Set(completed.map(record => record.url)).size, completed.length);
for (const record of completed) if (record.bodyFile) {
  assert.equal(sha(fs.readFileSync(path.join(directory, record.bodyFile))), record.sha256);
}
let terminal = completed.some(record => record.error || record.status !== 200);
const priorMs = completed.reduce((sum, record) => sum + record.elapsedMs, 0);
const began = performance.now();
for (const url of plan.primaryUrls) {
  const parsed = new URL(url);
  assert.equal(parsed.protocol, "https:");
  assert.equal(parsed.hostname, "api.openstreetmap.org");
  assert.ok(/^\/api\/0\.6\/(?:node\/\d+|way\/\d+\/full)$/u.test(parsed.pathname));
  if (completed.some(record => record.url === url)) continue;
  const remainingMs = 120_000 - priorMs - (performance.now() - began);
  if (terminal || remainingMs <= 0) break;
  const key = sha(url).slice(0, 20);
  const record = { url, startedAt: new Date().toISOString(), durableStartedCommit: process.env.M12_DURABLE_STARTED_COMMIT };
  save("progress.json", { status: "IN_PROGRESS", completed: completed.length, planned: 9, current: url });
  const start = performance.now();
  try {
    const response = await fetch(url, { headers: { Accept: "application/xml", "User-Agent": "MezhgorodCalc/2.0" },
      signal: AbortSignal.timeout(Math.max(1, Math.floor(Math.min(15_000, remainingMs)))) });
    const bytes = Buffer.from(await response.arrayBuffer());
    record.bodyFile = `${key}.osm`;
    fs.writeFileSync(path.join(directory, record.bodyFile), bytes);
    Object.assign(record, { status: response.status, finalUrl: response.url,
      contentType: response.headers.get("content-type"), bytes: bytes.length, sha256: sha(bytes) });
  } catch (error) {
    record.error = String(error);
  }
  record.elapsedMs = Math.round(performance.now() - start);
  save(`${key}.metadata.json`, record);
  completed.push(record);
  terminal = Boolean(record.error || record.status !== 200);
  save("progress.json", { status: terminal ? "BLOCKED" : "IN_PROGRESS", completed: completed.length, planned: 9, terminal });
  console.log(JSON.stringify(record));
}
save("progress.json", { status: terminal ? "BLOCKED" : completed.length === 9 ? "DONE" : "BUDGET_EXHAUSTED",
  completed: completed.length, planned: 9, terminal,
  elapsedMs: Math.round(priorMs + performance.now() - began),
  remainingUrls: plan.primaryUrls.filter(url => !completed.some(record => record.url === url)) });
