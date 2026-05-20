/** meeting-notes.js — Notas de reuniones · KAIROS browser module */
const MN_KEY = 'kairos:meetings';

function loadMeetings() { try { const d = JSON.parse(localStorage.getItem(MN_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveMeetings(list) { localStorage.setItem(MN_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

export function createMeeting(title, date, participants = [], agenda = '') {
  const list = loadMeetings();
  const now = new Date().toISOString();
  const m = { id: uid(), title: title.trim(), date, participants, agenda: agenda.trim(), notes: '', decisions: [], actionItems: [], createdAt: now, updatedAt: now };
  list.unshift(m);
  saveMeetings(list);
  return m;
}

export function updateNotes(id, notes, decisions = []) {
  const list = loadMeetings();
  const m = list.find(x => x.id === id);
  if (!m) return null;
  m.notes = notes.trim();
  m.decisions = decisions;
  m.updatedAt = new Date().toISOString();
  saveMeetings(list);
  return m;
}

export function addAction(meetingId, text, owner = '') {
  const list = loadMeetings();
  const m = list.find(x => x.id === meetingId);
  if (!m) return null;
  m.actionItems.push({ id: uid(), text: text.trim(), owner: owner.trim(), done: false });
  m.updatedAt = new Date().toISOString();
  saveMeetings(list);
  return m;
}

export function toggleAction(meetingId, actionId) {
  const list = loadMeetings();
  const m = list.find(x => x.id === meetingId);
  if (!m) return null;
  const a = m.actionItems.find(x => x.id === actionId);
  if (!a) return null;
  a.done = !a.done;
  m.updatedAt = new Date().toISOString();
  saveMeetings(list);
  return m;
}

export function deleteMeeting(id) {
  const list = loadMeetings();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveMeetings(list);
  return true;
}

export function getMeetingStats() {
  const list = loadMeetings();
  const actions = list.flatMap(m => m.actionItems);
  return { total: list.length, openActions: actions.filter(a => !a.done).length, completedActions: actions.filter(a => a.done).length };
}

export function renderMeetingPanel() {
  let panel = document.getElementById('kairos-meeting-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') renderMeetingList(); return; }
  panel = document.createElement('section');
  panel.id = 'kairos-meeting-panel';
  panel.className = 'kairos-panel';

  const h2 = document.createElement('h2'); h2.textContent = '📋 Meeting Notes'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'meeting-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form'); form.id = 'meeting-form';
  const titleIn = document.createElement('input'); titleIn.type = 'text'; titleIn.placeholder = 'Título de reunión'; titleIn.id = 'meeting-title-in';
  const dateIn = document.createElement('input'); dateIn.type = 'date'; dateIn.id = 'meeting-date-in'; dateIn.value = new Date().toISOString().slice(0,10);
  const partIn = document.createElement('input'); partIn.type = 'text'; partIn.placeholder = 'Participantes (separados por coma)'; partIn.id = 'meeting-part-in';
  const agendaIn = document.createElement('textarea'); agendaIn.placeholder = 'Agenda'; agendaIn.id = 'meeting-agenda-in';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Reunión';
  form.append(titleIn, dateIn, partIn, agendaIn, addBtn);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = titleIn.value.trim(); const dt = dateIn.value;
    if (!t || !dt) return;
    const parts = partIn.value.split(',').map(s => s.trim()).filter(Boolean);
    createMeeting(t, dt, parts, agendaIn.value.trim());
    titleIn.value = ''; partIn.value = ''; agendaIn.value = '';
    renderMeetingList();
  });
  panel.appendChild(form);

  const listEl = document.createElement('div'); listEl.id = 'meeting-list'; panel.appendChild(listEl);

  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderMeetingList();
}

function renderMeetingList() {
  const listEl = document.getElementById('meeting-list');
  const statsEl = document.getElementById('meeting-stats');
  if (!listEl) return;
  const list = loadMeetings();
  const stats = getMeetingStats();
  if (statsEl) { statsEl.textContent = `Reuniones: ${stats.total} · Acciones pendientes: ${stats.openActions} · Completadas: ${stats.completedActions}`; }
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay reuniones.'; listEl.appendChild(em); return; }
  list.forEach(m => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const titleSpan = document.createElement('strong'); titleSpan.textContent = m.title;
    const dateSpan = document.createElement('span'); dateSpan.textContent = ` · ${m.date}`;
    summary.append(titleSpan, dateSpan);
    details.appendChild(summary);
    if (m.participants.length) { const p = document.createElement('p'); p.textContent = 'Participantes: ' + m.participants.join(', '); details.appendChild(p); }
    // notes textarea
    const notesArea = document.createElement('textarea'); notesArea.value = m.notes; notesArea.placeholder = 'Notas…';
    const saveNotesBtn = document.createElement('button'); saveNotesBtn.textContent = 'Guardar notas';
    saveNotesBtn.addEventListener('click', () => { updateNotes(m.id, notesArea.value, m.decisions); renderMeetingList(); });
    details.append(notesArea, saveNotesBtn);
    // action items
    if (m.actionItems.length) {
      const ul = document.createElement('ul');
      m.actionItems.forEach(a => {
        const li = document.createElement('li');
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = a.done;
        cb.addEventListener('change', () => { toggleAction(m.id, a.id); renderMeetingList(); });
        const lbl = document.createElement('label'); lbl.textContent = `${a.text} (${a.owner || '?'})`;
        li.append(cb, lbl); ul.appendChild(li);
      });
      details.appendChild(ul);
    }
    // add action
    const actionRow = document.createElement('div');
    const actionIn = document.createElement('input'); actionIn.type = 'text'; actionIn.placeholder = 'Acción…';
    const ownerIn = document.createElement('input'); ownerIn.type = 'text'; ownerIn.placeholder = 'Responsable';
    const actionBtn = document.createElement('button'); actionBtn.textContent = '+ Acción';
    actionBtn.addEventListener('click', () => { const v = actionIn.value.trim(); if (!v) return; addAction(m.id, v, ownerIn.value.trim()); actionIn.value = ''; ownerIn.value = ''; renderMeetingList(); });
    actionRow.append(actionIn, ownerIn, actionBtn); details.appendChild(actionRow);
    const delBtn = document.createElement('button'); delBtn.textContent = '✕ Eliminar'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteMeeting(m.id); renderMeetingList(); });
    details.appendChild(delBtn);
    listEl.appendChild(details);
  });
}
