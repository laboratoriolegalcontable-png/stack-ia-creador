const KEY = 'kairos:checkpoints';
function loadCPs() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function now() { return new Date().toISOString(); }

function getSnapshots() {
  return loadCPs().map((cp, index) => ({
    index,
    timestamp: cp.ts || now(),
    label: cp.label || ('Checkpoint #' + (index + 1)),
    sessions: cp.sessions || 0,
    hasMemory: cp.hasMemory || false,
    memKB: cp.memKB || 0,
  }));
}

export function renderTimeMachine() {
  let panel = document.getElementById('time-machine-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'time-machine-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>⏳ Time Machine</h2><button class="ia-close" onclick="document.getElementById('time-machine-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <label style="font-size:0.8rem;display:flex;align-items:center;gap:4px">Desde <input id="tm-from" type="number" min="0" value="0" style="width:50px;padding:2px 4px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)" /></label>
        <label style="font-size:0.8rem;display:flex;align-items:center;gap:4px">Hasta <input id="tm-to" type="number" min="1" value="1" style="width:50px;padding:2px 4px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)" /></label>
        <button id="tm-diff" class="ia-btn-sm blue">🔀 Comparar</button>
      </div>
      <div id="tm-diff-result" style="display:none;margin-bottom:8px;padding:8px;background:var(--color-surface);border-radius:4px;font-size:0.85rem"></div>
      <div id="tm-stats" class="ia-stats-bar"></div>
      <div id="tm-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('tm-diff').onclick = () => {
    const snapshots = getSnapshots();
    const from = parseInt(document.getElementById('tm-from').value);
    const to = parseInt(document.getElementById('tm-to').value);
    const a = snapshots[from];
    const b = snapshots[to];
    const result = document.getElementById('tm-diff-result');
    result.style.display = '';
    if (!a || !b) { result.textContent = 'Snapshots no encontrados'; return; }
    result.textContent = '[' + a.label + '] → [' + b.label + '] | ΔSesiones: ' + (b.sessions - a.sessions) + ' | ΔMem: ' + (b.memKB - a.memKB) + 'KB';
  };
  _refresh();
}

function _refresh() {
  const snapshots = getSnapshots();
  const stats = document.getElementById('tm-stats');
  const list = document.getElementById('tm-list');
  if (!stats || !list) return;
  stats.textContent = 'Snapshots: ' + snapshots.length + ' | (desde Checkpoints)';
  list.innerHTML = '';
  snapshots.forEach(s => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray">#' + s.index + '</span><span class="ia-badge">' + s.sessions + 's</span>' + (s.hasMemory ? '<span class="ia-badge green">mem</span>' : '') + '</div><small></small>';
    el.querySelector('strong').textContent = s.label;
    el.querySelector('small').textContent = new Date(s.timestamp).toLocaleString() + ' · ' + s.memKB + 'KB';
    list.appendChild(el);
  });
}
