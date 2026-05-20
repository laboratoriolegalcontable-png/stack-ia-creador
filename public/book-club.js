const KEY = 'kairos:book-club';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_CYCLE = ['suggested', 'voting', 'reading', 'finished', 'skipped'];
const STATUS_COLORS = { suggested: 'blue', voting: 'green', reading: 'blue', finished: 'gray', skipped: 'red' };
const STATUS_ORDER = { reading: 0, voting: 1, suggested: 2, finished: 3, skipped: 4 };

export function renderBookClub() {
  let panel = document.getElementById('book-club-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'book-club-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📚 Book Club</h2><button class="ia-close" onclick="document.getElementById('book-club-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="bc-form" class="ia-form">
        <input id="bc-title" placeholder="Título del libro *" required />
        <input id="bc-author" placeholder="Autor *" required />
        <input id="bc-suggestedby" placeholder="Sugerido por *" required />
        <select id="bc-status">
          <option value="suggested">Sugerido</option>
          <option value="voting">Votando</option>
          <option value="reading">Leyendo</option>
          <option value="finished">Terminado</option>
          <option value="skipped">Omitido</option>
        </select>
        <input id="bc-date" type="date" placeholder="Fecha de discusión (opcional)" />
        <textarea id="bc-notes" placeholder="Notas de discusión (opcional)" rows="2"></textarea>
        <div style="display:flex;gap:8px">
          <input id="bc-rating" type="number" min="1" max="5" placeholder="Rating grupal (1-5)" style="flex:1" />
          <input id="bc-takeaways" placeholder="Takeaways (separados por |)" style="flex:2" />
        </div>
        <button type="submit" class="ia-btn">Agregar libro</button>
      </form>
      <div id="bc-stats" class="ia-stats-bar"></div>
      <div id="bc-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('bc-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const ratingVal = document.getElementById('bc-rating').value.trim();
    items.push({
      id: uid(),
      title: document.getElementById('bc-title').value.trim(),
      author: document.getElementById('bc-author').value.trim(),
      suggestedBy: document.getElementById('bc-suggestedby').value.trim(),
      status: document.getElementById('bc-status').value,
      discussionDate: document.getElementById('bc-date').value.trim(),
      discussionNotes: document.getElementById('bc-notes').value.trim(),
      groupRating: ratingVal ? parseInt(ratingVal, 10) : null,
      takeaways: document.getElementById('bc-takeaways').value.trim(),
      votes: 0,
      createdAt: now()
    });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const stats = document.getElementById('bc-stats');
  const list = document.getElementById('bc-list');
  if (!stats || !list) return;
  const all = load();
  const reading = all.filter(i => i.status === 'reading').length;
  const finished = all.filter(i => i.status === 'finished').length;
  const rated = all.filter(i => i.groupRating);
  const avgRating = rated.length ? (rated.reduce((s, i) => s + i.groupRating, 0) / rated.length).toFixed(1) : '—';
  stats.textContent = 'Total: ' + all.length + ' | Leyendo: ' + reading + ' | Terminados: ' + finished + ' | Avg rating: ' + avgRating;
  list.innerHTML = '';
  const sorted = all.slice().sort((a, b) => {
    const oa = STATUS_ORDER[a.status] ?? 99;
    const ob = STATUS_ORDER[b.status] ?? 99;
    return oa !== ob ? oa - ob : b.createdAt.localeCompare(a.createdAt);
  });
  sorted.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const sColor = STATUS_COLORS[item.status] || 'gray';
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge ' + sColor + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm blue"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = '📚 ' + item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.author;
    badges[1].textContent = item.status;
    const [advBtn, voteBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + next;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.status = next; save(d); _refresh(); } };
    voteBtn.textContent = '👍 ' + (item.votes || 0);
    voteBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.votes = (r.votes || 0) + 1; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const takeaways = item.takeaways ? item.takeaways.split('|')[0].trim() : '';
    const preview = takeaways ? takeaways.slice(0, 70) : (item.discussionNotes ? item.discussionNotes.slice(0, 70) : '');
    el.querySelector('small').textContent = preview;
    list.appendChild(el);
  });
}
