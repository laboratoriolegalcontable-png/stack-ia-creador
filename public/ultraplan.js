/**
 * ULTRAPLAN — planificador multi-paso browser-side
 * Basado en CoordinatorMode pero orientado a objetivos de usuario
 * @module ultraplan
 */
import { getFlags } from './flags.js';

const ULTRAPLAN_KEY  = 'ultraplan:latest';
const BUDGET_MS      = 15_000;

/**
 * @param {string} title
 * @param {string} desc
 * @param {string[]} dependsOn
 * @param {number} estimatedMs
 * @returns {import('./ultraplan.types.js').PlanStep}
 */
function makeStep(title, desc, dependsOn, estimatedMs) {
  return {
    id: `step-${Math.random().toString(36).slice(2, 6)}`,
    title,
    description: desc,
    dependsOn,
    status: 'pending',
    estimatedMs,
  };
}

/**
 * @param {string} goal
 * @param {{ sessionCount: number, lastCycle: string|null }} ctx
 */
function decompose(goal, ctx) {
  const steps = [
    makeStep(
      'Investigación inicial',
      `Recopilar info sobre: "${goal}". Revisar memoria KAIROS y sesiones previas.`,
      [],
      15_000
    ),
    makeStep(
      'Definición de requisitos',
      'Especificar alcance y criterios de éxito.',
      ['step-0'],
      10_000
    ),
    makeStep(
      'Diseño de solución',
      'Proponer enfoque y evaluar alternativas.',
      ['step-1'],
      20_000
    ),
    makeStep(
      'Implementación',
      'Ejecutar el diseño paso a paso.',
      ['step-2'],
      60_000
    ),
    makeStep(
      'Verificación',
      'Validar que se cumplen los criterios de éxito.',
      ['step-3'],
      15_000
    ),
    makeStep(
      'Consolidación de memoria',
      'Forzar ciclo KAIROS para guardar aprendizajes.',
      ['step-4'],
      60_000
    ),
  ];

  if (ctx.sessionCount > 10) {
    steps.splice(2, 0, makeStep(
      'Revisión histórica',
      'Analizar ciclos anteriores para evitar errores repetidos.',
      ['step-1'],
      10_000
    ));
  }

  return steps;
}

/**
 * @param {string} goal
 * @returns {Promise<import('./ultraplan.types.js').UltraPlan>}
 */
export async function createUltraPlan(goal) {
  if (!getFlags().ULTRAPLAN_ENABLED) throw new Error('ULTRAPLAN_ENABLED=false');

  const sessionCount = Number(localStorage.getItem('kairos:sessions')) || 0;
  const lastCycle    = localStorage.getItem('kairos:lastCycle');
  const ctx          = { sessionCount, lastCycle };

  const steps = decompose(goal, ctx);
  const total  = steps.reduce((a, s) => a + s.estimatedMs, 0);

  const plan = {
    id: Math.random().toString(36).slice(2, 10),
    goal,
    createdAt: new Date().toISOString(),
    steps,
    totalEstimatedMs: total,
    meta: { sessionCount, lastCycle },
  };

  localStorage.setItem(ULTRAPLAN_KEY, JSON.stringify(plan));
  renderUltraPlan(plan);
  return plan;
}

export function getLatestPlan() {
  const raw = localStorage.getItem(ULTRAPLAN_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * @param {string} stepId
 * @param {'pending'|'in_progress'|'done'|'blocked'} status
 */
export function updateStep(stepId, status) {
  const plan = getLatestPlan();
  if (!plan) return;
  const step = plan.steps.find(s => s.id === stepId);
  if (step) step.status = status;
  localStorage.setItem(ULTRAPLAN_KEY, JSON.stringify(plan));
  renderUltraPlan(plan);
}

/** @param {import('./ultraplan.types.js').UltraPlan} plan */
function renderUltraPlan(plan) {
  let panel = document.getElementById('ultraplan-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'ultraplan-panel';
    panel.style.cssText = [
      'position:fixed;bottom:80px;right:16px;width:340px;max-height:70vh;overflow-y:auto',
      'background:#0f172a;border:1px solid #6366f1;border-radius:12px',
      'padding:16px;font-family:monospace;font-size:12px;color:#e2e8f0',
      'box-shadow:0 8px 32px rgba(0,0,0,0.6);z-index:9998',
    ].join(';');
    document.body.appendChild(panel);
  }

  const statusIcon = { pending: '⬜', in_progress: '🔄', done: '✅', blocked: '🚫' };
  const totalSec = Math.round(plan.totalEstimatedMs / 1000);
  const donePct = Math.round(
    (plan.steps.filter(s => s.status === 'done').length / plan.steps.length) * 100
  );

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="color:#818cf8;font-weight:700">⚡ ULTRAPLAN</span>
      <button onclick="document.getElementById('ultraplan-panel').remove()"
        style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px">✕</button>
    </div>
    <div style="color:#f8fafc;margin-bottom:8px;font-size:13px">${plan.goal}</div>
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="color:#94a3b8">Progreso</span>
        <span style="color:#818cf8">${donePct}% · ~${totalSec}s</span>
      </div>
      <div style="background:#1e293b;border-radius:4px;height:6px">
        <div style="background:#6366f1;height:6px;border-radius:4px;width:${donePct}%"></div>
      </div>
    </div>
    ${plan.steps.map(s => `
      <div style="margin-bottom:8px;padding:8px;background:#1e293b;border-radius:6px;
        border-left:3px solid ${s.status === 'done' ? '#22c55e' : s.status === 'blocked' ? '#ef4444' : '#6366f1'}">
        <div>${statusIcon[s.status] || '⬜'} <strong>${s.title}</strong></div>
        <div style="color:#64748b;margin-top:4px">${s.description}</div>
      </div>
    `).join('')}
    <div style="color:#475569;margin-top:8px;text-align:right">ID: ${plan.id}</div>
  `;
}
