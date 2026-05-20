/**
 * subscription-tracker.js — Seguimiento de suscripciones
 * @module subscription-tracker
 */

const KEY = 'kairos:subscriptions';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_COLORS = { active: 'green', paused: 'yellow', cancelled: 'red', trial: 'blue' };

export function renderSubscriptionTracker() {
  let panel = document.getElementById('subscriptiontracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'subscriptiontracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>/subscriptiontracker — Suscripciones</h2><button class="ia-close" id="subscriptiontracker-close">✕</button></div>
    <div class="ia-panel-body">
      <form id="subscriptiontracker-form" class="ia-form">
        <input id="st-name" placeholder="Nombre del servicio *" required />
        <input id="st-provider" placeholder="Proveedor" />
        <div style="display:flex;gap:8px">
          <input id="st-amount" type="number" placeholder="Monto" min="0" step="0.01" style="flex:2" />
          <select id="st-billingCycle" style="flex:2">
            <option value="monthly">Mensual</option>
            <option value="annual">Anual</option>
            <option value="weekly">Semanal</option>
            <option value="one-time">Único</option>
          </select>
        </div>
        <input id="st-category" placeholder="Categoría (ej: software, streaming)" />
        <input id="st-nextBillingDate" type="date" placeholder="Próximo cobro" />
        <select id="st-status">
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
          <option value="trial">Trial</option>
        </select>
        <button type="submit" class="ia-btn">Agregar suscripción</button>
      </form>
      <div id="subscriptiontracker-stats" class="ia-stats"></div>
      <ul id="subscriptiontracker-list"></ul>
    </div>`;
  document.body.appendChild(panel);

  document.getElementById('subscriptiontracker-close').addEventListener('click', () => { panel.style.display = 'none'; });

  document.getElementById('subscriptiontracker-form').addEventListener('submit', e => {
    e.preventDefault();
    const items = load();
    items.unshift({
      id: uid(),
      name: document.getElementById('st-name').value.trim(),
      provider: document.getElementById('st-provider').value.trim(),
      amount: parseFloat(document.getElementById('st-amount').value) || 0,
      billingCycle: document.getElementById('st-billingCycle').value,
      category: document.getElementById('st-category').value.trim(),
      nextBillingDate: document.getElementById('st-nextBillingDate').value,
      status: document.getElementById('st-status').value,
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
  const statsEl = document.getElementById('subscriptiontracker-stats');
  const listEl = document.getElementById('subscriptiontracker-list');
  if (!statsEl || !listEl) return;

  const total = items.length;
  const activeCount = items.filter(i => i.status === 'active').length;
  const monthlyTotal = items
    .filter(i => i.status === 'active')
    .reduce((s, i) => {
      if (i.billingCycle === 'monthly') return s + i.amount;
      if (i.billingCycle === 'annual') return s + i.amount / 12;
      if (i.billingCycle === 'weekly') return s + i.amount * 4.33;
      return s;
    }, 0);
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))].length;

  statsEl.textContent = `Total: ${total} · Activas: ${activeCount} · Mensual estimado: ${monthlyTotal.toFixed(2)} · Categorías: ${categories}`;

  listEl.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'ia-list-item';

    const name = document.createElement('strong');
    name.textContent = item.name;

    const provider = document.createElement('span');
    provider.className = 'ia-badge';
    provider.textContent = item.provider || '—';

    const cycleBadge = document.createElement('span');
    cycleBadge.className = 'ia-badge';
    cycleBadge.textContent = `${item.amount} / ${item.billingCycle}`;

    const statusBadge = document.createElement('span');
    statusBadge.className = `ia-badge ${STATUS_COLORS[item.status] || 'grey'}`;
    statusBadge.textContent = item.status;

    const sel = document.createElement('select');
    sel.className = 'ia-btn-sm';
    ['active', 'paused', 'cancelled', 'trial'].forEach(s => {
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

    li.append(name, provider, cycleBadge, statusBadge, sel, del);
    listEl.appendChild(li);
  }
}
