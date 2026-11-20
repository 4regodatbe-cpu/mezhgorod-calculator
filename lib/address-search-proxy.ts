import { NextRequest } from "next/server";

export function createSuggestionForwardRequest(request: NextRequest, query: string): NextRequest {
  const url = new URL(request.url);
  url.pathname = "/api/suggest";
  url.search = "";
  url.searchParams.set("q", query);
  return new NextRequest(url, { signal: request.signal });
}
