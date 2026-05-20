/**
 * job-applications.js — Seguimiento de postulaciones laborales
 * @module job-applications
 */

const KEY = 'kairos:job-applications';
const STATUSES = ['saved', 'applied', 'phone-screen', 'interview', 'offer', 'rejected', 'withdrawn'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const activeStatuses = ['applied', 'phone-screen', 'interview'];
  const active = items.filter(a => activeStatuses.includes(a.status)).length;
  const offers = items.filter(a => a.status === 'offer').length;
  const applied = items.filter(a => a.status !== 'saved').length;
  const conversionRate = applied > 0 ? +(offers / applied * 100).toFixed(1) : 0;
  const byStatus = {};
  for (const a of items) byStatus[a.status] = (byStatus[a.status] || 0) + 1;
  return { total: items.length, active, offers, conversionRate, byStatus };
}

export function renderJobApplications() {
  const existing = document.getElementById('job-applications-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'job-applications-panel';
  panel.className = 'kairos-panel';
  const statusOpts = STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/jobs — Postulaciones</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="jobs-stats"></div>
    <form id="jobs-form" class="panel-form">
      <input id="job-company" placeholder="Empresa" required>
      <input id="job-role" placeholder="Rol / puesto" required>
      <input id="job-url" placeholder="URL oferta (opcional)">
      <input id="job-salary" placeholder="Salario estimado">
      <input id="job-notes" placeholder="Notas">
      <button type="submit">Agregar postulación</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todas</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="jobs-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#jobs-form').addEventListener('submit', e => {
    e.preventDefault();
    const company = document.getElementById('job-company').value.trim();
    const role = document.getElementById('job-role').value.trim();
    const url = document.getElementById('job-url').value.trim();
    const salary = document.getElementById('job-salary').value.trim();
    const notes = document.getElementById('job-notes').value.trim();
    if (!company || !role) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), company, role, url, salary, notes, status: 'saved', contacts: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    save(items);
    e.target.reset();
    _refresh();
  });

  panel.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _refresh();
    });
  });

  _refresh();

  function _refresh() {
    const items = load();
    const stats = getStats(items);
    const statsEl = document.getElementById('jobs-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Activas: ${stats.active} · Ofertas: ${stats.offers} · Conversión: ${stats.conversionRate}%`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('jobs-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${item.company} — ${item.role}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.status}${item.salary ? ' · ' + item.salary : ''}${item.notes ? ' · ' + item.notes : ''}`;
      const statusSelect = document.createElement('select');
      statusSelect.className = 'item-action';
      STATUSES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === item.status) opt.selected = true;
        statusSelect.appendChild(opt);
      });
      statusSelect.addEventListener('change', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].status = statusSelect.value; all[idx].updatedAt = new Date().toISOString(); save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, statusSelect, del);
      list.appendChild(li);
    }
  }
}
