/**
 * vision-board.js — Tablero de visión personal
 * @module vision-board
 */

const KEY = 'kairos:vision-board';
const CATEGORIES = ['carrera', 'finanzas', 'salud', 'relaciones', 'aprendizaje', 'viajes', 'proyectos', 'otro'];
const STATUSES = ['activo', 'logrado', 'pausado'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const byCategory = {};
  const byStatus = {};
  for (const v of items) {
    byCategory[v.category] = (byCategory[v.category] || 0) + 1;
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
  }
  return { total: items.length, achieved: byStatus['logrado'] || 0, active: byStatus['activo'] || 0, byCategory };
}

export function renderVisionBoard() {
  const existing = document.getElementById('vision-board-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'vision-board-panel';
  panel.className = 'kairos-panel';
  const catOpts = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/vision — Tablero de Visión</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="vision-stats"></div>
    <form id="vision-form" class="panel-form">
      <input id="vision-title" placeholder="Visión / meta" required>
      <select id="vision-cat">${catOpts}</select>
      <textarea id="vision-desc" placeholder="Descripción detallada..." rows="3"></textarea>
      <input id="vision-target" placeholder="Fecha objetivo (YYYY-MM-DD)">
      <button type="submit">Agregar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="vision-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#vision-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('vision-title').value.trim();
    const category = document.getElementById('vision-cat').value;
    const description = document.getElementById('vision-desc').value.trim();
    const targetDate = document.getElementById('vision-target').value.trim();
    if (!title) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, category, description, targetDate, status: 'activo', createdAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('vision-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Activas: ${stats.active} · Logradas: ${stats.achieved}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('vision-list');
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
      meta.textContent = `${item.category} · ${item.status}${item.targetDate ? ' · ' + item.targetDate : ''}`;
      const doneBtn = document.createElement('button');
      doneBtn.className = 'item-action';
      doneBtn.textContent = item.status === 'logrado' ? '↩' : '✓';
      doneBtn.title = item.status === 'logrado' ? 'Reactivar' : 'Logrado';
      doneBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].status = all[idx].status === 'logrado' ? 'activo' : 'logrado'; save(all); _refresh(); }
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
