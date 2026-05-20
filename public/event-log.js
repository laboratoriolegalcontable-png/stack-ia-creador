/**
 * event-log.js — Life Event Log (KAIROS)
 * key: kairos:events-log
 * @module event-log
 */

const KEY = 'kairos:events-log';

const CATEGORIES = ['personal','work','health','finance','learning','other'];

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

export function addLifeEvent(title, date, category, description, impact, tags) {
  const events = load();
  const evt = {
    id: uid(),
    title: String(title).trim(),
    date: date || localDate(),
    category: CATEGORIES.includes(category) ? category : 'other',
    description: String(description || '').trim(),
    impact: Math.min(5, Math.max(1, parseInt(impact, 10) || 3)),
    tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map(t => t.trim()).filter(Boolean),
    createdAt: new Date().toISOString()
  };
  events.push(evt);
  save(events);
  return evt;
}

export function deleteLifeEvent(id) {
  const events = load().filter(e => e.id !== id);
  save(events);
}

export function listEvents() {
  return load().sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
}

export function getEventStats() {
  const events = load();
  let totalImpact = 0;
  const byCategory = {};
  for (const evt of events) {
    totalImpact += evt.impact;
    byCategory[evt.category] = (byCategory[evt.category] || 0) + 1;
  }
  return {
    total: events.length,
    avgImpact: events.length > 0 ? Math.round((totalImpact / events.length) * 10) / 10 : 0,
    byCategory
  };
}

const CATEGORY_COLORS = {
  personal:  { bg: '#1e1b4b', color: '#a5b4fc' },
  work:      { bg: '#0f172a', color: '#38bdf8' },
  health:    { bg: '#064e3b', color: '#6ee7b7' },
  finance:   { bg: '#713f12', color: '#fcd34d' },
  learning:  { bg: '#4a044e', color: '#f0abfc' },
  other:     { bg: '#1f2937', color: '#9ca3af' }
};

let activeFilter = '';

function renderEventList(container, filter) {
  container.innerHTML = '';
  let events = listEvents();
  if (filter) events = events.filter(e => e.category === filter);
  if (events.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '0.85rem';
    empty.textContent = 'No hay eventos.';
    container.appendChild(empty);
    return;
  }
  for (const evt of events) {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937;border:1px solid #374151;border-radius:8px;padding:0.85rem;margin-bottom:0.6rem;';

    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;flex-wrap:wrap;gap:0.4rem;';

    const titleEl = document.createElement('strong');
    titleEl.style.cssText = 'color:#e5e7eb;font-size:0.88rem;';
    titleEl.textContent = evt.title;

    const rightBadges = document.createElement('div');
    rightBadges.style.cssText = 'display:flex;gap:0.4rem;align-items:center;';

    const catStyle = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
    const catBadge = document.createElement('span');
    catBadge.style.cssText = `font-size:0.7rem;padding:0.1rem 0.45rem;border-radius:10px;background:${catStyle.bg};color:${catStyle.color};font-weight:600;`;
    catBadge.textContent = evt.category;

    const impactEl = document.createElement('span');
    impactEl.style.cssText = 'color:#fbbf24;font-size:0.82rem;';
    impactEl.textContent = '★'.repeat(evt.impact) + '☆'.repeat(5 - evt.impact);

    rightBadges.appendChild(catBadge);
    rightBadges.appendChild(impactEl);

    topRow.appendChild(titleEl);
    topRow.appendChild(rightBadges);
    card.appendChild(topRow);

    const dateEl = document.createElement('div');
    dateEl.style.cssText = 'color:#6b7280;font-size:0.75rem;margin-bottom:0.3rem;';
    dateEl.textContent = evt.date;
    card.appendChild(dateEl);

    if (evt.description) {
      const descEl = document.createElement('div');
      descEl.style.cssText = 'color:#9ca3af;font-size:0.82rem;margin-bottom:0.4rem;';
      descEl.textContent = evt.description;
      card.appendChild(descEl);
    }

    if (evt.tags && evt.tags.length > 0) {
      const tagsRow = document.createElement('div');
      tagsRow.style.cssText = 'display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.4rem;';
      for (const tag of evt.tags) {
        const tagEl = document.createElement('span');
        tagEl.style.cssText = 'background:#374151;color:#9ca3af;font-size:0.7rem;padding:0.1rem 0.35rem;border-radius:8px;';
        tagEl.textContent = '#' + tag;
        tagsRow.appendChild(tagEl);
      }
      card.appendChild(tagsRow);
    }

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.style.cssText = 'background:none;border:1px solid #7f1d1d;color:#fca5a5;border-radius:4px;padding:0.15rem 0.4rem;font-size:0.72rem;cursor:pointer;';
    delBtn.addEventListener('click', () => {
      if (confirm(`¿Eliminar evento "${evt.title}"?`)) {
        deleteLifeEvent(evt.id);
        const listEl = document.getElementById('kairos-eventlog-list');
        if (listEl) renderEventList(listEl, activeFilter);
      }
    });
    card.appendChild(delBtn);

    container.appendChild(card);
  }
}

export function renderEventLogPanel() {
  let panel = document.getElementById('kairos-eventlog-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const listEl = document.getElementById('kairos-eventlog-list');
      if (listEl) renderEventList(listEl, activeFilter);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-eventlog-panel';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:440px;max-width:95vw;max-height:82vh;overflow-y:auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:1.25rem;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'margin:0 0 1rem;color:#a5b4fc;font-size:1rem;';
  titleEl.textContent = '📅 Event Log';
  panel.appendChild(titleEl);

  // Add event form
  const form = document.createElement('div');
  form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #374151;';

  const titleInput = document.createElement('input');
  titleInput.placeholder = 'Título del evento...';
  titleInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.7rem;font-size:0.85rem;';

  const row2 = document.createElement('div');
  row2.style.cssText = 'display:flex;gap:0.5rem;';

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = localDate();
  dateInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';

  const catSel = document.createElement('select');
  catSel.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';
  CATEGORIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    catSel.appendChild(opt);
  });

  row2.appendChild(dateInput);
  row2.appendChild(catSel);

  const descTA = document.createElement('textarea');
  descTA.placeholder = 'Descripción...';
  descTA.rows = 2;
  descTA.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.7rem;font-size:0.82rem;resize:vertical;';

  const row3 = document.createElement('div');
  row3.style.cssText = 'display:flex;gap:0.5rem;';

  const impactSel = document.createElement('select');
  impactSel.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';
  [1,2,3,4,5].forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = `Impacto ${n} ${'★'.repeat(n)}`;
    if (n === 3) opt.selected = true;
    impactSel.appendChild(opt);
  });

  const tagsInput = document.createElement('input');
  tagsInput.placeholder = 'Tags (coma separados)';
  tagsInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';

  row3.appendChild(impactSel);
  row3.appendChild(tagsInput);

  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Agregar Evento';
  addBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:6px;padding:0.5rem;font-size:0.85rem;cursor:pointer;font-weight:600;';
  addBtn.addEventListener('click', () => {
    const t = titleInput.value.trim();
    if (!t) return;
    addLifeEvent(t, dateInput.value, catSel.value, descTA.value, impactSel.value, tagsInput.value);
    titleInput.value = '';
    descTA.value = '';
    tagsInput.value = '';
    dateInput.value = localDate();
    const listEl = document.getElementById('kairos-eventlog-list');
    if (listEl) renderEventList(listEl, activeFilter);
  });

  form.appendChild(titleInput);
  form.appendChild(row2);
  form.appendChild(descTA);
  form.appendChild(row3);
  form.appendChild(addBtn);
  panel.appendChild(form);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.style.cssText = 'color:#9ca3af;font-size:0.78rem;margin-bottom:0.75rem;';
  const stats = getEventStats();
  statsEl.textContent = `Total: ${stats.total} · Impacto promedio: ${stats.avgImpact}★`;
  panel.appendChild(statsEl);

  // Category filter tabs
  const tabsRow = document.createElement('div');
  tabsRow.style.cssText = 'display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.75rem;';

  function makeTab(label, value) {
    const btn = document.createElement('button');
    btn.style.cssText = `border:1px solid #374151;border-radius:12px;padding:0.15rem 0.5rem;font-size:0.72rem;cursor:pointer;background:${activeFilter === value ? '#4338ca' : 'none'};color:${activeFilter === value ? '#fff' : '#9ca3af'};`;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      activeFilter = value;
      // Update tab styles
      tabsRow.querySelectorAll('button').forEach(b => {
        b.style.background = 'none';
        b.style.color = '#9ca3af';
      });
      btn.style.background = '#4338ca';
      btn.style.color = '#fff';
      const listEl = document.getElementById('kairos-eventlog-list');
      if (listEl) renderEventList(listEl, activeFilter);
    });
    tabsRow.appendChild(btn);
  }

  makeTab('Todos', '');
  CATEGORIES.forEach(c => makeTab(c.charAt(0).toUpperCase() + c.slice(1), c));
  panel.appendChild(tabsRow);

  const listEl = document.createElement('div');
  listEl.id = 'kairos-eventlog-list';
  panel.appendChild(listEl);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Cerrar';
  closeBtn.style.cssText = 'margin-top:1rem;background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 0.8rem;font-size:0.82rem;cursor:pointer;width:100%;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  document.body.appendChild(panel);
  renderEventList(listEl, activeFilter);
}
