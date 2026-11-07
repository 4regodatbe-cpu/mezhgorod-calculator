import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as postV2 } from "../app/api/v2/calculate/route.ts";
import { POST as postV3 } from "../app/api/v3/calculate/route.ts";
import { classifyCalculateApiError } from "../lib/calculate-api-error.ts";

const endpoints = [["V2", postV2], ["V3", postV3]] as const;
const point = (label: string) => ({ label });
const req = (url: string) => new NextRequest(`http://localhost${url}`, {
  method: "POST",
  body: JSON.stringify({ from: point("A"), to: point("B") }),
});
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

test("calculate APIs keep safe client messages and distinguish input, upstream, and internal failures", async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const [name, post] of endpoints) {
      globalThis.fetch = async () => response({ features: [] });
      const notFound = await post(req(name === "V2" ? "/api/v2/calculate" : "/api/v3/calculate"));
      assert.equal(notFound.status, 400, `${name} user/address failure`);
      assert.equal((await notFound.json()).error, "Адрес не найден. Уточните город или населённый пункт.");
      assert.equal(classifyCalculateApiError(new Error("ADDRESS_NOT_FOUND")).category, "user_input");

      globalThis.fetch = async () => response({}, 503);
      const upstream = await post(req(name === "V2" ? "/api/v2/calculate" : "/api/v3/calculate"));
      assert.equal(upstream.status, 502, `${name} known upstream failure`);
      assert.equal((await upstream.json()).error, "Поиск адресов временно недоступен.");
      assert.equal(classifyCalculateApiError(new Error("GEOCODE_UNAVAILABLE")).category, "upstream");

      globalThis.fetch = async () => { throw new Error("private-provider-host.example/token"); };
      const internal = await post(req(name === "V2" ? "/api/v2/calculate" : "/api/v3/calculate"));
      assert.equal(internal.status, 500, `${name} unexpected internal failure`);
      const safeBody = await internal.json();
      assert.equal(safeBody.error, "Не удалось выполнить расчёт.");
      assert.doesNotMatch(JSON.stringify(safeBody), /private-provider-host|token/);
      assert.equal(classifyCalculateApiError(new Error("unexpected internal exception")).category, "internal");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
