import type { ReactNode } from "react";
import type { Metadata } from "next";

// Guard Russian interface text against automatic browser-page translation.
// A translation extension rewriting a child Text node can break React DOM diffing.
export const metadata: Metadata = {
  other: { google: "notranslate" },
};

export default function CalculatorV2Layout({ children }: { children: ReactNode }) {
  return children;
}
