const KEY = 'kairos:meeting-agendas';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const TYPE_ICON = { standup: '🎯', planning: '📅', '1on1': '👥', review: '🔍', brainstorm: '💡', demo: '🚀', other: '📋' };
const STATUS_CYCLE = ['draft', 'confirmed', 'in-progress', 'completed', 'cancelled'];
const STATUS_COLOR = { draft: 'gray', confirmed: 'blue', 'in-progress': 'green', completed: 'gray', cancelled: 'red' };

export function renderMeetingAgenda() {
  let panel = document.getElementById('meeting-agenda-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'meeting-agenda-panel';
  panel.className = 'ia-panel';
  const today = new Date().toISOString().slice(0, 10);
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📅 Meeting Agenda</h2><button class="ia-close" onclick="document.getElementById('meeting-agenda-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ma-form" class="ia-form">
        <input id="ma-title" placeholder="Título *" required />
        <div style="display:flex;gap:8px">
          <select id="ma-type" style="flex:1">
            <option value="standup">🎯 Standup</option><option value="planning">📅 Planning</option><option value="1on1">👥 1on1</option><option value="review">🔍 Review</option><option value="brainstorm">💡 Brainstorm</option><option value="demo">🚀 Demo</option><option value="other">📋 Other</option>
          </select>
          <input id="ma-organizer" placeholder="Organizador *" required style="flex:1" />
        </div>
        <div style="display:flex;gap:8px">
          <input id="ma-date" type="date" value="${today}" required style="flex:1" />
          <input id="ma-time" type="time" style="flex:1" />
          <input id="ma-duration" type="number" placeholder="Duración (min)" value="60" min="1" style="flex:1" />
        </div>
        <input id="ma-attendees" placeholder="Asistentes (separados por coma)" />
        <input id="ma-location" placeholder="Lugar / link (opcional)" />
        <button type="submit" class="ia-btn">Crear reunión</button>
      </form>
      <div id="ma-stats" class="ia-stats-bar"></div>
      <div id="ma-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ma-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.unshift({
      id: uid(),
      title: document.getElementById('ma-title').value.trim(),
      type: document.getElementById('ma-type').value,
      date: document.getElementById('ma-date').value,
      time: document.getElementById('ma-time').value,
      durationMinutes: Number(document.getElementById('ma-duration').value) || 60,
      organizer: document.getElementById('ma-organizer').value.trim(),
      attendees: document.getElementById('ma-attendees').value.split(',').map(s => s.trim()).filter(Boolean),
      location: document.getElementById('ma-location').value.trim(),
      status: 'draft',
      agendaItems: [],
      actionItems: [],
      createdAt: now()
    });
    save(items);
    e.target.reset();
    document.getElementById('ma-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('ma-duration').value = '60';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const all = load();
  const stats = document.getElementById('ma-stats');
  const list = document.getElementById('ma-list');
  if (!stats || !list) return;

  const completed = all.filter(i => i.status === 'completed').length;
  const openActions = all.reduce((s, i) => s + (i.actionItems || []).filter(a => !a.done).length, 0);
  stats.textContent = 'Total: ' + all.length + ' | Completadas: ' + completed + ' | Acciones abiertas: ' + openActions;

  list.innerHTML = '';
  all.sort((a, b) => b.date.localeCompare(a.date)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const icon = TYPE_ICON[item.type] || '📋';
    const statusCol = STATUS_COLOR[item.status] || 'gray';
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    const doneActions = (item.actionItems || []).filter(a => a.done).length;
    const totalActions = (item.actionItems || []).length;
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge gray"></span><span class="ia-badge ' + statusCol + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm gray">+ agenda</button><button class="ia-btn-sm blue">+ acción</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = icon + ' ' + item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.organizer;
    badges[1].textContent = item.date + (item.time ? ' ' + item.time : '');
    badges[2].textContent = item.status;
    const [advBtn, agendaBtn, actionBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + nextStatus;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.status = nextStatus; save(d); _refresh(); } };
    agendaBtn.onclick = () => {
      const raw = prompt('Tema de agenda (topic|owner|minutes):');
      if (!raw) return;
      const [topic, owner, minutes] = raw.split('|').map(s => s.trim());
      if (!topic) return;
      const d = load(); const r = d.find(x => x.id === item.id);
      if (r) { r.agendaItems = r.agendaItems || []; r.agendaItems.push({ topic, owner: owner || '', minutes: Number(minutes) || 0 }); save(d); _refresh(); }
    };
    actionBtn.onclick = () => {
      const raw = prompt('Acción (description|assignee):');
      if (!raw) return;
      const [description, assignee] = raw.split('|').map(s => s.trim());
      if (!description) return;
      const d = load(); const r = d.find(x => x.id === item.id);
      if (r) { r.actionItems = r.actionItems || []; r.actionItems.push({ description, assignee: assignee || '', done: false }); save(d); _refresh(); }
    };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = '📝 ' + (item.agendaItems || []).length + ' agenda items | ✅ ' + doneActions + '/' + totalActions + ' acciones completadas';
    list.appendChild(el);
  });
}
