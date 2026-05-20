const KEY = 'kairos:token_budget';
const MAX_DAILY = 200000;
const WARNING = 0.80;
const CRITICAL = 0.95;

function getState() {
  const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
  const today = new Date().toISOString().slice(0, 10);
  if (raw.date !== today) return { date: today, used: 0 };
  return raw;
}
function saveState(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

export function trackTokens(estimatedTokens) {
  const s = getState();
  s.used += estimatedTokens;
  saveState(s);
  return s;
}

export function renderTokenBudget() {
  let panel = document.getElementById('token-budget-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'token-budget-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>🪙 Token Budget</h2><button class="ia-close" onclick="document.getElementById('token-budget-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <div style="display:flex;gap:6px;margin-bottom:10px">
        <button id="tb-add" class="ia-btn-sm blue">+ Agregar tokens</button>
        <button id="tb-reset" class="ia-btn-sm red">↺ Resetear día</button>
      </div>
      <div id="tb-gauge" style="margin-bottom:10px"></div>
      <div id="tb-stats" class="ia-stats-bar"></div>
      <div id="tb-history" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('tb-add').onclick = () => {
    const t = parseInt(prompt('Tokens a agregar:') || '0');
    if (t > 0) { trackTokens(t); _refresh(); }
  };
  document.getElementById('tb-reset').onclick = () => {
    if (confirm('¿Resetear contador del día?')) { saveState({ date: new Date().toISOString().slice(0, 10), used: 0 }); _refresh(); }
  };
  _refresh();
}

function _refresh() {
  const s = getState();
  const ratio = s.used / MAX_DAILY;
  const pct = Math.min(100, Math.round(ratio * 100));
  const status = ratio >= CRITICAL ? 'critical' : ratio >= WARNING ? 'warning' : 'ok';
  const color = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#22c55e';

  const stats = document.getElementById('tb-stats');
  const gauge = document.getElementById('tb-gauge');
  if (!stats || !gauge) return;

  stats.textContent = 'Usado: ' + s.used.toLocaleString() + ' / ' + MAX_DAILY.toLocaleString() + ' tokens (' + pct + '%) — Estado: ' + status;
  gauge.innerHTML = '<div style="background:var(--color-border);border-radius:4px;height:16px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:' + color + ';transition:width 0.3s"></div></div>';
}
