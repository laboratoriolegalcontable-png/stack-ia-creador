/** daily-standup.js — Standup diario · KAIROS browser module */
const DS_KEY = 'kairos:standups';

function loadStandups() { try { const d = JSON.parse(localStorage.getItem(DS_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveStandups(list) { localStorage.setItem(DS_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function addStandup(date, yesterday, today, blockers, mood = 3) {
  const list = loadStandups();
  const moodClamped = Math.max(1, Math.min(5, Math.round(Number(mood) || 3)));
  const s = { id: uid(), date, yesterday: yesterday.trim(), today: today.trim(), blockers: blockers.trim(), mood: moodClamped, createdAt: new Date().toISOString() };
  list.unshift(s);
  saveStandups(list);
  return s;
}

export function deleteStandup(id) {
  const list = loadStandups();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1); saveStandups(list); return true;
}

export function getStandupStats() {
  const list = loadStandups();
  const dates = [...new Set(list.map(s => s.date))].sort().reverse();
  const dateSet = new Set(dates);
  let currentStreak = 0;
  const d = new Date(new Date().toISOString().slice(0, 10));
  while (dateSet.has(d.toISOString().slice(0, 10))) { currentStreak++; d.setUTCDate(d.getUTCDate() - 1); }
  const avgMood = list.length ? Math.round(list.reduce((s, x) => s + x.mood, 0) / list.length * 10) / 10 : 0;
  return { total: list.length, withBlockers: list.filter(s => s.blockers).length, avgMood, currentStreak };
}

export function renderStandupPanel() {
  let panel = document.getElementById('kairos-standup-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') renderStandupList(); return; }
  panel = document.createElement('section'); panel.id = 'kairos-standup-panel'; panel.className = 'kairos-panel';
  const h2 = document.createElement('h2'); h2.textContent = '🎯 Daily Standup'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'standup-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form');
  const dateIn = document.createElement('input'); dateIn.type = 'date'; dateIn.value = localDate();
  const yesterdayIn = document.createElement('textarea'); yesterdayIn.placeholder = '¿Qué hice ayer?'; yesterdayIn.rows = 2;
  const todayIn = document.createElement('textarea'); todayIn.placeholder = '¿Qué voy a hacer hoy?'; todayIn.rows = 2;
  const blockersIn = document.createElement('textarea'); blockersIn.placeholder = 'Bloqueos (opcional)'; blockersIn.rows = 2;
  const moodLabel = document.createElement('label'); moodLabel.textContent = 'Estado de ánimo (1-5): ';
  const moodIn = document.createElement('input'); moodIn.type = 'number'; moodIn.min = '1'; moodIn.max = '5'; moodIn.value = '3';
  moodLabel.appendChild(moodIn);
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Standup';
  form.append(dateIn, yesterdayIn, todayIn, blockersIn, moodLabel, addBtn);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!todayIn.value.trim()) return;
    addStandup(dateIn.value, yesterdayIn.value, todayIn.value, blockersIn.value, moodIn.value);
    yesterdayIn.value = ''; todayIn.value = ''; blockersIn.value = ''; moodIn.value = '3';
    renderStandupList();
  });
  panel.appendChild(form);

  const listEl = document.createElement('div'); listEl.id = 'standup-list'; panel.appendChild(listEl);
  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderStandupList();
}

function renderStandupList() {
  const listEl = document.getElementById('standup-list');
  const statsEl = document.getElementById('standup-stats');
  if (!listEl) return;
  const stats = getStandupStats();
  if (statsEl) { statsEl.textContent = `Total: ${stats.total} · Racha: ${stats.currentStreak}d · Mood avg: ${stats.avgMood} · Con bloqueos: ${stats.withBlockers}`; }
  const list = loadStandups();
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay standups.'; listEl.appendChild(em); return; }
  list.slice(0, 10).forEach(s => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const header = document.createElement('div'); header.className = 'kairos-card-top';
    const dateEl = document.createElement('strong'); dateEl.textContent = s.date;
    const moodEl = document.createElement('span'); moodEl.className = 'badge'; moodEl.textContent = `😊 ${s.mood}/5`;
    header.append(dateEl, moodEl); card.appendChild(header);
    if (s.yesterday) { const p = document.createElement('p'); p.textContent = `Ayer: ${s.yesterday}`; card.appendChild(p); }
    const todayEl = document.createElement('p'); todayEl.textContent = `Hoy: ${s.today}`; card.appendChild(todayEl);
    if (s.blockers) { const b = document.createElement('p'); b.textContent = `🚧 ${s.blockers}`; card.appendChild(b); }
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteStandup(s.id); renderStandupList(); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
