/**
 * Anomaly Detector — detecta patrones inusuales en el estado KAIROS
 * @module anomaly
 */
import { getFlags } from './flags.js';
import { notify } from './notifications.js';

const ANOMALY_KEY = 'kairos:anomalies';

export function detectAnomalies() {
  if (!getFlags().ANOMALY_DETECTION_ENABLED) return [];

  const anomalies = [];
  const today     = new Date().toISOString().slice(0, 10);

  const sessions  = Number(localStorage.getItem('kairos:sessions')) || 0;
  const costRaw   = localStorage.getItem('kairos:cost:daily');
  const cost      = (costRaw && JSON.parse(costRaw).date === today)
                    ? JSON.parse(costRaw).usd : 0;
  const lsUsed    = [...Array(localStorage.length)].reduce((acc, _, i) => {
    const k = localStorage.key(i); return acc + k.length + (localStorage.getItem(k) || '').length;
  }, 0);
  const lsPct = lsUsed / (5 * 1024 * 1024);

  if (cost > 2) {
    anomalies.push({ type: 'cost_spike', severity: 'high',
      message: `Costo diario crítico: $${cost.toFixed(3)}`, value: cost, threshold: 2 });
  } else if (cost > 0.5) {
    anomalies.push({ type: 'cost_spike', severity: 'medium',
      message: `Costo elevado: $${cost.toFixed(3)}`, value: cost, threshold: 0.5 });
  }

  if (sessions > 15) {
    anomalies.push({ type: 'session_surge', severity: 'high',
      message: `${sessions} sesiones sin ciclo KAIROS`, value: sessions, threshold: 15 });
  }

  if (lsPct > 0.9) {
    anomalies.push({ type: 'storage_full', severity: 'high',
      message: `Storage crítico: ${Math.round(lsPct * 100)}% usado`, value: lsPct, threshold: 0.9 });
  }

  localStorage.setItem(ANOMALY_KEY, JSON.stringify(anomalies));

  // Notificar anomalías high
  anomalies.filter(a => a.severity === 'high').forEach(a => {
    notify('Anomalía detectada', a.message, 'budget');
  });

  return anomalies;
}

export function getAnomalies() {
  const raw = localStorage.getItem(ANOMALY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function renderAnomalyBadge() {
  const anomalies = detectAnomalies();
  const badge = document.getElementById('anomaly-badge');
  if (!badge) return;
  if (!anomalies.length) { badge.textContent = ''; return; }
  const high = anomalies.filter(a => a.severity === 'high').length;
  badge.textContent = high ? `\u{26A0}️ ${high}` : `\u{1F4A1} ${anomalies.length}`;
  badge.style.color  = high ? '#ef4444' : '#f59e0b';
  badge.title = anomalies.map(a => a.message).join(' | ');
}
