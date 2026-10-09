"use client";

import { useEffect } from "react";

/** A client-side error in a route card must not strand the user on a blank screen. */
export default function V2Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("v2_route_render_error", error);
  }, [error]);
  return (
    <main translate="no" className="notranslate calculator-modern min-h-screen bg-brand-page p-4 text-brand-text">
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-brand-border bg-brand-surface p-6 text-center">
        <h1 className="text-xl font-bold">Не удалось отобразить расчёт</h1>
        <p className="mt-3 text-sm text-brand-muted">Произошёл временный сбой при загрузке результата. Попробуйте повторить или вернитесь к форме.</p>
        <details className="mt-3 rounded-xl border border-brand-border p-3 text-left text-xs">
          <summary className="cursor-pointer font-semibold">Техническая причина (только тестовая версия)</summary>
          <p className="mt-2 break-words text-brand-muted">{error.message || "Сообщение отсутствует"}</p>
          {error.digest && <p className="mt-1 break-all text-brand-muted">Код: {error.digest}</p>}
        </details>
        <button type="button" onClick={reset} className="mt-5 rounded-xl bg-brand-action px-4 py-3 font-semibold text-brand-action-foreground">
          Повторить загрузку
        </button>
        <a href="/v2" className="mt-4 block text-sm underline">Вернуться к калькулятору</a>
      </div>
    </main>
  );
}
