/**
 * task-inbox.js — Bandeja de entrada de tareas con prioridad y estado
 * @module task-inbox
 */

const KEY = 'kairos:tasks';

const STATUSES = ['pendiente', 'en progreso', 'bloqueada', 'completada'];
const PRIORITIES = ['alta', 'media', 'baja'];

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function getStats(items) {
  const byStatus = {};
  const byPriority = {};
  for (const t of items) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
  }
  return { total: items.length, byStatus, byPriority };
}

export function renderTaskInbox() {
  const existing = document.getElementById('task-inbox-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'task-inbox-panel';
  panel.className = 'kairos-panel';
  const statusOpts = STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');
  const priorityOpts = PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/tasks — Bandeja de Tareas</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="tasks-stats"></div>
    <form id="tasks-form" class="panel-form">
      <input id="task-title" placeholder="Título de la tarea" required>
      <input id="task-project" placeholder="Proyecto (opcional)">
      <select id="task-priority">${priorityOpts}</select>
      <input id="task-due" type="date" placeholder="Fecha límite">
      <button type="submit">Capturar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="tasks-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#tasks-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const project = document.getElementById('task-project').value.trim();
    const priority = document.getElementById('task-priority').value;
    const due = document.getElementById('task-due').value;
    if (!title) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, project, priority, due, status: 'pendiente', date: localDate() });
    save(items);
    e.target.reset();
    _refresh();
  });

  panel.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _refresh();
    });
  });

  _refresh();

  function _refresh() {
    const items = load();
    const stats = getStats(items);
    const statsEl = document.getElementById('tasks-stats');
    if (statsEl) {
      const pending = stats.byStatus['pendiente'] || 0;
      const inProgress = stats.byStatus['en progreso'] || 0;
      const high = stats.byPriority['alta'] || 0;
      statsEl.textContent = `Total: ${stats.total} · Pendientes: ${pending} · En progreso: ${inProgress} · Alta prioridad: ${high}`;
    }
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('tasks-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item' + (item.status === 'completada' ? ' item-done' : '') + (item.priority === 'alta' ? ' item-high' : '');
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = item.title;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.priority} · ${item.status}${item.project ? ' · ' + item.project : ''}${item.due ? ' · ⏰' + item.due : ''}`;
      const sel = document.createElement('select');
      sel.className = 'item-action-select';
      STATUSES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === item.status) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].status = sel.value; save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, sel, del);
      list.appendChild(li);
    }
  }
}
