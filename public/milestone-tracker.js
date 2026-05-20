/**
 * milestone-tracker.js — Milestone Tracker (KAIROS)
 * key: kairos:milestones
 * @module milestone-tracker
 */

const KEY = 'kairos:milestones';

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function addMilestone(title, project, dueDate, notes) {
  const items = load();
  const today = localDate();
  let status = 'pending';
  if (dueDate && dueDate < today) status = 'overdue';
  const item = {
    id: uid(),
    title: String(title || '').trim(),
    project: String(project || '').trim(),
    dueDate: dueDate || '',
    status,
    notes: String(notes || '').trim(),
    createdAt: new Date().toISOString()
  };
  items.push(item);
  save(items);
  return item;
}

function deleteMilestone(id) {
  save(load().filter(m => m.id !== id));
}

function toggleDone(id) {
  const items = load();
  const idx = items.findIndex(m => m.id === id);
  if (idx === -1) return;
  const m = items[idx];
  if (m.status === 'done') {
    const today = localDate();
    m.status = (m.dueDate && m.dueDate < today) ? 'overdue' : 'pending';
  } else {
    m.status = 'done';
  }
  save(items);
}

function getMilestoneStats() {
  const items = load();
  const total = items.length;
  const done = items.filter(m => m.status === 'done').length;
  const overdue = items.filter(m => m.status === 'overdue').length;
  return { total, done, overdue };
}

function renderList(container, filter) {
  container.innerHTML = '';
  const activeFilter = filter || 'all';
  let items = load().sort((a, b) => (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1);
  if (activeFilter !== 'all') items = items.filter(m => m.status === activeFilter);

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '0.85rem';
    empty.textContent = 'No hay hitos en esta categoría.';
    container.appendChild(empty);
    return;
  }

  const STATUS_COLOR = { pending: '#4338ca', done: '#059669', overdue: '#dc2626' };

  for (const m of items) {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937;border:1px solid #374151;border-radius:8px;padding:0.85rem;margin-bottom:0.6rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.4rem;';

    const titleEl = document.createElement('span');
    titleEl.style.cssText = 'color:#e5e7eb;font-weight:600;font-size:0.9rem;flex:1;';
    titleEl.textContent = m.title;

    const badge = document.createElement('span');
    const bc = STATUS_COLOR[m.status] || '#374151';
    badge.style.cssText = `font-size:0.7rem;padding:0.1rem 0.5rem;border-radius:10px;background:${bc};color:#fff;font-weight:600;white-space:nowrap;`;
    badge.textContent = m.status;

    header.appendChild(titleEl);
    header.appendChild(badge);
    card.appendChild(header);

    if (m.project) {
      const projEl = document.createElement('div');
      projEl.style.cssText = 'color:#6366f1;font-size:0.78rem;margin-bottom:0.3rem;';
      projEl.textContent = m.project;
      card.appendChild(projEl);
    }

    if (m.dueDate) {
      const dueEl = document.createElement('div');
      dueEl.style.cssText = 'color:#9ca3af;font-size:0.78rem;margin-bottom:0.3rem;';
      dueEl.textContent = 'Vence: ' + m.dueDate;
      card.appendChild(dueEl);
    }

    if (m.notes) {
      const notesEl = document.createElement('div');
      notesEl.style.cssText = 'color:#d1d5db;font-size:0.82rem;margin-bottom:0.4rem;';
      notesEl.textContent = m.notes;
      card.appendChild(notesEl);
    }

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:0.5rem;margin-top:0.5rem;';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = m.status === 'done' ? 'Reabrir' : 'Completar';
    toggleBtn.style.cssText = 'background:none;border:1px solid #374151;color:#a5b4fc;border-radius:4px;padding:0.15rem 0.5rem;font-size:0.72rem;cursor:pointer;';
    toggleBtn.addEventListener('click', () => {
      toggleDone(m.id);
      const activeTab = container.closest('[data-milestone-panel]')?.querySelector('[data-active-filter]')?.dataset.activeFilter || 'all';
      renderList(container, activeTab);
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.style.cssText = 'background:none;border:1px solid #7f1d1d;color:#fca5a5;border-radius:4px;padding:0.15rem 0.4rem;font-size:0.72rem;cursor:pointer;';
    delBtn.addEventListener('click', () => {
      if (confirm('¿Eliminar este hito?')) {
        deleteMilestone(m.id);
        const activeTab = container.closest('[data-milestone-panel]')?.querySelector('[data-active-filter]')?.dataset.activeFilter || 'all';
        renderList(container, activeTab);
        refreshStats(container.closest('[data-milestone-panel]'));
      }
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);

    container.appendChild(card);
  }
}

function refreshStats(panel) {
  if (!panel) return;
  const s = getMilestoneStats();
  const statsEl = panel.querySelector('[data-milestone-stats]');
  if (statsEl) {
    statsEl.textContent = `Total: ${s.total} · Completados: ${s.done} · Vencidos: ${s.overdue}`;
  }
}

export function renderMilestonePanel() {
  let panel = document.getElementById('kairos-milestone-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const activeFilter = panel.querySelector('[data-active-filter]')?.dataset.activeFilter || 'all';
      const listEl = panel.querySelector('[data-milestone-list]');
      if (listEl) renderList(listEl, activeFilter);
      refreshStats(panel);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-milestone-panel';
  panel.dataset.milestonePanel = '1';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:460px;max-width:95vw;max-height:82vh;overflow-y:auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:1.25rem;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'margin:0 0 1rem;color:#a5b4fc;font-size:1rem;';
  titleEl.textContent = 'Milestone Tracker';
  panel.appendChild(titleEl);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.dataset.milestoneStats = '1';
  statsEl.style.cssText = 'color:#6b7280;font-size:0.78rem;margin-bottom:1rem;';
  const s = getMilestoneStats();
  statsEl.textContent = `Total: ${s.total} · Completados: ${s.done} · Vencidos: ${s.overdue}`;
  panel.appendChild(statsEl);

  // Form
  const form = document.createElement('div');
  form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #374151;';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Título del hito';
  titleInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  const projInput = document.createElement('input');
  projInput.type = 'text';
  projInput.placeholder = 'Proyecto';
  projInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  const dueDateInput = document.createElement('input');
  dueDateInput.type = 'date';
  dueDateInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  const notesInput = document.createElement('textarea');
  notesInput.placeholder = 'Notas (opcional)';
  notesInput.rows = 2;
  notesInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;resize:vertical;';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Agregar hito';
  addBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:6px;padding:0.5rem 1rem;font-size:0.85rem;cursor:pointer;font-weight:600;';

  form.appendChild(titleInput);
  form.appendChild(projInput);
  form.appendChild(dueDateInput);
  form.appendChild(notesInput);
  form.appendChild(addBtn);
  panel.appendChild(form);

  // Filter tabs
  const tabsEl = document.createElement('div');
  tabsEl.dataset.activeFilter = 'all';
  tabsEl.style.cssText = 'display:flex;gap:0.4rem;margin-bottom:0.75rem;flex-wrap:wrap;';

  const filters = ['all', 'pending', 'done', 'overdue'];
  const tabBtns = {};
  filters.forEach(f => {
    const btn = document.createElement('button');
    btn.textContent = f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1);
    btn.style.cssText = `background:${f === 'all' ? '#4338ca' : 'none'};color:${f === 'all' ? '#fff' : '#9ca3af'};border:1px solid #374151;border-radius:4px;padding:0.2rem 0.6rem;font-size:0.78rem;cursor:pointer;`;
    btn.addEventListener('click', () => {
      tabsEl.dataset.activeFilter = f;
      filters.forEach(ff => {
        tabBtns[ff].style.background = ff === f ? '#4338ca' : 'none';
        tabBtns[ff].style.color = ff === f ? '#fff' : '#9ca3af';
      });
      renderList(listEl, f);
    });
    tabBtns[f] = btn;
    tabsEl.appendChild(btn);
  });
  panel.appendChild(tabsEl);

  // List
  const listEl = document.createElement('div');
  listEl.dataset.milestoneList = '1';
  panel.appendChild(listEl);

  // Close
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  closeBtn.style.cssText = 'margin-top:1rem;background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 1rem;font-size:0.82rem;cursor:pointer;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  addBtn.addEventListener('click', () => {
    const t = titleInput.value.trim();
    if (!t) { titleInput.focus(); return; }
    addMilestone(t, projInput.value, dueDateInput.value, notesInput.value);
    titleInput.value = '';
    projInput.value = '';
    dueDateInput.value = '';
    notesInput.value = '';
    const activeFilter = tabsEl.dataset.activeFilter || 'all';
    renderList(listEl, activeFilter);
    refreshStats(panel);
  });

  document.body.appendChild(panel);
  renderList(listEl, 'all');
}
