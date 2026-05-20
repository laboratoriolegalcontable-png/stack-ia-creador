/** quick-wins.js — Registro de victorias rápidas · KAIROS browser module */
const QW_KEY = 'kairos:quickwins';

function loadWins() { try { const d = JSON.parse(localStorage.getItem(QW_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveWins(list) { localStorage.setItem(QW_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

export function addWin(title, category = 'other', impact = 'medium', reflection = '') {
  const list = loadWins();
  const win = { id: uid(), title: title.trim(), category, impact, reflection: reflection.trim() || undefined, createdAt: new Date().toISOString() };
  list.unshift(win);
  saveWins(list);
  return win;
}

export function deleteWin(id) {
  const list = loadWins();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveWins(list);
  return true;
}

export function getWinStats() {
  const list = loadWins();
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const categories = ['work','personal','health','learning','finance','other'];
  return {
    total: list.length,
    thisWeek: list.filter(w => new Date(w.createdAt) >= weekAgo).length,
    byImpact: { small: list.filter(w => w.impact === 'small').length, medium: list.filter(w => w.impact === 'medium').length, big: list.filter(w => w.impact === 'big').length },
    byCategory: Object.fromEntries(categories.map(c => [c, list.filter(w => w.category === c).length])),
  };
}

export function renderWinPanel() {
  let panel = document.getElementById('kairos-wins-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') renderWinList(); return; }
  panel = document.createElement('section');
  panel.id = 'kairos-wins-panel';
  panel.className = 'kairos-panel';

  const h2 = document.createElement('h2'); h2.textContent = '🏆 Quick Wins'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'wins-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form'); form.id = 'wins-form';
  const titleIn = document.createElement('input'); titleIn.type = 'text'; titleIn.placeholder = '¿Qué lograste?'; titleIn.id = 'win-title-in';
  const catSel = document.createElement('select'); catSel.id = 'win-cat-in';
  ['work','personal','health','learning','finance','other'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; catSel.appendChild(o); });
  const impSel = document.createElement('select'); impSel.id = 'win-imp-in';
  ['small','medium','big'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; if (v === 'medium') o.selected = true; impSel.appendChild(o); });
  const refIn = document.createElement('textarea'); refIn.placeholder = 'Reflexión (opcional)';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Win';
  form.append(titleIn, catSel, impSel, refIn, addBtn);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = titleIn.value.trim(); if (!t) return;
    addWin(t, catSel.value, impSel.value, refIn.value);
    titleIn.value = ''; refIn.value = '';
    renderWinList();
  });
  panel.appendChild(form);

  // filter tabs
  const tabs = document.createElement('div'); tabs.className = 'filter-tabs';
  ['all','work','personal','health','learning','finance','other'].forEach(cat => {
    const btn = document.createElement('button'); btn.textContent = cat; btn.dataset.cat = cat;
    if (cat === 'all') btn.classList.add('active');
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWinList(cat === 'all' ? undefined : cat);
    });
    tabs.appendChild(btn);
  });
  panel.appendChild(tabs);

  const listEl = document.createElement('div'); listEl.id = 'wins-list'; panel.appendChild(listEl);

  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderWinList();
}

function renderWinList(filterCat) {
  const listEl = document.getElementById('wins-list');
  const statsEl = document.getElementById('wins-stats');
  if (!listEl) return;
  const stats = getWinStats();
  if (statsEl) { statsEl.textContent = `Total: ${stats.total} · Esta semana: ${stats.thisWeek} · Grandes: ${stats.byImpact.big}`; }
  let list = loadWins();
  if (filterCat) list = list.filter(w => w.category === filterCat);
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay wins.'; listEl.appendChild(em); return; }
  list.forEach(w => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const titleEl = document.createElement('strong'); titleEl.textContent = w.title;
    const catBadge = document.createElement('span'); catBadge.className = 'badge'; catBadge.textContent = w.category;
    const impBadge = document.createElement('span'); impBadge.className = `badge badge-${w.impact}`; impBadge.textContent = w.impact;
    top.append(titleEl, catBadge, impBadge);
    card.appendChild(top);
    if (w.reflection) { const p = document.createElement('p'); p.textContent = w.reflection; card.appendChild(p); }
    const dateEl = document.createElement('small'); dateEl.textContent = new Date(w.createdAt).toLocaleDateString(); card.appendChild(dateEl);
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteWin(w.id); renderWinList(filterCat); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
