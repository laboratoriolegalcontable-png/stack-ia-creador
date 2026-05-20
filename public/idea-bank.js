/** idea-bank.js — Banco de ideas · KAIROS browser module */
const IB_KEY = 'kairos:ideas';

function loadIdeas() { try { const d = JSON.parse(localStorage.getItem(IB_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveIdeas(list) { localStorage.setItem(IB_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

export function addIdea(title, description = '', tags = []) {
  const list = loadIdeas();
  const now = new Date().toISOString();
  const idea = { id: uid(), title: title.trim(), description: description.trim(), status: 'raw', tags, votes: 0, createdAt: now, updatedAt: now };
  list.unshift(idea);
  saveIdeas(list);
  return idea;
}

export function updateIdeaStatus(id, status) {
  const list = loadIdeas();
  const i = list.find(x => x.id === id);
  if (!i) return null;
  i.status = status; i.updatedAt = new Date().toISOString();
  saveIdeas(list); return i;
}

export function voteIdea(id, delta) {
  const list = loadIdeas();
  const i = list.find(x => x.id === id);
  if (!i) return null;
  i.votes = Math.max(0, (i.votes || 0) + delta);
  saveIdeas(list); return i;
}

export function deleteIdea(id) {
  const list = loadIdeas();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1); saveIdeas(list); return true;
}

export function getIdeaStats() {
  const list = loadIdeas();
  return { total: list.length, raw: list.filter(i => i.status === 'raw').length, exploring: list.filter(i => i.status === 'exploring').length, validated: list.filter(i => i.status === 'validated').length, archived: list.filter(i => i.status === 'archived').length };
}

export function renderIdeaPanel() {
  let panel = document.getElementById('kairos-idea-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') { const activeBtn = panel.querySelector('.filter-tabs button.active'); const f = activeBtn?.dataset.filter; renderIdeaList(f && f !== 'all' ? f : undefined); } return; }
  panel = document.createElement('section'); panel.id = 'kairos-idea-panel'; panel.className = 'kairos-panel';
  const h2 = document.createElement('h2'); h2.textContent = '💡 Idea Bank'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'idea-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form');
  const titleIn = document.createElement('input'); titleIn.type = 'text'; titleIn.placeholder = 'Título de la idea';
  const descIn = document.createElement('textarea'); descIn.placeholder = 'Descripción';
  const tagsIn = document.createElement('input'); tagsIn.type = 'text'; tagsIn.placeholder = 'Tags (coma separados)';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Idea';
  form.append(titleIn, descIn, tagsIn, addBtn);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const t = titleIn.value.trim(); if (!t) return;
    const tags = tagsIn.value.split(',').map(s => s.trim()).filter(Boolean);
    addIdea(t, descIn.value.trim(), tags);
    titleIn.value = ''; descIn.value = ''; tagsIn.value = '';
    renderIdeaList();
  });
  panel.appendChild(form);

  // filter tabs
  const tabs = document.createElement('div'); tabs.className = 'filter-tabs';
  ['all','raw','exploring','validated','archived'].forEach(s => {
    const btn = document.createElement('button'); btn.textContent = s; btn.dataset.filter = s;
    if (s === 'all') btn.classList.add('active');
    btn.addEventListener('click', () => { tabs.querySelectorAll('button').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderIdeaList(s === 'all' ? undefined : s); });
    tabs.appendChild(btn);
  });
  panel.appendChild(tabs);

  const listEl = document.createElement('div'); listEl.id = 'idea-list'; panel.appendChild(listEl);
  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderIdeaList();
}

function renderIdeaList(filterStatus) {
  const listEl = document.getElementById('idea-list');
  const statsEl = document.getElementById('idea-stats');
  if (!listEl) return;
  const stats = getIdeaStats();
  if (statsEl) { statsEl.textContent = `Total: ${stats.total} · Raw: ${stats.raw} · Explorando: ${stats.exploring} · Validadas: ${stats.validated}`; }
  let list = loadIdeas();
  if (filterStatus) list = list.filter(i => i.status === filterStatus);
  list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay ideas.'; listEl.appendChild(em); return; }
  list.forEach(idea => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const titleEl = document.createElement('strong'); titleEl.textContent = idea.title;
    const badge = document.createElement('span'); badge.className = `badge badge-${idea.status}`; badge.textContent = idea.status;
    const votes = document.createElement('span'); votes.textContent = `▲ ${idea.votes || 0}`;
    top.append(titleEl, badge, votes);
    card.appendChild(top);
    if (idea.description) { const p = document.createElement('p'); p.textContent = idea.description; card.appendChild(p); }
    // vote buttons
    const voteRow = document.createElement('div');
    const upBtn = document.createElement('button'); upBtn.textContent = '▲'; upBtn.addEventListener('click', () => { voteIdea(idea.id, 1); renderIdeaList(filterStatus); });
    const downBtn = document.createElement('button'); downBtn.textContent = '▼'; downBtn.addEventListener('click', () => { voteIdea(idea.id, -1); renderIdeaList(filterStatus); });
    voteRow.append(upBtn, downBtn);
    // status select
    const sel = document.createElement('select');
    ['raw','exploring','validated','archived'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; if (v === idea.status) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', () => { updateIdeaStatus(idea.id, sel.value); renderIdeaList(filterStatus); });
    voteRow.appendChild(sel); card.appendChild(voteRow);
    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteIdea(idea.id); renderIdeaList(filterStatus); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
