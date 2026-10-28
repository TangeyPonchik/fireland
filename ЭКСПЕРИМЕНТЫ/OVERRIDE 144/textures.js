'use strict';
/* ============================================================
   textures.js — ДРУГИЕ текстуры (не как в 77) + звуки + 3D-аудио
   Требует: window.THREE
   ============================================================ */
(function () {
  const THREE = window.THREE;

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
    const v = factory(); CACHE.set(key, v); return v;
  }

  /* ============================================================
     НОВЫЕ ТЕКСТУРЫ (не как в 77)
     ============================================================ */

  // SCI-FI PANEL — панели с рамками и болтами
  function createSciFiPanel(size) {
    return cache('scifi', () => {
      const N = makeNoise(111);
      const cC = makeCanvas(size), hC = makeCanvas(size), rC = makeCanvas(size);
      const cc = cC.getContext('2d'), hc = hC.getContext('2d'), rc = rC.getContext('2d');
      const cI = cc.createImageData(size, size), hI = hc.createImageData(size, size), rI = rc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4, nx = x / size, ny = y / size;
        const cells = 4;
        const cx = (nx * cells) % 1, cy = (ny * cells) % 1;
        const panelEdge = Math.min(cx, 1 - cx, cy, 1 - cy);
        const isEdge = panelEdge < 0.03;
        const boltR = Math.min(Math.hypot(cx - 0.12, cy - 0.12), Math.hypot(cx - 0.88, cy - 0.12), Math.hypot(cx - 0.12, cy - 0.88), Math.hypot(cx - 0.88, cy - 0.88));
        const isBolt = boltR < 0.03;
        const noise = N.fbm(nx * 8, ny * 8, 3, 0.5, 2) * 0.1;
        let v = 0.35 + noise;
        if (isEdge) v = 0.12;
        if (isBolt) v = 0.55;
        cI.data[i] = v * 200; cI.data[i + 1] = v * 210; cI.data[i + 2] = v * 220; cI.data[i + 3] = 255;
        hI.data[i] = hI.data[i + 1] = hI.data[i + 2] = (isEdge ? 0.2 : isBolt ? 0.9 : v) * 255; hI.data[i + 3] = 255;
        rI.data[i] = rI.data[i + 1] = rI.data[i + 2] = (0.4 + noise * 2) * 255; rI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0); hc.putImageData(hI, 0, 0); rc.putImageData(rI, 0, 0);
      return { map: texFromCanvas(cC, true), normalMap: texFromCanvas(heightToNormal(hC, 1.4)), roughnessMap: texFromCanvas(rC) };
    });
  }

  // NEON GRID — тёмная поверхность с неоновой сеткой
  function createNeonGrid(size, color) {
    return cache('neon_' + color, () => {
      const N = makeNoise(222);
      const cC = makeCanvas(size);
      const cc = cC.getContext('2d');
      cc.fillStyle = '#050508'; cc.fillRect(0, 0, size, size);
      const cI = cc.getImageData(0, 0, size, size);
      const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4, nx = x / size, ny = y / size;
        const n = N.fbm(nx * 6, ny * 6, 4, 0.5, 2);
        const gridX = Math.abs((nx * 16) % 1 - 0.5) < 0.02;
        const gridY = Math.abs((ny * 16) % 1 - 0.5) < 0.02;
        let v = 0.08 + n * 0.05;
        if (gridX || gridY) { v = 0.9; }
        cI.data[i] = Math.min(255, r * v + 8);
        cI.data[i + 1] = Math.min(255, g * v + 8);
        cI.data[i + 2] = Math.min(255, b * v + 8);
        cI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0);
      return { map: texFromCanvas(cC, true) };
    });
  }

  // RUSTED METAL 2.0 — более агрессивная ржавчина
  function createRustMetal(size) {
    return cache('rustmetal', () => {
      const N = makeNoise(333);
      const cC = makeCanvas(size), hC = makeCanvas(size), rC = makeCanvas(size);
      const cc = cC.getContext('2d'), hc = hC.getContext('2d'), rc = rC.getContext('2d');
      const cI = cc.createImageData(size, size), hI = hc.createImageData(size, size), rI = rc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4, nx = x / size, ny = y / size;
        const base = N.fbm(nx * 4, ny * 4, 4, 0.55, 2);
        const rust = Math.max(0, N.fbm(nx * 8 + 3, ny * 8 + 3, 3, 0.6, 2) - 0.05);
        const scratch = Math.abs(N.perlin(nx * 200, ny * 4)) < 0.1 ? 0.15 : 0;
        let r = 0.32 + base * 0.15 + scratch, g = 0.35 + base * 0.15 + scratch, b = 0.38 + base * 0.15 + scratch;
        if (rust > 0.1) { const s = Math.min(1, rust * 2); r = r * (1 - s) + 0.65 * s; g = g * (1 - s) + 0.25 * s; b = b * (1 - s) + 0.05 * s; }
        cI.data[i] = Math.min(255, r * 255); cI.data[i + 1] = Math.min(255, g * 255); cI.data[i + 2] = Math.min(255, b * 255); cI.data[i + 3] = 255;
        hI.data[i] = hI.data[i + 1] = hI.data[i + 2] = (0.5 + base * 0.3 - rust * 0.3) * 255; hI.data[i + 3] = 255;
        rI.data[i] = rI.data[i + 1] = rI.data[i + 2] = (0.3 + rust * 0.6) * 255; rI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0); hc.putImageData(hI, 0, 0); rc.putImageData(rI, 0, 0);
      return { map: texFromCanvas(cC, true), normalMap: texFromCanvas(heightToNormal(hC, 1.2)), roughnessMap: texFromCanvas(rC) };
    });
  }

  // HOLO FLOOR — пол с голографическими линиями
  function createHoloFloor(size) {
    return cache('holo', () => {
      const N = makeNoise(444);
      const cC = makeCanvas(size);
      const cc = cC.getContext('2d');
      cc.fillStyle = '#020208'; cc.fillRect(0, 0, size, size);
      const cI = cc.getImageData(0, 0, size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4, nx = x / size, ny = y / size;
        const n = N.fbm(nx * 5, ny * 5, 4, 0.5, 2);
        const line1 = Math.abs((nx + ny * 0.5) % 1 - 0.5) < 0.01;
        const line2 = Math.abs((ny - nx * 0.3) % 1 - 0.5) < 0.008;
        let v = 0.05 + n * 0.04;
        if (line1 || line2) v = 0.85;
        cI.data[i] = v * 40; cI.data[i + 1] = v * 220; cI.data[i + 2] = v * 200; cI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0);
      return { map: texFromCanvas(cC, true, 4) };
    });
  }

  // SAND 2.0 — тёмный песок с трещинами
  function createDarkSand(size) {
    return cache('darksand', () => {
      const N = makeNoise(555);
      const cC = makeCanvas(size), hC = makeCanvas(size);
      const cc = cC.getContext('2d'), hc = hC.getContext('2d');
      const cI = cc.createImageData(size, size), hI = hc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const nx = x / size * 4, ny = y / size * 4;
        const base = N.fbm(nx, ny, 4, 0.5, 2);
        const detail = N.fbm(nx * 12, ny * 12, 3, 0.5, 2);
        const crack = Math.abs(N.perlin(nx * 8, ny * 8)) < 0.03 ? 0.3 : 1;
        const v = (0.5 + base * 0.2 + detail * 0.1) * crack;
        cI.data[i] = 90 * v; cI.data[i + 1] = 70 * v; cI.data[i + 2] = 50 * v; cI.data[i + 3] = 255;
        hI.data[i] = hI.data[i + 1] = hI.data[i + 2] = v * 255; hI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0); hc.putImageData(hI, 0, 0);
      return { map: texFromCanvas(cC, true, 12), normalMap: texFromCanvas(heightToNormal(hC, 0.5), false, 12) };
    });
  }

  // PLASMA — для лавы/энергии
  function createPlasma(size, hue) {
    return cache('plasma_' + hue, () => {
      const N = makeNoise(666);
      const cC = makeCanvas(size);
      const cc = cC.getContext('2d');
      const cI = cc.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const nx = x / size * 5, ny = y / size * 5;
        const v = N.fbm(nx, ny, 5, 0.6, 2);
        const heat = Math.max(0, Math.min(1, 0.5 + v));
        const r = hue === 'purple' ? 180 * heat : 255 * heat;
        const g = hue === 'purple' ? 60 * heat * heat : 80 * heat * heat;
        const b = hue === 'purple' ? 255 * heat : 40 * heat * heat * heat;
        cI.data[i] = r; cI.data[i + 1] = g; cI.data[i + 2] = b; cI.data[i + 3] = 255;
      }
      cc.putImageData(cI, 0, 0);
      return { map: texFromCanvas(cC, true, 5) };
    });
  }

  // БУЛЛЕТХОЛ
  function createBulletHoleTex() {
    return cache('bullethole2', () => {
      const size = 64, c = makeCanvas(size), ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
      g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(0.3, 'rgba(20,15,10,.9)');
      g.addColorStop(0.6, 'rgba(40,30,20,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    });
  }

  // MUZZLE FLASH
  function createMuzzleFlashTex() {
    const size = 64, c = makeCanvas(size), ctx = c.getContext('2d');
    const gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,220,1)');
    gr.addColorStop(0.3, 'rgba(255,200,80,.95)');
    gr.addColorStop(0.7, 'rgba(255,120,0,.5)');
    gr.addColorStop(1, 'rgba(255,50,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  // ПРОЦЕДУРНЫЙ СКИН
  function createSkinTexture(seed, pattern, color) {
    const size = 256, c = makeCanvas(size), ctx = c.getContext('2d');
    const rand = mulberry32(seed);
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, size, size);
    if (pattern === 'STRIPES') {
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.1 + rand() * 0.3})`;
        ctx.fillRect(rand() * size, 0, 2 + rand() * 8, size);
      }
    } else if (pattern === 'CAMO') {
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${rand() * 255 | 0},${rand() * 255 | 0},${rand() * 255 | 0},${0.3 + rand() * 0.4})`;
        ctx.beginPath(); ctx.arc(rand() * size, rand() * size, 5 + rand() * 20, 0, Math.PI * 2); ctx.fill();
      }
    } else if (pattern === 'NEON') {
      for (let i = 0; i < 15; i++) {
        ctx.strokeStyle = `hsl(${rand() * 360},100%,60%)`;
        ctx.lineWidth = 1 + rand() * 3;
        ctx.beginPath(); ctx.moveTo(rand() * size, 0); ctx.lineTo(rand() * size, size); ctx.stroke();
      }
    } else if (pattern === 'GALAXY') {
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(255,255,255,${rand()})`;
        ctx.fillRect(rand() * size, rand() * size, 1, 1);
      }
    } else if (pattern === 'FRACTURE') {
      for (let i = 0; i < 25; i++) {
        ctx.strokeStyle = `rgba(255,255,255,${0.2 + rand() * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(rand() * size, rand() * size);
        for (let j = 0; j < 5; j++) ctx.lineTo(rand() * size, rand() * size);
        ctx.stroke();
      }
    } else if (pattern === 'TIGER') {
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.4 + rand() * 0.4})`;
        ctx.beginPath(); ctx.ellipse(rand() * size, rand() * size, 3 + rand() * 10, 1 + rand() * 3, rand() * Math.PI, 0, Math.PI * 2); ctx.fill();
      }
    } else if (pattern === 'HEX') {
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      for (let y = 0; y < size; y += 20) for (let x = 0; x < size; x += 17) {
        const ox = (Math.floor(y / 20) % 2) * 8.5;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; const px = x + ox + Math.cos(a) * 9, py = y + Math.sin(a) * 9; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.closePath(); ctx.stroke();
      }
    }
    return new THREE.CanvasTexture(c);
  }

  /* ============================================================
     ЗВУК
     ============================================================ */
  let AC, MASTER, SFX_BUS;
  function ensureAudio() {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      MASTER = AC.createGain(); MASTER.gain.value = 0.7; MASTER.connect(AC.destination);
      SFX_BUS = AC.createGain(); SFX_BUS.gain.value = 1.0; SFX_BUS.connect(MASTER);
    }
    if (AC.state === 'suspended') AC.resume();
  }
  function setMasterVolume(v) { ensureAudio(); MASTER.gain.value = v; }

  function makeNoiseBuf(dur) { const n = Math.floor(AC.sampleRate * dur); const buf = AC.createBuffer(1, n, AC.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return buf; }

  function sndShot(variant = 'rifle', panner) {
    ensureAudio(); const now = AC.currentTime;
    const P = { pistol:{crack:0.10,hi:1200,low:120,g:0.30,tail:0.20}, rifle:{crack:0.14,hi:900,low:80,g:0.42,tail:0.35}, smg:{crack:0.08,hi:1500,low:150,g:0.26,tail:0.15}, shotgun:{crack:0.26,hi:600,low:55,g:0.65,tail:0.55}, sniper:{crack:0.30,hi:500,low:40,g:0.80,tail:0.80}, knife:{crack:0.05,hi:4000,low:400,g:0.20,tail:0.10}, lmg:{crack:0.18,hi:800,low:70,g:0.5,tail:0.4} }[variant] || {crack:0.14,hi:900,low:80,g:0.42,tail:0.35};
    const dest = panner || SFX_BUS;
    const nb = makeNoiseBuf(P.crack); const ns = AC.createBufferSource(); ns.buffer = nb;
    const nf = AC.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = P.hi;
    const ng = AC.createGain(); ng.gain.setValueAtTime(P.g, now); ng.gain.exponentialRampToValueAtTime(0.001, now + P.crack);
    ns.connect(nf); nf.connect(ng); ng.connect(dest); ns.start(now);
    const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(P.low * 2.2, now); o.frequency.exponentialRampToValueAtTime(P.low, now + 0.16);
    const og = AC.createGain(); og.gain.setValueAtTime(P.g * 1.1, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    o.connect(og); og.connect(dest); o.start(now); o.stop(now + 0.18);
    const tb = makeNoiseBuf(P.tail); const ts = AC.createBufferSource(); ts.buffer = tb;
    const tf = AC.createBiquadFilter(); tf.type = 'lowpass'; tf.frequency.setValueAtTime(600, now); tf.frequency.exponentialRampToValueAtTime(180, now + P.tail);
    const tg = AC.createGain(); tg.gain.setValueAtTime(P.g * 0.4, now); tg.gain.exponentialRampToValueAtTime(0.001, now + P.tail);
    ts.connect(tf); tf.connect(tg); tg.connect(dest); ts.start(now);
  }

  function sndShot3D(variant, pos) {
    ensureAudio();
    if (!pos) { sndShot(variant); return; }
    const panner = AC.createPanner();
    panner.panningModel = 'HRTF'; panner.distanceModel = 'inverse';
    panner.refDistance = 3; panner.maxDistance = 150; panner.rolloffFactor = 1.2;
    if (panner.positionX) { panner.positionX.value = pos.x; panner.positionY.value = pos.y; panner.positionZ.value = pos.z; }
    else panner.setPosition(pos.x, pos.y, pos.z);
    panner.connect(SFX_BUS);
    sndShot(variant, panner);
  }

  function updateListener(camera) {
    if (!AC || !AC.listener) return;
    const L = AC.listener;
    const p = camera.position, q = camera.quaternion;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    const up  = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    if (L.positionX) {
      L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z;
      L.forwardX.value = fwd.x; L.forwardY.value = fwd.y; L.forwardZ.value = fwd.z;
      L.upX.value = up.x; L.upY.value = up.y; L.upZ.value = up.z;
    } else {
      L.setPosition(p.x, p.y, p.z);
      L.setOrientation(fwd.x, fwd.y, fwd.z, up.x, up.y, up.z);
    }
  }

  function sndStep(muffle = false) { ensureAudio(); const now = AC.currentTime; const buf = makeNoiseBuf(0.09); const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = muffle ? 180 : 420; const g = AC.createGain(); g.gain.setValueAtTime(muffle ? 0.04 : 0.09, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.09); s.connect(f); f.connect(g); g.connect(SFX_BUS); s.start(now); }
  function sndHitmarker() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(1900, now); o.frequency.exponentialRampToValueAtTime(900, now + 0.04); const g = AC.createGain(); g.gain.setValueAtTime(0.10, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.05); o.connect(g); g.connect(SFX_BUS); o.start(now); o.stop(now + 0.05); }
  function sndReload() { ensureAudio(); const now = AC.currentTime; [0, 0.18, 0.35, 0.55].forEach((t, i) => { const buf = makeNoiseBuf(0.04); const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500 + i * 400; f.Q.value = 8; const g = AC.createGain(); g.gain.setValueAtTime(0.12, now + t); g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05); s.connect(f); f.connect(g); g.connect(SFX_BUS); s.start(now + t); }); }
  function sndHurt() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(320, now); o.frequency.exponentialRampToValueAtTime(140, now + 0.22); const g = AC.createGain(); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25); o.connect(g); g.connect(SFX_BUS); o.start(now); o.stop(now + 0.26); }
  function sndExplosion() { ensureAudio(); const now = AC.currentTime; const buf = makeNoiseBuf(1.0); const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(800, now); f.frequency.exponentialRampToValueAtTime(40, now + 1.0); const g = AC.createGain(); g.gain.setValueAtTime(0.8, now); g.gain.exponentialRampToValueAtTime(0.001, now + 1.0); s.connect(f); f.connect(g); g.connect(SFX_BUS); s.start(now); }
  function sndEnemyDeath() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(240, now); o.frequency.exponentialRampToValueAtTime(60, now + 0.4); const g = AC.createGain(); g.gain.setValueAtTime(0.13, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.4); o.connect(g); g.connect(SFX_BUS); o.start(now); o.stop(now + 0.45); }
  function sndEmpty() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(600, now); const g = AC.createGain(); g.gain.setValueAtTime(0.05, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.04); o.connect(g); g.connect(SFX_BUS); o.start(now); o.stop(now + 0.05); }
  function sndBuy() { ensureAudio(); const now = AC.currentTime; [0, 0.1].forEach((t, i) => { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(i ? 1200 : 800, now + t); o.frequency.exponentialRampToValueAtTime(i ? 1600 : 1000, now + t + 0.08); const g = AC.createGain(); g.gain.setValueAtTime(0.1, now + t); g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.1); o.connect(g); g.connect(SFX_BUS); o.start(now + t); o.stop(now + t + 0.1); }); }
  function sndPlant() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(400, now); o.frequency.setValueAtTime(800, now + 0.1); o.frequency.setValueAtTime(400, now + 0.2); const g = AC.createGain(); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3); o.connect(g); g.connect(SFX_BUS); o.start(now); o.stop(now + 0.3); }
  function sndLevelUp() { ensureAudio(); const now = AC.currentTime; [523, 659, 784, 1047].forEach((freq, i) => { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = freq; const g = AC.createGain(); g.gain.setValueAtTime(0, now + i * 0.08); g.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3); o.connect(g); g.connect(SFX_BUS); o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.3); }); }
  function sndFlash() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(3000, now); o.frequency.exponentialRampToValueAtTime(200, now + 0.8); const g = AC.createGain(); g.gain.setValueAtTime(0.4, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.8); o.connect(g); g.connect(SFX_BUS); o.start(now); o.stop(now + 0.8); }

  /* ============================================================
     ЭКСПОРТ
     ============================================================ */
  window.CS = window.CS || {};
  window.CS.Textures = {
    createSciFiPanel, createNeonGrid, createRustMetal, createHoloFloor, createDarkSand, createPlasma,
    createBulletHoleTex, createMuzzleFlashTex, createSkinTexture,
    makeNoise, makeCanvas, texFromCanvas, heightToNormal, mulberry32
  };
  window.CS.Audio = {
    ensureAudio, setMasterVolume, updateListener,
    sndShot, sndShot3D, sndStep, sndHitmarker, sndReload, sndHurt,
    sndExplosion, sndEnemyDeath, sndEmpty, sndBuy, sndPlant, sndLevelUp, sndFlash
  };
})();