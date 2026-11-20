export function summarizeRoute(route) {
  const fast = route?.fast;
  const tolls = fast?.tolls;
  const estimate = fast?.tollEstimate;
  const pricingStatus = tolls?.pricingStatus ?? estimate?.status ?? "missing";
  const amounts = [tolls?.amount, tolls?.weekdayAmount, tolls?.weekendAmount];
  const unknownIsSafe = pricingStatus !== "unknown"
    || (tolls ? amounts.every((value) => value === null) : estimate?.totalRub === null);
  const pricedIsValid = pricingStatus !== "priced"
    || amounts.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0);
  const estimateIsValid = estimate === undefined || estimate === null
    || ["confirmed", "estimated", "unknown"].includes(estimate.status)
      && (estimate.status === "unknown" ? estimate.totalRub === null : Number.isSafeInteger(estimate.totalRub) && estimate.totalRub >= 0);
  const providers = Array.isArray(fast?.quality?.providers) ? fast.quality.providers : [];
  const summary = {
    corridor: route?.corridor ?? null,
    meters: Number.isFinite(fast?.meters) ? fast.meters : null,
    seconds: Number.isFinite(fast?.seconds) ? fast.seconds : null,
    providers,
    quality: fast?.quality?.status ?? null,
    tollPricingStatus: pricingStatus,
    tollAmount: typeof tolls?.amount === "number" ? tolls.amount : typeof estimate?.totalRub === "number" ? estimate.totalRub : null,
    tollWeekdayAmount: typeof tolls?.weekdayAmount === "number" ? tolls.weekdayAmount : null,
    tollWeekendAmount: typeof tolls?.weekendAmount === "number" ? tolls.weekendAmount : null,
    tollSegmentCount: Array.isArray(tolls?.segments) ? tolls.segments.length : 0,
    tollValidation: fast?.tollValidation?.status ?? null,
    estimateStatus: estimate?.status ?? null,
    pricingAvailable: Boolean(fast?.pricingByVehicle?.standard),
    safeUnknown: unknownIsSafe,
    validPricedAmounts: pricedIsValid,
  };
  summary.ok = summary.meters !== null && summary.meters > 0
    && summary.seconds !== null && summary.seconds > 0
    && providers.length > 0 && summary.pricingAvailable && summary.tollPricingStatus !== "missing"
    && summary.safeUnknown && summary.validPricedAmounts && estimateIsValid;
  return summary;
}
