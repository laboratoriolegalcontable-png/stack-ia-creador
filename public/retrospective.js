/** retrospective.js — Panel de retrospectivas semanales/sprint · KAIROS browser module */
const RETROS_KEY = 'kairos:retros';

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function loadRetros() { try { return JSON.parse(localStorage.getItem(RETROS_KEY) || '[]'); } catch { return []; } }
function saveRetros(list) { localStorage.setItem(RETROS_KEY, JSON.stringify(list)); }

export function addRetro(period, wentWell, improvements, actionItems) {
  const list = loadRetros();
  const retro = {
    id: `retro-${Date.now()}`,
    date: localDateStr(),
    period: String(period).slice(0, 120),
    wentWell: String(wentWell).slice(0, 2000),
    improvements: String(improvements).slice(0, 2000),
    actionItems: String(actionItems).slice(0, 2000),
    actionsDone: false,
    createdAt: new Date().toISOString(),
  };
  list.unshift(retro);
  saveRetros(list);
  return retro;
}

export function listRetros() {
  return loadRetros().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteRetro(id) {
  saveRetros(loadRetros().filter(r => r.id !== id));
}

export function getRetroStats() {
  const list = loadRetros();
  return { total: list.length, openActions: list.filter(r => !r.actionsDone).length };
}

export function renderRetroPanel() {
  const existing = document.getElementById('kairos-retro-panel');
  if (existing) { existing.remove(); return; }

  const stats = getRetroStats();
  const retros = listRetros();

  const panel = document.createElement('div');
  panel.id = 'kairos-retro-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(520px,95vw);max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem';
  const title = document.createElement('h3');
  title.style.cssText = 'margin:0;color:#a5b4fc;font-size:1rem';
  title.textContent = '🔄 Retrospectivas';
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => panel.remove());
  header.append(title, closeBtn);

  const statsBar = document.createElement('div');
  statsBar.style.cssText = 'display:flex;gap:1rem;margin-bottom:1rem;font-size:0.8rem';
  const s1 = document.createElement('span'); s1.style.color = '#a5b4fc'; s1.textContent = `${stats.total} retros`;
  const s2 = document.createElement('span'); s2.style.color = '#fbbf24'; s2.textContent = `${stats.openActions} con actions abiertas`;
  statsBar.append(s1, s2);

  const form = document.createElement('div');
  form.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:1rem;margin-bottom:1rem;display:flex;flex-direction:column;gap:0.6rem';

  function makeInput(placeholder, multiline = false) {
    const el = multiline ? document.createElement('textarea') : document.createElement('input');
    el.placeholder = placeholder;
    el.style.cssText = `width:100%;box-sizing:border-box;padding:0.5rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem;font-family:inherit${multiline ? ';resize:vertical;min-height:56px' : ''}`;
    return el;
  }

  const inPeriod = makeInput('Período (ej: Sprint 12 / Semana 21)');
  const inWell   = makeInput('Qué salió bien...', true);
  const inImp    = makeInput('Qué mejorar...', true);
  const inAct    = makeInput('Action items (uno por línea)...', true);

  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Guardar retro';
  addBtn.style.cssText = 'padding:0.45rem 1rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.83rem;align-self:flex-start';
  addBtn.addEventListener('click', () => {
    const period = inPeriod.value.trim();
    if (!period) { inPeriod.focus(); return; }
    addRetro(period, inWell.value.trim(), inImp.value.trim(), inAct.value.trim());
    panel.remove();
    renderRetroPanel();
  });

  form.append(inPeriod, inWell, inImp, inAct, addBtn);

  const listEl = document.createElement('div');

  if (retros.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:#6b7280;font-size:0.85rem';
    empty.textContent = 'Sin retrospectivas aún.';
    listEl.appendChild(empty);
  } else {
    retros.forEach(r => {
      const card = document.createElement('details');
      card.style.cssText = 'border:1px solid #374151;border-radius:8px;margin-bottom:0.5rem;background:#0f0f1e;padding:0.1rem 0';

      const summary = document.createElement('summary');
      summary.style.cssText = 'cursor:pointer;padding:0.6rem 0.9rem;display:flex;justify-content:space-between;align-items:center;list-style:none;user-select:none';

      const sumLeft = document.createElement('span');
      sumLeft.style.cssText = 'color:#e5e7eb;font-size:0.86rem;font-weight:600';
      sumLeft.textContent = r.period;

      const sumRight = document.createElement('div');
      sumRight.style.cssText = 'display:flex;gap:0.5rem;align-items:center';
      const dateSpan = document.createElement('span');
      dateSpan.style.cssText = 'color:#6b7280;font-size:0.75rem';
      dateSpan.textContent = r.date;

      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.style.cssText = 'padding:0.2rem 0.4rem;background:#450a0a;color:#f87171;border:none;border-radius:4px;cursor:pointer;font-size:0.72rem';
      delBtn.addEventListener('click', e => { e.preventDefault(); deleteRetro(r.id); panel.remove(); renderRetroPanel(); });
      sumRight.append(dateSpan, delBtn);
      summary.append(sumLeft, sumRight);

      const body = document.createElement('div');
      body.style.cssText = 'padding:0.75rem 0.9rem;display:flex;flex-direction:column;gap:0.5rem';

      function makeSection(label, text, color) {
        const wrap = document.createElement('div');
        const lbl = document.createElement('div');
        lbl.style.cssText = `font-size:0.72rem;font-weight:700;color:${color};margin-bottom:0.2rem;text-transform:uppercase;letter-spacing:0.05em`;
        lbl.textContent = label;
        const val = document.createElement('div');
        val.style.cssText = 'font-size:0.82rem;color:#d1d5db;white-space:pre-wrap;word-break:break-word';
        val.textContent = text || '—';
        wrap.append(lbl, val);
        return wrap;
      }

      body.append(
        makeSection('✅ Qué salió bien', r.wentWell, '#34d399'),
        makeSection('🔧 Qué mejorar', r.improvements, '#fbbf24'),
        makeSection('🎯 Action items', r.actionItems, '#60a5fa'),
      );
      card.append(summary, body);
      listEl.appendChild(card);
    });
  }

  panel.append(header, statsBar, form, listEl);
  document.body.appendChild(panel);
}
