import { readFile, chmod, open, rename, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const allowlistPath = path.join(here, "window-allowlist.json");
const ledgerPath = path.join(here, ".query-history.json");
const lockPath = path.join(here, ".query-history.lock");
const preflightPath = path.join(here, "preflight.local.json");
const API_KEY_ENV = "DGIS_HTTP_API_KEY";
const MAX_WINDOW_KM = 50;
const MAX_PACKET_UNITS = 300;
const MAX_UNITS_PER_MINUTE = 5;

export function validAlternative(value) {
  return Number.isInteger(value) && (value === 0 || value === 2);
}

export function haversineKm(a, b) {
  const rad = (n) => n * Math.PI / 180;
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const q = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

function validPoint(point) {
  return Array.isArray(point) && point.length === 2
    && point.every((x) => typeof x === "number" && Number.isFinite(x))
    && point[0] >= -180 && point[0] <= 180
    && point[1] >= -90 && point[1] <= 90;
}

export function parseWktSummary(wkt, anchor = null) {
  if (typeof wkt !== "string") return {
    valid: false, lineCount: 0, pointCount: 0, nearestAnchorM: null, nearestAnchorSegmentM: null,
  };
  const source = wkt.trim();
  let lineBodies;
  const single = source.match(/^LINESTRING\s*\(([^()]*)\)$/iu);
  if (single) lineBodies = [single[1]];
  else if (/^MULTILINESTRING\s*\(/iu.test(source)) {
    const inner = source.replace(/^MULTILINESTRING\s*\(/iu, "").replace(/\)\s*$/u, "");
    lineBodies = [...inner.matchAll(/\(([^()]*)\)/gu)].map((match) => match[1]);
    if (!lineBodies.length || inner.replace(/\([^()]*\)/gu, "").replace(/[,\s]/gu, "")) {
      return { valid: false, lineCount: 0, pointCount: 0, nearestAnchorM: null, nearestAnchorSegmentM: null };
    }
  } else return { valid: false, lineCount: 0, pointCount: 0 };
  let pointCount = 0;
  const parsedLines = [];
  for (const body of lineBodies) {
    const tokens = body.split(",");
    if (tokens.some((pair) => !/^\s*-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?(?:\s+-?\d+(?:\.\d+)?)?\s*$/u.test(pair))) {
      return { valid: false, lineCount: 0, pointCount: 0 };
    }
    pointCount += tokens.length;
    parsedLines.push(tokens.map((pair) => pair.trim().split(/\s+/u).map(Number)));
  }
  let nearestKm = null;
  let nearestSegmentKm = null;
  if (validPoint(anchor)) {
    const earthRadiusKm = 6371.0088;
    const anchorCosLat = Math.cos(anchor[1] * Math.PI / 180);
    const localXY = ([lon, lat]) => [
      earthRadiusKm * Math.PI / 180 * (lon - anchor[0]) * anchorCosLat,
      earthRadiusKm * Math.PI / 180 * (lat - anchor[1]),
    ];
    for (const line of parsedLines) {
      for (const [lon, lat] of line) {
        const distance = haversineKm([lon, lat], anchor);
        if (nearestKm === null || distance < nearestKm) nearestKm = distance;
      }
      const points = line.map(localXY);
      for (let i = 1; i < points.length; i++) {
        const [x1, y1] = points[i - 1];
        const [x2, y2] = points[i];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        const fraction = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(x1 * dx + y1 * dy) / lengthSquared));
        const x = x1 + fraction * dx;
        const y = y1 + fraction * dy;
        const distance = Math.hypot(x, y);
        if (nearestSegmentKm === null || distance < nearestSegmentKm) nearestSegmentKm = distance;
      }
    }
    if (nearestSegmentKm === null) nearestSegmentKm = nearestKm;
  }
  return {
    valid: true,
    lineCount: lineBodies.length,
    pointCount,
    nearestAnchorM: nearestKm === null ? null : Math.round(nearestKm * 1000),
    nearestAnchorSegmentM: nearestSegmentKm === null ? null : Math.round(nearestSegmentKm * 1000),
  };
}

function collectWkt(value, found = []) {
  if (!value || typeof value !== "object") return found;
  if (Array.isArray(value)) {
    for (const item of value) collectWkt(item, found);
    return found;
  }
  if (typeof value.selection === "string") found.push(value.selection);
  for (const child of Object.values(value)) collectWkt(child, found);
  return found;
}

function paymentInfo(route) {
  const info = route?.payment_info ?? route?.paymentInfo ?? route ?? null;
  const events = info?.route_points ?? route?.route_points
    ?? info?.events ?? info?.payment_events ?? info?.items;
  const aggregate = info?.total_payments ?? route?.total_payments ?? null;
  return {
    eventCount: Array.isArray(events) ? events.length : null,
    totalPaymentsEntryCount: Array.isArray(aggregate) ? aggregate.length : null,
    routeAggregate: typeof aggregate === "number" && Number.isFinite(aggregate) ? aggregate : null,
  };
}

export function summarizeResponse(httpStatus, payload, candidate = null) {
  const routes = Array.isArray(payload?.result) ? payload.result : [];
  const route = routes[0] ?? null;
  const routeStatus = route?.status ?? payload?.status ?? null;
  const geometry = route ? collectWkt(route).map((wkt) => parseWktSummary(wkt, candidate?.anchor)) : [];
  const goodGeometry = geometry.filter((g) => g.valid);
  const nearestAnchorM = goodGeometry
    .map((g) => g.nearestAnchorM)
    .filter(Number.isFinite)
    .reduce((min, distance) => min === null ? distance : Math.min(min, distance), null);
  const nearestAnchorSegmentM = goodGeometry
    .map((g) => g.nearestAnchorSegmentM)
    .filter(Number.isFinite)
    .reduce((min, distance) => min === null ? distance : Math.min(min, distance), null);
  const pay = paymentInfo(route);
  return {
    httpStatus,
    routeBuildStatus: route
      ? routeStatus === "OK" ? "OK" : routeStatus ?? "ROUTE_PRESENT_STATUS_UNKNOWN"
      : routeStatus === "OK" ? "NO_ROUTE_IN_RESULT" : routeStatus ?? "NO_ROUTE",
    routeCount: routes.length,
    distanceM: Number.isFinite(route?.total_distance) ? route.total_distance : null,
    durationS: Number.isFinite(route?.total_duration) ? route.total_duration : null,
    geometryLineCount: goodGeometry.reduce((n, g) => n + g.lineCount, 0),
    geometryPointCount: goodGeometry.reduce((n, g) => n + g.pointCount, 0),
    invalidGeometryCount: geometry.length - goodGeometry.length,
    nearestAnchorM,
    nearestAnchorSegmentM,
    paymentEventCount: pay.eventCount,
    totalPaymentsEntryCount: pay.totalPaymentsEntryCount,
    routeAggregate: pay.routeAggregate,
    perPvpPrice: null,
    ...(Array.isArray(candidate?.witnesses) ? {
      witnessComparisons: candidate.witnesses.map((w) => ({
        id: w.id,
        nearestSegmentM: collectWkt(route).map((s) => parseWktSummary(s, w.coordinate).nearestAnchorSegmentM)
          .filter(Number.isFinite).reduce((a, b) => a === null ? b : Math.min(a, b), null),
      })),
      aggregatePaymentSchema: Array.isArray(route?.total_payments)
        ? route.total_payments.map((p) => Object.keys(p ?? {}).sort()) : null,
      aggregatePaymentValues: Array.isArray(route?.total_payments)
        ? route.total_payments.map((p) => Object.fromEntries(Object.entries(p ?? {}).filter(([k, v]) =>
          (/^(amount|price|cost|value|tariff)$/iu.test(k) && Number.isFinite(v))
          || (/^(currency|currency_code)$/iu.test(k) && typeof v === "string")))) : null,
      detailedDataRetention: "transient processing only; no WKT or raw payment events retained",
    } : {}),
  };
}

function argsOf(argv) {
  const args = { execute: false, id: null };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--execute") args.execute = true;
    else if (token === "--case") args.id = argv[++i] ?? null;
    else if (token === "--help") args.help = true;
    else throw new Error("Unknown argument: " + token);
  }
  return args;
}

async function readJson(file, fallback) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}

async function saveLedger(ledger) {
  const temporaryPath = ledgerPath + ".tmp";
  const file = await open(temporaryPath, "w", 0o600);
  try {
    await file.writeFile(JSON.stringify(ledger, null, 2) + "\n", "utf8");
    await file.sync();
  } finally {
    await file.close();
  }
  await rename(temporaryPath, ledgerPath);
  await chmod(ledgerPath, 0o600);
}

export function validateLedgerForRun(ledger, candidateId, preflight, now = Date.now()) {
  const attempts = Array.isArray(ledger?.attempts) ? ledger.attempts : [];
  if (attempts.some((row) => row.id === candidateId)) {
    throw new Error("This window already has a reserved or completed attempt; repeat calls are blocked.");
  }
  // Attempts are isolated by allowlisted window ID. In particular, an unknown
  // outcome is a permanent no-retry reservation for that window, not a global
  // stop for independently approved windows. Each new execution still passes
  // validateOwnerApproval and the fresh quota/terms preflight before this gate.
  return attempts;
}

export function validateOwnerApproval(preflight, candidateId, now) {
  const approval = preflight?.ownerApproval;
  if (!approval || approval.approved !== true || !approval.reference
      || !Array.isArray(approval.windowIds) || approval.windowIds.length !== 1
      || approval.windowIds[0] !== candidateId
      || !Number.isFinite(Date.parse(approval.approvedAt ?? ""))
      || Date.parse(approval.approvedAt) > now
      || now - Date.parse(approval.approvedAt) > 24 * 60 * 60 * 1000) {
    throw new Error("Separate owner approval for this exact window is required before execution.");
  }
}

export function validateQuotaBudget({ packetUnits, recentUnits, expectedUnits, remainingUnits }) {
  if (expectedUnits !== 1 || !Number.isFinite(remainingUnits) || remainingUnits < 0) {
    throw new Error("This diagnostic configuration must reserve one documented route and have a valid quota counter.");
  }
  if (packetUnits + expectedUnits > MAX_PACKET_UNITS || packetUnits + expectedUnits > remainingUnits) {
    throw new Error("The authorized task budget or conservative remaining-quota budget would be exceeded.");
  }
  if (recentUnits + expectedUnits > MAX_UNITS_PER_MINUTE) {
    throw new Error("The conservative local limit of 5 route units/minute would be exceeded.");
  }
}

export function buildRequestBody(candidate) {
  return {
    points: [
      { type: "stop", lon: candidate.from[0], lat: candidate.from[1] },
      { type: "stop", lon: candidate.to[0], lat: candidate.to[1] },
    ],
    transport: "driving",
    route_mode: "fastest",
    output: "detailed",
    need_payment_info: true,
    locale: "ru",
    alternative: candidate.alternative ?? 0,
    ...(Number.isInteger(candidate.utc) ? { utc: candidate.utc } : {}),
  };
}

async function executeCandidate(candidate, allowlist) {
  const preflight = await readJson(preflightPath, null);
  const key = process.env[API_KEY_ENV];
  const now = Date.now();
  if (!candidate || !validPoint(candidate.from) || !validPoint(candidate.to)) {
    throw new Error("Coordinates are missing or invalid for this allowlisted window.");
  }
  const endpoint = new URL(allowlist.endpoint);
  if (endpoint.protocol !== "https:" || endpoint.hostname !== "routing.api.2gis.com"
      || endpoint.pathname !== "/routing/7.0.0/global" || endpoint.search || endpoint.hash) {
    throw new Error("The allowlisted endpoint is not the official 2GIS Routing API endpoint.");
  }
  if (!key) throw new Error(API_KEY_ENV + " is required; key value is never printed.");
  const distanceKm = haversineKm(candidate.from, candidate.to);
  if (distanceKm <= 0 || distanceKm > MAX_WINDOW_KM || distanceKm > candidate.maxKm) {
    throw new Error("Window length " + distanceKm.toFixed(2) + " km exceeds the approved limit.");
  }
  const alternative = candidate.alternative ?? 0;
  if (!validAlternative(alternative)) {
    throw new Error("Only verified alternative values 0 or 2 are supported.");
  }
  if (!preflight || preflight.demoKey !== true || preflight.paidAccess !== false
      || !preflight.termsCheckedAt || !preflight.keyExpiresAt
      || !Number.isFinite(preflight.remainingUnits)
      || !Number.isFinite(preflight.unitsPerRequest)
      || preflight.unitsPerRequest !== 1) {
    throw new Error("A current Platform Manager preflight is required; paid access is forbidden.");
  }
  const checkedAt = Date.parse(preflight.checkedAt ?? "");
  const expiresAt = Date.parse(preflight.keyExpiresAt);
  const termsAt = Date.parse(preflight.termsCheckedAt);
  if (![checkedAt, expiresAt, termsAt].every(Number.isFinite)
      || now - checkedAt > 24 * 60 * 60 * 1000
      || expiresAt <= now || termsAt > now) {
    throw new Error("Platform Manager preflight is stale or the key/terms are expired.");
  }
  if (preflight.unitsPerRequest > MAX_PACKET_UNITS
      || preflight.unitsPerRequest > preflight.remainingUnits) {
    throw new Error("Confirmed cost exceeds the packet cap or remaining demo quota.");
  }
  if (!preflight.termsReference || !preflight.quotaReference) {
    throw new Error("Preflight must cite the checked terms and quota screen without storing credentials.");
  }
  validateOwnerApproval(preflight, candidate.id, now);

  const lock = await open(lockPath, "wx", 0o600).catch((error) => {
    if (error.code === "EEXIST") throw new Error("Another request is running or a stale lock needs manual review; no request was sent.");
    throw error;
  });
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, at: new Date().toISOString() }) + "\n");
    await lock.close();
    const ledger = await readJson(ledgerPath, { attempts: [] });
    if (Array.isArray(ledger.completed) && !Array.isArray(ledger.attempts)) {
      ledger.attempts = ledger.completed.map((row) => ({
        ...row, status: "response_received", expectedUnits: Number(row.units) || 0,
        completedAt: row.at, quotaRemainingBefore: null,
      }));
    }
    const attempts = validateLedgerForRun(ledger, candidate.id, preflight, now);
    const packetUnits = attempts.reduce((sum, row) => sum + (Number(row.expectedUnits) || 0), 0);
    const recentUnits = attempts
      .filter((row) => now - Date.parse(row.startedAt ?? row.at ?? "") < 60_000)
      .reduce((sum, row) => sum + (Number(row.expectedUnits) || 0), 0);
    validateQuotaBudget({
      packetUnits,
      recentUnits,
      expectedUnits: preflight.unitsPerRequest,
      remainingUnits: preflight.remainingUnits,
    });

    const attempt = {
      id: candidate.id,
      requestParameters: buildRequestBody(candidate),
      status: "reserved",
      startedAt: new Date(now).toISOString(),
      expectedUnits: preflight.unitsPerRequest,
      quotaRemainingBefore: preflight.remainingUnits,
      observedQuotaDelta: null,
    };
    attempts.push(attempt);
    ledger.attempts = attempts;
    delete ledger.completed;
    await saveLedger(ledger);

    const url = new URL(allowlist.endpoint);
    url.searchParams.set("key", key);
    let httpStatus = 0;
    let payload = null;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildRequestBody(candidate)),
        signal: AbortSignal.timeout(15_000),
      });
      httpStatus = response.status;
      if (httpStatus === 200) {
        try { payload = await response.json(); } catch { payload = null; }
      }
    } catch {
      attempt.status = "outcome_unknown";
      attempt.completedAt = new Date().toISOString();
      await saveLedger(ledger).catch(() => {});
      throw new Error("Request failed or timed out; outcome is reserved and no automatic retry was attempted. Details suppressed.");
    }

    const summary = summarizeResponse(httpStatus, payload, candidate);
    Object.assign(attempt, {
      status: "response_received",
      completedAt: new Date().toISOString(),
      ...summary,
      observedQuotaDelta: null,
    });
    await saveLedger(ledger);
    return {
      id: candidate.id,
      at: attempt.completedAt,
      expectedUnits: attempt.expectedUnits,
      quotaDeltaObserved: null,
      ...summary,
    };
  } finally {
    await unlink(lockPath).catch(() => {});
  }
}

export async function main(argv = process.argv.slice(2)) {
  const args = argsOf(argv);
  if (args.help || !args.id) {
    console.log("Usage: node diagnose.mjs --case <allowlisted-id> [--execute]");
    return;
  }
  const allowlist = await readJson(allowlistPath, null);
  if (!allowlist?.candidates || !allowlist?.endpoint) throw new Error("Invalid local allowlist.");
  const candidate = allowlist.candidates.find((entry) => entry.id === args.id);
  if (!candidate) throw new Error("Case ID is not allowlisted.");
  if (!args.execute) {
    console.log(JSON.stringify({
      mode: "DRY_RUN",
      id: candidate.id,
      endpointPath: "/routing/7.0.0/global",
      coordinates: validPoint(candidate.from) && validPoint(candidate.to) ? "available" : "COORDINATES_REQUIRED",
      straightLineKm: validPoint(candidate.from) && validPoint(candidate.to)
        ? Number(haversineKm(candidate.from, candidate.to).toFixed(2)) : null,
      routeDistanceLimitKm: Math.min(MAX_WINDOW_KM, candidate.maxKm),
      anchor: validPoint(candidate.anchor) ? "available; nearest distance computed in memory" : "none",
      request: {
        transport: "driving", route_mode: "fastest", output: "detailed",
        need_payment_info: true, locale: "ru", alternative: candidate.alternative ?? 0,
        utc: Number.isInteger(candidate.utc) ? candidate.utc : "omitted (provider current-time default)",
      },
      documentedBilling: "one route per single point set; verify actual quota-counter delta after the first call",
      execution: "blocked until separate owner approval, key, fresh preflight and terms check",
    }, null, 2));
    return;
  }
  const row = await executeCandidate(candidate, allowlist);
  console.log(JSON.stringify(row, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("BLOCKED: " + error.message);
    process.exitCode = 2;
  });
}
