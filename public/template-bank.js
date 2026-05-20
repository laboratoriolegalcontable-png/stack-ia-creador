/** KAIROS Template Bank — ES2022+ vanilla module */

const STORAGE_KEY = 'kairos:templates';

function load() {
  const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  return Array.isArray(d) ? d : [];
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function addTemplate(name, category, body) {
  const data = load();
  const now = new Date().toISOString();
  const entry = { id: uid(), name: String(name).trim(), category: String(category).trim() || 'general', body: String(body), usedCount: 0, createdAt: now, updatedAt: now };
  data.push(entry);
  save(data);
  return entry;
}

export function updateTemplate(id, { name, category, body }) {
  const data = load();
  const idx = data.findIndex(t => t.id === id);
  if (idx === -1) return null;
  if (name !== undefined) data[idx].name = String(name).trim();
  if (category !== undefined) data[idx].category = String(category).trim();
  if (body !== undefined) data[idx].body = String(body);
  data[idx].updatedAt = new Date().toISOString();
  save(data);
  return data[idx];
}

export function useTemplate(id) {
  const data = load();
  const idx = data.findIndex(t => t.id === id);
  if (idx === -1) return null;
  data[idx].usedCount = (data[idx].usedCount || 0) + 1;
  save(data);
  return data[idx];
}

export function deleteTemplate(id) {
  save(load().filter(t => t.id !== id));
}

export function getTemplateStats() {
  const data = load();
  const total = data.length;
  const categories = [...new Set(data.map(t => t.category))];
  const topUsed = data.slice().sort((a, b) => b.usedCount - a.usedCount).slice(0, 5).map(t => ({ name: t.name, usedCount: t.usedCount }));
  return { total, categories, topUsed };
}

function renderTemplateList(panel, activeCategory) {
  const container = panel.querySelector('#kairos-tpl-list');
  if (!container) return;
  container.innerHTML = '';
  const data = load().slice().sort((a, b) => b.usedCount - a.usedCount);
  const filtered = activeCategory === 'all' ? data : data.filter(t => t.category === activeCategory);

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No templates yet.';
    empty.style.cssText = 'color:#888;font-size:13px;margin:8px 0;';
    container.appendChild(empty);
    return;
  }

  for (const t of filtered) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid #2a2a3a;';

    const info = document.createElement('div');
    info.style.flex = '1';

    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-size:13px;font-weight:600;color:#e0e0f0;';
    nameEl.textContent = t.name;

    const meta = document.createElement('div');
    meta.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:2px;';

    const catBadge = document.createElement('span');
    catBadge.style.cssText = 'background:#1e3a5f;color:#7dd3fc;font-size:10px;border-radius:4px;padding:1px 5px;';
    catBadge.textContent = t.category;

    const preview = document.createElement('span');
    preview.style.cssText = 'font-size:11px;color:#666;';
    preview.textContent = t.body.slice(0, 50) + (t.body.length > 50 ? '…' : '');

    meta.appendChild(catBadge);
    meta.appendChild(preview);

    const usedEl = document.createElement('div');
    usedEl.style.cssText = 'font-size:10px;color:#555;margin-top:2px;';
    usedEl.textContent = `Used: ${t.usedCount}`;

    info.appendChild(nameEl);
    info.appendChild(meta);
    info.appendChild(usedEl);

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy';
    copyBtn.style.cssText = 'background:#1e3a5f;border:none;border-radius:4px;padding:3px 7px;color:#7dd3fc;cursor:pointer;font-size:11px;';
    copyBtn.addEventListener('click', () => {
      useTemplate(t.id);
      navigator.clipboard.writeText(t.body);
      copyBtn.textContent = '✓ Copied';
      setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
      renderTemplateList(panel, panel._activeCat || 'all');
      updateTplStats(panel);
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:#f87171;font-size:13px;';
    delBtn.addEventListener('click', () => {
      deleteTemplate(t.id);
      renderTplCategoryTabs(panel);
      renderTemplateList(panel, panel._activeCat || 'all');
      updateTplStats(panel);
    });

    actions.appendChild(copyBtn);
    actions.appendChild(delBtn);

    row.appendChild(info);
    row.appendChild(actions);
    container.appendChild(row);
  }
}

function updateTplStats(panel) {
  const el = panel.querySelector('#kairos-tpl-stats');
  if (!el) return;
  const { total, categories, topUsed } = getTemplateStats();
  el.textContent = `Total: ${total} | Categories: ${categories.length} | Top: ${topUsed[0]?.name || '—'}`;
}

function renderTplCategoryTabs(panel) {
  const tabsEl = panel.querySelector('#kairos-tpl-tabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = '';
  const { categories } = getTemplateStats();
  const allCats = ['all', ...categories];
  for (const cat of allCats) {
    const btn = document.createElement('button');
    btn.textContent = cat;
    const active = (panel._activeCat || 'all') === cat;
    btn.style.cssText = `background:${active ? '#1e3a5f' : '#0f0f1a'};border:1px solid #2a3a5c;border-radius:4px;padding:3px 8px;color:${active ? '#7dd3fc' : '#a0a0c0'};cursor:pointer;font-size:11px;`;
    btn.addEventListener('click', () => {
      panel._activeCat = cat;
      renderTplCategoryTabs(panel);
      renderTemplateList(panel, cat);
    });
    tabsEl.appendChild(btn);
  }
}

export function renderTemplatePanel() {
  let panel = document.getElementById('kairos-tpl-panel');
  if (panel) {
    const visible = panel.style.display !== 'none';
    panel.style.display = visible ? 'none' : 'flex';
    if (!visible) {
      renderTplCategoryTabs(panel);
      renderTemplateList(panel, panel._activeCat || 'all');
      updateTplStats(panel);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-tpl-panel';
  panel._activeCat = 'all';
  panel.style.cssText = 'position:fixed;top:60px;right:720px;width:360px;max-height:80vh;overflow-y:auto;background:#1a1a2e;border:1px solid #3a3a5c;border-radius:12px;padding:16px;z-index:99999;display:flex;flex-direction:column;gap:10px;color:#e0e0f0;font-family:system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.5);';

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';

  const title = document.createElement('h3');
  title.textContent = '📚 Template Bank';
  title.style.cssText = 'margin:0;font-size:16px;color:#7dd3fc;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:16px;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });

  headerRow.appendChild(title);
  headerRow.appendChild(closeBtn);

  const form = document.createElement('form');
  form.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Template name…';
  nameInput.style.cssText = 'background:#0f0f1a;border:1px solid #3a3a5c;border-radius:6px;padding:7px;color:#e0e0f0;font-size:13px;';

  const catInput = document.createElement('input');
  catInput.type = 'text';
  catInput.placeholder = 'Category…';
  catInput.style.cssText = 'background:#0f0f1a;border:1px solid #3a3a5c;border-radius:6px;padding:7px;color:#e0e0f0;font-size:13px;';

  const bodyTA = document.createElement('textarea');
  bodyTA.placeholder = 'Template body…';
  bodyTA.rows = 3;
  bodyTA.style.cssText = 'background:#0f0f1a;border:1px solid #3a3a5c;border-radius:6px;padding:7px;color:#e0e0f0;font-size:13px;resize:vertical;';

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = '+ Add Template';
  addBtn.style.cssText = 'background:#1e3a5f;border:none;border-radius:6px;padding:8px;color:#7dd3fc;cursor:pointer;font-size:13px;font-weight:600;';

  form.appendChild(nameInput);
  form.appendChild(catInput);
  form.appendChild(bodyTA);
  form.appendChild(addBtn);

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!nameInput.value.trim() || !bodyTA.value.trim()) return;
    addTemplate(nameInput.value, catInput.value || 'general', bodyTA.value);
    nameInput.value = '';
    catInput.value = '';
    bodyTA.value = '';
    renderTplCategoryTabs(panel);
    renderTemplateList(panel, panel._activeCat || 'all');
    updateTplStats(panel);
  });

  const statsEl = document.createElement('div');
  statsEl.id = 'kairos-tpl-stats';
  statsEl.style.cssText = 'font-size:12px;color:#a0a0c0;background:#0f0f1a;border-radius:6px;padding:6px 8px;';

  const tabsEl = document.createElement('div');
  tabsEl.id = 'kairos-tpl-tabs';
  tabsEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';

  const list = document.createElement('div');
  list.id = 'kairos-tpl-list';

  panel.appendChild(headerRow);
  panel.appendChild(form);
  panel.appendChild(statsEl);
  panel.appendChild(tabsEl);
  panel.appendChild(list);
  document.body.appendChild(panel);

  renderTplCategoryTabs(panel);
  renderTemplateList(panel, 'all');
  updateTplStats(panel);
}
