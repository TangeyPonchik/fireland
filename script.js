// ============================================
// FireLand · script.js · v26.4.3
// Ядро: темы, частицы, звёзды, часы, настройки, onboarding.
// ============================================

(function () {
'use strict';

const APP_VERSION = '27.4.1';
const APP_VERSION_LABEL = '27.4:1';

(function checkModules() {
  const missing = [];
  if (typeof window.GAMES === 'undefined') missing.push('games.js');
  if (typeof window.ACHIEVEMENTS === 'undefined') missing.push('profile.js');
  if (typeof window.SOUNDS === 'undefined') missing.push('sound.js');
  if (typeof window.state === 'undefined') missing.push('storage.js');
  if (typeof window.updateStreak === 'undefined') missing.push('streak.js');
  if (typeof window.applyDeviceMode === 'undefined') missing.push('device.js');
  if (missing.length > 0) {
    console.error('[script.js] Не загружены модули:', missing.join(', '));
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:16px;background:#c0392b;color:#fff;font-weight:700;text-align:center;z-index:999999;';
    banner.textContent = '❌ Не загружены модули: ' + missing.join(', ') + '. Обнови (Ctrl+Shift+R).';
    if (document.body) document.body.appendChild(banner);
  }
})();

var saveState = window.saveState || function () {};
var loadState = window.loadState || function () {};
var todayStr = window.todayStr || function () { return new Date().toISOString().slice(0, 10); };
var dateStr = window.dateStr || function (d) { return d.toISOString().slice(0, 10); };
var generateOwnerToken = window.generateOwnerToken || function () { return 'tok_' + Date.now(); };
var idbDelete = window.idbDelete || function () { return Promise.resolve(); };
var idbSet = window.idbSet || function () { return Promise.resolve(); };
var STATE_KEY = window.STATE_KEY || 'main_state';
var DEFAULT_STATE = window.DEFAULT_STATE || {};
var SOUNDS = window.SOUNDS || { click() {}, achievement() {}, quest() {}, levelup() {}, reward() {}, caseOpen() {}, error() {} };
var playTone = window.playTone || function () {};

function getState() { return window.state || null; }

function getSmartTheme() {
  const h = new Date().getHours();
  return (h >= 7 && h < 19) ? 'light' : 'default';
}

function applyTheme() {
  const s = getState();
  if (!s) return;
  let theme = s.theme;
  if (theme === 'smart') theme = getSmartTheme();
  document.body.classList.remove('theme-system', 'theme-default', 'theme-light', 'theme-smart');
  if (theme === 'system') document.body.classList.add('theme-system');
  else if (theme === 'default') document.body.classList.add('theme-default');
  else document.body.classList.add('theme-' + theme);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === s.theme);
  });
  updateParticleColors();
  if (!s.themesUsed) s.themesUsed = [];
  if (!s.themesUsed.includes(s.theme)) {
    s.themesUsed.push(s.theme);
    saveState();
    if (s.themesUsed.length >= 4) {
      if (typeof window.unlockAch === 'function') window.unlockAch('all_themes');
    }
  }
}

setInterval(() => {
  const s = getState();
  if (s && s.theme === 'smart') applyTheme();
}, 60000);

function updateClock() {
  const now = new Date();
  const h = document.getElementById('hours');
  const m = document.getElementById('minutes');
  if (h) h.textContent = String(now.getHours()).padStart(2, '0');
  if (m) m.textContent = String(now.getMinutes()).padStart(2, '0');
}
setInterval(updateClock, 10000);

function createParticles() {
  const c = document.getElementById('bgParticles');
  if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const size = Math.random() * 4 + 2;
    const p = document.createElement('div');
    p.className = 'bg-particle';
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 20 + 30) + 's';
    p.style.animationDelay = (Math.random() * 30) + 's';
    c.appendChild(p);
  }
}

function createStars() {
  const c = document.getElementById('starsBg');
  if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 2 + 1;
    const st = document.createElement('div');
    st.className = 'star';
    st.style.width = size + 'px';
    st.style.height = size + 'px';
    st.style.left = Math.random() * 100 + '%';
    st.style.top = Math.random() * 100 + '%';
    st.style.animationDelay = (Math.random() * 3) + 's';
    st.style.animationDuration = (Math.random() * 2 + 4) + 's';
    c.appendChild(st);
  }
}

function updateParticleColors() {
  const ps = document.querySelectorAll('.bg-particle');
  const isLight = document.body.classList.contains('theme-light') ||
    (document.body.classList.contains('theme-system') && window.matchMedia('(prefers-color-scheme: light)').matches);
  const color = isLight ? 'rgba(74,106,255,0.18)' : 'rgba(106,138,255,0.35)';
  ps.forEach(p => { p.style.background = color; });
}

function buildAnimatedLogo() {
  const ll = document.getElementById('logoLauncher');
  const lf = document.getElementById('logoFireland');
  if (ll) ll.textContent = 'Лаунчер';
  if (lf) lf.textContent = 'FireLand';
}

const settingsModal = document.getElementById('settingsModal');
const settingsGearBtn = document.getElementById('settingsGearBtn');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const soundToggle = document.getElementById('soundToggle');
const uiSoundsToggle = document.getElementById('uiSoundsToggle');

function loadSettings() {
  const versionEl = document.getElementById('appVersion');
  if (versionEl) versionEl.textContent = 'v' + APP_VERSION;
  const s = getState();
  if (!s) return;
  if (soundToggle) soundToggle.checked = s.soundEnabled;
  if (uiSoundsToggle) uiSoundsToggle.checked = s.uiSoundsEnabled !== false;
  window.isSoundEnabled = s.soundEnabled;
  applyTheme();
  if (typeof window.loadAlarmSettings === 'function') window.loadAlarmSettings();
}

if (soundToggle) soundToggle.addEventListener('change', () => {
  const s = getState(); if (!s) return;
  s.soundEnabled = soundToggle.checked;
  window.isSoundEnabled = s.soundEnabled;
  saveState();
});
if (uiSoundsToggle) uiSoundsToggle.addEventListener('change', () => {
  const s = getState(); if (!s) return;
  s.uiSoundsEnabled = uiSoundsToggle.checked;
  saveState();
  if (s.uiSoundsEnabled) SOUNDS.click();
});
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const s = getState(); if (!s) return;
    s.theme = btn.dataset.theme;
    applyTheme();
    if (s.todayStats) s.todayStats.themeChanged = true;
    if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
    saveState();
  });
});
if (settingsGearBtn && settingsModal) settingsGearBtn.addEventListener('click', () => {
  settingsModal.classList.add('show');
  if (typeof window.renderStats === 'function') window.renderStats();
  loadSettings();
  const s = getState();
  if (s && s.todayStats) s.todayStats.settingsViewed = true;
  if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
});
if (settingsCloseBtn && settingsModal) settingsCloseBtn.addEventListener('click', () => settingsModal.classList.remove('show'));
if (settingsModal) settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove('show');
});

const profileModal = document.getElementById('profileModal');
const profileCloseBtn = document.getElementById('profileCloseBtn');
const profileNickInput = document.getElementById('profileNickInput');
const profileBigAvatar = document.getElementById('profileBigAvatar');
const avatarFileInput = document.getElementById('avatarFileInput');

const levelHeaderBadge = document.getElementById('levelHeaderBadge');
if (levelHeaderBadge && profileModal) levelHeaderBadge.addEventListener('click', () => {
  if (typeof window.renderProfile === 'function') window.renderProfile();
  if (typeof window.renderAchievements === 'function') window.renderAchievements();
  if (typeof window.renderRecords === 'function') window.renderRecords();
  if (typeof window.renderStats === 'function') window.renderStats();
  if (typeof window.updateLevelDisplay === 'function') window.updateLevelDisplay();
  if (typeof window.renderCases === 'function') window.renderCases();
  profileModal.classList.add('show');
  const s = getState();
  if (s && s.todayStats) s.todayStats.profileViewed = true;
  if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
});
if (profileCloseBtn && profileModal) profileCloseBtn.addEventListener('click', () => profileModal.classList.remove('show'));
if (profileModal) profileModal.addEventListener('click', (e) => {
  if (e.target === profileModal) profileModal.classList.remove('show');
});

if (profileNickInput) {
  profileNickInput.addEventListener('input', () => {
    const s = getState();
    if (!s) return;
    s.nickname = profileNickInput.value.trim() || 'Игрок';
    saveState();
    if (s.nickname !== 'Игрок') {
      if (typeof window.unlockAch === 'function') window.unlockAch('set_nick');
      if (s.todayStats) s.todayStats.nickSet = true;
      if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
    }
    if (typeof window.updateChatBadge === 'function') window.updateChatBadge();
    if (typeof window.debouncedPresenceRefresh === 'function') window.debouncedPresenceRefresh();
    const hint = document.getElementById('profileNickHint');
    if (hint) {
      hint.classList.remove('saved', 'error');
      hint.textContent = 'Нажми 💾, чтобы сохранить ник в таблицу лидеров';
    }
  });
}

const profileNickSaveBtn = document.getElementById('profileNickSaveBtn');
if (profileNickSaveBtn) {
  profileNickSaveBtn.addEventListener('click', async () => {
    const s = getState();
    if (!s) return;
    const btn = profileNickSaveBtn;
    const hint = document.getElementById('profileNickHint');
    const inputVal = profileNickInput ? profileNickInput.value.trim() : '';
    if (inputVal) s.nickname = inputVal;
    const newNick = (s.nickname || '').trim();
    const oldNick = s.lastSubmittedNick;
    if (!newNick || newNick === 'Игрок') {
      if (hint) { hint.textContent = 'Сначала введи ник'; hint.classList.add('error'); }
      return;
    }
    if (typeof window.saveNickname !== 'function' && typeof window.renameNickEverywhere !== 'function') {
      if (hint) { hint.textContent = 'Лидерборд не загружен'; hint.classList.add('error'); }
      return;
    }
    btn.disabled = true;
    btn.textContent = '⏳';
    let result;
    if (oldNick && oldNick !== newNick && typeof window.renameNickEverywhere === 'function') {
      result = await window.renameNickEverywhere(oldNick, newNick, s.ownerToken);
    } else if (typeof window.saveNickname === 'function') {
      result = await window.saveNickname();
    } else {
      result = { ok: false, message: 'Функция недоступна' };
    }
    btn.disabled = false;
    btn.textContent = '💾';
    if (result && result.ok) {
      btn.classList.add('saved');
      if (hint) {
        hint.textContent = '✅ Ник сохранён' + (oldNick && oldNick !== newNick ? ' (прогресс перенесён)' : '');
        hint.classList.remove('error');
        hint.classList.add('saved');
      }
      setTimeout(() => {
        if (hint) {
          hint.textContent = 'Нажми 💾, чтобы сохранить ник в таблицу лидеров';
          hint.classList.remove('saved');
        }
        btn.classList.remove('saved');
      }, 4000);
      if (typeof window.reinitializePresenceWithNewNick === 'function') {
        window.reinitializePresenceWithNewNick();
      }
    } else {
      btn.classList.add('error');
      const msg = result && result.message ? result.message : 'Ошибка';
      if (hint) {
        hint.textContent = '❌ ' + msg;
        hint.classList.remove('saved');
        hint.classList.add('error');
      }
      setTimeout(() => btn.classList.remove('error'), 4000);
    }
  });
}

if (profileBigAvatar && avatarFileInput) profileBigAvatar.addEventListener('click', () => {
  avatarFileInput.click();
});
if (avatarFileInput) avatarFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const s = getState();
  if (!s) return;
  if (typeof window.compressAvatar !== 'function') return;
  const compressed = await window.compressAvatar(file, 256);
  if (compressed) {
    s.avatar = compressed;
    saveState();
    if (typeof window.renderProfile === 'function') window.renderProfile();
    if (typeof window.unlockAch === 'function') window.unlockAch('set_avatar');
    if (typeof window.reinitializePresenceWithNewNick === 'function') {
      window.reinitializePresenceWithNewNick();
    }
  }
});

const importProfileInput = document.getElementById('importProfileInput');
if (importProfileInput) {
  importProfileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.state) throw new Error('Неверный формат');
      if (!window.DEFAULT_STATE || Object.keys(window.DEFAULT_STATE).length === 0) {
        throw new Error('DEFAULT_STATE не загружен. Обнови страницу.');
      }
      if (!confirm('📥 Импортировать профиль?\n\nТекущий прогресс будет ЗАМЕНЁН.')) {
        e.target.value = '';
        return;
      }
      const merged = { ...window.DEFAULT_STATE, ...data.state };
      if (!merged.temporalParadox) merged.temporalParadox = { level: 1, totalAccumulated: 0 };
      if (!merged.streak) merged.streak = { current: 0, best: 0, lastLogin: null, history: [] };
      if (!merged.streak.history) merged.streak.history = [];
      if (!merged.favorites) merged.favorites = [];
      if (!merged.dailyQuests) merged.dailyQuests = { date: null, quests: [], progress: {}, completed: [] };
      if (!merged.todayStats) merged.todayStats = { ...window.DEFAULT_STATE.todayStats };
      if (!merged.todayStats.utilPlayed) merged.todayStats.utilPlayed = [];
      if (!merged.caseItems) merged.caseItems = [];
      if (!merged.myRooms) merged.myRooms = [];
      if (!merged.achievements) merged.achievements = [];
      if (!merged.playedGames) merged.playedGames = [];
      if (!merged.themesUsed) merged.themesUsed = [];
      if (!merged.ownerToken) merged.ownerToken = generateOwnerToken();
      window.state = merged;
      await idbSet(STATE_KEY, window.state);
      if (typeof window.renderGames === 'function') window.renderGames();
      if (typeof window.renderUtilities === 'function') window.renderUtilities();
      if (typeof window.updateLastGameBar === 'function') window.updateLastGameBar();
      if (typeof window.renderProfile === 'function') window.renderProfile();
      if (typeof window.renderAchievements === 'function') window.renderAchievements();
      if (typeof window.renderRecords === 'function') window.renderRecords();
      if (typeof window.renderStats === 'function') window.renderStats();
      if (typeof window.renderQuests === 'function') window.renderQuests();
      if (typeof window.renderStreak === 'function') window.renderStreak();
      if (typeof window.updateLevelDisplay === 'function') window.updateLevelDisplay();
      applyTheme();
      if (typeof window.renderCases === 'function') window.renderCases();
      if (typeof window.updateChatBadge === 'function') window.updateChatBadge();
      if (typeof window.unlockAch === 'function') window.unlockAch('import_profile');
      const toast = document.createElement('div');
      toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;padding:14px 28px;border-radius:22px;font-weight:800;font-family:'Manrope';z-index:99999;animation:toastIn 0.4s ease;`;
      toast.textContent = '📥 Профиль успешно импортирован!';
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2500);
    } catch (err) {
      alert('❌ Ошибка импорта: ' + err.message);
    }
    e.target.value = '';
  });
}

const profileExportBtn = document.getElementById('profileExportBtn');
if (profileExportBtn) profileExportBtn.addEventListener('click', () => {
  if (typeof window.exportProfile === 'function') window.exportProfile();
});
const profileImportBtn = document.getElementById('profileImportBtn');
if (profileImportBtn) profileImportBtn.addEventListener('click', () => {
  if (importProfileInput) importProfileInput.click();
});
const resetProgressBtn = document.getElementById('resetProgressBtn');
if (resetProgressBtn) resetProgressBtn.addEventListener('click', () => {
  if (typeof window.resetAllData === 'function') window.resetAllData();
});
const profileResetBtn = document.getElementById('profileResetBtn');
if (profileResetBtn) profileResetBtn.addEventListener('click', () => {
  if (typeof window.resetAllData === 'function') window.resetAllData();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const isGameOpen = window.isGameOpen;
    if (isGameOpen) {
      if (typeof window.closeGameMenu === 'function' && document.getElementById('gameMenuDropdown')?.classList.contains('open')) {
        window.closeGameMenu();
      } else if (typeof window.closeGame === 'function') {
        window.closeGame();
      }
    } else if (settingsModal && settingsModal.classList.contains('show')) settingsModal.classList.remove('show');
    else if (document.getElementById('alarmModal')?.classList.contains('show')) document.getElementById('alarmModal').classList.remove('show');
    else if (profileModal && profileModal.classList.contains('show')) profileModal.classList.remove('show');
    else if (document.getElementById('calendarModal')?.classList.contains('show')) document.getElementById('calendarModal').classList.remove('show');
    else if (document.getElementById('dailyRewardModal')?.classList.contains('show')) document.getElementById('dailyRewardModal').classList.remove('show');
    else if (document.getElementById('caseOpenModal')?.classList.contains('show')) document.getElementById('caseOpenModal').classList.remove('show');
    else if (document.getElementById('postGameModal')?.classList.contains('show')) document.getElementById('postGameModal').classList.remove('show');
    else if (document.getElementById('userProfileModal')?.classList.contains('show')) document.getElementById('userProfileModal').classList.remove('show');
    else if (document.getElementById('roomCreateModal')?.classList.contains('show')) document.getElementById('roomCreateModal').classList.remove('show');
    else if (typeof CHAT !== 'undefined' && CHAT.currentRoom && CHAT.currentRoom !== 'general') {
      if (typeof window.switchRoom === 'function') window.switchRoom('general');
    }
  }
});

const gameMenuTrigger = document.getElementById('gameMenuTrigger');
if (gameMenuTrigger) gameMenuTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  const dropdown = document.getElementById('gameMenuDropdown');
  const wrapper = document.getElementById('gameMenuWrapper');
  if (!wrapper || !dropdown) return;
  const isMenuVisible = wrapper.classList.contains('visible');
  if (!isMenuVisible) wrapper.classList.add('visible');
  const isOpen = dropdown.classList.toggle('open');
  if (isOpen) {
    setTimeout(() => {
      const closeHandler = (ev) => {
        if (!wrapper.contains(ev.target)) {
          dropdown.classList.remove('open');
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 50);
  }
});
const menuReloadBtn = document.getElementById('menuReloadBtn');
if (menuReloadBtn) menuReloadBtn.addEventListener('click', () => {
  const s = getState();
  if (!s || !s.lastGameId) return;
  const iframe = document.getElementById('gameIframe');
  const file = (window.GAME_FILES || {})[s.lastGameId];
  if (!file || !iframe) return;
  if (typeof window.closeGameMenu === 'function') window.closeGameMenu();
  if (typeof window.showGameSkeleton === 'function') window.showGameSkeleton();
  window.currentGameStartTime = Date.now();
  window.sessionStartTotalTime = s.totalTime;
  window.sessionXpStart = s.totalXp;
  window.sessionAchEarned = [];
  try { iframe.src = 'about:blank'; } catch (e) {}
  requestAnimationFrame(() => { iframe.src = file; });
});
const menuBackBtn = document.getElementById('menuBackBtn');
if (menuBackBtn) menuBackBtn.addEventListener('click', () => {
  if (typeof window.closeGameMenu === 'function') window.closeGameMenu();
  if (typeof window.closeGame === 'function') window.closeGame();
});
const menuFullscreenBtn = document.getElementById('menuFullscreenBtn');
if (menuFullscreenBtn) menuFullscreenBtn.addEventListener('click', () => {
  const el = document.getElementById('gameFrameContainer');
  if (!el) return;
  if (!document.fullscreenElement) {
    (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen).call(el);
    if (typeof window.unlockAch === 'function') window.unlockAch('fullscreen');
    const s = getState();
    if (s && s.todayStats) s.todayStats.fullscreenUsed = true;
    if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  }
});
const menuSettingsBtn = document.getElementById('menuSettingsBtn');
if (menuSettingsBtn && settingsModal) menuSettingsBtn.addEventListener('click', () => {
  if (typeof window.closeGameMenu === 'function') window.closeGameMenu();
  settingsModal.classList.add('show');
  if (typeof window.renderStats === 'function') window.renderStats();
  loadSettings();
  const s = getState();
  if (s && s.todayStats) s.todayStats.settingsViewed = true;
  if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
});
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('gameMenuDropdown');
  if (!dropdown || !dropdown.classList.contains('open')) return;
  const wrapper = document.getElementById('gameMenuWrapper');
  if (wrapper && !wrapper.contains(e.target)) dropdown.classList.remove('open');
});
document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('menuFullscreenBtn');
  if (!btn) return;
  const isFull = !!document.fullscreenElement;
  const menuText = btn.querySelector('.menu-text');
  if (menuText) menuText.textContent = isFull ? 'Выйти из полного экрана' : 'Полный экран';
});

const pgCloseBtn = document.getElementById('pgCloseBtn');
if (pgCloseBtn) pgCloseBtn.addEventListener('click', () => {
  document.getElementById('postGameModal').classList.remove('show');
});
const pgPlayAgainBtn = document.getElementById('pgPlayAgainBtn');
if (pgPlayAgainBtn) pgPlayAgainBtn.addEventListener('click', () => {
  document.getElementById('postGameModal').classList.remove('show');
  const s = getState();
  if (typeof window.openGame === 'function' && s && s.lastGameId) {
    window.openGame(s.lastGameId);
  }
});
const postGameModal = document.getElementById('postGameModal');
if (postGameModal) postGameModal.addEventListener('click', (e) => {
  if (e.target.id === 'postGameModal') postGameModal.classList.remove('show');
});

(async function init() {
  if (typeof window.applyDeviceMode === 'function') window.applyDeviceMode();
  if (typeof window.loadState === 'function') {
    await window.loadState();
  }
  if (!window.state) window.state = {};

  window.state.selectedGameId = null;
  window.state.selectedUtilityId = null;

  if (typeof window.updateStreak === 'function') window.updateStreak();
  if (typeof window.checkDailyQuests === 'function') window.checkDailyQuests();

  createParticles();
  createStars();
  buildAnimatedLogo();
  updateClock();

  if (typeof window.renderGames === 'function') window.renderGames();
  if (typeof window.renderUtilities === 'function') window.renderUtilities();
  loadSettings();
  if (typeof window.renderStats === 'function') window.renderStats();
  if (typeof window.renderAchievements === 'function') window.renderAchievements();
  if (typeof window.renderProfile === 'function') window.renderProfile();
  if (typeof window.renderQuests === 'function') window.renderQuests();
  if (typeof window.renderStreak === 'function') window.renderStreak();
  if (typeof window.renderQuestTimer === 'function') {
    window.renderQuestTimer();
    setInterval(window.renderQuestTimer, 1000);
  }
  if (typeof window.updateLevelDisplay === 'function') window.updateLevelDisplay();
  if (typeof window.updateLastGameBar === 'function') window.updateLastGameBar();
  if (typeof window.renderCases === 'function') window.renderCases();

  if (typeof window.initTabs === 'function') window.initTabs();
  if (typeof window.initStreakUI === 'function') window.initStreakUI();
  if (typeof window.initCasesUI === 'function') window.initCasesUI();

  console.log('🔥 Лаунчер FireLand v' + APP_VERSION + ' · Игр: ' + (window.GAMES || []).length + ' · Утилит: ' + (window.UTILITIES || []).length);

  if (typeof window.initLeaderboard === 'function') window.initLeaderboard();

  if (window.state.lastSubmittedNick) {
    setTimeout(() => {
      if (typeof window.submitScore === 'function') window.submitScore();
    }, 5000);
  }

  if (typeof window.setupTVNavigation === 'function') window.setupTVNavigation();
  if (typeof window.setupSwipeNavigation === 'function') window.setupSwipeNavigation();
  if (typeof window.setupGameBackSwipe === 'function') window.setupGameBackSwipe();   // ← ДОБАВИЛ
  if (typeof window.updateChatBadge === 'function') setTimeout(window.updateChatBadge, 800);
})();

window.APP_VERSION = APP_VERSION;
window.getSmartTheme = getSmartTheme;
window.applyTheme = applyTheme;
window.updateClock = updateClock;
window.createParticles = createParticles;
window.createStars = createStars;
window.updateParticleColors = updateParticleColors;
window.buildAnimatedLogo = buildAnimatedLogo;
window.loadSettings = loadSettings;

console.log('[script.js] Загружено v' + APP_VERSION);

})();