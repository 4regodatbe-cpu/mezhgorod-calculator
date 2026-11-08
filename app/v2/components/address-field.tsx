"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import type { Place, Suggestion } from "./types";
import { cacheAddressSuggestions, getCachedAddressSuggestions } from "../../../lib/address-suggestion-cache";

function reviewedSnapshotCredit(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const credit = value as { attribution?: unknown; licenseUrl?: unknown; licenseName?: unknown };
  if (credit.licenseName === "CC BY 4.0" && credit.licenseUrl === "https://creativecommons.org/licenses/by/4.0/" &&
      credit.attribution === "GeoNames geographical database; filtered and indexed by Mezhgorod Calculator") {
    return { attribution: credit.attribution, licenseUrl: credit.licenseUrl, licenseName: credit.licenseName };
  }
  if (credit.licenseName === "ODbL-1.0" && credit.licenseUrl === "https://www.openstreetmap.org/copyright" &&
      credit.attribution === "© OpenStreetMap contributors") {
    return { attribution: credit.attribution, licenseUrl: credit.licenseUrl, licenseName: credit.licenseName };
  }
  return null;
}

export function AddressField({ label, value, onChange, placeholder, releaseCopy = false }: { label: string; value: Place; onChange: (place: Place) => void; placeholder: string; releaseCopy?: boolean }) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [citySnapshot, setCitySnapshot] = useState(false);
  const [snapshotCredit, setSnapshotCredit] = useState<{ attribution: string; licenseUrl: string; licenseName: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (value.position || value.label.trim().length < 3) {
      setItems([]);
      setCitySnapshot(false);
      setSnapshotCredit(null);
      setOpen(false);
      setSearchState("idle");
      return;
    }
    setCitySnapshot(false);
    setSnapshotCredit(null);
    const cached = getCachedAddressSuggestions(value.label);
    if (cached) {
      setItems(cached);
      setSearchState("idle");
      setOpen(true);
      return;
    }
    setSearchState("idle");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchState("loading");
      try {
        const response = await fetch("/r", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: value.label }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Address search failed: ${response.status}`);
        const data = await response.json();
        if (!controller.signal.aborted) {
          const results = Array.isArray(data.items) ? data.items : [];
          setItems(results);
          const credit = data.fallback?.source === "reviewed_city_snapshot" ? reviewedSnapshotCredit(data.fallback) : null;
          if (data.fallback?.source === "reviewed_city_snapshot" && !credit) {
            setItems([]); setCitySnapshot(false); setSnapshotCredit(null); setSearchState("error"); setOpen(true); return;
          }
          const isCitySnapshot = Boolean(credit);
          setCitySnapshot(isCitySnapshot);
          setSnapshotCredit(credit);
          if (!isCitySnapshot) cacheAddressSuggestions(value.label, results, { partial: data.partial === true });
          setSearchState(results.length ? "idle" : "empty");
          setOpen(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setItems([]);
          setCitySnapshot(false); setSnapshotCredit(null);
          setSearchState("error");
          setOpen(true);
        }
      }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value, retryAttempt]);
  return <label className="relative block min-w-0 max-w-full">
    <span className={releaseCopy ? "sr-only" : "mb-1.5 block text-xs font-bold uppercase tracking-[.14em] text-brand-muted"}>{label}</span>
    <div className="relative min-w-0"><MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-brand-action"/>{releaseCopy && <span aria-hidden="true" className="pointer-events-none absolute left-10 top-2.5 text-xl font-black leading-7 text-brand-text">{label.endsWith("A") ? "А" : "Б"}</span>}<input ref={inputRef} aria-label={placeholder} maxLength={200} className={"h-12 w-full min-w-0 rounded-xl border border-brand-border/20 bg-brand-page pr-12 text-[16px] text-brand-text outline-none transition focus:border-brand-focus focus:ring-2 focus:ring-brand-focus/20 " + (releaseCopy ? "pl-16" : "pl-10")} value={value.label} placeholder={placeholder} autoComplete="off" onChange={(e) => { onChange({ label: e.target.value }); setItems([]); setCitySnapshot(false); setSnapshotCredit(null); setSearchState("idle"); setOpen(true); }} onFocus={() => setOpen(true)}/>{value.label && <button type="button" aria-label={`Очистить поле «${label}»`} onClick={() => { onChange({ label: "" }); setItems([]); setCitySnapshot(false); setSnapshotCredit(null); setSearchState("idle"); setOpen(false); requestAnimationFrame(() => inputRef.current?.focus()); }} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-lg text-brand-muted transition hover:bg-brand-subtle hover:text-brand-text"><X className="h-4.5 w-4.5"/></button>}</div>
    {open && (items.length > 0 || searchState !== "idle") && <div role="status" aria-live="polite" className="absolute left-0 right-0 z-30 mt-2 max-h-64 w-full max-w-full overflow-x-hidden overflow-y-auto rounded-xl border border-brand-border/20 bg-brand-surface p-1 shadow-xl">
      {items.map((item) => <button type="button" key={item.id} className="block w-full min-w-0 rounded-lg px-3 py-2.5 text-left transition hover:bg-brand-subtle" onClick={() => { onChange(citySnapshot ? { label: item.label, position: item.position, addressSource: "reviewed_city_snapshot", addressAttribution: snapshotCredit?.attribution, addressLicenseUrl: snapshotCredit?.licenseUrl, addressLicenseName: snapshotCredit?.licenseName } : { label: item.label, position: item.position }); setOpen(false); setSearchState("idle"); }}><strong className="block truncate text-sm text-brand-text">{item.title}</strong><span className="block truncate text-xs text-brand-muted">{item.label}</span></button>)}
      {items.length === 0 && searchState === "loading" && <p className="px-3 py-2.5 text-sm text-brand-muted">Ищем населённые пункты…</p>}
      {items.length === 0 && searchState === "empty" && <p className="px-3 py-2.5 text-sm text-brand-muted">Ничего не найдено. Уточните название или добавьте область.</p>}
      {items.length === 0 && searchState === "error" && <div className="flex items-center justify-between gap-2 px-3 py-2.5"><p className="text-sm text-brand-muted">Сервис поиска временно недоступен.</p><button type="button" className="shrink-0 text-sm font-bold text-brand-action" onClick={() => setRetryAttempt((attempt) => attempt + 1)}>Повторить</button></div>}
    </div>}
    {(value.position ? value.addressSource === "reviewed_city_snapshot" && Boolean(value.addressAttribution && value.addressLicenseUrl && value.addressLicenseName) : citySnapshot && Boolean(snapshotCredit)) && <span className="mt-1 block text-xs text-brand-muted">Резервный поиск: только сохранённые города. <a href={value.addressLicenseUrl ?? snapshotCredit?.licenseUrl} target="_blank" rel="noreferrer" className="underline">{value.addressAttribution ?? snapshotCredit?.attribution} · {value.addressLicenseName ?? snapshotCredit?.licenseName}</a></span>}
  </label>;
}
