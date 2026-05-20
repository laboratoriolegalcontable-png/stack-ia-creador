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
