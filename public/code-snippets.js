/**
 * code-snippets.js — Vault de snippets de código
 * @module code-snippets
 */

const KEY = 'kairos:code-snippets';
const LANGUAGES = ['javascript', 'typescript', 'python', 'bash', 'sql', 'css', 'html', 'otro'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const byLanguage = {};
  let totalUses = 0;
  let mostUsed = null;
  let maxUses = -1;
  for (const s of items) {
    byLanguage[s.language] = (byLanguage[s.language] || 0) + 1;
    totalUses += (s.uses || 0);
    if ((s.uses || 0) > maxUses) { maxUses = s.uses || 0; mostUsed = s.title; }
  }
  return { total: items.length, byLanguage, totalUses, mostUsed };
}

export function renderCodeSnippets() {
  const existing = document.getElementById('code-snippets-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'code-snippets-panel';
  panel.className = 'kairos-panel';
  const langOpts = LANGUAGES.map(l => `<option value="${l}">${l}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/snippets — Code Snippets</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="snippets-stats"></div>
    <form id="snippets-form" class="panel-form">
      <input id="snippet-title" placeholder="Título" required>
      <select id="snippet-lang">${langOpts}</select>
      <textarea id="snippet-code" placeholder="Código..." rows="4" required></textarea>
      <input id="snippet-desc" placeholder="Descripción (opcional)">
      <input id="snippet-tags" placeholder="Tags (separados por coma)">
      <button type="submit">Guardar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${LANGUAGES.map(l => `<button class="filter-btn" data-filter="${l}">${l}</button>`).join('')}
    </div>
    <ul id="snippets-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#snippets-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('snippet-title').value.trim();
    const language = document.getElementById('snippet-lang').value;
    const code = document.getElementById('snippet-code').value;
    const description = document.getElementById('snippet-desc').value.trim();
    const tags = document.getElementById('snippet-tags').value.split(',').map(s=>s.trim()).filter(Boolean);
    if (!title || !code) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, language, code, description, tags, uses: 0, createdAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('snippets-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Usos: ${stats.totalUses}${stats.mostUsed ? ' · Más usado: ' + stats.mostUsed : ''}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.language === activeFilter);
    const list = document.getElementById('snippets-list');
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
      meta.textContent = `${item.language} · usos: ${item.uses || 0}${item.tags?.length ? ' · ' + item.tags.slice(0,3).join(', ') : ''}`;
      const copyBtn = document.createElement('button');
      copyBtn.className = 'item-action';
      copyBtn.textContent = '📋';
      copyBtn.title = 'Copiar';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(item.code).catch(() => {});
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
