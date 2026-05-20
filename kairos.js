/**
 * KAIROS — Ciclo de consolidación de memoria en 4 fases.
 * Orient → Gather → Consolidate → Prune
 *
 * Persiste en localStorage. Se activa después de 5 sesiones o 24 horas.
 *
 * @typedef {'orient' | 'gather' | 'consolidate' | 'prune'} DreamPhase
 */

import { getFlags } from './flags.js';

const KEYS = {
  sessions: 'kairos:sessions',
  lastCycle: 'kairos:lastCycle',
  memory: 'kairos:memory',
};

const CONFIG = {
  blockingBudgetMs: 15000,
  maxOutputSize: 25600,
  triggerAfterSessions: 5,
  triggerAfterHours: 24,
};

/** @returns {boolean} */
function shouldRun() {
  const flags = getFlags();
  if (!flags.KAIROS_ENABLED || !flags.DREAM_CYCLE_ENABLED) return false;

  const sessions = parseInt(localStorage.getItem(KEYS.sessions) || '0', 10);
  if (sessions >= CONFIG.triggerAfterSessions) return true;

  const last = localStorage.getItem(KEYS.lastCycle);
  if (!last) return true;

  const hoursSince = (Date.now() - new Date(last).getTime()) / 3_600_000;
  return hoursSince >= CONFIG.triggerAfterHours;
}

export function incrementSession() {
  const n = parseInt(localStorage.getItem(KEYS.sessions) || '0', 10) + 1;
  localStorage.setItem(KEYS.sessions, String(n));
}

/**
 * Corre una fase con presupuesto de tiempo.
 * @param {DreamPhase} phase
 * @param {() => Promise<Record<string, unknown>>} fn
 * @returns {Promise<{ phase: DreamPhase, durationMs: number, data: Record<string, unknown> }>}
 */
async function runPhase(phase, fn) {
  const start = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.blockingBudgetMs);
  try {
    const data = await fn();
    return { phase, durationMs: Math.round(performance.now() - start), data };
  } finally {
    clearTimeout(timeout);
  }
}

async function orient() {
  return runPhase('orient', async () => ({
    sessions: parseInt(localStorage.getItem(KEYS.sessions) || '0', 10),
    lastCycle: localStorage.getItem(KEYS.lastCycle),
    userAgent: navigator.userAgent.slice(0, 80),
    timestamp: new Date().toISOString(),
    url: location.pathname,
  }));
}

async function gather() {
  return runPhase('gather', async () => {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith('kairos:') || k.startsWith('stack:')
    );
    return { storedKeys: keys.length, sizeEstimate: keys.length * 64 };
  });
}

/**
 * @param {Record<string, unknown>} orientData
 * @param {Record<string, unknown>} gatherData
 */
async function consolidate(orientData, gatherData) {
  return runPhase('consolidate', async () => {
    const insights = [];
    if (Number(orientData.sessions) > 10) insights.push('Uso frecuente detectado');
    if (Number(gatherData.storedKeys) > 20) insights.push('Muchas claves en localStorage: considerar limpiar');
    if (!orientData.lastCycle) insights.push('Primera sesión de KAIROS registrada');

    const consolidated = {
      generatedAt: new Date().toISOString(),
      context: orientData,
      storage: gatherData,
      insights,
    };

    let json = JSON.stringify(consolidated);
    if (json.length > CONFIG.maxOutputSize) {
      consolidated.insights = insights.slice(0, 2);
      json = JSON.stringify(consolidated);
    }

    return consolidated;
  });
}

async function prune() {
  return runPhase('prune', async () => {
    const tempKeys = Object.keys(localStorage).filter((k) => k.startsWith('kairos:event:'));
    tempKeys.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(KEYS.sessions, '0');
    localStorage.setItem(KEYS.lastCycle, new Date().toISOString());
    return { pruned: tempKeys.length };
  });
}

export async function runDreamCycle() {
  if (!shouldRun()) return;

  console.debug('[KAIROS] Iniciando ciclo de sueño…');
  updateBadge('procesando…');

  try {
    const o = await orient();
    const g = await gather();
    const c = await consolidate(o.data, g.data);
    const p = await prune();

    const memory = {
      cycleId: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      phases: [o, g, c, p].map((ph) => ({ phase: ph.phase, durationMs: ph.durationMs })),
      consolidated: c.data,
    };

    let json = JSON.stringify(memory);
    if (json.length > CONFIG.maxOutputSize) {
      memory.consolidated = {};
      json = JSON.stringify(memory);
    }

    localStorage.setItem(KEYS.memory, json);
    updateBadge(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    console.debug('[KAIROS] Ciclo completo', memory.cycleId);
  } catch (err) {
    console.warn('[KAIROS] Error en ciclo:', err);
    updateBadge('error');
  }
}

/** @param {string} text */
function updateBadge(text) {
  const badge = document.getElementById('kairos-badge');
  if (badge) badge.textContent = `\u{1F4AD} ${text}`;
}
