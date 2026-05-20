const KEY = 'kairos:bugs';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderBugLog() {
  let panel = document.getElementById('buglog-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'buglog-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🐛 Bug Log</h2><button class="ia-close" onclick="document.getElementById('buglog-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="bl-form" class="ia-form">
        <input id="bl-title" placeholder="Título del bug *" required />
        <input id="bl-description" placeholder="Descripción" />
        <select id="bl-severity"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
        <input id="bl-component" placeholder="Componente / área" />
        <button type="submit" class="ia-btn">Reportar bug</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="bl-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos</option><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="wont-fix">Wont Fix</option>
        </select>
      </div>
      <div id="bl-stats" class="ia-stats-bar"></div>
      <div id="bl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('bl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), title: document.getElementById('bl-title').value.trim(), description: document.getElementById('bl-description').value.trim(), severity: document.getElementById('bl-severity').value, component: document.getElementById('bl-component').value.trim(), status: 'open', reportedAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('bl-severity').value = 'medium';
    _refresh();
  };
  document.getElementById('bl-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('bl-filter')?.value || 'all';
  let items = load();
  const all = items;
  if (filter !== 'all') items = items.filter(i => i.status === filter);
  const stats = document.getElementById('bl-stats');
  const list = document.getElementById('bl-list');
  if (!stats || !list) return;
  const open = all.filter(i => i.status === 'open').length;
  const critical = all.filter(i => i.severity === 'critical').length;
  stats.textContent = 'Total: ' + all.length + ' | Open: ' + open + ' | Critical: ' + critical;
  list.innerHTML = '';
  items.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] || 2) - (order[b.severity] || 2) || b.reportedAt.localeCompare(a.reportedAt);
  }).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const sevColor = item.severity === 'critical' ? 'red' : item.severity === 'high' ? 'blue' : 'gray';
    const statuses = ['open', 'in-progress', 'resolved', 'wont-fix'];
    const next = statuses[(statuses.indexOf(item.status) + 1) % statuses.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + sevColor + '"></span><span class="ia-badge"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title;
    el.querySelector('small').textContent = (item.component || '') + (item.description ? (item.component ? ' · ' : '') + item.description.slice(0, 80) : '');
    const badges = el.querySelectorAll('.ia-badge'); badges[0].textContent = item.severity; badges[1].textContent = item.status;
    const [nextBtn, delBtn] = el.querySelectorAll('button'); nextBtn.textContent = '→ ' + next;
    nextBtn.onclick = () => { const d = load(); const b = d.find(x => x.id === item.id); if (b) { b.status = next; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
