// Offline dataset evidence only. Never imported by the application.
import { readFileSync, writeFileSync } from 'node:fs';
import { SPECIAL_TERRITORY_BOUNDARIES } from '../../../../lib/special-territory-boundaries.ts';
import { classifyTerritory } from '../../../../lib/special-territory-geometry.ts';
const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const counts = {}, selected = {}, errors = [];
let errorCount = 0;
const ids = new Set(input.selectedIds);
for (const [id, country, lat, lng] of input.points) {
  let territory;
  try { territory = classifyTerritory({ lat, lng }, SPECIAL_TERRITORY_BOUNDARIES) ?? 'outside_four_polygons'; }
  catch (error) {
    territory = 'unknown_boundary_or_overlap'; errorCount++;
    if (errors.length < 20) errors.push({id, country, reason: String(error.message)});
  }
  counts[territory] ??= {};
  counts[territory][country] = (counts[territory][country] ?? 0) + 1;
  if (ids.has(id)) selected[id] = territory;
}
writeFileSync(process.argv[3], JSON.stringify({counts, selected, errorCount, errors, total: input.points.length}, null, 2)+'\n');
