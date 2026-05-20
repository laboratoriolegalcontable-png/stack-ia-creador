const KEY = 'kairos:anomalies';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const SEVERITY_COLORS = { high: 'red', medium: 'blue', low: 'gray' };

export function renderAnomalyReport() {
  let panel = document.getElementById('anomaly-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'anomaly-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🔍 Anomaly Detector</h2><button class="ia-close" onclick="document.getElementById('anomaly-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="an-form" class="ia-form">
        <input id="an-metric" placeholder="Métrica / área *" required />
        <textarea id="an-description" placeholder="Descripción de la anomalía *" rows="2" required></textarea>
        <div style="display:flex;gap:8px">
          <select id="an-severity" style="flex:1"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>
          <input id="an-value" placeholder="Valor detectado" style="flex:1" />
        </div>
        <input id="an-expected" placeholder="Valor esperado" />
        <button type="submit" class="ia-btn">Registrar anomalía</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <select id="an-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text);flex:1">
          <option value="all">Todas</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
      </div>
      <div id="an-stats" class="ia-stats-bar"></div>
      <div id="an-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('an-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), metric: document.getElementById('an-metric').value.trim(), description: document.getElementById('an-description').value.trim(), severity: document.getElementById('an-severity').value, value: document.getElementById('an-value').value.trim(), expected: document.getElementById('an-expected').value.trim(), resolved: false, createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('an-severity').value = 'medium';
    _refresh();
  };
  document.getElementById('an-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('an-filter')?.value || 'all';
  const all = load();
  const items = filter === 'all' ? all : all.filter(i => i.severity === filter);
  const stats = document.getElementById('an-stats');
  const list = document.getElementById('an-list');
  if (!stats || !list) return;
  const unresolved = all.filter(i => !i.resolved).length;
  const high = all.filter(i => i.severity === 'high' && !i.resolved).length;
  stats.textContent = 'Total: ' + all.length + ' | Sin resolver: ' + unresolved + ' | High: ' + high;
  list.innerHTML = '';
  items.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] || 1) - (order[b.severity] || 1) || b.createdAt.localeCompare(a.createdAt);
  }).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = SEVERITY_COLORS[item.severity] || 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><span class="ia-badge ' + (item.resolved ? 'green' : 'gray') + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.metric;
    el.querySelectorAll('.ia-badge')[0].textContent = item.severity;
    el.querySelectorAll('.ia-badge')[1].textContent = item.resolved ? '✓ resolved' : 'open';
    const [toggleBtn, delBtn] = el.querySelectorAll('button');
    toggleBtn.textContent = item.resolved ? '↺ reopen' : '✓ resolve';
    toggleBtn.onclick = () => { const d = load(); const a = d.find(x => x.id === item.id); if (a) { a.resolved = !a.resolved; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = item.description.slice(0, 100) + (item.value ? ' · val: ' + item.value : '') + (item.expected ? ' · exp: ' + item.expected : '');
    list.appendChild(el);
  });
}
