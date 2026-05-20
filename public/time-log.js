/** time-log.js — Time Log tracker · KAIROS browser module */
const TL_KEY = 'kairos:timelogs';

function loadEntries() { try { const d = JSON.parse(localStorage.getItem(TL_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveEntries(list) { localStorage.setItem(TL_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function addTimeEntry(project, category = 'general', description = '', minutes, date) {
  const list = loadEntries();
  const entry = {
    id: uid(),
    project: project.trim(),
    category: (category.trim() || 'general'),
    description: description.trim(),
    minutes: Math.max(1, Math.round(+minutes || 1)),
    date: date || localDate(),
    createdAt: new Date().toISOString()
  };
  list.unshift(entry);
  saveEntries(list);
  return entry;
}

export function deleteTimeEntry(id) {
  const list = loadEntries();
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveEntries(list);
  return true;
}

export function getTimeStats() {
  const list = loadEntries();
  const totalMinutes = list.reduce((a, e) => a + e.minutes, 0);
  const byProject = {};
  const byCategory = {};
  list.forEach(e => {
    byProject[e.project] = (byProject[e.project] || 0) + e.minutes;
    byCategory[e.category] = (byCategory[e.category] || 0) + e.minutes;
  });
  return {
    totalMinutes,
    totalHours: +(totalMinutes / 60).toFixed(2),
    byProject,
    byCategory
  };
}

export function renderTimeLogPanel() {
  let panel = document.getElementById('kairos-timelog-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const activeBtn = panel.querySelector('.filter-tabs button.active');
      const f = activeBtn?.dataset.filter;
      renderTimeList(f && f !== 'all' ? f : undefined);
    }
    return;
  }
  panel = document.createElement('section');
  panel.id = 'kairos-timelog-panel';
  panel.className = 'kairos-panel';

  const h2 = document.createElement('h2'); h2.textContent = '⏱ Time Log'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'timelog-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form'); form.id = 'timelog-form';
  const projIn = document.createElement('input'); projIn.type = 'text'; projIn.placeholder = 'Proyecto'; projIn.id = 'tl-proj-in'; projIn.required = true;
  const catIn = document.createElement('input'); catIn.type = 'text'; catIn.placeholder = 'Categoría (ej: diseño)'; catIn.id = 'tl-cat-in';
  const descIn = document.createElement('input'); descIn.type = 'text'; descIn.placeholder = 'Descripción (opcional)'; descIn.id = 'tl-desc-in';
  const minIn = document.createElement('input'); minIn.type = 'number'; minIn.placeholder = 'Minutos'; minIn.min = '1'; minIn.id = 'tl-min-in'; minIn.required = true;
  const dateIn = document.createElement('input'); dateIn.type = 'date'; dateIn.id = 'tl-date-in'; dateIn.value = localDate();
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Tiempo';
  form.append(projIn, catIn, descIn, minIn, dateIn, addBtn);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = projIn.value.trim(); const m = +minIn.value;
    if (!p || !m) return;
    addTimeEntry(p, catIn.value, descIn.value, m, dateIn.value || localDate());
    projIn.value = ''; catIn.value = ''; descIn.value = ''; minIn.value = ''; dateIn.value = localDate();
    const activeBtn = panel.querySelector('.filter-tabs button.active');
    const f = activeBtn?.dataset.filter;
    renderTimeList(f && f !== 'all' ? f : undefined);
  });
  panel.appendChild(form);

  const tabs = document.createElement('div'); tabs.className = 'filter-tabs'; tabs.id = 'timelog-tabs';
  panel.appendChild(tabs);

  const listEl = document.createElement('div'); listEl.id = 'timelog-list'; panel.appendChild(listEl);

  const closeBtn = document.createElement('button'); closeBtn.textContent = '✕ Cerrar'; closeBtn.className = 'close-btn';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderTimeList();
}

function renderTimeList(filterCat) {
  const listEl = document.getElementById('timelog-list');
  const statsEl = document.getElementById('timelog-stats');
  const panel = document.getElementById('kairos-timelog-panel');
  if (!listEl) return;
  const stats = getTimeStats();
  // Build by-project summary string
  const projSummary = Object.entries(stats.byProject).sort((a,b) => b[1]-a[1]).slice(0, 3).map(([p,m]) => `${p}: ${(m/60).toFixed(1)}h`).join(' · ');
  if (statsEl) { statsEl.textContent = `Total: ${stats.totalHours}h · ${projSummary || 'Sin proyectos'}`; }

  // Rebuild tabs
  const tabs = panel?.querySelector('#timelog-tabs');
  if (tabs) {
    const cats = ['all', ...new Set(loadEntries().map(e => e.category))];
    tabs.innerHTML = '';
    cats.forEach(cat => {
      const btn = document.createElement('button'); btn.textContent = cat; btn.dataset.filter = cat;
      if (cat === (filterCat || 'all')) btn.classList.add('active');
      btn.addEventListener('click', () => {
        tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTimeList(cat === 'all' ? undefined : cat);
      });
      tabs.appendChild(btn);
    });
  }

  let list = loadEntries();
  // Sort by date desc
  list = list.slice().sort((a, b) => b.date.localeCompare(a.date));
  if (filterCat) list = list.filter(e => e.category === filterCat);
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay entradas.'; listEl.appendChild(em); return; }
  list.forEach(entry => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const projEl = document.createElement('strong'); projEl.textContent = entry.project;
    const catBadge = document.createElement('span'); catBadge.className = 'badge'; catBadge.textContent = entry.category;
    const timeBadge = document.createElement('span'); timeBadge.className = 'badge'; timeBadge.textContent = `${entry.minutes}m`;
    top.append(projEl, catBadge, timeBadge);
    card.appendChild(top);
    if (entry.description) { const p = document.createElement('p'); p.textContent = entry.description; card.appendChild(p); }
    const dateEl = document.createElement('small'); dateEl.textContent = entry.date; card.appendChild(dateEl);
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteTimeEntry(entry.id); renderTimeList(filterCat); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
