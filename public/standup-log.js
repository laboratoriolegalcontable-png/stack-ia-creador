const KEY = 'kairos:standups';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const MOOD_EMOJI = { 1: '😞', 2: '😐', 3: '😊', 4: '😄', 5: '🤩' };
const MOOD_COLOR = m => m <= 2 ? 'red' : m >= 4 ? 'green' : 'gray';

export function renderStandupLog() {
  let panel = document.getElementById('standup-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'standup-log-panel';
  panel.className = 'ia-panel';
  const today = new Date().toISOString().slice(0, 10);
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📋 Standup Log</h2><button class="ia-close" onclick="document.getElementById('standup-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="sl-form" class="ia-form">
        <div style="display:flex;gap:8px">
          <input id="sl-team" placeholder="Equipo *" required style="flex:1" />
          <input id="sl-author" placeholder="Autor *" required style="flex:1" />
        </div>
        <div style="display:flex;gap:8px">
          <input id="sl-date" type="date" value="${today}" required style="flex:1" />
          <select id="sl-mood" style="flex:1">
            <option value="1">1 😞</option><option value="2">2 😐</option><option value="3" selected>3 😊</option><option value="4">4 😄</option><option value="5">5 🤩</option>
          </select>
        </div>
        <textarea id="sl-yesterday" placeholder="Ayer * (un ítem por línea)" rows="3" required></textarea>
        <textarea id="sl-today" placeholder="Hoy * (un ítem por línea)" rows="3" required></textarea>
        <textarea id="sl-blockers" placeholder="Bloqueos (vacío = sin bloqueos)" rows="2"></textarea>
        <button type="submit" class="ia-btn">Registrar standup</button>
      </form>
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
        <select id="sl-filter-team" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos los equipos</option>
        </select>
      </div>
      <div id="sl-stats" class="ia-stats-bar"></div>
      <div id="sl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('sl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const toLines = v => v.split('\n').map(s => s.trim()).filter(Boolean);
    items.unshift({
      id: uid(),
      team: document.getElementById('sl-team').value.trim(),
      author: document.getElementById('sl-author').value.trim(),
      date: document.getElementById('sl-date').value,
      mood: Number(document.getElementById('sl-mood').value),
      yesterday: toLines(document.getElementById('sl-yesterday').value),
      today: toLines(document.getElementById('sl-today').value),
      blockers: toLines(document.getElementById('sl-blockers').value),
      createdAt: now()
    });
    save(items);
    e.target.reset();
    document.getElementById('sl-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('sl-mood').value = '3';
    _refresh();
  };
  document.getElementById('sl-filter-team').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const all = load();
  const teamFilter = document.getElementById('sl-filter-team');
  const stats = document.getElementById('sl-stats');
  const list = document.getElementById('sl-list');
  if (!stats || !list || !teamFilter) return;

  // Update team dropdown
  const teams = [...new Set(all.map(i => i.team))].sort();
  const current = teamFilter.value;
  teamFilter.innerHTML = '<option value="all">Todos los equipos</option>';
  teams.forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; if (t === current) o.selected = true; teamFilter.appendChild(o); });

  const filtered = teamFilter.value === 'all' ? all : all.filter(i => i.team === teamFilter.value);
  const withBlockers = all.filter(i => i.blockers && i.blockers.length > 0).length;
  const avgMood = all.length ? (all.reduce((s, i) => s + i.mood, 0) / all.length).toFixed(1) : '—';
  stats.textContent = 'Total: ' + all.length + ' | Con bloqueos: ' + withBlockers + ' | Mood promedio: ' + avgMood;

  list.innerHTML = '';
  filtered.sort((a, b) => b.date.localeCompare(a.date)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const moodEmoji = MOOD_EMOJI[item.mood] || '😊';
    const moodCol = MOOD_COLOR(item.mood);
    const blockersCount = item.blockers ? item.blockers.length : 0;
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge ' + moodCol + '"></span>' + (blockersCount ? '<span class="ia-badge red"></span>' : '') + '<button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = '📋 ' + item.team + ' - ' + item.author;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.date;
    badges[1].textContent = moodEmoji + ' ' + item.mood;
    if (blockersCount) badges[2].textContent = '🚧 ' + blockersCount + ' bloqueo' + (blockersCount > 1 ? 's' : '');
    el.querySelector('.ia-btn-sm').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const preview = item.today && item.today.length > 0 ? item.today[0].slice(0, 60) : '';
    el.querySelector('small').textContent = preview;
    list.appendChild(el);
  });
}
