/**
 * Bot Rules — motor de reglas determinístico para respuestas conocidas.
 * Evita llamar al LLM cuando hay una respuesta predefinida.
 * @module bot-rules
 */

const STORAGE_KEY = 'bot:rules:custom';

const BUILTIN_RULES = [
  { id: 'R001', pattern: /precio|cuanto cuesta|costo/i,            domain: 'pricing',    priority: 1, response: null,                                             action: 'redirect_pricing',  confidence: 0.95 },
  { id: 'R002', pattern: /refund|reembolso|devoluci[oó]n/i,        domain: 'policy',     priority: 1, response: null,                                             action: 'redirect_policy',   confidence: 0.95 },
  { id: 'R003', pattern: /horario|atiend[eo]|disponible/i,         domain: 'hours',      priority: 2, response: 'Atendemos de lunes a viernes 9-18h (GMT-3).',    action: 'direct_answer',     confidence: 1.0  },
  { id: 'R004', pattern: /contacto|tel[eé]fono|email|correo/i,     domain: 'contact',    priority: 2, response: null,                                             action: 'redirect_contact',  confidence: 0.9  },
  { id: 'R005', pattern: /factura|comprobante|recibo/i,            domain: 'billing',    priority: 1, response: null,                                             action: 'redirect_billing',  confidence: 0.95 },
  { id: 'R006', pattern: /urgente|emergencia|cr[ií]tico/i,         domain: 'escalation', priority: 0, response: null,                                             action: 'escalate_human',    confidence: 0.99 },
  { id: 'R007', pattern: /contraseña|password|clave|acceso/i,      domain: 'security',   priority: 0, response: null,                                             action: 'security_protocol', confidence: 1.0  },
  { id: 'R008', pattern: /gracias|thanks|perfecto|excelente/i,     domain: 'gratitude',  priority: 3, response: '¡Con gusto! ¿Hay algo más en que pueda ayudarte?', action: 'direct_answer',   confidence: 0.85 },
];

function loadCustomRules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map(r => ({
      ...r,
      pattern: new RegExp(r._patternSource, r._patternFlags),
    }));
  } catch {
    return [];
  }
}

function saveCustomRules(rules) {
  const serializable = rules.map(r => ({
    ...r,
    pattern: undefined,
    _patternSource: r.pattern.source,
    _patternFlags: r.pattern.flags,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

let customRules = loadCustomRules();

function getAllRules() {
  return [...BUILTIN_RULES, ...customRules].sort((a, b) => a.priority - b.priority);
}

export function evaluate(input) {
  const rules = getAllRules();
  for (const rule of rules) {
    if (rule.pattern.test(input)) {
      document.dispatchEvent(new CustomEvent('rule:matched', { detail: { rule, input } }));
      return { matched: true, rule, confidence: rule.confidence };
    }
  }
  return { matched: false };
}

export function addRule(rule) {
  if (!rule.id || !rule.pattern || !rule.action) throw new Error('Rule must have id, pattern, action');
  customRules.push(rule);
  saveCustomRules(customRules);
}

export function removeRule(id) {
  const before = customRules.length;
  customRules = customRules.filter(r => r.id !== id);
  if (customRules.length !== before) { saveCustomRules(customRules); return true; }
  return false;
}

export function getByDomain(domain) {
  return getAllRules().filter(r => r.domain === domain);
}

export function exportRules() {
  return JSON.stringify(getAllRules().map(r => ({
    ...r,
    pattern: undefined,
    _patternSource: r.pattern.source,
    _patternFlags: r.pattern.flags,
  })), null, 2);
}

export function importRules(json) {
  const rules = JSON.parse(json);
  let count = 0;
  for (const r of rules) {
    if (!r.id || !r._patternSource) continue;
    r.pattern = new RegExp(r._patternSource, r._patternFlags || 'i');
    delete r._patternSource; delete r._patternFlags;
    if (!customRules.find(c => c.id === r.id)) { customRules.push(r); count++; }
  }
  saveCustomRules(customRules);
  return count;
}

window.BotRules = { evaluate, addRule, removeRule, getByDomain, exportRules, importRules };
export default window.BotRules;
