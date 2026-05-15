/** Focus Timer (Pomodoro) — KAIROS browser module */
const SESSIONS_KEY = 'kairos:focus:sessions';
const STATE_KEY = 'kairos:focus:state';

const DEFAULT_CONFIG = { focusMs: 25 * 60 * 1000, shortBreakMs: 5 * 60 * 1000, longBreakMs: 15 * 60 * 1000, sessionsBeforeLongBreak: 4 };

function loadSessions() { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch { return []; } }
function saveSessions(s) { try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s.slice(-200))); } catch {} }

/** @returns {{ sessionId: string, type: string, endsAt: number }} */
export function startTimer(type = 'focus', goalId = null) {
  const durMap = { focus: DEFAULT_CONFIG.focusMs, 'short-break': DEFAULT_CONFIG.shortBreakMs, 'long-break': DEFAULT_CONFIG.longBreakMs };
  const session = { id: `focus-${Date.now()}`, type, durationMs: durMap[type] || DEFAULT_CONFIG.focusMs, startedAt: new Date().toISOString(), completedAt: null, completed: false, goalId };
  const sessions = loadSessions();
  sessions.push(session);
  saveSessions(sessions);
  localStorage.setItem(STATE_KEY, JSON.stringify({ active: true, sessionId: session.id, type, endsAt: Date.now() + session.durationMs }));
  return { sessionId: session.id, type, endsAt: Date.now() + session.durationMs };
}

export function completeTimer(sessionId) {
  const sessions = loadSessions();
  const s = sessions.find(x => x.id === sessionId);
  if (s) { s.completed = true; s.completedAt = new Date().toISOString(); saveSessions(sessions); }
  localStorage.removeItem(STATE_KEY);
}

export function getTimerState() { try { return JSON.parse(localStorage.getItem(STATE_KEY) || 'null'); } catch { return null; } }

export function getFocusStats() {
  const sessions = loadSessions();
  const today = new Date().toISOString().slice(0, 10);
  const focus = sessions.filter(s => s.type === 'focus');
  return {
    total: sessions.length,
    completed: sessions.filter(s => s.completed).length,
    todayFocus: focus.filter(s => s.completed && s.startedAt.startsWith(today)).length,
    totalFocusMin: Math.round(focus.filter(s => s.completed).reduce((sum, s) => sum + s.durationMs, 0) / 60000),
  };
}

export function renderFocusTimer() {
  const existing = document.getElementById('kairos-focus-panel');
  if (existing) { existing.remove(); return; }

  const stats = getFocusStats();
  const state = getTimerState();
  const panel = document.createElement('div');
  panel.id = 'kairos-focus-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:16px;padding:2rem;z-index:9999;width:min(360px,95vw);text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  let timerInterval = null;

  function render() {
    const currentState = getTimerState();
    const remaining = currentState ? Math.max(0, currentState.endsAt - Date.now()) : 0;
    const mins = Math.floor(remaining / 60000).toString().padStart(2, '0');
    const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    const typeLabel = { focus: '🎯 Foco', 'short-break': '☕ Pausa corta', 'long-break': '🌿 Pausa larga' };

    panel.innerHTML = `
      <button onclick="document.getElementById('kairos-focus-panel').remove()" style="position:absolute;top:0.75rem;right:0.75rem;background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
      <div style="font-size:0.85rem;color:#9ca3af;margin-bottom:0.75rem">${currentState ? (typeLabel[currentState.type] || currentState.type) : '⏱️ Focus Timer'}</div>
      <div style="font-size:3.5rem;font-weight:700;color:#a5b4fc;letter-spacing:0.05em;margin-bottom:1.5rem">${currentState ? `${mins}:${secs}` : '25:00'}</div>
      <div style="display:flex;gap:0.75rem;justify-content:center;margin-bottom:1.5rem">
        ${!currentState ? `
          <button id="ft-focus" style="padding:0.6rem 1.2rem;background:#4338ca;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">🎯 Foco</button>
          <button id="ft-short" style="padding:0.6rem 1rem;background:#1e3a5f;color:#60a5fa;border:1px solid #1d4ed8;border-radius:8px;cursor:pointer">Pausa 5'</button>
          <button id="ft-long" style="padding:0.6rem 1rem;background:#1e3a5f;color:#60a5fa;border:1px solid #1d4ed8;border-radius:8px;cursor:pointer">Pausa 15'</button>
        ` : `<button id="ft-complete" style="padding:0.6rem 1.5rem;background:#065f46;color:#34d399;border:none;border-radius:8px;cursor:pointer;font-weight:600">✓ Completar</button>`}
      </div>
      <div style="font-size:0.78rem;color:#6b7280">${stats.todayFocus} sesiones hoy · ${stats.totalFocusMin} min totales</div>`;

    panel.querySelector('#ft-focus')?.addEventListener('click', () => { startTimer('focus'); if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(render, 1000); render(); });
    panel.querySelector('#ft-short')?.addEventListener('click', () => { startTimer('short-break'); if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(render, 1000); render(); });
    panel.querySelector('#ft-long')?.addEventListener('click', () => { startTimer('long-break'); if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(render, 1000); render(); });
    panel.querySelector('#ft-complete')?.addEventListener('click', () => { if (currentState) completeTimer(currentState.sessionId); if (timerInterval) clearInterval(timerInterval); render(); });

    if (currentState && remaining === 0) {
      completeTimer(currentState.sessionId);
      if (timerInterval) clearInterval(timerInterval);
    }
  }

  render();
  if (state) timerInterval = setInterval(render, 1000);
  document.body.appendChild(panel);
}
