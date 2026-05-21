import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Sirve la landing de Estudio Oro desde el repo publico stack-ia-creador.
// Cache 5 min en memoria de la edge function.

const SOURCE = "https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/oro/index.html";
const TTL_MS = 5 * 60 * 1000;

let cached: string | null = null;
let cachedAt = 0;

async function getHTML(): Promise<string> {
  const now = Date.now();
  if (cached && (now - cachedAt) < TTL_MS) return cached;
  const r = await fetch(SOURCE, { headers: { "User-Agent": "estudiooro-edge" } });
  if (!r.ok) throw new Error("Failed to fetch HTML: " + r.status);
  cached = await r.text();
  cachedAt = now;
  return cached;
}

Deno.serve(async (req: Request) => {
  try {
    const html = await getHTML();
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload"
      }
    });
  } catch (e) {
    return new Response("Error loading landing: " + (e instanceof Error ? e.message : String(e)), {
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
});
