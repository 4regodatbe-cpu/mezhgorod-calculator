import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Калькулятор межгород",
  description: "Расчёт междугородней поездки по четырём тарифам с основным маршрутом и альтернативой, объезжающей пункты оплаты.",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
