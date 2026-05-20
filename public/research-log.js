const KEY = 'kairos:research';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_COLORS = { exploring: 'gray', 'in-progress': 'blue', concluded: 'green', archived: 'gray' };
const STATUS_ORDER = ['exploring', 'in-progress', 'concluded', 'archived'];

export function renderResearchLog() {
  let panel = document.getElementById('research-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'research-log-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🔬 Research Log</h2><button class="ia-close" onclick="document.getElementById('research-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="rl-form" class="ia-form">
        <input id="rl-topic" placeholder="Tema *" required />
        <input id="rl-question" placeholder="Pregunta de investigación *" required />
        <textarea id="rl-findings" placeholder="Hallazgos / notas" rows="2"></textarea>
        <input id="rl-sources" placeholder="Fuentes (separadas por coma)" />
        <select id="rl-status"><option value="exploring">Explorando</option><option value="in-progress" selected>En progreso</option><option value="concluded">Concluido</option></select>
        <button type="submit" class="ia-btn">Agregar investigación</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <select id="rl-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text);flex:1">
          <option value="all">Todos</option><option value="exploring">Explorando</option><option value="in-progress">En progreso</option><option value="concluded">Concluido</option><option value="archived">Archivado</option>
        </select>
      </div>
      <div id="rl-stats" class="ia-stats-bar"></div>
      <div id="rl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('rl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), topic: document.getElementById('rl-topic').value.trim(), question: document.getElementById('rl-question').value.trim(), findings: document.getElementById('rl-findings').value.trim(), sources: document.getElementById('rl-sources').value.split(',').map(s => s.trim()).filter(Boolean), status: document.getElementById('rl-status').value, tags: [], createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('rl-status').value = 'in-progress';
    _refresh();
  };
  document.getElementById('rl-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('rl-filter')?.value || 'all';
  const all = load();
  const items = filter === 'all' ? all : all.filter(i => i.status === filter);
  const stats = document.getElementById('rl-stats');
  const list = document.getElementById('rl-list');
  if (!stats || !list) return;
  const active = all.filter(i => i.status === 'in-progress').length;
  const concluded = all.filter(i => i.status === 'concluded').length;
  stats.textContent = 'Total: ' + all.length + ' | En progreso: ' + active + ' | Concluidos: ' + concluded;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = STATUS_COLORS[item.status] || 'gray';
    const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(item.status) + 1) % STATUS_ORDER.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.topic;
    el.querySelectorAll('.ia-badge')[0].textContent = item.status;
    const [advBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + nextStatus;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.status = nextStatus; r.updatedAt = now(); save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('small').textContent = item.question.slice(0, 80) + (item.findings ? ' · ' + item.findings.slice(0, 60) : '');
    list.appendChild(el);
  });
}
