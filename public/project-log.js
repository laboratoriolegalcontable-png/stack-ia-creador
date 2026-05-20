/**
 * project-log.js — Bitácora de proyectos
 * @module project-log
 */

const KEY = 'kairos:project-log';
const ENTRY_TYPES = ['progress', 'blocker', 'decision', 'milestone', 'meeting', 'note'];

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
  const projects = new Set(items.map(e => e.projectName));
  const byType = {};
  const byProject = {};
  for (const e of items) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    byProject[e.projectName] = (byProject[e.projectName] || 0) + 1;
  }
  return { total: items.length, totalProjects: projects.size, byType, byProject };
}

export function renderProjectLog() {
  const existing = document.getElementById('project-log-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'project-log-panel';
  panel.className = 'kairos-panel';
  const typeOpts = ENTRY_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/plog — Bitácora de Proyectos</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="plog-stats"></div>
    <form id="plog-form" class="panel-form">
      <input id="plog-project" placeholder="Nombre del proyecto" required>
      <select id="plog-type">${typeOpts}</select>
      <textarea id="plog-content" placeholder="Contenido de la entrada..." rows="3" required></textarea>
      <input id="plog-tags" placeholder="Tags (coma)">
      <button type="submit">Registrar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      ${ENTRY_TYPES.map(t => `<button class="filter-btn" data-filter="${t}">${t}</button>`).join('')}
    </div>
    <ul id="plog-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#plog-form').addEventListener('submit', e => {
    e.preventDefault();
    const projectName = document.getElementById('plog-project').value.trim();
    const type = document.getElementById('plog-type').value;
    const content = document.getElementById('plog-content').value.trim();
    const tags = document.getElementById('plog-tags').value.split(',').map(s => s.trim()).filter(Boolean);
    if (!projectName || !content) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), projectId: projectName.toLowerCase().replace(/\s+/g, '-'), projectName, type, content, date: localDate(), tags, createdAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('plog-stats');
    if (statsEl) statsEl.textContent = `Entradas: ${stats.total} · Proyectos: ${stats.totalProjects}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.type === activeFilter);
    const list = document.getElementById('plog-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `[${item.type}] ${item.projectName}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.date} · ${item.content.slice(0, 60)}${item.content.length > 60 ? '…' : ''}`;
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, del);
      list.appendChild(li);
    }
  }
}
