/**
 * Bot Config — gestor de configuración versionado e inmutable con detección de drift.
 * @module bot-config
 */

const HISTORY_KEY  = 'bot:config:history';
const LOCK_KEY     = 'bot:config:locked';

const DEFAULT_CONFIG = {
  version:    '1.0.0',
  model:      { temperature: 0.2, maxTokens: 2000, topP: 0.9 },
  behavior:   { tone: 'formal', language: 'es', responseFormat: 'structured' },
  shields:    { toxicityThreshold: 0.05, hallucinationCheck: true, maxRetries: 3 },
  memory:     { segmentsEnabled: true, maxHistoryTurns: 50, compressionAfter: 20 },
  rules:      { engineEnabled: true, fallbackToLLM: true },
  supervisor: { enabled: true, checks: ['toxicity', 'consistency', 'completeness'] },
};

function storageKey(version) { return `bot:config:v${version}`; }

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function bumpVersion(v) {
  const [major, minor, patch] = v.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

export function validate(config) {
  const errors = [];
  const required = ['version', 'model', 'behavior', 'shields', 'memory', 'rules', 'supervisor'];
  for (const key of required) {
    if (!(key in config)) errors.push(`Missing key: ${key}`);
  }
  if (config.model) {
    if (typeof config.model.temperature !== 'number') errors.push('model.temperature must be number');
    if (typeof config.model.maxTokens   !== 'number') errors.push('model.maxTokens must be number');
  }
  if (config.shields) {
    if (typeof config.shields.toxicityThreshold !== 'number') errors.push('shields.toxicityThreshold must be number');
  }
  return { valid: errors.length === 0, errors };
}

function loadLatestVersion() {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  if (!history.length) return null;
  return history[history.length - 1].version;
}

function loadConfig() {
  const version = loadLatestVersion();
  if (!version) return null;
  try {
    const raw = localStorage.getItem(storageKey(version));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistConfig(config, changes = []) {
  localStorage.setItem(storageKey(config.version), JSON.stringify(config));
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  history.push({ version: config.version, timestamp: new Date().toISOString(), changes });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// On load: validate stored config; restore default if invalid
let _config = (() => {
  const stored = loadConfig();
  if (!stored) {
    const c = deepClone(DEFAULT_CONFIG);
    persistConfig(c, ['initial']);
    return c;
  }
  const { valid } = validate(stored);
  if (!valid) {
    document.dispatchEvent(new CustomEvent('config:drift', { detail: { stored } }));
    const c = deepClone(DEFAULT_CONFIG);
    persistConfig(c, ['restored_after_drift']);
    return c;
  }
  return stored;
})();

export function getConfig()  { return deepClone(_config); }
export function getVersion() { return _config.version; }

export function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

export function updateConfig(patch) {
  if (sessionStorage.getItem(LOCK_KEY) === '1') throw new Error('Config is locked');
  const next = deepClone(_config);
  for (const [k, v] of Object.entries(patch)) {
    if (typeof v === 'object' && !Array.isArray(v)) Object.assign(next[k] ??= {}, v);
    else next[k] = v;
  }
  next.version = bumpVersion(_config.version);
  const { valid, errors } = validate(next);
  if (!valid) throw new Error(`Invalid config: ${errors.join(', ')}`);
  _config = next;
  persistConfig(_config, Object.keys(patch));
  document.dispatchEvent(new CustomEvent('config:updated', { detail: { config: deepClone(_config) } }));
  return deepClone(_config);
}

export function resetToDefault() {
  if (sessionStorage.getItem(LOCK_KEY) === '1') throw new Error('Config is locked');
  _config = deepClone(DEFAULT_CONFIG);
  persistConfig(_config, ['reset_to_default']);
  document.dispatchEvent(new CustomEvent('config:reset'));
}

export function lock()   { sessionStorage.setItem(LOCK_KEY, '1'); }
export function unlock() { sessionStorage.removeItem(LOCK_KEY); }

window.BotConfig = { getConfig, updateConfig, resetToDefault, getVersion, getHistory, validate, lock, unlock };
export default window.BotConfig;
