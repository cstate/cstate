import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { installRecordBackend } from '../exampleSite/static/admin/record-backend.mjs';

// Install these pinned test-only parsers into a temporary prefix; production
// uses js-yaml's browser build and lazily imports smol-toml for TOML files.
const require = createRequire(process.env.CSTATE_ADMIN_TEST_MODULES
  ? path.resolve(process.env.CSTATE_ADMIN_TEST_MODULES, 'package.json') : import.meta.url);
const yaml = require('js-yaml');
const toml = require('smol-toml');
const config = yaml.load(fs.readFileSync('exampleSite/static/admin/config.yml', 'utf8'));
const sections = config.record_sections;
const index = fs.readFileSync('exampleSite/static/admin/index.html', 'utf8');
assert.match(index, /js-yaml@4\.3\.2/);
assert.match(index, /installRecordBackend\(CMS, config, recordSections/);
assert.match(index, /filter: \{ field: "recordType", value: recordType \}/);

const body = '\nMarkdown body with --- and +++ inline, $&, and { braces }.\n';
const cursorSymbol = Symbol('cursor-compatibility');
const cursor = Object.freeze({ page: 1, next: 'next-page' });
function raw(section, filename = 'record.md', metadata = 'title: Record\n') {
  return Object.freeze({
    file: Object.freeze({ path: 'content/' + section + '/' + filename, id: 'sha', author: 'author', updatedOn: '2026-01-01' }),
    data: '---\n' + metadata + '---\n' + body,
  });
}
function dataOf(entry) {
  const source = entry.data;
  if (source.startsWith('+++')) return toml.parse(source.split('+++')[1]);
  if (source.startsWith('{')) return JSON.parse(source.slice(0, -body.length).trim());
  return yaml.load(source.split(/^---[ \t]*\r?$/m)[1]);
}

function setup(name, entries, configOverride = {}) {
  const calls = [];
  class Backend {
    constructor(...args) { this.args = args; this.calls = calls; }
    entriesByFolder(...args) { this.calls.push(['folder', this, args]); return Promise.resolve(entries); }
    allEntriesByFolder(...args) { this.calls.push(['all', this, args]); return Promise.resolve(entries); }
    entriesByFiles(...args) { this.calls.push(['files', this, args]); return Promise.resolve(entries); }
    traverseCursor(...args) { this.calls.push(['cursor', this, args]); return Promise.resolve({ entries, cursor, provider: name }); }
    getEntry(filePath) {
      return Promise.resolve(entries.find((entry) => entry.file.path === filePath) || { file: { path: filePath }, data: '' });
    }
    persistEntry(...args) { this.calls.push(['save', this, args]); return Promise.resolve('saved'); }
    authenticate() { return Promise.resolve('unchanged authentication'); }
  }
  const registrations = Object.fromEntries([name, 'proxy'].map((backendName) => [backendName, {
    init: (...args) => new Backend(...args), BackendClass: Backend,
  }]));
  const CMS = { getBackend: (backendName) => registrations[backendName] };
  const localConfig = { backend: { name }, local_backend: true, ...configOverride };
  const before = structuredClone(localConfig);
  installRecordBackend(CMS, localConfig, sections, { yaml, loadToml: async () => toml });
  assert.deepEqual(localConfig, before, 'backend config must remain unchanged');
  const init = registrations[name].init;
  installRecordBackend(CMS, localConfig, sections, { yaml, loadToml: async () => toml });
  assert.equal(registrations[name].init, init, 'installation must be idempotent');
  return { calls, Backend, registrations, localConfig };
}

for (const provider of ['git-gateway', 'github', 'gitlab', 'bitbucket', 'azure', 'gitea', 'test-repo', 'custom-provider']) {
  const records = sections.map((section) => raw(section.section));
  records.unshift(raw('experiments', '_index.md'), raw('roadmap', '_index.lt.md'));
  const wrong = raw('experiments', 'wrong.md', 'title: Wrong\nrecordType: decision\n');
  records.push(wrong);
  Object.defineProperty(records, cursorSymbol, { value: cursor, enumerable: false });
  Object.defineProperty(records, 'providerMetadata', { value: provider });
  Object.freeze(records);
  const { registrations, calls, Backend, localConfig } = setup(provider, records);
  const options = { useWorkflow: true, updateUserCredentials() {} };
  const backend = registrations[provider].init(localConfig, options);
  assert.ok(backend instanceof Backend);
  assert.equal(registrations[provider].BackendClass, Backend);
  assert.equal(backend.args[0], localConfig);
  assert.equal(backend.args[1], options);
  assert.equal(backend.persistEntry, Backend.prototype.persistEntry, 'normal save path must remain untouched');
  assert.equal(await backend.authenticate(), 'unchanged authentication');
  const args = ['content/experiments', 'md', 2, /record/];
  for (const method of ['entriesByFolder', 'allEntriesByFolder']) {
    const listed = await backend[method](...args);
    assert.equal(listed[cursorSymbol], cursor, 'pagination symbol must survive filtering');
    assert.equal(Object.getOwnPropertyDescriptor(listed, cursorSymbol).enumerable, false);
    assert.equal(listed.providerMetadata, provider);
    assert.equal(listed.some((entry) => /\/_index\./.test(entry.file.path)), false);
    assert.equal(listed.at(-1), wrong, 'explicit foreign types stay intact for the native collection filter');
    for (const section of sections) {
      const entry = listed.find((item) => item.file.path === 'content/' + section.section + '/record.md');
      const data = dataOf(entry);
      assert.equal(data.recordType, section.recordType);
      assert.equal(data.state, ['experiment', 'roadmap'].includes(section.recordType) ? 'active' : 'completed');
      assert.equal(data.severity, 'none', 'required editor fields need the same default as new records');
      assert.ok(entry.data.endsWith(body));
      assert.equal(entry.file, records.find((item) => item.file.path === entry.file.path).file);
      assert.match(records.find((item) => item.file.path === entry.file.path).data, /^---\ntitle:/, 'listing must not mutate original raw data');
    }
    assert.deepEqual(calls.at(-1)[2], args);
    assert.equal(calls.at(-1)[1], backend);
  }
  const next = await backend.traverseCursor(cursor, 'next');
  assert.equal(next.cursor, cursor);
  assert.equal(next.provider, provider);
  assert.equal(next.entries[cursorSymbol], cursor);
  assert.equal(dataOf(next.entries[0]).recordType, 'experiment', 'subsequent pages must also infer type');
  const indexEntries = await backend.entriesByFiles([{ path: 'content/experiments/_index.md' }]);
  assert.equal(indexEntries[0], records[0], 'record-pages file collection must retain index pages unchanged');
  assert.equal(await backend.getEntry(records[0].file.path), records[0], 'index-page editing stays unchanged');
  assert.equal((await backend.getEntry('content/experiments/missing.md')).data, '', 'missing-file checks must remain false');
  const edited = await backend.getEntry('content/experiments/record.md');
  assert.equal(dataOf(edited).recordType, 'experiment', 'normal editor load must receive defaults');
  assert.equal(calls.some(([operation]) => operation === 'save'), false, 'reads must never persist metadata');
  assert.equal(await backend.persistEntry(edited, { commitMessage: 'save' }), 'saved');
  assert.equal(calls.at(-1)[2][0], edited, 'explicit user save uses the existing provider');
  const local = registrations.proxy.init(localConfig, options);
  assert.equal(dataOf((await local.entriesByFolder())[0]).recordType, 'experiment', 'local_backend proxy gets the same adapter');
}

const examples = [
  ['---\ntitle: Legacy\nseverity: ongoing\n---\n' + body, 'active'],
  ['---\ntitle: Done\nseverity: ongoing\nstate: archived\n---\n' + body, 'archived'],
  ['---\nrecordType: null\nstate: ""\ntitle: Empty\n---\n' + body, 'active'],
  ['---\n{"title":"JSON in YAML","extra":{"preserved":true}}\n---\n' + body, 'active'],
  ['+++\ntitle = "TOML"\n[extra]\npreserved = true\n+++\n' + body, 'active'],
  ['+++\n"recordType" = ""\n\'state\' = ""\n+++\n' + body, 'active'],
  ['{\n"title":"JSON", "extra":{"preserved":true}\n}\n' + body, 'active'],
  ['A record without frontmatter.\n' + body, 'active'],
];
for (const [source, state] of examples) {
  const entry = { file: { path: 'content/experiments/format.md' }, data: source };
  const { registrations } = setup('github', [entry]);
  const transformed = await registrations.github.init().getEntry(entry.file.path);
  const data = dataOf(transformed);
  assert.equal(data.recordType, 'experiment');
  assert.equal(data.state, state);
  if (source.includes('preserved')) assert.equal(data.extra.preserved, true);
  assert.ok(transformed.data.endsWith(body));
  assert.equal(entry.data, source);
}

for (const source of ['---\ntitle: [invalid\n---\nBody', '---\ntitle: Missing closing delimiter', '---\n- not a map\n---\nBody']) {
  const entry = { file: { path: 'content/experiments/broken.md' }, data: source };
  const { registrations } = setup('github', [entry]);
  await assert.rejects(registrations.github.init().entriesByFolder(), /Could not read content\/experiments\/broken\.md/);
  assert.equal(entry.data, source);
}

const unrelated = raw('pages', '_index.md');
const { registrations } = setup('github', [unrelated]);
assert.equal((await registrations.github.init().entriesByFolder())[0], unrelated, 'unrelated collections remain unchanged');
console.log('Decap admin verification passed: all eight record types; configured/local providers; cursors, edit/save, index pages, YAML/TOML/JSON, and malformed frontmatter.');
