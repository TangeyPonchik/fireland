// ============================================
// FireLand · device.js · v27.0.6
// Устройство + TV + свайпы вкладок + свайп «назад из игры»
// Фиксы: #37 (TV detection), #38 (двойные обработчики)
// НОВОЕ: свайп от левого края → выход из игры
// ============================================

let tvNavigationSetup = false;
let swipeNavigationSetup = false;
let gameBackSwipeSetup = false;

function detectDevice() {
  const ua = navigator.userAgent;
  const isTV = /SmartTV|Tizen|WebOS|AppleTV|AndroidTV|HbbTV|NetCast|BRAVIA|VIDAA|Roku|Xbox|PlayStation|SMART-TV/i.test(ua);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) && !isTV;
  return isTV ? 'tv' : isMobile ? 'mobile' : 'desktop';
}

function applyDeviceMode() {
  const device = detectDevice();
  document.body.dataset.device = device;
  console.log('[Device] Режим:', device);
}

// ============================================
// TV-НАВИГАЦИЯ
// ============================================
function setupTVNavigation() {
  if (document.body.dataset.device !== 'tv') return;
  if (tvNavigationSetup) return;
  tvNavigationSetup = true;

  setTimeout(() => {
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) activeTab.focus();
  }, 300);

  document.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    const focusable = Array.from(document.querySelectorAll(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), .game-card'
    )).filter(el => el.offsetParent !== null && !el.closest('.game-frame-wrap'));
    if (focusable.length === 0) return;
    const current = document.activeElement;
    let idx = focusable.indexOf(current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      idx = idx < 0 ? 0 : (idx + 1) % focusable.length;
      focusable[idx].focus();
      focusable[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      idx = idx < 0 ? focusable.length - 1 : (idx - 1 + focusable.length) % focusable.length;
      focusable[idx].focus();
      focusable[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Select') {
      if (current && current.click && !current.classList.contains('game-card')) {
        e.preventDefault();
        current.click();
      }
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      const openModal = document.querySelector('.modal.show');
      if (openModal) {
        e.preventDefault();
        openModal.classList.remove('show');
      }
    } else if (e.key === 'MediaPlayPause') {
      e.preventDefault();
      if (window.isGameOpen) window.closeGame();
      else if (window.state && window.state.selectedGameId) window.openGame(window.state.selectedGameId);
    }
  });
  console.log('[TV] Навигация пультом активна');
}

// ============================================
// СВАЙПЫ ВКЛАДОК (лаунчер)
// ============================================
function setupSwipeNavigation() {
  if (document.body.dataset.device === 'desktop') return;
  if (swipeNavigationSetup) return;
  swipeNavigationSetup = true;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  const SWIPE_THRESHOLD = 80;
  const SWIPE_TIME = 500;
  // ✅ ФИКС: neiro добавлен в конце (в index.html он после chat)
  const tabsOrder = ['games', 'utilities', 'quests', 'leaderboard', 'chat', 'neiro'];

  function showSwipeIndicator(text) {
    let el = document.querySelector('.tab-swipe-indicator');
    if (!el) {
      el = document.createElement('div');
      el.className = 'tab-swipe-indicator';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.remove('show'), 600);
  }

  function switchTabTo(direction) {
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) return;
    const currentIdx = tabsOrder.indexOf(activeTab.dataset.tab);
    if (currentIdx < 0) return;
    let nextIdx = currentIdx + direction;
    if (nextIdx < 0) nextIdx = tabsOrder.length - 1;
    if (nextIdx >= tabsOrder.length) nextIdx = 0;
    const nextTabId = tabsOrder[nextIdx];
    const nextBtn = document.querySelector(`.tab-btn[data-tab="${nextTabId}"]`);
    if (nextBtn) {
      nextBtn.click();
      showSwipeIndicator(
        direction > 0
          ? `→ ${nextBtn.textContent.trim()}`
          : `← ${nextBtn.textContent.trim()}`
      );
    }
  }

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    if (e.target.closest('.game-frame-wrap')) return;
    if (e.target.closest('.modal.show')) return;
    if (e.target.closest('input, textarea, select')) return;
    if (e.target.closest('.lb-list, .games-list-panel, .chat-messages, .online-list, .dm-list, .rooms-list, .neiro-messages')) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!touchStartX) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    touchStartX = 0;
    touchStartY = 0;
    if (dt > SWIPE_TIME) return;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) switchTabTo(-1);
    else switchTabTo(1);
  }, { passive: true });
  console.log('[Mobile] Свайпы вкладок активны');
}

// ============================================
// СВАЙП ОТ ЛЕВОГО КРАЯ → ВЫХОД ИЗ ИГРЫ
// ============================================
function setupGameBackSwipe() {
  if (gameBackSwipeSetup) return;
  gameBackSwipeSetup = true;

  let edgeStartX = 0;
  let edgeStartY = 0;
  let edgeStartTime = 0;
  let edgeTracking = false;

  const EDGE_ZONE = 30;
  const SWIPE_THRESHOLD = 80;
  const SWIPE_TIME = 500;

  document.addEventListener('touchstart', (e) => {
    if (!window.isGameOpen) return;
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (t.clientX > EDGE_ZONE) return;
    edgeStartX = t.clientX;
    edgeStartY = t.clientY;
    edgeStartTime = Date.now();
    edgeTracking = true;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!edgeTracking) return;
    edgeTracking = false;
    if (!window.isGameOpen) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - edgeStartX;
    const dy = t.clientY - edgeStartY;
    const dt = Date.now() - edgeStartTime;

    if (dt < SWIPE_TIME && dx > SWIPE_THRESHOLD && Math.abs(dy) < 60) {
      if (typeof window.vibrateDevice === 'function') window.vibrateDevice();
      if (typeof window.closeGame === 'function') {
        window.closeGame();
      }
    }
  }, { passive: true });

  document.addEventListener('touchcancel', () => {
    edgeTracking = false;
  }, { passive: true });

  console.log('[Mobile] Свайп-назад из игры активен');
}

// ========== Экспорт ==========
window.detectDevice = detectDevice;
window.applyDeviceMode = applyDeviceMode;
window.setupTVNavigation = setupTVNavigation;
window.setupSwipeNavigation = setupSwipeNavigation;
window.setupGameBackSwipe = setupGameBackSwipe;

console.log('[device.js] Загружено v27.0.6');