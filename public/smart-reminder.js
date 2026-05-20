const KEY = 'kairos:reminders';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const PRIORITY_COLORS = { high: 'red', medium: 'blue', low: 'gray' };
const STATUS_CYCLE = ['pending', 'done', 'snoozed', 'dismissed'];

export function renderSmartReminder() {
  let panel = document.getElementById('smart-reminder-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'smart-reminder-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>⏰ Smart Reminders</h2><button class="ia-close" onclick="document.getElementById('smart-reminder-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="sr2-form" class="ia-form">
        <input id="sr2-title" placeholder="Título del recordatorio *" required />
        <textarea id="sr2-description" placeholder="Descripción" rows="1"></textarea>
        <div style="display:flex;gap:8px">
          <input id="sr2-due" type="datetime-local" style="flex:1" />
          <select id="sr2-priority" style="flex:1"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>
        </div>
        <input id="sr2-tags" placeholder="Tags (separados por coma)" />
        <button type="submit" class="ia-btn">Crear recordatorio</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="sr2-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="pending">Pendientes</option><option value="all">Todos</option><option value="done">Done</option><option value="snoozed">Snoozed</option>
        </select>
      </div>
      <div id="sr2-stats" class="ia-stats-bar"></div>
      <div id="sr2-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('sr2-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const dueAt = document.getElementById('sr2-due').value;
    items.push({ id: uid(), title: document.getElementById('sr2-title').value.trim(), description: document.getElementById('sr2-description').value.trim(), dueAt: dueAt ? new Date(dueAt).toISOString() : null, priority: document.getElementById('sr2-priority').value, status: 'pending', tags: document.getElementById('sr2-tags').value.split(',').map(t => t.trim()).filter(Boolean), createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('sr2-priority').value = 'medium';
    _refresh();
  };
  document.getElementById('sr2-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('sr2-filter')?.value || 'pending';
  const all = load();
  const now2 = Date.now();
  const overdue = all.filter(i => i.status === 'pending' && i.dueAt && new Date(i.dueAt).getTime() < now2).length;
  const items = filter === 'all' ? all : all.filter(i => i.status === filter);
  const stats = document.getElementById('sr2-stats');
  const list = document.getElementById('sr2-list');
  if (!stats || !list) return;
  const pending = all.filter(i => i.status === 'pending').length;
  stats.textContent = 'Total: ' + all.length + ' | Pendientes: ' + pending + ' | Vencidos: ' + overdue;
  list.innerHTML = '';
  items.sort((a, b) => {
    const pri = { high: 0, medium: 1, low: 2 };
    return (pri[a.priority] || 1) - (pri[b.priority] || 1) || (a.dueAt || '').localeCompare(b.dueAt || '');
  }).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const pColor = PRIORITY_COLORS[item.priority] || 'gray';
    const isOverdue = item.status === 'pending' && item.dueAt && new Date(item.dueAt).getTime() < Date.now();
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + pColor + '"></span><span class="ia-badge ' + (isOverdue ? 'red' : 'gray') + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.priority;
    el.querySelectorAll('.ia-badge')[1].textContent = item.status + (isOverdue ? ' ⚠️' : '');
    const [advBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + nextStatus;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.status = nextStatus; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = (item.dueAt ? '📅 ' + new Date(item.dueAt).toLocaleString() : '') + (item.description ? ' · ' + item.description.slice(0, 80) : '');
    list.appendChild(el);
  });
}
