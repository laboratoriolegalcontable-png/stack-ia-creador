/**
 * client-feedback.js — Colección de feedback de clientes
 * @module client-feedback
 */

const KEY = 'kairos:client-feedback';
const TYPES = ['praise', 'complaint', 'suggestion', 'question', 'bug-report', 'feature-request', 'other'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];
const STATUSES = ['new', 'in-review', 'actioned', 'resolved', 'dismissed'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const positive = items.filter(i => i.sentiment === 'positive').length;
  const negative = items.filter(i => i.sentiment === 'negative').length;
  const rated = items.filter(i => i.rating);
  const avgRating = rated.length > 0 ? +(rated.reduce((s, i) => s + i.rating, 0) / rated.length).toFixed(1) : 0;
  const resolved = items.filter(i => ['resolved', 'actioned'].includes(i.status)).length;
  const resolutionRate = items.length > 0 ? +(resolved / items.length * 100).toFixed(1) : 0;
  const byType = {};
  for (const i of items) byType[i.type] = (byType[i.type] || 0) + 1;
  return { total: items.length, positive, negative, avgRating, resolutionRate, byType };
}

export function renderClientFeedback() {
  const existing = document.getElementById('client-feedback-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'client-feedback-panel';
  panel.className = 'kairos-panel';
  const typeOpts = TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  const sentOpts = SENTIMENTS.map(s => `<option value="${s}">${s}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/feedback2 — Feedback de Clientes</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="fb2-stats"></div>
    <form id="fb2-form" class="panel-form">
      <input id="fb2-client" placeholder="Nombre del cliente" required>
      <select id="fb2-type">${typeOpts}</select>
      <select id="fb2-sentiment">${sentOpts}</select>
      <textarea id="fb2-content" placeholder="Contenido del feedback..." rows="3" required></textarea>
      <input id="fb2-rating" type="number" min="1" max="10" placeholder="Rating (1-10)">
      <button type="submit">Registrar feedback</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="fb2-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#fb2-form').addEventListener('submit', e => {
    e.preventDefault();
    const clientName = document.getElementById('fb2-client').value.trim();
    const type = document.getElementById('fb2-type').value;
    const sentiment = document.getElementById('fb2-sentiment').value;
    const content = document.getElementById('fb2-content').value.trim();
    const rating = parseInt(document.getElementById('fb2-rating').value) || undefined;
    if (!clientName || !content) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), clientName, type, sentiment, content, rating, status: 'new', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('fb2-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Positivo: ${stats.positive} · Negativo: ${stats.negative} · Rating avg: ${stats.avgRating} · Resueltos: ${stats.resolutionRate}%`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('fb2-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = item.clientName;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.type} · ${item.sentiment} · ${item.status}${item.rating ? ' · ★' + item.rating : ''} · ${item.content.slice(0, 40)}${item.content.length > 40 ? '…' : ''}`;
      const resolveBtn = document.createElement('button');
      resolveBtn.className = 'item-action';
      resolveBtn.textContent = item.status === 'resolved' ? '↩' : '✓';
      resolveBtn.title = item.status === 'resolved' ? 'Reabrir' : 'Resolver';
      resolveBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].status = all[idx].status === 'resolved' ? 'new' : 'resolved'; all[idx].updatedAt = new Date().toISOString(); save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, resolveBtn, del);
      list.appendChild(li);
    }
  }
}
