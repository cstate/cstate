import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Optional proof using cached upstream browser assets. Every browser request is
// intercepted; even the normal CMS Publish button only updates this memory map.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.CSTATE_PLAYWRIGHT_MODULE || 'playwright');
const parsers = createRequire(process.env.CSTATE_ADMIN_TEST_MODULES
  ? path.resolve(process.env.CSTATE_ADMIN_TEST_MODULES, 'package.json') : import.meta.url);
const yaml = parsers('js-yaml');
const project = fileURLToPath(new URL('../', import.meta.url));
const admin = path.join(project, 'exampleSite/static/admin');
const config = yaml.load(await fs.readFile(path.join(admin, 'config.yml'), 'utf8'));
config.backend = { name: 'proxy', proxy_url: 'http://127.0.0.1:8081/api/v1' };
config.local_backend = false;
config.admin_locale = 'en';
config.logo_url = 'http://localhost:1313/admin/test-logo.svg';
assert.ok(process.env.CSTATE_ADMIN_CMS_BUNDLE, 'Set CSTATE_ADMIN_CMS_BUNDLE to a cached decap-cms.js bundle');
assert.ok(process.env.CSTATE_ADMIN_YAML_BROWSER, 'Set CSTATE_ADMIN_YAML_BROWSER to the pinned js-yaml browser build');
const assets = {
  'http://localhost:1313/admin/': ['text/html', await fs.readFile(path.join(admin, 'index.html'), 'utf8')],
  'http://localhost:1313/admin/config.yml': ['text/yaml', yaml.dump(config)],
  'http://localhost:1313/admin/record-backend.mjs': ['text/javascript', await fs.readFile(path.join(admin, 'record-backend.mjs'), 'utf8')],
  'http://localhost:1313/admin/test-logo.svg': ['image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg"/>'],
  'https://unpkg.com/js-yaml@4.3.2/dist/js-yaml.min.js': ['text/javascript', await fs.readFile(process.env.CSTATE_ADMIN_YAML_BROWSER, 'utf8')],
  'https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js': ['text/javascript', await fs.readFile(process.env.CSTATE_ADMIN_CMS_BUNDLE, 'utf8')],
};
const records = new Map([
  ['content/experiments/_index.md', '---\ntitle: Experiment index\n---\nIndex body'],
  ['content/experiments/legacy.md', '---\ntitle: Untyped YAML record\ndate: 2026-01-01T00:00:00Z\ncustom: {keep: true}\n---\nYAML body'],
  ['content/experiments/foreign.md', '---\ntitle: Wrong explicit type\nrecordType: decision\n---\nWrong body'],
  ['content/experiments/toml.md', '+++\ntitle = "Untyped TOML record"\ndate = 2026-01-01T00:00:00Z\n[custom]\nkeep = true\n+++\nTOML body'],
  ['content/experiments/json.md', '{\n"title":"Untyped JSON record", "date":"2026-01-01T00:00:00Z", "custom":{"keep":true}\n}\nJSON body'],
]);
const original = new Map(records);
const writes = [];
const requests = [];
const errors = [];
const entry = (filePath, label) => ({ file: { path: filePath, id: 'fixture-sha', label }, data: records.get(filePath) || '' });
const browser = await chromium.launch({ headless: true });
let page;
try {
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = decodeURI(route.request().url());
    if (assets[url]) return route.fulfill({ body: assets[url][1], contentType: assets[url][0], headers: { 'Access-Control-Allow-Origin': '*' } });
    if (url.startsWith('https://unpkg.com/smol-toml@1.9.1/dist/')) {
      const modulePath = parsers.resolve('smol-toml');
      const filename = new URL(url).pathname.split('/').pop();
      return route.fulfill({ body: await fs.readFile(path.join(path.dirname(modulePath), filename), 'utf8'), contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    if (url !== config.backend.proxy_url) return route.abort();
    const request = route.request().postDataJSON();
    requests.push(request);
    let response = [];
    if (request.action === 'entriesByFolder') response = [...records.keys()].filter((filePath) => filePath.startsWith(request.params.folder + '/')).map((filePath) => entry(filePath));
    if (request.action === 'entriesByFiles') {
      // Make the asynchronous file-list load visible: sidebar navigation must
      // not be mistaken for a similarly named entry before this resolves.
      await new Promise((resolve) => setTimeout(resolve, 150));
      response = request.params.files.map((file) => entry(file.path, file.label));
    }
    if (request.action === 'getEntry') response = entry(request.params.path);
    if (request.action === 'persistEntry') {
      writes.push(request);
      request.params.dataFiles.forEach((file) => records.set(file.path, file.raw));
      response = {};
    }
    return route.fulfill({ json: response, headers: { 'Access-Control-Allow-Origin': '*' } });
  });

  await page.goto('http://localhost:1313/admin/');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.getByRole('link', { name: 'Experiments', exact: true }).click();
  await page.getByRole('link', { name: 'Untyped YAML record', exact: true }).waitFor();
  for (const format of ['YAML', 'TOML', 'JSON']) assert.equal(await page.getByRole('link', { name: 'Untyped ' + format + ' record', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Wrong explicit type', exact: true }).count(), 0);
  assert.equal(await page.getByRole('link', { name: 'Experiment index', exact: true }).count(), 0);
  assert.equal(writes.length, 0, 'listing and default inference must not write');
  assert.deepEqual(records, original);

  async function publish() {
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByText('Publish now', { exact: true }).click();
    await page.getByRole('button', { name: 'Published', exact: true }).waitFor();
  }

  for (const [index, [id, format]] of [['legacy', 'YAML'], ['toml', 'TOML'], ['json', 'JSON']].entries()) {
    await page.getByRole('link', { name: 'Untyped ' + format + ' record', exact: true }).click();
    const title = page.locator('input[id^="title-field-"]');
    await title.waitFor();
    assert.equal(writes.length, index, 'loading the editor must not write');
    await title.fill('Edited ' + format + ' record');
    await publish();
    assert.equal(writes.length, index + 1);
    const file = writes.at(-1).params.dataFiles[0];
    assert.equal(file.path, 'content/experiments/' + id + '.md');
    // Decap's existing default save format is YAML, including inferred TOML/JSON
    // collections; the adapter does not replace its native save formatter.
    const saved = yaml.load(file.raw.split(/^---[ \t]*$/m)[1]);
    assert.equal(saved.recordType, 'experiment');
    assert.equal(saved.state, 'active');
    assert.equal(saved.severity, 'none');
    assert.equal(saved.custom.keep, true);
    assert.equal(saved.title, 'Edited ' + format + ' record');
    assert.ok(file.raw.trimEnd().endsWith(format + ' body'));
    await page.getByRole('link', { name: /Writing in Experiments collection/ }).click();
    await page.getByRole('link', { name: 'Record Index Pages', exact: true }).waitFor();
  }

  await page.getByRole('link', { name: 'Record Index Pages', exact: true }).click();
  await page.locator('a[href$="/collections/record-pages/entries/experiments"]').click();
  const indexTitle = page.locator('input[id^="title-field-"]');
  await indexTitle.waitFor();
  assert.equal(await indexTitle.inputValue(), 'Experiment index');
  assert.equal(records.get('content/experiments/_index.md'), original.get('content/experiments/_index.md'));
  await indexTitle.fill('Updated experiment index');
  await publish();
  const indexFile = writes.at(-1).params.dataFiles[0];
  assert.equal(indexFile.path, 'content/experiments/_index.md');
  const indexData = yaml.load(indexFile.raw.split(/^---[ \t]*$/m)[1]);
  assert.equal(indexData.recordType, undefined);
  assert.equal(indexData.state, undefined);
  assert.equal(indexData.severity, undefined);
  assert.ok(indexFile.raw.trimEnd().endsWith('Index body'));
  assert.deepEqual(errors, []);
  if (process.env.CSTATE_ADMIN_SCREENSHOT) await page.screenshot({ path: process.env.CSTATE_ADMIN_SCREENSHOT, fullPage: true });
  console.log('Real Decap browser proof passed: untyped YAML/TOML/JSON list and save at original paths; foreign types/index excluded; explicit index-page editing works; no listing writes.');
} catch (error) {
  const failure = process.env.CSTATE_ADMIN_SCREENSHOT
    ? process.env.CSTATE_ADMIN_SCREENSHOT.replace(/\.png$/i, '') + '-failure'
    : path.join(tmpdir(), 'cstate-admin-browser-failure');
  try {
    await fs.mkdir(path.dirname(failure), { recursive: true });
    await page.screenshot({ path: failure + '.png', fullPage: true });
    await fs.writeFile(failure + '.html', await page.content());
    await fs.writeFile(failure + '.json', JSON.stringify({
      error: error.message,
      url: page.url(),
      body: await page.locator('body').innerText(),
      links: await page.locator('a').evaluateAll((links) => links.map((link) => ({ text: link.textContent, href: link.getAttribute('href') }))),
      errors, requests, writes,
    }, null, 2));
    console.error('Decap browser failure diagnostics saved to ' + failure + '.{png,html,json}');
  } catch (diagnosticError) {
    console.error('Could not capture Decap browser diagnostics: ' + diagnosticError.message);
  }
  throw error;
} finally {
  await browser.close();
}
