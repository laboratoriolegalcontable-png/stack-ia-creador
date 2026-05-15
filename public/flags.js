/**
 * Sistema de feature flags para KAIROS.
 * Los flags se leen/escriben en localStorage.
 *
 * @typedef {{ KAIROS_ENABLED: boolean, DREAM_CYCLE_ENABLED: boolean, FRUSTRATION_DETECTION: boolean }} Flags
 */

const FLAGS_KEY = 'kairos:flags';

/** @returns {Flags} */
function defaultFlags() {
  return { KAIROS_ENABLED: true, DREAM_CYCLE_ENABLED: true, FRUSTRATION_DETECTION: true };
}

/** @returns {Flags} */
export function getFlags() {
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    if (stored) return { ...defaultFlags(), ...JSON.parse(stored) };
  } catch (_) {}
  return defaultFlags();
}

/** @param {Partial<Flags>} overrides */
export function setFlags(overrides) {
  try {
    localStorage.setItem(FLAGS_KEY, JSON.stringify({ ...getFlags(), ...overrides }));
  } catch (_) {}
}
