const KEY = 'kairos:savings';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function renderSavingsTracker() {
  let panel = document.getElementById('savings-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'savings-tracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>💰 Ahorro</h2><button class="ia-close" onclick="document.getElementById('savings-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="st-form" class="ia-form">
        <input id="st-goal" placeholder="Meta de ahorro *" required />
        <input id="st-target" type="number" placeholder="Monto objetivo" min="0" step="0.01" />
        <input id="st-currency" placeholder="Moneda (USD, ARS…)" value="USD" />
        <input id="st-deadline" type="date" />
        <textarea id="st-why" placeholder="¿Por qué quieres ahorrar esto?" rows="2"></textarea>
        <button type="submit" class="ia-btn">Crear meta</button>
      </form>
      <div id="st-deposit-form" class="ia-form" style="display:none">
        <input id="st-dep-id" type="hidden" />
        <input id="st-dep-amount" type="number" placeholder="Monto a depositar" min="0" step="0.01" />
        <input id="st-dep-note" placeholder="Nota" />
        <button id="st-dep-btn" class="ia-btn green">Depositar</button>
        <button id="st-dep-cancel" class="ia-btn gray">Cancelar</button>
      </div>
      <div id="st-stats" class="ia-stats-bar"></div>
      <div id="st-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('st-deadline').value = '';
  document.getElementById('st-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), goal: document.getElementById('st-goal').value.trim(), targetAmount: +document.getElementById('st-target').value || 0, currentAmount: 0, currency: document.getElementById('st-currency').value.trim() || 'USD', deadline: document.getElementById('st-deadline').value, why: document.getElementById('st-why').value.trim(), deposits: [], status: 'active', createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('st-currency').value = 'USD';
    _refresh();
  };
  document.getElementById('st-dep-btn').onclick = () => {
    const id = document.getElementById('st-dep-id').value;
    const amount = +document.getElementById('st-dep-amount').value;
    const note = document.getElementById('st-dep-note').value.trim();
    if (!amount) return;
    const d = load(); const s = d.find(x => x.id === id); if (!s) return;
    s.deposits.push({ date: localDate(), amount, note });
    s.currentAmount = +s.deposits.reduce((t, dep) => t + dep.amount, 0).toFixed(2);
    if (s.targetAmount > 0 && s.currentAmount >= s.targetAmount) s.status = 'completed';
    s.updatedAt = now(); save(d);
    document.getElementById('st-deposit-form').style.display = 'none'; _refresh();
  };
  document.getElementById('st-dep-cancel').onclick = () => { document.getElementById('st-deposit-form').style.display = 'none'; };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('st-stats');
  const list = document.getElementById('st-list');
  if (!stats || !list) return;
  const active = items.filter(i => i.status === 'active');
  const totalSaved = items.reduce((s, i) => s + i.currentAmount, 0);
  stats.textContent = `Metas: ${items.length} | Activas: ${active.length} | Total ahorrado: ${totalSaved.toFixed(2)}`;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const pct = item.targetAmount > 0 ? Math.min(100, Math.round(item.currentAmount / item.targetAmount * 100)) : 0;
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const statusColor = item.status === 'completed' ? 'green' : 'blue';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge ${statusColor}">${item.status === 'completed' ? '✓ Meta!' : `${pct}%`}</span><button class="ia-btn-sm green" data-dep="${item.id}">+</button><button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><div class="ia-progress-bar" style="background:#e0e0e0;border-radius:4px;height:6px;margin:4px 0"><div style="background:#4caf50;width:${pct}%;height:100%;border-radius:4px"></div></div><small></small>`;
    el.querySelector('strong').textContent = item.goal;
    el.querySelector('small').textContent = `${item.currentAmount.toFixed(2)} / ${item.targetAmount.toFixed(2)} ${item.currency}${item.deadline ? ` · vence ${item.deadline}` : ''}`;
    el.querySelector('[data-dep]').onclick = () => {
      document.getElementById('st-dep-id').value = item.id;
      document.getElementById('st-dep-amount').value = '';
      document.getElementById('st-dep-note').value = '';
      document.getElementById('st-deposit-form').style.display = '';
    };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
