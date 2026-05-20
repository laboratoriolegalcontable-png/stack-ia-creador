/**
 * personal-brand.js — Biblioteca de assets de marca personal
 * @module personal-brand
 */

const KEY = 'kairos:personal-brand';
const TYPES = ['bio', 'tagline', 'value-prop', 'testimonial', 'case-study', 'portfolio', 'post-template', 'other'];
const PLATFORMS = ['linkedin', 'twitter', 'instagram', 'website', 'email', 'pitch', 'general'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const active = items.filter(a => a.isActive).length;
  const totalUses = items.reduce((s, a) => s + (a.uses || 0), 0);
  const byType = {};
  let mostUsed = null;
  let maxUses = -1;
  for (const a of items) {
    byType[a.type] = (byType[a.type] || 0) + 1;
    if ((a.uses || 0) > maxUses) { maxUses = a.uses || 0; mostUsed = a.title; }
  }
  return { total: items.length, active, totalUses, byType, mostUsed };
}

export function renderPersonalBrand() {
  const existing = document.getElementById('personal-brand-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'personal-brand-panel';
  panel.className = 'kairos-panel';
  const typeOpts = TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  const platOpts = PLATFORMS.map(p => `<option value="${p}">${p}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/brand — Marca Personal</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="brand-stats"></div>
    <form id="brand-form" class="panel-form">
      <input id="brand-title" placeholder="Nombre del asset" required>
      <select id="brand-type">${typeOpts}</select>
      <select id="brand-platform">${platOpts}</select>
      <textarea id="brand-content" placeholder="Contenido del asset..." rows="4" required></textarea>
      <input id="brand-tags" placeholder="Tags (coma)">
      <button type="submit">Guardar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${TYPES.map(t => `<button class="filter-btn" data-filter="${t}">${t}</button>`).join('')}
    </div>
    <ul id="brand-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#brand-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('brand-title').value.trim();
    const type = document.getElementById('brand-type').value;
    const platform = document.getElementById('brand-platform').value;
    const content = document.getElementById('brand-content').value.trim();
    const tags = document.getElementById('brand-tags').value.split(',').map(s => s.trim()).filter(Boolean);
    if (!title || !content) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, type, platform, content, tags, isActive: true, uses: 0, version: 1, createdAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('brand-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Activos: ${stats.active} · Usos: ${stats.totalUses}${stats.mostUsed ? ' · Top: ' + stats.mostUsed : ''}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.type === activeFilter);
    const list = document.getElementById('brand-list');
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
      meta.textContent = `${item.type} · ${item.platform} · usos: ${item.uses || 0}${item.tags?.length ? ' · ' + item.tags.slice(0,2).join(', ') : ''}`;
      const copyBtn = document.createElement('button');
      copyBtn.className = 'item-action';
      copyBtn.textContent = '📋';
      copyBtn.title = 'Copiar y registrar uso';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(item.content).catch(() => {});
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].uses = (all[idx].uses || 0) + 1; save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, copyBtn, del);
      list.appendChild(li);
    }
  }
}
