# Plan: Harden MonitorBot Runtime and Deployment Paths

## Problem

MonitorBot's v7 Markdown generation is now in decent shape, but important runtime paths are not covered by the current test and can fail in real installs.

Evidence:

- `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/utils/deployer.js:58` uses `require('stream')` inside a package with `"type": "module"` in `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/package.json:5`. FTP deployment will throw when that path is exercised.
- `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/utils/deployer.js:82` through `:87` writes Git deployment files without creating the parent directory. New v7 sections such as `content/experiments` can fail on sites that have not created those folders yet.
- `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/monitors/sslMonitor.js:19` uses a TLS callback and calls incident actions inside the callback without awaiting them. The async monitor function can resolve before deployment or state writes complete.
- `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/config/config.js:18` defaults `testMode` to `false`, while `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/utils/deployer.js:20` joins `process.env.LOCAL_CSTATE_PATH` into a path for local deploys. A default run can try to deploy without a configured cState path.

## Proposed implementation

1. Replace the FTP `require('stream')` usage with an ESM import, such as `import { PassThrough } from 'node:stream';`.
2. Ensure Git deployment creates parent directories before writing files, matching local deployment behavior.
3. Refactor SSL monitoring to return a Promise that resolves after certificate checks and incident actions finish.
4. Decide whether MonitorBot should default to dry-run/test mode. If not, fail fast with a clear config error when local deployment has no `LOCAL_CSTATE_PATH`.
5. Add tests that exercise local, git, and FTP deployer setup without hitting real networks.

## Acceptance criteria

- `npm test` fails if FTP deployment references CommonJS `require`.
- Git deployment can write `content/experiments/yyyy-mm-dd-record.md` when `content/experiments` does not already exist.
- SSL monitor tests prove incident creation/resolution is awaited.
- A default MonitorBot checkout cannot silently enter a broken deployment path.

## Risk

Medium. MonitorBot writes operational history, so runtime fixes should avoid changing existing incident file shapes. Keep frontmatter compatibility tests exactly as strict as they are now.
