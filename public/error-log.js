const KEY = 'kairos:error-log';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const SEV_COLORS = { fatal: 'red', error: 'red', warning: 'blue', info: 'gray' };
const STATUS_CYCLE = ['open', 'investigating', 'resolved', 'wont-fix'];

export function renderErrorLog() {
  let panel = document.getElementById('error-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'error-log-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🚨 Error Log</h2><button class="ia-close" onclick="document.getElementById('error-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="el-form" class="ia-form">
        <input id="el-title" placeholder="Título del error *" required />
        <textarea id="el-message" placeholder="Mensaje / descripción *" rows="2" required></textarea>
        <div style="display:flex;gap:8px">
          <select id="el-severity" style="flex:1"><option value="info">Info</option><option value="warning">Warning</option><option value="error" selected>Error</option><option value="fatal">Fatal</option></select>
          <input id="el-source" placeholder="Fuente / módulo" style="flex:1" />
        </div>
        <button type="submit" class="ia-btn">Registrar error</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="el-filter-sev" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos</option><option value="fatal">Fatal</option><option value="error">Error</option><option value="warning">Warning</option><option value="info">Info</option>
        </select>
        <select id="el-filter-status" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="open">Open</option><option value="all">Todos</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option>
        </select>
      </div>
      <div id="el-stats" class="ia-stats-bar"></div>
      <div id="el-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('el-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const now2 = now();
    items.push({ id: uid(), title: document.getElementById('el-title').value.trim(), message: document.getElementById('el-message').value.trim(), severity: document.getElementById('el-severity').value, source: document.getElementById('el-source').value.trim(), status: 'open', occurrences: 1, firstSeen: now2, lastSeen: now2, createdAt: now2 });
    save(items);
    e.target.reset();
    document.getElementById('el-severity').value = 'error';
    _refresh();
  };
  document.getElementById('el-filter-sev').onchange = _refresh;
  document.getElementById('el-filter-status').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const sev = document.getElementById('el-filter-sev')?.value || 'all';
  const st = document.getElementById('el-filter-status')?.value || 'open';
  const all = load();
  let items = all;
  if (sev !== 'all') items = items.filter(i => i.severity === sev);
  if (st !== 'all') items = items.filter(i => i.status === st);
  const stats = document.getElementById('el-stats');
  const list = document.getElementById('el-list');
  if (!stats || !list) return;
  const open = all.filter(i => i.status === 'open').length;
  const fatal = all.filter(i => i.severity === 'fatal').length;
  stats.textContent = 'Total: ' + all.length + ' | Open: ' + open + ' | Fatal: ' + fatal;
  list.innerHTML = '';
  const sevOrder = { fatal: 0, error: 1, warning: 2, info: 3 };
  items.sort((a, b) => (sevOrder[a.severity] || 1) - (sevOrder[b.severity] || 1) || b.lastSeen.localeCompare(a.lastSeen)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = SEV_COLORS[item.severity] || 'gray';
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm gray" title="+1 ocurrencia">+1</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.severity;
    el.querySelectorAll('.ia-badge')[1].textContent = item.status + ' (' + (item.occurrences || 1) + 'x)';
    const [advBtn, incrBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + next;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.status = next; save(d); _refresh(); } };
    incrBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.occurrences = (r.occurrences || 1) + 1; r.lastSeen = now(); save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = (item.source ? '[' + item.source + '] ' : '') + item.message.slice(0, 100);
    list.appendChild(el);
  });
}
