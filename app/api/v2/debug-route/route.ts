import { NextRequest, NextResponse } from "next/server";
import { priceM4TollValidation } from "@/lib/toll-engine/m4-engine";
import type { TollValidation } from "@/lib/toll-validator";

export const maxDuration = 60;

function debugAllowed(request: NextRequest) {
  if (process.env.VERCEL !== "1") return true;
  const token = process.env.CALCULATOR_DEBUG_TOKEN;
  return Boolean(token) && request.headers.get("x-calculator-debug-token") === token;
}

export async function GET(request: NextRequest) {
  if (!debugAllowed(request)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const from = request.nextUrl.searchParams.get("from")?.trim();
  const to = request.nextUrl.searchParams.get("to")?.trim();
  if (!from || !to || from.length > 120 || to.length > 120) {
    return NextResponse.json({ error: "Use ?from=...&to=..." }, { status: 400 });
  }

  const debugToken = request.headers.get("x-calculator-debug-token");
  const response = await fetch(new URL("/api/v2/calculate", request.nextUrl.origin), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(debugToken ? { "x-calculator-debug-token": debugToken } : {}),
    },
    body: JSON.stringify({
      from: { label: from },
      to: { label: to },
      mode: "standard",
      diagnostics: true,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(55_000),
  });

  const data = await response.json().catch(() => null) as {
    legs?: Array<{
      fast?: {
        tollValidation?: TollValidation;
        m4PricingDiagnostic?: ReturnType<typeof priceM4TollValidation>;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  } | null;

  if (!data) {
    return NextResponse.json({ error: "Diagnostic upstream response is not valid JSON" }, { status: 502 });
  }

  if (response.ok && Array.isArray(data.legs)) {
    for (const leg of data.legs) {
      if (!leg.fast?.tollValidation) continue;
      leg.fast.m4PricingDiagnostic = priceM4TollValidation(leg.fast.tollValidation);
    }
  }

  return NextResponse.json(data, { status: response.status });
}
