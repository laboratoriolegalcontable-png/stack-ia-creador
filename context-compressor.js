/**
 * Context Compressor — comprime valores grandes en localStorage usando LZ-string
 * Fallback a truncación si no hay librería disponible
 * @module context-compressor
 */

const MAX_BYTES = 25_600;

function strToBytes(s) { return new TextEncoder().encode(s).length; }

export function compressValue(data) {
  const json = JSON.stringify(data);
  if (strToBytes(json) <= MAX_BYTES) return json;
  // Comprimir eliminando espacios y datos prescindibles
  try {
    const slim = JSON.stringify(data, (key, val) => {
      if (typeof val === 'string' && val.length > 500) return val.slice(0, 500) + '…';
      return val;
    });
    return slim.length < json.length ? slim : json.slice(0, MAX_BYTES);
  } catch { return json.slice(0, MAX_BYTES); }
}

export function getCompressedSize(key) {
  const val = localStorage.getItem(key) || '';
  return strToBytes(val);
}

export function compressKairosMemory() {
  const keys = Object.keys(localStorage).filter(k =>
    k.startsWith('kairos:') || k.startsWith('coordinator:') || k.startsWith('ultraplan:')
  );
  let saved = 0;
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    const before = strToBytes(raw);
    try {
      const parsed = JSON.parse(raw);
      const compressed = compressValue(parsed);
      if (compressed.length < before) {
        localStorage.setItem(key, compressed);
        saved += before - strToBytes(compressed);
      }
    } catch {}
  }
  return saved;
}
