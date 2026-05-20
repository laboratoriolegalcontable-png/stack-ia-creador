/** Knowledge Base — KAIROS browser module */
const KB_KEY = 'kairos:kb';

function loadKB() { try { return JSON.parse(localStorage.getItem(KB_KEY) || '{}'); } catch { return {}; } }
function saveKB(kb) { try { localStorage.setItem(KB_KEY, JSON.stringify(kb)); } catch {} }

/** @param {string} title @param {string} body @param {string[]} [tags] @returns {object} */
export function addEntry(title, body, tags = []) {
  const kb = loadKB();
  const id = `kb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  kb[id] = { id, title, body, tags, createdAt: now, updatedAt: now, useCount: 0 };
  saveKB(kb);
  return kb[id];
}

/** @param {string} query @returns {object[]} */
export function searchEntries(query) {
  const q = query.toLowerCase();
  return Object.values(loadKB())
    .filter(e => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q) || (e.tags || []).some(t => t.toLowerCase().includes(q)))
    .sort((a, b) => b.useCount - a.useCount);
}

export function listEntries() { return Object.values(loadKB()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); }
export function deleteEntry(id) { const kb = loadKB(); delete kb[id]; saveKB(kb); }

export function getKBStats() {
  const entries = listEntries();
  const tags = new Set(entries.flatMap(e => e.tags || []));
  return { total: entries.length, totalTags: tags.size, mostUsed: entries.sort((a, b) => b.useCount - a.useCount)[0]?.title || null };
}

export function renderKnowledgeBase() {
  const existing = document.getElementById('kairos-kb-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'kairos-kb-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(540px,95vw);max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  function renderContent(query = '') {
    const entries = query ? searchEntries(query) : listEntries();
    const stats = getKBStats();

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <h3 style="margin:0;color:#a5b4fc;font-size:1rem">📚 Knowledge Base <span style="font-size:0.75rem;color:#6b7280">${stats.total} entradas</span></h3>
        <button id="kb-close" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
      </div>
      <input id="kb-search" placeholder="Buscar..." style="width:100%;padding:0.5rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.85rem;box-sizing:border-box;margin-bottom:0.75rem" />
      <details style="margin-bottom:1rem">
        <summary style="color:#9ca3af;font-size:0.82rem;cursor:pointer">+ Nueva entrada</summary>
        <div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem">
          <input id="kb-title" placeholder="Título" style="padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem" />
          <textarea id="kb-body" placeholder="Contenido..." rows="3" style="padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem;resize:vertical"></textarea>
          <input id="kb-tags" placeholder="Tags (separados por coma)" style="padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem" />
          <button id="kb-add" style="padding:0.4rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem">Agregar</button>
        </div>
      </details>
      <div id="kb-entries"></div>`;

    panel.querySelector('#kb-search').value = query;

    const entriesEl = panel.querySelector('#kb-entries');
    if (entries.length === 0) {
      entriesEl.innerHTML = '<p style="color:#6b7280;font-size:0.85rem">Sin entradas.</p>';
    } else {
      entries.forEach(e => {
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:#0f0f1e';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:start;margin-bottom:0.3rem';

        const titleEl = document.createElement('div');
        titleEl.style.cssText = 'color:#e5e7eb;font-size:0.88rem;font-weight:600';
        titleEl.textContent = e.title;

        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.style.cssText = 'font-size:0.7rem;padding:0.15rem 0.4rem;background:#450a0a;color:#f87171;border:none;border-radius:4px;cursor:pointer';
        delBtn.addEventListener('click', () => { deleteEntry(e.id); renderContent(query); });

        header.append(titleEl, delBtn);

        const bodyEl = document.createElement('div');
        bodyEl.style.cssText = 'font-size:0.8rem;color:#9ca3af;white-space:pre-wrap';
        bodyEl.textContent = e.body.slice(0, 200) + (e.body.length > 200 ? '...' : '');

        card.append(header, bodyEl);

        if (e.tags?.length) {
          const tagsEl = document.createElement('div');
          tagsEl.style.cssText = 'margin-top:0.4rem;display:flex;gap:0.3rem;flex-wrap:wrap';
          e.tags.forEach(t => {
            const chip = document.createElement('span');
            chip.style.cssText = 'font-size:0.68rem;background:#1e1b4b;color:#a5b4fc;padding:0.1rem 0.4rem;border-radius:3px';
            chip.textContent = t;
            tagsEl.appendChild(chip);
          });
          card.appendChild(tagsEl);
        }
        entriesEl.appendChild(card);
      });
    }

    panel.querySelector('#kb-close').addEventListener('click', () => panel.remove());
    panel.querySelector('#kb-search').addEventListener('input', ev => renderContent(ev.target.value));
    panel.querySelector('#kb-add').addEventListener('click', () => {
      const title = panel.querySelector('#kb-title')?.value?.trim();
      const body = panel.querySelector('#kb-body')?.value?.trim();
      const tags = panel.querySelector('#kb-tags')?.value?.split(',').map(t => t.trim()).filter(Boolean) || [];
      if (!title || !body) return;
      addEntry(title, body, tags);
      renderContent();
    });
  }

  renderContent();
  document.body.appendChild(panel);
}
