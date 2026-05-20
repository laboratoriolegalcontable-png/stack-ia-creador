/**
 * ctx-viz — Visualizador de uso del contexto (localStorage).
 * Equivalente al comando /ctx-viz filtrado del source map de Claude Code.
 * Toggle con el botón en el header.
 */

export function getCtxStats() {
  const keys = Object.keys(localStorage);
  const bytesByKey = keys.map((k) => {
    try { return (localStorage.getItem(k) || '').length; } catch { return 0; }
  });
  const total = bytesByKey.reduce((a, b) => a + b, 0);
  const maxBytes = 5 * 1024 * 1024;

  const groups = {
    kairos:      keys.filter((k) => k.startsWith('kairos:')),
    coordinator: keys.filter((k) => k.startsWith('coordinator:')),
    buddy:       keys.filter((k) => k.startsWith('buddy:')),
    flags:       keys.filter((k) => k.startsWith('kairos:flags')),
    other:       keys.filter((k) => !k.startsWith('kairos:') && !k.startsWith('coordinator:') && !k.startsWith('buddy:')),
  };

  return { total, maxBytes, pct: (total / maxBytes) * 100, groups, keyCount: keys.length };
}

export function toggleCtxViz() {
  const existing = document.getElementById('ctx-viz-panel');
  if (existing) { existing.remove(); return; }

  const { total, maxBytes, pct, groups, keyCount } = getCtxStats();
  const safePct = Math.min(100, pct);
  const barColor = safePct > 80 ? '#ef4444' : safePct > 50 ? '#f59e0b' : '#6366f1';

  const panel = document.createElement('div');
  panel.id = 'ctx-viz-panel';
  panel.style.cssText = [
    'position:fixed;top:1rem;right:1rem;z-index:2000',
    'background:rgba(8,8,14,.97);border:1px solid #4338ca',
    'border-radius:10px;padding:1rem 1.1rem;min-width:270px',
    'font-size:.78rem;color:#e2e8f0;box-shadow:0 6px 32px rgba(0,0,0,.6)',
  ].join(';');

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem">
      <strong style="color:#a5b4fc;font-size:.82rem">/ctx-viz — Contexto local</strong>
      <button id="ctx-viz-close" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1rem;line-height:1">&#x2715;</button>
    </div>
    <div style="background:#1f2937;border-radius:4px;height:7px;margin-bottom:.45rem;overflow:hidden">
      <div style="background:${barColor};width:${safePct.toFixed(2)}%;height:100%;border-radius:4px;transition:width .4s"></div>
    </div>
    <div style="color:#9ca3af;margin-bottom:.75rem">
      ${(total / 1024).toFixed(1)} KB / ${(maxBytes / 1024 / 1024).toFixed(0)} MB &nbsp;·&nbsp; ${safePct.toFixed(2)}% usado
    </div>
    <div style="display:flex;flex-direction:column;gap:.3rem;border-top:1px solid #1f2937;padding-top:.6rem">
      ${Object.entries(groups).map(([g, ks]) => `
        <div style="display:flex;justify-content:space-between">
          <span style="color:#c4b5fd">${g}</span>
          <span style="color:#94a3b8">${ks.length} clave${ks.length !== 1 ? 's' : ''}</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:.6rem;color:#4b5563;font-size:.7rem">${keyCount} claves totales en localStorage</div>
    <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">
      <button id="ctx-viz-clear" style="flex:1;padding:.3rem .5rem;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#e2e8f0;cursor:pointer;font-size:.72rem">Limpiar kairos:event:*</button>
    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById('ctx-viz-close')?.addEventListener('click', () => panel.remove());
  document.getElementById('ctx-viz-clear')?.addEventListener('click', () => {
    const temp = Object.keys(localStorage).filter((k) => k.startsWith('kairos:event:'));
    temp.forEach((k) => localStorage.removeItem(k));
    panel.remove();
    toggleCtxViz();
  });
}
