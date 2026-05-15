/**
 * Auto-Tagger — extrae keywords del contenido y etiqueta sesiones
 * @module auto-tagger
 */

const TAGS_KEY  = 'kairos:tags';
const STOP_WORDS = new Set([
  'el','la','los','las','un','una','y','o','de','del','en','con','por','para',
  'que','se','no','es','son','fue','ser','este','esta','como','pero','si',
  'the','a','an','is','in','on','at','to','of','and','or','for','with','not',
]);

export function extractKeywords(text) {
  return [...new Set(
    text.toLowerCase()
      .replace(/[^a-záéíóúñ\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w))
  )].slice(0, 15);
}

export function tagSession(text) {
  const keywords = extractKeywords(text);
  const existing = JSON.parse(localStorage.getItem(TAGS_KEY) || '[]');
  const merged   = [...new Set([...existing, ...keywords])].slice(0, 50);
  localStorage.setItem(TAGS_KEY, JSON.stringify(merged));
  return keywords;
}

export function getSessionTags() {
  return JSON.parse(localStorage.getItem(TAGS_KEY) || '[]');
}

export function renderTagCloud() {
  const tags = getSessionTags();
  const existing = document.getElementById('tag-cloud');
  if (existing) { existing.remove(); return; }
  if (!tags.length) return;

  const panel = document.createElement('div');
  panel.id = 'tag-cloud';
  panel.style.cssText = [
    'position:fixed;bottom:20px;left:50%;transform:translateX(-50%)',
    'background:#0f172a;border:1px solid #334155;border-radius:10px',
    'padding:12px 16px;font-family:monospace;font-size:11px;z-index:9994',
    'box-shadow:0 4px 16px rgba(0,0,0,0.5);max-width:400px;text-align:center',
  ].join(';');
  panel.innerHTML = `
    <div style="color:#6366f1;font-weight:700;margin-bottom:8px">🏷️ Tags de esta sesión</div>
    <div>${tags.map(t => `<span style="background:#1e293b;padding:2px 8px;border-radius:20px;
      margin:2px;display:inline-block;color:#a5b4fc">${t}</span>`).join('')}</div>
    <button onclick="this.parentElement.remove()" style="margin-top:8px;background:none;
      border:none;color:#475569;cursor:pointer;font-size:11px">cerrar</button>
  `;
  document.body.appendChild(panel);
  setTimeout(() => panel.remove(), 8000);
}
