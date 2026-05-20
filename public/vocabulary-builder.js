/** vocabulary-builder.js — Glosario personal con tags y estado learned · KAIROS browser module */
const VOCAB_KEY = 'kairos:vocab';

function loadVocab() { try { return JSON.parse(localStorage.getItem(VOCAB_KEY) || '{}'); } catch { return {}; } }
function saveVocab(data) { localStorage.setItem(VOCAB_KEY, JSON.stringify(data)); }

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function addTerm(word, definition, example = '', tags = []) {
  const data = loadVocab();
  const id = `vocab-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  const term = {
    id, word: String(word).slice(0, 200), definition: String(definition).slice(0, 2000),
    example: String(example).slice(0, 1000),
    tags: Array.isArray(tags) ? tags.map(t => String(t).slice(0, 40)) : [],
    status: 'learning', createdAt: new Date().toISOString(), date: localDateStr(),
  };
  data[id] = term;
  saveVocab(data);
  return term;
}

export function markLearned(id) { const d = loadVocab(); if (d[id]) { d[id].status = 'learned'; saveVocab(d); } }
export function resetTerm(id) { const d = loadVocab(); if (d[id]) { d[id].status = 'learning'; saveVocab(d); } }

export function searchTerms(query) {
  const q = String(query).toLowerCase().trim();
  if (!q) return listTerms();
  return Object.values(loadVocab()).filter(t =>
    t.word.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q)));
}

export function listTerms(filter = 'all') {
  const all = Object.values(loadVocab()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return filter === 'all' ? all : all.filter(t => t.status === filter);
}

export function deleteTermEntry(id) { const d = loadVocab(); delete d[id]; saveVocab(d); }

export function getVocabStats() {
  const all = Object.values(loadVocab());
  const learned = all.filter(t => t.status === 'learned').length;
  return { total: all.length, learned, learning: all.length - learned };
}

export function renderVocabPanel() {
  const existing = document.getElementById('kairos-vocab-panel');
  if (existing) { existing.remove(); return; }

  let currentFilter = 'all', currentQuery = '';

  const panel = document.createElement('div');
  panel.id = 'kairos-vocab-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(540px,95vw);max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem';
  const title = document.createElement('h3');
  title.style.cssText = 'margin:0;color:#a5b4fc;font-size:1rem';
  title.textContent = '📚 Vocabulary Builder';
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => panel.remove());
  header.append(title, closeBtn);

  const statsBar = document.createElement('div');
  statsBar.id = 'vocab-stats-bar';
  statsBar.style.cssText = 'display:flex;gap:1rem;margin-bottom:1rem;font-size:0.8rem';

  function refreshStats() {
    statsBar.innerHTML = '';
    const st = getVocabStats();
    const s1 = document.createElement('span'); s1.style.color = '#a5b4fc'; s1.textContent = `${st.total} términos`;
    const s2 = document.createElement('span'); s2.style.color = '#34d399'; s2.textContent = `${st.learned} learned`;
    const s3 = document.createElement('span'); s3.style.color = '#fbbf24'; s3.textContent = `${st.learning} learning`;
    statsBar.append(s1, s2, s3);
  }
  refreshStats();

  const controlRow = document.createElement('div');
  controlRow.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.8rem';
  const searchInput = document.createElement('input');
  searchInput.placeholder = 'Buscar término...';
  searchInput.style.cssText = 'flex:1;padding:0.4rem 0.6rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem';
  const filterSel = document.createElement('select');
  filterSel.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#9ca3af;font-size:0.82rem';
  [['all','Todos'],['learning','Learning'],['learned','Learned']].forEach(([v,l]) => {
    const o = document.createElement('option'); o.value = v; o.textContent = l; filterSel.appendChild(o);
  });
  controlRow.append(searchInput, filterSel);

  const form = document.createElement('div');
  form.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.9rem;margin-bottom:0.9rem;display:flex;flex-direction:column;gap:0.5rem';
  const inWord = document.createElement('input'); inWord.placeholder = 'Término / palabra...';
  inWord.style.cssText = 'padding:0.45rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem';
  const inDef = document.createElement('textarea'); inDef.placeholder = 'Definición...';
  inDef.style.cssText = 'padding:0.45rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem;resize:vertical;min-height:52px;font-family:inherit';
  const inEx = document.createElement('input'); inEx.placeholder = 'Ejemplo de uso (opcional)...';
  inEx.style.cssText = 'padding:0.45rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem';
  const inTags = document.createElement('input'); inTags.placeholder = 'Tags separados por coma...';
  inTags.style.cssText = 'padding:0.45rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.83rem';
  const addBtn = document.createElement('button'); addBtn.textContent = '+ Agregar término';
  addBtn.style.cssText = 'padding:0.4rem 1rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.83rem;align-self:flex-start';
  form.append(inWord, inDef, inEx, inTags, addBtn);

  const listEl = document.createElement('div');

  function renderList() {
    listEl.innerHTML = '';
    const base = currentQuery ? searchTerms(currentQuery) : listTerms(currentFilter);
    const terms = (currentQuery && currentFilter !== 'all') ? base.filter(t => t.status === currentFilter) : base;
    if (terms.length === 0) {
      const empty = document.createElement('p'); empty.style.cssText = 'color:#6b7280;font-size:0.85rem'; empty.textContent = 'Sin términos.'; listEl.appendChild(empty); return;
    }
    terms.forEach(t => {
      const card = document.createElement('div');
      card.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:#0f0f1e';
      const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.4rem';
      const wordEl = document.createElement('div'); wordEl.style.cssText = 'color:#e5e7eb;font-size:0.9rem;font-weight:600'; wordEl.textContent = t.word;
      const badge = document.createElement('span');
      badge.style.cssText = `font-size:0.68rem;padding:0.15rem 0.4rem;border-radius:4px;font-weight:700;background:${t.status==='learned'?'#065f46':'#78350f'};color:${t.status==='learned'?'#34d399':'#fbbf24'}`;
      badge.textContent = t.status === 'learned' ? '✓ Learned' : '⏳ Learning';
      top.append(wordEl, badge);
      const defEl = document.createElement('div'); defEl.style.cssText = 'font-size:0.82rem;color:#d1d5db;margin-bottom:0.3rem'; defEl.textContent = t.definition;
      card.append(top, defEl);
      if (t.example) { const exEl = document.createElement('div'); exEl.style.cssText = 'font-size:0.78rem;color:#6b7280;font-style:italic;margin-bottom:0.35rem'; exEl.textContent = `Ej: ${t.example}`; card.appendChild(exEl); }
      if (t.tags && t.tags.length > 0) {
        const tagsRow = document.createElement('div'); tagsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.4rem';
        t.tags.forEach(tag => { const chip = document.createElement('span'); chip.style.cssText = 'font-size:0.68rem;padding:0.1rem 0.4rem;background:#1e3a5f;color:#60a5fa;border-radius:4px'; chip.textContent = tag; tagsRow.appendChild(chip); });
        card.appendChild(tagsRow);
      }
      const btns = document.createElement('div'); btns.style.cssText = 'display:flex;gap:0.4rem';
      if (t.status === 'learning') {
        const lb = document.createElement('button'); lb.textContent = '✓ Learned'; lb.style.cssText = 'padding:0.25rem 0.6rem;background:#065f46;color:#34d399;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem';
        lb.addEventListener('click', () => { markLearned(t.id); renderList(); refreshStats(); }); btns.appendChild(lb);
      } else {
        const rb = document.createElement('button'); rb.textContent = '↩ Reset'; rb.style.cssText = 'padding:0.25rem 0.6rem;background:#374151;color:#9ca3af;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem';
        rb.addEventListener('click', () => { resetTerm(t.id); renderList(); refreshStats(); }); btns.appendChild(rb);
      }
      const db = document.createElement('button'); db.textContent = '✕'; db.style.cssText = 'padding:0.25rem 0.45rem;background:#450a0a;color:#f87171;border:none;border-radius:5px;cursor:pointer;font-size:0.75rem';
      db.addEventListener('click', () => { deleteTermEntry(t.id); renderList(); refreshStats(); }); btns.appendChild(db);
      card.appendChild(btns); listEl.appendChild(card);
    });
  }

  searchInput.addEventListener('input', () => { currentQuery = searchInput.value.trim(); renderList(); });
  filterSel.addEventListener('change', () => { currentFilter = filterSel.value; renderList(); });
  addBtn.addEventListener('click', () => {
    const word = inWord.value.trim(); if (!word) { inWord.focus(); return; }
    const tags = inTags.value.split(',').map(s => s.trim()).filter(Boolean);
    addTerm(word, inDef.value.trim(), inEx.value.trim(), tags);
    inWord.value = ''; inDef.value = ''; inEx.value = ''; inTags.value = '';
    renderList(); refreshStats();
  });

  renderList();
  panel.append(header, statsBar, controlRow, form, listEl);
  document.body.appendChild(panel);
}
