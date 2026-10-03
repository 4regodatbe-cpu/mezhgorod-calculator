export function clampNumber(value: number, min: number, max: number, fallback: number) { return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback; }
export function money(value: number) { return `${Math.round(value).toLocaleString("ru-RU")} ₽`; }
export function distance(meters: number) { return `${(meters / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} км`; }
export function duration(seconds: number) { const minutes = Math.round(seconds / 60); return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`; }
