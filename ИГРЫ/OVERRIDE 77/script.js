'use strict';
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
const getEl = id => document.getElementById(id);

/* ============================================================
   FPS СЧЁТЧИК
   ============================================================ */
const FPS = { frames: 0, last: performance.now(), el: getEl('fps-counter') };
function updateFPS(now) {
  FPS.frames++;
  if (now - FPS.last >= 500) {
    const fps = Math.round((FPS.frames * 1000) / (now - FPS.last));
    FPS.frames = 0; FPS.last = now;
    if (FPS.el) {
      FPS.el.textContent = 'FPS: ' + fps;
      FPS.el.style.color = fps > 50 ? '#4f4' : fps > 30 ? '#ff4' : '#f44';
    }
  }
}

/* ============================================================
   ЗАГРУЗКА ТЕКСТУР ИЗ JPG
   ============================================================ */
console.log('Загрузка текстур...');
const textureLoader = new THREE.TextureLoader();

function loadTex(file, repeat = 1) {
  const t = textureLoader.load('./textures/' + file);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  t.encoding = THREE.sRGBEncoding;
  return t;
}

function normalFromImage(img, strength = 0.8) {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const src = ctx.getImageData(0, 0, size, size).data;
  const out = ctx.createImageData(size, size);
  const getH = (x, y) => {
    const i = (((y + size) % size) * size + ((x + size) % size)) * 4;
    return (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (getH(x - 1, y) - getH(x + 1, y)) * strength * 4;
    const dy = (getH(x, y - 1) - getH(x, y + 1)) * strength * 4;
    const len = Math.sqrt(dx * dx + dy * dy + 1);
    const i = (y * size + x) * 4;
    out.data[i] = (dx / len * 0.5 + 0.5) * 255;
    out.data[i + 1] = (dy / len * 0.5 + 0.5) * 255;
    out.data[i + 2] = (1 / len * 0.5 + 0.5) * 255;
    out.data[i + 3] = 255;
  }
  const nc = document.createElement('canvas');
  nc.width = nc.height = size;
  nc.getContext('2d').putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(nc);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const TEX = {};
const TEX_DEFS = [
  { key: 'stone', file: 'stone.jpg', repeat: 2, normal: true },
  { key: 'stoneDark', file: 'stone-dark.jpg', repeat: 2, normal: true },
  { key: 'metal', file: 'metal.jpg', repeat: 1, normal: true },
  { key: 'wood', file: 'wood.jpg', repeat: 1, normal: true },
  { key: 'sand', file: 'sand.jpg', repeat: 12, normal: false },
  { key: 'redSand', file: 'sand-red.jpg', repeat: 12, normal: false },
  { key: 'lava', file: 'lava.jpg', repeat: 6, normal: false },
  { key: 'bulletHole', file: 'bullet-hole.png', repeat: 1, normal: false }
];

let _texLoaded = 0;
let _texReady = false;
function onTexReady() {
  _texLoaded++;
  const loadEl = getEl('loading');
  if (loadEl) loadEl.textContent = `ЗАГРУЗКА ТЕКСТУР ${_texLoaded}/${TEX_DEFS.length}`;
  if (_texLoaded === TEX_DEFS.length && !_texReady) {
    _texReady = true;
    if (loadEl) loadEl.style.display = 'none';
    getEl('lobby').style.display = 'flex';
    if (typeof showPreviewWeapon === 'function') showPreviewWeapon(previewIndex);
    if (typeof buildMapSelector === 'function') buildMapSelector();
    if (typeof loop === 'function') if (_texLoaded === TEX_DEFS.length && !_texReady) {
  _texReady = true;
  
  // 🔧 применяем нормалки ещё раз — на случай, если материалы были созданы раньше
  if (TEX.stone.normalMap) { wallMat.normalMap = TEX.stone.normalMap; wallMat.needsUpdate = true; }
  if (TEX.stoneDark.normalMap) { wallDarkMat.normalMap = TEX.stoneDark.normalMap; wallDarkMat.needsUpdate = true; }
  if (TEX.metal.normalMap) { metalMat.normalMap = TEX.metal.normalMap; metalMat.needsUpdate = true; }
  if (TEX.wood.normalMap) { woodMat.normalMap = TEX.wood.normalMap; woodMat.needsUpdate = true; }
  
  if (loadEl) loadEl.style.display = 'none';
  getEl('lobby').style.display = 'flex';
  if (typeof showPreviewWeapon === 'function') showPreviewWeapon(previewIndex);
  if (typeof buildMapSelector === 'function') buildMapSelector();
  if (typeof loop === 'function') loop();
} loop();
  }
}

TEX_DEFS.forEach(def => {
  const map = loadTex(def.file, def.repeat);
  TEX[def.key] = { map };
map.onLoad = () => {
  if (def.normal) {
    try {
      TEX[def.key].normalMap = normalFromImage(map.image, 0.8);
      // применяем к материалам, если они уже созданы
      if (def.key === 'stone' && typeof wallMat !== 'undefined') { wallMat.normalMap = TEX[def.key].normalMap; wallMat.needsUpdate = true; }
      if (def.key === 'stoneDark' && typeof wallDarkMat !== 'undefined') { wallDarkMat.normalMap = TEX[def.key].normalMap; wallDarkMat.needsUpdate = true; }
      if (def.key === 'metal' && typeof metalMat !== 'undefined') { metalMat.normalMap = TEX[def.key].normalMap; metalMat.needsUpdate = true; }
      if (def.key === 'wood' && typeof woodMat !== 'undefined') { woodMat.normalMap = TEX[def.key].normalMap; woodMat.needsUpdate = true; }
    } catch (e) { console.warn('normal failed:', def.key); }
  }
  onTexReady();
};
  map.onError = () => {
    console.error('НЕ НАЙДЕНА ТЕКСТУРА:', def.file);
    onTexReady();
  };
});

const stoneTex = TEX.stone;
const stoneDarkTex = TEX.stoneDark;
const metalTex = TEX.metal;
const woodTex = TEX.wood;
const sandTex = TEX.sand;
const redSandTex = TEX.redSand;
const lavaTex = TEX.lava;
const bulletHoleTex = TEX.bulletHole.map;

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
function sndStep(muffle = false) {
  ensureAudio(); const now = AC.currentTime;
  const buf = makeNoiseBuf(0.09); const s = AC.createBufferSource(); s.buffer = buf;
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = muffle ? 180 : 420;
  const g = AC.createGain(); g.gain.setValueAtTime(muffle ? 0.04 : 0.09, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  s.connect(f); f.connect(g); g.connect(AC.destination); s.start(now);
}
function sndHitmarker() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(1900, now); o.frequency.exponentialRampToValueAtTime(900, now + 0.04); const g = AC.createGain(); g.gain.setValueAtTime(0.10, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.05); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.05); }
function sndReload() { ensureAudio(); const now = AC.currentTime; [0, 0.18, 0.35, 0.55].forEach((t, i) => { const buf = makeNoiseBuf(0.04); const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500 + i * 400; f.Q.value = 8; const g = AC.createGain(); g.gain.setValueAtTime(0.12, now + t); g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(now + t); }); }
function sndHurt() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(320, now); o.frequency.exponentialRampToValueAtTime(140, now + 0.22); const g = AC.createGain(); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.26); }
function sndExplosion() { ensureAudio(); const now = AC.currentTime; const buf = makeNoiseBuf(1.0); const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(800, now); f.frequency.exponentialRampToValueAtTime(40, now + 1.0); const g = AC.createGain(); g.gain.setValueAtTime(0.8, now); g.gain.exponentialRampToValueAtTime(0.001, now + 1.0); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(now); }
function sndEnemyDeath() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(240, now); o.frequency.exponentialRampToValueAtTime(60, now + 0.4); const g = AC.createGain(); g.gain.setValueAtTime(0.13, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.4); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.45); }
function sndEmpty() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(600, now); const g = AC.createGain(); g.gain.setValueAtTime(0.05, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.04); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.05); }
function sndBuy() { ensureAudio(); const now = AC.currentTime; [0, 0.1].forEach((t, i) => { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(i ? 1200 : 800, now + t); o.frequency.exponentialRampToValueAtTime(i ? 1600 : 1000, now + t + 0.08); const g = AC.createGain(); g.gain.setValueAtTime(0.1, now + t); g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.1); o.connect(g); g.connect(AC.destination); o.start(now + t); o.stop(now + t + 0.1); }); }
function sndPlant() { ensureAudio(); const now = AC.currentTime; const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(400, now); o.frequency.setValueAtTime(800, now + 0.1); o.frequency.setValueAtTime(400, now + 0.2); const g = AC.createGain(); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3); o.connect(g); g.connect(AC.destination); o.start(now); o.stop(now + 0.3); }

/* ============================================================
   СЦЕНА
   ============================================================ */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const skyMat = new THREE.ShaderMaterial({
  uniforms: { topColor: { value: new THREE.Color(0x3a6ba5) }, bottomColor: { value: new THREE.Color(0xf0c890) }, time: { value: 0 } },
  vertexShader: `varying vec3 vP; varying vec2 vUv; void main(){ vP = position; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform vec3 topColor; uniform vec3 bottomColor; uniform float time; varying vec3 vP; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
    void main(){
      float h = normalize(vP).y;
      vec3 sky = mix(bottomColor, topColor, max(pow(max(h,0.0),0.6),0.0));
      vec2 cp = vUv * 8.0 + vec2(time*0.02, 0.0);
      float c = noise(cp)*0.5 + noise(cp*2.0)*0.3 + noise(cp*4.0)*0.2;
      c = smoothstep(0.5, 0.85, c) * smoothstep(0.1, 0.5, h);
      sky = mix(sky, vec3(1.0,0.98,0.95), c*0.6);
      gl_FragColor = vec4(sky, 1.0);
    }`,
  side: THREE.BackSide
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(260, 32, 16), skyMat);
scene.add(sky);

const hemi = new THREE.HemisphereLight(0xbbccff, 0x6a5a45, 1.0); scene.add(hemi);
const ambient = new THREE.AmbientLight(0x404060, 0.3); scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffd8a0, 2.8);
sun.position.set(40, 60, 20); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 200 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0x8090c0, 0.4); fill.position.set(-40, 30, -40); scene.add(fill);

/* ============================================================
   МАТЕРИАЛЫ
   ============================================================ */
const wallMat = new THREE.MeshStandardMaterial({ map: stoneTex.map, roughness: 0.85, metalness: 0.02 });
const wallDarkMat = new THREE.MeshStandardMaterial({ map: stoneDarkTex.map, roughness: 0.85, metalness: 0.02 });
const metalMat = new THREE.MeshStandardMaterial({ map: metalTex.map, roughness: 0.6, metalness: 0.7 });
const woodMat = new THREE.MeshStandardMaterial({ map: woodTex.map, roughness: 0.75 });
const sandMat = new THREE.MeshStandardMaterial({ map: sandTex.map, roughness: 0.95 });
const redSandMat = new THREE.MeshStandardMaterial({ map: redSandTex.map, roughness: 0.95 });
const lavaMat = new THREE.MeshStandardMaterial({ map: lavaTex.map, emissive: 0xff4400, emissiveIntensity: 1.5, emissiveMap: lavaTex.map });
const enemyMatT = new THREE.MeshStandardMaterial({ color: 0x9a3a3a, roughness: 0.85 });
const enemyMatCT = new THREE.MeshStandardMaterial({ color: 0x3a5a9a, roughness: 0.85 });
const skinMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.8 });

/* ============================================================
   ОРУЖИЕ (24 ствола)
   ============================================================ */
const WEAPONS = {
  knife:      { name: 'COMBAT KNIFE', cat: 'melee', slot: 3, dmg: 22, headMult: 1.8, rate: 0.9, mag: 0, reserve: 0, auto: false, price: 0, kick: 0.5, spread: 0, recoil: 0, range: 1.6, reticle: 'none' },
  glock:      { name: 'GLOCK-18', cat: 'pistol', slot: 2, dmg: 26, headMult: 3.5, rate: 0.16, mag: 20, reserve: 120, auto: false, price: 200, kick: 0.6, spread: 0.006, recoil: 0.010, range: 80, reticle: 'dot' },
  usp:        { name: 'USP-S', cat: 'pistol', slot: 2, dmg: 35, headMult: 4, rate: 0.22, mag: 12, reserve: 24, auto: false, price: 200, kick: 0.7, spread: 0.004, recoil: 0.012, range: 100, reticle: 'classic' },
  p250:       { name: 'P250', cat: 'pistol', slot: 2, dmg: 38, headMult: 4, rate: 0.20, mag: 13, reserve: 26, auto: false, price: 300, kick: 0.8, spread: 0.008, recoil: 0.015, range: 90, reticle: 'classic' },
  fiveseven:  { name: 'FIVE-SEVEN', cat: 'pistol', slot: 2, dmg: 32, headMult: 4, rate: 0.15, mag: 20, reserve: 100, auto: false, price: 500, kick: 0.6, spread: 0.006, recoil: 0.012, range: 90, reticle: 'dot' },
  tec9:       { name: 'TEC-9', cat: 'pistol', slot: 2, dmg: 33, headMult: 4, rate: 0.12, mag: 18, reserve: 90, auto: false, price: 500, kick: 0.9, spread: 0.015, recoil: 0.02, range: 80, reticle: 'dot' },
  dual:       { name: 'DUAL BERETTAS', cat: 'pistol', slot: 2, dmg: 24, headMult: 3.5, rate: 0.08, mag: 30, reserve: 120, auto: true, price: 400, kick: 0.5, spread: 0.02, recoil: 0.012, range: 70, reticle: 'dot' },
  deagle:     { name: 'DESERT EAGLE', cat: 'pistol', slot: 2, dmg: 65, headMult: 4, rate: 0.35, mag: 7, reserve: 35, auto: false, price: 700, kick: 1.8, spread: 0.010, recoil: 0.04, range: 130, reticle: 'dot-arcs' },
  mp5:        { name: 'MP5-SD', cat: 'smg', slot: 1, dmg: 22, headMult: 3, rate: 0.075, mag: 30, reserve: 120, auto: true, price: 1250, kick: 0.7, spread: 0.012, recoil: 0.013, range: 120, reticle: 'classic' },
  p90:        { name: 'P90', cat: 'smg', slot: 1, dmg: 26, headMult: 2.5, rate: 0.07, mag: 50, reserve: 100, auto: true, price: 2350, kick: 0.8, spread: 0.014, recoil: 0.015, range: 130, reticle: 'classic' },
  ump:        { name: 'UMP-45', cat: 'smg', slot: 1, dmg: 30, headMult: 3, rate: 0.10, mag: 25, reserve: 100, auto: true, price: 1200, kick: 0.9, spread: 0.015, recoil: 0.018, range: 110, reticle: 'classic' },
  mac10:      { name: 'MAC-10', cat: 'smg', slot: 1, dmg: 28, headMult: 3, rate: 0.06, mag: 30, reserve: 100, auto: true, price: 1050, kick: 0.75, spread: 0.02, recoil: 0.015, range: 100, reticle: 'classic' },
  bizon:      { name: 'PP-BIZON', cat: 'smg', slot: 1, dmg: 20, headMult: 2.5, rate: 0.08, mag: 64, reserve: 120, auto: true, price: 1400, kick: 0.6, spread: 0.018, recoil: 0.012, range: 100, reticle: 'classic' },
  ak47:       { name: 'AK-47', cat: 'rifle', slot: 1, dmg: 36, headMult: 4, rate: 0.095, mag: 30, reserve: 90, auto: true, price: 2700, kick: 1.0, spread: 0.018, recoil: 0.024, range: 180, reticle: 'classic' },
  m4a4:       { name: 'M4A4', cat: 'rifle', slot: 1, dmg: 33, headMult: 4, rate: 0.09, mag: 30, reserve: 90, auto: true, price: 3100, kick: 0.9, spread: 0.015, recoil: 0.02, range: 180, reticle: 'classic' },
  famas:      { name: 'FAMAS', cat: 'rifle', slot: 1, dmg: 30, headMult: 3.5, rate: 0.09, mag: 25, reserve: 90, auto: true, price: 2050, kick: 0.85, spread: 0.016, recoil: 0.02, range: 160, reticle: 'classic' },
  aug:        { name: 'AUG', cat: 'rifle', slot: 1, dmg: 32, headMult: 4, rate: 0.10, mag: 30, reserve: 90, auto: true, price: 3300, kick: 0.85, spread: 0.012, recoil: 0.018, range: 190, reticle: 'classic' },
  sg553:      { name: 'SG 553', cat: 'rifle', slot: 1, dmg: 34, headMult: 4, rate: 0.10, mag: 30, reserve: 90, auto: true, price: 3000, kick: 0.9, spread: 0.014, recoil: 0.02, range: 190, reticle: 'classic' },
  awp:        { name: 'AWP', cat: 'sniper', slot: 1, dmg: 115, headMult: 1.5, rate: 1.45, mag: 10, reserve: 30, auto: false, price: 4750, kick: 3.5, spread: 0.08, recoil: 0.10, range: 300, reticle: 'scope' },
  ssg08:      { name: 'SSG 08', cat: 'sniper', slot: 1, dmg: 88, headMult: 2.5, rate: 1.0, mag: 10, reserve: 40, auto: false, price: 1700, kick: 2.0, spread: 0.05, recoil: 0.06, range: 260, reticle: 'scope' },
  nova:       { name: 'NOVA', cat: 'shotgun', slot: 1, dmg: 11, headMult: 2, pellets: 8, rate: 0.85, mag: 8, reserve: 32, auto: false, price: 1050, kick: 1.8, spread: 0.06, recoil: 0.065, range: 50, reticle: 'wide' },
  xm1014:     { name: 'XM1014', cat: 'shotgun', slot: 1, dmg: 10, headMult: 2, pellets: 6, rate: 0.3, mag: 7, reserve: 32, auto: false, price: 2000, kick: 1.5, spread: 0.05, recoil: 0.05, range: 50, reticle: 'wide' },
  m249:       { name: 'M249', cat: 'lmg', slot: 1, dmg: 32, headMult: 3, rate: 0.08, mag: 100, reserve: 200, auto: true, price: 5200, kick: 1.2, spread: 0.025, recoil: 0.03, range: 170, reticle: 'classic' },
  negev:      { name: 'NEGEV', cat: 'lmg', slot: 1, dmg: 35, headMult: 3, rate: 0.06, mag: 150, reserve: 200, auto: true, price: 5700, kick: 1.4, spread: 0.03, recoil: 0.035, range: 160, reticle: 'classic' },
  grenade:    { name: 'HE GRENADE', cat: 'nade', slot: 4, dmg: 98, headMult: 1, rate: 1.0, mag: 1, reserve: 0, auto: false, price: 300, kick: 0.5, spread: 0, recoil: 0, range: 0, reticle: 'none' }
};
const WEAPON_ORDER = ['glock','usp','p250','fiveseven','tec9','dual','deagle','mp5','p90','ump','mac10','bizon','famas','ak47','m4a4','aug','sg553','ssg08','awp','nova','xm1014','m249','negev','grenade'];

const gunMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.35, metalness: 0.92 });
const gunWood  = new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 0.7, metalness: 0.1 });
const gunPoly  = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.5, metalness: 0.3 });
const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 1 });

function buildWeaponMesh(type) {
  const g = new THREE.Group();
  if (type === 'knife') {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.25), bladeMat);
    blade.position.set(0, 0, -0.15); g.add(blade);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.12), gunPoly);
    handle.position.set(0, 0, 0.05); g.add(handle);
    g.userData.muzzle = new THREE.Vector3(0, 0, -0.25);
  } else if (['glock','usp','p250','fiveseven','tec9','deagle'].includes(type)) {
    const s = type === 'deagle' ? 1.3 : type === 'p250' ? 1.1 : 1;
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.055 * s, 0.075 * s, 0.22 * s), gunMetal); g.add(slide);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05 * s, 0.15 * s, 0.065 * s), gunPoly);
    grip.position.set(0, -0.09 * s, 0.07 * s); grip.rotation.x = 0.35; g.add(grip);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.011 * s, 0.011 * s, 0.04 * s, 8), gunMetal);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.01 * s, -0.14 * s); g.add(barrel);
    g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.17 * s);
  } else if (type === 'dual') {
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.075, 0.22), gunMetal);
    slide.position.set(-0.08, 0, 0); g.add(slide);
    const slide2 = slide.clone(); slide2.position.x = 0.08; g.add(slide2);
    g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.17);
  } else if (['ak47','m4a4','famas','aug','sg553'].includes(type)) {
    const wood = type === 'ak47';
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.55), gunMetal); g.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.55, 12), gunMetal);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.55); g.add(barrel);
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.25), wood ? gunWood : gunPoly);
    handguard.position.set(0, 0.01, -0.38); g.add(handguard);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.3), wood ? gunWood : gunPoly);
    stock.position.set(0, -0.01, 0.42); stock.rotation.x = -0.1; g.add(stock);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.08), gunMetal);
    mag.position.set(0, -0.13, -0.08); mag.rotation.x = 0.2; g.add(mag);
    g.userData.muzzle = new THREE.Vector3(0, 0.02, -0.85);
  } else if (['mp5','p90','ump','mac10','bizon'].includes(type)) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.35), gunMetal); g.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 10), gunMetal);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.01, -0.27); g.add(barrel);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.05), gunMetal);
    mag.position.set(0, -0.14, -0.02); g.add(mag);
    g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.4);
  } else if (type === 'awp' || type === 'ssg08') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.7), gunPoly); g.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 12), gunMetal);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.7); g.add(barrel);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12), gunMetal);
    scope.rotation.x = Math.PI / 2; scope.position.set(0, 0.1, 0); g.add(scope);
    g.userData.muzzle = new THREE.Vector3(0, 0.02, -1.05);
  } else if (type === 'nova' || type === 'xm1014') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.4), gunMetal); g.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.6, 12), gunMetal);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.45); g.add(barrel);
    g.userData.muzzle = new THREE.Vector3(0, 0.02, -0.78);
  } else if (type === 'm249' || type === 'negev') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.7), gunMetal); g.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 12), gunMetal);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.75); g.add(barrel);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.12), gunMetal);
    mag.position.set(0, -0.14, -0.15); g.add(mag);
    g.userData.muzzle = new THREE.Vector3(0, 0.02, -1.1);
  } else if (type === 'grenade') {
    const nade = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.8 }));
    g.add(nade);
    g.userData.muzzle = new THREE.Vector3(0, 0, 0);
  }
  return g;
}

const VIEWMODEL_POS = {};
WEAPON_ORDER.forEach(k => {
  const w = WEAPONS[k];
  if (w.cat === 'pistol' || w.cat === 'melee') VIEWMODEL_POS[k] = [0.16, -0.19, -0.35];
  else if (w.cat === 'smg') VIEWMODEL_POS[k] = [0.16, -0.20, -0.35];
  else if (w.cat === 'rifle') VIEWMODEL_POS[k] = [0.18, -0.22, -0.35];
  else if (w.cat === 'sniper') VIEWMODEL_POS[k] = [0.20, -0.24, -0.40];
  else if (w.cat === 'shotgun') VIEWMODEL_POS[k] = [0.20, -0.22, -0.38];
  else if (w.cat === 'lmg') VIEWMODEL_POS[k] = [0.22, -0.24, -0.42];
  else VIEWMODEL_POS[k] = [0.15, -0.20, -0.35];
});

/* ============================================================
   КАРТЫ
   ============================================================ */
const MAPS = {
  FOUNDRY: {
    name: 'FOUNDRY', fog: 0x3a2010, bg: 0x2a1508, sunColor: 0xffaa55, sunIntensity: 2.0,
    size: 100,
    spawnsT: [[-35, 0, -35], [-35, 0, -25], [-25, 0, -35]],
    spawnsCT: [[35, 0, 35], [35, 0, 25], [25, 0, 35]],
    bombSite: [35, 0, -35], build: buildFoundry
  },
  CITADEL: {
    name: 'CITADEL', fog: 0x8090a0, bg: 0x405060, sunColor: 0xfff0cc, sunIntensity: 2.4,
    size: 110,
    spawnsT: [[-40, 0, 40], [-40, 0, 30], [-30, 0, 40]],
    spawnsCT: [[40, 0, -40], [40, 0, -30], [30, 0, -40]],
    bombSite: [40, 0, 40], build: buildCitadel
  },
  RIFT: {
    name: 'RIFT', fog: 0x1a0020, bg: 0x0a0010, sunColor: 0x8866ff, sunIntensity: 1.8,
    size: 95,
    spawnsT: [[-35, 0, 0], [-35, 0, 10], [-35, 0, -10]],
    spawnsCT: [[35, 0, 0], [35, 0, 10], [35, 0, -10]],
    bombSite: [0, 0, -35], build: buildRift
  },
  COLONY: {
    name: 'COLONY', fog: 0xc08060, bg: 0x8a4030, sunColor: 0xffd0b0, sunIntensity: 2.2,
    size: 105,
    spawnsT: [[-40, 0, 0], [-40, 0, 10], [-40, 0, -10]],
    spawnsCT: [[40, 0, 0], [40, 0, 10], [40, 0, -10]],
    bombSite: [0, 0, 40], build: buildColony
  }
};

const collidables = [];
const worldObjects = [];
const decals = [];
const mapLights = [];
let currentMapData = null;

function addBox(x, y, z, w, h, d, mat, collide = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y + h / 2, z);
  m.castShadow = true; m.receiveShadow = true;
  scene.add(m); worldObjects.push(m);
  if (collide) {
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    m.userData.isWall = true;
    collidables.push(m);
  }
  return m;
}
function addLamp(x, y, z, color) {
  const lampMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 3.0 }));
  lampMesh.position.set(x, y, z); scene.add(lampMesh);
  const light = new THREE.PointLight(color, 10, 24, 2); light.position.set(x, y, z); scene.add(light);
  mapLights.push(light);
}

function buildFoundry() {
  const S = 100;
  const floorMat = new THREE.MeshStandardMaterial({ map: metalTex.map, normalMap: metalTex.normalMap, roughness: 0.8, metalness: 0.6, color: 0x888888 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor); worldObjects.push(floor);
  addBox(0, 0, -50, 100, 10, 1, wallMat); addBox(0, 0, 50, 100, 10, 1, wallMat);
  addBox(-50, 0, 0, 1, 10, 100, wallMat); addBox(50, 0, 0, 1, 10, 100, wallMat);
  addBox(0, 0, 0, 20, 7, 1, metalMat);
  addBox(-10, 0, 10, 1, 7, 20, metalMat);
  addBox(10, 0, 10, 1, 7, 20, metalMat);
  for (let i = 0; i < 4; i++) addBox(-25 + i * 5, 0, -30, 2, 4, 2, metalMat);
  for (let i = 0; i < 4; i++) addBox(25 - i * 5, 0, 30, 2, 4, 2, metalMat);
  addBox(-30, 0, 0, 8, 1.5, 8, metalMat);
  addBox(30, 0, 0, 8, 1.5, 8, metalMat);
  [[-20, -15, 1.5], [20, 15, 1.5], [-15, 20, 1.4], [15, -20, 1.4]].forEach(([x, z, s]) => addBox(x, 0, z, s, s, s, woodMat));
  const lavaPool = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 6), lavaMat);
  lavaPool.position.set(0, 0.05, -35); scene.add(lavaPool);
  [[-30, 6, -30, 0xff5500], [30, 6, 30, 0xff5500], [0, 6, 0, 0xffaa00]].forEach(([x, y, z, c]) => addLamp(x, y, z, c));
}

function buildCitadel() {
  const S = 110;
  const floorMat = new THREE.MeshStandardMaterial({ map: sandTex.map, roughness: 0.9, color: 0xb0a080 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor); worldObjects.push(floor);
  addBox(0, 0, -55, 110, 11, 1, wallMat); addBox(0, 0, 55, 110, 11, 1, wallMat);
  addBox(-55, 0, 0, 1, 11, 110, wallMat); addBox(55, 0, 0, 1, 11, 110, wallMat);
  for (let i = -2; i <= 2; i++) {
    addBox(i * 12, 0, -40, 8, 8, 1, wallDarkMat);
    addBox(i * 12, 0, 40, 8, 8, 1, wallDarkMat);
  }
  addBox(-40, 0, -40, 8, 12, 8, wallDarkMat);
  addBox(40, 0, 40, 8, 12, 8, wallDarkMat);
  addBox(-40, 0, 40, 8, 12, 8, wallDarkMat);
  addBox(40, 0, -40, 8, 12, 8, wallDarkMat);
  addBox(0, 0, -25, 6, 2, 6, wallMat);
  addBox(0, 0, 25, 6, 2, 6, wallMat);
  for (let i = 0; i < 6; i++) addBox(-30 + i * 12, 0, 0, 1.5, 6, 1.5, wallMat);
  [[-30, 6, 0, 0xffaa55], [30, 6, 0, 0xffaa55]].forEach(([x, y, z, c]) => addLamp(x, y, z, c));
  [[-20, 15, 1.4], [20, -15, 1.4]].forEach(([x, z, s]) => addBox(x, 0, z, s, s, s, woodMat));
}

function buildRift() {
  const S = 95;
  const floorMat = new THREE.MeshStandardMaterial({ map: metalTex.map, normalMap: metalTex.normalMap, roughness: 0.5, metalness: 0.8, color: 0x444466 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor); worldObjects.push(floor);
  addBox(0, 0, -47, 95, 9, 1, wallDarkMat); addBox(0, 0, 47, 95, 9, 1, wallDarkMat);
  addBox(-47, 0, 0, 1, 9, 95, wallDarkMat); addBox(47, 0, 0, 1, 9, 95, wallDarkMat);
  const crackMat = new THREE.MeshStandardMaterial({ color: 0xaa66ff, emissive: 0xaa66ff, emissiveIntensity: 2.5 });
  for (let i = 0; i < 8; i++) {
    const crack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 15 + Math.random() * 15), crackMat);
    crack.position.set(-40 + i * 10, 0.03, -35 + Math.random() * 70);
    crack.rotation.y = Math.random() * Math.PI;
    scene.add(crack);
  }
  addBox(-15, 0, 0, 1.5, 4, 40, metalMat);
  addBox(15, 0, 0, 1.5, 4, 40, metalMat);
  addBox(0, 0, -20, 30, 4, 1.5, metalMat);
  addBox(0, 0, 20, 30, 4, 1.5, metalMat);
  addBox(0, 0, 0, 10, 3, 10, wallDarkMat);
  addBox(0, 3, 0, 6, 0.5, 6, metalMat);
  const props = [[-30, -30, 1.5], [30, 30, 1.5], [-30, 30, 1.4], [30, -30, 1.4], [-25, 0, 1.3], [25, 0, 1.3], [0, -35, 1.4], [0, 35, 1.4]];
  props.forEach(([x, z, s]) => addBox(x, 0, z, s, s, s, woodMat));
  for (let i = 0; i < 4; i++) {
    addBox(-20 + i * 13, 0, -10, 1.5, 6, 1.5, wallDarkMat);
    addBox(-20 + i * 13, 0, 10, 1.5, 6, 1.5, wallDarkMat);
  }
  [[-20, 6, -30, 0xaa66ff], [20, 6, 30, 0xaa66ff], [0, 6, 0, 0x66aaff], [-30, 6, 20, 0xaa66ff], [30, 6, -20, 0xaa66ff]].forEach(([x, y, z, c]) => addLamp(x, y, z, c));
}

function buildColony() {
  const S = 105;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), redSandMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor); worldObjects.push(floor);
  addBox(0, 0, -52, 105, 10, 1, wallMat); addBox(0, 0, 52, 105, 10, 1, wallMat);
  addBox(-52, 0, 0, 1, 10, 105, wallMat); addBox(52, 0, 0, 1, 10, 105, wallMat);
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xd0d0e0, roughness: 0.4, metalness: 0.4 });
  [[-30, -30], [30, 30], [-30, 30], [30, -30]].forEach(([x, z]) => {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    dome.position.set(x, 0, z); dome.castShadow = true; scene.add(dome);
    collidables.push(dome); dome.userData.isWall = true;
    if (!dome.geometry.boundingBox) dome.geometry.computeBoundingBox();
  });
  addBox(0, 0, 0, 20, 8, 20, metalMat);
  addBox(-10, 8, 0, 20, 1, 20, metalMat);
  addBox(-25, 0, -10, 6, 5, 6, metalMat);
  addBox(25, 0, 10, 6, 5, 6, metalMat);
  const props = [[-20, 15, 1.5], [20, -15, 1.5], [-25, -20, 1.4], [25, 20, 1.4], [-15, 0, 1.3], [15, 0, 1.3], [0, -25, 1.4], [0, 25, 1.4], [-40, 0, 1.2], [40, 0, 1.2], [0, -40, 1.2], [0, 40, 1.2]];
  props.forEach(([x, z, s]) => addBox(x, 0, z, s, s, s, woodMat));
  for (let i = -2; i <= 2; i++) {
    addBox(i * 8, 0, -30, 1.2, 7, 1.2, wallMat);
    addBox(i * 8, 0, 30, 1.2, 7, 1.2, wallMat);
  }
  [[-30, 6, 0, 0xffaa55], [30, 6, 0, 0xffaa55], [0, 6, -30, 0xff8844], [0, 6, 30, 0xff8844], [-30, 6, -30, 0xffaa55], [30, 6, 30, 0xffaa55]].forEach(([x, y, z, c]) => addLamp(x, y, z, c));
}

/* ============================================================
   ОРУЖИЕ В РУКАХ
   ============================================================ */
const weaponGroup = new THREE.Group();
camera.add(weaponGroup);
scene.add(camera);
const weaponModels = {};
for (const key in WEAPONS) {
  const m = buildWeaponMesh(key);
  m.visible = false;
  weaponModels[key] = m;
  weaponGroup.add(m);
}

const muzzleLight = new THREE.PointLight(0xffaa33, 0, 8, 2);
const flashC = makeCanvas(64);
{
  const ctx = flashC.getContext('2d');
  const gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,220,1)');
  gr.addColorStop(0.3, 'rgba(255,200,80,.95)');
  gr.addColorStop(0.7, 'rgba(255,120,0,.5)');
  gr.addColorStop(1, 'rgba(255,50,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 64, 64);
}
const flashTex = new THREE.CanvasTexture(flashC);
const flashSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, depthTest: false, transparent: true }));
flashSprite.scale.set(0.6, 0.6, 1);
flashSprite.visible = false;

/* ============================================================
   БОМБА
   ============================================================ */
let bombSitePos = new THREE.Vector3(30, 0, -30);
const bombMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xff0000, emissiveIntensity: 0.5 }));
bombMesh.position.copy(bombSitePos); bombMesh.position.y = 0.075; bombMesh.visible = false; scene.add(bombMesh);
let bombSiteRing = null;
function createBombRing() {
  if (bombSiteRing) scene.remove(bombSiteRing);
  bombSiteRing = new THREE.Mesh(new THREE.RingGeometry(2, 2.4, 48), new THREE.MeshBasicMaterial({ color: 0xff2222, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
  bombSiteRing.rotation.x = -Math.PI / 2;
  bombSiteRing.position.copy(bombSitePos); bombSiteRing.position.y = 0.02;
  scene.add(bombSiteRing);
}

/* ============================================================
   СОСТОЯНИЕ
   ============================================================ */
const GAME = { state: 'LOBBY', round: 1, timer: 0, money: 800, score: 0, kills: 0, bombPlanted: false, bombTimer: 0, bombSite: bombSitePos.clone(), defuseProgress: 0, currentMap: 'FOUNDRY', playerTeam: 'T' };
const player = {
  pos: new THREE.Vector3(0, 0, 30), vel: new THREE.Vector3(),
  yaw: Math.PI, pitch: 0, height: 1.7, radius: 0.35,
  health: 100, maxHealth: 100, armor: 0, helmet: false, alive: true, team: 'T',
  inventory: { primary: 'ak47', secondary: 'glock', knife: true, grenade: 0 },
  currentSlot: 2, ammo: 20, maxAmmo: 20, reserve: 120,
  onGround: true, lastShot: 0, lastStep: 0, stepTimer: 0,
  recoilPitch: 0, recoilYaw: 0, aim: false, bob: 0, reloading: false,
  shake: 0, weaponKick: 0, lookVelY: 0, prevYaw: Math.PI, reloadKick: 0,
  lastDamageTime: 0, isPlanting: false, plantProgress: 0,
  targetFov: 75, currentFov: 75, _shotHeld: false
};
const keys = {};
let locked = false, shooting = false, ctrlWBlocked = false;

/* ============================================================
   ВРАГИ
   ============================================================ */
const enemies = [];
let SPAWNS_T = [], SPAWNS_CT = [];

function buildEnemyModel(team) {
  const g = new THREE.Group();
  const mat = team === 'CT' ? enemyMatCT : enemyMatT;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.28), mat); torso.position.y = 1.15; torso.castShadow = true; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), skinMat); head.position.y = 1.65; head.castShadow = true; g.add(head);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: team === 'CT' ? 0x2a3a5a : 0x5a2a2a, roughness: 0.7 })); helmet.position.y = 1.68; g.add(helmet);
  const armGeo = new THREE.BoxGeometry(0.13, 0.55, 0.13);
  const lArm = new THREE.Mesh(armGeo, mat); lArm.position.set(-0.32, 1.15, 0); lArm.castShadow = true; g.add(lArm);
  const rArm = new THREE.Mesh(armGeo, mat); rArm.position.set(0.32, 1.15, 0); rArm.castShadow = true; g.add(rArm);
  const legGeo = new THREE.BoxGeometry(0.16, 0.8, 0.18);
  const lLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a })); lLeg.position.set(-0.15, 0.4, 0); lLeg.castShadow = true; g.add(lLeg);
  const rLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a })); rLeg.position.set(0.15, 0.4, 0); rLeg.castShadow = true; g.add(rLeg);
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.5), gunMetal); gun.position.set(0.3, 1.2, 0.25); g.add(gun);
  const headHB = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), new THREE.MeshBasicMaterial({ visible: false })); headHB.position.y = 1.65; headHB.userData.part = 'head'; g.add(headHB);
  const bodyHB = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.7), new THREE.MeshBasicMaterial({ visible: false })); bodyHB.position.y = 1.1; bodyHB.userData.part = 'body'; g.add(bodyHB);
  g.userData.hitboxes = [headHB, bodyHB];
  return g;
}

function spawnEnemy(team) {
  const eTeam = team || (GAME.playerTeam === 'T' ? 'CT' : 'T');
  const spawns = eTeam === 'CT' ? SPAWNS_CT : SPAWNS_T;
  if (!spawns.length) return;
  const sp = spawns[Math.floor(Math.random() * spawns.length)];
  const model = buildEnemyModel(eTeam);
  model.position.set(sp[0], 0, sp[2]);
  model.rotation.y = Math.random() * Math.PI * 2;
  scene.add(model);
  enemies.push({
    model, health: 100, armor: 50, alive: true, team: eTeam, state: 'patrol',
    patrolTarget: new THREE.Vector3(sp[0] + (Math.random() - 0.5) * 10, 0, sp[2] + (Math.random() - 0.5) * 10),
    patrolWait: 0, lastSeen: null, yaw: model.rotation.y,
    lastShot: 0, cooldown: 1.5 + Math.random(), deathTime: 0, aimStart: 0
  });
}

/* ============================================================
   ЭФФЕКТЫ
   ============================================================ */
const bulletHoleMat = new THREE.MeshBasicMaterial({ map: bulletHoleTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
const bulletHoles = [], tracers = [], impacts = [], casings = [], grenades = [], dmgDirs = [], dustParticles = [];
const casingGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6);
const casingMat = new THREE.MeshStandardMaterial({ color: 0xd0a850, metalness: 1, roughness: 0.3, emissive: 0x221800 });

function addBulletHole(p, n) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), bulletHoleMat);
  m.position.copy(p).addScaledVector(n, 0.008);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  scene.add(m); bulletHoles.push(m);
  if (bulletHoles.length > 80) scene.remove(bulletHoles.shift());
}
function addTracer(a, b, color = 0xffcc44, life = 0.08) {
  const g = new THREE.BufferGeometry().setFromPoints([a, b]);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 });
  const l = new THREE.Line(g, mat); scene.add(l);
  tracers.push({ mesh: l, life, maxLife: life });
}
function addImpact(p, n, color = 0xffaa44) {
  const count = 8; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(count * 3); const vel = [];
  for (let i = 0; i < count; i++) {
    pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
    vel.push(new THREE.Vector3(n.x + (Math.random() - 0.5) * 2, n.y + (Math.random() - 0.5) * 2 + 1, n.z + (Math.random() - 0.5) * 2).multiplyScalar(1.5 + Math.random() * 2.5));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size: 0.08, transparent: true, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat); scene.add(pts);
  impacts.push({ mesh: pts, vel, life: 0.5, max: 0.5 });
}
function addBlood(p) {
  const count = 14; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(count * 3); const vel = [];
  for (let i = 0; i < count; i++) {
    pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
    vel.push(new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3, (Math.random() - 0.5) * 4));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xaa0000, size: 0.1, transparent: true });
  const pts = new THREE.Points(geo, mat); scene.add(pts);
  impacts.push({ mesh: pts, vel, life: 0.7, max: 0.7 });
}
function ejectCasing(muzzleWorld) {
  const mesh = new THREE.Mesh(casingGeo, casingMat); mesh.position.copy(muzzleWorld); scene.add(mesh);
  casings.push({ mesh, vel: new THREE.Vector3((Math.random() - 0.5) * 3 + 1.5, 2 + Math.random() * 1.5, (Math.random() - 0.5) * 2), rot: new THREE.Vector3(Math.random() * 15, Math.random() * 15, Math.random() * 15), life: 2 });
  if (casings.length > 40) scene.remove(casings.shift().mesh);
}

/* ============================================================
   СТРЕЛЬБА
   ============================================================ */
const raycaster = new THREE.Raycaster();
function getCurrentWeaponKey() {
  if (player.currentSlot === 1) return player.inventory.primary;
  if (player.currentSlot === 2) return player.inventory.secondary;
  if (player.currentSlot === 3) return 'knife';
  if (player.currentSlot === 4) return 'grenade';
  return null;
}
function worldMuzzle() {
  const m = weaponModels[getCurrentWeaponKey()];
  const v = new THREE.Vector3();
  if (m) m.localToWorld(v.copy(m.userData.muzzle));
  return v;
}
function weaponSound(key) {
  const w = WEAPONS[key];
  if (!w) return 'rifle';
  if (key === 'awp' || key === 'ssg08') return 'sniper';
  if (key === 'knife') return 'knife';
  if (key === 'nova' || key === 'xm1014') return 'shotgun';
  if (key === 'm249' || key === 'negev') return 'lmg';
  if (w.cat === 'smg') return 'smg';
  if (w.cat === 'pistol') return 'pistol';
  return 'rifle';
}

function fireWeapon() {
  const key = getCurrentWeaponKey();
  if (!key) return;
  const w = WEAPONS[key];
  const now = performance.now() / 1000;
  if (!player.alive || player.reloading) return;
  if (GAME.state !== 'LIVE' && GAME.state !== 'BUY') return;
  if (now - player.lastShot < w.rate) return;
  if (key !== 'knife' && key !== 'grenade' && player.ammo <= 0) { sndEmpty(); player.lastShot = now; return; }
  if (key === 'grenade') {
    if (player.inventory.grenade <= 0) return;
    player.inventory.grenade--; player.lastShot = now;
    throwGrenade();
    if (player.inventory.grenade <= 0) equipSlot(player.inventory.primary ? 1 : 2);
    updateAmmoHUD(); return;
  }
  player.lastShot = now;
  if (key !== 'knife') { player.ammo--; updateAmmoHUD(); }
  sndShot(weaponSound(key));

  const recoil = w.recoil * (player.aim ? 0.4 : 1);
  player.recoilPitch += recoil * (0.7 + Math.random() * 0.6);
  player.recoilYaw += (Math.random() - 0.5) * recoil * 1.5;
  player.shake = Math.min(1.5, player.shake + w.kick * 0.4);
  player.weaponKick = Math.min(1.5, player.weaponKick + w.kick);
  if (key !== 'knife') {
    muzzleLight.intensity = w.kick > 2 ? 35 : 18;
    flashSprite.visible = true;
    flashSprite.material.rotation = Math.random() * Math.PI * 2;
    flashSprite.scale.setScalar(0.5 + Math.random() * 0.4);
  }
  const spread = player.aim ? w.spread * 0.15 : w.spread;
  const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  if (w.pellets) {
    for (let i = 0; i < w.pellets; i++) {
      const dir = camDir.clone();
      dir.x += (Math.random() - 0.5) * spread;
      dir.y += (Math.random() - 0.5) * spread;
      dir.normalize();
      fireRay(dir, w);
    }
  } else {
    const dir = camDir.clone();
    dir.x += (Math.random() - 0.5) * spread;
    dir.y += (Math.random() - 0.5) * spread;
    dir.normalize();
    fireRay(dir, w);
  }
  if (key !== 'knife') setTimeout(() => { if (player.alive) ejectCasing(worldMuzzle().add(new THREE.Vector3(0, -0.02, 0.02))); }, 30);
}

function fireRay(dir, w) {
  raycaster.set(camera.position, dir);
  raycaster.far = 600;
  const targets = [];
  for (const e of enemies) {
    if (!e.alive) continue;
    for (const hb of e.model.userData.hitboxes) targets.push(hb);
  }
  for (const o of worldObjects) if (o.visible) targets.push(o);
  const hits = raycaster.intersectObjects(targets, false);
  const start = worldMuzzle();
  let end = start.clone().add(dir.clone().multiplyScalar(200));
  if (hits.length) {
    const h = hits[0];
    end = h.point.clone();
    let hitEnemy = null, part = null;
    for (const e of enemies) {
      if (!e.alive) continue;
      if (e.model.userData.hitboxes.includes(h.object)) { hitEnemy = e; part = h.object.userData.part; break; }
    }
    if (hitEnemy) {
      const dist = h.distance;
      let falloff = 1;
      if (dist > 40) falloff = Math.max(0.6, 1 - (dist - 40) / 200);
      let dmg = (part === 'head' ? w.dmg * w.headMult : w.dmg) * falloff;
      if (hitEnemy.armor > 0) { const armorDmg = Math.min(hitEnemy.armor, dmg * 0.5); hitEnemy.armor -= armorDmg; dmg -= armorDmg * 0.5; }
      damageEnemy(hitEnemy, dmg, part === 'head');
      addBlood(h.point);
    } else {
      const normal = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
      addBulletHole(h.point, normal);
      addImpact(h.point, normal);
    }
  }
  if (w.dmg > 0) addTracer(start, end, w.dmg > 100 ? 0x88ccff : 0xffcc44);
}

function throwGrenade() {
  const geo = new THREE.SphereGeometry(0.06, 12, 12);
  const mat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, emissive: 0x110a00 });
  const nade = new THREE.Mesh(geo, mat);
  nade.position.copy(camera.position); nade.position.y -= 0.1;
  scene.add(nade);
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const vel = dir.multiplyScalar(15); vel.y += 3;
  grenades.push({ mesh: nade, vel, exploded: false, time: performance.now() / 1000 });
}
function updateGrenades(dt) {
  for (let i = grenades.length - 1; i >= 0; i--) {
    const g = grenades[i];
    if (g.exploded) continue;
    g.mesh.position.addScaledVector(g.vel, dt);
    g.vel.y -= 9.8 * dt;
    if (g.mesh.position.y < 0.06) { g.mesh.position.y = 0.06; g.vel.y *= -0.5; g.vel.x *= 0.8; g.vel.z *= 0.8; }
    resolveCollision(g.mesh.position, 0.1, 0.1);
    if (performance.now() / 1000 - g.time > 2.5) {
      g.exploded = true; sndExplosion();
      const dist = player.pos.distanceTo(g.mesh.position);
      if (dist < 8) damagePlayer(100 * (1 - dist / 8), g.mesh.position);
      for (const e of enemies) { if (!e.alive) continue; const d = e.model.position.distanceTo(g.mesh.position); if (d < 8) damageEnemy(e, 100 * (1 - d / 8), false); }
      addImpact(g.mesh.position, new THREE.Vector3(0, 1, 0), 0xff6600);
      const light = new THREE.PointLight(0xff6600, 15, 18); light.position.copy(g.mesh.position); scene.add(light);
      setTimeout(() => scene.remove(light), 250);
      scene.remove(g.mesh); grenades.splice(i, 1);
    }
  }
}
function damageEnemy(e, dmg, head) {
  e.health -= dmg; sndHitmarker(); showHit();
  e.state = 'chase'; e.lastSeen = player.pos.clone();
  if (e.health <= 0 && e.alive) killEnemy(e, head);
}
function killEnemy(e, head) {
  e.alive = false; e.deathTime = performance.now() / 1000;
  sndEnemyDeath();
  player.kills++; GAME.kills++;
  GAME.score += head ? 150 : 100;
  GAME.money = Math.min(16000, GAME.money + 300);
  updateHUD();
  addKillFeed(head ? 'HEADSHOT' : 'KILL');
}
function addKillFeed(msg) {
  const e = document.createElement('div'); e.className = 'kf-entry';
  e.textContent = `YOU ${msg}`;
  document.getElementById('kill-feed').appendChild(e);
  setTimeout(() => e.remove(), 4000);
}

/* ============================================================
   HUD + ПРИЦЕЛЫ
   ============================================================ */
function updateHUD() {
  document.getElementById('health').textContent = Math.ceil(player.health);
  document.getElementById('armor').textContent = `[${Math.ceil(player.armor)}]`;
  document.getElementById('health').style.color = player.health > 50 ? '#4f4' : player.health > 25 ? '#ff4' : '#f44';
  document.getElementById('money-hud').textContent = `$${GAME.money}`;
  document.getElementById('score-val').textContent = GAME.score;
  document.getElementById('kills-val').textContent = GAME.kills;
  document.getElementById('round-num').textContent = GAME.round;
  const tb = document.getElementById('team-badge');
  tb.textContent = player.team || 'T';
  tb.className = player.team === 'CT' ? 'ct' : '';
}
function updateHealthHUD() {
  document.getElementById('health').textContent = Math.ceil(player.health);
  document.getElementById('health').style.color = player.health > 50 ? '#4f4' : player.health > 25 ? '#ff4' : '#f44';
  document.getElementById('armor').textContent = `[${Math.ceil(player.armor)}]`;
}
function updateAmmoHUD() {
  const key = getCurrentWeaponKey(); if (!key) return;
  const w = WEAPONS[key];
  const ammoEl = document.getElementById('ammo-current');
  const resEl = document.getElementById('ammo-reserve');
  const wpEl = document.getElementById('ammo-weapon');
  if (key === 'knife') { ammoEl.textContent = '-'; resEl.textContent = ''; }
  else if (key === 'grenade') { ammoEl.textContent = player.inventory.grenade; resEl.textContent = ''; }
  else { ammoEl.textContent = player.ammo; resEl.textContent = '/ ' + player.reserve; ammoEl.style.color = player.ammo > 5 ? '#fff' : '#f44'; }
  wpEl.textContent = w.name;
}
const WEAPON_SLOTS = {};
function updateSlotHUD() { for (const k in WEAPON_SLOTS) WEAPON_SLOTS[k].el.classList.toggle('active', +k === player.currentSlot); }

let hitTimer = 0;
function showHit() { document.getElementById('hit-marker').style.opacity = '1'; hitTimer = 0.15; }
function flashDamage() { const e = document.getElementById('damage-overlay'); e.style.opacity = '1'; setTimeout(() => e.style.opacity = '0', 180); }
function showDamageFrom(attackerPos) {
  const dx = attackerPos.x - player.pos.x, dz = attackerPos.z - player.pos.z;
  const ang = Math.atan2(dx * Math.cos(player.yaw) - dz * Math.sin(player.yaw), -dx * Math.sin(player.yaw) - dz * Math.cos(player.yaw));
  const e = document.createElement('div'); e.className = 'dmg-dir';
  e.style.transform = `translate(-50%,-50%) rotate(${ang}rad) translateY(-90px)`; e.style.opacity = '1';
  document.getElementById('hud').appendChild(e);
  dmgDirs.push({ el: e, life: 1.2 });
}

const reticleCanvas = document.getElementById('reticle-canvas');
const rCtx = reticleCanvas.getContext('2d');
function resizeReticle() { reticleCanvas.width = innerWidth; reticleCanvas.height = innerHeight; }
resizeReticle();

function drawReticle() {
  rCtx.clearRect(0, 0, reticleCanvas.width, reticleCanvas.height);
  if (!player.alive || GAME.state === 'LOBBY') return;
  if (getEl('buy-menu').style.display === 'flex') return;
  const key = getCurrentWeaponKey();
  if (!key) return;
  const w = WEAPONS[key];
  const cx = reticleCanvas.width / 2, cy = reticleCanvas.height / 2;
  if (player.aim && (key === 'awp' || key === 'ssg08')) {
    const R = Math.min(reticleCanvas.width, reticleCanvas.height) * 0.4;
    rCtx.save();
    rCtx.fillStyle = 'rgba(0,0,0,0.98)';
    rCtx.beginPath(); rCtx.rect(0, 0, reticleCanvas.width, reticleCanvas.height); rCtx.arc(cx, cy, R, 0, Math.PI * 2, true); rCtx.fill();
    rCtx.strokeStyle = 'rgba(0,0,0,0.9)'; rCtx.lineWidth = 1.5;
    rCtx.beginPath(); rCtx.moveTo(cx - R, cy); rCtx.lineTo(cx + R, cy); rCtx.stroke();
    rCtx.beginPath(); rCtx.moveTo(cx, cy - R); rCtx.lineTo(cx, cy + R); rCtx.stroke();
    rCtx.fillStyle = 'rgba(255,40,40,0.95)'; rCtx.beginPath(); rCtx.arc(cx, cy, 2, 0, Math.PI * 2); rCtx.fill();
    rCtx.restore();
    return;
  }
  const kick = player.weaponKick;
  const baseGap = 6 + kick * 6;
  const len = 8;
  rCtx.strokeStyle = w.reticle === 'dot' ? 'rgba(0,255,0,0.95)' : 'rgba(0,255,0,0.9)';
  rCtx.lineWidth = 1.5;
  rCtx.shadowColor = 'rgba(0,0,0,0.9)'; rCtx.shadowBlur = 3;
  if (w.reticle === 'dot') {
    rCtx.fillStyle = 'rgba(0,255,0,1)';
    rCtx.beginPath(); rCtx.arc(cx, cy, 2, 0, Math.PI * 2); rCtx.fill();
  } else if (w.reticle === 'dot-arcs') {
    rCtx.fillStyle = 'rgba(255,80,80,1)'; rCtx.beginPath(); rCtx.arc(cx, cy, 2.5, 0, Math.PI * 2); rCtx.fill();
    rCtx.strokeStyle = 'rgba(255,80,80,0.7)';
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; rCtx.beginPath(); rCtx.arc(cx, cy, 12, a - 0.35, a + 0.35); rCtx.stroke(); }
  } else if (w.reticle === 'wide') {
    rCtx.strokeStyle = 'rgba(255,180,0,0.9)'; rCtx.beginPath(); rCtx.arc(cx, cy, 30, 0, Math.PI * 2); rCtx.stroke();
    rCtx.fillStyle = 'rgba(255,180,0,1)'; rCtx.beginPath(); rCtx.arc(cx, cy, 2, 0, Math.PI * 2); rCtx.fill();
  } else {
    const gap = baseGap;
    rCtx.beginPath(); rCtx.moveTo(cx, cy - gap - len); rCtx.lineTo(cx, cy - gap); rCtx.stroke();
    rCtx.beginPath(); rCtx.moveTo(cx, cy + gap); rCtx.lineTo(cx, cy + gap + len); rCtx.stroke();
    rCtx.beginPath(); rCtx.moveTo(cx - gap - len, cy); rCtx.lineTo(cx - gap, cy); rCtx.stroke();
    rCtx.beginPath(); rCtx.moveTo(cx + gap, cy); rCtx.lineTo(cx + gap + len, cy); rCtx.stroke();
    rCtx.fillStyle = 'rgba(0,255,0,0.9)'; rCtx.beginPath(); rCtx.arc(cx, cy, 1.2, 0, Math.PI * 2); rCtx.fill();
  }
  rCtx.shadowBlur = 0;
}

/* ============================================================
   ЭКИПИРОВКА
   ============================================================ */
function equipSlot(slot) {
  if (slot === 1 && !player.inventory.primary) return;
  if (slot === 4 && player.inventory.grenade <= 0) return;
  player.currentSlot = slot;
  const key = getCurrentWeaponKey();
  if (!key) return;
  for (const k in weaponModels) weaponModels[k].visible = k === key;
  const m = weaponModels[key];
  if (flashSprite.parent) flashSprite.parent.remove(flashSprite);
  flashSprite.position.copy(m.userData.muzzle); m.add(flashSprite);
  if (muzzleLight.parent) muzzleLight.parent.remove(muzzleLight);
  muzzleLight.position.copy(m.userData.muzzle); m.add(muzzleLight);
  const w = WEAPONS[key];
  player.maxAmmo = w.mag; player.ammo = w.mag; player.reserve = w.reserve;
  player.reloading = false; player._shotHeld = false;
  updateAmmoHUD(); updateSlotHUD();
}
function doReload() {
  const key = getCurrentWeaponKey(); if (!key) return;
  const w = WEAPONS[key];
  if (player.reloading || player.ammo >= w.mag || player.reserve <= 0 || key === 'knife' || key === 'grenade') return;
  player.reloading = true; player.reloadKick = 1; sndReload();
  setTimeout(() => {
    const need = w.mag - player.ammo;
    const avail = Math.min(need, player.reserve);
    player.ammo += avail; player.reserve -= avail;
    updateAmmoHUD(); player.reloading = false;
  }, 1500);
}

/* ============================================================
   КОЛЛИЗИИ
   ============================================================ */
const STEP_UP_HEIGHT = 0.55;
function resolveCollision(pos, radius, height) {
  let grounded = false;
  for (const obj of collidables) {
    if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
    const b = obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld);
    const pMinX = pos.x - radius, pMaxX = pos.x + radius;
    const pMinZ = pos.z - radius, pMaxZ = pos.z + radius;
    const pMinY = pos.y, pMaxY = pos.y + height;
    if (pMaxX <= b.min.x || pMinX >= b.max.x) continue;
    if (pMaxZ <= b.min.z || pMinZ >= b.max.z) continue;
    if (pMaxY <= b.min.y || pMinY >= b.max.y) continue;
    const obstacleTop = b.max.y;
    const feetToTop = obstacleTop - pos.y;
    if (feetToTop > 0 && feetToTop <= STEP_UP_HEIGHT + 0.05) {
      pos.y = obstacleTop + 0.001;
      grounded = true;
      continue;
    }
    const pT = b.max.y - pMinY, pB = pMaxY - b.min.y;
    const pL = pMaxX - b.min.x, pR = b.max.x - pMinX;
    const pBk = pMaxZ - b.min.z, pF = b.max.z - pMinZ;
    const m = Math.min(pT, pB, pL, pR, pBk, pF);
    if (m === pT) { pos.y = b.max.y; grounded = true; }
    else if (m === pB) { pos.y = b.min.y - height; }
    else if (m === pL) { pos.x = b.min.x - radius; }
    else if (m === pR) { pos.x = b.max.x + radius; }
    else if (m === pBk) { pos.z = b.min.z - radius; }
    else { pos.z = b.max.z + radius; }
  }
  if (pos.y < 0) { pos.y = 0; grounded = true; }
  return grounded;
}

/* ============================================================
   AI
   ============================================================ */
function lineOfSight(from, to) {
  const d = to.clone().sub(from); const dist = d.length(); d.normalize();
  raycaster.set(from, d); raycaster.far = dist;
  const hits = raycaster.intersectObjects(worldObjects, false);
  raycaster.far = 600;
  if (!hits.length) return true;
  return hits[0].distance >= dist - 0.6;
}

function updateEnemy(e, dt) {
  if (!e.alive) {
    const t = performance.now() / 1000 - e.deathTime;
    if (t < 1.2) {
      e.model.rotation.z = Math.min(Math.PI / 2, t * Math.PI / 2);
      e.model.position.y = Math.max(0.15, 0 - t * 0.4);
    }
    if (t > 5) {
      scene.remove(e.model);
      const idx = enemies.indexOf(e);
      if (idx >= 0) enemies.splice(idx, 1);
      if (GAME.state === 'LIVE' && !GAME.bombPlanted && enemies.filter(x => x.alive).length < 3) setTimeout(() => spawnEnemy(), 3000);
    }
    return;
  }
  const now = performance.now() / 1000;
  const ePos = e.model.position;
  const pEye = player.pos.clone(); pEye.y += 1.5;
  const eEye = ePos.clone(); eEye.y += 1.6;
  const toP = player.pos.clone().sub(ePos); toP.y = 0;
  const dist = toP.length();
  const sees = player.alive && dist < 45 && lineOfSight(eEye, pEye);

  if (GAME.bombPlanted && GAME.bombTimer > 0) {
    if (ePos.distanceTo(GAME.bombSite) > 1.5) {
      const dir = GAME.bombSite.clone().sub(ePos); dir.y = 0; dir.normalize();
      const np = ePos.clone().add(dir.multiplyScalar(4 * dt));
      np.y = 0; resolveCollision(np, 0.4, 1.7); np.y = 0;
      e.model.position.copy(np);
      e.model.rotation.y = Math.atan2(-dir.x, -dir.z);
    } else {
      GAME.defuseProgress += dt * 0.5;
      if (GAME.defuseProgress >= 1) {
        GAME.bombPlanted = false; bombMesh.visible = false; GAME.bombTimer = 0;
        endRound(false);
      }
    }
    return;
  }

  if (sees) { e.state = 'chase'; e.lastSeen = player.pos.clone(); }
  else if (e.state === 'chase' && (!e.lastSeen || ePos.distanceTo(e.lastSeen) < 1.5)) {
    e.state = 'patrol'; e.lastSeen = null;
    e.patrolTarget.set(ePos.x + (Math.random() - 0.5) * 25, 0, ePos.z + (Math.random() - 0.5) * 25);
  }
  let target = null, speed = 0;
  if (e.state === 'chase') {
    target = sees ? player.pos.clone() : e.lastSeen;
    speed = sees ? 4.5 : 2.5;
    if (sees && dist < 6) speed = 0;
  } else {
    target = e.patrolTarget; speed = 1.4;
    if (ePos.distanceTo(e.patrolTarget) < 1) {
      e.patrolWait += dt;
      if (e.patrolWait > 2) { e.patrolWait = 0; e.patrolTarget.set(ePos.x + (Math.random() - 0.5) * 25, 0, ePos.z + (Math.random() - 0.5) * 25); }
      speed = 0;
    }
  }
  if (target && speed > 0) {
    const dir = target.clone().sub(ePos); dir.y = 0;
    if (dir.length() > 0.5) {
      dir.normalize();
      const np = ePos.clone().add(dir.clone().multiplyScalar(speed * dt));
      np.y = 0; resolveCollision(np, 0.4, 1.7); np.y = 0;
      e.model.position.copy(np);
      const tYaw = Math.atan2(-dir.x, -dir.z);
      let dy = tYaw - e.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      e.yaw += dy * Math.min(1, dt * 6);
      e.model.rotation.y = e.yaw;
    }
  }
  if (sees) {
    const tYaw = Math.atan2(-toP.x, -toP.z);
    let dy = tYaw - e.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    e.yaw += dy * Math.min(1, dt * 8);
    e.model.rotation.y = e.yaw;
  }
  if (sees && dist < 30 && now - e.lastShot > e.cooldown) {
    if (!e.aimStart) e.aimStart = now;
    if (now - e.aimStart < 0.6) return;
    e.lastShot = now; e.cooldown = 1.5 + Math.random() * 1.5;
    sndShot('rifle');
    const hitChance = Math.max(0.05, 0.5 - dist * 0.015);
    if (Math.random() < hitChance) damagePlayer(8 + Math.random() * 8, ePos.clone());
    const mz = ePos.clone(); mz.y += 1.3;
    const tg = pEye.clone(); tg.x += (Math.random() - 0.5) * 1.5; tg.y += (Math.random() - 0.5) * 1.5; tg.z += (Math.random() - 0.5) * 1.5;
    addTracer(mz, tg, 0xff8844, 0.06);
  } else if (!sees) { e.aimStart = null; }
}

/* ============================================================
   ИГРОК
   ============================================================ */
function updatePlayer(dt) {
  if (!player.alive || GAME.state === 'LOBBY') return;
  const key = getCurrentWeaponKey();
  const w = key ? WEAPONS[key] : null;
  const sprint = keys['ShiftLeft'];
  const isAwp = key === 'awp' || key === 'ssg08';
  const aimSlow = player.aim ? 0.5 : 1;
  const speed = (sprint ? 2.6 : 5.5) * aimSlow;

  const fwd = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const rgt = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const move = new THREE.Vector3();
  if (locked) {
    if (keys['KeyW']) move.add(fwd);
    if (keys['KeyS']) move.sub(fwd);
    if (keys['KeyD']) move.add(rgt);
    if (keys['KeyA']) move.sub(rgt);
  }
  const moving = move.lengthSq() > 0;
  if (moving) {
    move.normalize();
    player.vel.x = move.x * speed;
    player.vel.z = move.z * speed;
    player.bob += dt * (sprint ? 5 : 9);
    player.stepTimer += dt;
    const stepTime = sprint ? 0.5 : 0.34;
    if (player.stepTimer > stepTime && player.onGround) { sndStep(sprint); player.stepTimer = 0; }
  } else {
    player.vel.x *= 0.82; player.vel.z *= 0.82;
    player.bob += dt * 2;
  }
  if (keys['Space'] && player.onGround) { player.vel.y = 7.2; player.onGround = false; }
  player.vel.y -= 18 * dt;
  const np = player.pos.clone();
  np.x += player.vel.x * dt; np.y += player.vel.y * dt; np.z += player.vel.z * dt;
  const grounded = resolveCollision(np, player.radius, player.height);
  if (grounded) player.vel.y = 0;
  player.onGround = grounded;
  player.pos.copy(np);

  if (player.lastDamageTime && performance.now() / 1000 - player.lastDamageTime > 5 && player.health < player.maxHealth) {
    player.health += 2 * dt; updateHealthHUD();
  }
  player.recoilPitch *= 0.86; player.recoilYaw *= 0.86;
  player.shake = Math.max(0, player.shake - dt * 6);
  const bob = Math.sin(player.bob) * (moving ? 0.04 : 0.012);
  const shakeX = (Math.random() - 0.5) * player.shake * 0.06;
  const shakeY = (Math.random() - 0.5) * player.shake * 0.06;
  camera.position.set(player.pos.x + shakeX, player.pos.y + player.height + bob + shakeY, player.pos.z);
  camera.rotation.set(player.pitch + player.recoilPitch, player.yaw + player.recoilYaw, 0);

  let targetFov = 75;
  if (player.aim) {
    if (isAwp) targetFov = 20;
    else if (key === 'knife' || key === 'grenade') targetFov = 75;
    else targetFov = 55;
  }
  player.targetFov = targetFov;
  player.currentFov += (player.targetFov - player.currentFov) * Math.min(1, dt * 10);
  camera.fov = player.currentFov;
  camera.updateProjectionMatrix();

  const vig = document.getElementById('vignette');
  if (player.aim) vig.style.background = 'radial-gradient(ellipse at center,transparent 20%,rgba(0,0,0,0.85) 80%)';
  else vig.style.background = 'radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,0.6) 100%)';

  player.weaponKick *= Math.pow(0.0005, dt);
  player.reloadKick *= Math.pow(0.0001, dt);
  const vm = VIEWMODEL_POS[key] || [0.15, -0.2, -0.35];
  const aimTarget = isAwp ? [0, -0.15, -0.2] : [0, -0.09, -0.28];
  const aimOff = player.aim ? 1 : 0;
  const basePos = new THREE.Vector3(vm[0] + (aimTarget[0] - vm[0]) * aimOff, vm[1] + (aimTarget[1] - vm[1]) * aimOff, vm[2] + (aimTarget[2] - vm[2]) * aimOff);
  const yawDelta = player.yaw - player.prevYaw; player.prevYaw = player.yaw;
  player.lookVelY = player.lookVelY * 0.85 + yawDelta * 0.15;
  const kickZ = player.weaponKick * 0.09;
  const kickRotX = player.weaponKick * 0.18;
  const reloadDrop = player.reloadKick * 0.15;
  const target = new THREE.Vector3(basePos.x, basePos.y - reloadDrop, basePos.z + kickZ);
  weaponGroup.position.lerp(target, Math.min(1, dt * 14));
  weaponGroup.position.x += Math.sin(player.bob * 0.5) * 0.008 - player.lookVelY * 1.2;
  weaponGroup.position.y += Math.abs(Math.cos(player.bob * 0.5)) * 0.006;
  weaponGroup.rotation.x = -kickRotX + player.reloadKick * 0.3;
  weaponGroup.rotation.y = (vm[1] || 0) - player.lookVelY * 6;
  weaponGroup.rotation.z = Math.sin(player.bob * 0.5) * 0.01;

  if (keys['KeyR']) { keys['KeyR'] = false; doReload(); }
  if (shooting && locked && player.alive && (GAME.state === 'LIVE' || GAME.state === 'BUY')) {
    if (w && w.auto) fireWeapon();
    else if (!player._shotHeld) { fireWeapon(); player._shotHeld = true; }
  }
  if (!shooting) player._shotHeld = false;

  if (keys['KeyE'] && GAME.state === 'LIVE' && !GAME.bombPlanted && player.pos.distanceTo(GAME.bombSite) < 2.5) {
    player.isPlanting = true; player.plantProgress += dt;
    const bar = document.getElementById('planting-bar'); bar.style.display = 'block';
    document.getElementById('planting-fill').style.width = Math.min(100, (player.plantProgress / 3) * 100) + '%';
    if (player.plantProgress >= 3) {
      GAME.bombPlanted = true; GAME.bombTimer = 40;
      bombMesh.visible = true; bombMesh.position.copy(player.pos); bombMesh.position.y = 0.075;
      sndPlant();
      document.getElementById('bomb-status').style.display = 'block';
      document.getElementById('bomb-status').textContent = 'BOMB PLANTED';
      bar.style.display = 'none'; player.isPlanting = false; player.plantProgress = 0;
    }
  } else {
    if (player.isPlanting) { player.isPlanting = false; player.plantProgress = 0; document.getElementById('planting-bar').style.display = 'none'; }
  }
}

function damagePlayer(dmg, attackerPos) {
  if (!player.alive) return;
  if (player.armor > 0) { const armorDmg = Math.min(player.armor, dmg * 0.5); player.armor -= armorDmg; dmg -= armorDmg * 0.5; }
  player.health -= dmg; player.lastDamageTime = performance.now() / 1000;
  updateHealthHUD(); flashDamage(); sndHurt();
  player.shake = Math.min(1.5, player.shake + 0.8);
  if (attackerPos) showDamageFrom(attackerPos);
  if (player.health <= 0) {
    player.health = 0; player.alive = false; updateHealthHUD(); document.exitPointerLock();
    document.getElementById('death-msg').textContent = GAME.bombPlanted ? 'BOMB WAS DEFUSED' : 'MISSION FAILED';
    document.getElementById('final-score').textContent = `SCORE: ${GAME.score} · KILLS: ${GAME.kills}`;
    document.getElementById('death-screen').style.display = 'flex';
  }
}

/* ============================================================
   РАУНДЫ
   ============================================================ */
function startRound() {
  GAME.round++; GAME.state = 'BUY'; GAME.timer = 15;
  GAME.bombPlanted = false; GAME.bombTimer = 0; bombMesh.visible = false; GAME.defuseProgress = 0;
  player.health = player.maxHealth; player.armor = 0; player.alive = true;
  const spawns = player.team === 'T' ? SPAWNS_T : SPAWNS_CT;
  if (spawns.length) {
    const sp = spawns[Math.floor(Math.random() * spawns.length)];
    const startPos = new THREE.Vector3(sp[0], 0.2, sp[2]);
    resolveCollision(startPos, player.radius, player.height);
    player.pos.copy(startPos);
  }
  player.vel.set(0, 0, 0);
  player.yaw = Math.PI; player.pitch = 0;
  if (!player.inventory.primary) player.inventory.primary = 'ak47';
  player.inventory.grenade = 0;
  player.inventory.secondary = 'glock';
  equipSlot(2);
  for (const e of enemies) scene.remove(e.model);
  enemies.length = 0;
  document.getElementById('death-screen').style.display = 'none';
  document.getElementById('bomb-status').style.display = 'none';
  document.getElementById('round-timer').textContent = '00:15';
  document.getElementById('round-timer').style.color = '#6f6';
  updateHUD(); updateSlotHUD();
  renderer.domElement.requestPointerLock();
}
function startLive() {
  GAME.state = 'LIVE'; GAME.timer = 115;
  document.getElementById('round-timer').style.color = '#fff';
  for (let i = 0; i < 3; i++) spawnEnemy();
}
function endRound(win) {
  GAME.state = 'END'; GAME.timer = 5;
  if (win) { GAME.money = Math.min(16000, GAME.money + 3250); document.getElementById('round-timer').textContent = 'T WIN'; }
  else { GAME.money = Math.min(16000, GAME.money + 1400); document.getElementById('round-timer').textContent = 'CT WIN'; }
  document.getElementById('round-timer').style.color = win ? '#6f6' : '#f44';
  updateHUD(); setTimeout(startRound, 5000);
}

/* ============================================================
   МАГАЗИН
   ============================================================ */
const buyMenuEl = document.getElementById('buy-menu');
const buyTabsEl = document.getElementById('buy-tabs');
const buyItemsEl = document.getElementById('buy-items');
let currentBuyCat = 'pistol';

const BUY_CATEGORIES = [
  { id: 'pistol', name: 'ПИСТОЛЕТЫ' }, { id: 'smg', name: 'ПП' }, { id: 'rifle', name: 'ВИНТОВКИ' },
  { id: 'sniper', name: 'СНАЙПЕР' }, { id: 'shotgun', name: 'ДРОБОВИКИ' }, { id: 'lmg', name: 'ПУЛЕМЁТЫ' }, { id: 'gear', name: 'ЭКИП' }
];
const BUY_ITEMS = {};
WEAPON_ORDER.forEach(id => {
  const w = WEAPONS[id];
  if (w.cat === 'nade' || w.cat === 'melee') return;
  const cat = w.cat === 'pistol' ? 'pistol' : w.cat === 'smg' ? 'smg' : w.cat === 'rifle' ? 'rifle' : w.cat === 'sniper' ? 'sniper' : w.cat === 'shotgun' ? 'shotgun' : 'lmg';
  if (!BUY_ITEMS[cat]) BUY_ITEMS[cat] = [];
  BUY_ITEMS[cat].push({ id, name: w.name, price: w.price, desc: w.cat.toUpperCase() });
});
BUY_ITEMS.gear = [
  { id: 'armor', name: 'KEVLAR + HELMET', price: 1000, desc: 'Поглощает 50% урона', type: 'armor' },
  { id: 'grenade', name: 'HE GRENADE', price: 300, desc: 'Взрыв, 98 урона', type: 'grenade' }
];

function renderBuyTabs() {
  buyTabsEl.innerHTML = '';
  BUY_CATEGORIES.forEach(cat => {
    if (!BUY_ITEMS[cat.id]) return;
    const e = document.createElement('div');
    e.className = 'buy-tab' + (cat.id === currentBuyCat ? ' active' : '');
    e.textContent = cat.name;
    e.onclick = () => { currentBuyCat = cat.id; renderBuyTabs(); renderBuyItems(); };
    buyTabsEl.appendChild(e);
  });
}
function isItemOwned(item) {
  if (item.type === 'armor') return player.armor >= 100;
  if (item.type === 'grenade') return false;
  if (WEAPONS[item.id]) {
    if (WEAPONS[item.id].slot === 1) return player.inventory.primary === item.id;
    if (WEAPONS[item.id].slot === 2) return player.inventory.secondary === item.id;
  }
  return false;
}
function renderBuyItems() {
  buyItemsEl.innerHTML = '';
  const items = BUY_ITEMS[currentBuyCat] || [];
  items.forEach(item => {
    const e = document.createElement('div');
    const owned = isItemOwned(item);
    e.className = 'buy-item' + (GAME.money < item.price || owned ? ' disabled' : '');
    e.innerHTML = `<div class="name">${item.name}</div><div class="desc">${item.desc}</div><div class="price">$${item.price}</div>${owned ? '<div class="owned">В РУКАХ</div>' : ''}`;
    if (GAME.money >= item.price && !owned) e.onclick = () => buyItem(item);
    buyItemsEl.appendChild(e);
  });
}
function buyItem(item) {
  GAME.money -= item.price;
  if (item.type === 'armor') { player.armor = 100; player.helmet = true; }
  else if (item.type === 'grenade') { player.inventory.grenade++; equipSlot(4); }
  else if (WEAPONS[item.id]) {
    if (WEAPONS[item.id].slot === 1) { player.inventory.primary = item.id; player.currentSlot = 1; equipSlot(1); }
    if (WEAPONS[item.id].slot === 2) { player.inventory.secondary = item.id; player.currentSlot = 2; equipSlot(2); }
  }
  sndBuy();
  document.getElementById('buy-money').textContent = `$${GAME.money}`;
  updateHUD(); updateSlotHUD(); updateAmmoHUD();
  renderBuyItems();
}
function openBuyMenu() {
  if (GAME.state !== 'BUY' && GAME.state !== 'LIVE') return;
  buyMenuEl.style.display = 'flex'; document.exitPointerLock();
  document.getElementById('buy-money').textContent = `$${GAME.money}`;
  if (!BUY_ITEMS[currentBuyCat]) currentBuyCat = 'pistol';
  renderBuyTabs(); renderBuyItems();
}
function closeBuyMenu() { buyMenuEl.style.display = 'none'; renderer.domElement.requestPointerLock(); }

/* ============================================================
   ВВОД
   ============================================================ */
const pauseScreen = document.getElementById('pause-screen');
const lobbyEl = document.getElementById('lobby');
const deathScreen = document.getElementById('death-screen');

window.addEventListener('keydown', (e) => {
  if (GAME.state === 'LOBBY') return;
  if (e.ctrlKey || e.metaKey) {
    const blocked = ['KeyW','KeyA','KeyS','KeyD','KeyR','KeyQ','KeyE','KeyF','KeyC','KeyV','Space'];
    if (blocked.includes(e.code)) {
      e.preventDefault(); e.stopPropagation();
      if (e.code === 'KeyW') { ctrlWBlocked = true; setTimeout(() => ctrlWBlocked = false, 150); }
    }
  } else if (e.code === 'Space') { e.preventDefault(); }
}, true);
window.addEventListener('keyup', e => { keys[e.code] = false; }, true);
addEventListener('beforeunload', (e) => { if (!player.alive) return; if (!ctrlWBlocked && !locked) return; e.preventDefault(); e.returnValue = ''; return ''; });
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === renderer.domElement;
  if (locked) { pauseScreen.style.display = 'none'; ensureAudio(); }
  else { shooting = false; if (GAME.state !== 'LOBBY' && player.alive && buyMenuEl.style.display !== 'flex') pauseScreen.style.display = 'flex'; }
});
pauseScreen.addEventListener('click', () => renderer.domElement.requestPointerLock());

document.addEventListener('mousemove', e => {
  if (!locked) return;
  const sens = player.aim ? ((getCurrentWeaponKey() === 'awp' || getCurrentWeaponKey() === 'ssg08') ? 0.0007 : 0.0015) : 0.0022;
  player.yaw -= e.movementX * sens;
  player.pitch -= e.movementY * sens;
  player.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, player.pitch));
});

document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!locked && buyMenuEl.style.display !== 'flex') return;
  if (e.code === 'KeyB') { if (buyMenuEl.style.display === 'flex') closeBuyMenu(); else openBuyMenu(); }
  if (e.code === 'Escape' && buyMenuEl.style.display === 'flex') closeBuyMenu();
  if (e.code === 'KeyG') { player.health = 9999; player.maxHealth = 9999; updateHealthHUD(); }
  if (e.code === 'Digit1') equipSlot(1);
  if (e.code === 'Digit2') equipSlot(2);
  if (e.code === 'Digit3') equipSlot(3);
  if (e.code === 'Digit4') equipSlot(4);
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('mousedown', e => {
  if (!locked) { if (GAME.state !== 'LOBBY' && player.alive && buyMenuEl.style.display !== 'flex') renderer.domElement.requestPointerLock(); return; }
  if (e.button === 0) { shooting = true; player._shotHeld = false; }
  if (e.button === 2) player.aim = true;
});
document.addEventListener('mouseup', e => {
  if (e.button === 0) shooting = false;
  if (e.button === 2) player.aim = false;
});

/* ============================================================
   ЛОББИ
   ============================================================ */
const previewCanvas = document.getElementById('preview');
const previewRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias: true, alpha: true });
previewRenderer.setSize(360, 270, false);
previewRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
previewRenderer.outputEncoding = THREE.sRGBEncoding;
const previewScene = new THREE.Scene();
const previewCamera = new THREE.PerspectiveCamera(35, 360 / 270, 0.01, 10);
previewCamera.position.set(0, 0.15, 1.7);
previewCamera.lookAt(0, 0, 0);
const pL1 = new THREE.DirectionalLight(0xffffff, 2.5); pL1.position.set(2, 3, 4); previewScene.add(pL1);
const pL2 = new THREE.DirectionalLight(0x88aaff, 1.2); pL2.position.set(-3, 1, -2); previewScene.add(pL2);
previewScene.add(new THREE.AmbientLight(0x506070, 0.6));
const previewWeaponGroup = new THREE.Group();
previewScene.add(previewWeaponGroup);
let previewIndex = WEAPON_ORDER.indexOf('ak47');
let selectedMap = 'FOUNDRY';
let selectedTeam = 'T';

function showPreviewWeapon(idx) {
  previewIndex = ((idx % WEAPON_ORDER.length) + WEAPON_ORDER.length) % WEAPON_ORDER.length;
  previewWeaponGroup.clear();
  const type = WEAPON_ORDER[previewIndex];
  const m = buildWeaponMesh(type);
  m.scale.setScalar(2.0); m.position.set(0, -0.05, 0); m.rotation.set(0.1, 0.3, 0);
  previewWeaponGroup.add(m);
  const w = WEAPONS[type];
  document.getElementById('wname').textContent = w.name;
  document.getElementById('wcat').textContent = w.cat.toUpperCase();
  const setBar = (id, val, max, text) => {
    document.getElementById(id).style.width = Math.min(100, val / max * 100) + '%';
    document.getElementById('v-' + id.split('-')[1]).textContent = text;
  };
  setBar('s-dmg', w.dmg * (w.pellets || 1), 300, w.pellets ? `${w.dmg}×${w.pellets}` : w.dmg);
  setBar('s-rate', 1 / w.rate, 15, Math.round(60 / w.rate) + 'rpm');
  setBar('s-acc', 0.1 - w.spread, 0.1, Math.round((1 - w.spread / 0.1) * 100) + '%');
  setBar('s-mag', w.mag, 150, w.mag);
}
document.getElementById('prev-w').onclick = () => showPreviewWeapon(previewIndex - 1);
document.getElementById('next-w').onclick = () => showPreviewWeapon(previewIndex + 1);

function buildMapSelector() {
  const ms = document.getElementById('map-selector');
  ms.innerHTML = '';
  Object.keys(MAPS).forEach(mapName => {
    const btn = document.createElement('button');
    btn.className = 'map-btn' + (mapName === selectedMap ? ' active' : '');
    btn.textContent = mapName;
    btn.onclick = () => {
      selectedMap = mapName;
      document.querySelectorAll('.map-btn').forEach(b => b.classList.toggle('active', b.textContent === mapName));
    };
    ms.appendChild(btn);
  });
}
document.querySelectorAll('.team-btn').forEach(btn => {
  btn.onclick = () => {
    selectedTeam = btn.dataset.team;
    document.querySelectorAll('.team-btn').forEach(b => b.classList.toggle('active', b === btn));
  };
});

/* ============================================================
   ЗАГРУЗКА КАРТЫ
   ============================================================ */
function loadMap(mapName) {
  for (const o of worldObjects) scene.remove(o);
  for (const o of collidables) scene.remove(o);
  for (const o of decals) scene.remove(o);
  for (const l of mapLights) scene.remove(l);
  for (const e of enemies) scene.remove(e.model);
  for (const d of dustParticles) scene.remove(d);
  dustParticles.length = 0;
  enemies.length = 0;
  worldObjects.length = 0; collidables.length = 0; decals.length = 0; mapLights.length = 0;

  const m = MAPS[mapName];
  GAME.currentMap = mapName;
  GAME.bombSite = new THREE.Vector3(...m.bombSite);
  bombSitePos = new THREE.Vector3(...m.bombSite);
  SPAWNS_T = m.spawnsT;
  SPAWNS_CT = m.spawnsCT;
  scene.fog = new THREE.Fog(m.fog, m.size * 0.8, m.size * 2.5);
  sun.color.setHex(m.sunColor);
  sun.intensity = m.sunIntensity;
  skyMat.uniforms.bottomColor.value.setHex(m.fog);
  skyMat.uniforms.topColor.value.setHex(m.bg);
  createBombRing();
  m.build();
  currentMapData = m;

  const dustGeo = new THREE.BufferGeometry();
  const dustCount = 300;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * m.size;
    dustPos[i * 3 + 1] = Math.random() * 8;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * m.size;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0xffddbb, size: 0.08, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);
  dustParticles.push(dust);
}

/* ============================================================
   DEPLOY
   ============================================================ */
document.getElementById('deploy').onclick = () => {
  ensureAudio();
  player.team = selectedTeam; GAME.playerTeam = selectedTeam;
  GAME.state = 'BUY'; GAME.timer = 15; GAME.round = 1; GAME.money = 800;
  GAME.score = 0; GAME.kills = 0;
  lobbyEl.style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  document.getElementById('reticle-canvas').style.display = 'block';
  loadMap(selectedMap);

  const selectedWeaponId = WEAPON_ORDER[previewIndex];
  const isPrimary = WEAPONS[selectedWeaponId] && WEAPONS[selectedWeaponId].slot === 1;
  player.inventory.primary = isPrimary ? selectedWeaponId : 'ak47';
  player.inventory.secondary = 'glock';
  player.inventory.grenade = 0;
  player.health = player.maxHealth;
  player.alive = true;

  const spawns = player.team === 'T' ? SPAWNS_T : SPAWNS_CT;
  if (spawns.length) {
    const startPos = new THREE.Vector3(spawns[0][0], 0.2, spawns[0][2]);
    resolveCollision(startPos, player.radius, player.height);
    player.pos.copy(startPos);
  }
  equipSlot(2);
  const slotsContainer = document.getElementById('weapon-slots');
  slotsContainer.innerHTML = '';
  [{ s: 1, label: 'PRI' }, { s: 2, label: 'SEC' }, { s: 3, label: 'KNF' }, { s: 4, label: 'NADE' }].forEach(sl => {
    const el = document.createElement('div');
    el.className = 'slot';
    el.innerHTML = `<div class="key">${sl.s}</div><div>${sl.label}</div>`;
    slotsContainer.appendChild(el);
    WEAPON_SLOTS[sl.s] = { el };
  });
  updateHUD(); updateSlotHUD(); updateAmmoHUD();
  renderer.domElement.requestPointerLock();
  document.documentElement.requestFullscreen?.().catch(() => {});
};

document.getElementById('retry').onclick = () => { deathScreen.style.display = 'none'; startRound(); };
document.getElementById('main-menu').onclick = () => {
  GAME.state = 'LOBBY';
  player.alive = true;
  player.health = player.maxHealth;
  player.armor = 0;
  for (const o of worldObjects) scene.remove(o);
  for (const o of collidables) scene.remove(o);
  for (const o of decals) scene.remove(o);
  for (const l of mapLights) scene.remove(l);
  for (const e of enemies) scene.remove(e.model);
  for (const d of dustParticles) scene.remove(d);
  dustParticles.length = 0;
  enemies.length = 0; worldObjects.length = 0; collidables.length = 0; decals.length = 0; mapLights.length = 0;
  deathScreen.style.display = 'none';
  document.getElementById('hud').style.display = 'none';
  document.getElementById('reticle-canvas').style.display = 'none';
  pauseScreen.style.display = 'none';
  document.getElementById('bomb-status').style.display = 'none';
  lobbyEl.style.display = 'flex';
  document.exitPointerLock();
};

/* ============================================================
   ЦИКЛ
   ============================================================ */
let last = performance.now();
let skyTime = 0;
function loop() {
  requestAnimationFrame(loop);
  updateFPS(performance.now());
  if (GAME.state === 'LOBBY') {
    previewWeaponGroup.rotation.y += 0.008;
    previewRenderer.render(previewScene, previewCamera);
    return;
  }
  const now = performance.now();
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  skyTime += dt;
  skyMat.uniforms.time.value = skyTime;

  if (GAME.state !== 'END' && locked) {
    if (GAME.timer > 0) {
      GAME.timer -= dt;
      const mins = Math.floor(GAME.timer / 60);
      const secs = Math.floor(GAME.timer % 60);
      document.getElementById('round-timer').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      if (GAME.state === 'BUY' && GAME.timer <= 0) startLive();
      if (GAME.state === 'LIVE' && GAME.timer <= 0 && !GAME.bombPlanted) endRound(false);
    }
    if (GAME.bombPlanted && GAME.state === 'LIVE') {
      GAME.bombTimer -= dt;
      document.getElementById('bomb-status').textContent = `BOMB: ${Math.ceil(GAME.bombTimer)}s`;
      if (GAME.bombTimer <= 0) {
        sndExplosion(); bombMesh.visible = false; endRound(true);
        if (player.pos.distanceTo(GAME.bombSite) < 10) damagePlayer(200, null);
      }
    }
    updatePlayer(dt);
    for (const e of enemies) updateEnemy(e, dt);
    updateGrenades(dt);
  }
  for (let i = tracers.length - 1; i >= 0; i--) { const t = tracers[i]; t.life -= dt; t.mesh.material.opacity = Math.max(0, t.life / t.maxLife); if (t.life <= 0) { scene.remove(t.mesh); tracers.splice(i, 1); } }
  for (let i = impacts.length - 1; i >= 0; i--) {
    const im = impacts[i]; im.life -= dt;
    const arr = im.mesh.geometry.attributes.position.array;
    for (let j = 0; j < im.vel.length; j++) { arr[j * 3] += im.vel[j].x * dt; arr[j * 3 + 1] += im.vel[j].y * dt; arr[j * 3 + 2] += im.vel[j].z * dt; im.vel[j].y -= 9.8 * dt; }
    im.mesh.geometry.attributes.position.needsUpdate = true;
    im.mesh.material.opacity = im.life / im.max;
    if (im.life <= 0) { scene.remove(im.mesh); impacts.splice(i, 1); }
  }
  for (let i = casings.length - 1; i >= 0; i--) {
    const c = casings[i]; c.life -= dt;
    c.mesh.position.addScaledVector(c.vel, dt); c.vel.y -= 12 * dt;
    c.mesh.rotation.x += c.rot.x * dt; c.mesh.rotation.y += c.rot.y * dt; c.mesh.rotation.z += c.rot.z * dt;
    if (c.mesh.position.y < 0.01) { c.mesh.position.y = 0.01; c.vel.multiplyScalar(0.3); c.vel.y = 0; }
    if (c.life <= 0) { scene.remove(c.mesh); casings.splice(i, 1); }
  }
  for (let i = dmgDirs.length - 1; i >= 0; i--) { const d = dmgDirs[i]; d.life -= dt; d.el.style.opacity = Math.max(0, d.life / 1.2); if (d.life <= 0) { d.el.remove(); dmgDirs.splice(i, 1); } }
  muzzleLight.intensity *= 0.7;
  if (muzzleLight.intensity < 0.1) { muzzleLight.intensity = 0; flashSprite.visible = false; }
  if (hitTimer > 0) { hitTimer -= dt; if (hitTimer <= 0) document.getElementById('hit-marker').style.opacity = '0'; }
  sun.position.set(player.pos.x + 40, 60, player.pos.z + 20);
  sun.target.position.set(player.pos.x, 0, player.pos.z);
  drawReticle();
  renderer.render(scene, camera);
}

/* ============================================================
   СТАРТ (запуск через onTexReady)
   ============================================================ */
document.getElementById('hud').style.display = 'none';
document.getElementById('reticle-canvas').style.display = 'none';
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  resizeReticle();
});
// loop() и lobby запустятся после загрузки текстур (в onTexReady)