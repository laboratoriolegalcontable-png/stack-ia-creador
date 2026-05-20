/**
 * sleep-tracker.js — Sleep tracker with quality and streak
 * localStorage key: kairos:sleep
 * @module sleep-tracker
 */

const KEY = 'kairos:sleep';

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function getActiveFilter(panel) {
  const active = panel.querySelector('.st-filter-tab.active');
  return active ? active.dataset.filter : 'all';
}

function calcStreak(entries) {
  const today = localDate();
  const dates = new Set(entries.map(e => e.date));
  let streak = 0;
  let cursor = new Date(today);
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
    if (dates.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function renderList(panel) {
  const entries = load();
  const filter = getActiveFilter(panel);
  const list = panel.querySelector('.st-list');
  if (!list) return;
  list.textContent = '';

  const filtered = filter === 'all' ? entries : entries.filter(e => String(e.quality) === filter);

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'st-empty';
    empty.textContent = 'No hay registros de sueño.';
    list.appendChild(empty);
    return;
  }

  // Show most recent first
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'st-row';

    const info = document.createElement('div');
    info.className = 'st-info';

    const dateEl = document.createElement('strong');
    dateEl.textContent = entry.date;
    info.appendChild(dateEl);

    const meta = document.createElement('span');
    meta.textContent = ` · 😴 ${entry.bedtime || '—'} → 🌅 ${entry.wakeTime || '—'} · ${entry.hours}h · ★${entry.quality}`;
    info.appendChild(meta);

    if (entry.notes) {
      const notes = document.createElement('div');
      notes.className = 'st-notes';
      notes.textContent = entry.notes;
      info.appendChild(notes);
    }

    row.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'st-actions';

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => {
      const all = load();
      save(all.filter(e => e.id !== entry.id));
      renderList(panel);
      renderStats(panel);
    });
    actions.appendChild(delBtn);

    row.appendChild(actions);
    list.appendChild(row);
  });
}

function renderStats(panel) {
  const entries = load();
  const statsEl = panel.querySelector('.st-stats');
  if (!statsEl) return;
  statsEl.textContent = '';

  const total = entries.length;
  const avgHours = total > 0
    ? (entries.reduce((s, e) => s + (parseFloat(e.hours) || 0), 0) / total).toFixed(1)
    : 0;
  const avgQuality = total > 0
    ? (entries.reduce((s, e) => s + (parseInt(e.quality) || 0), 0) / total).toFixed(1)
    : 0;
  const streak = calcStreak(entries);

  const totalEl = document.createElement('span');
  totalEl.textContent = `Total: ${total}`;
  statsEl.appendChild(totalEl);

  const hoursEl = document.createElement('span');
  hoursEl.textContent = ` · Avg horas: ${avgHours}h`;
  statsEl.appendChild(hoursEl);

  const qualEl = document.createElement('span');
  qualEl.textContent = ` · Avg calidad: ★${avgQuality}`;
  statsEl.appendChild(qualEl);

  const streakEl = document.createElement('span');
  streakEl.textContent = ` · Racha: ${streak} días`;
  statsEl.appendChild(streakEl);
}

export function renderSleepTracker() {
  const existing = document.getElementById('st-panel');
  if (existing) {
    existing.style.display = existing.style.display === 'none' ? 'block' : 'none';
    if (existing.style.display === 'block') {
      renderList(existing);
      renderStats(existing);
    }
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'st-panel';
  panel.className = 'kairos-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'panel-header';
  const h2 = document.createElement('h2');
  h2.textContent = 'Sleep Tracker';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  header.appendChild(h2);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Add form
  const form = document.createElement('form');
  form.className = 'st-form';

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = localDate();
  dateInput.required = true;
  form.appendChild(dateInput);

  const bedtimeInput = document.createElement('input');
  bedtimeInput.type = 'time';
  bedtimeInput.placeholder = 'Hora de dormir';
  form.appendChild(bedtimeInput);

  const wakeInput = document.createElement('input');
  wakeInput.type = 'time';
  wakeInput.placeholder = 'Hora de despertar';
  form.appendChild(wakeInput);

  const hoursInput = document.createElement('input');
  hoursInput.type = 'number';
  hoursInput.min = '0';
  hoursInput.max = '24';
  hoursInput.step = '0.5';
  hoursInput.placeholder = 'Horas dormidas *';
  hoursInput.required = true;
  form.appendChild(hoursInput);

  const qualitySel = document.createElement('select');
  const qualityLabel = document.createElement('label');
  qualityLabel.textContent = 'Calidad: ';
  [1,2,3,4,5].forEach(n => {
    const opt = document.createElement('option');
    opt.value = String(n);
    opt.textContent = '★'.repeat(n);
    qualitySel.appendChild(opt);
  });
  qualitySel.value = '3';
  form.appendChild(qualityLabel);
  form.appendChild(qualitySel);

  const notesInput = document.createElement('textarea');
  notesInput.placeholder = 'Notas (opcional)';
  notesInput.rows = 2;
  form.appendChild(notesInput);

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Registrar';
  form.appendChild(addBtn);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const h = parseFloat(hoursInput.value);
    if (isNaN(h) || h < 0) return;
    const entries = load();
    entries.push({
      id: crypto.randomUUID(),
      date: dateInput.value,
      bedtime: bedtimeInput.value,
      wakeTime: wakeInput.value,
      hours: h,
      quality: parseInt(qualitySel.value, 10),
      notes: notesInput.value.trim(),
      createdAt: new Date().toISOString()
    });
    save(entries);
    hoursInput.value = '';
    notesInput.value = '';
    renderList(panel);
    renderStats(panel);
  });
  panel.appendChild(form);

  // Filter tabs
  const tabs = document.createElement('div');
  tabs.className = 'st-filter-tabs';
  ['all','1','2','3','4','5'].forEach(f => {
    const tab = document.createElement('button');
    tab.className = 'st-filter-tab' + (f === 'all' ? ' active' : '');
    tab.dataset.filter = f;
    tab.textContent = f === 'all' ? 'all' : '★'.repeat(parseInt(f));
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.st-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderList(panel);
    });
    tabs.appendChild(tab);
  });
  panel.appendChild(tabs);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.className = 'st-stats';
  panel.appendChild(statsEl);

  // List
  const list = document.createElement('div');
  list.className = 'st-list';
  panel.appendChild(list);

  document.body.appendChild(panel);
  renderList(panel);
  renderStats(panel);
}
