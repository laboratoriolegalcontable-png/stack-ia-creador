/**
 * daily-wins.js — Registro diario de victorias
 * @module daily-wins
 */

const KEY = 'kairos:daily-wins';
const CATEGORIES = ['professional', 'personal', 'health', 'financial', 'creative', 'social', 'learning', 'other'];
const IMPACTS = ['small', 'medium', 'big'];

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
  const todayStr = localDate();
  const todayCount = items.filter(w => w.date === todayStr).length;
  const avgMood = items.length > 0 ? +(items.reduce((s, w) => s + (w.mood || 7), 0) / items.length).toFixed(1) : 0;
  const byCategory = {};
  const byImpact = {};
  for (const w of items) {
    byCategory[w.category] = (byCategory[w.category] || 0) + 1;
    byImpact[w.impact] = (byImpact[w.impact] || 0) + 1;
  }
  const dates = [...new Set(items.map(w => w.date))].sort().reverse();
  let streak = 0;
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(new Date(todayStr).getTime() - i * 86400000).toISOString().split('T')[0];
    if (dates[i] === expected) streak++;
    else break;
  }
  return { total: items.length, todayCount, avgMood, streak, byCategory, byImpact };
}

export function renderDailyWins() {
  const existing = document.getElementById('daily-wins-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'daily-wins-panel';
  panel.className = 'kairos-panel';
  const catOpts = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  const impOpts = IMPACTS.map(i => `<option value="${i}">${i}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/wins2 — Victorias del Día</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="wins2-stats"></div>
    <form id="wins2-form" class="panel-form">
      <input id="win-title" placeholder="¿Qué lograste hoy?" required>
      <textarea id="win-desc" placeholder="Descripción (opcional)" rows="2"></textarea>
      <select id="win-category">${catOpts}</select>
      <select id="win-impact">${impOpts}</select>
      <input id="win-mood" type="number" min="1" max="10" placeholder="Estado de ánimo (1-10)">
      <button type="submit">Registrar victoria</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      <button class="filter-btn" data-filter="today">Hoy</button>
      ${CATEGORIES.map(c => `<button class="filter-btn" data-filter="${c}">${c}</button>`).join('')}
    </div>
    <ul id="wins2-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#wins2-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('win-title').value.trim();
    const description = document.getElementById('win-desc').value.trim();
    const category = document.getElementById('win-category').value;
    const impact = document.getElementById('win-impact').value;
    const mood = parseInt(document.getElementById('win-mood').value) || 7;
    if (!title) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, description, category, impact, mood: Math.min(10, Math.max(1, mood)), date: localDate(), tags: [], createdAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('wins2-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Hoy: ${stats.todayCount} · Racha: ${stats.streak}d · Mood avg: ${stats.avgMood}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    let filtered = items;
    if (activeFilter === 'today') filtered = items.filter(i => i.date === localDate());
    else if (activeFilter !== 'all') filtered = items.filter(i => i.category === activeFilter);
    const list = document.getElementById('wins2-list');
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
      meta.textContent = `${item.category} · ${item.impact} · ${item.date} · mood: ${item.mood || 7}`;
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, del);
      list.appendChild(li);
    }
  }
}
