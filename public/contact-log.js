/** contact-log.js — Registro de contactos · KAIROS browser module */
const CL_KEY = 'kairos:contacts';

function loadContacts() { try { const d = JSON.parse(localStorage.getItem(CL_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch { return []; } }
function saveContacts(list) { localStorage.setItem(CL_KEY, JSON.stringify(list)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

export function addContact(name, company = '', email = '', phone = '', tags = []) {
  const list = loadContacts();
  const now = new Date().toISOString();
  const c = { id: uid(), name: name.trim(), company: company.trim(), email: email.trim(), phone: phone.trim(), tags, notes: '', interactions: [], createdAt: now, lastContactAt: '' };
  list.unshift(c); saveContacts(list); return c;
}

export function addInteraction(contactId, type, summary) {
  const list = loadContacts();
  const c = list.find(x => x.id === contactId);
  if (!c) return null;
  const now = new Date().toISOString();
  c.interactions.unshift({ id: uid(), date: now.slice(0, 10), type, summary: summary.trim(), createdAt: now });
  c.lastContactAt = now;
  saveContacts(list); return c;
}

export function updateContact(id, data) {
  const list = loadContacts();
  const c = list.find(x => x.id === id);
  if (!c) return null;
  if (data.name !== undefined) c.name = data.name.trim();
  if (data.company !== undefined) c.company = data.company.trim();
  if (data.email !== undefined) c.email = data.email.trim();
  if (data.phone !== undefined) c.phone = data.phone.trim();
  if (data.tags !== undefined) c.tags = data.tags;
  if (data.notes !== undefined) c.notes = data.notes.trim();
  saveContacts(list); return c;
}

export function deleteContact(id) {
  const list = loadContacts();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1); saveContacts(list); return true;
}

export function getContactStats() {
  const list = loadContacts();
  const interactionsTotal = list.reduce((s, c) => s + c.interactions.length, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const activeThisWeek = list.filter(c => c.lastContactAt > weekAgo).length;
  return { total: list.length, interactionsTotal, activeThisWeek };
}

export function renderContactPanel() {
  let panel = document.getElementById('kairos-contact-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; if (panel.style.display === 'block') renderContactList(); return; }
  panel = document.createElement('section'); panel.id = 'kairos-contact-panel'; panel.className = 'kairos-panel';
  const h2 = document.createElement('h2'); h2.textContent = '👥 Contact Log'; panel.appendChild(h2);
  const statsEl = document.createElement('p'); statsEl.id = 'contact-stats'; panel.appendChild(statsEl);

  const form = document.createElement('form');
  const nameIn = document.createElement('input'); nameIn.type = 'text'; nameIn.placeholder = 'Nombre *';
  const companyIn = document.createElement('input'); companyIn.type = 'text'; companyIn.placeholder = 'Empresa';
  const emailIn = document.createElement('input'); emailIn.type = 'email'; emailIn.placeholder = 'Email';
  const phoneIn = document.createElement('input'); phoneIn.type = 'text'; phoneIn.placeholder = 'Teléfono';
  const addBtn = document.createElement('button'); addBtn.type = 'submit'; addBtn.textContent = '+ Contacto';
  form.append(nameIn, companyIn, emailIn, phoneIn, addBtn);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!nameIn.value.trim()) return;
    addContact(nameIn.value, companyIn.value, emailIn.value, phoneIn.value);
    nameIn.value = ''; companyIn.value = ''; emailIn.value = ''; phoneIn.value = '';
    renderContactList();
  });
  panel.appendChild(form);

  const listEl = document.createElement('div'); listEl.id = 'contact-list'; panel.appendChild(listEl);
  const recentH = document.createElement('h3'); recentH.textContent = 'Últimas interacciones'; panel.appendChild(recentH);
  const recentEl = document.createElement('div'); recentEl.id = 'contact-recent'; panel.appendChild(recentEl);
  document.querySelector('main') ? document.querySelector('main').appendChild(panel) : document.body.appendChild(panel);
  renderContactList();
}

function renderContactList() {
  const listEl = document.getElementById('contact-list');
  const statsEl = document.getElementById('contact-stats');
  const recentEl = document.getElementById('contact-recent');
  if (!listEl) return;
  const stats = getContactStats();
  if (statsEl) { statsEl.textContent = `Contactos: ${stats.total} · Interacciones: ${stats.interactionsTotal} · Activos esta semana: ${stats.activeThisWeek}`; }
  const list = loadContacts();
  listEl.innerHTML = '';
  list.forEach(c => {
    const card = document.createElement('div'); card.className = 'kairos-card';
    const top = document.createElement('div'); top.className = 'kairos-card-top';
    const nameEl = document.createElement('strong'); nameEl.textContent = c.name;
    const companyEl = document.createElement('span'); companyEl.textContent = c.company; companyEl.style.color = '#9ca3af';
    top.append(nameEl, companyEl); card.appendChild(top);
    if (c.email || c.phone) { const info = document.createElement('small'); info.textContent = [c.email, c.phone].filter(Boolean).join(' · '); card.appendChild(info); }
    if (c.lastContactAt) { const last = document.createElement('small'); last.textContent = `Último contacto: ${c.lastContactAt.slice(0, 10)}`; card.appendChild(last); }
    const iCount = document.createElement('span'); iCount.className = 'badge'; iCount.textContent = `${c.interactions.length} interacciones`; card.appendChild(iCount);

    // Interaction form toggle
    const logBtn = document.createElement('button'); logBtn.textContent = '+ Log'; logBtn.type = 'button';
    const iForm = document.createElement('form'); iForm.style.display = 'none';
    const typeSelect = document.createElement('select');
    ['call','email','meeting','message'].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; typeSelect.appendChild(o); });
    const summaryIn = document.createElement('input'); summaryIn.type = 'text'; summaryIn.placeholder = 'Resumen';
    const iSubmit = document.createElement('button'); iSubmit.type = 'submit'; iSubmit.textContent = 'Guardar';
    iForm.append(typeSelect, summaryIn, iSubmit);
    logBtn.addEventListener('click', () => { iForm.style.display = iForm.style.display === 'none' ? 'flex' : 'none'; });
    iForm.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!summaryIn.value.trim()) return;
      addInteraction(c.id, typeSelect.value, summaryIn.value);
      iForm.style.display = 'none'; summaryIn.value = '';
      renderContactList();
    });
    card.append(logBtn, iForm);

    const delBtn = document.createElement('button'); delBtn.textContent = '✕'; delBtn.className = 'del-btn';
    delBtn.addEventListener('click', () => { deleteContact(c.id); renderContactList(); });
    card.appendChild(delBtn);
    listEl.appendChild(card);
  });

  if (recentEl) {
    recentEl.innerHTML = '';
    const allInteractions = list.flatMap(c => c.interactions.map(i => ({ ...i, contactName: c.name }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    if (!allInteractions.length) { const em = document.createElement('em'); em.textContent = 'Sin interacciones.'; recentEl.appendChild(em); return; }
    allInteractions.forEach(i => {
      const row = document.createElement('div'); row.className = 'kairos-card';
      const top = document.createElement('div'); top.className = 'kairos-card-top';
      const who = document.createElement('strong'); who.textContent = i.contactName;
      const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = i.type;
      const when = document.createElement('small'); when.textContent = i.date;
      top.append(who, badge, when); row.appendChild(top);
      const sum = document.createElement('p'); sum.textContent = i.summary; row.appendChild(sum);
      recentEl.appendChild(row);
    });
  }
}
