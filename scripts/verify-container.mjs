import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const image = process.argv[2] || 'cstate:local';
const platform = process.argv[3] || 'linux/arm64';
const suffix = randomUUID().slice(0, 8);
const name = `cstate-verify-${suffix}`;
const volume = `${name}-site`;
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
const pause = () => new Promise(resolve => setTimeout(resolve, 300));
async function ready() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { return JSON.parse(docker('exec', name, 'wget', '-qO-', 'http://127.0.0.1/index.json')); }
    catch { if (docker('inspect', '-f', '{{.State.Running}}', name).trim() !== 'true') throw new Error(docker('logs', name)); await pause(); }
  }
  throw new Error('Container failed to serve JSON within 30 seconds.');
}
function start() {
  docker('run', '-d', '--name', name, '--platform', platform, '-v', `${volume}:/app`,
    '-e', 'CSTATE_BASE_URL=https://status.example/status/', image);
}
function put(file, content) {
  execFileSync('docker', ['exec', '-i', name, 'sh', '-c', 'cat > "$1"', 'sh', file], { input: content, timeout: 10000 });
}
try {
  docker('volume', 'create', volume);
  start();
  let payload = await ready();
  assert.equal(payload.cStateVersion, '7.0.0-r1');
  assert.match(payload.baseURL, /\/status\/$/);
  assert.match(docker('exec', name, 'wget', '-qO-', 'http://127.0.0.1/index.html'), /https:\/\/status.example\/status\/index.atom/);
  for (const module of ['admin/record-backend.mjs', 'cstate-status-tool.mjs']) {
    const headers = docker('exec', name, 'sh', '-c', 'wget -S --spider "$1" 2>&1', 'sh', `http://127.0.0.1/${module}`);
    assert.match(headers, /Content-Type: (?:application|text)\/javascript/i, `${module} must load as a browser module`);
  }
  put('/app/content/issues/container-check.md', '---\ntitle: Container persistence check\ndate: 2026-01-01T00:00:00Z\nsection: issue\nresolved: true\nseverity: notice\n---\nPersisted content.\n');
  docker('restart', name); await ready();
  assert.match(docker('exec', name, 'wget', '-qO-', 'http://127.0.0.1/issues/container-check/index.html'), /Container persistence check/);
  docker('exec', name, 'rm', '/app/content/issues/container-check.md');
  docker('restart', name); await ready();
  assert.throws(() => docker('exec', name, 'wget', '-qO-', 'http://127.0.0.1/issues/container-check/index.html'));
  put('/app/config.yml', 'params: [unterminated');
  docker('restart', name);
  for (let attempt = 0; attempt < 100; attempt++) {
    if (docker('inspect', '-f', '{{.State.Running}}', name).trim() === 'false') break;
    await pause();
  }
  assert.equal(docker('inspect', '-f', '{{.State.Running}}', name).trim(), 'false', 'NGINX must not serve stale pages after a failed build');
  assert.notEqual(docker('inspect', '-f', '{{.State.ExitCode}}', name).trim(), '0');
  console.log(`PASS ${platform}: first boot, mounted-site persistence, subdirectory URLs, removed-page cleanup, failed-build shutdown`);
} finally {
  try { docker('rm', '-f', name); } catch {}
  try { docker('volume', 'rm', volume); } catch {}
}
