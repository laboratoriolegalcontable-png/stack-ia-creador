const KEY = 'kairos:matrices';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderDecisionMatrix() {
  let panel = document.getElementById('decmatrix-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'decmatrix-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>⚖️ Decision Matrix</h2><button class="ia-close" onclick="document.getElementById('decmatrix-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="dm-form" class="ia-form">
        <input id="dm-title" placeholder="Decisión a tomar *" required />
        <input id="dm-options" placeholder="Opciones (separadas por |) *" required />
        <input id="dm-criteria" placeholder="Criterios (separados por |) *" required />
        <input id="dm-weights" placeholder="Pesos (separados por |, default 1.0 cada uno)" />
        <button type="submit" class="ia-btn">Crear matriz</button>
      </form>
      <div id="dm-score-area"></div>
      <div id="dm-stats" class="ia-stats-bar"></div>
      <div id="dm-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('dm-form').onsubmit = e => {
    e.preventDefault();
    const title = document.getElementById('dm-title').value.trim();
    const options = document.getElementById('dm-options').value.trim().split('|').map(s => s.trim()).filter(Boolean);
    const criteria = document.getElementById('dm-criteria').value.trim().split('|').map(s => s.trim()).filter(Boolean);
    const rawWeights = document.getElementById('dm-weights').value.trim();
    let weights = criteria.map(() => 1.0);
    if (rawWeights) {
      const parsed = rawWeights.split('|').map(s => parseFloat(s.replace(',', '.').trim())).filter(n => !isNaN(n));
      if (parsed.length === criteria.length) weights = parsed;
    }
    const scores = {};
    options.forEach(opt => {
      scores[opt] = {};
      criteria.forEach(crit => { scores[opt][crit] = 0; });
    });
    const items = load();
    items.push({ id: uid(), title, options, criteria, weights, scores, winner: null, createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const stats = document.getElementById('dm-stats');
  const list = document.getElementById('dm-list');
  if (!stats || !list) return;
  const items = load();
  const withWinner = items.filter(i => i.winner).length;
  stats.textContent = 'Total matrices: ' + items.length + ' | Con winner: ' + withWinner;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const winnerColor = item.winner ? 'green' : 'gray';
    const winnerText = item.winner ? item.winner : 'pending';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge ' + winnerColor + '"></span><button class="ia-btn-sm blue">Score</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.options.length + ' opciones';
    el.querySelectorAll('.ia-badge')[1].textContent = winnerText;
    const [scoreBtn, delBtn] = el.querySelectorAll('button');
    scoreBtn.onclick = () => _showScoreForm(item.id);
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = 'Criterios: ' + item.criteria.join(', ');
    list.appendChild(el);
  });
}

function _showScoreForm(matrixId) {
  const area = document.getElementById('dm-score-area');
  if (!area) return;
  const items = load();
  const matrix = items.find(x => x.id === matrixId);
  if (!matrix) return;

  area.innerHTML = '';
  const container = document.createElement('div');
  container.style.cssText = 'background:var(--color-bg,#111);border:1px solid var(--color-border,#333);border-radius:8px;padding:12px;margin-bottom:12px';

  const heading = document.createElement('strong');
  heading.textContent = 'Scoring: ' + matrix.title;
  container.appendChild(heading);

  const grid = document.createElement('div');
  grid.style.cssText = 'overflow-x:auto;margin-top:8px';

  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;width:100%;font-size:0.82rem';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const thEmpty = document.createElement('th');
  thEmpty.textContent = 'Criterio \\ Opción';
  thEmpty.style.cssText = 'padding:4px 8px;text-align:left;border:1px solid var(--color-border,#333)';
  headerRow.appendChild(thEmpty);
  matrix.options.forEach(opt => {
    const th = document.createElement('th');
    th.textContent = opt;
    th.style.cssText = 'padding:4px 8px;border:1px solid var(--color-border,#333)';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const inputs = {};
  matrix.criteria.forEach((crit, ci) => {
    const row = document.createElement('tr');
    const tdCrit = document.createElement('td');
    tdCrit.style.cssText = 'padding:4px 8px;border:1px solid var(--color-border,#333);white-space:nowrap';
    tdCrit.textContent = crit + ' (w:' + (matrix.weights[ci] || 1) + ')';
    row.appendChild(tdCrit);
    inputs[crit] = {};
    matrix.options.forEach(opt => {
      const td = document.createElement('td');
      td.style.cssText = 'padding:4px;border:1px solid var(--color-border,#333)';
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = '0';
      inp.max = '10';
      inp.step = '1';
      inp.value = (matrix.scores[opt] && matrix.scores[opt][crit] != null) ? matrix.scores[opt][crit] : 0;
      inp.style.cssText = 'width:48px;padding:2px 4px;background:var(--color-bg,#111);border:1px solid var(--color-border,#444);color:inherit;border-radius:4px';
      td.appendChild(inp);
      inputs[crit][opt] = inp;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  grid.appendChild(table);
  container.appendChild(grid);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'ia-btn';
  saveBtn.style.marginTop = '8px';
  saveBtn.textContent = 'Guardar scores';
  saveBtn.onclick = () => {
    const all = load();
    const m = all.find(x => x.id === matrixId);
    if (!m) return;
    m.options.forEach(opt => {
      m.criteria.forEach(crit => {
        m.scores[opt][crit] = parseFloat(inputs[crit][opt].value) || 0;
      });
    });
    const totals = {};
    m.options.forEach(opt => {
      totals[opt] = m.criteria.reduce((sum, crit, ci) => sum + (m.scores[opt][crit] * (m.weights[ci] || 1)), 0);
    });
    m.winner = Object.keys(totals).reduce((a, b) => totals[a] >= totals[b] ? a : b);
    m.updatedAt = now();
    save(all);
    area.innerHTML = '';
    _refresh();
  };
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'ia-btn-sm gray';
  cancelBtn.style.marginTop = '8px';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.onclick = () => { area.innerHTML = ''; };
  container.appendChild(saveBtn);
  container.appendChild(cancelBtn);
  area.appendChild(container);
}
