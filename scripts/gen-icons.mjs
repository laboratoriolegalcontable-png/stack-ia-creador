#!/usr/bin/env node
// gen-icons.mjs - genera iconos PNG basicos para PWA sin dependencias externas.
// Solid-color cuadrado con un patron geometrico minimal de marca.
// Output: public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png

import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Genera PNG: fondo negro + 6 cuadrados blancos en grid 3x2 (representa las 6 herramientas)
function makeIcon(size) {
  const bg = [10, 10, 10];     // #0a0a0a casi negro
  const fg = [250, 250, 249];  // #fafaf9 casi blanco

  // Grid 3x2 de cuadrados con padding
  const padding = Math.floor(size * 0.18);
  const inner = size - padding * 2;
  const cols = 3, rows = 2;
  const gap = Math.floor(size * 0.04);
  const cellW = Math.floor((inner - gap * (cols - 1)) / cols);
  const cellH = Math.floor((inner - gap * (rows - 1)) / rows);

  // Crear pixels
  const px = new Uint8Array(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    px[i * 3] = bg[0];
    px[i * 3 + 1] = bg[1];
    px[i * 3 + 2] = bg[2];
  }

  // Dibujar 6 cuadrados
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = padding + c * (cellW + gap);
      const y0 = padding + r * (cellH + gap);
      for (let y = y0; y < y0 + cellH && y < size; y++) {
        for (let x = x0; x < x0 + cellW && x < size; x++) {
          const i = (y * size + x) * 3;
          px[i] = fg[0]; px[i + 1] = fg[1]; px[i + 2] = fg[2];
        }
      }
    }
  }

  // Construir scanlines con filter byte = 0
  const rowBytes = size * 3;
  const raw = Buffer.alloc(size * (rowBytes + 1));
  for (let y = 0; y < size; y++) {
    const off = y * (rowBytes + 1);
    raw[off] = 0; // filter: none
    for (let x = 0; x < rowBytes; x++) raw[off + 1 + x] = px[y * rowBytes + x];
  }
  const idat = deflateSync(raw);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

writeFileSync(join(PUBLIC, "icon-192.png"), makeIcon(192));
writeFileSync(join(PUBLIC, "icon-512.png"), makeIcon(512));
writeFileSync(join(PUBLIC, "apple-touch-icon.png"), makeIcon(180));
console.log("[gen-icons] generados: icon-192.png, icon-512.png, apple-touch-icon.png");
