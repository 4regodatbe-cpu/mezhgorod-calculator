import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRequestBody,
  haversineKm,
  parseWktSummary,
  summarizeResponse,
  validAlternative,
  validateLedgerForRun,
  validateOwnerApproval,
  validateQuotaBudget,
} from "./diagnose.mjs";

test("WKT LINESTRING is reduced to counts without retaining coordinate pairs", () => {
  const wkt = "LINESTRING(37.1000 55.1000, 37.2000 55.2000, 37.3000 55.3000)";
  const result = parseWktSummary(wkt);
  assert.deepEqual(result, { valid: true, lineCount: 1, pointCount: 3, nearestAnchorM: null, nearestAnchorSegmentM: null });
  assert.equal(JSON.stringify(result).includes("37.1000"), false);
  assert.equal(parseWktSummary(wkt, [37.1, 55.1]).nearestAnchorM, 0);
  assert.equal(parseWktSummary("LINESTRING(-0.001 0, 0.001 0)", [0, 0]).nearestAnchorM > 100, true);
  assert.equal(parseWktSummary("LINESTRING(-0.001 0, 0.001 0)", [0, 0]).nearestAnchorSegmentM, 0);
});

test("WKT MULTILINESTRING counts separate lines and rejects malformed coordinates", () => {
  assert.deepEqual(
    parseWktSummary("MULTILINESTRING((1 2, 3 4),(5 6, 7 8, 9 10))"),
    { valid: true, lineCount: 2, pointCount: 5, nearestAnchorM: null, nearestAnchorSegmentM: null },
  );
  assert.equal(parseWktSummary("LINESTRING(1 2, broken)").valid, false);
  assert.equal(parseWktSummary("POINT(1 2)").valid, false);
});

test("route aggregate is reported separately and never mapped to an individual PVP price", () => {
  const response = {
    status: "OK",
    result: [{
      total_distance: 12345,
      total_duration: 789,
      maneuvers: [{ outcoming_path: { geometry: [
        { selection: "LINESTRING(37.1 55.1, 37.2 55.2)" },
      ] } }],
      payment_info: {
        total_payments: 240,
        events: [{ pvp_id: "synthetic-A", price: 100 }, { pvp_id: "synthetic-B", price: 140 }],
      },
    }],
  };
  const summary = summarizeResponse(200, response, { anchor: [37.1, 55.1] });
  assert.equal(summary.httpStatus, 200);
  assert.equal(summary.routeBuildStatus, "OK");
  assert.equal(summary.paymentEventCount, 2);
  assert.equal(summary.totalPaymentsEntryCount, null);
  assert.equal(summary.routeAggregate, 240);
  assert.equal(summary.nearestAnchorM, 0);
  assert.equal(summary.nearestAnchorSegmentM, 0);
  assert.equal(summary.perPvpPrice, null);
  assert.equal(JSON.stringify(summary).includes("synthetic-A"), false);
  assert.equal(JSON.stringify(summary).includes("100"), false);
});

test("HTTP 200 without a built route does not count as success", () => {
  assert.equal(summarizeResponse(200, { status: "OK", result: [] }).routeBuildStatus, "NO_ROUTE_IN_RESULT");
  assert.equal(summarizeResponse(200, { status: "ERROR", result: [] }).routeBuildStatus, "ERROR");
});

test("HTTP errors remain distinct from route build status and expose no body", () => {
  const summary = summarizeResponse(429, null);
  assert.equal(summary.httpStatus, 429);
  assert.equal(summary.routeBuildStatus, "NO_ROUTE");
  assert.equal(summary.geometryPointCount, 0);
});

test("distance validation uses longitude/latitude and stays under the route cap", () => {
  assert.ok(haversineKm([37.582591, 55.775364], [37.656625, 55.765036]) < 10);
  assert.ok(haversineKm([0, 0], [1, 0]) > 50);
});

test("request uses [longitude, latitude], Russian locale and alternative=0", () => {
  assert.deepEqual(buildRequestBody({ from: [37.1, 55.2], to: [37.3, 55.4] }), {
    points: [
      { type: "stop", lon: 37.1, lat: 55.2 },
      { type: "stop", lon: 37.3, lat: 55.4 },
    ],
    transport: "driving",
    route_mode: "fastest",
    output: "detailed",
    need_payment_info: true,
    locale: "ru",
    alternative: 0,
  });
});

test("verified alternative=2 changes only the requested alternative count", () => {
  const candidate = { from: [37.1, 55.2], to: [37.3, 55.4], alternative: 0 };
  const primary = buildRequestBody(candidate);
  const withAlternatives = buildRequestBody({ ...candidate, alternative: 2 });
  assert.equal(validAlternative(primary.alternative), true);
  assert.equal(validAlternative(withAlternatives.alternative), true);
  assert.equal(validAlternative(1), false);
  assert.deepEqual({ ...withAlternatives, alternative: 0 }, primary);
});

test("historical payment schema counts route_points and total_payments without retaining entries", () => {
  const response = {
    result: [{
      status: "OK",
      route_points: [{ marker: "synthetic-secret-a" }, { marker: "synthetic-secret-b" }],
      total_payments: [{ amount: 120 }, { amount: 80 }],
    }],
  };
  const summary = summarizeResponse(200, response);
  assert.equal(summary.paymentEventCount, 2);
  assert.equal(summary.totalPaymentsEntryCount, 2);
  assert.equal(summary.routeAggregate, null);
  assert.equal(JSON.stringify(summary).includes("synthetic-secret"), false);
});

test("ledger blocks repeats per window without globally blocking independent windows", () => {
  const ledger = { attempts: [{ id: "first-window", status: "response_received" }] };
  assert.throws(() => validateLedgerForRun(ledger, "first-window", {}), /repeat calls are blocked/u);
  assert.equal(validateLedgerForRun(ledger, "second-window", {}).length, 1);
});

test("execution approval is recent and scoped to the selected window", () => {
  const now = Date.parse("2026-11-05T12:00:00.000Z");
  const approved = {
    ownerApproval: {
      approved: true,
      approvedAt: "2026-11-05T11:00:00.000Z",
      reference: "owner approval record",
      windowIds: ["ckad-m11-m12"],
    },
  };
  assert.doesNotThrow(() => validateOwnerApproval(approved, "ckad-m11-m12", now));
  assert.throws(() => validateOwnerApproval(approved, "m11-15-58", now), /exact window/u);
  assert.throws(() => validateOwnerApproval({ ownerApproval: {
    ...approved.ownerApproval,
    windowIds: ["ckad-m11-m12", "m11-15-58"],
  } }, "m11-15-58", now), /exact window/u);
  assert.throws(() => validateOwnerApproval({ ownerApproval: { ...approved.ownerApproval, approvedAt: "2026-11-04T00:00:00.000Z" } }, "ckad-m11-m12", now), /exact window/u);
});

test("CKAD outcome_unknown blocks CKAD replay but PVP18 needs its own execution approval", () => {
  const now = Date.parse("2026-11-06T12:00:00.000Z");
  const pvp18 = { id: "m11-15-58", status: "prepared" };
  const ledger = { attempts: [{
    id: "ckad-m11-m12",
    requestParameters: {
      points: [
        { type: "stop", lon: 37.1996241, lat: 56.0900701 },
        { type: "stop", lon: 37.214862, lat: 56.0915116 },
      ],
      transport: "driving", route_mode: "fastest", output: "detailed",
      need_payment_info: true, locale: "ru", alternative: 0,
    },
    status: "outcome_unknown",
    expectedUnits: 1,
  }] };
  assert.throws(() => validateLedgerForRun(ledger, "ckad-m11-m12", {}), /repeat calls are blocked/u);
  assert.equal(validateLedgerForRun(ledger, pvp18.id, {}).length, 1);

  const ckadOnlyApproval = { ownerApproval: {
    approved: true,
    approvedAt: "2026-11-06T11:00:00.000Z",
    reference: "separate CKAD authorization",
    windowIds: ["ckad-m11-m12"],
  } };
  assert.throws(() => validateOwnerApproval(ckadOnlyApproval, pvp18.id, now), /exact window/u);

  const pvpApproval = { ownerApproval: {
    approved: true,
    approvedAt: "2026-11-06T11:00:00.000Z",
    reference: "separate PVP18 authorization",
    windowIds: [pvp18.id],
  } };
  assert.doesNotThrow(() => validateOwnerApproval(pvpApproval, pvp18.id, now));
  assert.equal(validateLedgerForRun(ledger, pvp18.id, pvpApproval, now).length, 1);
});

test("quota guard enforces the packet cap, counter and conservative minute rate", () => {
  assert.doesNotThrow(() => validateQuotaBudget({ packetUnits: 0, recentUnits: 0, expectedUnits: 1, remainingUnits: 991 }));
  assert.doesNotThrow(() => validateQuotaBudget({ packetUnits: 299, recentUnits: 0, expectedUnits: 1, remainingUnits: 991 }));
  assert.throws(() => validateQuotaBudget({ packetUnits: 300, recentUnits: 0, expectedUnits: 1, remainingUnits: 991 }), /budget/u);
  assert.throws(() => validateQuotaBudget({ packetUnits: 0, recentUnits: 5, expectedUnits: 1, remainingUnits: 991 }), /5 route units/u);
  assert.throws(() => validateQuotaBudget({ packetUnits: 0, recentUnits: 0, expectedUnits: 1, remainingUnits: 0 }), /budget/u);
  assert.throws(() => validateQuotaBudget({ packetUnits: 0, recentUnits: 0, expectedUnits: 2, remainingUnits: 991 }), /one documented route/u);
});
