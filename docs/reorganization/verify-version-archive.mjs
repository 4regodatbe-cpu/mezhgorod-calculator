import { createHash } from 'node:crypto';
import { createReadStream, lstatSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const [version, commit, tree, archivePath, restoredDir, manifestPath] = process.argv.slice(2);
if (!version || !/^[a-f0-9]{40}$/.test(commit ?? '') || !/^[a-f0-9]{40}$/.test(tree ?? '') || !archivePath || !restoredDir || !manifestPath) {
  throw new Error('Usage: verify-version-archive.mjs VERSION COMMIT TREE ARCHIVE RESTORED_DIR MANIFEST (git ls-tree -r -z COMMIT on stdin)');
}
const sha = (algorithm, content) => createHash(algorithm).update(content).digest('hex');
const entries = readFileSync(0).toString('utf8').split('\0').filter(Boolean);
const files = [];
let bytes = 0;
for (const entry of entries) {
  const match = /^(\d{6}) blob ([a-f0-9]{40})\t(.+)$/s.exec(entry);
  if (!match) throw new Error(`Unsupported Git tree entry: ${entry.slice(0, 100)}`);
  const [, mode, blobSha, path] = match;
  if (path.startsWith('/') || path.split('/').includes('..')) throw new Error(`Unsafe Git path ${path}`);
  const full = resolve(restoredDir, path);
  if (!full.startsWith(`${resolve(restoredDir)}/`)) throw new Error(`Escaped restore root ${path}`);
  const stats = lstatSync(full);
  if (!stats.isFile()) throw new Error(`Not a regular restored file: ${path}`);
  if ((stats.mode & 0o111) !== (mode === '100755' ? 0o111 : 0)) throw new Error(`Executable mode mismatch: ${path}`);
  const content = readFileSync(full);
  const gitSha = sha('sha1', Buffer.concat([Buffer.from(`blob ${content.length}\0`), content]));
  if (gitSha !== blobSha) throw new Error(`Git blob mismatch: ${path}`);
  bytes += content.length;
  files.push({ path, bytes: content.length, mode, gitBlobSha: blobSha, sha256: sha('sha256', content) });
}
const expected = new Set(files.map(file => file.path));
function checkExtras(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) checkExtras(full);
    else if (!expected.has(relative(restoredDir, full))) throw new Error(`Unexpected restored file: ${full}`);
  }
}
checkExtras(restoredDir);
const archiveHash = createHash('sha256');
for await (const chunk of createReadStream(archivePath)) archiveHash.update(chunk);
const manifest = {
  schemaVersion: 1,
  version,
  sourceCommit: commit,
  sourceTree: tree,
  archiveFile: 'source.tar.gz',
  archiveBytes: statSync(archivePath).size,
  archiveSha256: archiveHash.digest('hex'),
  fileCount: files.length,
  uncompressedFileBytes: bytes,
  verification: 'tar extracted in clean directory; every restored file Git blob SHA-1 matched exact source commit; no extra files; executable bits checked',
  files,
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ version, sourceCommit: commit, sourceTree: tree, archiveBytes: manifest.archiveBytes, archiveSha256: manifest.archiveSha256, fileCount: files.length, uncompressedFileBytes: bytes, verified: true }));
