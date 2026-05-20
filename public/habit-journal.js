const KEY = 'kairos:habit-journal';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function localDate() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

export function renderHabitJournal() {
  let panel = document.getElementById('habit-journal-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'habit-journal-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📓 Habit Journal</h2><button class="ia-close" onclick="document.getElementById('habit-journal-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="hj-form" class="ia-form">
        <input id="hj-habit" placeholder="Hábito *" required />
        <input id="hj-date" type="date" />
        <textarea id="hj-notes" placeholder="Notas / reflexión" rows="2"></textarea>
        <select id="hj-rating"><option value="1">1 — Muy mal</option><option value="2">2 — Mal</option><option value="3" selected>3 — Regular</option><option value="4">4 — Bien</option><option value="5">5 — Excelente</option></select>
        <button type="submit" class="ia-btn">Registrar</button>
      </form>
      <div id="hj-stats" class="ia-stats-bar"></div>
      <div id="hj-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('hj-date').value = localDate();
  document.getElementById('hj-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), habit: document.getElementById('hj-habit').value.trim(), date: document.getElementById('hj-date').value || localDate(), notes: document.getElementById('hj-notes').value.trim(), rating: parseInt(document.getElementById('hj-rating').value), createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('hj-date').value = localDate();
    document.getElementById('hj-rating').value = '3';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('hj-stats');
  const list = document.getElementById('hj-list');
  if (!stats || !list) return;
  const habits = [...new Set(items.map(i => i.habit))];
  const avg = items.length ? (items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1) : 0;
  stats.textContent = 'Entradas: ' + items.length + ' | Hábitos: ' + habits.length + ' | Rating avg: ' + avg;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const stars = '⭐'.repeat(Math.max(0, Math.min(5, item.rating || 0)));
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge">' + item.date + '</span><span class="ia-badge gray" title="rating">' + stars + '</span><button class="ia-btn-sm red" data-del="' + item.id + '">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.habit;
    el.querySelector('small').textContent = item.notes || '';
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
