const KEY = 'kairos:reading-challenge';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STATUS_COLORS = { active: 'blue', completed: 'green', abandoned: 'gray' };

export function renderReadingChallenge() {
  let panel = document.getElementById('reading-challenge-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'reading-challenge-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📖 Reading Challenge</h2><button class="ia-close" onclick="document.getElementById('reading-challenge-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="rc-form" class="ia-form">
        <input id="rc-title" placeholder="Título del challenge *" required />
        <input id="rc-goal" type="number" placeholder="Meta (libros/páginas) *" min="1" required />
        <input id="rc-unit" placeholder="Unidad (libros, páginas, artículos…)" value="libros" />
        <input id="rc-deadline" type="date" placeholder="Fecha límite" />
        <textarea id="rc-notes" placeholder="Notas / motivación" rows="1"></textarea>
        <button type="submit" class="ia-btn">Crear challenge</button>
      </form>
      <div id="rc-stats" class="ia-stats-bar"></div>
      <div id="rc-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('rc-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const goal = parseInt(document.getElementById('rc-goal').value) || 1;
    items.push({ id: uid(), title: document.getElementById('rc-title').value.trim(), goal, unit: document.getElementById('rc-unit').value.trim() || 'libros', deadline: document.getElementById('rc-deadline').value, notes: document.getElementById('rc-notes').value.trim(), progress: 0, status: 'active', createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('rc-unit').value = 'libros';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('rc-stats');
  const list = document.getElementById('rc-list');
  if (!stats || !list) return;
  const active = items.filter(i => i.status === 'active').length;
  const completed = items.filter(i => i.status === 'completed').length;
  stats.textContent = 'Total: ' + items.length + ' | Activos: ' + active + ' | Completados: ' + completed;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = STATUS_COLORS[item.status] || 'gray';
    const pct = item.goal > 0 ? Math.min(100, Math.round((item.progress / item.goal) * 100)) : 0;
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><span class="ia-badge"></span><button class="ia-btn-sm blue" title="Incrementar progreso">+1</button><button class="ia-btn-sm red">✕</button></div><small></small><div class="ia-progress" style="height:4px;background:var(--color-border);border-radius:2px;margin-top:4px"><div style="height:100%;border-radius:2px;background:var(--color-primary);width:' + pct + '%"></div></div>';
    el.querySelector('strong').textContent = item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.status;
    el.querySelectorAll('.ia-badge')[1].textContent = item.progress + '/' + item.goal + ' ' + (item.unit || 'libros');
    el.querySelector('small').textContent = (item.deadline ? 'Límite: ' + item.deadline + ' · ' : '') + pct + '% completado';
    const [incrBtn, delBtn] = el.querySelectorAll('button');
    incrBtn.onclick = () => {
      const d = load(); const c = d.find(x => x.id === item.id);
      if (c) { c.progress = Math.min(c.goal, (c.progress || 0) + 1); if (c.progress >= c.goal) c.status = 'completed'; save(d); _refresh(); }
    };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
