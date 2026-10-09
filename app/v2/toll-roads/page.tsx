import type { Metadata } from "next";
import catalog from "@/experiments/nationwide-tolls/national-registry.json";

export const metadata: Metadata = {
 title: "Платные дороги России — покрытие калькулятора",
 description: "Список платных дорог России и состояние подтверждения тарифов и маршрутов в калькуляторе из А в Б",
};
const labels: Record<string,string> = {
 existing_runtime:"Действующий расчёт",
 existing_runtime_partial:"Частичный расчёт",
 legacy_plus_shadow:"Действующий расчёт + новая проверка ПВП",
 existing_data_unwired:"Есть тарифы, нужен контроль ПВП",
 verified_fare_unwired:"Есть тариф, нужен контроль ПВП",
 verified_conditional_unwired:"Тариф по времени/условиям, нужен контроль проезда",
 legacy_unpriced:"Геометрия без точной цены",
 unwired:"Требуется тариф и геометрия",
};
export default function TollRoadCatalogPage() {
 const withFare=Object.keys(catalog.operatorFares).length;
 return <main className="min-h-screen bg-brand-page px-4 py-7 text-brand-text">
  <div className="mx-auto max-w-3xl">
   <a href="/v2" className="text-sm font-semibold text-brand-action underline">← Вернуться к калькулятору</a>
   <h1 className="mt-4 text-2xl font-black">Платные дороги России</h1>
   <p className="mt-2 text-sm leading-relaxed text-brand-muted">В реестре {catalog.networks.length} дорожные системы. Для {withFare} есть отдельные опубликованные тарифные данные; это не означает, что их денежный расчёт уже подключён ко всем маршрутам.</p>
   <p className="mt-2 text-sm leading-relaxed text-brand-muted">Стоимость поездки становится подтверждённой только после сопоставления выбранного маршрута с реальными платными участками, классом машины, способом оплаты, датой и исключениями оператора. Неопределённая цена не равна нулю.</p>
   <div className="mt-5 grid gap-3">
    {catalog.networks.map(item=><article key={item.id} className="rounded-2xl border border-brand-border/25 bg-brand-surface p-4">
     <div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{item.name}</h2>
       <span className="text-xs text-brand-muted">{labels[item.readiness]??"На проверке"}</span></div>
     <p className="mt-1 text-xs text-brand-muted">Оператор: {item.operator}</p>
     <a className="mt-2 inline-block text-xs font-semibold text-brand-action underline" target="_blank" rel="noopener noreferrer" href={item.source}>Источник оператора / сведения о дороге ↗</a>
    </article>)}
   </div>
   <p className="mt-6 text-xs text-brand-muted">Данные реестра: {catalog.asOf}. Исследовательская база, не является гарантией тарифа или наличия платного участка на маршруте.</p>
  </div>
 </main>;
}
