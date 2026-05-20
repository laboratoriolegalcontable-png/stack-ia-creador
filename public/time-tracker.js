const KEY = 'kairos:time-blocks';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const CAT_ICONS = { 'deep-work': '⚡', meetings: '🤝', admin: '📋', learning: '📚', creative: '🎨', other: '📝' };
const TODAY = () => new Date().toISOString().slice(0, 10);

export function renderTimeTracker() {
  let panel = document.getElementById('time-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'time-tracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>⏱️ Time Tracker</h2><button class="ia-close" onclick="document.getElementById('time-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="tt-form" class="ia-form">
        <input id="tt-project" placeholder="Proyecto *" required />
        <input id="tt-task" placeholder="Tarea *" required />
        <div style="display:flex;gap:8px">
          <select id="tt-category" style="flex:1">
            <option value="deep-work">⚡ Deep Work</option>
            <option value="meetings">🤝 Meetings</option>
            <option value="admin">📋 Admin</option>
            <option value="learning">📚 Learning</option>
            <option value="creative">🎨 Creative</option>
            <option value="other">📝 Other</option>
          </select>
          <input id="tt-duration" type="number" placeholder="Min *" min="1" style="flex:1" required />
        </div>
        <div style="display:flex;gap:8px">
          <input id="tt-date" type="date" style="flex:1" required />
          <input id="tt-tags" placeholder="tags (coma)" style="flex:1" />
        </div>
        <textarea id="tt-notes" placeholder="Notas (opcional)" rows="2"></textarea>
        <button type="submit" class="ia-btn">Registrar bloque</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="tt-filter-proj" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos los proyectos</option>
        </select>
      </div>
      <div id="tt-stats" class="ia-stats-bar"></div>
      <div id="tt-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('tt-date').value = TODAY();
  document.getElementById('tt-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({
      id: uid(), createdAt: now(),
      project: document.getElementById('tt-project').value.trim(),
      task: document.getElementById('tt-task').value.trim(),
      category: document.getElementById('tt-category').value,
      durationMinutes: parseInt(document.getElementById('tt-duration').value, 10) || 0,
      date: document.getElementById('tt-date').value,
      notes: document.getElementById('tt-notes').value.trim(),
      tags: document.getElementById('tt-tags').value.trim()
    });
    save(items);
    e.target.reset();
    document.getElementById('tt-date').value = TODAY();
    _refresh();
  };
  document.getElementById('tt-filter-proj').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const all = load();
  const filterSel = document.getElementById('tt-filter-proj');
  if (!filterSel) return;
  const projects = [...new Set(all.map(i => i.project))].sort();
  const current = filterSel.value;
  filterSel.innerHTML = '<option value="all">Todos los proyectos</option>';
  projects.forEach(p => {
    const o = document.createElement('option');
    o.value = p; o.textContent = p;
    if (p === current) o.selected = true;
    filterSel.appendChild(o);
  });
  const proj = filterSel.value;
  let items = proj === 'all' ? all : all.filter(i => i.project === proj);
  items = items.slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const stats = document.getElementById('tt-stats');
  const list = document.getElementById('tt-list');
  if (!stats || !list) return;
  const uniqueProjects = new Set(all.map(i => i.project)).size;
  const totalMin = all.reduce((s, i) => s + (i.durationMinutes || 0), 0);
  stats.textContent = 'Total sesiones: ' + all.length + ' | Total minutos: ' + totalMin + ' | Proyectos: ' + uniqueProjects;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const icon = CAT_ICONS[item.category] || '📝';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge blue"></span><span class="ia-badge gray"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = icon + ' ' + item.project;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.task;
    badges[1].textContent = item.category;
    badges[2].textContent = item.durationMinutes + 'min';
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const parts = [item.date];
    if (item.notes) parts.push(item.notes.slice(0, 50));
    if (item.tags) parts.push('#' + item.tags.split(',').map(t => t.trim()).filter(Boolean).join(' #'));
    el.querySelector('small').textContent = parts.join(' · ');
    list.appendChild(el);
  });
}
