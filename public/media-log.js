const KEY = 'kairos:media-log';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const MEDIA_ICON = { movie: '🎬', show: '📺', podcast: '🎙️', book: '📚', other: '🎯' };

export function renderMediaLog() {
  let panel = document.getElementById('media-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'media-log-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🎬 Media Log</h2><button class="ia-close" onclick="document.getElementById('media-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ml-form" class="ia-form">
        <input id="ml-title" placeholder="Título *" required />
        <select id="ml-type"><option value="movie">🎬 Película</option><option value="show">📺 Serie</option><option value="podcast">🎙️ Podcast</option><option value="book">📚 Libro</option><option value="other">🎯 Otro</option></select>
        <input id="ml-creator" placeholder="Director / Autor / Host" />
        <input id="ml-rating" type="number" placeholder="Rating (1–5)" min="1" max="5" />
        <select id="ml-status"><option value="want">Por ver/leer</option><option value="watching">En progreso</option><option value="done">Terminado</option></select>
        <textarea id="ml-notes" placeholder="Notas / reseña" rows="2"></textarea>
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <select id="ml-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text);flex:1">
          <option value="all">Todos</option><option value="movie">Películas</option><option value="show">Series</option><option value="podcast">Podcasts</option><option value="book">Libros</option>
        </select>
      </div>
      <div id="ml-stats" class="ia-stats-bar"></div>
      <div id="ml-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ml-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const rating = parseInt(document.getElementById('ml-rating').value) || 0;
    items.push({ uid: uid(), title: document.getElementById('ml-title').value.trim(), type: document.getElementById('ml-type').value, creator: document.getElementById('ml-creator').value.trim(), rating: rating ? Math.min(5, Math.max(1, rating)) : 0, status: document.getElementById('ml-status').value, notes: document.getElementById('ml-notes').value.trim(), createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('ml-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('ml-filter')?.value || 'all';
  const all = load();
  const items = filter === 'all' ? all : all.filter(i => i.type === filter);
  const stats = document.getElementById('ml-stats');
  const list = document.getElementById('ml-list');
  if (!stats || !list) return;
  const done = all.filter(i => i.status === 'done').length;
  const byType = {};
  all.forEach(i => { byType[i.type] = (byType[i.type] || 0) + 1; });
  stats.textContent = 'Total: ' + all.length + ' | Terminados: ' + done + ' | ' + Object.entries(byType).map(([k, v]) => MEDIA_ICON[k] + v).join(' ');
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const statusColor = item.status === 'done' ? 'green' : item.status === 'watching' ? 'blue' : 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge">' + (MEDIA_ICON[item.type] || '🎯') + ' ' + item.type + '</span><span class="ia-badge ' + statusColor + '">' + item.status + '</span>' + (item.rating ? '<span class="ia-badge">⭐' + item.rating + '</span>' : '') + '<button class="ia-btn-sm red" data-del="' + item.uid + '">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title + (item.creator ? ' — ' + item.creator : '');
    el.querySelector('small').textContent = item.notes || '';
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.uid !== item.uid)); _refresh(); };
    list.appendChild(el);
  });
}
