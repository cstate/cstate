import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const buildDir = process.env.CSTATE_BUILD_DIR || '/tmp/cstate-v7-build';
const fixturePath = process.env.CSTATE_V7_FIXTURE || path.join('test', 'fixtures', 'v7-index.json');
const generatedPath = path.join(buildDir, 'index.json');

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
const generated = JSON.parse(fs.readFileSync(generatedPath, 'utf-8'));

function assertIndexContract(payload, label) {
  assert.equal(payload.is, 'index', `${label} should identify the index endpoint`);
  assert.equal(payload.cStateVersion, '7.0', `${label} should expose cStateVersion`);
  assert.equal(payload.apiVersion, '2.1', `${label} should expose apiVersion`);
  assert.match(payload.summaryStatus, /^(ok|notice|disrupted|down)$/, `${label} has invalid summaryStatus`);
  assert.equal(Array.isArray(payload.records), true, `${label} should expose records`);
  assert.equal(Array.isArray(payload.systems), true, `${label} should expose systems`);

  const experiment = payload.records.find((record) => record.recordType === 'experiment');
  assert.ok(experiment, `${label} should include an experiment record`);
  assert.equal(experiment.is, 'experiment', `${label} experiment should expose is`);
  assert.equal(experiment.kind, 'experiment', `${label} experiment should expose kind`);
  assert.match(experiment.state, /^(active|completed|archived)$/, `${label} experiment has invalid state`);
  assert.match(experiment.statusImpact, /^(none|notice|disrupted|down)$/, `${label} experiment has invalid statusImpact`);
  assert.equal(typeof experiment.pin, 'boolean', `${label} experiment pin should be boolean`);
  assert.equal(Array.isArray(experiment.affected), true, `${label} experiment affected should be an array`);
  assert.equal(typeof experiment.summary, 'string', `${label} experiment should expose summary`);

  const system = payload.systems.find((entry) => entry.experimentStatus && entry.experimentStatus !== 'none');
  assert.ok(system, `${label} should include a system with experiment context`);
  assert.equal(Array.isArray(system.experiments), true, `${label} system experiments should be an array`);
  assert.equal(
    system.runningExperimentCount,
    system.experiments.filter((experiment) => experiment.state === 'active').length,
    `${label} runningExperimentCount should match active experiments`
  );
}

assertIndexContract(fixture, 'v7 fixture');
assertIndexContract(generated, 'generated index');

const generatedExperiment = generated.records.find((record) => record.recordType === 'experiment');
assert.equal(generatedExperiment.pin, true, 'generated example experiment should exercise pinned records');
assert.equal(generatedExperiment.statusImpact, 'notice', 'generated example experiment should exercise notice impact');

console.log('cstate v7 API contract verification passed.');
