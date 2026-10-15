import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)(process.env.CSTATE_PLAYWRIGHT_MODULE || 'playwright');
const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cstate-review-'));
const site = path.join(temp, 'site');
const output = path.join(temp, 'public');
const failures = [];
let browser;
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const relative = decodeURIComponent(pathname.replace(/^\/status\//, ''));
  const target = path.resolve(output, relative, pathname.endsWith('/') ? 'index.html' : '');
  if (!pathname.startsWith('/status/') || !target.startsWith(output + path.sep) || !fs.existsSync(target)) {
    response.writeHead(404).end(); return;
  }
  const type = { '.html': 'text/html', '.json': 'application/json', '.mjs': 'text/javascript', '.svg': 'image/svg+xml' }[path.extname(target)] || 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(target).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseURL = `http://127.0.0.1:${server.address().port}/status/`;

async function check(name, run) {
  try { await run(); console.log(`PASS ${name}`); }
  catch (error) {
    failures.push(name);
    console.error(`FAIL ${name}: ${error.message.split('\n')[0]}`, { actual: error.actual, expected: error.expected });
  }
}

try {
  fs.cpSync(path.join(root, 'exampleSite'), site, { recursive: true,
    filter: source => !['public', 'themes', '.hugo_build.lock'].includes(path.basename(source)) });
  for (const filename of ['experiments/2026-05-09-search-rollout.md', 'experiments/2099-01-01-future-active.md', 'roadmap/2026-05-06-status-api-v2.md']) {
    const file = path.join(site, 'content', filename);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^state:.*\n/m, ''));
  }
  for (const [slug, date] of [['recent', '2026-10-13'], ['earlier', '2026-10-12']]) {
    fs.writeFileSync(path.join(site, `content/issues/${slug}.md`), `---\ntitle: ${slug} incident\ndate: ${date}T10:00:00Z\nresolved: true\nresolvedWhen: ${date}T11:00:00Z\nseverity: down\naffected: [API]\nsection: issue\n---\n`);
  }
  const overlay = { params: { incidentPostsPerPage: 1, homepageHistoryMode: 'combined', recordSections: [
    { section: 'experiments', recordType: 'experiment', label: 'Product trial', pluralLabel: 'Product trials' },
    { section: 'roadmap', recordType: 'roadmap' },
  ] } };
  function build() {
    fs.writeFileSync(path.join(site, 'review.yml'), JSON.stringify(overlay));
    execFileSync(process.env.HUGO_BIN || 'hugo', ['--source', site, '--config', 'config.yml,review.yml',
      '--themesDir', path.dirname(root), '--theme', path.basename(root), '--baseURL', baseURL,
      '--destination', output, '--cleanDestinationDir'], { stdio: 'pipe' });
  }
  build();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-10-15T12:00:00Z') });
  await page.goto(baseURL);
  if (process.env.CSTATE_SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.CSTATE_SCREENSHOT_DIR, { recursive: true });
    await page.locator('.modern-history-heading').evaluate(element => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: path.join(process.env.CSTATE_SCREENSHOT_DIR, 'review-fixture-desktop.png') });
  }
  const shown = page.locator('[data-history-list] > [data-history-item]:visible');
  await check('limit applies after history type and date filters', async () => {
    assert.equal(await shown.count(), 1);
    await page.locator('.modern-history-filter__summary').click();
    for (const input of await page.locator('[data-history-type-filter]').all()) {
      if (await input.getAttribute('value') !== 'incident') await input.uncheck();
    }
    await page.locator('.modern-history-filter__summary').click();
    assert.equal(await shown.count(), 1, 'incidents beyond the initial limit must be filterable');
    assert.match(await shown.innerText(), /recent incident/);
    await page.locator('[data-history-time-filter]').selectOption('30');
    assert.match(await shown.innerText(), /recent incident/);
    if (process.env.CSTATE_SCREENSHOT_DIR) {
      for (const [size, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
        await page.setViewportSize({ width, height });
        await page.locator('.modern-history-heading').evaluate(element => element.scrollIntoView({ block: 'start' }));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: path.join(process.env.CSTATE_SCREENSHOT_DIR, `history-incidents-${size}.png`) });
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.locator('.modern-history-filter__summary').click();
    await page.getByRole('checkbox', { name: 'Incidents', exact: true }).uncheck();
    assert.equal(await shown.count(), 0);
    assert.equal(await page.locator('[data-history-empty]').isVisible(), true);
    await page.getByRole('checkbox', { name: 'Product trial', exact: true }).check();
    await page.locator('.modern-history-filter__summary').click();
    assert.equal(await shown.count(), 1);
    assert.match(await shown.innerText(), /Future-dated active experiment/);
  });
  await check('omitted active states reach component HTML and JSON', async () => {
    const index = JSON.parse(fs.readFileSync(path.join(output, 'index.json')));
    const api = index.systems.find(system => system.name === 'API');
    assert.equal(api.runningExperimentCount, 1);
    assert.equal(api.experiments[0].state, 'active');
    assert.ok(api.activeRecords.some(record => record.recordType === 'roadmap' && record.state === 'active'));
    const media = index.systems.find(system => system.name === 'Media Proxy');
    assert.equal(media.runningExperimentCount, 0);
    assert.equal(media.startingSoonExperimentCount, 1);
    assert.equal(await page.locator('#system-api .component-record-tag--experiment').count(), 1);
    assert.equal(await page.locator('#system-api .component-record-tag:not(.component-record-tag--experiment)').count(), 1);
    const affected = JSON.parse(fs.readFileSync(path.join(output, 'affected/api/index.json')));
    assert.equal(affected.runningExperimentCount, 1);
  });
  await check('custom record labels survive normalization', async () => {
    await page.goto(baseURL);
    assert.equal(await page.locator('[data-history-list] .record-card__icon').getAttribute('aria-label'), 'Product trial');
    await page.goto(baseURL + 'experiments/2026-05-09-search-rollout/');
    assert.equal((await page.locator('.modern-record-detail__eyebrow').innerText()).trim(), 'Product trial');
    const feed = fs.readFileSync(path.join(output, 'records/index.atom'), 'utf8');
    assert.match(feed, /\[Product trial\]/);
  });
  await check('no-JavaScript history retains its initial display limit', async () => {
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const fallback = await noJS.newPage();
    await fallback.goto(baseURL);
    assert.equal(await fallback.locator('[data-history-list] > [data-history-item]:visible').count(), 1);
    await noJS.close();
  });
  await check('explicit terminal states stay inactive', async () => {
    for (const state of ['completed', 'archived']) {
      fs.writeFileSync(path.join(site, `content/roadmap/${state}.md`), `---\ntitle: ${state} record\ndate: 2020-01-01T10:00:00Z\nstate: ${state}\nseverity: ongoing\naffected: [API]\n---\n`);
    }
    build();
    const api = JSON.parse(fs.readFileSync(path.join(output, 'index.json'))).systems.find(system => system.name === 'API');
    assert.ok(api.activeRecords.every(record => record.state === 'active'));
  });
  await check('default labels still translate when an override omits labels', async () => {
    overlay.defaultContentLanguage = 'lt';
    overlay.locale = 'lt';
    build();
    await page.goto(baseURL);
    assert.equal(await page.locator('[data-history-list] .record-card__icon').getAttribute('aria-label'), 'Product trial');
    delete overlay.params.recordSections[0].label;
    delete overlay.params.recordSections[0].pluralLabel;
    build();
    await page.goto(baseURL);
    assert.equal(await page.locator('[data-history-list] .record-card__icon').getAttribute('aria-label'), 'Eksperimentas');
    await page.locator('.modern-history-filter__summary').click();
    assert.equal(await page.getByRole('checkbox', { name: 'Eksperimentas', exact: true }).count(), 1);
  });
  assert.deepEqual(errors, [], 'browser runtime errors');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
}
assert.equal(failures.length, 0, `${failures.length} review regressions failed: ${failures.join(', ')}`);
