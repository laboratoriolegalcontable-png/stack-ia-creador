const KEY = 'kairos:checkpoints';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function now() { return new Date().toISOString(); }

export function renderCheckpoint() {
  let panel = document.getElementById('checkpoint-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'checkpoint-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🔖 Checkpoints</h2><button class="ia-close" onclick="document.getElementById('checkpoint-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <div style="display:flex;gap:6px;margin-bottom:10px">
        <button id="cp-save" class="ia-btn" style="flex:1">💾 Guardar Checkpoint</button>
        <button id="cp-clear" class="ia-btn-sm red">🗑 Limpiar</button>
      </div>
      <div id="cp-stats" class="ia-stats-bar"></div>
      <div id="cp-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('cp-save').onclick = () => {
    const items = load();
    items.unshift({
      ts: now(),
      label: 'Checkpoint #' + (items.length + 1),
      sessions: parseInt(localStorage.getItem('kairos:sessions') || '0'),
      hasMemory: !!localStorage.getItem('kairos:latest'),
      memKB: Math.round(JSON.stringify(localStorage).length / 1024),
    });
    if (items.length > 24) items.splice(24);
    save(items);
    _refresh();
  };
  document.getElementById('cp-clear').onclick = () => { if (confirm('¿Limpiar todos los checkpoints?')) { save([]); _refresh(); } };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('cp-stats');
  const list = document.getElementById('cp-list');
  if (!stats || !list) return;
  stats.textContent = 'Total: ' + items.length + ' / 24 | Último: ' + (items[0] ? new Date(items[0].ts).toLocaleString() : '—');
  list.innerHTML = '';
  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge">' + item.sessions + ' sesiones</span><span class="ia-badge gray">' + item.memKB + 'KB</span>' + (item.hasMemory ? '<span class="ia-badge green">memoria</span>' : '') + '<button class="ia-btn-sm red" data-del="' + idx + '">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.label;
    el.querySelector('small').textContent = new Date(item.ts).toLocaleString();
    el.querySelector('[data-del]').onclick = () => { const d = load(); d.splice(idx, 1); save(d); _refresh(); };
    list.appendChild(el);
  });
}
