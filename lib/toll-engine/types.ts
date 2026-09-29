export type TollCollectionModel = "open" | "mixed_entry_exit" | "free_flow";

export type PassengerCarTariff = {
  weekday: number;
  weekend: number;
  currency: "RUB";
  payment: "no_transponder";
};

export type TollPlaza = {
  id: string;
  road: string;
  km: number;
  sectionFromKm: number;
  sectionToKm: number;
  model: TollCollectionModel;
  tariff?: PassengerCarTariff;
  notes?: string;
};

export type MixedTollZone = {
  id: string;
  road: string;
  sectionFromKm: number;
  sectionToKm: number;
  model: "mixed_entry_exit";
  plazaKms: number[];
  fullSectionTariff: PassengerCarTariff;
  maxTransitMinutes?: number;
  notes?: string;
};

export type TollRoadDataset = {
  road: string;
  verifiedAt: string;
  source: string;
  sourceRules: string;
  plazas: TollPlaza[];
  mixedZones: MixedTollZone[];
};
