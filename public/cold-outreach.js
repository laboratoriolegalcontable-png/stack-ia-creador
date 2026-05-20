/**
 * cold-outreach.js — Tracker de cold outreach
 * @module cold-outreach
 */

const KEY = 'kairos:cold-outreach';
const STATUSES = ['draft', 'sent', 'opened', 'replied', 'meeting-booked', 'closed', 'no-response'];
const CHANNELS = ['email', 'linkedin', 'twitter', 'whatsapp', 'instagram', 'phone', 'other'];

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  const sent = items.filter(c => c.status !== 'draft').length;
  const replied = items.filter(c => ['replied', 'meeting-booked', 'closed'].includes(c.status)).length;
  const meetings = items.filter(c => c.status === 'meeting-booked').length;
  const replyRate = sent > 0 ? +(replied / sent * 100).toFixed(1) : 0;
  const byChannel = {};
  for (const c of items) byChannel[c.channel] = (byChannel[c.channel] || 0) + 1;
  return { total: items.length, sent, replied, meetings, replyRate, byChannel };
}

export function renderColdOutreach() {
  const existing = document.getElementById('cold-outreach-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'cold-outreach-panel';
  panel.className = 'kairos-panel';
  const chanOpts = CHANNELS.map(c => `<option value="${c}">${c}</option>`).join('');
  panel.innerHTML = `
    <div class="panel-header"><strong>/outreach — Cold Outreach</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="outreach-stats"></div>
    <form id="outreach-form" class="panel-form">
      <input id="out-name" placeholder="Nombre del contacto" required>
      <input id="out-company" placeholder="Empresa">
      <input id="out-role" placeholder="Rol / cargo">
      <select id="out-channel">${chanOpts}</select>
      <input id="out-subject" placeholder="Asunto / objetivo">
      <textarea id="out-message" placeholder="Mensaje enviado..." rows="3" required></textarea>
      <input id="out-followup" placeholder="Seguimiento (YYYY-MM-DD)">
      <button type="submit">Registrar contacto</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      ${STATUSES.map(s => `<button class="filter-btn" data-filter="${s}">${s}</button>`).join('')}
    </div>
    <ul id="outreach-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#outreach-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('out-name').value.trim();
    const company = document.getElementById('out-company').value.trim();
    const role = document.getElementById('out-role').value.trim();
    const channel = document.getElementById('out-channel').value;
    const subject = document.getElementById('out-subject').value.trim();
    const message = document.getElementById('out-message').value.trim();
    const followupDate = document.getElementById('out-followup').value.trim();
    if (!name || !message) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), name, company, role, channel, subject, message, status: 'draft', followupDate, notes: '', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
    const statsEl = document.getElementById('outreach-stats');
    if (statsEl) statsEl.textContent = `Total: ${stats.total} · Enviados: ${stats.sent} · Reply rate: ${stats.replyRate}% · Reuniones: ${stats.meetings}`;
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'all' ? items : items.filter(i => i.status === activeFilter);
    const list = document.getElementById('outreach-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = item.name + (item.company ? ` @ ${item.company}` : '');
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.channel} · ${item.status}${item.followupDate ? ' · followup: ' + item.followupDate : ''}`;
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
