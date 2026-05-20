const KEY = 'kairos:book-notes';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderBookNotes() {
  let panel = document.getElementById('book-notes-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'book-notes-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📓 Notas de Libros</h2><button class="ia-close" onclick="document.getElementById('book-notes-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="bn-form" class="ia-form">
        <input id="bn-book" placeholder="Libro *" required />
        <input id="bn-author" placeholder="Autor" />
        <input id="bn-chapter" placeholder="Capítulo / página" />
        <select id="bn-type"><option value="insight">Insight</option><option value="quote">Cita</option><option value="question">Pregunta</option><option value="action">Acción</option><option value="summary">Resumen</option></select>
        <textarea id="bn-note" placeholder="Nota *" rows="3" required></textarea>
        <input id="bn-tags" placeholder="Tags (coma separados)" />
        <button type="submit" class="ia-btn">Guardar nota</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <input id="bn-search" placeholder="Buscar..." style="flex:1;padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)" />
      </div>
      <div id="bn-stats" class="ia-stats-bar"></div>
      <div id="bn-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('bn-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ uid: uid(), book: document.getElementById('bn-book').value.trim(), author: document.getElementById('bn-author').value.trim(), chapter: document.getElementById('bn-chapter').value.trim(), type: document.getElementById('bn-type').value, note: document.getElementById('bn-note').value.trim(), tags: document.getElementById('bn-tags').value.split(',').map(s => s.trim()).filter(Boolean), createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('bn-search').oninput = _refresh;
  _refresh();
}

function _refresh() {
  const query = (document.getElementById('bn-search')?.value || '').toLowerCase();
  let items = load();
  if (query) items = items.filter(i => i.book.toLowerCase().includes(query) || i.note.toLowerCase().includes(query) || i.tags.some(t => t.toLowerCase().includes(query)));
  const stats = document.getElementById('bn-stats');
  const list = document.getElementById('bn-list');
  if (!stats || !list) return;
  const books = new Set(items.map(i => i.book)).size;
  stats.textContent = `Notas: ${load().length} | Libros: ${books}${query ? ` | Filtrado: ${items.length}` : ''}`;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.type}</span><button class="ia-btn-sm red" data-del="${item.uid}">✕</button></div><div></div><small></small>`;
    el.querySelector('strong').textContent = item.book + (item.author ? ` — ${item.author}` : '');
    el.querySelectorAll('div')[1].textContent = item.note;
    el.querySelector('small').textContent = [item.chapter, ...item.tags.map(t => `#${t}`)].filter(Boolean).join(' · ');
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.uid !== item.uid)); _refresh(); };
    list.appendChild(el);
  });
}
