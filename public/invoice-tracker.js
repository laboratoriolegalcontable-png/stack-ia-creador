/**
 * invoice-tracker.js — Seguimiento de facturas y pagos
 * @module invoice-tracker
 */

const KEY = 'kairos:invoices';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_COLORS = { paid: 'green', overdue: 'red', sent: 'yellow', draft: 'grey', cancelled: 'grey' };

export function renderInvoiceTracker() {
  let panel = document.getElementById('invoicetracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'invoicetracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>/invoicetracker — Facturas</h2><button class="ia-close" id="invoicetracker-close">✕</button></div>
    <div class="ia-panel-body">
      <form id="invoicetracker-form" class="ia-form">
        <input id="it-clientName" placeholder="Nombre del cliente *" required />
        <input id="it-clientEmail" type="email" placeholder="Email del cliente" />
        <div style="display:flex;gap:8px">
          <input id="it-amount" type="number" placeholder="Monto" min="0" step="0.01" style="flex:2" required />
          <select id="it-currency" style="flex:1">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="PEN">PEN</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <input id="it-dueDate" type="date" placeholder="Fecha de vencimiento" />
        <select id="it-status">
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <textarea id="it-notes" placeholder="Notas" rows="2"></textarea>
        <button type="submit" class="ia-btn">Agregar factura</button>
      </form>
      <div id="invoicetracker-stats" class="ia-stats"></div>
      <ul id="invoicetracker-list"></ul>
    </div>`;
  document.body.appendChild(panel);

  document.getElementById('invoicetracker-close').addEventListener('click', () => { panel.style.display = 'none'; });

  document.getElementById('invoicetracker-form').addEventListener('submit', e => {
    e.preventDefault();
    const items = load();
    items.unshift({
      id: uid(),
      clientName: document.getElementById('it-clientName').value.trim(),
      clientEmail: document.getElementById('it-clientEmail').value.trim(),
      amount: parseFloat(document.getElementById('it-amount').value) || 0,
      currency: document.getElementById('it-currency').value,
      dueDate: document.getElementById('it-dueDate').value,
      status: document.getElementById('it-status').value,
      notes: document.getElementById('it-notes').value.trim(),
      createdAt: now(),
    });
    save(items);
    e.target.reset();
    _refresh();
  });

  _refresh();
}

function _refresh() {
  const items = load();
  const statsEl = document.getElementById('invoicetracker-stats');
  const listEl = document.getElementById('invoicetracker-list');
  if (!statsEl || !listEl) return;

  const total = items.length;
  const paidCount = items.filter(i => i.status === 'paid').length;
  const overdueCount = items.filter(i => i.status === 'overdue').length;
  const pendingAmount = items
    .filter(i => ['draft', 'sent'].includes(i.status))
    .reduce((s, i) => s + i.amount, 0);

  statsEl.textContent = `Total: ${total} · Pagadas: ${paidCount} · Pendiente: ${pendingAmount.toFixed(2)} · Vencidas: ${overdueCount}`;

  listEl.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'ia-list-item';

    const name = document.createElement('strong');
    name.textContent = item.clientName;

    const amount = document.createElement('span');
    amount.className = 'ia-badge';
    amount.textContent = `${item.currency} ${item.amount.toFixed(2)}`;

    const badge = document.createElement('span');
    badge.className = `ia-badge ${STATUS_COLORS[item.status] || 'grey'}`;
    badge.textContent = item.status;

    const due = document.createElement('small');
    due.textContent = item.dueDate ? ` vence: ${item.dueDate}` : '';

    const sel = document.createElement('select');
    sel.className = 'ia-btn-sm';
    ['draft', 'sent', 'paid', 'overdue', 'cancelled'].forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      if (s === item.status) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      const all = load();
      const idx = all.findIndex(x => x.id === item.id);
      if (idx !== -1) { all[idx].status = sel.value; save(all); _refresh(); }
    });

    const del = document.createElement('button');
    del.className = 'ia-btn-sm red';
    del.textContent = '✕';
    del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });

    li.append(name, amount, badge, due, sel, del);
    listEl.appendChild(li);
  }
}
