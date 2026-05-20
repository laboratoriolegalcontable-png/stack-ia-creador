/**
 * Mood Ring — emoji en header que refleja el estado del sistema
 * @module mood-ring
 */
import { getFlags } from './flags.js';

const MOOD_KEY = 'kairos:mood';

const THRESHOLDS = [
  { maxScore: 0, mood: 'happy',       emoji: '😄', label: 'Todo en orden' },
  { maxScore: 2, mood: 'neutral',     emoji: '😐', label: 'Normal' },
  { maxScore: 4, mood: 'stressed',    emoji: '😰', label: 'Bajo presión' },
  { maxScore: 99,mood: 'overwhelmed', emoji: '🤯', label: 'Sobrecargado' },
];

export function computeMood() {
  let score = 0;
  const reasons = [];

  const sessions = Number(localStorage.getItem('kairos:sessions')) || 0;
  const costRaw  = localStorage.getItem('kairos:cost:daily');
  const cost     = costRaw ? JSON.parse(costRaw).usd || 0 : 0;
  const lsUsed   = [...Array(localStorage.length)].reduce((acc, _, i) => {
    const k = localStorage.key(i); return acc + k.length + (localStorage.getItem(k) || '').length;
  }, 0);
  const lsPct = lsUsed / (5 * 1024 * 1024);

  if (sessions >= 5)  { score += 1; reasons.push(`${sessions} sesiones`); }
  if (cost > 0.5)     { score += 1; reasons.push(`$${cost.toFixed(3)}`); }
  if (cost > 2)       { score += 2; reasons.push('costo alto'); }
  if (lsPct > 0.8)    { score += 2; reasons.push('storage lleno'); }
  if (lsPct > 0.5)    { score += 1; reasons.push('storage elevado'); }

  const entry = THRESHOLDS.find(t => score <= t.maxScore) || THRESHOLDS.at(-1);
  const state = { mood: entry.mood, emoji: entry.emoji, label: entry.label, score, reasons,
                  ts: new Date().toISOString() };
  localStorage.setItem(MOOD_KEY, JSON.stringify(state));
  return state;
}

export function getMood() {
  const raw = localStorage.getItem(MOOD_KEY);
  return raw ? JSON.parse(raw) : computeMood();
}

export function initMoodRing() {
  if (!getFlags().MOOD_RING_ENABLED) return;

  const badge = document.getElementById('mood-badge');
  if (!badge) return;

  const update = () => {
    const state = computeMood();
    badge.textContent = state.emoji;
    badge.title = `${state.label} (score ${state.score})${state.reasons.length ? ': ' + state.reasons.join(', ') : ''}`;
  };

  update();
  setInterval(update, 60_000);

  badge.style.cursor = 'help';
}
