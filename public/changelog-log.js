/**
 * changelog-log.js — Registro de cambios y versiones
 * @module changelog-log
 */

const KEY = 'kairos:changelog';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const TYPE_COLORS = {
  feature: 'green',
  fix: 'blue',
  breaking: 'red',
  improvement: 'yellow',
  deprecation: 'grey',
  security: 'red',
};

export function renderChangelogLog() {
  let panel = document.getElementById('changeloglog-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'changeloglog-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>/changeloglog — Changelog</h2><button class="ia-close" id="changeloglog-close">✕</button></div>
    <div class="ia-panel-body">
      <form id="changeloglog-form" class="ia-form">
        <div style="display:flex;gap:8px">
          <input id="cl-version" placeholder="Versión (ej: 1.2.0) *" style="flex:1" required />
          <select id="cl-type" style="flex:1">
            <option value="feature">Feature</option>
            <option value="fix">Fix</option>
            <option value="breaking">Breaking</option>
            <option value="improvement">Improvement</option>
            <option value="deprecation">Deprecation</option>
            <option value="security">Security</option>
          </select>
        </div>
        <input id="cl-title" placeholder="Título del cambio *" required />
        <input id="cl-project" placeholder="Proyecto" />
        <input id="cl-author" placeholder="Autor" />
        <textarea id="cl-description" placeholder="Descripción detallada" rows="3"></textarea>
        <button type="submit" class="ia-btn">Agregar entrada</button>
      </form>
      <div id="changeloglog-stats" class="ia-stats"></div>
      <ul id="changeloglog-list"></ul>
    </div>`;
  document.body.appendChild(panel);

  document.getElementById('changeloglog-close').addEventListener('click', () => { panel.style.display = 'none'; });

  document.getElementById('changeloglog-form').addEventListener('submit', e => {
    e.preventDefault();
    const items = load();
    items.unshift({
      id: uid(),
      version: document.getElementById('cl-version').value.trim(),
      title: document.getElementById('cl-title').value.trim(),
      type: document.getElementById('cl-type').value,
      project: document.getElementById('cl-project').value.trim(),
      author: document.getElementById('cl-author').value.trim(),
      description: document.getElementById('cl-description').value.trim(),
      isPublished: false,
      createdAt: now(),
    });
    save(items);
    e.target.reset();
    _refresh();
  });

  _refresh();
}

function _refresh() {
  const items = load();
  const statsEl = document.getElementById('changeloglog-stats');
  const listEl = document.getElementById('changeloglog-list');
  if (!statsEl || !listEl) return;

  const total = items.length;
  const published = items.filter(i => i.isPublished).length;
  const byType = {};
  for (const i of items) byType[i.type] = (byType[i.type] || 0) + 1;
  const typeSummary = Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(' · ');

  statsEl.textContent = `Total: ${total} · Publicadas: ${published}${typeSummary ? ' · ' + typeSummary : ''}`;

  listEl.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'ia-list-item';

    const versionBadge = document.createElement('span');
    versionBadge.className = 'ia-badge';
    versionBadge.textContent = `v${item.version}`;

    const typeBadge = document.createElement('span');
    typeBadge.className = `ia-badge ${TYPE_COLORS[item.type] || 'grey'}`;
    typeBadge.textContent = item.type;

    const title = document.createElement('strong');
    title.textContent = item.title;

    const project = document.createElement('small');
    project.textContent = item.project ? ` [${item.project}]` : '';

    const author = document.createElement('small');
    author.textContent = item.author ? ` · ${item.author}` : '';

    const publishBtn = document.createElement('button');
    publishBtn.className = 'ia-btn-sm';
    publishBtn.textContent = item.isPublished ? 'Publicado' : 'Publicar';
    publishBtn.disabled = item.isPublished;
    publishBtn.addEventListener('click', () => {
      const all = load();
      const idx = all.findIndex(x => x.id === item.id);
      if (idx !== -1) { all[idx].isPublished = true; save(all); _refresh(); }
    });

    const del = document.createElement('button');
    del.className = 'ia-btn-sm red';
    del.textContent = '✕';
    del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });

    li.append(versionBadge, typeBadge, title, project, author, publishBtn, del);
    listEl.appendChild(li);
  }
}
