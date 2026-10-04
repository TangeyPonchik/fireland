// ============================================
// FireLand · profile.js · v26.3.2
// БЕЗ export. Всё в window.
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

const ACHIEVEMENTS = [
{id:'first_game',icon:'🎮',name:'Первый шаг',desc:'Запустить любую игру',xp:50,rarity:'common'},
{id:'five_games',icon:'🎯',name:'Пятёрочка',desc:'Запустить 5 игр',xp:75,rarity:'common',progress:s=>Math.min(1,s.playedGames.length/5),progressText:s=>`${s.playedGames.length}/5`},
{id:'all_games',icon:'🏆',name:'Коллекционер',desc:'Запустить все игры',xp:200,rarity:'epic',progress:s=>Math.min(1,s.playedGames.length/GAMES.length),progressText:s=>`${s.playedGames.length}/${GAMES.length}`},
{id:'proryv1_win',icon:'💻',name:'Прорыв совершен',desc:'Сыграть в Прорыв 1',xp:50,rarity:'common'},
{id:'dom_escape',icon:'🏚️',name:'Выбрался из ДОМА',desc:'Пройти квест ДОМ',xp:150,rarity:'epic'},
{id:'dom2_burner',icon:'🩸',name:'Сжигатель якорей',desc:'Сжечь 3 якоря в ДОМ 2',xp:300,rarity:'legendary'},
{id:'cooking_chef',icon:'🍳',name:'Шеф-повар',desc:'Сыграть в Кулинарию',xp:50,rarity:'common'},
{id:'proryv2_win',icon:'🛡️',name:'Двойной прорыв',desc:'Сыграть в Прорыв 2',xp:50,rarity:'common'},
{id:'cosmo_pilot',icon:'🚀',name:'Космопилот',desc:'Сыграть в Контрабандиста',xp:50,rarity:'common'},
{id:'robo_hunter',icon:'🤖',name:'Охотник на роботов',desc:'Сыграть в Robo-Cleaner',xp:50,rarity:'common'},
{id:'fighter',icon:'👊',name:'Боец',desc:'Сыграть в Битву',xp:50,rarity:'common'},
{id:'miner_pro',icon:'⛏️',name:'Шахтёр-профи',desc:'Сыграть в Шахтёра',xp:50,rarity:'common'},
{id:'musibox_dj',icon:'🎧',name:'Диджей',desc:'Сыграть в Musibox',xp:50,rarity:'common'},
{id:'musibox_all_tracks',icon:'🎛️',name:'Полный пульт',desc:'Сыграть в Musibox',xp:75,rarity:'rare'},
{id:'zombie_survivor',icon:'🧟',name:'Выживший',desc:'Сыграть в Последний рубеж',xp:100,rarity:'rare'},
{id:'proryv3_win',icon:'🌐',name:'Финал прорыва',desc:'Сыграть в Прорыв 3',xp:150,rarity:'epic'},
{id:'proryv_trilogy',icon:'👑',name:'Хранитель трилогии',desc:'Сыграть во все три части Прорыва',xp:500,rarity:'legendary'},
{id:'first_snake',icon:'🐍',name:'Первая змейка',desc:'Сыграть в Snakes Battle',xp:50,rarity:'common'},
{id:'snake_win',icon:'🏆',name:'Король змеек',desc:'Победить в Snakes Battle',xp:200,rarity:'epic'},
{id:'snake_killer',icon:'💀',name:'Убийца змей',desc:'Убить 10 змеек',xp:300,rarity:'epic'},
{id:'first_util',icon:'🛠️',name:'Инструменталист',desc:'Запустить первую утилиту',xp:50,rarity:'common'},
{id:'all_utils',icon:'⚙️',name:'Мастер утилит',desc:'Запустить все утилиты',xp:150,rarity:'rare',progress:s=>Math.min(1,(s.playedGames.filter(g=>['fireshop','cpstest'].includes(g)).length)/2),progressText:s=>`${s.playedGames.filter(g=>['fireshop','cpstest'].includes(g)).length}/2`},
{id:'first_community',icon:'🌍',name:'Первопроходец',desc:'Загрузить свою игру в Сообщество',xp:200,rarity:'epic'},
{id:'community_5',icon:'🎨',name:'Творец',desc:'Загрузить 5 игр в Сообщество',xp:500,rarity:'legendary',progress:s=>Math.min(1,(s.myCommunityGames||0)/5),progressText:s=>`${s.myCommunityGames||0}/5`},
{id:'play_community',icon:'🌐',name:'Исследователь',desc:'Сыграть в игру из Сообщества',xp:100,rarity:'rare'},
{id:'time_1min',icon:'⏱️',name:'Минутка',desc:'Провести 1 минуту в играх',xp:25,rarity:'common',progress:s=>Math.min(1,s.totalTime/60),progressText:s=>`${Math.floor(s.totalTime/60)}м/1м`},
{id:'time_10min',icon:'⌚',name:'10 минут',desc:'Провести 10 мин в играх',xp:75,rarity:'common',progress:s=>Math.min(1,s.totalTime/600),progressText:s=>`${Math.floor(s.totalTime/60)}м/10м`},
{id:'time_30min',icon:'🕐',name:'Полчаса',desc:'Провести 30 мин в играх',xp:150,rarity:'rare',progress:s=>Math.min(1,s.totalTime/1800),progressText:s=>`${Math.floor(s.totalTime/60)}м/30м`},
{id:'time_1hour',icon:'🕰️',name:'Час за играми',desc:'Провести 1 час в играх',xp:250,rarity:'epic',progress:s=>Math.min(1,s.totalTime/3600),progressText:s=>`${Math.floor(s.totalTime/60)}м/60м`},
{id:'time_5hours',icon:'⏰',name:'Марафонец',desc:'Провести 5 часов в играх',xp:500,rarity:'legendary',progress:s=>Math.min(1,s.totalTime/18000),progressText:s=>`${Math.floor(s.totalTime/60)}м/300м`},
{id:'night_owl',icon:'🦉',name:'Полуночник',desc:'Играть после 00:00',xp:50,rarity:'common'},
{id:'early_bird',icon:'🐦',name:'Ранняя пташка',desc:'Играть до 7:00',xp:50,rarity:'common'},
{id:'lunch_time',icon:'🍽️',name:'Обеденный перерыв',desc:'Играть в 12:00-14:00',xp:50,rarity:'common'},
{id:'repeat_5',icon:'🔁',name:'Повторюшка',desc:'Запустить игру 5 раз',xp:75,rarity:'common',progress:s=>Math.min(1,s.gamesOpened/5),progressText:s=>`${s.gamesOpened}/5`},
{id:'repeat_25',icon:'🔄',name:'Верный фанат',desc:'Запустить игру 25 раз',xp:200,rarity:'epic',progress:s=>Math.min(1,s.gamesOpened/25),progressText:s=>`${s.gamesOpened}/25`},
{id:'set_nick',icon:'✏️',name:'Именование',desc:'Установить никнейм',xp:25,rarity:'common'},
{id:'set_avatar',icon:'🖼️',name:'Лицо с обложки',desc:'Установить аватарку',xp:50,rarity:'common'},
{id:'all_themes',icon:'🎨',name:'Экспериментатор тем',desc:'Попробовать все 4 темы',xp:100,rarity:'rare',progress:s=>Math.min(1,s.themesUsed.length/4),progressText:s=>`${s.themesUsed.length}/4`},
{id:'alarm_user',icon:'⏰',name:'По расписанию',desc:'Запустить будильник',xp:50,rarity:'common'},
{id:'speedrun',icon:'⚡',name:'Спидран',desc:'Открыть 3 игры за 1 минуту',xp:150,rarity:'epic'},
{id:'streak_3',icon:'🔥',name:'Три дня',desc:'Заходить 3 дня подряд',xp:75,rarity:'common',progress:s=>Math.min(1,s.streak.current/3),progressText:s=>`${s.streak.current}/3`},
{id:'streak_7',icon:'🔥',name:'Неделя',desc:'Заходить 7 дней подряд',xp:200,rarity:'epic',progress:s=>Math.min(1,s.streak.current/7),progressText:s=>`${s.streak.current}/7`},
{id:'streak_30',icon:'👑',name:'Месяц',desc:'Заходить 30 дней подряд',xp:1000,rarity:'legendary',progress:s=>Math.min(1,s.streak.current/30),progressText:s=>`${s.streak.current}/30`},
{id:'streak_100',icon:'🔱',name:'Сотка',desc:'Заходить 100 дней подряд',xp:5000,rarity:'legendary',progress:s=>Math.min(1,s.streak.current/100),progressText:s=>`${s.streak.current}/100`},
{id:'quest_first',icon:'📅',name:'Первое задание',desc:'Выполнить ежедневное задание',xp:50,rarity:'common'},
{id:'quest_10',icon:'📆',name:'Трудяга',desc:'Выполнить 10 заданий',xp:300,rarity:'epic',progress:s=>Math.min(1,s.questsCompletedTotal/10),progressText:s=>`${s.questsCompletedTotal}/10`},
{id:'quest_all_daily',icon:'🎁',name:'Отличник',desc:'Выполнить все 5 заданий за день',xp:250,rarity:'rare'},
{id:'favorite_add',icon:'⭐',name:'Избранное',desc:'Добавить игру в избранное',xp:25,rarity:'common'},
{id:'import_profile',icon:'📥',name:'Перенос',desc:'Импортировать профиль',xp:100,rarity:'rare'},
{id:'fullscreen',icon:'⛶',name:'На весь экран',desc:'Открыть игру в полный экран',xp:50,rarity:'common'},
{id:'case_first',icon:'📦',name:'Первая коробка',desc:'Открыть первый кейс',xp:50,rarity:'common'},
{id:'case_10',icon:'🎁',name:'Коллекционер кейсов',desc:'Открыть 10 кейсов',xp:300,rarity:'epic',progress:s=>Math.min(1,(s.caseItems?s.caseItems.length:0)/10),progressText:s=>`${s.caseItems?s.caseItems.length:0}/10`},
{id:'case_legendary',icon:'👑',name:'Легендарная находка',desc:'Получить легендарный кейс',xp:500,rarity:'legendary'},
{id:'level_25',icon:'🎖️',name:'Четверть сотни',desc:'Достичь 25 уровня',xp:500,rarity:'epic'},
{id:'level_50',icon:'🏆',name:'Полтинник',desc:'Достичь 50 уровня',xp:1500,rarity:'epic'},
{id:'level_75',icon:'🌟',name:'Семидесятипятилетний',desc:'Достичь 75 уровня',xp:3000,rarity:'legendary'},
{id:'level_100',icon:'🔴',name:'АБСОЛЮТ',desc:'Достичь 100 уровня',xp:10000,rarity:'legendary'},
{id:'veteran',icon:'🏅',name:'Ветеран',desc:'Собрать ВСЕ обычные достижения',xp:1000,rarity:'legendary',isVeteran:true},
{id:'temporal_paradox',icon:'🌀',name:'Временной парадокс',desc:'Копи время во всех играх',xp:0,rarity:'legendary',isParadox:true}];

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
{id:'q_fav_time',icon:'💫',name:'Преданность',desc:'Играй в избранную игру 5 минут',xp:150,target:300,type:'fav_time_today'}
];

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
  while (true) {
    const needed = getXpForLevel(level);
    if (consumed + needed > totalXp) break;
    consumed += needed;
    level++;
    if (level > 1000) break;
  }
  return { level, currentXp: totalXp - consumed, neededXp: getXpForLevel(level) };
}

function getParadoxLevelInfo(level) {
  let neededMinutes = PARADOX.BASE_TIME;
  for (let i = 0; i < level; i++) {
    const mult = PARADOX.TIME_MULT_START + i * PARADOX.MULT_GROWTH;
    neededMinutes *= mult;
  }
  const xp = Math.round(PARADOX.BASE_XP * Math.pow(PARADOX.XP_MULT, level - 1));
  return { minutes: Math.round(neededMinutes), xp };
}

window.LEVEL_TITLES = LEVEL_TITLES;
window.PARADOX = PARADOX;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.QUEST_POOL = QUEST_POOL;
window.getTitleForLevel = getTitleForLevel;
window.getXpForLevel = getXpForLevel;
window.getLevelFromTotalXp = getLevelFromTotalXp;
window.getParadoxLevelInfo = getParadoxLevelInfo;

console.log('[profile.js] Загружено:', ACHIEVEMENTS.length, 'достижений,', QUEST_POOL.length, 'квестов');