/**
 * water-tracker.js — Registro de hidratación diaria
 * @module water-tracker
 */

const KEY = 'kairos:water-log';

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
  const today = localDate();
  const todayItems = items.filter(i => i.date === today);
  const todayTotal = todayItems.reduce((s, i) => s + i.amount, 0);
  const byDay = {};
  for (const e of items) byDay[e.date] = (byDay[e.date] || 0) + e.amount;
  const days = Object.keys(byDay);
  const avgDaily = days.length ? +(Object.values(byDay).reduce((s,v)=>s+v,0)/days.length).toFixed(0) : 0;
  return { total: items.length, todayTotal, avgDaily, daysTracked: days.length };
}

export function renderWaterTracker() {
  const existing = document.getElementById('water-tracker-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'water-tracker-panel';
  panel.className = 'kairos-panel';
  panel.innerHTML = `
    <div class="panel-header"><strong>/water — Hidratación</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="water-stats"></div>
    <form id="water-form" class="panel-form">
      <input id="water-amount" type="number" min="1" placeholder="Cantidad" required>
      <select id="water-unit"><option value="ml">ml</option><option value="oz">oz</option><option value="glasses">vasos</option></select>
      <input id="water-date" type="date">
      <input id="water-note" placeholder="Nota (opcional)">
      <button type="submit">Registrar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      <button class="filter-btn" data-filter="today">Hoy</button>
    </div>
    <ul id="water-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });
  document.getElementById('water-date').value = localDate();

  panel.querySelector('#water-form').addEventListener('submit', e => {
    e.preventDefault();
    const amount = parseInt(document.getElementById('water-amount').value, 10);
    const unit = document.getElementById('water-unit').value;
    const date = document.getElementById('water-date').value || localDate();
    const note = document.getElementById('water-note').value.trim();
    if (!amount || amount <= 0) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), amount, unit, date, note });
    save(items);
    e.target.reset();
    document.getElementById('water-date').value = localDate();
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
    const statsEl = document.getElementById('water-stats');
    if (statsEl) statsEl.textContent = `Hoy: ${stats.todayTotal} · Promedio/día: ${stats.avgDaily} · Días: ${stats.daysTracked}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'today' ? items.filter(i => i.date === localDate()) : items;
    const list = document.getElementById('water-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${item.amount} ${item.unit}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.date}${item.note ? ' · ' + item.note : ''}`;
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, del);
      list.appendChild(li);
    }
  }
}
