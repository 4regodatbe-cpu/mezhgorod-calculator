import type { NextRequest } from "next/server";
import { GET as getSuggestions } from "../suggest/route";

// Keep suggestion handling shared while using a URL that is less likely to be
// classified as a browser's generic autocomplete/tracking endpoint.
export async function GET(request: NextRequest) {
  return getSuggestions(request);
}
