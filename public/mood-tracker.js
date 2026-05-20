/** KAIROS Mood Tracker — ES2022+ vanilla module */

const STORAGE_KEY = 'kairos:moods';

function load() {
  const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  return Array.isArray(d) ? d : [];
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const EMOJI = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };

export function addMood(date, mood, note = '') {
  const level = Math.round(Number(mood));
  if (!Number.isFinite(level)) return null;
  const clamped = Math.min(5, Math.max(1, level));
  const moods = load();
  const entry = { id: uid(), date: date || localDate(), mood: clamped, note: String(note), createdAt: new Date().toISOString() };
  moods.push(entry);
  save(moods);
  return entry;
}

export function deleteMood(id) {
  save(load().filter(m => m.id !== id));
}

export function getMoodStats() {
  const moods = load();
  const total = moods.length;
  const avgMood = total ? +(moods.reduce((s, m) => s + m.mood, 0) / total).toFixed(2) : 0;

  const byDate = {};
  for (const m of moods) byDate[m.date] = m.mood;

  let currentStreak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (byDate[key] === undefined) break;
    currentStreak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const trend7 = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    trend7.push({ date: key, mood: byDate[key] ?? null });
  }

  return { total, avgMood, currentStreak, trend7 };
}

function renderMoodList(container) {
  container.innerHTML = '';
  const moods = load().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 14);
  if (!moods.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No mood entries yet.';
    empty.style.cssText = 'color:#888;font-size:13px;margin:8px 0;';
    container.appendChild(empty);
    return;
  }
  for (const m of moods) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #2a2a3a;';

    const emoji = document.createElement('span');
    emoji.style.fontSize = '20px';
    emoji.textContent = EMOJI[m.mood] || '?';

    const info = document.createElement('div');
    info.style.flex = '1';

    const dateSpan = document.createElement('span');
    dateSpan.style.cssText = 'font-size:11px;color:#888;margin-right:6px;';
    dateSpan.textContent = m.date;

    const noteSpan = document.createElement('span');
    noteSpan.style.fontSize = '13px';
    noteSpan.textContent = m.note || '';

    info.appendChild(dateSpan);
    info.appendChild(noteSpan);

    const del = document.createElement('button');
    del.textContent = '🗑';
    del.style.cssText = 'background:none;border:none;cursor:pointer;color:#f87171;font-size:14px;';
    del.addEventListener('click', () => {
      deleteMood(m.id);
      renderMoodList(container);
      updateMoodStats(container.parentElement);
    });

    row.appendChild(emoji);
    row.appendChild(info);
    row.appendChild(del);
    container.appendChild(row);
  }
}

function updateMoodStats(panel) {
  const el = panel.querySelector('#kairos-mood-stats');
  if (!el) return;
  const { total, avgMood, currentStreak, trend7 } = getMoodStats();
  el.textContent = `Total: ${total} | Avg: ${avgMood} | Streak: ${currentStreak}d | 7d: ${trend7.map(t => t.mood ? EMOJI[t.mood] : '·').join('')}`;
}

export function renderMoodPanel() {
  let panel = document.getElementById('kairos-mood-panel');
  if (panel) {
    const visible = panel.style.display !== 'none';
    panel.style.display = visible ? 'none' : 'flex';
    if (!visible) {
      renderMoodList(panel.querySelector('#kairos-mood-list'));
      updateMoodStats(panel);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-mood-panel';
  panel.style.cssText = 'position:fixed;top:60px;right:20px;width:340px;max-height:80vh;overflow-y:auto;background:#1a1a2e;border:1px solid #3a3a5c;border-radius:12px;padding:16px;z-index:99999;display:flex;flex-direction:column;gap:10px;color:#e0e0f0;font-family:system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.5);';

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';

  const title = document.createElement('h3');
  title.textContent = '🌡 Mood Tracker';
  title.style.cssText = 'margin:0;font-size:16px;color:#a78bfa;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:16px;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });

  headerRow.appendChild(title);
  headerRow.appendChild(closeBtn);

  const form = document.createElement('form');
  form.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = localDate();
  dateInput.style.cssText = 'background:#0f0f1a;border:1px solid #3a3a5c;border-radius:6px;padding:6px;color:#e0e0f0;font-size:13px;';

  const moodSel = document.createElement('select');
  moodSel.style.cssText = 'background:#0f0f1a;border:1px solid #3a3a5c;border-radius:6px;padding:6px;color:#e0e0f0;font-size:13px;';
  for (const [val, label] of [[1, '😞 Terrible'], [2, '😕 Bad'], [3, '😐 Neutral'], [4, '😊 Good'], [5, '😄 Great']]) {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    moodSel.appendChild(opt);
  }
  moodSel.value = '3';

  const noteTA = document.createElement('textarea');
  noteTA.placeholder = 'Optional note…';
  noteTA.rows = 2;
  noteTA.style.cssText = 'background:#0f0f1a;border:1px solid #3a3a5c;border-radius:6px;padding:6px;color:#e0e0f0;font-size:13px;resize:vertical;';

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = '+ Log Mood';
  addBtn.style.cssText = 'background:#7c3aed;border:none;border-radius:6px;padding:8px;color:#fff;cursor:pointer;font-size:13px;font-weight:600;';

  form.appendChild(dateInput);
  form.appendChild(moodSel);
  form.appendChild(noteTA);
  form.appendChild(addBtn);

  form.addEventListener('submit', e => {
    e.preventDefault();
    addMood(dateInput.value, parseInt(moodSel.value, 10), noteTA.value.trim());
    noteTA.value = '';
    dateInput.value = localDate();
    renderMoodList(list);
    updateMoodStats(panel);
  });

  const statsEl = document.createElement('div');
  statsEl.id = 'kairos-mood-stats';
  statsEl.style.cssText = 'font-size:12px;color:#a0a0c0;background:#0f0f1a;border-radius:6px;padding:6px 8px;';

  const list = document.createElement('div');
  list.id = 'kairos-mood-list';

  panel.appendChild(headerRow);
  panel.appendChild(form);
  panel.appendChild(statsEl);
  panel.appendChild(list);
  document.body.appendChild(panel);

  renderMoodList(list);
  updateMoodStats(panel);
}
