/**
 * event-planner.js — Planificador de eventos
 * @module event-planner
 */

const KEY = 'kairos:events';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_COLORS = {
  planning: 'yellow',
  confirmed: 'blue',
  'in-progress': 'green',
  completed: 'green',
  cancelled: 'red',
};

const TYPE_COLORS = {
  meeting: 'blue',
  conference: 'purple',
  workshop: 'yellow',
  social: 'green',
  webinar: 'blue',
  other: 'grey',
};

export function renderEventPlanner() {
  let panel = document.getElementById('eventplanner-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'eventplanner-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>/eventplanner — Eventos</h2><button class="ia-close" id="eventplanner-close">✕</button></div>
    <div class="ia-panel-body">
      <form id="eventplanner-form" class="ia-form">
        <input id="evp-title" placeholder="Título del evento *" required />
        <select id="evp-type">
          <option value="meeting">Meeting</option>
          <option value="conference">Conference</option>
          <option value="workshop">Workshop</option>
          <option value="social">Social</option>
          <option value="webinar">Webinar</option>
          <option value="other">Other</option>
        </select>
        <div style="display:flex;gap:8px">
          <input id="evp-startDate" type="date" placeholder="Inicio" style="flex:1" />
          <input id="evp-endDate" type="date" placeholder="Fin" style="flex:1" />
        </div>
        <input id="evp-location" placeholder="Ubicación" />
        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem">
          <input id="evp-isVirtual" type="checkbox" /> Virtual
        </label>
        <select id="evp-status">
          <option value="planning">Planning</option>
          <option value="confirmed">Confirmed</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <textarea id="evp-description" placeholder="Descripción" rows="2"></textarea>
        <button type="submit" class="ia-btn">Crear evento</button>
      </form>
      <div id="eventplanner-stats" class="ia-stats"></div>
      <ul id="eventplanner-list"></ul>
    </div>`;
  document.body.appendChild(panel);

  document.getElementById('eventplanner-close').addEventListener('click', () => { panel.style.display = 'none'; });

  document.getElementById('eventplanner-form').addEventListener('submit', e => {
    e.preventDefault();
    const items = load();
    items.unshift({
      id: uid(),
      title: document.getElementById('evp-title').value.trim(),
      type: document.getElementById('evp-type').value,
      startDate: document.getElementById('evp-startDate').value,
      endDate: document.getElementById('evp-endDate').value,
      location: document.getElementById('evp-location').value.trim(),
      isVirtual: document.getElementById('evp-isVirtual').checked,
      status: document.getElementById('evp-status').value,
      description: document.getElementById('evp-description').value.trim(),
      attendees: [],
      createdAt: now(),
      updatedAt: now(),
    });
    save(items);
    e.target.reset();
    _refresh();
  });

  _refresh();
}

function _refresh() {
  const items = load();
  const statsEl = document.getElementById('eventplanner-stats');
  const listEl = document.getElementById('eventplanner-list');
  if (!statsEl || !listEl) return;

  const today = new Date().toISOString().split('T')[0];
  const total = items.length;
  const upcoming = items.filter(i => i.startDate > today && i.status !== 'cancelled').length;
  const completed = items.filter(i => i.status === 'completed').length;
  const byType = {};
  for (const i of items) byType[i.type] = (byType[i.type] || 0) + 1;
  const typeSummary = Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(' · ');

  statsEl.textContent = `Total: ${total} · Próximos: ${upcoming} · Completados: ${completed}${typeSummary ? ' · ' + typeSummary : ''}`;

  listEl.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'ia-list-item';

    const title = document.createElement('strong');
    title.textContent = item.title;

    const typeBadge = document.createElement('span');
    typeBadge.className = `ia-badge ${TYPE_COLORS[item.type] || 'grey'}`;
    typeBadge.textContent = item.type;

    const statusBadge = document.createElement('span');
    statusBadge.className = `ia-badge ${STATUS_COLORS[item.status] || 'grey'}`;
    statusBadge.textContent = item.status;

    const dates = document.createElement('small');
    const dateRange = item.startDate && item.endDate
      ? `${item.startDate} → ${item.endDate}`
      : item.startDate || '';
    const locationText = item.isVirtual ? '🌐 Virtual' : (item.location || '');
    dates.textContent = [dateRange, locationText].filter(Boolean).join(' · ');

    const statusSel = document.createElement('select');
    statusSel.className = 'ia-btn-sm';
    ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'].forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      if (s === item.status) opt.selected = true;
      statusSel.appendChild(opt);
    });
    statusSel.addEventListener('change', () => {
      const all = load();
      const idx = all.findIndex(x => x.id === item.id);
      if (idx !== -1) { all[idx].status = statusSel.value; all[idx].updatedAt = now(); save(all); _refresh(); }
    });

    const addAttendeeBtn = document.createElement('button');
    addAttendeeBtn.className = 'ia-btn-sm';
    addAttendeeBtn.textContent = '+asistente';
    addAttendeeBtn.addEventListener('click', () => {
      const email = prompt('Email del asistente:');
      if (!email || !email.trim()) return;
      const all = load();
      const idx = all.findIndex(x => x.id === item.id);
      if (idx !== -1) {
        all[idx].attendees = all[idx].attendees || [];
        all[idx].attendees.push(email.trim());
        all[idx].updatedAt = now();
        save(all);
        _refresh();
      }
    });

    const del = document.createElement('button');
    del.className = 'ia-btn-sm red';
    del.textContent = '✕';
    del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });

    li.append(title, typeBadge, statusBadge, dates, statusSel, addAttendeeBtn, del);

    if (item.attendees && item.attendees.length > 0) {
      const atList = document.createElement('small');
      atList.style.cssText = 'display:block;margin-top:4px;opacity:0.7';
      atList.textContent = `Asistentes: ${item.attendees.join(', ')}`;
      li.appendChild(atList);
    }

    listEl.appendChild(li);
  }
}
