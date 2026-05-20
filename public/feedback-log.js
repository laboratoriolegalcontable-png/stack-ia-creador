const KEY = 'kairos:feedback-log';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const SENTIMENT_COLORS = { positive: 'green', constructive: 'blue', negative: 'red' };
const SENTIMENT_ICONS = { positive: '👍', constructive: '🔧', negative: '⚠️' };

export function renderFeedbackLog() {
  let panel = document.getElementById('feedback-log-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'feedback-log-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>💬 Feedback Log</h2><button class="ia-close" onclick="document.getElementById('feedback-log-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="fl-form" class="ia-form">
        <input id="fl-source" placeholder="Fuente / quién *" required />
        <textarea id="fl-content" placeholder="Feedback *" rows="2" required></textarea>
        <div style="display:flex;gap:8px">
          <select id="fl-direction" style="flex:1"><option value="received">Recibido</option><option value="given">Dado</option></select>
          <select id="fl-sentiment" style="flex:1"><option value="positive">👍 Positivo</option><option value="constructive" selected>🔧 Constructivo</option><option value="negative">⚠️ Negativo</option></select>
        </div>
        <input id="fl-context" placeholder="Contexto (proyecto, reunión…)" />
        <textarea id="fl-action" placeholder="Acción a tomar" rows="1"></textarea>
        <button type="submit" class="ia-btn">Registrar feedback</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="fl-filter-dir" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos</option><option value="received">Recibido</option><option value="given">Dado</option>
        </select>
        <select id="fl-filter-sent" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todos</option><option value="positive">Positivo</option><option value="constructive">Constructivo</option><option value="negative">Negativo</option>
        </select>
      </div>
      <div id="fl-stats" class="ia-stats-bar"></div>
      <div id="fl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('fl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), source: document.getElementById('fl-source').value.trim(), content: document.getElementById('fl-content').value.trim(), direction: document.getElementById('fl-direction').value, sentiment: document.getElementById('fl-sentiment').value, context: document.getElementById('fl-context').value.trim(), action: document.getElementById('fl-action').value.trim(), createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('fl-sentiment').value = 'constructive';
    _refresh();
  };
  document.getElementById('fl-filter-dir').onchange = _refresh;
  document.getElementById('fl-filter-sent').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const dir = document.getElementById('fl-filter-dir')?.value || 'all';
  const sent = document.getElementById('fl-filter-sent')?.value || 'all';
  const all = load();
  let items = all;
  if (dir !== 'all') items = items.filter(i => i.direction === dir);
  if (sent !== 'all') items = items.filter(i => i.sentiment === sent);
  const stats = document.getElementById('fl-stats');
  const list = document.getElementById('fl-list');
  if (!stats || !list) return;
  const pos = all.filter(i => i.sentiment === 'positive').length;
  const con = all.filter(i => i.sentiment === 'constructive').length;
  stats.textContent = 'Total: ' + all.length + ' | 👍' + pos + ' 🔧' + con + ' ⚠️' + (all.length - pos - con);
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = SENTIMENT_COLORS[item.sentiment] || 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.source;
    el.querySelectorAll('.ia-badge')[0].textContent = (SENTIMENT_ICONS[item.sentiment] || '') + ' ' + item.sentiment;
    el.querySelectorAll('.ia-badge')[1].textContent = item.direction === 'received' ? '← recibido' : '→ dado';
    el.querySelector('small').textContent = item.content.slice(0, 120) + (item.action ? ' · Acción: ' + item.action.slice(0, 60) : '');
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
