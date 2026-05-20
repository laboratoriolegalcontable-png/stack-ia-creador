/**
 * project-notes.js — Project Notes (KAIROS)
 * key: kairos:project-notes
 * @module project-notes
 */

const KEY = 'kairos:project-notes';

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function addNote(project, title, content, tags, pinned) {
  const items = load();
  const item = {
    id: uid(),
    project: String(project || '').trim(),
    title: String(title || '').trim(),
    content: String(content || '').trim(),
    tags: Array.isArray(tags) ? tags : parseTags(tags),
    pinned: Boolean(pinned),
    createdAt: new Date().toISOString()
  };
  items.push(item);
  save(items);
  return item;
}

function parseTags(raw) {
  if (!raw) return [];
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

function deleteNote(id) {
  save(load().filter(n => n.id !== id));
}

function togglePin(id) {
  const items = load();
  const idx = items.findIndex(n => n.id === id);
  if (idx !== -1) {
    items[idx].pinned = !items[idx].pinned;
    save(items);
  }
}

function getNoteStats() {
  const items = load();
  const total = items.length;
  const projectsCount = new Set(items.map(n => n.project).filter(Boolean)).size;
  const pinned = items.filter(n => n.pinned).length;
  return { total, projectsCount, pinned };
}

function getProjects() {
  return [...new Set(load().map(n => n.project).filter(Boolean))];
}

function renderList(container, projectFilter) {
  container.innerHTML = '';
  let items = load().sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt > a.createdAt ? 1 : -1;
  });
  if (projectFilter && projectFilter !== 'all') {
    items = items.filter(n => n.project === projectFilter);
  }

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '0.85rem';
    empty.textContent = 'No hay notas en este proyecto.';
    container.appendChild(empty);
    return;
  }

  for (const n of items) {
    const card = document.createElement('div');
    const borderColor = n.pinned ? '#4338ca' : '#374151';
    card.style.cssText = `background:#1f2937;border:1px solid ${borderColor};border-radius:8px;padding:0.85rem;margin-bottom:0.6rem;`;

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.4rem;';

    const titleEl = document.createElement('span');
    titleEl.style.cssText = 'color:#e5e7eb;font-weight:600;font-size:0.9rem;flex:1;';
    titleEl.textContent = (n.pinned ? '📌 ' : '') + n.title;

    const projBadge = document.createElement('span');
    projBadge.style.cssText = 'font-size:0.7rem;padding:0.1rem 0.5rem;border-radius:10px;background:#1e1b4b;color:#a5b4fc;font-weight:600;white-space:nowrap;';
    projBadge.textContent = n.project || 'sin proyecto';

    header.appendChild(titleEl);
    header.appendChild(projBadge);
    card.appendChild(header);

    if (n.content) {
      const contentEl = document.createElement('div');
      contentEl.style.cssText = 'color:#d1d5db;font-size:0.82rem;margin-bottom:0.4rem;white-space:pre-wrap;';
      contentEl.textContent = n.content;
      card.appendChild(contentEl);
    }

    if (n.tags && n.tags.length > 0) {
      const tagsEl = document.createElement('div');
      tagsEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.4rem;';
      n.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.style.cssText = 'background:#374151;color:#9ca3af;font-size:0.7rem;padding:0.1rem 0.4rem;border-radius:4px;';
        tagEl.textContent = '#' + tag;
        tagsEl.appendChild(tagEl);
      });
      card.appendChild(tagsEl);
    }

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:0.5rem;margin-top:0.4rem;';

    const pinBtn = document.createElement('button');
    pinBtn.textContent = n.pinned ? 'Desfijar' : 'Fijar';
    pinBtn.style.cssText = 'background:none;border:1px solid #374151;color:#a5b4fc;border-radius:4px;padding:0.15rem 0.5rem;font-size:0.72rem;cursor:pointer;';
    pinBtn.addEventListener('click', () => {
      togglePin(n.id);
      const panel = container.closest('[data-pnotes-panel]');
      const projFilter = panel?.querySelector('[data-active-project]')?.dataset.activeProject || 'all';
      renderList(container, projFilter);
      refreshStats(panel);
      refreshProjectTabs(panel);
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.style.cssText = 'background:none;border:1px solid #7f1d1d;color:#fca5a5;border-radius:4px;padding:0.15rem 0.4rem;font-size:0.72rem;cursor:pointer;';
    delBtn.addEventListener('click', () => {
      if (confirm('¿Eliminar esta nota?')) {
        deleteNote(n.id);
        const panel = container.closest('[data-pnotes-panel]');
        const projFilter = panel?.querySelector('[data-active-project]')?.dataset.activeProject || 'all';
        renderList(container, projFilter);
        refreshStats(panel);
        refreshProjectTabs(panel);
      }
    });

    actions.appendChild(pinBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);

    container.appendChild(card);
  }
}

function refreshStats(panel) {
  if (!panel) return;
  const statsEl = panel.querySelector('[data-pnotes-stats]');
  if (!statsEl) return;
  const s = getNoteStats();
  statsEl.textContent = `Total: ${s.total} · Proyectos: ${s.projectsCount} · Fijadas: ${s.pinned}`;
}

function refreshProjectTabs(panel) {
  if (!panel) return;
  const tabsContainer = panel.querySelector('[data-proj-tabs]');
  if (!tabsContainer) return;
  const activeProj = tabsContainer.dataset.activeProject || 'all';
  const listEl = panel.querySelector('[data-pnotes-list]');

  tabsContainer.innerHTML = '';
  const allProjects = ['all', ...getProjects()];
  allProjects.forEach(proj => {
    const btn = document.createElement('button');
    btn.textContent = proj === 'all' ? 'Todos' : proj;
    btn.style.cssText = `background:${proj === activeProj ? '#4338ca' : 'none'};color:${proj === activeProj ? '#fff' : '#9ca3af'};border:1px solid #374151;border-radius:4px;padding:0.2rem 0.6rem;font-size:0.78rem;cursor:pointer;`;
    btn.addEventListener('click', () => {
      tabsContainer.dataset.activeProject = proj;
      if (listEl) renderList(listEl, proj);
      refreshProjectTabs(panel);
    });
    tabsContainer.appendChild(btn);
  });
}

export function renderProjectNotes() {
  let panel = document.getElementById('kairos-pnotes-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const projFilter = panel.querySelector('[data-active-project]')?.dataset.activeProject || 'all';
      const listEl = panel.querySelector('[data-pnotes-list]');
      if (listEl) renderList(listEl, projFilter);
      refreshStats(panel);
      refreshProjectTabs(panel);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-pnotes-panel';
  panel.dataset.pnotesPanel = '1';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:460px;max-width:95vw;max-height:82vh;overflow-y:auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:1.25rem;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'margin:0 0 1rem;color:#a5b4fc;font-size:1rem;';
  titleEl.textContent = 'Project Notes';
  panel.appendChild(titleEl);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.dataset.pnotesStats = '1';
  statsEl.style.cssText = 'color:#6b7280;font-size:0.78rem;margin-bottom:1rem;';
  const s0 = getNoteStats();
  statsEl.textContent = `Total: ${s0.total} · Proyectos: ${s0.projectsCount} · Fijadas: ${s0.pinned}`;
  panel.appendChild(statsEl);

  // Form
  const form = document.createElement('div');
  form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #374151;';

  const row1 = document.createElement('div');
  row1.style.cssText = 'display:flex;gap:0.5rem;';

  const projInput = document.createElement('input');
  projInput.type = 'text';
  projInput.placeholder = 'Proyecto';
  projInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  const noteTitle = document.createElement('input');
  noteTitle.type = 'text';
  noteTitle.placeholder = 'Título de la nota';
  noteTitle.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  row1.appendChild(projInput);
  row1.appendChild(noteTitle);

  const contentInput = document.createElement('textarea');
  contentInput.placeholder = 'Contenido...';
  contentInput.rows = 3;
  contentInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;resize:vertical;';

  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.placeholder = 'Tags (separados por coma)';
  tagsInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  const pinRow = document.createElement('div');
  pinRow.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
  const pinCheck = document.createElement('input');
  pinCheck.type = 'checkbox';
  pinCheck.id = 'pnote-pin-check';
  const pinLabel = document.createElement('label');
  pinLabel.htmlFor = 'pnote-pin-check';
  pinLabel.style.cssText = 'color:#9ca3af;font-size:0.82rem;cursor:pointer;';
  pinLabel.textContent = 'Fijar nota';
  pinRow.appendChild(pinCheck);
  pinRow.appendChild(pinLabel);

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Guardar nota';
  addBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:6px;padding:0.5rem 1rem;font-size:0.85rem;cursor:pointer;font-weight:600;';

  form.appendChild(row1);
  form.appendChild(contentInput);
  form.appendChild(tagsInput);
  form.appendChild(pinRow);
  form.appendChild(addBtn);
  panel.appendChild(form);

  // Project tabs
  const projTabsEl = document.createElement('div');
  projTabsEl.dataset.projTabs = '1';
  projTabsEl.dataset.activeProject = 'all';
  projTabsEl.style.cssText = 'display:flex;gap:0.4rem;margin-bottom:0.75rem;flex-wrap:wrap;';
  panel.appendChild(projTabsEl);

  // List
  const listEl = document.createElement('div');
  listEl.dataset.pnotesList = '1';
  panel.appendChild(listEl);

  // Close
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  closeBtn.style.cssText = 'margin-top:1rem;background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 1rem;font-size:0.82rem;cursor:pointer;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  addBtn.addEventListener('click', () => {
    const t = noteTitle.value.trim();
    if (!t) { noteTitle.focus(); return; }
    addNote(projInput.value, t, contentInput.value, tagsInput.value, pinCheck.checked);
    projInput.value = '';
    noteTitle.value = '';
    contentInput.value = '';
    tagsInput.value = '';
    pinCheck.checked = false;
    const projFilter = projTabsEl.dataset.activeProject || 'all';
    renderList(listEl, projFilter);
    refreshStats(panel);
    refreshProjectTabs(panel);
  });

  document.body.appendChild(panel);
  refreshProjectTabs(panel);
  renderList(listEl, 'all');
}
