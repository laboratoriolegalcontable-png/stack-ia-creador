const KEY = 'kairos:body-metrics';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function renderBodyMetrics() {
  let panel = document.getElementById('body-metrics-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'body-metrics-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>💪 Métricas Corporales</h2><button class="ia-close" onclick="document.getElementById('body-metrics-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="bm-form" class="ia-form">
        <input id="bm-date" type="date" />
        <div style="display:flex;gap:8px">
          <input id="bm-weight" type="number" placeholder="Peso (kg)" min="0" step="0.1" style="flex:1" />
          <input id="bm-height" type="number" placeholder="Altura (cm)" min="0" step="0.1" style="flex:1" />
        </div>
        <div style="display:flex;gap:8px">
          <input id="bm-fat" type="number" placeholder="% Grasa" min="0" max="100" step="0.1" style="flex:1" />
          <input id="bm-muscle" type="number" placeholder="% Músculo" min="0" max="100" step="0.1" style="flex:1" />
        </div>
        <div style="display:flex;gap:8px">
          <input id="bm-waist" type="number" placeholder="Cintura (cm)" min="0" step="0.1" style="flex:1" />
          <input id="bm-chest" type="number" placeholder="Pecho (cm)" min="0" step="0.1" style="flex:1" />
        </div>
        <input id="bm-notes" placeholder="Notas" />
        <button type="submit" class="ia-btn">Registrar</button>
      </form>
      <div id="bm-stats" class="ia-stats-bar"></div>
      <div id="bm-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('bm-date').value = localDate();
  document.getElementById('bm-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const weight = +document.getElementById('bm-weight').value || 0;
    const height = +document.getElementById('bm-height').value || 0;
    const bmi = weight > 0 && height > 0 ? +(weight / ((height / 100) ** 2)).toFixed(1) : 0;
    items.push({ uid: uid(), date: document.getElementById('bm-date').value, weight, height, bmi, bodyFatPct: +document.getElementById('bm-fat').value || 0, musclePct: +document.getElementById('bm-muscle').value || 0, waistCm: +document.getElementById('bm-waist').value || 0, chestCm: +document.getElementById('bm-chest').value || 0, notes: document.getElementById('bm-notes').value.trim(), createdAt: now() });
    save(items);
    e.target.reset();
    document.getElementById('bm-date').value = localDate();
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const items = load();
  const stats = document.getElementById('bm-stats');
  const list = document.getElementById('bm-list');
  if (!stats || !list) return;
  const latest = items.sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latest && latest.weight) {
    stats.textContent = `Último: ${latest.weight}kg${latest.bmi ? ` | IMC: ${latest.bmi}` : ''}${latest.bodyFatPct ? ` | Grasa: ${latest.bodyFatPct}%` : ''} | Total registros: ${items.length}`;
  } else {
    stats.textContent = `Total registros: ${items.length}`;
  }
  list.innerHTML = '';
  items.slice(0, 15).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    el.innerHTML = `<div class="ia-list-item-header"><strong></strong><button class="ia-btn-sm red" data-del="${item.uid}">✕</button></div><small></small>`;
    el.querySelector('strong').textContent = item.date;
    const parts = [item.weight ? `${item.weight}kg` : '', item.bmi ? `IMC:${item.bmi}` : '', item.bodyFatPct ? `G:${item.bodyFatPct}%` : '', item.musclePct ? `M:${item.musclePct}%` : '', item.waistCm ? `C:${item.waistCm}cm` : ''].filter(Boolean);
    el.querySelector('small').textContent = parts.join(' · ') || '—';
    el.querySelector('[data-del]').onclick = () => { save(load().filter(x => x.uid !== item.uid)); _refresh(); };
    list.appendChild(el);
  });
}
