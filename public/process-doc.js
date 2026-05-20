const KEY = 'kairos:process-docs';
function load() { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

const TYPE_ICONS = { sop: '📋', workflow: '🔄', runbook: '📖', checklist: '✅', guide: '💡', other: '📄' };

export function renderProcessDoc() {
  let panel = document.getElementById('process-doc-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? '' : 'none'; if (panel.style.display !== 'none') _refresh(); return; }
  panel = document.createElement('div');
  panel.id = 'process-doc-panel';
  panel.className = 'ia-panel';
  panel.innerHTML = `
    <div class="ia-panel-header"><h2>📋 Process Docs</h2><button class="ia-close" onclick="document.getElementById('process-doc-panel').style.display='none'">✕</button></div>
    <div class="ia-panel-body">
      <form id="pd-form" class="ia-form">
        <input id="pd-title" placeholder="Título del documento *" required />
        <select id="pd-type">
          <option value="sop">📋 SOP</option>
          <option value="workflow">🔄 Workflow</option>
          <option value="runbook">📖 Runbook</option>
          <option value="checklist">✅ Checklist</option>
          <option value="guide">💡 Guide</option>
          <option value="other">📄 Other</option>
        </select>
        <textarea id="pd-description" placeholder="Descripción *" rows="2" required></textarea>
        <div style="display:flex;gap:8px">
          <input id="pd-owner" placeholder="Owner / responsable" style="flex:1" />
          <input id="pd-version" placeholder="Versión" value="1.0" style="flex:1" />
        </div>
        <input id="pd-tags" placeholder="Tags (separados por coma)" />
        <textarea id="pd-steps" placeholder="Pasos (un paso por línea)" rows="3"></textarea>
        <button type="submit" class="ia-btn">Guardar documento</button>
      </form>
      <div id="pd-stats" class="ia-stats-bar"></div>
      <div id="pd-list" class="ia-list"></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('pd-form').onsubmit = e => {
    e.preventDefault();
    const items = load();
    const now2 = now();
    const stepsRaw = document.getElementById('pd-steps').value.trim();
    const steps = stepsRaw ? stepsRaw.split('\n').filter(s => s.trim()).map((title, i) => ({ order: i + 1, title: title.trim() })) : [];
    items.push({
      id: uid(),
      title: document.getElementById('pd-title').value.trim(),
      type: document.getElementById('pd-type').value,
      description: document.getElementById('pd-description').value.trim(),
      owner: document.getElementById('pd-owner').value.trim(),
      version: document.getElementById('pd-version').value.trim() || '1.0',
      tags: document.getElementById('pd-tags').value.trim(),
      steps,
      createdAt: now2,
      updatedAt: now2
    });
    save(items);
    e.target.reset();
    document.getElementById('pd-version').value = '1.0';
    _refresh();
  };
  _refresh();
}

function _refresh() {
  const stats = document.getElementById('pd-stats');
  const list = document.getElementById('pd-list');
  if (!stats || !list) return;
  const all = load();
  const sops = all.filter(i => i.type === 'sop').length;
  const runbooks = all.filter(i => i.type === 'runbook').length;
  stats.textContent = 'Total: ' + all.length + ' | SOPs: ' + sops + ' | Runbooks: ' + runbooks;
  list.innerHTML = '';
  all.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
    const el = document.createElement('div');
    el.className = 'ia-list-item';
    const icon = TYPE_ICONS[item.type] || '📄';
    el.innerHTML = '<div class="ia-list-item-header"><strong></strong><span class="ia-badge blue"></span><span class="ia-badge gray"></span><span class="ia-badge gray"></span><button class="ia-btn-sm red">✕</button></div><small></small>';
    el.querySelector('strong').textContent = icon + ' ' + item.title;
    const badges = el.querySelectorAll('.ia-badge');
    badges[0].textContent = item.type;
    badges[1].textContent = 'v' + (item.version || '1.0');
    badges[2].textContent = (item.steps ? item.steps.length : 0) + ' pasos';
    el.querySelector('button').onclick = () => { save(load().filter(x => x.id !== item.id)); _refresh(); };
    const desc = item.description ? item.description.slice(0, 80) : '';
    const ownerInfo = item.owner ? ' · ' + item.owner : '';
    el.querySelector('small').textContent = desc + ownerInfo;
    list.appendChild(el);
  });
}
