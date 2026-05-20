const KEY = 'kairos:newsletters';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

export function renderNewsletterTracker() {
  let panel = document.getElementById('newsletter-tracker-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'newsletter-tracker-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📰 Newsletters</h2><button class="ia-close" onclick="document.getElementById('newsletter-tracker-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="nl-form" class="ia-form">
        <input id="nl-name" placeholder="Nombre del newsletter *" required />
        <input id="nl-author" placeholder="Autor / Publicación" />
        <input id="nl-url" placeholder="URL de suscripción" />
        <select id="nl-frequency"><option value="daily">Diaria</option><option value="weekly">Semanal</option><option value="biweekly">Quincenal</option><option value="monthly">Mensual</option><option value="irregular">Irregular</option></select>
        <select id="nl-category"><option value="tech">Tecnología</option><option value="business">Negocios</option><option value="marketing">Marketing</option><option value="finance">Finanzas</option><option value="design">Diseño</option><option value="ai">IA</option><option value="personal">Personal</option><option value="other">Otro</option></select>
        <input id="nl-rating" type="number" placeholder="Rating (1–5)" min="1" max="5" />
        <label style="display:flex;align-items:center;gap:6px"><input id="nl-paid" type="checkbox" /> Newsletter de pago</label>
        <button type="submit" class="ia-btn">Agregar</button>
      </form>
      <div id="nl-stats" class="ia-stats-bar"></div>
      <div id="nl-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('nl-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    items.push({ uid: uid(), name: document.getElementById('nl-name').value.trim(), author: document.getElementById('nl-author').value.trim(), url: document.getElementById('nl-url').value.trim(), frequency: document.getElementById('nl-frequency').value, category: document.getElementById('nl-category').value, rating: Math.min(5, Math.max(1, +document.getElementById('nl-rating').value || 0)) || 0, paid: document.getElementById('nl-paid').checked, active: true, createdAt: now() });
    save(items);
    e.target.reset();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('nl-stats');
  const list = document.getElementById('nl-list');
  if (!stats || !list) return;
  const active = items.filter(i => i.active).length;
  const paid = items.filter(i => i.paid && i.active).length;
  stats.textContent = `Total: ${items.length} | Activas: ${active} | De pago: ${paid}`;
  list.innerHTML = '';
  items.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1) || b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><span class="ia-badge">${item.category}</span><span class="ia-badge ${item.active ? 'green' : 'gray'}">${item.active ? 'Activa' : 'Pausada'}</span>${item.paid ? '<span class="ia-badge blue">💳</span>' : ''}<button class="ia-btn-sm" data-toggle="${item.uid}">${item.active ? '⏸' : '▶'}</button><button class="ia-btn-sm red" data-del="${item.uid}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.name + (item.author ? ` — ${item.author}` : '');
    el.querySelector('small').textContent = [item.frequency, item.rating ? `⭐${item.rating}` : ''].filter(Boolean).join(' · ');
    el.querySelector('[data-toggle]').onclick = () => {
      const d = load(); const n = d.find(x => x.uid === item.uid); if (!n) return;
      n.active = !n.active; save(d); _refresh();
    };
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.uid !== item.uid)); _refresh(); };
    list.appendChild(el);
  });
}
