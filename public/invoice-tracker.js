/**
 * invoice-tracker.js — Seguimiento de facturas y pagos
 * @module invoice-tracker
 */

const KEY = 'kairos:invoice-tracker';
const STATUSES = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'];
const CURRENCIES = ['USD', 'ARS', 'EUR'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getStats(items) {
  const paid = items.filter(i => i.status === 'paid');
  const pending = items.filter(i => ['sent', 'viewed'].includes(i.status));
  const overdue = items.filter(i => i.status === 'overdue').length;
  const byStatus = {};
  for (const i of items) byStatus[i.status] = (byStatus[i.status] || 0) + 1;
  return {
    total: items.length,
    paid: paid.length,
    pending: pending.length,
    overdue,
    totalRevenue: paid.reduce((s, i) => s + i.amount, 0),
    pendingRevenue: pending.reduce((s, i) => s + i.amount, 0),
    byStatus,
  };
}

export function renderInvoiceTracker() {
  const existing = document.getElementById('invoice-tracker-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'invoice-tracker-panel';
  panel.className = 'kairos-panel';
  const currOpts = CURRENCIES.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/invoices — Facturas</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="inv-stats"></div>
    <form id="inv-form" class="panel-form">
      <input id="inv-number" placeholder="Nº factura" required>
      <input id="inv-client" placeholder="Cliente" required>
      <input id="inv-amount" type="number" placeholder="Monto" min="0" step="0.01" required>
      <select id="inv-currency">${currOpts}</select>
      <input id="inv-desc" placeholder="Descripción del servicio">
      <input id="inv-due" placeholder="Vencimiento (YYYY-MM-DD)">
      <button type="submit">Emitir factura</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="inv-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#inv-form').addEventListener('submit', e => {
    e.preventDefault();
    const invoiceNumber = document.getElementById('inv-number').value.trim();
    const clientName = document.getElementById('inv-client').value.trim();
    const amount = parseFloat(document.getElementById('inv-amount').value) || 0;
    const currency = document.getElementById('inv-currency').value;
    const description = document.getElementById('inv-desc').value.trim();
    const dueDate = document.getElementById('inv-due').value.trim();
    if (!invoiceNumber || !clientName) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), invoiceNumber, clientName, amount, currency, description, status: 'draft', issuedDate: localDate(), dueDate, notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('inv-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Pagadas: ${stats.paid} · Pendiente: ${stats.pendingRevenue.toFixed(0)} · Cobrado: ${stats.totalRevenue.toFixed(0)}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('inv-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${item.invoiceNumber} — ${item.clientName}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.currency} ${item.amount.toFixed(2)} · ${item.status}${item.dueDate ? ' · vence ' + item.dueDate : ''}`;
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
      li.append(titleEl, meta, statusSelect, del);
      list.appendChild(li);
    }
  }
}
