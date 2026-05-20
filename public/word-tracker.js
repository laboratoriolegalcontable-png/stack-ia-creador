const KEY = 'kairos:word-tracker';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderWordTracker() {
  let panel = document.getElementById('word-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'word-tracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📝 Word Tracker</h2><button class="ia-close" onclick="document.getElementById('word-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="wt-form" class="ia-form">
        <input id="wt-word" placeholder="Palabra / término *" required />
        <input id="wt-language" placeholder="Idioma (EN, ES, FR…)" value="EN" />
        <input id="wt-definition" placeholder="Definición *" required />
        <input id="wt-example" placeholder="Ejemplo de uso" />
        <input id="wt-context" placeholder="Contexto (libro, artículo…)" />
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <input id="wt-search" placeholder="Buscar..." style="flex:1;padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)" />
        <button id="wt-quiz" class="ia-btn-sm blue">🎲 Quiz</button>
      </div>
      <div id="wt-stats" class="ia-stats-bar"></div>
      <div id="wt-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('wt-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ uid: uid(), word: document.getElementById('wt-word').value.trim(), language: document.getElementById('wt-language').value.trim().toUpperCase() || 'EN', definition: document.getElementById('wt-definition').value.trim(), example: document.getElementById('wt-example').value.trim(), context: document.getElementById('wt-context').value.trim(), mastered: false, reviewCount: 0, createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('wt-language').value = 'EN';
    _refresh();
  };
  document.getElementById('wt-search').oninput = _refresh;
  document.getElementById('wt-quiz').onclick = () => {
    const items = load().filter(i => !i.mastered);
    if (!items.length) { alert('¡Todas las palabras dominadas!'); return; }
    const item = items[Math.floor(Math.random() * items.length)];
    const answer = prompt(`¿Qué significa "${item.word}" (${item.language})?`);
    if (answer !== null) {
      alert(`Definición: ${item.definition}${item.example ? `\n\nEjemplo: ${item.example}` : ''}`);
      const d = load(); const w = d.find(x => x.uid === item.uid); if (w) { w.reviewCount++; save(d); _refresh(); }
    }
  };
  _refresh();
}

function _refresh() {
  const query = (document.getElementById('wt-search')?.value || '').toLowerCase();
  let items = load();
  if (query) items = items.filter(i => i.word.toLowerCase().includes(query) || i.definition.toLowerCase().includes(query));
  const stats = document.getElementById('wt-stats');
  const list = document.getElementById('wt-list');
  if (!stats || !list) return;
  const all = load();
  const mastered = all.filter(i => i.mastered).length;
  stats.textContent = `Total: ${all.length} | Dominadas: ${mastered} | Pendientes: ${all.length - mastered}${query ? ` | Filtrado: ${items.length}` : ''}`;
  list.innerHTML = '';
  items.sort((a, b) => (a.mastered === b.mastered ? 0 : a.mastered ? 1 : -1) || b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.language}</span>${item.reviewCount ? `<span class="ia-badge gray">${item.reviewCount}x</span>` : ''}<button class="ia-btn-sm ${item.mastered ? 'gray' : 'green'}" data-master="${item.uid}">${item.mastered ? '↩' : '✓'}</button><button class="ia-btn-sm red" data-del="${item.uid}">✕</button></div><div style="font-size:0.85rem;opacity:${item.mastered ? '0.5' : '1'}"></div><small></small>`;
    el.querySelector('strong').textContent = item.word;
    el.querySelectorAll('div')[1].textContent = item.definition;
    el.querySelector('small').textContent = item.example || item.context || '';
    el.querySelector('[data-master]').onclick = () => {
      const d = load(); const w = d.find(x => x.uid === item.uid); if (!w) return;
      w.mastered = !w.mastered; save(d); _refresh();
    };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.uid !== item.uid)); _refresh(); };
    list.appendChild(el);
  });
}
