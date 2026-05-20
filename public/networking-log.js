/**
 * networking-log.js — Networking contact log
 * localStorage key: kairos:networking-log
 * @module networking-log
 */

const KEY = 'kairos:networking-log';

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function getActiveFilter(panel) {
  const active = panel.querySelector('.nl-filter-tab.active');
  return active ? active.dataset.filter : 'all';
}

function renderList(panel) {
  const entries = load();
  const filter = getActiveFilter(panel);
  const list = panel.querySelector('.nl-list');
  if (!list) return;
  list.textContent = '';

  const today = localDate();
  const filtered = filter === 'all' ? entries : entries.filter(e => String(e.strength) === filter);

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'nl-empty';
    empty.textContent = 'No hay contactos.';
    list.appendChild(empty);
    return;
  }

  filtered.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'nl-row';

    const info = document.createElement('div');
    info.className = 'nl-info';

    const nameEl = document.createElement('strong');
    nameEl.textContent = entry.name;
    info.appendChild(nameEl);

    const meta = document.createElement('span');
    meta.textContent = ` · ${entry.company || '—'} · ${entry.role || '—'} · Conocido: ${entry.metAt || '—'} · Último contacto: ${entry.lastContact || '—'}`;
    info.appendChild(meta);

    const strengthEl = document.createElement('span');
    strengthEl.className = 'nl-strength';
    strengthEl.textContent = ` · ★${entry.strength}`;
    info.appendChild(strengthEl);

    if (entry.followUpDate) {
      const follow = document.createElement('div');
      follow.className = entry.followUpDate <= today ? 'nl-followup nl-followup-due' : 'nl-followup';
      follow.textContent = `Follow-up: ${entry.followUpDate}${entry.followUpDate <= today ? ' ⚠️' : ''}`;
      info.appendChild(follow);
    }

    if (entry.notes) {
      const notes = document.createElement('div');
      notes.className = 'nl-notes';
      notes.textContent = entry.notes;
      info.appendChild(notes);
    }

    if (entry.tags && entry.tags.length > 0) {
      const tags = document.createElement('div');
      tags.className = 'nl-tags';
      tags.textContent = entry.tags.join(', ');
      info.appendChild(tags);
    }

    row.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'nl-actions';

    // Inline strength update
    const strengthSel = document.createElement('select');
    [1,2,3,4,5].forEach(n => {
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.textContent = '★'.repeat(n);
      if (n === entry.strength) opt.selected = true;
      strengthSel.appendChild(opt);
    });
    strengthSel.addEventListener('change', () => {
      const all = load();
      const idx = all.findIndex(e => e.id === entry.id);
      if (idx !== -1) {
        all[idx].strength = parseInt(strengthSel.value, 10);
        save(all);
        renderList(panel);
        renderStats(panel);
      }
    });
    actions.appendChild(strengthSel);

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => {
      const all = load();
      save(all.filter(e => e.id !== entry.id));
      renderList(panel);
      renderStats(panel);
    });
    actions.appendChild(delBtn);

    row.appendChild(actions);
    list.appendChild(row);
  });
}

function renderStats(panel) {
  const entries = load();
  const statsEl = panel.querySelector('.nl-stats');
  if (!statsEl) return;
  statsEl.textContent = '';

  const today = localDate();
  const total = entries.length;
  const avgStrength = total > 0
    ? (entries.reduce((s, e) => s + e.strength, 0) / total).toFixed(1)
    : 0;
  const needsFollowUp = entries.filter(e => e.followUpDate && e.followUpDate <= today).length;

  const totalEl = document.createElement('span');
  totalEl.textContent = `Total: ${total}`;
  statsEl.appendChild(totalEl);

  const avgEl = document.createElement('span');
  avgEl.textContent = ` · Avg fuerza: ${avgStrength}`;
  statsEl.appendChild(avgEl);

  const followEl = document.createElement('span');
  followEl.textContent = ` · Necesitan follow-up: ${needsFollowUp}`;
  statsEl.appendChild(followEl);
}

export function renderNetworkingLog() {
  const existing = document.getElementById('nl-panel');
  if (existing) {
    existing.style.display = existing.style.display === 'none' ? 'block' : 'none';
    if (existing.style.display === 'block') {
      renderList(existing);
      renderStats(existing);
    }
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'nl-panel';
  panel.className = 'kairos-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'panel-header';
  const h2 = document.createElement('h2');
  h2.textContent = 'Networking Log';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  header.appendChild(h2);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Add form
  const form = document.createElement('form');
  form.className = 'nl-form';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Nombre *';
  nameInput.required = true;
  form.appendChild(nameInput);

  const companyInput = document.createElement('input');
  companyInput.type = 'text';
  companyInput.placeholder = 'Empresa';
  form.appendChild(companyInput);

  const roleInput = document.createElement('input');
  roleInput.type = 'text';
  roleInput.placeholder = 'Rol / Cargo';
  form.appendChild(roleInput);

  const metAtInput = document.createElement('input');
  metAtInput.type = 'text';
  metAtInput.placeholder = 'Conocido en (evento, plataforma, ...)';
  form.appendChild(metAtInput);

  const lastContactInput = document.createElement('input');
  lastContactInput.type = 'date';
  lastContactInput.value = localDate();
  form.appendChild(lastContactInput);

  const strengthSel = document.createElement('select');
  const strengthLabel = document.createElement('label');
  strengthLabel.textContent = 'Fuerza: ';
  [1,2,3,4,5].forEach(n => {
    const opt = document.createElement('option');
    opt.value = String(n);
    opt.textContent = '★'.repeat(n);
    strengthSel.appendChild(opt);
  });
  strengthSel.value = '3';
  form.appendChild(strengthLabel);
  form.appendChild(strengthSel);

  const followUpInput = document.createElement('input');
  followUpInput.type = 'date';
  followUpInput.placeholder = 'Follow-up (opcional)';
  form.appendChild(followUpInput);

  const notesInput = document.createElement('textarea');
  notesInput.placeholder = 'Notas (opcional)';
  notesInput.rows = 2;
  form.appendChild(notesInput);

  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.placeholder = 'Tags (coma separados)';
  form.appendChild(tagsInput);

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Agregar';
  form.appendChild(addBtn);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const n = nameInput.value.trim();
    if (!n) return;
    const entries = load();
    entries.push({
      id: crypto.randomUUID(),
      name: n,
      company: companyInput.value.trim(),
      role: roleInput.value.trim(),
      metAt: metAtInput.value.trim(),
      lastContact: lastContactInput.value,
      strength: parseInt(strengthSel.value, 10),
      followUpDate: followUpInput.value || undefined,
      notes: notesInput.value.trim(),
      tags: tagsInput.value.split(',').map(x => x.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    });
    save(entries);
    nameInput.value = '';
    companyInput.value = '';
    roleInput.value = '';
    metAtInput.value = '';
    notesInput.value = '';
    tagsInput.value = '';
    followUpInput.value = '';
    renderList(panel);
    renderStats(panel);
  });
  panel.appendChild(form);

  // Filter tabs
  const tabs = document.createElement('div');
  tabs.className = 'nl-filter-tabs';
  ['all','1','2','3','4','5'].forEach(f => {
    const tab = document.createElement('button');
    tab.className = 'nl-filter-tab' + (f === 'all' ? ' active' : '');
    tab.dataset.filter = f;
    tab.textContent = f === 'all' ? 'all' : '★'.repeat(parseInt(f));
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.nl-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderList(panel);
    });
    tabs.appendChild(tab);
  });
  panel.appendChild(tabs);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.className = 'nl-stats';
  panel.appendChild(statsEl);

  // List
  const list = document.createElement('div');
  list.className = 'nl-list';
  panel.appendChild(list);

  document.body.appendChild(panel);
  renderList(panel);
  renderStats(panel);
}
