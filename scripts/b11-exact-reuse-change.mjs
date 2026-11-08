import { createHash } from 'node:crypto';
export const B11_API_FILE = 'app/api/v3/calculate/route.ts';
export const B11_BEFORE_BLOB = 'ac9a155218f5720e3ff13f2adbb77f24f93b6b2b';
export const B11_AFTER_BLOB = '5fad968f64202bb14bf3fcdfe920ad364a312cd0';
const BEFORE = '80e437de9f7b2afceb13cbdc8f7cae7af8e7a30267f31e49eac2812231a802f4';
const AFTER = 'e8292921ddec4aeca2f7121c18c118a0ee0e33697c488dd99e752c7103f8ee6a';
// One owner-authorized byte-exact transition, NOT a permanent API path exemption.
// Contents come from the immutable previous checked head and current PR head.
export function exactB11SourcePair(before, after) {
  return typeof before === 'string' && typeof after === 'string'
    && createHash('sha256').update(before).digest('hex') === BEFORE
    && createHash('sha256').update(after).digest('hex') === AFTER;
}
