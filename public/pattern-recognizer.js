const KEY = 'kairos:patterns';
const RULES = [
  { name: 'Consultas de estado', regex: /estado|status|cómo va|how is/i, min: 3 },
  { name: 'Solicitudes de resumen', regex: /resumen|summary|resume|summarize/i, min: 2 },
  { name: 'Errores recurrentes', regex: /error|fallo|crash|exception|broke/i, min: 3 },
  { name: 'Optimización', regex: /optimiz|mejorar|improve|performance|rendimiento/i, min: 2 },
  { name: 'Configuración', regex: /config|configurar|setup|instalar|install/i, min: 2 },
  { name: 'Debug', regex: /debug|depurar|trace|log|inspect/i, min: 3 },
  { name: 'Revisión de código', regex: /revisar|review|refactor|lint|code/i, min: 2 },
  { name: 'Documentación', regex: /docs|documentación|documentation|readme|manual/i, min: 2 },
];
function loadPatterns() { const d = JSON.parse(localStorage.getItem(KEY) || '{}'); return typeof d === 'object' && d !== null ? d : {}; }
function savePatterns(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function now() { return new Date().toISOString(); }

function analyzeText(text) {
  const patterns = loadPatterns();
  const detected = [];
  const n = now();
  for (const rule of RULES) {
    if (rule.regex.test(text)) {
      const k = rule.name;
      const p = patterns[k] || { name: k, occurrences: 0, firstSeen: n, lastSeen: n, confidence: 0, examples: [] };
      p.occurrences++;
      p.lastSeen = n;
      p.confidence = Math.min(1, p.occurrences / (rule.min * 3));
      if (p.examples.length < 5) p.examples.push(text.slice(0, 100));
      patterns[k] = p;
      if (p.occurrences >= rule.min) detected.push(p);
    }
  }
  savePatterns(patterns);
  return detected;
}

export function renderPatternRecognizer() {
  let panel = document.getElementById('pattern-recognizer-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'pattern-recognizer-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🔍 Pattern Recognizer</h2><button class="ia-close" onclick="document.getElementById('pattern-recognizer-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="pr-form" class="ia-form">
        <input id="pr-text" placeholder="Texto a analizar *" required />
        <button type="submit" class="ia-btn">Analizar</button>
      </form>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <button id="pr-clear" class="ia-btn-sm red">🗑 Limpiar patrones</button>
      </div>
      <div id="pr-stats" class="ia-stats-bar"></div>
      <div id="pr-result" style="margin-bottom:8px;padding:8px;background:var(--color-surface);border-radius:4px;font-size:0.85rem;display:none"></div>
      <div id="pr-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('pr-form').onsubmit = e => {
    e.preventDefault();
    const text = document.getElementById('pr-text').value.trim();
    const detected = analyzeText(text);
    const result = document.getElementById('pr-result');
    result.style.display = '';
    result.textContent = detected.length ? 'Patrones detectados: ' + detected.map(p => p.name).join(', ') : 'Sin patrones detectados (umbral no alcanzado)';
    e.target.reset();
    _refresh();
  };
  document.getElementById('pr-clear').onclick = () => { if (confirm('¿Limpiar todos los patrones?')) { savePatterns({}); _refresh(); } };
  _refresh();
}

function _refresh() {
  const patterns = Object.values(loadPatterns());
  const stats = document.getElementById('pr-stats');
  const list = document.getElementById('pr-list');
  if (!stats || !list) return;
  const significant = patterns.filter(p => p.confidence > 0.3).length;
  stats.textContent = 'Patrones totales: ' + patterns.length + ' | Significativos: ' + significant;
  list.innerHTML = '';
  patterns.sort((a, b) => b.occurrences - a.occurrences).forEach(p => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const conf = Math.round(p.confidence * 100);
    const color = conf >= 70 ? 'red' : conf >= 40 ? 'blue' : 'gray';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge">' + p.occurrences + 'x</span><span class="ia-badge ' + color + '">' + conf + '%</span></div><small></small>';
    el.querySelector('strong').textContent = p.name;
    el.querySelector('small').textContent = 'Último: ' + new Date(p.lastSeen).toLocaleString();
    list.appendChild(el);
  });
}
