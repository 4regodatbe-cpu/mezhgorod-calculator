import type { Coordinate } from '@/lib/tolls';
import type { M11RoadEvidence } from '@/lib/toll-engine/m11-road-evidence';

// User policy 2026-10-13: a journey on a toll road has one entry and exit.
// Gaps in provider labels do not represent intermediate exits/re-entry.
export function m11TraversalSafety(_route: readonly Coordinate[], evidence: M11RoadEvidence | null | undefined): string | null {
  return evidence?.malformedStrictCount ? 'm11_malformed_strict_traversal' : null;
}
