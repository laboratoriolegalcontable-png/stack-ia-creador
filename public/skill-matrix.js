/** skill-matrix.js — Skill Matrix tracker · KAIROS browser module */
const SK_KEY = 'kairos:skills';

function loadSkills() { try { const d = JSON.parse(localStorage.getItem(SK_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveSkills(list) { localStorage.setItem(SK_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function addSkill(name, category = 'general', currentLevel = 1, targetLevel = 3, notes = '') {
  const list = loadSkills();
  const skill = { id: uid(), name: name.trim(), category: category.trim() || 'general', currentLevel: Math.min(5, Math.max(1, +currentLevel || 1)), targetLevel: Math.min(5, Math.max(1, +targetLevel || 3)), notes: notes.trim(), createdAt: localDate() };
  list.unshift(skill);
  saveSkills(list);
  return skill;
}

export function updateSkillLevel(id, currentLevel) {
  const list = loadSkills();
  const skill = list.find(s => s.id === id);
  if (!skill) return false;
  skill.currentLevel = Math.min(5, Math.max(1, +currentLevel || 1));
  saveSkills(list);
  return true;
}

export function deleteSkill(id) {
  const list = loadSkills();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveSkills(list);
  return true;
}

export function getSkillStats() {
  const list = loadSkills();
  if (!list.length) return { total: 0, avgGap: 0, byCategory: {} };
  const gaps = list.map(s => s.targetLevel - s.currentLevel);
  const avgGap = gaps.reduce((a, b) => a + b, 0) / list.length;
  const byCategory = {};
  list.forEach(s => { byCategory[s.category] = (byCategory[s.category] || 0) + 1; });
  return { total: list.length, avgGap: +avgGap.toFixed(2), byCategory };
}

export function renderSkillPanel() {
  let panel = document.getElementById('kairos-skill-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      const activeBtn = panel.querySelector('.filter-tabs button.active');
      const f = activeBtn?.dataset.filter;
      renderSkillList(f && f !== 'all' ? f : undefined);
    }
    return;
  }
  panel = document.createElement('section');
  panel.id = 'kairos-skill-panel';
  panel.className = 'kairos-panel';

  const h2 = document.createElement('h2'); h2.textContent = '🎯 Skill Matrix'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'skill-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form'); form.id = 'skill-form';
  const nameIn = document.createElement('input'); nameIn.type = 'text'; nameIn.placeholder = 'Nombre de la skill'; nameIn.id = 'skill-name-in'; nameIn.required = true;
  const catIn = document.createElement('input'); catIn.type = 'text'; catIn.placeholder = 'Categoría (ej: técnica)'; catIn.id = 'skill-cat-in';
  const curSel = document.createElement('select'); curSel.id = 'skill-cur-in';
  const curLbl = document.createElement('label'); curLbl.textContent = 'Nivel actual: ';
  curLbl.htmlFor = 'skill-cur-in';
  [1,2,3,4,5].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v + ' ★'; curSel.appendChild(o); });
  const tgtSel = document.createElement('select'); tgtSel.id = 'skill-tgt-in';
  const tgtLbl = document.createElement('label'); tgtLbl.textContent = 'Nivel objetivo: ';
  tgtLbl.htmlFor = 'skill-tgt-in';
  [1,2,3,4,5].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v + ' ★'; if (v === 3) o.selected = true; tgtSel.appendChild(o); });
  const notesIn = document.createElement('textarea'); notesIn.placeholder = 'Notas (opcional)'; notesIn.id = 'skill-notes-in';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Skill';

  const row1 = document.createElement('div'); row1.className = 'form-row'; row1.append(curLbl, curSel);
  const row2 = document.createElement('div'); row2.className = 'form-row'; row2.append(tgtLbl, tgtSel);
  form.append(nameIn, catIn, row1, row2, notesIn, addBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = nameIn.value.trim(); if (!n) return;
    addSkill(n, catIn.value, curSel.value, tgtSel.value, notesIn.value);
    nameIn.value = ''; catIn.value = ''; notesIn.value = '';
    curSel.value = '1'; tgtSel.value = '3';
    const activeBtn = panel.querySelector('.filter-tabs button.active');
    const f = activeBtn?.dataset.filter;
    renderSkillList(f && f !== 'all' ? f : undefined);
  });
  panel.appendChild(form);

  const tabs = document.createElement('div'); tabs.className = 'filter-tabs'; tabs.id = 'skill-tabs';
  const allCategories = () => [...new Set(loadSkills().map(s => s.category))];

  function rebuildTabs(activeFilter) {
    tabs.innerHTML = '';
    const cats = ['all', ...allCategories()];
    cats.forEach(cat => {
      const btn = document.createElement('button'); btn.textContent = cat; btn.dataset.filter = cat;
      if (cat === (activeFilter || 'all')) btn.classList.add('active');
      btn.addEventListener('click', () => {
        tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSkillList(cat === 'all' ? undefined : cat);
      });
      tabs.appendChild(btn);
    });
  }
  rebuildTabs();
  panel.appendChild(tabs);

  const listEl = document.createElement('div'); listEl.id = 'skill-list'; panel.appendChild(listEl);

  const closeBtn = document.createElement('button'); closeBtn.textContent = '✕ Cerrar'; closeBtn.className = 'close-btn';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);

  // expose rebuildTabs for use on render
  panel._rebuildTabs = rebuildTabs;
  renderSkillList();
}

function renderSkillList(filterCat) {
  const listEl = document.getElementById('skill-list');
  const statsEl = document.getElementById('skill-stats');
  const panel = document.getElementById('kairos-skill-panel');
  if (!listEl) return;
  const stats = getSkillStats();
  if (statsEl) { statsEl.textContent = `Total: ${stats.total} · Gap promedio: ${stats.avgGap} · Categorías: ${Object.keys(stats.byCategory).join(', ') || 'ninguna'}`; }
  // rebuild tabs to pick up new categories
  if (panel?._rebuildTabs) panel._rebuildTabs(filterCat || 'all');
  let list = loadSkills();
  if (filterCat) list = list.filter(s => s.category === filterCat);
  listEl.innerHTML = '';
  if (!list.length) { const em = document.createElement('em'); em.textContent = 'No hay skills.'; listEl.appendChild(em); return; }
  list.forEach(s => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const nameEl = document.createElement('strong'); nameEl.textContent = s.name;
    const catBadge = document.createElement('span'); catBadge.className = 'badge'; catBadge.textContent = s.category;
    top.append(nameEl, catBadge);
    card.appendChild(top);

    // Gap bar
    const gap = Math.max(0, s.targetLevel - s.currentLevel);
    const gapRow = document.createElement('div'); gapRow.className = 'skill-gap-row';
    const gapLabel = document.createElement('small');
    gapLabel.textContent = `Nivel: ${s.currentLevel}/5 → Objetivo: ${s.targetLevel}/5 · Gap: ${gap}`;
    const barWrap = document.createElement('div'); barWrap.className = 'skill-bar-wrap';
    barWrap.style.cssText = 'background:#1f2937;border-radius:4px;height:8px;width:160px;display:inline-block;overflow:hidden;margin-left:8px;vertical-align:middle;';
    const barFill = document.createElement('div');
    barFill.style.cssText = `height:100%;width:${(s.currentLevel/5)*100}%;background:${gap === 0 ? '#10b981' : gap <= 1 ? '#6366f1' : gap <= 2 ? '#f59e0b' : '#ef4444'};border-radius:4px;`;
    barWrap.appendChild(barFill);
    gapRow.append(gapLabel, barWrap);
    card.appendChild(gapRow);

    // Inline level editor
    const editRow = document.createElement('div'); editRow.className = 'skill-edit-row';
    const editLbl = document.createElement('label'); editLbl.textContent = 'Actualizar nivel: ';
    const levelSel = document.createElement('select');
    [1,2,3,4,5].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v + ' ★'; if (v === s.currentLevel) o.selected = true; levelSel.appendChild(o); });
    const saveBtn = document.createElement('button'); saveBtn.textContent = '✓'; saveBtn.type = 'button'; saveBtn.className = 'small-btn';
    saveBtn.addEventListener('click', () => {
      updateSkillLevel(s.id, +levelSel.value);
      renderSkillList(filterCat);
    });
    editRow.append(editLbl, levelSel, saveBtn);
    card.appendChild(editRow);

    if (s.notes) { const p = document.createElement('p'); p.textContent = s.notes; card.appendChild(p); }
    const dateEl = document.createElement('small'); dateEl.textContent = s.createdAt; card.appendChild(dateEl);

    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteSkill(s.id); renderSkillList(filterCat); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });
}
