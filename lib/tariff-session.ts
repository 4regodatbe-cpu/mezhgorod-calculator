export type CalculatorMode = "standard" | "dual";
export type TariffSession = { override: CalculatorMode | null; lastActivity: number };
export const SESSION_IDLE_MS = 30 * 60 * 1000;
export function activeOverride(session: TariffSession, now:number):CalculatorMode|null {
  return now >= session.lastActivity && now-session.lastActivity < SESSION_IDLE_MS ? session.override : null;
}
export function touchSession(session:TariffSession,now:number):TariffSession {
  return {override:activeOverride(session,now),lastActivity:now};
}
