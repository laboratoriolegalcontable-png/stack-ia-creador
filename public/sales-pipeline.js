/**
 * sales-pipeline.js — Pipeline de ventas
 * @module sales-pipeline
 */

const KEY = 'kairos:sales-pipeline';
const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'on-hold'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const won = items.filter(d => d.stage === 'won').length;
  const lost = items.filter(d => d.stage === 'lost').length;
  const active = items.filter(d => !['won', 'lost'].includes(d.stage));
  const totalPipelineValue = active.reduce((s, d) => s + (d.value || 0), 0);
  const weightedValue = active.reduce((s, d) => s + (d.value || 0) * (d.probability || 10) / 100, 0);
  const closed = won + lost;
  const winRate = closed > 0 ? +(won / closed * 100).toFixed(1) : 0;
  const byStage = {};
  for (const d of items) byStage[d.stage] = (byStage[d.stage] || 0) + 1;
  return { total: items.length, won, lost, pipeline: active.length, totalPipelineValue, weightedValue, winRate, byStage };
}

export function renderSalesPipeline() {
  const existing = document.getElementById('sales-pipeline-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'sales-pipeline-panel';
  panel.className = 'kairos-panel';
  panel.innerHTML = `
    <div class="panel-header"><strong>/sales — Pipeline de Ventas</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="sales-stats"></div>
    <form id="sales-form" class="panel-form">
      <input id="deal-title" placeholder="Nombre del deal" required>
      <input id="deal-client" placeholder="Cliente" required>
      <input id="deal-value" type="number" placeholder="Valor (USD)" min="0">
      <input id="deal-prob" type="number" placeholder="Probabilidad %" min="0" max="100">
      <input id="deal-close" placeholder="Cierre esperado (YYYY-MM-DD)">
      <input id="deal-notes" placeholder="Notas">
      <button type="submit">Agregar deal</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${STAGES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="sales-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#sales-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('deal-title').value.trim();
    const clientName = document.getElementById('deal-client').value.trim();
    const value = parseFloat(document.getElementById('deal-value').value) || 0;
    const probability = parseInt(document.getElementById('deal-prob').value) || 10;
    const expectedCloseDate = document.getElementById('deal-close').value.trim();
    const notes = document.getElementById('deal-notes').value.trim();
    if (!title || !clientName) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), title, clientName, value, probability: Math.min(100, Math.max(0, probability)), stage: 'lead', expectedCloseDate, notes, currency: 'USD', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    save(items);
    e.target.reset();
    _refresh();
  });

  panel.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _refresh();
    });
  });

  _refresh();

  function _refresh() {
    const items = load();
    const stats = getStats(items);
    const statsEl = document.getElementById('sales-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Pipeline: $${stats.totalPipelineValue.toFixed(0)} · Weighted: $${stats.weightedValue.toFixed(0)} · Win rate: ${stats.winRate}%`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.stage === activeFilter);
    const list = document.getElementById('sales-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${item.title} — ${item.clientName}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.stage} · $${item.value || 0} · ${item.probability || 10}%${item.expectedCloseDate ? ' · cierre: ' + item.expectedCloseDate : ''}`;
      const stageSelect = document.createElement('select');
      stageSelect.className = 'item-action';
      STAGES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === item.stage) opt.selected = true;
        stageSelect.appendChild(opt);
      });
      stageSelect.addEventListener('change', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].stage = stageSelect.value; all[idx].updatedAt = new Date().toISOString(); save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, stageSelect, del);
      list.appendChild(li);
    }
  }
}
