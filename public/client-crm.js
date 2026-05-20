/**
 * client-crm.js — CRM simple de clientes y prospectos
 * @module client-crm
 */

const KEY = 'kairos:client-crm';
const STATUSES = ['lead', 'prospect', 'active', 'paused', 'closed', 'lost'];
const SOURCES = ['referral', 'social', 'cold-outreach', 'inbound', 'event', 'other'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const active = items.filter(c => c.status === 'active').length;
  const leads = items.filter(c => ['lead', 'prospect'].includes(c.status)).length;
  const totalValue = items.reduce((s, c) => s + (c.value || 0), 0);
  const byStatus = {};
  for (const c of items) byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  return { total: items.length, active, leads, totalValue, byStatus };
}

export function renderClientCrm() {
  const existing = document.getElementById('client-crm-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'client-crm-panel';
  panel.className = 'kairos-panel';
  const statusOpts = STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');
  const sourceOpts = SOURCES.map(s => `<option value="${s}">${s}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/crm — Client CRM</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="crm-stats"></div>
    <form id="crm-form" class="panel-form">
      <input id="crm-name" placeholder="Nombre del cliente" required>
      <input id="crm-company" placeholder="Empresa (opcional)">
      <input id="crm-email" placeholder="Email" type="email">
      <select id="crm-source">${sourceOpts}</select>
      <input id="crm-value" type="number" placeholder="Valor estimado (USD)">
      <input id="crm-notes" placeholder="Notas">
      <button type="submit">Agregar cliente</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="crm-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#crm-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('crm-name').value.trim();
    const company = document.getElementById('crm-company').value.trim();
    const email = document.getElementById('crm-email').value.trim();
    const source = document.getElementById('crm-source').value;
    const value = parseFloat(document.getElementById('crm-value').value) || 0;
    const notes = document.getElementById('crm-notes').value.trim();
    if (!name) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), name, company, email, source, value, notes, status: 'lead', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('crm-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Activos: ${stats.active} · Leads: ${stats.leads} · Pipeline: $${stats.totalValue.toLocaleString()}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('crm-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const nameEl = document.createElement('span');
      nameEl.className = 'item-title';
      nameEl.textContent = item.name + (item.company ? ` (${item.company})` : '');
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.status} · ${item.source}${item.value ? ' · $' + item.value : ''}${item.notes ? ' · ' + item.notes : ''}`;
      const statusSelect = document.createElement('select');
      statusSelect.className = 'item-action';
      STATUSES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === item.status) opt.selected = true;
        statusSelect.appendChild(opt);
      });
      statusSelect.addEventListener('change', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].status = statusSelect.value; all[idx].updatedAt = new Date().toISOString(); save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(nameEl, meta, statusSelect, del);
      list.appendChild(li);
    }
  }
}
