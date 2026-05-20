/** accountability.js — Compromisos personales con deadline y semáforo · KAIROS browser module */
const ACC_KEY = 'kairos:accountability';

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function loadAll() { try { return JSON.parse(localStorage.getItem(ACC_KEY) || '[]'); } catch { return []; } }
function saveAll(list) { localStorage.setItem(ACC_KEY, JSON.stringify(list)); }

/** Days remaining from today to dueDate (YYYY-MM-DD). Negative = overdue. */
function daysUntil(dueDate) {
  const [dy, dm, dd] = dueDate.split('-').map(Number);
  const today = new Date();
  const due = new Date(dy, dm - 1, dd);
  return Math.round((due - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
}

/**
 * @param {string} text
 * @param {string} dueDate  — YYYY-MM-DD
 * @param {string} category
 * @returns {object}
 */
export function addCommitment(text, dueDate, category = 'general') {
  const list = loadAll();
  const item = {
    id: `acc-${Date.now()}`,
    text: String(text).slice(0, 500),
    dueDate: String(dueDate),
    category: String(category).slice(0, 80),
    status: 'pending',
    createdAt: new Date().toISOString(),
    date: localDateStr(),
  };
  list.unshift(item);
  saveAll(list);
  return item;
}

export function completeCommitment(id) {
  const list = loadAll();
  const item = list.find(c => c.id === id);
  if (item) { item.status = 'done'; item.completedAt = new Date().toISOString(); saveAll(list); }
}

export function missCommitment(id) {
  const list = loadAll();
  const item = list.find(c => c.id === id);
  if (item) { item.status = 'missed'; saveAll(list); }
}

/**
 * @param {'all'|'pending'|'done'|'missed'} filter
 * @returns {object[]}
 */
export function listCommitments(filter = 'all') {
  const list = loadAll();
  return filter === 'all' ? list : list.filter(c => c.status === filter);
}

/** @returns {{ total, done, missed, pending, completionRate }} */
export function getAccountabilityStats() {
  const list = loadAll();
  const done = list.filter(c => c.status === 'done').length;
  const missed = list.filter(c => c.status === 'missed').length;
  const pending = list.filter(c => c.status === 'pending').length;
  const total = list.length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, missed, pending, completionRate };
}

// ── Panel UI ────────────────────────────────────────────────────────────────────

export function renderAccountabilityPanel() {
  const existing = document.getElementById('kairos-acc-panel');
  if (existing) { existing.remove(); return; }

  let currentFilter = 'all';

  const panel = document.createElement('div');
  panel.id = 'kairos-acc-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(520px,95vw);max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  // ── Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem';
  const title = document.createElement('h3');
  title.style.cssText = 'margin:0;color:#a5b4fc;font-size:1rem';
  title.textContent = '🎯 Accountability';
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => panel.remove());
  header.append(title, closeBtn);

  // ── Stats / semáforo
  const statsEl = document.createElement('div');
  statsEl.id = 'acc-stats';
  statsEl.style.cssText = 'display:flex;gap:0.8rem;margin-bottom:1rem;flex-wrap:wrap';

  function refreshStats() {
    statsEl.innerHTML = '';
    const st = getAccountabilityStats();
    const items = [
      { label: `${st.total} total`,  color: '#a5b4fc' },
      { label: `✅ ${st.done} hechos`,   color: '#34d399' },
      { label: `❌ ${st.missed} perdidos`, color: '#f87171' },
      { label: `⏳ ${st.pending} pendientes`, color: '#fbbf24' },
      { label: `${st.completionRate}% tasa`, color: '#60a5fa' },
    ];
    items.forEach(({ label, color }) => {
      const s = document.createElement('span');
      s.style.cssText = `font-size:0.78rem;color:${color}`;
      s.textContent = label;
      statsEl.appendChild(s);
    });
  }
  refreshStats();

  // ── Filter buttons
  const filterRow = document.createElement('div');
  filterRow.style.cssText = 'display:flex;gap:0.4rem;margin-bottom:0.8rem;flex-wrap:wrap';
  [['all','Todos'],['pending','Pendientes'],['done','Hechos'],['missed','Perdidos']].forEach(([val, lbl]) => {
    const btn = document.createElement('button');
    btn.textContent = lbl;
    btn.dataset.filter = val;
    btn.style.cssText = `padding:0.25rem 0.65rem;border-radius:5px;border:1px solid #374151;background:${val === 'all' ? '#4338ca' : '#0f0f1e'};color:${val === 'all' ? '#fff' : '#9ca3af'};cursor:pointer;font-size:0.75rem`;
    btn.addEventListener('click', () => {
      currentFilter = val;
      filterRow.querySelectorAll('button').forEach(b => {
        const active = b.dataset.filter === val;
        b.style.background = active ? '#4338ca' : '#0f0f1e';
        b.style.color = active ? '#fff' : '#9ca3af';
      });
      renderList();
    });
    filterRow.appendChild(btn);
  });

  // ── Form
  const form = document.createElement('div');
  form.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.9rem;margin-bottom:0.9rem;display:flex;flex-direction:column;gap:0.5rem';

  const inText = document.createElement('input');
  inText.placeholder = 'Compromiso...';
  inText.style.cssText = 'padding:0.45rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem';

  const inRow = document.createElement('div');
  inRow.style.cssText = 'display:flex;gap:0.5rem';

  const inDate = document.createElement('input');
  inDate.type = 'date';
  inDate.value = localDateStr();
  inDate.style.cssText = 'flex:1;padding:0.45rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem';

  const inCat = document.createElement('input');
  inCat.placeholder = 'Categoría (ej: trabajo, salud)';
  inCat.style.cssText = 'flex:1;padding:0.45rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem';

  inRow.append(inDate, inCat);

  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Agregar compromiso';
  addBtn.style.cssText = 'padding:0.4rem 1rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.83rem;align-self:flex-start';
  addBtn.addEventListener('click', () => {
    const text = inText.value.trim();
    if (!text) { inText.focus(); return; }
    addCommitment(text, inDate.value || localDateStr(), inCat.value.trim() || 'general');
    inText.value = ''; inCat.value = '';
    renderList();
    refreshStats();
  });

  form.append(inText, inRow, addBtn);

  // ── List container
  const listEl = document.createElement('div');
  listEl.id = 'acc-list';

  function renderList() {
    listEl.innerHTML = '';
    const commitments = listCommitments(currentFilter);
    if (commitments.length === 0) {
      const empty = document.createElement('p');
      empty.style.cssText = 'color:#6b7280;font-size:0.85rem';
      empty.textContent = 'Sin compromisos.';
      listEl.appendChild(empty);
      return;
    }
    commitments.forEach(c => {
      const days = daysUntil(c.dueDate);
      // Traffic light color
      let deadlineColor, deadlineLabel;
      if (c.status !== 'pending') {
        deadlineColor = c.status === 'done' ? '#34d399' : '#f87171';
        deadlineLabel = c.status === 'done' ? '✅ Hecho' : '❌ Perdido';
      } else if (days < 0) {
        deadlineColor = '#ef4444'; deadlineLabel = `${Math.abs(days)}d vencido`;
      } else if (days <= 2) {
        deadlineColor = '#f59e0b'; deadlineLabel = days === 0 ? 'Hoy' : `${days}d`;
      } else {
        deadlineColor = '#34d399'; deadlineLabel = `${days}d`;
      }

      const card = document.createElement('div');
      card.style.cssText = `border:1px solid #374151;border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:#0f0f1e;border-left:3px solid ${deadlineColor}`;

      const top = document.createElement('div');
      top.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.35rem';

      const textEl = document.createElement('div');
      textEl.style.cssText = 'color:#e5e7eb;font-size:0.86rem;font-weight:500;flex:1;margin-right:0.5rem';
      textEl.textContent = c.text;

      const deadlineBadge = document.createElement('span');
      deadlineBadge.style.cssText = `font-size:0.72rem;color:${deadlineColor};white-space:nowrap;font-weight:600`;
      deadlineBadge.textContent = deadlineLabel;

      top.append(textEl, deadlineBadge);

      const meta = document.createElement('div');
      meta.style.cssText = 'font-size:0.74rem;color:#6b7280;margin-bottom:0.4rem';
      const catSpan = document.createElement('span');
      catSpan.style.cssText = 'background:#1e3a5f;color:#60a5fa;border-radius:3px;padding:0.1rem 0.3rem;margin-right:0.4rem;font-size:0.68rem';
      catSpan.textContent = c.category;
      const dateSpan = document.createElement('span');
      dateSpan.textContent = `Vence: ${c.dueDate}`;
      meta.append(catSpan, dateSpan);

      card.append(top, meta);

      if (c.status === 'pending') {
        const btns = document.createElement('div');
        btns.style.cssText = 'display:flex;gap:0.4rem';

        const doneBtn = document.createElement('button');
        doneBtn.textContent = '✅ Hecho';
        doneBtn.style.cssText = 'padding:0.25rem 0.6rem;background:#065f46;color:#34d399;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem';
        doneBtn.addEventListener('click', () => { completeCommitment(c.id); renderList(); refreshStats(); });

        const missBtn = document.createElement('button');
        missBtn.textContent = '❌ Perdido';
        missBtn.style.cssText = 'padding:0.25rem 0.6rem;background:#450a0a;color:#f87171;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem';
        missBtn.addEventListener('click', () => { missCommitment(c.id); renderList(); refreshStats(); });

        btns.append(doneBtn, missBtn);
        card.appendChild(btns);
      }

      listEl.appendChild(card);
    });
  }

  renderList();

  panel.append(header, statsEl, filterRow, form, listEl);
  document.body.appendChild(panel);
}
