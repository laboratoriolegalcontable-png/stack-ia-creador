const KEY = 'kairos:weekly-digests';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const MOOD_EMOJIS = { 1: '😞', 2: '😐', 3: '😊', 4: '😄', 5: '🤩' };

function moodColor(score) {
  if (score <= 2) return 'red';
  if (score === 3) return 'gray';
  return 'green';
}

export function renderWeeklyDigest() {
  let panel = document.getElementById('weeklydigest-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'weeklydigest-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📅 Weekly Digest</h2><button class="ia-close" onclick="document.getElementById('weeklydigest-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="wd-form" class="ia-form">
        <div style="display:flex;gap:8px">
          <input id="wd-weekof" type="date" style="flex:1" required />
          <input id="wd-title" placeholder="Título (ej: Semana del 13 mayo)" style="flex:2" />
        </div>
        <div style="display:flex;gap:8px">
          <select id="wd-mood" style="flex:1">
            <option value="1">1 😞</option>
            <option value="2">2 😐</option>
            <option value="3" selected>3 😊</option>
            <option value="4">4 😄</option>
            <option value="5">5 🤩</option>
          </select>
          <select id="wd-productivity" style="flex:1">
            <option value="1">Prod: 1</option>
            <option value="2">Prod: 2</option>
            <option value="3" selected>Prod: 3</option>
            <option value="4">Prod: 4</option>
            <option value="5">Prod: 5</option>
          </select>
        </div>
        <textarea id="wd-highlights" placeholder="Highlights (separados por |) *" rows="2" required></textarea>
        <input id="wd-wins" placeholder="Wins (separados por |)" />
        <input id="wd-challenges" placeholder="Desafíos (separados por |)" />
        <input id="wd-learnings" placeholder="Aprendizajes (separados por |)" />
        <input id="wd-nextgoals" placeholder="Objetivos próxima semana (separados por |)" />
        <button type="submit" class="ia-btn">Guardar semana</button>
      </form>
      <div id="wd-stats" class="ia-stats-bar"></div>
      <div id="wd-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('wd-form').onsubmit = e => {
    e.preventDefault();
    function parsePipe(id) {
      const v = document.getElementById(id).value.trim();
      return v ? v.split('|').map(s => s.trim()).filter(Boolean) : [];
    }
    const items = load();
    items.push({
      id: uid(),
      weekOf: document.getElementById('wd-weekof').value,
      title: document.getElementById('wd-title').value.trim(),
      mood: parseInt(document.getElementById('wd-mood').value),
      productivity: parseInt(document.getElementById('wd-productivity').value),
      highlights: parsePipe('wd-highlights'),
      wins: parsePipe('wd-wins'),
      challenges: parsePipe('wd-challenges'),
      learnings: parsePipe('wd-learnings'),
      nextWeekGoals: parsePipe('wd-nextgoals'),
      createdAt: now()
    });
    save(items);
    e.target.reset();
    document.getElementById('wd-mood').value = '3';
    document.getElementById('wd-productivity').value = '3';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const stats = document.getElementById('wd-stats');
  const list = document.getElementById('wd-list');
  if (!stats || !list) return;
  const items = load().sort((a, b) => b.weekOf.localeCompare(a.weekOf));
  const avgMood = items.length ? (items.reduce((s, i) => s + (i.mood || 0), 0) / items.length).toFixed(1) : '—';
  const avgProd = items.length ? (items.reduce((s, i) => s + (i.productivity || 0), 0) / items.length).toFixed(1) : '—';
  stats.textContent = 'Total: ' + items.length + ' | Avg mood: ' + avgMood + ' | Avg productivity: ' + avgProd;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const moodEmoji = MOOD_EMOJIS[item.mood] || '😊';
    const mc = moodColor(item.mood);
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + mc + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title || item.weekOf;
    el.querySelectorAll('.ia-badge')[0].textContent = moodEmoji + ' ' + item.mood;
    el.querySelectorAll('.ia-badge')[1].textContent = 'prod: ' + item.productivity;
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const firstHighlight = item.highlights && item.highlights.length ? item.highlights[0].slice(0, 60) : '';
    const winsCount = item.wins ? item.wins.length : 0;
    const learningsCount = item.learnings ? item.learnings.length : 0;
    el.querySelector('small').textContent = firstHighlight + ' [' + winsCount + ' wins, ' + learningsCount + ' learnings]';
    list.appendChild(el);
  });
}
