import assert from 'node:assert/strict';
import { buildIncident, createEditorURL } from '../static/cstate-status-tool.mjs';

const input = { title: 'API "read": retry \\ 测试', date: '2026-10-15T10:30:00+03:00',
  details: 'Investigating.\n\nUpdate: connectivity restored.', affected: ['API "primary"', 'Media Proxy'], severity: 'down' };
const result = buildIncident(input);
const metadata = Object.fromEntries(result.markdown.split('\n---\n')[0].split('\n').slice(1).filter(line => /^[a-zA-Z]+: /.test(line)).map(line => {
  const separator = line.indexOf(': '); return [line.slice(0, separator), JSON.parse(line.slice(separator + 2))];
}));
assert.equal(metadata.title, input.title);
assert.deepEqual(metadata.affected, input.affected);
assert.equal(metadata.date, '2026-10-15T07:30:00.000Z');
assert.equal(metadata.resolved, false);
assert.equal(metadata.pin, true);
assert.match(result.filename, /^2026-10-15-07-30-00-api-read-retry/);
assert.ok(result.markdown.endsWith(input.details + '\n'));
assert.throws(() => buildIncident({ ...input, resolved: true }), /Resolution time/);
assert.throws(() => buildIncident({ ...input, resolved: true, resolvedWhen: '2020-01-01' }), /Resolution time/);
assert.throws(() => buildIncident({ ...input, severity: 'made-up' }), /severity/);
const resolved = buildIncident({ ...input, resolved: true, resolvedWhen: '2026-10-15T09:00:00Z' });
assert.match(resolved.markdown, /resolvedWhen: "2026-10-15T09:00:00.000Z"/);
for (const provider of ['github', 'gitlab']) {
  const url = new URL(createEditorURL({ repository: 'https://git.example/team/status.git/', provider, branch: 'release/v7', ...result }));
  assert.equal(url.searchParams.get(provider === 'github' ? 'value' : 'content'), result.markdown);
  assert.equal(url.searchParams.get(provider === 'github' ? 'filename' : 'file_name'), `content/issues/${result.filename}`);
  assert.match(url.pathname, /release%2Fv7$/);
}
assert.throws(() => createEditorURL({ repository: 'javascript:alert(1)', ...result }), /HTTP/);
assert.throws(() => createEditorURL({ repository: 'https://git.example/site', ...result, filename: '../../outside.md' }), /filename/);
console.log('cstate status tool verification passed.');
