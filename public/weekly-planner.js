/** weekly-planner.js — Planificador semanal con 3 rocks por día · KAIROS browser module */
const WP_KEY = 'kairos:weekly';

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function isoWeekKey() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const y = d.getFullYear();
  const yearStart = new Date(y, 0, 1);
  const wn = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${y}-W${String(wn).padStart(2,'0')}`;
}

function mondayStr() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS = { mon:'Lun', tue:'Mar', wed:'Mié', thu:'Jue', fri:'Vie', sat:'Sáb', sun:'Dom' };

function emptyDay() { return { rocks: [], notes: '', completed: false }; }

function loadWeeks() { try { return JSON.parse(localStorage.getItem(WP_KEY) || '{}'); } catch { return {}; } }
function saveWeeks(data) { localStorage.setItem(WP_KEY, JSON.stringify(data)); }

export function getOrCreateCurrentWeek(goal = '') {
  const data = loadWeeks();
  const key = isoWeekKey();
  if (!data[key]) {
    data[key] = { week: key, startDate: mondayStr(), days: Object.fromEntries(DAYS.map(d => [d, emptyDay()])), goal, review: '', status: 'open', createdAt: new Date().toISOString() };
    saveWeeks(data);
  }
  return data[key];
}

export function saveDayRocks(week, day, rocks, notes = '') {
  const data = loadWeeks();
  if (!data[week]) return null;
  data[week].days[day] = { rocks: rocks.slice(0, 3), notes, completed: data[week].days[day]?.completed ?? false };
  saveWeeks(data);
  return data[week];
}

export function reviewWeek(week, review) {
  const data = loadWeeks();
  if (!data[week]) return null;
  data[week].review = review;
  data[week].status = 'reviewed';
  saveWeeks(data);
  return data[week];
}

export function listWeeks() {
  return Object.values(loadWeeks()).sort((a, b) => b.week.localeCompare(a.week));
}

export function getWeekStats() {
  const weeks = listWeeks();
  const reviewed = weeks.filter(w => w.status === 'reviewed').length;
  const totalRocks = weeks.reduce((s, w) => s + Object.values(w.days).reduce((ss, d) => ss + d.rocks.length, 0), 0);
  const totalDays = weeks.length * 7;
  return { totalWeeks: weeks.length, reviewed, avgRocksPerDay: totalDays ? Math.round(totalRocks / totalDays * 10) / 10 : 0 };
}

export function renderWeeklyPanel() {
  const existing = document.getElementById('kairos-weekly-panel');
  if (existing) { existing.remove(); return; }

  const week = getOrCreateCurrentWeek();

  const panel = document.createElement('div');
  panel.id = 'kairos-weekly-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(580px,95vw);max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem';
  const titleEl = document.createElement('h3'); titleEl.style.cssText = 'margin:0;color:#a5b4fc;font-size:1rem'; titleEl.textContent = `📅 Semana ${week.week}`;
  const closeBtn = document.createElement('button'); closeBtn.style.cssText = 'background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem'; closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => panel.remove());
  header.append(titleEl, closeBtn);

  // Goal row
  const goalRow = document.createElement('div');
  goalRow.style.cssText = 'margin-bottom:0.8rem;display:flex;gap:0.4rem';
  const goalInp = document.createElement('input'); goalInp.placeholder = 'Intención de la semana...'; goalInp.value = week.goal;
  goalInp.style.cssText = 'flex:1;padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem';
  goalInp.addEventListener('change', () => { const data = loadWeeks(); if (data[week.week]) { data[week.week].goal = goalInp.value.trim(); saveWeeks(data); } });
  goalRow.appendChild(goalInp);

  // Stats
  const statsBar = document.createElement('div');
  statsBar.style.cssText = 'display:flex;gap:1rem;margin-bottom:1rem;font-size:0.78rem';
  const st = getWeekStats();
  const s1 = document.createElement('span'); s1.style.color = '#a5b4fc'; s1.textContent = `${st.totalWeeks} semanas`;
  const s2 = document.createElement('span'); s2.style.color = '#34d399'; s2.textContent = `${st.reviewed} revisadas`;
  const s3 = document.createElement('span'); s3.style.color = '#fbbf24'; s3.textContent = `${st.avgRocksPerDay} rocks/día`;
  statsBar.append(s1, s2, s3);

  // Days grid
  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem';

  const data = loadWeeks();
  const currentWeekData = data[week.week];

  DAYS.forEach(day => {
    const dayData = currentWeekData.days[day] || emptyDay();
    const dayRow = document.createElement('div');
    dayRow.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.6rem;background:#0f0f1e';

    const dayLabel = document.createElement('div');
    dayLabel.style.cssText = 'font-size:0.75rem;font-weight:700;color:#6b7280;margin-bottom:0.4rem;text-transform:uppercase';
    dayLabel.textContent = DAY_LABELS[day];
    dayRow.appendChild(dayLabel);

    const rocksContainer = document.createElement('div');
    rocksContainer.style.cssText = 'display:flex;flex-direction:column;gap:0.3rem';

    for (let i = 0; i < 3; i++) {
      const rockInp = document.createElement('input');
      rockInp.value = dayData.rocks[i] || '';
      rockInp.placeholder = `Rock ${i+1}...`;
      rockInp.style.cssText = 'width:100%;box-sizing:border-box;padding:0.3rem 0.5rem;background:#0f0f23;border:1px solid #1f2937;border-radius:5px;color:#e5e7eb;font-size:0.8rem';
      rockInp.addEventListener('change', () => {
        const inputs = rocksContainer.querySelectorAll('input');
        const rocks = Array.from(inputs).map(el => el.value.trim()).filter(Boolean);
        saveDayRocks(week.week, day, rocks, '');
      });
      rocksContainer.appendChild(rockInp);
    }
    dayRow.appendChild(rocksContainer);
    grid.appendChild(dayRow);
  });

  // Review section
  const reviewSect = document.createElement('div');
  reviewSect.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.7rem;margin-bottom:0.5rem';
  const reviewLabel = document.createElement('div'); reviewLabel.style.cssText = 'font-size:0.72rem;font-weight:700;color:#60a5fa;margin-bottom:0.4rem'; reviewLabel.textContent = '📝 Review semanal';
  const reviewInp = document.createElement('textarea'); reviewInp.placeholder = 'Reflexión del fin de semana...'; reviewInp.value = currentWeekData.review;
  reviewInp.style.cssText = 'width:100%;box-sizing:border-box;padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem;resize:vertical;min-height:52px;font-family:inherit';
  const reviewBtn = document.createElement('button'); reviewBtn.textContent = '✓ Marcar semana como revisada';
  reviewBtn.style.cssText = 'margin-top:0.5rem;padding:0.35rem 0.9rem;background:#065f46;color:#34d399;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem';
  reviewBtn.addEventListener('click', () => { reviewWeek(week.week, reviewInp.value.trim()); panel.remove(); renderWeeklyPanel(); });
  reviewSect.append(reviewLabel, reviewInp, reviewBtn);

  panel.append(header, statsBar, goalRow, grid, reviewSect);
  document.body.appendChild(panel);
}
