import { execFile } from 'node:child_process';

// Forward output while retaining bounded stderr for a useful failure checkpoint.
export function runAuditChild(args, { timeout = 300_000, heartbeatMs = 15_000, onProgress = line => process.stderr.write(`${line}\n`) } = {}) {
  return new Promise(resolve => {
    let stderr = '';
    const child = execFile(process.execPath, args, { timeout, maxBuffer: 2 * 1024 * 1024 }, error => {
      clearInterval(heartbeat);
      resolve(error ? { ok: false, code: error.code, killed: Boolean(error.killed), error: stderr.trim() || error.message } : { ok: true });
    });
    const heartbeat = setInterval(() => onProgress(`WAIT pid=${child.pid} elapsed=${Math.round((Date.now() - started) / 1000)}s timeout=${timeout / 1000}s`), heartbeatMs);
    const started = Date.now();
    child.stdout.on('data', chunk => onProgress(String(chunk).trimEnd()));
    child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-32_768); onProgress(String(chunk).trimEnd()); });
  });
}
