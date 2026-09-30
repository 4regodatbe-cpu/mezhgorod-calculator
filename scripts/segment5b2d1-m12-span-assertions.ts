import assert from "node:assert/strict";
import { deriveStrictM12Span, type M12SpanCoordinate } from "../lib/toll-engine/m12-valhalla-span.js";

function haversineKm(a: M12SpanCoordinate, b: M12SpanCoordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function chain(shape: M12SpanCoordinate[]) {
  const result = [0];
  for (let index = 1; index < shape.length; index += 1) {
    result.push(result[index - 1] + haversineKm(shape[index - 1], shape[index]));
  }
  return result;
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

let assertions = 0;
function check(condition: unknown, message: string) {
  assert.ok(condition, message);
  assertions += 1;
}

const leg1: M12SpanCoordinate[] = [[37.0, 55.0], [37.01, 55.0], [37.02, 55.0], [37.03, 55.0]];
const leg2: M12SpanCoordinate[] = [[37.03, 55.0], [37.04, 55.0], [37.05, 55.0]];
const c1 = chain(leg1);
const c2 = chain(leg2);
const span = deriveStrictM12Span([
  {
    coordinates: leg1,
    maneuvers: [
      { street_names: ["A local road"], begin_shape_index: 0, end_shape_index: 1 },
      { street_names: ["М-12 Восток"], begin_shape_index: 1, end_shape_index: 3 },
    ],
  },
  {
    coordinates: leg2,
    maneuvers: [
      { begin_street_names: ["M12"], begin_shape_index: 0, end_shape_index: 1 },
    ],
  },
]);
check(span !== null, "M-12 span should be detected");
check(span?.beginKm === round(c1[1]), `unexpected beginKm ${span?.beginKm}`);
check(span?.endKm === round(c1.at(-1)! + c2[1]), `unexpected endKm ${span?.endKm}`);

const none = deriveStrictM12Span([{ coordinates: leg1, maneuvers: [{ street_names: ["М-11 Нева"], begin_shape_index: 0, end_shape_index: 3 }] }]);
check(none === null, "M-11 must not be classified as M-12");

const malformed = deriveStrictM12Span([{ coordinates: leg1, maneuvers: [{ street_names: ["М-12"], begin_shape_index: 3, end_shape_index: 1 }] }]);
check(malformed === null, "invalid shape indexes must not create an M-12 span");

const compact = deriveStrictM12Span([{ coordinates: leg1, maneuvers: [{ street_names: ["M—12"], begin_shape_index: 0, end_shape_index: 2 }] }]);
check(compact !== null, "dash variants in M-12 name should be accepted");
check(compact?.beginKm === 0, "span beginning at first shape point should be zero");

console.log(`Segment 5B2D-1 span assertions passed: ${assertions}`);
