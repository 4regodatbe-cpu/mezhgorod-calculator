export type CalculationApiErrorCategory = "user_input" | "upstream" | "internal";

export type CalculationApiError = {
  category: CalculationApiErrorCategory;
  status: 400 | 502 | 500;
  message: string;
};

const KNOWN_ERRORS: Record<string, CalculationApiError> = {
  ADDRESS_NOT_FOUND: { category: "user_input", status: 400, message: "Адрес не найден. Уточните город или населённый пункт." },
  ROUTE_NOT_FOUND: { category: "user_input", status: 400, message: "Не удалось построить автомобильный маршрут." },
  SPECIAL_TRANSIT_EXCLUDED: { category: "user_input", status: 400, message: "Маршрут проходит через особую тарифную зону и исключён." },
  GEOCODE_UNAVAILABLE: { category: "upstream", status: 502, message: "Поиск адресов временно недоступен." },
  ROUTE_UNAVAILABLE: { category: "upstream", status: 502, message: "Сервис маршрутов временно недоступен. Попробуйте позже." },
  PREFERRED_ROUTE_UNAVAILABLE: { category: "upstream", status: 502, message: "Не удалось построить маршрут выбранного направления. Попробуйте позже." },
  MAINLAND_UNAVAILABLE: { category: "upstream", status: 502, message: "Не удалось выполнить расчёт." },
};

const INTERNAL_ERROR: CalculationApiError = {
  category: "internal",
  status: 500,
  message: "Не удалось выполнить расчёт.",
};

/** Only explicitly recognized, safe error codes may affect the client response. */
export function classifyCalculateApiError(error: unknown): CalculationApiError {
  const code = error instanceof Error ? error.message : "";
  return KNOWN_ERRORS[code] ?? INTERNAL_ERROR;
}
