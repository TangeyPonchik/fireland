'use strict';
/* ============================================================
   textures.js — все генераторы текстур и звуков
   Требует: window.THREE (загружен до этого файла)
   ============================================================ */
(function () {
  const THREE = window.THREE;

  /* ============================================================
     УТИЛИТЫ
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

  const makeCanvas = s => { const c = document.createElement('canvas'); c.width = c.height = s; return c; };

  function texFromCanvas(c, srgb = false, rep = 1) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    t.repeat.set(rep, rep);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function heightToNormal(hCanvas, strength = 1.5) {
    const w = hCanvas.width, h = hCanvas.height;
    const src = hCanvas.getContext('2d').getImageData(0, 0, w, h).data;
    const out = hCanvas.getContext('2d').createImageData(w, h);
    const getH = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (getH(x - 1, y) - getH(x + 1, y)) * strength * 4;
      const dy = (getH(x, y - 1) - getH(x, y + 1)) * strength * 4;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * w + x) * 4;
      out.data[i] = (dx / len * 0.5 + 0.5) * 255;
      out.data[i + 1] = (dy / len * 0.5 + 0.5) * 255;
      out.data[i + 2] = (1 / len * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
    const c = makeCanvas(w); c.getContext('2d').putImageData(out, 0, 0); return c;
  }

  const CACHE = new Map();
  function cache(key, factory) {
    if (CACHE.has(key)) return CACHE.get(key);
    const v = factory();
    CACHE.set(key, v);
    return v;
  }

  /* ============================================================
     ГЕНЕРАТОРЫ ТЕКСТУР
     ============================================================ */
  function createStone(size, tint) {
    return cache('stone_' + tint.join('_'), () => {
      const N = makeNoise(42);
      const cC = makeCanvas(size), hC = makeCanvas(size), rC = makeCanvas(size);
      const cc = cC.getContext('2d'), hc = hC.getContext('2d'), rc = rC.getContext('2d');
      const cI = cc.createImageData(size, size), hI = hc.createImageData(size, size), rI = rc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4, nx = x / size, ny = y / size;
        const base = N.fbm(nx * 3, ny * 3, 5, 0.55, 2.1);
        const detail = N.fbm(nx * 20, ny * 20, 4, 0.5, 2);
        const grain = (Math.random() - 0.5) * 0.08;
        let v = 0.55 + base * 0.25 + detail * 0.12 + grain * 0.3;
        const blockY = Math.floor(ny * 8);
        const blockX = Math.floor(nx * 8 + (blockY % 2) * 0.5);
        const blockRand = mulberry32((blockX * 73856093) ^ (blockY * 19349663))() * 0.12 - 0.06;
        v += blockRand;
        const mortarY = Math.abs((ny * 8) % 1 - 0.5) < 0.03;
        const mortarX = Math.abs((nx * 8 + (blockY % 2) * 0.5) % 1 - 0.5) < 0.03;
        if (mortarY || mortarX) v *= 0.55;
        v = Math.max(0.1, Math.min(1, v));
        cI.data[i] = tint[0] * v; cI.data[i + 1] = tint[1] * v; cI.data[i + 2] = tint[2] * v; cI.data[i + 3] = 255;
        hI.data[i] = hI.data[i + 1] = hI.data[i + 2] = v * 255; hI.data[i + 3] = 255;
        rI.data[i] = rI.data[i + 1] = rI.data[i + 2] = Math.min(255, (0.7 + detail * 0.2 + grain * 0.4) * 255); rI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0); hc.putImageData(hI, 0, 0); rc.putImageData(rI, 0, 0);
      const rnd = mulberry32(7);
      for (let k = 0; k < 12; k++) {
        let x = rnd() * size, y = rnd() * size;
        cc.strokeStyle = 'rgba(30,30,30,0.4)'; cc.lineWidth = 1;
        cc.beginPath(); cc.moveTo(x, y);
        for (let j = 0; j < 15; j++) { x += (rnd() - 0.5) * 35; y += (rnd() - 0.5) * 35; cc.lineTo(x, y); }
        cc.stroke();
      }
      return { map: texFromCanvas(cC, true), normalMap: texFromCanvas(heightToNormal(hC, 1.2)), roughnessMap: texFromCanvas(rC) };
    });
  }

  function createMetal(size) {
    return cache('metal', () => {
      const N = makeNoise(123);
      const cC = makeCanvas(size), hC = makeCanvas(size), rC = makeCanvas(size);
      const cc = cC.getContext('2d'), hc = hC.getContext('2d'), rc = rC.getContext('2d');
      const cI = cc.createImageData(size, size), hI = hc.createImageData(size, size), rI = rc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4, nx = x / size, ny = y / size;
        const brushed = N.perlin(nx * 400, ny * 8) * 0.2;
        const patches = N.fbm(nx * 6, ny * 6, 4, 0.5, 2) * 0.3;
        const rust = Math.max(0, N.fbm(nx * 3 + 5, ny * 3 + 5, 3, 0.6, 2) - 0.15);
        let r = 0.4 + patches * 0.3 + brushed, g = 0.42 + patches * 0.3 + brushed, b = 0.45 + patches * 0.3 + brushed;
        if (rust > 0) { const s = Math.min(1, rust * 2.5); r = r * (1 - s) + 0.55 * s; g = g * (1 - s) + 0.22 * s; b = b * (1 - s) + 0.08 * s; }
        cI.data[i] = Math.min(255, r * 255); cI.data[i + 1] = Math.min(255, g * 255); cI.data[i + 2] = Math.min(255, b * 255); cI.data[i + 3] = 255;
        const hv = (0.5 + brushed * 2 - rust * 0.4) * 255;
        hI.data[i] = hI.data[i + 1] = hI.data[i + 2] = hv; hI.data[i + 3] = 255;
        const ro = (0.25 + rust * 0.6 + Math.random() * 0.05) * 255;
        rI.data[i] = rI.data[i + 1] = rI.data[i + 2] = ro; rI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0); hc.putImageData(hI, 0, 0); rc.putImageData(rI, 0, 0);
      return { map: texFromCanvas(cC, true), normalMap: texFromCanvas(heightToNormal(hC, 1.0)), roughnessMap: texFromCanvas(rC) };
    });
  }

  function createWood(size) {
    return cache('wood', () => {
      const N = makeNoise(777);
      const cC = makeCanvas(size), hC = makeCanvas(size);
      const cc = cC.getContext('2d'), hc = hC.getContext('2d');
      const cI = cc.createImageData(size, size), hI = hc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4, nx = x / size * 4, ny = y / size * 4;
        const grain = N.fbm(nx * 1, ny * 20, 4, 0.6, 2);
        const rings = Math.sin((nx * 3 + grain * 3) * 20) * 0.5 + 0.5;
        const knot = N.fbm(nx * 4, ny * 4, 2, 0.5, 2);
        let v = 0.45 + rings * 0.2 + grain * 0.15;
        const line = Math.pow(Math.abs(Math.sin(nx * 20 + grain * 8)), 8);
        v -= line * 0.25;
        if (knot > 0.3) v -= (knot - 0.3) * 0.5;
        v = Math.max(0.1, Math.min(1, v));
        cI.data[i] = 140 * v + 30; cI.data[i + 1] = 90 * v + 20; cI.data[i + 2] = 50 * v + 10; cI.data[i + 3] = 255;
        hI.data[i] = hI.data[i + 1] = hI.data[i + 2] = v * 255; hI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0); hc.putImageData(hI, 0, 0);
      return { map: texFromCanvas(cC, true), normalMap: texFromCanvas(heightToNormal(hC, 0.8)) };
    });
  }

  function createSand(size, tint) {
    return cache('sand_' + tint.join('_'), () => {
      const N = makeNoise(555);
      const cC = makeCanvas(size), hC = makeCanvas(size);
      const cc = cC.getContext('2d'), hc = hC.getContext('2d');
      const cI = cc.createImageData(size, size), hI = hc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const nx = x / size * 4, ny = y / size * 4;
        const base = N.fbm(nx, ny, 4, 0.5, 2);
        const detail = N.fbm(nx * 12, ny * 12, 3, 0.5, 2);
        const v = 0.7 + base * 0.15 + detail * 0.1 + (Math.random() - 0.5) * 0.05;
        cI.data[i] = Math.min(255, tint[0] * v);
        cI.data[i + 1] = Math.min(255, tint[1] * v);
        cI.data[i + 2] = Math.min(255, tint[2] * v);
        cI.data[i + 3] = 255;
        hI.data[i] = hI.data[i + 1] = hI.data[i + 2] = v * 255; hI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0); hc.putImageData(hI, 0, 0);
      return { map: texFromCanvas(cC, true, 12), normalMap: texFromCanvas(heightToNormal(hC, 0.4), false, 12) };
    });
  }

  function createLava(size) {
    return cache('lava', () => {
      const N = makeNoise(999);
      const cC = makeCanvas(size);
      const cc = cC.getContext('2d');
      const cI = cc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const nx = x / size * 6, ny = y / size * 6;
        const v = N.fbm(nx, ny, 5, 0.6, 2);
        const heat = Math.max(0, Math.min(1, 0.5 + v));
        cI.data[i] = 255 * heat;
        cI.data[i + 1] = 100 * heat * heat;
        cI.data[i + 2] = 30 * heat * heat * heat;
        cI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0);
      return { map: texFromCanvas(cC, true, 6) };
    });
  }

  function createBulletHoleTex() {
    return cache('bullethole', () => {
      const size = 64, c = makeCanvas(size), ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
      g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(0.3, 'rgba(20,15,10,.9)');
      g.addColorStop(0.6, 'rgba(40,30,20,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    });
  }

  /* ============================================================
     ЗВУК
     ============================================================ */
  let AC;
  function ensureAudio() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); }
  function makeNoiseBuf(dur) { const n = Math.floor(AC.sampleRate * dur); const buf = AC.createBuffer(1, n, AC.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return buf; }

  function sndShot(variant = 'rifle') {
    ensureAudio(); const now = AC.currentTime;
    const P = { pistol:{crack:0.10,hi:1200,low:120,g:0.30,tail:0.20}, rifle:{crack:0.14,hi:900,low:80,g:0.42,tail:0.35}, smg:{crack:0.08,hi:1500,low:150,g:0.26,tail:0.15}, shotgun:{crack:0.26,hi:600,low:55,g:0.65,tail:0.55}, sniper:{crack:0.30,hi:500,low:40,g:0.80,tail:0.80}, knife:{crack:0.05,hi:4000,low:400,g:0.20,tail:0.10}, lmg:{crack:0.18,hi:800,low:70,g:0.5,tail:0.4} }[variant] || {crack:0.14,hi:900,low:80,g:0.42,tail:0.35};
    const nb = makeNoiseBuf(P.crack); const ns = AC.createBufferSource(); ns.buffer = nb;
    const nf = AC.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = P.hi;
    const ng = AC.createGain(); ng.gain.setValueAtTime(P.g, now); ng.gain.exponentialRampToValueAtTime(0.001, now + P.crack);
    ns.connect(nf); nf.connect(ng); ng.connect(AC.destination); ns.start(now);
    const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(P.low * 2.2, now); o.frequency.exponentialRampToValueAtTime(P.low, now + 0.16);
    const og = AC.createGain(); og.gain.setValueAtTime(P.g * 1.1, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    o.connect(og); og.connect(AC.destination); o.start(now); o.stop(now + 0.18);
    const tb = makeNoiseBuf(P.tail); const ts = AC.createBufferSource(); ts.buffer = tb;
    const tf = AC.createBiquadFilter(); tf.type = 'lowpass'; tf.frequency.setValueAtTime(600, now); tf.frequency.exponentialRampToValueAtTime(180, now + P.tail);
    const tg = AC.createGain(); tg.gain.setValueAtTime(P.g * 0.4, now); tg.gain.exponentialRampToValueAtTime(0.001, now + P.tail);
    ts.connect(tf); tf.connect(tg); tg.connect(AC.destination); ts.start(now);
  }
  function sndStep(muffle = false) { ensureAudio(); const now = AC.currentTime; const buf = makeNoiseBuf(0.09); const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = muffle ? 180 : 420; const g = AC.createGain(); g.gain.setValueAtTime(muffle ? 0.04 : 0.09, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.09); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(now); }
  function sndHitmarker() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(1900, now); o.frequency.exponentialRampToValueAtTime(900, now + 0.04); const g = AC.createGain(); g.gain.setValueAtTime(0.10, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.05); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.05); }
  function sndReload() { ensureAudio(); const now = AC.currentTime; [0, 0.18, 0.35, 0.55].forEach((t, i) => { const buf = makeNoiseBuf(0.04); const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500 + i * 400; f.Q.value = 8; const g = AC.createGain(); g.gain.setValueAtTime(0.12, now + t); g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(now + t); }); }
  function sndHurt() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(320, now); o.frequency.exponentialRampToValueAtTime(140, now + 0.22); const g = AC.createGain(); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.26); }
  function sndExplosion() { ensureAudio(); const now = AC.currentTime; const buf = makeNoiseBuf(1.0); const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(800, now); f.frequency.exponentialRampToValueAtTime(40, now + 1.0); const g = AC.createGain(); g.gain.setValueAtTime(0.8, now); g.gain.exponentialRampToValueAtTime(0.001, now + 1.0); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(now); }
  function sndEnemyDeath() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(240, now); o.frequency.exponentialRampToValueAtTime(60, now + 0.4); const g = AC.createGain(); g.gain.setValueAtTime(0.13, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.4); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.45); }
  function sndEmpty() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(600, now); const g = AC.createGain(); g.gain.setValueAtTime(0.05, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.04); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.05); }
  function sndBuy() { ensureAudio(); const now = AC.currentTime; [0, 0.1].forEach((t, i) => { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(i ? 1200 : 800, now + t); o.frequency.exponentialRampToValueAtTime(i ? 1600 : 1000, now + t + 0.08); const g = AC.createGain(); g.gain.setValueAtTime(0.1, now + t); g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.1); o.connect(g); g.connect(AC.destination); o.start(now + t); o.stop(now + t + 0.1); }); }
  function sndPlant() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(400, now); o.frequency.setValueAtTime(800, now + 0.1); o.frequency.setValueAtTime(400, now + 0.2); const g = AC.createGain(); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.3); }

  /* ============================================================
     ЭКСПОРТ
     ============================================================ */
  window.CS = window.CS || {};
  window.CS.Textures = {
    createStone, createMetal, createWood, createSand, createLava, createBulletHoleTex,
    makeNoise, makeCanvas, texFromCanvas, heightToNormal, mulberry32
  };
  window.CS.Audio = {
    ensureAudio, sndShot, sndStep, sndHitmarker, sndReload, sndHurt,
    sndExplosion, sndEnemyDeath, sndEmpty, sndBuy, sndPlant
  };
})();