const OSRM = "https://router.project-osrm.org/route/v1/driving";
const M11_NAME = /(?:^|[^0-9A-ZА-Я])(?:M|М)\s*[-‐‑–—]?\s*11(?:[^0-9]|$)/iu;
const NEVA = /нева/iu;

const places = {
  Moscow: { label: "Москва", lat: 55.755819, lng: 37.617644 },
  SaintPetersburg: { label: "Санкт-Петербург", lat: 59.938784, lng: 30.314997 },
  Sochi: { label: "Сочи", lat: 43.585472, lng: 39.723098 },
};

const cases = [
  ["Moscow -> Saint Petersburg", places.Moscow, places.SaintPetersburg],
  ["Sochi -> Saint Petersburg", places.Sochi, places.SaintPetersburg],
  ["Saint Petersburg -> Sochi", places.SaintPetersburg, places.Sochi],
];

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function strictRoadStrings(step) {
  return [step.name, step.ref]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());
}

function clueStrings(step) {
  return [step.name, step.ref, step.destinations]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());
}

function isStrictM11(step) {
  return strictRoadStrings(step).some((value) => M11_NAME.test(value));
}

function isDestinationM11Candidate(step) {
  return typeof step.destinations === "string" && M11_NAME.test(step.destinations);
}

function isNevaCandidate(step) {
  return clueStrings(step).some((value) => NEVA.test(value));
}

function edgeCoordinates(step) {
  const coordinates = step.geometry?.coordinates ?? [];
  return {
    start: coordinates[0] ?? step.maneuver?.location ?? null,
    end: coordinates.at(-1) ?? step.maneuver?.location ?? null,
  };
}

function compactStep(step, stepIndex, beginKm, endKm) {
  const edge = edgeCoordinates(step);
  return {
    stepIndex,
    name: step.name ?? null,
    ref: step.ref ?? null,
    destinations: step.destinations ?? null,
    maneuverType: step.maneuver?.type ?? null,
    maneuverModifier: step.maneuver?.modifier ?? null,
    distanceKm: round((Number(step.distance) || 0) / 1000),
    beginKm: round(beginKm),
    endKm: round(endKm),
    startCoordinate: edge.start,
    endCoordinate: edge.end,
  };
}

function analyzeSteps(steps) {
  let routeKm = 0;
  const annotated = [];
  for (let i = 0; i < steps.length; i += 1) {
    const distanceKm = (Number(steps[i].distance) || 0) / 1000;
    const beginKm = routeKm;
    const endKm = routeKm + distanceKm;
    annotated.push({
      step: steps[i],
      stepIndex: i,
      beginKm,
      endKm,
      strictM11: isStrictM11(steps[i]),
      destinationM11Candidate: isDestinationM11Candidate(steps[i]),
      nevaCandidate: isNevaCandidate(steps[i]),
    });
    routeKm = endKm;
  }

  const strict = annotated.filter((item) => item.strictM11);
  const blocks = [];
  for (const item of strict) {
    const previous = blocks.at(-1);
    if (previous && item.stepIndex === previous.lastStepIndex + 1) {
      previous.lastStepIndex = item.stepIndex;
      previous.endKm = item.endKm;
      previous.steps.push(item);
    } else {
      blocks.push({
        firstStepIndex: item.stepIndex,
        lastStepIndex: item.stepIndex,
        beginKm: item.beginKm,
        endKm: item.endKm,
        steps: [item],
      });
    }
  }

  return {
    strictM11StepCount: strict.length,
    destinationM11CandidateStepCount: annotated.filter((item) => item.destinationM11Candidate && !item.strictM11).length,
    nevaCandidateStepCount: annotated.filter((item) => item.nevaCandidate).length,
    blocks: blocks.map((block) => {
      const first = block.steps[0];
      const last = block.steps.at(-1);
      return {
        firstStepIndex: block.firstStepIndex,
        lastStepIndex: block.lastStepIndex,
        beginKm: round(block.beginKm),
        endKm: round(block.endKm),
        lengthKm: round(block.endKm - block.beginKm),
        startCoordinate: edgeCoordinates(first.step).start,
        endCoordinate: edgeCoordinates(last.step).end,
        before: annotated[block.firstStepIndex - 1]
          ? compactStep(annotated[block.firstStepIndex - 1].step, block.firstStepIndex - 1, annotated[block.firstStepIndex - 1].beginKm, annotated[block.firstStepIndex - 1].endKm)
          : null,
        after: annotated[block.lastStepIndex + 1]
          ? compactStep(annotated[block.lastStepIndex + 1].step, block.lastStepIndex + 1, annotated[block.lastStepIndex + 1].beginKm, annotated[block.lastStepIndex + 1].endKm)
          : null,
        steps: block.steps.map((item) => compactStep(item.step, item.stepIndex, item.beginKm, item.endKm)),
      };
    }),
    destinationM11Clues: annotated
      .filter((item) => item.destinationM11Candidate && !item.strictM11)
      .map((item) => compactStep(item.step, item.stepIndex, item.beginKm, item.endKm)),
    nevaOnlyClues: annotated
      .filter((item) => item.nevaCandidate && !item.strictM11)
      .map((item) => compactStep(item.step, item.stepIndex, item.beginKm, item.endKm)),
  };
}

async function probe([name, from, to]) {
  const path = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = new URL(`${OSRM}/${path}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "true");

  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0 Segment6A2B" },
    signal: AbortSignal.timeout(45_000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${name}: OSRM HTTP ${response.status}: ${text.slice(0, 1000)}`);
  const data = JSON.parse(text);
  if (data.code !== "Ok" || !data.routes?.length) throw new Error(`${name}: OSRM route unavailable: ${text.slice(0, 1000)}`);

  const route = data.routes[0];
  const legs = route.legs ?? [];
  const steps = legs.flatMap((leg) => leg.steps ?? []);
  const analyzed = analyzeSteps(steps);
  const record = {
    name,
    from: from.label,
    to: to.label,
    routeKm: round(Number(route.distance) / 1000),
    routeMinutes: Math.round(Number(route.duration) / 60),
    legCount: legs.length,
    stepCount: steps.length,
    ...analyzed,
  };
  console.log(`M11_OSRM_STEPS_PROBE ${JSON.stringify(record)}`);
  return record;
}

const results = [];
for (const item of cases) results.push(await probe(item));
console.log(`M11_OSRM_STEPS_PROBE_SUMMARY ${JSON.stringify({ count: results.length, results })}`);
