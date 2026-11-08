export function summarizeCalculationResponse({ status, elapsedMs, payload, jsonValid }) {
  const trip = payload?.options?.[0]?.fast ?? payload?.legs?.[0]?.fast ?? null;
  const distanceMeters = trip?.meters;
  const durationSeconds = trip?.seconds;
  const toll = trip?.tolls;
  const tollPricingStatus = toll?.pricingStatus;
  const tollAmounts = [toll?.amount,toll?.weekdayAmount,toll?.weekendAmount];
  const tollValid = tollPricingStatus === 'unknown' ? tollAmounts.every(value => value === null)
    : tollPricingStatus === 'free' ? tollAmounts.every(value => value === 0)
      : tollPricingStatus === 'priced' ? tollAmounts.every(value => Number.isSafeInteger(value) && value >= 0)
        : false;
  const priceTable = trip?.pricingByVehicle;
  const priceTableValid = ['standard','comfort','comfort_plus','minivan'].every(vehicle => {
    const total = priceTable?.[vehicle]?.totalPrice;
    return total === null || (Number.isSafeInteger(total) && total >= 0);
  });
  const routeValid = Number.isFinite(distanceMeters) && distanceMeters > 0
    && Number.isFinite(durationSeconds) && durationSeconds > 0
    && tollValid
    && Boolean(priceTable) && typeof priceTable === "object" && !Array.isArray(priceTable)
    && priceTableValid;
  const distanceValid = Number.isFinite(distanceMeters) && distanceMeters > 0;
  const durationValid = Number.isFinite(durationSeconds) && durationSeconds > 0;
  const httpOk = Number.isInteger(status) && status >= 200 && status < 300;

  return {
    apiStatus: httpOk && jsonValid && routeValid ? "API_PASS" : "API_FAIL",
    httpStatus: Number.isInteger(status) ? status : null,
    elapsedMs: Number.isFinite(elapsedMs) && elapsedMs >= 0 ? Math.round(elapsedMs) : null,
    jsonValid: jsonValid === true,
    routeValid,
    distanceMeters: distanceValid ? distanceMeters : null,
    distanceKm: distanceValid ? Math.round(distanceMeters / 100) / 10 : null,
    durationSeconds: durationValid ? durationSeconds : null,
    durationMin: durationValid ? Math.round(durationSeconds / 60) : null,
    tollPricingStatus: ["priced", "free", "unknown"].includes(tollPricingStatus)
      ? tollPricingStatus
      : null,
    vehiclePricingAvailable: Boolean(trip?.pricingByVehicle),
    errorPresent: typeof payload?.error === "string" && payload.error.length > 0,
  };
}

export function classifyApiAndDom(api, dom) {
  if (api?.apiStatus === "API_PASS" && dom?.status === "PASS") return "PASS";
  if (api?.apiStatus === "API_PASS" && dom?.status === "FAIL") return "API_PASS / UI_FAIL";
  if (api?.apiStatus === "API_FAIL") return "API_FAIL";
  return "NOT_VERIFIED";
}

export function classifyAnalyticsCheck({ interceptedRequests, blockedRequests, abortErrors, apiStatus, domStatus }) {
  if (!Number.isInteger(interceptedRequests) || interceptedRequests < 1) return "NOT_VERIFIED";
  if (blockedRequests !== interceptedRequests || abortErrors !== 0) return "NOT_VERIFIED";
  if (apiStatus !== "API_PASS" || domStatus !== "PASS") return "NOT_VERIFIED";
  return "PASS";
}
