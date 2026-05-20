/**
 * Smart Search — búsqueda fuzzy mejorada con scoring y resaltado
 * @module smart-search
 */

export function fuzzyScore(query, text) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return 1;

  let qi = 0, score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) { score++; qi++; }
  }
  return qi === q.length ? score / t.length : 0;
}

export function highlight(text, query) {
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark style="background:#312e81;color:#a5b4fc;border-radius:2px">$1</mark>');
}

/**
 * @param {string} query
 * @param {Array<{text: string, data: unknown}>} items
 * @param {number} threshold  min score (0-1)
 */
export function smartSearch(query, items, threshold = 0.1) {
  if (!query.trim()) return items.map(i => ({ ...i, score: 1 }));
  return items
    .map(item => ({ ...item, score: fuzzyScore(query, item.text) }))
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

export function initSmartSearch(inputId, renderFn, getItems) {
  const input = document.getElementById(inputId);
  if (!input) return;

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const results = smartSearch(input.value, getItems());
      renderFn(results, input.value);
    }, 150);
  });
}
