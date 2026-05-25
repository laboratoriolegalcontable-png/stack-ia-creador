const KEY = 'kairos:achievements';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const RARITY_COLORS = { common: 'gray', uncommon: 'green', rare: 'blue', epic: 'blue', legendary: 'red' };
const RARITY_ICONS = { common: '⚪', uncommon: '🟢', rare: '🔵', epic: '🟣', legendary: '🟡' };

export function renderAchievementTracker() {
  let panel = document.getElementById('achievement-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'achievement-tracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🏆 Achievements</h2><button class="ia-close" onclick="document.getElementById('achievement-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="at-form" class="ia-form">
        <input id="at-title" placeholder="Nombre del logro *" required />
        <textarea id="at-description" placeholder="Descripción" rows="1"></textarea>
        <div style="display:flex;gap:8px">
          <select id="at-category" style="flex:1"><option value="coding">Coding</option><option value="learning">Learning</option><option value="health">Health</option><option value="business">Business</option><option value="personal">Personal</option><option value="social">Social</option><option value="other">Otro</option></select>
          <select id="at-rarity" style="flex:1"><option value="common">⚪ Common</option><option value="uncommon">🟢 Uncommon</option><option value="rare">🔵 Rare</option><option value="epic">🟣 Epic</option><option value="legendary">🟡 Legendary</option></select>
        </div>
        <input id="at-badge" placeholder="Emoji badge (ej. 🚀)" value="🏅" />
        <button type="submit" class="ia-btn">Desbloquear logro</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <select id="at-filter" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text);flex:1">
          <option value="all">Todos</option><option value="coding">Coding</option><option value="learning">Learning</option><option value="health">Health</option><option value="business">Business</option><option value="personal">Personal</option>
        </select>
      </div>
      <div id="at-stats" class="ia-stats-bar"></div>
      <div id="at-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('at-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), title: document.getElementById('at-title').value.trim(), description: document.getElementById('at-description').value.trim(), category: document.getElementById('at-category').value, rarity: document.getElementById('at-rarity').value, badge: document.getElementById('at-badge').value.trim() || '🏅', unlockedAt: now(), createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('at-badge').value = '🏅';
    _refresh();
  };
  document.getElementById('at-filter').onchange = _refresh;
  _refresh();
}

function _refresh() {
  const filter = document.getElementById('at-filter')?.value || 'all';
  const all = load();
  const items = filter === 'all' ? all : all.filter(i => i.category === filter);
  const stats = document.getElementById('at-stats');
  const list = document.getElementById('at-list');
  if (!stats || !list) return;
  const legendary = all.filter(i => i.rarity === 'legendary').length;
  const rare = all.filter(i => i.rarity === 'rare' || i.rarity === 'epic').length;
  stats.textContent = 'Total: ' + all.length + ' | 🟡 Legendary: ' + legendary + ' | 🔵 Rare+: ' + rare;
  list.innerHTML = '';
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  items.sort((a, b) => (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4) || b.unlockedAt.localeCompare(a.unlockedAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const color = RARITY_COLORS[item.rarity] || 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge ' + color + '"></span><span class="ia-badge gray"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = (item.badge || '🏅') + ' ' + item.title;
    el.querySelectorAll('.ia-badge')[0].textContent = (RARITY_ICONS[item.rarity] || '') + ' ' + item.rarity;
    el.querySelectorAll('.ia-badge')[1].textContent = item.category;
    el.querySelector('small').textContent = (item.description || '') + (item.unlockedAt ? ' · ' + item.unlockedAt.slice(0, 10) : '');
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
