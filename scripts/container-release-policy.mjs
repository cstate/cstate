import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export function containerReleasePolicy(release) {
  if (!release || release.draft) throw new Error('A published v7 release is required.');
  const tag = String(release.tag_name || '');
  const shortPrerelease = tag.match(/^v?7-r([1-9]\d*)$/);
  const version = shortPrerelease ? `7.0.0-r${shortPrerelease[1]}` : tag.replace(/^v/, '');
  const match = version.match(/^7\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/);
  if (!match || match[3]?.split('.').some(value => /^\d+$/.test(value) && value.length > 1 && value[0] === '0')) throw new Error('Expected a valid v7 version tag.');
  const full = `7.${match[1]}.${match[2] || '0'}${match[3] ? '-' + match[3] : ''}${match[4] ? '+' + match[4] : ''}`;
  const imageVersion = full.replace('+', '_');
  if (imageVersion.length > 128) throw new Error('Container version tag is too long.');
  const stable = !release.prerelease && !match[3];
  return { version: full, stable, tags: [...new Set([imageVersion, ...(shortPrerelease ? [tag] : []), ...(stable ? [`7.${match[1]}`, '7', 'latest'] : [])])] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { release } = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const policy = containerReleasePolicy(release);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `value=${policy.version}\nstable=${policy.stable}\ntags<<CSTATE_IMAGE_TAGS\n${policy.tags.map(tag => `type=raw,value=${tag}`).join('\n')}\nCSTATE_IMAGE_TAGS\n`);
}
