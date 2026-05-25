/** okr-tracker.js — OKR Tracker · KAIROS browser module */
const OKR_KEY = 'kairos:okrs';

// ── New panel (batch37 pattern) ────────────────────────────────────────────
const KEY = 'kairos:okrs';
function _load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function _save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function _uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
function _now() { return new Date().toISOString(); }

const STATUS_COLORS = { 'not-started': 'gray', 'on-track': 'green', 'at-risk': 'blue', 'behind': 'red', 'completed': 'green', 'cancelled': 'red' };
const CYCLE_ORDER = { Q1: 0, Q2: 1, Q3: 2, Q4: 3, annual: 4, custom: 5 };

export function renderOkrTracker() {
  let panel = document.getElementById('okr-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _ot_refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'okr-tracker-panel';
  panel.className = 'ia-panel';
  const yr = new Date().getFullYear();
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🎯 OKR Tracker</h2><button class="ia-close" onclick="document.getElementById('okr-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ot-form" class="ia-form">
        <input id="ot-title" placeholder="Objetivo *" required />
        <div style="display:flex;gap:8px">
          <select id="ot-cycle" style="flex:1">
            <option value="Q1">Q1</option><option value="Q2" selected>Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option><option value="annual">Annual</option><option value="custom">Custom</option>
          </select>
          <input id="ot-year" type="number" value="${yr}" style="flex:1;width:80px" />
        </div>
        <input id="ot-owner" placeholder="Owner *" required />
        <input id="ot-description" placeholder="Descripción (opcional)" />
        <input id="ot-tags" placeholder="Tags (separados por coma)" />
        <button type="submit" class="ia-btn">Agregar objetivo</button>
      </form>
      <div id="ot-stats" class="ia-stats-bar"></div>
      <div id="ot-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ot-form').onsubmit = e => {
    e.preventDefault();
    const items = _load();
    items.push({
      id: _uid(),
      title: document.getElementById('ot-title').value.trim(),
      cycle: document.getElementById('ot-cycle').value,
      year: Number(document.getElementById('ot-year').value) || yr,
      owner: document.getElementById('ot-owner').value.trim(),
      description: document.getElementById('ot-description').value.trim(),
      tags: document.getElementById('ot-tags').value.split(',').map(s => s.trim()).filter(Boolean),
      status: 'not-started',
      keyResults: [],
      createdAt: _now()
    });
    _save(items);
    e.target.reset();
    document.getElementById('ot-cycle').value = 'Q2';
    document.getElementById('ot-year').value = yr;
    _ot_refresh();
  };
  _ot_refresh();
}

function _ot_refresh() {
  const all = _load();
  const stats = document.getElementById('ot-stats');
  const list = document.getElementById('ot-list');
  if (!stats || !list) return;
  const onTrack = all.filter(o => o.status === 'on-track').length;
  const completed = all.filter(o => o.status === 'completed').length;
  const totalKRs = all.reduce((s, o) => s + (o.keyResults?.length || 0), 0);
  stats.textContent = 'Total: ' + all.length + ' | On track: ' + onTrack + ' | Completed: ' + completed + ' | Total KRs: ' + totalKRs;
  list.innerHTML = '';
  const sorted = [...all].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return (CYCLE_ORDER[a.cycle] ?? 99) - (CYCLE_ORDER[b.cycle] ?? 99);
  });
  sorted.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const stColor = STATUS_COLORS[item.status] || 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge gray"></span><span class="ia-badge ' + stColor + '"></span><button class="ia-btn-sm blue">+ KR</button><button class="ia-btn-sm red">✕</button></div><div class="ot-kr-list"></div>';
    el.querySelector('strong').textContent = item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.owner;
    badges[1].textContent = item.cycle + ' ' + item.year;
    badges[2].textContent = item.status;
    const [addKrBtn, delBtn] = el.querySelectorAll('button');
    addKrBtn.onclick = () => {
      const raw = window.prompt('KR description|target|unit (ej: "Active users|1000|users"):');
      if (!raw?.trim()) return;
      const parts = raw.split('|').map(s => s.trim());
      const [description, target, unit] = parts;
      if (!description) return;
      const d = _load(); const r = d.find(x => x.id === item.id);
      if (r) {
        r.keyResults.push({ id: _uid(), description, target: Number(target) || 0, current: 0, unit: unit || '', status: 'not-started' });
        _save(d); _ot_refresh();
      }
    };
    delBtn.onclick = () => { _save(_load().filter(x => x.id !== item.id)); _ot_refresh(); };
    const krDiv = el.querySelector('.ot-kr-list');
    (item.keyResults || []).forEach(kr => {
      const krEl = document.createElement('div');
      krEl.style.cssText = 'font-size:0.8rem;color:var(--color-text-muted,#9ca3af);padding:2px 0;cursor:pointer';
      krEl.textContent = '• ' + kr.description + ': ' + kr.current + '/' + kr.target + ' ' + kr.unit + ' [' + kr.status + ']';
      krEl.onclick = () => {
        const val = window.prompt('Nuevo valor actual para "' + kr.description + '":');
        if (val === null || val.trim() === '') return;
        const d = _load(); const r = d.find(x => x.id === item.id);
        if (r) { const k = r.keyResults.find(x => x.id === kr.id); if (k) { k.current = Number(val) || 0; _save(d); _ot_refresh(); } }
      };
      krDiv.appendChild(krEl);
    });
    list.appendChild(el);
  });
}
// ── End batch37 panel ────────────────────────────────────────────────────

function loadOkrs() { try { const d = JSON.parse(localStorage.getItem(OKR_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveOkrs(list) { localStorage.setItem(OKR_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function createOkr(objective, quarter) {
  const list = loadOkrs();
  const okr = { id: uid(), objective: objective.trim(), quarter: quarter.trim(), keyResults: [], createdAt: localDate() };
  list.unshift(okr);
  saveOkrs(list);
  return okr;
}

export function addKeyResult(okrId, description) {
  const list = loadOkrs();
  const okr = list.find(o => o.id === okrId);
  if (!okr) return null;
  const kr = { id: uid(), description: description.trim(), progress: 0, status: 'on-track' };
  okr.keyResults.push(kr);
  saveOkrs(list);
  return kr;
}

export function updateKeyResult(okrId, krId, progress, status) {
  const list = loadOkrs();
  const okr = list.find(o => o.id === okrId);
  if (!okr) return false;
  const kr = okr.keyResults.find(k => k.id === krId);
  if (!kr) return false;
  kr.progress = Math.min(100, Math.max(0, +progress || 0));
  kr.status = ['on-track','at-risk','off-track','done'].includes(status) ? status : 'on-track';
  saveOkrs(list);
  return true;
}

export function deleteOkr(id) {
  const list = loadOkrs();
  const idx = list.findIndex(o => o.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveOkrs(list);
  return true;
}

export function getOkrStats() {
  const list = loadOkrs();
  if (!list.length) return { total: 0, avgProgress: 0, done: 0, atRisk: 0 };
  let totalProgress = 0; let progressCount = 0; let done = 0; let atRisk = 0;
  list.forEach(o => {
    if (o.keyResults.length) {
      const avg = o.keyResults.reduce((a, k) => a + k.progress, 0) / o.keyResults.length;
      totalProgress += avg; progressCount++;
    }
    if (o.keyResults.every(k => k.status === 'done')) done++;
    if (o.keyResults.some(k => k.status === 'at-risk' || k.status === 'off-track')) atRisk++;
  });
  return { total: list.length, avgProgress: progressCount ? +(totalProgress/progressCount).toFixed(1) : 0, done, atRisk };
}

export function renderOkrPanel() {
  let panel = document.getElementById('kairos-okr-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const activeBtn = panel.querySelector('.filter-tabs button.active');
      const f = activeBtn?.dataset.filter;
      renderOkrList(f && f !== 'all' ? f : undefined);
    }
    return;
  }
  panel = document.createElement('section');
  panel.id = 'kairos-okr-panel';
  panel.className = 'kairos-panel';

  const h2 = document.createElement('h2'); h2.textContent = '🎯 OKR Tracker'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'okr-stats'; panel.appendChild(statsEl);

  // OKR creation form
  const form = document.createElement('form'); form.id = 'okr-form';
  const objIn = document.createElement('input'); objIn.type = 'text'; objIn.placeholder = 'Objetivo (ej: Crecer audiencia)'; objIn.required = true;
  const qtrIn = document.createElement('input'); qtrIn.type = 'text'; qtrIn.placeholder = 'Trimestre (ej: Q1-2025)'; qtrIn.required = true;
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ OKR';
  form.append(objIn, qtrIn, addBtn);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ob = objIn.value.trim(); const qt = qtrIn.value.trim();
    if (!ob || !qt) return;
    createOkr(ob, qt);
    objIn.value = ''; qtrIn.value = '';
    const activeBtn = panel.querySelector('.filter-tabs button.active');
    const f = activeBtn?.dataset.filter;
    renderOkrList(f && f !== 'all' ? f : undefined);
  });
  panel.appendChild(form);

  // Filter by quarter
  const tabs = document.createElement('div'); tabs.className = 'filter-tabs'; tabs.id = 'okr-tabs';
  panel.appendChild(tabs);

  const listEl = document.createElement('div'); listEl.id = 'okr-list'; panel.appendChild(listEl);

  const closeBtn = document.createElement('button'); closeBtn.textContent = '✕ Cerrar'; closeBtn.className = 'close-btn';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderOkrList();
}

function renderOkrList(filterQtr) {
  const listEl = document.getElementById('okr-list');
  const statsEl = document.getElementById('okr-stats');
  const panel = document.getElementById('kairos-okr-panel');
  if (!listEl) return;
  const stats = getOkrStats();
  if (statsEl) { statsEl.textContent = `Total: ${stats.total} · Progreso avg: ${stats.avgProgress}% · Completados: ${stats.done} · En riesgo: ${stats.atRisk}`; }

  // Rebuild filter tabs
  const tabs = panel?.querySelector('#okr-tabs');
  if (tabs) {
    const quarters = ['all', ...new Set(loadOkrs().map(o => o.quarter))];
    tabs.innerHTML = '';
    quarters.forEach(q => {
      const btn = document.createElement('button'); btn.textContent = q; btn.dataset.filter = q;
      if (q === (filterQtr || 'all')) btn.classList.add('active');
      btn.addEventListener('click', () => {
        tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderOkrList(q === 'all' ? undefined : q);
      });
      tabs.appendChild(btn);
    });
  }

  let list = loadOkrs();
  if (filterQtr) list = list.filter(o => o.quarter === filterQtr);
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay OKRs.'; listEl.appendChild(em); return; }

  list.forEach(okr => {
    const card = document.createElement('div'); card.className = 'kairos-card';

    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const objEl = document.createElement('strong'); objEl.textContent = okr.objective;
    const qtrBadge = document.createElement('span'); qtrBadge.className = 'badge'; qtrBadge.textContent = okr.quarter;
    top.append(objEl, qtrBadge);
    card.appendChild(top);

    // Progress summary
    const avgProgress = okr.keyResults.length ? Math.round(okr.keyResults.reduce((a, k) => a + k.progress, 0) / okr.keyResults.length) : 0;
    const progRow = document.createElement('div');
    const progLabel = document.createElement('small'); progLabel.textContent = `Progreso: ${avgProgress}% · KRs: ${okr.keyResults.length}`;
    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'background:#1f2937;border-radius:4px;height:8px;width:160px;display:inline-block;overflow:hidden;margin-left:8px;vertical-align:middle;';
    const barFill = document.createElement('div');
    barFill.style.cssText = `height:100%;width:${avgProgress}%;background:${avgProgress >= 100 ? '#10b981' : avgProgress >= 60 ? '#6366f1' : avgProgress >= 30 ? '#f59e0b' : '#ef4444'};border-radius:4px;`;
    barWrap.appendChild(barFill);
    progRow.append(progLabel, barWrap);
    card.appendChild(progRow);

    // Collapsible KR list
    const krSection = document.createElement('div'); krSection.className = 'kr-section';
    const toggleBtn = document.createElement('button'); toggleBtn.type = 'button'; toggleBtn.className = 'small-btn';
    toggleBtn.textContent = `▶ Key Results (${okr.keyResults.length})`;
    const krList = document.createElement('div'); krList.style.display = 'none';
    toggleBtn.addEventListener('click', () => {
      krList.style.display = krList.style.display === 'none' ? 'block' : 'none';
      toggleBtn.textContent = (krList.style.display === 'none' ? '▶' : '▼') + ` Key Results (${okr.keyResults.length})`;
    });
    krSection.appendChild(toggleBtn);

    okr.keyResults.forEach(kr => {
      const krCard = document.createElement('div'); krCard.className = 'kairos-card'; krCard.style.margin = '4px 0';
      const krDesc = document.createElement('span'); krDesc.textContent = kr.description;
      krCard.appendChild(krDesc);
      const krRow = document.createElement('div'); krRow.style.display = 'flex'; krRow.style.gap = '4px'; krRow.style.flexWrap = 'wrap'; krRow.style.alignItems = 'center'; krRow.style.marginTop = '4px';
      const progIn = document.createElement('input'); progIn.type = 'number'; progIn.min = '0'; progIn.max = '100'; progIn.value = kr.progress; progIn.style.width = '60px';
      const statusSel = document.createElement('select');
      ['on-track','at-risk','off-track','done'].forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; if (s === kr.status) o.selected = true; statusSel.appendChild(o); });
      const saveKrBtn = document.createElement('button'); saveKrBtn.type = 'button'; saveKrBtn.textContent = '✓'; saveKrBtn.className = 'small-btn';
      saveKrBtn.addEventListener('click', () => {
        updateKeyResult(okr.id, kr.id, +progIn.value, statusSel.value);
        renderOkrList(filterQtr);
      });
      const statusBadge = document.createElement('span'); statusBadge.className = `badge badge-${kr.status === 'done' ? 'big' : kr.status === 'at-risk' ? 'medium' : kr.status === 'off-track' ? 'small' : ''}`; statusBadge.textContent = kr.status;
      krRow.append(progIn, statusSel, saveKrBtn, statusBadge);
      krCard.appendChild(krRow);
      krList.appendChild(krCard);
    });

    // Add KR form
    const krForm = document.createElement('form');
    const krIn = document.createElement('input'); krIn.type = 'text'; krIn.placeholder = 'Nuevo Key Result...';
    const krAddBtn = document.createElement('button'); krAddBtn.type = 'submit'; krAddBtn.textContent = '+ KR';
    krForm.append(krIn, krAddBtn);
    krForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const desc = krIn.value.trim(); if (!desc) return;
      addKeyResult(okr.id, desc);
      krIn.value = '';
      renderOkrList(filterQtr);
    });
    krList.appendChild(krForm);
    krSection.appendChild(krList);
    card.appendChild(krSection);

    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteOkr(okr.id); renderOkrList(filterQtr); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
