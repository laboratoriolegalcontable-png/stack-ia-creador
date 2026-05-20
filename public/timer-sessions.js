/**
 * timer-sessions.js — Registro de sesiones Pomodoro y trabajo profundo
 * @module timer-sessions
 */

const KEY = 'kairos:timer-sessions';
const TYPES = ['pomodoro', 'deep-work', 'break', 'custom'];
const TYPE_ES = { pomodoro: 'Pomodoro', 'deep-work': 'Trabajo profundo', break: 'Descanso', custom: 'Personalizado' };

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const completed = items.filter(s => s.completed);
  const totalMinutes = completed.reduce((s, t) => s + t.durationMinutes, 0);
  const today = localDate();
  const todayMinutes = completed.filter(s => s.date === today).reduce((s, t) => s + t.durationMinutes, 0);
  const byType = {};
  for (const s of completed) byType[s.type] = (byType[s.type] || 0) + s.durationMinutes;
  return { total: items.length, completed: completed.length, totalMinutes, todayMinutes, byType };
}

export function renderTimerSessions() {
  const existing = document.getElementById('timer-sessions-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'timer-sessions-panel';
  panel.className = 'kairos-panel';
  const typeOpts = TYPES.map(t => `<option value="${t}">${TYPE_ES[t]}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/timer — Sesiones de Trabajo</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="timer-stats"></div>
    <form id="timer-form" class="panel-form">
      <select id="timer-type">${typeOpts}</select>
      <input id="timer-duration" type="number" min="1" max="480" placeholder="Minutos" required>
      <input id="timer-task" placeholder="Tarea (opcional)">
      <input id="timer-project" placeholder="Proyecto (opcional)">
      <input id="timer-date" type="date">
      <label><input id="timer-completed" type="checkbox" checked> Completada</label>
      <button type="submit">Registrar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      <button class="filter-btn" data-filter="today">Hoy</button>
      ${TYPES.map(t => `<button class="filter-btn" data-filter="${t}">${TYPE_ES[t]}</button>`).join('')}
    </div>
    <ul id="timer-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });
  document.getElementById('timer-date').value = localDate();

  panel.querySelector('#timer-form').addEventListener('submit', e => {
    e.preventDefault();
    const type = document.getElementById('timer-type').value;
    const durationMinutes = parseInt(document.getElementById('timer-duration').value, 10);
    const task = document.getElementById('timer-task').value.trim();
    const project = document.getElementById('timer-project').value.trim();
    const date = document.getElementById('timer-date').value || localDate();
    const completed = document.getElementById('timer-completed').checked;
    if (!durationMinutes || durationMinutes <= 0) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), type, durationMinutes, task, project, date, completed });
    save(items);
    e.target.reset();
    document.getElementById('timer-date').value = localDate();
    document.getElementById('timer-completed').checked = true;
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
    const statsEl = document.getElementById('timer-stats');
    if (statsEl) statsEl.textContent = `Hoy: ${stats.todayMinutes}min · Total: ${stats.totalMinutes}min · Sesiones: ${stats.completed}`;
    const today = localDate();
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'today' ? items.filter(i => i.date === today)
      : activeFilter === 'all' ? items : items.filter(i => i.type === activeFilter);
    const list = document.getElementById('timer-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item' + (!item.completed ? ' item-pending' : '');
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${item.durationMinutes}min · ${TYPE_ES[item.type] || item.type}${item.task ? ' — ' + item.task : ''}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.date}${item.project ? ' · ' + item.project : ''}${!item.completed ? ' · incompleta' : ''}`;
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, del);
      list.appendChild(li);
    }
  }
}
