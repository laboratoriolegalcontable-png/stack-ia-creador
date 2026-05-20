/**
 * sprint-planner.js — Sprint & Story tracker (KAIROS)
 * key: kairos:sprints
 * @module sprint-planner
 */

const KEY = 'kairos:sprints';

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

export function createSprint(name, goal, startDate, endDate) {
  const sprints = load();
  const sprint = {
    id: uid(),
    name: String(name).trim(),
    goal: String(goal).trim(),
    startDate: startDate || localDate(),
    endDate: endDate || '',
    stories: [],
    createdAt: new Date().toISOString()
  };
  sprints.push(sprint);
  save(sprints);
  return sprint;
}

export function addStory(sprintId, title, points, assignee) {
  const sprints = load();
  const sprint = sprints.find(s => s.id === sprintId);
  if (!sprint) return null;
  const story = {
    id: uid(),
    title: String(title).trim(),
    points: parseInt(points, 10) || 0,
    status: 'backlog',
    assignee: String(assignee || '').trim(),
    createdAt: new Date().toISOString()
  };
  sprint.stories.push(story);
  save(sprints);
  return story;
}

export function updateStoryStatus(sprintId, storyId, status) {
  const valid = ['backlog', 'in-progress', 'done', 'blocked'];
  if (!valid.includes(status)) return false;
  const sprints = load();
  const sprint = sprints.find(s => s.id === sprintId);
  if (!sprint) return false;
  const story = sprint.stories.find(st => st.id === storyId);
  if (!story) return false;
  story.status = status;
  save(sprints);
  return true;
}

export function deleteSprint(id) {
  const sprints = load().filter(s => s.id !== id);
  save(sprints);
}

export function getSprintStats() {
  const sprints = load();
  let totalPoints = 0;
  let donePoints = 0;
  let totalStories = 0;
  let doneStories = 0;
  for (const sprint of sprints) {
    for (const story of sprint.stories) {
      totalPoints += story.points;
      totalStories++;
      if (story.status === 'done') {
        donePoints += story.points;
        doneStories++;
      }
    }
  }
  return {
    total: sprints.length,
    velocity: donePoints,
    completionRate: totalStories > 0 ? Math.round((doneStories / totalStories) * 100) : 0
  };
}

function renderSprintList() {
  const container = document.getElementById('kairos-sprint-list');
  if (!container) return;
  container.innerHTML = '';
  const sprints = load();
  if (sprints.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '0.85rem';
    empty.textContent = 'No hay sprints. Crea uno arriba.';
    container.appendChild(empty);
    return;
  }
  for (const sprint of sprints) {
    const total = sprint.stories.length;
    const done = sprint.stories.filter(st => st.status === 'done').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937;border:1px solid #374151;border-radius:8px;padding:1rem;margin-bottom:0.75rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;';

    const titleWrap = document.createElement('div');
    const nameEl = document.createElement('strong');
    nameEl.style.color = '#a5b4fc';
    nameEl.textContent = sprint.name;
    titleWrap.appendChild(nameEl);
    if (sprint.goal) {
      const goalEl = document.createElement('div');
      goalEl.style.cssText = 'color:#9ca3af;font-size:0.8rem;margin-top:0.2rem;';
      goalEl.textContent = sprint.goal;
      titleWrap.appendChild(goalEl);
    }

    const datesEl = document.createElement('span');
    datesEl.style.cssText = 'color:#6b7280;font-size:0.75rem;';
    datesEl.textContent = `${sprint.startDate || ''}${sprint.endDate ? ' → ' + sprint.endDate : ''}`;

    header.appendChild(titleWrap);
    header.appendChild(datesEl);
    card.appendChild(header);

    // Progress bar
    const progressWrap = document.createElement('div');
    progressWrap.style.cssText = 'background:#374151;border-radius:4px;height:6px;margin-bottom:0.5rem;overflow:hidden;';
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `background:#6366f1;height:6px;width:${pct}%;transition:width 0.3s;`;
    progressWrap.appendChild(progressBar);
    card.appendChild(progressWrap);

    const countEl = document.createElement('div');
    countEl.style.cssText = 'color:#9ca3af;font-size:0.78rem;margin-bottom:0.75rem;';
    countEl.textContent = `${done}/${total} stories · ${pct}%`;
    card.appendChild(countEl);

    // Stories list
    const storiesContainer = document.createElement('div');
    storiesContainer.id = `sprint-stories-${sprint.id}`;
    for (const story of sprint.stories) {
      const storyRow = document.createElement('div');
      storyRow.style.cssText = 'display:flex;gap:0.5rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;';

      const statusSel = document.createElement('select');
      statusSel.style.cssText = 'background:#111827;border:1px solid #374151;color:#e5e7eb;border-radius:4px;padding:0.15rem 0.3rem;font-size:0.75rem;';
      ['backlog','in-progress','done','blocked'].forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === story.status) opt.selected = true;
        statusSel.appendChild(opt);
      });
      statusSel.addEventListener('change', () => {
        updateStoryStatus(sprint.id, story.id, statusSel.value);
        renderSprintList();
      });

      const titleEl = document.createElement('span');
      titleEl.style.cssText = 'flex:1;color:#e5e7eb;font-size:0.82rem;';
      titleEl.textContent = story.title;

      const ptsEl = document.createElement('span');
      ptsEl.style.cssText = 'color:#6366f1;font-size:0.75rem;font-weight:700;min-width:2rem;text-align:right;';
      ptsEl.textContent = story.points + 'pt';

      if (story.assignee) {
        const asgEl = document.createElement('span');
        asgEl.style.cssText = 'color:#9ca3af;font-size:0.72rem;';
        asgEl.textContent = story.assignee;
        storyRow.appendChild(statusSel);
        storyRow.appendChild(titleEl);
        storyRow.appendChild(ptsEl);
        storyRow.appendChild(asgEl);
      } else {
        storyRow.appendChild(statusSel);
        storyRow.appendChild(titleEl);
        storyRow.appendChild(ptsEl);
      }
      storiesContainer.appendChild(storyRow);
    }
    card.appendChild(storiesContainer);

    // Add story inline form
    const addStoryForm = document.createElement('div');
    addStoryForm.style.cssText = 'margin-top:0.75rem;display:flex;gap:0.4rem;flex-wrap:wrap;';

    const storyTitleInput = document.createElement('input');
    storyTitleInput.placeholder = 'Nueva story...';
    storyTitleInput.style.cssText = 'flex:2;min-width:120px;background:#111827;border:1px solid #374151;color:#e5e7eb;border-radius:4px;padding:0.3rem 0.5rem;font-size:0.8rem;';

    const storyPtsInput = document.createElement('input');
    storyPtsInput.type = 'number';
    storyPtsInput.placeholder = 'Pts';
    storyPtsInput.min = '0';
    storyPtsInput.style.cssText = 'width:60px;background:#111827;border:1px solid #374151;color:#e5e7eb;border-radius:4px;padding:0.3rem 0.5rem;font-size:0.8rem;';

    const storyAssigneeInput = document.createElement('input');
    storyAssigneeInput.placeholder = 'Asignado';
    storyAssigneeInput.style.cssText = 'flex:1;min-width:80px;background:#111827;border:1px solid #374151;color:#e5e7eb;border-radius:4px;padding:0.3rem 0.5rem;font-size:0.8rem;';

    const addStoryBtn = document.createElement('button');
    addStoryBtn.textContent = '+ Story';
    addStoryBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:4px;padding:0.3rem 0.6rem;font-size:0.8rem;cursor:pointer;';
    addStoryBtn.addEventListener('click', () => {
      const t = storyTitleInput.value.trim();
      if (!t) return;
      addStory(sprint.id, t, storyPtsInput.value || 0, storyAssigneeInput.value);
      storyTitleInput.value = '';
      storyPtsInput.value = '';
      storyAssigneeInput.value = '';
      renderSprintList();
    });

    addStoryForm.appendChild(storyTitleInput);
    addStoryForm.appendChild(storyPtsInput);
    addStoryForm.appendChild(storyAssigneeInput);
    addStoryForm.appendChild(addStoryBtn);
    card.appendChild(addStoryForm);

    // Delete sprint button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar sprint';
    delBtn.style.cssText = 'margin-top:0.6rem;background:none;border:1px solid #7f1d1d;color:#fca5a5;border-radius:4px;padding:0.2rem 0.5rem;font-size:0.75rem;cursor:pointer;';
    delBtn.addEventListener('click', () => {
      if (confirm(`¿Eliminar sprint "${sprint.name}"?`)) {
        deleteSprint(sprint.id);
        renderSprintList();
      }
    });
    card.appendChild(delBtn);

    container.appendChild(card);
  }
}

export function renderSprintPanel() {
  let panel = document.getElementById('kairos-sprint-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') renderSprintList();
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-sprint-panel';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:420px;max-width:95vw;max-height:80vh;overflow-y:auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:1.25rem;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'margin:0 0 1rem;color:#a5b4fc;font-size:1rem;';
  titleEl.textContent = '🏃 Sprint Planner';
  panel.appendChild(titleEl);

  // Create sprint form
  const form = document.createElement('div');
  form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #374151;';

  const nameInput = document.createElement('input');
  nameInput.placeholder = 'Nombre del sprint...';
  nameInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.7rem;font-size:0.85rem;';

  const goalInput = document.createElement('input');
  goalInput.placeholder = 'Objetivo del sprint...';
  goalInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.7rem;font-size:0.85rem;';

  const datesRow = document.createElement('div');
  datesRow.style.cssText = 'display:flex;gap:0.5rem;';

  const startInput = document.createElement('input');
  startInput.type = 'date';
  startInput.value = localDate();
  startInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';

  const endInput = document.createElement('input');
  endInput.type = 'date';
  endInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';

  datesRow.appendChild(startInput);
  datesRow.appendChild(endInput);

  const createBtn = document.createElement('button');
  createBtn.textContent = '+ Crear Sprint';
  createBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:6px;padding:0.5rem;font-size:0.85rem;cursor:pointer;font-weight:600;';
  createBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    createSprint(name, goalInput.value, startInput.value, endInput.value);
    nameInput.value = '';
    goalInput.value = '';
    startInput.value = localDate();
    endInput.value = '';
    renderSprintList();
  });

  form.appendChild(nameInput);
  form.appendChild(goalInput);
  form.appendChild(datesRow);
  form.appendChild(createBtn);
  panel.appendChild(form);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.id = 'kairos-sprint-stats';
  statsEl.style.cssText = 'color:#9ca3af;font-size:0.78rem;margin-bottom:0.75rem;';
  const stats = getSprintStats();
  statsEl.textContent = `Sprints: ${stats.total} · Velocidad: ${stats.velocity}pt · Completado: ${stats.completionRate}%`;
  panel.appendChild(statsEl);

  const listEl = document.createElement('div');
  listEl.id = 'kairos-sprint-list';
  panel.appendChild(listEl);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Cerrar';
  closeBtn.style.cssText = 'margin-top:1rem;background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 0.8rem;font-size:0.82rem;cursor:pointer;width:100%;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  document.body.appendChild(panel);
  renderSprintList();
}
