import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { createSuggestionForwardRequest } from "../lib/address-search-proxy.ts";

test("address search proxy preserves the caller abort signal and query", () => {
  const controller = new AbortController();
  const request = new NextRequest("https://calculator.test/r", { signal: controller.signal });
  const forwarded = createSuggestionForwardRequest(request, "Ростов");

  assert.equal(forwarded.nextUrl.pathname, "/api/suggest");
  assert.equal(forwarded.nextUrl.searchParams.get("q"), "Ростов");
  controller.abort();
  assert.equal(forwarded.signal.aborted, true);
});
