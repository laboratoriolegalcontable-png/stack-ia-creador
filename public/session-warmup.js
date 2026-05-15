/**
 * Session Warmup — tarjeta de contexto de la sesión anterior
 * Se muestra 2s después de cargar y desaparece a los 8s
 * @module session-warmup
 */
import { getFlags } from './flags.js';

export function buildWarmupBrief() {
  const sessions     = Number(localStorage.getItem('kairos:sessions')) || 0;
  const lastCycle    = localStorage.getItem('kairos:lastCycle');
  const memRaw       = localStorage.getItem('kairos:memory');
  const coordRaw     = localStorage.getItem('coordinator:latest');
  const ultraRaw     = localStorage.getItem('ultraplan:latest');
  const moodRaw      = localStorage.getItem('kairos:mood');
  const proactiveRaw = localStorage.getItem('kairos:proactive');

  const mem      = memRaw   ? JSON.parse(memRaw)   : null;
  const coord    = coordRaw ? JSON.parse(coordRaw) : null;
  const ultra    = ultraRaw ? JSON.parse(ultraRaw) : null;
  const mood     = moodRaw  ? JSON.parse(moodRaw)  : null;
  const proactive = proactiveRaw ? JSON.parse(proactiveRaw) : [];

  return {
    sessions,
    lastCycle,
    memorySnippet: mem?.consolidate?.insights?.[0] || null,
    coordinatorSummary: coord?.summary || null,
    ultraplanGoal: ultra?.goal || null,
    mood: mood ? `${mood.emoji} ${mood.label}` : null,
    proactiveSuggestions: proactive.length,
  };
}

export function showWarmupCard() {
  if (!getFlags().SESSION_WARMUP_ENABLED) return;

  // Solo mostrar si hay contexto previo
  const brief = buildWarmupBrief();
  if (!brief.lastCycle && !brief.ultraplanGoal && !brief.memorySnippet) return;

  const lastCycleAgo = brief.lastCycle
    ? Math.round((Date.now() - new Date(brief.lastCycle).getTime()) / 60000)
    : null;

  const card = document.createElement('div');
  card.id = 'warmup-card';
  card.style.cssText = [
    'position:fixed;bottom:20px;left:20px;width:300px',
    'background:#0f172a;border:1px solid #6366f1;border-radius:12px',
    'padding:14px;font-family:monospace;font-size:12px;color:#e2e8f0',
    'box-shadow:0 8px 32px rgba(0,0,0,0.6);z-index:9995',
    'animation:slideIn 0.3s ease',
  ].join(';');

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="color:#818cf8;font-weight:700">\u{1F9E0} Contexto anterior</span>
      <button onclick="this.closest('#warmup-card').remove()"
        style="background:none;border:none;color:#64748b;cursor:pointer">&times;</button>
    </div>
    ${brief.mood ? `<div style="margin-bottom:6px">${brief.mood}</div>` : ''}
    ${lastCycleAgo !== null ? `<div style="color:#64748b">Último ciclo: hace ${lastCycleAgo}min</div>` : ''}
    ${brief.memorySnippet ? `<div style="color:#94a3b8;margin-top:6px;font-size:11px">${brief.memorySnippet.slice(0, 120)}…</div>` : ''}
    ${brief.ultraplanGoal ? `<div style="margin-top:6px;color:#a5b4fc">⚡ Plan activo: ${brief.ultraplanGoal.slice(0, 60)}</div>` : ''}
    ${brief.proactiveSuggestions > 0 ? `<div style="margin-top:6px;color:#f59e0b">\u{1F4A1} ${brief.proactiveSuggestions} sugerencias proactivas</div>` : ''}
  `;

  document.body.appendChild(card);
  setTimeout(() => card.remove(), 8000);
}
