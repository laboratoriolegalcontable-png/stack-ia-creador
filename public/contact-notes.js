const KEY = 'kairos:contact-notes';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderContactNotes() {
  let panel = document.getElementById('contact-notes-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'contact-notes-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>👥 Contact Notes</h2><button class="ia-close" onclick="document.getElementById('contact-notes-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="cn-form" class="ia-form">
        <input id="cn-contact" placeholder="Nombre del contacto *" required />
        <textarea id="cn-note" placeholder="Nota *" rows="2" required></textarea>
        <input id="cn-topic" placeholder="Tema / contexto" />
        <input id="cn-followup" type="date" placeholder="Fecha de follow-up" />
        <button type="submit" class="ia-btn">Agregar nota</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <input id="cn-search" placeholder="Buscar por contacto…" style="flex:1;padding:4px 8px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-bg);color:var(--color-text)" />
      </div>
      <div id="cn-stats" class="ia-stats-bar"></div>
      <div id="cn-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('cn-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), contact: document.getElementById('cn-contact').value.trim(), note: document.getElementById('cn-note').value.trim(), topic: document.getElementById('cn-topic').value.trim(), followup: document.getElementById('cn-followup').value, createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  document.getElementById('cn-search').oninput = _refresh;
  _refresh();
}

function _refresh() {
  const query = (document.getElementById('cn-search')?.value || '').toLowerCase();
  const all = load();
  const items = query ? all.filter(i => i.contact.toLowerCase().includes(query) || i.note.toLowerCase().includes(query) || (i.topic || '').toLowerCase().includes(query)) : all;
  const stats = document.getElementById('cn-stats');
  const list = document.getElementById('cn-list');
  if (!stats || !list) return;
  const contacts = [...new Set(all.map(i => i.contact))];
  const withFollowup = all.filter(i => i.followup).length;
  stats.textContent = 'Notas: ' + all.length + ' | Contactos únicos: ' + contacts.length + ' | Con follow-up: ' + withFollowup;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong>' + (item.topic ? '<span class="ia-badge gray"></span>' : '') + (item.followup ? '<span class="ia-badge blue"></span>' : '') + '<button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = item.contact;
    const badges = el.querySelectorAll('.ia-badge');
    let bi = 0;
    if (item.topic) badges[bi++].textContent = item.topic;
    if (item.followup) badges[bi++].textContent = '📅 ' + item.followup;
    el.querySelector('small').textContent = item.note.slice(0, 120);
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
