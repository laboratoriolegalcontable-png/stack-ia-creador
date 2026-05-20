const KEY = 'kairos:interview-prep';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderInterviewPrep() {
  let panel = document.getElementById('interview-prep-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'interview-prep-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🎯 Interview Prep</h2><button class="ia-close" onclick="document.getElementById('interview-prep-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ip-form" class="ia-form">
        <input id="ip-question" placeholder="Pregunta *" required />
        <select id="ip-category"><option value="behavioral">Behavioral</option><option value="technical">Technical</option><option value="situational">Situational</option><option value="motivational">Motivational</option><option value="other">Otro</option></select>
        <select id="ip-difficulty"><option value="easy">Fácil</option><option value="medium">Medio</option><option value="hard">Difícil</option></select>
        <textarea id="ip-answer" placeholder="Tu respuesta / STAR framework" rows="3"></textarea>
        <input id="ip-tips" placeholder="Tips clave (coma separados)" />
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <input id="ip-filter" placeholder="Filtrar..." style="flex:1;padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)" />
        <button id="ip-random" class="ia-btn-sm blue">🎲 Aleatoria</button>
      </div>
      <div id="ip-stats" class="ia-stats-bar"></div>
      <div id="ip-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ip-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ uid: uid(), question: document.getElementById('ip-question').value.trim(), category: document.getElementById('ip-category').value, difficulty: document.getElementById('ip-difficulty').value, answer: document.getElementById('ip-answer').value.trim(), tips: document.getElementById('ip-tips').value.split(',').map(s => s.trim()).filter(Boolean), mastered: false, timesReviewed: 0, createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('ip-filter').oninput = _refresh;
  document.getElementById('ip-random').onclick = () => {
    const items = load().filter(i => !i.mastered);
    if (!items.length) return;
    const item = items[Math.floor(Math.random() * items.length)];
    alert(`Q: ${item.question}\n\n${item.answer ? `A: ${item.answer}` : '(sin respuesta guardada)'}`);
    const d = load(); const q = d.find(x => x.uid === item.uid); if (q) { q.timesReviewed++; save(d); _refresh(); }
  };
  _refresh();
}

function _refresh() {
  const query = (document.getElementById('ip-filter')?.value || '').toLowerCase();
  let items = load();
  if (query) items = items.filter(i => i.question.toLowerCase().includes(query) || i.category.includes(query));
  const stats = document.getElementById('ip-stats');
  const list = document.getElementById('ip-list');
  if (!stats || !list) return;
  const all = load();
  const mastered = all.filter(i => i.mastered).length;
  stats.textContent = `Total: ${all.length} | Dominadas: ${mastered} | Por repasar: ${all.length - mastered}${query ? ` | Filtrado: ${items.length}` : ''}`;
  list.innerHTML = '';
  items.sort((a, b) => (a.mastered === b.mastered ? 0 : a.mastered ? 1 : -1) || b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const diffColor = item.difficulty === 'hard' ? 'red' : item.difficulty === 'medium' ? 'blue' : 'green';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.category}</span><span class="ia-badge ${diffColor}">${item.difficulty}</span>${item.timesReviewed ? `<span class="ia-badge gray">${item.timesReviewed}x</span>` : ''}<button class="ia-btn-sm ${item.mastered ? 'gray' : 'green'}" data-master="${item.uid}">${item.mastered ? '↩' : '✓'}</button><button class="ia-btn-sm red" data-del="${item.uid}">✕</button></div><div style="font-size:0.85rem;opacity:${item.mastered ? '0.5' : '1'}"></div>`;
    el.querySelector('strong').textContent = item.question;
    el.querySelectorAll('div')[1].textContent = item.answer ? item.answer.slice(0, 120) + (item.answer.length > 120 ? '…' : '') : '';
    el.querySelector('[data-master]').onclick = () => {
      const d = load(); const q = d.find(x => x.uid === item.uid); if (!q) return;
      q.mastered = !q.mastered; save(d); _refresh();
    };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.uid !== item.uid)); _refresh(); };
    list.appendChild(el);
  });
}
