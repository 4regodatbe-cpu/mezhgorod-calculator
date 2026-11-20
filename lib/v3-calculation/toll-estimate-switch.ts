type Environment = { NODE_ENV?: string; VERCEL_ENV?: string; VERCEL_GIT_COMMIT_REF?: string; V3_TOLL_ESTIMATE?: string };
const BRANCH = "fix/v3-missing-route-prices-2026-10-15";

/** Server-only opt-in. A request, client flag or Production env cannot enable it. */
export function tollEstimateEnabled(env: Environment = process.env): boolean {
  if (env.V3_TOLL_ESTIMATE !== "1") return false;
  if (env.VERCEL_ENV === "preview") return env.VERCEL_GIT_COMMIT_REF === BRANCH;
  if (env.VERCEL_ENV !== undefined) return false;
  return env.NODE_ENV === "development" || env.NODE_ENV === "test";
}
