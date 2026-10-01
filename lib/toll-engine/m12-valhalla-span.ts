export type M12SpanCoordinate = [number, number];

export type M12ValhallaManeuver = {
  street_names?: string[];
  begin_street_names?: string[];
  begin_shape_index?: number;
  end_shape_index?: number;
};

export type M12ValhallaLeg = {
  coordinates: M12SpanCoordinate[];
  maneuvers?: M12ValhallaManeuver[];
};

export type M12StrictRouteSpan = {
  beginKm: number;
  endKm: number;
};

const M12_NAME = /(?:^|[^0-9A-ZА-Я])(?:M|М)\s*[-‐‑–—]?\s*12(?:[^0-9]|$)/iu;

function round(value: number, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function haversineKm(a: M12SpanCoordinate, b: M12SpanCoordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function cumulativeKm(shape: M12SpanCoordinate[]) {
  const result = [0];
  for (let index = 1; index < shape.length; index += 1) {
    result.push(result[index - 1] + haversineKm(shape[index - 1], shape[index]));
  }
  return result;
}

function isStrictM12Maneuver(maneuver: M12ValhallaManeuver) {
  const names = [
    ...(maneuver.street_names ?? []),
    ...(maneuver.begin_street_names ?? []),
  ];
  return names.some((value) => M12_NAME.test(value));
}

export function deriveStrictM12Span(legs: M12ValhallaLeg[]): M12StrictRouteSpan | null {
  let routeOffsetKm = 0;
  const segments: Array<{ beginKm: number; endKm: number }> = [];

  for (const leg of legs) {
    const shape = leg.coordinates;
    if (shape.length < 2) continue;
    const chain = cumulativeKm(shape);

    for (const maneuver of leg.maneuvers ?? []) {
      if (!isStrictM12Maneuver(maneuver)) continue;
      const begin = maneuver.begin_shape_index;
      const end = maneuver.end_shape_index;
      if (!Number.isInteger(begin) || !Number.isInteger(end)) continue;
      if ((begin as number) < 0 || (end as number) < (begin as number) || (end as number) >= shape.length) continue;
      segments.push({
        beginKm: routeOffsetKm + chain[begin as number],
        endKm: routeOffsetKm + chain[end as number],
      });
    }

    routeOffsetKm += chain.at(-1) ?? 0;
  }

  if (segments.length === 0) return null;
  return {
    beginKm: round(Math.min(...segments.map((segment) => segment.beginKm))),
    endKm: round(Math.max(...segments.map((segment) => segment.endKm))),
  };
}
