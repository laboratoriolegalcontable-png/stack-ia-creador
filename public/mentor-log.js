/**
 * mentor-log.js — Registro de sesiones de mentoría
 * @module mentor-log
 */

const KEY = 'kairos:mentor-log';

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
  const mentors = [...new Set(items.map(i => i.mentorName))];
  const avgRating = items.length ? +(items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1) : 0;
  const totalInsights = items.reduce((s, i) => s + (i.keyInsights?.length || 0), 0);
  const totalActions = items.reduce((s, i) => s + (i.actionItems?.length || 0), 0);
  return { total: items.length, mentors: mentors.length, avgRating, totalInsights, totalActions };
}

export function renderMentorLog() {
  const existing = document.getElementById('mentor-log-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'mentor-log-panel';
  panel.className = 'kairos-panel';
  panel.innerHTML = `
    <div class="panel-header"><strong>/mentor — Sesiones de Mentoría</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="mentor-stats"></div>
    <form id="mentor-form" class="panel-form">
      <input id="mentor-name" placeholder="Nombre del mentor" required>
      <input id="mentor-date" type="date">
      <input id="mentor-topics" placeholder="Temas (separados por coma)">
      <input id="mentor-insights" placeholder="Insights clave (separados por coma)">
      <input id="mentor-actions" placeholder="Acciones a tomar (separadas por coma)">
      <input id="mentor-next" placeholder="Próximos pasos (opcional)">
      <label>Calificación (1-10): <input id="mentor-rating" type="number" min="1" max="10" value="8" required></label>
      <button type="submit">Registrar</button>
    </form>
    <ul id="mentor-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });
  document.getElementById('mentor-date').value = localDate();

  panel.querySelector('#mentor-form').addEventListener('submit', e => {
    e.preventDefault();
    const mentorName = document.getElementById('mentor-name').value.trim();
    const date = document.getElementById('mentor-date').value || localDate();
    const topics = document.getElementById('mentor-topics').value.split(',').map(s=>s.trim()).filter(Boolean);
    const keyInsights = document.getElementById('mentor-insights').value.split(',').map(s=>s.trim()).filter(Boolean);
    const actionItems = document.getElementById('mentor-actions').value.split(',').map(s=>s.trim()).filter(Boolean);
    const nextSteps = document.getElementById('mentor-next').value.trim();
    const rating = parseInt(document.getElementById('mentor-rating').value, 10);
    if (!mentorName || isNaN(rating)) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), mentorName, date, topics, keyInsights, actionItems, nextSteps, rating });
    save(items);
    e.target.reset();
    document.getElementById('mentor-date').value = localDate();
    document.getElementById('mentor-rating').value = '8';
    _refresh();
  });

  _refresh();

  function _refresh() {
    const items = load();
    const stats = getStats(items);
    const statsEl = document.getElementById('mentor-stats');
    if (statsEl) statsEl.textContent = `Sesiones: ${stats.total} · Mentores: ${stats.mentors} · Avg: ${stats.avgRating}/10 · Insights: ${stats.totalInsights} · Acciones: ${stats.totalActions}`;
    const list = document.getElementById('mentor-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of items) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${item.mentorName} · ${item.rating}/10`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      const parts = [item.date];
      if (item.topics?.length) parts.push(item.topics.slice(0,2).join(', '));
      if (item.actionItems?.length) parts.push(`${item.actionItems.length} acciones`);
      meta.textContent = parts.join(' · ');
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, del);
      list.appendChild(li);
    }
  }
}
