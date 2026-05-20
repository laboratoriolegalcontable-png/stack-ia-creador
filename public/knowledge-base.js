const KEY = 'kairos:kb';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const CATEGORIES = { process: '📋', technical: '💻', business: '💼', legal: '⚖️', onboarding: '🚀', faq: '❓', other: '📝' };
const STATUS_COLORS = { draft: 'gray', published: 'green', archived: 'gray', 'needs-review': 'blue' };
const STATUS_CYCLE = ['draft', 'published', 'archived', 'needs-review'];

function slugify(title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function renderKnowledgeBase() {
  let panel = document.getElementById('knowledge-base-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'knowledge-base-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📚 Knowledge Base</h2><button class="ia-close" onclick="document.getElementById('knowledge-base-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="kb2-form" class="ia-form">
        <input id="kb2-title" placeholder="Título *" required />
        <div style="display:flex;gap:8px">
          <select id="kb2-category" style="flex:1">
            <option value="process">📋 Process</option>
            <option value="technical">💻 Technical</option>
            <option value="business">💼 Business</option>
            <option value="legal">⚖️ Legal</option>
            <option value="onboarding">🚀 Onboarding</option>
            <option value="faq">❓ FAQ</option>
            <option value="other">📝 Other</option>
          </select>
          <select id="kb2-status" style="flex:1">
            <option value="draft" selected>Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="needs-review">Needs Review</option>
          </select>
        </div>
        <input id="kb2-author" placeholder="Autor *" required />
        <textarea id="kb2-content" placeholder="Contenido *" rows="4" required></textarea>
        <input id="kb2-tags" placeholder="Tags (separados por coma)" />
        <button type="submit" class="ia-btn">Agregar artículo</button>
      </form>
      <input id="kb2-search" placeholder="Buscar..." style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text);box-sizing:border-box;margin-bottom:8px" />
      <div id="kb2-stats" class="ia-stats-bar"></div>
      <div id="kb2-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('kb2-form').onsubmit = e => {
    e.preventDefault();
    const title = document.getElementById('kb2-title').value.trim();
    const items = load();
    items.unshift({
      id: uid(),
      title,
      slug: slugify(title),
      category: document.getElementById('kb2-category').value,
      status: document.getElementById('kb2-status').value,
      author: document.getElementById('kb2-author').value.trim(),
      content: document.getElementById('kb2-content').value.trim(),
      tags: document.getElementById('kb2-tags').value.split(',').map(s => s.trim()).filter(Boolean),
      helpful: 0,
      notHelpful: 0,
      createdAt: now()
    });
    save(items);
    e.target.reset();
    document.getElementById('kb2-status').value = 'draft';
    _refresh();
  };
  document.getElementById('kb2-search').oninput = _refresh;
  _refresh();
}

function _refresh() {
  const all = load();
  const stats = document.getElementById('kb2-stats');
  const list = document.getElementById('kb2-list');
  const searchEl = document.getElementById('kb2-search');
  if (!stats || !list) return;
  const published = all.filter(a => a.status === 'published').length;
  const drafts = all.filter(a => a.status === 'draft').length;
  const catCounts = {};
  all.filter(a => a.status === 'published').forEach(a => { catCounts[a.category] = (catCounts[a.category] || 0) + 1; });
  const topCat = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0] || '—';
  stats.textContent = 'Total: ' + all.length + ' | Published: ' + published + ' | Drafts: ' + drafts + ' | Most viewed: ' + topCat;
  const q = (searchEl?.value || '').toLowerCase();
  let items = q ? all.filter(a =>
    a.title.toLowerCase().includes(q) ||
    (a.tags || []).some(t => t.toLowerCase().includes(q)) ||
    (a.content || '').toLowerCase().includes(q)
  ) : all;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const stColor = STATUS_COLORS[item.status] || 'gray';
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    const icon = CATEGORIES[item.category] || '📝';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + stColor + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm blue">👍 0</button><button class="ia-btn-sm gray">👎 0</button><button class="ia-btn-sm blue"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = icon + ' ' + item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.status;
    badges[1].textContent = item.category;
    const [helpfulBtn, notHelpfulBtn, advBtn, delBtn] = el.querySelectorAll('button');
    helpfulBtn.textContent = '👍 ' + (item.helpful || 0);
    notHelpfulBtn.textContent = '👎 ' + (item.notHelpful || 0);
    helpfulBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.helpful = (r.helpful || 0) + 1; save(d); _refresh(); } };
    notHelpfulBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.notHelpful = (r.notHelpful || 0) + 1; save(d); _refresh(); } };
    advBtn.textContent = '→ ' + next;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.status = next; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = (item.author ? item.author + ' · ' : '') + (item.tags?.join(', ') || '') + (item.slug ? ' [/' + item.slug + ']' : '');
    list.appendChild(el);
  });
}
