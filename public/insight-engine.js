/** Insight Engine — KAIROS browser module */
const INSIGHTS_KEY = 'kairos:insights';

function getSessions() {
  return parseInt(localStorage.getItem('kairos:sessions') || '0', 10);
}

function getMemoryCount() {
  return Object.keys(localStorage).filter(k => k.startsWith('kairos:')).length;
}

/** @returns {object[]} */
export function generateInsights() {
  const sessions = getSessions();
  const memCount = getMemoryCount();
  const now = new Date().toISOString();
  const insights = [];

  if (sessions >= 10) insights.push({ id: `ins-${Date.now()}-1`, type: 'achievement', title: `${sessions} sesiones completadas`, body: `Alcanzaste ${sessions} sesiones. KAIROS ha consolidado memoria en múltiples ciclos.`, confidence: 1.0, generatedAt: now, tags: ['milestone'] });
  if (memCount > 10) insights.push({ id: `ins-${Date.now()}-2`, type: 'pattern', title: 'Alta densidad de memoria', body: `${memCount} entradas en localStorage. Considera /compress para optimizar.`, confidence: 0.8, generatedAt: now, tags: ['memory', 'optimization'] });
  if (sessions > 0 && sessions % 5 === 0) insights.push({ id: `ins-${Date.now()}-3`, type: 'suggestion', title: 'Ciclo de revisión recomendado', body: 'Cada 5 sesiones es buen momento para revisar objetivos activos en /goals.', confidence: 0.75, generatedAt: now, tags: ['review', 'goals'] });
  if (sessions === 0) insights.push({ id: `ins-${Date.now()}-4`, type: 'suggestion', title: 'Primera sesión detectada', body: 'Bienvenido. Ejecuta /dream para iniciar el ciclo KAIROS y /goals para definir objetivos.', confidence: 0.9, generatedAt: now, tags: ['onboarding'] });

  try {
    const existing = JSON.parse(localStorage.getItem(INSIGHTS_KEY) || '[]');
    const merged = [...existing, ...insights].slice(-20);
    localStorage.setItem(INSIGHTS_KEY, JSON.stringify(merged));
  } catch {}

  return insights;
}

/** @returns {object[]} */
export function getInsights() {
  try { return JSON.parse(localStorage.getItem(INSIGHTS_KEY) || '[]'); } catch { return []; }
}

export function renderInsightPanel() {
  const existing = document.getElementById('kairos-insight-panel');
  if (existing) { existing.remove(); return; }

  generateInsights();
  const insights = getInsights().slice(-10).reverse();
  const typeIcon = { achievement: '🏆', warning: '⚠️', pattern: '🔍', suggestion: '💡' };
  const typeColor = { achievement: '#fbbf24', warning: '#f87171', pattern: '#60a5fa', suggestion: '#34d399' };

  const panel = document.createElement('div');
  panel.id = 'kairos-insight-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(500px,95vw);max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h3 style="margin:0;color:#a5b4fc;font-size:1rem">💡 Insight Engine</h3>
      <button onclick="document.getElementById('kairos-insight-panel').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
    </div>
    ${insights.length === 0 ? '<p style="color:#6b7280;font-size:0.85rem">Sin insights aún. Acumula más sesiones.</p>' : insights.map(i => `
      <div style="border-left:3px solid ${typeColor[i.type] || '#6b7280'};padding:0.75rem 1rem;margin-bottom:0.75rem;background:#0f0f1e;border-radius:0 8px 8px 0">
        <div style="font-size:0.88rem;color:#e5e7eb;margin-bottom:0.25rem">${typeIcon[i.type] || '•'} <strong>${i.title}</strong></div>
        <div style="font-size:0.8rem;color:#9ca3af;margin-bottom:0.4rem">${i.body}</div>
        <div style="font-size:0.7rem;color:#6b7280">Confianza: ${Math.round(i.confidence * 100)}% · ${new Date(i.generatedAt).toLocaleString('es-AR')}</div>
      </div>`).join('')}
    <button onclick="localStorage.removeItem('${INSIGHTS_KEY}');document.getElementById('kairos-insight-panel').remove()" style="margin-top:0.5rem;font-size:0.75rem;color:#6b7280;background:none;border:none;cursor:pointer">Limpiar historial</button>`;

  document.body.appendChild(panel);
}
