import currentSnapshot from "../../data/tolls/m11/2026-10-01-58-679-category1-a1-current.json" with { type: "json" };

export type M11CurrentTariffProfile = "monThu" | "friSun";

export type M11CurrentTariffUnknownReason =
  | "unknown_point"
  | "unsupported_profile"
  | "same_point_not_verified"
  | "reverse_direction_not_verified"
  | "directed_pair_not_verified";

export type M11CurrentTariffLookupResult = {
  status: "priced" | "unknown";
  amountRub: number | null;
  fromPointId: string;
  toPointId: string;
  profile: string;
  systemId: string;
  observedCurrentAt: string;
  sourceDocumentOrder: string;
  sourceDocumentDate: string;
  tariffEffectiveFrom: string | null;
  reason: M11CurrentTariffUnknownReason | null;
};

type M11CurrentTariffPoint = {
  id: string;
};

type M11CurrentControlAmounts = {
  monThu: number;
  friSun: number;
};

export type M11CurrentA1Snapshot = {
  systemId: string;
  snapshotKind: string;
  observedCurrentAt: string;
  currency: string;
  sourceDocumentOrder: string;
  sourceDocumentDate: string;
  tariffEffectiveFrom: string | null;
  extraction: {
    completeMatrix: boolean;
    orderedPointCount: number;
    verifiedControlCount: number;
  };
  points: M11CurrentTariffPoint[];
  verifiedControlsFromP58: Record<string, M11CurrentControlAmounts>;
};

export type M11CurrentPartialTariffModel = {
  systemId: "m11-58-679-avtodor";
  observedCurrentAt: string;
  sourceDocumentOrder: string;
  sourceDocumentDate: string;
  tariffEffectiveFrom: string | null;
  pointIds: readonly string[];
  directControlsFromP58: Readonly<Record<string, Readonly<M11CurrentControlAmounts>>>;
};

function assertNonNegativeInteger(amount: number, label: string) {
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
    throw new Error(`M11_CURRENT_INVALID_AMOUNT:${label}:${amount}`);
  }
}

export function buildM11CurrentPartialTariffModel(
  snapshot: M11CurrentA1Snapshot,
): M11CurrentPartialTariffModel {
  if (snapshot.systemId !== "m11-58-679-avtodor") {
    throw new Error(`M11_CURRENT_UNEXPECTED_SYSTEM:${snapshot.systemId}`);
  }
  if (snapshot.snapshotKind !== "current_diagnostic_a1") {
    throw new Error(`M11_CURRENT_UNEXPECTED_SNAPSHOT_KIND:${snapshot.snapshotKind}`);
  }
  if (snapshot.currency !== "RUB") {
    throw new Error(`M11_CURRENT_UNEXPECTED_CURRENCY:${snapshot.currency}`);
  }
  if (snapshot.extraction.completeMatrix !== false) {
    throw new Error("M11_CURRENT_PARTIAL_CORE_REQUIRES_INCOMPLETE_A1");
  }
  if (snapshot.points.length !== snapshot.extraction.orderedPointCount) {
    throw new Error(
      `M11_CURRENT_POINT_COUNT_MISMATCH:${snapshot.points.length}:${snapshot.extraction.orderedPointCount}`,
    );
  }

  const pointIds = snapshot.points.map((point) => point.id);
  const uniquePointIds = new Set(pointIds);
  if (uniquePointIds.size !== pointIds.length) {
    throw new Error("M11_CURRENT_DUPLICATE_POINT_ID");
  }
  if (!uniquePointIds.has("p58")) {
    throw new Error("M11_CURRENT_MISSING_P58");
  }

  const controlEntries = Object.entries(snapshot.verifiedControlsFromP58);
  if (controlEntries.length !== snapshot.extraction.verifiedControlCount) {
    throw new Error(
      `M11_CURRENT_CONTROL_COUNT_MISMATCH:${controlEntries.length}:${snapshot.extraction.verifiedControlCount}`,
    );
  }

  const controls: Record<string, M11CurrentControlAmounts> = {};
  for (const [toPointId, amounts] of controlEntries) {
    if (!uniquePointIds.has(toPointId)) {
      throw new Error(`M11_CURRENT_CONTROL_UNKNOWN_POINT:${toPointId}`);
    }
    assertNonNegativeInteger(amounts.monThu, `p58>${toPointId}:monThu`);
    assertNonNegativeInteger(amounts.friSun, `p58>${toPointId}:friSun`);
    controls[toPointId] = {
      monThu: amounts.monThu,
      friSun: amounts.friSun,
    };
  }

  return {
    systemId: "m11-58-679-avtodor",
    observedCurrentAt: snapshot.observedCurrentAt,
    sourceDocumentOrder: snapshot.sourceDocumentOrder,
    sourceDocumentDate: snapshot.sourceDocumentDate,
    tariffEffectiveFrom: snapshot.tariffEffectiveFrom,
    pointIds: Object.freeze([...pointIds]),
    directControlsFromP58: Object.freeze(controls),
  };
}

function makeResultBase(
  model: M11CurrentPartialTariffModel,
  fromPointId: string,
  toPointId: string,
  profile: string,
) {
  return {
    fromPointId,
    toPointId,
    profile,
    systemId: model.systemId,
    observedCurrentAt: model.observedCurrentAt,
    sourceDocumentOrder: model.sourceDocumentOrder,
    sourceDocumentDate: model.sourceDocumentDate,
    tariffEffectiveFrom: model.tariffEffectiveFrom,
  };
}

export function lookupM11CurrentPartialTariff(
  model: M11CurrentPartialTariffModel,
  fromPointId: string,
  toPointId: string,
  profile: string,
): M11CurrentTariffLookupResult {
  const base = makeResultBase(model, fromPointId, toPointId, profile);
  const pointIds = new Set(model.pointIds);

  if (!pointIds.has(fromPointId) || !pointIds.has(toPointId)) {
    return {
      ...base,
      status: "unknown",
      amountRub: null,
      reason: "unknown_point",
    };
  }

  if (profile !== "monThu" && profile !== "friSun") {
    return {
      ...base,
      status: "unknown",
      amountRub: null,
      reason: "unsupported_profile",
    };
  }

  const direct = fromPointId === "p58" ? model.directControlsFromP58[toPointId] : undefined;
  if (direct) {
    return {
      ...base,
      status: "priced",
      amountRub: direct[profile],
      reason: null,
    };
  }

  if (fromPointId === toPointId) {
    return {
      ...base,
      status: "unknown",
      amountRub: null,
      reason: "same_point_not_verified",
    };
  }

  if (toPointId === "p58" && model.directControlsFromP58[fromPointId]) {
    return {
      ...base,
      status: "unknown",
      amountRub: null,
      reason: "reverse_direction_not_verified",
    };
  }

  return {
    ...base,
    status: "unknown",
    amountRub: null,
    reason: "directed_pair_not_verified",
  };
}

const defaultModel = buildM11CurrentPartialTariffModel(currentSnapshot as M11CurrentA1Snapshot);

export function priceM11CurrentPartialCategory1(
  fromPointId: string,
  toPointId: string,
  profile: string,
): M11CurrentTariffLookupResult {
  return lookupM11CurrentPartialTariff(defaultModel, fromPointId, toPointId, profile);
}

export function m11CurrentPartialTariffModel(): M11CurrentPartialTariffModel {
  return defaultModel;
}
