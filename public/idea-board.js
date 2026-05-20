const KEY = 'kairos:ideas-board';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const STAGES = ['backlog', 'exploring', 'validating', 'building', 'launched', 'parked'];
const STAGE_ICONS = { backlog: '📥', exploring: '🔍', validating: '🧪', building: '🔨', launched: '🚀', parked: '🅿️' };
const STAGE_COLORS = { backlog: 'gray', exploring: 'blue', validating: 'blue', building: 'green', launched: 'green', parked: 'red' };
const IMPACT_COLORS = { low: 'gray', medium: 'blue', high: 'green' };

export function renderIdeaBoard() {
  let panel = document.getElementById('idea-board-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'idea-board-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>💡 Idea Board</h2><button class="ia-close" onclick="document.getElementById('idea-board-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ib-form" class="ia-form">
        <input id="ib-title" placeholder="Título *" required />
        <textarea id="ib-desc" placeholder="Descripción *" rows="2" required></textarea>
        <div style="display:flex;gap:8px">
          <select id="ib-stage" style="flex:1">
            <option value="backlog">📥 Backlog</option>
            <option value="exploring">🔍 Exploring</option>
            <option value="validating">🧪 Validating</option>
            <option value="building">🔨 Building</option>
            <option value="launched">🚀 Launched</option>
            <option value="parked">🅿️ Parked</option>
          </select>
          <select id="ib-impact" style="flex:1">
            <option value="low">Impacto: Bajo</option>
            <option value="medium" selected>Impacto: Medio</option>
            <option value="high">Impacto: Alto</option>
          </select>
          <select id="ib-effort" style="flex:1">
            <option value="low">Esfuerzo: Bajo</option>
            <option value="medium" selected>Esfuerzo: Medio</option>
            <option value="high">Esfuerzo: Alto</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <input id="ib-tags" placeholder="tags (coma)" style="flex:1" />
          <input id="ib-related" placeholder="Relacionado con (opcional)" style="flex:1" />
        </div>
        <button type="submit" class="ia-btn">Agregar idea</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap" id="ib-stage-filters">
        <button class="ia-btn-sm gray" data-stage="all">Todas</button>
        <button class="ia-btn-sm gray" data-stage="backlog">📥</button>
        <button class="ia-btn-sm gray" data-stage="exploring">🔍</button>
        <button class="ia-btn-sm gray" data-stage="validating">🧪</button>
        <button class="ia-btn-sm gray" data-stage="building">🔨</button>
        <button class="ia-btn-sm gray" data-stage="launched">🚀</button>
        <button class="ia-btn-sm gray" data-stage="parked">🅿️</button>
      </div>
      <div id="ib-stats" class="ia-stats-bar"></div>
      <div id="ib-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ib-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({
      id: uid(), createdAt: now(), votes: 0,
      title: document.getElementById('ib-title').value.trim(),
      description: document.getElementById('ib-desc').value.trim(),
      stage: document.getElementById('ib-stage').value,
      impact: document.getElementById('ib-impact').value,
      effort: document.getElementById('ib-effort').value,
      tags: document.getElementById('ib-tags').value.trim(),
      relatedTo: document.getElementById('ib-related').value.trim()
    });
    save(items);
    e.target.reset();
    _refresh();
  };
  let activeStage = 'all';
  document.getElementById('ib-stage-filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-stage]');
    if (!btn) return;
    activeStage = btn.dataset.stage;
    _refresh(activeStage);
  });
  _refresh('all');
}

function _refresh(stageFilter) {
  if (stageFilter === undefined) stageFilter = 'all';
  const all = load();
  let items = stageFilter === 'all' ? all : all.filter(i => i.stage === stageFilter);
  items = items.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const stats = document.getElementById('ib-stats');
  const list = document.getElementById('ib-list');
  if (!stats || !list) return;
  const quickWins = all.filter(i => i.impact === 'high' && i.effort === 'low').length;
  const launched = all.filter(i => i.stage === 'launched').length;
  stats.textContent = 'Total: ' + all.length + ' | Quick wins: ' + quickWins + ' | Launched: ' + launched;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const stageIcon = STAGE_ICONS[item.stage] || '📥';
    const stageColor = STAGE_COLORS[item.stage] || 'gray';
    const impactColor = IMPACT_COLORS[item.impact] || 'gray';
    const nextStage = STAGES[(STAGES.indexOf(item.stage) + 1) % STAGES.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + impactColor + '"></span><span class="ia-badge ' + stageColor + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm gray"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = stageIcon + ' ' + item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = 'impact:' + item.impact;
    badges[1].textContent = item.stage;
    const [advBtn, voteBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + nextStage;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.stage = nextStage; save(d); _refresh(stageFilter); } };
    voteBtn.textContent = '👍 ' + (item.votes || 0);
    voteBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.votes = (r.votes || 0) + 1; save(d); _refresh(stageFilter); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(stageFilter); };
    el.querySelector('small').textContent = item.description.slice(0, 80);
    list.appendChild(el);
  });
}
