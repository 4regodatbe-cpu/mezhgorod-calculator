# Main Codex integration memo

No runtime or tariff changes are proposed by this evidence package. The primary Codex can use these constraints when a separate implementation task is authorized.

## Physical-to-tariff contract

Represent route evidence as directed crossings with source-versioned way/node IDs, direction, coordinates and trace completeness. Resolve a physical event to an operator point only through an explicit dated crosswalk. Resolve that point to a product only through the operator's tariff edition, vehicle class and payment method. Keep physical match confidence and tariff binding confidence separate.

Return `unknown`/`null` when a necessary crosswalk is absent, the trace is partial, or evidence is contradictory. Absence of payment fields is not a zero fare. Do not use nearest kilometre/name, combine adjacent rates, or copy a fare from the reverse direction as a substitute.

## Case-specific handoff

- **M4 PVP545:** confirmed route evidence can identify the 5818209495 branch on the saved northbound Taman→Voronezh path. Do not apply 517–544 or 545/544–589 products to that branch without current operator lane/product rules. Never sum the two rate rows from arithmetic alone.
- **M12:** Order302 provides tariff matrix rows for calibrated RVP anchors 281/314/392/420. Nearby physical exits, nodes labelled 287/318/395/442 and western gantries are not interchangeable with those tariff points. Arzamas and M7 exit candidates remain unpriced.
- **CKAD:** preserve `outcome_unknown` and no-replay state for the previous M11→M12 request. The 981 ₽ candidate is not a tariff binding. The published 120-minute note is limited to its named route sections and detection conditions.
- **M4 PVP62–71:** retain directed cases as unknown where source geometry/payment records are absent; no repeat of historical pilot.
- **ZSD/Pulkovo/M11:** RVP64 is physical boundary evidence only; narrow ZSD receipt/60-minute exceptions are not road-wide. Pulkovo direct and reverse are separate direction cases. Keep Stage8 M11 matrix unchanged; saved PVP18 response without retained WKT cannot prove crossing.

## Required regression properties

1. Correct direction crossing matches only the explicit crosswalk.
2. Opposite carriageway, adjacent exit, nearby pass, unknown gantry, and partial trace do not produce a numeric fare.
3. A missing payment event does not become zero.
4. A product rate is applied only for its effective date, vehicle category and payment method.
5. Adjacent section rates are not added unless the operator rule explicitly requires both.
6. Existing Stage8 M11 results and historical snapshots remain unchanged.

All changes must be made and reviewed on the owner's working branch under a separate authorization. This handoff does not authorize implementation, merge, push, or API calls.
