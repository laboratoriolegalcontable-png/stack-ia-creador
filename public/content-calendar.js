/**
 * content-calendar.js — Content Calendar tracker
 * localStorage key: kairos:content-calendar
 * @module content-calendar
 */

const KEY = 'kairos:content-calendar';

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
  const active = panel.querySelector('.cc-filter-tab.active');
  return active ? active.dataset.filter : 'all';
}

function renderList(panel) {
  const entries = load();
  const filter = getActiveFilter(panel);
  const list = panel.querySelector('.cc-list');
  if (!list) return;
  list.textContent = '';

  const filtered = filter === 'all' ? entries : entries.filter(e => e.status === filter);

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cc-empty';
    empty.textContent = 'No hay entradas.';
    list.appendChild(empty);
    return;
  }

  filtered.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'cc-row';

    const info = document.createElement('div');
    info.className = 'cc-info';

    const title = document.createElement('strong');
    title.textContent = entry.title;
    info.appendChild(title);

    const meta = document.createElement('span');
    meta.textContent = ` · ${entry.platform} · ${entry.contentType} · ${entry.scheduledDate || '—'} · `;
    info.appendChild(meta);

    const statusSpan = document.createElement('span');
    statusSpan.className = `cc-status cc-status-${entry.status}`;
    statusSpan.textContent = entry.status;
    info.appendChild(statusSpan);

    if (entry.notes) {
      const notes = document.createElement('div');
      notes.className = 'cc-notes';
      notes.textContent = entry.notes;
      info.appendChild(notes);
    }

    if (entry.tags && entry.tags.length > 0) {
      const tags = document.createElement('div');
      tags.className = 'cc-tags';
      tags.textContent = entry.tags.join(', ');
      info.appendChild(tags);
    }

    row.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'cc-actions';

    const statuses = ['idea','draft','scheduled','published'];
    const currentIdx = statuses.indexOf(entry.status);
    if (currentIdx < statuses.length - 1) {
      const nextBtn = document.createElement('button');
      nextBtn.textContent = '→ ' + statuses[currentIdx + 1];
      nextBtn.addEventListener('click', () => {
        const all = load();
        const idx = all.findIndex(e => e.id === entry.id);
        if (idx !== -1) {
          all[idx].status = statuses[currentIdx + 1];
          save(all);
          renderList(panel);
          renderStats(panel);
        }
      });
      actions.appendChild(nextBtn);
    }

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
  const statsEl = panel.querySelector('.cc-stats');
  if (!statsEl) return;
  statsEl.textContent = '';

  const total = entries.length;
  const byStatus = { idea: 0, draft: 0, scheduled: 0, published: 0 };
  const byPlatform = {};

  entries.forEach(e => {
    if (byStatus[e.status] !== undefined) byStatus[e.status]++;
    byPlatform[e.platform] = (byPlatform[e.platform] || 0) + 1;
  });

  const totalEl = document.createElement('span');
  totalEl.textContent = `Total: ${total}`;
  statsEl.appendChild(totalEl);

  Object.entries(byStatus).forEach(([s, c]) => {
    const sp = document.createElement('span');
    sp.textContent = ` · ${s}: ${c}`;
    statsEl.appendChild(sp);
  });

  const topPlatforms = Object.entries(byPlatform).sort((a,b) => b[1]-a[1]).slice(0,3);
  topPlatforms.forEach(([p, c]) => {
    const sp = document.createElement('span');
    sp.textContent = ` · ${p}: ${c}`;
    statsEl.appendChild(sp);
  });
}

export function renderContentCalendar() {
  const existing = document.getElementById('cc-panel');
  if (existing) {
    existing.style.display = existing.style.display === 'none' ? 'block' : 'none';
    if (existing.style.display === 'block') {
      renderList(existing);
      renderStats(existing);
    }
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'cc-panel';
  panel.className = 'kairos-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'panel-header';
  const h2 = document.createElement('h2');
  h2.textContent = 'Content Calendar';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  header.appendChild(h2);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Add form
  const form = document.createElement('form');
  form.className = 'cc-form';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Título del contenido *';
  titleInput.required = true;
  form.appendChild(titleInput);

  const platformInput = document.createElement('input');
  platformInput.type = 'text';
  platformInput.placeholder = 'Plataforma (Instagram, Blog, ...)';
  form.appendChild(platformInput);

  const typeInput = document.createElement('input');
  typeInput.type = 'text';
  typeInput.placeholder = 'Tipo (reel, post, artículo, ...)';
  form.appendChild(typeInput);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = localDate();
  form.appendChild(dateInput);

  const statusSel = document.createElement('select');
  ['idea','draft','scheduled','published'].forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    statusSel.appendChild(opt);
  });
  form.appendChild(statusSel);

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
    const t = titleInput.value.trim();
    if (!t) return;
    const entries = load();
    entries.push({
      id: crypto.randomUUID(),
      title: t,
      platform: platformInput.value.trim() || 'Sin plataforma',
      contentType: typeInput.value.trim() || 'general',
      scheduledDate: dateInput.value,
      status: statusSel.value,
      notes: notesInput.value.trim(),
      tags: tagsInput.value.split(',').map(x => x.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    });
    save(entries);
    titleInput.value = '';
    platformInput.value = '';
    typeInput.value = '';
    notesInput.value = '';
    tagsInput.value = '';
    renderList(panel);
    renderStats(panel);
  });
  panel.appendChild(form);

  // Filter tabs
  const tabs = document.createElement('div');
  tabs.className = 'cc-filter-tabs';
  ['all','idea','draft','scheduled','published'].forEach(f => {
    const tab = document.createElement('button');
    tab.className = 'cc-filter-tab' + (f === 'all' ? ' active' : '');
    tab.dataset.filter = f;
    tab.textContent = f;
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.cc-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderList(panel);
    });
    tabs.appendChild(tab);
  });
  panel.appendChild(tabs);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.className = 'cc-stats';
  panel.appendChild(statsEl);

  // List
  const list = document.createElement('div');
  list.className = 'cc-list';
  panel.appendChild(list);

  document.body.appendChild(panel);
  renderList(panel);
  renderStats(panel);
}
