const KEY = 'kairos:changelog';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const TYPE_COLORS = { feature: 'green', fix: 'red', improvement: 'blue', breaking: 'red', docs: 'gray' };
const TYPE_ICONS = { feature: '✨', fix: '🐛', improvement: '⚡', breaking: '💥', docs: '📝' };

export function renderChangelog() {
  let panel = document.getElementById('changelog-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'changelog-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📋 Changelog</h2><button class="ia-close" onclick="document.getElementById('changelog-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="cl-form" class="ia-form">
        <input id="cl-version" placeholder="Versión (ej. v1.2.0) *" required />
        <input id="cl-title" placeholder="Título del cambio *" required />
        <select id="cl-type"><option value="feature">✨ Feature</option><option value="fix">🐛 Fix</option><option value="improvement">⚡ Improvement</option><option value="breaking">💥 Breaking</option><option value="docs">📝 Docs</option></select>
        <textarea id="cl-description" placeholder="Descripción detallada" rows="2"></textarea>
        <input id="cl-author" placeholder="Autor" />
        <button type="submit" class="ia-btn">Agregar entrada</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <select id="cl-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text);flex:1">
          <option value="all">Todos</option><option value="feature">Features</option><option value="fix">Fixes</option><option value="improvement">Improvements</option><option value="breaking">Breaking</option><option value="docs">Docs</option>
        </select>
      </div>
      <div id="cl-stats" class="ia-stats-bar"></div>
      <div id="cl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('cl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), version: document.getElementById('cl-version').value.trim(), title: document.getElementById('cl-title').value.trim(), type: document.getElementById('cl-type').value, description: document.getElementById('cl-description').value.trim(), author: document.getElementById('cl-author').value.trim(), date: now().slice(0, 10), createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('cl-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('cl-filter')?.value || 'all';
  const all = load();
  const items = filter === 'all' ? all : all.filter(i => i.type === filter);
  const stats = document.getElementById('cl-stats');
  const list = document.getElementById('cl-list');
  if (!stats || !list) return;
  const versions = [...new Set(all.map(i => i.version))];
  const features = all.filter(i => i.type === 'feature').length;
  stats.textContent = 'Entradas: ' + all.length + ' | Versiones: ' + versions.length + ' | Features: ' + features;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = TYPE_COLORS[item.type] || 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = (TYPE_ICONS[item.type] || '') + ' ' + item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.type;
    el.querySelectorAll('.ia-badge')[1].textContent = item.version;
    el.querySelector('small').textContent = (item.description || '') + (item.author ? ' · ' + item.author : '');
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
