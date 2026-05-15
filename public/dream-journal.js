/**
 * Dream Journal — vista bonita del historial de ciclos KAIROS
 * @module dream-journal
 */

export function renderDreamJournal() {
  const existing = document.getElementById('journal-panel');
  if (existing) { existing.remove(); return; }

  const memRaw   = localStorage.getItem('kairos:memory');
  const coordRaw = localStorage.getItem('coordinator:latest');
  const ultraRaw = localStorage.getItem('ultraplan:latest');
  const timeRaw  = localStorage.getItem('kairos:timeline');

  const mem     = memRaw   ? JSON.parse(memRaw)   : null;
  const coord   = coordRaw ? JSON.parse(coordRaw) : null;
  const ultra   = ultraRaw ? JSON.parse(ultraRaw) : null;
  const timeline = timeRaw ? JSON.parse(timeRaw).reverse().slice(0, 10) : [];

  const panel = document.createElement('div');
  panel.id = 'journal-panel';
  panel.style.cssText = [
    'position:fixed;top:0;right:0;bottom:0;width:420px',
    'background:#0a0f1e;border-left:1px solid #1e293b',
    'overflow-y:auto;padding:24px;font-family:monospace;font-size:12px;color:#e2e8f0',
    'box-shadow:-8px 0 32px rgba(0,0,0,0.7);z-index:10003',
    'animation:slideInRight 0.3s ease',
  ].join(';');

  const phaseColor = { orient:'#6366f1', gather:'#0ea5e9', consolidate:'#22c55e', prune:'#f59e0b' };

  const timelineRows = timeline.length
    ? timeline.map(e => `
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <div style="width:3px;background:${phaseColor[e.phase]||'#475569'};border-radius:2px"></div>
        <div>
          <span style="color:${phaseColor[e.phase]||'#475569'}">${e.phase}</span>
          <span style="color:#475569;margin-left:8px">${e.durationMs}ms</span>
          ${e.insight ? `<div style="color:#64748b">${e.insight}</div>` : ''}
        </div>
      </div>`).join('')
    : '<div style="color:#475569">Sin eventos aún. Ejecuta /dream.</div>';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <span style="color:#818cf8;font-size:16px;font-weight:700">📓 Dream Journal</span>
      <button onclick="this.closest('#journal-panel').remove()"
        style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:20px">&times;</button>
    </div>

    <div style="color:#6366f1;font-weight:700;margin-bottom:8px">KAIROS Memory</div>
    ${mem?.consolidate?.insights?.length
      ? mem.consolidate.insights.map(i => `<div style="color:#94a3b8;margin-bottom:4px">• ${i}</div>`).join('')
      : '<div style="color:#475569">Sin memoria consolidada aún.</div>'}

    <div style="color:#6366f1;font-weight:700;margin:16px 0 8px">Fase Timeline</div>
    ${timelineRows}

    ${ultra ? `
    <div style="color:#6366f1;font-weight:700;margin:16px 0 8px">ULTRAPLAN Activo</div>
    <div style="color:#a5b4fc">⚡ ${ultra.goal}</div>
    <div style="color:#64748b;margin-top:4px">
      ${ultra.steps.filter(s => s.status==='done').length}/${ultra.steps.length} pasos completados
    </div>` : ''}

    ${coord ? `
    <div style="color:#6366f1;font-weight:700;margin:16px 0 8px">Coordinator</div>
    <div style="color:#94a3b8">Último: ${coord.completedAt ? new Date(coord.completedAt).toLocaleString() : 'desconocido'}</div>
    ` : ''}

    <div style="color:#475569;margin-top:20px;text-align:center;font-size:11px">
      ${new Date().toLocaleString()}
    </div>
  `;

  document.body.appendChild(panel);
}
