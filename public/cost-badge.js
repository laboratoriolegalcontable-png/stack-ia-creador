/**
 * Cost Badge — muestra costo estimado diario de la sesión en el header
 * Basado en modelo de precios de Anthropic (mayo 2026)
 * @module cost-badge
 */
import { getFlags } from './flags.js';

// Precios USD por 1M tokens
const PRICING = {
  'claude-opus-4':   { input: 15.00, output: 75.00 },
  'claude-sonnet-4': { input:  3.00, output: 15.00 },
  'claude-haiku-4':  { input:  0.80, output:  4.00 },
};

const COST_KEY  = 'kairos:cost:daily';
const MODEL_KEY = 'kairos:model';

export function getSelectedModel() {
  return localStorage.getItem(MODEL_KEY) || 'claude-sonnet-4';
}

export function setSelectedModel(model) {
  localStorage.setItem(MODEL_KEY, model);
}

export function trackLocalCost(inputTokens, outputTokens) {
  const model   = getSelectedModel();
  const pricing = PRICING[model] || PRICING['claude-sonnet-4'];
  const cost    = (inputTokens / 1_000_000) * pricing.input
                + (outputTokens / 1_000_000) * pricing.output;

  const today   = new Date().toISOString().slice(0, 10);
  const stored  = JSON.parse(localStorage.getItem(COST_KEY) || '{"date":"","usd":0}');
  const usd     = stored.date === today ? stored.usd + cost : cost;
  localStorage.setItem(COST_KEY, JSON.stringify({ date: today, usd }));
  updateCostBadge(usd);
}

export function getTodayCost() {
  const today   = new Date().toISOString().slice(0, 10);
  const stored  = JSON.parse(localStorage.getItem(COST_KEY) || '{"date":"","usd":0}');
  return stored.date === today ? stored.usd : 0;
}

function updateCostBadge(usd) {
  const badge = document.getElementById('cost-badge');
  if (!badge) return;
  badge.textContent = `\u{1F4B0} $${usd.toFixed(4)}`;
  badge.title       = `Costo estimado hoy: USD $${usd.toFixed(6)}`;
  badge.style.color = usd > 1 ? '#ef4444' : usd > 0.1 ? '#f59e0b' : '#22c55e';
}

export function initCostBadge() {
  if (!getFlags().COST_BADGE_ENABLED) return;
  const usd = getTodayCost();
  updateCostBadge(usd);
}
