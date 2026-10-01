import type { TollRoadDataset } from "@/lib/toll-engine/types";

const rub = (weekday: number, weekend: number) => ({
  weekday,
  weekend,
  currency: "RUB" as const,
  payment: "no_transponder" as const,
});

// Official category-I tariffs without a transponder, verified 2026-09-29.
// Tariff source: https://avtodor-tr.ru/road/tariffs/
// Collection rules: https://avtodor-tr.ru/company/docs/proezd/
//
// Important: the two mixed systems (401-464 and 633-741 km) are represented
// separately below and must not be priced as ordinary one-plaza open systems.
export const M4_DATA: TollRoadDataset = {
  road: "М-4 Дон",
  verifiedAt: "2026-09-29",
  source: "https://avtodor-tr.ru/road/tariffs/",
  sourceRules: "https://avtodor-tr.ru/company/docs/proezd/",
  plazas: [
    { id: "m4-62", road: "М-4 Дон", km: 62, sectionFromKm: 21, sectionToKm: 62, model: "open", tariff: rub(220, 260) },
    { id: "m4-71", road: "М-4 Дон", km: 71, sectionFromKm: 21, sectionToKm: 93, model: "open", tariff: rub(400, 500) },
    { id: "m4-133", road: "М-4 Дон", km: 133, sectionFromKm: 93, sectionToKm: 211, model: "open", tariff: rub(500, 600) },
    { id: "m4-228", road: "М-4 Дон", km: 228, sectionFromKm: 211, sectionToKm: 266, model: "open", tariff: rub(320, 470) },
    { id: "m4-322", road: "М-4 Дон", km: 322, sectionFromKm: 266, sectionToKm: 322, model: "open", tariff: rub(320, 470) },
    { id: "m4-339", road: "М-4 Дон", km: 339, sectionFromKm: 322, sectionToKm: 401, model: "open", tariff: rub(400, 540) },
    { id: "m4-355", road: "М-4 Дон", km: 355, sectionFromKm: 322, sectionToKm: 401, model: "open", tariff: rub(220, 350), notes: "Alternative plaza within the same official 322-401 km corridor; never blindly add both 339 and 355." },
    { id: "m4-515", road: "М-4 Дон", km: 515, sectionFromKm: 492, sectionToKm: 517, model: "open", tariff: rub(170, 250) },
    { id: "m4-545-a", road: "М-4 Дон", km: 545, sectionFromKm: 517, sectionToKm: 544, model: "open", tariff: rub(160, 220), notes: "Same physical plaza also handles the following official tariff row." },
    { id: "m4-545-b", road: "М-4 Дон", km: 545, sectionFromKm: 545, sectionToKm: 589, model: "open", tariff: rub(250, 300), notes: "Do not double-charge merely because the physical plaza id is the same; pricing depends on the traversed official section." },
    { id: "m4-620", road: "М-4 Дон", km: 620, sectionFromKm: 589, sectionToKm: 633, model: "open", tariff: rub(250, 300) },
    { id: "m4-803", road: "М-4 Дон", km: 803, sectionFromKm: 741, sectionToKm: 893, model: "open", tariff: rub(620, 950) },
    { id: "m4-911", road: "М-4 Дон", km: 911, sectionFromKm: 893, sectionToKm: 933, model: "open", tariff: rub(250, 350) },
    { id: "m4-1046", road: "М-4 Дон", km: 1046, sectionFromKm: 1024, sectionToKm: 1091, model: "open", tariff: rub(450, 770) },
    { id: "m4-1093", road: "М-4 Дон", km: 1093, sectionFromKm: 1091, sectionToKm: 1119, model: "open", tariff: rub(150, 270) },
    { id: "m4-1184", road: "М-4 Дон", km: 1184, sectionFromKm: 1119, sectionToKm: 1195, model: "open", tariff: rub(350, 470) },
    { id: "m4-1223", road: "М-4 Дон", km: 1223, sectionFromKm: 1195, sectionToKm: 1319, model: "open", tariff: rub(500, 690) },
  ],
  mixedZones: [
    {
      id: "m4-401-464",
      road: "М-4 Дон",
      sectionFromKm: 401,
      sectionToKm: 464,
      model: "mixed_entry_exit",
      plazaKms: [416, 460],
      fullSectionTariff: rub(360, 480),
      maxTransitMinutes: 720,
      notes: "Official mixed system: payment is made at entry; within 12 hours the exit event is zero-rated.",
    },
    {
      id: "m4-633-741",
      road: "М-4 Дон",
      sectionFromKm: 633,
      sectionToKm: 741,
      model: "mixed_entry_exit",
      plazaKms: [636, 672],
      fullSectionTariff: rub(640, 770),
      partialGateTariffs: [
        {
          km: 672,
          sectionFromKm: 633,
          sectionToKm: 672,
          tariff: rub(440, 500),
          notes: "Official category-I no-transponder tariff for the partial 633-672 traversal through PVP 672.",
        },
      ],
      maxTransitMinutes: 120,
      notes: "Official mixed system: full 633-741 traversal is charged once; PVP 672 has a separate partial-section tariff.",
    },
  ],
};
