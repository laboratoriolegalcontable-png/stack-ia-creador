/**
 * content-ideas.js — Banco de ideas de contenido
 * @module content-ideas
 */

const KEY = 'kairos:content-ideas';
const FORMATS = ['post', 'reel', 'article', 'thread', 'newsletter', 'podcast', 'video', 'other'];
const PLATFORMS = ['instagram', 'linkedin', 'twitter', 'youtube', 'tiktok', 'blog', 'email', 'other'];
const STATUSES = ['raw', 'refined', 'scheduled', 'published', 'discarded'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const published = items.filter(i => i.status === 'published').length;
  const pipeline = items.filter(i => ['raw', 'refined', 'scheduled'].includes(i.status)).length;
  const byFormat = {};
  const byPlatform = {};
  for (const i of items) {
    byFormat[i.format] = (byFormat[i.format] || 0) + 1;
    byPlatform[i.platform] = (byPlatform[i.platform] || 0) + 1;
  }
  return { total: items.length, published, pipeline, byFormat, byPlatform };
}

export function renderContentIdeas() {
  const existing = document.getElementById('content-ideas-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'content-ideas-panel';
  panel.className = 'kairos-panel';
  const fmtOpts = FORMATS.map(f => `<option value="${f}">${f}</option>`).join('');
  const platOpts = PLATFORMS.map(p => `<option value="${p}">${p}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/c-ideas — Ideas de Contenido</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="cideas-stats"></div>
    <form id="cideas-form" class="panel-form">
      <input id="cidea-title" placeholder="Título / idea" required>
      <input id="cidea-hook" placeholder="Hook inicial">
      <select id="cidea-format">${fmtOpts}</select>
      <select id="cidea-platform">${platOpts}</select>
      <input id="cidea-topic" placeholder="Tema / categoría">
      <input id="cidea-tags" placeholder="Tags (coma)">
      <button type="submit">Guardar idea</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="cideas-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#cideas-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('cidea-title').value.trim();
    const hook = document.getElementById('cidea-hook').value.trim();
    const format = document.getElementById('cidea-format').value;
    const platform = document.getElementById('cidea-platform').value;
    const topic = document.getElementById('cidea-topic').value.trim();
    const tags = document.getElementById('cidea-tags').value.split(',').map(s => s.trim()).filter(Boolean);
    if (!title) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, hook, format, platform, topic, tags, status: 'raw', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('cideas-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Pipeline: ${stats.pipeline} · Publicadas: ${stats.published}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('cideas-list');
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
      meta.textContent = `${item.format} · ${item.platform} · ${item.status}${item.hook ? ' · "' + item.hook.slice(0,30) + '"' : ''}`;
      const statusSelect = document.createElement('select');
      statusSelect.className = 'item-action';
      STATUSES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === item.status) opt.selected = true;
        statusSelect.appendChild(opt);
      });
      statusSelect.addEventListener('change', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].status = statusSelect.value; all[idx].updatedAt = new Date().toISOString(); save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, statusSelect, del);
      list.appendChild(li);
    }
  }
}
