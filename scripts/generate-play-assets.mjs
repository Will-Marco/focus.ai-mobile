/**
 * Google Play uchun grafika: app icon (512×512) va feature graphic (1024×500).
 *
 * NEGA sof Node: mashinada raster vosita yo'q (sharp libvips'siz o'rnatildi), shuning
 * uchun `generate-ios-icons.mjs` dagi kabi zlib PNG encoder + supersampling ishlatiladi.
 * PNG encoder shu fayldan ataylab NUSXALANGAN: iOS skripti top-level'да ishga tushadi,
 * uni import qilish ikonlarni yon ta'sir sifatida qayta yozgan bo'lardi.
 *
 *   node scripts/generate-play-assets.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'play-assets');

// — Ember palitrasi (design/design-system.md bilan bir xil) —
const ESPRESSO = [0x12, 0x0c, 0x08];
const GRAD_FROM = [0xf2, 0xa2, 0x4c];
const GRAD_TO = [0xf2, 0x60, 0x3e];
const ON_BRAND = [0x1f, 0x14, 0x0b];
const AMBER = [0xf2, 0xa2, 0x4c];

const BOX = 0.68;
const BOX_RADIUS = 0.25;
const RING_OUTER = 0.175;
const RING_INNER = 0.0583;
const RING_STROKE = 0.0472;
const SS = 4;

function sdRoundRect(px, py, half, r) {
  const qx = Math.abs(px) - half + r;
  const qy = Math.abs(py) - half + r;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

/** Logo (gradient rounded-square + ikki konsentrik halqa) — markazi cx,cy, tomoni box. */
function logoAt(x, y, cx, cy, box) {
  const half = box / 2;
  const d = sdRoundRect(x - cx, y - cy, half, box * BOX_RADIUS);
  if (d >= 0) return null;
  const t = Math.min(1, Math.max(0, (x - (cx - half) + (y - (cy - half))) / (2 * box)));
  let rgb = [
    GRAD_FROM[0] + (GRAD_TO[0] - GRAD_FROM[0]) * t,
    GRAD_FROM[1] + (GRAD_TO[1] - GRAD_FROM[1]) * t,
    GRAD_FROM[2] + (GRAD_TO[2] - GRAD_FROM[2]) * t,
  ];
  const dist = Math.hypot(x - cx, y - cy);
  const sw = (box * RING_STROKE) / 2;
  if (Math.abs(dist - box * RING_OUTER) < sw || Math.abs(dist - box * RING_INNER) < sw) rgb = ON_BRAND;
  return rgb;
}

function mix(base, over, alpha) {
  return [
    base[0] + (over[0] - base[0]) * alpha,
    base[1] + (over[1] - base[1]) * alpha,
    base[2] + (over[2] - base[2]) * alpha,
  ];
}

/** App icon namunasi — kvadrat, to'liq fon (Play alfa-kanalni qabul qilmaydi). */
function sampleIcon(x, y, size) {
  const c = size / 2;
  return logoAt(x, y, c, c, size * BOX) ?? ESPRESSO;
}

/**
 * Feature graphic namunasi — 1024×500.
 * Chapда logo, o'ngда "progress halqasi" motivi (dekorativ), fonда issiq radial glow.
 */
function sampleFeature(x, y, w, h) {
  let rgb = ESPRESSO;

  // Issiq radial glow — logo orqasidan o'ngga tarqaladi.
  const gx = w * 0.28;
  const gy = h * 0.5;
  const gd = Math.hypot(x - gx, y - gy) / (w * 0.55);
  const glow = Math.max(0, 1 - gd * gd);
  rgb = mix(rgb, AMBER, glow * 0.16);

  // O'ngдаги ochiq halqa (ProgressRing motivi) — 300° yoy.
  const rx = w * 0.72;
  const ry = h * 0.5;
  const R = h * 0.34;
  const dist = Math.hypot(x - rx, y - ry);
  const stroke = h * 0.028;
  if (Math.abs(dist - R) < stroke) {
    const ang = (Math.atan2(y - ry, x - rx) * 180) / Math.PI; // -180..180
    const from = -215;
    const to = 85;
    const a = ang < from ? ang + 360 : ang;
    if (a >= from && a <= to) {
      const t = (a - from) / (to - from);
      rgb = mix(rgb, [
        GRAD_FROM[0] + (GRAD_TO[0] - GRAD_FROM[0]) * t,
        GRAD_FROM[1] + (GRAD_TO[1] - GRAD_FROM[1]) * t,
        GRAD_FROM[2] + (GRAD_TO[2] - GRAD_FROM[2]) * t,
      ], 0.92);
    } else {
      rgb = mix(rgb, AMBER, 0.1); // to'lmagan qism — zaif iz
    }
  }

  // Chapdagi logo.
  const logo = logoAt(x, y, w * 0.28, h * 0.5, h * 0.52);
  if (logo) rgb = logo;

  return rgb;
}

/** Supersampling bilan RGB bufer (alfasiz — Play talabi). */
function render(w, h, sampler) {
  const buf = Buffer.alloc(w * h * 3);
  const step = 1 / SS;
  const n = SS * SS;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [sr, sg, sb] = sampler(x + (sx + 0.5) * step, y + (sy + 0.5) * step);
          r += sr;
          g += sg;
          b += sb;
        }
      }
      const i = (y * w + x) * 3;
      buf[i] = Math.round(r / n);
      buf[i + 1] = Math.round(g / n);
      buf[i + 2] = Math.round(b / n);
    }
  }
  return buf;
}

// — Minimal PNG encoder (RGB, colorType 2) —
let TABLE = null;
function crc32(buf) {
  if (!TABLE) {
    TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      TABLE[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(rgb, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colorType: truecolor (alfasiz)
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0; // filter: none
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT, { recursive: true });

const icon = encodePng(render(512, 512, (x, y) => sampleIcon(x, y, 512)), 512, 512);
writeFileSync(resolve(OUT, 'icon-512.png'), icon);
console.log(`icon-512.png        512×512   ${(icon.length / 1024).toFixed(0)} KB`);

const feature = encodePng(render(1024, 500, (x, y) => sampleFeature(x, y, 1024, 500)), 1024, 500);
writeFileSync(resolve(OUT, 'feature-graphic.png'), feature);
console.log(`feature-graphic.png 1024×500  ${(feature.length / 1024).toFixed(0)} KB`);
