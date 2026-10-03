"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import type { Place, Suggestion } from "./types";

export function AddressField({ label, value, onChange, placeholder }: { label: string; value: Place; onChange: (place: Place) => void; placeholder: string }) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (value.position || value.label.trim().length < 3) return;
    const timer = setTimeout(async () => {
      try { const response = await fetch("/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: value.label }) }); const data = await response.json(); setItems(data.items ?? []); setOpen(true); } catch { setItems([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [value]);
  return <label className="relative block min-w-0">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[.14em] text-slate-400">{label}</span>
    <div className="relative"><MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-blue-400"/><input ref={inputRef} maxLength={200} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950/75 pl-10 pr-12 text-[16px] text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" value={value.label} placeholder={placeholder} autoComplete="off" onChange={(e) => { onChange({ label: e.target.value }); setItems([]); setOpen(true); }} onFocus={() => setOpen(true)}/>{value.label && <button type="button" aria-label={`Очистить поле «${label}»`} onClick={() => { onChange({ label: "" }); setItems([]); setOpen(false); requestAnimationFrame(() => inputRef.current?.focus()); }} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"><X className="h-4.5 w-4.5"/></button>}</div>
    {open && items.length > 0 && <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl">{items.map((item) => <button type="button" key={item.id} className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-800" onClick={() => { onChange({ label: item.label, position: item.position }); setOpen(false); }}><strong className="block text-sm text-white">{item.title}</strong><span className="block truncate text-xs text-slate-400">{item.label}</span></button>)}</div>}
  </label>;
}
