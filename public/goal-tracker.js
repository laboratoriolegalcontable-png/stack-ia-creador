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
