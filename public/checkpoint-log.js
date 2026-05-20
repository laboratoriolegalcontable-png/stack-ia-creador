const KEY = 'kairos:checkpoint-log';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderCheckpointLog() {
  let panel = document.getElementById('checkpoint-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'checkpoint-log-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📍 Checkpoint Log</h2><button class="ia-close" onclick="document.getElementById('checkpoint-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="cpl-form" class="ia-form">
        <input id="cpl-label" placeholder="Etiqueta del checkpoint *" required />
        <textarea id="cpl-state" placeholder="Estado / contexto guardado *" rows="3" required></textarea>
        <input id="cpl-project" placeholder="Proyecto / área" />
        <button type="submit" class="ia-btn">Guardar checkpoint</button>
      </form>
      <div id="cpl-stats" class="ia-stats-bar"></div>
      <div id="cpl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('cpl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), label: document.getElementById('cpl-label').value.trim(), state: document.getElementById('cpl-state').value.trim(), project: document.getElementById('cpl-project').value.trim(), createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('cpl-stats');
  const list = document.getElementById('cpl-list');
  if (!stats || !list) return;
  const projects = [...new Set(items.map(i => i.project).filter(Boolean))];
  stats.textContent = 'Checkpoints: ' + items.length + ' | Proyectos: ' + projects.length;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong>' + (item.project ? '<span class="ia-badge blue"></span>' : '') + '<button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.label;
    if (item.project) el.querySelector('.ia-badge').textContent = item.project;
    el.querySelector('small').textContent = item.state.slice(0, 120);
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
