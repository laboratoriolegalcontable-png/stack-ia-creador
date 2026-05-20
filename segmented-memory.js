/**
 * Segmented Memory — memoria namespaceada por dominio con TTL e integridad.
 * Cada dominio se almacena en localStorage 'mem:{domain}'.
 * @module segmented-memory
 */

const SEGMENTS = {
  legal:        { max: 200,  ttl: 30  * 86400000, desc: 'Consultas legales' },
  inmobiliaria: { max: 200,  ttl: 30  * 86400000, desc: 'Datos inmobiliarios' },
  ia:           { max: 500,  ttl: 7   * 86400000, desc: 'Contenido generado por IA' },
  cliente:      { max: 100,  ttl: 90  * 86400000, desc: 'Datos de clientes' },
  sesion:       { max: 50,   ttl: 86400000,        desc: 'Sesión activa (24h)' },
  global:       { max: 1000, ttl: 365 * 86400000, desc: 'Memoria global persistente' },
};

function storageKey(domain) { return `mem:${domain}`; }

function checksum(content) {
  let h = 0;
  for (let i = 0; i < content.length; i++) { h = (Math.imul(31, h) + content.charCodeAt(i)) | 0; }
  return (h >>> 0).toString(16);
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function loadDomain(domain) {
  try {
    const raw = localStorage.getItem(storageKey(domain));
    return raw ? JSON.parse(raw) : { entries: [], meta: { count: 0, lastAccess: null, version: 1 } };
  } catch { return { entries: [], meta: { count: 0, lastAccess: null, version: 1 } }; }
}

function saveDomain(domain, data) {
  data.meta.count      = data.entries.length;
  data.meta.lastAccess = Date.now();
  localStorage.setItem(storageKey(domain), JSON.stringify(data));
}

function assertDomain(domain) {
  if (!SEGMENTS[domain]) throw new Error(`Dominio desconocido: ${domain}`);
}

// --- Auto-compact 'sesion' on load ---
function compactSesion() {
  try { compact('sesion'); } catch { /* silent */ }
}

// --- Public API ---

export function store(domain, content, tags = []) {
  assertDomain(domain);
  const seg  = SEGMENTS[domain];
  const data = loadDomain(domain);
  const id   = genId();
  const entry = {
    id, content,
    timestamp: Date.now(),
    tags,
    ttl: seg.ttl,
    checksum: checksum(content),
  };
  data.entries.push(entry);
  // Trim to max
  if (data.entries.length > seg.max) {
    data.entries = data.entries.slice(-seg.max);
  }
  saveDomain(domain, data);
  document.dispatchEvent(new CustomEvent('memory:stored', { detail: { domain, id } }));
  return id;
}

export function retrieve(domain, query = '', limit = 5) {
  assertDomain(domain);
  const data = loadDomain(domain);
  const now  = Date.now();
  const queryLower = query.toLowerCase();
  const queryTags  = queryLower.split(/\s+/);

  const scored = data.entries
    .filter(e => now - e.timestamp < e.ttl)
    .map(e => {
      const tagMatch   = e.tags.filter(t => queryTags.includes(t.toLowerCase())).length;
      const textMatch  = e.content.toLowerCase().includes(queryLower) ? 1 : 0;
      const recency    = 1 - Math.min(1, (now - e.timestamp) / e.ttl);
      const score      = tagMatch * 0.5 + textMatch * 0.3 + recency * 0.2;
      return { entry: e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  document.dispatchEvent(new CustomEvent('memory:retrieved', { detail: { domain, query, count: scored.length } }));
  return scored;
}

export function forget(domain, id) {
  assertDomain(domain);
  const data   = loadDomain(domain);
  const before = data.entries.length;
  data.entries = data.entries.filter(e => e.id !== id);
  if (data.entries.length !== before) { saveDomain(domain, data); return true; }
  return false;
}

export function forgetDomain(domain) {
  assertDomain(domain);
  const data = loadDomain(domain);
  const count = data.entries.length;
  data.entries = [];
  saveDomain(domain, data);
  return count;
}

export function getStats() {
  const stats = {};
  for (const domain of Object.keys(SEGMENTS)) {
    const data = loadDomain(domain);
    const size = (localStorage.getItem(storageKey(domain)) || '').length;
    const ts   = data.entries.map(e => e.timestamp).filter(Boolean);
    stats[domain] = {
      count:   data.entries.length,
      size_kb: Math.round(size / 1024 * 10) / 10,
      oldest:  ts.length ? new Date(Math.min(...ts)).toLocaleDateString('es') : '—',
      newest:  ts.length ? new Date(Math.max(...ts)).toLocaleDateString('es') : '—',
    };
  }
  return stats;
}

export function compact(domain) {
  assertDomain(domain);
  const seg  = SEGMENTS[domain];
  const data = loadDomain(domain);
  const now  = Date.now();
  const before = data.entries.length;
  data.entries = data.entries.filter(e => {
    const expired = now - e.timestamp >= e.ttl;
    if (expired) document.dispatchEvent(new CustomEvent('memory:expired', { detail: { domain, id: e.id } }));
    return !expired;
  });
  if (data.entries.length > seg.max) data.entries = data.entries.slice(-seg.max);
  saveDomain(domain, data);
  return before - data.entries.length;
}

export function integrity(domain) {
  assertDomain(domain);
  const data = loadDomain(domain);
  let corrupted = 0;
  for (const e of data.entries) {
    if (checksum(e.content) !== e.checksum) corrupted++;
  }
  return { valid: corrupted === 0, corrupted };
}

export function exportMemory(domain) {
  const domains = domain ? [domain] : Object.keys(SEGMENTS);
  const payload = {};
  for (const d of domains) { assertDomain(d); payload[d] = loadDomain(d); }
  return btoa(JSON.stringify(payload));
}

export function importMemory(json) {
  const payload = JSON.parse(atob(json));
  let imported = 0, skipped = 0;
  for (const [domain, data] of Object.entries(payload)) {
    if (!SEGMENTS[domain]) { skipped++; continue; }
    const existing = loadDomain(domain);
    const existIds = new Set(existing.entries.map(e => e.id));
    for (const entry of (data.entries || [])) {
      if (!existIds.has(entry.id)) { existing.entries.push(entry); imported++; }
      else skipped++;
    }
    saveDomain(domain, existing);
  }
  return { imported, skipped };
}

// --- Memory Stats Panel (Ctrl+M) ---

function buildPanel() {
  if (document.getElementById('memory-stats-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'memory-stats-panel';
  Object.assign(panel.style, {
    display: 'none', position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)', zIndex: '10000',
    background: 'var(--bg, #fafaf9)', border: '1px solid var(--border, #e5e5e5)',
    borderRadius: '12px', padding: '1.5rem', minWidth: '340px', maxWidth: '90vw',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)', fontFamily: 'system-ui, sans-serif',
    fontSize: '0.85rem', color: 'var(--text, #1a1a1a)',
  });
  document.body.appendChild(panel);
}

function renderPanel() {
  buildPanel();
  const panel = document.getElementById('memory-stats-panel');
  const stats = getStats();
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <strong style="font-size:1rem">🧠 Memoria Segmentada</strong>
      <button id="mem-panel-close" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--muted,#666)">✕</button>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:1rem">
      <thead><tr style="font-size:0.75rem;color:var(--muted,#666);text-align:left">
        <th style="padding:0.3rem 0.5rem">Dominio</th>
        <th style="padding:0.3rem 0.5rem">Entradas</th>
        <th style="padding:0.3rem 0.5rem">Tamaño</th>
        <th style="padding:0.3rem 0.5rem"></th>
      </tr></thead>
      <tbody>
        ${Object.entries(stats).map(([d, s]) => `
          <tr style="border-top:1px solid var(--border,#e5e5e5)">
            <td style="padding:0.3rem 0.5rem;font-weight:600">${d}</td>
            <td style="padding:0.3rem 0.5rem">${s.count}</td>
            <td style="padding:0.3rem 0.5rem">${s.size_kb} KB</td>
            <td style="padding:0.3rem 0.5rem">
              <button data-compact="${d}" style="font-size:0.7rem;padding:0.15rem 0.5rem;border:1px solid var(--border,#e5e5e5);border-radius:4px;background:none;cursor:pointer">Compactar</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>
    <button id="mem-export-all" style="width:100%;padding:0.5rem;border:1px solid var(--border,#e5e5e5);border-radius:6px;background:none;cursor:pointer;font-size:0.82rem">
      Exportar Todo
    </button>`;

  panel.style.display = 'block';

  panel.querySelector('#mem-panel-close').addEventListener('click', () => { panel.style.display = 'none'; });
  panel.querySelectorAll('[data-compact]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.compact;
      const removed = compact(d);
      btn.textContent = `−${removed}`;
      setTimeout(() => renderPanel(), 600);
    });
  });
  panel.querySelector('#mem-export-all').addEventListener('click', () => {
    const data = exportMemory();
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data);
    a.download = `memoria-${Date.now()}.b64`;
    a.click();
  });
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'm') {
    e.preventDefault();
    const panel = document.getElementById('memory-stats-panel');
    if (panel && panel.style.display !== 'none') { panel.style.display = 'none'; }
    else { renderPanel(); }
  }
});

// Auto-compact 'sesion' on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', compactSesion);
} else {
  compactSesion();
}

window.SegmentedMemory = { store, retrieve, forget, forgetDomain, getStats, compact, integrity, export: exportMemory, import: importMemory };
export default window.SegmentedMemory;
