import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { containerReleasePolicy } from './container-release-policy.mjs';

for (const tag_name of ['7.0', 'v7.0', '7.0.0']) {
  assert.deepEqual(containerReleasePolicy({ tag_name }).tags, ['7.0.0', '7.0', '7', 'latest']);
  assert.deepEqual(containerReleasePolicy({ tag_name, prerelease: true }).tags, ['7.0.0']);
}
for (const prerelease of [false, true]) {
  assert.deepEqual(containerReleasePolicy({ tag_name: 'v7.1-beta.2', prerelease }).tags, ['7.1.0-beta.2']);
  const r1 = containerReleasePolicy({ tag_name: 'v7-r1', prerelease });
  assert.equal(r1.version, '7.0.0-r1');
  assert.equal(r1.stable, false);
  assert.deepEqual(r1.tags, ['7.0.0-r1', 'v7-r1']);
}
assert.deepEqual(containerReleasePolicy({ tag_name: '7.2.3+build.4' }).tags, ['7.2.3_build.4', '7.2', '7', 'latest']);
for (const tag_name of ['6.0.2', 'v8.0.0', '7.01.0', '7.1.00', '7.1.0-beta.01', '7.0\nlatest', 'v7-r0', 'v7-r01', 'v7-r1\nlatest']) assert.throws(() => containerReleasePolicy({ tag_name }));
assert.throws(() => containerReleasePolicy({ tag_name: '7.0', draft: true }));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'cstate-release-policy-'));
try {
  const event = path.join(temporary, 'event.json'), output = path.join(temporary, 'output');
  fs.writeFileSync(event, JSON.stringify({ release: { tag_name: '7.0', prerelease: true } }));
  execFileSync(process.execPath, ['scripts/container-release-policy.mjs'], { env: { ...process.env, GITHUB_EVENT_PATH: event, GITHUB_OUTPUT: output } });
  const policy = fs.readFileSync(output, 'utf8');
  assert.match(policy, /stable=false/);
  assert.match(policy, /type=raw,value=7\.0\.0\n/);
  assert.doesNotMatch(policy, /value=(?:7|7\.0|latest)\n/);
  const workflow = fs.readFileSync('.github/workflows/container.yml', 'utf8');
  assert.match(workflow, /node scripts\/container-release-policy\.mjs/);
  assert.match(workflow, /flavor: latest=false/);
  assert.match(workflow, /startsWith\(github\.event\.release\.tag_name, 'v7-r'\)/);
  assert.match(workflow, /tags: \$\{\{ steps\.version\.outputs\.tags \}\}/);
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
console.log('Container release policy passed: GitHub prereleases and semver prereleases never receive stable aliases.');
