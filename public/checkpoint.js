/** KAIROS Checkpoint Log — ES2022+ vanilla module */

const STORAGE_KEY = 'kairos:checkpoints';

function load() {
  const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  return Array.isArray(d) ? d : [];
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function addCheckpoint(text, tag = 'general') {
  const trimmed = String(text).trim();
  if (!trimmed) return null;
  const data = load();
  const entry = { id: uid(), text: trimmed, tag: String(tag).trim() || 'general', createdAt: new Date().toISOString() };
  data.push(entry);
  save(data);
  return entry;
}

export function deleteCheckpoint(id) {
  save(load().filter(c => c.id !== id));
}

export function getCheckpointStats() {
  const data = load();
  const today = localDate();
  const todayCount = data.filter(c => c.createdAt.startsWith(today)).length;
  const tags = [...new Set(data.map(c => c.tag))];
  return { total: data.length, today: todayCount, tags };
}

function renderCheckpointList(panel, activeTag) {
  const container = panel.querySelector('#kairos-cp-list');
  if (!container) return;
  container.innerHTML = '';
  const data = load()
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);
  const filtered = activeTag === 'all' ? data : data.filter(c => c.tag === activeTag);

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No checkpoints yet.';
    empty.style.cssText = 'color:#888;font-size:13px;margin:8px 0;';
    container.appendChild(empty);
    return;
  }

  for (const c of filtered) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid #2a2a3a;';

    const badge = document.createElement('span');
    badge.style.cssText = 'background:#312e81;color:#a5b4fc;font-size:10px;border-radius:4px;padding:2px 5px;white-space:nowrap;margin-top:2px;';
    badge.textContent = c.tag;

    const body = document.createElement('div');
    body.style.flex = '1';

    const txt = document.createElement('div');
    txt.style.fontSize = '13px';
    txt.textContent = c.text;

    const time = document.createElement('div');
    time.style.cssText = 'font-size:10px;color:#666;margin-top:2px;';
    time.textContent = new Date(c.createdAt).toLocaleTimeString();

    body.appendChild(txt);
    body.appendChild(time);

    const del = document.createElement('button');
    del.textContent = '🗑';
    del.style.cssText = 'background:none;border:none;cursor:pointer;color:#f87171;font-size:13px;';
    del.addEventListener('click', () => {
      deleteCheckpoint(c.id);
      renderCheckpointList(panel, panel._activeTag || 'all');
      updateCPStats(panel);
      renderTagTabs(panel);
    });

    row.appendChild(badge);
    row.appendChild(body);
    row.appendChild(del);
    container.appendChild(row);
  }
}

function updateCPStats(panel) {
  const el = panel.querySelector('#kairos-cp-stats');
  if (!el) return;
  const { total, today, tags } = getCheckpointStats();
  el.textContent = `Total: ${total} | Today: ${today} | Tags: ${tags.length}`;
}

function renderTagTabs(panel) {
  const tabsEl = panel.querySelector('#kairos-cp-tabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = '';
  const { tags } = getCheckpointStats();
  const allTags = ['all', ...tags];
  for (const tag of allTags) {
    const btn = document.createElement('button');
    btn.textContent = tag;
    const active = (panel._activeTag || 'all') === tag;
    btn.style.cssText = `background:${active ? '#7c3aed' : '#1e1e35'};border:1px solid #3a3a5c;border-radius:4px;padding:3px 8px;color:${active ? '#fff' : '#a0a0c0'};cursor:pointer;font-size:11px;`;
    btn.addEventListener('click', () => {
      panel._activeTag = tag;
      renderTagTabs(panel);
      renderCheckpointList(panel, tag);
    });
    tabsEl.appendChild(btn);
  }
}

export function renderCheckpointPanel() {
  let panel = document.getElementById('kairos-cp-panel');
  if (panel) {
    const visible = panel.style.display !== 'none';
    panel.style.display = visible ? 'none' : 'flex';
    if (!visible) {
      renderTagTabs(panel);
      renderCheckpointList(panel, panel._activeTag || 'all');
      updateCPStats(panel);
    }
    return;
  }

  panel = document.createElement('div');
  panel.id = 'kairos-cp-panel';
  panel._activeTag = 'all';
  panel.style.cssText = 'position:fixed;top:60px;right:370px;width:340px;max-height:80vh;overflow-y:auto;background:#1a1a2e;border:1px solid #3a3a5c;border-radius:12px;padding:16px;z-index:99999;display:flex;flex-direction:column;gap:10px;color:#e0e0f0;font-family:system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.5);';

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';

  const title = document.createElement('h3');
  title.textContent = '📍 Checkpoints';
  title.style.cssText = 'margin:0;font-size:16px;color:#a78bfa;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:16px;';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });

  headerRow.appendChild(title);
  headerRow.appendChild(closeBtn);

  const form = document.createElement('form');
  form.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = 'Checkpoint text…';
  textInput.style.cssText = 'background:#0f0f1a;border:1px solid #3a3a5c;border-radius:6px;padding:7px;color:#e0e0f0;font-size:13px;';

  const tagInput = document.createElement('input');
  tagInput.type = 'text';
  tagInput.placeholder = 'Tag (default: general)';
  tagInput.style.cssText = 'background:#0f0f1a;border:1px solid #3a3a5c;border-radius:6px;padding:7px;color:#e0e0f0;font-size:13px;';

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = '+ Add Checkpoint';
  addBtn.style.cssText = 'background:#7c3aed;border:none;border-radius:6px;padding:8px;color:#fff;cursor:pointer;font-size:13px;font-weight:600;';

  form.appendChild(textInput);
  form.appendChild(tagInput);
  form.appendChild(addBtn);

  form.addEventListener('submit', e => {
    e.preventDefault();
    addCheckpoint(textInput.value, tagInput.value || 'general');
    textInput.value = '';
    tagInput.value = '';
    renderTagTabs(panel);
    renderCheckpointList(panel, panel._activeTag || 'all');
    updateCPStats(panel);
  });

  const statsEl = document.createElement('div');
  statsEl.id = 'kairos-cp-stats';
  statsEl.style.cssText = 'font-size:12px;color:#a0a0c0;background:#0f0f1a;border-radius:6px;padding:6px 8px;';

  const tabsEl = document.createElement('div');
  tabsEl.id = 'kairos-cp-tabs';
  tabsEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';

  const list = document.createElement('div');
  list.id = 'kairos-cp-list';

  panel.appendChild(headerRow);
  panel.appendChild(form);
  panel.appendChild(statsEl);
  panel.appendChild(tabsEl);
  panel.appendChild(list);
  document.body.appendChild(panel);

  renderTagTabs(panel);
  renderCheckpointList(panel, 'all');
  updateCPStats(panel);
}
