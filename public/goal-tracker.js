/** Goal Tracker — KAIROS browser module */
const GOALS_KEY = 'kairos:goals';

/** @returns {Record<string, object>} */
function loadGoals() {
  try { return JSON.parse(localStorage.getItem(GOALS_KEY) || '{}'); } catch { return {}; }
}

/** @param {Record<string, object>} goals */
function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

/**
 * @param {{ title: string, description?: string, priority?: number, tags?: string[] }} goal
 * @returns {object}
 */
export function addGoal(goal) {
  const goals = loadGoals();
  const id = `goal-${Date.now()}`;
  const newGoal = { id, status: 'active', progress: 0, priority: 5, tags: [], ...goal, createdAt: new Date().toISOString() };
  goals[id] = newGoal;
  saveGoals(goals);
  return newGoal;
}

/**
 * @param {string} id
 * @param {object} updates
 * @returns {object|null}
 */
export function updateGoal(id, updates) {
  const goals = loadGoals();
  if (!goals[id]) return null;
  goals[id] = { ...goals[id], ...updates };
  if (updates.status === 'completed') { goals[id].completedAt = new Date().toISOString(); goals[id].progress = 100; }
  saveGoals(goals);
  return goals[id];
}

/** @param {string} [status] @returns {object[]} */
export function listGoals(status) {
  const goals = Object.values(loadGoals());
  const filtered = status ? goals.filter(g => g.status === status) : goals;
  return filtered.sort((a, b) => b.priority - a.priority);
}

/** @param {string} id @returns {boolean} */
export function deleteGoal(id) {
  const goals = loadGoals();
  if (!goals[id]) return false;
  delete goals[id];
  saveGoals(goals);
  return true;
}

export function getGoalStats() {
  const goals = listGoals();
  return { total: goals.length, active: goals.filter(g => g.status === 'active').length, completed: goals.filter(g => g.status === 'completed').length, paused: goals.filter(g => g.status === 'paused').length };
}

export function renderGoalTracker() {
  const GT2_KEY = 'kairos:goals2';
  function _load2() { const d = JSON.parse(localStorage.getItem(GT2_KEY) || '[]'); return Array.isArray(d) ? d : []; }
  function _save2(d) { localStorage.setItem(GT2_KEY, JSON.stringify(d)); }
  function _uid2() { return crypto.randomUUID(); }
  function _now2() { return new Date().toISOString(); }

  let panel = document.getElementById('goaltracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh2(); return; }
  panel = document.createElement('div');
  panel.id = 'goaltracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <h3>Goal Tracker</h3>
    <form id="goaltracker-form">
      <input id="gt2-title"    placeholder="Título del objetivo *" required style="margin:2px">
      <textarea id="gt2-desc"  placeholder="Descripción" rows="2" style="margin:2px;width:100%;box-sizing:border-box"></textarea>
      <input id="gt2-category" placeholder="Categoría (ej: salud, carrera)" style="margin:2px">
      <input id="gt2-date"     type="date" style="margin:2px">
      <input id="gt2-target"   type="number" placeholder="Valor objetivo (ej: 100)" min="0" step="any" style="margin:2px">
      <input id="gt2-unit"     placeholder="Unidad (ej: km, páginas, %)" style="margin:2px">
      <button type="submit">Agregar Objetivo</button>
    </form>
    <div class="ia-stats" id="goaltracker-stats"></div>
    <ul id="goaltracker-list" style="list-style:none;padding:0;margin-top:0.5rem"></ul>
  `;
  document.body.appendChild(panel);

  function _refresh2() {
    const goals = _load2();
    const list  = document.getElementById('goaltracker-list');
    const stats = document.getElementById('goaltracker-stats');
    if (!list || !stats) return;
    list.innerHTML = '';
    goals.slice().reverse().forEach(g => {
      const li = document.createElement('li');
      li.style.cssText = 'border:1px solid #374151;border-radius:6px;padding:0.5rem;margin-bottom:0.5rem';
      const top = document.createElement('div');
      top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.4rem';
      const titleEl = document.createElement('strong');
      titleEl.textContent = g.title;
      const catEl = document.createElement('span');
      catEl.style.cssText = 'color:#9ca3af;font-size:0.78rem';
      catEl.textContent = g.category || '';
      const completed = g.currentValue >= g.targetValue && g.targetValue > 0;
      const statusBadge = document.createElement('span');
      statusBadge.style.cssText = `background:${completed?'#059669':'#1d4ed8'};color:#fff;border-radius:4px;padding:0.1rem 0.4rem;font-size:0.72rem`;
      statusBadge.textContent = completed ? 'completed' : 'active';
      const checkBtn = document.createElement('button');
      checkBtn.className = 'ia-cmd'; checkBtn.textContent = '+check-in';
      checkBtn.addEventListener('click', () => {
        const val = parseFloat(prompt(`Valor actual (${g.unit || 'unidades'}):`, g.currentValue || 0));
        if (isNaN(val)) return;
        const goals2 = _load2(); const idx = goals2.findIndex(x => x.id === g.id);
        if (idx !== -1) { goals2[idx].currentValue = val; goals2[idx].updatedAt = _now2(); _save2(goals2); _refresh2(); }
      });
      const delBtn = document.createElement('button');
      delBtn.className = 'ia-cmd'; delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => { _save2(_load2().filter(x => x.id !== g.id)); _refresh2(); });
      top.appendChild(titleEl); top.appendChild(catEl); top.appendChild(statusBadge); top.appendChild(checkBtn); top.appendChild(delBtn);
      li.appendChild(top);
      // progress bar
      const target = g.targetValue || 0;
      const current = g.currentValue || 0;
      const pct = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0;
      const barWrap = document.createElement('div');
      barWrap.style.cssText = 'background:#374151;border-radius:4px;height:6px;margin-bottom:0.2rem';
      const bar = document.createElement('div');
      bar.style.cssText = `background:#4338ca;height:100%;border-radius:4px;width:${pct}%;transition:width 0.3s`;
      barWrap.appendChild(bar);
      li.appendChild(barWrap);
      const label = document.createElement('small');
      label.style.cssText = 'color:#9ca3af;font-size:0.75rem';
      label.textContent = `${current}/${target} ${g.unit||''} (${pct}%)`;
      li.appendChild(label);
      list.appendChild(li);
    });
    const active    = goals.filter(g => !(g.currentValue >= g.targetValue && g.targetValue > 0)).length;
    const completed = goals.filter(g => g.currentValue >= g.targetValue && g.targetValue > 0).length;
    const totalPct  = goals.length > 0 ? Math.round(goals.reduce((acc, g) => { const t = g.targetValue||0; return acc + (t>0 ? Math.min(100, (g.currentValue||0)/t*100) : 0); }, 0) / goals.length) : 0;
    stats.textContent = `Total: ${goals.length} · Activos: ${active} · Completados: ${completed} · Progreso prom: ${totalPct}%`;
  }

  document.getElementById('goaltracker-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('gt2-title').value.trim();
    if (!title) return;
    const goals = _load2();
    goals.push({
      id: _uid2(), title,
      description:  document.getElementById('gt2-desc').value.trim(),
      category:     document.getElementById('gt2-category').value.trim(),
      targetDate:   document.getElementById('gt2-date').value,
      targetValue:  parseFloat(document.getElementById('gt2-target').value) || 0,
      unit:         document.getElementById('gt2-unit').value.trim(),
      currentValue: 0,
      createdAt: _now2(), updatedAt: _now2()
    });
    _save2(goals);
    e.target.reset();
    _refresh2();
  });
  _refresh2();
}

export function renderGoalPanel() {
  const existing = document.getElementById('kairos-goal-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'kairos-goal-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(500px,95vw);max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const stats = getGoalStats();
  const goals = listGoals();
  const statusColor = { active: '#60a5fa', completed: '#34d399', paused: '#f59e0b' };
  const statusLabel = { active: 'Activo', completed: 'Completado', paused: 'Pausado' };

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h3 style="margin:0;color:#a5b4fc;font-size:1rem">🎯 Goal Tracker</h3>
      <button onclick="document.getElementById('kairos-goal-panel').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
    </div>
    <div style="display:flex;gap:1rem;margin-bottom:1rem;font-size:0.8rem">
      <span style="color:#60a5fa">⬤ ${stats.active} activos</span>
      <span style="color:#34d399">⬤ ${stats.completed} completados</span>
      <span style="color:#f59e0b">⬤ ${stats.paused} pausados</span>
    </div>
    <div style="margin-bottom:1rem">
      <input id="goal-input" placeholder="Nuevo objetivo..." style="width:100%;padding:0.5rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.85rem;box-sizing:border-box" />
      <button id="goal-add-btn" style="margin-top:0.5rem;padding:0.4rem 1rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem">Agregar</button>
    </div>
    <div id="goal-list">
      ${goals.length === 0 ? '<p style="color:#6b7280;font-size:0.85rem">Sin objetivos aún.</p>' : goals.map(g => `
        <div style="border:1px solid #374151;border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:#0f0f1e">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div>
              <div style="color:#e5e7eb;font-size:0.88rem;margin-bottom:0.25rem">${g.title}</div>
              <div style="font-size:0.72rem;color:${statusColor[g.status] || '#9ca3af'}">${statusLabel[g.status] || g.status} · Prioridad ${g.priority} · ${g.progress}%</div>
            </div>
            <div style="display:flex;gap:0.4rem">
              ${g.status !== 'completed' ? `<button onclick="window._kairos_gt.complete('${g.id}')" style="font-size:0.7rem;padding:0.2rem 0.5rem;background:#065f46;color:#34d399;border:none;border-radius:4px;cursor:pointer">✓</button>` : ''}
              <button onclick="window._kairos_gt.del('${g.id}')" style="font-size:0.7rem;padding:0.2rem 0.5rem;background:#450a0a;color:#f87171;border:none;border-radius:4px;cursor:pointer">✕</button>
            </div>
          </div>
          <div style="margin-top:0.5rem;height:4px;background:#374151;border-radius:2px">
            <div style="height:100%;width:${g.progress}%;background:#4338ca;border-radius:2px;transition:width 0.3s"></div>
          </div>
        </div>`).join('')}
    </div>`;

  window._kairos_gt = {
    complete: (id) => { updateGoal(id, { status: 'completed' }); panel.remove(); renderGoalPanel(); },
    del: (id) => { deleteGoal(id); panel.remove(); renderGoalPanel(); },
  };

  panel.querySelector('#goal-add-btn')?.addEventListener('click', () => {
    const input = panel.querySelector('#goal-input');
    const title = input?.value?.trim();
    if (!title) return;
    addGoal({ title, priority: 5 });
    panel.remove();
    renderGoalPanel();
  });

  document.body.appendChild(panel);
}
