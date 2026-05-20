/**
 * language-log.js — Registro de aprendizaje de idiomas
 * @module language-log
 */

const KEY = 'kairos:language-log';

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function getStats(items) {
  const byLanguage = {};
  let mastered = 0;
  for (const e of items) {
    byLanguage[e.language] = (byLanguage[e.language] || 0) + 1;
    if (e.mastered) mastered++;
  }
  return { total: items.length, mastered, byLanguage };
}

export function renderLanguageLog() {
  const existing = document.getElementById('language-log-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'language-log-panel';
  panel.className = 'kairos-panel';
  panel.innerHTML = `
    <div class="panel-header"><strong>/lang — Registro de Idiomas</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="lang-stats"></div>
    <form id="lang-form" class="panel-form">
      <input id="lang-word" placeholder="Palabra / frase" required>
      <input id="lang-translation" placeholder="Traducción" required>
      <input id="lang-language" placeholder="Idioma (ej: inglés)" required>
      <select id="lang-type"><option value="vocab">Vocabulario</option><option value="grammar">Gramática</option><option value="phrase">Frase</option></select>
      <button type="submit">Agregar</button>
    </form>
    <div class="panel-filters">
      <button class="filter-btn active" data-filter="all">Todos</button>
      <button class="filter-btn" data-filter="pending">Pendientes</button>
      <button class="filter-btn" data-filter="mastered">Dominados</button>
    </div>
    <ul id="lang-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });

  panel.querySelector('#lang-form').addEventListener('submit', e => {
    e.preventDefault();
    const word = document.getElementById('lang-word').value.trim();
    const translation = document.getElementById('lang-translation').value.trim();
    const language = document.getElementById('lang-language').value.trim();
    const type = document.getElementById('lang-type').value;
    if (!word || !translation || !language) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), word, translation, language, type, mastered: false, date: localDate() });
    save(items);
    e.target.reset();
    _refresh();
  });

  panel.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _refresh();
    });
  });

  _refresh();

  function _refresh() {
    const items = load();
    const stats = getStats(items);
    const statsEl = document.getElementById('lang-stats');
    if (statsEl) {
      const langs = Object.entries(stats.byLanguage).map(([l, n]) => `${l}:${n}`).join(' · ');
      statsEl.textContent = `Total: ${stats.total} · Dominados: ${stats.mastered} · ${langs}`;
    }
    const activeFilter = panel.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = activeFilter === 'mastered' ? items.filter(i => i.mastered)
      : activeFilter === 'pending' ? items.filter(i => !i.mastered) : items;
    const list = document.getElementById('lang-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of filtered) {
      const li = document.createElement('li');
      li.className = 'panel-item' + (item.mastered ? ' item-done' : '');
      const wordEl = document.createElement('span');
      wordEl.className = 'item-title';
      wordEl.textContent = `${item.word} → ${item.translation}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.language} · ${item.type} · ${item.date}`;
      const masterBtn = document.createElement('button');
      masterBtn.className = 'item-action';
      masterBtn.textContent = item.mastered ? '↩' : '✓';
      masterBtn.title = item.mastered ? 'Marcar pendiente' : 'Marcar dominado';
      masterBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(x => x.id === item.id);
        if (idx !== -1) { all[idx].mastered = !all[idx].mastered; save(all); _refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(wordEl, meta, masterBtn, del);
      list.appendChild(li);
    }
  }
}
