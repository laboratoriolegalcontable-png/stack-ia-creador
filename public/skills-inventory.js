const KEY = 'kairos:skills-inventory';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const PROFICIENCY = ['beginner', 'intermediate', 'advanced', 'expert'];
const PROF_ICONS = { beginner: '🌱', intermediate: '🌿', advanced: '🌲', expert: '🏆' };
const STATUS_COLORS = { 'not-started': 'gray', learning: 'blue', practicing: 'green', mastered: 'gray' };
const CAT_ICONS = { technical: '💻', soft: '🤝', domain: '🏢', tool: '🔧', language: '🗣️', other: '📝' };

export function renderSkillsInventory() {
  let panel = document.getElementById('skills-inventory-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'skills-inventory-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🧠 Skills Inventory</h2><button class="ia-close" onclick="document.getElementById('skills-inventory-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="si-form" class="ia-form">
        <input id="si-name" placeholder="Nombre de la skill *" required />
        <div style="display:flex;gap:8px">
          <select id="si-category" style="flex:1">
            <option value="technical">💻 Technical</option>
            <option value="soft">🤝 Soft</option>
            <option value="domain">🏢 Domain</option>
            <option value="tool">🔧 Tool</option>
            <option value="language">🗣️ Language</option>
            <option value="other">📝 Other</option>
          </select>
          <select id="si-proficiency" style="flex:1">
            <option value="beginner">🌱 Beginner</option>
            <option value="intermediate" selected>🌿 Intermediate</option>
            <option value="advanced">🌲 Advanced</option>
            <option value="expert">🏆 Expert</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <select id="si-status" style="flex:1">
            <option value="not-started">Not Started</option>
            <option value="learning" selected>Learning</option>
            <option value="practicing">Practicing</option>
            <option value="mastered">Mastered</option>
          </select>
          <input id="si-years" type="number" placeholder="Años exp (opcional)" min="0" step="0.5" style="flex:1" />
        </div>
        <div style="display:flex;gap:8px">
          <select id="si-target" style="flex:1">
            <option value="">Target proficiency (opcional)</option>
            <option value="beginner">🌱 Beginner</option>
            <option value="intermediate">🌿 Intermediate</option>
            <option value="advanced">🌲 Advanced</option>
            <option value="expert">🏆 Expert</option>
          </select>
          <input id="si-tags" placeholder="tags (coma)" style="flex:1" />
        </div>
        <textarea id="si-notes" placeholder="Notas (opcional)" rows="2"></textarea>
        <button type="submit" class="ia-btn">Agregar skill</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="si-filter-cat" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)">
          <option value="all">Todas las categorías</option>
          <option value="technical">💻 Technical</option>
          <option value="soft">🤝 Soft</option>
          <option value="domain">🏢 Domain</option>
          <option value="tool">🔧 Tool</option>
          <option value="language">🗣️ Language</option>
          <option value="other">📝 Other</option>
        </select>
      </div>
      <div id="si-stats" class="ia-stats-bar"></div>
      <div id="si-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('si-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const yearsVal = document.getElementById('si-years').value;
    items.push({
      id: uid(), createdAt: now(),
      name: document.getElementById('si-name').value.trim(),
      category: document.getElementById('si-category').value,
      proficiency: document.getElementById('si-proficiency').value,
      learningStatus: document.getElementById('si-status').value,
      yearsOfExperience: yearsVal ? parseFloat(yearsVal) : null,
      targetProficiency: document.getElementById('si-target').value || null,
      notes: document.getElementById('si-notes').value.trim(),
      tags: document.getElementById('si-tags').value.trim()
    });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('si-filter-cat').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filterSel = document.getElementById('si-filter-cat');
  if (!filterSel) return;
  const cat = filterSel.value;
  const all = load();
  let items = cat === 'all' ? all : all.filter(i => i.category === cat);
  items = items.slice().sort((a, b) => a.name.localeCompare(b.name));
  const stats = document.getElementById('si-stats');
  const list = document.getElementById('si-list');
  if (!stats || !list) return;
  const mastered = all.filter(i => i.learningStatus === 'mastered').length;
  const learning = all.filter(i => i.learningStatus === 'learning').length;
  const expert = all.filter(i => i.proficiency === 'expert').length;
  stats.textContent = 'Total: ' + all.length + ' | Mastered: ' + mastered + ' | Learning: ' + learning + ' | Expert: ' + expert;
  list.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const catIcon = CAT_ICONS[item.category] || '📝';
    const profIcon = PROF_ICONS[item.proficiency] || '🌱';
    const statusColor = STATUS_COLORS[item.learningStatus] || 'gray';
    const nextProf = PROFICIENCY[(PROFICIENCY.indexOf(item.proficiency) + 1) % PROFICIENCY.length];
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge gray"></span><span class="ia-badge ' + statusColor + '"></span><button class="ia-btn-sm blue"></button><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = catIcon + ' ' + item.name;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = profIcon + ' ' + item.proficiency;
    badges[1].textContent = item.learningStatus;
    const [advBtn, delBtn] = el.querySelectorAll('button');
    advBtn.textContent = '→ ' + nextProf;
    advBtn.onclick = () => { const d = load(); const r = d.find(x => x.id === item.id); if (r) { r.proficiency = nextProf; save(d); _refresh(); } };
    delBtn.onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const parts = [];
    if (item.yearsOfExperience != null) parts.push(item.yearsOfExperience + ' años');
    if (item.notes) parts.push(item.notes.slice(0, 50));
    el.querySelector('small').textContent = parts.join(' · ');
    list.appendChild(el);
  });
}
