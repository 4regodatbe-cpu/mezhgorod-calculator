import fs from "node:fs";

const ALLOWED_REF = "refs/heads/fix/v3-missing-route-prices-2026-10-15";
const ZERO_SHA = /^0{40}$/;
const SAFE_SHA = /^[0-9a-f]{40}$/i;
const LIVE_PATHS = [
  "app/api/v2/",
  "app/v2/",
  "lib/",
  "data/special-territory-boundaries.json",
  "data/tolls/",
  "data/toll-feature-switches.json",
  "data/road-kilometrage.json",
  "data/m4-pvp-osm-partial.json",
  "experiments/nationwide-tolls/engine/",
  "experiments/nationwide-tolls/source-snapshots/",
  "experiments/nationwide-tolls/fastest-route-policy.mjs",
  "experiments/nationwide-tolls/odintsovo-lane-identity.mjs",
  "experiments/nationwide-tolls/national-registry.json",
  "experiments/nationwide-tolls/m1-m3-official-gates.json",
  "experiments/nationwide-tolls/m1-m3-shadow-quote.mjs",
  "experiments/toll-od-matrix/matrix/",
  "experiments/toll-od-matrix/m4-pvp-preview.mjs",
  "experiments/toll-od-matrix/engine.mjs",
  "package.json",
  "pnpm-lock.yaml",
];

function isTestPath(file) {
  return /(?:^|\/)__tests__(?:\/|$)/i.test(file) || /\.(?:test|spec)\.[^/]+$/i.test(file);
}

export function classifyChangedPaths(paths) {
  if (!Array.isArray(paths) || paths.length === 0 || paths.some((file) => typeof file !== "string" || !file || file.startsWith("/") || file.split("/").includes(".."))) {
    return { shouldRunLive: true, reason: "changed-paths-unverifiable" };
  }
  const matched = paths.filter((file) => !isTestPath(file) && LIVE_PATHS.some((prefix) => file === prefix || file.startsWith(prefix)));
  return matched.length
    ? { shouldRunLive: true, reason: "route-runtime-changed" }
    : { shouldRunLive: false, reason: "no-route-runtime-change-in-this-push" };
}

export function classifyPushEvent(event) {
  if (!event || event.ref !== ALLOWED_REF || typeof event.before !== "string" || !SAFE_SHA.test(event.before) || typeof event.after !== "string" || !SAFE_SHA.test(event.after)) {
    return { shouldRunLive: true, reason: "push-range-unverifiable" };
  }
  if (ZERO_SHA.test(event.before) || !Number.isInteger(event.size) || event.size < 1 || !Array.isArray(event.commits) || event.commits.length !== event.size) {
    return { shouldRunLive: true, reason: "push-commit-list-incomplete" };
  }

  const paths = [];
  for (const commit of event.commits) {
    if (!commit || !Array.isArray(commit.added) || !Array.isArray(commit.modified) || !Array.isArray(commit.removed)) {
      return { shouldRunLive: true, reason: "push-file-list-incomplete" };
    }
    paths.push(...commit.added, ...commit.modified, ...commit.removed);
  }
  return classifyChangedPaths(paths);
}

function main() {
  let result;
  try {
    const eventPath = process.argv[2];
    if (!eventPath) throw new Error("missing event path");
    result = classifyPushEvent(JSON.parse(fs.readFileSync(eventPath, "utf8")));
  } catch {
    result = { shouldRunLive: true, reason: "classifier-error" };
  }
  const output = `should_run_live=${result.shouldRunLive}\nreason=${result.reason}\n`;
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
  else process.stdout.write(output);
  console.log(JSON.stringify(result));
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) main();
