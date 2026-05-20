/** learning-tracker.js — Tracker de libros, cursos y recursos de aprendizaje · KAIROS browser module */
const LT_KEY = 'kairos:learning';

const TYPE_EMOJI = { book: '📚', course: '🎓', article: '📄', video: '🎥', podcast: '🎤', other: '📦' };
const STATUS_COLOR = { 'not-started': '#374151', 'in-progress': '#d97706', 'completed': '#065f46', 'abandoned': '#450a0a' };
const STATUS_TEXT_COLOR = { 'not-started': '#9ca3af', 'in-progress': '#fbbf24', 'completed': '#34d399', 'abandoned': '#f87171' };
const STATUS_LABEL = { 'not-started': 'Sin empezar', 'in-progress': 'En progreso', 'completed': '✓ Completado', 'abandoned': 'Abandonado' };

function loadItems() { try { const d = JSON.parse(localStorage.getItem(LT_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveItems(list) { localStorage.setItem(LT_KEY, JSON.stringify(list)); }

export function addLearningItem(title, type, totalUnits, url = '', tags = []) {
  const list = loadItems();
  const item = {
    id: `lt-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
    title: String(title).slice(0,300),
    type: String(type),
    url: String(url).slice(0,500),
    totalUnits: Math.max(1, Number(totalUnits) || 1),
    currentUnit: 0,
    progressPct: 0,
    status: 'not-started',
    tags: Array.isArray(tags) ? tags.map(t => String(t).slice(0,40)) : [],
    notes: '',
    createdAt: new Date().toISOString(),
  };
  list.unshift(item);
  saveItems(list);
  return item;
}

export function updateProgress(id, currentUnit, notes) {
  const list = loadItems();
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return null;
  const item = list[idx];
  item.currentUnit = Math.max(0, Math.min(Number(currentUnit) || 0, item.totalUnits));
  item.progressPct = Math.round(item.currentUnit / item.totalUnits * 100);
  if (notes !== undefined) item.notes = String(notes).slice(0,2000);
  if (item.status === 'not-started' && item.currentUnit > 0) { item.status = 'in-progress'; item.startedAt = new Date().toISOString(); }
  if (item.currentUnit >= item.totalUnits) { item.status = 'completed'; item.completedAt = new Date().toISOString(); item.progressPct = 100; }
  saveItems(list);
  return item;
}

export function abandonItem(id) {
  const list = loadItems();
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return null;
  list[idx].status = 'abandoned';
  saveItems(list);
  return list[idx];
}

export function listLearningItems(filter = 'all') {
  const all = loadItems();
  return filter === 'all' ? all : all.filter(i => i.status === filter);
}

export function deleteLearningItem(id) {
  saveItems(loadItems().filter(i => i.id !== id));
}

export function getLearningStats() {
  const all = loadItems();
  const inProgress = all.filter(i => i.status === 'in-progress');
  return {
    total: all.length,
    completed: all.filter(i => i.status === 'completed').length,
    inProgress: inProgress.length,
    notStarted: all.filter(i => i.status === 'not-started').length,
    abandoned: all.filter(i => i.status === 'abandoned').length,
    avgProgress: inProgress.length ? Math.round(inProgress.reduce((s,i) => s+i.progressPct, 0) / inProgress.length) : 0,
  };
}

export function renderLearningPanel() {
  const existing = document.getElementById('kairos-learning-panel');
  if (existing) { existing.remove(); return; }

  let currentFilter = 'all';

  const panel = document.createElement('div');
  panel.id = 'kairos-learning-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(560px,95vw);max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem';
  const titleEl = document.createElement('h3'); titleEl.style.cssText = 'margin:0;color:#a5b4fc;font-size:1rem'; titleEl.textContent = '🎓 Learning Tracker';
  const closeBtn = document.createElement('button'); closeBtn.style.cssText = 'background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem'; closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => panel.remove());
  header.append(titleEl, closeBtn);

  const statsBar = document.createElement('div');
  statsBar.style.cssText = 'display:flex;gap:0.8rem;margin-bottom:1rem;font-size:0.78rem;flex-wrap:wrap';
  function refreshStats() {
    statsBar.innerHTML = '';
    const st = getLearningStats();
    const items = [
      ['Total', st.total, '#a5b4fc'],
      ['En progreso', st.inProgress, '#fbbf24'],
      ['Completados', st.completed, '#34d399'],
      [`Progreso avg`, st.avgProgress + '%', '#60a5fa'],
    ];
    items.forEach(([l, v, c]) => { const s = document.createElement('span'); s.style.color = c; s.textContent = `${l}: ${v}`; statsBar.appendChild(s); });
  }
  refreshStats();

  const tabRow = document.createElement('div');
  tabRow.style.cssText = 'display:flex;gap:0.3rem;margin-bottom:0.9rem;flex-wrap:wrap';
  const filters = [['all','Todos'],['in-progress','En progreso'],['not-started','Sin empezar'],['completed','Completos'],['abandoned','Abandonados']];
  function updateTabs() {
    tabRow.querySelectorAll('button').forEach((b, i) => {
      const isActive = filters[i][0] === currentFilter;
      b.style.background = isActive ? '#4338ca' : '#0f0f1e';
      b.style.color = isActive ? '#fff' : '#9ca3af';
    });
  }
  filters.forEach(([f, l]) => {
    const btn = document.createElement('button');
    btn.textContent = l;
    btn.style.cssText = `padding:0.25rem 0.6rem;border:1px solid #374151;border-radius:5px;cursor:pointer;font-size:0.75rem;background:${currentFilter===f?'#4338ca':'#0f0f1e'};color:${currentFilter===f?'#fff':'#9ca3af'}`;
    btn.addEventListener('click', () => { currentFilter = f; updateTabs(); renderList(); });
    tabRow.appendChild(btn);
  });

  const form = document.createElement('div');
  form.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.9rem;margin-bottom:0.9rem;display:flex;flex-direction:column;gap:0.5rem';
  const inTitle = document.createElement('input'); inTitle.placeholder = 'Título (libro, curso, artículo...)'; inTitle.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem';
  const typeRow = document.createElement('div'); typeRow.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap';
  const typeSel = document.createElement('select'); typeSel.style.cssText = 'flex:1;padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#9ca3af;font-size:0.82rem';
  ['book','course','article','video','podcast','other'].forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = `${TYPE_EMOJI[t]} ${t}`; typeSel.appendChild(o); });
  const inUnits = document.createElement('input'); inUnits.type = 'number'; inUnits.min = '1'; inUnits.placeholder = 'Unidades totales'; inUnits.value = '10';
  inUnits.style.cssText = 'width:120px;padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem';
  typeRow.append(typeSel, inUnits);
  const inUrl = document.createElement('input'); inUrl.placeholder = 'URL (opcional)'; inUrl.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem';
  const addBtn = document.createElement('button'); addBtn.textContent = '+ Agregar item'; addBtn.style.cssText = 'padding:0.4rem 1rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem;align-self:flex-start';
  addBtn.addEventListener('click', () => {
    if (!inTitle.value.trim()) { inTitle.focus(); return; }
    addLearningItem(inTitle.value.trim(), typeSel.value, parseInt(inUnits.value)||1, inUrl.value.trim());
    inTitle.value = ''; inUrl.value = ''; inUnits.value = '10';
    refreshStats(); renderList();
  });
  form.append(inTitle, typeRow, inUrl, addBtn);

  const listEl = document.createElement('div');
  function renderList() {
    listEl.innerHTML = '';
    const items = listLearningItems(currentFilter);
    if (!items.length) { const e = document.createElement('p'); e.style.cssText = 'color:#6b7280;font-size:0.85rem'; e.textContent = 'Sin items.'; listEl.appendChild(e); return; }
    items.forEach(item => {
      const card = document.createElement('div');
      card.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.7rem;margin-bottom:0.5rem;background:#0f0f1e';

      const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem';
      const titleWrap = document.createElement('div');
      const typeEmoji = document.createElement('span'); typeEmoji.textContent = (TYPE_EMOJI[item.type] || '📦') + ' ';
      const titleSpan = document.createElement('span'); titleSpan.style.cssText = 'color:#e5e7eb;font-size:0.88rem;font-weight:600'; titleSpan.textContent = item.title;
      titleWrap.append(typeEmoji, titleSpan);
      const badge = document.createElement('span');
      badge.style.cssText = `font-size:0.68rem;padding:0.15rem 0.35rem;border-radius:4px;font-weight:700;background:${STATUS_COLOR[item.status]};color:${STATUS_TEXT_COLOR[item.status]}`;
      badge.textContent = STATUS_LABEL[item.status];
      top.append(titleWrap, badge);

      const barWrap = document.createElement('div'); barWrap.style.cssText = 'background:#1f2937;border-radius:4px;height:6px;margin-bottom:0.5rem;overflow:hidden';
      const barFill = document.createElement('div'); barFill.style.cssText = `height:100%;width:${item.progressPct}%;background:${item.progressPct===100?'#34d399':'#4338ca'};border-radius:4px;transition:width 0.3s`;
      barWrap.appendChild(barFill);
      const progLabel = document.createElement('div'); progLabel.style.cssText = 'font-size:0.72rem;color:#6b7280;margin-bottom:0.4rem'; progLabel.textContent = `${item.currentUnit}/${item.totalUnits} unidades · ${item.progressPct}%`;

      const ctrlRow = document.createElement('div'); ctrlRow.style.cssText = 'display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap';
      if (item.status !== 'completed' && item.status !== 'abandoned') {
        const progressInp = document.createElement('input'); progressInp.type = 'number'; progressInp.min = '0'; progressInp.max = String(item.totalUnits);
        progressInp.value = String(item.currentUnit); progressInp.style.cssText = 'width:64px;padding:0.25rem;background:#0f0f23;border:1px solid #374151;border-radius:5px;color:#e5e7eb;font-size:0.78rem';
        const updateBtn = document.createElement('button'); updateBtn.textContent = 'Actualizar'; updateBtn.style.cssText = 'padding:0.25rem 0.6rem;background:#1e3a5f;color:#60a5fa;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem';
        updateBtn.addEventListener('click', () => { updateProgress(item.id, parseInt(progressInp.value)||0); refreshStats(); renderList(); });
        const abandonBtn = document.createElement('button'); abandonBtn.textContent = '✗ Abandonar'; abandonBtn.style.cssText = 'padding:0.25rem 0.5rem;background:#450a0a;color:#f87171;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem';
        abandonBtn.addEventListener('click', () => { abandonItem(item.id); refreshStats(); renderList(); });
        ctrlRow.append(progressInp, updateBtn, abandonBtn);
      }
      const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.style.cssText = 'padding:0.25rem 0.4rem;background:#450a0a;color:#f87171;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem;margin-left:auto';
      delBtn.addEventListener('click', () => { deleteLearningItem(item.id); refreshStats(); renderList(); });
      ctrlRow.appendChild(delBtn);

      card.append(top, barWrap, progLabel, ctrlRow);
      listEl.appendChild(card);
    });
  }
  renderList();

  panel.append(header, statsBar, tabRow, form, listEl);
  document.body.appendChild(panel);
}
