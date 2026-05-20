/**
 * reading-notes.js — Reading notes with source and type filtering
 * localStorage key: kairos:reading-notes
 * @module reading-notes
 */

const KEY = 'kairos:reading-notes';

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function getActiveFilter(panel) {
  const active = panel.querySelector('.rn-filter-tab.active');
  return active ? active.dataset.filter : 'all';
}

function getSourceFilter(panel) {
  const input = panel.querySelector('.rn-source-filter');
  return input ? input.value.trim().toLowerCase() : '';
}

function renderList(panel) {
  const entries = load();
  const filter = getActiveFilter(panel);
  const sourceFilter = getSourceFilter(panel);
  const list = panel.querySelector('.rn-list');
  if (!list) return;
  list.textContent = '';

  let filtered = filter === 'all' ? entries : entries.filter(e => e.noteType === filter);
  if (sourceFilter) {
    filtered = filtered.filter(e => e.source.toLowerCase().includes(sourceFilter));
  }

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'rn-empty';
    empty.textContent = 'No hay notas de lectura.';
    list.appendChild(empty);
    return;
  }

  // Most recent first
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  sorted.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'rn-row';

    const info = document.createElement('div');
    info.className = 'rn-info';

    const typeEl = document.createElement('span');
    typeEl.className = `rn-type rn-type-${entry.noteType}`;
    typeEl.textContent = entry.noteType;
    info.appendChild(typeEl);

    const sourceEl = document.createElement('strong');
    sourceEl.textContent = ` ${entry.source}`;
    info.appendChild(sourceEl);

    if (entry.author) {
      const authorEl = document.createElement('span');
      authorEl.textContent = ` · ${entry.author}`;
      info.appendChild(authorEl);
    }

    if (entry.page) {
      const pageEl = document.createElement('span');
      pageEl.textContent = ` · p.${entry.page}`;
      info.appendChild(pageEl);
    }

    const contentEl = document.createElement('div');
    contentEl.className = 'rn-content';
    contentEl.textContent = entry.content;
    info.appendChild(contentEl);

    if (entry.tags && entry.tags.length > 0) {
      const tags = document.createElement('div');
      tags.className = 'rn-tags';
      tags.textContent = entry.tags.join(', ');
      info.appendChild(tags);
    }

    row.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'rn-actions';

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
  const statsEl = panel.querySelector('.rn-stats');
  if (!statsEl) return;
  statsEl.textContent = '';

  const total = entries.length;

  const bySources = {};
  const byNoteType = { highlight: 0, summary: 0, question: 0, insight: 0 };

  entries.forEach(e => {
    bySources[e.source] = (bySources[e.source] || 0) + 1;
    if (byNoteType[e.noteType] !== undefined) byNoteType[e.noteType]++;
  });

  const sourceCount = Object.keys(bySources).length;

  const totalEl = document.createElement('span');
  totalEl.textContent = `Total: ${total}`;
  statsEl.appendChild(totalEl);

  const srcEl = document.createElement('span');
  srcEl.textContent = ` · Fuentes: ${sourceCount}`;
  statsEl.appendChild(srcEl);

  Object.entries(byNoteType).forEach(([t, c]) => {
    const sp = document.createElement('span');
    sp.textContent = ` · ${t}: ${c}`;
    statsEl.appendChild(sp);
  });
}

export function renderReadingNotes() {
  const existing = document.getElementById('rn-panel');
  if (existing) {
    existing.style.display = existing.style.display === 'none' ? 'block' : 'none';
    if (existing.style.display === 'block') {
      renderList(existing);
      renderStats(existing);
    }
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'rn-panel';
  panel.className = 'kairos-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'panel-header';
  const h2 = document.createElement('h2');
  h2.textContent = 'Reading Notes';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  header.appendChild(h2);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Add form
  const form = document.createElement('form');
  form.className = 'rn-form';

  const sourceInput = document.createElement('input');
  sourceInput.type = 'text';
  sourceInput.placeholder = 'Fuente (libro, artículo, ...) *';
  sourceInput.required = true;
  form.appendChild(sourceInput);

  const authorInput = document.createElement('input');
  authorInput.type = 'text';
  authorInput.placeholder = 'Autor (opcional)';
  form.appendChild(authorInput);

  const noteTypeSel = document.createElement('select');
  const noteTypeLabel = document.createElement('label');
  noteTypeLabel.textContent = 'Tipo: ';
  ['highlight','summary','question','insight'].forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    noteTypeSel.appendChild(opt);
  });
  form.appendChild(noteTypeLabel);
  form.appendChild(noteTypeSel);

  const contentInput = document.createElement('textarea');
  contentInput.placeholder = 'Nota / contenido *';
  contentInput.required = true;
  contentInput.rows = 3;
  form.appendChild(contentInput);

  const pageInput = document.createElement('input');
  pageInput.type = 'number';
  pageInput.min = '1';
  pageInput.placeholder = 'Página (opcional)';
  form.appendChild(pageInput);

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
    const src = sourceInput.value.trim();
    const cnt = contentInput.value.trim();
    if (!src || !cnt) return;
    const entries = load();
    entries.push({
      id: crypto.randomUUID(),
      source: src,
      author: authorInput.value.trim(),
      noteType: noteTypeSel.value,
      content: cnt,
      page: pageInput.value ? parseInt(pageInput.value, 10) : undefined,
      tags: tagsInput.value.split(',').map(x => x.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    });
    save(entries);
    sourceInput.value = '';
    authorInput.value = '';
    contentInput.value = '';
    pageInput.value = '';
    tagsInput.value = '';
    renderList(panel);
    renderStats(panel);
  });
  panel.appendChild(form);

  // Filter tabs
  const tabs = document.createElement('div');
  tabs.className = 'rn-filter-tabs';
  ['all','highlight','summary','question','insight'].forEach(f => {
    const tab = document.createElement('button');
    tab.className = 'rn-filter-tab' + (f === 'all' ? ' active' : '');
    tab.dataset.filter = f;
    tab.textContent = f;
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.rn-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderList(panel);
    });
    tabs.appendChild(tab);
  });
  panel.appendChild(tabs);

  // Source filter input
  const sourceFilterWrapper = document.createElement('div');
  sourceFilterWrapper.className = 'rn-source-filter-wrapper';
  const sourceFilterInput = document.createElement('input');
  sourceFilterInput.type = 'text';
  sourceFilterInput.className = 'rn-source-filter';
  sourceFilterInput.placeholder = 'Filtrar por fuente...';
  sourceFilterInput.addEventListener('input', () => {
    renderList(panel);
  });
  sourceFilterWrapper.appendChild(sourceFilterInput);
  panel.appendChild(sourceFilterWrapper);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.className = 'rn-stats';
  panel.appendChild(statsEl);

  // List
  const list = document.createElement('div');
  list.className = 'rn-list';
  panel.appendChild(list);

  document.body.appendChild(panel);
  renderList(panel);
  renderStats(panel);
}
