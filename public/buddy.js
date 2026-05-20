/**
 * Buddy — mascota IA con 18 especies y 6 niveles de rareza.
 * Basado en el sistema Buddy filtrado del source map de Claude Code v2.1.88.
 *
 * Especies: duck, goose, blob, cat, dragon, octopus, owl, penguin,
 *           turtle, snail, ghost, axolotl, capybara, cactus, robot,
 *           rabbit, mushroom, chonk
 *
 * Rarezas (acumulativas):
 *   Shiny     1%  — borde dorado + glow animado
 *   Legendary 1%  — borde naranja
 *   Epic      4%  — borde púrpura
 *   Rare      10% — borde azul
 *   Uncommon  25% — borde verde
 *   Common    60% — borde gris
 */

import { getFlags } from './flags.js';

const SPECIES = {
  duck:     { emoji: '🦆', name: 'Duck' },
  goose:    { emoji: '🪶', name: 'Goose' },
  blob:     { emoji: '🪷', name: 'Blob' },
  cat:      { emoji: '🐱', name: 'Cat' },
  dragon:   { emoji: '🐉', name: 'Dragon' },
  octopus:  { emoji: '🐙', name: 'Octopus' },
  owl:      { emoji: '🦉', name: 'Owl' },
  penguin:  { emoji: '🐧', name: 'Penguin' },
  turtle:   { emoji: '🐢', name: 'Turtle' },
  snail:    { emoji: '🐌', name: 'Snail' },
  ghost:    { emoji: '👻', name: 'Ghost' },
  axolotl:  { emoji: '🦎', name: 'Axolotl' },
  capybara: { emoji: '🪶', name: 'Capybara' },
  cactus:   { emoji: '🌵', name: 'Cactus' },
  robot:    { emoji: '🤖', name: 'Robot' },
  rabbit:   { emoji: '🐰', name: 'Rabbit' },
  mushroom: { emoji: '🍄', name: 'Mushroom' },
  chonk:    { emoji: '😺', name: 'Chonk' },
};

/** @type {Array<{name: string, chance: number, color: string, animation: string}>} */
const RARITIES = [
  { name: 'shiny',     chance: 0.01, color: '#ffd700', animation: 'buddyShine 1.5s ease-in-out infinite' },
  { name: 'legendary', chance: 0.01, color: '#ff6b35', animation: 'buddyBob 1.8s ease-in-out infinite' },
  { name: 'epic',      chance: 0.04, color: '#9b59b6', animation: 'buddyBob 2s ease-in-out infinite' },
  { name: 'rare',      chance: 0.10, color: '#3498db', animation: 'buddyBob 2.2s ease-in-out infinite' },
  { name: 'uncommon',  chance: 0.25, color: '#2ecc71', animation: 'buddyBob 2.5s ease-in-out infinite' },
  { name: 'common',    chance: 0.60, color: '#6b7280', animation: 'buddyBob 3s ease-in-out infinite' },
];

const TIPS = [
  'Probá el Master Prompt para afilar cualquier idea en 5 preguntas.',
  'KAIROS consolidó tu memoria. Todo va bien.',
  'Coordinator optimizó el dashboard en segundo plano.',
  'Filtrá por etapa para encontrar lo que buscás más rápido.',
  'Clic en mí para ver un tip aleatorio.',
  'Descargá todos los prompts con el botón de la pestaña Prompts.',
  'Los skills activos se disparan solos en Claude Code.',
  '¿Sabías que tengo rareza? Verificá mi nombre al hacer hover.',
  'Buddy contigo desde que abriste esta pestaña.',
];

const STORAGE_KEY = 'buddy:state';

function rollRarity() {
  const r = Math.random();
  let acc = 0;
  for (const rarity of RARITIES) {
    acc += rarity.chance;
    if (r < acc) return rarity;
  }
  return RARITIES[RARITIES.length - 1];
}

function rollSpecies() {
  const keys = Object.keys(SPECIES);
  return keys[Math.floor(Math.random() * keys.length)];
}

function loadOrCreate() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const speciesKey = rollSpecies();
  const rarity = rollRarity();
  const state = { speciesKey, rarityName: rarity.name, discoveredAt: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  return state;
}

export function initBuddy() {
  const flags = getFlags();
  if (!flags.BUDDY_ENABLED) return;

  const state = loadOrCreate();
  const species = SPECIES[state.speciesKey] ?? SPECIES.cat;
  const rarity = RARITIES.find((r) => r.name === state.rarityName) ?? RARITIES[RARITIES.length - 1];

  // Inyectar CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes buddyBob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    @keyframes buddyShine { 0%,100%{filter:drop-shadow(0 0 6px ${rarity.color})} 50%{filter:drop-shadow(0 0 14px ${rarity.color})} }
    #buddy-avatar { animation: ${rarity.animation}; cursor:pointer; font-size:2.2rem; line-height:1; display:block }
    #buddy-bubble {
      background:rgba(10,10,18,.96); border:1px solid ${rarity.color};
      border-radius:10px 10px 2px 10px; padding:.45rem .7rem;
      font-size:.72rem; color:#e2e8f0; max-width:190px; text-align:right;
      opacity:0; transition:opacity .4s ease; line-height:1.45;
    }
    #buddy-badge {
      font-size:.6rem; color:${rarity.color}; text-transform:uppercase;
      letter-spacing:.05em; text-align:right; opacity:.7;
    }
  `;
  document.head.appendChild(style);

  // Contenedor
  const wrap = document.createElement('div');
  wrap.id = 'buddy';
  wrap.style.cssText = 'position:fixed;bottom:1.25rem;right:1.25rem;z-index:999;display:flex;flex-direction:column;align-items:flex-end;gap:.3rem';

  const bubble = document.createElement('div');
  bubble.id = 'buddy-bubble';

  const badge = document.createElement('div');
  badge.id = 'buddy-badge';
  badge.textContent = `${species.name} · ${state.rarityName}`;

  const avatar = document.createElement('span');
  avatar.id = 'buddy-avatar';
  avatar.textContent = species.emoji;
  avatar.title = `${species.name} [${state.rarityName}] — descubierto ${new Date(state.discoveredAt).toLocaleDateString('es-AR')}`;

  wrap.appendChild(bubble);
  wrap.appendChild(badge);
  wrap.appendChild(avatar);
  document.body.appendChild(wrap);

  // Tips
  let idx = 0;
  const showTip = (text) => {
    bubble.textContent = text;
    bubble.style.opacity = '1';
    setTimeout(() => { bubble.style.opacity = '0'; }, 10_000);
  };
  setTimeout(() => showTip(TIPS[0]), 4000);
  setInterval(() => { showTip(TIPS[++idx % TIPS.length]); }, 50_000);

  avatar.addEventListener('click', () => showTip(TIPS[Math.floor(Math.random() * TIPS.length)]));

  console.debug(`[BUDDY] ${species.name} (${state.rarityName}) inicializado`);
}
