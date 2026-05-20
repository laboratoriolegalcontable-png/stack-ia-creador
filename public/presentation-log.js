const KEY = 'kairos:presentation-log';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_COLORS = { draft: 'gray', ready: 'blue', delivered: 'green', archived: 'gray' };

export function renderPresentationLog() {
  let panel = document.getElementById('presentation-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'presentation-log-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🎤 Presentation Log</h2><button class="ia-close" onclick="document.getElementById('presentation-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="pl-form" class="ia-form">
        <input id="pl-title" placeholder="Título de la presentación *" required />
        <input id="pl-audience" placeholder="Audiencia / evento" />
        <input id="pl-date" type="date" />
        <select id="pl-status"><option value="draft">Draft</option><option value="ready">Ready</option><option value="delivered" selected>Delivered</option><option value="archived">Archived</option></select>
        <input id="pl-duration" type="number" placeholder="Duración (minutos)" min="1" />
        <textarea id="pl-notes" placeholder="Notas / aprendizajes" rows="2"></textarea>
        <button type="submit" class="ia-btn">Registrar presentación</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <select id="pl-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text);flex:1">
          <option value="all">Todas</option><option value="draft">Draft</option><option value="ready">Ready</option><option value="delivered">Delivered</option><option value="archived">Archived</option>
        </select>
      </div>
      <div id="pl-stats" class="ia-stats-bar"></div>
      <div id="pl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('pl-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('pl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), title: document.getElementById('pl-title').value.trim(), audience: document.getElementById('pl-audience').value.trim(), date: document.getElementById('pl-date').value, status: document.getElementById('pl-status').value, duration: parseInt(document.getElementById('pl-duration').value) || 0, notes: document.getElementById('pl-notes').value.trim(), createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('pl-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('pl-status').value = 'delivered';
    _refresh();
  };
  document.getElementById('pl-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('pl-filter')?.value || 'all';
  const all = load();
  const items = filter === 'all' ? all : all.filter(i => i.status === filter);
  const stats = document.getElementById('pl-stats');
  const list = document.getElementById('pl-list');
  if (!stats || !list) return;
  const delivered = all.filter(i => i.status === 'delivered').length;
  const totalMin = all.reduce((s, i) => s + (i.duration || 0), 0);
  stats.textContent = 'Total: ' + all.length + ' | Entregadas: ' + delivered + ' | Tiempo total: ' + totalMin + 'min';
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = STATUS_COLORS[item.status] || 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span>' + (item.duration ? '<span class="ia-badge gray"></span>' : '') + '<button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.status;
    if (item.duration) el.querySelectorAll('.ia-badge')[1].textContent = item.duration + 'min';
    el.querySelector('small').textContent = (item.audience ? item.audience : '') + (item.date ? ' · ' + item.date : '') + (item.notes ? ' · ' + item.notes.slice(0, 60) : '');
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
