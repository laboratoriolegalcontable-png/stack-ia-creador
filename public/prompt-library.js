const KEY = 'kairos:prompts';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const CAT_COLORS = { writing: 'blue', coding: 'green', analysis: 'gray', creative: 'blue', business: 'green', learning: 'gray', other: 'gray' };

export function renderPromptLibrary() {
  let panel = document.getElementById('prompt-library-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'prompt-library-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📝 Prompt Library</h2><button class="ia-close" onclick="document.getElementById('prompt-library-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="pl2-form" class="ia-form">
        <input id="pl2-title" placeholder="Título del prompt *" required />
        <textarea id="pl2-prompt" placeholder="Prompt *" rows="3" required></textarea>
        <select id="pl2-category"><option value="writing">Writing</option><option value="coding">Coding</option><option value="analysis">Analysis</option><option value="creative">Creative</option><option value="business">Business</option><option value="learning">Learning</option><option value="other">Otro</option></select>
        <input id="pl2-tags" placeholder="Tags (separados por coma)" />
        <button type="submit" class="ia-btn">Guardar prompt</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="pl2-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos</option><option value="writing">Writing</option><option value="coding">Coding</option><option value="analysis">Analysis</option><option value="creative">Creative</option><option value="business">Business</option><option value="learning">Learning</option>
        </select>
        <input id="pl2-search" placeholder="Buscar…" style="flex:1;padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)" />
      </div>
      <div id="pl2-stats" class="ia-stats-bar"></div>
      <div id="pl2-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('pl2-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), title: document.getElementById('pl2-title').value.trim(), prompt: document.getElementById('pl2-prompt').value.trim(), category: document.getElementById('pl2-category').value, tags: document.getElementById('pl2-tags').value.split(',').map(t => t.trim()).filter(Boolean), variables: [], usageCount: 0, starred: false, createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('pl2-filter').onchange = _refresh;
  document.getElementById('pl2-search').oninput = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('pl2-filter')?.value || 'all';
  const query = (document.getElementById('pl2-search')?.value || '').toLowerCase();
  const all = load();
  let items = filter === 'all' ? all : all.filter(i => i.category === filter);
  if (query) items = items.filter(i => i.title.toLowerCase().includes(query) || i.prompt.toLowerCase().includes(query) || (i.tags || []).some(t => t.toLowerCase().includes(query)));
  const stats = document.getElementById('pl2-stats');
  const list = document.getElementById('pl2-list');
  if (!stats || !list) return;
  const topUsed = all.reduce((max, i) => i.usageCount > max ? i.usageCount : max, 0);
  stats.textContent = 'Total: ' + all.length + ' | Starred: ' + all.filter(i => i.starred).length + ' | Top uses: ' + topUsed;
  list.innerHTML = '';
  items.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.usageCount - a.usageCount).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = CAT_COLORS[item.category] || 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm green" title="Copiar prompt">📋</button><button class="ia-btn-sm ' + (item.starred ? 'blue' : 'gray') + '">★</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.category;
    el.querySelectorAll('.ia-badge')[1].textContent = 'used ' + (item.usageCount || 0) + 'x';
    const [copyBtn, starBtn, delBtn] = el.querySelectorAll('button');
    copyBtn.onclick = () => {
      navigator.clipboard?.writeText(item.prompt).catch(() => {});
      const d = load(); const p = d.find(x => x.id === item.id); if (p) { p.usageCount = (p.usageCount || 0) + 1; p.updatedAt = now(); save(d); _refresh(); }
    };
    starBtn.onclick = () => { const d = load(); const p = d.find(x => x.id === item.id); if (p) { p.starred = !p.starred; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = item.prompt.slice(0, 100);
    list.appendChild(el);
  });
}
