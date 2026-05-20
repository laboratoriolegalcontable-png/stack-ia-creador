/**
 * Stats Panel — /stats slash command
 * Muestra métricas completas de KAIROS, Coordinator, Buddy, Bridge y Token Budget
 * @module stats
 */
import { getBudgetStats } from './token-budget.js';

export function getStats() {
  const sessions   = Number(localStorage.getItem('kairos:sessions')) || 0;
  const lastCycle  = localStorage.getItem('kairos:lastCycle');
  const hasMemory  = !!localStorage.getItem('kairos:memory');
  const coordLast  = localStorage.getItem('coordinator:latest');
  const buddyState = localStorage.getItem('buddy:state');
  const buddy      = buddyState ? JSON.parse(buddyState) : null;
  const flags      = localStorage.getItem('kairos:flags');
  const flagsParsed = flags ? JSON.parse(flags) : {};
  const budget     = getBudgetStats();
  const ultraplan  = localStorage.getItem('ultraplan:latest');
  const plan       = ultraplan ? JSON.parse(ultraplan) : null;

  const lastCycleAgo = lastCycle
    ? Math.round((Date.now() - new Date(lastCycle).getTime()) / 60000)
    : null;

  return {
    kairos: {
      sessions,
      lastCycle,
      lastCycleAgoMin: lastCycleAgo,
      hasMemory,
      triggerAt: 5,
      readyToRun: sessions >= 5,
    },
    coordinator: {
      hasLatest: !!coordLast,
      lastRun: coordLast ? JSON.parse(coordLast)?.completedAt : null,
    },
    buddy: buddy
      ? { name: buddy.name, species: buddy.species, rarity: buddy.rarity, mood: buddy.mood }
      : null,
    ultraplan: plan
      ? {
          id: plan.id,
          goal: plan.goal,
          steps: plan.steps.length,
          done: plan.steps.filter(s => s.status === 'done').length,
        }
      : null,
    tokenBudget: budget,
    flags: flagsParsed,
    localStorage: {
      keys: localStorage.length,
      usedBytes: budget.used,
      pct: Math.round(budget.ratio * 100),
    },
  };
}

export function renderStats() {
  const s = getStats();

  const existing = document.getElementById('stats-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'stats-panel';
  panel.style.cssText = [
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)',
    'width:420px;max-height:80vh;overflow-y:auto',
    'background:#0f172a;border:1px solid #334155;border-radius:12px',
    'padding:20px;font-family:monospace;font-size:12px;color:#e2e8f0',
    'box-shadow:0 16px 64px rgba(0,0,0,0.7);z-index:10001',
  ].join(';');

  const row = (label, value, color = '#94a3b8') =>
    `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #1e293b">
      <span style="color:${color}">${label}</span><span>${value}</span>
    </div>`;

  const budgetColor = s.tokenBudget.status === 'critical' ? '#ef4444'
    : s.tokenBudget.status === 'warning' ? '#f59e0b' : '#22c55e';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="color:#818cf8;font-size:15px;font-weight:700">📊 /stats</span>
      <button onclick="this.closest('#stats-panel').remove()"
        style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px">✕</button>
    </div>

    <div style="color:#6366f1;font-weight:700;margin-bottom:6px">KAIROS</div>
    ${row('Sesiones acumuladas', s.kairos.sessions)}
    ${row('Listo para ciclo', s.kairos.readyToRun ? '✅ sí' : `⬜ ${s.kairos.sessions}/5`)}
    ${row('Último ciclo', s.kairos.lastCycleAgoMin !== null ? `hace ${s.kairos.lastCycleAgoMin}min` : 'nunca')}
    ${row('Memoria guardada', s.kairos.hasMemory ? '✅' : '—')}

    <div style="color:#6366f1;font-weight:700;margin:10px 0 6px">COORDINATOR</div>
    ${row('Último ciclo', s.coordinator.lastRun ? new Date(s.coordinator.lastRun).toLocaleString() : '—')}

    ${s.buddy ? `
    <div style="color:#6366f1;font-weight:700;margin:10px 0 6px">BUDDY</div>
    ${row('Nombre', s.buddy.name)}
    ${row('Especie', s.buddy.species)}
    ${row('Rareza', s.buddy.rarity)}
    ${row('Humor', s.buddy.mood)}
    ` : ''}

    ${s.ultraplan ? `
    <div style="color:#6366f1;font-weight:700;margin:10px 0 6px">ULTRAPLAN</div>
    ${row('Objetivo', s.ultraplan.goal.slice(0, 40) + (s.ultraplan.goal.length > 40 ? '…' : ''))}
    ${row('Pasos', `${s.ultraplan.done}/${s.ultraplan.steps} completados`)}
    ` : ''}

    <div style="color:#6366f1;font-weight:700;margin:10px 0 6px">CONTEXTO</div>
    ${row('localStorage', `${s.localStorage.keys} claves · ${Math.round(s.localStorage.usedBytes / 1024)}KB`)}
    ${row('Token budget', `${s.localStorage.pct}%`, budgetColor)}
    ${row('Estado budget', s.tokenBudget.status, budgetColor)}

    <div style="color:#475569;margin-top:12px;text-align:right">
      ${new Date().toLocaleTimeString()}
    </div>
  `;

  document.body.appendChild(panel);

  setTimeout(() => panel.remove(), 30_000);
}
