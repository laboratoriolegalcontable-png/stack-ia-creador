/** decision-journal.js — Diario de decisiones importantes · KAIROS browser module */
const DJ_KEY = 'kairos:decisions';

function loadDecisions() { try { const d = JSON.parse(localStorage.getItem(DJ_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveDecisions(list) { localStorage.setItem(DJ_KEY, JSON.stringify(list)); }

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function addDecision(title, context, options, chosen, rationale, expectedOutcome) {
  const list = loadDecisions();
  const entry = {
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
    title: String(title).slice(0, 200),
    context: String(context).slice(0, 2000),
    options: Array.isArray(options) ? options.map(o => String(o).slice(0,200)) : [],
    chosen: String(chosen).slice(0, 200),
    rationale: String(rationale).slice(0, 2000),
    expectedOutcome: String(expectedOutcome).slice(0, 1000),
    actualOutcome: '',
    status: 'pending',
    date: localDateStr(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  saveDecisions(list);
  return entry;
}

export function resolveDecision(id, actualOutcome) {
  const list = loadDecisions();
  const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return null;
  list[idx].actualOutcome = String(actualOutcome).slice(0, 1000);
  list[idx].status = 'resolved';
  list[idx].resolvedAt = new Date().toISOString();
  saveDecisions(list);
  return list[idx];
}

export function listDecisions(filter = 'all') {
  const all = loadDecisions();
  return filter === 'all' ? all : all.filter(d => d.status === filter);
}

export function deleteDecision(id) {
  saveDecisions(loadDecisions().filter(d => d.id !== id));
}

export function getDecisionStats() {
  const all = loadDecisions();
  return { total: all.length, pending: all.filter(d => d.status === 'pending').length, resolved: all.filter(d => d.status === 'resolved').length };
}

export function renderDecisionPanel() {
  const existing = document.getElementById('kairos-decision-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'kairos-decision-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(560px,95vw);max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem';
  const title = document.createElement('h3'); title.style.cssText = 'margin:0;color:#a5b4fc;font-size:1rem'; title.textContent = '🧭 Decision Journal';
  const closeBtn = document.createElement('button'); closeBtn.style.cssText = 'background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem'; closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => panel.remove());
  header.append(title, closeBtn);

  const statsBar = document.createElement('div');
  statsBar.style.cssText = 'display:flex;gap:1rem;margin-bottom:1rem;font-size:0.8rem';
  function refreshStats() {
    statsBar.innerHTML = '';
    const st = getDecisionStats();
    const s1 = document.createElement('span'); s1.style.color = '#a5b4fc'; s1.textContent = `${st.total} decisiones`;
    const s2 = document.createElement('span'); s2.style.color = '#fbbf24'; s2.textContent = `${st.pending} pendientes`;
    const s3 = document.createElement('span'); s3.style.color = '#34d399'; s3.textContent = `${st.resolved} resueltas`;
    statsBar.append(s1, s2, s3);
  }
  refreshStats();

  let currentFilter = 'all';
  const tabRow = document.createElement('div');
  tabRow.style.cssText = 'display:flex;gap:0.4rem;margin-bottom:0.9rem';
  ['all','pending','resolved'].forEach(f => {
    const btn = document.createElement('button');
    btn.textContent = f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Resueltas';
    btn.style.cssText = `padding:0.3rem 0.7rem;border:1px solid #374151;border-radius:5px;cursor:pointer;font-size:0.78rem;background:${currentFilter===f?'#4338ca':'#0f0f1e'};color:${currentFilter===f?'#fff':'#9ca3af'}`;
    btn.addEventListener('click', () => { currentFilter = f; renderList(); tabRow.querySelectorAll('button').forEach((b,i) => { b.style.background = ['all','pending','resolved'][i]===f?'#4338ca':'#0f0f1e'; b.style.color = ['all','pending','resolved'][i]===f?'#fff':'#9ca3af'; }); });
    tabRow.appendChild(btn);
  });

  const form = document.createElement('div');
  form.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.9rem;margin-bottom:0.9rem;display:flex;flex-direction:column;gap:0.5rem';
  function inp(ph) { const i = document.createElement('input'); i.placeholder = ph; i.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem'; return i; }
  function ta(ph) { const t = document.createElement('textarea'); t.placeholder = ph; t.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem;resize:vertical;min-height:48px;font-family:inherit'; return t; }
  const inTitle = inp('Decisión (ej: Cambiar de stack a TypeScript)');
  const inContext = ta('Contexto / situación...');
  const inOptions = inp('Opciones consideradas (separadas por ,)');
  const inChosen = inp('Opción elegida...');
  const inRationale = ta('Justificación...');
  const inExpected = inp('Resultado esperado...');
  const addBtn = document.createElement('button'); addBtn.textContent = '+ Registrar decisión';
  addBtn.style.cssText = 'padding:0.4rem 1rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem;align-self:flex-start';
  addBtn.addEventListener('click', () => {
    if (!inTitle.value.trim()) { inTitle.focus(); return; }
    const options = inOptions.value.split(',').map(s => s.trim()).filter(Boolean);
    addDecision(inTitle.value.trim(), inContext.value.trim(), options, inChosen.value.trim(), inRationale.value.trim(), inExpected.value.trim());
    [inTitle, inContext, inOptions, inChosen, inRationale, inExpected].forEach(el => { el.value = ''; });
    refreshStats(); renderList();
  });
  form.append(inTitle, inContext, inOptions, inChosen, inRationale, inExpected, addBtn);

  const listEl = document.createElement('div');

  function renderList() {
    listEl.innerHTML = '';
    const decisions = listDecisions(currentFilter);
    if (!decisions.length) {
      const e = document.createElement('p'); e.style.cssText = 'color:#6b7280;font-size:0.85rem'; e.textContent = 'Sin decisiones registradas.'; listEl.appendChild(e); return;
    }
    decisions.forEach(d => {
      const card = document.createElement('details');
      card.style.cssText = 'border:1px solid #374151;border-radius:8px;margin-bottom:0.5rem;background:#0f0f1e';
      const summary = document.createElement('summary');
      summary.style.cssText = 'cursor:pointer;padding:0.6rem 0.9rem;display:flex;justify-content:space-between;align-items:center;list-style:none;user-select:none';
      const left = document.createElement('span'); left.style.cssText = 'color:#e5e7eb;font-size:0.86rem;font-weight:600'; left.textContent = d.title;
      const right = document.createElement('div'); right.style.cssText = 'display:flex;gap:0.4rem;align-items:center';
      const badge = document.createElement('span');
      badge.style.cssText = `font-size:0.68rem;padding:0.15rem 0.35rem;border-radius:4px;font-weight:700;background:${d.status==='resolved'?'#065f46':'#78350f'};color:${d.status==='resolved'?'#34d399':'#fbbf24'}`;
      badge.textContent = d.status === 'resolved' ? '✓ Resuelta' : '⏳ Pendiente';
      const dateEl = document.createElement('span'); dateEl.style.cssText = 'color:#6b7280;font-size:0.72rem'; dateEl.textContent = d.date;
      const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.style.cssText = 'padding:0.2rem 0.35rem;background:#450a0a;color:#f87171;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem';
      delBtn.addEventListener('click', ev => { ev.preventDefault(); deleteDecision(d.id); refreshStats(); renderList(); });
      right.append(badge, dateEl, delBtn);
      summary.append(left, right);

      const body = document.createElement('div');
      body.style.cssText = 'padding:0.7rem 0.9rem;display:flex;flex-direction:column;gap:0.4rem;font-size:0.82rem';
      function row(label, text, color) {
        const w = document.createElement('div');
        const l = document.createElement('span'); l.style.cssText = `font-size:0.7rem;font-weight:700;color:${color};text-transform:uppercase;margin-right:0.4rem`; l.textContent = label + ':';
        const v = document.createElement('span'); v.style.color = '#d1d5db'; v.textContent = text || '—';
        w.append(l, v); return w;
      }
      body.append(
        row('Contexto', d.context, '#a5b4fc'),
        row('Opciones', d.options.join(' / ') || '—', '#fbbf24'),
        row('Elegida', d.chosen, '#34d399'),
        row('Justificación', d.rationale, '#60a5fa'),
        row('Resultado esperado', d.expectedOutcome, '#c084fc'),
      );
      if (d.status === 'resolved') {
        body.appendChild(row('Resultado real', d.actualOutcome, '#34d399'));
      } else {
        const resolveRow = document.createElement('div'); resolveRow.style.cssText = 'display:flex;gap:0.4rem;margin-top:0.3rem';
        const rInp = document.createElement('input'); rInp.placeholder = 'Resultado real...'; rInp.style.cssText = 'flex:1;padding:0.35rem;background:#0f0f1e;border:1px solid #374151;border-radius:5px;color:#e5e7eb;font-size:0.78rem';
        const rBtn = document.createElement('button'); rBtn.textContent = 'Resolver'; rBtn.style.cssText = 'padding:0.3rem 0.7rem;background:#065f46;color:#34d399;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem';
        rBtn.addEventListener('click', () => { if (!rInp.value.trim()) return; resolveDecision(d.id, rInp.value.trim()); refreshStats(); renderList(); });
        resolveRow.append(rInp, rBtn);
        body.appendChild(resolveRow);
      }
      card.append(summary, body);
      listEl.appendChild(card);
    });
  }

  renderList();
  panel.append(header, statsBar, tabRow, form, listEl);
  document.body.appendChild(panel);
}
