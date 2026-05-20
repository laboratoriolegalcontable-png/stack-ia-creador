/**
 * portfolio-tracker.js — Seguimiento de portfolio financiero
 * @module portfolio-tracker
 */

const KEY = 'kairos:portfolio-tracker';
const ASSET_TYPES = ['stock', 'crypto', 'etf', 'bond', 'real-estate', 'cash', 'other'];
const CURRENCIES = ['USD', 'ARS', 'EUR', 'BTC'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const totalCostBasis = items.reduce((s, a) => s + (a.purchasePrice * a.quantity), 0);
  const totalCurrentValue = items.reduce((s, a) => s + (a.currentPrice * a.quantity), 0);
  const totalGainLoss = totalCurrentValue - totalCostBasis;
  const gainLossPercent = totalCostBasis > 0 ? +(totalGainLoss / totalCostBasis * 100).toFixed(2) : 0;
  const byType = {};
  for (const a of items) byType[a.type] = (byType[a.type] || 0) + 1;
  return { total: items.length, totalCostBasis, totalCurrentValue, totalGainLoss, gainLossPercent, byType };
}

export function renderPortfolioTracker() {
  const existing = document.getElementById('portfolio-tracker-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'portfolio-tracker-panel';
  panel.className = 'kairos-panel';
  const typeOpts = ASSET_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  const currOpts = CURRENCIES.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/portfolio — Portfolio</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="port-stats"></div>
    <form id="port-form" class="panel-form">
      <input id="port-name" placeholder="Nombre del activo" required>
      <input id="port-ticker" placeholder="Ticker (ej: AAPL, BTC)">
      <select id="port-type">${typeOpts}</select>
      <input id="port-qty" type="number" placeholder="Cantidad" min="0" step="any" required>
      <input id="port-buy" type="number" placeholder="Precio de compra" min="0" step="any" required>
      <input id="port-current" type="number" placeholder="Precio actual" min="0" step="any">
      <select id="port-currency">${currOpts}</select>
      <button type="submit">Agregar activo</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${ASSET_TYPES.map(t => `<button class="filter-btn" data-filter="${t}">${t}</button>`).join('')}
    </div>
    <ul id="port-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#port-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('port-name').value.trim();
    const ticker = document.getElementById('port-ticker').value.trim();
    const type = document.getElementById('port-type').value;
    const quantity = parseFloat(document.getElementById('port-qty').value) || 0;
    const purchasePrice = parseFloat(document.getElementById('port-buy').value) || 0;
    const currentPrice = parseFloat(document.getElementById('port-current').value) || purchasePrice;
    const currency = document.getElementById('port-currency').value;
    if (!name || quantity <= 0) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), name, ticker, type, quantity, purchasePrice, currentPrice, currency, notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('port-stats');
    const gl = stats.totalGainLoss;
    if (statsEl) statsEl.textContent = `Activos: ${stats.total} · Valor: ${stats.totalCurrentValue.toFixed(0)} · G/L: ${gl >= 0 ? '+' : ''}${gl.toFixed(0)} (${stats.gainLossPercent}%)`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.type === activeFilter);
    const list = document.getElementById('port-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${item.name}${item.ticker ? ' (' + item.ticker + ')' : ''}`;
      const gainLoss = (item.currentPrice - item.purchasePrice) * item.quantity;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.type} · ${item.currency} · qty: ${item.quantity} · buy: ${item.purchasePrice} · now: ${item.currentPrice} · G/L: ${gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}`;
      const updateBtn = document.createElement('button');
      updateBtn.className = 'item-action';
      updateBtn.textContent = '✏';
      updateBtn.title = 'Actualizar precio';
      updateBtn.addEventListener('click', () => {
        const newPrice = parseFloat(prompt(`Nuevo precio para ${item.name}:`, item.currentPrice));
        if (!isNaN(newPrice) && newPrice >= 0) {
          const all = load();
          const idx = all.findIndex(x => x.id === item.id);
          if (idx !== -1) { all[idx].currentPrice = newPrice; all[idx].updatedAt = new Date().toISOString(); save(all); _refresh(); }
        }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, updateBtn, del);
      list.appendChild(li);
    }
  }
}
