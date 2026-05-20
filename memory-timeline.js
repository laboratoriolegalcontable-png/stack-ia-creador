/**
 * Memory Timeline — visualiza ciclos KAIROS anteriores como línea de tiempo
 * @module memory-timeline
 */

const TIMELINE_KEY = 'kairos:timeline';
const MAX_ENTRIES  = 30;

export function recordTimelineEntry(phase, durationMs, insight) {
  const entry = {
    ts: new Date().toISOString(),
    phase,
    durationMs,
    insight: insight?.slice(0, 120) || '',
  };
  const raw      = localStorage.getItem(TIMELINE_KEY);
  const entries  = raw ? JSON.parse(raw) : [];
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(entries));
}

export function getTimeline() {
  const raw = localStorage.getItem(TIMELINE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function renderMemoryTimeline() {
  const existing = document.getElementById('timeline-panel');
  if (existing) { existing.remove(); return; }

  const entries  = getTimeline();
  const panel    = document.createElement('div');
  panel.id       = 'timeline-panel';
  panel.style.cssText = [
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)',
    'width:460px;max-height:75vh;overflow-y:auto',
    'background:#0f172a;border:1px solid #334155;border-radius:12px',
    'padding:20px;font-family:monospace;font-size:12px;color:#e2e8f0',
    'box-shadow:0 16px 64px rgba(0,0,0,0.7);z-index:10002',
  ].join(';');

  const phaseColor = {
    orient:      '#6366f1',
    gather:      '#0ea5e9',
    consolidate: '#22c55e',
    prune:       '#f59e0b',
  };

  const rows = entries.length
    ? [...entries].reverse().map((e) => {
        const color = phaseColor[e.phase] || '#94a3b8';
        const ago   = Math.round((Date.now() - new Date(e.ts).getTime()) / 60000);
        return `
          <div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start">
            <div style="width:4px;min-height:40px;background:${color};border-radius:2px;flex-shrink:0"></div>
            <div>
              <div style="display:flex;gap:8px;align-items:center">
                <span style="color:${color};font-weight:700">${e.phase}</span>
                <span style="color:#475569">${ago}min ago &middot; ${e.durationMs}ms</span>
              </div>
              ${e.insight ? `<div style="color:#94a3b8;margin-top:3px">${e.insight}</div>` : ''}
            </div>
          </div>`;
      }).join('')
    : '<div style="color:#475569;text-align:center;padding:20px">Sin eventos registrados aún.<br>Ejecuta /dream para iniciar.</div>';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="color:#818cf8;font-size:15px;font-weight:700">&#x23F1;&#xFE0F; Memory Timeline</span>
      <button onclick="this.closest('#timeline-panel').remove()"
        style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px">&#x2715;</button>
    </div>
    <div style="color:#64748b;margin-bottom:12px">${entries.length} eventos &middot; últimos ${MAX_ENTRIES} guardados</div>
    ${rows}
  `;
  document.body.appendChild(panel);
  setTimeout(() => panel.remove(), 60_000);
}
