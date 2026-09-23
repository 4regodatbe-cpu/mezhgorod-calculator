import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Межгород Calc 3.0 — проверенные маршруты",
  description: "Расчёт междугородней поездки по базе маршрутов, сверенных с Яндекс Картами.",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
