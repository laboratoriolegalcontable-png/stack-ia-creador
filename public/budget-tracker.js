/** budget-tracker.js — Control de presupuesto · KAIROS browser module */

// ── renderBudgetTracker (new ia-panel style) ──────────────────────────────────
const KEY = 'kairos:budgets';
function _load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function _save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function _uid() { return crypto.randomUUID(); }
function _now() { return new Date().toISOString(); }

const CAT_ICON = { technology: '💻', marketing: '📣', operations: '⚙️', hr: '👥', legal: '⚖️', travel: '✈️', other: '📋' };

export function renderBudgetTracker() {
  let panel = document.getElementById('budget-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _btRefresh(); return; }
  panel = document.createElement('div');
  panel.id = 'budget-tracker-panel';
  panel.className = 'ia-panel';
  const today = new Date().toISOString().slice(0, 10);
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>💰 Budget Tracker</h2><button class="ia-close" onclick="document.getElementById('budget-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="bt-form" class="ia-form">
        <div style="display:flex;gap:8px">
          <input id="bt-name" placeholder="Nombre *" required style="flex:2" />
          <select id="bt-category" style="flex:1">
            <option value="technology">💻 Technology</option><option value="marketing">📣 Marketing</option><option value="operations">⚙️ Operations</option><option value="hr">👥 HR</option><option value="legal">⚖️ Legal</option><option value="travel">✈️ Travel</option><option value="other">📋 Other</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <select id="bt-period" style="flex:1">
            <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option><option value="project">Project</option>
          </select>
          <input id="bt-amount" type="number" placeholder="Total *" min="0" step="0.01" required style="flex:1" />
          <input id="bt-currency" placeholder="Moneda" value="ARS" style="flex:1" />
        </div>
        <div style="display:flex;gap:8px">
          <input id="bt-start" type="date" value="${today}" style="flex:1" />
          <input id="bt-owner" placeholder="Responsable *" required style="flex:1" />
        </div>
        <textarea id="bt-notes" placeholder="Notas (opcional)" rows="2"></textarea>
        <button type="submit" class="ia-btn">Crear presupuesto</button>
      </form>
      <div id="bt-stats" class="ia-stats-bar"></div>
      <div id="bt-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('bt-form').onsubmit = e => {
    e.preventDefault();
    const items = _load();
    items.unshift({
      id: _uid(),
      name: document.getElementById('bt-name').value.trim(),
      category: document.getElementById('bt-category').value,
      period: document.getElementById('bt-period').value,
      totalAmount: Number(document.getElementById('bt-amount').value) || 0,
      currency: document.getElementById('bt-currency').value.trim() || 'ARS',
      startDate: document.getElementById('bt-start').value,
      owner: document.getElementById('bt-owner').value.trim(),
      notes: document.getElementById('bt-notes').value.trim(),
      expenses: [],
      createdAt: _now()
    });
    _save(items);
    e.target.reset();
    document.getElementById('bt-currency').value = 'ARS';
    document.getElementById('bt-start').value = new Date().toISOString().slice(0, 10);
    _btRefresh();
  };
  _btRefresh();
}

function _btRefresh() {
  const all = _load();
  const stats = document.getElementById('bt-stats');
  const list = document.getElementById('bt-list');
  if (!stats || !list) return;

  const totalAllocated = all.reduce((s, i) => s + i.totalAmount, 0);
  const totalSpent = all.reduce((s, i) => s + (i.expenses || []).filter(e => e.status === 'approved' || e.status === 'paid').reduce((ss, e) => ss + e.amount, 0), 0);
  stats.textContent = 'Total presupuestos: ' + all.length + ' | Asignado: $' + totalAllocated.toLocaleString() + ' | Gastado: $' + totalSpent.toLocaleString();

  list.innerHTML = '';
  all.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const icon = CAT_ICON[item.category] || '📋';
    const spent = (item.expenses || []).filter(e => e.status === 'approved' || e.status === 'paid').reduce((s, e) => s + e.amount, 0);
    const pct = item.totalAmount > 0 ? Math.round(spent / item.totalAmount * 100) : 0;
    const utilizCol = pct >= 100 ? 'red' : pct >= 80 ? 'blue' : 'green';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge gray"></span><span class="ia-badge ' + utilizCol + '"></span><button class="ia-btn-sm blue">+ gasto</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = icon + ' ' + item.name;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.period;
    badges[1].textContent = item.currency + ' ' + item.totalAmount.toLocaleString();
    badges[2].textContent = pct + '% usado';
    const [expBtn, delBtn] = el.querySelectorAll('button');
    expBtn.onclick = () => {
      const raw = prompt('Gasto (description|amount|vendor):');
      if (!raw) return;
      const [description, amountStr, vendor] = raw.split('|').map(s => s.trim());
      if (!description) return;
      const d = _load(); const r = d.find(x => x.id === item.id);
      if (r) { r.expenses = r.expenses || []; r.expenses.push({ description, amount: Number(amountStr) || 0, vendor: vendor || '', status: 'pending', date: new Date().toISOString().slice(0,10) }); _save(d); _btRefresh(); }
    };
    delBtn.onclick = () => { _save(_load().filter(x => x.id !== item.id)); _btRefresh(); };
    const totalExp = (item.expenses || []).length;
    el.querySelector('small').textContent = 'Gastado: $' + spent.toLocaleString() + ' / $' + item.totalAmount.toLocaleString() + ' (' + totalExp + ' gastos)';
    list.appendChild(el);
  });
}

// ── renderBudgetPanel (legacy ia-panel style) ──────────────────────────────────
const BT_KEY = 'kairos:budget';

function loadTxs() { try { const d = JSON.parse(localStorage.getItem(BT_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveTxs(list) { localStorage.setItem(BT_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

export function addTransaction(type, amount, category, description, date) {
  const list = loadTxs();
  const tx = { id: uid(), type, amount: Math.max(0, Number(amount) || 0), category, description: description.trim(), date, createdAt: new Date().toISOString() };
  list.unshift(tx); saveTxs(list); return tx;
}

export function deleteTransaction(id) {
  const list = loadTxs();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1); saveTxs(list); return true;
}

export function getBudgetStats(monthFilter) {
  let list = loadTxs();
  if (monthFilter) list = list.filter(t => t.date.startsWith(monthFilter));
  const income = list.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { totalIncome: income, totalExpense: expense, balance: income - expense };
}

export function renderBudgetPanel() {
  let panel = document.getElementById('kairos-budget-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') renderBudgetList(); return; }
  panel = document.createElement('section'); panel.id = 'kairos-budget-panel'; panel.className = 'kairos-panel';
  const h2 = document.createElement('h2'); h2.textContent = '💰 Budget Tracker'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'budget-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form');
  const typeSel = document.createElement('select');
  ['income','expense'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; typeSel.appendChild(o); });
  const amountIn = document.createElement('input'); amountIn.type = 'number'; amountIn.placeholder = 'Monto'; amountIn.min = '0'; amountIn.step = '0.01';
  const catSel = document.createElement('select');
  ['food','transport','housing','health','education','entertainment','work','savings','other'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; catSel.appendChild(o); });
  const descIn = document.createElement('input'); descIn.type = 'text'; descIn.placeholder = 'Descripción';
  const dateIn = document.createElement('input'); dateIn.type = 'date'; dateIn.value = new Date().toISOString().slice(0,10);
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Transacción';
  form.append(typeSel, amountIn, catSel, descIn, dateIn, addBtn);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const amt = parseFloat(amountIn.value); if (!amt || amt <= 0) return;
    addTransaction(typeSel.value, amt, catSel.value, descIn.value, dateIn.value);
    amountIn.value = ''; descIn.value = '';
    renderBudgetList();
  });
  panel.appendChild(form);

  // month filter
  const monthIn = document.createElement('input'); monthIn.type = 'month'; monthIn.id = 'budget-month-filter'; monthIn.value = new Date().toISOString().slice(0,7);
  monthIn.addEventListener('change', () => renderBudgetList(monthIn.value));
  panel.appendChild(monthIn);

  const listEl = document.createElement('div'); listEl.id = 'budget-list'; panel.appendChild(listEl);
  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderBudgetList(new Date().toISOString().slice(0,7));
}

function renderBudgetList(monthFilter) {
  const listEl = document.getElementById('budget-list');
  const statsEl = document.getElementById('budget-stats');
  if (!listEl) return;
  const m = monthFilter || document.getElementById('budget-month-filter')?.value;
  const stats = getBudgetStats(m);
  if (statsEl) { statsEl.textContent = `Ingresos: $${stats.totalIncome.toFixed(2)} · Gastos: $${stats.totalExpense.toFixed(2)} · Balance: $${stats.balance.toFixed(2)}`; }
  let list = loadTxs();
  if (m) list = list.filter(t => t.date.startsWith(m));
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay transacciones.'; listEl.appendChild(em); return; }
  list.forEach(tx => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const amt = document.createElement('strong'); amt.textContent = `${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}`;
    const cat = document.createElement('span'); cat.className = 'badge'; cat.textContent = tx.category;
    const dateEl = document.createElement('span'); dateEl.textContent = tx.date;
    top.append(amt, cat, dateEl); card.appendChild(top);
    if (tx.description) { const p = document.createElement('p'); p.textContent = tx.description; card.appendChild(p); }
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteTransaction(tx.id); renderBudgetList(m); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
