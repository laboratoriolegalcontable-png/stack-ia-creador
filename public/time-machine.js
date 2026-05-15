/** Time Machine — KAIROS browser module */
const CHECKPOINTS_KEY = 'kairos:checkpoints';
const RESTORED_KEY = 'kairos:restored';

/** @returns {object[]} */
export function listSnapshots() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHECKPOINTS_KEY) || '[]');
    return raw.map((item, index) => ({
      index,
      label: `Checkpoint #${index + 1}`,
      timestamp: item.timestamp || new Date().toISOString(),
      sessions: item.sessions || 0,
      hasMemory: item.hasMemory || false,
      memMB: item.memMB || 0,
      uptime: item.uptime || 0,
    }));
  } catch { return []; }
}

/**
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {object|null}
 */
export function diffSnapshots(fromIndex, toIndex) {
  const snapshots = listSnapshots();
  const from = snapshots[fromIndex];
  const to = snapshots[toIndex];
  if (!from || !to) return null;
  return { from, to, deltaMemMB: +(to.memMB - from.memMB).toFixed(2), deltaSessions: to.sessions - from.sessions, deltaUptime: +(to.uptime - from.uptime).toFixed(1) };
}

/** @param {number} index @returns {boolean} */
export function restoreSnapshot(index) {
  const snapshots = listSnapshots();
  const snap = snapshots[index];
  if (!snap) return false;
  localStorage.setItem(RESTORED_KEY, JSON.stringify({ ...snap, restoredAt: new Date().toISOString() }));
  return true;
}

export function renderTimeMachine() {
  const existing = document.getElementById('kairos-timemachine-panel');
  if (existing) { existing.remove(); return; }

  const snapshots = listSnapshots();

  const panel = document.createElement('div');
  panel.id = 'kairos-timemachine-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(520px,95vw);max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h3 style="margin:0;color:#a5b4fc;font-size:1rem">⏰ Time Machine</h3>
      <button onclick="document.getElementById('kairos-timemachine-panel').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
    </div>
    <p style="font-size:0.8rem;color:#9ca3af;margin-bottom:1rem">${snapshots.length} checkpoints disponibles. Haz clic en &ldquo;Restaurar&rdquo; para volver a ese estado.</p>
    ${snapshots.length === 0 ? '<p style="color:#6b7280;font-size:0.85rem">Sin checkpoints. El scheduler genera uno cada 10 minutos.</p>' : snapshots.slice().reverse().map(s => `
      <div style="border:1px solid #374151;border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:#0f0f1e;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="color:#e5e7eb;font-size:0.85rem;margin-bottom:0.2rem">${s.label}</div>
          <div style="font-size:0.72rem;color:#6b7280">${new Date(s.timestamp).toLocaleString('es-AR')} · ${s.sessions} sesiones · ${s.memMB.toFixed(1)}MB · ${s.hasMemory ? '✅ memoria' : '❌ sin memoria'}</div>
        </div>
        <button onclick="window._kairos_tm.restore(${s.index})" style="font-size:0.75rem;padding:0.3rem 0.7rem;background:#1e3a5f;color:#60a5fa;border:1px solid #1d4ed8;border-radius:6px;cursor:pointer">Restaurar</button>
      </div>`).join('')}
    <div id="tm-diff-section" style="margin-top:1rem">
      <div style="font-size:0.8rem;color:#9ca3af;margin-bottom:0.5rem">Comparar checkpoints:</div>
      <div style="display:flex;gap:0.5rem;align-items:center">
        <select id="tm-from" style="flex:1;padding:0.35rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.8rem">
          ${snapshots.map(s => `<option value="${s.index}">${s.label}</option>`).join('')}
        </select>
        <span style="color:#6b7280">→</span>
        <select id="tm-to" style="flex:1;padding:0.35rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.8rem">
          ${snapshots.map((s, i) => `<option value="${s.index}" ${i === snapshots.length - 1 ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
        <button id="tm-diff-btn" style="padding:0.35rem 0.7rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.8rem">Diff</button>
      </div>
      <div id="tm-diff-result" style="margin-top:0.75rem;font-size:0.8rem;color:#9ca3af"></div>
    </div>`;

  window._kairos_tm = {
    restore: (index) => {
      if (restoreSnapshot(index)) {
        const btn = panel.querySelector(`button[onclick*="restore(${index})"]`);
        if (btn) { btn.textContent = '✅ Restaurado'; btn.style.color = '#34d399'; }
      }
    }
  };

  panel.querySelector('#tm-diff-btn')?.addEventListener('click', () => {
    const from = parseInt(panel.querySelector('#tm-from').value, 10);
    const to = parseInt(panel.querySelector('#tm-to').value, 10);
    const diff = diffSnapshots(from, to);
    const result = panel.querySelector('#tm-diff-result');
    if (!diff) { result.textContent = 'Checkpoints no encontrados.'; return; }
    result.innerHTML = `ΔMem: <span style="color:${diff.deltaMemMB > 0 ? '#f87171' : '#34d399'}">${diff.deltaMemMB > 0 ? '+' : ''}${diff.deltaMemMB}MB</span> · ΔSesiones: <span style="color:#60a5fa">${diff.deltaSessions > 0 ? '+' : ''}${diff.deltaSessions}</span> · ΔUptime: ${diff.deltaUptime > 0 ? '+' : ''}${diff.deltaUptime}s`;
  });

  document.body.appendChild(panel);
}
