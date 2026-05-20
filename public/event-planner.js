const KEY = 'kairos:event-planner';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderEventPlanner() {
  let panel = document.getElementById('event-planner-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'event-planner-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🗓 Planificador de Eventos</h2><button class="ia-close" onclick="document.getElementById('event-planner-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ep-form" class="ia-form">
        <input id="ep-title" placeholder="Nombre del evento *" required />
        <select id="ep-type"><option value="conference">Conferencia</option><option value="workshop">Taller</option><option value="meeting">Reunión</option><option value="webinar">Webinar</option><option value="social">Social</option><option value="launch">Lanzamiento</option><option value="other">Otro</option></select>
        <div style="display:flex;gap:8px">
          <input id="ep-date" type="date" style="flex:1" />
          <input id="ep-time" type="time" style="flex:1" />
        </div>
        <input id="ep-location" placeholder="Lugar / URL" />
        <input id="ep-budget" type="number" placeholder="Presupuesto" min="0" step="0.01" />
        <input id="ep-attendees" type="number" placeholder="Asistentes esperados" min="0" />
        <textarea id="ep-desc" placeholder="Descripción" rows="2"></textarea>
        <button type="submit" class="ia-btn">Crear evento</button>
      </form>
      <div id="ep-stats" class="ia-stats-bar"></div>
      <div id="ep-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ep-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), title: document.getElementById('ep-title').value.trim(), type: document.getElementById('ep-type').value, date: document.getElementById('ep-date').value, time: document.getElementById('ep-time').value, location: document.getElementById('ep-location').value.trim(), budget: +document.getElementById('ep-budget').value || 0, expectedAttendees: +document.getElementById('ep-attendees').value || 0, description: document.getElementById('ep-desc').value.trim(), status: 'planning', tasks: [], createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('ep-stats');
  const list = document.getElementById('ep-list');
  if (!stats || !list) return;
  const upcoming = items.filter(i => i.date >= new Date().toISOString().split('T')[0] && i.status !== 'cancelled').length;
  stats.textContent = `Total: ${items.length} | Próximos: ${upcoming} | Completados: ${items.filter(i => i.status === 'completed').length}`;
  list.innerHTML = '';
  items.sort((a, b) => b.date.localeCompare(a.date)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const statusColor = item.status === 'completed' ? 'green' : item.status === 'cancelled' ? 'red' : 'blue';
    const addTask = () => {
      const txt = prompt('Nueva tarea:'); if (!txt) return;
      const d = load(); const ev = d.find(x => x.id === item.id); if (!ev) return;
      ev.tasks.push({ id: uid(), text: txt, done: false });
      ev.updatedAt = now(); save(d); _refresh();
    };
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.type}</span><span class="ia-badge ${statusColor}">${item.status}</span><button class="ia-btn-sm" data-task="${item.id}">+tarea</button><select class="ia-btn-sm" data-status="${item.id}"><option>planning</option><option>confirmed</option><option>in-progress</option><option>completed</option><option>cancelled</option></select><button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><small></small><div id="tasks-${item.id}" style="margin-top:4px"></div>`;
    el.querySelector('strong').textContent = item.title;
    el.querySelector('small').textContent = `${item.date}${item.time ? ` ${item.time}` : ''}${item.location ? ` · ${item.location}` : ''}${item.expectedAttendees ? ` · ${item.expectedAttendees} asistentes` : ''}`;
    const sel = el.querySelector('[data-status]');
    sel.value = item.status;
    sel.onchange = () => {
      const d = load(); const ev = d.find(x => x.id === item.id); if (!ev) return;
      ev.status = sel.value; ev.updatedAt = now(); save(d); _refresh();
    };
    el.querySelector('[data-task]').onclick = addTask;
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const taskDiv = el.querySelector(`#tasks-${item.id}`);
    (item.tasks || []).forEach(t => {
      const td = document.createElement('div');
      td.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:0.8rem';
      td.innerHTML = `<input type="checkbox" ${t.done ? 'checked' : ''} /> <span style="${t.done ? 'text-decoration:line-through;opacity:0.6' : ''}">${t.text}</span>`;
      td.querySelector('input').onchange = () => {
        const d = load(); const ev = d.find(x => x.id === item.id); if (!ev) return;
        const tk = ev.tasks.find(x => x.id === t.id); if (!tk) return;
        tk.done = !tk.done; ev.updatedAt = now(); save(d); _refresh();
      };
      taskDiv.appendChild(td);
    });
    list.appendChild(el);
  });
}
