/**
 * daily-intention.js — Intenciones diarias con seguimiento de cumplimiento
 * @module daily-intention
 */

const KEY = 'kairos:intentions';

const CATEGORIES = ['general', 'trabajo', 'salud', 'relaciones', 'aprendizaje', 'creatividad'];

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
  const fulfilled = items.filter(i => i.fulfilled).length;
  const rate = items.length ? +(fulfilled / items.length * 100).toFixed(1) : 0;
  const dates = [...new Set(items.map(i => i.date))].sort().reverse();
  let streak = 0;
  const today = localDate();
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const exp = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (dates[i] === exp) streak++;
    else break;
  }
  return { total: items.length, fulfilled, rate, streakDays: streak };
}

export function renderDailyIntention() {
  const existing = document.getElementById('daily-intention-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'daily-intention-panel';
  panel.className = 'kairos-panel';
  const catOpts = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/intention — Intenciones Diarias</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="intention-stats"></div>
    <form id="intention-form" class="panel-form">
      <input id="intention-text" placeholder="Intención de hoy..." required>
      <select id="intention-cat">${catOpts}</select>
      <input id="intention-date" type="date">
      <button type="submit">Agregar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      <button class="filter-btn" data-filter="today">Hoy</button>
      <button class="filter-btn" data-filter="pending">Pendientes</button>
      <button class="filter-btn" data-filter="done">Cumplidas</button>
    </div>
    <ul id="intention-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });
  document.getElementById('intention-date').value = localDate();

  panel.querySelector('#intention-form').addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('intention-text').value.trim();
    const category = document.getElementById('intention-cat').value;
    const date = document.getElementById('intention-date').value || localDate();
    if (!text) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), text, category, date, fulfilled: false });
    save(items);
    e.target.reset();
    document.getElementById('intention-date').value = localDate();
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
    const statsEl = document.getElementById('intention-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Cumplidas: ${stats.fulfilled} (${stats.rate}%) · Racha: ${stats.streakDays}d`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const today = localDate();
    const filtered = activeFilter === 'today' ? items.filter(i => i.date === today)
      : activeFilter === 'pending' ? items.filter(i => !i.fulfilled)
      : activeFilter === 'done' ? items.filter(i => i.fulfilled) : items;
    const list = document.getElementById('intention-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item' + (item.fulfilled ? ' item-done' : '');
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = item.text;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.category} · ${item.date}`;
      const fulfillBtn = document.createElement('button');
      fulfillBtn.className = 'item-action';
      fulfillBtn.textContent = item.fulfilled ? '↩' : '✓';
      fulfillBtn.title = item.fulfilled ? 'Marcar pendiente' : 'Marcar cumplida';
      fulfillBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].fulfilled = !all[idx].fulfilled; save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, fulfillBtn, del);
      list.appendChild(li);
    }
  }
}
