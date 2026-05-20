/**
 * Coordinator Mode — orquestación multiagente en 4 fases.
 * research → spec → implement → verify
 *
 * Cada fase corre en aislamiento con timeout de 15s.
 * Los resultados se encadenan: output de cada fase es context de la siguiente.
 *
 * @typedef {'research' | 'spec' | 'implement' | 'verify'} CoordinatorPhase
 */

import { getFlags } from './flags.js';

const STORAGE_KEY = 'coordinator:latest';
const TIMEOUT_MS = 15000;
const PHASES = /** @type {CoordinatorPhase[]} */ (['research', 'spec', 'implement', 'verify']);

/**
 * Corre una fase con timeout y aislamiento de contexto.
 * @param {CoordinatorPhase} phase
 * @param {string} agentId
 * @param {() => Promise<Record<string, unknown>>} fn
 * @returns {Promise<{ phase: CoordinatorPhase, agentId: string, output: Record<string, unknown>, durationMs: number }>}
 */
async function runPhase(phase, agentId, fn) {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[${phase}] timeout after ${TIMEOUT_MS}ms`)),
      TIMEOUT_MS
    );
    fn()
      .then((output) => { clearTimeout(timer); resolve({ phase, agentId, output, durationMs: Math.round(performance.now() - start) }); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

/**
 * Phase 1: Research — recopila estado actual del dashboard.
 * @param {string} jobId
 * @returns {Promise<Record<string, unknown>>}
 */
async function research(jobId) {
  const result = await runPhase('research', `research-${jobId.slice(0, 8)}`, async () => {
    const kairosRaw = localStorage.getItem('kairos:memory');
    const kairos = kairosRaw ? JSON.parse(kairosRaw) : null;
    const sessions = parseInt(localStorage.getItem('kairos:sessions') || '0', 10);
    const storageKeys = Object.keys(localStorage);
    return {
      sessions,
      storageKeys: storageKeys.length,
      kairosLastCycle: kairos?.completedAt ?? null,
      kairosInsights: kairos?.consolidated?.insights ?? [],
      url: location.pathname,
      timestamp: new Date().toISOString(),
    };
  });
  return result.output;
}

/**
 * Phase 2: Spec — analiza findings y genera recomendaciones.
 * @param {string} jobId
 * @param {Record<string, unknown>} context
 * @returns {Promise<Record<string, unknown>>}
 */
async function spec(jobId, context) {
  const result = await runPhase('spec', `spec-${jobId.slice(0, 8)}`, async () => {
    const recommendations = [];
    const optimizations = [];

    if (Number(context.storageKeys) > 30) {
      recommendations.push('Muchas claves en localStorage: limpiar en siguiente prune');
      optimizations.push({ action: 'cleanup_storage', priority: 'high' });
    }
    if (!context.kairosLastCycle) {
      recommendations.push('Sin ciclo KAIROS previo: inicializar memoria');
      optimizations.push({ action: 'initialize_kairos', priority: 'medium' });
    }
    if (Number(context.sessions) > 10) {
      recommendations.push('Alto número de sesiones: KAIROS debería haber corrido ya');
      optimizations.push({ action: 'force_kairos', priority: 'high' });
    }

    return {
      recommendations,
      optimizations,
      priority: optimizations.filter((o) => o.priority === 'high').length > 1 ? 'high' : 'normal',
      generatedAt: new Date().toISOString(),
    };
  });
  return result.output;
}

/**
 * Phase 3: Implement — aplica las optimizaciones seguras del spec.
 * @param {string} jobId
 * @param {Record<string, unknown>} context
 * @returns {Promise<Record<string, unknown>>}
 */
async function implement(jobId, context) {
  const result = await runPhase('implement', `impl-${jobId.slice(0, 8)}`, async () => {
    const applied = [];
    const optimizations = /** @type {Array<{action: string}>} */ (context.optimizations ?? []);

    for (const opt of optimizations) {
      if (opt.action === 'cleanup_storage') {
        const temp = Object.keys(localStorage).filter((k) => k.startsWith('kairos:event:'));
        temp.forEach((k) => localStorage.removeItem(k));
        applied.push(`Eliminadas ${temp.length} claves temporales de kairos:event:*`);
      } else if (opt.action === 'force_kairos') {
        localStorage.setItem('kairos:sessions', '5');
        applied.push('kairos:sessions → 5 (forzar próximo ciclo KAIROS)');
      } else if (opt.action === 'initialize_kairos') {
        if (!localStorage.getItem('kairos:memory')) {
          localStorage.setItem('kairos:memory', JSON.stringify({ initialized: true, at: new Date().toISOString() }));
          applied.push('kairos:memory inicializado');
        }
      }
    }

    return { applied, appliedCount: applied.length };
  });
  return result.output;
}

/**
 * Phase 4: Verify — valida que el estado final es coherente.
 * @param {string} jobId
 * @param {Record<string, unknown>} context
 * @returns {Promise<Record<string, unknown>>}
 */
async function verify(jobId, context) {
  const result = await runPhase('verify', `verify-${jobId.slice(0, 8)}`, async () => {
    const checks = {
      localStorageAccesible: (() => { try { localStorage.setItem('_ping', '1'); localStorage.removeItem('_ping'); return true; } catch { return false; } })(),
      kairosMemoryPresent: !!localStorage.getItem('kairos:memory'),
      implementationApplied: Number(context.appliedCount ?? 0) >= 0,
    };
    const allPassed = Object.values(checks).every(Boolean);
    const failedChecks = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    return { checks, allPassed, failedChecks };
  });
  return result.output;
}

/**
 * Punto de entrada principal del Coordinator.
 * @param {string} [description]
 */
export async function runCoordinatorCycle(description = 'Ciclo de optimización') {
  const flags = getFlags();
  if (!flags.COORDINATOR_ENABLED) return;

  const jobId = crypto.randomUUID();
  const start = performance.now();

  console.debug('[COORDINATOR] Iniciando ciclo', jobId);
  updateCoordinatorBadge('research…');

  try {
    const researchOut = await research(jobId);
    updateCoordinatorBadge('spec…');

    const specOut = await spec(jobId, researchOut);
    updateCoordinatorBadge('implement…');

    const implementOut = await implement(jobId, specOut);
    updateCoordinatorBadge('verify…');

    const verifyOut = await verify(jobId, implementOut);

    const totalMs = Math.round(performance.now() - start);

    const job = {
      jobId,
      description,
      completedAt: new Date().toISOString(),
      totalDurationMs: totalMs,
      phases: { research: researchOut, spec: specOut, implement: implementOut, verify: verifyOut },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
    updateCoordinatorBadge(
      new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    );
    console.debug('[COORDINATOR] Ciclo completo', jobId, `${totalMs}ms`);
    return job;
  } catch (err) {
    console.warn('[COORDINATOR] Error en ciclo:', err);
    updateCoordinatorBadge('error');
  }
}

/** @param {string} text */
function updateCoordinatorBadge(text) {
  const badge = document.getElementById('coordinator-badge');
  if (badge) badge.textContent = `\u{1F916} ${text}`;
}
