// ============================================
// FireLand · sound.js · v26.3.0
// Звуки и вибрация
// ============================================

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15, delay = 0) {
  const st = window.state || {};
  if (!st.uiSoundsEnabled) return;
  if (!st.soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {}
}

const SOUNDS = {
  click() { playTone(880, 0.06, 'sine', 0.08); },
  achievement() {
    playTone(659, 0.15, 'sine', 0.15, 0);
    playTone(880, 0.15, 'sine', 0.15, 0.08);
    playTone(1175, 0.25, 'sine', 0.15, 0.16);
  },
  quest() {
    playTone(523, 0.12, 'sine', 0.12, 0);
    playTone(784, 0.18, 'sine', 0.12, 0.1);
  },
  levelup() {
    playTone(523, 0.15, 'triangle', 0.15, 0);
    playTone(659, 0.15, 'triangle', 0.15, 0.12);
    playTone(784, 0.15, 'triangle', 0.15, 0.24);
    playTone(1047, 0.4, 'triangle', 0.18, 0.36);
  },
  reward() {
    playTone(1047, 0.1, 'sine', 0.15, 0);
    playTone(1319, 0.1, 'sine', 0.15, 0.08);
    playTone(1568, 0.3, 'sine', 0.15, 0.16);
  },
  caseOpen() {
    playTone(200, 0.3, 'sawtooth', 0.1, 0);
    playTone(400, 0.3, 'sawtooth', 0.08, 0.15);
    playTone(800, 0.5, 'sawtooth', 0.05, 0.3);
  },
  error() { playTone(220, 0.15, 'square', 0.1); },
};

function playAlarmSound() {
  const st = window.state || {};
  if (!st.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime((st.alarmVolume || 0.8) * 0.3, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.2);
    });
  } catch (e) {}
}

function vibrateDevice() {
  const st = window.state || {};
  if (!st.vibrationEnabled) return;
  try {
    if (navigator.vibrate) navigator.vibrate(200);
  } catch (e) {}
}

// Глобальный клик по кнопкам
document.addEventListener('click', (e) => {
  if (
    e.target.closest('button') ||
    e.target.closest('.game-card') ||
    e.target.closest('.tab-btn')
  ) {
    SOUNDS.click();
  }
}, true);

// ============================================
// ЭКСПОРТ В WINDOW
// ============================================
window.getAudioCtx = getAudioCtx;
window.playTone = playTone;
window.SOUNDS = SOUNDS;
window.playAlarmSound = playAlarmSound;
window.vibrateDevice = vibrateDevice;

console.log('[sound.js] Загружено:', Object.keys(SOUNDS).length, 'звуков');