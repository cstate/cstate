import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Build real Hugo output from isolated content; never alter the user's site.
const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cstate-regressions-'));
const site = path.join(temp, 'site');
const output = path.join(temp, 'public');
const hugo = process.env.HUGO_BIN || 'hugo';
const failures = [];
function check(name, test) {
  try { test(); console.log(`PASS ${name}`); }
  catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message.split("\n")[0]}`); }
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
try {
  fs.cpSync(path.join(root, 'exampleSite'), site, { recursive: true,
    filter: source => !['public', 'themes', '.hugo_build.lock'].includes(path.basename(source)) });
  fs.rmSync(path.join(site, 'content/issues'), { recursive: true, force: true });
  fs.mkdirSync(path.join(site, 'content/issues'), { recursive: true });
  const title = 'API "read" requests \\ retry — 测试';
  const year = new Date().getUTCFullYear();
  for (let i = 0; i < 7; i++) {
    const date = `${i === 6 ? year - 2 : year}-01-0${i === 6 ? 2 : i + 2}T10:00:00Z`;
    fs.writeFileSync(path.join(site, `content/issues/regression-${i}.md`),
      `---\n${JSON.stringify({ title: i === 0 ? title : `Regression ${i}`, date,
        resolved: true, resolvedWhen: date.replace('10:00', '11:30'), severity: 'down',
        affected: ['API'], section: 'issue' })}\n---\nStatus update.\n`);
  }
  fs.writeFileSync(path.join(site, 'content/issues/_index.md'), '---\ntitle: Incidents\n---\n');
  const overlay = { title: 'Status "team" \\ tests', params: {
    skin: 'classic', homepageHistoryMode: 'separate', incidentPostsPerPage: 5,
    incidentHistoryFormat: 'monthly', incidentMaxAgeYears: 0,
    customTabs: [{ name: 'Monitoring "live"', link: 'https://example.com/monitoring?mode=live&x=1' }],
  } };
  function build() {
    fs.writeFileSync(path.join(site, 'regression.yml'), JSON.stringify(overlay));
    const result = spawnSync(hugo, ['--source', site, '--config', 'config.yml,regression.yml',
      '--themesDir', path.dirname(root), '--theme', path.basename(root),
      '--baseURL', 'https://status.example/status/', '--destination', output, '--cleanDestinationDir'],
    { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || String(result.error));
    const log = result.stdout + result.stderr;
    return log;
  }
  const log = build();
  check('#355 no theme or example deprecations', () => assert.doesNotMatch(log, /deprecated/i));
  check('#373 every generated API is valid JSON', () => {
    for (const file of files(output).filter(file => file.endsWith('.json'))) {
      const json = fs.readFileSync(file, 'utf8');
      assert.doesNotMatch(json, /<no value>/, file);
      JSON.parse(json);
    }
    assert.equal(JSON.parse(fs.readFileSync(path.join(output, 'issues/regression-0/index.json'))).title, title);
  });
  check('#372 custom tabs retain configured links', () => {
    assert.equal(JSON.parse(fs.readFileSync(path.join(output, 'index.json'))).tabs[0].link, overlay.params.customTabs[0].link);
  });
  check('#374 history keeps the baseURL subdirectory', () => {
    const home = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
    assert.match(home, /href="(?:https:\/\/status.example)?\/status\/issues\/"[^>]*class="next-link"/);
  });
  check('#357 subscribe RSS URL has no doubled slash', () => {
    const home = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
    assert.doesNotMatch(home, /status\/\/index.xml/);
    assert.match(home, /https:\/\/status.example\/status\/index.xml/);
  });
  check('#370 affected archives actually render incidents', () => {
    const pages = files(path.join(output, 'affected/api')).filter(file => file.endsWith('.html'));
    assert.match(pages.map(file => fs.readFileSync(file, 'utf8')).join(''), /Regression 1/);
  });
  check('#371 monthly archives separate years', () => {
    const archive = fs.readFileSync(path.join(output, 'issues/index.html'), 'utf8');
    assert.match(archive, new RegExp(`id="archive-${year}-0?1"`));
    assert.match(archive, new RegExp(`id="archive-${year - 2}-0?1"`));
    assert.match(archive, /Regression 6/);
  });
  overlay.params.incidentMaxAgeYears = 1;
  build();
  check('#371 monthly archives honor age cutoff', () => {
    const archive = fs.readFileSync(path.join(output, 'issues/index.html'), 'utf8');
    assert.doesNotMatch(archive, /Regression 6/);
    assert.match(archive, /Regression 1/);
  });
  if (fs.existsSync(path.join(root, 'layouts/partials/skins/modern'))) {
    overlay.params.skin = 'modern';
    overlay.params.homepageHistoryMode = 'combined';
    overlay.params.incidentPostsPerPage = 20;
    build();
    check('v7 combined history preserves records and incidents', () => {
      const home = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
      assert.match(home, /data-history-kind="incident"/);
      assert.match(home, /data-history-kind="record"/);
    });
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
assert.equal(failures.length, 0, `${failures.length} regression checks failed: ${failures.join(', ')}`);
