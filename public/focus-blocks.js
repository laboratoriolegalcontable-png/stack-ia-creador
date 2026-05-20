/**
 * focus-blocks.js — Bloques de tiempo para trabajo profundo
 * @module focus-blocks
 */

const KEY = 'kairos:focus-blocks';
const TYPES = ['deep-work', 'meetings', 'admin', 'learning', 'creative', 'planning', 'other'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getStats(items) {
  const completed = items.filter(b => b.status === 'completed');
  const totalMinutes = completed.reduce((s, b) => s + (b.durationMinutes || 0), 0);
  const byType = {};
  for (const b of items) byType[b.type] = (byType[b.type] || 0) + 1;
  return {
    total: items.length,
    completed: completed.length,
    totalMinutes,
    completionRate: items.length > 0 ? Math.round(completed.length / items.length * 100) : 0,
    byType,
  };
}

export function renderFocusBlocks() {
  const existing = document.getElementById('focus-blocks-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'focus-blocks-panel';
  panel.className = 'kairos-panel';
  const typeOpts = TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/focus-blocks — Bloques de Foco</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="fb-stats"></div>
    <form id="fb-form" class="panel-form">
      <input id="fb-title" placeholder="Tarea / bloque" required>
      <select id="fb-type">${typeOpts}</select>
      <input id="fb-date" placeholder="Fecha (YYYY-MM-DD)">
      <input id="fb-start" placeholder="Inicio (HH:MM)" pattern="[0-9]{2}:[0-9]{2}">
      <input id="fb-duration" type="number" placeholder="Duración (min)" min="5" max="480">
      <button type="submit">Agregar bloque</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      <button class="filter-btn" data-filter="scheduled">Pendientes</button>
      <button class="filter-btn" data-filter="completed">Completados</button>
    </div>
    <ul id="fb-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#fb-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('fb-title').value.trim();
    const type = document.getElementById('fb-type').value;
    const date = document.getElementById('fb-date').value.trim() || localDate();
    const startTime = document.getElementById('fb-start').value.trim() || '';
    const durationMinutes = parseInt(document.getElementById('fb-duration').value) || 0;
    if (!title) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, type, date, startTime, durationMinutes, status: 'scheduled', interruptions: 0, createdAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('fb-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Completados: ${stats.completed} · ${stats.totalMinutes}min · Tasa: ${stats.completionRate}%`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('fb-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = item.title;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.type} · ${item.date}${item.startTime ? ' ' + item.startTime : ''}${item.durationMinutes ? ' · ' + item.durationMinutes + 'min' : ''} · ${item.status}`;
      const doneBtn = document.createElement('button');
      doneBtn.className = 'item-action';
      doneBtn.textContent = item.status === 'completed' ? '↩' : '✓';
      doneBtn.title = item.status === 'completed' ? 'Reabrir' : 'Completar';
      doneBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].status = all[idx].status === 'completed' ? 'scheduled' : 'completed'; save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, doneBtn, del);
      list.appendChild(li);
    }
  }
}
