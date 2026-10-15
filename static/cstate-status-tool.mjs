// Dependency-free incident authoring. Publication still happens in the Git editor.
export function buildIncident({ title, date, details = '', affected = [], severity = 'notice', resolved = false, resolvedWhen, pin = true }) {
  if (!title?.trim()) throw new Error('Add an incident title.');
  if (!['notice', 'disrupted', 'down'].includes(severity)) throw new Error('Choose an incident severity.');
  const created = new Date(date);
  if (!Number.isFinite(created.getTime())) throw new Error('Choose a valid start time.');
  const metadata = { title: title.trim(), date: created.toISOString(), resolved, severity, affected, section: 'issue', pin };
  if (resolved) {
    const end = new Date(resolvedWhen);
    if (!Number.isFinite(end.getTime()) || end < created) throw new Error('Resolution time must be after the start time.');
    metadata.resolvedWhen = end.toISOString();
  }
  // JSON scalar/array syntax is valid YAML, including quotes and line breaks.
  const frontmatter = Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
  const slug = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'incident';
  const stamp = created.toISOString().slice(0, 19).replace('T', '-').replaceAll(':', '-');
  return { markdown: `---\n${frontmatter}\n---\n\n${details.trim()}\n`, filename: `${stamp}-${slug}.md` };
}

export function createEditorURL({ repository, provider = 'github', branch = 'main', filename, markdown }) {
  const repo = new URL(repository);
  if (!['http:', 'https:'].includes(repo.protocol) || repo.username || repo.password) throw new Error('Use an HTTP(S) repository URL.');
  if (!['github', 'gitlab'].includes(provider)) throw new Error('Choose GitHub or GitLab.');
  if (!branch || /(^|\/)\.\.?(\/|$)/.test(branch)) throw new Error('Choose a valid branch.');
  if (!filename || /[/\\]/.test(filename)) throw new Error('Use a filename without directories.');
  repo.search = ''; repo.hash = '';
  repo.pathname = repo.pathname.replace(/\/?$/, '').replace(/\.git$/, '');
  const target = new URL(`${repo.href}/${provider === 'gitlab' ? '-/new' : 'new'}/${encodeURIComponent(branch)}`);
  target.searchParams.set(provider === 'gitlab' ? 'file_name' : 'filename', `content/issues/${filename}`);
  target.searchParams.set(provider === 'gitlab' ? 'content' : 'value', markdown);
  return target.href;
}

const defaults = {
  title: 'Incident title', started: 'Started', severity: 'Severity', notice: 'Maintenance',
  disrupted: 'Partial outage', down: 'Major outage', systems: 'Affected systems',
  details: 'Update', resolved: 'Resolved', ended: 'Resolved at', pin: 'Show on homepage',
  preview: 'Markdown', generate: 'Prepare update', copy: 'Copy Markdown', download: 'Download .md',
  github: 'Review in GitHub', gitlab: 'Review in GitLab', loading: 'Loading systems…',
  loadError: 'Systems could not be loaded. Retry, or continue without selecting systems.',
  retry: 'Retry', ready: 'Ready to review.', copied: 'Copied.',
  copyError: 'Copy was unavailable. Download the Markdown instead.',
  long: 'This update is too long for an editor link. Download the Markdown and add it to your repository.',
};

export class CStateStatusTool extends (globalThis.HTMLElement || class {}) {
  connectedCallback() {
    if (this.shadowRoot) { this.loadSystems(); return; }
    let labels = {};
    try { labels = JSON.parse(this.getAttribute('labels') || '{}'); } catch { /* Keep default labels. */ }
    this.labels = { ...defaults, ...labels };
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      :host{display:block;color:var(--report-ink,#17202f);font:inherit;color-scheme:light dark}
      *{box-sizing:border-box}form{display:grid;gap:20px}label,legend{font-size:14px;font-weight:650}
      label{display:grid;gap:8px}input,textarea,select,button,a{font:inherit}
      input:not([type=checkbox]),textarea,select{width:100%;min-width:0;padding:11px 12px;border:1px solid #c3ccd8;border-radius:8px;background:var(--report-field,#fff);color:inherit}
      input[type=checkbox]{accent-color:#3459cf;width:18px;height:18px;margin:0}
      textarea{resize:vertical;min-height:140px}fieldset{margin:0;padding:0;border:0}legend{margin-bottom:12px}
      .row{display:grid;grid-template-columns:1fr 1fr;gap:16px}.checks{display:flex;flex-wrap:wrap;gap:12px 20px}
      .check{display:flex;align-items:center;gap:9px;min-height:32px;font-weight:500}
      .actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
      button,.editor{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border:1px solid #c3ccd8;border-radius:8px;background:var(--report-field,#fff);color:inherit;text-decoration:none;font-size:14px;font-weight:650;cursor:pointer}
      button[type=submit],.editor{background:#2849b9;border-color:#2849b9;color:#fff}
      :focus-visible{outline:3px solid #6688ef;outline-offset:3px}button:disabled{opacity:.5;cursor:default}
      details{border-top:1px solid #d9e1ea;padding-top:16px}summary{cursor:pointer;font-size:14px;font-weight:650}
      pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.6 ui-monospace,monospace}
      .status{margin:0;font-size:14px;min-height:20px}.error{color:#ba2525}[hidden]{display:none!important}
      ::slotted(textarea){width:100%;min-height:180px}::slotted(input){width:100%}
      @media(max-width:480px){.row{grid-template-columns:1fr}.actions>*{flex:1 1 auto}}
      @media(prefers-color-scheme:dark){:host{--report-ink:#edf1f7;--report-field:#17202f}input:not([type=checkbox]),textarea,select,button{border-color:#556176}.error{color:#ff9b9b}}
    </style><form>
      <label><span data-label="title"></span><input name="title" required maxlength="200" autocomplete="off"></label>
      <div class="row">
        <label><span data-label="started"></span><input name="date" type="datetime-local" required></label>
        <label><span data-label="severity"></span><select name="severity"><option value="notice" data-label="notice"></option><option value="disrupted" data-label="disrupted"></option><option value="down" data-label="down"></option></select></label>
      </div>
      <fieldset><legend data-label="systems"></legend><div class="checks" id="systems"></div><p class="status" id="systems-status" role="status"></p><button type="button" id="retry" data-label="retry" hidden></button></fieldset>
      <label><span data-label="details"></span><textarea name="details" required></textarea></label>
      <div class="checks">
        <label class="check"><input type="checkbox" name="pin" checked><span data-label="pin"></span></label>
        <label class="check"><input type="checkbox" name="resolved"><span data-label="resolved"></span></label>
      </div>
      <label id="resolution" hidden><span data-label="ended"></span><input name="resolvedWhen" type="datetime-local"></label>
      <div class="actions"><button type="submit" data-label="generate"></button><button type="button" id="copy" data-label="copy" disabled></button><button type="button" id="download" data-label="download" disabled></button><a class="editor" id="editor" target="_blank" rel="noopener noreferrer" hidden></a></div>
      <p class="status" id="status" role="status" aria-live="polite"></p>
      <details><summary data-label="preview"></summary><slot name="filename-field"></slot><slot name="details-field"><pre id="preview"></pre></slot></details>
    </form>`;
    root.querySelectorAll('[data-label]').forEach(el => { el.textContent = this.labels[el.dataset.label]; });
    this.form = root.querySelector('form');
    const now = new Date();
    this.form.elements.date.value = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.form.addEventListener('submit', event => { event.preventDefault(); this.prepare(); });
    this.form.addEventListener('input', event => {
      if (event.target.getRootNode() !== root) return;
      const resolved = this.form.elements.resolved.checked;
      root.querySelector('#resolution').hidden = !resolved;
      this.form.elements.resolvedWhen.required = resolved;
      // Never leave an editor link pointing at an earlier draft.
      this.result = null;
      root.querySelector('#editor').hidden = true;
      root.querySelector('#copy').disabled = root.querySelector('#download').disabled = true;
      root.querySelector('#preview').textContent = '';
      this.querySelectorAll('[slot="details-field"], [slot="filename-field"]').forEach(el => { el.value = ''; });
      this.setStatus('');
    });
    root.querySelector('#retry').addEventListener('click', () => this.loadSystems());
    root.querySelector('#copy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(this.result.markdown); this.setStatus(this.labels.copied); }
      catch { this.setStatus(this.labels.copyError, true); }
    });
    root.querySelector('#download').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([this.result.markdown], { type: 'text/markdown;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = this.result.filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    this.loadSystems();
  }

  disconnectedCallback() { this.request?.abort(); }

  setStatus(text, error = false) {
    const status = this.shadowRoot.querySelector('#status');
    status.textContent = text; status.classList.toggle('error', error);
  }

  async loadSystems() {
    this.request?.abort();
    this.request = new AbortController();
    const request = this.request;
    const timer = setTimeout(() => request.abort(), 10000);
    const status = this.shadowRoot.querySelector('#systems-status');
    const retry = this.shadowRoot.querySelector('#retry');
    status.textContent = this.labels.loading; retry.hidden = true;
    try {
      const base = new URL(this.getAttribute('base') || './', document.baseURI);
      const url = base.protocol === 'data:' || base.pathname.endsWith('.json') ? base : new URL('index.json', base.href.replace(/\/?$/, '/'));
      const response = await fetch(url, { signal: request.signal, credentials: 'omit' });
      if (!response.ok) throw new Error('API unavailable');
      const data = await response.json();
      if (!Array.isArray(data.systems)) throw new Error('Invalid API');
      const systems = this.shadowRoot.querySelector('#systems'); systems.replaceChildren();
      for (const name of new Set(data.systems.map(system => system.name).filter(name => typeof name === 'string'))) {
        const label = document.createElement('label'); label.className = 'check';
        const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'affected'; input.value = name;
        label.append(input, document.createTextNode(name)); systems.append(label);
      }
      status.textContent = '';
    } catch {
      if (request !== this.request || !this.isConnected) return;
      status.textContent = this.labels.loadError; retry.hidden = false;
    } finally { clearTimeout(timer); }
  }

  prepare() {
    if (!this.form.reportValidity()) return;
    try {
      const fields = this.form.elements;
      const affected = [...this.form.querySelectorAll('[name=affected]:checked')].map(el => el.value);
      const details = fields.details.value;
      const template = this.getAttribute('default-details') || this.getAttribute('defaultDetails');
      this.result = buildIncident({ title: fields.title.value, date: fields.date.value, severity: fields.severity.value,
        details: template ? template.replaceAll('{{SYSTEMS}}', affected.join(', ')).replaceAll('{{DATETIME}}', new Date(fields.date.value).toISOString()).replaceAll('{{STAND}}', details) : details,
        affected, resolved: fields.resolved.checked, resolvedWhen: fields.resolvedWhen.value, pin: fields.pin.checked });
      this.shadowRoot.querySelector('#preview').textContent = this.result.markdown;
      for (const [slot, value] of [['details-field', this.result.markdown], ['filename-field', this.result.filename]]) {
        const field = this.querySelector(`[slot="${slot}"]`);
        if (field) { field.value = value; field.dispatchEvent(new Event('input', { bubbles: true })); }
      }
      this.shadowRoot.querySelector('#copy').disabled = this.shadowRoot.querySelector('#download').disabled = false;
      const repository = this.getAttribute('repository');
      let message = this.labels.ready;
      if (repository) {
        const provider = this.getAttribute('provider') || 'github';
        const url = createEditorURL({ repository, provider, branch: this.getAttribute('branch') || 'main', ...this.result });
        if (url.length > 8000) message = this.labels.long;
        else {
          const editor = this.shadowRoot.querySelector('#editor');
          editor.href = url; editor.textContent = this.labels[provider]; editor.hidden = false;
        }
      }
      this.setStatus(message);
      this.dispatchEvent(new CustomEvent('cstate-draft', { detail: { ...this.result }, bubbles: true, composed: true }));
    } catch (error) { this.setStatus(error.message, true); }
  }
}

if (globalThis.customElements && !customElements.get('cstate-status-tool')) {
  customElements.define('cstate-status-tool', CStateStatusTool);
}
