/** budget-tracker.js — Control de presupuesto · KAIROS browser module */
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
