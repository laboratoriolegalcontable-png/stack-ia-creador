/**
 * Feature flags para todos los módulos KAIROS.
 * @module flags
 */

const FLAGS_KEY = 'kairos:flags';

function defaultFlags() {
  return {
    KAIROS_ENABLED:            true,
    DREAM_CYCLE_ENABLED:       true,
    FRUSTRATION_DETECTION:     true,
    COORDINATOR_ENABLED:       true,
    BUDDY_ENABLED:             true,
    PROACTIVE_ENABLED:         true,
    BRIDGE_ENABLED:            true,
    ULTRAPLAN_ENABLED:         true,
    TOKEN_BUDGET_ENABLED:      true,
    NOTIFICATIONS_ENABLED:     true,
    COST_BADGE_ENABLED:        true,
    EXPORT_ENABLED:            true,
    TIMELINE_ENABLED:          true,
    MOOD_RING_ENABLED:         true,
    SESSION_WARMUP_ENABLED:    true,
    ANOMALY_DETECTION_ENABLED: true,
    HOTKEYS_ENABLED:           true,
    CONTEXT_COMPRESSOR_ENABLED:true,
    AUTO_TAGGER_ENABLED:       true,
    LEADERBOARD_ENABLED:       true,
    DRIFT_DETECTOR_ENABLED:    true,
    OFFLINE_INDICATOR_ENABLED: true,
    SMART_SEARCH_ENABLED:      true,
  };
}

export function getFlags() {
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    if (stored) return { ...defaultFlags(), ...JSON.parse(stored) };
  } catch {}
  return defaultFlags();
}

export function setFlags(overrides) {
  try {
    localStorage.setItem(FLAGS_KEY, JSON.stringify({ ...getFlags(), ...overrides }));
  } catch {}
}
