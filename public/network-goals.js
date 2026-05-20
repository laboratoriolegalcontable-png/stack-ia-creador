/**
 * network-goals.js — Metas de networking y relaciones profesionales
 * @module network-goals
 */

const KEY = 'kairos:network-goals';
const CATEGORIES = ['cliente', 'mentor', 'colaborador', 'inversor', 'referido', 'comunidad', 'otro'];
const STATUSES = ['activo', 'en-progreso', 'logrado', 'pausado'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const achieved = items.filter(g => g.status === 'logrado').length;
  const active = items.filter(g => ['activo', 'en-progreso'].includes(g.status)).length;
  const totalProgress = items.length > 0 ? Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length) : 0;
  return { total: items.length, achieved, active, avgProgress: totalProgress };
}

export function renderNetworkGoals() {
  const existing = document.getElementById('network-goals-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'network-goals-panel';
  panel.className = 'kairos-panel';
  const catOpts = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/network-goals — Metas de Networking</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="netgoals-stats"></div>
    <form id="netgoals-form" class="panel-form">
      <input id="netgoal-title" placeholder="Meta de networking" required>
      <select id="netgoal-cat">${catOpts}</select>
      <textarea id="netgoal-desc" placeholder="Descripción / estrategia..." rows="2"></textarea>
      <input id="netgoal-target" placeholder="Fecha límite (YYYY-MM-DD)">
      <button type="submit">Agregar meta</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="netgoals-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#netgoals-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('netgoal-title').value.trim();
    const category = document.getElementById('netgoal-cat').value;
    const description = document.getElementById('netgoal-desc').value.trim();
    const targetDate = document.getElementById('netgoal-target').value.trim();
    if (!title) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, category, description, targetDate, status: 'activo', progress: 0, notes: [], createdAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('netgoals-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Activas: ${stats.active} · Logradas: ${stats.achieved} · Progreso avg: ${stats.avgProgress}%`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('netgoals-list');
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
      meta.textContent = `${item.category} · ${item.status} · ${item.progress || 0}%${item.targetDate ? ' · ' + item.targetDate : ''}`;
      const progressBtn = document.createElement('button');
      progressBtn.className = 'item-action';
      progressBtn.textContent = '+10%';
      progressBtn.title = 'Avanzar 10%';
      progressBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          all[idx].progress = Math.min(100, (all[idx].progress || 0) + 10);
          if (all[idx].progress === 100) all[idx].status = 'logrado';
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
