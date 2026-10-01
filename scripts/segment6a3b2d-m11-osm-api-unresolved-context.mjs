import { writeFile } from "node:fs/promises";

const controls = {
  p593: [13249401006, 14162143275],
  p679: [7014845625, 2492861243, 7014845614],
  pulkovoGantryControl: [13377945035, 13377945036],
};

const base = "https://api.openstreetmap.org/api/0.6";

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "mezhgorod-calculator/segment6a3b2d-osm-api" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function firstElement(payload) {
  return Array.isArray(payload?.elements) ? payload.elements[0] ?? null : null;
}

const results = {};
let successfulNodes = 0;

for (const [controlId, nodeIds] of Object.entries(controls)) {
  const control = { nodes: [], errors: [] };
  for (const nodeId of nodeIds) {
    try {
      const [nodePayload, waysPayload] = await Promise.all([
        fetchJson(`${base}/node/${nodeId}.json`),
        fetchJson(`${base}/node/${nodeId}/ways.json`),
      ]);
      const node = firstElement(nodePayload);
      const ways = Array.isArray(waysPayload?.elements) ? waysPayload.elements : [];
      if (!node || node.type !== "node") throw new Error("NODE_PAYLOAD_MISSING");
      successfulNodes += 1;
      control.nodes.push({
        node: {
          type: node.type,
          id: node.id,
          lat: node.lat,
          lon: node.lon,
          tags: node.tags ?? {},
          version: node.version ?? null,
          timestamp: node.timestamp ?? null,
        },
        parentWays: ways.map((way) => ({
          type: way.type,
          id: way.id,
          tags: way.tags ?? {},
          version: way.version ?? null,
          timestamp: way.timestamp ?? null,
        })),
      });
      const parentLabels = ways
        .map((way) => [way.tags?.name, way.tags?.ref, way.tags?.highway].filter(Boolean).join(" | "))
        .filter(Boolean)
        .join(" ; ");
      console.log(`OSM_API_CONTEXT_OK control=${controlId} node=${nodeId} ${node.lat},${node.lon} barrier=${node.tags?.barrier ?? ""} highway=${node.tags?.highway ?? ""} parents=${parentLabels}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      control.errors.push({ nodeId, error: message });
      console.log(`OSM_API_CONTEXT_ERROR control=${controlId} node=${nodeId} error=${message}`);
    }
  }
  results[controlId] = control;
}

await writeFile(
  "m11-osm-api-unresolved-context.json",
  `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: "OpenStreetMap API 0.6",
    controls: results,
  }, null, 2)}\n`,
  "utf8",
);

if (successfulNodes === 0) {
  console.error("M11_OSM_API_CONTEXT_NO_SUCCESSFUL_NODES");
  process.exit(2);
}

console.log(`M11_OSM_API_CONTEXT_DONE successfulNodes=${successfulNodes}`);
