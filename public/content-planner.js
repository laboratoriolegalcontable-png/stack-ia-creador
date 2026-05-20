const KEY = 'kairos:content-planner';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUSES = ['idea', 'drafting', 'review', 'scheduled', 'published', 'cancelled'];
const STATUS_COLORS = { idea: 'gray', drafting: 'blue', review: 'blue', scheduled: 'green', published: 'green', cancelled: 'red' };
const PLATFORM_ICONS = { instagram: '📸', linkedin: '💼', twitter: '🐦', tiktok: '🎵', youtube: '▶️', blog: '✍️', email: '📧', other: '📝' };

export function renderContentPlanner() {
  let panel = document.getElementById('content-planner-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'content-planner-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📅 Content Planner</h2><button class="ia-close" onclick="document.getElementById('content-planner-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="cp-form" class="ia-form">
        <input id="cp-title" placeholder="Título *" required />
        <div style="display:flex;gap:8px">
          <select id="cp-platform" style="flex:1">
            <option value="instagram">📸 Instagram</option>
            <option value="linkedin">💼 LinkedIn</option>
            <option value="twitter">🐦 Twitter</option>
            <option value="tiktok">🎵 TikTok</option>
            <option value="youtube">▶️ YouTube</option>
            <option value="blog">✍️ Blog</option>
            <option value="email">📧 Email</option>
            <option value="other">📝 Other</option>
          </select>
          <select id="cp-type" style="flex:1">
            <option value="reel">Reel</option>
            <option value="post">Post</option>
            <option value="story">Story</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="thread">Thread</option>
            <option value="newsletter">Newsletter</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <select id="cp-status" style="flex:1">
            <option value="idea" selected>Idea</option>
            <option value="drafting">Drafting</option>
            <option value="review">Review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input id="cp-scheduled" type="date" placeholder="Publicar el (opcional)" style="flex:1" />
        </div>
        <textarea id="cp-caption" placeholder="Caption (opcional)" rows="2"></textarea>
        <div style="display:flex;gap:8px">
          <input id="cp-hashtags" placeholder="#hashtags (coma)" style="flex:1" />
          <input id="cp-pillar" placeholder="Content pillar (opcional)" style="flex:1" />
        </div>
        <textarea id="cp-notes" placeholder="Notas (opcional)" rows="2"></textarea>
        <button type="submit" class="ia-btn">Agregar contenido</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="cp-filter-platform" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todas las plataformas</option>
          <option value="instagram">📸 Instagram</option>
          <option value="linkedin">💼 LinkedIn</option>
          <option value="twitter">🐦 Twitter</option>
          <option value="tiktok">🎵 TikTok</option>
          <option value="youtube">▶️ YouTube</option>
          <option value="blog">✍️ Blog</option>
          <option value="email">📧 Email</option>
          <option value="other">📝 Other</option>
        </select>
        <select id="cp-filter-status" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos los estados</option>
          <option value="idea">Idea</option>
          <option value="drafting">Drafting</option>
          <option value="review">Review</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div id="cp-stats" class="ia-stats-bar"></div>
      <div id="cp-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('cp-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({
      id: uid(), createdAt: now(),
      title: document.getElementById('cp-title').value.trim(),
      platform: document.getElementById('cp-platform').value,
      contentType: document.getElementById('cp-type').value,
      status: document.getElementById('cp-status').value,
      scheduledFor: document.getElementById('cp-scheduled').value || null,
      caption: document.getElementById('cp-caption').value.trim(),
      hashtags: document.getElementById('cp-hashtags').value.trim(),
      pillar: document.getElementById('cp-pillar').value.trim(),
      notes: document.getElementById('cp-notes').value.trim()
    });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('cp-filter-platform').onchange = _refresh;
  document.getElementById('cp-filter-status').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const platformSel = document.getElementById('cp-filter-platform');
  const statusSel = document.getElementById('cp-filter-status');
  if (!platformSel || !statusSel) return;
  const platform = platformSel.value;
  const status = statusSel.value;
  const all = load();
  let items = all;
  if (platform !== 'all') items = items.filter(i => i.platform === platform);
  if (status !== 'all') items = items.filter(i => i.status === status);
  items = items.slice().sort((a, b) => {
    if (a.scheduledFor && b.scheduledFor) return a.scheduledFor.localeCompare(b.scheduledFor);
    if (a.scheduledFor) return -1;
    if (b.scheduledFor) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const stats = document.getElementById('cp-stats');
  const list = document.getElementById('cp-list');
  if (!stats || !list) return;
  const published = all.filter(i => i.status === 'published').length;
  const scheduled = all.filter(i => i.status === 'scheduled').length;
  const drafts = all.filter(i => i.status === 'drafting' || i.status === 'review').length;
  stats.textContent = 'Total: ' + all.length + ' | Published: ' + published + ' | Scheduled: ' + scheduled + ' | Drafts: ' + drafts;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const platIcon = PLATFORM_ICONS[item.platform] || '📝';
    const statusColor = STATUS_COLORS[item.status] || 'gray';
    const nextStatus = STATUSES[(STATUSES.indexOf(item.status) + 1) % STATUSES.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge ' + statusColor + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = platIcon + ' ' + item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.platform;
    badges[1].textContent = item.status;
    badges[2].textContent = item.contentType;
    const [advBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + nextStatus;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.status = nextStatus; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const parts = [];
    if (item.scheduledFor) parts.push('📅 ' + item.scheduledFor);
    if (item.hashtags) {
      const tags = item.hashtags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
      if (tags.length) parts.push(tags.map(t => (t.startsWith('#') ? t : '#' + t)).join(' '));
    }
    el.querySelector('small').textContent = parts.join(' · ');
    list.appendChild(el);
  });
}
