(function() {
'use strict';

const { h, render } = preact;
const { useState, useEffect, useRef, useCallback, useMemo } = preactHooks;
const html = htm.bind(h);

/* ═══════════════════ КОНСТАНТЫ ═══════════════════ */
const BPM = 120;
const BEAT = 60 / BPM;
const ONE_BAR = BEAT * 4;
const LOOP_BARS = 4;
const LOOP_SECONDS = ONE_BAR * LOOP_BARS;
const TAU = Math.PI * 2;
const DEFAULT_VOL = 0.7;
const DEFAULT_CUTOFF = 20000;
const PREVIEW_SECONDS = 4;

/* ═══════════════════ ЛОКАЛЬНЫЙ PRNG ═══════════════════ */
function makePrng(seed) {
  let s = (seed >>> 0) || 0x9E3779B9;
  return function() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ═══════════════════ НОТЫ ═══════════════════ */
const N = {
  A1: 55, C2: 65.41, D2: 73.42, E2: 82.41, G2: 98,
  A2: 110, C3: 130.81, D3: 146.83, E3: 164.81, G3: 196,
  A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392,
  A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
  A5: 880, C6: 1046.50, E6: 1318.51
};

/* ═══════════════════ AUDIO UTILS ═══════════════════ */
function adsr(i, n, attack, decay, sustain, release) {
  const t = i / n;
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < 1 - release) return sustain;
  return sustain * Math.max(0, (1 - t) / release);
}
function softClip(x, drive) {
  drive = drive || 1.5;
  const d = Math.tanh(drive);
  return Math.tanh(x * drive) / (d || 1);
}
function hann(n, i) { return 0.5 - 0.5 * Math.cos(TAU * i / n); }
function applyFade(d, sr, ms) {
  ms = ms || 8;
  const n = d.length;
  let f = Math.floor(sr * ms / 1000);
  f = Math.min(f, Math.floor(n / 2));
  if (f <= 0) return;
  for (let i = 0; i < f; i++) {
    const k = i / f;
    d[i] *= k;
    d[n - 1 - i] *= k;
  }
}
function normalize(d, peak) {
  peak = peak || 0.7;
  let p = 0;
  for (let i = 0; i < d.length; i++) {
    const a = d[i] < 0 ? -d[i] : d[i];
    if (a > p) p = a;
  }
  if (p > 1e-6) {
    const g = peak / p;
    for (let i = 0; i < d.length; i++) d[i] *= g;
  }
}
function dcBlock(d) {
  let pIn = 0, pOut = 0;
  const R = 0.995;
  for (let i = 0; i < d.length; i++) {
    const x = d[i];
    const y = x - pIn + R * pOut;
    pIn = x;
    pOut = y;
    d[i] = y;
  }
}
function lp1(d, sr, cut) {
  const dt = 1 / sr;
  const rc = 1 / (TAU * cut);
  const a = dt / (rc + dt);
  let y = 0;
  for (let i = 0; i < d.length; i++) { y += a * (d[i] - y); d[i] = y; }
}
function hp1(d, sr, cut) {
  const dt = 1 / sr;
  const rc = 1 / (TAU * cut);
  const a = rc / (rc + dt);
  let pIn = 0, pOut = 0;
  for (let i = 0; i < d.length; i++) {
    const x = d[i];
    const y = a * (pOut + x - pIn);
    pIn = x;
    pOut = y;
    d[i] = y;
  }
}
function comb(d, sr, delayMs, fb) {
  const delay = Math.floor(sr * delayMs / 1000);
  const buf = new Float32Array(delay);
  let idx = 0;
  for (let i = 0; i < d.length; i++) {
    const out = buf[idx];
    buf[idx] = d[i] + out * fb;
    d[i] = d[i] + out * 0.5;
    idx = (idx + 1) % delay;
  }
}
function allpass(d, sr, delayMs, fb) {
  const delay = Math.floor(sr * delayMs / 1000);
  const buf = new Float32Array(delay);
  let idx = 0;
  for (let i = 0; i < d.length; i++) {
    const bOut = buf[idx];
    const out = -d[i] + bOut;
    buf[idx] = d[i] + bOut * fb;
    d[i] = out;
    idx = (idx + 1) % delay;
  }
}
function schroederReverb(d, sr, mix) {
  mix = mix || 0.22;
  const dry = new Float32Array(d);
  comb(d, sr, 29.7, 0.76); comb(d, sr, 37.1, 0.72);
  comb(d, sr, 41.1, 0.70); comb(d, sr, 43.7, 0.68);
  allpass(d, sr, 5.0, 0.7); allpass(d, sr, 1.7, 0.7);
  for (let i = 0; i < d.length; i++) d[i] = dry[i] * (1 - mix) + d[i] * mix * 0.6;
}
function makeStereo(ctx, mono, pan) {
  pan = pan || 0;
  const sr = ctx.sampleRate;
  const L = new Float32Array(mono.length);
  const R = new Float32Array(mono.length);
  const gL = Math.cos((pan + 1) * Math.PI / 4);
  const gR = Math.sin((pan + 1) * Math.PI / 4);
  const haas = Math.floor(sr * 0.0006);
  for (let i = 0; i < mono.length; i++) {
    L[i] = mono[i] * gL;
    R[i] = (i >= haas ? mono[i - haas] : 0) * gR;
  }
  const buf = ctx.createBuffer(2, mono.length, sr);
  buf.copyToChannel(L, 0);
  buf.copyToChannel(R, 1);
  return buf;
}
function toBuf(ctx, len) {
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  return { buf: b, d: b.getChannelData(0), sr: ctx.sampleRate, len: len };
}
function bars(len, sr) {
  const barS = Math.floor(ONE_BAR * sr);
  return { barS: barS, totalBars: Math.ceil(len / barS) };
}
function sawBl(freq, sr, phase) {
  const t = (phase / TAU) % 1;
  const dt = freq / sr;
  let v = 2 * t - 1;
  if (t < dt) { const x = t / dt; v -= x + x - x * x - 1; }
  else if (t > 1 - dt) { const x = (t - 1) / dt; v -= x * x + x + x + 1; }
  return v;
}
function makeReverbIR(ctx, dur, decay) {
  dur = dur || 2.2;
  decay = decay || 2.2;
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * dur);
  const ir = ctx.createBuffer(2, len, sr);
  const rng = makePrng(0xDEADBEEF);
  const noise = () => rng() * 2 - 1;
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const env = Math.pow(1 - i / len, decay);
      data[i] = noise() * env * 0.6;
    }
    lp1(data, sr, 8000);
    hp1(data, sr, 130);
  }
  return ir;
}

/* ═══════════════════ ГЕНЕРАТОРЫ (с локальным rng) ═══════════════════ */
function genMelody(ctx, len, opts, rng) {
  const notes = opts.notes;
  const beats = opts.beats;
  const wave = opts.wave || 'saw';
  const env = opts.env || [0.02, 0.15, 0.65, 0.15];
  const detune = opts.detune || 0;
  const filter = opts.filter || 0;
  const drive = opts.drive || 1.4;
  const pan = opts.pan || 0;
  const reverb = opts.reverb || 0;
  const vibrato = opts.vibrato || 0;
  const sr = ctx.sampleRate;
  const mono = new Float32Array(len);
  const b = bars(len, sr);
  let noteIdx = 0;
  for (let bar = 0; bar < b.totalBars; bar++) {
    for (let bi = 0; bi < beats.length; bi++) {
      const beatDef = beats[bi];
      const beatPos = typeof beatDef === 'number' ? beatDef : beatDef.t;
      const fTarget = typeof beatDef === 'number' ? notes[noteIdx++ % notes.length] : beatDef.f;
      const off = Math.floor(bar * b.barS + beatPos * BEAT * sr);
      const dur = (typeof beatDef === 'object' && beatDef.d) ? beatDef.d : 0.9;
      const n = Math.floor(sr * BEAT * dur);
      let p1 = 0, p2 = 0, p3 = 0, lp = 0, vibPhase = 0;
      for (let i = 0; i < n && off + i < len; i++) {
        const t = i / sr;
        const envV = adsr(i, n, env[0], env[1], env[2], env[3]);
        let vib = 1;
        if (vibrato > 0) {
          vibPhase += TAU * 5.5 / sr;
          vib = 1 + Math.sin(vibPhase) * vibrato;
        }
        const f = fTarget * vib;
        let s = 0;
        if (wave === 'saw') {
          p1 += TAU * f / sr;
          p2 += TAU * f * (1 + detune) / sr;
          p3 += TAU * f * (1 - detune) / sr;
          const s1 = sawBl(f, sr, p1);
          const s2 = detune ? sawBl(f * (1 + detune), sr, p2) : 0;
          const s3 = detune ? sawBl(f * (1 - detune), sr, p3) : 0;
          s = (s1 + s2 + s3) / (detune ? 2.5 : 1);
        } else if (wave === 'sine') {
          p1 += TAU * f / sr;
          s = Math.sin(p1);
        } else if (wave === 'tri') {
          p1 += TAU * f / sr;
          s = Math.sin(p1) * 0.7 + Math.sin(p1 * 3) * 0.15 + Math.sin(p1 * 5) * 0.08;
        } else if (wave === 'square') {
          p1 += TAU * f / sr;
          s = Math.sign(Math.sin(p1)) * 0.6 + Math.sin(p1) * 0.4;
        } else if (wave === 'bell') {
          p1 += TAU * f / sr;
          p2 += TAU * f * 2.76 / sr;
          s = Math.sin(p1) * Math.exp(-t * 3) + Math.sin(p2) * Math.exp(-t * 6) * 0.4;
        } else if (wave === 'reed') {
          p1 += TAU * f / sr;
          const saw = sawBl(f, sr, p1);
          s = Math.tanh(saw * 2.2) * 0.6 + Math.sin(p1 * 2) * 0.2 + Math.sin(p1 * 3) * 0.1;
        } else if (wave === 'air') {
          p1 += TAU * f / sr;
          s = Math.sin(p1) * 0.75 + (rng() * 2 - 1) * 0.06 * Math.exp(-t * 1.5);
        }
        if (filter > 0) {
          const a = (TAU * filter / sr) / (1 + TAU * filter / sr);
          lp += a * (s - lp);
          s = lp;
        }
        mono[off + i] += softClip(s, drive) * envV;
      }
    }
  }
  dcBlock(mono);
  if (reverb > 0) schroederReverb(mono, sr, reverb);
  normalize(mono, 0.62);
  applyFade(mono, sr, 5);
  return makeStereo(ctx, mono, pan);
}

function genDrum(ctx, len, opts, rng) {
  const hits = opts.hits;
  const kind = opts.kind || 'kick';
  const pan = opts.pan || 0;
  const sr = ctx.sampleRate;
  const noise = () => rng() * 2 - 1;
  const mono = new Float32Array(len);
  const b = bars(len, sr);
  for (let bar = 0; bar < b.totalBars; bar++) {
    for (let hi = 0; hi < hits.length; hi++) {
      const hit = hits[hi];
      const off = Math.floor(bar * b.barS + hit.t * BEAT * sr);
      if (off >= len) continue;
      const accent = hit.a === undefined ? 1 : hit.a;
      if (kind === 'kick') {
        const n = Math.floor(sr * 0.28);
        let p = 0;
        for (let i = 0; i < n && off + i < len; i++) {
          const t = i / sr;
          p += TAU * (48 + 130 * Math.exp(-t * 24)) / sr;
          const body = Math.sin(p) * Math.exp(-t * 6.5) * 0.9;
          const click = noise() * Math.exp(-t * 260) * 0.22;
          mono[off + i] += softClip(body + click, 1.4) * accent;
        }
      } else if (kind === 'snare') {
        const n = Math.floor(sr * 0.2);
        let p = 0;
        for (let i = 0; i < n && off + i < len; i++) {
          const t = i / sr;
          p += TAU * 185 / sr;
          const tone = Math.sin(p) * Math.exp(-t * 30) * 0.4;
          const nz = noise() * Math.exp(-t * 16) * 0.85;
          mono[off + i] += softClip(tone + nz, 1.3) * 0.65 * accent;
        }
      } else if (kind === 'hat') {
        const n = Math.floor(sr * 0.05);
        for (let i = 0; i < n && off + i < len; i++) {
          mono[off + i] += noise() * Math.exp(-(i/sr) * 80) * 0.42 * accent;
        }
      } else if (kind === 'clap') {
        for (let k = 0; k < 4; k++) {
          const o = off + Math.floor(k * 0.009 * sr);
          const n = Math.floor(sr * 0.14);
          for (let i = 0; i < n && o + i < len; i++) {
            mono[o + i] += noise() * Math.exp(-(i/sr) * 32) * (0.5 - k * 0.08) * accent;
          }
        }
      } else if (kind === 'tom') {
        const n = Math.floor(sr * 0.35);
        let p = 0;
        const f0 = hit.f || 90;
        for (let i = 0; i < n && off + i < len; i++) {
          const t = i / sr;
          p += TAU * (f0 + f0 * 1.4 * Math.exp(-t * 8)) / sr;
          mono[off + i] += softClip(Math.sin(p) * Math.exp(-t * 5), 1.3) * 0.85 * accent;
        }
      } else if (kind === 'rim') {
        const n = Math.floor(sr * 0.045);
        let p = 0;
        for (let i = 0; i < n && off + i < len; i++) {
          const t = i / sr;
          p += TAU * 1700 * Math.exp(-t * 40) / sr;
          mono[off + i] += (Math.sin(p) * 0.55 + noise() * 0.45) * Math.exp(-t * 70) * 0.6 * accent;
        }
      } else if (kind === 'shaker') {
        const n = Math.floor(sr * 0.045);
        for (let i = 0; i < n && off + i < len; i++) {
          mono[off + i] += noise() * Math.exp(-(i/sr) * 70) * 0.4 * accent;
        }
      } else if (kind === 'crash') {
        const n = Math.floor(sr * 1.2);
        for (let i = 0; i < n && off + i < len; i++) {
          mono[off + i] += noise() * Math.exp(-(i/sr) * 2.5) * 0.4 * accent;
        }
      }
    }
  }
  if (kind === 'snare') hp1(mono, sr, 220);
  if (kind === 'hat' || kind === 'shaker') hp1(mono, sr, 6500);
  if (kind === 'clap') hp1(mono, sr, 900);
  if (kind === 'crash') hp1(mono, sr, 3200);
  dcBlock(mono);
  const target = kind === 'kick' ? 0.85 : kind === 'snare' ? 0.7 : (kind === 'hat' || kind === 'shaker') ? 0.5 : 0.65;
  normalize(mono, target);
  applyFade(mono, sr, 4);
  return makeStereo(ctx, mono, pan);
}

function genChordPad(ctx, len, opts, rng) {
  const notes = opts.notes;
  const attack = opts.attack || 0.25;
  const reverb = opts.reverb || 0;
  const detune = opts.detune || 0.003;
  const lp = opts.lp || 0;
  const sr = ctx.sampleRate;
  const voices = [];
  for (let i = 0; i < notes.length; i++) {
    const f = notes[i];
    if (detune > 0) {
      voices.push({ f: f * (1 - detune), p: rng() * TAU, g: 0.4, ch: 0 });
      voices.push({ f: f * (1 + detune), p: rng() * TAU, g: 0.4, ch: 1 });
    } else {
      voices.push({ f: f, p: rng() * TAU, g: 0.5, ch: 0 });
      voices.push({ f: f, p: rng() * TAU, g: 0.5, ch: 1 });
    }
  }
  const L = new Float32Array(len);
  const R = new Float32Array(len);
  let lpL = 0, lpR = 0;
  for (let i = 0; i < len; i++) {
    const env = adsr(i, len, attack, 0.2, 0.8, 0.25);
    let l = 0, r = 0;
    for (let vi = 0; vi < voices.length; vi++) {
      const v = voices[vi];
      v.p += TAU * v.f / sr;
      const s = Math.sin(v.p) * v.g;
      if (v.ch === 0) l += s; else r += s;
    }
    if (lp > 0) {
      const a = (TAU * lp / sr) / (1 + TAU * lp / sr);
      lpL += a * (l - lpL);
      lpR += a * (r - lpR);
      l = lpL;
      r = lpR;
    }
    L[i] = l * env;
    R[i] = r * env;
  }
  dcBlock(L);
  dcBlock(R);
  if (reverb > 0) { schroederReverb(L, sr, reverb); schroederReverb(R, sr, reverb); }
  normalize(L, 0.6);
  normalize(R, 0.6);
  const buf = ctx.createBuffer(2, len, sr);
  buf.copyToChannel(L, 0);
  buf.copyToChannel(R, 1);
  return buf;
}

/* ═══════════════════ 40 ТРЕКОВ (используют локальный rng) ═══════════════════ */
const TRACKS = {
  kick: { label: 'KICK', color: '#ff6b6b', cat: 'beat', emoji: '🥁', desc: 'Бочка 1 и 3', gen: function(ctx, len, rng) {
    return genDrum(ctx, len, { kind: 'kick', hits: [{ t: 0 }, { t: 2 }] }, rng);
  }},
  snare: { label: 'SNARE', color: '#ffa94d', cat: 'beat', emoji: '🥁', desc: 'Малый 2 и 4', gen: function(ctx, len, rng) {
    return genDrum(ctx, len, { kind: 'snare', hits: [{ t: 1 }, { t: 3 }] }, rng);
  }},
  hihat: { label: 'HIHAT', color: '#ffd43b', cat: 'beat', emoji: '🎩', desc: 'Хэт 1/8', gen: function(ctx, len, rng) {
    return genDrum(ctx, len, { kind: 'hat', hits: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(function(t) { return { t: t, a: t % 1 === 0 ? 1 : 0.65 }; }) }, rng);
  }},
  clap: { label: 'CLAP', color: '#e8590c', cat: 'beat', emoji: '👏', desc: 'Хлопок 2 и 4', gen: function(ctx, len, rng) {
    return genDrum(ctx, len, { kind: 'clap', hits: [{ t: 1 }, { t: 3 }] }, rng);
  }},
  tom: { label: 'TOM', color: '#ff922b', cat: 'beat', emoji: '🥁', desc: 'Том 2 и 4', gen: function(ctx, len, rng) {
    return genDrum(ctx, len, { kind: 'tom', hits: [{ t: 1, f: 90 }, { t: 3, f: 90 }] }, rng);
  }},
  rim: { label: 'RIM', color: '#fab005', cat: 'beat', emoji: '🥁', desc: 'Римшот 8-е', gen: function(ctx, len, rng) {
    return genDrum(ctx, len, { kind: 'rim', hits: [0.5, 1.5, 2.5, 3.5].map(function(t) { return { t: t }; }) }, rng);
  }},
  shaker: { label: 'SHAKER', color: '#ffe066', cat: 'beat', emoji: '🥚', desc: 'Шейкер 1/16', gen: function(ctx, len, rng) {
    return genDrum(ctx, len, { kind: 'shaker', hits: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75].map(function(t) { return { t: t, a: t % 0.5 === 0 ? 1 : 0.6 }; }) }, rng);
  }},
  crash: { label: 'CRASH', color: '#fcc419', cat: 'beat', emoji: '💥', desc: 'Крэш на 1', gen: function(ctx, len, rng) {
    return genDrum(ctx, len, { kind: 'crash', hits: [{ t: 0 }] }, rng);
  }},

  lead: { label: 'LEAD', color: '#6ee7ff', cat: 'melody', emoji: '🎤', desc: 'Лид-пульс', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A4, N.C5, N.D5, N.C5, N.A4, N.G4, N.A4, N.C5], beats: [0,1,2,3], wave: 'square', env: [0.01,0.15,0.65,0.2], drive: 1.3, reverb: 0.15 }, rng);
  }},
  pluck: { label: 'PLUCK', color: '#0c8599', cat: 'melody', emoji: '🎸', desc: 'Плак-щипок', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.C4, N.E4, N.G4, N.E4], beats: [0,1,2,3], wave: 'tri', env: [0.005,0.5,0.15,0.4], drive: 1.2 }, rng);
  }},
  bell: { label: 'BELL', color: '#66d9e8', cat: 'melody', emoji: '🔔', desc: 'FM-колокол', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A4, N.C5, N.E5, N.A5], beats: [0,2], wave: 'bell', env: [0.005,0.3,0.3,0.6], reverb: 0.3 }, rng);
  }},
  marimba: { label: 'MARIMBA', color: '#67e8f9', cat: 'melody', emoji: '🎵', desc: 'Маримба 1/8', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.C4, N.E4, N.G4, N.A4, N.G4, N.E4], beats: [0,0.5,1,1.5,2,2.5,3,3.5], wave: 'sine', env: [0.005,0.4,0.2,0.4], reverb: 0.15 }, rng);
  }},
  arp: { label: 'ARP', color: '#3bc9db', cat: 'melody', emoji: '🎹', desc: 'Арпеджио 1/8', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A3, N.C4, N.E4, N.G4, N.E4, N.C4], beats: [0,0.5,1,1.5,2,2.5,3,3.5], wave: 'saw', env: [0.005,0.2,0.5,0.3], drive: 1.3, reverb: 0.15 }, rng);
  }},
  glass: { label: 'GLASS', color: '#cffafe', cat: 'melody', emoji: '🥂', desc: 'FM-стекло', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.C6, N.E6, N.G5, N.E6], beats: [0,1,2,3], wave: 'bell', env: [0.005,0.3,0.3,0.6], reverb: 0.4 }, rng);
  }},
  musicbox: { label: 'MBOX', color: '#a5f3fc', cat: 'melody', emoji: '🎁', desc: 'Шкатулка', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.C5, N.A4], beats: [0,0.5,1,1.5,2,2.5,3,3.5], wave: 'sine', env: [0.005,0.5,0.15,0.4], reverb: 0.3 }, rng);
  }},
  flute: { label: 'FLUTE', color: '#7dd3fc', cat: 'melody', emoji: '🪈', desc: 'Флейта', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.C5, N.D5, N.E5, N.G5, N.E5, N.D5, N.C5, N.A4], beats: [0,1,2,3], wave: 'air', env: [0.08,0.15,0.8,0.15], vibrato: 0.012, reverb: 0.25 }, rng);
  }},

  bass: { label: 'BASS', color: '#51cf66', cat: 'bass', emoji: '🎸', desc: 'Бас-пила', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A2, N.A2, N.C3, N.G2], beats: [0,1,2,3], wave: 'sine', env: [0.02,0.1,0.85,0.12], drive: 1.2 }, rng);
  }},
  sub: { label: 'SUB', color: '#2f9e44', cat: 'bass', emoji: '🎸', desc: 'Саб A1/G1', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A1, N.A1, 49, N.C2], beats: [0,2], wave: 'sine', env: [0.05,0.1,0.9,0.15] }, rng);
  }},
  acidbass: { label: 'ACID', color: '#69db7c', cat: 'bass', emoji: '🎛️', desc: 'TB-303', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A2, N.C3, N.D3, N.E3, N.D3, N.C3], beats: [0,0.5,1,1.5,2,2.5,3,3.5], wave: 'saw', env: [0.005,0.1,0.6,0.3], filter: 2200, drive: 2 }, rng);
  }},
  deepbass: { label: 'DEEP', color: '#37b24d', cat: 'bass', emoji: '🎸', desc: 'Глубокий саб', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A1, N.A1, 49, N.A1], beats: [0,2], wave: 'sine', env: [0.03,0.1,0.9,0.15], drive: 1.1 }, rng);
  }},
  bass808: { label: '808', color: '#7c3aed', cat: 'bass', emoji: '🔊', desc: '808 A1/C2', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A1, N.C2, N.A1, 49], beats: [0,2], wave: 'sine', env: [0.02,0.05,0.9,0.2], drive: 1.4 }, rng);
  }},
  screw808: { label: 'SCREW', color: '#b45309', cat: 'bass', emoji: '🔊', desc: 'Замедленный 808', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A1, 49, N.E2, N.A1], beats: [0,2], wave: 'sine', env: [0.03,0.08,0.9,0.2], drive: 1.6 }, rng);
  }},

  voxah: { label: 'VOX AH', color: '#5c7cfa', cat: 'voice', emoji: '🎤', desc: 'Гласная «А»', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A3, N.C4, N.E4, N.G4], beats: [1,3], wave: 'sine', env: [0.1,0.2,0.7,0.25], vibrato: 0.02, reverb: 0.25 }, rng);
  }},
  voxhey: { label: 'HEY', color: '#9775fa', cat: 'voice', emoji: '🎤', desc: '«ХЭЙ» на 1 и 3', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A4, N.A4, N.C5, N.A4], beats: [0,2], wave: 'sine', env: [0.02,0.15,0.5,0.3], vibrato: 0.015, reverb: 0.2 }, rng);
  }},
  choir: { label: 'CHOIR', color: '#748ffc', cat: 'voice', emoji: '🎤', desc: 'Хор Am7', gen: function(ctx, len, rng) {
    return genChordPad(ctx, len, { notes: [N.A3, N.C4, N.E4, N.G4], attack: 0.35, reverb: 0.28, detune: 0.005 }, rng);
  }},
  angel: { label: 'ANGEL', color: '#c4b5fd', cat: 'voice', emoji: '😇', desc: '12 голосов + реверб', gen: function(ctx, len, rng) {
    return genChordPad(ctx, len, { notes: [N.C5, N.E5, N.G5, N.A5, N.C6], attack: 0.35, reverb: 0.32, detune: 0.004 }, rng);
  }},
  demon: { label: 'DEMON', color: '#4c1d95', cat: 'voice', emoji: '👹', desc: 'Sub-octave', gen: function(ctx, len, rng) {
    return genChordPad(ctx, len, { notes: [N.A2, N.E3, N.A3, N.C4], attack: 0.25, reverb: 0.22, detune: 0.005, lp: 1800 }, rng);
  }},
  robot: { label: 'ROBOT', color: '#a78bfa', cat: 'voice', emoji: '🤖', desc: 'Ring + LFSR', gen: function(ctx, len, rng) {
    const b = toBuf(ctx, len);
    const b2 = bars(len, b.sr);
    const notes = [N.A1, N.C2, N.E2, 49];
    for (let bar = 0; bar < b2.totalBars; bar++) {
      for (let beat = 0; beat < 4; beat++) {
        const off = Math.floor(bar * b2.barS + beat * BEAT * b.sr);
        const n = Math.floor(b.sr * BEAT * 0.85);
        const f = notes[beat];
        let p = 0, ring = 0, lfsr = 0xACE1;
        for (let i = 0; i < n && off + i < len; i++) {
          const t = i / b.sr;
          p += TAU * f / b.sr;
          ring += TAU * 157 / b.sr;
          const bit = ((lfsr >> 0) ^ (lfsr >> 2) ^ (lfsr >> 3) ^ (lfsr >> 5)) & 1;
          lfsr = ((lfsr >> 1) | (bit << 15)) & 0xFFFF;
          const dig = (lfsr / 32768) - 1;
          const env = adsr(i, n, 0.01, 0.15, 0.6, 0.2);
          b.d[off + i] += softClip(softClip(Math.sin(p) * 4, 3) * Math.sin(ring) * 0.7 + dig * 0.15, 1.6) * env * 0.45;
        }
      }
    }
    dcBlock(b.d);
    normalize(b.d, 0.62);
    applyFade(b.d, b.sr, 4);
    return makeStereo(ctx, b.d, 0);
  }},

  riser: { label: 'RISER', color: '#cc5de8', cat: 'fx', emoji: '📈', desc: 'Нарастание', gen: function(ctx, len, rng) {
    const b = toBuf(ctx, len);
    const b2 = bars(len, b.sr);
    const noise = () => rng() * 2 - 1;
    for (let bar = 0; bar < b2.totalBars; bar++) {
      const off = Math.floor(bar * b2.barS + 3 * BEAT * b.sr);
      const sLen = Math.min(Math.floor(b.sr * BEAT * 0.95), len - off);
      if (sLen <= 0) continue;
      let p = 0;
      for (let i = 0; i < sLen; i++) {
        const q = i / sLen;
        p += TAU * (80 + q * q * 2400) / b.sr;
        const env = hann(sLen, i) * Math.min(1, (1 - q) * 2.5);
        b.d[off + i] += (Math.sin(p) * 0.5 + noise() * 0.5) * env * 0.42;
      }
    }
    dcBlock(b.d);
    normalize(b.d, 0.58);
    applyFade(b.d, b.sr, 4);
    return makeStereo(ctx, b.d, 0.2);
  }},
  sweep: { label: 'SWEEP', color: '#b197fc', cat: 'fx', emoji: '🌀', desc: 'Свип 5кГц→100', gen: function(ctx, len, rng) {
    const b = toBuf(ctx, len);
    let p = 0;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      p += TAU * (5000 * Math.exp(-t * 5) + 100) / b.sr;
      const env = hann(len, i);
      b.d[i] += Math.sin(p) * env * 0.4;
    }
    dcBlock(b.d);
    normalize(b.d, 0.55);
    applyFade(b.d, b.sr, 6);
    return makeStereo(ctx, b.d, 0);
  }},
  impact: { label: 'IMPACT', color: '#5f3dc4', cat: 'fx', emoji: '💥', desc: 'Бум + реверб', gen: function(ctx, len, rng) {
    const b = toBuf(ctx, len);
    const b2 = bars(len, b.sr);
    const noise = () => rng() * 2 - 1;
    for (let bar = 0; bar < b2.totalBars; bar++) {
      const off = Math.floor(bar * b2.barS);
      const n = Math.min(Math.floor(b.sr * 0.9), len - off);
      let p = 0;
      for (let i = 0; i < n; i++) {
        const t = i / b.sr;
        p += TAU * (55 * Math.exp(-t * 5) + 28) / b.sr;
        const env = Math.exp(-t * 3.5);
        b.d[off + i] += softClip(Math.sin(p) * env + noise() * Math.exp(-t * 12) * 0.5, 1.7) * 0.75;
      }
    }
    schroederReverb(b.d, b.sr, 0.25);
    dcBlock(b.d);
    normalize(b.d, 0.78);
    applyFade(b.d, b.sr, 5);
    return makeStereo(ctx, b.d, 0);
  }},
  zap: { label: 'ZAP', color: '#d0bfff', cat: 'fx', emoji: '⚡', desc: 'Зап-пиу на 1 и 3', gen: function(ctx, len, rng) {
    const b = toBuf(ctx, len);
    const b2 = bars(len, b.sr);
    for (let bar = 0; bar < b2.totalBars; bar++) {
      for (let k = 0; k < 2; k++) {
        const off = Math.floor(bar * b2.barS + k * 2 * BEAT * b.sr);
        const n = Math.floor(b.sr * 0.12);
        let p = 0;
        for (let i = 0; i < n && off + i < len; i++) {
          const t = i / b.sr;
          p += TAU * (2200 * Math.exp(-t * 40) + 180) / b.sr;
          b.d[off + i] += Math.sin(p) * Math.exp(-t * 28) * 0.7;
        }
      }
    }
    dcBlock(b.d);
    normalize(b.d, 0.62);
    applyFade(b.d, b.sr, 3);
    return makeStereo(ctx, b.d, 0);
  }},
  glitch: { label: 'GLITCH', color: '#f783ac', cat: 'fx', emoji: '📺', desc: 'Bit-crush', gen: function(ctx, len, rng) {
    const b = toBuf(ctx, len);
    const b2 = bars(len, b.sr);
    const noise = () => rng() * 2 - 1;
    for (let bar = 0; bar < b2.totalBars; bar++) {
      for (let k = 0; k < 10; k++) {
        const step = Math.floor(rng() * 16);
        const off = Math.floor(bar * b2.barS + step * (BEAT / 4) * b.sr);
        const n = Math.floor(b.sr * 0.025);
        const bc = 4 + Math.floor(rng() * 8);
        for (let i = 0; i < n && off + i < len; i++) {
          const t = i / b.sr;
          const raw = noise() * Math.exp(-t * 90) * 0.7;
          b.d[off + i] += Math.round(raw * bc) / bc;
        }
      }
    }
    dcBlock(b.d);
    normalize(b.d, 0.55);
    applyFade(b.d, b.sr, 2);
    return makeStereo(ctx, b.d, 0.25);
  }},
  noise: { label: 'NOISE', color: '#9775fa', cat: 'fx', emoji: '📡', desc: 'Шум-выброс', gen: function(ctx, len, rng) {
    const b = toBuf(ctx, len);
    const b2 = bars(len, b.sr);
    const noise = () => rng() * 2 - 1;
    for (let bar = 0; bar < b2.totalBars; bar++) {
      const off = Math.floor(bar * b2.barS);
      const n = Math.floor(b.sr * 0.18);
      for (let i = 0; i < n && off + i < len; i++) {
        const t = i / b.sr;
        b.d[off + i] += noise() * Math.exp(-t * 26) * 0.6;
      }
    }
    hp1(b.d, b.sr, 1200);
    dcBlock(b.d);
    normalize(b.d, 0.55);
    applyFade(b.d, b.sr, 3);
    return makeStereo(ctx, b.d, 0.15);
  }},

  guzheng: { label: 'GUZHENG', color: '#dc2626', cat: 'world', emoji: '🎋', desc: 'Цитра пентатоника', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A3, N.C4, N.D4, N.E4, N.G4, N.E4, N.D4, N.C4], beats: [0,0.5,1,1.5,2,2.5,3,3.5], wave: 'sine', env: [0.005,0.5,0.2,0.4], reverb: 0.22 }, rng);
  }},
  erhu: { label: 'ERHU', color: '#b91c1c', cat: 'world', emoji: '🎻', desc: 'Китайская скрипка', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A4, N.C5, N.E5, N.D5, N.C5, N.A4, N.G4, N.A4], beats: [0,1,2,3], wave: 'sine', env: [0.05,0.15,0.7,0.2], vibrato: 0.02, reverb: 0.2 }, rng);
  }},
  sax: { label: 'SAX', color: '#dc2626', cat: 'world', emoji: '🎷', desc: 'Саксофон — длинные', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.D3, N.E3, N.G3, N.A3, N.C4], beats: [{t:0,f:N.D3,d:0.9},{t:1,f:N.G3,d:1.4},{t:2.75,f:N.A3,d:0.5},{t:3.25,f:N.G3,d:0.35},{t:3.6,f:N.E3,d:0.35}], wave: 'reed', filter: 3200, env: [0.1,0.25,0.75,0.2], vibrato: 0.018, reverb: 0.25 }, rng);
  }},
  trumpet: { label: 'TRUMPET', color: '#f59e0b', cat: 'world', emoji: '🎺', desc: 'Труба — фанфары', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A3, N.C4, N.E4, N.G4, N.A4, N.C5, N.A5, N.E5], beats: [{t:0,f:N.A3,d:0.35},{t:0.5,f:N.C4,d:0.35},{t:1,f:N.E4,d:0.35},{t:1.75,f:N.G4,d:0.7},{t:2.5,f:N.A4,d:0.35},{t:3,f:N.C5,d:0.35},{t:3.5,f:N.A4,d:0.5}], wave: 'saw', filter: 4500, env: [0.02,0.1,0.7,0.15], drive: 1.8, reverb: 0.18 }, rng);
  }},
  harp: { label: 'HARP', color: '#f472b6', cat: 'world', emoji: '🎵', desc: 'Арфа арпеджио', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.A3, N.C4, N.E4, N.G4, N.A4, N.G4, N.E4, N.C4], beats: [0,0.5,1,1.5,2,2.5,3,3.5], wave: 'sine', env: [0.005,0.5,0.15,0.4], reverb: 0.28 }, rng);
  }},
  violin: { label: 'VIOLIN', color: '#ec4899', cat: 'world', emoji: '🎻', desc: 'Скрипка с вибрато', gen: function(ctx, len, rng) {
    return genMelody(ctx, len, { notes: [N.G4, N.A4, N.C5, N.D5, N.C5, N.A4, N.G4, N.E4], beats: [0,1,2,3], wave: 'saw', detune: 0.003, filter: 3500, env: [0.08,0.15,0.75,0.2], vibrato: 0.018, reverb: 0.22 }, rng);
  }}
};

const CATEGORIES = [
  { id: 'beat', name: 'Бит', icon: '🥁' },
  { id: 'melody', name: 'Мелодия', icon: '🎵' },
  { id: 'bass', name: 'Бас', icon: '🎸' },
  { id: 'voice', name: 'Голос', icon: '🎤' },
  { id: 'fx', name: 'FX', icon: '⚡' },
  { id: 'world', name: 'Мир', icon: '🌍' }
];

/* ═══════════════════ БД ═══════════════════ */
const DB_NAME = 'musiboxpro_db';
const DB_VER = 1;
const STORE = 'kv';
let dbInst = null;
function openDB() {
  return new Promise(function(resolve, reject) {
    if (dbInst) return resolve(dbInst);
    try {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = function(e) { dbInst = e.target.result; resolve(dbInst); };
      req.onerror = function() { reject(req.error); };
    } catch (err) { reject(err); }
  });
}
async function idbGet(key) {
  try {
    const db = await openDB();
    return new Promise(function(resolve) {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = function() { resolve(req.result); };
      req.onerror = function() { resolve(undefined); };
    });
  } catch (e) { return undefined; }
}
async function idbSet(key, value) {
  try {
    const db = await openDB();
    return new Promise(function(resolve) {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).put(value, key);
      req.onsuccess = function() { resolve(true); };
      req.onerror = function() { resolve(false); };
    });
  } catch (e) { return false; }
}

/* ═══════════════════ AUDIO MANAGER ═══════════════════ */
function useAudioManager() {
  const ctxRef = useRef(null);
  const buffersRef = useRef({});
  const sourcesRef = useRef({});
  const gainsRef = useRef({});
  const filtersRef = useRef({});
  const masterRef = useRef(null);
  const reverbRef = useRef(null);
  const reverbWetRef = useRef(null);
  const reverbOnRef = useRef(true);
  const masterVolRef = useRef(0.7);
  const loopStartRef = useRef(0);
  const lastLoopIdxRef = useRef(-1);
  const previewTimersRef = useRef({});
  const activeTracksRef = useRef({});
  const previewTracksRef = useRef({});
  const loopPatternsRef = useRef({});
  const volumesRef = useRef({});
  const cutoffsRef = useRef({});
  const mutedRef = useRef(new Set());
  const soloedRef = useRef(new Set());
  const currentBarRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBar, setCurrentBar] = useState(0);
  const [activeTracks, setActiveTracks] = useState({});
  const [previewTracks, setPreviewTracks] = useState({});
  const [pendingTracks, setPendingTracks] = useState({});
  const [pendingProgress, setPendingProgress] = useState({});
  const [loopPatterns, setLoopPatterns] = useState({});
  const [volumes, setVolumes] = useState({});
  const [cutoffs, setCutoffs] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [mutedTracks, setMutedTracks] = useState(new Set());
  const [soloedTracks, setSoloedTracks] = useState(new Set());
  const [masterVol, setMasterVol] = useState(0.7);
  const [reverbOn, setReverbOn] = useState(true);

  useEffect(function() { activeTracksRef.current = activeTracks; }, [activeTracks]);
  useEffect(function() { previewTracksRef.current = previewTracks; }, [previewTracks]);
  useEffect(function() { loopPatternsRef.current = loopPatterns; }, [loopPatterns]);
  useEffect(function() { volumesRef.current = volumes; }, [volumes]);
  useEffect(function() { cutoffsRef.current = cutoffs; }, [cutoffs]);
  useEffect(function() { mutedRef.current = mutedTracks; }, [mutedTracks]);
  useEffect(function() { soloedRef.current = soloedTracks; }, [soloedTracks]);
  useEffect(function() { masterVolRef.current = masterVol; }, [masterVol]);
  useEffect(function() { reverbOnRef.current = reverbOn; }, [reverbOn]);

  // Загрузка из БД
  useEffect(function() {
    (async function() {
      const v = await idbGet('volumes');
      const defV = {};
      Object.keys(TRACKS).forEach(function(k) { defV[k] = (v && typeof v[k] === 'number') ? v[k] : DEFAULT_VOL; });
      setVolumes(defV);
      const c = await idbGet('cutoffs');
      const defC = {};
      Object.keys(TRACKS).forEach(function(k) { defC[k] = (c && typeof c[k] === 'number') ? c[k] : DEFAULT_CUTOFF; });
      setCutoffs(defC);
      const f = await idbGet('favorites');
      if (Array.isArray(f)) setFavorites(new Set(f));
      const lp = await idbGet('loopPatterns');
      if (lp && typeof lp === 'object') setLoopPatterns(lp);
      const mv = await idbGet('masterVol');
      if (typeof mv === 'number') { setMasterVol(mv); masterVolRef.current = mv; }
      const rv = await idbGet('reverbOn');
      if (typeof rv === 'boolean') setReverbOn(rv);
    })();
  }, []);

  // Сохранение (debounce)
  useEffect(function() {
    if (Object.keys(volumes).length === 0) return;
    const t = setTimeout(function() { idbSet('volumes', volumes); }, 300);
    return function() { clearTimeout(t); };
  }, [volumes]);
  useEffect(function() {
    if (Object.keys(cutoffs).length === 0) return;
    const t = setTimeout(function() { idbSet('cutoffs', cutoffs); }, 300);
    return function() { clearTimeout(t); };
  }, [cutoffs]);
  useEffect(function() {
    const t = setTimeout(function() { idbSet('favorites', [...favorites]); }, 300);
    return function() { clearTimeout(t); };
  }, [favorites]);
  useEffect(function() {
    const t = setTimeout(function() { idbSet('loopPatterns', loopPatterns); }, 300);
    return function() { clearTimeout(t); };
  }, [loopPatterns]);
  useEffect(function() {
    const t = setTimeout(function() { idbSet('masterVol', masterVol); }, 300);
    return function() { clearTimeout(t); };
  }, [masterVol]);
  useEffect(function() {
    const t = setTimeout(function() { idbSet('reverbOn', reverbOn); }, 300);
    return function() { clearTimeout(t); };
  }, [reverbOn]);

  const initAudio = useCallback(async function() {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    ctxRef.current = ctx;
    if (ctx.state === 'suspended') await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = masterVolRef.current;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 22;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.25;

    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(2048);
    for (let i = 0; i < 2048; i++) {
      const x = (i / 2047) * 2 - 1;
      curve[i] = Math.tanh(x * 1.15);
    }
    shaper.curve = curve;
    shaper.oversample = '2x';

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -1.5;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.08;

    const reverb = ctx.createConvolver();
    reverb.buffer = makeReverbIR(ctx, 2.2, 2.2);
    const reverbWet = ctx.createGain();
    reverbWet.gain.value = reverbOnRef.current ? 0.4 : 0;
    const reverbPre = ctx.createBiquadFilter();
    reverbPre.type = 'highpass';
    reverbPre.frequency.value = 150;
    const reverbPost = ctx.createBiquadFilter();
    reverbPost.type = 'lowpass';
    reverbPost.frequency.value = 10000;

    master.connect(comp);
    comp.connect(shaper);
    shaper.connect(limiter);
    limiter.connect(ctx.destination);

    master.connect(reverbPre);
    reverbPre.connect(reverb);
    reverb.connect(reverbPost);
    reverbPost.connect(reverbWet);
    reverbWet.connect(comp);

    masterRef.current = master;
    reverbRef.current = reverb;
    reverbWetRef.current = reverbWet;
  }, []);

  useEffect(function() {
    if (!masterRef.current || !ctxRef.current) return;
    masterRef.current.gain.setTargetAtTime(masterVol, ctxRef.current.currentTime, 0.05);
  }, [masterVol]);
  useEffect(function() {
    if (!reverbWetRef.current || !ctxRef.current) return;
    reverbWetRef.current.gain.setTargetAtTime(reverbOn ? 0.4 : 0, ctxRef.current.currentTime, 0.1);
  }, [reverbOn]);

  const getBuffer = useCallback(function(key) {
    if (buffersRef.current[key]) return buffersRef.current[key];
    const ctx = ctxRef.current;
    const track = TRACKS[key];
    if (!ctx || !track) return null;
    const len = Math.floor(LOOP_SECONDS * ctx.sampleRate);
    try {
      const rng = makePrng(seedFromString(key + '|pro'));
      buffersRef.current[key] = track.gen(ctx, len, rng);
    } catch (e) {
      console.warn('Gen failed:', key, e);
      return null;
    }
    return buffersRef.current[key];
  }, []);

  const attachSource = useCallback(function(key, whenTime) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const buf = getBuffer(key);
    if (!buf) return;
    if (sourcesRef.current[key]) return;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = cutoffsRef.current[key] || DEFAULT_CUTOFF;
    filt.Q.value = 0.7;

    const g = ctx.createGain();
    const baseVol = volumesRef.current[key] !== undefined ? volumesRef.current[key] : DEFAULT_VOL;
    let targetVol = baseVol;
    if (soloedRef.current.size > 0 && !soloedRef.current.has(key)) targetVol = 0;
    if (mutedRef.current.has(key)) targetVol = 0;

    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(targetVol, whenTime + 0.03);

    src.connect(filt).connect(g).connect(masterRef.current);
    src.start(whenTime);

    sourcesRef.current[key] = src;
    gainsRef.current[key] = g;
    filtersRef.current[key] = filt;

    // Синхронизация loopStart: если стартуем в прошлом — сдвигаем
    if (whenTime < loopStartRef.current) {
      loopStartRef.current = whenTime;
    }
  }, [getBuffer]);

  const stopSource = useCallback(function(key) {
    if (previewTimersRef.current[key]) {
      clearTimeout(previewTimersRef.current[key]);
      delete previewTimersRef.current[key];
    }
    const src = sourcesRef.current[key];
    const g = gainsRef.current[key];
    if (src && g && ctxRef.current) {
      try {
        const now = ctxRef.current.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + 0.035);
        const s = src;
        const gg = g;
        setTimeout(function() {
          try { s.stop(); } catch (e) {}
          try { s.disconnect(); } catch (e) {}
          try { gg.disconnect(); } catch (e) {}
        }, 50);
      } catch (e) {}
    }
    delete sourcesRef.current[key];
    delete gainsRef.current[key];
    delete filtersRef.current[key];
  }, []);

  const applyLiveGain = useCallback(function(key) {
    const g = gainsRef.current[key];
    if (!g || !ctxRef.current) return;
    const now = ctxRef.current.currentTime;
    let vol = volumesRef.current[key] !== undefined ? volumesRef.current[key] : DEFAULT_VOL;
    if (soloedRef.current.size > 0 && !soloedRef.current.has(key)) vol = 0;
    if (mutedRef.current.has(key)) vol = 0;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.06);
  }, []);

  const start = useCallback(async function() {
    await initAudio();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    setIsPlaying(true);
    const t0 = ctx.currentTime + 0.05;
    loopStartRef.current = t0;
    lastLoopIdxRef.current = -1;
    const active = activeTracksRef.current;
    const preview = previewTracksRef.current;
    Object.keys(TRACKS).forEach(function(key) {
      if (active[key] || preview[key]) {
        attachSource(key, t0);
      }
    });
  }, [initAudio, attachSource]);

  const stop = useCallback(function() {
    setIsPlaying(false);
    Object.keys(sourcesRef.current).forEach(stopSource);
    Object.keys(previewTimersRef.current).forEach(function(k) {
      clearTimeout(previewTimersRef.current[k]);
      delete previewTimersRef.current[k];
    });
    previewTimersRef.current = {};
    sourcesRef.current = {};
    gainsRef.current = {};
    filtersRef.current = {};
    setPendingTracks({});
    setPendingProgress({});
    setPreviewTracks({});
    setCurrentBar(0);
    lastLoopIdxRef.current = -1;
  }, [stopSource]);

  const cycleTrack = useCallback(function(key) {
    const active = activeTracksRef.current[key];
    const preview = previewTracksRef.current[key];

    if (active) {
      setActiveTracks(function(prev) { const n = Object.assign({}, prev); delete n[key]; return n; });
      stopSource(key);
    } else if (preview) {
      if (previewTimersRef.current[key]) {
        clearTimeout(previewTimersRef.current[key]);
        delete previewTimersRef.current[key];
      }
      setPreviewTracks(function(prev) { const n = Object.assign({}, prev); delete n[key]; return n; });
      setActiveTracks(function(prev) { const n = Object.assign({}, prev); n[key] = true; return n; });
    } else {
      if (!ctxRef.current) {
        initAudio().then(function() {
          setPreviewTracks(function(prev) { const n = Object.assign({}, prev); n[key] = true; return n; });
          schedulePreviewAttach(key);
        });
        return;
      }
      setPreviewTracks(function(prev) { const n = Object.assign({}, prev); n[key] = true; return n; });
      schedulePreviewAttach(key);
    }

    function schedulePreviewAttach(k) {
      if (ctxRef.current && ctxRef.current.state === 'suspended') ctxRef.current.resume();
      if (previewTimersRef.current[k]) clearTimeout(previewTimersRef.current[k]);
      previewTimersRef.current[k] = setTimeout(function() {
        delete previewTimersRef.current[k];
        setPreviewTracks(function(prev) {
          if (!prev[k]) return prev;
          const n = Object.assign({}, prev);
          delete n[k];
          return n;
        });
        stopSource(k);
      }, PREVIEW_SECONDS * 1000);
    }
  }, [stopSource, initAudio]);

  useEffect(function() {
    if (!isPlaying || !ctxRef.current) return;
    const ctx = ctxRef.current;
    Object.keys(TRACKS).forEach(function(key) {
      const want = !!(activeTracks[key] || previewTracks[key]);
      const existing = sourcesRef.current[key];
      if (want && !existing) {
        const elapsed = ctx.currentTime - loopStartRef.current;
        const posInLoop = elapsed >= 0 ? (elapsed % LOOP_SECONDS) : 0;
        const timeToNext = LOOP_SECONDS - posInLoop;
        const isAlmost = timeToNext < 0.1;
        const whenTime = isAlmost ? ctx.currentTime + 0.02 : ctx.currentTime + timeToNext + 0.02;
        setPendingTracks(function(prev) { const n = Object.assign({}, prev); n[key] = true; return n; });
        const delay = Math.max(0, (whenTime - ctx.currentTime) * 1000) + 30;
        setTimeout(function() {
          setPendingTracks(function(prev) { const n = Object.assign({}, prev); delete n[key]; return n; });
          setPendingProgress(function(prev) { const n = Object.assign({}, prev); delete n[key]; return n; });
        }, delay);
        attachSource(key, whenTime);
      } else if (!want && existing) {
        stopSource(key);
      }
    });
  }, [activeTracks, previewTracks, isPlaying, attachSource, stopSource]);

  useEffect(function() {
    if (!isPlaying) return;
    Object.keys(sourcesRef.current).forEach(applyLiveGain);
  }, [mutedTracks, soloedTracks, volumes, isPlaying, applyLiveGain]);

  useEffect(function() {
    if (!isPlaying) return;
    let raf;
    const tick = function() {
      const ctx = ctxRef.current;
      if (!ctx) { raf = requestAnimationFrame(tick); return; }
      const now = ctx.currentTime;
      const elapsed = now - loopStartRef.current;
      const curLoopFloat = elapsed / LOOP_SECONDS;
      const curLoopIdx = curLoopFloat >= 0 ? Math.floor(curLoopFloat) : -1;
      const curBar = curLoopIdx >= 0 ? ((curLoopIdx % LOOP_BARS) + LOOP_BARS) % LOOP_BARS : 0;

      if (curLoopIdx !== lastLoopIdxRef.current) {
        lastLoopIdxRef.current = curLoopIdx;
        currentBarRef.current = curBar;
        setCurrentBar(curBar);

        Object.keys(sourcesRef.current).forEach(function(key) {
          const pat = loopPatternsRef.current[key];
          if (!pat) return;
          const g = gainsRef.current[key];
          if (!g) return;
          const isBarOn = pat[curBar] !== false;
          const baseVol = volumesRef.current[key] !== undefined ? volumesRef.current[key] : DEFAULT_VOL;
          let vol = isBarOn ? baseVol : 0;
          if (soloedRef.current.size > 0 && !soloedRef.current.has(key)) vol = 0;
          if (mutedRef.current.has(key)) vol = 0;
          g.gain.cancelScheduledValues(now);
          g.gain.setValueAtTime(g.gain.value, now);
          g.gain.linearRampToValueAtTime(vol, now + 0.05);
        });
      }

      const posInLoop = elapsed >= 0 ? (elapsed % LOOP_SECONDS) : 0;
      const remaining = 1 - (posInLoop / LOOP_SECONDS);
      setPendingProgress(function(prev) {
        if (Object.keys(prev).length === 0) return prev;
        const n = {};
        Object.keys(prev).forEach(function(k) { n[k] = remaining; });
        return n;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return function() { cancelAnimationFrame(raf); };
  }, [isPlaying]);

  const changeVolume = useCallback(function(key, val) {
    setVolumes(function(prev) { const n = Object.assign({}, prev); n[key] = val; return n; });
    volumesRef.current[key] = val;
    applyLiveGain(key);
  }, [applyLiveGain]);

  const changeCutoff = useCallback(function(key, val) {
    setCutoffs(function(prev) { const n = Object.assign({}, prev); n[key] = val; return n; });
    cutoffsRef.current[key] = val;
    const filt = filtersRef.current[key];
    if (filt && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      filt.frequency.cancelScheduledValues(now);
      filt.frequency.setValueAtTime(filt.frequency.value, now);
      filt.frequency.linearRampToValueAtTime(val, now + 0.05);
    }
  }, []);

  const toggleFav = useCallback(function(key) {
    setFavorites(function(prev) {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  }, []);

  const toggleMute = useCallback(function(key) {
    setMutedTracks(function(prev) {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      mutedRef.current = n;
      return n;
    });
  }, []);

  const toggleSolo = useCallback(function(key) {
    setSoloedTracks(function(prev) {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      soloedRef.current = n;
      return n;
    });
  }, []);

  /* toggleLoopDot — побочный эффект после setState */
  const toggleLoopDot = useCallback(function(key, index) {
    let newArr;
    setLoopPatterns(function(prev) {
      const n = Object.assign({}, prev);
      let arr = n[key];
      if (!arr) arr = [true, true, true, true];
      arr = arr.slice();
      arr[index] = !arr[index];
      n[key] = arr;
      newArr = arr;
      return n;
    });
    if (newArr) {
      loopPatternsRef.current[key] = newArr;
      const g = gainsRef.current[key];
      if (g && ctxRef.current) {
        const isBarOn = newArr[currentBarRef.current] !== false;
        const baseVol = volumesRef.current[key] !== undefined ? volumesRef.current[key] : DEFAULT_VOL;
        let vol = isBarOn ? baseVol : 0;
        if (soloedRef.current.size > 0 && !soloedRef.current.has(key)) vol = 0;
        if (mutedRef.current.has(key)) vol = 0;
        const now = ctxRef.current.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(vol, now + 0.05);
      }
    }
  }, []);

  const resetAll = useCallback(function() {
    stop();
    setActiveTracks({});
    setPreviewTracks({});
    setLoopPatterns({});
    setMutedTracks(new Set());
    setSoloedTracks(new Set());
    const def = {};
    Object.keys(TRACKS).forEach(function(k) { def[k] = DEFAULT_VOL; });
    setVolumes(def);
  }, [stop]);

  const snapshot = useCallback(function() {
    return {
      activeTracks: Object.assign({}, activeTracksRef.current),
      loopPatterns: JSON.parse(JSON.stringify(loopPatternsRef.current)),
      volumes: Object.assign({}, volumesRef.current)
    };
  }, []);

  /* loadSnapshot — заменяет, а не мержит */
  const loadSnapshot = useCallback(async function(snap) {
    stop();
    if (!snap) return;
    const at = snap.activeTracks || {};
    setActiveTracks(at);
    activeTracksRef.current = at;
    const lp = snap.loopPatterns || {};
    setLoopPatterns(lp);
    loopPatternsRef.current = lp;
    const v = {};
    Object.keys(TRACKS).forEach(function(k) {
      v[k] = (snap.volumes && typeof snap.volumes[k] === 'number') ? snap.volumes[k] : DEFAULT_VOL;
    });
    setVolumes(v);
    volumesRef.current = v;
    setPreviewTracks({});
    previewTracksRef.current = {};
    await start();
  }, [stop, start]);

  const exportMix = useCallback(function() {
    return {
      v: 1,
      activeTracks: Object.assign({}, activeTracksRef.current),
      loopPatterns: JSON.parse(JSON.stringify(loopPatternsRef.current)),
      volumes: Object.assign({}, volumesRef.current),
      favorites: [...favorites],
      masterVol: masterVolRef.current,
      reverbOn: reverbOnRef.current
    };
  }, [favorites]);

  /* importMix — сбрасывает preview и таймеры */
  const importMix = useCallback(async function(data) {
    if (!data) return;
    stop();
    setPreviewTracks({});
    previewTracksRef.current = {};
    if (data.activeTracks) {
      const at = {};
      Object.keys(data.activeTracks).forEach(function(k) {
        if (TRACKS[k] && data.activeTracks[k]) at[k] = true;
      });
      setActiveTracks(at);
      activeTracksRef.current = at;
    }
    if (data.loopPatterns) {
      const lp = {};
      Object.keys(data.loopPatterns).forEach(function(k) {
        if (TRACKS[k] && Array.isArray(data.loopPatterns[k])) {
          lp[k] = data.loopPatterns[k].slice(0, 4);
        }
      });
      setLoopPatterns(lp);
      loopPatternsRef.current = lp;
    }
    if (data.volumes) {
      const v = {};
      Object.keys(TRACKS).forEach(function(k) {
        v[k] = typeof data.volumes[k] === 'number' ? data.volumes[k] : DEFAULT_VOL;
      });
      setVolumes(v);
      volumesRef.current = v;
    }
    if (data.favorites && Array.isArray(data.favorites)) {
      setFavorites(new Set(data.favorites.filter(function(k) { return !!TRACKS[k]; })));
    }
    if (typeof data.masterVol === 'number') { setMasterVol(data.masterVol); masterVolRef.current = data.masterVol; }
    if (typeof data.reverbOn === 'boolean') setReverbOn(data.reverbOn);
    await start();
  }, [stop, start]);

  /* renderMixToWav — с чанками, чтобы не фризить UI */
  const renderMixToWav = useCallback(async function(durationSeconds) {
    const active = activeTracksRef.current;
    const preview = previewTracksRef.current;
    const keys = Object.keys(TRACKS).filter(function(k) { return active[k] || preview[k]; });
    if (keys.length === 0) throw new Error('Нет активных треков');

    const sampleRate = 44100;
    const totalLen = Math.floor(durationSeconds * sampleRate);
    const offline = new OfflineAudioContext(2, totalLen, sampleRate);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const track = TRACKS[key];
      const monoLen = Math.floor(LOOP_SECONDS * sampleRate);
      let buffer;
      try {
        const tmp = new OfflineAudioContext(2, monoLen, sampleRate);
        const rng = makePrng(seedFromString(key + '|pro'));
        buffer = track.gen(tmp, monoLen, rng);
      } catch (e) {
        console.warn('Render fail:', key, e);
        continue;
      }
      const src = offline.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filt = offline.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = cutoffsRef.current[key] || DEFAULT_CUTOFF;
      const g = offline.createGain();
      const baseVol = volumesRef.current[key] !== undefined ? volumesRef.current[key] : DEFAULT_VOL;
      let vol = baseVol;
      if (soloedRef.current.size > 0 && !soloedRef.current.has(key)) vol = 0;
      if (mutedRef.current.has(key)) vol = 0;
      g.gain.value = vol;

      const pat = loopPatternsRef.current[key];
      if (pat && Array.isArray(pat)) {
        g.gain.setValueAtTime(0, 0);
        const barSamples = Math.floor(ONE_BAR * sampleRate);
        let pos = 0;
        for (let s = 0; pos < totalLen; s++) {
          const isOn = pat[s % LOOP_BARS] !== false;
          g.gain.setValueAtTime(isOn ? vol : 0, pos / sampleRate);
          pos += barSamples;
        }
      }

      src.connect(filt).connect(g).connect(offline.destination);
      src.start(0);

      if (i % 2 === 0) await new Promise(r => setTimeout(r, 0));
    }

    const rendered = await offline.startRendering();
    return encodeWav(rendered);
  }, []);

  /* setMasterVol с синхронизацией ref */
  const setMasterVolSafe = useCallback((v) => {
    masterVolRef.current = v;
    setMasterVol(v);
  }, []);

  return {
    isPlaying, currentBar, activeTracks, previewTracks, pendingTracks, pendingProgress,
    loopPatterns, volumes, cutoffs, favorites, mutedTracks, soloedTracks,
    masterVol, reverbOn,
    start, stop, cycleTrack, changeVolume, changeCutoff,
    toggleFav, toggleMute, toggleSolo, toggleLoopDot,
    setMasterVol: setMasterVolSafe, setReverbOn, resetAll,
    snapshot, loadSnapshot, exportMix, importMix,
    renderMixToWav
  };
}

/* ═══════════════════ WAV ENCODE ═══════════════════ */
function encodeWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels = [];
  for (let ch = 0; ch < numChannels; ch++) channels.push(audioBuffer.getChannelData(ch));
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

/* ═══════════════════ КОМПОНЕНТЫ ═══════════════════ */
function Tile(props) {
  const id = props.id;
  const t = TRACKS[id];
  const active = !!props.active;
  const preview = !!props.preview;
  const pending = !!props.pending;
  const muted = !!props.muted;
  const soloed = !!props.soloed;
  const fav = !!props.fav;
  const patterns = props.patterns || [true, true, true, true];
  const hasCustomPattern = patterns.some(function(p) { return !p; });

  const longPress = useRef(null);
  const isTouch = useRef(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches);

  const handleClick = function(e) {
    if (isTouch.current && longPress.current) return;
    props.onClick(id);
  };
  const handleContext = function(e) {
    e.preventDefault();
    props.onOpenSettings(id, e);
  };
  const handleTouchStart = function(e) {
    if (!isTouch.current) return;
    longPress.current = setTimeout(function() {
      longPress.current = 'fired';
      props.onOpenSettings(id, e);
    }, 600);
  };
  const handleTouchEnd = function() {
    if (longPress.current && longPress.current !== 'fired') {
      clearTimeout(longPress.current);
    }
    if (longPress.current === 'fired') {
      setTimeout(function() { longPress.current = null; }, 100);
    } else {
      longPress.current = null;
    }
  };

  let cls = 'tile';
  if (active) cls += ' tile--active';
  if (preview) cls += ' tile--preview';
  if (pending) cls += ' tile--pending';
  if (muted) cls += ' tile--muted';
  if (soloed) cls += ' tile--soloed';
  if (fav) cls += ' tile--fav';

  return html`<div class="tile-wrap">
    <button
      class=${cls}
      style=${{ '--tile-color': t.color }}
      onClick=${handleClick}
      onContextMenu=${handleContext}
      onTouchStart=${handleTouchStart}
      onTouchEnd=${handleTouchEnd}
      onTouchCancel=${handleTouchEnd}
      title=${t.label + ': ' + t.desc}>
      <span class="tile__inner">${t.emoji}</span>
      ${(fav || muted || soloed) && html`<div class="tile__badges">
        ${fav && html`<div class="tile__badge tile__badge--fav">★</div>`}
        ${soloed && html`<div class="tile__badge tile__badge--solo">S</div>`}
        ${muted && html`<div class="tile__badge tile__badge--mute">M</div>`}
      </div>`}
      ${(pending || preview) && html`<div class="progress-bar">
        <div class="progress-bar__fill" style=${{
          width: ((pending ? props.progress : 1) * 100) + '%',
          background: pending ? '#22d3ee' : '#fbbf24'
        }}></div>
      </div>`}
      ${hasCustomPattern && html`<div class="tile__loop-badge">
        ${[0,1,2,3].map(function(i) {
          return html`<span class=${'tile__loop-dot' + (patterns[i] ? ' on' : '')} />`;
        })}
      </div>`}
    </button>
    <span class=${'tile__label' + (active ? ' tile__label--active' : '')}>${t.label}</span>
  </div>`;
}

function SettingsPopup(props) {
  const ref = useRef(null);
  const t = TRACKS[props.id];
  const fmtHz = function(hz) {
    return hz >= 1000 ? (hz/1000).toFixed(hz >= 10000 ? 0 : 1) + 'k' : Math.round(hz) + '';
  };

  useEffect(function() {
    const handler = function(e) {
      if (ref.current && !ref.current.contains(e.target)) props.onClose();
    };
    setTimeout(function() { document.addEventListener('mousedown', handler); }, 50);
    return function() { document.removeEventListener('mousedown', handler); };
  }, [props.onClose]);

  useEffect(function() {
    const handler = function(e) { if (e.key === 'Escape') props.onClose(); };
    document.addEventListener('keydown', handler);
    return function() { document.removeEventListener('keydown', handler); };
  }, [props.onClose]);

  const style = {
    left: Math.max(10, Math.min(props.position.x, window.innerWidth - 260)) + 'px',
    top: Math.max(10, Math.min(props.position.y, window.innerHeight - 280)) + 'px',
    '--char-color': t.color
  };

  return html`<div ref=${ref} class="settings" style=${style}>
    <button class="settings__close" onClick=${props.onClose} aria-label="Закрыть">×</button>
    <div class="settings__title">${t.label}</div>
    <div class="settings__row">
      <label>🔊 Звук</label>
      <input type="range" min="0" max="100" value=${Math.round(props.volume*100)}
        onChange=${function(e) { props.onVolumeChange(props.id, Number(e.target.value)/100); }} />
      <span class="settings__val">${Math.round(props.volume*100)}%</span>
    </div>
    <div class="settings__row">
      <label>🎚️ Частота</label>
      <input type="range" min="200" max="20000" step="100" value=${props.cutoff}
        onChange=${function(e) { props.onCutoffChange(props.id, Number(e.target.value)); }} />
      <span class="settings__val">${fmtHz(props.cutoff)}</span>
    </div>
    <div class="settings__actions">
      <button class=${'settings__action' + (props.fav ? ' settings__action--fav' : '')}
        onClick=${function() { props.onToggleFav(props.id); }}>
        ${props.fav ? '★ В избранном' : '☆ В избранное'}
      </button>
      <button class=${'settings__action' + (props.soloed ? ' settings__action--solo' : '')}
        onClick=${function() { props.onToggleSolo(props.id); }}>🎯 Solo</button>
      <button class=${'settings__action' + (props.muted ? ' settings__action--mute' : '')}
        onClick=${function() { props.onToggleMute(props.id); }}>🔇 Mute</button>
    </div>
  </div>`;
}

function SequencerBar(props) {
  const [expanded, setExpanded] = useState(true);
  const activeIds = Object.keys(TRACKS).filter(function(k) {
    return props.activeTracks[k] || props.previewTracks[k];
  });

  if (activeIds.length === 0) {
    return html`<div class="seq-bar">
      <div class="seq-bar__header">
        <span class="seq-bar__title">🎬 Секвенсор</span>
        <span class="seq-bar__hint">Включи треки, чтобы настроить такты</span>
      </div>
    </div>`;
  }

  return html`<div class="seq-bar">
    <div class="seq-bar__header">
      <span class="seq-bar__title">🎬 Секвенсор (4 такта)</span>
      <div style=${{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span class="seq-bar__hint">Клик по клетке — вкл/выкл такт</span>
        <button class="seq-bar__toggle" onClick=${function() { setExpanded(function(v) { return !v; }); }}>
          ${expanded ? '▼' : '▲'}
        </button>
      </div>
    </div>
    ${expanded && html`<div class="seq-grid">
      <div class="seq-grid__header"></div>
      ${[0,1,2,3].map(function(i) {
        return html`<div key=${i} class=${'seq-grid__header' + (props.currentBar === i ? ' now' : '')}>${i+1}</div>`;
      })}
      ${activeIds.map(function(id) {
        const t = TRACKS[id];
        const pat = props.loopPatterns[id] || [true, true, true, true];
        return html`<div key=${id} style=${{ display: 'contents' }}>
          <div class="seq-grid__label" style=${{ color: t.color }}>${t.emoji} ${t.label}</div>
          ${[0,1,2,3].map(function(i) {
            return html`<button
              key=${i}
              class=${'seq-btn' + (pat[i] ? ' on' : '') + (props.currentBar === i ? ' now' : '')}
              style=${{ '--tile-color': t.color }}
              onClick=${function() { props.onToggleLoopDot(id, i); }}
              title=${t.label + ' — такт ' + (i+1)}
            />`;
          })}
        </div>`;
      })}
    </div>`}
  </div>`;
}

function RecordPopup(props) {
  const [duration, setDuration] = useState(LOOP_SECONDS * 2);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [blob, setBlob] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [rendering, setRendering] = useState(false);

  useEffect(function() {
    return function() { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [blobUrl]);

  const handleRender = async function() {
    setRendering(true);
    setStatus('⏳ Рендеринг...');
    setProgress(0);
    let p = 0;
    const iv = setInterval(function() { p = Math.min(0.9, p + 0.1); setProgress(p); }, 100);

    try {
      const wavBlob = await props.onRender(duration);
      clearInterval(iv);
      setProgress(1);
      setStatus('✅ Готово! ' + Math.round(wavBlob.size / 1024) + ' КБ');
      setBlob(wavBlob);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(URL.createObjectURL(wavBlob));
    } catch (e) {
      clearInterval(iv);
      setStatus('❌ ' + e.message);
    }
    setRendering(false);
  };

  const handleDownload = function() {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'musibox-' + Date.now() + '.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return html`<div class="record-popup" onClick=${function(e) { if (e.target.classList.contains('record-popup')) props.onClose(); }}>
    <div class="record-popup__inner">
      <h2 class="record-popup__title">🎙️ Экспорт в WAV</h2>
      <div class="record-popup__opts">
        ${[LOOP_SECONDS, LOOP_SECONDS*2, LOOP_SECONDS*4].map(function(sec) {
          return html`<button key=${sec}
            class=${'record-popup__opt' + (duration === sec ? ' active' : '')}
            onClick=${function() { setDuration(sec); }} disabled=${rendering}>
            ${sec} сек
          </button>`;
        })}
      </div>
      <div class="record-popup__progress">
        <div class="record-popup__progress-fill" style=${{ width: (progress*100) + '%' }}></div>
      </div>
      <div class="record-popup__status">${status}</div>
      <div class="record-popup__actions">
        <button class="btn btn--ghost" onClick=${props.onClose}>Закрыть</button>
        ${!blob ? html`<button class="btn" onClick=${handleRender} disabled=${rendering}>⏺ Рендер</button>`
                : html`<button class="btn" onClick=${handleDownload}>💾 Скачать WAV</button>`}
      </div>
    </div>
  </div>`;
}

function SharePopup(props) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  useEffect(function() {
    try {
      const mix = props.exportMix();
      // Компактный формат
      const compact = {
        a: Object.keys(mix.activeTracks).filter(function(k) { return mix.activeTracks[k]; }),
        l: Object.keys(mix.loopPatterns).reduce(function(o, k) {
          o[k] = mix.loopPatterns[k].map(function(x) { return x ? 1 : 0; }).join('');
          return o;
        }, {}),
        v: mix.volumes,
        m: mix.masterVol,
        r: mix.reverbOn ? 1 : 0
      };
      const json = JSON.stringify(compact);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      const base = window.location.href.split('#')[0];
      setUrl(base + '#mix=' + encoded);
    } catch (e) {
      setStatus('❌ Ошибка кодирования');
    }
  }, [props.exportMix]);

  const copy = async function() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('✅ Скопировано!');
      setTimeout(function() { setStatus(''); }, 2000);
    } catch (e) {
      setStatus('❌ Не удалось скопировать (выдели вручную)');
    }
  };

  return html`<div class="share-popup" onClick=${function(e) { if (e.target.classList.contains('share-popup')) props.onClose(); }}>
    <div class="share-popup__inner">
      <h2 class="share-popup__title">🔗 Поделиться миксом</h2>
      <div class="share-popup__url">${url}</div>
      <div class="record-popup__status">${status}</div>
      <div class="record-popup__actions">
        <button class="btn btn--ghost" onClick=${props.onClose}>Закрыть</button>
        <button class="btn" onClick=${copy}>📋 Скопировать</button>
      </div>
    </div>
  </div>`;
}

function GuidePopup(props) {
  return html`<div class="guide" onClick=${function(e) { if (e.target.classList.contains('guide')) props.onClose(); }}>
    <div class="guide__inner">
      <button class="guide__close" onClick=${props.onClose}>×</button>
      <h2 class="guide__title">🎓 Musibox Pro — Гид</h2>
      <p class="guide__sub">40 треков · 6 категорий · 4 сцены · 4-тактовый секвенсор</p>

      <div class="guide__section">
        <h3>Как включать треки</h3>
        <div class="guide__item"><b>1 клик</b> по плитке — превью 4 секунды, потом само выключится</div>
        <div class="guide__item"><b>2 клика</b> (пока играет превью) — зацикливается навсегда</div>
        <div class="guide__item"><b>3 клика</b> — выключить трек</div>
        <div class="guide__item">💡 Клик по плитке — это не toggle, а трёхпозиционный переключатель.</div>
      </div>

      <div class="guide__section">
        <h3>Секвенсор (4 такта)</h3>
        <div class="guide__item">Внизу экрана — панель <b>🎬 Секвенсор</b>. Каждая строка = трек, 4 клетки = 4 такта.</div>
        <div class="guide__item">Клик по клетке — включить/выключить трек на этом такте.</div>
        <div class="guide__item">Если все клетки трека включены — трек играет весь луп.</div>
        <div class="guide__item">Текущий такт подсвечивается жёлтой рамкой в секвенсоре.</div>
      </div>

      <div class="guide__section">
        <h3>Сцены A/B/C/D</h3>
        <div class="guide__item">4 кнопки сверху под toolbar — это <b>сцены</b>. Каждая хранит свой набор треков, громкостей и паттернов.</div>
        <div class="guide__item"><b>Клик</b> — загрузить сцену (мгновенный переход).</div>
        <div class="guide__item"><b>Долгий тап / правый клик</b> — сохранить текущий микс в сцену.</div>
        <div class="guide__item">Зелёная точка на кнопке = сцена не пуста.</div>
      </div>

      <div class="guide__section">
        <h3>Настройки трека</h3>
        <div class="guide__item"><b>Долгий тап / правый клик</b> по плитке — открывает настройки.</div>
        <div class="guide__item"><b>Громкость</b> — ползунок 0-100%.</div>
        <div class="guide__item"><b>Частота</b> — срез высоких частот (lowpass).</div>
        <div class="guide__item"><b>★ Избранное</b>, <b>🎯 Solo</b>, <b>🔇 Mute</b>.</div>
      </div>

      <div class="guide__section">
        <h3>Запись и шаринг</h3>
        <div class="guide__item"><b>🎙️ Запись</b> — рендерит текущий микс в WAV. Выбери длительность (8/16/32 сек), нажми «Рендер».</div>
        <div class="guide__item"><b>🔗 Share</b> — кодирует микс в URL (компактный формат). Скинь ссылку другу.</div>
        <div class="guide__item">Всё сохраняется в браузере (IndexedDB).</div>
      </div>

      <div class="guide__section">
        <h3>Советы для красивого микса</h3>
        <div class="guide__item">Не включай больше 6-8 треков одновременно — каша.</div>
        <div class="guide__item">Ритм-секция: KICK + SNARE + HIHAT — это база.</div>
        <div class="guide__item">Reverb = пространство. Если микс «грязный» — выключи.</div>
        <div class="guide__item">Master 70% — оптимально.</div>
        <div class="guide__item">Фонк-основа: 808 + SCREW + kick + hihat.</div>
        <div class="guide__item">Романтика: HARP + VIOLIN + CHOIR.</div>
      </div>
    </div>
  </div>`;
}

/* ═══════════════════ APP ═══════════════════ */
function App() {
  const audio = useAudioManager();
  const [showGuide, setShowGuide] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [settingsPos, setSettingsPos] = useState({ x: 0, y: 0 });
  const [scenes, setScenes] = useState([null, null, null, null]);
  const [activeScene, setActiveScene] = useState(0);
  const [toast, setToast] = useState(null);
  const [toastError, setToastError] = useState(false);
  const toastTimer = useRef(null);
  const sceneLongPress = useRef({});

  const showToast = useCallback(function(text, isError) {
    setToast(text);
    setToastError(!!isError);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(function() { setToast(null); }, 2500);
  }, []);

  // URL hash restore (компактный формат)
  useEffect(function() {
    const hash = window.location.hash;
    if (hash.startsWith('#mix=')) {
      try {
        const encoded = hash.slice(5);
        const json = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(json);
        const expanded = {
          activeTracks: {},
          loopPatterns: {},
          volumes: data.v || {},
          masterVol: data.m,
          reverbOn: data.r === 1
        };
        (data.a || []).forEach(function(k) { expanded.activeTracks[k] = true; });
        Object.keys(data.l || {}).forEach(function(k) {
          expanded.loopPatterns[k] = data.l[k].split('').map(function(c) { return c === '1'; });
        });
        audio.importMix(expanded).then(function() {
          showToast('📥 Микс загружен из ссылки');
        }).catch(function() {
          showToast('❌ Не удалось загрузить', true);
        });
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        showToast('❌ Плохая ссылка', true);
      }
    }
  }, []);

  useEffect(function() {
    (async function() {
      const s = await idbGet('scenes');
      if (Array.isArray(s) && s.length === 4) setScenes(s);
      const a = await idbGet('activeScene');
      if (typeof a === 'number') setActiveScene(a);
    })();
  }, []);

  const saveScene = useCallback(function(index) {
    const snap = audio.snapshot();
    const activeCount = Object.keys(snap.activeTracks).filter(function(k) { return snap.activeTracks[k]; }).length;
    if (activeCount === 0) {
      showToast('⚠️ Нечего сохранять — включи треки', true);
      return;
    }
    setScenes(function(prev) {
      const n = prev.slice();
      n[index] = snap;
      idbSet('scenes', n);
      return n;
    });
    showToast('💾 Сцена ' + 'ABCD'[index] + ' сохранена');
  }, [audio, showToast]);

  const loadScene = useCallback(async function(index) {
    const s = scenes[index];
    if (!s) {
      showToast('⚠️ Сцена ' + 'ABCD'[index] + ' пуста', true);
      return;
    }
    await audio.loadSnapshot(s);
    setActiveScene(index);
    idbSet('activeScene', index);
    showToast('▶ Сцена ' + 'ABCD'[index]);
  }, [scenes, audio, showToast]);

  const handleOpenSettings = useCallback(function(id, e) {
    const rect = e.currentTarget ? e.currentTarget.getBoundingClientRect() : { left: e.clientX, top: e.clientY };
    setSettingsId(id);
    setSettingsPos({ x: rect.left + (rect.width || 0) + 8, y: rect.top });
  }, []);

  const togglePlay = useCallback(async function() {
    if (audio.isPlaying) audio.stop();
    else await audio.start();
  }, [audio]);

  const handleSceneTouchStart = function(i) {
    sceneLongPress.current[i] = setTimeout(function() {
      sceneLongPress.current[i] = 'fired';
      saveScene(i);
    }, 600);
  };
  const handleSceneTouchEnd = function(i) {
    if (sceneLongPress.current[i] && sceneLongPress.current[i] !== 'fired') {
      clearTimeout(sceneLongPress.current[i]);
    }
    setTimeout(function() { sceneLongPress.current[i] = null; }, 50);
  };

  const categoriesWithTracks = useMemo(function() {
    const result = {};
    CATEGORIES.forEach(function(cat) { result[cat.id] = []; });
    Object.keys(TRACKS).forEach(function(id) {
      const t = TRACKS[id];
      if (result[t.cat]) result[t.cat].push(id);
    });
    return result;
  }, []);

  const activeCount = useMemo(function() {
    return Object.keys(audio.activeTracks).filter(function(k) { return audio.activeTracks[k]; }).length;
  }, [audio.activeTracks]);

  const handleRender = useCallback(async function(duration) {
    return await audio.renderMixToWav(duration);
  }, [audio]);

  return html`<div class="app">
    <header class="header">
      <h1 class="header__title">🎧 Musibox Pro</h1>
      <p class="header__subtitle">40 треков · 6 категорий · 4 сцены</p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <button class=${'btn' + (audio.isPlaying ? ' btn--stop' : '')} onClick=${togglePlay}>
          ${audio.isPlaying ? '⏸ Стоп' : '▶ Играть'}
        </button>
        <button class="btn btn--ghost" onClick=${function() { setShowRecord(true); }}>🎙️ WAV</button>
        <button class="btn btn--ghost" onClick=${function() { setShowShare(true); }}>🔗 Share</button>
        <button class="btn btn--ghost" onClick=${function() { setShowGuide(true); }}>🎓 Гид</button>
      </div>
      <span class="toolbar__count">Активно: <b>${activeCount}</b> / 40</span>
    </div>

    <div class="scenes">
      <span class="scenes__label">Сцены:</span>
      ${[0, 1, 2, 3].map(function(i) {
        const hasContent = !!scenes[i];
        return html`<button
          key=${i}
          class=${'scene-btn' + (activeScene === i ? ' active' : '') + (hasContent ? ' has-content' : '')}
          onClick=${function() { loadScene(i); }}
          onContextMenu=${function(e) { e.preventDefault(); saveScene(i); }}
          onTouchStart=${function() { handleSceneTouchStart(i); }}
          onTouchEnd=${function() { handleSceneTouchEnd(i); }}
          title=${'Клик: загрузить · Долгий тап: сохранить'}>
          ${'ABCD'[i]}
        </button>`;
      })}
    </div>

    <main class="stage">
      ${CATEGORIES.map(function(cat) {
        const ids = categoriesWithTracks[cat.id] || [];
        if (ids.length === 0) return null;
        return html`<section class="category" key=${cat.id}>
          <div class="category__header">
            <span class="category__icon">${cat.icon}</span>
            <h2 class="category__name">${cat.name}</h2>
            <span class="category__line"></span>
          </div>
          <div class="tiles">
            ${ids.map(function(id) {
              return html`<${Tile}
                key=${id}
                id=${id}
                active=${!!audio.activeTracks[id]}
                preview=${!!audio.previewTracks[id]}
                pending=${!!audio.pendingTracks[id]}
                progress=${audio.pendingProgress[id] || 0}
                muted=${audio.mutedTracks.has(id)}
                soloed=${audio.soloedTracks.has(id)}
                fav=${audio.favorites.has(id)}
                patterns=${audio.loopPatterns[id]}
                onClick=${audio.cycleTrack}
                onOpenSettings=${handleOpenSettings}
              />`;
            })}
          </div>
        </section>`;
      })}
    </main>

    <${SequencerBar}
      activeTracks=${audio.activeTracks}
      previewTracks=${audio.previewTracks}
      loopPatterns=${audio.loopPatterns}
      currentBar=${audio.currentBar}
      onToggleLoopDot=${audio.toggleLoopDot}
    />

    ${settingsId && html`<${SettingsPopup}
      id=${settingsId}
      position=${settingsPos}
      volume=${audio.volumes[settingsId] !== undefined ? audio.volumes[settingsId] : DEFAULT_VOL}
      cutoff=${audio.cutoffs[settingsId] !== undefined ? audio.cutoffs[settingsId] : DEFAULT_CUTOFF}
      fav=${audio.favorites.has(settingsId)}
      muted=${audio.mutedTracks.has(settingsId)}
      soloed=${audio.soloedTracks.has(settingsId)}
      onClose=${function() { setSettingsId(null); }}
      onVolumeChange=${audio.changeVolume}
      onCutoffChange=${audio.changeCutoff}
      onToggleFav=${audio.toggleFav}
      onToggleMute=${audio.toggleMute}
      onToggleSolo=${audio.toggleSolo}
    />`}

    ${showRecord && html`<${RecordPopup}
      onClose=${function() { setShowRecord(false); }}
      onRender=${handleRender}
    />`}

    ${showShare && html`<${SharePopup}
      onClose=${function() { setShowShare(false); }}
      exportMix=${audio.exportMix}
    />`}

    ${showGuide && html`<${GuidePopup}
      onClose=${function() { setShowGuide(false); }}
    />`}

    ${toast && html`<div class=${'toast' + (toastError ? ' toast--error' : '')}>${toast}</div>`}
  </div>`;
}

render(html`<${App} />`, document.getElementById('root'));

})();