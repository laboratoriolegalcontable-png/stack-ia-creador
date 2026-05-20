/**
 * project-roadmap.js — Hoja de ruta de proyectos con fases
 * @module project-roadmap
 */

const KEY = 'kairos:roadmaps';
const STATUSES = ['planned', 'active', 'completed', 'on-hold'];
const STATUS_ES = { planned: 'planificado', active: 'activo', completed: 'completado', 'on-hold': 'pausado' };

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const active = items.filter(i => i.status === 'active').length;
  const completed = items.filter(i => i.status === 'completed').length;
  const allPhases = items.flatMap(i => i.phases || []);
  const completedPhases = allPhases.filter(p => p.status === 'completed').length;
  return { total: items.length, active, completed, totalPhases: allPhases.length, completedPhases };
}

export function renderProjectRoadmap() {
  const existing = document.getElementById('project-roadmap-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'project-roadmap-panel';
  panel.className = 'kairos-panel';
  const statusOpts = STATUSES.map(s => `<option value="${s}">${STATUS_ES[s]}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/roadmap — Hoja de Ruta</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="roadmap-stats"></div>
    <form id="roadmap-form" class="panel-form">
      <input id="roadmap-title" placeholder="Título del proyecto" required>
      <input id="roadmap-desc" placeholder="Descripción (opcional)">
      <button type="submit">Crear Roadmap</button>
    </form>
    <div id="roadmap-phase-form-container" style="display:none" class="panel-form">
      <strong id="roadmap-selected-title"></strong>
      <input id="phase-name" placeholder="Nombre de la fase" required>
      <select id="phase-status">${statusOpts}</select>
      <input id="phase-start" type="date" placeholder="Inicio">
      <input id="phase-end" type="date" placeholder="Fin">
      <button id="add-phase-btn" type="button">+ Fase</button>
      <button id="cancel-phase-btn" type="button">Cancelar</button>
    </div>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      <button class="filter-btn" data-filter="active">Activos</button>
      <button class="filter-btn" data-filter="completed">Completados</button>
    </div>
    <ul id="roadmap-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  let selectedId = null;

  panel.querySelector('#roadmap-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('roadmap-title').value.trim();
    const desc = document.getElementById('roadmap-desc').value.trim();
    if (!title) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, description: desc, status: 'planned', phases: [], createdAt: new Date().toISOString() });
    save(items);
    e.target.reset();
    _refresh();
  });

  document.getElementById('add-phase-btn').addEventListener('click', () => {
    const name = document.getElementById('phase-name').value.trim();
    const status = document.getElementById('phase-status').value;
    const startDate = document.getElementById('phase-start').value;
    const endDate = document.getElementById('phase-end').value;
    if (!name || !selectedId) return;
    const items = load();
    const rm = items.find(i => i.id === selectedId);
    if (rm) {
      rm.phases = rm.phases || [];
      rm.phases.push({ id: crypto.randomUUID(), name, status, startDate, endDate });
      save(items);
    }
    document.getElementById('phase-name').value = '';
    _refresh();
  });

  document.getElementById('cancel-phase-btn').addEventListener('click', () => {
    selectedId = null;
    document.getElementById('roadmap-phase-form-container').style.display = 'none';
  });

  panel.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _refresh();
    });
  });

  _refresh();

  function _refresh() {
    const items = load();
    const stats = getStats(items);
    const statsEl = document.getElementById('roadmap-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Activos: ${stats.active} · Fases: ${stats.completedPhases}/${stats.totalPhases}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('roadmap-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = item.title;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      const phasesDone = (item.phases || []).filter(p => p.status === 'completed').length;
      meta.textContent = `${STATUS_ES[item.status] || item.status} · ${phasesDone}/${(item.phases||[]).length} fases`;
      const addPhaseBtn = document.createElement('button');
      addPhaseBtn.className = 'item-action';
      addPhaseBtn.textContent = '+ fase';
      addPhaseBtn.addEventListener('click', () => {
        selectedId = item.id;
        document.getElementById('roadmap-selected-title').textContent = item.title;
        document.getElementById('roadmap-phase-form-container').style.display = '';
      });
      const sel = document.createElement('select');
      sel.className = 'item-action-select';
      STATUSES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = STATUS_ES[s];
        if (s === item.status) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].status = sel.value; save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, addPhaseBtn, sel, del);
      list.appendChild(li);
    }
  }
}
