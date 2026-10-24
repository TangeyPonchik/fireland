const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'textures');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

/* ============================================================
   УТИЛИТЫ (тот же Perlin, что в игре)
   ============================================================ */
const mulberry32 = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

function makeNoise(seed) {
  const rand = mulberry32(seed);
  const p = new Uint8Array(256); for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  const perm = new Uint8Array(512); for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const grad = (h, x, y) => { const g = h & 3, u = g < 2 ? x : y, v = g < 2 ? y : x; return ((g & 1) ? -u : u) + ((g & 2) ? -2 * v : 2 * v); };
  const perlin = (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1], ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v);
  };
  return { perlin, fbm(x, y, oct = 4, pers = 0.5, lac = 2) { let t = 0, f = 1, a = 1, m = 0; for (let i = 0; i < oct; i++) { t += perlin(x * f, y * f) * a; m += a; a *= pers; f *= lac; } return t / m; } };
}

/* ============================================================
   ГЕНЕРАТОРЫ
   ============================================================ */
function saveJPG(canvas, name, quality = 92) {
  const buf = canvas.toBuffer('image/jpeg', { quality });
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log('  ✓', name, '(' + (buf.length / 1024).toFixed(1) + ' KB)');
}
function savePNG(canvas, name) {
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log('  ✓', name, '(' + (buf.length / 1024).toFixed(1) + ' KB)');
}

function genStone(size, tint, name) {
  console.log('Генерация', name);
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const N = makeNoise(42);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const nx = x / size, ny = y / size;
    const base = N.fbm(nx * 3, ny * 3, 4, 0.5, 2.1);
    const detail = N.fbm(nx * 16, ny * 16, 3, 0.5, 2);
    const grain = (Math.random() - 0.5) * 0.06;
    let v = 0.72 + base * 0.14 + detail * 0.06 + grain;
    v = Math.max(0.5, Math.min(1, v));
    img.data[i] = tint[0] * v;
    img.data[i + 1] = tint[1] * v;
    img.data[i + 2] = tint[2] * v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // тонкие трещины
  const rnd = mulberry32(7);
  for (let k = 0; k < 8; k++) {
    let x = rnd() * size, y = rnd() * size;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let j = 0; j < 10; j++) { x += (rnd() - 0.5) * 30; y += (rnd() - 0.5) * 30; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  saveJPG(c, name);
}

function genMetal(size, name) {
  console.log('Генерация', name);
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const N = makeNoise(123);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const nx = x / size, ny = y / size;
    const brushed = N.perlin(nx * 400, ny * 8) * 0.15;
    const patches = N.fbm(nx * 6, ny * 6, 4, 0.5, 2) * 0.3;
    const rust = Math.max(0, N.fbm(nx * 3 + 5, ny * 3 + 5, 3, 0.6, 2) - 0.15);
    let r = 0.55 + patches * 0.3 + brushed, g = 0.57 + patches * 0.3 + brushed, b = 0.6 + patches * 0.3 + brushed;
    if (rust > 0) { const s = Math.min(1, rust * 2.5); r = r * (1 - s) + 0.55 * s; g = g * (1 - s) + 0.22 * s; b = b * (1 - s) + 0.08 * s; }
    img.data[i] = Math.min(255, r * 255);
    img.data[i + 1] = Math.min(255, g * 255);
    img.data[i + 2] = Math.min(255, b * 255);
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  saveJPG(c, name);
}

function genWood(size, name) {
  console.log('Генерация', name);
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const N = makeNoise(777);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const nx = x / size * 4, ny = y / size * 4;
    const grain = N.fbm(nx * 1, ny * 20, 4, 0.6, 2);
    const rings = Math.sin((nx * 3 + grain * 3) * 20) * 0.5 + 0.5;
    let v = 0.55 + rings * 0.2 + grain * 0.15;
    v = Math.max(0.2, Math.min(1, v));
    img.data[i] = 160 * v + 30;
    img.data[i + 1] = 110 * v + 20;
    img.data[i + 2] = 70 * v + 10;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  saveJPG(c, name);
}

function genSand(size, tint, name) {
  console.log('Генерация', name);
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const N = makeNoise(555);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const nx = x / size * 4, ny = y / size * 4;
    const base = N.fbm(nx, ny, 3, 0.5, 2);
    const grain = (Math.random() - 0.5) * 0.08;
    const v = 0.82 + base * 0.08 + grain;
    img.data[i] = Math.min(255, tint[0] * v);
    img.data[i + 1] = Math.min(255, tint[1] * v);
    img.data[i + 2] = Math.min(255, tint[2] * v);
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  saveJPG(c, name);
}

function genLava(size, name) {
  console.log('Генерация', name);
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const N = makeNoise(999);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const nx = x / size * 6, ny = y / size * 6;
    const v = N.fbm(nx, ny, 5, 0.6, 2);
    const heat = Math.max(0, Math.min(1, 0.5 + v));
    img.data[i] = 255 * heat;
    img.data[i + 1] = 100 * heat * heat;
    img.data[i + 2] = 30 * heat * heat * heat;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  saveJPG(c, name);
}

function genBulletHole(size, name) {
  console.log('Генерация', name);
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
  g.addColorStop(0, 'rgba(0,0,0,0.95)');
  g.addColorStop(0.3, 'rgba(20,15,10,0.9)');
  g.addColorStop(0.6, 'rgba(40,30,20,0.5)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  savePNG(c, name);
}

/* ============================================================
   ЗАПУСК
   ============================================================ */
const t0 = Date.now();
console.log('Генерация текстур в', OUT);
genStone(512, [180, 175, 165], 'stone.jpg');
genStone(512, [110, 105, 100], 'stone-dark.jpg');
genMetal(512, 'metal.jpg');
genWood(512, 'wood.jpg');
genSand(512, [210, 190, 145], 'sand.jpg');
genSand(512, [210, 130, 100], 'sand-red.jpg');
genLava(512, 'lava.jpg');
genBulletHole(64, 'bullet-hole.png');
console.log(`\n✓ Готово за ${Date.now() - t0} мс. Файлы в: ${OUT}`);