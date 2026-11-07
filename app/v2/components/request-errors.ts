const SAFE_MESSAGE_TAG = Symbol.for("mezhgorod-calculator.safe-request-message");

export class UserFacingCalculationError extends Error {
  readonly [SAFE_MESSAGE_TAG] = true;
}

export function userFacingCalculationErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) return fallback;
  const tagged = error as { message?: unknown; [SAFE_MESSAGE_TAG]?: unknown };
  return tagged[SAFE_MESSAGE_TAG] === true && typeof tagged.message === "string"
    ? tagged.message
    : fallback;
}
