const KEY = 'kairos:conversations';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const TYPE_ICONS = { meeting: '🤝', call: '📞', chat: '💬', interview: '🎯', coaching: '🎓', other: '📝' };
const SENTIMENT_COLORS = { positive: 'green', neutral: 'gray', negative: 'red', mixed: 'blue' };

export function renderConversationJournal() {
  let panel = document.getElementById('convjournal-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'convjournal-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>💬 Conversation Journal</h2><button class="ia-close" onclick="document.getElementById('convjournal-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="cj-form" class="ia-form">
        <input id="cj-title" placeholder="Título *" required />
        <input id="cj-participants" placeholder="Participantes (coma separados) *" required />
        <div style="display:flex;gap:8px">
          <select id="cj-type" style="flex:1">
            <option value="meeting">🤝 Meeting</option>
            <option value="call">📞 Call</option>
            <option value="chat">💬 Chat</option>
            <option value="interview">🎯 Interview</option>
            <option value="coaching">🎓 Coaching</option>
            <option value="other">📝 Other</option>
          </select>
          <select id="cj-sentiment" style="flex:1">
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <input id="cj-duration" type="number" placeholder="Duración (minutos)" min="1" />
        <textarea id="cj-summary" placeholder="Resumen *" rows="3" required></textarea>
        <input id="cj-keypoints" placeholder="Puntos clave (separados por |)" />
        <input id="cj-actionitems" placeholder="Acciones a tomar (separadas por |)" />
        <button type="submit" class="ia-btn">Registrar conversación</button>
      </form>
      <div id="cj-stats" class="ia-stats-bar"></div>
      <div id="cj-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('cj-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const actionItemsRaw = document.getElementById('cj-actionitems').value.trim();
    const keyPointsRaw = document.getElementById('cj-keypoints').value.trim();
    items.push({
      id: uid(),
      title: document.getElementById('cj-title').value.trim(),
      participants: document.getElementById('cj-participants').value.trim(),
      type: document.getElementById('cj-type').value,
      sentiment: document.getElementById('cj-sentiment').value,
      duration: parseInt(document.getElementById('cj-duration').value) || null,
      summary: document.getElementById('cj-summary').value.trim(),
      keyPoints: keyPointsRaw ? keyPointsRaw.split('|').map(s => s.trim()).filter(Boolean) : [],
      actionItems: actionItemsRaw ? actionItemsRaw.split('|').map(s => s.trim()).filter(Boolean) : [],
      createdAt: now()
    });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const stats = document.getElementById('cj-stats');
  const list = document.getElementById('cj-list');
  if (!stats || !list) return;
  const items = load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const totalActions = items.reduce((sum, i) => sum + (i.actionItems ? i.actionItems.length : 0), 0);
  stats.textContent = 'Total: ' + items.length + ' | Acciones pendientes: ' + totalActions;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const icon = TYPE_ICONS[item.type] || '📝';
    const sentColor = SENTIMENT_COLORS[item.sentiment] || 'gray';
    const durationText = item.duration ? item.duration + 'min' : item.sentiment;
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge ' + sentColor + '"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = icon + ' ' + item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = item.participants;
    el.querySelectorAll('.ia-badge')[1].textContent = item.sentiment + (item.duration ? ' · ' + item.duration + 'min' : '');
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const actionCount = item.actionItems ? item.actionItems.length : 0;
    el.querySelector('small').textContent = item.summary.slice(0, 100) + (actionCount ? ' [' + actionCount + ' acciones]' : '');
    list.appendChild(el);
  });
}
