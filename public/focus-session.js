/**
 * focus-session.js — Focus Session Logger (KAIROS)
 * key: kairos:focus-sessions
 * @module focus-session
 */

const KEY = 'kairos:focus-sessions';

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function addSession(duration, topic, mood, distractions, date) {
  const items = load();
  const item = {
    id: uid(),
    duration: Math.max(1, parseInt(duration, 10) || 25),
    topic: String(topic || '').trim(),
    mood: Math.min(5, Math.max(1, parseInt(mood, 10) || 3)),
    distractions: Math.max(0, parseInt(distractions, 10) || 0),
    date: date || localDate(),
    createdAt: new Date().toISOString()
  };
  items.push(item);
  save(items);
  return item;
}

function deleteSession(id) {
  save(load().filter(s => s.id !== id));
}

function getSessionStats() {
  const items = load();
  if (items.length === 0) return { total: 0, avgDuration: 0, avgMood: 0, totalMinutes: 0 };
  const total = items.length;
  const totalMinutes = items.reduce((sum, s) => sum + s.duration, 0);
  const avgDuration = Math.round(totalMinutes / total);
  const avgMood = Math.round((items.reduce((sum, s) => sum + s.mood, 0) / total) * 10) / 10;
  return { total, avgDuration, avgMood, totalMinutes };
}

function renderList(container, moodFilter) {
  container.innerHTML = '';
  let items = load().sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  if (moodFilter && moodFilter !== 'all') {
    const m = parseInt(moodFilter, 10);
    items = items.filter(s => s.mood === m);
  }

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '0.85rem';
    empty.textContent = 'No hay sesiones en esta categoría.';
    container.appendChild(empty);
    return;
  }

  for (const s of items) {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937;border:1px solid #374151;border-radius:8px;padding:0.85rem;margin-bottom:0.6rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;';

    const dateEl = document.createElement('span');
    dateEl.style.cssText = 'color:#e5e7eb;font-weight:600;font-size:0.85rem;';
    dateEl.textContent = s.date;

    const moodEl = document.createElement('span');
    moodEl.style.cssText = 'color:#fbbf24;font-size:0.85rem;';
    moodEl.textContent = '★'.repeat(s.mood) + '☆'.repeat(5 - s.mood);

    header.appendChild(dateEl);
    header.appendChild(moodEl);
    card.appendChild(header);

    if (s.topic) {
      const topicEl = document.createElement('div');
      topicEl.style.cssText = 'color:#a5b4fc;font-size:0.85rem;font-weight:600;margin-bottom:0.3rem;';
      topicEl.textContent = s.topic;
      card.appendChild(topicEl);
    }

    const metaEl = document.createElement('div');
    metaEl.style.cssText = 'color:#9ca3af;font-size:0.78rem;display:flex;gap:1rem;margin-bottom:0.4rem;';

    const durSpan = document.createElement('span');
    durSpan.textContent = `Duración: ${s.duration} min`;
    const distSpan = document.createElement('span');
    distSpan.textContent = `Distracciones: ${s.distractions}`;
    metaEl.appendChild(durSpan);
    metaEl.appendChild(distSpan);
    card.appendChild(metaEl);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.style.cssText = 'background:none;border:1px solid #7f1d1d;color:#fca5a5;border-radius:4px;padding:0.15rem 0.4rem;font-size:0.72rem;cursor:pointer;';
    delBtn.addEventListener('click', () => {
      if (confirm('¿Eliminar esta sesión?')) {
        deleteSession(s.id);
        const activeFilter = container.closest('[data-fsession-panel]')?.querySelector('[data-active-mood]')?.dataset.activeMood || 'all';
        renderList(container, activeFilter);
        refreshStats(container.closest('[data-fsession-panel]'));
      }
    });
    card.appendChild(delBtn);

    container.appendChild(card);
  }
}

function refreshStats(panel) {
  if (!panel) return;
  const statsEl = panel.querySelector('[data-fsession-stats]');
  if (!statsEl) return;
  const s = getSessionStats();
  statsEl.textContent = `Total: ${s.total} · Min totales: ${s.totalMinutes} · Prom: ${s.avgDuration} min · Humor: ${s.avgMood}`;
}

export function renderFocusSession() {
  let panel = document.getElementById('kairos-fsession-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const activeMood = panel.querySelector('[data-active-mood]')?.dataset.activeMood || 'all';
      const listEl = panel.querySelector('[data-fsession-list]');
      if (listEl) renderList(listEl, activeMood);
      refreshStats(panel);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-fsession-panel';
  panel.dataset.fsessionPanel = '1';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:460px;max-width:95vw;max-height:82vh;overflow-y:auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:1.25rem;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'margin:0 0 1rem;color:#a5b4fc;font-size:1rem;';
  titleEl.textContent = 'Focus Session Logger';
  panel.appendChild(titleEl);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.dataset.fsessionStats = '1';
  statsEl.style.cssText = 'color:#6b7280;font-size:0.78rem;margin-bottom:1rem;';
  const s0 = getSessionStats();
  statsEl.textContent = `Total: ${s0.total} · Min totales: ${s0.totalMinutes} · Prom: ${s0.avgDuration} min · Humor: ${s0.avgMood}`;
  panel.appendChild(statsEl);

  // Form
  const form = document.createElement('div');
  form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #374151;';

  const topicInput = document.createElement('input');
  topicInput.type = 'text';
  topicInput.placeholder = 'Tema / Tarea';
  topicInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  const row1 = document.createElement('div');
  row1.style.cssText = 'display:flex;gap:0.5rem;';

  const durInput = document.createElement('input');
  durInput.type = 'number';
  durInput.placeholder = 'Minutos (25)';
  durInput.min = '1';
  durInput.max = '480';
  durInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  const distInput = document.createElement('input');
  distInput.type = 'number';
  distInput.placeholder = 'Distracciones (0)';
  distInput.min = '0';
  distInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  row1.appendChild(durInput);
  row1.appendChild(distInput);

  const row2 = document.createElement('div');
  row2.style.cssText = 'display:flex;gap:0.5rem;align-items:center;';

  const moodLabel = document.createElement('label');
  moodLabel.style.cssText = 'color:#9ca3af;font-size:0.8rem;white-space:nowrap;';
  moodLabel.textContent = 'Humor (1-5):';

  const moodSel = document.createElement('select');
  moodSel.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';
  [1,2,3,4,5].forEach(n => {
    const opt = document.createElement('option');
    opt.value = String(n);
    opt.textContent = '★'.repeat(n) + '☆'.repeat(5-n) + ` (${n})`;
    if (n === 3) opt.selected = true;
    moodSel.appendChild(opt);
  });

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = localDate();
  dateInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';

  row2.appendChild(moodLabel);
  row2.appendChild(moodSel);
  row2.appendChild(dateInput);

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Registrar sesión';
  addBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:6px;padding:0.5rem 1rem;font-size:0.85rem;cursor:pointer;font-weight:600;';

  form.appendChild(topicInput);
  form.appendChild(row1);
  form.appendChild(row2);
  form.appendChild(addBtn);
  panel.appendChild(form);

  // Mood filter tabs
  const tabsEl = document.createElement('div');
  tabsEl.dataset.activeMood = 'all';
  tabsEl.style.cssText = 'display:flex;gap:0.4rem;margin-bottom:0.75rem;flex-wrap:wrap;';

  const moodFilters = ['all', '1', '2', '3', '4', '5'];
  const tabBtns = {};
  moodFilters.forEach(f => {
    const btn = document.createElement('button');
    btn.textContent = f === 'all' ? 'Todos' : '★'.repeat(Number(f));
    btn.style.cssText = `background:${f === 'all' ? '#4338ca' : 'none'};color:${f === 'all' ? '#fff' : '#9ca3af'};border:1px solid #374151;border-radius:4px;padding:0.2rem 0.6rem;font-size:0.78rem;cursor:pointer;`;
    btn.addEventListener('click', () => {
      tabsEl.dataset.activeMood = f;
      moodFilters.forEach(ff => {
        tabBtns[ff].style.background = ff === f ? '#4338ca' : 'none';
        tabBtns[ff].style.color = ff === f ? '#fff' : '#9ca3af';
      });
      renderList(listEl, f);
    });
    tabBtns[f] = btn;
    tabsEl.appendChild(btn);
  });
  panel.appendChild(tabsEl);

  // List
  const listEl = document.createElement('div');
  listEl.dataset.fsessionList = '1';
  panel.appendChild(listEl);

  // Close
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  closeBtn.style.cssText = 'margin-top:1rem;background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 1rem;font-size:0.82rem;cursor:pointer;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  addBtn.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    const dur = parseInt(durInput.value, 10) || 25;
    addSession(dur, topic, moodSel.value, distInput.value, dateInput.value);
    topicInput.value = '';
    durInput.value = '';
    distInput.value = '';
    const activeFilter = tabsEl.dataset.activeMood || 'all';
    renderList(listEl, activeFilter);
    refreshStats(panel);
  });

  document.body.appendChild(panel);
  renderList(listEl, 'all');
}
