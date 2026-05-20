const KEY = 'kairos:subscriptions';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderSubscriptionTracker() {
  let panel = document.getElementById('subscription-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'subscription-tracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🔄 Suscripciones</h2><button class="ia-close" onclick="document.getElementById('subscription-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="sub-form" class="ia-form">
        <input id="sub-name" placeholder="Servicio *" required />
        <select id="sub-category"><option value="software">Software</option><option value="streaming">Streaming</option><option value="news">Noticias</option><option value="fitness">Fitness</option><option value="education">Educación</option><option value="cloud">Cloud</option><option value="ai">IA</option><option value="other">Otro</option></select>
        <div style="display:flex;gap:8px">
          <input id="sub-amount" type="number" placeholder="Monto" min="0" step="0.01" style="flex:1" />
          <select id="sub-billing" style="flex:1"><option value="monthly">Mensual</option><option value="annual">Anual</option><option value="weekly">Semanal</option></select>
          <input id="sub-currency" placeholder="USD" style="flex:0.5;width:60px" value="USD" />
        </div>
        <input id="sub-renewal" type="date" />
        <input id="sub-notes" placeholder="Notas" />
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div id="sub-stats" class="ia-stats-bar"></div>
      <div id="sub-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('sub-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), name: document.getElementById('sub-name').value.trim(), category: document.getElementById('sub-category').value, amount: +document.getElementById('sub-amount').value || 0, billingCycle: document.getElementById('sub-billing').value, currency: document.getElementById('sub-currency').value.trim() || 'USD', renewalDate: document.getElementById('sub-renewal').value, notes: document.getElementById('sub-notes').value.trim(), active: true, createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('sub-currency').value = 'USD';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('sub-stats');
  const list = document.getElementById('sub-list');
  if (!stats || !list) return;
  const active = items.filter(i => i.active);
  const monthlyTotal = active.reduce((s, i) => {
    if (i.billingCycle === 'monthly') return s + i.amount;
    if (i.billingCycle === 'annual') return s + i.amount / 12;
    if (i.billingCycle === 'weekly') return s + i.amount * 4.33;
    return s;
  }, 0);
  stats.textContent = `Activas: ${active.length} | ~${monthlyTotal.toFixed(2)}/mes | Total: ${items.length}`;
  list.innerHTML = '';
  items.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1) || (a.renewalDate || '').localeCompare(b.renewalDate || '')).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.category}</span><span class="ia-badge ${item.active ? 'green' : 'gray'}">${item.active ? 'Activa' : 'Pausada'}</span><button class="ia-btn-sm" data-toggle="${item.id}">${item.active ? '⏸' : '▶'}</button><button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.name;
    const monthly = item.billingCycle === 'monthly' ? item.amount : item.billingCycle === 'annual' ? +(item.amount / 12).toFixed(2) : +(item.amount * 4.33).toFixed(2);
    el.querySelector('small').textContent = `${item.amount} ${item.currency}/${item.billingCycle === 'monthly' ? 'mes' : item.billingCycle === 'annual' ? 'año' : 'sem'}${item.billingCycle !== 'monthly' ? ` (~${monthly}/mes)` : ''}${item.renewalDate ? ` | Renueva: ${item.renewalDate}` : ''}`;
    el.querySelector('[data-toggle]').onclick = () => { const d = load(); const s = d.find(x => x.id === item.id); if (s) { s.active = !s.active; save(d); _refresh(); } };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
