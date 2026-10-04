// ============================================
// FireLand · streak.js · v26.3.4
// Стрик + календарь + ежедневная награда + маскот
// ============================================

const DAILY_REWARDS = [50, 100, 200, 400, 800, 1500];

function getDailyRewardAmount(streakDay) {
  const idx = Math.min(streakDay - 1, DAILY_REWARDS.length - 1);
  return DAILY_REWARDS[idx];
}

function checkDailyReward() {
  const s = window.state;
  const today = window.todayStr();
  if (s.lastDailyReward === today) return;
  const streakDay = s.streak.current || 1;
  const xp = getDailyRewardAmount(streakDay);
  const streakBonus = streakDay > 0 && streakDay % 7 === 0 ? 500 : 0;

  document.getElementById('dailyRewardTitle').textContent = `🔥 День ${streakDay}`;
  document.getElementById('dailyRewardSub').textContent = streakBonus > 0
    ? `🎉 Недельный бонус: ещё +${streakBonus} XP!`
    : 'Ежедневная награда';
  document.getElementById('dailyRewardXp').textContent = `+${xp + streakBonus} XP`;

  const bar = document.getElementById('dailyRewardStreakBar');
  bar.innerHTML = '';
  for (let i = 1; i <= 7; i++) {
    const dot = document.createElement('div');
    dot.className = 'streak-dot';
    const dayInWeek = ((streakDay - 1) % 7) + 1;
    if (i < dayInWeek) dot.classList.add('active');
    else if (i === dayInWeek) dot.classList.add('active', 'today');
    dot.textContent = i;
    bar.appendChild(dot);
  }

  document.getElementById('dailyRewardModal').classList.add('show');
  window.SOUNDS.reward();

  s.lastDailyReward = today;
  s.dailyRewardsClaimed = (s.dailyRewardsClaimed || 0) + 1;
  s.totalXp += xp + streakBonus;
  window.saveState();
  window.updateLevelDisplay();
  window.renderStats();

  const lvlInfo = window.getLevelFromTotalXp(s.totalXp);
  if (lvlInfo.level > s.level) {
    s.level = lvlInfo.level;
    setTimeout(() => { window.SOUNDS.levelup(); window.showLevelUpToast(s.level); }, 800);
  }
  window.checkLevelAchievements();
}

function updateStreak() {
  const s = window.state;
  const today = window.todayStr();
  if (s.streak.lastLogin === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = window.dateStr(yesterday);
  if (s.streak.lastLogin === yStr) s.streak.current += 1;
  else s.streak.current = 1;
  s.streak.lastLogin = today;
  if (s.streak.current > s.streak.best) s.streak.best = s.streak.current;
  if (!s.streak.history) s.streak.history = [];
  if (!s.streak.history.includes(today)) s.streak.history.push(today);
  if (s.streak.history.length > 365) s.streak.history = s.streak.history.slice(-365);

  if (s.streak.current >= 3) window.unlockAch('streak_3');
  if (s.streak.current >= 7) window.unlockAch('streak_7');
  if (s.streak.current >= 30) window.unlockAch('streak_30');
  if (s.streak.current >= 100) window.unlockAch('streak_100');

  renderStreak();
  window.saveState();
  setTimeout(() => checkDailyReward(), 1000);
  if (s.lastSubmittedNick && typeof window.submitScore === 'function') {
    setTimeout(window.submitScore, 2000);
  }
}

function renderStreak() {
  const el = document.getElementById('streakCount');
  if (el) el.textContent = window.state.streak.current;
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const now = new Date();
  const today = window.todayStr();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startWeekday = firstDay.getDay();
  if (startWeekday === 0) startWeekday = 7;
  startWeekday -= 1;
  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    grid.appendChild(empty);
  }
  const history = window.state.streak.history || [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateObj = new Date(year, month, d);
    const dStr = window.dateStr(dateObj);
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.textContent = d;
    if (history.includes(dStr)) cell.classList.add('active');
    if (dStr === today) cell.classList.add('today');
    if (dateObj > now && dStr !== today) cell.classList.add('future');
    grid.appendChild(cell);
  }
  document.getElementById('calCurrent').textContent = window.state.streak.current;
  document.getElementById('calBest').textContent = window.state.streak.best;
}

// ========== Маскот ==========
function hideMascot() {
  const w = document.getElementById('mascotWrapper');
  if (w) w.classList.add('hidden');
}
function showMascot() {
  const w = document.getElementById('mascotWrapper');
  if (w) w.classList.remove('hidden');
}
function showMascotFallback() {
  const container = document.getElementById('mascotContainer');
  if (container) {
    container.innerHTML = '<div class="mascot-fallback">🔥</div>';
    container.style.background = 'linear-gradient(135deg, #1a0a00, #3a1a00)';
  }
}

// ========== Инициализация кнопок ==========
function initStreakUI() {
  const claimBtn = document.getElementById('dailyRewardClaimBtn');
  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
      document.getElementById('dailyRewardModal').classList.remove('show');
      window.SOUNDS.click();
    });
  }
  const streakBadge = document.getElementById('streakBadge');
  const calendarModal = document.getElementById('calendarModal');
  const calendarClose = document.getElementById('calendarCloseBtn');
  if (streakBadge && calendarModal) {
    streakBadge.addEventListener('click', () => {
      renderCalendar();
      calendarModal.classList.add('show');
    });
  }
  if (calendarClose && calendarModal) {
    calendarClose.addEventListener('click', () => calendarModal.classList.remove('show'));
  }
  if (calendarModal) {
    calendarModal.addEventListener('click', (e) => {
      if (e.target === calendarModal) calendarModal.classList.remove('show');
    });
  }

  // Маскот
  const mascotVideo = document.getElementById('mascotVideo');
  const mascotSource = mascotVideo ? mascotVideo.querySelector('source') : null;
  if (mascotVideo) mascotVideo.addEventListener('error', showMascotFallback);
  if (mascotSource) mascotSource.addEventListener('error', showMascotFallback);
  setTimeout(() => {
    if (mascotVideo && mascotVideo.readyState < 2) showMascotFallback();
  }, 3000);
}

// ========== Экспорт ==========
window.DAILY_REWARDS = DAILY_REWARDS;
window.getDailyRewardAmount = getDailyRewardAmount;
window.checkDailyReward = checkDailyReward;
window.updateStreak = updateStreak;
window.renderStreak = renderStreak;
window.renderCalendar = renderCalendar;
window.hideMascot = hideMascot;
window.showMascot = showMascot;
window.showMascotFallback = showMascotFallback;
window.initStreakUI = initStreakUI;

console.log('[streak.js] Загружено');