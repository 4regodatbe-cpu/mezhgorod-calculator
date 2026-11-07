import { inflateRawSync } from "node:zlib";

/** Extract the single official GeoNames daily dump member without spawning a process. */
export function readCities15000(zipBytes) {
  let eocd = -1;
  const lower = Math.max(0, zipBytes.length - 65_557);
  for (let offset = zipBytes.length - 22; offset >= lower; offset--) {
    if (zipBytes.readUInt32LE(offset) === 0x06054b50) { eocd = offset; break; }
  }
  if (eocd < 0) throw new Error("GeoNames ZIP end-of-central-directory is missing");
  const entries = zipBytes.readUInt16LE(eocd + 10);
  let cursor = zipBytes.readUInt32LE(eocd + 16);
  for (let i = 0; i < entries; i++) {
    if (zipBytes.readUInt32LE(cursor) !== 0x02014b50) throw new Error("Malformed GeoNames ZIP central directory");
    const method = zipBytes.readUInt16LE(cursor + 10);
    const compressedSize = zipBytes.readUInt32LE(cursor + 20);
    const uncompressedSize = zipBytes.readUInt32LE(cursor + 24);
    const nameLength = zipBytes.readUInt16LE(cursor + 28);
    const extraLength = zipBytes.readUInt16LE(cursor + 30);
    const commentLength = zipBytes.readUInt16LE(cursor + 32);
    const localOffset = zipBytes.readUInt32LE(cursor + 42);
    const name = zipBytes.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    if (name === "cities15000.txt") {
      if (method !== 8 || zipBytes.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("Unexpected GeoNames ZIP member encoding");
      const localNameLength = zipBytes.readUInt16LE(localOffset + 26);
      const localExtraLength = zipBytes.readUInt16LE(localOffset + 28);
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      const body = inflateRawSync(zipBytes.subarray(dataOffset, dataOffset + compressedSize));
      if (body.length !== uncompressedSize) throw new Error("GeoNames ZIP member length mismatch");
      return body.toString("utf8");
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error("cities15000.txt not found in GeoNames archive");
}
