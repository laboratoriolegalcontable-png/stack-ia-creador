/**
 * expense-tracker.js — Registro de gastos con categorías
 * @module expense-tracker
 */

const KEY = 'kairos:expenses';

const CATEGORIES = ['alimentación','transporte','entretenimiento','salud','educación','tecnología','hogar','otro'];

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function getStats(items) {
  const byCategory = {};
  let total = 0;
  for (const e of items) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    total += e.amount;
  }
  return { total: items.length, totalAmount: total, byCategory };
}

export function renderExpenseTracker() {
  const existing = document.getElementById('expense-tracker-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'expense-tracker-panel';
  panel.className = 'kairos-panel';
  const catOptions = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/expenses — Gastos</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="expense-stats"></div>
    <form id="expense-form" class="panel-form">
      <input id="expense-desc" placeholder="Descripción" required>
      <input id="expense-amount" type="number" min="0.01" step="0.01" placeholder="Monto" required>
      <select id="expense-cat">${catOptions}</select>
      <input id="expense-date" type="date">
      <button type="submit">Agregar</button>
    </form>
    <div class="panel-filters" id="expense-cat-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${CATEGORIES.map(c => `<button class="filter-btn" data-filter="${c}">${c}</button>`).join('')}
    </div>
    <ul id="expense-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  document.getElementById('expense-date').value = localDate();

  panel.querySelector('#expense-form').addEventListener('submit', e => {
    e.preventDefault();
    const desc = document.getElementById('expense-desc').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-cat').value;
    const date = document.getElementById('expense-date').value || localDate();
    if (!desc || isNaN(amount) || amount <= 0) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), desc, amount, category, date });
    save(items);
    e.target.reset();
    document.getElementById('expense-date').value = localDate();
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
    const statsEl = document.getElementById('expense-stats');
    if (statsEl) {
      const top = Object.entries(stats.byCategory).sort((a,b) => b[1]-a[1]).slice(0,3).map(([c,a]) => `${c}: $${a.toFixed(2)}`).join(' · ');
      statsEl.textContent = `Registros: ${stats.total} · Total: $${stats.totalAmount.toFixed(2)} · ${top}`;
    }
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.category === activeFilter);
    const list = document.getElementById('expense-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const desc = document.createElement('span');
      desc.className = 'item-title';
      desc.textContent = item.desc;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `$${item.amount.toFixed(2)} · ${item.category} · ${item.date}`;
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(desc, meta, del);
      list.appendChild(li);
    }
  }
}
