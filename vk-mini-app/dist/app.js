const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbzCkPSY-YLROTxI13C-fNh6_8q32WEoxz6UGLXSJCSp2lIJSuWGXVn-vspty7JvNWqYww/exec";
const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const state = { dual: false, result: null, ymapsReady: false };

function bridgeInit() {
  try { if (window.vkBridge) window.vkBridge.send("VKWebAppInit"); } catch (_) {}
}

function waitForYmaps(attempt = 0) {
  if (window.ymaps) {
    ymaps.ready(() => {
      state.ymapsReady = true;
      ["from", "via", "to"].forEach((id) => new ymaps.SuggestView(id, { results: 5 }));
    });
  } else if (attempt < 40) setTimeout(() => waitForYmaps(attempt + 1), 250);
}

function postAnalytics(payload) {
  try {
    fetch(API_ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }).catch(() => {});
  } catch (_) {}
}

function registerVisit() {
  const key = `visit-${new Date().toISOString().slice(0, 10)}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "1");
  postAnalytics({ type: "visit", source: "vk-mini-app", date: new Date().toISOString() });
}

function showError(message) { $("error").textContent = message; $("error").classList.remove("hidden"); }
function clearError() { $("error").classList.add("hidden"); $("error").textContent = ""; }
function getRate(id) { return Math.max(0, Number.parseFloat($(id).value.replace?.(",", ".") || $(id).value) || 0); }
function km(meters) { return Math.round(meters / 1000); }
function duration(seconds) { const mins = Math.round(seconds / 60), h = Math.floor(mins / 60), m = mins % 60; return h ? `${h} ч${m ? ` ${m} мин` : ""}` : `${m} мин`; }
function fare(meters, rate) { return Math.round(meters / 1000 * rate); }

function buildRoute(from, to) {
  return new Promise((resolve, reject) => {
    ymaps.route([from, to], { routingMode: "auto", avoidTrafficJams: false }).then((route) => {
      const meters = route.getLength();
      const seconds = route.getTime();
      if (!meters || !seconds) reject(new Error("route")); else resolve({ from, to, meters, seconds });
    }, reject);
  });
}

function routeCard(item, title, rate) {
  return `<article class="route-card"><div class="route-head"><div><p>${title}</p><h3>${escapeHtml(item.from)} → ${escapeHtml(item.to)}</h3></div><span class="distance-pill">${km(item.meters)} км</span></div><p class="duration">◷ ${duration(item.seconds)}</p><dl><div><dt>Расстояние</dt><dd>${km(item.meters)} км</dd></div><div><dt>Тариф</dt><dd>${money.format(rate)} ₽/км</dd></div><div><dt>Стоимость участка</dt><dd>${money.format(fare(item.meters, rate))} ₽</dd></div></dl></article>`;
}

function escapeHtml(value) { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }

function renderResult() {
  const result = state.result;
  const cards = $("routeCards");
  cards.classList.toggle("dual", result.dual);
  cards.innerHTML = routeCard(result.first, result.dual ? "Участок 1" : "Маршрут поездки", result.rateOne) + (result.dual ? routeCard(result.second, "Участок 2", result.rateTwo) : "");
  if (result.dual) {
    const total = fare(result.first.meters, result.rateOne) + fare(result.second.meters, result.rateTwo);
    $("grandTotal").querySelector("strong").textContent = `${money.format(total)} ₽`;
    $("grandTotal").classList.remove("hidden");
  } else $("grandTotal").classList.add("hidden");
  $("results").classList.remove("hidden");
  setTimeout(() => $("results").scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
}

async function calculate() {
  clearError();
  const from = $("from").value.trim(), via = $("via").value.trim(), to = $("to").value.trim();
  const rateOne = getRate("rateOne"), rateTwo = getRate("rateTwo");
  if (!from || !to || (state.dual && !via)) return showError("Заполните все точки маршрута.");
  if (!rateOne || (state.dual && !rateTwo)) return showError("Укажите тариф больше нуля.");
  if (!state.ymapsReady) return showError("Карты ещё загружаются. Подождите несколько секунд и повторите.");
  const button = $("calculate"); button.disabled = true; button.innerHTML = "◌ Строим маршрут…";
  try {
    const first = await buildRoute(from, state.dual ? via : to);
    const second = state.dual ? await buildRoute(via, to) : null;
    state.result = { dual: state.dual, first, second, rateOne, rateTwo };
    renderResult();
    if ($("remember").checked) localStorage.setItem("mezhgorod-rates", JSON.stringify({ rateOne, rateTwo })); else localStorage.removeItem("mezhgorod-rates");
    const totalMeters = first.meters + (second?.meters || 0), totalSeconds = first.seconds + (second?.seconds || 0);
    postAnalytics({ type: "route", source: "vk-mini-app", distanceKm: km(totalMeters), durationMin: Math.round(totalSeconds / 60), rate: state.dual ? `${rateOne}/${rateTwo}` : rateOne, total: fare(first.meters, rateOne) + (second ? fare(second.meters, rateTwo) : 0) });
  } catch (_) { showError("Не удалось построить маршрут. Уточните названия городов или адреса."); }
  finally { button.disabled = false; button.innerHTML = "<span>⌖</span> Рассчитать"; }
}

function toggleDual(value) {
  state.dual = value;
  $("viaField").classList.toggle("hidden", !value);
  $("rateTwoField").classList.toggle("hidden", !value);
  $("rates").classList.toggle("dual", value);
  $("rateOneLabel").textContent = value ? "Тариф: первый участок" : "Стоимость 1 км";
  $("results").classList.add("hidden"); clearError();
}

function reset() {
  ["from", "via", "to"].forEach((id) => $(id).value = "");
  state.result = null; $("results").classList.add("hidden"); clearError(); $("from").focus();
}

async function copyResult() {
  if (!state.result) return;
  const r = state.result, lines = [`${r.first.from} → ${r.first.to}`, `${km(r.first.meters)} км · ${money.format(r.rateOne)} ₽/км · ${money.format(fare(r.first.meters, r.rateOne))} ₽`];
  if (r.dual) lines.push(`${r.second.from} → ${r.second.to}`, `${km(r.second.meters)} км · ${money.format(r.rateTwo)} ₽/км · ${money.format(fare(r.second.meters, r.rateTwo))} ₽`, `Итого: ${money.format(fare(r.first.meters, r.rateOne) + fare(r.second.meters, r.rateTwo))} ₽`);
  try { await navigator.clipboard.writeText(lines.join("\n")); $("copy").textContent = "✓ Скопировано"; setTimeout(() => $("copy").textContent = "▣ Скопировать расчёт", 1600); } catch (_) { showError("Не удалось скопировать автоматически."); }
}

$("dualMode").addEventListener("change", (e) => toggleDual(e.target.checked));
$("calculate").addEventListener("click", calculate);
$("swap").addEventListener("click", () => { const value = $("from").value; $("from").value = $("to").value; $("to").value = value; });
$("resetTop").addEventListener("click", reset); $("newCalc").addEventListener("click", reset); $("copy").addEventListener("click", copyResult);
$("feedbackForm").addEventListener("submit", (event) => { event.preventDefault(); const message = $("feedback").value.trim(); if (!message) return; postAnalytics({ type: "feedback", source: "vk-mini-app", message, date: new Date().toISOString() }); $("feedback").value = ""; $("feedbackStatus").textContent = "Спасибо! Предложение отправлено."; setTimeout(() => $("feedbackStatus").textContent = "", 4000); });

try { const saved = JSON.parse(localStorage.getItem("mezhgorod-rates") || "null"); if (saved) { $("rateOne").value = saved.rateOne || 35; $("rateTwo").value = saved.rateTwo || 45; } } catch (_) {}
bridgeInit(); waitForYmaps(); registerVisit();
