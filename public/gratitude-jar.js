/**
 * gratitude-jar.js — Tarro de gratitud con categorías y racha
 * @module gratitude-jar
 */

const KEY = 'kairos:gratitude-jar';
const CATEGORIES = ['personas', 'trabajo', 'salud', 'aprendizaje', 'momentos', 'general'];

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
  const byCategory = {};
  for (const e of items) byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  const today = localDate();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth()+1).padStart(2,'0')}-${String(weekAgo.getDate()).padStart(2,'0')}`;
  const thisWeek = items.filter(i => i.date >= weekAgoStr).length;
  const dates = [...new Set(items.map(i => i.date))].sort().reverse();
  let streak = 0;
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const exp = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (dates[i] === exp) streak++;
    else break;
  }
  return { total: items.length, byCategory, thisWeek, streakDays: streak };
}

export function renderGratitudeJar() {
  const existing = document.getElementById('gratitude-jar-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'gratitude-jar-panel';
  panel.className = 'kairos-panel';
  const catOpts = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/jar — Tarro de Gratitud</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="jar-stats"></div>
    <form id="jar-form" class="panel-form">
      <input id="jar-text" placeholder="Hoy agradezco..." required>
      <select id="jar-cat">${catOpts}</select>
      <input id="jar-date" type="date">
      <button type="submit">Agregar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${CATEGORIES.map(c => `<button class="filter-btn" data-filter="${c}">${c}</button>`).join('')}
    </div>
    <ul id="jar-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });
  document.getElementById('jar-date').value = localDate();

  panel.querySelector('#jar-form').addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('jar-text').value.trim();
    const category = document.getElementById('jar-cat').value;
    const date = document.getElementById('jar-date').value || localDate();
    if (!text) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), text, category, date });
    save(items);
    e.target.reset();
    document.getElementById('jar-date').value = localDate();
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
    const statsEl = document.getElementById('jar-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Esta semana: ${stats.thisWeek} · Racha: ${stats.streakDays}d`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.category === activeFilter);
    const list = document.getElementById('jar-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = item.text;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.category} · ${item.date}`;
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, del);
      list.appendChild(li);
    }
  }
}
