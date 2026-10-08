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

function estimatedGateTransitMinutes(validation: M4RoutePlazaValidation, firstKm: number, secondKm: number) {
  const first = validation.checks.find((item) => item.km === firstKm && item.status === "confirmed");
  const second = validation.checks.find((item) => item.km === secondKm && item.status === "confirmed");
  if (!first || !second || first.routeProgressMeters === undefined || second.routeProgressMeters === undefined
    || !validation.routeDurationSeconds || validation.routeDistanceMeters <= 0) return null;
  const distanceRatio = Math.abs(first.routeProgressMeters - second.routeProgressMeters) / validation.routeDistanceMeters;
  return validation.routeDurationSeconds * distanceRatio / 60;
}

function mixedZoneCharge(validation: M4RoutePlazaValidation, gates: number[], maxTransitMinutes: number) {
  if (gates.length === 0) return { entryKm: null, exitKm: null, addExitCharge: false };
  const [entryKm, exitKm] = gates;
  if (exitKm === undefined) return { entryKm, exitKm: null, addExitCharge: false };
  const transitMinutes = estimatedGateTransitMinutes(validation, entryKm, exitKm);
  if (transitMinutes === null) return { entryKm: null, exitKm: null, addExitCharge: false };
  return { entryKm, exitKm, addExitCharge: transitMinutes > maxTransitMinutes };
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

  // PVPs 416 and 460 are the entry/exit gates for one mixed section. Apply the
  // entry tariff once inside the operator's 12-hour transit window; add the
  // exit tariff when the route ETA between gates exceeds that window.
  const gates401 = sequence.filter((km) => km === 416 || km === 460);
  const zone401to464 = mixedZone(401, 464);
  const charge401 = mixedZoneCharge(validation, gates401, zone401to464?.maxTransitMinutes ?? 0);
  if (charge401.entryKm !== null && zone401to464) {
    const tariff = zone401to464.fullSectionTariff;
    const verification = contextVerification(validation, [515, 460, 416, 339, 355]);
    resolved.push({
      id: "m4-401-464-entry",
      km: charge401.entryKm,
      direction: "unknown",
      entryKm: charge401.entryKm,
      ...(charge401.exitKm === null ? {} : { exitKm: charge401.exitKm }),
      weekday: tariff.weekday,
      weekend: tariff.weekend,
      selectedAmount: tariff.weekday,
      verification,
      matchedNodeIds: nodeIdsFor(validation, [charge401.entryKm]),
      source: "Avtodor M-4 401–464 entry tariff",
    });
    if (charge401.addExitCharge && charge401.exitKm !== null) {
      resolved.push({
        id: "m4-401-464-exit",
        km: charge401.exitKm,
        direction: "unknown",
        entryKm: charge401.entryKm,
        exitKm: charge401.exitKm,
        weekday: tariff.weekday,
        weekend: tariff.weekend,
        selectedAmount: tariff.weekday,
        verification,
        matchedNodeIds: nodeIdsFor(validation, [charge401.exitKm]),
        source: "Avtodor M-4 401–464 exit tariff: estimated transit exceeds 12 hours",
      });
    }
    resolved401to464 = true;
  }

  // Mixed-section charges are created only from an actually confirmed paid
  // entry/exit gate. Flanking open-system plazas alone do not prove a charge:
  // a route can stay on the motorway and bypass a booth using a free ramp.
  const zone633to741 = mixedZone(633, 741);
  const gates633 = sequence.filter((km) => km === 636 || km === 672);
  const charge633 = mixedZoneCharge(validation, gates633, zone633to741?.maxTransitMinutes ?? 0);
  const partial672 = zone633to741?.partialGateTariffs?.find((item) => item.km === 672);
  const entryKm = charge633.entryKm;
  const exitKm = charge633.exitKm;
  const entryTariff = entryKm === 636
    ? zone633to741?.fullSectionTariff
    : entryKm === 672 ? partial672?.tariff : null;
  if (entryKm !== null && entryTariff) {
    resolved.push({
      id: `m4-633-741-entry-${entryKm}`,
      km: entryKm,
      direction: "unknown",
      entryKm,
      ...(exitKm === null ? {} : { exitKm }),
      weekday: entryTariff.weekday,
      weekend: entryTariff.weekend,
      selectedAmount: entryTariff.weekday,
      verification: contextVerification(validation, [636, 672]),
      matchedNodeIds: nodeIdsFor(validation, [entryKm]),
      source: entryKm === 636
        ? "Avtodor published PVP 636 tariff for M-4 633–741 mixed section; entry charge"
        : "Avtodor published PVP 672 tariff for M-4 633–672 partial section; entry charge",
    });
    if (charge633.addExitCharge && exitKm !== null) {
      const exitTariff = exitKm === 636
        ? zone633to741?.fullSectionTariff
        : partial672?.tariff;
      if (exitTariff) {
        resolved.push({
          id: `m4-633-741-exit-${exitKm}`,
          km: exitKm,
          direction: "unknown",
          entryKm,
          exitKm,
          weekday: exitTariff.weekday,
          weekend: exitTariff.weekend,
          selectedAmount: exitTariff.weekday,
          verification: contextVerification(validation, [636, 672]),
          matchedNodeIds: nodeIdsFor(validation, [exitKm]),
          source: "Avtodor M-4 633–741 exit tariff: estimated transit exceeds 120 minutes",
        });
      }
    }
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
