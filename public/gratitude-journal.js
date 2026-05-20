/** gratitude-journal.js — Diario de gratitud · KAIROS browser module */
const GJ_KEY = 'kairos:gratitude';

function loadEntries() { try { const d = JSON.parse(localStorage.getItem(GJ_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveEntries(list) { localStorage.setItem(GJ_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

export function addEntry(date, items, reflection = '') {
  const list = loadEntries();
  const entry = { id: uid(), date, items: items.slice(0, 3).map(i => i.trim()).filter(Boolean), reflection: reflection.trim() || undefined, createdAt: new Date().toISOString() };
  list.unshift(entry);
  saveEntries(list);
  return entry;
}

export function deleteEntry(id) {
  const list = loadEntries();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveEntries(list);
  return true;
}

export function getGratitudeStats() {
  const list = loadEntries();
  const dates = [...new Set(list.map(e => e.date))].sort().reverse();
  const dateSet = new Set(dates);
  let currentStreak = 0;
  const today = new Date().toISOString().slice(0, 10);
  const d = new Date(today);
  while (dateSet.has(d.toISOString().slice(0, 10))) { currentStreak++; d.setDate(d.getDate() - 1); }
  let longestStreak = 0; let streak = 0;
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { streak = 1; longestStreak = 1; continue; }
    const diff = (new Date(dates[i-1]).getTime() - new Date(dates[i]).getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    if (streak > longestStreak) longestStreak = streak;
  }
  return { total: list.length, currentStreak, longestStreak, totalItems: list.reduce((s, e) => s + e.items.length, 0) };
}

export function renderGratitudePanel() {
  let panel = document.getElementById('kairos-gratitude-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') renderEntryList(); return; }
  panel = document.createElement('section');
  panel.id = 'kairos-gratitude-panel';
  panel.className = 'kairos-panel';

  const h2 = document.createElement('h2'); h2.textContent = '🙏 Gratitude Journal'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'gratitude-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form'); form.id = 'gratitude-form';
  const dateIn = document.createElement('input'); dateIn.type = 'date'; dateIn.value = new Date().toISOString().slice(0,10);
  const item1 = document.createElement('input'); item1.type = 'text'; item1.placeholder = 'Agradecimiento 1';
  const item2 = document.createElement('input'); item2.type = 'text'; item2.placeholder = 'Agradecimiento 2';
  const item3 = document.createElement('input'); item3.type = 'text'; item3.placeholder = 'Agradecimiento 3';
  const refIn = document.createElement('textarea'); refIn.placeholder = 'Reflexión (opcional)';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Registrar';
  form.append(dateIn, item1, item2, item3, refIn, addBtn);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const items = [item1.value, item2.value, item3.value].filter(s => s.trim());
    if (!items.length) return;
    addEntry(dateIn.value, items, refIn.value);
    item1.value = ''; item2.value = ''; item3.value = ''; refIn.value = '';
    renderEntryList();
  });
  panel.appendChild(form);

  const listEl = document.createElement('div'); listEl.id = 'gratitude-list'; panel.appendChild(listEl);

  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderEntryList();
}

function renderEntryList() {
  const listEl = document.getElementById('gratitude-list');
  const statsEl = document.getElementById('gratitude-stats');
  if (!listEl) return;
  const list = loadEntries();
  const stats = getGratitudeStats();
  if (statsEl) { statsEl.textContent = `Entradas: ${stats.total} · Racha actual: ${stats.currentStreak}d · Racha máx: ${stats.longestStreak}d · Items totales: ${stats.totalItems}`; }
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay entradas.'; listEl.appendChild(em); return; }
  list.forEach(e => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const dateEl = document.createElement('strong'); dateEl.textContent = e.date; card.appendChild(dateEl);
    const ul = document.createElement('ul');
    e.items.forEach(i => { const li = document.createElement('li'); li.textContent = i; ul.appendChild(li); });
    card.appendChild(ul);
    if (e.reflection) { const p = document.createElement('p'); p.textContent = e.reflection; card.appendChild(p); }
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteEntry(e.id); renderEntryList(); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
