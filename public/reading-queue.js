/** reading-queue.js — Cola de lectura · KAIROS browser module */
const RQ_KEY = 'kairos:reading';

function loadItems() { try { const d = JSON.parse(localStorage.getItem(RQ_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveItems(list) { localStorage.setItem(RQ_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

export function addReadingItem(title, url, tags = []) {
  const list = loadItems();
  const trimmedUrl = url.trim();
  if (!/^https?:\/\//i.test(trimmedUrl)) return null;
  const item = { id: uid(), title: title.trim(), url: trimmedUrl, tags, status: 'unread', notes: '', addedAt: new Date().toISOString() };
  list.unshift(item); saveItems(list); return item;
}

export function updateReadStatus(id, status, notes) {
  const list = loadItems();
  const i = list.find(x => x.id === id);
  if (!i) return null;
  i.status = status;
  if (notes !== undefined) i.notes = notes.trim();
  if (status === 'done') i.readAt = new Date().toISOString();
  saveItems(list); return i;
}

export function deleteReadingItem(id) {
  const list = loadItems();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1); saveItems(list); return true;
}

export function getReadingStats() {
  const list = loadItems();
  return { total: list.length, unread: list.filter(i => i.status === 'unread').length, reading: list.filter(i => i.status === 'reading').length, done: list.filter(i => i.status === 'done').length, dropped: list.filter(i => i.status === 'dropped').length };
}

export function renderReadingPanel() {
  let panel = document.getElementById('kairos-reading-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') renderReadingList(); return; }
  panel = document.createElement('section'); panel.id = 'kairos-reading-panel'; panel.className = 'kairos-panel';
  const h2 = document.createElement('h2'); h2.textContent = '📚 Reading Queue'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'reading-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form');
  const titleIn = document.createElement('input'); titleIn.type = 'text'; titleIn.placeholder = 'Título';
  const urlIn = document.createElement('input'); urlIn.type = 'url'; urlIn.placeholder = 'URL';
  const tagsIn = document.createElement('input'); tagsIn.type = 'text'; tagsIn.placeholder = 'Tags (coma separados)';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Agregar';
  urlIn.addEventListener('input', () => urlIn.setCustomValidity(''));
  form.append(titleIn, urlIn, tagsIn, addBtn);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const t = titleIn.value.trim(); const u = urlIn.value.trim();
    if (!t || !u) return;
    if (!/^https?:\/\//i.test(u)) { urlIn.setCustomValidity('Solo se permiten URLs http:// o https://'); urlIn.reportValidity(); return; }
    urlIn.setCustomValidity('');
    const tags = tagsIn.value.split(',').map(s => s.trim()).filter(Boolean);
    addReadingItem(t, u, tags);
    titleIn.value = ''; urlIn.value = ''; tagsIn.value = '';
    renderReadingList();
  });
  panel.appendChild(form);

  // filter tabs
  const tabs = document.createElement('div'); tabs.className = 'filter-tabs';
  ['all','unread','reading','done','dropped'].forEach(s => {
    const btn = document.createElement('button'); btn.textContent = s; btn.dataset.filter = s;
    if (s === 'all') btn.classList.add('active');
    btn.addEventListener('click', () => { tabs.querySelectorAll('button').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderReadingList(s === 'all' ? undefined : s); });
    tabs.appendChild(btn);
  });
  panel.appendChild(tabs);

  const listEl = document.createElement('div'); listEl.id = 'reading-list'; panel.appendChild(listEl);
  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderReadingList();
}

function renderReadingList(filterStatus) {
  const listEl = document.getElementById('reading-list');
  const statsEl = document.getElementById('reading-stats');
  if (!listEl) return;
  const stats = getReadingStats();
  if (statsEl) { statsEl.textContent = `Total: ${stats.total} · Sin leer: ${stats.unread} · Leyendo: ${stats.reading} · Leídos: ${stats.done}`; }
  let list = loadItems();
  if (filterStatus) list = list.filter(i => i.status === filterStatus);
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay items.'; listEl.appendChild(em); return; }
  list.forEach(item => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const link = document.createElement('a'); link.textContent = item.title; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    const badge = document.createElement('span'); badge.className = `badge badge-${item.status}`; badge.textContent = item.status;
    top.append(link, badge); card.appendChild(top);
    if (item.tags.length) { const t = document.createElement('small'); t.textContent = item.tags.join(', '); card.appendChild(t); }
    // status select
    const sel = document.createElement('select');
    ['unread','reading','done','dropped'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; if (v === item.status) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', () => { updateReadStatus(item.id, sel.value); renderReadingList(filterStatus); });
    card.appendChild(sel);
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteReadingItem(item.id); renderReadingList(filterStatus); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
