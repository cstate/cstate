import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const buildDir = process.env.CSTATE_BUILD_DIR || '/tmp/cstate-v7-build';
const expectedSections = [
  'experiments',
  'release-notes',
  'changelog',
  'roadmap',
  'evals',
  'agent-runs',
  'decisions',
  'research',
];

const data = fs.readFileSync('data/record_sections.yml', 'utf-8');
for (const section of expectedSections) {
  assert.match(data, new RegExp(`section: ${section}`));
}

const adminConfig = fs.readFileSync('exampleSite/static/admin/config.yml', 'utf-8');
assert.match(adminConfig, /recordKind: experiment/);
assert.match(adminConfig, /severityDefault: none/);
assert.match(adminConfig, /pinDefault: false/);
assert.match(adminConfig, /recordSeverityHint/);
assert.match(adminConfig, /recordPinHint/);

const adminIndex = fs.readFileSync('exampleSite/static/admin/index.html', 'utf-8');
assert.match(adminIndex, /name: "recordKind"/);
assert.match(adminIndex, /name: "severity"/);
assert.match(adminIndex, /name: "pin"/);
assert.match(adminIndex, /recordSeverityHint/);
assert.match(adminIndex, /recordPinHint/);

const copiedListPattern = /slice "experiments"|"release-notes" "changelog" "roadmap"/;
const templateFiles = [
  'layouts/partials/index/components.html',
  'layouts/partials/index/tabs.html',
  'layouts/partials/skins/modern/index/tabs.html',
  'layouts/index.json',
  'layouts/records/list.json',
  'layouts/records/list.xml',
  'layouts/records/list.atom.atom',
  'layouts/records/list.html',
  'layouts/partials/records/is-section.html',
];

for (const file of templateFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  assert.doesNotMatch(content, copiedListPattern, `${file} repeats the record section list`);
}

const backLinkTemplates = [
  'layouts/_default/list.html',
  'layouts/_default/single.html',
  'layouts/records/list.html',
  'layouts/issues/single.html',
  'layouts/404.html',
  'layouts/affected/list.html',
];

for (const file of backLinkTemplates) {
  const content = fs.readFileSync(file, 'utf-8');
  assert.doesNotMatch(content, /<em>{{ \.Site\.Title }}<\/em>/, `${file} splits the back-link title into a separate element`);
}

const recordsJsonPath = path.join(buildDir, 'records', 'index.json');
const indexJsonPath = path.join(buildDir, 'index.json');
const affectedApiJsonPath = path.join(buildDir, 'affected', 'api', 'index.json');
const indexHtmlPath = path.join(buildDir, 'index.html');
assert.equal(fs.existsSync(recordsJsonPath), true, `${recordsJsonPath} is missing; run Hugo build first`);
assert.equal(fs.existsSync(indexJsonPath), true, `${indexJsonPath} is missing; run Hugo build first`);
assert.equal(fs.existsSync(affectedApiJsonPath), true, `${affectedApiJsonPath} is missing; run Hugo build first`);
assert.equal(fs.existsSync(indexHtmlPath), true, `${indexHtmlPath} is missing; run Hugo build first`);

const records = JSON.parse(fs.readFileSync(recordsJsonPath, 'utf-8'));
const index = JSON.parse(fs.readFileSync(indexJsonPath, 'utf-8'));
const affectedApi = JSON.parse(fs.readFileSync(affectedApiJsonPath, 'utf-8'));
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

for (const file of listFiles(buildDir).filter((file) => file.endsWith('.json'))) {
  const content = fs.readFileSync(file, 'utf-8');
  assert.doesNotMatch(content, /<no value>/, `${file} should not leak Hugo <no value> placeholders`);
}

assert.deepEqual(records.pages.map((page) => page.recordType), [
  'experiment',
  'release-note',
  'changelog',
  'roadmap',
  'eval-report',
  'agent-run',
  'decision',
  'research-note',
]);
assert.equal(index.records.length, records.pages.length);

for (const category of index.categories || []) {
  if (category.experimentsUrl) {
    assert.match(
      category.experimentsUrl,
      /^https?:\/\//,
      `${category.name} experimentsUrl should be absolute in index.json`
    );
  }
}

for (const system of index.systems || []) {
  assert.equal(
    system.runningExperimentCount,
    (system.experiments || []).filter((experiment) => experiment.state === 'active').length,
    `${system.name} has inconsistent visible running experiment count`
  );

  if (system.experimentsUrl) {
    assert.match(
      system.experimentsUrl,
      /^https?:\/\//,
      `${system.name} experimentsUrl should be absolute in index.json`
    );
  }
}

assert.match(
  affectedApi.experimentsUrl,
  /^https?:\/\//,
  'affected/api experimentsUrl should be absolute in affected API JSON'
);
assert.equal(
  affectedApi.experiments.filter((experiment) => experiment.state === 'active').length,
  affectedApi.runningExperimentCount,
  'affected/api has inconsistent visible running experiment count'
);
assert.equal(
  affectedApi.experiments[0].recordType,
  'experiment',
  'affected/api visible experiment should expose the experiment record type'
);

assert.doesNotMatch(
  indexHtml,
  /https?:\\?\/\\?\/[^'"<>\s]+\\?\/\\?\/affected\//,
  'generated homepage should not contain double-slash affected URLs'
);

const sourceFilesWithoutMissingKeys = [
  'layouts/partials/index/components.html',
  'layouts/affected/list.html',
  'layouts/404.html',
];
for (const file of sourceFilesWithoutMissingKeys) {
  const content = fs.readFileSync(file, 'utf-8');
  assert.doesNotMatch(content, /T "laoding"/, `${file} should use the loading translation key`);
  assert.doesNotMatch(content, /T "thisIsMaintenance"/, `${file} should use the existing notice translation key`);
}

console.log('cstate record-section verification passed.');
