const KEY = 'kairos:retros';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_COLORS = { open: 'green', voting: 'blue', closed: 'gray' };
const STATUS_CYCLE = ['open', 'voting', 'closed'];

export function renderRetroBoard() {
  let panel = document.getElementById('retro-board-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'retro-board-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🔄 Retro Board</h2><button class="ia-close" onclick="document.getElementById('retro-board-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="rb-form" class="ia-form">
        <input id="rb-title" placeholder="Título de la retro *" required />
        <div style="display:flex;gap:8px">
          <input id="rb-team" placeholder="Equipo *" style="flex:1" required />
          <input id="rb-date" type="date" style="flex:1" required />
        </div>
        <div style="display:flex;gap:8px">
          <input id="rb-sprint" type="number" placeholder="Sprint # (opcional)" style="flex:1" />
          <input id="rb-facilitator" placeholder="Facilitador (opcional)" style="flex:1" />
        </div>
        <input id="rb-participants" placeholder="Participantes (separados por coma)" />
        <button type="submit" class="ia-btn">Crear retro</button>
      </form>
      <div id="rb-stats" class="ia-stats-bar"></div>
      <div id="rb-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('rb-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.unshift({
      id: uid(),
      title: document.getElementById('rb-title').value.trim(),
      team: document.getElementById('rb-team').value.trim(),
      date: document.getElementById('rb-date').value,
      sprintNumber: document.getElementById('rb-sprint').value ? Number(document.getElementById('rb-sprint').value) : null,
      facilitator: document.getElementById('rb-facilitator').value.trim(),
      participants: document.getElementById('rb-participants').value.split(',').map(s => s.trim()).filter(Boolean),
      status: 'open',
      wentWell: [],
      improve: [],
      actions: [],
      createdAt: now()
    });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const all = load();
  const stats = document.getElementById('rb-stats');
  const list = document.getElementById('rb-list');
  if (!stats || !list) return;
  const open = all.filter(r => r.status === 'open').length;
  const totalActions = all.reduce((s, r) => s + (r.actions?.length || 0), 0);
  stats.textContent = 'Total: ' + all.length + ' | Open: ' + open + ' | Total actions: ' + totalActions;
  list.innerHTML = '';
  all.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = STATUS_COLORS[item.status] || 'gray';
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge gray"></span><span class="ia-badge ' + color + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm green">+ items</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.team;
    badges[1].textContent = item.date || '';
    badges[2].textContent = item.status;
    const [advBtn, addItemsBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + next;
    advBtn.onclick = () => {
      const d = load(); const r = d.find(x => x.id === item.id);
      if (r) { r.status = next; save(d); _refresh(); }
    };
    addItemsBtn.onclick = () => {
      const cat = window.prompt('Categoría (w=went-well, i=improve, a=action):');
      if (!cat) return;
      const text = window.prompt('Texto del item:');
      if (!text?.trim()) return;
      const d = load(); const r = d.find(x => x.id === item.id);
      if (!r) return;
      const entry = { id: uid(), text: text.trim(), votes: 0 };
      if (cat.toLowerCase() === 'w') r.wentWell.push(entry);
      else if (cat.toLowerCase() === 'i') r.improve.push(entry);
      else if (cat.toLowerCase() === 'a') r.actions.push(entry);
      save(d); _refresh();
    };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const ww = item.wentWell?.length || 0;
    const imp = item.improve?.length || 0;
    const act = item.actions?.length || 0;
    el.querySelector('small').textContent = '✅ ' + ww + ' went well | 🔧 ' + imp + ' improve | ⚡ ' + act + ' actions';
    list.appendChild(el);
  });
}
