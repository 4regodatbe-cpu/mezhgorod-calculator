import { writeFile } from "node:fs/promises";

const endpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const controls = {
  p58: [4215723025, 4215723024, 4215723028, 4215723029, 3283566523, 5170196700, 5170196701, 5170196702, 5170196703, 3243217928, 3243217926, 5170196693, 5170196692, 5170196691, 3283566519],
  p147: [6588472831, 6588472832],
  p545: [4348992197, 4348992196, 4348992195, 4348992194, 13267626813],
  p593: [13249401006, 14162143275],
  p679: [7014845625, 7014845624, 7014845623, 7014845622, 7014845621, 7014845620, 7014845619, 2492861243, 2492861246, 7014845616, 7014845615, 7014845614],
  pulkovoGantryControl: [13377945035, 13377945036],
};

async function post(endpoint, query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "user-agent": "mezhgorod-calculator/segment6a3b2d-context",
      },
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const json = await response.json();
    if (!Array.isArray(json.elements)) throw new Error("INVALID_OVERPASS_PAYLOAD");
    return json;
  } finally {
    clearTimeout(timer);
  }
}

async function queryWithFailover(query) {
  const failures = [];
  for (const endpoint of endpoints) {
    try {
      return { endpoint, failures, payload: await post(endpoint, query) };
    } catch (error) {
      failures.push({ endpoint, error: error instanceof Error ? error.message : String(error) });
    }
  }
  throw new Error(`OVERPASS_ALL_FAILED:${JSON.stringify(failures)}`);
}

const results = {};
for (const [controlId, nodeIds] of Object.entries(controls)) {
  const ids = nodeIds.join(",");
  const query = `[out:json][timeout:45];
node(id:${ids})->.anchors;
way(bn.anchors)->.parents;
(
  .anchors;
  .parents;
  nwr(around.anchors:500)["name"];
  nwr(around.anchors:500)["ref"];
  nwr(around.anchors:500)["barrier"="toll_booth"];
  nwr(around.anchors:500)["highway"="toll_gantry"];
);
out center tags;`;
  const response = await queryWithFailover(query);
  results[controlId] = {
    requestedNodeIds: nodeIds,
    endpoint: response.endpoint,
    failuresBeforeSuccess: response.failures,
    elements: response.payload.elements,
  };
  console.log(`OSM_CONTEXT_OK control=${controlId} anchors=${nodeIds.length} elements=${response.payload.elements.length}`);
  for (const element of response.payload.elements) {
    const tags = element.tags ?? {};
    if (tags.ref || tags.name || tags.highway || tags.barrier) {
      const lat = element.lat ?? element.center?.lat ?? null;
      const lon = element.lon ?? element.center?.lon ?? null;
      const label = [tags.name, tags.ref, tags.highway, tags.barrier].filter(Boolean).join(" | ");
      console.log(`OSM_CONTEXT ${controlId} ${element.type}/${element.id} ${lat ?? ""},${lon ?? ""} ${label}`);
    }
  }
}

await writeFile(
  "m11-osm-parent-context.json",
  `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), controls: results }, null, 2)}\n`,
  "utf8",
);
