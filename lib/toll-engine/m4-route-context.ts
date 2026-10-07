import { M4_DATA } from "@/lib/toll-engine/m4-data";
import type { M4PricedPlaza } from "@/lib/toll-engine/m4-engine";
import type { M4RoutePlazaValidation } from "@/lib/toll-engine/m4-route-validator";

export function confirmedKms(validation: M4RoutePlazaValidation) {
  return validation.checks
    .filter((item) => item.status === "confirmed")
    .map((item) => item.km);
}

function containsOrdered(sequence: number[], expected: number[]) {
  if (expected.length === 0) return true;
  let position = 0;
  for (const value of sequence) {
    if (value !== expected[position]) continue;
    position += 1;
    if (position === expected.length) return true;
  }
  return false;
}

function nodeIdsFor(validation: M4RoutePlazaValidation, kms: number[]) {
  const wanted = new Set(kms);
  return [...new Set(
    validation.checks
      .filter((item) => item.status === "confirmed" && wanted.has(item.km))
      .flatMap((item) => item.matchedNodeIds),
  )];
}

function mixedZone(fromKm: number, toKm: number) {
  return M4_DATA.mixedZones.find((zone) => zone.sectionFromKm === fromKm && zone.sectionToKm === toKm);
}

function full545Tariff() {
  const rows = M4_DATA.plazas.filter((plaza) => plaza.km === 545 && plaza.tariff);
  if (rows.length !== 2 || rows.some((row) => !row.tariff)) return null;
  return {
    weekday: rows.reduce((sum, row) => sum + (row.tariff?.weekday ?? 0), 0),
    weekend: rows.reduce((sum, row) => sum + (row.tariff?.weekend ?? 0), 0),
  };
}

function contextVerification(validation: M4RoutePlazaValidation, kms: number[]): M4PricedPlaza["verification"] {
  const wanted = new Set(kms);
  return validation.checks.some((item) => item.status === "confirmed" && wanted.has(item.km) && item.evidence === "route_traversal")
    ? "route_traversal"
    : "exact_name";
}

export function resolvedContextPlazas(validation: M4RoutePlazaValidation) {
  const sequence = confirmedKms(validation);
  const resolved: M4PricedPlaza[] = [];
  let resolved322to401 = false;
  let resolved401to464 = false;
  let resolved633to741 = false;
  let resolved545 = false;

  // The 355-km plaza is an entry PVP for traffic towards Moscow. Official
  // Avtodor rules require the receipt issued at km 355 to be presented at
  // km 339 to avoid double payment. Therefore a route that geometrically
  // crosses both physical plaza anchors must be charged exactly once:
  // 355 -> 339 (towards Moscow) uses the 355 tariff; the reverse traversal
  // uses the 339 tariff.
  const index339 = sequence.indexOf(339);
  const index355 = sequence.indexOf(355);
  if (index339 >= 0 && index355 >= 0 && index339 !== index355) {
    const chargedKm = index355 < index339 ? 355 : 339;
    const row = M4_DATA.plazas.find((plaza) => plaza.km === chargedKm && plaza.model === "open" && plaza.tariff);
    if (row?.tariff) {
      resolved.push({
        id: `m4-${chargedKm}`,
        km: chargedKm,
        direction: index355 < index339 ? "forward" : "reverse",
        entryKm: chargedKm,
        exitKm: chargedKm === 355 ? 339 : 355,
        weekday: row.tariff.weekday,
        weekend: row.tariff.weekend,
        selectedAmount: row.tariff.weekday,
        verification: contextVerification(validation, [339, 355]),
        matchedNodeIds: nodeIdsFor(validation, [chargedKm]),
        source: "Avtodor km 355→339 receipt rule + ordered route traversal",
      });
      resolved322to401 = true;
    }
  }

  // Full traversal of the 401-464 mixed section is established by both
  // section gates plus confirmed M-4 plazas on opposite sides of the zone.
  // Do not depend on one specific northern plaza: live routes can legitimately
  // use different alignments in the 322-401 corridor while still traversing
  // the complete 401-464 section.
  const northFlanks401 = sequence.filter((km) => km < 401);
  const southFlanks401 = sequence.filter((km) => km > 464);
  // A continuous sequence of independently confirmed M-4 plazas on opposite
  // sides of the closed section proves through-traversal. Do not require a
  // particular neighbouring plaza: routing geometries can miss one physical
  // anchor while still remaining on the M-4 mainline.
  const through401to464 = northFlanks401.some((northKm) =>
    southFlanks401.some((southKm) =>
      containsOrdered(sequence, [southKm, northKm])
      || containsOrdered(sequence, [northKm, southKm])));
  const zone401to464 = mixedZone(401, 464);
  if (through401to464 && zone401to464) {
    resolved.push({
      id: "m4-401-464-full",
      km: 416,
      direction: "unknown",
      entryKm: 401,
      exitKm: 464,
      weekday: zone401to464.fullSectionTariff.weekday,
      weekend: zone401to464.fullSectionTariff.weekend,
      selectedAmount: zone401to464.fullSectionTariff.weekday,
      verification: contextVerification(validation, [515, 460, 416, 339, 355]),
      matchedNodeIds: nodeIdsFor(validation, [416, 460]),
      source: "Avtodor mixed zone 401–464 + ordered PVP traversal",
    });
    resolved401to464 = true;
  }

  // A route flanked by PVP 620 on the north and PVP 803 on the south has
  // traversed the complete official 633-741 km mixed section. Crossing the
  // auxiliary 672-km gate on that same through route does not create a second
  // charge: Avtodor's current rules zero-rate the exit when the section has
  // already been paid within the allowed transit window.
  const northFlanks633 = sequence.filter((km) => km < 633);
  const southFlanks633 = sequence.filter((km) => km > 741);
  const through633to741 = northFlanks633.some((northKm) =>
    southFlanks633.some((southKm) =>
      containsOrdered(sequence, [southKm, northKm])
      || containsOrdered(sequence, [northKm, southKm])));
  const zone633to741 = mixedZone(633, 741);
  if (through633to741 && zone633to741) {
    resolved.push({
      id: "m4-633-741-full",
      km: 636,
      direction: "unknown",
      entryKm: 633,
      exitKm: 741,
      weekday: zone633to741.fullSectionTariff.weekday,
      weekend: zone633to741.fullSectionTariff.weekend,
      selectedAmount: zone633to741.fullSectionTariff.weekday,
      verification: contextVerification(validation, [803, 636, 620]),
      matchedNodeIds: nodeIdsFor(validation, [636]),
      source: "Avtodor mixed zone 633–741 + mainline route context",
    });
    resolved633to741 = true;
  }

  // If only the 672 gate of the 633-741 mixed system is traversed and the
  // route continues to the southern flank (PVP 803), price the official
  // 633-672 partial section instead of blocking the whole M-4 component.
  const has636 = validation.checks.some((item) => item.km === 636 && item.status === "confirmed");
  const has672 = validation.checks.some((item) => item.km === 672 && item.status === "confirmed");
  const partial672 = zone633to741?.partialGateTariffs?.find((item) => item.km === 672);
  const throughPartial672 = !resolved633to741 && !has636 && has672 && (
    containsOrdered(sequence, [803, 672])
    || containsOrdered(sequence, [672, 803])
  );
  if (throughPartial672 && partial672) {
    resolved.push({
      id: "m4-672-partial",
      km: 672,
      direction: "unknown",
      entryKm: 633,
      exitKm: 672,
      weekday: partial672.tariff.weekday,
      weekend: partial672.tariff.weekend,
      selectedAmount: partial672.tariff.weekday,
      verification: contextVerification(validation, [672, 803]),
      matchedNodeIds: nodeIdsFor(validation, [672]),
      source: "Avtodor official M-4 633-672 partial mixed-zone tariff + ordered route context",
    });
    resolved633to741 = true;
  }

  // PVP 545 represents two adjacent official tariff rows. Confirmed M-4
  // evidence on both sides of 517-589 proves both rows were traversed even
  // when one neighbouring plaza anchor is absent from the selected geometry.
  const northFlanks545 = sequence.filter((km) => km < 517);
  const southFlanks545 = sequence.filter((km) => km > 589);
  const through545 = northFlanks545.some((northKm) =>
    southFlanks545.some((southKm) =>
      containsOrdered(sequence, [southKm, northKm])
      || containsOrdered(sequence, [northKm, southKm])));
  const tariff545 = full545Tariff();
  if (through545 && tariff545) {
    resolved.push({
      id: "m4-545-full",
      km: 545,
      direction: "unknown",
      entryKm: 517,
      exitKm: 589,
      weekday: tariff545.weekday,
      weekend: tariff545.weekend,
      selectedAmount: tariff545.weekday,
      verification: contextVerification(validation, [620, 545, 515]),
      matchedNodeIds: nodeIdsFor(validation, [545]),
      source: "Avtodor sections 517–544 + 545–589 + ordered flanking PVPs",
    });
    resolved545 = true;
  }

  return { resolved, resolved322to401, resolved401to464, resolved633to741, resolved545 };
}
