// ============================================
// FireLand · profile.js · v27.1.0 + ACH_BUTTONS
// ============================================

const LEVEL_TITLES = [
{min:1,max:2,title:'🌱 Новичок'},{min:3,max:4,title:'🌿 Ученик'},{min:5,max:6,title:'🎯 Опытный'},{min:7,max:8,title:'⚔️ Ветеран'},
{min:9,max:10,title:'🛡️ Мастер'},{min:11,max:12,title:'👑 Гроссмейстер'},{min:13,max:14,title:'🌟 Элита'},{min:15,max:16,title:'🔥 Легенда'},
{min:17,max:18,title:'💎 Бриллиант'},{min:19,max:20,title:'🏆 Чемпион'},{min:21,max:22,title:'👊 Боец'},{min:23,max:24,title:'🎖️ Заслуженный'},
{min:25,max:26,title:'🌠 Звёздный'},{min:27,max:28,title:'🦅 Ястреб'},{min:29,max:30,title:'🐉 Дракон'},{min:31,max:32,title:'⚡ Гром'},
{min:33,max:34,title:'🌪️ Смерч'},{min:35,max:36,title:'🌊 Цунами'},{min:37,max:38,title:'☄️ Комета'},{min:39,max:40,title:'🌌 Галактика'},
{min:41,max:42,title:'🔱 Посейдон'},{min:43,max:44,title:'⚔️ Арес'},{min:45,max:46,title:'🛡️ Афина'},{min:47,max:48,title:'🎭 Дионис'},
{min:49,max:50,title:'🌞 Аполлон'},{min:51,max:52,title:'⚡ Зевс'},{min:53,max:54,title:'👑 Кронос'},{min:55,max:56,title:'🌑 Аид'},
{min:57,max:58,title:'🌊 Тритон'},{min:59,max:60,title:'🦁 Леонид'},{min:61,max:62,title:'⚔️ Спартанец'},{min:63,max:64,title:'🏛️ Сенатор'},
{min:65,max:66,title:'👑 Император'},{min:67,max:68,title:'🔮 Оракул'},{min:69,max:70,title:'🧙 Архимаг'},{min:71,max:72,title:'🐲 Драконоборец'},
{min:73,max:74,title:'⚔️ Легендарный воин'},{min:75,max:76,title:'🌟 Полубог'},{min:77,max:78,title:'👁️ Провидение'},{min:79,max:80,title:'🌌 Хранитель'},
{min:81,max:82,title:'⏳ Повелитель времени'},{min:83,max:84,title:'🌀 Архитектор'},{min:85,max:86,title:'👑 Владыка'},{min:87,max:88,title:'⚡ Громовержец'},
{min:89,max:90,title:'🔥 Феникс'},{min:91,max:92,title:'💫 Астрал'},{min:93,max:94,title:'🌌 Вселенная'},{min:95,max:96,title:'♾️ Бесконечность'},
{min:97,max:98,title:'👽 Космический разум'},{min:99,max:100,title:'🔴 АБСОЛЮТ'},{min:101,max:999,title:'🔥🔥🔥 БОГ FireLand'}
];

const PARADOX = {BASE_TIME:30,XP_MULT:1.2,TIME_MULT_START:1.4,MULT_GROWTH:0.1,BASE_XP:100};
const HITMAN = { BASE_KILLS: 10, KILLS_MULT_START: 1.3, MULT_GROWTH: 0.1, BASE_XP: 150, XP_MULT: 1.25 };

const ACHIEVEMENTS = [
// ========== ТУТОРИАЛ ==========
{id:'first_game',icon:'🎮',name:'Первый шаг',desc:'Запустить любую игру',xp:0,rarity:'common',type:'tutorial'},
{id:'set_nick',icon:'✏️',name:'Именование',desc:'Установить никнейм',xp:0,rarity:'common',type:'tutorial'},
{id:'set_avatar',icon:'🖼️',name:'Лицо с обложки',desc:'Установить аватарку',xp:0,rarity:'common',type:'tutorial'},
{id:'alarm_user',icon:'⏰',name:'По расписанию',desc:'Запустить будильник',xp:0,rarity:'common',type:'tutorial'},
{id:'favorite_add',icon:'⭐',name:'Избранное',desc:'Добавить игру в избранное',xp:0,rarity:'common',type:'tutorial'},
{id:'fullscreen',icon:'⛶',name:'На весь экран',desc:'Открыть игру в полный экран',xp:0,rarity:'common',type:'tutorial'},
{id:'quest_first',icon:'📅',name:'Первое задание',desc:'Выполнить ежедневное задание',xp:0,rarity:'common',type:'tutorial'},
{id:'case_first',icon:'📦',name:'Первая коробка',desc:'Открыть первый кейс',xp:0,rarity:'common',type:'tutorial'},
{id:'first_util',icon:'🛠️',name:'Инструменталист',desc:'Запустить первую утилиту',xp:0,rarity:'common',type:'tutorial'},
{id:'import_profile',icon:'📥',name:'Перенос',desc:'Импортировать профиль',xp:0,rarity:'common',type:'tutorial'},
{id:'musibox_dj',icon:'🎧',name:'Диджей',desc:'Запустить Musibox Pro',xp:0,rarity:'common',type:'tutorial',gameId:'musibox'},
{id:'cosmo_pilot',icon:'🚀',name:'Космопилот',desc:'Сыграть в Контрабандиста',xp:0,rarity:'common',type:'tutorial',gameId:'kontrabandist'},
{id:'robo_hunter',icon:'🤖',name:'Охотник на роботов',desc:'Сыграть в Robo-Cleaner',xp:0,rarity:'common',type:'tutorial',gameId:'robo26'},
{id:'fighter',icon:'👊',name:'Боец',desc:'Сыграть в Битву',xp:0,rarity:'common',type:'tutorial',gameId:'fight'},
{id:'miner_pro',icon:'⛏️',name:'Шахтёр-профи',desc:'Сыграть в Шахтёра',xp:0,rarity:'common',type:'tutorial',gameId:'miner'},
{id:'cooking_chef',icon:'🍳',name:'Шеф-повар',desc:'Сыграть в Кулинарию',xp:0,rarity:'common',type:'tutorial',gameId:'cooking'},
{id:'proryv1_win',icon:'💻',name:'Прорыв совершен',desc:'Сыграть в Прорыв 1',xp:0,rarity:'common',type:'tutorial',gameId:'proryv1'},
{id:'proryv3_win',icon:'🌐',name:'Финал прорыва',desc:'Сыграть в Прорыв 3',xp:0,rarity:'common',type:'tutorial',gameId:'proryv3'},
{id:'first_snake',icon:'🐍',name:'Первая змейка',desc:'Сыграть в Snakes Battle',xp:0,rarity:'common',type:'tutorial',gameId:'snakebattle'},
{id:'zombie_survivor',icon:'🧟',name:'Выживший',desc:'Сыграть в Последний рубеж',xp:0,rarity:'common',type:'tutorial',gameId:'lastfrontier'},
{id:'override77_first',icon:'🎯',name:'Оперативник',desc:'Запустить OVERRIDE 77',xp:0,rarity:'common',type:'tutorial',gameId:'override77'},
{id:'all_themes',icon:'🎨',name:'Экспериментатор тем',desc:'Попробовать все 4 темы',xp:0,rarity:'common',type:'tutorial',progress:s=>Math.min(1,s.themesUsed.length/4),progressText:s=>`${s.themesUsed.length}/4`},

// ========== НАСТОЯЩИЕ ДОСТИЖЕНИЯ ==========
{id:'five_games',icon:'🎯',name:'Пятёрочка',desc:'Запустить 5 разных игр',xp:75,rarity:'common',progress:s=>Math.min(1,s.playedGames.length/5),progressText:s=>`${s.playedGames.length}/5`},
{id:'all_games',icon:'🏆',name:'Коллекционер',desc:'Запустить все игры в лаунчере',xp:200,rarity:'epic',progress:s=>Math.min(1,s.playedGames.length/(window.GAMES?.length||15)),progressText:s=>`${s.playedGames.length}/${window.GAMES?.length||15}`},
{id:'dom_escape',icon:'🏚️',name:'Выбрался из ДОМА',desc:'Пройти квест ДОМ',xp:150,rarity:'epic',gameId:'dom'},
{id:'dom2_burner',icon:'🩸',name:'Сжигатель якорей',desc:'Сжечь 3 якоря в ДОМ 2',xp:300,rarity:'legendary',gameId:'dom2'},
{id:'proryv_quadrology',icon:'👑',name:'Хранитель квадрологии',desc:'Сыграть во все 4 части Прорыва',xp:750,rarity:'legendary'},
{id:'all_utils',icon:'⚙️',name:'Мастер утилит',desc:'Запустить все утилиты во вкладке Функции',xp:150,rarity:'rare',
  progress:s=>Math.min(1,(s.playedGames.filter(g=>['fireshop','cpstest','hypercalc','datagenerator','musibox'].includes(g)).length)/5),
  progressText:s=>`${s.playedGames.filter(g=>['fireshop','cpstest','hypercalc','datagenerator','musibox'].includes(g)).length}/5`
},
{id:'time_10min',icon:'⌚',name:'10 минут',desc:'Провести 10 минут в играх',xp:75,rarity:'common',progress:s=>Math.min(1,s.totalTime/600),progressText:s=>`${Math.floor(s.totalTime/60)}м/10м`},
{id:'time_30min',icon:'🕐',name:'Полчаса',desc:'Провести 30 минут в играх',xp:150,rarity:'rare',progress:s=>Math.min(1,s.totalTime/1800),progressText:s=>`${Math.floor(s.totalTime/60)}м/30м`},
{id:'time_1hour',icon:'🕰️',name:'Час за играми',desc:'Провести 1 час в играх',xp:250,rarity:'epic',progress:s=>Math.min(1,s.totalTime/3600),progressText:s=>`${Math.floor(s.totalTime/60)}м/60м`},
{id:'time_5hours',icon:'⏰',name:'Марафонец',desc:'Провести 5 часов в играх',xp:500,rarity:'legendary',progress:s=>Math.min(1,s.totalTime/18000),progressText:s=>`${Math.floor(s.totalTime/60)}м/300м`},
{id:'night_owl',icon:'🦉',name:'Полуночник',desc:'Играть после 00:00',xp:50,rarity:'common'},
{id:'early_bird',icon:'🐦',name:'Ранняя пташка',desc:'Играть до 7:00 утра',xp:50,rarity:'common'},
{id:'repeat_25',icon:'🔄',name:'Верный фанат',desc:'Запустить игры 25 раз',xp:200,rarity:'epic',progress:s=>Math.min(1,s.gamesOpened/25),progressText:s=>`${s.gamesOpened}/25`},
{id:'repeat_100',icon:'🔁',name:'Фанатик',desc:'Запустить игры 100 раз',xp:750,rarity:'legendary',progress:s=>Math.min(1,s.gamesOpened/100),progressText:s=>`${s.gamesOpened}/100`},
{id:'speedrun',icon:'⚡',name:'Спидран',desc:'Открыть 3 игры за 1 минуту',xp:150,rarity:'epic'},
{id:'streak_7',icon:'🔥',name:'Неделя',desc:'Заходить 7 дней подряд',xp:200,rarity:'epic',progress:s=>Math.min(1,s.streak.current/7),progressText:s=>`${s.streak.current}/7`},
{id:'streak_30',icon:'👑',name:'Месяц',desc:'Заходить 30 дней подряд',xp:1000,rarity:'legendary',progress:s=>Math.min(1,s.streak.current/30),progressText:s=>`${s.streak.current}/30`},
{id:'streak_100',icon:'🔱',name:'Сотка',desc:'Заходить 100 дней подряд',xp:5000,rarity:'legendary',progress:s=>Math.min(1,s.streak.current/100),progressText:s=>`${s.streak.current}/100`},
{id:'quest_10',icon:'📆',name:'Трудяга',desc:'Выполнить 10 заданий',xp:300,rarity:'epic',progress:s=>Math.min(1,s.questsCompletedTotal/10),progressText:s=>`${s.questsCompletedTotal}/10`},
{id:'quest_100',icon:'🏅',name:'Квест-мастер',desc:'Выполнить 100 заданий',xp:1500,rarity:'legendary',progress:s=>Math.min(1,s.questsCompletedTotal/100),progressText:s=>`${s.questsCompletedTotal}/100`},
{id:'quest_all_daily',icon:'🎁',name:'Отличник',desc:'Выполнить все 5 заданий за день',xp:250,rarity:'rare'},
{id:'case_10',icon:'🎁',name:'Коллекционер кейсов',desc:'Открыть 10 кейсов',xp:300,rarity:'epic',progress:s=>Math.min(1,(s.caseItems?s.caseItems.length:0)/10),progressText:s=>`${s.caseItems?s.caseItems.length:0}/10`},
{id:'case_50',icon:'📦',name:'Кейс-маньяк',desc:'Открыть 50 кейсов',xp:1000,rarity:'legendary',progress:s=>Math.min(1,(s.caseItems?s.caseItems.length:0)/50),progressText:s=>`${s.caseItems?s.caseItems.length:0}/50`},
{id:'case_legendary',icon:'👑',name:'Легендарная находка',desc:'Получить легендарный кейс',xp:500,rarity:'legendary'},
{id:'level_25',icon:'🎖️',name:'Четверть сотни',desc:'Достичь 25 уровня',xp:500,rarity:'epic'},
{id:'level_50',icon:'🏆',name:'Полтинник',desc:'Достичь 50 уровня',xp:1500,rarity:'epic'},
{id:'level_75',icon:'🌟',name:'Семидесятипятилетний',desc:'Достичь 75 уровня',xp:3000,rarity:'legendary'},
{id:'level_100',icon:'🔴',name:'АБСОЛЮТ',desc:'Достичь 100 уровня',xp:10000,rarity:'legendary'},
{id:'veteran',icon:'🏅',name:'Ветеран',desc:'Собрать ВСЕ обычные достижения',xp:1000,rarity:'legendary',isVeteran:true},
{id:'temporal_paradox',icon:'🌀',name:'Временной парадокс',desc:'Копи время во всех играх',xp:0,rarity:'legendary',isParadox:true},
{id:'hitman',icon:'💀',name:'Наёмный убийца',desc:'Убивай врагов в шутере OVERRIDE 77',xp:0,rarity:'legendary',isHitman:true,gameId:'override77'},
{id:'virus_tamer',icon:'🧟',name:'Укротитель вируса',desc:'Собери ВСЕ карты (кроме боссов) в «Последнем рубеже»',xp:500,rarity:'legendary',gameId:'lastfrontier'},

// ========== НОВЫЕ НАСТОЯЩИЕ ДОСТИЖЕНИЯ ==========
{id:'no_damage_win',icon:'🛡️',name:'Неуязвимый',desc:'Пройди этап в Robo-Cleaner без потери HP',xp:500,rarity:'epic',gameId:'robo26'},
{id:'speedrun_1min',icon:'⚡',name:'Спидраннер',desc:'Пройди Прорыв 1 за < 5 минут',xp:750,rarity:'legendary',gameId:'proryv1'},
{id:'all_endings_dom2',icon:'🩸',name:'Все концовки',desc:'Открой все 5 концовок в хорроре ДОМ 2',xp:1000,rarity:'legendary',gameId:'dom2'},
{id:'perfect_deck',icon:'🃏',name:'Идеальная колода',desc:'Собери 5 карт 10-го уровня в «Последнем рубеже»',xp:800,rarity:'epic',gameId:'lastfrontier'},
{id:'boss_rush',icon:'👹',name:'Босс-раш',desc:'Победи 5 боссов подряд без смертей (Robo-Cleaner)',xp:1500,rarity:'legendary',gameId:'robo26'},
{id:'chat_100',icon:'💬',name:'Душа компании',desc:'Отправь 100 сообщений в чат FireLand',xp:300,rarity:'rare'},
{id:'leaderboard_top10',icon:'🏆',name:'Элита',desc:'Войди в ТОП-10 игроков в таблице лидеров',xp:2000,rarity:'legendary'},
{id:'all_maps_override',icon:'🗺️',name:'Картограф',desc:'Сыграй на всех 4 картах в OVERRIDE 77',xp:400,rarity:'epic',gameId:'override77'},
{id:'1000_kills',icon:'💀',name:'Машина смерти',desc:'Сделай 1000 убийств в OVERRIDE 77 (суммарно)',xp:1000,rarity:'legendary',gameId:'override77'},
{id:'all_zombies_bosses',icon:'🧟',name:'Повелитель орды',desc:'Победи ВСЕХ 10 боссов в «Последнем рубеже»',xp:2500,rarity:'legendary',gameId:'lastfrontier'}
];

const QUEST_POOL = [
{id:'q_play_1',icon:'🎮',name:'Первый шаг',desc:'Запусти 1 игру',xp:30,target:1,type:'games_today'},
{id:'q_play_2',icon:'🎯',name:'Игрок дня',desc:'Запусти 2 разные игры',xp:50,target:2,type:'games_today'},
{id:'q_play_3',icon:'🎪',name:'Трио',desc:'Запусти 3 разные игры',xp:75,target:3,type:'games_today'},
{id:'q_play_4',icon:'🚀',name:'Квартет',desc:'Запусти 4 разные игры',xp:100,target:4,type:'games_today'},
{id:'q_play_5',icon:'👑',name:'Пятёрка',desc:'Запусти 5 разных игр',xp:150,target:5,type:'games_today'},
{id:'q_time_3',icon:'⏱️',name:'Три минуты',desc:'Проведи 3 минуты в играх',xp:40,target:180,type:'time_today'},
{id:'q_time_5',icon:'⏰',name:'Пять минут',desc:'Проведи 5 минут в играх',xp:50,target:300,type:'time_today'},
{id:'q_time_10',icon:'⌚',name:'Десять минут',desc:'Проведи 10 минут в играх',xp:80,target:600,type:'time_today'},
{id:'q_time_15',icon:'🕐',name:'Четверть часа',desc:'Проведи 15 минут в играх',xp:100,target:900,type:'time_today'},
{id:'q_time_30',icon:'🕰️',name:'Полчаса',desc:'Проведи 30 минут в играх',xp:200,target:1800,type:'time_today'},
{id:'q_util',icon:'🛠️',name:'Инструменталист',desc:'Запусти 1 утилиту',xp:50,target:1,type:'util_today'},
{id:'q_fav',icon:'⭐',name:'Любимчик',desc:'Запусти игру из избранного',xp:50,target:1,type:'fav_today'},
{id:'q_fav_2',icon:'💖',name:'Верный',desc:'Запусти 2 игры из избранного',xp:90,target:2,type:'fav_today'},
{id:'q_ach',icon:'🏆',name:'Достигатор',desc:'Получи 1 достижение',xp:75,target:1,type:'ach_today'},
{id:'q_ach_2',icon:'🎖️',name:'Коллекционер',desc:'Получи 2 достижения',xp:120,target:2,type:'ach_today'},
{id:'q_ach_3',icon:'🥇',name:'Охотник за трофеями',desc:'Получи 3 достижения',xp:200,target:3,type:'ach_today'},
{id:'q_fav_add',icon:'⭐',name:'Фаворит',desc:'Добавь игру в избранное',xp:40,target:1,type:'fav_add_today'},
{id:'q_nick',icon:'✏️',name:'Самопрезентация',desc:'Установи никнейм',xp:30,target:1,type:'nick_set_today'},
{id:'q_theme',icon:'🎨',name:'Стилист',desc:'Смени тему оформления',xp:40,target:1,type:'theme_change_today'},
{id:'q_fullscreen',icon:'⛶',name:'Во весь рост',desc:'Запусти игру в полный экран',xp:60,target:1,type:'fullscreen_today'},
{id:'q_profile_view',icon:'👤',name:'Самолюбование',desc:'Открой свой профиль',xp:25,target:1,type:'profile_view_today'},
{id:'q_settings_view',icon:'⚙️',name:'Настройщик',desc:'Открой настройки',xp:25,target:1,type:'settings_view_today'},
{id:'q_quests_view',icon:'📅',name:'Планировщик',desc:'Открой вкладку заданий',xp:25,target:1,type:'quests_view_today'},
{id:'q_case_open',icon:'📦',name:'Кейс-охотник',desc:'Открой кейс',xp:60,target:1,type:'case_today'},
{id:'q_fav_time',icon:'💫',name:'Преданность',desc:'Играй в избранную игру 5 минут',xp:150,target:300,type:'fav_time_today'},
{id:'q_zombies_10',icon:'🧟',name:'Зомби-охотник',desc:'Собери 10 зомби в «Последнем Рубеже»',xp:100,target:10,type:'lastfrontier_zombies'}
];

function getState() { return window.state || null; }

function getTitleForLevel(level) {
  const t = LEVEL_TITLES.find(t => level >= t.min && level <= t.max);
  return t ? t.title : '🔥🔥🔥 БОГ FireLand';
}
function getXpForLevel(level) {
  if (level <= 20) return 100 + (level - 1) * 50;
  if (level <= 50) return 1050 + (level - 20) * 100;
  if (level <= 80) return 4050 + (level - 50) * 200;
  if (level <= 95) return 10050 + (level - 80) * 500;
  return 17550 + (level - 95) * 1000;
}
function getLevelFromTotalXp(totalXp) {
  let level = 1, consumed = 0;
  while (level <= 20) {
    const needed = 100 + (level - 1) * 50;
    if (consumed + needed > totalXp) return { level, currentXp: totalXp - consumed, neededXp: needed };
    consumed += needed; level++;
  }
  while (level <= 50) {
    const needed = 1050 + (level - 20) * 100;
    if (consumed + needed > totalXp) return { level, currentXp: totalXp - consumed, neededXp: needed };
    consumed += needed; level++;
  }
  while (level <= 80) {
    const needed = 4050 + (level - 50) * 200;
    if (consumed + needed > totalXp) return { level, currentXp: totalXp - consumed, neededXp: needed };
    consumed += needed; level++;
  }
  while (level <= 95) {
    const needed = 10050 + (level - 80) * 500;
    if (consumed + needed > totalXp) return { level, currentXp: totalXp - consumed, neededXp: needed };
    consumed += needed; level++;
  }
  while (level <= 1000) {
    const needed = 17550 + (level - 95) * 1000;
    if (consumed + needed > totalXp) return { level, currentXp: totalXp - consumed, neededXp: needed };
    consumed += needed; level++;
  }
  return { level, currentXp: totalXp - consumed, neededXp: getXpForLevel(level) };
}

function getParadoxLevelInfo(level) {
  let neededMinutes = PARADOX.BASE_TIME;
  for (let i = 0; i < level; i++) { neededMinutes *= (PARADOX.TIME_MULT_START + i * PARADOX.MULT_GROWTH); }
  return { minutes: Math.round(neededMinutes), xp: Math.round(PARADOX.BASE_XP * Math.pow(PARADOX.XP_MULT, level - 1)) };
}
function getHitmanLevelInfo(level) {
  let neededKills = HITMAN.BASE_KILLS;
  for (let i = 0; i < level; i++) { neededKills *= (HITMAN.KILLS_MULT_START + i * HITMAN.MULT_GROWTH); }
  return { kills: Math.round(neededKills), xp: Math.round(HITMAN.BASE_XP * Math.pow(HITMAN.XP_MULT, level - 1)) };
}
function profileFormatTime(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

function renderProfile() {
  const s = getState();
  if (!s) return;
  const input = document.getElementById('profileNickInput');
  if (input) input.value = s.nickname || 'Игрок';
  const avBig = document.getElementById('profileBigAvatar');
  if (!avBig) return;
  if (s.avatar) { avBig.innerHTML = `<img src="${s.avatar}" alt="">`; }
  else { avBig.textContent = '👤'; avBig.style.background = 'linear-gradient(135deg, #6a8aff, #a78bfa)'; }
}

function updateLevelDisplay() {
  const s = getState();
  if (!s) return;
  const lvlInfo = getLevelFromTotalXp(s.totalXp);
  const title = getTitleForLevel(lvlInfo.level);
  const percent = (lvlInfo.currentXp / lvlInfo.neededXp) * 100;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('levelNumHeader', lvlInfo.level); set('levelTitleHeader', title);
  set('levelXpHeader', `${lvlInfo.currentXp} / ${lvlInfo.neededXp} XP`);
  const badge = document.getElementById('levelHeaderBadge');
  if (badge) badge.style.setProperty('--xp-percent', percent + '%');
  set('levelNumBig', lvlInfo.level); set('levelTitleBig', title);
  set('levelSubtitleBig', `Следующий уровень: ${lvlInfo.neededXp - lvlInfo.currentXp} XP`);
  const xpf = document.getElementById('xpBarFill'); if (xpf) xpf.style.width = percent + '%';
  set('xpText', `${lvlInfo.currentXp} / ${lvlInfo.neededXp} XP • Всего: ${s.totalXp}`);
}

// 👇 РЕНДЕР ДОСТИЖЕНИЙ
function renderAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const s = getState();
  if (!s) return;
  if (!s.achievements) s.achievements = [];

  const real = ACHIEVEMENTS.filter(a => a.type !== 'tutorial');
  const tutorials = ACHIEVEMENTS.filter(a => a.type === 'tutorial');

  real.forEach(ach => {
    if (ach.isParadox) { renderParadoxCard(grid, ach); return; }
    if (ach.isHitman) { renderHitmanCard(grid, ach); return; }
    const earned = s.achievements.includes(ach.id);
    const el = document.createElement('div');
    el.className = 'achievement' + (earned ? ' earned' : '') + (ach.isVeteran ? ' veteran' : '');
    el.dataset.rarity = ach.rarity || 'common';
    let progressHtml = '';
    if (!earned && ach.progress) {
      const p = Math.min(1, ach.progress(s));
      const txt = ach.progressText ? ach.progressText(s) : '';
      progressHtml = `<div class="ach-progress"><div class="ach-progress-fill" style="width:${p * 100}%"></div></div><div style="font-size:10px;color:var(--text-secondary);margin-top:2px;">${txt}</div>`;
    }
    const playBtnHtml = ach.gameId ? `<button class="ach-play-btn" onclick="event.stopPropagation(); window.openGame('${ach.gameId}')">🎮 Играть</button>` : '';
    el.innerHTML = `<div class="ach-icon">${ach.icon}</div><div class="ach-info"><div class="ach-name">${ach.name}</div><div class="ach-desc">${ach.desc}</div>${progressHtml}${playBtnHtml}</div><div class="ach-xp">+${ach.xp}</div>`;
    grid.appendChild(el);
  });

  if (tutorials.length > 0) {
    const divider = document.createElement('div');
    divider.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 16px 0 8px; font-size: 12px; font-weight: 800; color: var(--text-secondary); letter-spacing: 2px; opacity: 0.7;';
    divider.textContent = '🎓 ПЕРВЫЕ ШАГИ (не достижения)';
    grid.appendChild(divider);
  }

  tutorials.forEach(ach => {
    const earned = s.achievements.includes(ach.id);
    const el = document.createElement('div');
    el.className = 'achievement' + (earned ? ' earned' : '');
    el.dataset.rarity = 'common';
    el.style.opacity = earned ? '0.7' : '0.5';
    let progressHtml = '';
    if (!earned && ach.progress) {
      const p = Math.min(1, ach.progress(s));
      const txt = ach.progressText ? ach.progressText(s) : '';
      progressHtml = `<div class="ach-progress"><div class="ach-progress-fill" style="width:${p * 100}%"></div></div><div style="font-size:10px;color:var(--text-secondary);margin-top:2px;">${txt}</div>`;
    }
    const playBtnHtml = ach.gameId ? `<button class="ach-play-btn" onclick="event.stopPropagation(); window.openGame('${ach.gameId}')">🎮 Играть</button>` : '';
    el.innerHTML = `<div class="ach-icon">${ach.icon}</div><div class="ach-info"><div class="ach-name">${ach.name}</div><div class="ach-desc">${ach.desc}</div>${progressHtml}${playBtnHtml}</div><div class="ach-xp" style="opacity:0.5">—</div>`;
    grid.appendChild(el);
  });

  const totalReal = ACHIEVEMENTS.filter(a => a.type !== 'tutorial' && !a.isParadox && !a.isHitman && !a.isVeteran).length;
  const earnedReal = s.achievements.filter(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    return a && a.type !== 'tutorial' && !a.isParadox && !a.isHitman && !a.isVeteran;
  }).length;
  const text = earnedReal + '/' + totalReal;
  const ac = document.getElementById('achCount'); if (ac) ac.textContent = text;
  const ach = document.getElementById('achCountHeader'); if (ach) ach.textContent = text;
}

function renderParadoxCard(grid, ach) {
  const s = getState();
  if (!s) return;
  if (!s.temporalParadox) s.temporalParadox = { level: 1, totalAccumulated: 0 };
  const p = s.temporalParadox;
  const info = getParadoxLevelInfo(p.level);
  const neededSeconds = info.minutes * 60;
  const percent = Math.min(100, (p.totalAccumulated / neededSeconds) * 100);
  const el = document.createElement('div');
  el.className = 'achievement paradox earned';
  el.dataset.rarity = 'legendary';
  el.innerHTML = `<div class="ach-icon">${ach.icon}</div><div class="ach-info"><div class="ach-name">${ach.name} — Уровень ${p.level}</div><div class="ach-desc">Прогресс: ${profileFormatTime(p.totalAccumulated)} / ${profileFormatTime(neededSeconds)}</div><div class="ach-progress"><div class="ach-progress-fill" style="width:${percent}%"></div></div></div><div class="ach-xp">+${info.xp}</div>`;
  grid.appendChild(el);
}

function renderHitmanCard(grid, ach) {
  const s = getState();
  if (!s) return;
  if (!s.hitman) s.hitman = { level: 1, totalAccumulated: 0, totalKills: 0 };
  const h = s.hitman;
  const info = getHitmanLevelInfo(h.level);
  const neededKills = info.kills;
  const percent = Math.min(100, ((h.totalAccumulated || 0) / neededKills) * 100);
  const el = document.createElement('div');
  el.className = 'achievement hitman earned';
  el.dataset.rarity = 'legendary';
  el.innerHTML = `
    <div class="ach-icon">${ach.icon}</div>
    <div class="ach-info">
      <div class="ach-name">${ach.name} — Уровень ${h.level}</div>
      <div class="ach-desc">До след. уровня: ${h.totalAccumulated || 0} / ${neededKills} убийств</div>
      <div class="ach-desc" style="font-size:10px;opacity:0.7;">Всего убийств: ${h.totalKills || 0}</div>
      <div class="ach-progress"><div class="ach-progress-fill" style="width:${percent}%;background:linear-gradient(90deg,#ef4444,#fbbf24)"></div></div>
      <button class="ach-play-btn" onclick="event.stopPropagation(); window.openGame('override77')">🎮 Играть</button>
    </div>
    <div class="ach-xp" style="color:#ef4444;background:rgba(239,68,68,0.15)">+${info.xp}</div>
  `;
  grid.appendChild(el);
}

function renderRecords() {
  const list = document.getElementById('recordsList');
  if (!list) return;
  list.innerHTML = '';
  const s = getState();
  if (!s) return;
  const sorted = Object.entries(s.playTime || {}).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) { list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-weight:600;">Пока нет рекордов — сыграй в игру!</div>'; return; }
  const ALL = [...(window.GAMES || []), ...(window.UTILITIES || [])];
  sorted.forEach(([gameId, seconds]) => {
    const game = ALL.find(g => g.id === gameId);
    if (!game) return;
    const row = document.createElement('div');
    row.className = 'record-row';
    row.innerHTML = `<div class="rec-game"><span class="rec-icon">${game.icon}</span><span class="rec-name">${game.name}</span></div><span class="rec-time">${profileFormatTime(seconds)}</span>`;
    list.appendChild(row);
  });
}

function renderStats() {
  const s = getState();
  if (!s) return;
  const tg = document.getElementById('totalGames');
  if (tg) tg.textContent = (window.GAMES || []).length + (window.UTILITIES || []).length;
  const tt = document.getElementById('totalTime');
  if (tt) tt.textContent = Math.floor(s.totalTime / 60) + ' мин';
  const totalReal = ACHIEVEMENTS.filter(a => a.type !== 'tutorial' && !a.isParadox && !a.isHitman && !a.isVeteran).length;
  const earnedReal = (s.achievements || []).filter(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    return a && a.type !== 'tutorial' && !a.isParadox && !a.isHitman && !a.isVeteran;
  }).length;
  const text = earnedReal + '/' + totalReal;
  const ac = document.getElementById('achCount'); if (ac) ac.textContent = text;
  const ach = document.getElementById('achCountHeader'); if (ach) ach.textContent = text;
}

function checkLevelAchievements() {
  const s = getState();
  if (!s) return;
  if (s.level >= 25) unlockAch('level_25');
  if (s.level >= 50) unlockAch('level_50');
  if (s.level >= 75) unlockAch('level_75');
  if (s.level >= 100) unlockAch('level_100');
}

function unlockAch(id) {
  const s = getState();
  if (!s) return;
  if (!s.achievements) s.achievements = [];
  if (s.achievements.includes(id)) return;
  if (id === 'veteran') return;
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;
  s.achievements.push(id);
  if (ach.type !== 'tutorial' && ach.xp) s.totalXp += ach.xp;
  if (ach.type !== 'tutorial') {
    const today = typeof window.todayStr === 'function' ? window.todayStr() : new Date().toISOString().slice(0, 10);
    if (s.todayStats && s.todayStats.date === today) s.todayStats.achEarned = (s.todayStats.achEarned || 0) + 1;
  }
  checkVeteran();
  const lvlInfo = getLevelFromTotalXp(s.totalXp);
  const oldLevel = s.level;
  s.level = lvlInfo.level;
  if (typeof window.saveState === 'function') window.saveState();
  showAchToast(id);
  if (s.level > oldLevel) setTimeout(() => showLevelUpToast(s.level), 500);
  checkLevelAchievements();
  const pm = document.getElementById('profileModal');
  if (pm && pm.classList.contains('show')) renderAchievements();
  renderStats(); updateLevelDisplay();
  if (s.lastSubmittedNick && typeof window.submitScore === 'function') setTimeout(window.submitScore, 1000);
}

function checkVeteran() {
  const s = getState();
  if (!s) return;
  if (!s.achievements) s.achievements = [];
  if (s.achievements.includes('veteran')) return;
  const allOthers = ACHIEVEMENTS.filter(a => !a.isVeteran && !a.isParadox && !a.isHitman && a.type !== 'tutorial');
  const allEarned = allOthers.every(a => s.achievements.includes(a.id));
  if (allEarned) {
    s.achievements.push('veteran'); s.totalXp += 1000;
    if (typeof window.saveState === 'function') window.saveState();
    setTimeout(() => showVeteranToast(), 1000);
  }
}

function showAchToast(id) {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;
  if (window.SOUNDS && window.SOUNDS.achievement) window.SOUNDS.achievement();
  const isTutorial = ach.type === 'tutorial';
  const rarity = ach.rarity || 'common';
  const gradients = { common: 'linear-gradient(135deg,#6a8aff,#4a6aff)', rare: 'linear-gradient(135deg,#22b8cf,#0c8599)', epic: 'linear-gradient(135deg,#a855f7,#7e22ce)', legendary: 'linear-gradient(135deg,#fbbf24,#f59e0b,#fbbf24)' };
  const bg = isTutorial ? 'linear-gradient(135deg,#5a7aaa,#3a4a6a)' : (ach.isVeteran ? 'linear-gradient(135deg,#ff00ff,#ff8c00,#6a8aff)' : (gradients[rarity] || gradients.common));
  const rarityText = { common: 'ОБЫЧНОЕ', rare: 'РЕДКОЕ', epic: 'ЭПИЧЕСКОЕ', legendary: '🌟 ЛЕГЕНДАРНОЕ' };
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:14px 28px;border-radius:22px;font-weight:800;font-family:'Manrope',sans-serif;z-index:99999;box-shadow:0 10px 40px rgba(0,0,0,0.5);display:flex;align-items:center;gap:12px;animation:toastIn 0.4s ease;border:2px solid rgba(255,255,255,0.3);max-width:400px;`;
  const xpText = isTutorial ? '🎓 Шаг новичка' : `+${ach.xp} XP`;
  toast.innerHTML = `<span style="font-size:32px">${ach.icon}</span><div><div style="font-size:11px;opacity:0.85;letter-spacing:1px;font-weight:700">${isTutorial ? '🎓 ПЕРВЫЙ ШАГ' : `🏆 ${ach.isVeteran ? 'ЛЕГЕНДАРНОЕ' : rarityText[rarity]} ДОСТИЖЕНИЕ`}</div><div style="font-size:16px;margin-top:2px">${ach.name}</div><div style="font-size:11px;opacity:0.85;margin-top:2px">${ach.desc} <span style="color:#fff;font-weight:900">${xpText}</span></div></div>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.4s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, isTutorial ? 2000 : (ach.isVeteran ? 5000 : 3500));
}

function showParadoxToast(level, xp) {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#ffffff;padding:16px 32px;border-radius:24px;font-weight:800;font-family:'Manrope',sans-serif;z-index:99999;box-shadow:0 10px 50px rgba(6,182,212,0.6);display:flex;align-items:center;gap:14px;border:2px solid rgba(255,255,255,0.4);animation:toastIn 0.4s ease;`;
  toast.innerHTML = `<span style="font-size:36px">🌀</span><div><div style="font-size:11px;opacity:0.85;letter-spacing:1.5px;font-weight:800">⏳ ВРЕМЕННОЙ ПАРАДОКС</div><div style="font-size:17px;margin-top:2px">Уровень ${level} пройден!</div><div style="font-size:12px;opacity:0.9;margin-top:2px">Награда: <span style="color:#fbbf24;font-weight:900">+${xp} XP</span></div></div>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.4s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 5000);
}

function showHitmanToast(level, xp) {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#ef4444,#fbbf24);color:#ffffff;padding:16px 32px;border-radius:24px;font-weight:800;font-family:'Manrope',sans-serif;z-index:99999;box-shadow:0 10px 50px rgba(239,68,68,0.6);display:flex;align-items:center;gap:14px;border:2px solid rgba(255,255,255,0.4);animation:toastIn 0.4s ease;`;
  toast.innerHTML = `<span style="font-size:36px">💀</span><div><div style="font-size:11px;opacity:0.85;letter-spacing:1.5px;font-weight:800">🎯 НАЁМНЫЙ УБИЙЦА</div><div style="font-size:17px;margin-top:2px">Уровень ${level} пройден!</div><div style="font-size:12px;opacity:0.9;margin-top:2px">Награда: <span style="color:#ffffff;font-weight:900">+${xp} XP</span></div></div>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.4s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 5000);
}

function showVeteranToast() {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#ff00ff,#ff8c00,#fbbf24,#6a8aff);color:#060a1a;padding:40px 60px;border-radius:32px;font-family:'Manrope',sans-serif;text-align:center;z-index:999999;box-shadow:0 0 100px rgba(255,0,255,0.8);border:4px solid #ffffff;max-width:90vw;animation:modalIn 0.5s ease;`;
  toast.innerHTML = `<div style="font-size:80px;">🏅</div><div style="font-size:36px;font-weight:900;margin:16px 0 8px;letter-spacing:3px;">ВЕТЕРАН</div><div style="font-size:16px;font-weight:800;opacity:0.9;">Ты собрал ВСЕ достижения!</div><div style="font-size:22px;font-weight:900;margin-top:12px;">+1000 XP</div>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.5s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 6000);
}

function showLevelUpToast(level) {
  const title = getTitleForLevel(level);
  if (window.SOUNDS && window.SOUNDS.levelup) window.SOUNDS.levelup();
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#fbbf24,#6a8aff);color:#060a1a;padding:24px 48px;border-radius:24px;font-family:'Manrope',sans-serif;text-align:center;z-index:999998;box-shadow:0 10px 60px rgba(251,191,36,0.6);border:3px solid rgba(255,255,255,0.4);animation:modalIn 0.5s ease;`;
  toast.innerHTML = `<div style="font-size:48px;">⭐</div><div style="font-size:14px;font-weight:700;opacity:0.8;letter-spacing:2px;">НОВЫЙ УРОВЕНЬ</div><div style="font-size:48px;font-weight:900;margin:8px 0;">${level}</div><div style="font-size:18px;font-weight:800;">${title}</div>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.4s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
}

function checkHitman() {
  const s = getState();
  if (!s) return;
  if (!s.hitman) s.hitman = { level: 1, totalAccumulated: 0, totalKills: 0 };
  if (s.hitman.totalKills >= 1000) unlockAch('1000_kills');
  const h = s.hitman;
  if (h.totalAccumulated === undefined) h.totalAccumulated = 0;
  if (h.totalKills === undefined) h.totalKills = 0;
  let guard = 0; const MAX_ITERATIONS = 100; let changed = false;
  while (guard++ < MAX_ITERATIONS) {
    const info = getHitmanLevelInfo(h.level);
    if (info.kills < 1) break;
    if (h.totalAccumulated < info.kills) break;
    h.totalAccumulated -= info.kills; s.totalXp += info.xp; h.level++; changed = true;
    const lvlInfo = getLevelFromTotalXp(s.totalXp);
    const oldLevel = s.level; s.level = lvlInfo.level;
    showHitmanToast(h.level - 1, info.xp);
    if (s.level > oldLevel) setTimeout(() => showLevelUpToast(s.level), 800);
  }
  if (changed) {
    if (typeof window.saveState === 'function') window.saveState();
    updateLevelDisplay(); renderStats();
    const pm = document.getElementById('profileModal');
    if (pm && pm.classList.contains('show')) renderAchievements();
    if (s.lastSubmittedNick && typeof window.submitScore === 'function') setTimeout(window.submitScore, 1000);
  }
}

// 👇 ОБРАБОТЧИКИ POSTMESSAGE
window.addEventListener('message', (e) => {
  if (!e.data || !e.data.type) return;
  const s = getState();
  if (!s) return;
  const t = e.data.type;
  const unlock = window.unlockAch || function(){};

  if (t === 'override77_kill') {
    if (!s.hitman) s.hitman = { level: 1, totalAccumulated: 0, totalKills: 0 };
    s.hitman.totalKills = (s.hitman.totalKills || 0) + 1;
    s.hitman.totalAccumulated = (s.hitman.totalAccumulated || 0) + 1;
    checkHitman();
    if (typeof window.saveState === 'function') window.saveState();
    return;
  }

  if (t === 'lastfrontier_all_zombies') {
    if (e.data.total) s.lastfrontierZombies = e.data.total;
    if (typeof window.saveState === 'function') window.saveState();
    unlock('virus_tamer');
    return;
  }

  if (t === 'no_damage_win') {
    if (!s.noDamageWins) s.noDamageWins = [];
    const gid = e.data.gameId || 'unknown';
    if (!s.noDamageWins.includes(gid)) {
      s.noDamageWins.push(gid);
      if (typeof window.saveState === 'function') window.saveState();
      unlock('no_damage_win');
    }
    return;
  }

  if (t === 'speedrun_1min') {
    const time = Number(e.data.time) || 0;
    if (time > 0 && time < 300) unlock('speedrun_1min');
    return;
  }

  if (t === 'dom2_ending') {
    if (!s.dom2Endings) s.dom2Endings = [];
    const endingId = e.data.endingId;
    if (endingId !== undefined && !s.dom2Endings.includes(endingId)) {
      s.dom2Endings.push(endingId);
      if (typeof window.saveState === 'function') window.saveState();
      if (s.dom2Endings.length >= 5) unlock('all_endings_dom2');
    }
    return;
  }

  if (t === 'lastfrontier_perfect_deck') {
    unlock('perfect_deck');
    return;
  }

  if (t === 'lastfrontier_boss_win') {
    if (!s.lastfrontierBosses) s.lastfrontierBosses = [];
    const bossId = e.data.bossId;
    if (bossId && !s.lastfrontierBosses.includes(bossId)) {
      s.lastfrontierBosses.push(bossId);
      if (typeof window.saveState === 'function') window.saveState();
      if (s.lastfrontierBosses.length >= 10) unlock('all_zombies_bosses');
    }
    if (e.data.streak !== undefined) {
      s.lastfrontierBossStreak = e.data.streak;
      if (e.data.streak >= 10) unlock('boss_rush');
    }
    return;
  }

  if (t === 'override77_map') {
    if (!s.overrideMapsPlayed) s.overrideMapsPlayed = [];
    const mapId = e.data.mapId;
    if (mapId && !s.overrideMapsPlayed.includes(mapId)) {
      s.overrideMapsPlayed.push(mapId);
      if (typeof window.saveState === 'function') window.saveState();
      if (s.overrideMapsPlayed.length >= 4) unlock('all_maps_override');
    }
    return;
  }

  if (t === 'robo_boss_win') {
    if (e.data.streak >= 5) unlock('boss_rush');
    return;
  }
});

// ЭКСПОРТ / ИМПОРТ / СБРОС
async function exportProfile() {
  const s = getState();
  if (!s) return;
  const data = { version: 27, exportedAt: new Date().toISOString(), state: s };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fireland_profile_${s.nickname || 'player'}_${(typeof window.todayStr === 'function' ? window.todayStr() : new Date().toISOString().slice(0, 10))}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:14px 28px;border-radius:22px;font-weight:800;font-family:'Manrope';z-index:99999;animation:toastIn 0.4s ease;`;
  toast.textContent = '💾 Профиль экспортирован!';
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2500);
}

function compressAvatar(file, maxSize) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width = Math.round(img.width * ratio); canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) { resolve(ev.target.result); }
      };
      img.onerror = () => resolve(null);
      img.src = ev.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function renameNickEverywhere(oldNick, newNick, token) {
  const SUPABASE_URL = window.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rename_nick_everywhere`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ p_old_nick: oldNick, p_new_nick: newNick, p_owner_token: token || '' }),
    });
    if (!res.ok) { console.warn('[Rename] Ошибка:', res.status); return { ok: false, message: 'Ошибка сервера' }; }
    const data = await res.json();
    if (!data.ok) {
      if (data.error === 'NICK_TAKEN') return { ok: false, message: 'Этот ник занят другим игроком' };
      if (data.error === 'NOT_OWNER') return { ok: false, message: 'Не твой ник' };
      if (data.error === 'OLD_NOT_FOUND') { if (typeof window.saveNickname === 'function') return await window.saveNickname(); return { ok: false, message: 'Ошибка' }; }
      return { ok: false, message: data.error || 'Ошибка' };
    }
    const s = getState(); if (s) s.lastSubmittedNick = newNick;
    if (typeof window.saveState === 'function') window.saveState(true);
    if (typeof CHAT !== 'undefined') {
      CHAT.dmList = []; CHAT.historyLoaded = {}; CHAT.reactions = {}; CHAT.subscribed = {};
      if (CHAT.currentRoom && CHAT.currentRoom.startsWith('dm_')) { if (typeof window.switchRoom === 'function') window.switchRoom('general'); }
      else if (typeof window.renderDmList === 'function') window.renderDmList();
    }
    if (typeof window.refreshLeaderboard === 'function') setTimeout(window.refreshLeaderboard, 500);
    return { ok: true };
  } catch (e) { console.warn('[Rename] сеть:', e); return { ok: false, message: 'Нет интернета' }; }
}

async function resetAllData() {
  const SUPABASE_URL = window.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
  const s = getState();
  const oldNick = s && s.nickname && s.nickname !== 'Игрок' ? s.nickname : null;
  const oldToken = s && s.ownerToken ? s.ownerToken : null;
  let msg = '🗑️ Сбросить ВСЁ?\n\nВесь прогресс вернётся к заводским!';
  if (oldNick && oldToken) msg += '\n\n⚠️ Твой ник «' + oldNick + '» также будет УДАЛЁН из базы.';
  if (!confirm(msg)) return;
  let dbDeleted = false;
  if (oldNick && oldToken) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_my_account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ p_nickname: oldNick, p_owner_token: oldToken }),
      });
      if (res.ok) { const data = await res.json(); if (data.ok) dbDeleted = true; }
    } catch (e) {}
  }
  const STATE_KEY = window.STATE_KEY || 'main_state';
  if (typeof window.idbDelete === 'function') { try { await window.idbDelete(STATE_KEY); } catch (e) {} }
  localStorage.removeItem('fireland_light');
  localStorage.removeItem('abdulla_games_state_no_credits');
  localStorage.removeItem('fireland_lb_auto_refresh');
  const DEFAULT = window.DEFAULT_STATE;
  if (!DEFAULT || Object.keys(DEFAULT).length === 0) { location.reload(); return; }
  window.state = JSON.parse(JSON.stringify(DEFAULT));
  window.state.ownerToken = typeof window.generateOwnerToken === 'function' ? window.generateOwnerToken() : 'tok_' + Date.now();
  window.state.unreadChatCount = 0;
  if (typeof window.idbSet === 'function') await window.idbSet(STATE_KEY, window.state);
  if (typeof window.renderGames === 'function') window.renderGames();
  if (typeof window.renderUtilities === 'function') window.renderUtilities();
  if (typeof window.updateLastGameBar === 'function') window.updateLastGameBar();
  if (typeof window.loadSettings === 'function') window.loadSettings();
  renderProfile(); renderStats(); renderAchievements(); renderRecords();
  if (typeof window.renderQuests === 'function') window.renderQuests();
  if (typeof window.renderStreak === 'function') window.renderStreak();
  updateLevelDisplay();
  if (typeof window.cancelAlarm === 'function') window.cancelAlarm();
  if (typeof window.clearSelection === 'function') window.clearSelection();
  if (typeof window.renderCases === 'function') window.renderCases();
  if (typeof window.updateChatBadge === 'function') window.updateChatBadge();
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const gamesTab = document.querySelector('.tab-btn[data-tab="games"]');
  if (gamesTab) gamesTab.classList.add('active');
  const gamesContent = document.getElementById('tab-games');
  if (gamesContent) gamesContent.classList.add('active');
  if (typeof window.applyTheme === 'function') window.applyTheme();
  if (typeof CHAT !== 'undefined') {
    CHAT.dmList = []; CHAT.historyLoaded = {}; CHAT.reactions = {}; CHAT.subscribed = {};
    if (typeof window.loadMyRooms === 'function') window.loadMyRooms();
  }
  if (typeof window.refreshLeaderboard === 'function') setTimeout(window.refreshLeaderboard, 500);
  alert(dbDeleted ? '🔄 Всё сброшено, аккаунт удалён из базы.' : '🔄 Локальный прогресс сброшен.');
}

// КЕЙСЫ
const CASE_REWARDS = {
  common: [{icon:'💰',name:'+100 XP',type:'xp',value:100},{icon:'💵',name:'+150 XP',type:'xp',value:150},{icon:'💎',name:'+200 XP',type:'xp',value:200}],
  rare: [{icon:'💠',name:'+400 XP',type:'xp',value:400},{icon:'🎯',name:'+500 XP',type:'xp',value:500},{icon:'📈',name:'+600 XP',type:'xp',value:600}],
  epic: [{icon:'🌟',name:'+1000 XP',type:'xp',value:1000},{icon:'💫',name:'+1500 XP',type:'xp',value:1500},{icon:'🎆',name:'+2000 XP',type:'xp',value:2000}],
  legendary: [{icon:'👑',name:'+3000 XP',type:'xp',value:3000},{icon:'🔥',name:'+4000 XP',type:'xp',value:4000},{icon:'💎',name:'+5000 XP',type:'xp',value:5000}]
};

function getWeekStart() {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const dStr = window.dateStr || function (d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  return dStr(monday);
}
function canOpenDailyCase() { const todayStr = window.todayStr || function () { return new Date().toISOString().slice(0, 10); }; const s = getState(); return !s || s.lastDailyCase !== todayStr(); }
function canOpenWeeklyCase() { const s = getState(); return !s || s.lastWeeklyCase !== getWeekStart(); }

function openCase(type) {
  const s = getState(); if (!s) return;
  const todayStr = window.todayStr || function () { return new Date().toISOString().slice(0, 10); };
  if (type === 'daily' && !canOpenDailyCase()) { if (window.SOUNDS && window.SOUNDS.error) window.SOUNDS.error(); alert('📦 Ежедневный кейс уже открыт сегодня!'); return; }
  if (type === 'weekly' && !canOpenWeeklyCase()) { if (window.SOUNDS && window.SOUNDS.error) window.SOUNDS.error(); alert('🎁 Недельный кейс уже открыт!'); return; }
  let rarity;
  if (type === 'weekly') rarity = Math.random() < 0.6 ? 'epic' : 'legendary';
  else { const roll = Math.random(); if (roll < 0.6) rarity = 'common'; else if (roll < 0.9) rarity = 'rare'; else if (roll < 0.99) rarity = 'epic'; else rarity = 'legendary'; }
  const pool = CASE_REWARDS[rarity];
  const reward = pool[Math.floor(Math.random() * pool.length)];
  const modal = document.getElementById('caseOpenModal');
  const revealIcon = document.getElementById('caseRevealIcon');
  const revealTitle = document.getElementById('caseRevealTitle');
  const revealReward = document.getElementById('caseRevealReward');
  const revealRarity = document.getElementById('caseRevealRarity');
  if (!modal || !revealIcon || !revealTitle || !revealReward || !revealRarity) return;
  modal.classList.add('show');
  revealIcon.textContent = '📦'; revealTitle.textContent = 'Открываем...'; revealReward.textContent = ''; revealRarity.style.display = 'none';
  if (window.SOUNDS && window.SOUNDS.caseOpen) window.SOUNDS.caseOpen();
  setTimeout(() => {
    revealIcon.textContent = reward.icon; revealTitle.textContent = 'Ты получил:'; revealReward.textContent = reward.name;
    revealRarity.className = 'case-reveal-rarity ' + rarity;
    revealRarity.textContent = { common: 'ОБЫЧНОЕ', rare: 'РЕДКОЕ', epic: 'ЭПИЧЕСКОЕ', legendary: 'ЛЕГЕНДАРНОЕ' }[rarity];
    revealRarity.style.display = 'inline-block';
    if (reward.type === 'xp') s.totalXp += reward.value;
    s.caseItems = s.caseItems || [];
    s.caseItems.push({ type, rarity, reward: reward.name, date: todayStr(), timestamp: Date.now() });
    if (type === 'daily') s.lastDailyCase = todayStr(); else s.lastWeeklyCase = getWeekStart();
    if (s.todayStats) s.todayStats.caseOpened = (s.todayStats.caseOpened || 0) + 1;
    if (typeof window.saveState === 'function') window.saveState();
    unlockAch('case_first');
    if (s.caseItems.length >= 10) unlockAch('case_10');
    if (s.caseItems.length >= 50) unlockAch('case_50');
    if (rarity === 'legendary') unlockAch('case_legendary');
    if (rarity === 'legendary') { if (window.SOUNDS && window.SOUNDS.levelup) window.SOUNDS.levelup(); }
    else if (rarity === 'epic') { if (window.SOUNDS && window.SOUNDS.reward) window.SOUNDS.reward(); }
    else { if (window.SOUNDS && window.SOUNDS.quest) window.SOUNDS.quest(); }
    updateLevelDisplay(); renderStats();
    if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress();
    const lvlInfo = getLevelFromTotalXp(s.totalXp);
    if (lvlInfo.level > s.level) { s.level = lvlInfo.level; setTimeout(() => { if (window.SOUNDS && window.SOUNDS.levelup) window.SOUNDS.levelup(); showLevelUpToast(s.level); }, 800); }
    checkLevelAchievements(); renderCases();
  }, 1000);
}

function renderCases() {
  const dailyBtn = document.getElementById('openDailyCaseBtn');
  const weeklyBtn = document.getElementById('openWeeklyCaseBtn');
  const dailyTimer = document.getElementById('dailyCaseTimer');
  const weeklyTimer = document.getElementById('weeklyCaseTimer');
  if (!dailyBtn) return;
  if (canOpenDailyCase()) { dailyBtn.disabled = false; dailyBtn.textContent = '✨ Открыть'; if (dailyTimer) dailyTimer.textContent = '✅ Доступен'; }
  else { dailyBtn.disabled = true; dailyBtn.textContent = '❌ Открыт'; if (dailyTimer) dailyTimer.textContent = '⏰ Завтра'; }
  if (canOpenWeeklyCase()) { weeklyBtn.disabled = false; weeklyBtn.textContent = '✨ Открыть'; if (weeklyTimer) weeklyTimer.textContent = '✅ Доступен'; }
  else { weeklyBtn.disabled = true; weeklyBtn.textContent = '❌ Открыт'; if (weeklyTimer) weeklyTimer.textContent = '⏰ В понедельник'; }
}

function initCasesUI() {
  const closeBtn = document.getElementById('caseRevealCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', () => { document.getElementById('caseOpenModal').classList.remove('show'); if (window.SOUNDS && window.SOUNDS.click) window.SOUNDS.click(); });
  const dailyBtn = document.getElementById('openDailyCaseBtn');
  const weeklyBtn = document.getElementById('openWeeklyCaseBtn');
  if (dailyBtn) dailyBtn.addEventListener('click', () => openCase('daily'));
  if (weeklyBtn) weeklyBtn.addEventListener('click', () => openCase('weekly'));
}

// ЗАДАНИЯ
function checkDailyQuests() {
  const s = getState(); if (!s) return;
  const today = window.todayStr ? window.todayStr() : new Date().toISOString().slice(0, 10);
  if (s.dailyQuests && s.dailyQuests.date === today) return;
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  s.dailyQuests = { date: today, quests: shuffled.slice(0, 5).map(q => q.id), progress: {}, completed: [] };
  if (typeof window.saveState === 'function') window.saveState();
}

function updateQuestProgress() {
  const s = getState(); if (!s) return;
  const today = window.todayStr ? window.todayStr() : new Date().toISOString().slice(0, 10);
  if (!s.todayStats || s.todayStats.date !== today) {
    s.todayStats = { date: today, gamesPlayed: [], timeSpent: 0, utilPlayed: [], favPlayed: [], achEarned: 0, favAdded: 0, nickSet: false, themeChanged: false, fullscreenUsed: false, profileViewed: false, settingsViewed: false, questsViewed: false, favTimeSpent: 0, caseOpened: 0 };
  }
  if (!s.todayStats.utilPlayed) s.todayStats.utilPlayed = [];
  let changed = false;
  s.dailyQuests.quests.forEach(qId => {
    const quest = QUEST_POOL.find(q => q.id === qId); if (!quest) return;
    if (s.dailyQuests.completed.includes(qId)) return;
    let progress = 0;
    switch (quest.type) {
      case 'games_today': progress = s.todayStats.gamesPlayed.length; break;
      case 'time_today': progress = s.todayStats.timeSpent; break;
      case 'util_today': progress = s.todayStats.utilPlayed.length; break;
      case 'fav_today': progress = s.todayStats.favPlayed.length; break;
      case 'ach_today': progress = s.todayStats.achEarned; break;
      case 'fav_add_today': progress = s.todayStats.favAdded; break;
      case 'nick_set_today': progress = s.todayStats.nickSet ? 1 : 0; break;
      case 'theme_change_today': progress = s.todayStats.themeChanged ? 1 : 0; break;
      case 'fullscreen_today': progress = s.todayStats.fullscreenUsed ? 1 : 0; break;
      case 'profile_view_today': progress = s.todayStats.profileViewed ? 1 : 0; break;
      case 'settings_view_today': progress = s.todayStats.settingsViewed ? 1 : 0; break;
      case 'quests_view_today': progress = s.todayStats.questsViewed ? 1 : 0; break;
      case 'fav_time_today': progress = s.todayStats.favTimeSpent; break;
      case 'case_today': progress = s.todayStats.caseOpened || 0; break;
      case 'lastfrontier_zombies': progress = s.lastfrontierZombies || 0; break;
    }
    const oldProgress = s.dailyQuests.progress[qId] || 0;
    if (oldProgress !== progress) { s.dailyQuests.progress[qId] = progress; changed = true; }
    if (progress >= quest.target) {
      s.dailyQuests.completed.push(qId);
      s.totalXp += quest.xp;
      s.questsCompletedTotal = (s.questsCompletedTotal || 0) + 1;
      if (s.questsCompletedTotal >= 1) unlockAch('quest_first');
      if (s.questsCompletedTotal >= 10) unlockAch('quest_10');
      if (s.questsCompletedTotal >= 100) unlockAch('quest_100');
      showQuestCompleteToast(quest);
      changed = true;
      if (s.dailyQuests.completed.length === s.dailyQuests.quests.length) {
        setTimeout(() => {
          s.totalXp += 200;
          unlockAch('quest_all_daily');
          showDailyBonusToast();
          if (typeof window.saveState === 'function') window.saveState();
          checkVeteran();
        }, 1000);
      }
    }
  });
  if (changed) {
    if (typeof window.saveState === 'function') window.saveState();
    checkVeteran();
    const questsTab = document.getElementById('tab-quests');
    if (questsTab && questsTab.classList.contains('active')) renderQuests();
  }
}

function renderQuests() {
  const panel = document.getElementById('questsPanel'); if (!panel) return;
  panel.innerHTML = '';
  const s = getState(); if (!s) return;
  const today = window.todayStr ? window.todayStr() : new Date().toISOString().slice(0, 10);
  if (s.dailyQuests.date !== today) checkDailyQuests();
  s.dailyQuests.quests.forEach(qId => {
    const quest = QUEST_POOL.find(q => q.id === qId); if (!quest) return;
    const completed = s.dailyQuests.completed.includes(qId);
    const progress = s.dailyQuests.progress[qId] || 0;
    const percent = Math.min(100, (progress / quest.target) * 100);
    const card = document.createElement('div');
    card.className = 'quest-card' + (completed ? ' completed' : '');
    card.innerHTML = `<div class="quest-icon">${quest.icon}</div><div class="quest-info"><div class="quest-name">${quest.name}</div><div class="quest-desc">${quest.desc}</div><div class="quest-progress-bg"><div class="quest-progress-fill" style="width:${percent}%"></div></div></div><div class="quest-xp">+${quest.xp}</div>`;
    panel.appendChild(card);
  });
  const qcc = document.getElementById('questsCompletedCount'); if (qcc) qcc.textContent = s.dailyQuests.completed.length;
}

function renderQuestTimer() {
  const el = document.getElementById('questResetTimer'); if (!el) return;
  const now = new Date(); const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
  const diff = Math.floor((tomorrow - now) / 1000);
  const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), sec = diff % 60;
  el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function showQuestCompleteToast(quest) {
  if (window.SOUNDS && window.SOUNDS.quest) window.SOUNDS.quest();
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:14px 28px;border-radius:22px;font-weight:800;font-family:'Manrope',sans-serif;z-index:99999;box-shadow:0 10px 40px rgba(34,197,94,0.5);display:flex;align-items:center;gap:12px;animation:toastIn 0.4s ease;border:2px solid rgba(255,255,255,0.3);`;
  toast.innerHTML = `<span style="font-size:32px">${quest.icon}</span><div><div style="font-size:11px;opacity:0.85;letter-spacing:1px;">📅 ЗАДАНИЕ ВЫПОЛНЕНО</div><div style="font-size:16px;margin-top:2px">${quest.name}</div><div style="font-size:11px;opacity:0.9;margin-top:2px">+${quest.xp} XP</div></div>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.4s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
}

function showDailyBonusToast() {
  if (window.SOUNDS && window.SOUNDS.reward) window.SOUNDS.reward();
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#fbbf24,#f59e0b,#22c55e,#16a34a);color:#060a1a;padding:32px 56px;border-radius:28px;font-family:'Manrope',sans-serif;text-align:center;z-index:999999;box-shadow:0 0 80px rgba(251,191,36,0.8);border:4px solid #ffffff;animation:modalIn 0.6s ease;`;
  toast.innerHTML = `<div style="font-size:70px;">🎁</div><div style="font-size:28px;font-weight:900;margin:12px 0 6px;">ВСЕ ЗАДАНИЯ ВЫПОЛНЕНЫ!</div><div style="font-size:16px;font-weight:800;opacity:0.9;">+200 XP бонусом</div>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.5s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 4000);
}

// БУДИЛЬНИК
const alarmModal = document.getElementById('alarmModal');
const alarmCloseBtn = document.getElementById('alarmCloseBtn');
const alarmToggleBtn = document.getElementById('alarmToggleBtn');
const alarmIndicator = document.getElementById('alarmIndicator');
const alarmSecondsSlider = document.getElementById('alarmSecondsSlider');
const alarmSecondsValue = document.getElementById('alarmSecondsValue');
const alarmMinutesSlider = document.getElementById('alarmMinutesSlider');
const alarmMinutesValue = document.getElementById('alarmMinutesValue');
const alarmHoursSlider = document.getElementById('alarmHoursSlider');
const alarmHoursValue = document.getElementById('alarmHoursValue');
const alarmStartBtn = document.getElementById('alarmStartBtn');
const alarmCancelBtn = document.getElementById('alarmCancelBtn');
const alarmStatus = document.getElementById('alarmStatus');
const alarmVolumeSlider = document.getElementById('alarmVolumeSlider');
const alarmVolumeValue = document.getElementById('alarmVolumeValue');
const alarmRepeatsSlider = document.getElementById('alarmRepeatsSlider');
const alarmRepeatsValue = document.getElementById('alarmRepeatsValue');
const alarmDelaySlider = document.getElementById('alarmDelaySlider');
const alarmDelayValue = document.getElementById('alarmDelayValue');
const vibrationToggle = document.getElementById('vibrationToggle');

let alarmEndTime = null;
let alarmIntervalId = null;
let alarmIsRinging = false;

function loadAlarmSettings() {
  const s = getState(); if (!s) return;
  if (alarmVolumeSlider) { alarmVolumeSlider.value = s.alarmVolume; if (alarmVolumeValue) alarmVolumeValue.textContent = Math.round(s.alarmVolume * 100) + '%'; }
  if (alarmRepeatsSlider) { alarmRepeatsSlider.value = s.alarmRepeats; if (alarmRepeatsValue) alarmRepeatsValue.textContent = s.alarmRepeats; }
  if (alarmDelaySlider) { alarmDelaySlider.value = s.alarmDelay; if (alarmDelayValue) alarmDelayValue.textContent = s.alarmDelay + 'с'; }
  if (vibrationToggle) vibrationToggle.checked = s.vibrationEnabled;
}

if (alarmVolumeSlider) alarmVolumeSlider.addEventListener('input', () => { const s = getState(); if (!s) return; s.alarmVolume = parseFloat(alarmVolumeSlider.value); if (alarmVolumeValue) alarmVolumeValue.textContent = Math.round(s.alarmVolume * 100) + '%'; if (typeof window.saveState === 'function') window.saveState(); });
if (alarmRepeatsSlider) alarmRepeatsSlider.addEventListener('input', () => { const s = getState(); if (!s) return; s.alarmRepeats = parseInt(alarmRepeatsSlider.value); if (alarmRepeatsValue) alarmRepeatsValue.textContent = s.alarmRepeats; if (typeof window.saveState === 'function') window.saveState(); });
if (alarmDelaySlider) alarmDelaySlider.addEventListener('input', () => { const s = getState(); if (!s) return; s.alarmDelay = parseInt(alarmDelaySlider.value); if (alarmDelayValue) alarmDelayValue.textContent = s.alarmDelay + 'с'; if (typeof window.saveState === 'function') window.saveState(); });
if (vibrationToggle) vibrationToggle.addEventListener('change', () => { const s = getState(); if (!s) return; s.vibrationEnabled = vibrationToggle.checked; if (typeof window.saveState === 'function') window.saveState(); });
if (alarmSecondsSlider) alarmSecondsSlider.addEventListener('input', () => { if (alarmSecondsValue) alarmSecondsValue.textContent = alarmSecondsSlider.value; updateAlarmDisplay(); });
if (alarmMinutesSlider) alarmMinutesSlider.addEventListener('input', () => { if (alarmMinutesValue) alarmMinutesValue.textContent = alarmMinutesSlider.value; updateAlarmDisplay(); });
if (alarmHoursSlider) alarmHoursSlider.addEventListener('input', () => { if (alarmHoursValue) alarmHoursValue.textContent = alarmHoursSlider.value; updateAlarmDisplay(); });
if (alarmToggleBtn) alarmToggleBtn.addEventListener('click', () => { if (!alarmModal) return; alarmModal.classList.add('show'); if (alarmHoursSlider) alarmHoursSlider.value = 0; if (alarmMinutesSlider) alarmMinutesSlider.value = 0; if (alarmSecondsSlider) alarmSecondsSlider.value = 5; if (alarmHoursValue) alarmHoursValue.textContent = '0'; if (alarmMinutesValue) alarmMinutesValue.textContent = '0'; if (alarmSecondsValue) alarmSecondsValue.textContent = '5'; updateAlarmDisplay(); loadAlarmSettings(); });
if (alarmCloseBtn) alarmCloseBtn.addEventListener('click', () => { if (alarmModal) alarmModal.classList.remove('show'); });
if (alarmModal) alarmModal.addEventListener('click', (e) => { if (e.target === alarmModal) alarmModal.classList.remove('show'); });

function getAlarmTotalSeconds() { const h = parseInt(alarmHoursSlider?.value) || 0; const m = parseInt(alarmMinutesSlider?.value) || 0; const s = parseInt(alarmSecondsSlider?.value) || 0; return h * 3600 + m * 60 + s; }

function alarmRing() {
  if (alarmIsRinging) return;
  alarmIsRinging = true;
  const s = getState();
  if (alarmStatus) { alarmStatus.textContent = '🔔 БУДИЛЬНИК!'; alarmStatus.classList.add('alarm-status-ringing'); }
  if (alarmIndicator) alarmIndicator.classList.add('active');
  if (typeof window.vibrateDevice === 'function') window.vibrateDevice();
  let ringCount = 0;
  const totalRings = s ? s.alarmRepeats : 5;
  const delayMs = s ? s.alarmDelay * 1000 : 15000;
  let ringInterval = null;
  function doRing() {
    if (ringCount >= totalRings) { if (ringInterval) clearInterval(ringInterval); if (alarmStatus) alarmStatus.classList.remove('alarm-status-ringing'); alarmIsRinging = false; if (alarmIndicator) alarmIndicator.classList.remove('active'); return; }
    if (typeof window.playAlarmSound === 'function') window.playAlarmSound();
    if (typeof window.vibrateDevice === 'function') window.vibrateDevice();
    ringCount++;
  }
  doRing();
  ringInterval = setInterval(doRing, delayMs);
}

function updateAlarmDisplay() {
  if (!alarmStatus) return;
  if (!alarmEndTime) {
    const total = getAlarmTotalSeconds();
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    alarmStatus.textContent = `⏳ ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return;
  }
  const diff = Math.max(0, Math.floor((alarmEndTime - Date.now()) / 1000));
  if (diff <= 0) { alarmRing(); alarmEndTime = null; clearInterval(alarmIntervalId); alarmIntervalId = null; alarmStatus.textContent = '🔔 БУДИЛЬНИК!'; return; }
  const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
  alarmStatus.textContent = `⏳ ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startAlarm() {
  const totalSecs = getAlarmTotalSeconds();
  if (totalSecs < 1) { alert('❌ Минимум 1 секунда!'); return; }
  if (alarmIntervalId) clearInterval(alarmIntervalId);
  alarmEndTime = Date.now() + totalSecs * 1000;
  alarmIsRinging = false;
  if (alarmStatus) alarmStatus.classList.remove('alarm-status-ringing');
  if (alarmIndicator) alarmIndicator.classList.add('active');
  if (alarmStartBtn) alarmStartBtn.style.display = 'none';
  if (alarmCancelBtn) alarmCancelBtn.style.display = 'inline-block';
  alarmIntervalId = setInterval(updateAlarmDisplay, 1000);
  updateAlarmDisplay();
  const s = getState();
  if (s && !s.alarmUsed) { s.alarmUsed = true; if (typeof window.saveState === 'function') window.saveState(); unlockAch('alarm_user'); }
}

function cancelAlarm() {
  if (alarmIntervalId) clearInterval(alarmIntervalId);
  alarmIntervalId = null;
  alarmEndTime = null;
  alarmIsRinging = false;
  if (alarmStatus) alarmStatus.classList.remove('alarm-status-ringing');
  if (alarmIndicator) alarmIndicator.classList.remove('active');
  if (alarmStartBtn) alarmStartBtn.style.display = 'inline-block';
  if (alarmCancelBtn) alarmCancelBtn.style.display = 'none';
  updateAlarmDisplay();
}

if (alarmStartBtn) alarmStartBtn.addEventListener('click', startAlarm);
if (alarmCancelBtn) alarmCancelBtn.addEventListener('click', cancelAlarm);

// ЭКСПОРТ
window.LEVEL_TITLES = LEVEL_TITLES;
window.PARADOX = PARADOX;
window.HITMAN = HITMAN;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.QUEST_POOL = QUEST_POOL;
window.getTitleForLevel = getTitleForLevel;
window.getXpForLevel = getXpForLevel;
window.getLevelFromTotalXp = getLevelFromTotalXp;
window.getParadoxLevelInfo = getParadoxLevelInfo;
window.getHitmanLevelInfo = getHitmanLevelInfo;
window.profileFormatTime = profileFormatTime;
window.renderProfile = renderProfile;
window.updateLevelDisplay = updateLevelDisplay;
window.renderAchievements = renderAchievements;
window.renderParadoxCard = renderParadoxCard;
window.renderHitmanCard = renderHitmanCard;
window.renderRecords = renderRecords;
window.renderStats = renderStats;
window.checkLevelAchievements = checkLevelAchievements;
window.unlockAch = unlockAch;
window.checkVeteran = checkVeteran;
window.showAchToast = showAchToast;
window.showParadoxToast = showParadoxToast;
window.showHitmanToast = showHitmanToast;
window.showVeteranToast = showVeteranToast;
window.showLevelUpToast = showLevelUpToast;
window.checkHitman = checkHitman;
window.exportProfile = exportProfile;
window.importProfile = function () { const inp = document.getElementById('importProfileInput'); if (inp) inp.click(); };
window.compressAvatar = compressAvatar;
window.renameNickEverywhere = renameNickEverywhere;
window.resetAllData = resetAllData;
window.deleteMyAccount = resetAllData;
window.CASE_REWARDS = CASE_REWARDS;
window.getWeekStart = getWeekStart;
window.canOpenDailyCase = canOpenDailyCase;
window.canOpenWeeklyCase = canOpenWeeklyCase;
window.openCase = openCase;
window.renderCases = renderCases;
window.initCasesUI = initCasesUI;
window.checkDailyQuests = checkDailyQuests;
window.updateQuestProgress = updateQuestProgress;
window.renderQuests = renderQuests;
window.renderQuestTimer = renderQuestTimer;
window.showQuestCompleteToast = showQuestCompleteToast;
window.showDailyBonusToast = showDailyBonusToast;
window.loadAlarmSettings = loadAlarmSettings;
window.startAlarm = startAlarm;
window.cancelAlarm = cancelAlarm;
window.updateAlarmDisplay = updateAlarmDisplay;
window.alarmRing = alarmRing;

console.log('[profile.js] Загружено v27.1.0 + ACH_BUTTONS:', ACHIEVEMENTS.length, 'достижений');