import fs from "node:fs";
import { B11_API_FILE, B11_BEFORE_BLOB, B11_AFTER_BLOB, exactB11SourcePair } from "./b11-exact-reuse-change.mjs";

const SAFE_SHA = /^[0-9a-f]{40}$/i;
const MAX_COMPARE_FILES = 300;
const ALLOWED_BRANCH = "fix/v3-missing-route-prices-2026-10-15";
// Owner-authorized exact UI-only exception. Never exempt its directory or aliases.
const ADDRESS_FIELD_UI = "app/v2/components/address-field.tsx";
const LIVE_PATHS = [
  "app/api/",
  "app/r/",
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
  if (!Array.isArray(paths) || paths.length === 0 || Array.from(paths).some((file) => typeof file !== "string" || !file || file.startsWith("/") || file.split("/").includes(".."))) {
    return { shouldRunLive: true, reason: "changed-paths-unverifiable" };
  }
  const matched = paths.filter((file) => file !== ADDRESS_FIELD_UI && !isTestPath(file) && LIVE_PATHS.some((prefix) => file === prefix || file.startsWith(prefix)));
  return matched.length
    ? { shouldRunLive: true, reason: "route-runtime-changed" }
    : { shouldRunLive: false, reason: "no-route-runtime-change-in-update" };
}

export function findPreviousCompletedRun(runs, prNumber, currentRunId) {
  if (!Array.isArray(runs) || !Number.isInteger(prNumber)) return null;
  const candidates = runs.flatMap((run) => {
    if (!run || run.id === currentRunId || run.status !== "completed" || !["success", "failure"].includes(run.conclusion) || !Number.isFinite(Date.parse(run.created_at))) return [];
    const linkedPr = Array.isArray(run.pull_requests) ? run.pull_requests.find((pr) => pr?.number === prNumber) : null;
    if (!linkedPr) return [];
    // The linked PR head can reflect the PR's newer head when Actions history
    // is queried later. Use this run's immutable head_sha for the comparison.
    const checkedHeadSha = run.head_sha;
    if (!SAFE_SHA.test(checkedHeadSha ?? "")) return [];
    return [{ ...run, checked_head_sha: checkedHeadSha }];
  });
  candidates.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return candidates[0] ?? null;
}

export function hasReliablePreviousChecks(jobs) {
  if (!Array.isArray(jobs)) return false;
  const verify = jobs.find((job) => job?.name === "verify");
  if (verify?.status !== "completed" || verify.conclusion !== "success") return false;
  const classifier = jobs.find((job) => job?.name === "classify_live_scope");
  const liveProbe = jobs.find((job) => job?.name === "live_probe");
  if (classifier) {
    // A classifier failure is still a usable baseline only when fail-open actually
    // ran the wide probe to completion; this covers runner output-processing errors.
    if (classifier.status !== "completed" || !["success", "failure"].includes(classifier.conclusion) || liveProbe?.status !== "completed") return false;
    return classifier.conclusion === "success" || ["success", "failure"].includes(liveProbe.conclusion);
  }
  const timing = jobs.find((job) => job?.name === "calculation_timing");
  const geometryStep = liveProbe?.steps?.find((step) => step?.name === "Probe live provider geometry and per-leg times");
  return liveProbe?.status === "completed" && geometryStep?.status === "completed" && geometryStep.conclusion === "success" && timing?.status === "completed" && timing.conclusion === "success";
}

export function classifyPullRequestDelta(previousHead, currentHead, comparison, b11Sources) {
  if (!SAFE_SHA.test(previousHead ?? "") || !SAFE_SHA.test(currentHead ?? "")) {
    return { shouldRunLive: true, reason: "comparison-head-unverifiable" };
  }
  if (previousHead === currentHead || comparison?.status === "identical") {
    return { shouldRunLive: false, reason: "head-already-checked" };
  }
  if (comparison?.status !== "ahead" || !Array.isArray(comparison.files) || comparison.files.length >= MAX_COMPARE_FILES) {
    return { shouldRunLive: true, reason: "comparison-incomplete-or-non-linear" };
  }
  const paths = [];
  for (const file of comparison.files) {
    paths.push(file?.filename);
    if (file?.status === "renamed") {
      if (typeof file.previous_filename !== "string" || !file.previous_filename) {
        return { shouldRunLive: true, reason: "rename-origin-unverifiable" };
      }
      paths.push(file.previous_filename);
    }
  }
  const ordinary = classifyChangedPaths(paths);
  const apiFiles = comparison.files.filter(file => file?.filename === B11_API_FILE);
  if (ordinary.shouldRunLive && apiFiles.length === 1 && apiFiles[0].status === "modified"
    && apiFiles[0].sha === B11_AFTER_BLOB && typeof apiFiles[0].patch === "string" && apiFiles[0].patch.length > 0
    && b11Sources?.beforeBlob === B11_BEFORE_BLOB && b11Sources?.afterBlob === B11_AFTER_BLOB
    && exactB11SourcePair(b11Sources.before, b11Sources.after)) {
    const others = paths.filter(path => path !== B11_API_FILE);
    // Even the separate AddressField exemption cannot hide mixed runtime work.
    const otherRuntime = others.some(path => /^(?:app|lib|data)\//.test(path) && !isTestPath(path));
    if (!otherRuntime && (!others.length || !classifyChangedPaths(others).shouldRunLive)) {
      return { shouldRunLive: false, reason: "exact-authorized-b11-split-reuse" };
    }
  }
  return ordinary;
}

export function formatGitHubOutput(result) {
  return `should_run_live=${result.shouldRunLive}\nreason=${result.reason}\n`;
}

async function githubJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
  return response.json();
}

async function classifyCurrentPrEvent(event) {
  if (process.env.GITHUB_EVENT_NAME === "workflow_dispatch") {
    return { shouldRunLive: true, reason: "explicit-workflow-dispatch" };
  }
  const prNumber = event?.pull_request?.number;
  const currentHead = event?.pull_request?.head?.sha;
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GH_TOKEN;
  if (process.env.GITHUB_EVENT_NAME !== "pull_request" || !Number.isInteger(prNumber) || !SAFE_SHA.test(currentHead ?? "") || !repository || !token) {
    return { shouldRunLive: true, reason: "pr-context-unverifiable" };
  }

  const root = `https://api.github.com/repos/${repository}`;
  const workflow = await githubJson(`${root}/actions/workflows/special-territory-policy.yml/runs?event=pull_request&branch=${encodeURIComponent(ALLOWED_BRANCH)}&per_page=100`, token);
  const previous = findPreviousCompletedRun(workflow?.workflow_runs, prNumber, Number(process.env.GITHUB_RUN_ID));
  if (!previous) return { shouldRunLive: true, reason: "previous-checked-head-unavailable" };

  const previousJobs = await githubJson(`${root}/actions/runs/${previous.id}/jobs?per_page=100`, token);
  if (!hasReliablePreviousChecks(previousJobs?.jobs)) return { shouldRunLive: true, reason: "previous-checks-incomplete" };

  const comparison = await githubJson(`${root}/compare/${previous.checked_head_sha}...${currentHead}`, token);
  let b11Sources;
  if (comparison?.status === "ahead" && Array.isArray(comparison.files) && comparison.files.length < MAX_COMPARE_FILES
    && comparison.files.some(file => file.filename === B11_API_FILE && file.status === "modified" && file.sha === B11_AFTER_BLOB)) {
    const [before, after] = await Promise.all([
      githubJson(`${root}/contents/${B11_API_FILE}?ref=${previous.checked_head_sha}`, token),
      githubJson(`${root}/contents/${B11_API_FILE}?ref=${currentHead}`, token),
    ]);
    if (before.type === "file" && after.type === "file" && before.encoding === "base64" && after.encoding === "base64"
      && typeof before.content === "string" && typeof after.content === "string") {
      b11Sources = { beforeBlob: before.sha, afterBlob: after.sha,
        before: Buffer.from(before.content, "base64").toString("utf8"), after: Buffer.from(after.content, "base64").toString("utf8") };
    }
  }
  return classifyPullRequestDelta(previous.checked_head_sha, currentHead, comparison, b11Sources);
}

async function main() {
  let result;
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) throw new Error("event payload unavailable");
    result = await classifyCurrentPrEvent(JSON.parse(fs.readFileSync(eventPath, "utf8")));
  } catch {
    result = { shouldRunLive: true, reason: "classifier-or-api-error" };
  }
  const output = formatGitHubOutput(result);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
    console.error(JSON.stringify(result));
  } else {
    process.stdout.write(output);
    console.log(JSON.stringify(result));
  }
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) await main();
