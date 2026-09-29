import { NextRequest, NextResponse } from "next/server";

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
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(55_000),
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
