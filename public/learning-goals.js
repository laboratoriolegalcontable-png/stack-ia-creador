/**
 * learning-goals.js — Metas de aprendizaje con progreso
 * @module learning-goals
 */

const KEY = 'kairos:learning-goals';
const FORMATS = ['book', 'course', 'podcast', 'video', 'practice', 'mentorship', 'other'];
const STATUSES = ['planned', 'in-progress', 'completed', 'paused', 'dropped'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const completed = items.filter(g => g.status === 'completed').length;
  const inProgress = items.filter(g => g.status === 'in-progress').length;
  const totalHours = items.reduce((s, g) => s + (g.hoursSpent || 0), 0);
  const avgProgress = items.length > 0 ? Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length) : 0;
  const byFormat = {};
  for (const g of items) byFormat[g.format] = (byFormat[g.format] || 0) + 1;
  return { total: items.length, completed, inProgress, totalHours, avgProgress, byFormat };
}

export function renderLearningGoals() {
  const existing = document.getElementById('learning-goals-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'learning-goals-panel';
  panel.className = 'kairos-panel';
  const fmtOpts = FORMATS.map(f => `<option value="${f}">${f}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/learn-goals — Metas de Aprendizaje</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="lg-stats"></div>
    <form id="lg-form" class="panel-form">
      <input id="lg-title" placeholder="Título (libro, curso, habilidad)" required>
      <input id="lg-topic" placeholder="Tema / área" required>
      <select id="lg-format">${fmtOpts}</select>
      <input id="lg-hours" type="number" placeholder="Horas estimadas" min="1">
      <input id="lg-target" placeholder="Fecha objetivo (YYYY-MM-DD)">
      <button type="submit">Agregar meta</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="lg-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#lg-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('lg-title').value.trim();
    const topic = document.getElementById('lg-topic').value.trim();
    const format = document.getElementById('lg-format').value;
    const hoursEstimated = parseInt(document.getElementById('lg-hours').value) || undefined;
    const targetDate = document.getElementById('lg-target').value.trim();
    if (!title || !topic) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, topic, format, status: 'planned', progress: 0, hoursSpent: 0, hoursEstimated, targetDate, notes: '', resources: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('lg-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · En curso: ${stats.inProgress} · Completadas: ${stats.completed} · ${stats.totalHours}h · Progreso avg: ${stats.avgProgress}%`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('lg-list');
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
      meta.textContent = `${item.format} · ${item.topic} · ${item.status} · ${item.progress || 0}%${item.hoursSpent ? ' · ' + item.hoursSpent + 'h' : ''}`;
      const progressBtn = document.createElement('button');
      progressBtn.className = 'item-action';
      progressBtn.textContent = '+10%';
      progressBtn.title = 'Avanzar 10%';
      progressBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          all[idx].progress = Math.min(100, (all[idx].progress || 0) + 10);
          if (all[idx].progress > 0 && all[idx].status === 'planned') all[idx].status = 'in-progress';
          if (all[idx].progress === 100) all[idx].status = 'completed';
          save(all); _refresh();
        }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, progressBtn, del);
      list.appendChild(li);
    }
  }
}
