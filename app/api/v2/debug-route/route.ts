import { NextRequest, NextResponse } from "next/server";
import { priceM4TollEvents } from "@/lib/toll-engine/m4-engine";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from")?.trim();
  const to = request.nextUrl.searchParams.get("to")?.trim();
  if (!from || !to) {
    return NextResponse.json({ error: "Use ?from=...&to=..." }, { status: 400 });
  }

  const response = await fetch(new URL("/api/v2/calculate", request.nextUrl.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
        tollValidation?: { tollBooths?: Parameters<typeof priceM4TollEvents>[0] };
        m4PricingDiagnostic?: ReturnType<typeof priceM4TollEvents>;
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
      if (!leg.fast) continue;
      const events = leg.fast.tollValidation?.tollBooths ?? [];
      leg.fast.m4PricingDiagnostic = priceM4TollEvents(events);
    }
  }

  return NextResponse.json(data, { status: response.status });
}
