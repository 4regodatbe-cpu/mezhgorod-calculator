export function selectCaptureCaseIds(value, allowedCaseIds) {
  if (!Array.isArray(allowedCaseIds) || !allowedCaseIds.length || allowedCaseIds.some((id) => typeof id !== "string" || !id)) {
    throw new Error("B10_ALLOWED_CASES_INVALID");
  }
  if (value === undefined) return [...allowedCaseIds];
  const selected = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (!selected.length) throw new Error("B10_CAPTURE_CASES_EMPTY");
  if (new Set(selected).size !== selected.length) throw new Error("B10_CAPTURE_CASES_DUPLICATE");
  const allowed = new Set(allowedCaseIds);
  const invalid = selected.filter((caseId) => !allowed.has(caseId));
  if (invalid.length) throw new Error(`B10_CAPTURE_CASES_NOT_ALLOWED:${invalid.join(",")}`);
  return selected;
}
