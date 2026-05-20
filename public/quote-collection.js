/**
 * quote-collection.js — Colección de citas y frases inspiradoras
 * @module quote-collection
 */

const KEY = 'kairos:quote-collection';
const CATEGORIES = ['motivacion', 'estrategia', 'liderazgo', 'filosofia', 'negocios', 'vida', 'otro'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const favorites = items.filter(q => q.favorite).length;
  const byCategory = {};
  for (const q of items) byCategory[q.category] = (byCategory[q.category] || 0) + 1;
  return { total: items.length, favorites, byCategory };
}

export function renderQuoteCollection() {
  const existing = document.getElementById('quote-collection-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'quote-collection-panel';
  panel.className = 'kairos-panel';
  const catOpts = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/quotes — Colección de Citas</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="quotes-stats"></div>
    <form id="quotes-form" class="panel-form">
      <textarea id="quote-text" placeholder="Cita o frase..." rows="3" required></textarea>
      <input id="quote-author" placeholder="Autor">
      <select id="quote-cat">${catOpts}</select>
      <input id="quote-source" placeholder="Fuente (libro, podcast...)">
      <button type="submit">Guardar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      <button class="filter-btn" data-filter="favorites">★ Favoritas</button>
      ${CATEGORIES.map(c => `<button class="filter-btn" data-filter="${c}">${c}</button>`).join('')}
    </div>
    <ul id="quotes-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#quotes-form').addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('quote-text').value.trim();
    const author = document.getElementById('quote-author').value.trim();
    const category = document.getElementById('quote-cat').value;
    const source = document.getElementById('quote-source').value.trim();
    if (!text) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), text, author, category, source, favorite: false, shared: false, createdAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('quotes-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Favoritas: ${stats.favorites}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    let filtered = items;
    if (activeFilter === 'favorites') filtered = items.filter(i => i.favorite);
    else if (activeFilter !== 'all') filtered = items.filter(i => i.category === activeFilter);
    const list = document.getElementById('quotes-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const textEl = document.createElement('span');
      textEl.className = 'item-title';
      textEl.textContent = `"${item.text}"`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.author ? item.author + ' · ' : ''}${item.category}${item.source ? ' · ' + item.source : ''}`;
      const favBtn = document.createElement('button');
      favBtn.className = 'item-action';
      favBtn.textContent = item.favorite ? '★' : '☆';
      favBtn.title = 'Favorita';
      favBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].favorite = !all[idx].favorite; save(all); _refresh(); }
      });
      const copyBtn = document.createElement('button');
      copyBtn.className = 'item-action';
      copyBtn.textContent = '📋';
      copyBtn.title = 'Copiar';
      copyBtn.addEventListener('click', () => {
        const fullText = item.author ? `"${item.text}" — ${item.author}` : `"${item.text}"`;
        navigator.clipboard?.writeText(fullText).catch(() => {});
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(textEl, meta, favBtn, copyBtn, del);
      list.appendChild(li);
    }
  }
}
