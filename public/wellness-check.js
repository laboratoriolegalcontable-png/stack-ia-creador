/**
 * wellness-check.js — Registro de bienestar con métricas de salud
 * @module wellness-check
 */

const KEY = 'kairos:wellness';

const DIMENSIONS = ['físico', 'mental', 'emocional', 'social', 'espiritual'];

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
  if (items.length === 0) return { total: 0, avgScore: 0, avgEnergy: 0, streakDays: 0 };
  const avgScore = items.reduce((s, i) => s + i.score, 0) / items.length;
  const avgEnergy = items.reduce((s, i) => s + i.energy, 0) / items.length;
  const dates = [...new Set(items.map(i => i.date))].sort().reverse();
  let streak = 0;
  const today = localDate();
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const exp = `${expected.getFullYear()}-${String(expected.getMonth()+1).padStart(2,'0')}-${String(expected.getDate()).padStart(2,'0')}`;
    if (dates[i] === exp) streak++;
    else break;
  }
  return { total: items.length, avgScore: +avgScore.toFixed(1), avgEnergy: +avgEnergy.toFixed(1), streakDays: streak };
}

export function renderWellnessCheck() {
  const existing = document.getElementById('wellness-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'wellness-panel';
  panel.className = 'kairos-panel';
  const dimOpts = DIMENSIONS.map(d => `<option value="${d}">${d}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/wellness — Bienestar</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="wellness-stats"></div>
    <form id="wellness-form" class="panel-form">
      <input id="wellness-date" type="date">
      <select id="wellness-dim">${dimOpts}</select>
      <label>Bienestar (1-10): <input id="wellness-score" type="number" min="1" max="10" value="7" required></label>
      <label>Energía (1-10): <input id="wellness-energy" type="number" min="1" max="10" value="7" required></label>
      <input id="wellness-note" placeholder="Nota (opcional)">
      <button type="submit">Registrar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${DIMENSIONS.map(d => `<button class="filter-btn" data-filter="${d}">${d}</button>`).join('')}
    </div>
    <ul id="wellness-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  document.getElementById('wellness-date').value = localDate();

  panel.querySelector('#wellness-form').addEventListener('submit', e => {
    e.preventDefault();
    const date = document.getElementById('wellness-date').value || localDate();
    const dimension = document.getElementById('wellness-dim').value;
    const score = parseInt(document.getElementById('wellness-score').value, 10);
    const energy = parseInt(document.getElementById('wellness-energy').value, 10);
    const note = document.getElementById('wellness-note').value.trim();
    if (isNaN(score) || isNaN(energy)) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), date, dimension, score, energy, note });
    save(items);
    e.target.reset();
    document.getElementById('wellness-date').value = localDate();
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
    const statsEl = document.getElementById('wellness-stats');
    if (statsEl) {
      statsEl.textContent = `Registros: ${stats.total} · Bienestar avg: ${stats.avgScore} · Energía avg: ${stats.avgEnergy} · Racha: ${stats.streakDays}d`;
    }
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.dimension === activeFilter);
    const list = document.getElementById('wellness-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = item.note || `${item.dimension} — ${item.date}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.dimension} · bienestar: ${item.score}/10 · energía: ${item.energy}/10 · ${item.date}`;
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, del);
      list.appendChild(li);
    }
  }
}
