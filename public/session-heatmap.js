/** Session Heatmap — KAIROS browser module */
const HEATMAP_KEY = 'kairos:heatmap';

function loadHeatmap() { try { return JSON.parse(localStorage.getItem(HEATMAP_KEY) || '{}'); } catch { return {}; } }
function saveHeatmap(h) { try { localStorage.setItem(HEATMAP_KEY, JSON.stringify(h)); } catch {} }

export function recordActivity() {
  const heatmap = loadHeatmap();
  const d = new Date().toISOString().slice(0, 10);
  const h = new Date().getHours();
  const key = `${d}:${h}`;
  heatmap[key] = (heatmap[key] || 0) + 1;
  saveHeatmap(heatmap);
}

/** @param {number} [days] @returns {Array<{date:string,hour:number,count:number}>} */
export function getHeatmap(days = 30) {
  const heatmap = loadHeatmap();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  return Object.entries(heatmap)
    .map(([key, count]) => { const [date, hourStr] = key.split(':'); return { date, hour: parseInt(hourStr, 10), count }; })
    .filter(e => e.date >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
}

export function getDailySummary(days = 7) {
  const entries = getHeatmap(days);
  const byDate = {};
  for (const e of entries) {
    if (!byDate[e.date]) byDate[e.date] = new Array(24).fill(0);
    byDate[e.date][e.hour] += e.count;
  }
  return Object.entries(byDate).map(([date, hours]) => ({
    date, total: hours.reduce((s, c) => s + c, 0), peakHour: hours.indexOf(Math.max(...hours)),
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function renderHeatmap() {
  const existing = document.getElementById('kairos-heatmap-panel');
  if (existing) { existing.remove(); return; }

  recordActivity();
  const days = getDailySummary(14);
  const entries = getHeatmap(14);

  // Build 24h grid for the last 7 days
  const recentDates = [...new Set(entries.map(e => e.date))].slice(-7);
  const maxCount = Math.max(...entries.map(e => e.count), 1);

  const panel = document.createElement('div');
  panel.id = 'kairos-heatmap-panel';
  panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #4338ca;border-radius:12px;padding:1.5rem;z-index:9999;width:min(600px,95vw);max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:inherit';

  const heatmapByKey = {};
  for (const e of entries) heatmapByKey[`${e.date}:${e.hour}`] = e.count;

  const hourLabels = [0, 6, 12, 18, 23];

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h3 style="margin:0;color:#a5b4fc;font-size:1rem">&#x1F5D3;&#xFE0F; Session Heatmap</h3>
      <button onclick="document.getElementById('kairos-heatmap-panel').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem">&times;</button>
    </div>
    <p style="font-size:0.78rem;color:#9ca3af;margin-bottom:1rem">Actividad por hora en los últimos 7 días. Máximo: ${maxCount} acciones.</p>
    <div style="overflow-x:auto">
      <table style="border-collapse:collapse;font-size:0.68rem;width:100%">
        <thead><tr>
          <th style="color:#6b7280;text-align:left;padding:0.2rem 0.4rem;width:70px">Fecha</th>
          ${Array.from({length:24}, (_, i) => `<th style="color:${hourLabels.includes(i) ? '#9ca3af' : 'transparent'};padding:0.1rem;text-align:center;width:calc((100% - 70px)/24)">${i}h</th>`).join('')}
        </tr></thead>
        <tbody>
          ${recentDates.map(date => `<tr>
            <td style="color:#9ca3af;padding:0.2rem 0.4rem;white-space:nowrap">${date.slice(5)}</td>
            ${Array.from({length:24}, (_, h) => {
              const count = heatmapByKey[`${date}:${h}`] || 0;
              const intensity = count > 0 ? Math.min(1, count / maxCount) : 0;
              const alpha = (0.15 + intensity * 0.85).toFixed(2);
              const bg = count > 0 ? `rgba(99,102,241,${alpha})` : '#1f2937';
              return `<td title="${date} ${h}h: ${count}" style="background:${bg};border-radius:2px;padding:0.25rem;">&nbsp;</td>`;
            }).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:1.25rem">
      <div style="font-size:0.8rem;color:#9ca3af;margin-bottom:0.5rem">Resumen diario:</div>
      ${days.slice(-7).map(d => `
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.35rem">
          <span style="color:#9ca3af;font-size:0.75rem;width:55px">${d.date.slice(5)}</span>
          <div style="flex:1;height:6px;background:#1f2937;border-radius:3px">
            <div style="height:100%;width:${Math.min(100, d.total * 5)}%;background:linear-gradient(90deg,#4338ca,#7c3aed);border-radius:3px"></div>
          </div>
          <span style="color:#a5b4fc;font-size:0.75rem;width:40px">${d.total} acc</span>
          <span style="color:#6b7280;font-size:0.72rem">pico: ${d.peakHour}h</span>
        </div>`).join('')}
    </div>`;

  document.body.appendChild(panel);
}
