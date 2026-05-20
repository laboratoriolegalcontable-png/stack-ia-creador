const KEY = 'kairos:voice-notes';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const CAT_ICONS = { idea: '💡', reminder: '🔔', observation: '👁️', meeting: '🤝', learning: '📚', other: '📝' };

export function renderVoiceNotes() {
  let panel = document.getElementById('voice-notes-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'voice-notes-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🎙️ Voice Notes</h2><button class="ia-close" onclick="document.getElementById('voice-notes-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="vn-form" class="ia-form">
        <input id="vn-title" placeholder="Título *" required />
        <select id="vn-category">
          <option value="idea">💡 Idea</option>
          <option value="reminder">🔔 Recordatorio</option>
          <option value="observation">👁️ Observación</option>
          <option value="meeting">🤝 Reunión</option>
          <option value="learning">📚 Aprendizaje</option>
          <option value="other">📝 Otro</option>
        </select>
        <textarea id="vn-transcript" placeholder="Transcripción / contenido *" rows="3" required></textarea>
        <div style="display:flex;gap:8px">
          <input id="vn-duration" type="number" min="0" placeholder="Duración (segundos)" style="flex:1" />
          <input id="vn-tags" placeholder="Tags (separados por coma)" style="flex:2" />
        </div>
        <input id="vn-actions" placeholder="Action items (separados por |)" />
        <button type="submit" class="ia-btn">Guardar nota</button>
      </form>
      <div id="vn-stats" class="ia-stats-bar"></div>
      <div id="vn-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('vn-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const durVal = document.getElementById('vn-duration').value.trim();
    items.push({
      id: uid(),
      title: document.getElementById('vn-title').value.trim(),
      category: document.getElementById('vn-category').value,
      transcript: document.getElementById('vn-transcript').value.trim(),
      duration: durVal ? parseInt(durVal, 10) : null,
      tags: document.getElementById('vn-tags').value.trim(),
      actionItems: document.getElementById('vn-actions').value.trim(),
      processed: false,
      createdAt: now()
    });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const stats = document.getElementById('vn-stats');
  const list = document.getElementById('vn-list');
  if (!stats || !list) return;
  const all = load();
  const processed = all.filter(i => i.processed).length;
  const pending = all.length - processed;
  stats.textContent = 'Total: ' + all.length + ' | Procesadas: ' + processed + ' | Pendientes: ' + pending;
  list.innerHTML = '';
  all.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const icon = CAT_ICONS[item.category] || '📝';
    const procBadgeClass = item.processed ? 'green' : 'gray';
    const procBadgeText = item.processed ? '✓ procesada' : 'pendiente';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge blue"></span><span class="ia-badge ' + procBadgeClass + '"></span><button class="ia-btn-sm green"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = icon + ' ' + item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.category;
    badges[1].textContent = procBadgeText;
    const [toggleBtn, delBtn] = el.querySelectorAll('button');
    toggleBtn.textContent = '✓';
    toggleBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.processed = !r.processed; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const preview = item.transcript ? item.transcript.slice(0, 100) : '';
    const actionCount = item.actionItems ? item.actionItems.split('|').filter(a => a.trim()).length : 0;
    const actionText = actionCount ? ' [' + actionCount + ' acciones]' : '';
    el.querySelector('small').textContent = preview + actionText;
    list.appendChild(el);
  });
}
