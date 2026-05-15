/** Habit Tracker — KAIROS browser module */
const HABITS_KEY = 'kairos:habits';

function loadHabits() { try { return JSON.parse(localStorage.getItem(HABITS_KEY) || '{}'); } catch { return {}; } }
function saveHabits(h) { localStorage.setItem(HABITS_KEY, JSON.stringify(h)); }

/** @param {string} name @param {'daily'|'weekly'} [frequency] @returns {object} */
export function addHabit(name, frequency = 'daily') {
  const habits = loadHabits();
  const id = `habit-${Date.now()}`;
  const habit = { id, name, frequency, currentStreak: 0, longestStreak: 0, lastCheckedIn: null, createdAt: new Date().toISOString(), checkIns: [] };
  habits[id] = habit;
  saveHabits(habits);
  return habit;
}

/** @param {string} id @returns {object|null} */
export function checkIn(id) {
  const habits = loadHabits();
  if (!habits[id]) return null;
  const h = habits[id];
  const today = new Date().toISOString().slice(0, 10);
  if (h.lastCheckedIn === today) return h;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  h.currentStreak = h.lastCheckedIn === yesterday ? h.currentStreak + 1 : 1;
  h.longestStreak = Math.max(h.longestStreak, h.currentStreak);
  h.lastCheckedIn = today;
  h.checkIns = [...(h.checkIns || []).slice(-89), today];
  habits[id] = h;
  saveHabits(habits);
  return h;
}

export function listHabits() { return Object.values(loadHabits()).sort((a, b) => b.currentStreak - a.currentStreak); }
export function deleteHabit(id) { const h = loadHabits(); delete h[id]; saveHabits(h); }

export function getHabitStats() {
  const habits = listHabits();
  const today = new Date().toISOString().slice(0, 10);
  return { total: habits.length, checkedToday: habits.filter(h => h.lastCheckedIn === today).length, topStreak: habits.reduce((m, h) => Math.max(m, h.longestStreak), 0) };
}

export function renderHabitPanel() {
  const existing = document.getElementById('kairos-habit-panel');
  if (existing) { existing.remove(); return; }
  const habits = listHabits();
  const today = new Date().toISOString().slice(0, 10);
  const stats = getHabitStats();

  const panel = document.createElement('div');
  panel.id = 'kairos-habit-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(480px,95vw);max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h3 style="margin:0;color:#a5b4fc;font-size:1rem">&#x1F525; Habit Tracker</h3>
      <button onclick="document.getElementById('kairos-habit-panel').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
    </div>
    <div style="display:flex;gap:1rem;margin-bottom:1rem;font-size:0.8rem">
      <span style="color:#a5b4fc">${stats.total} hábitos</span>
      <span style="color:#34d399">${stats.checkedToday} hoy</span>
      <span style="color:#fbbf24">Récord: ${stats.topStreak} días</span>
    </div>
    <div style="display:flex;gap:0.5rem;margin-bottom:1rem">
      <input id="habit-input" placeholder="Nuevo hábito..." style="flex:1;padding:0.5rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.85rem" />
      <button id="habit-add" style="padding:0.4rem 0.8rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem">+</button>
    </div>
    <div id="habit-list">
      ${habits.length === 0 ? '<p style="color:#6b7280;font-size:0.85rem">Sin hábitos aún.</p>' : habits.map(h => {
        const doneToday = h.lastCheckedIn === today;
        const streakColor = h.currentStreak >= 7 ? '#fbbf24' : h.currentStreak >= 3 ? '#34d399' : '#60a5fa';
        return `<div style="border:1px solid ${doneToday ? '#065f46' : '#374151'};border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:${doneToday ? '#052e16' : '#0f0f1e'};display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="color:#e5e7eb;font-size:0.88rem">${h.name}</div>
            <div style="font-size:0.72rem;color:${streakColor};margin-top:0.2rem">🔥 ${h.currentStreak} días · máx ${h.longestStreak}</div>
          </div>
          <div style="display:flex;gap:0.4rem">
            ${!doneToday ? `<button onclick="window._kht.checkin('${h.id}')" style="padding:0.3rem 0.7rem;background:#065f46;color:#34d399;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem">✓ Check</button>` : `<span style="color:#34d399;font-size:0.78rem">✓ Hecho</span>`}
            <button onclick="window._kht.del('${h.id}')" style="padding:0.3rem 0.5rem;background:#450a0a;color:#f87171;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem">✕</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;

  window._kht = {
    checkin: (id) => { checkIn(id); panel.remove(); renderHabitPanel(); },
    del: (id) => { deleteHabit(id); panel.remove(); renderHabitPanel(); },
  };
  panel.querySelector('#habit-add')?.addEventListener('click', () => {
    const input = panel.querySelector('#habit-input');
    const name = input?.value?.trim();
    if (!name) return;
    addHabit(name);
    panel.remove();
    renderHabitPanel();
  });
  document.body.appendChild(panel);
}
