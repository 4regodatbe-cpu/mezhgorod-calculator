import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
import { withinRoutingSignal, calculationSignal } from "../lib/routing-deadline";
import { routingFetch, routingFailure } from "../lib/routing-attempt";
import { readLimitedProviderJson } from "../lib/limited-provider-json";
import { POST } from "../app/api/v3/calculate/route";
import { NextRequest } from "next/server";

test("temporal matrix: hanging competitors, real deadlines, late results, repeat and cancellation", async () => {
  const keeper = setTimeout(() => {}, 1000);
  try {
  for (const hung of [0,1,2]) {
    const rows = await Promise.allSettled([0,1,2].map(index => withinRoutingSignal(() => index === hung ? new Promise<number>(() => {}) : wait(3, index), AbortSignal.timeout(25))));
    assert.equal(rows.filter(row => row.status === "fulfilled").length, 2);
    assert.equal(rows[hung].status, "rejected");
  }
  const deadline = calculationSignal(new AbortController().signal, 25);
  const early = withinRoutingSignal(() => wait(3, "valid"), deadline);
  const late = withinRoutingSignal(() => wait(45, "obsolete"), deadline);
  assert.equal(await early, "valid");
  await assert.rejects(late, {name:"TimeoutError"});
  const controller = new AbortController();
  const cancelled = withinRoutingSignal(() => wait(30, "obsolete"), controller.signal);
  controller.abort();
  await assert.rejects(cancelled, {name:"AbortError"});
  assert.equal(await withinRoutingSignal(() => wait(1, "new"), calculationSignal(new AbortController().signal, 30)), "new");
  // Keep the process alive while native AbortSignal deadlines (unref timers) run.
  await wait(50);
  } finally { clearTimeout(keeper); }
});

test("stalled response body is cancelled at actual deadline, preserving timeout cause", async () => {
  let cancelled = false;
  const response = new Response(new ReadableStream({cancel(){cancelled=true;}}));
  const keeper = setTimeout(() => {}, 1000);
  try {
    await assert.rejects(readLimitedProviderJson(response, undefined, AbortSignal.timeout(20)), error => routingFailure(error).failure === "timeout");
    assert.equal(cancelled,true);
  } finally { clearTimeout(keeper); }
});

test("late transport response is discarded after cancellation", async () => {
  const original = globalThis.fetch;
  let cancelled=false;
  try {
    globalThis.fetch=async()=>{await wait(30);return new Response(new ReadableStream({cancel(){cancelled=true;}}));};
    await assert.rejects(routingFetch(new URL("https://example.test"),{signal:AbortSignal.timeout(10)}), error=>routingFailure(error).failure==="timeout");
    await wait(40);assert.equal(cancelled,true);
  } finally {globalThis.fetch=original;}
});

test("all three genuinely stalled transports terminate at production provider timeout with truthful API 502", async () => {
  const original=globalThis.fetch;
  const keeper=setTimeout(()=>{},30_000);
  let calls=0;
  try {
    globalThis.fetch=async()=>{calls++;return new Promise<Response>(()=>{});};
    const started=Date.now();
    const response=await POST(new NextRequest("http://localhost/api/v3/calculate",{method:"POST",body:JSON.stringify({from:{label:"A",position:{lng:35.9176,lat:56.8587}},to:{label:"B",position:{lng:39.918,lat:43.4382}}})}));
    assert.equal(response.status,502);assert.match((await response.json()).error,/время ожидания/);
    assert.equal(calls,3);assert.ok(Date.now()-started>=24_900);assert.ok(Date.now()-started<29_500);
  } finally {globalThis.fetch=original;clearTimeout(keeper);}
});
