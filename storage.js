// ============================================
// FireLand · storage.js · v26.3.4
// IndexedDB + save/load + DEFAULT_STATE + ownerToken
// ============================================

const DEFAULT_STATE = {
  playTime: {}, totalTime: 0, lastGameId: null, lastGameTime: null,
  selectedGameId: null, selectedUtilityId: null,
  soundEnabled: true, uiSoundsEnabled: true, theme: 'system',
  alarmVolume: 0.8, alarmRepeats: 5, alarmDelay: 15, vibrationEnabled: true,
  nickname: 'Игрок', avatar: null, achievements: [], playedGames: [],
  gamesOpened: 0, gameOpenTimes: [], themesUsed: [], alarmUsed: false,
  totalXp: 0, level: 1,
  temporalParadox: { level: 1, totalAccumulated: 0 },
  favorites: [],
  streak: { current: 0, best: 0, lastLogin: null, history: [] },
  dailyQuests: { date: null, quests: [], progress: {}, completed: [] },
  questsCompletedTotal: 0,
  todayStats: {
    date: null, gamesPlayed: [], timeSpent: 0, utilPlayed: [], favPlayed: [],
    achEarned: 0, favAdded: 0, nickSet: false, themeChanged: false,
    fullscreenUsed: false, profileViewed: false, settingsViewed: false,
    questsViewed: false, favTimeSpent: 0, caseOpened: 0
  },
  lastDailyReward: null, dailyRewardsClaimed: 0,
  lastDailyCase: null, lastWeeklyCase: null, caseItems: [],
  lastSubmittedNick: null,
  lastReadChatAt: null,
  unreadChatCount: 0,
  onboardingDone: false,
  myRooms: [],
  myCommunityGames: 0,
  ownerToken: null,
  _savedAt: 0
};

// ========== IndexedDB ==========
const DB_NAME = 'fireland_db';
const DB_VERSION = 1;
const STORE_NAME = 'state';
const STATE_KEY = 'main_state';
let dbInstance = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ========== State ==========
window.state = JSON.parse(JSON.stringify(DEFAULT_STATE));

let saveTimeout = null;
let pendingSave = false;

function saveState(immediate = false) {
  pendingSave = true;
  if (immediate) {
    clearTimeout(saveTimeout);
    doSaveState();
    return;
  }
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(doSaveState, 500);
}

async function doSaveState() {
  if (!pendingSave) return;
  pendingSave = false;
  try {
    window.state._savedAt = Date.now();
    await idbSet(STATE_KEY, window.state);
    const lightState = { ...window.state };
    delete lightState.avatar;
    try {
      localStorage.setItem('fireland_light', JSON.stringify(lightState));
    } catch (e) {}
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

function generateOwnerToken() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'tok_' + Date.now() + '_' + Math.random().toString(36).slice(2, 12);
}

async function loadState() {
  try {
    const full = await idbGet(STATE_KEY);
    let light = null;
    try {
      const raw = localStorage.getItem('fireland_light') || localStorage.getItem('abdulla_games_state_no_credits');
      if (raw) light = JSON.parse(raw);
    } catch (e) {}
    if (full && light && (light._savedAt || 0) > (full._savedAt || 0)) {
      window.state = { ...DEFAULT_STATE, ...light };
    } else if (full) {
      window.state = { ...DEFAULT_STATE, ...full };
    } else if (light) {
      window.state = { ...DEFAULT_STATE, ...light };
      await idbSet(STATE_KEY, window.state);
    }
    const s = window.state;
    if (!s.temporalParadox) s.temporalParadox = { level: 1, totalAccumulated: 0 };
    if (!s.streak) s.streak = { current: 0, best: 0, lastLogin: null, history: [] };
    if (!s.streak.history) s.streak.history = [];
    if (!s.favorites) s.favorites = [];
    if (!s.dailyQuests) s.dailyQuests = { date: null, quests: [], progress: {}, completed: [] };
    if (!s.todayStats) s.todayStats = {
      date: null, gamesPlayed: [], timeSpent: 0, utilPlayed: [], favPlayed: [],
      achEarned: 0, favAdded: 0, nickSet: false, themeChanged: false,
      fullscreenUsed: false, profileViewed: false, settingsViewed: false,
      questsViewed: false, favTimeSpent: 0, caseOpened: 0
    };
    if (!s.todayStats.utilPlayed) s.todayStats.utilPlayed = [];
    if (s.lastDailyReward === undefined) s.lastDailyReward = null;
    if (s.dailyRewardsClaimed === undefined) s.dailyRewardsClaimed = 0;
    if (s.lastDailyCase === undefined) s.lastDailyCase = null;
    if (s.lastWeeklyCase === undefined) s.lastWeeklyCase = null;
    if (!s.caseItems) s.caseItems = [];
    if (s.uiSoundsEnabled === undefined) s.uiSoundsEnabled = true;
    if (s.lastSubmittedNick === undefined) s.lastSubmittedNick = null;
    if (s.lastReadChatAt === undefined) s.lastReadChatAt = null;
    if (s.unreadChatCount === undefined) s.unreadChatCount = 0;
    if (s.onboardingDone === undefined) s.onboardingDone = false;
    if (!s.myRooms) s.myRooms = [];
    if (s.myCommunityGames === undefined) s.myCommunityGames = 0;
    if (s.theme === 'dark' || s.theme === 'blue') s.theme = 'system';
    if (!s.ownerToken) {
      s.ownerToken = generateOwnerToken();
      saveState(true);
      console.log('[Owner] Токен создан:', s.ownerToken);
    }
  } catch (e) {
    console.warn('Load failed:', e);
  }
}

// ========== Утилиты дат ==========
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// ========== Экспорт ==========
window.DEFAULT_STATE = DEFAULT_STATE;
window.openDB = openDB;
window.idbGet = idbGet;
window.idbSet = idbSet;
window.idbDelete = idbDelete;
window.STATE_KEY = STATE_KEY;
window.saveState = saveState;
window.loadState = loadState;
window.generateOwnerToken = generateOwnerToken;
window.todayStr = todayStr;
window.dateStr = dateStr;

console.log('[storage.js] Загружено');