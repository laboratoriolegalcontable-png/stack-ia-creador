const KEY = 'kairos:courses';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderCourseTracker() {
  let panel = document.getElementById('course-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'course-tracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🎓 Cursos</h2><button class="ia-close" onclick="document.getElementById('course-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ct-form" class="ia-form">
        <input id="ct-name" placeholder="Nombre del curso *" required />
        <input id="ct-platform" placeholder="Plataforma (Udemy, Coursera…)" />
        <input id="ct-url" placeholder="URL" />
        <input id="ct-lessons" type="number" placeholder="Total de lecciones" min="1" />
        <input id="ct-hours" type="number" placeholder="Horas estimadas" min="0" step="0.5" />
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div id="ct-stats" class="ia-stats-bar"></div>
      <div id="ct-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ct-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), name: document.getElementById('ct-name').value.trim(), platform: document.getElementById('ct-platform').value.trim(), url: document.getElementById('ct-url').value.trim(), totalLessons: +document.getElementById('ct-lessons').value || 0, completedLessons: 0, estimatedHours: +document.getElementById('ct-hours').value || 0, hoursSpent: 0, status: 'enrolled', rating: 0, certificate: false, createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('ct-stats');
  const list = document.getElementById('ct-list');
  if (!stats || !list) return;
  const completed = items.filter(i => i.status === 'completed').length;
  const inProgress = items.filter(i => i.status === 'in-progress').length;
  stats.textContent = `Total: ${items.length} | En curso: ${inProgress} | Completados: ${completed}`;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const pct = item.totalLessons > 0 ? Math.round(item.completedLessons / item.totalLessons * 100) : 0;
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const statusColor = item.status === 'completed' ? 'green' : item.status === 'in-progress' ? 'blue' : 'gray';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge ${statusColor}">${item.status}</span><button class="ia-btn-sm" data-prog="${item.id}">+</button><button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.name + (item.platform ? ` · ${item.platform}` : '');
    el.querySelector('small').textContent = item.totalLessons > 0 ? `${item.completedLessons}/${item.totalLessons} lecciones (${pct}%) · ${item.hoursSpent}h invertidas` : `${item.hoursSpent}h invertidas`;
    el.querySelector('[data-prog]').onclick = () => {
      const d = load(); const c = d.find(x => x.id === item.id); if (!c) return;
      const lessons = +(prompt('Lecciones completadas:', c.completedLessons) || c.completedLessons);
      const hours = +(prompt('Horas invertidas:', c.hoursSpent) || c.hoursSpent);
      c.completedLessons = lessons; c.hoursSpent = hours;
      if (c.totalLessons > 0 && lessons >= c.totalLessons) c.status = 'completed';
      else if (lessons > 0) c.status = 'in-progress';
      c.updatedAt = now(); save(d); _refresh();
    };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
