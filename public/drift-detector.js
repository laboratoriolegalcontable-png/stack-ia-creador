/**
 * Drift Detector — detecta si los insights de KAIROS cambiaron significativamente
 * @module drift-detector
 */

const DRIFT_KEY = 'kairos:drift:history';
const MAX_DRIFT = 10;

const STOP_WORDS = new Set(['que','de','la','el','en','los','del','con','para','por']);

function extractTopics(insights) {
  const topics = new Set();
  insights.forEach(ins =>
    ins.toLowerCase().split(/[\s,.:;!?]+/)
       .filter(w => w.length > 4 && !STOP_WORDS.has(w))
       .forEach(w => topics.add(w))
  );
  return topics;
}

export function detectDrift(previousInsights, currentInsights) {
  const prev = extractTopics(previousInsights);
  const curr = extractTopics(currentInsights);
  const newTopics     = [...curr].filter(t => !prev.has(t));
  const droppedTopics = [...prev].filter(t => !curr.has(t));
  const total         = Math.max(prev.size + curr.size, 1);
  const driftScore    = parseFloat(((newTopics.length + droppedTopics.length) / total).toFixed(3));

  const report = {
    ts: new Date().toISOString(),
    newTopics: newTopics.slice(0, 8),
    droppedTopics: droppedTopics.slice(0, 8),
    driftScore,
  };

  const history = JSON.parse(localStorage.getItem(DRIFT_KEY) || '[]');
  history.push(report);
  if (history.length > MAX_DRIFT) history.shift();
  localStorage.setItem(DRIFT_KEY, JSON.stringify(history));

  return report;
}

export function getDriftHistory() {
  return JSON.parse(localStorage.getItem(DRIFT_KEY) || '[]').reverse();
}

export function renderDriftReport() {
  const history = getDriftHistory();
  const existing = document.getElementById('drift-panel');
  if (existing) { existing.remove(); return; }
  if (!history.length) return;

  const latest = history[0];
  const color  = latest.driftScore > 0.6 ? '#ef4444' : latest.driftScore > 0.3 ? '#f59e0b' : '#22c55e';

  const panel = document.createElement('div');
  panel.id = 'drift-panel';
  panel.style.cssText = [
    'position:fixed;bottom:80px;left:20px;width:300px',
    'background:#0f172a;border:1px solid #334155;border-radius:10px',
    'padding:14px;font-family:monospace;font-size:12px;color:#e2e8f0',
    'box-shadow:0 4px 16px rgba(0,0,0,0.5);z-index:9992',
  ].join(';');

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:10px">
      <span style="color:#818cf8;font-weight:700">🧲 Drift Detector</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#64748b;cursor:pointer">&times;</button>
    </div>
    <div style="margin-bottom:8px">
      <span>Drift score: </span>
      <strong style="color:${color}">${latest.driftScore}</strong>
    </div>
    ${latest.newTopics.length ? `<div style="color:#22c55e;margin-bottom:4px">+ ${latest.newTopics.join(', ')}</div>` : ''}
    ${latest.droppedTopics.length ? `<div style="color:#94a3b8">− ${latest.droppedTopics.join(', ')}</div>` : ''}
    <div style="color:#475569;margin-top:8px;font-size:11px">${history.length} ciclos en historial</div>
  `;
  document.body.appendChild(panel);
  setTimeout(() => panel.remove(), 12_000);
}
