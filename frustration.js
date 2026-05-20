/**
 * Detección de frustración del usuario en campos de búsqueda.
 * Muestra un tooltip de ayuda sutil cuando se detectan señales.
 */

/** @type {RegExp[]} */
const FRUSTRATION_PATTERNS = [
  /\b(wtf|damn|ugh|stupid|broken|hate|mierda|roto|odio|no funciona|no anda|no sirve)\b/i,
  /!{3,}/,
  /\.{4,}/,
  /\?{2,}/,
];

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isFrustrated(text) {
  return FRUSTRATION_PATTERNS.some((p) => p.test(text));
}

/**
 * Adjunta detección a todos los inputs de búsqueda dentro de root.
 * @param {HTMLElement} root
 */
export function attachFrustrationDetection(root) {
  root.querySelectorAll('input[type="search"], textarea').forEach((el) => {
    el.addEventListener('input', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      if (!isFrustrated(target.value)) return;
      showHelpTip(target);
    });
  });
}

/** @param {HTMLInputElement} el */
function showHelpTip(el) {
  if (el.dataset.kairosHelp) return;
  el.dataset.kairosHelp = '1';

  const tip = document.createElement('div');
  tip.style.cssText =
    'font-size:0.78rem;color:#a5b4fc;margin-top:0.3rem;padding:0.25rem 0.5rem;' +
    'background:rgba(99,102,241,0.1);border-radius:4px;border-left:2px solid #6366f1;';
  tip.textContent = '¿No encontrás lo que buscás? Probá términos más cortos o filtrá por etapa.';
  el.parentElement?.insertAdjacentElement('beforeend', tip);

  setTimeout(() => {
    tip.remove();
    delete el.dataset.kairosHelp;
  }, 4000);
}
