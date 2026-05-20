const KEY = 'kairos:team-pulse';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const MOOD_EMOJI = { 1: '😞', 2: '😐', 3: '😊', 4: '😄', 5: '🤩' };

export function renderTeamPulse() {
  let panel = document.getElementById('team-pulse-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'team-pulse-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📊 Team Pulse</h2><button class="ia-close" onclick="document.getElementById('team-pulse-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="tp-form" class="ia-form">
        <div style="display:flex;gap:8px">
          <input id="tp-team" placeholder="Equipo *" style="flex:1" required />
          <input id="tp-respondent" placeholder="Respondente (opcional)" style="flex:1" />
        </div>
        <input id="tp-weekof" type="date" required />
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <select id="tp-mood" style="flex:1">
            <option value="1">😞 1 - Estado ánimo</option>
            <option value="2">😐 2</option>
            <option value="3" selected>😊 3</option>
            <option value="4">😄 4</option>
            <option value="5">🤩 5</option>
          </select>
          <select id="tp-energy" style="flex:1">
            <option value="1">1 - Energía</option>
            <option value="2">2</option>
            <option value="3" selected>3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <select id="tp-collab" style="flex:1">
            <option value="1">1 - Colaboración</option>
            <option value="2">2</option>
            <option value="3" selected>3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <select id="tp-clarity" style="flex:1">
            <option value="1">1 - Claridad</option>
            <option value="2">2</option>
            <option value="3" selected>3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <input id="tp-highlights" placeholder="Highlights (separados por |)" />
        <input id="tp-blockers" placeholder="Blockers (separados por |)" />
        <textarea id="tp-suggestions" placeholder="Sugerencias (opcional)" rows="2"></textarea>
        <button type="submit" class="ia-btn">Registrar pulse</button>
      </form>
      <div id="tp-filter-wrap" style="margin-bottom:8px"></div>
      <div id="tp-stats" class="ia-stats-bar"></div>
      <div id="tp-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('tp-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    let respondent = document.getElementById('tp-respondent').value.trim();
    const anonymous = !respondent;
    if (anonymous) respondent = 'Anónimo';
    items.push({
      id: uid(),
      teamName: document.getElementById('tp-team').value.trim(),
      respondent,
      anonymous,
      weekOf: document.getElementById('tp-weekof').value,
      mood: parseInt(document.getElementById('tp-mood').value, 10),
      energy: parseInt(document.getElementById('tp-energy').value, 10),
      collaboration: parseInt(document.getElementById('tp-collab').value, 10),
      clarity: parseInt(document.getElementById('tp-clarity').value, 10),
      highlights: document.getElementById('tp-highlights').value.trim(),
      blockers: document.getElementById('tp-blockers').value.trim(),
      suggestions: document.getElementById('tp-suggestions').value.trim(),
      createdAt: now()
    });
    save(items);
    e.target.reset();
    document.getElementById('tp-mood').value = '3';
    document.getElementById('tp-energy').value = '3';
    document.getElementById('tp-collab').value = '3';
    document.getElementById('tp-clarity').value = '3';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const stats = document.getElementById('tp-stats');
  const list = document.getElementById('tp-list');
  const filterWrap = document.getElementById('tp-filter-wrap');
  if (!stats || !list || !filterWrap) return;
  const all = load();
  const teams = [...new Set(all.map(i => i.teamName))];
  const currentFilter = document.getElementById('tp-filter-team')?.value || 'all';
  filterWrap.innerHTML = '';
  const sel = document.createElement('select');
  sel.id = 'tp-filter-team';
  sel.style.cssText = 'padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)';
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'Todos los equipos';
  sel.appendChild(allOpt);
  teams.forEach(t => {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    if (t === currentFilter) o.selected = true;
    sel.appendChild(o);
  });
  sel.onchange = _refresh;
  filterWrap.appendChild(sel);
  const filtered = currentFilter === 'all' ? all : all.filter(i => i.teamName === currentFilter);
  const avgMood = filtered.length ? (filtered.reduce((s, i) => s + i.mood, 0) / filtered.length).toFixed(1) : '—';
  const avgEnergy = filtered.length ? (filtered.reduce((s, i) => s + i.energy, 0) / filtered.length).toFixed(1) : '—';
  stats.textContent = 'Total: ' + all.length + ' | Avg mood: ' + avgMood + ' | Avg energy: ' + avgEnergy;
  list.innerHTML = '';
  filtered.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const moodScore = item.mood || 3;
    const moodColor = moodScore <= 2 ? 'red' : moodScore === 3 ? 'gray' : 'green';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge ' + moodColor + '"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = '📊 ' + item.teamName;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.weekOf || '';
    badges[1].textContent = (MOOD_EMOJI[moodScore] || '') + ' ' + moodScore;
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const highlights = item.highlights ? item.highlights.split('|')[0].trim() : '';
    const blockerCount = item.blockers ? item.blockers.split('|').filter(b => b.trim()).length : 0;
    const preview = highlights ? highlights.slice(0, 60) : (blockerCount ? blockerCount + ' blocker(s)' : '');
    el.querySelector('small').textContent = preview;
    list.appendChild(el);
  });
}
