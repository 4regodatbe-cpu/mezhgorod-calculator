export const MAX_CALCULATE_REQUEST_BYTES = 16 * 1024;
export const MAX_COLLECT_REQUEST_BYTES = 16 * 1024;

export class RequestBodyError extends Error {
  readonly status: 400 | 413;
  constructor(status: 400 | 413, message: string) {
    super(message);
    this.name = "RequestBodyError";
    this.status = status;
  }
}

/** Reads and parses a bounded JSON object, counting actual streamed bytes. */
export async function readLimitedJsonObject(
  request: Request,
  maxBytes = MAX_CALCULATE_REQUEST_BYTES,
): Promise<Record<string, unknown>> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > maxBytes) {
    await request.body?.cancel().catch(() => undefined);
    throw new RequestBodyError(413, "Размер запроса превышает допустимый предел.");
  }

  if (!request.body) throw new RequestBodyError(400, "Некорректный JSON запроса.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new RequestBodyError(413, "Размер запроса превышает допустимый предел.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new RequestBodyError(400, "Некорректный JSON запроса.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new RequestBodyError(400, "Ожидался JSON-объект запроса.");
  }
  return parsed as Record<string, unknown>;
}
