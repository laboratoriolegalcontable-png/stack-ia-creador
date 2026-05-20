/** affirmations.js — Daily Affirmations · KAIROS browser module */
const AFF_KEY = 'kairos:affirmations';

function loadAffirmations() { try { const d = JSON.parse(localStorage.getItem(AFF_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveAffirmations(list) { localStorage.setItem(AFF_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function addAffirmation(text, category = 'general') {
  const list = loadAffirmations();
  const aff = { id: uid(), text: text.trim(), category: (category.trim() || 'general'), timesShown: 0, createdAt: localDate() };
  list.unshift(aff);
  saveAffirmations(list);
  return aff;
}

export function deleteAffirmation(id) {
  const list = loadAffirmations();
  const idx = list.findIndex(a => a.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveAffirmations(list);
  return true;
}

export function getDailyAffirmation() {
  const list = loadAffirmations();
  if (!list.length) return null;
  const date = localDate();
  const idx = [...date].reduce((a, c) => a + c.charCodeAt(0), 0) % list.length;
  const aff = list[idx];
  aff.timesShown = (aff.timesShown || 0) + 1;
  saveAffirmations(list);
  return aff;
}

export function getAffirmationStats() {
  const list = loadAffirmations();
  if (!list.length) return { total: 0, totalShown: 0, topText: '' };
  const totalShown = list.reduce((a, x) => a + (x.timesShown || 0), 0);
  const top = list.reduce((a, b) => (b.timesShown || 0) > (a.timesShown || 0) ? b : a, list[0]);
  return { total: list.length, totalShown, topText: top?.text || '' };
}

export function renderAffirmationPanel() {
  let panel = document.getElementById('kairos-affirmations-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const activeBtn = panel.querySelector('.filter-tabs button.active');
      const f = activeBtn?.dataset.filter;
      renderAffirmationList(f && f !== 'all' ? f : undefined);
    }
    return;
  }
  panel = document.createElement('section');
  panel.id = 'kairos-affirmations-panel';
  panel.className = 'kairos-panel';

  const h2 = document.createElement('h2'); h2.textContent = '✨ Afirmaciones Diarias'; panel.appendChild(h2);

  // Today's affirmation highlight box
  const dailyBox = document.createElement('div');
  dailyBox.id = 'affirmation-daily-box';
  dailyBox.style.cssText = 'background:linear-gradient(135deg,#312e81,#1e1b4b);border:1px solid #4338ca;border-radius:12px;padding:1.2rem;margin-bottom:1rem;text-align:center;';
  const dailyLabel = document.createElement('small'); dailyLabel.textContent = '💫 Afirmación del día'; dailyLabel.style.color = '#a5b4fc'; dailyLabel.style.display = 'block'; dailyLabel.style.marginBottom = '0.5rem';
  const dailyText = document.createElement('p'); dailyText.id = 'affirmation-daily-text'; dailyText.style.cssText = 'color:#e0e7ff;font-size:1.1rem;margin:0;font-style:italic;';
  dailyBox.append(dailyLabel, dailyText);
  panel.appendChild(dailyBox);

  const statsEl = document.createElement('p'); statsEl.id = 'affirmation-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form'); form.id = 'affirmation-form';
  const textIn = document.createElement('textarea'); textIn.placeholder = 'Escribe tu afirmación...'; textIn.id = 'aff-text-in'; textIn.required = true;
  const catIn = document.createElement('input'); catIn.type = 'text'; catIn.placeholder = 'Categoría (ej: motivación)'; catIn.id = 'aff-cat-in';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Afirmación';
  form.append(textIn, catIn, addBtn);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = textIn.value.trim(); if (!t) return;
    addAffirmation(t, catIn.value);
    textIn.value = ''; catIn.value = '';
    const activeBtn = panel.querySelector('.filter-tabs button.active');
    const f = activeBtn?.dataset.filter;
    renderAffirmationList(f && f !== 'all' ? f : undefined);
  });
  panel.appendChild(form);

  const tabs = document.createElement('div'); tabs.className = 'filter-tabs'; tabs.id = 'affirmation-tabs';
  panel.appendChild(tabs);

  const listEl = document.createElement('div'); listEl.id = 'affirmation-list'; panel.appendChild(listEl);

  const closeBtn = document.createElement('button'); closeBtn.textContent = '✕ Cerrar'; closeBtn.className = 'close-btn';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderAffirmationList();
}

function renderAffirmationList(filterCat) {
  const listEl = document.getElementById('affirmation-list');
  const statsEl = document.getElementById('affirmation-stats');
  const dailyText = document.getElementById('affirmation-daily-text');
  const panel = document.getElementById('kairos-affirmations-panel');
  if (!listEl) return;

  // Update daily affirmation
  if (dailyText) {
    const daily = getDailyAffirmation();
    dailyText.textContent = daily ? daily.text : 'Agrega tu primera afirmación ↓';
  }

  const stats = getAffirmationStats();
  if (statsEl) { statsEl.textContent = `Total: ${stats.total} · Veces mostradas: ${stats.totalShown}${stats.topText ? ` · Más popular: "${stats.topText.slice(0, 40)}${stats.topText.length > 40 ? '…' : ''}"` : ''}`; }

  // Rebuild tabs
  const tabs = panel?.querySelector('#affirmation-tabs');
  if (tabs) {
    const cats = ['all', ...new Set(loadAffirmations().map(a => a.category))];
    tabs.innerHTML = '';
    cats.forEach(cat => {
      const btn = document.createElement('button'); btn.textContent = cat; btn.dataset.filter = cat;
      if (cat === (filterCat || 'all')) btn.classList.add('active');
      btn.addEventListener('click', () => {
        tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAffirmationList(cat === 'all' ? undefined : cat);
      });
      tabs.appendChild(btn);
    });
  }

  let list = loadAffirmations();
  if (filterCat) list = list.filter(a => a.category === filterCat);
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay afirmaciones.'; listEl.appendChild(em); return; }
  list.forEach(aff => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const textEl = document.createElement('span'); textEl.textContent = aff.text;
    const catBadge = document.createElement('span'); catBadge.className = 'badge'; catBadge.textContent = aff.category;
    const shownBadge = document.createElement('span'); shownBadge.className = 'badge'; shownBadge.textContent = `×${aff.timesShown || 0}`;
    top.append(textEl, catBadge, shownBadge);
    card.appendChild(top);
    const dateEl = document.createElement('small'); dateEl.textContent = aff.createdAt; card.appendChild(dateEl);
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteAffirmation(aff.id); renderAffirmationList(filterCat); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
