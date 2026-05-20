/**
 * bot-monitor.js
 * Real-time bot monitoring dashboard — Estudio Oro
 * Vanilla ES module, no external dependencies.
 */

// ─── Bot configuration ───────────────────────────────────────────────────────

const BOT_CONFIGS = {
  lucrecia: {
    name: 'Lucrecia',
    role: 'Coordinadora General',
    color: '#e91e8c',
    thresholds: {
      errorRate: 0.01,
      memoryPrecision: 0.995,
      driftScore: 0.005,
      contractCompliance: 0.999,
    },
  },
  oraculo: {
    name: 'Oráculo',
    role: 'Orquestador Central',
    color: '#9c27b0',
    thresholds: {
      errorRate: 0.005,
      memoryPrecision: 0.998,
      driftScore: 0.002,
      contractCompliance: 0.9999,
    },
  },
  valentina: {
    name: 'Valentina',
    role: 'Especialista ReclamaIA',
    color: '#2196f3',
    thresholds: {
      errorRate: 0.01,
      memoryPrecision: 0.99,
      driftScore: 0.01,
      contractCompliance: 0.999,
    },
  },
  megan: {
    name: 'Megan',
    role: 'Experta Inmobiliaria',
    color: '#ff9800',
    thresholds: {
      errorRate: 0.02,
      memoryPrecision: 0.985,
      driftScore: 0.015,
      contractCompliance: 0.995,
    },
  },
};

// Base demo values per bot (slight offsets for variety)
const DEMO_BASE = {
  lucrecia:  { errorRate: 0.003,  memoryPrecision: 0.997,  driftScore: 0.003,  contractCompliance: 0.9994 },
  oraculo:   { errorRate: 0.002,  memoryPrecision: 0.9985, driftScore: 0.0015, contractCompliance: 0.9997 },
  valentina: { errorRate: 0.005,  memoryPrecision: 0.993,  driftScore: 0.006,  contractCompliance: 0.9988 },
  megan:     { errorRate: 0.008,  memoryPrecision: 0.990,  driftScore: 0.009,  contractCompliance: 0.9970 },
};

const REFRESH_INTERVAL = 30; // seconds
const HISTORY_LIMIT    = 20; // sparkline data points kept per bot

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Clamp a number between min and max. */
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/** Format a ratio as a percentage string. */
function fmtPct(val, decimals = 2) {
  return (val * 100).toFixed(decimals) + '%';
}

/** Return a small random delta centred on zero. */
function jitter(magnitude = 0.001) {
  return (Math.random() - 0.5) * 2 * magnitude;
}

/** Format a Date as HH:MM:SS */
function fmtTime(date) {
  return date.toLocaleTimeString('es-AR', { hour12: false });
}

// ─── Metrics I/O ─────────────────────────────────────────────────────────────

/**
 * Load metrics for a bot from localStorage.
 * Falls back to synthetic demo data when no entry is found.
 * @param {string} botId
 * @returns {{ current: object, history: number[] }}
 */
function loadMetrics(botId) {
  let raw = null;
  try {
    raw = localStorage.getItem('bot_metrics_' + botId);
  } catch (_) {
    // localStorage may be unavailable (private mode, blocked by browser, etc.)
  }
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      // corrupted — fall through to demo
    }
  }

  // Generate initial demo snapshot
  const base    = DEMO_BASE[botId] || DEMO_BASE.lucrecia;
  const current = generateDemoSnapshot(base);
  return { current, history: [] };
}

/**
 * Persist updated metrics (current + updated history) to localStorage.
 * @param {string} botId
 * @param {object} current  - current metric values
 * @param {number[]} history - array of recent health scores
 */
function saveMetrics(botId, current, history) {
  const payload = { current, history };
  try {
    localStorage.setItem('bot_metrics_' + botId, JSON.stringify(payload));
  } catch (_) {
    // Quota exceeded or private mode — fail silently
  }
}

/**
 * Generate a synthetic metrics snapshot with slight random variation.
 * @param {object} base
 * @returns {object}
 */
function generateDemoSnapshot(base) {
  return {
    errorRate:           clamp(base.errorRate          + jitter(0.002), 0, 0.1),
    memoryPrecision:     clamp(base.memoryPrecision     + jitter(0.002), 0.9, 1),
    driftScore:          clamp(base.driftScore          + jitter(0.002), 0, 0.1),
    contractCompliance:  clamp(base.contractCompliance  + jitter(0.0005), 0.98, 1),
    timestamp:           Date.now(),
  };
}

// ─── Health scoring ───────────────────────────────────────────────────────────

/**
 * Compute a 0-100 health score from bot metrics.
 * Weighted formula:
 *   errorRate        → contributes up to 50 points penalty
 *   driftScore       → contributes up to 30 points penalty
 *   contractCompliance → contributes up to 20 points penalty
 * @param {object} metrics
 * @returns {number}
 */
function computeHealthScore(metrics) {
  const { errorRate, driftScore, contractCompliance } = metrics;
  const penalty =
    (errorRate          * 50 +
     driftScore         * 30 +
     (1 - contractCompliance) * 20) * 100;
  return clamp(Math.round(100 - penalty), 0, 100);
}

/**
 * Derive badge class and label from health score.
 * @param {number} score
 * @returns {{ cls: string, label: string }}
 */
function scoreToBadge(score) {
  if (score >= 85) return { cls: 'badge-green',  label: 'Verde'    };
  if (score >= 60) return { cls: 'badge-yellow', label: 'Amarillo' };
  return              { cls: 'badge-red',    label: 'Rojo'     };
}

// ─── Alert detection ──────────────────────────────────────────────────────────

/**
 * Check each metric against its threshold.
 * @param {string} botId
 * @param {object} metrics
 * @param {object} thresholds
 * @returns {string[]} array of human-readable alert strings
 */
function checkAlerts(botId, metrics, thresholds) {
  const alerts = [];
  const name   = BOT_CONFIGS[botId].name;

  if (metrics.errorRate > thresholds.errorRate) {
    alerts.push(
      `${name}: Error Rate ${fmtPct(metrics.errorRate, 3)} supera umbral ${fmtPct(thresholds.errorRate, 3)}`
    );
  }
  if (metrics.memoryPrecision < thresholds.memoryPrecision) {
    alerts.push(
      `${name}: Memory Precision ${fmtPct(metrics.memoryPrecision)} por debajo del umbral ${fmtPct(thresholds.memoryPrecision)}`
    );
  }
  if (metrics.driftScore > thresholds.driftScore) {
    alerts.push(
      `${name}: Drift Score ${fmtPct(metrics.driftScore, 3)} supera umbral ${fmtPct(thresholds.driftScore, 3)}`
    );
  }
  if (metrics.contractCompliance < thresholds.contractCompliance) {
    alerts.push(
      `${name}: Compliance ${fmtPct(metrics.contractCompliance, 4)} por debajo del umbral ${fmtPct(thresholds.contractCompliance, 4)}`
    );
  }

  return alerts;
}

// ─── DOM rendering ───────────────────────────────────────────────────────────

/**
 * Decide if a metric value is above/below its threshold and return a CSS class.
 * @param {string} key
 * @param {number} value
 * @param {object} thresholds
 * @returns {string}
 */
function metricClass(key, value, thresholds) {
  const threshold = thresholds[key];
  const isRateLike = key === 'errorRate' || key === 'driftScore';
  const breached   = isRateLike ? value > threshold : value < threshold;
  if (!breached) return '';
  // Decide severity: >1.5× threshold deviation → alert, else warn
  const ratio = isRateLike
    ? value / threshold
    : threshold / value;
  return ratio > 1.5 ? 'alert' : 'warn';
}

/**
 * Render / update a single bot card with fresh metrics.
 * @param {string} botId
 * @param {object} metrics  - current metric snapshot
 * @param {number[]} history - array of recent health scores
 */
function renderCard(botId, metrics, history) {
  const config     = BOT_CONFIGS[botId];
  const score      = computeHealthScore(metrics);
  const badge      = scoreToBadge(score);
  const thresholds = config.thresholds;

  // Score
  const scoreEl = document.getElementById('score-' + botId);
  if (scoreEl) {
    scoreEl.textContent = score;
    scoreEl.style.color = badge.cls === 'badge-green'
      ? 'var(--badge-green)'
      : badge.cls === 'badge-yellow'
        ? 'var(--badge-yellow)'
        : 'var(--badge-red)';
  }

  // Health badge
  const badgeEl = document.getElementById('badge-' + botId);
  if (badgeEl) {
    badgeEl.className  = 'health-badge ' + badge.cls;
    badgeEl.textContent = badge.label;
    badgeEl.setAttribute('aria-label', 'Estado de salud: ' + badge.label);
  }

  // Individual metrics
  const metricDefs = [
    { key: 'errorRate',          fmt: (v) => fmtPct(v, 3) },
    { key: 'memoryPrecision',    fmt: (v) => fmtPct(v, 2) },
    { key: 'driftScore',         fmt: (v) => fmtPct(v, 3) },
    { key: 'contractCompliance', fmt: (v) => fmtPct(v, 4) },
  ];

  metricDefs.forEach(({ key, fmt }) => {
    const el = document.getElementById(`metric-${botId}-${key}`);
    if (!el) return;
    el.textContent = fmt(metrics[key]);
    el.className   = 'metric-value ' + metricClass(key, metrics[key], thresholds);
  });

  // Last check timestamp
  const tsEl = document.getElementById('lastcheck-' + botId);
  if (tsEl) {
    const d = metrics.timestamp ? new Date(metrics.timestamp) : new Date();
    tsEl.textContent = 'Última verificación: ' + fmtTime(d);
  }

  // Sparkline
  renderSparkline(botId, history, config.color);
}

/**
 * Render mini sparkline bars for a bot.
 * @param {string} botId
 * @param {number[]} history - array of health scores 0-100
 * @param {string} color
 */
function renderSparkline(botId, history, color) {
  const el = document.getElementById('sparkline-' + botId);
  if (!el) return;

  // Keep last 20 points; pad with current if too short
  const data = history.length > 0 ? history.slice(-20) : [85];
  const max  = Math.max(...data, 1);

  el.innerHTML = data
    .map((val) => {
      const h     = Math.max(3, Math.round((val / max) * 32));
      const alpha = val >= 85 ? '1' : val >= 60 ? '0.7' : '0.5';
      return `<div class="spark-bar" style="height:${h}px;background:${color};opacity:${alpha}" title="${val}"></div>`;
    })
    .join('');
}

// ─── Global alerts panel ──────────────────────────────────────────────────────

/**
 * Update the global alert panel with aggregated alerts from all bots.
 * @param {string[][]} allAlerts  - array of alert arrays, one per bot
 */
function renderGlobalAlerts(allAlerts) {
  const panel   = document.getElementById('global-alerts');
  if (!panel) return;

  const flat = allAlerts.flat();

  if (flat.length === 0) {
    panel.innerHTML = '';
    return;
  }

  const items = flat
    .map((msg) => `<li class="alert-item">${msg}</li>`)
    .join('');

  panel.innerHTML = `
    <div class="alert-panel" role="alert">
      <div class="alert-panel-title">
        <span aria-hidden="true">⚠</span>
        <span>${flat.length} alerta${flat.length !== 1 ? 's' : ''} activa${flat.length !== 1 ? 's' : ''}</span>
      </div>
      <ul class="alert-list">${items}</ul>
    </div>
  `;
}

/**
 * Update the per-card alert indicator.
 * @param {string} botId
 * @param {string[]} alerts
 */
function renderCardAlertIndicator(botId, alerts) {
  const el = document.getElementById('alertind-' + botId);
  if (!el) return;
  if (alerts.length > 0) {
    el.textContent = `⚠ ${alerts.length} alerta${alerts.length !== 1 ? 's' : ''}`;
    el.classList.add('visible');
  } else {
    el.classList.remove('visible');
  }
}

// ─── Refresh loop ─────────────────────────────────────────────────────────────

let countdownValue = REFRESH_INTERVAL;
let countdownTimer = null;
let refreshTimer   = null;

/**
 * Perform one full refresh cycle: load, render, alert.
 */
function refresh() {
  const allAlerts = [];

  Object.keys(BOT_CONFIGS).forEach((botId) => {
    const config      = BOT_CONFIGS[botId];
    const stored      = loadMetrics(botId);
    const base        = DEMO_BASE[botId] || DEMO_BASE.lucrecia;

    // Always generate a fresh snapshot and evolve the stored one slightly
    const existingCurrent = stored.current || generateDemoSnapshot(base);
    const evolved = {
      errorRate:          clamp(existingCurrent.errorRate         + jitter(0.001), 0, 0.1),
      memoryPrecision:    clamp(existingCurrent.memoryPrecision   + jitter(0.001), 0.9, 1),
      driftScore:         clamp(existingCurrent.driftScore        + jitter(0.001), 0, 0.1),
      contractCompliance: clamp(existingCurrent.contractCompliance + jitter(0.0003), 0.98, 1),
      timestamp:          Date.now(),
    };

    // Append new health score to history
    const newScore  = computeHealthScore(evolved);
    const history   = Array.isArray(stored.history) ? stored.history : [];
    history.push(newScore);
    if (history.length > HISTORY_LIMIT) history.splice(0, history.length - HISTORY_LIMIT);

    saveMetrics(botId, evolved, history);

    renderCard(botId, evolved, history);

    const botAlerts = checkAlerts(botId, evolved, config.thresholds);
    allAlerts.push(botAlerts);
    renderCardAlertIndicator(botId, botAlerts);
  });

  renderGlobalAlerts(allAlerts);

  // Update last-refresh timestamp
  const tsEl = document.getElementById('last-refresh-ts');
  if (tsEl) tsEl.textContent = 'Última actualización: ' + fmtTime(new Date());
}

/**
 * Start the countdown ticker and auto-refresh loop.
 */
function startLoop() {
  // Immediate first render
  refresh();

  // Countdown ticker (every second)
  countdownValue = REFRESH_INTERVAL;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdownValue -= 1;
    const el = document.getElementById('countdown-display');
    if (el) el.textContent = String(Math.max(0, countdownValue));
  }, 1000);

  // Refresh every REFRESH_INTERVAL seconds
  clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    refresh();
    countdownValue = REFRESH_INTERVAL;
  }, REFRESH_INTERVAL * 1000);
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  startLoop();
});
