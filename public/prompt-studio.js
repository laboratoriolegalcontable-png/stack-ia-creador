/**
 * prompt-studio.js — Constructor interactivo de super-prompts (Prompt Master)
 * 7 dimensiones: Rol, Contexto, Tarea, Formato, Restricciones, Ejemplos, Iteración
 * @module prompt-studio
 */

const STORAGE_KEY = 'kairos:prompt-studio';

const ROLES = [
  { value: 'experto', label: 'Experto en el dominio' },
  { value: 'consultor', label: 'Consultor estratégico' },
  { value: 'redactor', label: 'Redactor profesional' },
  { value: 'analista', label: 'Analista de datos' },
  { value: 'abogado', label: 'Asesor legal' },
  { value: 'coach', label: 'Coach / Mentor' },
  { value: 'programador', label: 'Desarrollador de software' },
  { value: 'custom', label: 'Rol personalizado…' },
];

const FORMATS = [
  { value: 'lista', label: 'Lista con viñetas' },
  { value: 'numerado', label: 'Lista numerada' },
  { value: 'tabla', label: 'Tabla comparativa' },
  { value: 'markdown', label: 'Markdown estructurado' },
  { value: 'json', label: 'JSON' },
  { value: 'parrafos', label: 'Párrafos narrativos' },
  { value: 'paso-a-paso', label: 'Paso a paso' },
  { value: 'ninguno', label: 'Sin formato específico' },
];

const TONES = [
  { value: 'formal', label: 'Formal / Profesional' },
  { value: 'directo', label: 'Directo y conciso' },
  { value: 'didactico', label: 'Didáctico / Explicativo' },
  { value: 'creativo', label: 'Creativo / Original' },
  { value: 'empatico', label: 'Empático / Cercano' },
];

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}
function saveDraft(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function buildPrompt(f) {
  const parts = [];
  if (f.role) {
    const roleLabel = f.roleCustom || (ROLES.find(r => r.value === f.role)?.label ?? f.role);
    parts.push(`Actúa como ${roleLabel}.`);
  }
  if (f.context?.trim()) parts.push(`Contexto: ${f.context.trim()}`);
  if (f.task?.trim()) parts.push(`Tarea: ${f.task.trim()}`);
  if (f.format && f.format !== 'ninguno') {
    const fLabel = FORMATS.find(x => x.value === f.format)?.label ?? f.format;
    parts.push(`Responde en formato: ${fLabel}.`);
  }
  if (f.tone && f.tone !== 'formal') {
    const tLabel = TONES.find(x => x.value === f.tone)?.label ?? f.tone;
    parts.push(`Tono: ${tLabel}.`);
  }
  if (f.constraints?.trim()) {
    const lines = f.constraints.split('\n').filter(l => l.trim());
    if (lines.length) parts.push('Restricciones:\n' + lines.map(l => `- ${l.trim()}`).join('\n'));
  }
  if (f.examples?.trim()) {
    parts.push('Ejemplos de referencia:\n' + f.examples.trim());
  }
  if (f.prefill?.trim()) parts.push(`\n${f.prefill.trim()}`);
  return parts.join('\n\n');
}

function getFormData(panel) {
  return {
    role:         panel.querySelector('#ps-role')?.value ?? '',
    roleCustom:   panel.querySelector('#ps-role-custom')?.value?.trim() ?? '',
    context:      panel.querySelector('#ps-context')?.value ?? '',
    task:         panel.querySelector('#ps-task')?.value ?? '',
    format:       panel.querySelector('#ps-format')?.value ?? 'ninguno',
    tone:         panel.querySelector('#ps-tone')?.value ?? 'formal',
    constraints:  panel.querySelector('#ps-constraints')?.value ?? '',
    examples:     panel.querySelector('#ps-examples')?.value ?? '',
    prefill:      panel.querySelector('#ps-prefill')?.value ?? '',
    version:      parseInt(panel.querySelector('#ps-version')?.textContent ?? '1', 10),
  };
}

function fillForm(panel, draft) {
  if (!draft) return;
  const set = (id, val) => { const el = panel.querySelector(id); if (el) el.value = val ?? ''; };
  set('#ps-role', draft.role);
  set('#ps-role-custom', draft.roleCustom);
  set('#ps-context', draft.context);
  set('#ps-task', draft.task);
  set('#ps-format', draft.format);
  set('#ps-tone', draft.tone);
  set('#ps-constraints', draft.constraints);
  set('#ps-examples', draft.examples);
  set('#ps-prefill', draft.prefill);
  const vEl = panel.querySelector('#ps-version');
  if (vEl) vEl.textContent = draft.version ?? 1;
  const customRow = panel.querySelector('#ps-role-custom-row');
  if (customRow) customRow.style.display = draft.role === 'custom' ? '' : 'none';
  _updatePreview(panel);
}

function _updatePreview(panel) {
  const preview = panel.querySelector('#ps-preview');
  if (!preview) return;
  const data = getFormData(panel);
  const built = buildPrompt(data);
  preview.textContent = built || '(completa los campos para ver el preview)';
  saveDraft(data);
}

export function renderPromptStudio() {
  let panel = document.getElementById('prompt-studio-panel');
  if (panel) {
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? '' : 'none';
    if (!isHidden) return;
    fillForm(panel, loadDraft());
    return;
  }

  panel = document.createElement('div');
  panel.id = 'prompt-studio-panel';
  panel.className = 'ia-panel';
  panel.style.cssText = 'max-width:680px;width:95vw';

  panel.innerHTML = `
    <div class="ia-panel-header">
      <h2>🧪 Prompt Studio</h2>
      <span style="font-size:11px;color:var(--muted);margin-left:8px">v<span id="ps-version">1</span></span>
      <button class="ia-close" onclick="document.getElementById('prompt-studio-panel').style.display='none'">✕</button>
    </div>
    <div class="ia-panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

      <!-- LEFT: inputs -->
      <div style="display:flex;flex-direction:column;gap:10px">

        <label style="font-size:12px;font-weight:600;color:var(--muted)">1 · ROL / PERSONA</label>
        <select id="ps-role" class="ia-input">
          ${ROLES.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
        </select>
        <div id="ps-role-custom-row" style="display:none">
          <input id="ps-role-custom" class="ia-input" placeholder="Describe el rol personalizado…" />
        </div>

        <label style="font-size:12px;font-weight:600;color:var(--muted)">2 · CONTEXTO</label>
        <textarea id="ps-context" class="ia-input" rows="3"
          placeholder="¿Cuál es la situación? ¿Qué sabe el modelo? ¿Para quién es?"></textarea>

        <label style="font-size:12px;font-weight:600;color:var(--muted)">3 · TAREA PRINCIPAL</label>
        <textarea id="ps-task" class="ia-input" rows="3"
          placeholder="¿Qué debe hacer exactamente? Sé específico y medible."></textarea>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div>
            <label style="font-size:12px;font-weight:600;color:var(--muted)">4 · FORMATO</label>
            <select id="ps-format" class="ia-input" style="margin-top:4px">
              ${FORMATS.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:var(--muted)">TONO</label>
            <select id="ps-tone" class="ia-input" style="margin-top:4px">
              ${TONES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <label style="font-size:12px;font-weight:600;color:var(--muted)">5 · RESTRICCIONES <span style="font-weight:400">(una por línea)</span></label>
        <textarea id="ps-constraints" class="ia-input" rows="3"
          placeholder="No uses jerga técnica&#10;Máximo 3 párrafos&#10;Sin recomendaciones legales vinculantes"></textarea>

        <label style="font-size:12px;font-weight:600;color:var(--muted)">6 · EJEMPLOS (few-shot)</label>
        <textarea id="ps-examples" class="ia-input" rows="3"
          placeholder="Ejemplo entrada: &quot;texto&quot; → Ejemplo salida: &quot;respuesta&quot;"></textarea>

        <label style="font-size:12px;font-weight:600;color:var(--muted)">7 · PREFILL (inicio de respuesta)</label>
        <input id="ps-prefill" class="ia-input" placeholder='Ej: "Aquí está mi análisis:"' />

      </div>

      <!-- RIGHT: preview + actions -->
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <label style="font-size:12px;font-weight:600;color:var(--muted)">PREVIEW DEL PROMPT</label>
          <div style="display:flex;gap:6px">
            <button id="ps-copy-btn" class="ia-btn" style="font-size:11px;padding:3px 8px">Copiar</button>
            <button id="ps-save-btn" class="ia-btn" style="font-size:11px;padding:3px 8px">Guardar</button>
            <button id="ps-iterate-btn" class="ia-btn" style="font-size:11px;padding:3px 8px;background:var(--accent)">+v</button>
          </div>
        </div>
        <pre id="ps-preview" style="
          flex:1;min-height:300px;background:var(--code-bg,#f5f5f5);border:1px solid var(--border);
          border-radius:6px;padding:12px;font-size:12px;white-space:pre-wrap;word-break:break-word;
          overflow-y:auto;color:var(--text)
        ">(completa los campos para ver el preview)</pre>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:6px;padding:10px;font-size:11px;color:var(--muted)">
          <strong style="color:var(--text)">Checklist Prompt Master</strong>
          <ul id="ps-checklist" style="margin:6px 0 0;padding-left:16px;line-height:1.8">
            <li id="psc-role">⬜ Rol definido</li>
            <li id="psc-context">⬜ Contexto claro</li>
            <li id="psc-task">⬜ Tarea específica</li>
            <li id="psc-format">⬜ Formato especificado</li>
            <li id="psc-constraints">⬜ Restricciones definidas</li>
            <li id="psc-examples">⬜ Ejemplos incluidos</li>
            <li id="psc-prefill">⬜ Prefill configurado</li>
          </ul>
          <div id="ps-score" style="margin-top:6px;font-weight:600;color:var(--accent)"></div>
        </div>

        <div style="display:flex;gap:6px">
          <button id="ps-clear-btn" class="ia-btn" style="font-size:11px;padding:3px 8px;flex:1">Limpiar</button>
          <button id="ps-load-btn" class="ia-btn" style="font-size:11px;padding:3px 8px;flex:1">Cargar borrador</button>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(panel);

  const live = ['#ps-role','#ps-role-custom','#ps-context','#ps-task','#ps-format','#ps-tone','#ps-constraints','#ps-examples','#ps-prefill'];
  live.forEach(sel => {
    panel.querySelector(sel)?.addEventListener('input', () => {
      _updatePreview(panel);
      _updateChecklist(panel);
    });
  });

  panel.querySelector('#ps-role')?.addEventListener('change', e => {
    const customRow = panel.querySelector('#ps-role-custom-row');
    if (customRow) customRow.style.display = e.target.value === 'custom' ? '' : 'none';
    _updatePreview(panel);
    _updateChecklist(panel);
  });

  panel.querySelector('#ps-copy-btn')?.addEventListener('click', () => {
    const text = panel.querySelector('#ps-preview')?.textContent ?? '';
    navigator.clipboard.writeText(text).then(() => {
      const btn = panel.querySelector('#ps-copy-btn');
      if (btn) { btn.textContent = '✅ Copiado'; setTimeout(() => { btn.textContent = 'Copiar'; }, 2000); }
    });
  });

  panel.querySelector('#ps-save-btn')?.addEventListener('click', () => {
    const data = getFormData(panel);
    const prompt = buildPrompt(data);
    if (!prompt.trim()) return;
    const saved = JSON.parse(localStorage.getItem('kairos:prompts') || '[]');
    saved.push({ id: crypto.randomUUID(), title: `Super-Prompt v${data.version} — ${new Date().toLocaleDateString('es')}`, prompt, category: 'business', tags: ['prompt-master'], createdAt: new Date().toISOString() });
    localStorage.setItem('kairos:prompts', JSON.stringify(saved));
    const btn = panel.querySelector('#ps-save-btn');
    if (btn) { btn.textContent = '✅ Guardado'; setTimeout(() => { btn.textContent = 'Guardar'; }, 2000); }
  });

  panel.querySelector('#ps-iterate-btn')?.addEventListener('click', () => {
    const vEl = panel.querySelector('#ps-version');
    if (vEl) {
      const next = (parseInt(vEl.textContent, 10) || 1) + 1;
      vEl.textContent = next;
      const data = getFormData(panel);
      data.version = next;
      saveDraft(data);
    }
    const btn = panel.querySelector('#ps-iterate-btn');
    if (btn) { btn.textContent = `✅ v${panel.querySelector('#ps-version')?.textContent}`; setTimeout(() => { btn.textContent = '+v'; }, 1500); }
  });

  panel.querySelector('#ps-clear-btn')?.addEventListener('click', () => {
    ['#ps-context','#ps-task','#ps-constraints','#ps-examples','#ps-prefill'].forEach(sel => {
      const el = panel.querySelector(sel); if (el) el.value = '';
    });
    panel.querySelector('#ps-role').value = 'experto';
    panel.querySelector('#ps-format').value = 'ninguno';
    panel.querySelector('#ps-tone').value = 'formal';
    panel.querySelector('#ps-version').textContent = '1';
    localStorage.removeItem(STORAGE_KEY);
    _updatePreview(panel);
    _updateChecklist(panel);
  });

  panel.querySelector('#ps-load-btn')?.addEventListener('click', () => {
    fillForm(panel, loadDraft());
    _updateChecklist(panel);
  });

  const draft = loadDraft();
  if (draft) fillForm(panel, draft);
  _updateChecklist(panel);
}

function _updateChecklist(panel) {
  const data = getFormData(panel);
  const checks = {
    'psc-role':        !!(data.role && (data.role !== 'custom' || data.roleCustom)),
    'psc-context':     data.context.trim().length > 10,
    'psc-task':        data.task.trim().length > 10,
    'psc-format':      data.format !== 'ninguno',
    'psc-constraints': data.constraints.trim().length > 0,
    'psc-examples':    data.examples.trim().length > 0,
    'psc-prefill':     data.prefill.trim().length > 0,
  };
  let score = 0;
  Object.entries(checks).forEach(([id, ok]) => {
    const el = panel.querySelector(`#${id}`);
    if (!el) return;
    el.textContent = el.textContent.replace(/^[✅⬜] /, (ok ? '✅ ' : '⬜ '));
    if (ok) score++;
  });
  const scoreEl = panel.querySelector('#ps-score');
  if (scoreEl) {
    const pct = Math.round((score / 7) * 100);
    const stars = score >= 6 ? '🌟' : score >= 4 ? '✨' : '💡';
    scoreEl.textContent = `${stars} Calidad del prompt: ${pct}% (${score}/7 dimensiones)`;
    scoreEl.style.color = pct >= 80 ? 'var(--green,#22c55e)' : pct >= 50 ? 'var(--accent)' : 'var(--yellow,#eab308)';
  }
}
