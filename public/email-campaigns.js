const KEY = 'kairos:email-campaigns';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function renderEmailCampaigns() {
  let panel = document.getElementById('email-campaigns-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'email-campaigns-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📧 Campañas Email</h2><button class="ia-close" onclick="document.getElementById('email-campaigns-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="ec-form" class="ia-form">
        <input id="ec-name" placeholder="Nombre de campaña *" required />
        <select id="ec-type"><option value="newsletter">Newsletter</option><option value="promotional">Promocional</option><option value="drip">Drip</option><option value="welcome">Bienvenida</option><option value="re-engagement">Re-engagement</option><option value="announcement">Anuncio</option><option value="other">Otro</option></select>
        <input id="ec-subject" placeholder="Asunto" />
        <input id="ec-date" type="date" />
        <input id="ec-list-size" type="number" placeholder="Tamaño de lista" min="0" />
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div id="ec-update-form" class="ia-form" style="display:none">
        <input id="ec-upd-id" type="hidden" />
        <input id="ec-upd-sent" type="number" placeholder="Enviados" min="0" />
        <input id="ec-upd-opens" type="number" placeholder="Aperturas" min="0" />
        <input id="ec-upd-clicks" type="number" placeholder="Clicks" min="0" />
        <input id="ec-upd-unsubs" type="number" placeholder="Bajas" min="0" />
        <button id="ec-upd-btn" class="ia-btn">Guardar métricas</button>
        <button id="ec-upd-cancel" class="ia-btn gray">Cancelar</button>
      </div>
      <div id="ec-stats" class="ia-stats-bar"></div>
      <div id="ec-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('ec-date').value = localDate();
  document.getElementById('ec-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), name: document.getElementById('ec-name').value.trim(), type: document.getElementById('ec-type').value, subject: document.getElementById('ec-subject').value.trim(), status: 'draft', scheduledDate: document.getElementById('ec-date').value, listSize: +document.getElementById('ec-list-size').value || 0, sentCount: 0, openRate: 0, clickRate: 0, unsubscribeRate: 0, createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('ec-date').value = localDate();
    _refresh();
  };
  document.getElementById('ec-upd-btn').onclick = () => {
    const id = document.getElementById('ec-upd-id').value;
    const d = load(); const c = d.find(x => x.id === id); if (!c) return;
    const sent = +document.getElementById('ec-upd-sent').value || 0;
    const opens = +document.getElementById('ec-upd-opens').value || 0;
    const clicks = +document.getElementById('ec-upd-clicks').value || 0;
    const unsubs = +document.getElementById('ec-upd-unsubs').value || 0;
    c.sentCount = sent; c.status = 'sent';
    c.openRate = sent > 0 ? +(opens / sent * 100).toFixed(1) : 0;
    c.clickRate = sent > 0 ? +(clicks / sent * 100).toFixed(1) : 0;
    c.unsubscribeRate = sent > 0 ? +(unsubs / sent * 100).toFixed(1) : 0;
    c.updatedAt = now(); save(d);
    document.getElementById('ec-update-form').style.display = 'none'; _refresh();
  };
  document.getElementById('ec-upd-cancel').onclick = () => { document.getElementById('ec-update-form').style.display = 'none'; };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('ec-stats');
  const list = document.getElementById('ec-list');
  if (!stats || !list) return;
  const sent = items.filter(i => i.status === 'sent');
  const avgOpen = sent.length ? +(sent.reduce((s, i) => s + i.openRate, 0) / sent.length).toFixed(1) : 0;
  stats.textContent = `Total: ${items.length} | Enviadas: ${sent.length} | Avg apertura: ${avgOpen}%`;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.type}</span><span class="ia-badge ${item.status === 'sent' ? 'green' : 'gray'}">${item.status}</span><button class="ia-btn-sm" data-metrics="${item.id}">📊</button><button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.name;
    el.querySelector('small').textContent = item.status === 'sent' ? `Aperturas: ${item.openRate}% | Clicks: ${item.clickRate}% | Bajas: ${item.unsubscribeRate}%` : `Programada: ${item.scheduledDate} | Lista: ${item.listSize}`;
    el.querySelector('[data-metrics]').onclick = () => {
      document.getElementById('ec-upd-id').value = item.id;
      document.getElementById('ec-upd-sent').value = item.sentCount;
      document.getElementById('ec-update-form').style.display = '';
    };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    list.appendChild(el);
  });
}
