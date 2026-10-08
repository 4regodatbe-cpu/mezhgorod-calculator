"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { applyAndPersistTheme, nextTheme, readTheme, type Theme } from "@/lib/theme-toggle";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const next = readTheme(() => localStorage.getItem("mezhgorod-theme"));
    setTheme(next);
    applyTheme(next);
  }, []);

  function toggle() {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const next = nextTheme(current);
    applyAndPersistTheme(next, applyTheme, (value) => localStorage.setItem("mezhgorod-theme", value));
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-border/15 bg-brand-surface text-brand-text shadow-sm transition hover:bg-brand-subtle"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
