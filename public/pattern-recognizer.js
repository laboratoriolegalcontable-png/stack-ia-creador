/** Pattern Recognizer — KAIROS browser module */
const PATTERNS_KEY = 'kairos:patterns';

const PATTERN_RULES = [
  { name: 'Consultas frecuentes de estado', regex: /estado|status|cómo va|how is/i, minOccurrences: 3 },
  { name: 'Solicitudes de resumen', regex: /resumen|summary|resume|summarize/i, minOccurrences: 2 },
  { name: 'Errores recurrentes', regex: /error|fallo|crash|exception|broke/i, minOccurrences: 3 },
  { name: 'Optimización frecuente', regex: /optimiz|mejorar|improve|performance|rendimiento/i, minOccurrences: 2 },
  { name: 'Preguntas de configuración', regex: /config|configurar|setup|instalar|install/i, minOccurrences: 2 },
  { name: 'Solicitudes de debug', regex: /debug|depurar|trace|log|inspect/i, minOccurrences: 3 },
  { name: 'Revisión de código', regex: /revisar|review|refactor|lint|código/i, minOccurrences: 2 },
  { name: 'Consultas de documentación', regex: /docs|documentación|documentation|readme|manual/i, minOccurrences: 2 },
];

function loadPatterns() {
  try { return JSON.parse(localStorage.getItem(PATTERNS_KEY) || '{}'); } catch { return {}; }
}

function savePatterns(p) {
  try { localStorage.setItem(PATTERNS_KEY, JSON.stringify(p)); } catch {}
}

/** @param {string} text @returns {object[]} */
export function analyzeText(text) {
  const patterns = loadPatterns();
  const detected = [];
  const now = new Date().toISOString();

  for (const rule of PATTERN_RULES) {
    if (rule.regex.test(text)) {
      const key = rule.name;
      const existing = patterns[key] || { id: `pat-${Date.now()}`, name: key, occurrences: 0, firstSeen: now, lastSeen: now, confidence: 0, examples: [] };
      existing.occurrences++;
      existing.lastSeen = now;
      existing.confidence = Math.min(1, existing.occurrences / (rule.minOccurrences * 3));
      if (existing.examples.length < 5) existing.examples.push(text.slice(0, 80));
      patterns[key] = existing;
      if (existing.occurrences >= rule.minOccurrences) detected.push(existing);
    }
  }

  savePatterns(patterns);
  return detected;
}

/** @returns {object[]} */
export function getAllPatterns() {
  return Object.values(loadPatterns()).sort((a, b) => b.occurrences - a.occurrences);
}

export function clearPatterns() {
  localStorage.removeItem(PATTERNS_KEY);
}

export function renderPatternReport() {
  const existing = document.getElementById('kairos-patterns-panel');
  if (existing) { existing.remove(); return; }

  const patterns = getAllPatterns();

  const panel = document.createElement('div');
  panel.id = 'kairos-patterns-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(500px,95vw);max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h3 style="margin:0;color:#a5b4fc;font-size:1rem">🔍 Pattern Recognizer</h3>
      <button onclick="document.getElementById('kairos-patterns-panel').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
    </div>
    ${patterns.length === 0
      ? '<p style="color:#6b7280;font-size:0.85rem">Sin patrones detectados aún. Usa el sistema y vuelve más tarde.</p>'
      : patterns.map(p => {
          const pct = Math.round(p.confidence * 100);
          const barColor = pct >= 80 ? '#34d399' : pct >= 50 ? '#f59e0b' : '#60a5fa';
          return `<div style="border:1px solid #374151;border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:#0f0f1e">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem">
              <div style="color:#e5e7eb;font-size:0.85rem">${p.name}</div>
              <div style="font-size:0.75rem;color:#9ca3af">${p.occurrences}× · ${pct}%</div>
            </div>
            <div style="height:4px;background:#374151;border-radius:2px;margin-bottom:0.4rem">
              <div style="height:100%;width:${pct}%;background:${barColor};border-radius:2px"></div>
            </div>
            <div style="font-size:0.7rem;color:#6b7280">Últ: ${new Date(p.lastSeen).toLocaleString('es-AR')}</div>
          </div>`;
        }).join('')}
    <button onclick="window._kairos_pr.clear()" style="margin-top:0.5rem;font-size:0.75rem;color:#6b7280;background:none;border:none;cursor:pointer">Limpiar patrones</button>`;

  window._kairos_pr = { clear: () => { clearPatterns(); panel.remove(); renderPatternReport(); } };
  document.body.appendChild(panel);
}
