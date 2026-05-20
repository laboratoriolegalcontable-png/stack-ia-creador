const KEY = 'kairos:session-replay';
const MAX_EVENTS = 200;
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '{"events":[],"sessionId":null}'); return d && Array.isArray(d.events) ? d : { events: [], sessionId: null }; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function now() { return new Date().toISOString(); }

export function renderSessionReplay() {
  let panel = document.getElementById('session-replay-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'session-replay-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🎬 Session Replay</h2><button class="ia-close" onclick="document.getElementById('session-replay-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="sr-form" class="ia-form">
        <select id="sr-type"><option value="click">Click</option><option value="navigation">Navegación</option><option value="input">Input</option><option value="command">Comando</option><option value="error">Error</option></select>
        <input id="sr-data" placeholder="Descripción del evento *" required />
        <button type="submit" class="ia-btn">Registrar evento</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <button class="ia-btn-sm blue" id="sr-new-session">Nueva sesión</button>
        <button class="ia-btn-sm red" id="sr-clear">Limpiar</button>
      </div>
      <div id="sr-stats" class="ia-stats-bar"></div>
      <div id="sr-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('sr-form').onsubmit = e => {
    e.preventDefault();
    const state = load();
    if (!state.sessionId) state.sessionId = crypto.randomUUID();
    state.events.push({ type: document.getElementById('sr-type').value, data: document.getElementById('sr-data').value.trim(), sessionId: state.sessionId, timestamp: now() });
    if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
    save(state);
    e.target.reset();
    _refresh();
  };
  document.getElementById('sr-new-session').onclick = () => { const s = load(); s.sessionId = crypto.randomUUID(); save(s); _refresh(); };
  document.getElementById('sr-clear').onclick = () => { save({ events: [], sessionId: null }); _refresh(); };
  _refresh();
}

const TYPE_ICONS = { click: '🖱️', navigation: '🧭', input: '⌨️', command: '⚡', error: '❌' };

function _refresh() {
  const state = load();
  const stats = document.getElementById('sr-stats');
  const list = document.getElementById('sr-list');
  if (!stats || !list) return;
  const sessions = [...new Set(state.events.map(e => e.sessionId))];
  stats.textContent = 'Eventos: ' + state.events.length + ' | Sesiones: ' + sessions.length + ' | ID actual: ' + (state.sessionId ? state.sessionId.slice(0, 8) + '…' : 'ninguna');
  list.innerHTML = '';
  [...state.events].reverse().slice(0, 50).forEach(ev => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge blue"></span></div>';
    el.querySelector('strong').textContent = (TYPE_ICONS[ev.type] || '•') + ' ' + ev.data.slice(0, 80);
    el.querySelectorAll('.ia-badge')[0].textContent = ev.type;
    el.querySelectorAll('.ia-badge')[1].textContent = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : '';
    list.appendChild(el);
  });
}
