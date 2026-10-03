"use client";

import { HeartHandshake } from "lucide-react";

export function DonationCard() {
  return <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/35 p-4"><HeartHandshake className="h-5 w-5 text-emerald-400"/><h2 className="mt-3 text-lg font-black text-white">Сбор на API Яндекс Карт</h2><p className="mt-1 text-sm leading-relaxed text-slate-300">Подключение API Яндекс Карт позволит дополнительно сверять геометрию и расстояния маршрутов и повышать точность расчётов. Стоимость платных дорог по-прежнему требует проверки по действующим тарифам и контрольным маршрутам.</p><a href="https://t.tb.ru/pm_short/4YCKLToUeM6" target="_blank" rel="noopener noreferrer" className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-black text-emerald-950 transition hover:bg-emerald-400"><HeartHandshake className="h-4 w-4"/>Поддержать подключение</a><p className="mt-2 text-center text-xs text-slate-500">Перевод откроется на защищённой странице Т‑Банка.</p></section>;
}
