"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MessageSquareText, Send } from "lucide-react";

export function FeedbackForm() {
  const [category, setCategory] = useState("Улучшение калькулятора");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent) { event.preventDefault(); if (message.trim().length < 10) { setStatus("error"); return; } setStatus("sending"); try { const response = await fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feedback", category: `[2.0] ${category}`, message, website: "" }) }); if (!response.ok) throw new Error(); setMessage(""); setStatus("sent"); } catch { setStatus("error"); } }
  return <section className="rounded-[24px] border border-brand-border/15 bg-brand-surface p-4"><MessageSquareText className="h-5 w-5 text-brand-action"/><h2 className="mt-3 text-lg font-black text-brand-text">Предложить улучшение</h2><p className="mt-1 text-sm text-brand-muted">Напишите, чего не хватает калькулятору.</p><form onSubmit={submit} className="mt-4 space-y-3"><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-brand-border/20 bg-brand-page px-3 text-sm text-brand-text"><option>Улучшение калькулятора</option><option>Новая функция</option><option>Сообщить об ошибке</option><option>Другое</option></select><textarea value={message} onChange={(e) => { setMessage(e.target.value); setStatus("idle"); }} minLength={10} maxLength={1000} required rows={4} placeholder="Ваше предложение…" className="w-full resize-y rounded-xl border border-brand-border/20 bg-brand-page p-3 text-[16px] text-brand-text outline-none focus:border-brand-focus"/>{status === "sent" && <p className="text-sm font-bold text-brand-action">Спасибо! Предложение сохранено.</p>}{status === "error" && <p className="text-sm font-bold text-red-700">Введите не менее 10 символов или попробуйте позже.</p>}<button disabled={status === "sending"} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-action text-sm font-bold text-brand-action-foreground"><Send className="h-4 w-4"/>{status === "sending" ? "Отправляем…" : "Отправить идею"}</button></form></section>;
}
