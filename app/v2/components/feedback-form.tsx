"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MessageSquareText, Send } from "lucide-react";

export function FeedbackForm() {
  const [category, setCategory] = useState("Улучшение калькулятора");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent) { event.preventDefault(); if (message.trim().length < 10) { setStatus("error"); return; } setStatus("sending"); try { const response = await fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feedback", category: `[2.0] ${category}`, message, website: "" }) }); if (!response.ok) throw new Error(); setMessage(""); setStatus("sent"); } catch { setStatus("error"); } }
  return <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4"><MessageSquareText className="h-5 w-5 text-blue-400"/><h2 className="mt-3 text-lg font-black text-white">Предложить улучшение</h2><p className="mt-1 text-sm text-slate-400">Напишите, чего не хватает калькулятору.</p><form onSubmit={submit} className="mt-4 space-y-3"><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white"><option>Улучшение калькулятора</option><option>Новая функция</option><option>Сообщить об ошибке</option><option>Другое</option></select><textarea value={message} onChange={(e) => { setMessage(e.target.value); setStatus("idle"); }} minLength={10} maxLength={1000} required rows={4} placeholder="Ваше предложение…" className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-3 text-[16px] text-white outline-none focus:border-blue-500"/>{status === "sent" && <p className="text-sm font-bold text-emerald-400">Спасибо! Предложение сохранено.</p>}{status === "error" && <p className="text-sm font-bold text-red-400">Введите не менее 10 символов или попробуйте позже.</p>}<button disabled={status === "sending"} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white"><Send className="h-4 w-4"/>{status === "sending" ? "Отправляем…" : "Отправить идею"}</button></form></section>;
}
