import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const { chromium, webkit } = createRequire(import.meta.url)(process.env.CSTATE_PLAYWRIGHT_MODULE || 'playwright');
const root = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cstate-timestamps-'));
const site = path.join(temp, 'site'), output = path.join(temp, 'public');
const format = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/;
const source = fs.readFileSync('layouts/partials/index/components.html', 'utf8').match(/\/\/ availability-calculation:start\n([\s\S]*?)\n\s*\/\/ availability-calculation:end/)[1];
const files = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
function checkDates(value) {
  if (Array.isArray(value)) value.forEach(checkDates);
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) {
    if (['createdAt', 'lastMod', 'resolvedAt'].includes(key) && item !== '') assert.match(item, format, key);
    else checkDates(item);
  }
}
try {
  fs.cpSync(path.join(root, 'exampleSite'), site, { recursive: true, filter: file => !['public', 'themes', 'output', 'resources', '.hugo_build.lock'].includes(path.basename(file)) });
  fs.rmSync(path.join(site, 'content/issues'), { recursive: true, force: true });
  fs.mkdirSync(path.join(site, 'content/issues'));
  fs.writeFileSync(path.join(site, 'content/issues/_index.md'), '---\ntitle: Incidents\n---\n');
  for (const [slug, fields] of [
    ['one-hour', { date: '2026-01-02T10:00:00Z', resolvedWhen: '2026-01-02 11:00:00', severity: 'down', resolved: true }],
    ['open', { date: '2026-01-03T10:00:00Z', severity: 'notice', resolved: false }],
    ['maintenance', { date: '2026-01-05 10:00:00', resolvedWhen: '2026-01-05 11:00:00', severity: 'notice', resolved: true }],
    ['information', { date: '2026-01-04T10:00:00+02:00', resolvedWhen: '2026-01-04T11:00:00+02:00', severity: 'down', informational: true, pin: true, resolved: true }],
  ]) fs.writeFileSync(path.join(site, `content/issues/${slug}.md`), `---\n${JSON.stringify({ title: slug, section: 'issue', affected: ['API'], ...fields })}\n---\nAn incident update.\n`);
  for (const skin of ['modern', 'classic']) {
    fs.writeFileSync(path.join(site, 'timestamps.yml'), JSON.stringify({ params: { skin } }));
    execFileSync(process.env.HUGO_BIN || 'hugo', ['--source', site, '--config', 'config.yml,timestamps.yml', '--themesDir', path.dirname(root), '--theme', path.basename(root), '--destination', output, '--cleanDestinationDir'], { stdio: 'pipe' });
    for (const file of files(output).filter(file => file.endsWith('.json'))) checkDates(JSON.parse(fs.readFileSync(file, 'utf8')));
    const incident = JSON.parse(fs.readFileSync(path.join(output, 'issues/one-hour/index.json'), 'utf8'));
    assert.equal(incident.createdAt, '2026-01-02T10:00:00Z');
    assert.equal(incident.resolvedAt, '2026-01-02T11:00:00Z');
    const information = JSON.parse(fs.readFileSync(path.join(output, 'issues/information/index.json'), 'utf8'));
    assert.equal(information.createdAt, '2026-01-04T10:00:00+02:00');
    assert.equal(information.resolvedAt, '2026-01-04T11:00:00+02:00');
    assert.equal(JSON.parse(fs.readFileSync(path.join(output, 'issues/open/index.json'), 'utf8')).resolvedAt, '');
    const calendar = fs.readFileSync(path.join(output, 'issues/maintenance/index.html'), 'utf8');
    assert.equal(calendar.match(/const endDateRaw = ([^;]+);/)?.[1], '"2026-01-05T11:00:00Z"');
    const incidents = JSON.parse(fs.readFileSync(path.join(output, 'affected/api/index.json'), 'utf8')).pages.filter(page => page.is === 'issue');
    for (const [engine, browserType] of Object.entries({ chromium, webkit })) {
      const browser = await browserType.launch({ headless: true });
      try {
        const page = await browser.newPage();
        const result = await page.evaluate(({ source, incidents }) => {
          const calculate = new Function(source + '; return calculateAvailabilityPercentage;')();
          return { validDates: incidents.every(incident => Number.isFinite(Date.parse(incident.createdAt)) && (!incident.resolvedAt || Number.isFinite(Date.parse(incident.resolvedAt)))), availability: calculate(incidents, new Date('2026-01-01T00:00:00Z'), new Date('2026-03-02T00:00:00Z')) };
        }, { source, incidents });
        assert.equal(result.validDates, true);
        assert.ok(Math.abs(result.availability - 99.9305555556) < 1e-8, `${skin}/${engine}: ${result.availability}`);
        console.log(`PASS ${skin}/${engine}: generated API timestamps, legacy resolution time, and one-hour availability.`);
      } finally { await browser.close(); }
    }
  }
  fs.writeFileSync(path.join(site, 'timestamps.yml'), JSON.stringify({ timeZone: 'Europe/Vilnius' }));
  execFileSync(process.env.HUGO_BIN || 'hugo', ['--source', site, '--config', 'config.yml,timestamps.yml', '--themesDir', path.dirname(root), '--theme', path.basename(root), '--destination', output, '--cleanDestinationDir'], { stdio: 'pipe' });
  const local = JSON.parse(fs.readFileSync(path.join(output, 'issues/maintenance/index.json'), 'utf8'));
  assert.equal(local.createdAt, '2026-01-05T10:00:00+02:00');
  assert.equal(local.resolvedAt, '2026-01-05T11:00:00+02:00');
  console.log('PASS legacy dates respect the configured Hugo timezone; explicit offsets and empty resolutions are preserved.');
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
