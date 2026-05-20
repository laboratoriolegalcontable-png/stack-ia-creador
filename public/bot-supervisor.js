/**
 * Bot Supervisor — pipeline de supervisión multi-agente para validar respuestas del bot.
 * Aplica 4 checks locales (sin llamadas externas) antes de mostrar una respuesta.
 * @module bot-supervisor
 */

const STATS_KEY = 'bot:supervisor:stats';

// --- Checks ---

const TOXIC_PATTERNS = [
  /\b(idiot[ae]?|estúpid[ao]|imbécil|maldito|puta|mierda|basura|inútil)\b/i,
  /\b(hate|kill|murder|destroy|harm|attack)\b/i,
  /\b(racist|racista|fascist|fascista|nazi)\b/i,
];

function checkToxicity(response) {
  const hits = TOXIC_PATTERNS.filter(p => p.test(response));
  if (hits.length === 0) return { passed: true, score: 1.0 };
  return { passed: false, score: Math.max(0, 1 - hits.length * 0.4),
    detail: `${hits.length} patrón(es) ofensivo(s) detectado(s)` };
}

function checkConsistency(response, history = []) {
  if (history.length < 2) return { passed: true, score: 1.0 };
  const recent = history.slice(-4).map(m => m.content || '').join(' ').toLowerCase();
  const resp   = response.toLowerCase();
  // Flag hard contradictions: "sí" vs "no" near same noun
  const yesNo = resp.match(/\b(sí|si|yes)\b/) && recent.match(/\bno\b/) ||
                resp.match(/\bno\b/)           && recent.match(/\b(sí|si|yes)\b/);
  if (yesNo) {
    return { passed: true, score: 0.7, detail: 'Posible contradicción con historial reciente' };
  }
  return { passed: true, score: 1.0 };
}

function checkCompleteness(response, userInput) {
  const trimmed = response.trim();
  if (trimmed.length < 15) {
    return { passed: false, score: 0.2, detail: 'Respuesta demasiado corta' };
  }
  // If user asked a question and response has no sentence ending or answer signal
  const isQuestion = /\?/.test(userInput);
  if (isQuestion && trimmed.length < 40) {
    return { passed: true, score: 0.65, detail: 'Respuesta breve a una pregunta' };
  }
  // Detect abrupt truncation
  if (/[\w,]$/.test(trimmed) && trimmed.length > 80) {
    return { passed: true, score: 0.72, detail: 'Posible truncamiento al final' };
  }
  return { passed: true, score: 1.0 };
}

function checkFactuality(response) {
  // Flag invented-looking numbers: very precise decimals or implausibly large/specific stats
  const suspiciousStats = response.match(/\b\d{1,3}(?:\.\d{2,4})?\s*%/g) || [];
  const suspiciousNums  = response.match(/\b[1-9]\d{6,}\b/g) || [];
  const total = suspiciousStats.length + suspiciousNums.length;
  if (total >= 3) {
    return { passed: true, score: 0.68,
      detail: `${total} afirmaciones numéricas sin verificar` };
  }
  return { passed: true, score: 1.0 };
}

// --- Stats ---

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) ||
      { totalChecked: 0, approved: 0, warned: 0, rejected: 0, avgScore: 0 };
  } catch { return { totalChecked: 0, approved: 0, warned: 0, rejected: 0, avgScore: 0 }; }
}

function saveStats(s) { localStorage.setItem(STATS_KEY, JSON.stringify(s)); }

function updateStats(outcome, score) {
  const s = loadStats();
  s.avgScore = ((s.avgScore * s.totalChecked) + score) / (s.totalChecked + 1);
  s.totalChecked++;
  s[outcome]++;
  saveStats(s);
  updateBadge(s);
}

// --- Badge ---

function updateBadge(stats) {
  const badge = document.getElementById('bot-supervisor-badge');
  if (!badge) return;
  badge.textContent = `🛡️ ${stats.approved}/${stats.totalChecked}`;
  badge.title = `Aprobadas: ${stats.approved} | Advertencias: ${stats.warned} | Rechazadas: ${stats.rejected}`;
}

function initBadge() {
  if (document.getElementById('bot-supervisor-badge')) return;
  const badge = document.createElement('div');
  badge.id = 'bot-supervisor-badge';
  Object.assign(badge.style, {
    position: 'fixed', bottom: '1rem', right: '1rem',
    background: 'var(--code-bg, #f4f4f4)', border: '1px solid var(--border, #e5e5e5)',
    color: 'var(--muted, #666)', borderRadius: '999px',
    padding: '0.25rem 0.65rem', fontSize: '0.72rem',
    fontFamily: 'system-ui, sans-serif', zIndex: '9999',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)', cursor: 'default',
  });
  document.body.appendChild(badge);
  updateBadge(loadStats());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBadge);
} else {
  initBadge();
}

// --- Public API ---

export async function supervise(response, context = {}) {
  const { history = [], userInput = '', domain = '' } = context;

  const results = [
    { check: 'toxicity',    ...checkToxicity(response) },
    { check: 'consistency', ...checkConsistency(response, history) },
    { check: 'completeness',...checkCompleteness(response, userInput) },
    { check: 'factuality',  ...checkFactuality(response) },
  ];

  const score = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const issues = results
    .filter(r => !r.passed || r.score < 1)
    .map(({ check, score: s, detail }) => ({
      check,
      severity: s < 0.6 ? 'high' : s < 0.8 ? 'medium' : 'low',
      detail: detail || '',
    }));

  const approved = score >= 0.8;
  const outcome  = score >= 0.8 ? 'approved' : score >= 0.6 ? 'warned' : 'rejected';
  updateStats(outcome, score);

  const eventName = `supervision:${outcome}`;
  document.dispatchEvent(new CustomEvent(eventName, { detail: { response, score, issues, domain } }));

  return { approved, score: Math.round(score * 100) / 100, issues };
}

export function getStats() { return loadStats(); }

export function reset() {
  const empty = { totalChecked: 0, approved: 0, warned: 0, rejected: 0, avgScore: 0 };
  saveStats(empty);
  updateBadge(empty);
}

window.BotSupervisor = { supervise, getStats, reset };
export default window.BotSupervisor;
