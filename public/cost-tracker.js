const KEY = 'kairos:costs';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const CATEGORY_COLORS = { api: 'blue', infra: 'gray', tool: 'green', other: 'gray' };

export function renderCostTracker() {
  let panel = document.getElementById('cost-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'cost-tracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>💰 Cost Tracker</h2><button class="ia-close" onclick="document.getElementById('cost-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ct-form" class="ia-form">
        <input id="ct-label" placeholder="Descripción *" required />
        <select id="ct-category"><option value="api">API</option><option value="infra">Infra</option><option value="tool">Tool</option><option value="other">Otro</option></select>
        <input id="ct-amount" type="number" placeholder="Monto (USD) *" min="0" step="0.01" required />
        <input id="ct-date" type="date" />
        <input id="ct-note" placeholder="Nota / contexto" />
        <button type="submit" class="ia-btn">Registrar costo</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <select id="ct-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text);flex:1">
          <option value="all">Todos</option><option value="api">API</option><option value="infra">Infra</option><option value="tool">Tool</option><option value="other">Otro</option>
        </select>
      </div>
      <div id="ct-stats" class="ia-stats-bar"></div>
      <div id="ct-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  const dateInput = document.getElementById('ct-date');
  dateInput.value = new Date().toISOString().slice(0, 10);
  document.getElementById('ct-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const amount = parseFloat(document.getElementById('ct-amount').value) || 0;
    items.push({ id: uid(), label: document.getElementById('ct-label').value.trim(), category: document.getElementById('ct-category').value, amount, date: document.getElementById('ct-date').value || new Date().toISOString().slice(0, 10), note: document.getElementById('ct-note').value.trim(), createdAt: now() });
    save(items);
    e.target.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
    _refresh();
  };
  document.getElementById('ct-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('ct-filter')?.value || 'all';
  const all = load();
  const items = filter === 'all' ? all : all.filter(i => i.category === filter);
  const stats = document.getElementById('ct-stats');
  const list = document.getElementById('ct-list');
  if (!stats || !list) return;
  const total = all.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2);
  const thisMonth = all.filter(i => i.date?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, i) => s + (i.amount || 0), 0).toFixed(2);
  stats.textContent = 'Total: $' + total + ' | Este mes: $' + thisMonth + ' | Entradas: ' + all.length;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = CATEGORY_COLORS[item.category] || 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><span class="ia-badge green"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.label;
    el.querySelectorAll('.ia-badge')[0].textContent = item.category;
    el.querySelectorAll('.ia-badge')[1].textContent = '$' + (item.amount || 0).toFixed(2);
    el.querySelector('small').textContent = (item.date || '') + (item.note ? ' · ' + item.note : '');
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
