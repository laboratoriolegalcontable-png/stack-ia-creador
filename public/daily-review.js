const KEY = 'kairos:daily-review';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function localDate() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

export function renderDailyReview() {
  let panel = document.getElementById('daily-review-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'daily-review-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📋 Daily Review</h2><button class="ia-close" onclick="document.getElementById('daily-review-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="dr-form" class="ia-form">
        <input id="dr-date" type="date" />
        <textarea id="dr-wins" placeholder="Wins del día *" rows="2" required></textarea>
        <textarea id="dr-challenges" placeholder="Desafíos / obstáculos" rows="2"></textarea>
        <textarea id="dr-learnings" placeholder="Aprendizajes" rows="2"></textarea>
        <textarea id="dr-plan" placeholder="Plan para mañana" rows="2"></textarea>
        <div style="display:flex;gap:8px">
          <select id="dr-energy" style="flex:1"><option value="1">⚡ 1 — Sin energía</option><option value="2">⚡⚡ 2 — Bajo</option><option value="3" selected>⚡⚡⚡ 3 — Normal</option><option value="4">⚡⚡⚡⚡ 4 — Alto</option><option value="5">⚡⚡⚡⚡⚡ 5 — Máximo</option></select>
          <select id="dr-rating" style="flex:1"><option value="1">⭐ 1</option><option value="2">⭐⭐ 2</option><option value="3" selected>⭐⭐⭐ 3</option><option value="4">⭐⭐⭐⭐ 4</option><option value="5">⭐⭐⭐⭐⭐ 5</option></select>
        </div>
        <button type="submit" class="ia-btn">Guardar review</button>
      </form>
      <div id="dr-stats" class="ia-stats-bar"></div>
      <div id="dr-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('dr-date').value = localDate();
  document.getElementById('dr-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), date: document.getElementById('dr-date').value || localDate(), wins: document.getElementById('dr-wins').value.trim(), challenges: document.getElementById('dr-challenges').value.trim(), learnings: document.getElementById('dr-learnings').value.trim(), tomorrowPlan: document.getElementById('dr-plan').value.trim(), energyLevel: parseInt(document.getElementById('dr-energy').value), rating: parseInt(document.getElementById('dr-rating').value), createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('dr-date').value = localDate();
    document.getElementById('dr-energy').value = '3';
    document.getElementById('dr-rating').value = '3';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('dr-stats');
  const list = document.getElementById('dr-list');
  if (!stats || !list) return;
  const avgRating = items.length ? (items.reduce((s, i) => s + (i.rating || 0), 0) / items.length).toFixed(1) : 0;
  const avgEnergy = items.length ? (items.reduce((s, i) => s + (i.energyLevel || 0), 0) / items.length).toFixed(1) : 0;
  stats.textContent = 'Reviews: ' + items.length + ' | Rating avg: ' + avgRating + ' | Energía avg: ' + avgEnergy;
  list.innerHTML = '';
  items.sort((a, b) => b.date.localeCompare(a.date)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge green"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.date;
    el.querySelectorAll('.ia-badge')[0].textContent = '⭐' + (item.rating || 0);
    el.querySelectorAll('.ia-badge')[1].textContent = '⚡' + (item.energyLevel || 0);
    el.querySelector('small').textContent = item.wins ? item.wins.slice(0, 100) : '';
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
