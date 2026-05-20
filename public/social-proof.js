const KEY = 'kairos:social-proof';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderSocialProof() {
  let panel = document.getElementById('social-proof-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'social-proof-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🏆 Social Proof</h2><button class="ia-close" onclick="document.getElementById('social-proof-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="sp-form" class="ia-form">
        <select id="sp-type"><option value="testimonial">Testimonio</option><option value="case-study">Caso de éxito</option><option value="review">Reseña</option><option value="award">Premio</option><option value="press">Prensa</option><option value="certification">Certificación</option><option value="endorsement">Endorsement</option></select>
        <input id="sp-client" placeholder="Cliente / Fuente" />
        <input id="sp-title" placeholder="Título *" required />
        <textarea id="sp-content" placeholder="Contenido / cita" rows="3"></textarea>
        <input id="sp-result" placeholder="Resultado cuantificable (ej: +30% ventas)" />
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div id="sp-stats" class="ia-stats-bar"></div>
      <div id="sp-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('sp-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ id: uid(), type: document.getElementById('sp-type').value, client: document.getElementById('sp-client').value.trim(), title: document.getElementById('sp-title').value.trim(), content: document.getElementById('sp-content').value.trim(), result: document.getElementById('sp-result').value.trim(), published: false, createdAt: now(), updatedAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('sp-stats');
  const list = document.getElementById('sp-list');
  if (!stats || !list) return;
  const published = items.filter(i => i.published).length;
  stats.textContent = `Total: ${items.length} | Publicados: ${published} | Pendientes: ${items.length - published}`;
  list.innerHTML = '';
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.type}</span><span class="ia-badge ${item.published ? 'green' : 'gray'}">${item.published ? 'Publicado' : 'Borrador'}</span><button class="ia-btn-sm" data-toggle="${item.id}">📢</button><button class="ia-btn-sm red" data-del="${item.id}">✕</button></div><div></div><small></small>`;
    el.querySelector('[data-toggle]').onclick = () => { const d = load(); const t = d.find(x => x.id === item.id); if (t) { t.published = !t.published; t.updatedAt = now(); save(d); _refresh(); } };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    el.querySelector('strong').textContent = item.title;
    const divs = el.querySelectorAll('div > :not(.ia-list-item-header)');
    el.querySelectorAll('div')[1].textContent = item.content || item.client;
    el.querySelector('small').textContent = item.result ? `📊 ${item.result}` : '';
    list.appendChild(el);
  });
}
