/** energy-tracker.js — Log de nivel de energía 1-5 por hora del día · KAIROS browser module */
const ENERGY_KEY = 'kairos:energy';

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function loadEnergy() { try { return JSON.parse(localStorage.getItem(ENERGY_KEY) || '{}'); } catch { return {}; } }
function saveEnergy(data) { localStorage.setItem(ENERGY_KEY, JSON.stringify(data)); }

export function logEnergy(level) {
  level = Math.round(level);
  if (!Number.isFinite(level) || level < 1 || level > 5) throw new RangeError('level must be 1-5');
  const data = loadEnergy();
  const date = localDateStr();
  const hour = new Date().getHours();
  const key = `${date}:${hour}`;
  data[key] = level;
  saveEnergy(data);
  return { date, hour, level };
}

export function getEnergyHistory(days = 7) {
  const data = loadEnergy();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth()+1).padStart(2,'0')}-${String(cutoff.getDate()).padStart(2,'0')}`;
  return Object.entries(data)
    .filter(([k]) => k.slice(0, 10) >= cutoffStr)
    .map(([k, level]) => { const [date, hourStr] = k.split(':'); return { date, hour: Number(hourStr), level: Number(level) }; })
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
}

export function getDailyPeakHour() {
  const data = loadEnergy();
  const hourTotals = {};
  const hourCounts = {};
  for (const [k, level] of Object.entries(data)) {
    const hour = Number(k.split(':')[1]);
    hourTotals[hour] = (hourTotals[hour] || 0) + Number(level);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }
  let bestHour = null, bestAvg = -1;
  for (const h of Object.keys(hourTotals)) {
    const avg = hourTotals[h] / hourCounts[h];
    if (avg > bestAvg) { bestAvg = avg; bestHour = Number(h); }
  }
  return bestHour;
}

export function getEnergyStats() {
  const history = getEnergyHistory(14);
  if (!history.length) return { avg: 0, peak: 0, trend: 'stable' };
  const levels = history.map(e => e.level);
  const avg = levels.reduce((s, v) => s + v, 0) / levels.length;
  const peak = Math.max(...levels);
  const half = Math.floor(levels.length / 2);
  const firstHalf = levels.slice(0, half);
  const secondHalf = levels.slice(half);
  const avgFirst = firstHalf.length ? firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length : avg;
  const avgSecond = secondHalf.length ? secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length : avg;
  const trend = avgSecond > avgFirst + 0.2 ? 'up' : avgSecond < avgFirst - 0.2 ? 'down' : 'stable';
  return { avg: Math.round(avg * 10) / 10, peak, trend };
}

export function renderEnergyPanel() {
  const existing = document.getElementById('kairos-energy-panel');
  if (existing) { existing.remove(); return; }

  const stats = getEnergyStats();
  const peakHour = getDailyPeakHour();
  const todayHistory = getEnergyHistory(1);

  const panel = document.createElement('div');
  panel.id = 'kairos-energy-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(480px,95vw);max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem';
  const title = document.createElement('h3');
  title.style.cssText = 'margin:0;color:#a5b4fc;font-size:1rem';
  title.textContent = '⚡ Energy Tracker';
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => panel.remove());
  header.append(title, closeBtn);

  const statsBar = document.createElement('div');
  statsBar.style.cssText = 'display:flex;gap:1rem;margin-bottom:1rem;font-size:0.8rem;flex-wrap:wrap';
  const trendEmoji = stats.trend === 'up' ? '📈' : stats.trend === 'down' ? '📉' : '➡️';
  const s1 = document.createElement('span'); s1.style.color = '#a5b4fc'; s1.textContent = `Promedio: ${stats.avg}/5`;
  const s2 = document.createElement('span'); s2.style.color = '#fbbf24'; s2.textContent = `Pico: ${stats.peak}/5`;
  const s3 = document.createElement('span'); s3.style.color = '#34d399'; s3.textContent = `Tendencia: ${trendEmoji}`;
  const s4 = document.createElement('span'); s4.style.color = '#60a5fa';
  s4.textContent = peakHour !== null ? `Mejor hora: ${peakHour}:00` : 'Sin datos aún';
  statsBar.append(s1, s2, s3, s4);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:1.2rem;justify-content:center';
  const labels = ['😴', '😐', '🙂', '⚡', '🚀'];
  const colors = ['#374151', '#4b5563', '#059669', '#d97706', '#7c3aed'];
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.style.cssText = `padding:0.5rem 0.9rem;background:${colors[i-1]};color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;display:flex;flex-direction:column;align-items:center;gap:0.1rem`;
    const emoji = document.createElement('span'); emoji.textContent = labels[i-1];
    const lvl = document.createElement('span'); lvl.style.fontSize = '0.72rem'; lvl.textContent = String(i);
    btn.append(emoji, lvl);
    btn.title = `Energía ${i}/5`;
    btn.addEventListener('click', () => { logEnergy(i); panel.remove(); renderEnergyPanel(); });
    btnRow.appendChild(btn);
  }

  const chartSection = document.createElement('div');
  chartSection.style.cssText = 'margin-bottom:1rem';
  const chartTitle = document.createElement('div');
  chartTitle.style.cssText = 'font-size:0.75rem;color:#6b7280;margin-bottom:0.5rem';
  chartTitle.textContent = 'Hoy por hora:';
  chartSection.appendChild(chartTitle);

  const chartWrap = document.createElement('div');
  chartWrap.style.cssText = 'display:flex;gap:2px;align-items:flex-end;height:48px;overflow-x:auto';

  const byHour = {};
  todayHistory.forEach(e => { byHour[e.hour] = e.level; });
  const levelColors = ['','#374151','#4b5563','#059669','#d97706','#7c3aed'];

  for (let h = 0; h < 24; h++) {
    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:1px;flex:1;min-width:10px';
    const bar = document.createElement('div');
    if (byHour[h] !== undefined) {
      const barH = Math.round((byHour[h] / 5) * 48);
      bar.style.cssText = `width:100%;height:${barH}px;background:${levelColors[byHour[h]]};border-radius:2px 2px 0 0`;
      bar.title = `${h}:00 → energía ${byHour[h]}`;
    } else {
      bar.style.cssText = 'width:100%;height:4px;background:#1f2937;border-radius:2px';
    }
    col.appendChild(bar);
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:0.55rem;color:#4b5563';
    lbl.textContent = h % 6 === 0 ? String(h) : '';
    col.appendChild(lbl);
    chartWrap.appendChild(col);
  }
  chartSection.appendChild(chartWrap);

  panel.append(header, statsBar, btnRow, chartSection);
  document.body.appendChild(panel);
}
