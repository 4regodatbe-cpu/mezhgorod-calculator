import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Межгород Calc 2.0 — расчёт стоимости поездки",
  description: "Расчёт междугородней поездки по четырём тарифам, с платной и бесплатной дорогой.",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
