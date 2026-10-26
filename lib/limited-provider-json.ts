/**
 * Provider responses are kept comfortably above the largest retained route
 * payload while still bounding memory consumed by a malformed upstream body.
 */
export const MAX_ROUTE_PROVIDER_RESPONSE_BYTES = 8 * 1024 * 1024;

export async function readLimitedProviderJson<T>(response: Response, limitBytes = MAX_ROUTE_PROVIDER_RESPONSE_BYTES): Promise<T> {
  if (!Number.isSafeInteger(limitBytes) || limitBytes < 1) {
    throw new RangeError("limitBytes must be a positive safe integer");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("ROUTE_UNAVAILABLE");

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > limitBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("ROUTE_UNAVAILABLE");
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as T;
  } catch {
    throw new Error("ROUTE_UNAVAILABLE");
  } finally {
    reader.releaseLock();
  }
}
