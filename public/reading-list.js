const KEY = 'kairos:reading-list';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderReadingList() {
  let panel = document.getElementById('reading-list-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'reading-list-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📚 Lista de Lectura</h2><button class="ia-close" onclick="document.getElementById('reading-list-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="rl-form" class="ia-form">
        <input id="rl-title" placeholder="Título *" required />
        <input id="rl-author" placeholder="Autor" />
        <select id="rl-format"><option value="book">Libro</option><option value="article">Artículo</option><option value="paper">Paper</option><option value="newsletter">Newsletter</option><option value="blog">Blog</option><option value="podcast">Podcast</option><option value="video">Video</option><option value="other">Otro</option></select>
        <input id="rl-pages" type="number" placeholder="Total de páginas" min="0" />
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div id="rl-progress-form" class="ia-form" style="display:none">
        <input id="rl-prg-id" type="hidden" />
        <input id="rl-prg-pages" type="number" placeholder="Páginas leídas" min="0" />
        <select id="rl-prg-status"><option value="reading">Leyendo</option><option value="completed">Completado</option><option value="abandoned">Abandonado</option></select>
        <input id="rl-prg-rating" type="number" placeholder="Rating (1–5)" min="1" max="5" />
        <button id="rl-prg-btn" class="ia-btn">Guardar progreso</button>
        <button id="rl-prg-cancel" class="ia-btn gray">Cancelar</button>
      </div>
      <div id="rl-stats" class="ia-stats-bar"></div>
      <div id="rl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('rl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), title: document.getElementById('rl-title').value.trim(), author: document.getElementById('rl-author').value.trim(), format: document.getElementById('rl-format').value, pageCount: +document.getElementById('rl-pages').value || 0, pagesRead: 0, status: 'want-to-read', rating: 0, notes: '', startedAt: '', completedAt: '', createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('rl-prg-btn').onclick = () => {
    const id = document.getElementById('rl-prg-id').value;
    const d = load(); const item = d.find(x => x.id === id); if (!item) return;
    item.pagesRead = +document.getElementById('rl-prg-pages').value || item.pagesRead;
    item.status = document.getElementById('rl-prg-status').value;
    const r = +document.getElementById('rl-prg-rating').value;
    if (r >= 1 && r <= 5) item.rating = r;
    if (item.status === 'reading' && !item.startedAt) item.startedAt = now();
    if (item.status === 'completed') { item.completedAt = now(); if (!item.startedAt) item.startedAt = now(); }
    item.updatedAt = now(); save(d);
    document.getElementById('rl-progress-form').style.display = 'none'; _refresh();
  };
  document.getElementById('rl-prg-cancel').onclick = () => { document.getElementById('rl-progress-form').style.display = 'none'; };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('rl-stats');
  const list = document.getElementById('rl-list');
  if (!stats || !list) return;
  const completed = items.filter(i => i.status === 'completed').length;
  const reading = items.filter(i => i.status === 'reading').length;
  stats.textContent = `Total: ${items.length} | Leyendo: ${reading} | Completados: ${completed} | Por leer: ${items.filter(i => i.status === 'want-to-read').length}`;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const pct = item.pageCount > 0 ? Math.round(item.pagesRead / item.pageCount * 100) : 0;
    const statusColor = item.status === 'completed' ? 'green' : item.status === 'reading' ? 'blue' : 'gray';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.format}</span><span class="ia-badge ${statusColor}">${item.status}</span><button class="ia-btn-sm" data-prog="${item.id}">📖</button><button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.title + (item.author ? ` — ${item.author}` : '');
    el.querySelector('small').textContent = item.pageCount > 0 ? `${item.pagesRead}/${item.pageCount} págs (${pct}%)${item.rating ? ` ⭐${item.rating}` : ''}` : item.rating ? `⭐${item.rating}` : '';
    el.querySelector('[data-prog]').onclick = () => {
      document.getElementById('rl-prg-id').value = item.id;
      document.getElementById('rl-prg-pages').value = item.pagesRead;
      document.getElementById('rl-prg-status').value = item.status;
      document.getElementById('rl-prg-rating').value = item.rating || '';
      document.getElementById('rl-progress-form').style.display = '';
    };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
