import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const apkUrl = '/downloads/Iz-A-v-B-V1.01-debug.apk';
const expectedSha256 = 'a7a44d60a68940fa695532aec8482cd98111bd8841f2ec921205861ff1b6c69a';
const apk = fileURLToPath(new URL('../public' + apkUrl, import.meta.url));
const page = fileURLToPath(new URL('../app/v3/page.tsx', import.meta.url));

test('V1.01 download serves the verified APK bytes from public static assets', () => {
  const bytes = readFileSync(apk);
  assert.equal(bytes.length, 819945);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedSha256);
});

test('V3 links the verified APK without changing the V2 Android download', () => {
  const v3 = readFileSync(page, 'utf8');
  const v2 = readFileSync(fileURLToPath(new URL('../app/v2/page.tsx', import.meta.url)), 'utf8');
  assert.ok(v3.includes(`href="${apkUrl}"`));
  assert.match(v3, /Скачать для Android/);
  assert.match(v3, /Iz-A-v-B-V1\.01-debug\.apk/);
  assert.match(v2, /releases\/download\/android-latest\/Mezhgorod-Calc-2\.apk/);
});
