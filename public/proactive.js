/**
 * PROACTIVE mode — Sugerencias activas basadas en el estado de KAIROS y Coordinator.
 * Basado en el flag PROACTIVE del source map de Claude Code.
 */

import { getFlags } from './flags.js';

const PROACTIVE_KEY = 'proactive:suggestions';

/**
 * Genera sugerencias locales basadas en el estado de localStorage.
 * @returns {Array<{type: string, message: string, priority: string}>}
 */
export function evaluateProactive() {
  const flags = getFlags();
  if (!flags.PROACTIVE_ENABLED) return [];

  const suggestions = [];

  const sessions = parseInt(localStorage.getItem('kairos:sessions') || '0', 10);
  const lastCycle = localStorage.getItem('kairos:lastCycle');
  const kairosMemory = localStorage.getItem('kairos:memory');
  const coordLatest = localStorage.getItem('coordinator:latest');

  if (sessions >= 4) {
    suggestions.push({
      type: 'insight',
      message: `${sessions} sesiones acumuladas — KAIROS correrá pronto`,
      priority: sessions >= 5 ? 'high' : 'normal',
    });
  }

  if (!lastCycle && !kairosMemory) {
    suggestions.push({
      type: 'insight',
      message: 'Primera visita — KAIROS tomará nota de esta sesión',
      priority: 'low',
    });
  }

  if (coordLatest) {
    try {
      const job = JSON.parse(coordLatest);
      const hoursSince = (Date.now() - new Date(job.completedAt).getTime()) / 3_600_000;
      if (hoursSince > 168) {
        suggestions.push({
          type: 'insight',
          message: `Coordinator sin correr hace ${Math.round(hoursSince / 24)} días`,
          priority: 'normal',
        });
      }
    } catch {}
  }

  try { localStorage.setItem(PROACTIVE_KEY, JSON.stringify(suggestions)); } catch {}
  return suggestions;
}

/**
 * Renderiza el panel de sugerencias proactivas en el header.
 * Se oculta automáticamente si no hay sugerencias.
 */
export function renderProactiveBanner() {
  const flags = getFlags();
  if (!flags.PROACTIVE_ENABLED) return;

  const suggestions = evaluateProactive();
  if (!suggestions.length) return;

  const high = suggestions.filter((s) => s.priority === 'high');
  const shown = high.length ? high[0] : suggestions[0];

  let banner = document.getElementById('proactive-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'proactive-banner';
    banner.style.cssText = [
      'background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08))',
      'border:1px solid rgba(99,102,241,.3);border-radius:8px',
      'padding:.5rem .9rem;margin:.5rem 0;font-size:.75rem',
      'color:#c4b5fd;display:flex;align-items:center;gap:.6rem;justify-content:space-between',
    ].join(';');
    document.querySelector('header')?.appendChild(banner);
  }

  const icon = shown.priority === 'high' ? '⚠️' : shown.type === 'insight' ? '💡' : 'ℹ️';
  banner.innerHTML = `
    <span>${icon} ${shown.message}</span>
    <button onclick="document.getElementById('proactive-banner').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:.9rem">&#x2715;</button>
  `;
}
