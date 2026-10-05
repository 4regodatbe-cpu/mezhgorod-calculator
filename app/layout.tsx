import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Расчёт межгорода — маршрут и стоимость поездки",
  description: "Мобильный калькулятор расстояния, времени и стоимости междугородней поездки.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("mezhgorod-theme");if(t!=="light"&&t!=="dark")t="light";document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t}catch(e){}` }} />
        {children}
      </body>
    </html>
  );
}
