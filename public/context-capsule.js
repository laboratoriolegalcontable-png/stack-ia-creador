/** context-capsule.js — Cápsulas de contexto mental / workspace · KAIROS browser module */
const CC_KEY = 'kairos:capsules';

function loadCapsules() { try { return JSON.parse(localStorage.getItem(CC_KEY) || '[]'); } catch { return []; } }
function saveCapsules(list) { localStorage.setItem(CC_KEY, JSON.stringify(list)); }

export function createCapsule(title, context, links = [], tags = []) {
  const list = loadCapsules();
  const now = new Date().toISOString();
  const capsule = {
    id: `cap-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
    title: String(title).slice(0,200),
    context: String(context).slice(0,4000),
    links: links.map(l => String(l).trim()).filter(Boolean).slice(0,10),
    tags: Array.isArray(tags) ? tags.map(t => String(t).slice(0,40)) : [],
    createdAt: now,
    lastAccessedAt: now,
    accessCount: 0,
  };
  list.unshift(capsule);
  saveCapsules(list);
  return capsule;
}

export function accessCapsule(id) {
  const list = loadCapsules();
  const idx = list.findIndex(c => c.id === id);
  if (idx === -1) return null;
  list[idx].lastAccessedAt = new Date().toISOString();
  list[idx].accessCount = (list[idx].accessCount || 0) + 1;
  saveCapsules(list);
  return list[idx];
}

export function updateCapsule(id, updates) {
  const list = loadCapsules();
  const idx = list.findIndex(c => c.id === id);
  if (idx === -1) return null;
  if (updates.title !== undefined) list[idx].title = String(updates.title).slice(0,200);
  if (updates.context !== undefined) list[idx].context = String(updates.context).slice(0,4000);
  if (updates.links !== undefined) list[idx].links = updates.links.map(l => String(l).trim()).filter(Boolean).slice(0,10);
  if (updates.tags !== undefined) list[idx].tags = updates.tags.map(t => String(t).slice(0,40));
  saveCapsules(list);
  return list[idx];
}

export function listCapsules(tag) {
  const all = loadCapsules().sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt));
  return tag ? all.filter(c => c.tags.includes(tag)) : all;
}

export function deleteCapsule(id) {
  saveCapsules(loadCapsules().filter(c => c.id !== id));
}

export function getCapsuleStats() {
  const all = loadCapsules();
  const totalAccesses = all.reduce((s, c) => s + (c.accessCount || 0), 0);
  const mostAccessed = all.reduce((best, c) => (!best || c.accessCount > best.accessCount) ? c : best, null);
  return { total: all.length, totalAccesses, mostAccessed: mostAccessed?.title ?? null };
}

export function renderCapsulePanel() {
  const existing = document.getElementById('kairos-capsule-panel');
  if (existing) { existing.remove(); return; }

  let searchQuery = '';

  const panel = document.createElement('div');
  panel.id = 'kairos-capsule-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(540px,95vw);max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem';
  const titleEl = document.createElement('h3'); titleEl.style.cssText = 'margin:0;color:#a5b4fc;font-size:1rem'; titleEl.textContent = '💊 Context Capsules';
  const closeBtn = document.createElement('button'); closeBtn.style.cssText = 'background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem'; closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => panel.remove());
  header.append(titleEl, closeBtn);

  const statsBar = document.createElement('div');
  statsBar.style.cssText = 'display:flex;gap:1rem;margin-bottom:1rem;font-size:0.78rem';
  function refreshStats() {
    statsBar.innerHTML = '';
    const st = getCapsuleStats();
    const s1 = document.createElement('span'); s1.style.color = '#a5b4fc'; s1.textContent = `${st.total} cápsulas`;
    const s2 = document.createElement('span'); s2.style.color = '#fbbf24'; s2.textContent = `${st.totalAccesses} accesos`;
    if (st.mostAccessed) { const s3 = document.createElement('span'); s3.style.color = '#34d399'; s3.textContent = `⭐ ${st.mostAccessed}`; statsBar.appendChild(s3); }
    statsBar.append(s1, s2);
  }
  refreshStats();

  // Search
  const searchRow = document.createElement('div'); searchRow.style.cssText = 'margin-bottom:0.8rem';
  const searchInp = document.createElement('input'); searchInp.placeholder = 'Buscar cápsulas por título o tag...';
  searchInp.style.cssText = 'width:100%;box-sizing:border-box;padding:0.4rem 0.6rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem';
  searchInp.addEventListener('input', () => { searchQuery = searchInp.value.trim().toLowerCase(); renderList(); });
  searchRow.appendChild(searchInp);

  // Form
  const form = document.createElement('div');
  form.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.9rem;margin-bottom:0.9rem;display:flex;flex-direction:column;gap:0.5rem';
  const inTitle = document.createElement('input'); inTitle.placeholder = 'Título de la cápsula...'; inTitle.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem';
  const inCtx = document.createElement('textarea'); inCtx.placeholder = 'Brain dump — contexto mental, estado actual, links relevantes...'; inCtx.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem;resize:vertical;min-height:72px;font-family:inherit';
  const inLinks = document.createElement('input'); inLinks.placeholder = 'Links separados por espacio o coma...'; inLinks.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem';
  const inTags = document.createElement('input'); inTags.placeholder = 'Tags separados por coma...'; inTags.style.cssText = 'padding:0.4rem;background:#0f0f1e;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:0.82rem';
  const addBtn = document.createElement('button'); addBtn.textContent = '+ Guardar cápsula'; addBtn.style.cssText = 'padding:0.4rem 1rem;background:#4338ca;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem;align-self:flex-start';
  addBtn.addEventListener('click', () => {
    if (!inTitle.value.trim()) { inTitle.focus(); return; }
    const links = inLinks.value.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    const tags = inTags.value.split(',').map(s => s.trim()).filter(Boolean);
    createCapsule(inTitle.value.trim(), inCtx.value.trim(), links, tags);
    inTitle.value = ''; inCtx.value = ''; inLinks.value = ''; inTags.value = '';
    refreshStats(); renderList();
  });
  form.append(inTitle, inCtx, inLinks, inTags, addBtn);

  const listEl = document.createElement('div');
  function renderList() {
    listEl.innerHTML = '';
    let capsules = listCapsules();
    if (searchQuery) capsules = capsules.filter(c => c.title.toLowerCase().includes(searchQuery) || c.tags.some(t => t.toLowerCase().includes(searchQuery)));
    if (!capsules.length) { const e = document.createElement('p'); e.style.cssText = 'color:#6b7280;font-size:0.85rem'; e.textContent = 'Sin cápsulas guardadas.'; listEl.appendChild(e); return; }
    capsules.forEach(c => {
      const card = document.createElement('div');
      card.style.cssText = 'border:1px solid #374151;border-radius:8px;padding:0.7rem;margin-bottom:0.5rem;background:#0f0f1e;cursor:pointer';

      const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.4rem';
      const titleSpan = document.createElement('span'); titleSpan.style.cssText = 'color:#e5e7eb;font-size:0.88rem;font-weight:600'; titleSpan.textContent = c.title;
      const metaDiv = document.createElement('div'); metaDiv.style.cssText = 'display:flex;gap:0.4rem;align-items:center';
      const accBadge = document.createElement('span'); accBadge.style.cssText = 'font-size:0.68rem;color:#6b7280'; accBadge.textContent = `${c.accessCount || 0} accesos`;
      const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.style.cssText = 'padding:0.15rem 0.35rem;background:#450a0a;color:#f87171;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem';
      delBtn.addEventListener('click', ev => { ev.stopPropagation(); deleteCapsule(c.id); refreshStats(); renderList(); });
      metaDiv.append(accBadge, delBtn);
      top.append(titleSpan, metaDiv);

      const ctxEl = document.createElement('div'); ctxEl.style.cssText = 'font-size:0.8rem;color:#9ca3af;white-space:pre-wrap;word-break:break-word;margin-bottom:0.4rem;max-height:80px;overflow:hidden'; ctxEl.textContent = c.context;

      if (c.tags && c.tags.length) {
        const tagsRow = document.createElement('div'); tagsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.3rem';
        c.tags.forEach(t => { const chip = document.createElement('span'); chip.style.cssText = 'font-size:0.65rem;padding:0.1rem 0.35rem;background:#1e3a5f;color:#60a5fa;border-radius:4px'; chip.textContent = t; tagsRow.appendChild(chip); });
        card.appendChild(tagsRow);
      }

      if (c.links && c.links.length) {
        const linksRow = document.createElement('div'); linksRow.style.cssText = 'font-size:0.72rem;margin-top:0.2rem';
        c.links.forEach(link => {
          const a = document.createElement('a'); a.href = link; a.textContent = link.length > 50 ? link.slice(0,47)+'...' : link;
          a.style.cssText = 'color:#818cf8;margin-right:0.5rem;text-decoration:none'; a.target = '_blank'; a.rel = 'noopener';
          linksRow.appendChild(a);
        });
        card.appendChild(linksRow);
      }

      card.append(top, ctxEl);
      card.addEventListener('click', (ev) => { if (ev.target === delBtn || delBtn.contains(ev.target)) return; accessCapsule(c.id); refreshStats(); });
      listEl.appendChild(card);
    });
  }
  renderList();

  panel.append(header, statsBar, searchRow, form, listEl);
  document.body.appendChild(panel);
}
