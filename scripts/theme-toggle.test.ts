import test from "node:test";
import assert from "node:assert/strict";
import { applyAndPersistTheme, browserColorScheme, nextTheme, readTheme } from "../lib/theme-toggle.ts";

test("theme toggle switches between dark and light", () => {
  assert.equal(nextTheme("dark"), "light");
  assert.equal(nextTheme("light"), "dark");
});

test("light mode opts out of automatic Android darkening", () => {
  assert.equal(browserColorScheme("light"), "only light");
  assert.equal(browserColorScheme("dark"), "dark");
});

test("unavailable local storage falls back safely to the light theme", () => {
  assert.equal(readTheme(() => { throw new Error("Storage is blocked"); }), "light");
  assert.equal(readTheme(() => "dark"), "dark");
  assert.equal(readTheme(() => "unexpected"), "light");
});

test("visible theme change is applied even when local storage write fails", () => {
  const calls: string[] = [];

  applyAndPersistTheme(
    "light",
    (theme) => calls.push(`apply:${theme}`),
    () => { calls.push("persist"); throw new Error("Storage is blocked"); },
  );

  assert.deepEqual(calls, ["apply:light", "persist"]);
});
