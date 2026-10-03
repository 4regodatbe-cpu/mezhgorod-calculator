import type { NextRequest } from "next/server";
import { GET as getSuggestions } from "../api/suggest/route";

export async function GET(request: NextRequest) {
  return getSuggestions(request);
}
