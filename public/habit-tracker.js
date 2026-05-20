/** Habit Tracker — KAIROS browser module */
const HABITS_KEY = 'kairos:habits';

function loadHabits() { try { return JSON.parse(localStorage.getItem(HABITS_KEY) || '{}'); } catch { return {}; } }
function saveHabits(h) { localStorage.setItem(HABITS_KEY, JSON.stringify(h)); }

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** @param {string} name @param {'daily'|'weekly'} [frequency] @returns {object} */
export function addHabit(name, frequency = 'daily') {
  const habits = loadHabits();
  const id = `habit-${Date.now()}`;
  const habit = { id, name, frequency, currentStreak: 0, longestStreak: 0, lastCheckedIn: null, createdAt: new Date().toISOString(), checkIns: [] };
  habits[id] = habit;
  saveHabits(habits);
  return habit;
}

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/**
 * Compute days between two YYYY-MM-DD strings using local calendar dates.
 * Uses new Date(y, m, d) (local midnight) to avoid UTC-parse issues,
 * and Math.round to handle DST transitions (23h or 25h days).
 */
function daysBetweenLocalDates(a, b) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad)) / 86400000);
}

/**
 * Returns yesterday's date string in YYYY-MM-DD using local calendar arithmetic.
 * Avoids subtracting 86400000ms directly, which breaks during DST transitions.
 */
function localYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** @param {string} id @returns {object|null} */
export function checkIn(id) {
  const habits = loadHabits();
  if (!habits[id]) return null;
  const h = habits[id];
  const today = localDateStr();
  if (h.lastCheckedIn === today) return h;

  if (h.frequency === 'weekly') {
    // Weekly: streak continues if last check-in was within the last 7 calendar days.
    // daysBetweenLocalDates uses local midnight dates to avoid UTC parse + DST issues.
    const daysSinceLast = h.lastCheckedIn
      ? daysBetweenLocalDates(h.lastCheckedIn, today)
      : Infinity;
    h.currentStreak = daysSinceLast <= 7 ? h.currentStreak + 1 : 1;
  } else {
    // Daily: streak continues only if last check-in was yesterday (local calendar day).
    // localYesterdayStr uses setDate()-1 which handles DST correctly.
    h.currentStreak = h.lastCheckedIn === localYesterdayStr() ? h.currentStreak + 1 : 1;
  }

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
  const today = localDateStr();
  return { total: habits.length, checkedToday: habits.filter(h => h.lastCheckedIn === today).length, topStreak: habits.reduce((m, h) => Math.max(m, h.longestStreak), 0) };
}

export function renderHabitPanel() {
  const existing = document.getElementById('kairos-habit-panel');
  if (existing) { existing.remove(); return; }
  const habits = listHabits();
  const today = localDateStr();
  const stats = getHabitStats();

  const panel = document.createElement('div');
  panel.id = 'kairos-habit-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(480px,95vw);max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h3 style="margin:0;color:#a5b4fc;font-size:1rem">&#x1F525; Habit Tracker</h3>
      <button id="habit-close" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
    </div>
    <div style="display:flex;gap:1rem;margin-bottom:1rem;font-size:0.8rem">
      <span style="color:#a5b4fc">${stats.total} hábitos</span>
      <span style="color:#34d399">${stats.checkedToday} hoy</span>
      <span style="color:#fbbf24">Récord: ${stats.topStreak} días</span>
    </div>
    <div style="display:flex;gap:0.5rem;margin-bottom:1rem">
      <input id="habit-input" placeholder="Nuevo hábito..." style="flex:1;padding:0.5rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.85rem" />
      <select id="habit-freq" style="padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#9ca3af;font-size:0.82rem">
        <option value="daily">Diario</option>
        <option value="weekly">Semanal</option>
      </select>
      <button id="habit-add" style="padding:0.4rem 0.8rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem">+</button>
    </div>
    <div id="habit-list"></div>`;

  const listEl = panel.querySelector('#habit-list');
  if (habits.length === 0) {
    listEl.innerHTML = '<p style="color:#6b7280;font-size:0.85rem">Sin hábitos aún.</p>';
  } else {
    habits.forEach(h => {
      const doneToday = h.lastCheckedIn === today;
      const streakColor = h.currentStreak >= 7 ? '#fbbf24' : h.currentStreak >= 3 ? '#34d399' : '#60a5fa';
      const row = document.createElement('div');
      row.style.cssText = `border:1px solid ${doneToday ? '#065f46' : '#374151'};border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:${doneToday ? '#052e16' : '#0f0f1e'};display:flex;justify-content:space-between;align-items:center`;

      const info = document.createElement('div');
      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'color:#e5e7eb;font-size:0.88rem';
      nameEl.textContent = h.name; // textContent prevents XSS
      const meta = document.createElement('div');
      meta.style.cssText = `font-size:0.72rem;color:${streakColor};margin-top:0.2rem`;
      meta.textContent = `🔥 ${h.currentStreak} días · máx ${h.longestStreak} · ${h.frequency === 'weekly' ? 'semanal' : 'diario'}`;
      info.append(nameEl, meta);

      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:0.4rem';
      if (!doneToday) {
        const checkBtn = document.createElement('button');
        checkBtn.textContent = '✓ Check';
        checkBtn.style.cssText = 'padding:0.3rem 0.7rem;background:#065f46;color:#34d399;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem';
        checkBtn.addEventListener('click', () => { checkIn(h.id); panel.remove(); renderHabitPanel(); });
        btns.appendChild(checkBtn);
      } else {
        const done = document.createElement('span');
        done.style.cssText = 'color:#34d399;font-size:0.78rem';
        done.textContent = '✓ Hecho';
        btns.appendChild(done);
      }
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.style.cssText = 'padding:0.3rem 0.5rem;background:#450a0a;color:#f87171;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem';
      delBtn.addEventListener('click', () => { deleteHabit(h.id); panel.remove(); renderHabitPanel(); });
      btns.appendChild(delBtn);

      row.append(info, btns);
      listEl.appendChild(row);
    });
  }

  panel.querySelector('#habit-close').addEventListener('click', () => panel.remove());
  panel.querySelector('#habit-add').addEventListener('click', () => {
    const name = panel.querySelector('#habit-input')?.value?.trim();
    const freq = panel.querySelector('#habit-freq')?.value || 'daily';
    if (!name) return;
    addHabit(name, freq);
    panel.remove();
    renderHabitPanel();
  });
  document.body.appendChild(panel);
}
