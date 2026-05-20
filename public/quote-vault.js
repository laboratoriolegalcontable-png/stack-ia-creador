/**
 * quote-vault.js — Quote Vault (KAIROS)
 * key: kairos:quotes
 * @module quote-vault
 */

const KEY = 'kairos:quotes';

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function addQuote(text, author, category, favorite) {
  const items = load();
  const item = {
    id: uid(),
    text: String(text || '').trim(),
    author: String(author || '').trim(),
    category: String(category || 'general').trim(),
    favorite: Boolean(favorite),
    createdAt: new Date().toISOString()
  };
  items.push(item);
  save(items);
  return item;
}

function deleteQuote(id) {
  save(load().filter(q => q.id !== id));
}

function toggleFavorite(id) {
  const items = load();
  const idx = items.findIndex(q => q.id === id);
  if (idx !== -1) {
    items[idx].favorite = !items[idx].favorite;
    save(items);
  }
}

function getQuoteStats() {
  const items = load();
  const total = items.length;
  const favorites = items.filter(q => q.favorite).length;
  const categoriesCount = new Set(items.map(q => q.category)).size;
  return { total, favorites, categoriesCount };
}

function getCategories() {
  const items = load();
  return [...new Set(items.map(q => q.category).filter(Boolean))];
}

function renderList(container, categoryFilter, favOnly) {
  container.innerHTML = '';
  let items = load().sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  if (categoryFilter && categoryFilter !== 'all') {
    items = items.filter(q => q.category === categoryFilter);
  }
  if (favOnly) {
    items = items.filter(q => q.favorite);
  }

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '0.85rem';
    empty.textContent = 'No hay citas en esta categoría.';
    container.appendChild(empty);
    return;
  }

  for (const q of items) {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937;border:1px solid #374151;border-radius:8px;padding:0.85rem;margin-bottom:0.6rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;gap:0.5rem;';

    const catBadge = document.createElement('span');
    catBadge.style.cssText = 'font-size:0.7rem;padding:0.1rem 0.5rem;border-radius:10px;background:#374151;color:#d1d5db;font-weight:600;';
    catBadge.textContent = q.category;

    const favSpan = document.createElement('span');
    favSpan.style.cssText = 'font-size:1rem;cursor:pointer;';
    favSpan.textContent = q.favorite ? '★' : '☆';
    favSpan.title = q.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos';
    favSpan.style.color = q.favorite ? '#fbbf24' : '#6b7280';
    favSpan.addEventListener('click', () => {
      toggleFavorite(q.id);
      const panel = container.closest('[data-quotevault-panel]');
      const catFilter = panel?.querySelector('[data-active-cat]')?.dataset.activeCat || 'all';
      const favFilter = panel?.querySelector('[data-fav-toggle]')?.dataset.favOnly === '1';
      renderList(container, catFilter, favFilter);
      refreshStats(panel);
      refreshCategoryTabs(panel);
    });

    header.appendChild(catBadge);
    header.appendChild(favSpan);
    card.appendChild(header);

    const textEl = document.createElement('blockquote');
    textEl.style.cssText = 'color:#e5e7eb;font-size:0.9rem;margin:0 0 0.4rem;font-style:italic;border-left:3px solid #4338ca;padding-left:0.6rem;';
    textEl.textContent = q.text;
    card.appendChild(textEl);

    if (q.author) {
      const authorEl = document.createElement('div');
      authorEl.style.cssText = 'color:#6366f1;font-size:0.78rem;font-weight:600;margin-bottom:0.4rem;';
      authorEl.textContent = '— ' + q.author;
      card.appendChild(authorEl);
    }

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.style.cssText = 'background:none;border:1px solid #7f1d1d;color:#fca5a5;border-radius:4px;padding:0.15rem 0.4rem;font-size:0.72rem;cursor:pointer;';
    delBtn.addEventListener('click', () => {
      if (confirm('¿Eliminar esta cita?')) {
        deleteQuote(q.id);
        const panel = container.closest('[data-quotevault-panel]');
        const catFilter = panel?.querySelector('[data-active-cat]')?.dataset.activeCat || 'all';
        const favFilter = panel?.querySelector('[data-fav-toggle]')?.dataset.favOnly === '1';
        renderList(container, catFilter, favFilter);
        refreshStats(panel);
        refreshCategoryTabs(panel);
      }
    });
    card.appendChild(delBtn);

    container.appendChild(card);
  }
}

function refreshStats(panel) {
  if (!panel) return;
  const statsEl = panel.querySelector('[data-quotevault-stats]');
  if (!statsEl) return;
  const s = getQuoteStats();
  statsEl.textContent = `Total: ${s.total} · Favoritas: ${s.favorites} · Categorías: ${s.categoriesCount}`;
}

function refreshCategoryTabs(panel) {
  if (!panel) return;
  const tabsContainer = panel.querySelector('[data-cat-tabs]');
  if (!tabsContainer) return;
  const activeCat = tabsContainer.dataset.activeCat || 'all';
  const listEl = panel.querySelector('[data-quotevault-list]');
  const favToggle = panel.querySelector('[data-fav-toggle]');
  const favOnly = favToggle?.dataset.favOnly === '1';

  tabsContainer.innerHTML = '';
  const allCategories = ['all', ...getCategories()];
  allCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat === 'all' ? 'Todas' : cat;
    btn.style.cssText = `background:${cat === activeCat ? '#4338ca' : 'none'};color:${cat === activeCat ? '#fff' : '#9ca3af'};border:1px solid #374151;border-radius:4px;padding:0.2rem 0.6rem;font-size:0.78rem;cursor:pointer;`;
    btn.addEventListener('click', () => {
      tabsContainer.dataset.activeCat = cat;
      if (listEl) renderList(listEl, cat, favOnly);
      refreshCategoryTabs(panel);
    });
    tabsContainer.appendChild(btn);
  });
}

export function renderQuoteVault() {
  let panel = document.getElementById('kairos-quotevault-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const catFilter = panel.querySelector('[data-active-cat]')?.dataset.activeCat || 'all';
      const favFilter = panel.querySelector('[data-fav-toggle]')?.dataset.favOnly === '1';
      const listEl = panel.querySelector('[data-quotevault-list]');
      if (listEl) renderList(listEl, catFilter, favFilter);
      refreshStats(panel);
      refreshCategoryTabs(panel);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-quotevault-panel';
  panel.dataset.quotevaultPanel = '1';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:460px;max-width:95vw;max-height:82vh;overflow-y:auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:1.25rem;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = 'margin:0 0 1rem;color:#a5b4fc;font-size:1rem;';
  titleEl.textContent = 'Quote Vault';
  panel.appendChild(titleEl);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.dataset.quotevaultStats = '1';
  statsEl.style.cssText = 'color:#6b7280;font-size:0.78rem;margin-bottom:1rem;';
  const s0 = getQuoteStats();
  statsEl.textContent = `Total: ${s0.total} · Favoritas: ${s0.favorites} · Categorías: ${s0.categoriesCount}`;
  panel.appendChild(statsEl);

  // Form
  const form = document.createElement('div');
  form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #374151;';

  const textInput = document.createElement('textarea');
  textInput.placeholder = 'Texto de la cita...';
  textInput.rows = 3;
  textInput.style.cssText = 'background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;resize:vertical;';

  const row1 = document.createElement('div');
  row1.style.cssText = 'display:flex;gap:0.5rem;';

  const authorInput = document.createElement('input');
  authorInput.type = 'text';
  authorInput.placeholder = 'Autor';
  authorInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  const catInput = document.createElement('input');
  catInput.type = 'text';
  catInput.placeholder = 'Categoría';
  catInput.style.cssText = 'flex:1;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:6px;padding:0.45rem 0.6rem;font-size:0.85rem;';

  row1.appendChild(authorInput);
  row1.appendChild(catInput);

  const favRow = document.createElement('div');
  favRow.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
  const favCheckbox = document.createElement('input');
  favCheckbox.type = 'checkbox';
  favCheckbox.id = 'quote-fav-check';
  const favCheckLabel = document.createElement('label');
  favCheckLabel.htmlFor = 'quote-fav-check';
  favCheckLabel.style.cssText = 'color:#9ca3af;font-size:0.82rem;cursor:pointer;';
  favCheckLabel.textContent = 'Agregar a favoritos';
  favRow.appendChild(favCheckbox);
  favRow.appendChild(favCheckLabel);

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Guardar cita';
  addBtn.style.cssText = 'background:#4338ca;color:#fff;border:none;border-radius:6px;padding:0.5rem 1rem;font-size:0.85rem;cursor:pointer;font-weight:600;';

  form.appendChild(textInput);
  form.appendChild(row1);
  form.appendChild(favRow);
  form.appendChild(addBtn);
  panel.appendChild(form);

  // Random quote button
  const randomBtn = document.createElement('button');
  randomBtn.textContent = 'Cita aleatoria';
  randomBtn.style.cssText = 'background:none;border:1px solid #6366f1;color:#a5b4fc;border-radius:6px;padding:0.4rem 0.75rem;font-size:0.82rem;cursor:pointer;margin-bottom:0.75rem;';
  randomBtn.addEventListener('click', () => {
    const all = load();
    if (all.length === 0) return;
    const q = all[Math.floor(Math.random() * all.length)];
    const msg = `"${q.text}"${q.author ? '\n— ' + q.author : ''}`;
    alert(msg);
  });
  panel.appendChild(randomBtn);

  // Fav filter toggle
  const favToggle = document.createElement('button');
  favToggle.dataset.favToggle = '1';
  favToggle.dataset.favOnly = '0';
  favToggle.textContent = 'Mostrar solo favoritas';
  favToggle.style.cssText = 'background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 0.75rem;font-size:0.82rem;cursor:pointer;margin-bottom:0.75rem;margin-left:0.5rem;';
  favToggle.addEventListener('click', () => {
    const isOn = favToggle.dataset.favOnly === '1';
    favToggle.dataset.favOnly = isOn ? '0' : '1';
    favToggle.style.borderColor = isOn ? '#374151' : '#fbbf24';
    favToggle.style.color = isOn ? '#9ca3af' : '#fbbf24';
    favToggle.textContent = isOn ? 'Mostrar solo favoritas' : 'Mostrando favoritas';
    const catFilter = catTabsEl.dataset.activeCat || 'all';
    renderList(listEl, catFilter, !isOn);
  });
  panel.appendChild(favToggle);

  // Category tabs
  const catTabsEl = document.createElement('div');
  catTabsEl.dataset.catTabs = '1';
  catTabsEl.dataset.activeCat = 'all';
  catTabsEl.style.cssText = 'display:flex;gap:0.4rem;margin-bottom:0.75rem;flex-wrap:wrap;';
  panel.appendChild(catTabsEl);

  // List
  const listEl = document.createElement('div');
  listEl.dataset.quotevaultList = '1';
  panel.appendChild(listEl);

  // Close
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  closeBtn.style.cssText = 'margin-top:1rem;background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:0.4rem 1rem;font-size:0.82rem;cursor:pointer;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  addBtn.addEventListener('click', () => {
    const t = textInput.value.trim();
    if (!t) { textInput.focus(); return; }
    addQuote(t, authorInput.value, catInput.value || 'general', favCheckbox.checked);
    textInput.value = '';
    authorInput.value = '';
    catInput.value = '';
    favCheckbox.checked = false;
    const catFilter = catTabsEl.dataset.activeCat || 'all';
    const favOnly = favToggle.dataset.favOnly === '1';
    renderList(listEl, catFilter, favOnly);
    refreshStats(panel);
    refreshCategoryTabs(panel);
  });

  document.body.appendChild(panel);
  refreshCategoryTabs(panel);
  renderList(listEl, 'all', false);
}
