const KEY = 'kairos:meal-planner';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function renderMealPlanner() {
  let panel = document.getElementById('meal-planner-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'meal-planner-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🥗 Meal Planner</h2><button class="ia-close" onclick="document.getElementById('meal-planner-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="mp-form" class="ia-form">
        <input id="mp-meal" placeholder="Comida *" required />
        <select id="mp-type"><option value="breakfast">Desayuno</option><option value="lunch">Almuerzo</option><option value="dinner">Cena</option><option value="snack">Snack</option></select>
        <input id="mp-date" type="date" />
        <input id="mp-calories" type="number" placeholder="Calorías estimadas" min="0" />
        <div style="display:flex;gap:8px">
          <input id="mp-protein" type="number" placeholder="Proteína (g)" min="0" style="flex:1" />
          <input id="mp-carbs" type="number" placeholder="Carbos (g)" min="0" style="flex:1" />
          <input id="mp-fat" type="number" placeholder="Grasa (g)" min="0" style="flex:1" />
        </div>
        <label style="display:flex;align-items:center;gap:6px"><input id="mp-cooked" type="checkbox" /> Cocinado en casa</label>
        <button type="submit" class="ia-btn">Registrar</button>
      </form>
      <div id="mp-stats" class="ia-stats-bar"></div>
      <div id="mp-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('mp-date').value = localDate();
  document.getElementById('mp-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), meal: document.getElementById('mp-meal').value.trim(), type: document.getElementById('mp-type').value, date: document.getElementById('mp-date').value, calories: +document.getElementById('mp-calories').value || 0, protein: +document.getElementById('mp-protein').value || 0, carbs: +document.getElementById('mp-carbs').value || 0, fat: +document.getElementById('mp-fat').value || 0, cookedAtHome: document.getElementById('mp-cooked').checked, createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('mp-date').value = localDate();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('mp-stats');
  const list = document.getElementById('mp-list');
  if (!stats || !list) return;
  const today = items.filter(i => i.date === localDate());
  const todayCals = today.reduce((s, i) => s + i.calories, 0);
  const todayProt = today.reduce((s, i) => s + i.protein, 0);
  stats.textContent = `Hoy: ${todayCals} kcal | Proteína: ${todayProt}g | Comidas: ${today.length}`;
  list.innerHTML = '';
  const grouped = {};
  items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).forEach(item => {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  });
  Object.entries(grouped).forEach(([date, meals]) => {
    const dayDiv = document.createElement('div');
    dayDiv.innerHTML = `<div style="font-size:0.75rem;color:var(--color-muted);padding:6px 0 2px">${date}</div>`;
    meals.forEach(item => {
      const el = document.createElement('div');
      el.className = 'ia-list-item';
      el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.type}</span>${item.cookedAtHome ? '<span class="ia-badge green">🏠</span>' : ''}<button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><small></small>`;
      el.querySelector('strong').textContent = item.meal;
      const macro = [item.calories ? `${item.calories} kcal` : '', item.protein ? `P:${item.protein}g` : '', item.carbs ? `C:${item.carbs}g` : '', item.fat ? `F:${item.fat}g` : ''].filter(Boolean).join(' · ');
      el.querySelector('small').textContent = macro;
      el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
      dayDiv.appendChild(el);
    });
    list.appendChild(dayDiv);
  });
}
