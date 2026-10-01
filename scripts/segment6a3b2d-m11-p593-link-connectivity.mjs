import { writeFile } from "node:fs/promises";

const base = "https://api.openstreetmap.org/api/0.6";
const linkWayIds = [1443881665, 1443881666];

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "mezhgorod-calculator/segment6a3b2d-p593-connectivity" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const output = { schemaVersion: 1, generatedAt: new Date().toISOString(), source: "OpenStreetMap API 0.6", ways: [] };

for (const wayId of linkWayIds) {
  const full = await fetchJson(`${base}/way/${wayId}/full.json`);
  const elements = Array.isArray(full?.elements) ? full.elements : [];
  const way = elements.find((element) => element.type === "way" && element.id === wayId);
  if (!way || !Array.isArray(way.nodes) || way.nodes.length < 2) throw new Error(`WAY_${wayId}_INVALID`);

  const endpointNodeIds = [way.nodes[0], way.nodes.at(-1)];
  const endpoints = [];
  for (const nodeId of endpointNodeIds) {
    const node = elements.find((element) => element.type === "node" && element.id === nodeId) ?? null;
    const parentPayload = await fetchJson(`${base}/node/${nodeId}/ways.json`);
    const parentWays = Array.isArray(parentPayload?.elements) ? parentPayload.elements : [];
    const normalizedParents = parentWays.map((parent) => ({ id: parent.id, tags: parent.tags ?? {} }));
    endpoints.push({
      node: node ? { id: node.id, lat: node.lat, lon: node.lon, tags: node.tags ?? {} } : { id: nodeId },
      parentWays: normalizedParents,
    });
    for (const parent of normalizedParents) {
      const label = [parent.tags.name, parent.tags.ref, parent.tags.highway, parent.tags.toll].filter(Boolean).join(" | ");
      console.log(`P593_LINK_ENDPOINT way=${wayId} node=${nodeId} parent=${parent.id} ${label}`);
    }
  }

  output.ways.push({
    way: { id: way.id, tags: way.tags ?? {}, nodeCount: way.nodes.length },
    endpoints,
  });
}

await writeFile("m11-p593-link-connectivity.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log("M11_P593_LINK_CONNECTIVITY_DONE");
