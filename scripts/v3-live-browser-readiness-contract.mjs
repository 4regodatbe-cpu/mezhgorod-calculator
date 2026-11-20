import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('./v3-live-browser-readiness.mjs',import.meta.url),'utf8');

export const readinessProbeSource = {
  readyStateObservation: source.includes("page.getByText('Обычные тарифы', {exact:true})")
    && source.includes("page.getByText('Тарифы', {exact:true})"),
  maxAttempts: Number(source.match(/attempts = (\d+)/u)?.[1] ?? 0),
  standardRestored: source.includes('standardRestored:true'),
};

export function classifyAddressSearchDiagnostic({
  query,fieldValue,valueChangedWithoutAction,inputEventObserved,inputEventValue,
  requestSent,httpStatus,responseJsonValid,itemCount,visibleButtons,matchingOptionFound = null,
}) {
  if (valueChangedWithoutAction || fieldValue !== query) return 'INPUT_VALUE_NOT_RETAINED';
  if (!inputEventObserved) return 'INPUT_EVENT_NOT_OBSERVED';
  if (inputEventValue !== query) return 'INPUT_EVENT_VALUE_MISMATCH';
  if (!requestSent && visibleButtons > 0 && matchingOptionFound === true) return 'SUGGESTIONS_READY_WITHOUT_REQUEST';
  if (!requestSent) return 'NO_REQUEST_OBSERVED';
  if (Number.isInteger(httpStatus) && (httpStatus < 200 || httpStatus >= 300)) return 'SEARCH_HTTP_ERROR';
  if (responseJsonValid === false) return 'INVALID_SEARCH_JSON';
  if (itemCount === 0) return 'EMPTY_RESULTS';
  if (matchingOptionFound === false && visibleButtons > 0) return 'WRONG_SUGGESTION';
  if (itemCount > 0 && visibleButtons === 0) return 'RESULTS_NOT_RENDERED';
  if (requestSent && httpStatus === null) return 'SEARCH_RESPONSE_NOT_OBSERVED';
  if (itemCount > 0 && visibleButtons > 0 && matchingOptionFound !== false) return 'SUGGESTIONS_READY';
  return 'SUGGESTION_WAIT_TIMEOUT';
}
