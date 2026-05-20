const KEY = 'kairos:travel-log';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderTravelLog() {
  let panel = document.getElementById('travel-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'travel-log-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>✈️ Travel Log</h2><button class="ia-close" onclick="document.getElementById('travel-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="tl-form" class="ia-form">
        <input id="tl-destination" placeholder="Destino *" required />
        <input id="tl-country" placeholder="País" />
        <div style="display:flex;gap:8px">
          <input id="tl-start" type="date" style="flex:1" />
          <input id="tl-end" type="date" style="flex:1" />
        </div>
        <select id="tl-purpose"><option value="leisure">Ocio</option><option value="business">Negocios</option><option value="family">Familia</option><option value="education">Educación</option><option value="adventure">Aventura</option><option value="other">Otro</option></select>
        <input id="tl-budget" type="number" placeholder="Presupuesto total" min="0" step="0.01" />
        <input id="tl-spent" type="number" placeholder="Gasto real" min="0" step="0.01" />
        <input id="tl-rating" type="number" placeholder="Rating (1–5)" min="1" max="5" />
        <textarea id="tl-highlights" placeholder="Highlights / notas" rows="2"></textarea>
        <button type="submit" class="ia-btn">Registrar viaje</button>
      </form>
      <div id="tl-stats" class="ia-stats-bar"></div>
      <div id="tl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('tl-form').onsubmit = e => {
    e.preventDefault();
    const start = document.getElementById('tl-start').value;
    const end = document.getElementById('tl-end').value;
    let days = 0;
    if (start && end) {
      days = Math.max(0, Math.round((new Date(end) - new Date(start)) / 86400000));
    }
    const items = load();
    items.push({ uid: uid(), destination: document.getElementById('tl-destination').value.trim(), country: document.getElementById('tl-country').value.trim(), startDate: start, endDate: end, durationDays: days, purpose: document.getElementById('tl-purpose').value, budget: +document.getElementById('tl-budget').value || 0, spent: +document.getElementById('tl-spent').value || 0, rating: Math.min(5, Math.max(1, +document.getElementById('tl-rating').value || 0)) || 0, highlights: document.getElementById('tl-highlights').value.trim(), createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('tl-stats');
  const list = document.getElementById('tl-list');
  if (!stats || !list) return;
  const countries = new Set(items.map(i => i.country).filter(Boolean)).size;
  const totalDays = items.reduce((s, i) => s + i.durationDays, 0);
  const totalSpent = items.reduce((s, i) => s + i.spent, 0);
  stats.textContent = `Viajes: ${items.length} | Países: ${countries} | ${totalDays} días | ${totalSpent.toFixed(0)} gastado`;
  list.innerHTML = '';
  items.sort((a, b) => b.startDate.localeCompare(a.startDate)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.purpose}</span>${item.rating ? `<span class="ia-badge">${'⭐'.repeat(item.rating)}</span>` : ''}<button class="ia-btn-sm red" data-del="${item.uid}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.destination + (item.country ? `, ${item.country}` : '');
    el.querySelector('small').textContent = `${item.startDate}${item.endDate ? ` → ${item.endDate}` : ''} (${item.durationDays}d)${item.spent ? ` · $${item.spent}` : ''}${item.highlights ? ` · ${item.highlights.slice(0, 50)}` : ''}`;
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.uid !== item.uid)); _refresh(); };
    list.appendChild(el);
  });
}
