const KEY = 'kairos:links';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const CAT_ICONS = { article: '📄', tool: '🔧', reference: '📚', resource: '🗂️', video: '🎬', other: '🔗' };

export function renderLinkVault() {
  let panel = document.getElementById('link-vault-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'link-vault-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🔗 Link Vault</h2><button class="ia-close" onclick="document.getElementById('link-vault-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="lv-form" class="ia-form">
        <input id="lv-url" placeholder="URL *" required />
        <input id="lv-title" placeholder="Título *" required />
        <select id="lv-category"><option value="article">📄 Article</option><option value="tool">🔧 Tool</option><option value="reference">📚 Reference</option><option value="resource">🗂️ Resource</option><option value="video">🎬 Video</option><option value="other">🔗 Otro</option></select>
        <input id="lv-tags" placeholder="Tags (separados por coma)" />
        <textarea id="lv-description" placeholder="Descripción / notas" rows="1"></textarea>
        <button type="submit" class="ia-btn">Guardar link</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="lv-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos</option><option value="article">Articles</option><option value="tool">Tools</option><option value="reference">References</option><option value="resource">Resources</option><option value="video">Videos</option>
        </select>
        <input id="lv-search" placeholder="Buscar…" style="flex:1;padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)" />
      </div>
      <div id="lv-stats" class="ia-stats-bar"></div>
      <div id="lv-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('lv-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), url: document.getElementById('lv-url').value.trim(), title: document.getElementById('lv-title').value.trim(), category: document.getElementById('lv-category').value, tags: document.getElementById('lv-tags').value.split(',').map(t => t.trim()).filter(Boolean), description: document.getElementById('lv-description').value.trim(), starred: false, createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('lv-filter').onchange = _refresh;
  document.getElementById('lv-search').oninput = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('lv-filter')?.value || 'all';
  const query = (document.getElementById('lv-search')?.value || '').toLowerCase();
  const all = load();
  let items = filter === 'all' ? all : all.filter(i => i.category === filter);
  if (query) items = items.filter(i => i.title.toLowerCase().includes(query) || i.url.toLowerCase().includes(query) || (i.description || '').toLowerCase().includes(query) || (i.tags || []).some(t => t.toLowerCase().includes(query)));
  const stats = document.getElementById('lv-stats');
  const list = document.getElementById('lv-list');
  if (!stats || !list) return;
  stats.textContent = 'Total: ' + all.length + ' | Starred: ' + all.filter(i => i.starred).length + ' | Mostrando: ' + items.length;
  list.innerHTML = '';
  items.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><button class="ia-btn-sm ' + (item.starred ? 'blue' : 'gray') + '">★</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = (CAT_ICONS[item.category] || '🔗') + ' ' + item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.category;
    const [starBtn, delBtn] = el.querySelectorAll('button');
    starBtn.onclick = () => { const d = load(); const l = d.find(x => x.id === item.id); if (l) { l.starred = !l.starred; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = item.url.slice(0, 60) + (item.description ? ' · ' + item.description.slice(0, 60) : '');
    list.appendChild(el);
  });
}
