/**
 * Feature flags para todos los módulos KAIROS.
 *
 * @typedef {{
 *   KAIROS_ENABLED: boolean,
 *   DREAM_CYCLE_ENABLED: boolean,
 *   FRUSTRATION_DETECTION: boolean,
 *   COORDINATOR_ENABLED: boolean,
 *   BUDDY_ENABLED: boolean,
 *   PROACTIVE_ENABLED: boolean,
 *   BRIDGE_ENABLED: boolean,
 *   ULTRAPLAN_ENABLED: boolean,
 *   TOKEN_BUDGET_ENABLED: boolean,
 * }} Flags
 */

const FLAGS_KEY = 'kairos:flags';

/** @returns {Flags} */
function defaultFlags() {
  return {
    KAIROS_ENABLED:        true,
    DREAM_CYCLE_ENABLED:   true,
    FRUSTRATION_DETECTION: true,
    COORDINATOR_ENABLED:   true,
    BUDDY_ENABLED:         true,
    PROACTIVE_ENABLED:     true,
    BRIDGE_ENABLED:        true,
    ULTRAPLAN_ENABLED:     true,
    TOKEN_BUDGET_ENABLED:  true,
  };
}

/** @returns {Flags} */
export function getFlags() {
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    if (stored) return { ...defaultFlags(), ...JSON.parse(stored) };
  } catch {}
  return defaultFlags();
}

/** @param {Partial<Flags>} overrides */
export function setFlags(overrides) {
  try {
    localStorage.setItem(FLAGS_KEY, JSON.stringify({ ...getFlags(), ...overrides }));
  } catch {}
}
