/** contact-crm.js — CRM de contactos · KAIROS browser module */
const KEY = 'kairos:contacts';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderContactCrm() {
  let panel = document.getElementById('contactcrm-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'contactcrm-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <h3>Contact CRM</h3>
    <form id="contactcrm-form">
      <input id="cc-name"    placeholder="Nombre *" required style="margin:2px">
      <input id="cc-email"   placeholder="Email"    type="email" style="margin:2px">
      <input id="cc-phone"   placeholder="Teléfono" style="margin:2px">
      <input id="cc-company" placeholder="Empresa"  style="margin:2px">
      <input id="cc-tags"    placeholder="Tags (coma-separados)" style="margin:2px">
      <textarea id="cc-notes" placeholder="Notas" rows="2" style="margin:2px;width:100%;box-sizing:border-box"></textarea>
      <button type="submit">Agregar Contacto</button>
    </form>
    <div class="ia-stats" id="contactcrm-stats"></div>
    <ul id="contactcrm-list" style="list-style:none;padding:0;margin-top:0.5rem"></ul>
  `;
  document.body.appendChild(panel);
  document.getElementById('contactcrm-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cc-name').value.trim();
    if (!name) return;
    const email   = document.getElementById('cc-email').value.trim();
    const phone   = document.getElementById('cc-phone').value.trim();
    const company = document.getElementById('cc-company').value.trim();
    const tags    = document.getElementById('cc-tags').value.trim().split(',').map(t => t.trim()).filter(Boolean);
    const notes   = document.getElementById('cc-notes').value.trim();
    const contacts = load();
    contacts.push({ id: uid(), name, email, phone, company, tags, notes, followUps: 0, createdAt: now(), updatedAt: now() });
    save(contacts);
    e.target.reset();
    _refresh();
  });
  _refresh();
}

function _refresh() {
  const contacts = load();
  const list = document.getElementById('contactcrm-list');
  const stats = document.getElementById('contactcrm-stats');
  if (!list || !stats) return;
  list.innerHTML = '';
  contacts.slice().reverse().forEach(c => {
    const li = document.createElement('li');
    li.style.cssText = 'border:1px solid #374151;border-radius:6px;padding:0.5rem;margin-bottom:0.4rem;display:flex;justify-content:space-between;align-items:center;gap:0.5rem';
    const info = document.createElement('div');
    const nameSpan = document.createElement('strong');
    nameSpan.textContent = c.name;
    const compSpan = document.createElement('span');
    compSpan.style.cssText = 'color:#9ca3af;font-size:0.8rem;margin-left:0.4rem';
    compSpan.textContent = c.company || '';
    const emailSpan = document.createElement('div');
    emailSpan.style.cssText = 'color:#6b7280;font-size:0.78rem';
    emailSpan.textContent = c.email || '';
    info.appendChild(nameSpan);
    info.appendChild(compSpan);
    info.appendChild(emailSpan);
    const right = document.createElement('div');
    right.style.cssText = 'display:flex;align-items:center;gap:0.4rem;flex-shrink:0';
    if (c.followUps > 0) {
      const badge = document.createElement('span');
      badge.style.cssText = 'background:#1d4ed8;color:#fff;border-radius:99px;padding:0.1rem 0.45rem;font-size:0.72rem';
      badge.textContent = `${c.followUps} follow-up${c.followUps > 1 ? 's' : ''}`;
      right.appendChild(badge);
    }
    const fuBtn = document.createElement('button');
    fuBtn.className = 'ia-cmd';
    fuBtn.textContent = '+FU';
    fuBtn.title = 'Registrar follow-up';
    fuBtn.addEventListener('click', () => {
      const contacts2 = load();
      const idx = contacts2.findIndex(x => x.id === c.id);
      if (idx !== -1) { contacts2[idx].followUps = (contacts2[idx].followUps || 0) + 1; contacts2[idx].updatedAt = now(); save(contacts2); _refresh(); }
    });
    const delBtn = document.createElement('button');
    delBtn.className = 'ia-cmd';
    delBtn.textContent = '✕';
    delBtn.title = 'Eliminar';
    delBtn.addEventListener('click', () => {
      const contacts2 = load().filter(x => x.id !== c.id);
      save(contacts2); _refresh();
    });
    right.appendChild(fuBtn);
    right.appendChild(delBtn);
    li.appendChild(info);
    li.appendChild(right);
    list.appendChild(li);
  });
  const withFollowUps = contacts.filter(c => c.followUps > 0).length;
  const companies = new Set(contacts.map(c => c.company).filter(Boolean)).size;
  stats.textContent = `Total: ${contacts.length} · Con follow-ups: ${withFollowUps} · Empresas: ${companies}`;
}
