// Decap filters parsed frontmatter by exact value. Infer Hugo's section defaults
// on a copy of raw backend responses before that filter runs; never write here.
let tomlModule;
const installed = new WeakSet();

function missing(value) {
  return value === undefined || value === null || value === '';
}

async function defaultTomlLoader() {
  tomlModule ||= import('https://unpkg.com/smol-toml@1.9.1/dist/index.js');
  return tomlModule;
}

function jsonEnd(source) {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') quoted = true;
    else if (character === '{') depth++;
    else if (character === '}' && --depth === 0) return index + 1;
  }
  throw new Error('Unclosed JSON frontmatter');
}

async function frontmatter(raw, yaml, loadToml) {
  const opening = raw.match(/^\uFEFF?(---(?:yaml|toml|json)?|\+\+\+)[ \t]*\r?\n/);
  if (opening) {
    const remainder = raw.slice(opening[0].length);
    const closing = remainder.match(opening[1] === '+++'
      ? /^\+\+\+[ \t]*(?:\r?\n|$)/m
      : /^(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/m);
    if (!closing) throw new Error('Unclosed frontmatter');
    const header = remainder.slice(0, closing.index);
    const type = opening[1] === '+++' || opening[1] === '---toml' ? 'toml'
      : opening[1] === '---json' ? 'json' : 'yaml';
    const toml = type === 'toml' ? await loadToml() : null;
    const data = type === 'toml' ? toml.parse(header)
      : type === 'json' ? JSON.parse(header.trim().startsWith('{') ? header : '{' + header + '}')
      : yaml.load(header);
    return {
      data: data === undefined || data === null ? {} : data,
      add(defaults) {
        let extra;
        const replacesEmpty = Object.keys(defaults).some((key) => Object.hasOwn(data || {}, key));
        if (type === 'toml' && replacesEmpty) {
          return opening[0] + toml.stringify({ ...data, ...defaults }) + remainder.slice(closing.index);
        } else if (type === 'toml') {
          extra = Object.entries(defaults).map(([key, value]) => key + ' = ' + JSON.stringify(value)).join('\n') + '\n';
        } else if (type === 'json' || header.trim().startsWith('{') || replacesEmpty) {
          // Flow mappings cannot be prefixed with block YAML keys. Only this
          // in-memory header is serialized; the body remains byte-for-byte.
          extra = type === 'json' ? JSON.stringify({ ...data, ...defaults }, null, 2) + '\n'
            : yaml.dump({ ...data, ...defaults }, { lineWidth: -1 });
          return opening[0] + extra + remainder.slice(closing.index);
        } else {
          extra = yaml.dump(defaults, { lineWidth: -1 });
        }
        return opening[0] + extra + remainder;
      },
    };
  }

  if (raw.replace(/^\uFEFF/, '').startsWith('{')) {
    const source = raw.replace(/^\uFEFF/, '');
    const end = jsonEnd(source);
    const data = JSON.parse(source.slice(0, end));
    return {
      data,
      add(defaults) {
        return JSON.stringify({ ...data, ...defaults }, null, 2) + source.slice(end);
      },
    };
  }

  return {
    data: {},
    add(defaults) { return '---\n' + yaml.dump(defaults, { lineWidth: -1 }) + '---\n' + raw; },
  };
}

function copyArrayMetadata(source, target) {
  Reflect.ownKeys(source).forEach((key) => {
    if (key !== 'length' && (typeof key === 'symbol' || !/^(0|[1-9]\d*)$/.test(key))) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    }
  });
  return target;
}

export function installRecordBackend(CMS, config, sections, { yaml, loadToml = defaultTomlLoader } = {}) {
  if (!sections.length) return;
  const sectionFor = (entry) => {
    const path = entry && entry.file && entry.file.path;
    return typeof path === 'string' && sections.find((section) => path.startsWith('content/' + section.section + '/'));
  };
  const isIndex = (entry) => /(?:^|\/)\_index(?:\.|$)/i.test(entry.file.path);

  async function normalize(entry, readingSingle = false) {
    const section = sectionFor(entry);
    if (!section || isIndex(entry) || typeof entry.data !== 'string') return entry;
    // GitHub uses this empty-string response for missing files. Retain it so
    // Decap's collision checks do not mistake a missing path for an existing one.
    if (readingSingle && !entry.data) return entry;
    let parsed;
    try {
      parsed = await frontmatter(entry.data, yaml, loadToml);
      if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) throw new Error('Frontmatter must be a mapping');
    } catch (error) {
      throw new Error('Could not read ' + entry.file.path + ': ' + error.message);
    }
    const recordType = section.recordType || section.section;
    // Keep explicit foreign types intact: Decap's collection filter excludes them.
    if (!missing(parsed.data.recordType) && parsed.data.recordType !== recordType) return entry;
    const defaults = {};
    if (missing(parsed.data.recordType)) defaults.recordType = recordType;
    if (missing(parsed.data.state)) {
      defaults.state = parsed.data.severity === 'ongoing' ? 'active'
        : section.stateDefault || (['experiment', 'roadmap'].includes(recordType) ? 'active' : 'completed');
    }
    // Editing an existing entry does not apply widget defaults. Without this,
    // a valid Hugo record with omitted severity fails the CMS's required field.
    if (missing(parsed.data.severity)) defaults.severity = section.severityDefault ?? 'none';
    return Object.keys(defaults).length ? { ...entry, data: parsed.add(defaults) } : entry;
  }

  async function normalizeList(entries, excludeIndex = true) {
    if (!Array.isArray(entries)) return entries;
    const visible = excludeIndex ? entries.filter((entry) => !sectionFor(entry) || !isIndex(entry)) : entries;
    return copyArrayMetadata(entries, await Promise.all(visible.map((entry) => normalize(entry))));
  }

  function decorate(backend) {
    for (const name of ['entriesByFolder', 'allEntriesByFolder', 'entriesByFiles', 'getEntry', 'traverseCursor']) {
      const method = backend[name];
      if (typeof method !== 'function') continue;
      backend[name] = function(...args) {
        return Promise.resolve(method.apply(this, args)).then(async (result) => {
          if (name === 'getEntry') return normalize(result, true);
          if (name === 'traverseCursor') return { ...result, entries: await normalizeList(result.entries) };
          return normalizeList(result, name !== 'entriesByFiles');
        });
      };
    }
    return backend;
  }

  // Decap may replace the configured backend with its local proxy during init.
  // Wrap the existing registrations so auth, persistence, and provider-specific
  // constructors remain unchanged (including git-gateway's internal provider).
  const names = [config.backend && config.backend.name, ...(config.local_backend ? ['proxy'] : [])];
  for (const name of new Set(names.filter(Boolean))) {
    const registration = CMS.getBackend(name);
    if (!registration || installed.has(registration)) continue;
    const initialize = registration.init;
    registration.init = function(...args) { return decorate(initialize.apply(this, args)); };
    installed.add(registration);
  }
}
