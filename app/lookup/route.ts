import { NextRequest, NextResponse } from "next/server";
import { GET as getSuggestions } from "../api/suggest/route";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const query = body && typeof body === "object" && "query" in body
    ? (body as { query?: unknown }).query
    : undefined;
  if (typeof query !== "string") {
    return NextResponse.json({ error: "Не указан поисковый запрос" }, { status: 400 });
  }

  const url = new URL(request.url);
  url.pathname = "/api/suggest";
  url.search = "";
  url.searchParams.set("q", query);
  return getSuggestions(new NextRequest(url));
}
