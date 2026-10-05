"use client";

import { HeartHandshake } from "lucide-react";

export function DonationCard() {
  return <section className="rounded-[24px] border border-brand-action/25 bg-brand-subtle/60 p-4"><HeartHandshake className="h-5 w-5 text-brand-action"/><h2 className="mt-3 text-lg font-black text-brand-text">Сбор на API Яндекс Карт</h2><p className="mt-1 text-sm leading-relaxed text-brand-muted">Подключение API Яндекс Карт позволит дополнительно сверять геометрию и расстояния маршрутов и повышать точность расчётов. Стоимость платных дорог по-прежнему требует проверки по действующим тарифам и контрольным маршрутам.</p><a href="https://t.tb.ru/pm_short/4YCKLToUeM6" target="_blank" rel="noopener noreferrer" className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-accent text-sm font-black text-brand-text transition hover:brightness-105"><HeartHandshake className="h-4 w-4"/>Поддержать подключение</a><p className="mt-2 text-center text-xs text-brand-muted">Перевод откроется на защищённой странице Т‑Банка.</p></section>;
}
