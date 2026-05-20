/**
 * weight-log.js — Registro de peso corporal con tendencia
 * @module weight-log
 */

const KEY = 'kairos:weight-log';

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load() {
  const d = JSON.parse(localStorage.getItem(KEY) || '[]');
  return Array.isArray(d) ? d : [];
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function getStats(items) {
  if (!items.length) return { total: 0, latest: null, highest: null, lowest: null, avgWeight: 0, trend: 'sin datos' };
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map(e => e.weight);
  const avg = +(weights.reduce((s, w) => s + w, 0) / weights.length).toFixed(1);
  let trend = 'sin datos';
  if (sorted.length >= 3) {
    const recent = sorted.slice(-3).map(e => e.weight);
    const delta = recent[recent.length-1] - recent[0];
    trend = Math.abs(delta) < 0.5 ? 'estable' : delta > 0 ? '↑ subiendo' : '↓ bajando';
  }
  return {
    total: items.length,
    latest: sorted[sorted.length-1].weight,
    highest: Math.max(...weights),
    lowest: Math.min(...weights),
    avgWeight: avg,
    trend,
  };
}

export function renderWeightLog() {
  const existing = document.getElementById('weight-log-panel');
  if (existing) { existing.style.display = existing.style.display === 'none' ? '' : 'none'; if (existing.style.display !== 'none') _refresh(); return; }

  const panel = document.createElement('div');
  panel.id = 'weight-log-panel';
  panel.className = 'kairos-panel';
  panel.innerHTML = `
    <div class="panel-header"><strong>/weight — Peso</strong><button class="panel-close">✕</button></div>
    <div class="panel-stats" id="weight-stats"></div>
    <form id="weight-form" class="panel-form">
      <input id="weight-val" type="number" min="1" step="0.1" placeholder="Peso" required>
      <select id="weight-unit"><option value="kg">kg</option><option value="lbs">lbs</option></select>
      <input id="weight-fat" type="number" min="1" max="60" step="0.1" placeholder="% grasa (opc)">
      <input id="weight-date" type="date">
      <input id="weight-note" placeholder="Nota (opcional)">
      <button type="submit">Registrar</button>
    </form>
    <ul id="weight-list" class="panel-list"></ul>`;
  document.body.appendChild(panel);

  panel.querySelector('.panel-close').addEventListener('click', () => { panel.style.display = 'none'; });
  document.getElementById('weight-date').value = localDate();

  panel.querySelector('#weight-form').addEventListener('submit', e => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('weight-val').value);
    const unit = document.getElementById('weight-unit').value;
    const bodyFat = document.getElementById('weight-fat').value ? parseFloat(document.getElementById('weight-fat').value) : undefined;
    const date = document.getElementById('weight-date').value || localDate();
    const note = document.getElementById('weight-note').value.trim();
    if (isNaN(weight) || weight <= 0) return;
    const items = load();
    items.unshift({ id: crypto.randomUUID(), weight, unit, bodyFat, date, note });
    save(items);
    e.target.reset();
    document.getElementById('weight-date').value = localDate();
    _refresh();
  });

  _refresh();

  function _refresh() {
    const items = load();
    const stats = getStats(items);
    const statsEl = document.getElementById('weight-stats');
    if (statsEl) {
      statsEl.textContent = stats.latest
        ? `Actual: ${stats.latest} · Tendencia: ${stats.trend} · Min: ${stats.lowest} · Max: ${stats.highest}`
        : 'Sin registros';
    }
    const list = document.getElementById('weight-list');
    if (!list) return;
    list.innerHTML = '';
    for (const item of items) {
      const li = document.createElement('li');
      li.className = 'panel-item';
      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${item.weight} ${item.unit}${item.bodyFat ? ' · ' + item.bodyFat + '% grasa' : ''}`;
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = `${item.date}${item.note ? ' · ' + item.note : ''}`;
      const del = document.createElement('button');
      del.className = 'item-delete';
      del.textContent = '✕';
      del.addEventListener('click', () => { save(load().filter(x => x.id !== item.id)); _refresh(); });
      li.append(titleEl, meta, del);
      list.appendChild(li);
    }
  }
}
