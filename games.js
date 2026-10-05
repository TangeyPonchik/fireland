// ============================================
// FireLand · games.js · v26.3.5
// Данные игр + вкладки + UI игр + меню игры + таймер
// БЕЗ export. Всё в window.
// ============================================

// ============================================
// ДАННЫЕ
// ============================================
const GAMES = [
{id:'proryv1',name:'Прорыв 1',icon:'💻',genre:'RPG, Стратегия',difficulty:3,description:'Сражайся с 20 врагами, прокачивай ВПН и прорывайся через систему. Каждый враг уникален: от охранников РКН до самого Максута Шадаева. Покупай улучшения, ищи аптечки и докажи, что интернет — это свобода.',bg:'linear-gradient(135deg, #ff6b35, #e83040, #cc2244)'},
{id:'dom',name:'ДОМ',icon:'🏚️',genre:'Хоррор, Текстовый квест',difficulty:4,description:'Атмосферный текстовый квест в старом доме. Исследуй комнаты, собирай предметы, разгадывай тайны прошлого. Три вещи нужны, чтобы выбраться: ключ, свеча и фотография. Настоящий ужас в каждом углу.',bg:'linear-gradient(135deg, #8a7f7a, #b5a89e, #d4c8bd, #9a8e85)'},
{id:'cooking',name:'Великая кулинария',icon:'🍳',genre:'Симулятор, Крафт',difficulty:3,description:'Стань настоящим шеф-поваром! Смешивай ингредиенты, создавай новые рецепты, улучшай свою кухню и зарабатывай монеты. Чем сложнее рецепт — тем больше награда.',bg:'linear-gradient(135deg, #f7971e, #ffd200, #f9a825)'},
{id:'dom2',name:'ДОМ 2',icon:'🩸',genre:'Хоррор, Выживание',difficulty:5,description:'10 лет спустя ты вернулся. Найди 3 якоря. Сожги их. Освободи детей, которых дом держит. 5 концовок, живой таймкод, система разрушения. Настоящий хоррор. Дом помнит тебя.',bg:'linear-gradient(135deg, #6a0f0f, #a81818, #d62828, #8a1010)'},
{id:'proryv2',name:'Прорыв 2',icon:'🛡️',genre:'RPG, Стратегия',difficulty:4,description:'Продолжение легендарной RPG. Выбирай фракцию, сражайся с врагами, прокачивай персонажа и прорывайся через систему. Каждое решение влияет на сюжет.',bg:'linear-gradient(135deg, #7a4aff, #4a1a8a, #2a0a6a)'},
{id:'kontrabandist',name:'Косм. контрабандист',icon:'🚀',genre:'Симулятор, Экономика',difficulty:4,description:'Стань капитаном космического корабля! Торгуй ресурсами, уклоняйся от пиратов, выполняй контракты и строй свою империю в открытом космосе.',bg:'linear-gradient(135deg, #0a1628, #1a3a6a, #0a2a5a)'},
{id:'robo26',name:'Robo-Cleaner 2.6',icon:'🤖',genre:'Экшен, Боевик',difficulty:4,description:'Сражайся с роботами-захватчиками в пошаговых битвах. Улучшай оружие, броню, героев и очищай город от машин. Каждый бой — это вызов.',bg:'linear-gradient(135deg, #2a3a4a, #4a5a6a, #3a4a5a)'},
{id:'fight',name:'БИТВА СИЛЬНЕЙШИХ',icon:'👊',genre:'Файтинг, Мультиплеер',difficulty:3,description:'Сражайся с друзьями на одном экране! Выбери персонажа и управляй им с геймпада. Докажи, кто достоин звания сильнейшего бойца.',bg:'linear-gradient(135deg, #cc2b5e, #753a88, #4a1a6a)'},
{id:'miner',name:'Шахтёр',icon:'⛏️',genre:'Кликер, Экономика',difficulty:2,description:'Отправляйся в шахты разных планет! Добывай руду, улучшай кирку, плавь слитки и продавай ресурсы. Чем глубже — тем ценнее находки.',bg:'linear-gradient(135deg, #2c3e50, #4a6a3a, #3a5a2a)'},
{id:'musibox',name:'Musibox',icon:'🎧',genre:'Музыка, Секвенсор',difficulty:2,description:'Создавай свою музыку! Множество треков — барабаны, басы, синты и вокал. Кликай по персонажам, комбинируй биты, лови бонусы за комбинации. Запиши и скачай свой микс, настоящая студия звукозаписи в браузере!',bg:'linear-gradient(135deg, #4dabf7, #9775fa, #f783ac)'},
{id:'lastfrontier',name:'Последний рубеж',icon:'🧟',genre:'Автобаттлер, Карточная игра',difficulty:4,description:'Автобаттлер в мире зомби-апокалипсиса! Собирай карты зомби, сражайся в автоматических боях, зарабатывай монеты и гемы, покупай легендарных существ. Много уникальных карт с лором — от простого работяги до Зомби-бога.',bg:'linear-gradient(135deg, #2e4a2e, #0d1a0d, #66ff66)'},
{id:'proryv3',name:'Прорыв 3',icon:'🌐',genre:'RPG, Стратегия, Финал',difficulty:5,description:'Финальная часть трилогии Прорыва! Выбери одну из четырёх фракций: Работник РКН, Хакер, Журналист или Инженер. Прокачивай VPN, сражайся с 25 уникальными врагами — от простого охранника до самого Максута Шадаева. Победи финального босса ЦЕНЗУРУ и освободи интернет!',bg:'linear-gradient(135deg, #c9418a, #a04ac9, #7a4ae0, #c9418a)'},
{id:'snakebattle',name:'Snakes Battle',icon:'🐍',genre:'Онлайн · PvP · Командный',difficulty:5,description:'Командные бои змеек — красные против синих, до 20 игроков. Управляй мышью, свайпами или геймпадом: ешь гранулы, расти, убивай врагов. Монеты за убийства → скины и боксы. Дорастёшь до 500 длины — придёт БОСС-ЗМЕЯ. Стань королём змеек!',bg:'linear-gradient(135deg, #05f138, #b8cf33, #05f138, #b8cf33)'}];

const UTILITIES = [
{id:'fireshop',name:'FireShop 3D',icon:'🎨',genre:'3D-редактор · Photoshop',difficulty:5,description:'Полноценный 3D/2D-редактор прямо в браузере. 3D-примитивы, свет, HDRI-окружение, покраска объектов, кисть-текстура, экспорт в GLB и PNG. 2D-режим с кистью, заливкой, фильтрами и текстом. Работает на Three.js.',bg:'linear-gradient(135deg, #ff6b35, #f7931e, #ffcd3c)',file:'УТИЛИТЫ/FireShop.html'},
{id:'cpstest',name:'Тест автокликера',icon:'⚡',genre:'Утилита · Тест',difficulty:1,description:'Проверь скорость своего автокликера или мыши. Показывает количество кликов и CPS (клики в секунду) в реальном времени. Оценивает скорость как «медленно / быстро / супер-скорость».',bg:'linear-gradient(135deg, #1a1a2e, #e94560, #0f3460)',file:'УТИЛИТЫ/тест cps.html'}
];

const GAME_FILES = {
proryv1:'ИГРЫ/Прорыв.html',
cooking:'ИГРЫ/Великая кулинария.html',
proryv2:'ИГРЫ/Прорыв 2.html',
kontrabandist:'ИГРЫ/Космический контробандист.html',
robo26:'ИГРЫ/Robo-cleaner2.0.html',
fight:'ИГРЫ/БИТВА СИЛЬНЕЙШИХ.html',
miner:'ИГРЫ/Шахтер/Шахтер.html',
musibox:'ИГРЫ/Musibox.html',
lastfrontier:'ИГРЫ/ПОСЛЕДНИЙ РУБЕЖ.html',
proryv3:'ИГРЫ/Прорыв 3.html',
dom:'ИГРЫ/ДОМ.html',
dom2:'ИГРЫ/ДОМ 2.html',
snakebattle:'ИГРЫ/snakebattle.html',
fireshop:'УТИЛИТЫ/FireShop.html',
cpstest:'УТИЛИТЫ/тест cps.html'
};

// ============================================
// УТИЛИТЫ
// ============================================
function gamesFormatTime(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

// ============================================
// ВКЛАДКИ
// ============================================
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'quests') {
        if (typeof window.renderQuests === 'function') window.renderQuests();
        if (window.state.todayStats) window.state.todayStats.questsViewed = true;
        if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
      }
      if (btn.dataset.tab === 'leaderboard') {
        if (typeof window.refreshLeaderboard === 'function') window.refreshLeaderboard();
      }
      if (btn.dataset.tab === 'chat') {
        if (typeof window.onChatTabOpen === 'function') window.onChatTabOpen();
      }
      if (btn.dataset.tab === 'utilities') {
        renderUtilities();
      }
    });
  });
}

// ============================================
// UI ИГР
// ============================================
let isGameOpen = false;
let menuHideTimer = null;
let backBtnListenersAdded = false;
let isMenuVisible = false;
let isMenuOpen = false;
let menuRafPending = false;
let currentGameStartTime = 0;
let sessionXpStart = 0;
let sessionAchEarned = [];
let sessionStartTotalTime = 0;
let tickInterval = null;
let lastTickTime = 0;
let lastPlayedGameId = null;

function toggleFavorite(gameId, event) {
  if (event) event.stopPropagation();
  const s = window.state;
  const idx = s.favorites.indexOf(gameId);
  if (idx >= 0) s.favorites.splice(idx, 1);
  else {
    s.favorites.push(gameId);
    if (typeof window.unlockAch === 'function') window.unlockAch('favorite_add');
    if (s.todayStats) s.todayStats.favAdded = (s.todayStats.favAdded || 0) + 1;
    if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
  }
  if (typeof window.saveState === 'function') window.saveState();
  renderGames();
  renderUtilities();
}

function selectGame(gameId) {
  const game = GAMES.find(g => g.id === gameId);
  if (!game) return;
  const s = window.state;
  s.selectedGameId = gameId;
  s.selectedUtilityId = null;
  if (typeof window.saveState === 'function') window.saveState();
  document.querySelectorAll('#gameGrid .game-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.gameId === gameId);
  });
  document.querySelectorAll('#utilGrid .game-card').forEach(card => card.classList.remove('selected'));
  document.getElementById('noGameSelected').style.display = 'none';
  const detailEl = document.getElementById('gameDetail');
  detailEl.style.display = 'flex';
  const stars = '⭐'.repeat(game.difficulty) + '☆'.repeat(5 - game.difficulty);
  const playedTime = s.playTime[gameId] || 0;
  const timeStr = playedTime > 0 ? gamesFormatTime(playedTime) : 'не играл';
  const isFav = s.favorites.includes(gameId);
  detailEl.innerHTML = `
    <div class="icon">${game.icon}</div>
    <div class="name">${game.name}</div>
    <div class="genre">🎭 ${game.genre}</div>
    <div class="difficulty">${stars}</div>
    <div class="description">${game.description}</div>
    <div style="font-size:14px;color:var(--text-secondary);font-weight:600;margin-bottom:14px;">⏱️ Проведено времени: <span style="color:var(--accent-secondary)">${timeStr}</span></div>
    <div style="display:flex;gap:10px;align-items:center;">
      <button class="play-btn" id="playFromDetail">🎮 Играть</button>
      <button class="fav-btn-detail" id="favFromDetail" style="background:${isFav?'var(--accent-secondary)':'var(--bg-card)'};border:1px solid var(--border);color:${isFav?'#060a1a':'var(--text)'};padding:16px 20px;border-radius:40px;font-size:22px;cursor:pointer;">${isFav?'⭐':'☆'}</button>
    </div>`;
  document.getElementById('playFromDetail').addEventListener('click', () => openGame(gameId));
  document.getElementById('favFromDetail').addEventListener('click', (e) => {
    toggleFavorite(gameId, e);
    selectGame(gameId);
  });
}

function selectUtility(utilId) {
  const util = UTILITIES.find(u => u.id === utilId);
  if (!util) return;
  const s = window.state;
  s.selectedUtilityId = utilId;
  s.selectedGameId = null;
  if (typeof window.saveState === 'function') window.saveState();
  document.querySelectorAll('#utilGrid .game-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.gameId === utilId);
  });
  document.querySelectorAll('#gameGrid .game-card').forEach(card => card.classList.remove('selected'));
  document.getElementById('noUtilSelected').style.display = 'none';
  const detailEl = document.getElementById('utilDetail');
  detailEl.style.display = 'flex';
  const stars = '⭐'.repeat(util.difficulty) + '☆'.repeat(5 - util.difficulty);
  const playedTime = s.playTime[utilId] || 0;
  const timeStr = playedTime > 0 ? gamesFormatTime(playedTime) : 'не использовал';
  const isFav = s.favorites.includes(utilId);
  detailEl.innerHTML = `
    <div class="icon">${util.icon}</div>
    <div class="name">${util.name}</div>
    <div class="genre">🎭 ${util.genre}</div>
    <div class="difficulty">${stars}</div>
    <div class="description">${util.description}</div>
    <div style="font-size:14px;color:var(--text-secondary);font-weight:600;margin-bottom:14px;">⏱️ Проведено времени: <span style="color:var(--accent-secondary)">${timeStr}</span></div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      <button class="play-btn util-play-btn" id="playFromDetailUtil">🛠️ Открыть</button>
      <button class="play-btn util-newtab-btn" id="newTabFromDetailUtil" style="background:var(--bg-card);border:1px solid var(--border);color:var(--text);padding:16px 20px;border-radius:40px;font-size:16px;cursor:pointer;">↗ В новой вкладке</button>
      <button class="fav-btn-detail" id="favFromDetailUtil" style="background:${isFav?'var(--accent-secondary)':'var(--bg-card)'};border:1px solid var(--border);color:${isFav?'#060a1a':'var(--text)'};padding:16px 20px;border-radius:40px;font-size:22px;cursor:pointer;">${isFav?'⭐':'☆'}</button>
    </div>`;
  document.getElementById('playFromDetailUtil').addEventListener('click', () => openGame(utilId));
  document.getElementById('newTabFromDetailUtil').addEventListener('click', () => {
    window.open(util.file, '_blank', 'noopener');
  });
  document.getElementById('favFromDetailUtil').addEventListener('click', (e) => {
    toggleFavorite(utilId, e);
    selectUtility(utilId);
  });
}

function clearSelection() {
  const s = window.state;
  s.selectedGameId = null;
  s.selectedUtilityId = null;
  if (typeof window.saveState === 'function') window.saveState();
  document.querySelectorAll('.game-card').forEach(card => card.classList.remove('selected'));
  const ng = document.getElementById('noGameSelected'); if (ng) ng.style.display = 'flex';
  const gd = document.getElementById('gameDetail'); if (gd) gd.style.display = 'none';
  const nu = document.getElementById('noUtilSelected'); if (nu) nu.style.display = 'flex';
  const ud = document.getElementById('utilDetail'); if (ud) ud.style.display = 'none';
}

function renderGames() {
  const grid = document.getElementById('gameGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const s = window.state;
  const filtered = [...GAMES].sort((a, b) => {
    const af = s.favorites.includes(a.id) ? 0 : 1;
    const bf = s.favorites.includes(b.id) ? 0 : 1;
    return af - bf;
  });
  document.getElementById('gamesCount').textContent = filtered.length;
  filtered.forEach(game => grid.appendChild(createGameCard(game)));
}

function renderUtilities() {
  const grid = document.getElementById('utilGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const s = window.state;
  const filtered = [...UTILITIES].sort((a, b) => {
    const af = s.favorites.includes(a.id) ? 0 : 1;
    const bf = s.favorites.includes(b.id) ? 0 : 1;
    return af - bf;
  });
  document.getElementById('utilCount').textContent = filtered.length;
  filtered.forEach(util => grid.appendChild(createUtilityCard(util)));
}

function createGameCard(game) {
  const card = document.createElement('div');
  card.className = 'game-card';
  card.dataset.gameId = game.id;
  const s = window.state;
  if (s.selectedGameId === game.id) card.classList.add('selected');
  const isFav = s.favorites.includes(game.id);
  card.innerHTML = `
    <button class="fav-btn ${isFav ? 'active' : ''}" data-fav-id="${game.id}">${isFav ? '⭐' : '☆'}</button>
    <div class="card-bg" style="background:${game.bg};"></div>
    <div class="card-content"><span class="icon">${game.icon}</span><div class="name">${game.name}</div></div>`;
  card.addEventListener('click', (e) => {
    if (e.target.closest('.fav-btn')) return;
    selectGame(game.id);
  });
  card.querySelector('.fav-btn').addEventListener('click', (e) => toggleFavorite(game.id, e));
  return card;
}

function createUtilityCard(util) {
  const card = document.createElement('div');
  card.className = 'game-card util-card';
  card.dataset.gameId = util.id;
  const s = window.state;
  if (s.selectedUtilityId === util.id) card.classList.add('selected');
  const isFav = s.favorites.includes(util.id);
  card.innerHTML = `
    <div class="exp-badge" style="background:linear-gradient(135deg,#22c55e,#16a34a);">УТИЛИТА</div>
    <button class="fav-btn ${isFav ? 'active' : ''}" data-fav-id="${util.id}">${isFav ? '⭐' : '☆'}</button>
    <div class="card-bg" style="background:${util.bg};"></div>
    <div class="card-content"><span class="icon">${util.icon}</span><div class="name">${util.name}</div></div>`;
  card.addEventListener('click', (e) => {
    if (e.target.closest('.fav-btn')) return;
    selectUtility(util.id);
  });
  card.querySelector('.fav-btn').addEventListener('click', (e) => toggleFavorite(util.id, e));
  return card;
}

// ============================================
// МЕНЮ ИГРЫ
// ============================================
function checkGameMenuVisibility(e) {
  if (!isGameOpen) return;
  if (menuRafPending) return;
  menuRafPending = true;
  requestAnimationFrame(() => {
    menuRafPending = false;
    const wrapper = document.getElementById('gameMenuWrapper');
    const dropdown = document.getElementById('gameMenuDropdown');
    if (!wrapper || !dropdown) return;
    const isInTopZone = e.clientX < 80 && e.clientY < 80;
    if (isInTopZone) {
      if (!isMenuVisible) { isMenuVisible = true; wrapper.classList.add('visible'); }
      clearTimeout(menuHideTimer);
    } else {
      if (isMenuOpen) return;
      clearTimeout(menuHideTimer);
      menuHideTimer = setTimeout(() => {
        if (isMenuOpen) return;
        wrapper.classList.remove('visible');
        isMenuVisible = false;
      }, 5000);
    }
  });
}

function addGameMenuListeners() {
  if (backBtnListenersAdded) return;
  document.addEventListener('mousemove', checkGameMenuVisibility);
  backBtnListenersAdded = true;
}

function removeGameMenuListeners() {
  document.removeEventListener('mousemove', checkGameMenuVisibility);
  backBtnListenersAdded = false;
  const wrapper = document.getElementById('gameMenuWrapper');
  const dropdown = document.getElementById('gameMenuDropdown');
  if (wrapper) wrapper.classList.remove('visible');
  if (dropdown) dropdown.classList.remove('open');
  isMenuVisible = false;
  isMenuOpen = false;
  clearTimeout(menuHideTimer);
}

function closeGameMenu() {
  const dropdown = document.getElementById('gameMenuDropdown');
  if (dropdown) dropdown.classList.remove('open');
  isMenuOpen = false;
}

function showGameSkeleton() {
  const sk = document.getElementById('gameSkeleton');
  if (sk) { sk.classList.remove('hidden'); sk.style.display = 'flex'; }
}

function hideGameSkeleton() {
  const sk = document.getElementById('gameSkeleton');
  if (sk) {
    sk.classList.add('hidden');
    setTimeout(() => { sk.style.display = 'none'; }, 400);
  }
}

// ============================================
// ОТКРЫТИЕ / ЗАКРЫТИЕ ИГРЫ
// ============================================
function openGame(gameId) {
  const container = document.getElementById('gameFrameContainer');
  const iframe = document.getElementById('gameIframe');
  const file = GAME_FILES[gameId];
  if (!file) { alert('❌ Файл не найден: ' + gameId); return; }
  const isUtil = UTILITIES.some(u => u.id === gameId);
  const s = window.state;
  s.lastGameId = gameId;
  s.lastGameTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  currentGameStartTime = Date.now();
  sessionStartTotalTime = s.totalTime;
  sessionXpStart = s.totalXp;
  sessionAchEarned = [];
  if (typeof window.saveState === 'function') window.saveState();
  updateLastGameBar();
  checkGameAchievements(gameId);
  const achBefore = new Set(s.achievements);
  if (typeof window.hideMascot === 'function') window.hideMascot();
  document.body.classList.add('game-active');
  showGameSkeleton();
  try { iframe.src = 'about:blank'; } catch (e) {}
  iframe.onload = null;
  iframe.onerror = null;
  if (isUtil) {
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-modals allow-downloads allow-orientation-lock allow-top-navigation-by-user-activation');
  } else {
    iframe.removeAttribute('sandbox');
  }
  iframe.setAttribute('allow', 'fullscreen; gamepad; autoplay; accelerometer; gyroscope; magnetometer; microphone; camera; clipboard-read; clipboard-write; picture-in-picture');
  let loadHandled = false;
  const onLoad = () => { if (loadHandled) return; loadHandled = true; hideGameSkeleton(); };
  iframe.onload = onLoad;
  iframe.onerror = onLoad;
  const cacheBusted = file + (file.includes('?') ? '&' : '?') + 'v=' + Date.now();
  requestAnimationFrame(() => { iframe.src = cacheBusted; });
  container.style.display = 'block';
  isGameOpen = true;
  setTimeout(() => { if (isGameOpen) hideGameSkeleton(); }, 4000);
  startTimeTicker(gameId);
  addGameMenuListeners();
  const achTrackInterval = setInterval(() => {
    if (!isGameOpen) { clearInterval(achTrackInterval); return; }
    s.achievements.forEach(id => {
      if (!achBefore.has(id) && !sessionAchEarned.includes(id)) sessionAchEarned.push(id);
    });
  }, 1000);
}

function closeGame() {
  if (!isGameOpen) return;
  document.body.classList.remove('game-active');
  const container = document.getElementById('gameFrameContainer');
  const iframe = document.getElementById('gameIframe');
  const sessionTime = Math.floor((Date.now() - currentGameStartTime) / 1000);
  const s = window.state;
  const trackedSessionTime = Math.max(0, s.totalTime - (sessionStartTotalTime || 0));
  const missedTime = Math.max(0, sessionTime - trackedSessionTime);
  if (missedTime > 0 && missedTime < 3600) {
    s.totalTime += missedTime;
    if (s.lastGameId && s.playTime[s.lastGameId]) s.playTime[s.lastGameId] += missedTime;
  }
  const sessionXp = s.totalXp - sessionXpStart;
  container.style.display = 'none';
  iframe.src = 'about:blank';
  isGameOpen = false;
  stopTimeTicker();
  removeGameMenuListeners();
  hideGameSkeleton();
  if (typeof window.showMascot === 'function') window.showMascot();
  if (sessionTime >= 5) showPostGameScreen(s.lastGameId, sessionTime, sessionXp, sessionAchEarned);
  if (typeof window.saveState === 'function') window.saveState(true);
}

function showPostGameScreen(gameId, sessionTime, xpGained, achEarned) {
  const ALL = [...GAMES, ...UTILITIES];
  const game = ALL.find(g => g.id === gameId);
  if (!game) return;
  lastPlayedGameId = gameId;
  document.getElementById('pgIcon').textContent = game.icon;
  document.getElementById('pgName').textContent = game.name;
  const mm = Math.floor(sessionTime / 60), ss = sessionTime % 60;
  document.getElementById('pgSessionTime').textContent = mm > 0 ? `${mm}м ${ss}с` : `${ss}с`;
  document.getElementById('pgXpGained').textContent = '+' + Math.max(0, xpGained);
  document.getElementById('pgAchGained').textContent = achEarned.length;
  const achInfo = document.getElementById('pgAchInfo');
  if (achEarned.length > 0) {
    const ACH = window.ACHIEVEMENTS || [];
    const names = achEarned.map(id => {
      const a = ACH.find(x => x.id === id);
      return a ? `${a.icon} ${a.name}` : '';
    }).filter(Boolean);
    achInfo.innerHTML = `<b>🏆 Новые достижения:</b><br>${names.join('<br>')}`;
    achInfo.style.display = 'block';
  } else {
    achInfo.style.display = 'none';
  }
  document.getElementById('postGameModal').classList.add('show');
}

function updateLastGameBar() {
  const bar = document.getElementById('lastGameBar');
  const icon = document.getElementById('lastGameIcon');
  const name = document.getElementById('lastGameName');
  const time = document.getElementById('lastGameTime');
  const playBtn = document.getElementById('lastGamePlayBtn');
  const s = window.state;
  if (s.lastGameId) {
    const ALL = [...GAMES, ...UTILITIES];
    const game = ALL.find(g => g.id === s.lastGameId);
    if (game) {
      icon.textContent = game.icon;
      name.textContent = game.name;
      time.textContent = s.lastGameTime ? `⏱️ ${s.lastGameTime}` : '';
      bar.classList.add('show');
      playBtn.onclick = () => openGame(game.id);
      return;
    }
  }
  bar.classList.remove('show');
}

// ============================================
// ТАЙМЕР
// ============================================
function startTimeTicker(gameId) {
  if (tickInterval) clearInterval(tickInterval);
  lastTickTime = Date.now();
  tickInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - lastTickTime) / 1000);
    if (elapsed < 1) return;
    const cappedElapsed = Math.min(elapsed, 5);
    lastTickTime += cappedElapsed * 1000;
    const s = window.state;
    s.totalTime += cappedElapsed;
    if (!s.playTime[gameId]) s.playTime[gameId] = 0;
    s.playTime[gameId] += cappedElapsed;
    s.temporalParadox.totalAccumulated += cappedElapsed;
    checkParadox();
    const today = typeof window.todayStr === 'function' ? window.todayStr() : new Date().toISOString().slice(0, 10);
    if (!s.todayStats || s.todayStats.date !== today) {
      s.todayStats = {
        date: today, gamesPlayed: [], timeSpent: 0, utilPlayed: [], favPlayed: [],
        achEarned: 0, favAdded: 0, nickSet: false, themeChanged: false,
        fullscreenUsed: false, profileViewed: false, settingsViewed: false,
        questsViewed: false, favTimeSpent: 0, caseOpened: 0
      };
    }
    s.todayStats.timeSpent += cappedElapsed;
    if (s.favorites.includes(gameId)) s.todayStats.favTimeSpent = (s.todayStats.favTimeSpent || 0) + cappedElapsed;
    const totalMin = Math.floor(s.totalTime / 60);
    if (typeof window.unlockAch === 'function') {
      if (totalMin >= 1) window.unlockAch('time_1min');
      if (totalMin >= 10) window.unlockAch('time_10min');
      if (totalMin >= 30) window.unlockAch('time_30min');
      if (totalMin >= 60) window.unlockAch('time_1hour');
      if (totalMin >= 300) window.unlockAch('time_5hours');
    }
    const h = new Date().getHours();
    if (typeof window.unlockAch === 'function') {
      if (h >= 0 && h < 5) window.unlockAch('night_owl');
      if (h >= 5 && h < 7) window.unlockAch('early_bird');
      if (h >= 12 && h < 14) window.unlockAch('lunch_time');
    }
    if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
    updateLastGameBar();
    if (typeof window.updateLevelDisplay === 'function') window.updateLevelDisplay();
    if (typeof window.checkLevelAchievements === 'function') window.checkLevelAchievements();
    if (typeof window.saveState === 'function') window.saveState();
  }, 1000);
}

function stopTimeTicker() {
  if (tickInterval) clearInterval(tickInterval);
}

function checkParadox() {
  let guard = 0;
  const MAX_ITERATIONS = 100;
  let changed = false;
  const s = window.state;
  const getInfo = window.getParadoxLevelInfo || function () { return { minutes: 30, xp: 100 }; };
  const getLvl = window.getLevelFromTotalXp || function (xp) { return { level: 1 }; };
  while (guard++ < MAX_ITERATIONS) {
    const p = s.temporalParadox;
    const info = getInfo(p.level);
    const neededSeconds = info.minutes * 60;
    if (p.totalAccumulated < neededSeconds) break;
    p.totalAccumulated -= neededSeconds;
    s.totalXp += info.xp;
    p.level++;
    changed = true;
    const lvlInfo = getLvl(s.totalXp);
    const oldLevel = s.level;
    s.level = lvlInfo.level;
    if (typeof window.showParadoxToast === 'function') window.showParadoxToast(p.level - 1, info.xp);
    if (s.level > oldLevel && typeof window.showLevelUpToast === 'function') {
      setTimeout(() => window.showLevelUpToast(s.level), 800);
    }
  }
  if (changed) {
    const pm = document.getElementById('profileModal');
    if (pm && pm.classList.contains('show') && typeof window.renderAchievements === 'function') {
      window.renderAchievements();
    }
  }
}

// ============================================
// ДОСТИЖЕНИЯ ИГРЫ
// ============================================
function checkGameAchievements(gameId) {
  const isUtil = UTILITIES.some(u => u.id === gameId);
  const today = typeof window.todayStr === 'function' ? window.todayStr() : new Date().toISOString().slice(0, 10);
  const s = window.state;
  const unlock = window.unlockAch || function () {};
  if (!s.todayStats || s.todayStats.date !== today) {
    s.todayStats = {
      date: today, gamesPlayed: [], timeSpent: 0, utilPlayed: [], favPlayed: [],
      achEarned: 0, favAdded: 0, nickSet: false, themeChanged: false,
      fullscreenUsed: false, profileViewed: false, settingsViewed: false,
      questsViewed: false, favTimeSpent: 0, caseOpened: 0
    };
  }
  if (!s.todayStats.utilPlayed) s.todayStats.utilPlayed = [];
  if (isUtil) {
    unlock('first_util');
    if (!s.todayStats.utilPlayed.includes(gameId)) s.todayStats.utilPlayed.push(gameId);
    const utilsPlayed = s.playedGames.filter(g => UTILITIES.some(u => u.id === g));
    if (utilsPlayed.length >= UTILITIES.length) unlock('all_utils');
  }
  if (s.favorites.includes(gameId)) {
    if (!s.todayStats.favPlayed.includes(gameId)) s.todayStats.favPlayed.push(gameId);
  }
  if (!s.todayStats.gamesPlayed.includes(gameId)) s.todayStats.gamesPlayed.push(gameId);
  if (!s.playedGames.includes(gameId)) {
    s.playedGames.push(gameId);
    unlock('first_game');
    if (s.playedGames.length >= 5) unlock('five_games');
    if (s.playedGames.filter(g => GAMES.some(x => x.id === g)).length >= GAMES.length) unlock('all_games');
    const gameAch = {
      proryv1: 'proryv1_win', dom: 'dom_escape', dom2: 'dom2_burner',
      cooking: 'cooking_chef', proryv2: 'proryv2_win', kontrabandist: 'cosmo_pilot',
      robo26: 'robo_hunter', fight: 'fighter', miner: 'miner_pro',
      musibox: 'musibox_dj', lastfrontier: 'zombie_survivor',
      proryv3: 'proryv3_win', snakebattle: 'first_snake'
    };
    if (gameAch[gameId]) unlock(gameAch[gameId]);
    if (s.playedGames.includes('proryv1') && s.playedGames.includes('proryv2') && s.playedGames.includes('proryv3')) {
      unlock('proryv_trilogy');
    }
  }
  s.gamesOpened = (s.gamesOpened || 0) + 1;
  if (s.gamesOpened >= 5) unlock('repeat_5');
  if (s.gamesOpened >= 25) unlock('repeat_25');
  const now = Date.now();
  s.gameOpenTimes = (s.gameOpenTimes || []).filter(t => now - t < 60000);
  s.gameOpenTimes.push(now);
  if (s.gameOpenTimes.length >= 3) unlock('speedrun');
  if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
  if (typeof window.saveState === 'function') window.saveState();
}

// ============================================
// ЭКСПОРТ В window
// ============================================
window.GAMES = GAMES;
window.UTILITIES = UTILITIES;
window.GAME_FILES = GAME_FILES;
window.gamesFormatTime = gamesFormatTime;
window.initTabs = initTabs;
window.toggleFavorite = toggleFavorite;
window.selectGame = selectGame;
window.selectUtility = selectUtility;
window.clearSelection = clearSelection;
window.renderGames = renderGames;
window.renderUtilities = renderUtilities;
window.createGameCard = createGameCard;
window.createUtilityCard = createUtilityCard;
window.openGame = openGame;
window.closeGame = closeGame;
window.showPostGameScreen = showPostGameScreen;
window.updateLastGameBar = updateLastGameBar;
window.startTimeTicker = startTimeTicker;
window.stopTimeTicker = stopTimeTicker;
window.checkParadox = checkParadox;
window.checkGameAchievements = checkGameAchievements;
window.showGameSkeleton = showGameSkeleton;
window.hideGameSkeleton = hideGameSkeleton;
window.addGameMenuListeners = addGameMenuListeners;
window.removeGameMenuListeners = removeGameMenuListeners;
window.closeGameMenu = closeGameMenu;

Object.defineProperty(window, 'isGameOpen', {
  get() { return isGameOpen; },
  set(v) { isGameOpen = v; },
  configurable: true
});
Object.defineProperty(window, 'currentGameStartTime', {
  get() { return currentGameStartTime; },
  set(v) { currentGameStartTime = v; },
  configurable: true
});
Object.defineProperty(window, 'sessionStartTotalTime', {
  get() { return sessionStartTotalTime; },
  set(v) { sessionStartTotalTime = v; },
  configurable: true
});
Object.defineProperty(window, 'sessionXpStart', {
  get() { return sessionXpStart; },
  set(v) { sessionXpStart = v; },
  configurable: true
});
Object.defineProperty(window, 'sessionAchEarned', {
  get() { return sessionAchEarned; },
  set(v) { sessionAchEarned = v; },
  configurable: true
});

console.log('[games.js] Загружено:', GAMES.length, 'игр,', UTILITIES.length, 'утилит + UI игр');