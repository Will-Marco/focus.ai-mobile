/**
 * iOS app icon + launch logo generatori — bog'liqliksiz (faqat Node stdlib).
 *
 * Manba: android/app/src/main/res/drawable/ic_launcher_{background,foreground}.xml
 * kompozitsiyasi (Login hero logo): espresso fon + gradient rounded-square + qora target.
 * Nisbatlar Android VectorDrawable'dan (viewport 108, logo box 72) ko'chirildi.
 *
 * Nega sof JS: mashinada raster vosita yo'q (sharp/librsvg/magick), va icon
 * geometriyasi oddiy — SDF + supersampling bilan aniq chiziladi.
 *
 *   node scripts/generate-ios-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// — Brend tokenlari (Ember) —
const ESPRESSO = [0x12, 0x0c, 0x08]; // fon
const GRAD_FROM = [0xf2, 0xa2, 0x4c]; // gradient boshi (yuqori-chap)
const GRAD_TO = [0xf2, 0x60, 0x3e]; // gradient oxiri (past-o'ng)
const ON_BRAND = [0x1f, 0x14, 0x0b]; // target chizig'i

// — Nisbatlar (canvas kengligiga ko'ra) —
// Android'da logo box 72/108 = 0.667, lekin u adaptive niqob ostida kesiladi.
// iOS'da butun kvadrat ko'rinadi → to'q ramka ataylab qoldiriladi.
const BOX = 0.68; // gradient kvadrat tomoni
const BOX_RADIUS = 0.25; // burchak radiusi (box tomoniga nisbatan) — 18/72
const RING_OUTER = 0.175; // tashqi halqa radiusi — 12.6/72
const RING_INNER = 0.0583; // ichki halqa radiusi — 4.2/72
const RING_STROKE = 0.0472; // chiziq qalinligi — 3.4/72

const SS = 4; // supersampling (4x4 = 16 namuna/piksel)

/** Rounded-rect signed distance (markazga nisbatan). <0 → ichkarida. */
function sdRoundRect(px, py, half, r) {
  const qx = Math.abs(px) - (half - r);
  const qy = Math.abs(py) - (half - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * Bitta namuna uchun rang. `alpha=false` bo'lsa fon espresso (icon uchun —
 * App Store 1024 alpha-kanalsiz bo'lishi SHART).
 */
function sample(x, y, size, withBackground) {
  const cx = size / 2;
  const cy = size / 2;
  const box = size * BOX;
  const half = box / 2;

  let rgb = withBackground ? ESPRESSO : null;
  let a = withBackground ? 1 : 0;

  // Gradient rounded-square
  const d = sdRoundRect(x - cx, y - cy, half, box * BOX_RADIUS);
  if (d < 0) {
    // Diagonal gradient — kvadratning yuqori-chap → past-o'ng burchagi
    const t = Math.min(1, Math.max(0, (x - (cx - half) + (y - (cy - half))) / (2 * box)));
    rgb = [
      GRAD_FROM[0] + (GRAD_TO[0] - GRAD_FROM[0]) * t,
      GRAD_FROM[1] + (GRAD_TO[1] - GRAD_FROM[1]) * t,
      GRAD_FROM[2] + (GRAD_TO[2] - GRAD_FROM[2]) * t,
    ];
    a = 1;
  }

  // Target — ikki konsentrik halqa (faqat gradient ustida)
  if (a > 0) {
    const dist = Math.hypot(x - cx, y - cy);
    const sw = (box * RING_STROKE) / 2;
    const onOuter = Math.abs(dist - box * RING_OUTER) < sw;
    const onInner = Math.abs(dist - box * RING_INNER) < sw;
    if (onOuter || onInner) rgb = ON_BRAND;
  }

  return rgb ? [rgb[0], rgb[1], rgb[2], a] : [0, 0, 0, 0];
}

/** Supersampling bilan RGBA bufer chizadi. */
function render(size, withBackground) {
  const buf = Buffer.alloc(size * size * 4);
  const step = 1 / SS;
  const n = SS * SS;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [sr, sg, sb, sa] = sample(
            x + (sx + 0.5) * step,
            y + (sy + 0.5) * step,
            size,
            withBackground,
          );
          r += sr * sa;
          g += sg * sa;
          b += sb * sa;
          a += sa;
        }
      }
      const i = (y * size + x) * 4;
      // Premultiplied yig'indini qaytarib bo'lamiz (alpha 0 bo'lsa qora)
      buf[i] = a > 0 ? Math.round(r / a) : 0;
      buf[i + 1] = a > 0 ? Math.round(g / a) : 0;
      buf[i + 2] = a > 0 ? Math.round(b / a) : 0;
      buf[i + 3] = Math.round((a / n) * 255);
    }
  }
  return buf;
}

// — Minimal PNG encoder —
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** colorType: 6 = RGBA, 2 = RGB (alpha'siz — App Store marketing icon uchun). */
function encodePng(rgba, size, colorType) {
  const channels = colorType === 6 ? 4 : 3;
  const raw = Buffer.alloc(size * (size * channels + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      raw[p++] = rgba[i];
      raw[p++] = rgba[i + 1];
      raw[p++] = rgba[i + 2];
      if (channels === 4) raw[p++] = rgba[i + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = colorType;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function write(path, buf) {
  const full = resolve(ROOT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, buf);
  console.log(`  ✓ ${path} (${(buf.length / 1024).toFixed(1)} KB)`);
}

const ICONSET = 'ios/FocusAI/Images.xcassets/AppIcon.appiconset';
const LOGOSET = 'ios/FocusAI/Images.xcassets/BrandLogo.imageset';

console.log('iOS asset generatsiyasi:');

// 1) App icon — 1024, ALPHA'SIZ (colorType 2). App Store Connect talabi.
write(`${ICONSET}/icon-1024.png`, encodePng(render(1024, true), 1024, 2));

// Xcode 14+ bitta o'lcham yetarli — qolganini o'zi hosil qiladi.
write(
  `${ICONSET}/Contents.json`,
  Buffer.from(
    JSON.stringify(
      {
        images: [{ filename: 'icon-1024.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
        info: { author: 'xcode', version: 1 },
      },
      null,
      2,
    ) + '\n',
  ),
);

// 2) LaunchScreen logo — shaffof fon (storyboard espresso fon ustiga qo'yadi).
for (const [scale, px] of [
  ['1x', 240],
  ['2x', 480],
  ['3x', 720],
]) {
  write(`${LOGOSET}/brand-logo@${scale}.png`, encodePng(render(px, false), px, 6));
}

write(
  `${LOGOSET}/Contents.json`,
  Buffer.from(
    JSON.stringify(
      {
        images: [
          { filename: 'brand-logo@1x.png', idiom: 'universal', scale: '1x' },
          { filename: 'brand-logo@2x.png', idiom: 'universal', scale: '2x' },
          { filename: 'brand-logo@3x.png', idiom: 'universal', scale: '3x' },
        ],
        info: { author: 'xcode', version: 1 },
      },
      null,
      2,
    ) + '\n',
  ),
);

console.log('Tayyor.');
