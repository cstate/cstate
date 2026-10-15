import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildIncident } from '../static/cstate-status-tool.mjs';

const root = process.cwd();
const temporary = !process.env.CSTATE_FEATURE_PREVIEW;
const temp = process.env.CSTATE_FEATURE_PREVIEW || fs.mkdtempSync(path.join(os.tmpdir(), 'cstate-features-'));
const site = path.join(temp, 'site');
const output = path.join(temp, 'public');
const hugo = process.env.HUGO_BIN || 'hugo';
fs.mkdirSync(temp, { recursive: true });
try {
  fs.cpSync(path.join(root, 'exampleSite'), site, { recursive: true,
    filter: source => !['public', 'themes', '.hugo_build.lock'].includes(path.basename(source)) });
  fs.rmSync(path.join(site, 'content/issues'), { recursive: true, force: true });
  fs.mkdirSync(path.join(site, 'content/issues'));
  fs.writeFileSync(path.join(site, 'content/issues/_index.md'), '---\ntitle: Incidents\n---\n');
  const fixtures = [
    { slug: 'outage', title: 'API unavailable', severity: 'down', year: 2020 },
    { slug: 'partial', title: 'Search responses delayed', severity: 'disrupted', year: 2021 },
    { slug: 'maintenance', title: 'Scheduled database maintenance', severity: 'notice', year: 2022 },
    { slug: 'announcement', title: 'Support hours updated', severity: 'down', informational: true, year: 2023 },
    { slug: 'hidden', title: 'Unpinned incident', severity: 'down', pin: false, year: 2024 },
  ];
  for (const fixture of fixtures) {
    fs.writeFileSync(path.join(site, `content/issues/${fixture.slug}.md`), `---\n${JSON.stringify({
      title: fixture.title, severity: fixture.severity, informational: fixture.informational || false,
      pin: fixture.pin !== false, resolved: false, date: `${fixture.year}-01-02T10:00:00Z`,
      affected: ['API'], section: 'issue',
    })}\n---\n`);
  }
  const draft = buildIncident({ title: 'API "read" requests \\ retry\nNew line',
    date: '2026-01-02T10:00:00Z', details: 'Status: investigating.\n\n<script>not executed</script>',
    severity: 'down', resolved: true, resolvedWhen: '2026-01-02T11:00:00Z', affected: ['API'], pin: false });
  fs.writeFileSync(path.join(site, `content/issues/${draft.filename}`), draft.markdown);
  const overlay = { params: { skin: 'modern' } };
  function build() {
    fs.writeFileSync(path.join(site, 'features.json'), JSON.stringify(overlay));
    execFileSync(hugo, ['--source', site, '--config', 'config.yml,features.json',
      '--themesDir', path.dirname(root), '--theme', path.basename(root),
      '--baseURL', 'https://status.example/status/', '--destination', output, '--cleanDestinationDir'], { stdio: 'pipe' });
    return fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  }
  for (const skin of ['classic', 'modern']) {
    overlay.params.skin = skin;
    const home = build();
    const severities = [...home.matchAll(/data-announcement-severity="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(severities, ['down', 'disrupted', 'notice', 'informational'], `${skin} must order and deduplicate announcements`);
    assert.equal(home.split('Support hours updated →').length - 1, 1, `${skin} must not duplicate an unresolved informational post`);
    assert.match(home, /application\/atom\+xml/);
  }
  const generated = JSON.parse(fs.readFileSync(path.join(output, `issues/${draft.filename.slice(0, -3)}/index.json`)));
  assert.equal(generated.title, 'API "read" requests \\ retry\nNew line');
  assert.equal(generated.resolved, true);
  execFileSync('python3', ['-c', `
import pathlib, sys, xml.etree.ElementTree as ET
ns = {'a': 'http://www.w3.org/2005/Atom'}
feeds = list(pathlib.Path(sys.argv[1]).rglob('*.atom'))
assert len(feeds) >= 10
for file in feeds:
    feed = ET.parse(file).getroot()
    assert feed.tag == '{http://www.w3.org/2005/Atom}feed', file
    assert feed.find('a:updated', ns).text, file
    links = feed.findall('a:link', ns)
    assert any(link.get('rel') == 'self' for link in links), file
    entries = feed.findall('a:entry', ns)
    ids = [entry.find('a:id', ns).text for entry in entries]
    assert len(ids) == len(set(ids)), file
    assert all(value.startswith('https://status.example/status/') for value in ids), file
print(str(len(feeds)) + ' Atom feeds validated.')
`, output], { stdio: 'inherit' });
  // Legacy informational severity must never degrade service health.
  for (const fixture of fixtures.filter(fixture => !fixture.informational)) {
    fs.rmSync(path.join(site, `content/issues/${fixture.slug}.md`));
  }
  build();
  const payload = JSON.parse(fs.readFileSync(path.join(output, 'index.json')));
  assert.equal(payload.summaryStatus, 'ok');
  assert.equal(payload.systems.find(system => system.name === 'API').status, 'ok');
  assert.equal(payload.pinnedIssues.filter(issue => issue.title === 'Support hours updated').length, 1);
  if (!temporary) {
    // Restore all severity examples for manual browser acceptance.
    for (const fixture of fixtures.filter(fixture => !fixture.informational)) {
      fs.writeFileSync(path.join(site, `content/issues/${fixture.slug}.md`), `---\n${JSON.stringify({
        title: fixture.title, severity: fixture.severity, pin: fixture.pin !== false,
        resolved: false, date: `${fixture.year}-01-02T10:00:00Z`, affected: ['API'], section: 'issue',
      })}\n---\n`);
    }
    build();
  }
  console.log('cstate v7 severity, reporting round-trip, and Atom checks passed.');
} finally {
  if (temporary) fs.rmSync(temp, { recursive: true, force: true });
}
