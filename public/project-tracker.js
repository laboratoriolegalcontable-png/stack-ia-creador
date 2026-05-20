/** project-tracker.js — Seguimiento de proyectos · KAIROS browser module */
const PT_KEY = 'kairos:projects';

function loadProjects() { try { const d = JSON.parse(localStorage.getItem(PT_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveProjects(list) { localStorage.setItem(PT_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

export function createProject(title, description = '', priority = 'medium', tags = [], deadline = '') {
  const list = loadProjects();
  const now = new Date().toISOString();
  const project = { id: uid(), title: title.trim(), description: description.trim(), status: 'active', priority, tags, tasks: [], deadline: deadline || undefined, createdAt: now, updatedAt: now };
  list.unshift(project);
  saveProjects(list);
  return project;
}

export function updateProjectStatus(id, status) {
  const list = loadProjects();
  const p = list.find(x => x.id === id);
  if (!p) return null;
  p.status = status;
  p.updatedAt = new Date().toISOString();
  if (status === 'completed') p.completedAt = p.updatedAt;
  saveProjects(list);
  return p;
}

export function addProjectTask(projectId, taskTitle) {
  const list = loadProjects();
  const p = list.find(x => x.id === projectId);
  if (!p) return null;
  p.tasks.push({ id: uid(), title: taskTitle.trim(), done: false, createdAt: new Date().toISOString() });
  p.updatedAt = new Date().toISOString();
  saveProjects(list);
  return p;
}

export function toggleProjectTask(projectId, taskId) {
  const list = loadProjects();
  const p = list.find(x => x.id === projectId);
  if (!p) return null;
  const t = p.tasks.find(x => x.id === taskId);
  if (!t) return null;
  t.done = !t.done;
  p.updatedAt = new Date().toISOString();
  saveProjects(list);
  return p;
}

export function deleteProject(id) {
  const list = loadProjects();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveProjects(list);
  return true;
}

export function getProjectStats() {
  const list = loadProjects();
  return { total: list.length, active: list.filter(p => p.status === 'active').length, completed: list.filter(p => p.status === 'completed').length, paused: list.filter(p => p.status === 'paused').length };
}

export function renderProjectPanel() {
  let panel = document.getElementById('kairos-project-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') renderProjectList(); return; }
  panel = document.createElement('section');
  panel.id = 'kairos-project-panel';
  panel.className = 'kairos-panel';

  const h2 = document.createElement('h2'); h2.textContent = '🗂 Project Tracker'; panel.appendChild(h2);

  // Stats
  const statsEl = document.createElement('p'); statsEl.id = 'project-stats'; panel.appendChild(statsEl);

  // Form
  const form = document.createElement('form'); form.id = 'project-form';
  const titleIn = document.createElement('input'); titleIn.type = 'text'; titleIn.placeholder = 'Título del proyecto'; titleIn.id = 'project-title-in';
  const descIn = document.createElement('input'); descIn.type = 'text'; descIn.placeholder = 'Descripción'; descIn.id = 'project-desc-in';
  const prioSel = document.createElement('select'); prioSel.id = 'project-prio-in';
  ['low','medium','high'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; prioSel.appendChild(o); });
  prioSel.value = 'medium';
  const deadIn = document.createElement('input'); deadIn.type = 'date'; deadIn.id = 'project-deadline-in';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Proyecto';
  form.append(titleIn, descIn, prioSel, deadIn, addBtn);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = titleIn.value.trim();
    if (!t) return;
    createProject(t, descIn.value.trim(), prioSel.value, [], deadIn.value);
    titleIn.value = ''; descIn.value = ''; deadIn.value = '';
    renderProjectList();
  });
  panel.appendChild(form);

  // List
  const listEl = document.createElement('div'); listEl.id = 'project-list'; panel.appendChild(listEl);

  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderProjectList();
}

export function renderProjectTracker() {
  const PT2_KEY = 'kairos:projects';
  function _load2() { try { const d = JSON.parse(localStorage.getItem(PT2_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
  function _save2(d) { localStorage.setItem(PT2_KEY, JSON.stringify(d)); }
  function _uid2() { return crypto.randomUUID(); }
  function _now2() { return new Date().toISOString(); }

  let panel = document.getElementById('projecttracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh2(); return; }
  panel = document.createElement('div');
  panel.id = 'projecttracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <h3>Project Tracker</h3>
    <form id="projecttracker-form">
      <input id="pt2-title" placeholder="Título *" required style="margin:2px">
      <textarea id="pt2-desc" placeholder="Descripción" rows="2" style="margin:2px;width:100%;box-sizing:border-box"></textarea>
      <select id="pt2-status" style="margin:2px">
        <option value="planning">Planning</option>
        <option value="active" selected>Active</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select id="pt2-priority" style="margin:2px">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <input id="pt2-due" type="date" style="margin:2px">
      <button type="submit">Agregar Proyecto</button>
    </form>
    <div class="ia-stats" id="projecttracker-stats"></div>
    <ul id="projecttracker-list" style="list-style:none;padding:0;margin-top:0.5rem"></ul>
  `;
  document.body.appendChild(panel);

  function _refresh2() {
    const projects = _load2();
    const list = document.getElementById('projecttracker-list');
    const stats = document.getElementById('projecttracker-stats');
    if (!list || !stats) return;
    list.innerHTML = '';
    const statusColor = { planning:'#6366f1', active:'#059669', 'on-hold':'#d97706', completed:'#374151', cancelled:'#dc2626' };
    const prioColor   = { low:'#374151', medium:'#1d4ed8', high:'#d97706', critical:'#dc2626' };
    projects.slice().reverse().forEach(p => {
      const li = document.createElement('li');
      li.style.cssText = 'border:1px solid #374151;border-radius:6px;padding:0.5rem;margin-bottom:0.4rem';
      const top = document.createElement('div');
      top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:0.4rem;flex-wrap:wrap';
      const titleEl = document.createElement('strong');
      titleEl.textContent = p.title;
      const sBadge = document.createElement('span');
      sBadge.style.cssText = `background:${statusColor[p.status]||'#374151'};color:#fff;border-radius:4px;padding:0.1rem 0.4rem;font-size:0.72rem`;
      sBadge.textContent = p.status;
      const pBadge = document.createElement('span');
      pBadge.style.cssText = `background:${prioColor[p.priority]||'#374151'};color:#fff;border-radius:4px;padding:0.1rem 0.4rem;font-size:0.72rem`;
      pBadge.textContent = p.priority;
      const mCount = document.createElement('span');
      mCount.style.cssText = 'color:#9ca3af;font-size:0.75rem';
      mCount.textContent = `${(p.milestones||[]).length} milestones`;
      const delBtn = document.createElement('button');
      delBtn.className = 'ia-cmd'; delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => { _save2(_load2().filter(x => x.id !== p.id)); _refresh2(); });
      top.appendChild(titleEl); top.appendChild(sBadge); top.appendChild(pBadge); top.appendChild(mCount); top.appendChild(delBtn);
      li.appendChild(top);
      list.appendChild(li);
    });
    const active    = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold    = projects.filter(p => p.status === 'on-hold').length;
    stats.textContent = `Total: ${projects.length} · Activos: ${active} · Completados: ${completed} · En pausa: ${onHold}`;
  }

  document.getElementById('projecttracker-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('pt2-title').value.trim();
    if (!title) return;
    const projects = _load2();
    projects.push({
      id: _uid2(),
      title,
      description: document.getElementById('pt2-desc').value.trim(),
      status:   document.getElementById('pt2-status').value,
      priority: document.getElementById('pt2-priority').value,
      dueDate:  document.getElementById('pt2-due').value,
      milestones: [],
      createdAt: _now2(), updatedAt: _now2()
    });
    _save2(projects);
    e.target.reset();
    _refresh2();
  });
  _refresh2();
}

function renderProjectList() {
  const listEl = document.getElementById('project-list');
  const statsEl = document.getElementById('project-stats');
  if (!listEl) return;
  const list = loadProjects();
  const stats = getProjectStats();
  if (statsEl) { statsEl.textContent = `Total: ${stats.total} · Activos: ${stats.active} · Completados: ${stats.completed}`; }
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay proyectos.'; listEl.appendChild(em); return; }
  list.forEach(p => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const titleEl = document.createElement('strong'); titleEl.textContent = p.title;
    const badge = document.createElement('span'); badge.className = `badge badge-${p.status}`; badge.textContent = p.status;
    const prio = document.createElement('span'); prio.className = 'badge'; prio.textContent = p.priority;
    top.append(titleEl, badge, prio);
    card.appendChild(top);
    if (p.description) { const desc = document.createElement('p'); desc.textContent = p.description; card.appendChild(desc); }
    // status select
    const statusSel = document.createElement('select');
    ['active','paused','completed','archived'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; if (v === p.status) o.selected = true; statusSel.appendChild(o); });
    statusSel.addEventListener('change', () => { updateProjectStatus(p.id, statusSel.value); renderProjectList(); });
    card.appendChild(statusSel);
    // tasks
    if (p.tasks.length) {
      const ul = document.createElement('ul');
      p.tasks.forEach(t => {
        const li = document.createElement('li');
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = t.done;
        cb.addEventListener('change', () => { toggleProjectTask(p.id, t.id); renderProjectList(); });
        const lbl = document.createElement('label'); lbl.textContent = t.title;
        li.append(cb, lbl); ul.appendChild(li);
      });
      card.appendChild(ul);
    }
    // add task
    const taskRow = document.createElement('div');
    const taskIn = document.createElement('input'); taskIn.type = 'text'; taskIn.placeholder = 'Nueva tarea…';
    const taskBtn = document.createElement('button'); taskBtn.textContent = '+';
    taskBtn.addEventListener('click', () => { const v = taskIn.value.trim(); if (!v) return; addProjectTask(p.id, v); taskIn.value = ''; renderProjectList(); });
    taskRow.append(taskIn, taskBtn); card.appendChild(taskRow);
    // delete
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteProject(p.id); renderProjectList(); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
