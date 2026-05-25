const KEY = 'kairos:incidents';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const SEV_COLORS = { P1: 'red', P2: 'red', P3: 'blue', P4: 'gray' };
const SEV_ICONS  = { P1: '🔴', P2: '🟠', P3: '🟡', P4: '🟢' };
const STATUS_COLORS = { open: 'red', investigating: 'blue', mitigated: 'blue', resolved: 'green', 'post-mortem': 'gray' };
const STATUS_CYCLE = ['open', 'investigating', 'mitigated', 'resolved', 'post-mortem'];

export function renderIncidentLog() {
  let panel = document.getElementById('incident-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'incident-log-panel';
  panel.className = 'ia-panel';
  const nowDt = new Date().toISOString().slice(0, 16);
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🚨 Incident Log</h2><button class="ia-close" onclick="document.getElementById('incident-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="il-form" class="ia-form">
        <input id="il-title" placeholder="Título del incidente *" required />
        <textarea id="il-description" placeholder="Descripción *" rows="2" required></textarea>
        <div style="display:flex;gap:8px">
          <select id="il-severity" style="flex:1">
            <option value="P1">P1 🔴 Crítico</option>
            <option value="P2" selected>P2 🟠 Alto</option>
            <option value="P3">P3 🟡 Medio</option>
            <option value="P4">P4 🟢 Bajo</option>
          </select>
          <input id="il-reported-by" placeholder="Reportado por *" style="flex:1" required />
        </div>
        <div style="display:flex;gap:8px">
          <input id="il-started-at" type="datetime-local" style="flex:1" value="${nowDt}" />
          <input id="il-assigned-to" placeholder="Asignado a (opcional)" style="flex:1" />
        </div>
        <input id="il-services" placeholder="Servicios afectados (separados por coma)" />
        <button type="submit" class="ia-btn">Registrar incidente</button>
      </form>
      <div id="il-stats" class="ia-stats-bar"></div>
      <div id="il-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('il-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.unshift({
      id: uid(),
      title: document.getElementById('il-title').value.trim(),
      description: document.getElementById('il-description').value.trim(),
      severity: document.getElementById('il-severity').value,
      reportedBy: document.getElementById('il-reported-by').value.trim(),
      startedAt: document.getElementById('il-started-at').value,
      assignedTo: document.getElementById('il-assigned-to').value.trim(),
      affectedServices: document.getElementById('il-services').value.split(',').map(s => s.trim()).filter(Boolean),
      status: 'open',
      timeline: [],
      tags: [],
      createdAt: now()
    });
    save(items);
    e.target.reset();
    document.getElementById('il-started-at').value = new Date().toISOString().slice(0, 16);
    document.getElementById('il-severity').value = 'P2';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const all = load();
  const stats = document.getElementById('il-stats');
  const list = document.getElementById('il-list');
  if (!stats || !list) return;
  const open = all.filter(i => i.status === 'open' || i.status === 'investigating' || i.status === 'mitigated').length;
  const p1 = all.filter(i => i.severity === 'P1').length;
  const resolved = all.filter(i => i.durationMinutes != null);
  const avgRes = resolved.length ? Math.round(resolved.reduce((s, i) => s + i.durationMinutes, 0) / resolved.length) : null;
  stats.textContent = 'Total: ' + all.length + ' | Open: ' + open + ' | P1: ' + p1 + (avgRes != null ? ' | Avg resolution: ' + avgRes + 'min' : '');
  list.innerHTML = '';
  all.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const sevColor = SEV_COLORS[item.severity] || 'gray';
    const stColor = STATUS_COLORS[item.status] || 'gray';
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    const isResolvable = item.status === 'mitigated';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + sevColor + '"></span><span class="ia-badge ' + stColor + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm gray">+ note</button>' + (isResolvable ? '<button class="ia-btn-sm green">✓ resolve</button>' : '') + '<button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = (SEV_ICONS[item.severity] || '') + ' ' + item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.severity;
    badges[1].textContent = item.status;
    const btns = el.querySelectorAll('button');
    let btnIdx = 0;
    const advBtn = btns[btnIdx++];
    advBtn.textContent = '→ ' + next;
    advBtn.onclick = () => {
      const d = load(); const r = d.find(x => x.id === item.id);
      if (r) { r.status = next; save(d); _refresh(); }
    };
    const noteBtn = btns[btnIdx++];
    noteBtn.onclick = () => {
      const raw = window.prompt('note|author (ej: "Se reinició el servicio|Juan"):');
      if (!raw?.trim()) return;
      const [noteText, author] = raw.split('|').map(s => s.trim());
      const d = load(); const r = d.find(x => x.id === item.id);
      if (r) { r.timeline.push({ id: uid(), note: noteText, author: author || '', at: now() }); save(d); _refresh(); }
    };
    if (isResolvable) {
      const resolveBtn = btns[btnIdx++];
      resolveBtn.onclick = () => {
        const raw = window.prompt('rootCause|resolution:');
        if (!raw?.trim()) return;
        const [rootCause, resolution] = raw.split('|').map(s => s.trim());
        const d = load(); const r = d.find(x => x.id === item.id);
        if (r) {
          r.status = 'resolved';
          r.resolvedAt = now();
          r.rootCause = rootCause || '';
          r.resolution = resolution || '';
          if (r.startedAt) {
            const ms = new Date(r.resolvedAt) - new Date(r.startedAt);
            r.durationMinutes = Math.round(ms / 60000);
          }
          save(d); _refresh();
        }
      };
    }
    const delBtn = btns[btnIdx++];
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const svcText = item.affectedServices?.length ? item.affectedServices.join(', ') : '';
    const durText = item.durationMinutes != null ? ' · ' + item.durationMinutes + 'min' : '';
    el.querySelector('small').textContent = (svcText ? svcText + ' · ' : '') + (item.reportedBy || '') + durText;
    list.appendChild(el);
  });
}
