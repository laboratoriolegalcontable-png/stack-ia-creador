const KEY = 'kairos:experiments';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_CYCLE = ['hypothesis', 'running', 'analyzing', 'concluded', 'abandoned'];
const STATUS_COLORS = { hypothesis: 'blue', running: 'green', analyzing: 'blue', concluded: 'gray', abandoned: 'red' };

export function renderExperimentLog() {
  let panel = document.getElementById('explog-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'explog-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🧪 Experiment Log</h2><button class="ia-close" onclick="document.getElementById('explog-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="el2-form" class="ia-form">
        <input id="el2-title" placeholder="Título del experimento *" required />
        <textarea id="el2-hypothesis" placeholder="Hipótesis *" rows="2" required></textarea>
        <div style="display:flex;gap:8px">
          <input id="el2-metric" placeholder="Métrica a medir *" style="flex:2" required />
          <input id="el2-target" type="number" placeholder="Target (opcional)" style="flex:1" />
        </div>
        <input id="el2-tags" placeholder="Tags (coma separados)" />
        <button type="submit" class="ia-btn">Registrar experimento</button>
      </form>
      <div id="el2-stats" class="ia-stats-bar"></div>
      <div id="el2-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('el2-form').onsubmit = e => {
    e.preventDefault();
    const tagsRaw = document.getElementById('el2-tags').value.trim();
    const items = load();
    items.push({
      id: uid(),
      title: document.getElementById('el2-title').value.trim(),
      hypothesis: document.getElementById('el2-hypothesis').value.trim(),
      metric: document.getElementById('el2-metric').value.trim(),
      target: document.getElementById('el2-target').value ? parseFloat(document.getElementById('el2-target').value) : null,
      tags: tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
      status: 'hypothesis',
      results: [],
      createdAt: now(),
      updatedAt: now()
    });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const stats = document.getElementById('el2-stats');
  const list = document.getElementById('el2-list');
  if (!stats || !list) return;
  const items = load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const running = items.filter(i => i.status === 'running').length;
  const concluded = items.filter(i => i.status === 'concluded').length;
  stats.textContent = 'Total: ' + items.length + ' | Running: ' + running + ' | Concluded: ' + concluded;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const statusColor = STATUS_COLORS[item.status] || 'gray';
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + statusColor + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm gray"></button><button class="ia-btn-sm blue">+resultado</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.status;
    el.querySelectorAll('.ia-badge')[1].textContent = item.metric;
    const [advBtn, addResultBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + nextStatus;
    advBtn.onclick = () => {
      const all = load();
      const r = all.find(x => x.id === item.id);
      if (r) { r.status = nextStatus; r.updatedAt = now(); save(all); _refresh(); }
    };
    addResultBtn.onclick = () => {
      const result = window.prompt('Resultado del experimento:');
      if (result && result.trim()) {
        const all = load();
        const r = all.find(x => x.id === item.id);
        if (r) { r.results = r.results || []; r.results.push(result.trim()); r.updatedAt = now(); save(all); _refresh(); }
      }
    };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const resultCount = item.results ? item.results.length : 0;
    el.querySelector('small').textContent = item.hypothesis.slice(0, 80) + (resultCount ? ' [' + resultCount + ' results]' : '');
    list.appendChild(el);
  });
}
