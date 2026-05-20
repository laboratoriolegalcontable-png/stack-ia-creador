/**
 * reflection-journal.js — Reflection Journal (KAIROS)
 * key: kairos:reflections
 * @module reflection-journal
 */

const KEY = 'kairos:reflections';

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

export function addReflection(date, type, wentWell, improve, gratitude, intention, mood) {
  const reflections = load();
  const reflection = {
    id: uid(),
    date: date || localDate(),
    type: ['daily','weekly','monthly'].includes(type) ? type : 'daily',
    wentWell: String(wentWell || '').trim(),
    improve: String(improve || '').trim(),
    gratitude: String(gratitude || '').trim(),
    intention: String(intention || '').trim(),
    mood: Math.min(5, Math.max(1, parseInt(mood, 10) || 3)),
    createdAt: new Date().toISOString()
  };
  reflections.push(reflection);
  save(reflections);
  return reflection;
}

export function deleteReflection(id) {
  const reflections = load().filter(r => r.id !== id);
  save(reflections);
}

export function getReflectionStats() {
  const reflections = load();
  if (reflections.length === 0) return { total: 0, streak: 0, avgMood: 0 };

  // Sort by date desc
  const sorted = [...reflections].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  // Calculate streak (consecutive daily entries from today)
  const today = localDate();
  let streak = 0;
  const dateSet = new Set(reflections.map(r => r.date));
  let cursor = new Date(today);
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const totalMood = reflections.reduce((sum, r) => sum + r.mood, 0);
  const avgMood = Math.round((totalMood / reflections.length) * 10) / 10;

  return { total: reflections.length, streak, avgMood };
}

function renderReflectionList(container) {
  container.innerHTML = '';
  const reflections = load()
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
    .slice(0, 10);

  if (reflections.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '0.85rem';
    empty.textContent = 'No hay reflexiones. Escribe tu primera entrada arriba.';
    container.appendChild(empty);
    return;
  }

  const TYPE_COLORS = { daily: '#4338ca', weekly: '#059669', monthly: '#d97706' };

  for (const r of reflections) {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937;border:1px solid #374151;border-radius:8px;padding:0.85rem;margin-bottom:0.6rem;';

    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem;';

    const dateTypeWrap = document.createElement('div');
    dateTypeWrap.style.cssText = 'display:flex;gap:0.4rem;align-items:center;';

    const dateEl = document.createElement('span');
    dateEl.style.cssText = 'color:#e5e7eb;font-weight:600;font-size:0.85rem;';
    dateEl.textContent = r.date;

    const typeBadge = document.createElement('span');
    const tc = TYPE_COLORS[r.type] || '#374151';
    typeBadge.style.cssText = `font-size:0.7rem;padding:0.1rem 0.4rem;border-radius:10px;background:${tc};color:#fff;font-weight:600;`;
    typeBadge.textContent = r.type;

    dateTypeWrap.appendChild(dateEl);
    dateTypeWrap.appendChild(typeBadge);

    const moodEl = document.createElement('span');
    moodEl.style.cssText = 'color:#fbbf24;font-size:0.85rem;';
    moodEl.textContent = '★'.repeat(r.mood) + '☆'.repeat(5 - r.mood);

    headerRow.appendChild(dateTypeWrap);
    headerRow.appendChild(moodEl);
    card.appendChild(headerRow);

    const fields = [
      { label: '✅ ¿Qué salió bien?', value: r.wentWell },
      { label: '📈 ¿Qué mejorar?', value: r.improve },
      { label: '🙏 Agradecimiento', value: r.gratitude },
      { label: '🎯 Intención para mañana', value: r.intention }
    ];

    for (const f of fields) {
      if (!f.value) continue;
      const fieldWrap = document.createElement('div');
      fieldWrap.style.cssText = 'margin-bottom:0.35rem;';
      const labelEl = document.createElement('div');
      labelEl.style.cssText = 'color:#6b7280;font-size:0.72rem;font-weight:600;margin-bottom:0.1rem;';
      labelEl.textContent = f.label;
      const valEl = document.createElement('div');
      valEl.style.cssText = 'color:#d1d5db;font-size:0.82rem;';
      valEl.textContent = f.value;
      fieldWrap.appendChild(labelEl);
      fieldWrap.appendChild(valEl);
      card.appendChild(fieldWrap);
    }

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.style.cssText = 'margin-top:0.5rem;background:none;border:1px solid #7f1d1d;color:#fca5a5;border-radius:4px;padding:0.15rem 0.4rem;font-size:0.72rem;cursor:pointer;';
    delBtn.addEventListener('click', () => {
      if (confirm('¿Eliminar esta reflexión?')) {
        deleteReflection(r.id);
        renderReflectionList(container);
      }
    });
    card.appendChild(delBtn);

    container.appendChild(card);
  }
}

export function renderReflectionPanel() {
  let panel = document.getElementById('kairos-reflection-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const listEl = document.getElementById('kairos-reflection-list');
      if (listEl) renderReflectionList(listEl);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-reflection-panel';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:440px;max-width:95vw;max-height:82vh;overflow-y:auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:1.25rem;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'margin:0 0 1rem;color:#a5b4fc;font-size:1rem;';
  titleEl.textContent = '🪞 Reflection Journal';
  panel.appendChild(titleEl);

  // Form
  const form = document.createElement('div');
  form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #374151;';

  const row1 = document.createElement('div');
  row1.style.cssText = 'display:flex;gap:0.5rem;';

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = localDate();
  dateInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';

  const typeSel = document.createElement('select');
  typeSel.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';
  ['daily','weekly','monthly'].forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    typeSel.appendChild(opt);
  });

  row1.appendChild(dateInput);
  row1.appendChild(typeSel);
  form.appendChild(row1);

  function makeTextarea(placeholder) {
    const ta = document.createElement('textarea');
    ta.placeholder = placeholder;
    ta.rows = 2;
    ta.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.7rem;font-size:0.82rem;resize:vertical;';
    return ta;
  }

  const wentWellTA  = makeTextarea('¿Qué salió bien?');
  const improveTA   = makeTextarea('¿Qué mejorar?');
  const gratitudeTA = makeTextarea('Agradecimiento');
  const intentionTA = makeTextarea('Intención para mañana');

  const moodSel = document.createElement('select');
  moodSel.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';
  [1,2,3,4,5].forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = `Estado de ánimo ${n} ${'★'.repeat(n)}`;
    if (n === 3) opt.selected = true;
    moodSel.appendChild(opt);
  });

  form.appendChild(wentWellTA);
  form.appendChild(improveTA);
  form.appendChild(gratitudeTA);
  form.appendChild(intentionTA);
  form.appendChild(moodSel);

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Guardar Reflexión';
  saveBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:6px;padding:0.5rem;font-size:0.85rem;cursor:pointer;font-weight:600;';
  saveBtn.addEventListener('click', () => {
    const ww = wentWellTA.value.trim();
    const im = improveTA.value.trim();
    const gr = gratitudeTA.value.trim();
    const it = intentionTA.value.trim();
    if (!ww && !im && !gr && !it) return;
    addReflection(dateInput.value, typeSel.value, ww, im, gr, it, moodSel.value);
    wentWellTA.value = '';
    improveTA.value = '';
    gratitudeTA.value = '';
    intentionTA.value = '';
    dateInput.value = localDate();
    // Update stats
    const stats = getReflectionStats();
    statsEl.textContent = `Total: ${stats.total} · Racha: ${stats.streak} días · Estado de ánimo promedio: ${stats.avgMood}★`;
    const listEl = document.getElementById('kairos-reflection-list');
    if (listEl) renderReflectionList(listEl);
  });

  form.appendChild(saveBtn);
  panel.appendChild(form);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.style.cssText = 'color:#9ca3af;font-size:0.78rem;margin-bottom:0.75rem;';
  const stats = getReflectionStats();
  statsEl.textContent = `Total: ${stats.total} · Racha: ${stats.streak} días · Estado de ánimo promedio: ${stats.avgMood}★`;
  panel.appendChild(statsEl);

  const listEl = document.createElement('div');
  listEl.id = 'kairos-reflection-list';
  panel.appendChild(listEl);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Cerrar';
  closeBtn.style.cssText = 'margin-top:1rem;background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 0.8rem;font-size:0.82rem;cursor:pointer;width:100%;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  document.body.appendChild(panel);
  renderReflectionList(listEl);
}
