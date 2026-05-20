const KEY = 'kairos:time-audit';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function renderTimeAudit() {
  let panel = document.getElementById('time-audit-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'time-audit-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>⏱ Time Audit</h2><button class="ia-close" onclick="document.getElementById('time-audit-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ta-form" class="ia-form">
        <input id="ta-activity" placeholder="Actividad *" required />
        <select id="ta-category"><option value="deep-work">Deep Work</option><option value="meetings">Reuniones</option><option value="admin">Admin</option><option value="email">Email</option><option value="social-media">Redes Sociales</option><option value="learning">Aprendizaje</option><option value="breaks">Descansos</option><option value="other">Otro</option></select>
        <div style="display:flex;gap:8px">
          <input id="ta-start" type="time" placeholder="Inicio" style="flex:1"/>
          <input id="ta-end" type="time" placeholder="Fin" style="flex:1"/>
        </div>
        <input id="ta-date" type="date" />
        <label style="display:flex;align-items:center;gap:6px"><input id="ta-productive" type="checkbox" checked /> Productivo</label>
        <input id="ta-energy" type="range" min="1" max="10" value="7" />
        <button type="submit" class="ia-btn">Registrar</button>
      </form>
      <div id="ta-stats" class="ia-stats-bar"></div>
      <div id="ta-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ta-date').value = localDate();
  document.getElementById('ta-form').onsubmit = e => {
    e.preventDefault();
    const start = document.getElementById('ta-start').value;
    const end = document.getElementById('ta-end').value;
    let duration = 0;
    if (start && end) {
      const [sh, sm] = start.split(':').map(Number); const [eh, em] = end.split(':').map(Number);
      duration = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
    }
    const items = load();
    items.push({ id: uid(), activity: document.getElementById('ta-activity').value.trim(), category: document.getElementById('ta-category').value, date: document.getElementById('ta-date').value, startTime: start, endTime: end, durationMinutes: duration, energyLevel: +document.getElementById('ta-energy').value, productive: document.getElementById('ta-productive').checked, notes: '', createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('ta-date').value = localDate();
    document.getElementById('ta-energy').value = '7';
    document.getElementById('ta-productive').checked = true;
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('ta-stats');
  const list = document.getElementById('ta-list');
  if (!stats || !list) return;
  const today = items.filter(i => i.date === localDate());
  const totalMin = today.reduce((s, i) => s + i.durationMinutes, 0);
  const prodMin = today.filter(i => i.productive).reduce((s, i) => s + i.durationMinutes, 0);
  const rate = totalMin > 0 ? Math.round(prodMin / totalMin * 100) : 0;
  stats.textContent = `Hoy: ${Math.round(totalMin/60*10)/10}h | Productivo: ${Math.round(prodMin/60*10)/10}h (${rate}%)`;
  list.innerHTML = '';
  const todayItems = today.sort((a, b) => a.startTime.localeCompare(b.startTime));
  const allItems = items.filter(i => i.date !== localDate()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  [...todayItems, ...allItems].forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.category}</span><span class="ia-badge ${item.productive ? 'green' : 'gray'}">${item.productive ? '✓ Prod' : '○'}</span><button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.activity;
    el.querySelector('small').textContent = `${item.date} ${item.startTime}–${item.endTime} (${item.durationMinutes}min) | Energía: ${item.energyLevel}/10`;
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
