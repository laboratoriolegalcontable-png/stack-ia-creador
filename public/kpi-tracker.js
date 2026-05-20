/**
 * kpi-tracker.js — KPI Tracker (KAIROS)
 * key: kairos:kpis
 * @module kpi-tracker
 */

const KEY = 'kairos:kpis';

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

export function addKpi(name, unit, target, period) {
  const kpis = load();
  const kpi = {
    id: uid(),
    name: String(name).trim(),
    unit: String(unit).trim(),
    target: parseFloat(target) || 0,
    period: period || 'monthly',
    entries: [],
    createdAt: new Date().toISOString()
  };
  kpis.push(kpi);
  save(kpis);
  return kpi;
}

export function addKpiEntry(kpiId, value, date) {
  const kpis = load();
  const kpi = kpis.find(k => k.id === kpiId);
  if (!kpi) return null;
  const entry = {
    id: uid(),
    date: date || localDate(),
    value: parseFloat(value) || 0,
    createdAt: new Date().toISOString()
  };
  kpi.entries.push(entry);
  save(kpis);
  return entry;
}

export function deleteKpi(id) {
  const kpis = load().filter(k => k.id !== id);
  save(kpis);
}

export function getKpiStats() {
  const kpis = load();
  let onTarget = 0;
  let totalAchievement = 0;
  let achievementCount = 0;
  for (const kpi of kpis) {
    if (kpi.entries.length === 0) continue;
    const latest = kpi.entries[kpi.entries.length - 1];
    const pct = kpi.target > 0 ? (latest.value / kpi.target) * 100 : 100;
    totalAchievement += pct;
    achievementCount++;
    if (pct >= 100) onTarget++;
  }
  return {
    total: kpis.length,
    onTarget,
    avgAchievement: achievementCount > 0 ? Math.round(totalAchievement / achievementCount) : 0
  };
}

function renderKpiList() {
  const container = document.getElementById('kairos-kpi-list');
  if (!container) return;
  container.innerHTML = '';
  const kpis = load();
  if (kpis.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '0.85rem';
    empty.textContent = 'No hay KPIs. Agrega uno arriba.';
    container.appendChild(empty);
    return;
  }
  for (const kpi of kpis) {
    const latest = kpi.entries.length > 0 ? kpi.entries[kpi.entries.length - 1] : null;
    const latestValue = latest ? latest.value : null;
    const onTarget = latestValue !== null && kpi.target > 0 ? latestValue >= kpi.target : false;
    const pct = latestValue !== null && kpi.target > 0 ? Math.round((latestValue / kpi.target) * 100) : null;

    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937;border:1px solid #374151;border-radius:8px;padding:0.85rem;margin-bottom:0.6rem;';

    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;';

    const nameEl = document.createElement('span');
    nameEl.style.cssText = 'font-weight:600;color:#e5e7eb;font-size:0.88rem;';
    nameEl.textContent = kpi.name;

    const badge = document.createElement('span');
    badge.style.cssText = `font-size:0.75rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:12px;${latestValue !== null ? (onTarget ? 'background:#064e3b;color:#6ee7b7;' : 'background:#7f1d1d;color:#fca5a5;') : 'background:#374151;color:#9ca3af;'}`;
    if (latestValue !== null) {
      badge.textContent = `${latestValue} ${kpi.unit}${pct !== null ? ' · ' + pct + '%' : ''}`;
    } else {
      badge.textContent = 'Sin datos';
    }

    headerRow.appendChild(nameEl);
    headerRow.appendChild(badge);
    card.appendChild(headerRow);

    const metaEl = document.createElement('div');
    metaEl.style.cssText = 'color:#6b7280;font-size:0.75rem;margin-bottom:0.6rem;';
    metaEl.textContent = `Meta: ${kpi.target} ${kpi.unit} · Período: ${kpi.period}`;
    card.appendChild(metaEl);

    // Entry form
    const entryRow = document.createElement('div');
    entryRow.style.cssText = 'display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap;';

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.placeholder = 'Valor';
    valueInput.style.cssText = 'width:90px;background:#111827;border:1px solid #374151;color:#e5e7eb;border-radius:4px;padding:0.25rem 0.4rem;font-size:0.8rem;';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = localDate();
    dateInput.style.cssText = 'background:#111827;border:1px solid #374151;color:#e5e7eb;border-radius:4px;padding:0.25rem 0.4rem;font-size:0.8rem;';

    const addEntryBtn = document.createElement('button');
    addEntryBtn.textContent = '+ Entrada';
    addEntryBtn.style.cssText = 'background:#1d4ed8;color:#fff;border:none;border-radius:4px;padding:0.25rem 0.5rem;font-size:0.78rem;cursor:pointer;';
    addEntryBtn.addEventListener('click', () => {
      const v = valueInput.value.trim();
      if (!v) return;
      addKpiEntry(kpi.id, v, dateInput.value);
      valueInput.value = '';
      renderKpiList();
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.style.cssText = 'background:none;border:1px solid #7f1d1d;color:#fca5a5;border-radius:4px;padding:0.25rem 0.4rem;font-size:0.78rem;cursor:pointer;margin-left:auto;';
    delBtn.addEventListener('click', () => {
      if (confirm(`¿Eliminar KPI "${kpi.name}"?`)) {
        deleteKpi(kpi.id);
        renderKpiList();
      }
    });

    entryRow.appendChild(valueInput);
    entryRow.appendChild(dateInput);
    entryRow.appendChild(addEntryBtn);
    entryRow.appendChild(delBtn);
    card.appendChild(entryRow);

    container.appendChild(card);
  }
}

export function renderKpiPanel() {
  let panel = document.getElementById('kairos-kpi-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') renderKpiList();
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-kpi-panel';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:400px;max-width:95vw;max-height:80vh;overflow-y:auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:1.25rem;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'margin:0 0 1rem;color:#a5b4fc;font-size:1rem;';
  titleEl.textContent = '📊 KPI Tracker';
  panel.appendChild(titleEl);

  // Add KPI form
  const form = document.createElement('div');
  form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #374151;';

  const nameInput = document.createElement('input');
  nameInput.placeholder = 'Nombre del KPI...';
  nameInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.7rem;font-size:0.85rem;';

  const row2 = document.createElement('div');
  row2.style.cssText = 'display:flex;gap:0.5rem;';

  const unitInput = document.createElement('input');
  unitInput.placeholder = 'Unidad (ej. %, $, clientes)';
  unitInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';

  const targetInput = document.createElement('input');
  targetInput.type = 'number';
  targetInput.placeholder = 'Meta';
  targetInput.style.cssText = 'width:90px;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';

  row2.appendChild(unitInput);
  row2.appendChild(targetInput);

  const periodSel = document.createElement('select');
  periodSel.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.5rem;font-size:0.82rem;';
  ['daily','weekly','monthly','quarterly'].forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p.charAt(0).toUpperCase() + p.slice(1);
    periodSel.appendChild(opt);
  });
  periodSel.value = 'monthly';

  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Agregar KPI';
  addBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:6px;padding:0.5rem;font-size:0.85rem;cursor:pointer;font-weight:600;';
  addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    addKpi(name, unitInput.value, targetInput.value, periodSel.value);
    nameInput.value = '';
    unitInput.value = '';
    targetInput.value = '';
    renderKpiList();
  });

  form.appendChild(nameInput);
  form.appendChild(row2);
  form.appendChild(periodSel);
  form.appendChild(addBtn);
  panel.appendChild(form);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.style.cssText = 'color:#9ca3af;font-size:0.78rem;margin-bottom:0.75rem;';
  const stats = getKpiStats();
  statsEl.textContent = `Total: ${stats.total} · En meta: ${stats.onTarget} · Logro promedio: ${stats.avgAchievement}%`;
  panel.appendChild(statsEl);

  const listEl = document.createElement('div');
  listEl.id = 'kairos-kpi-list';
  panel.appendChild(listEl);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Cerrar';
  closeBtn.style.cssText = 'margin-top:1rem;background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 0.8rem;font-size:0.82rem;cursor:pointer;width:100%;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  document.body.appendChild(panel);
  renderKpiList();
}
