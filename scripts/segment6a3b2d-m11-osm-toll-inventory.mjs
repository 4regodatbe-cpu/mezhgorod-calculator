import { writeFile } from "node:fs/promises";

const endpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const query = `[out:json][timeout:60];
(
  nwr(55.5,29.5,60.4,38.3)["barrier"="toll_booth"];
  nwr(55.5,29.5,60.4,38.3)["highway"="toll_gantry"];
);
out center tags;`;

function normalizeElement(element) {
  const lat = Number.isFinite(element.lat) ? element.lat : element.center?.lat ?? null;
  const lon = Number.isFinite(element.lon) ? element.lon : element.center?.lon ?? null;
  return {
    type: element.type,
    id: element.id,
    lat,
    lon,
    tags: element.tags ?? {},
  };
}

function relevantText(tags) {
  return [tags.name, tags.ref, tags.operator, tags.description, tags.note, tags.destination]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
}

async function fetchInventory(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 75_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "user-agent": "mezhgorod-calculator/segment6a3b2d",
      },
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const body = await response.json();
    if (!Array.isArray(body.elements)) throw new Error("INVALID_OVERPASS_PAYLOAD");
    return body;
  } finally {
    clearTimeout(timer);
  }
}

let payload = null;
let acceptedEndpoint = null;
const failures = [];
for (const endpoint of endpoints) {
  try {
    payload = await fetchInventory(endpoint);
    acceptedEndpoint = endpoint;
    break;
  } catch (error) {
    failures.push({ endpoint, error: error instanceof Error ? error.message : String(error) });
  }
}

if (!payload || !acceptedEndpoint) {
  console.error("M11_OSM_INVENTORY_FAILED", JSON.stringify(failures));
  process.exit(2);
}

const elements = payload.elements.map(normalizeElement).filter((item) => item.lat !== null && item.lon !== null);
const likelyM11 = elements.filter((item) => {
  const text = relevantText(item.tags);
  return /м-?11|m-?11|нева|пвп|автодор|оссп|unitoll/.test(text);
});

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    endpoint: acceptedEndpoint,
    query,
    failuresBeforeSuccess: failures,
  },
  corridorBbox: [55.5, 29.5, 60.4, 38.3],
  totalTollObjects: elements.length,
  likelyM11Count: likelyM11.length,
  elements,
  likelyM11,
};

await writeFile("m11-osm-toll-inventory.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`M11_OSM_INVENTORY_OK endpoint=${acceptedEndpoint} total=${elements.length} likelyM11=${likelyM11.length}`);
for (const item of likelyM11.slice(0, 100)) {
  const label = [item.tags.name, item.tags.ref, item.tags.operator].filter(Boolean).join(" | ");
  console.log(`OSM_CANDIDATE ${item.type}/${item.id} ${item.lat},${item.lon} ${label}`);
}
