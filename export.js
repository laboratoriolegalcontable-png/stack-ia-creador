/**
 * Export / Import — exporta todo el estado KAIROS a JSON y lo reimporta
 * @module export
 */

const EXPORT_KEYS = [
  'kairos:sessions', 'kairos:lastCycle', 'kairos:memory', 'kairos:flags',
  'coordinator:latest', 'ultraplan:latest', 'buddy:state',
  'token-budget:daily',
];

export function exportState() {
  const state = {};
  for (const key of EXPORT_KEYS) {
    const val = localStorage.getItem(key);
    if (val !== null) state[key] = val;
  }
  // Incluir también todos los kairos:event:*
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith('kairos:event:')) state[k] = localStorage.getItem(k);
  }

  const json = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `kairos-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** @param {File} file */
export async function importState(file) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    alert('Archivo JSON inválido');
    return;
  }
  if (!parsed.state || parsed.version !== 1) {
    alert('Formato no reconocido — se necesita version:1 y campo state');
    return;
  }
  let count = 0;
  for (const [key, value] of Object.entries(parsed.state)) {
    try { localStorage.setItem(key, String(value)); count++; } catch {}
  }
  alert(`✅ ${count} claves importadas correctamente`);
  location.reload();
}

export function renderExportPanel() {
  const existing = document.getElementById('export-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'export-panel';
  panel.style.cssText = [
    'position:fixed;bottom:140px;right:16px;width:280px',
    'background:#0f172a;border:1px solid #334155;border-radius:12px',
    'padding:16px;font-family:monospace;font-size:12px;color:#e2e8f0',
    'box-shadow:0 8px 32px rgba(0,0,0,0.6);z-index:9997',
  ].join(';');

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';
  input.onchange = (e) => { if (e.target.files[0]) importState(e.target.files[0]); };

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="color:#818cf8;font-weight:700">&#x1F4BE; Export / Import</span>
      <button onclick="this.closest('#export-panel').remove()"
        style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px">&#x2715;</button>
    </div>
    <button id="export-btn"
      style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;
             color:#a5b4fc;cursor:pointer;margin-bottom:8px">
      &#x2B07;&#xFE0F; Exportar estado KAIROS
    </button>
    <button id="import-btn"
      style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;
             color:#a5b4fc;cursor:pointer">
      &#x2B06;&#xFE0F; Importar desde JSON
    </button>
  `;
  panel.appendChild(input);
  document.body.appendChild(panel);

  document.getElementById('export-btn').onclick = exportState;
  document.getElementById('import-btn').onclick = () => input.click();
}
