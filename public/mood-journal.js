const KEY = 'kairos:mood-journal';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const MOOD_EMOJI = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

export function renderMoodJournal() {
  let panel = document.getElementById('mood-journal-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'mood-journal-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🌡️ Mood Journal</h2><button class="ia-close" onclick="document.getElementById('mood-journal-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="mj-form" class="ia-form">
        <select id="mj-mood">
          <option value="1">😔 1 — Muy bajo</option>
          <option value="2">😕 2 — Bajo</option>
          <option value="3" selected>😐 3 — Neutro</option>
          <option value="4">🙂 4 — Bien</option>
          <option value="5">😄 5 — Excelente</option>
        </select>
        <input id="mj-trigger" placeholder="Disparador / contexto" />
        <textarea id="mj-notes" placeholder="Notas / reflexión" rows="2"></textarea>
        <input id="mj-tags" placeholder="Tags (coma separados)" />
        <button type="submit" class="ia-btn">Registrar estado</button>
      </form>
      <div id="mj-stats" class="ia-stats-bar"></div>
      <div id="mj-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('mj-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), mood: parseInt(document.getElementById('mj-mood').value), trigger: document.getElementById('mj-trigger').value.trim(), notes: document.getElementById('mj-notes').value.trim(), tags: document.getElementById('mj-tags').value.split(',').map(s => s.trim()).filter(Boolean), createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('mj-mood').value = '3';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('mj-stats');
  const list = document.getElementById('mj-list');
  if (!stats || !list) return;
  const avg = items.length ? (items.reduce((s, i) => s + i.mood, 0) / items.length).toFixed(1) : 0;
  const recent = items.slice(-7);
  const recentAvg = recent.length ? (recent.reduce((s, i) => s + i.mood, 0) / recent.length).toFixed(1) : 0;
  stats.textContent = 'Entradas: ' + items.length + ' | Avg total: ' + avg + ' | Avg últimas 7: ' + recentAvg;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = item.mood >= 4 ? 'green' : item.mood <= 2 ? 'red' : 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong>' + MOOD_EMOJI[item.mood] + ' ' + item.mood + '/5</strong><span class="ia-badge ' + color + '">' + (item.mood >= 4 ? 'positivo' : item.mood <= 2 ? 'bajo' : 'neutro') + '</span><button class="ia-btn-sm red" data-del="' + item.id + '">✕</button></div><div style="font-size:0.82rem;opacity:0.8"></div><small></small>';
    el.querySelectorAll('div')[1].textContent = item.trigger || item.notes || '';
    el.querySelector('small').textContent = new Date(item.createdAt).toLocaleString() + (item.tags.length ? ' · ' + item.tags.join(', ') : '');
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
