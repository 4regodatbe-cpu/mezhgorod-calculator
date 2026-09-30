const GROUP = (process.env.M11_PROBE_GROUP || "a").toLowerCase();
const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const M11_NAME = /(?:^|[^0-9A-ZА-Я])(?:M|М)\s*[-‐‑–—]?\s*11(?:[^0-9]|$)/iu;

const places = {
  Moscow: { label: "Москва", lat: 55.755819, lng: 37.617644 },
  SaintPetersburg: { label: "Санкт-Петербург", lat: 59.938784, lng: 30.314997 },
  Tver: { label: "Тверь", lat: 56.858721, lng: 35.917596 },
  Solnechnogorsk: { label: "Солнечногорск", lat: 56.185102, lng: 36.977631 },
  Sochi: { label: "Сочи", lat: 43.585472, lng: 39.723098 },
};

const groups = {
  a: [
    ["Moscow -> Saint Petersburg", places.Moscow, places.SaintPetersburg],
    ["Saint Petersburg -> Moscow", places.SaintPetersburg, places.Moscow],
    ["Moscow -> Tver", places.Moscow, places.Tver],
  ],
  b: [
    ["Tver -> Saint Petersburg", places.Tver, places.SaintPetersburg],
    ["Solnechnogorsk -> Saint Petersburg", places.Solnechnogorsk, places.SaintPetersburg],
    ["Sochi -> Saint Petersburg", places.Sochi, places.SaintPetersburg],
  ],
};

const cases = groups[GROUP];
if (!cases) throw new Error(`Unknown M11_PROBE_GROUP=${GROUP}`);

function decodePolyline(encoded, precision = 6) {
  const coordinates = [];
  const factor = 10 ** precision;
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push([lng / factor, lat / factor]);
  }
  return coordinates;
}

function haversineKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function cumulativeKm(shape) {
  const result = [0];
  for (let i = 1; i < shape.length; i += 1) result.push(result[i - 1] + haversineKm(shape[i - 1], shape[i]));
  return result;
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function namesOf(maneuver) {
  return [...(maneuver.street_names ?? []), ...(maneuver.begin_street_names ?? [])]
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function isM11(maneuver) {
  return namesOf(maneuver).some((value) => M11_NAME.test(value));
}

function summarizeNeighbor(maneuver, index) {
  if (!maneuver) return null;
  return {
    maneuverIndex: index,
    type: maneuver.type ?? null,
    names: namesOf(maneuver),
    instruction: maneuver.instruction ?? null,
    beginShapeIndex: maneuver.begin_shape_index ?? null,
    endShapeIndex: maneuver.end_shape_index ?? null,
  };
}

function analyzeLeg(leg, routeOffsetKm, legIndex) {
  const shape = leg.shape ? decodePolyline(leg.shape) : [];
  const chain = cumulativeKm(shape);
  const maneuvers = leg.maneuvers ?? [];
  const usable = [];
  const malformed = [];

  for (let i = 0; i < maneuvers.length; i += 1) {
    const maneuver = maneuvers[i];
    if (!isM11(maneuver)) continue;
    const begin = maneuver.begin_shape_index;
    const end = maneuver.end_shape_index;
    if (!Number.isInteger(begin) || !Number.isInteger(end) || begin < 0 || end < begin || end >= shape.length) {
      malformed.push({ maneuverIndex: i, names: namesOf(maneuver), beginShapeIndex: begin ?? null, endShapeIndex: end ?? null });
      continue;
    }
    usable.push({
      maneuverIndex: i,
      names: namesOf(maneuver),
      instruction: maneuver.instruction ?? null,
      beginShapeIndex: begin,
      endShapeIndex: end,
      beginKm: routeOffsetKm + chain[begin],
      endKm: routeOffsetKm + chain[end],
      beginCoordinate: shape[begin],
      endCoordinate: shape[end],
    });
  }

  const blocks = [];
  for (const item of usable) {
    const previous = blocks.at(-1);
    if (previous && item.maneuverIndex === previous.lastManeuverIndex + 1) {
      previous.lastManeuverIndex = item.maneuverIndex;
      previous.endKm = item.endKm;
      previous.endCoordinate = item.endCoordinate;
      previous.maneuvers.push(item);
      continue;
    }
    blocks.push({
      legIndex,
      firstManeuverIndex: item.maneuverIndex,
      lastManeuverIndex: item.maneuverIndex,
      beginKm: item.beginKm,
      endKm: item.endKm,
      beginCoordinate: item.beginCoordinate,
      endCoordinate: item.endCoordinate,
      maneuvers: [item],
    });
  }

  const enrichedBlocks = blocks.map((block) => ({
    legIndex,
    firstManeuverIndex: block.firstManeuverIndex,
    lastManeuverIndex: block.lastManeuverIndex,
    beginKm: round(block.beginKm),
    endKm: round(block.endKm),
    lengthKm: round(block.endKm - block.beginKm),
    beginCoordinate: block.beginCoordinate,
    endCoordinate: block.endCoordinate,
    before: summarizeNeighbor(maneuvers[block.firstManeuverIndex - 1], block.firstManeuverIndex - 1),
    after: summarizeNeighbor(maneuvers[block.lastManeuverIndex + 1], block.lastManeuverIndex + 1),
    maneuvers: block.maneuvers.map((item) => ({
      maneuverIndex: item.maneuverIndex,
      names: item.names,
      instruction: item.instruction,
      beginShapeIndex: item.beginShapeIndex,
      endShapeIndex: item.endShapeIndex,
      beginKm: round(item.beginKm),
      endKm: round(item.endKm),
      beginCoordinate: item.beginCoordinate,
      endCoordinate: item.endCoordinate,
    })),
  }));

  return {
    legIndex,
    shapePoints: shape.length,
    shapeLengthKm: round(chain.at(-1) ?? 0),
    m11ManeuverCount: usable.length,
    malformed,
    blocks: enrichedBlocks,
  };
}

async function probe([name, from, to]) {
  const query = {
    locations: [
      { lat: from.lat, lon: from.lng },
      { lat: to.lat, lon: to.lng },
    ],
    costing: "auto",
    costing_options: { auto: { use_tolls: 1 } },
    units: "kilometers",
    shape_format: "polyline6",
    directions_options: { language: "ru-RU", units: "kilometers" },
  };
  const url = new URL(VALHALLA);
  url.searchParams.set("json", JSON.stringify(query));
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0 Segment6A2" },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${name}: Valhalla HTTP ${response.status}: ${text.slice(0, 1000)}`);
  const data = JSON.parse(text);
  const legs = data.trip?.legs ?? [];
  const summary = data.trip?.summary ?? {};
  if (!legs.length || !summary.length) throw new Error(`${name}: missing Valhalla trip/legs`);

  let routeOffsetKm = 0;
  const analyzedLegs = [];
  for (let i = 0; i < legs.length; i += 1) {
    const analyzed = analyzeLeg(legs[i], routeOffsetKm, i);
    analyzedLegs.push(analyzed);
    routeOffsetKm += analyzed.shapeLengthKm;
  }

  const blocks = analyzedLegs.flatMap((leg) => leg.blocks);
  const malformedCount = analyzedLegs.reduce((sum, leg) => sum + leg.malformed.length, 0);
  const record = {
    name,
    from: from.label,
    to: to.label,
    routeKm: round(Number(summary.length)),
    routeMinutes: Math.round(Number(summary.time) / 60),
    legCount: legs.length,
    m11BlockCount: blocks.length,
    m11ManeuverCount: analyzedLegs.reduce((sum, leg) => sum + leg.m11ManeuverCount, 0),
    malformedM11ManeuverCount: malformedCount,
    blocks,
  };
  console.log(`M11_MANEUVER_PROBE ${JSON.stringify(record)}`);
  return record;
}

const results = [];
for (const item of cases) results.push(await probe(item));
console.log(`M11_MANEUVER_PROBE_SUMMARY ${JSON.stringify({ group: GROUP, count: results.length, results })}`);
