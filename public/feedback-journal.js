const KEY = 'kairos:feedback';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const TYPE_ICON   = { received: '📥', given: '📤' };
const SRC_ICON    = { peer: '👥', manager: '👔', report: '📋', client: '🤝', self: '🪞', other: '📝' };
const THEME_ICON  = { communication: '🗣️', technical: '💻', leadership: '🏆', collaboration: '🤝', delivery: '📦', attitude: '💫', other: '📝' };
const SENT_COLOR  = { positive: 'green', constructive: 'blue', neutral: 'gray', mixed: 'blue' };

export function renderFeedbackJournal() {
  let panel = document.getElementById('feedback-journal-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'feedback-journal-panel';
  panel.className = 'ia-panel';
  const today = new Date().toISOString().slice(0, 10);
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>💬 Feedback Journal</h2><button class="ia-close" onclick="document.getElementById('feedback-journal-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="fj-form" class="ia-form">
        <div style="display:flex;gap:8px">
          <select id="fj-type" style="flex:1">
            <option value="received">📥 Received</option><option value="given">📤 Given</option>
          </select>
          <select id="fj-source" style="flex:1">
            <option value="peer">👥 Peer</option><option value="manager">👔 Manager</option><option value="report">📋 Report</option><option value="client">🤝 Client</option><option value="self">🪞 Self</option><option value="other">📝 Other</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <input id="fj-person" placeholder="Persona *" required style="flex:2" />
          <input id="fj-date" type="date" value="${today}" required style="flex:1" />
        </div>
        <div style="display:flex;gap:8px">
          <select id="fj-theme" style="flex:1">
            <option value="communication">🗣️ Communication</option><option value="technical">💻 Technical</option><option value="leadership">🏆 Leadership</option><option value="collaboration">🤝 Collaboration</option><option value="delivery">📦 Delivery</option><option value="attitude">💫 Attitude</option><option value="other">📝 Other</option>
          </select>
          <select id="fj-sentiment" style="flex:1">
            <option value="positive">Positive</option><option value="constructive">Constructive</option><option value="neutral">Neutral</option><option value="mixed">Mixed</option>
          </select>
        </div>
        <textarea id="fj-content" placeholder="Contenido *" rows="3" required></textarea>
        <input id="fj-context" placeholder="Contexto (opcional)" />
        <input id="fj-actions" placeholder="Acciones tomadas (opcional)" />
        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem"><input id="fj-private" type="checkbox" /> Privado</label>
        <button type="submit" class="ia-btn">Guardar feedback</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <button class="ia-btn-sm gray" id="fj-tab-all">Todos</button>
        <button class="ia-btn-sm gray" id="fj-tab-received">📥 Received</button>
        <button class="ia-btn-sm gray" id="fj-tab-given">📤 Given</button>
      </div>
      <div id="fj-stats" class="ia-stats-bar"></div>
      <div id="fj-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  panel._filter = 'all';
  document.getElementById('fj-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.unshift({
      id: uid(),
      type: document.getElementById('fj-type').value,
      source: document.getElementById('fj-source').value,
      person: document.getElementById('fj-person').value.trim(),
      theme: document.getElementById('fj-theme').value,
      sentiment: document.getElementById('fj-sentiment').value,
      date: document.getElementById('fj-date').value,
      content: document.getElementById('fj-content').value.trim(),
      context: document.getElementById('fj-context').value.trim(),
      actionsTaken: document.getElementById('fj-actions').value.trim(),
      private: document.getElementById('fj-private').checked,
      createdAt: now()
    });
    save(items);
    e.target.reset();
    document.getElementById('fj-date').value = new Date().toISOString().slice(0, 10);
    _refresh();
  };
  const setTab = t => { panel._filter = t; _refresh(); };
  document.getElementById('fj-tab-all').onclick      = () => setTab('all');
  document.getElementById('fj-tab-received').onclick = () => setTab('received');
  document.getElementById('fj-tab-given').onclick    = () => setTab('given');
  _refresh();
}

function _refresh() {
  const panel = document.getElementById('feedback-journal-panel');
  const all = load();
  const stats = document.getElementById('fj-stats');
  const list = document.getElementById('fj-list');
  if (!stats || !list) return;

  const received = all.filter(i => i.type === 'received').length;
  const given = all.filter(i => i.type === 'given').length;
  const posRatio = all.length ? Math.round(all.filter(i => i.sentiment === 'positive').length / all.length * 100) : 0;
  stats.textContent = 'Total: ' + all.length + ' | Received: ' + received + ' | Given: ' + given + ' | Positivo: ' + posRatio + '%';

  const filter = panel?._filter || 'all';
  const filtered = filter === 'all' ? all : all.filter(i => i.type === filter);

  list.innerHTML = '';
  filtered.sort((a, b) => b.date.localeCompare(a.date)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const typeIcon = TYPE_ICON[item.type] || '💬';
    const sentCol = SENT_COLOR[item.sentiment] || 'gray';
    const label = item.type === 'received' ? 'From' : 'To';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + sentCol + '"></span><span class="ia-badge gray"></span><span class="ia-badge gray"></span><button class="ia-btn-sm blue">+ acciones</button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = typeIcon + ' ' + label + ': ' + item.person;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.sentiment;
    badges[1].textContent = (THEME_ICON[item.theme] || '') + ' ' + item.theme;
    badges[2].textContent = item.date;
    const [actBtn, delBtn] = el.querySelectorAll('button');
    actBtn.onclick = () => {
      const action = prompt('¿Qué acciones tomaste?');
      if (!action) return;
      const d = load(); const r = d.find(x => x.id === item.id);
      if (r) { r.actionsTaken = (r.actionsTaken ? r.actionsTaken + '; ' : '') + action.trim(); save(d); _refresh(); }
    };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const preview = item.private ? '[Privado]' : item.content.slice(0, 80);
    el.querySelector('small').textContent = preview;
    list.appendChild(el);
  });
}
