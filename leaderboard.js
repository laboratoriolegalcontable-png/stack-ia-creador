/**
 * Leaderboard — ranking de features más usadas en esta sesión
 * @module leaderboard
 */

const LB_KEY = 'kairos:leaderboard';

export function trackUsage(feature) {
  const lb = JSON.parse(localStorage.getItem(LB_KEY) || '{}');
  lb[feature] = (lb[feature] || 0) + 1;
  localStorage.setItem(LB_KEY, JSON.stringify(lb));
}

export function getLeaderboard() {
  const lb = JSON.parse(localStorage.getItem(LB_KEY) || '{}');
  return Object.entries(lb)
    .sort(([,a],[,b]) => b - a)
    .map(([feature, uses]) => ({ feature, uses }));
}

export function renderLeaderboard() {
  const existing = document.getElementById('leaderboard-panel');
  if (existing) { existing.remove(); return; }

  const lb   = getLeaderboard();
  const panel = document.createElement('div');
  panel.id = 'leaderboard-panel';
  panel.style.cssText = [
    'position:fixed;top:50%;right:20px;transform:translateY(-50%)',
    'width:240px;background:#0f172a;border:1px solid #334155;border-radius:12px',
    'padding:16px;font-family:monospace;font-size:12px;color:#e2e8f0',
    'box-shadow:0 8px 32px rgba(0,0,0,0.6);z-index:9993',
  ].join(';');

  const medals = ['🥇','🥈','🥉'];
  const rows = lb.slice(0, 10).map(({ feature, uses }, i) => `
    <div style="display:flex;justify-content:space-between;padding:4px 0;
      border-bottom:1px solid #1e293b">
      <span>${medals[i] || (i+1 + '.')} ${feature}</span>
      <span style="color:#818cf8">${uses}</span>
    </div>`).join('');

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:12px">
      <span style="color:#818cf8;font-weight:700">🏆 Leaderboard</span>
      <button onclick="this.closest('#leaderboard-panel').remove()"
        style="background:none;border:none;color:#64748b;cursor:pointer">&times;</button>
    </div>
    ${rows || '<div style="color:#475569">Sin datos aún</div>'}
    <div style="color:#475569;margin-top:8px;font-size:11px;text-align:right">esta sesión</div>
  `;
  document.body.appendChild(panel);
  setTimeout(() => panel.remove(), 15_000);
}
