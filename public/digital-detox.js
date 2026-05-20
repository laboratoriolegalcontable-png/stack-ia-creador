const KEY = 'kairos:digital-detox';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function renderDigitalDetox() {
  let panel = document.getElementById('digital-detox-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'digital-detox-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🧘 Digital Detox</h2><button class="ia-close" onclick="document.getElementById('digital-detox-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="dd-form" class="ia-form">
        <select id="dd-type"><option value="social-media">Redes Sociales</option><option value="email">Email</option><option value="news">Noticias</option><option value="streaming">Streaming</option><option value="gaming">Gaming</option><option value="phone">Teléfono</option><option value="full-digital">Full Digital</option><option value="custom">Personalizado</option></select>
        <input id="dd-apps" placeholder="Apps objetivo (ej: Instagram, TikTok)" />
        <input id="dd-hours" type="number" placeholder="Horas planificadas" min="0.5" step="0.5" value="2" />
        <input id="dd-date" type="date" />
        <label>Estado de ánimo antes (1–10)</label>
        <input id="dd-mood" type="range" min="1" max="10" value="5" />
        <input id="dd-notes" placeholder="Notas" />
        <button type="submit" class="ia-btn">Iniciar sesión</button>
      </form>
      <div id="dd-complete-form" class="ia-form" style="display:none">
        <input id="dd-cmp-id" type="hidden" />
        <input id="dd-cmp-hours" type="number" placeholder="Horas reales" min="0" step="0.5" />
        <label>Estado de ánimo después (1–10)</label>
        <input id="dd-cmp-mood" type="range" min="1" max="10" value="7" />
        <select id="dd-cmp-status"><option value="completed">Completado</option><option value="broken">Incompleto</option><option value="skipped">Saltado</option></select>
        <button id="dd-cmp-btn" class="ia-btn green">Completar</button>
        <button id="dd-cmp-cancel" class="ia-btn gray">Cancelar</button>
      </div>
      <div id="dd-stats" class="ia-stats-bar"></div>
      <div id="dd-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('dd-date').value = localDate();
  document.getElementById('dd-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), type: document.getElementById('dd-type').value, targetApps: document.getElementById('dd-apps').value.split(',').map(s => s.trim()).filter(Boolean), plannedDurationHours: +document.getElementById('dd-hours').value || 2, date: document.getElementById('dd-date').value, status: 'active', moodBefore: +document.getElementById('dd-mood').value, notes: document.getElementById('dd-notes').value.trim(), createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('dd-date').value = localDate();
    document.getElementById('dd-mood').value = '5';
    _refresh();
  };
  document.getElementById('dd-cmp-btn').onclick = () => {
    const id = document.getElementById('dd-cmp-id').value;
    const d = load(); const s = d.find(x => x.id === id); if (!s) return;
    s.status = document.getElementById('dd-cmp-status').value;
    s.actualDurationHours = +document.getElementById('dd-cmp-hours').value || 0;
    s.moodAfter = +document.getElementById('dd-cmp-mood').value;
    s.updatedAt = now(); save(d);
    document.getElementById('dd-complete-form').style.display = 'none'; _refresh();
  };
  document.getElementById('dd-cmp-cancel').onclick = () => { document.getElementById('dd-complete-form').style.display = 'none'; };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('dd-stats');
  const list = document.getElementById('dd-list');
  if (!stats || !list) return;
  const completed = items.filter(i => i.status === 'completed');
  const totalHours = completed.reduce((s, i) => s + (i.actualDurationHours || 0), 0);
  const rate = items.length ? Math.round(completed.length / items.length * 100) : 0;
  stats.textContent = `Total: ${items.length} | Completadas: ${completed.length} (${rate}%) | ${Math.round(totalHours * 10) / 10}h detox`;
  list.innerHTML = '';
  items.sort((a, b) => b.date.localeCompare(a.date)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const statusColor = item.status === 'completed' ? 'green' : item.status === 'active' ? 'blue' : 'gray';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.type}</span><span class="ia-badge ${statusColor}">${item.status}</span>${item.status === 'active' ? `<button class="ia-btn-sm green" data-complete="${item.id}">✓</button>` : ''}<button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.date;
    const mood = item.moodAfter !== undefined ? ` | Ánimo: ${item.moodBefore}→${item.moodAfter}` : ` | Ánimo antes: ${item.moodBefore}`;
    el.querySelector('small').textContent = `Planificado: ${item.plannedDurationHours}h${item.actualDurationHours !== undefined ? ` | Real: ${item.actualDurationHours}h` : ''}${mood}`;
    const cb = el.querySelector('[data-complete]');
    if (cb) cb.onclick = () => {
      document.getElementById('dd-cmp-id').value = item.id;
      document.getElementById('dd-cmp-hours').value = item.plannedDurationHours;
      document.getElementById('dd-complete-form').style.display = '';
    };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
