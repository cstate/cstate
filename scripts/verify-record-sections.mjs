import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';

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
const canonicalFixture = JSON.parse(fs.readFileSync('test/fixtures/v7-index.json', 'utf-8'));
const canonicalRecordTypes = [...new Set(canonicalFixture.records.map((record) => record.recordType))].sort();
const decapRecordTypes = [...adminConfig.matchAll(/^    recordType: ([\w-]+)$/gm)].map((match) => match[1]).sort();
const decapRecordKinds = [...adminConfig.matchAll(/^    recordKind: ([\w-]+)$/gm)].map((match) => match[1]).sort();
assert.deepEqual(decapRecordTypes, canonicalRecordTypes, 'Decap record types should match the canonical v7 fixture');
assert.deepEqual(decapRecordKinds, canonicalRecordTypes, 'Decap record kinds should match the canonical v7 fixture');

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

assert.deepEqual([...new Set(records.pages.map((page) => page.recordType))].sort(), [
	'agent-run',
	'changelog',
	'decision',
	'eval-report',
  'experiment',
  'release-note',
  'research-note',
	'roadmap',
].sort());
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
    system.experimentStatus === 'running' ? (system.experiments || []).length : 0,
    `${system.name} has inconsistent visible running experiment count`
  );
  assert.equal(
    system.startingSoonExperimentCount,
    system.experimentStatus === 'starting-soon' ? (system.experiments || []).length : 0,
    `${system.name} has inconsistent scheduled experiment count`
  );

  if (system.experimentsUrl) {
    assert.match(
      system.experimentsUrl,
      /^https?:\/\//,
      `${system.name} experimentsUrl should be absolute in index.json`
    );
  }
}

const mediaProxy = index.systems.find((system) => system.name === 'Media Proxy');
assert.equal(mediaProxy.experimentStatus, 'starting-soon', 'future active experiment should be scheduled');
assert.equal(mediaProxy.runningExperimentCount, 0, 'future active experiment must not count as running');
assert.equal(mediaProxy.startingSoonExperimentCount, 1, 'future active experiment should count as starting soon');
assert.match(indexHtml, /Experiment starting soon/, 'future active experiment should use scheduled UI copy');

assert.match(
  affectedApi.experimentsUrl,
  /^https?:\/\//,
  'affected/api experimentsUrl should be absolute in affected API JSON'
);
assert.equal(
  affectedApi.experimentStatus === 'running' ? affectedApi.experiments.length : 0,
  affectedApi.runningExperimentCount,
  'affected/api has inconsistent visible running experiment count'
);
assert.equal(
  affectedApi.experiments[0].recordType,
  'experiment',
  'affected/api visible experiment should expose the experiment record type'
);
assert.match(
  indexHtml,
  /Search relevance rollout experiment/,
  'generated homepage should show operational records in the history stream'
);
assert.equal(
  indexHtml.match(/Testing a search relevance update with a limited traffic slice\./g)?.length,
  1,
  'the pinned notice should show its summary once without expanding the compact history card'
);
assert.ok(
  indexHtml.indexOf('<section class="modern-operational-records"') < indexHtml.indexOf(' id="system-'),
  'pinned records should appear before components independently of history mode'
);

const combinedHistoryStart = indexHtml.indexOf('modern-incident-list--combined');
const combinedHistoryEnd = indexHtml.indexOf('modern-history-more', combinedHistoryStart);
const combinedHistoryHtml = indexHtml.slice(combinedHistoryStart, combinedHistoryEnd)
  .replace(/<template[^>]*data-history-overflow[^>]*>[\s\S]*?<\/template>/g, '');
assert.equal(
  (combinedHistoryHtml.match(/data-history-item/g) || []).length,
  10,
  'modern combined history should honor incidentPostsPerPage'
);

assert.doesNotMatch(indexHtml, /fonts\.googleapis\.com|fonts\.gstatic\.com/, 'default pages must not request Google Fonts');

const componentsTemplate = fs.readFileSync('layouts/partials/index/components.html', 'utf-8');
const availabilitySource = componentsTemplate.match(
  /\/\/ availability-calculation:start\n([\s\S]*?)\n\s*\/\/ availability-calculation:end/
)?.[1];
assert.ok(availabilitySource, 'availability calculation source markers should be present');
const availabilityContext = {};
vm.runInNewContext(`${availabilitySource}; this.calculateAvailabilityPercentage = calculateAvailabilityPercentage;`, availabilityContext);
const windowStart = new Date('2026-01-01T00:00:00Z');
const windowEnd = new Date('2026-03-02T00:00:00Z');
const oneHourDown = [{ severity: 'down', createdAt: '2026-02-01T00:00:00Z', resolved: true, resolvedAt: '2026-02-01T01:00:00Z' }];
assert.ok(
  Math.abs(availabilityContext.calculateAvailabilityPercentage(oneHourDown, windowStart, windowEnd) - 99.9305555556) < 1e-8,
  'one hour of downtime in 60 days should reduce availability by one hour, not one full day'
);
assert.equal(availabilityContext.calculateAvailabilityPercentage([{...oneHourDown[0], informational:true}], windowStart, windowEnd), 100, 'informational posts must not reduce availability');
const overlappingOutages = [
  ...oneHourDown,
  { severity: 'down', createdAt: '2026-02-01T00:30:00Z', resolved: true, resolvedAt: '2026-02-01T01:30:00Z' },
];
assert.ok(
  Math.abs(availabilityContext.calculateAvailabilityPercentage(overlappingOutages, windowStart, windowEnd) - 99.8958333333) < 1e-8,
  'overlapping downtime must be merged rather than counted twice'
);

const recordsJsonTemplate = fs.readFileSync('layouts/records/list.json', 'utf-8');
assert.match(recordsJsonTemplate, /\.Title \| jsonify/, 'record endpoint titles must use JSON encoding');

const calendarHtml = fs.readFileSync(
  path.join(buildDir, 'issues', '2024-02-24-maintenance-window', 'index.html'),
  'utf-8'
);
assert.doesNotMatch(calendarHtml, /const eventDescription = "\\"/, 'calendar descriptions must not be JSON encoded twice');
assert.match(calendarHtml, /function escapeICSText/, 'calendar fields must be escaped for ICS text values');

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
