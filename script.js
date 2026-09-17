const LEVEL_TITLES=[
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
{min:97,max:98,title:'👽 Космический разум'},{min:99,max:100,title:'🔴 АБСОЛЮТ'},{min:101,max:999,title:'🔥🔥🔥 БОГ FireLand'}];
const PARADOX={BASE_TIME:30,XP_MULT:1.2,TIME_MULT_START:1.4,MULT_GROWTH:0.1,BASE_XP:100};
const GAMES=[
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
{id:'proryv3',name:'Прорыв 3',icon:'🌐',genre:'RPG, Стратегия, Финал',difficulty:5,description:'Финальная часть трилогии Прорыва! Выбери одну из четырёх фракций: Работник РКН, Хакер, Журналист или Инженер. Прокачивай VPN, сражайся с 25 уникальными врагами — от простого охранника до самого Максута Шадаева. Победи финального босса ЦЕНЗУРУ и освободи интернет!',bg:'linear-gradient(135deg, #c9418a, #a04ac9, #7a4ae0, #c9418a)'}];
const EXPERIMENTS=[
{id:'pastrunner',name:'ПРОШЛОЕ НАСТУПАЕТ (ПК)',icon:'🏃',genre:'Раннер, Киберпанк, 3D',difficulty:4,isExperimental:true,description:'Полноценный 3D-раннер на Three.js! Беги по киберпанк-улицам под дождём, уклоняйся от препятствий, прыгай через барьеры и скользи под блоками.',bg:'linear-gradient(135deg, #1a1a2e, #ff0044, #00ffff)'},
{id:'antcolony',name:'Ant Kolony',icon:'🐜',genre:'Симулятор, Стратегия',difficulty:3,isExperimental:true,description:'Симулятор эволюции муравьиной колонии. Наблюдай, как 150 муравьёв добывают еду, размножаются и передают гены потомкам.',bg:'linear-gradient(135deg, #1a2a1a, #ff9f2e, #2d3b48)'},
{id:'gd',name:'ПРОШЛОЕ НАСТУПАЕТ (GD)',icon:'🎵',genre:'Ритм-платформер, Киберпанк',difficulty:5,isExperimental:true,description:'Geometry Dash в мире «Прошлое наступает». Прыгай под динамичную киберпанк-музыку, уклоняйся от препятствий, собирай монеты.',bg:'linear-gradient(135deg, #8a2be2, #4a00e0, #2a008a)'},
{id:'chest',name:'Кликер счастья',icon:'🗝️',genre:'Кликер, Инкрементал',difficulty:1,isExperimental:true,description:'Простой и увлекательный кликер. Кликай, получай предметы, собирай коллекции и наблюдай, как растёт твоё счастье с каждым кликом. Экспериментальная версия.',bg:'linear-gradient(135deg, #f9d423, #ff4e50, #e83030)'}];
const GAME_FILES={
proryv1:'ИГРЫ/Прорыв.html',cooking:'ИГРЫ/Великая кулинария.html',proryv2:'ИГРЫ/Прорыв 2.html',
kontrabandist:'ИГРЫ/Космический контробандист.html',robo26:'ИГРЫ/Robo-cleaner2.0.html',
chest:'ЭКСПЕРИМЕНТЫ/Кликер счастья.html',fight:'ИГРЫ/БИТВА СИЛЬНЕЙШИХ.html',
miner:'ИГРЫ/Шахтер/Шахтер.html',musibox:'ИГРЫ/Musibox.html',
lastfrontier:'ИГРЫ/ПОСЛЕДНИЙ РУБЕЖ.html',proryv3:'ИГРЫ/Прорыв 3.html',
dom:'ИГРЫ/ДОМ.html',dom2:'ИГРЫ/ДОМ 2.html',
pastrunner:'ЭКСПЕРИМЕНТЫ/ПРОШЛОЕ НАСТУПАЕТ (пк).html',antcolony:'ЭКСПЕРИМЕНТЫ/Ant Kolony.html',
gd:'ЭКСПЕРИМЕНТЫ/ПРОШЛОЕ НАСТУПАЕТ (GD)/ПРОШЛОЕ НАСТУПАЕТ (GD).html'};
const ACHIEVEMENTS=[
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
{id:'chest_opener',icon:'🗝️',name:'Кладоискатель',desc:'Сыграть в Кликер счастья',xp:50,rarity:'common'},
{id:'fighter',icon:'👊',name:'Боец',desc:'Сыграть в Битву',xp:50,rarity:'common'},
{id:'miner_pro',icon:'⛏️',name:'Шахтёр-профи',desc:'Сыграть в Шахтёра',xp:50,rarity:'common'},
{id:'musibox_dj',icon:'🎧',name:'Диджей',desc:'Сыграть в Musibox',xp:50,rarity:'common'},
{id:'musibox_all_tracks',icon:'🎛️',name:'Полный пульт',desc:'Сыграть в Musibox',xp:75,rarity:'rare'},
{id:'zombie_survivor',icon:'🧟',name:'Выживший',desc:'Сыграть в Последний рубеж',xp:100,rarity:'rare'},
{id:'proryv3_win',icon:'🌐',name:'Финал прорыва',desc:'Сыграть в Прорыв 3',xp:150,rarity:'epic'},
{id:'proryv_trilogy',icon:'👑',name:'Хранитель трилогии',desc:'Сыграть во все три части Прорыва',xp:500,rarity:'legendary'},
{id:'gd_master',icon:'🎵',name:'Ритм-мастер',desc:'Сыграть в GD',xp:50,rarity:'common'},
{id:'first_exp',icon:'🧪',name:'Экспериментатор',desc:'Запустить первый эксперимент',xp:75,rarity:'rare'},
{id:'speed_runner',icon:'🏃',name:'Скорость света',desc:'Сыграть в 3D-раннер',xp:100,rarity:'rare'},
{id:'ant_keeper',icon:'🐜',name:'Муравьиный бог',desc:'Запустить Ant Kolony',xp:100,rarity:'rare'},
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
const QUEST_POOL=[
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
{id:'q_exp',icon:'🧪',name:'Экспериментатор',desc:'Запусти 1 эксперимент',xp:75,target:1,type:'exp_today'},
{id:'q_exp_2',icon:'🔬',name:'Лаборант',desc:'Запусти 2 эксперимента',xp:120,target:2,type:'exp_today'},
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
{id:'q_community_view',icon:'🌍',name:'Любопытный',desc:'Открой вкладку Сообщества',xp:30,target:1,type:'community_view_today'},
{id:'q_community_play',icon:'🎮',name:'Тестировщик',desc:'Сыграй в игру из Сообщества',xp:100,target:1,type:'community_play_today'},
{id:'q_community_upload',icon:'📤',name:'Автор',desc:'Загрузи игру в Сообщество',xp:150,target:1,type:'community_upload_today'},
{id:'q_case_open',icon:'📦',name:'Кейс-охотник',desc:'Открой кейс',xp:60,target:1,type:'case_today'},
{id:'q_mix_play_time',icon:'🎯',name:'Марафонец',desc:'Запусти 3 игры И проведи 10 минут',xp:250,target:2,type:'mix_today'},
{id:'q_mix_exp_ach',icon:'🌟',name:'Двойной удар',desc:'Запусти эксперимент И получи достижение',xp:200,target:2,type:'mix_today'},
{id:'q_fav_time',icon:'💫',name:'Преданность',desc:'Играй в избранную игру 5 минут',xp:150,target:300,type:'fav_time_today'}];
const DEFAULT_STATE={
playTime:{},totalTime:0,lastGameId:null,lastGameTime:null,selectedGameId:null,selectedExpId:null,
soundEnabled:true,uiSoundsEnabled:true,theme:'system',alarmVolume:0.8,alarmRepeats:5,alarmDelay:15,vibrationEnabled:true,
nickname:'Игрок',avatar:null,achievements:[],playedGames:[],gamesOpened:0,gameOpenTimes:[],themesUsed:[],alarmUsed:false,
totalXp:0,level:1,temporalParadox:{level:1,totalAccumulated:0},favorites:[],
streak:{current:0,best:0,lastLogin:null,history:[]},
dailyQuests:{date:null,quests:[],progress:{},completed:[]},questsCompletedTotal:0,
todayStats:{date:null,gamesPlayed:[],timeSpent:0,expPlayed:[],favPlayed:[],achEarned:0,favAdded:0,nickSet:false,themeChanged:false,fullscreenUsed:false,profileViewed:false,settingsViewed:false,questsViewed:false,communityViewed:false,communityPlayed:false,communityUploaded:false,favTimeSpent:0,caseOpened:0},
lastDailyReward:null,dailyRewardsClaimed:0,
lastDailyCase:null,lastWeeklyCase:null,caseItems:[],
lastSubmittedNick:null,
lastReadChatAt:null,
unreadChatCount:0,
onboardingDone:false,
myRooms:[],
myCommunityGames:0,
ownerToken:null,
_savedAt:0};
let state=JSON.parse(JSON.stringify(DEFAULT_STATE));
let isGameOpen=false;
const DB_NAME='fireland_db',DB_VERSION=1,STORE_NAME='state',STATE_KEY='main_state';
let dbInstance=null;
function openDB(){return new Promise((resolve,reject)=>{if(dbInstance)return resolve(dbInstance);const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=(e)=>{const db=e.target.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME)};req.onsuccess=(e)=>{dbInstance=e.target.result;resolve(dbInstance)};req.onerror=()=>reject(req.error)})}
async function idbGet(key){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE_NAME,'readonly');const req=tx.objectStore(STORE_NAME).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function idbSet(key,value){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE_NAME,'readwrite');const req=tx.objectStore(STORE_NAME).put(value,key);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})}
async function idbDelete(key){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE_NAME,'readwrite');const req=tx.objectStore(STORE_NAME).delete(key);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})}
let saveTimeout=null,pendingSave=false;
function saveState(immediate=false){pendingSave=true;if(immediate){clearTimeout(saveTimeout);doSaveState();return}clearTimeout(saveTimeout);saveTimeout=setTimeout(doSaveState,500)}
async function doSaveState(){if(!pendingSave)return;pendingSave=false;try{state._savedAt=Date.now();await idbSet(STATE_KEY,state);const lightState={...state};delete lightState.avatar;try{localStorage.setItem('fireland_light',JSON.stringify(lightState))}catch(e){}}catch(e){console.warn('Save failed:',e)}}

// ============================================
// OWNER TOKEN · защита ника
// ============================================
function generateOwnerToken(){
  if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();
  return 'tok_'+Date.now()+'_'+Math.random().toString(36).slice(2,12);
}

async function loadState(){
    try{
        const full=await idbGet(STATE_KEY);
        let light=null;
        try{const raw=localStorage.getItem('fireland_light')||localStorage.getItem('abdulla_games_state_no_credits');if(raw)light=JSON.parse(raw)}catch(e){}
        if(full&&light&&(light._savedAt||0)>(full._savedAt||0)){state={...DEFAULT_STATE,...light}}
        else if(full){state={...DEFAULT_STATE,...full}}
        else if(light){state={...DEFAULT_STATE,...light};await idbSet(STATE_KEY,state)}
        if(!state.temporalParadox) state.temporalParadox={level:1,totalAccumulated:0};
        if(!state.streak) state.streak={current:0,best:0,lastLogin:null,history:[]};
        if(!state.streak.history) state.streak.history=[];
        if(!state.favorites) state.favorites=[];
        if(!state.dailyQuests) state.dailyQuests={date:null,quests:[],progress:{},completed:[]};
        if(!state.todayStats) state.todayStats={date:null,gamesPlayed:[],timeSpent:0,expPlayed:[],favPlayed:[],achEarned:0,favAdded:0,nickSet:false,themeChanged:false,fullscreenUsed:false,profileViewed:false,settingsViewed:false,questsViewed:false,communityViewed:false,communityPlayed:false,communityUploaded:false,favTimeSpent:0,caseOpened:0};
        if(state.todayStats.communityViewed===undefined) state.todayStats.communityViewed=false;
        if(state.todayStats.communityPlayed===undefined) state.todayStats.communityPlayed=false;
        if(state.todayStats.communityUploaded===undefined) state.todayStats.communityUploaded=false;
        if(state.lastDailyReward===undefined) state.lastDailyReward=null;
        if(state.dailyRewardsClaimed===undefined) state.dailyRewardsClaimed=0;
        if(state.lastDailyCase===undefined) state.lastDailyCase=null;
        if(state.lastWeeklyCase===undefined) state.lastWeeklyCase=null;
        if(!state.caseItems) state.caseItems=[];
        if(state.uiSoundsEnabled===undefined) state.uiSoundsEnabled=true;
        if(state.lastSubmittedNick===undefined) state.lastSubmittedNick=null;
        if(state.lastReadChatAt===undefined) state.lastReadChatAt=null;
        if(state.unreadChatCount===undefined) state.unreadChatCount=0;
        if(state.onboardingDone===undefined) state.onboardingDone=false;
        if(!state.myRooms) state.myRooms=[];
        if(state.myCommunityGames===undefined) state.myCommunityGames=0;
        if(state.theme==='dark'||state.theme==='blue') state.theme='system';
        // OWNER TOKEN
        if(!state.ownerToken){
            state.ownerToken=generateOwnerToken();
            saveState(true);
            console.log('[Owner] Токен создан:', state.ownerToken);
        }
    }catch(e){console.warn('Load failed:',e)}
}
function todayStr(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dateStr(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function getTitleForLevel(level){const t=LEVEL_TITLES.find(t=>level>=t.min&&level<=t.max);return t?t.title:'🔥🔥🔥 БОГ FireLand'}
function getXpForLevel(level){if(level<=20)return 100+(level-1)*50;if(level<=50)return 1050+(level-20)*100;if(level<=80)return 4050+(level-50)*200;if(level<=95)return 10050+(level-80)*500;return 17550+(level-95)*1000}
function getLevelFromTotalXp(totalXp){let level=1,consumed=0;while(true){const needed=getXpForLevel(level);if(consumed+needed>totalXp)break;consumed+=needed;level++;if(level>1000)break}return {level,currentXp:totalXp-consumed,neededXp:getXpForLevel(level)}}
function getParadoxLevelInfo(level){let neededMinutes=PARADOX.BASE_TIME;for(let i=0;i<level;i++){const mult=PARADOX.TIME_MULT_START+i*PARADOX.MULT_GROWTH;neededMinutes*=mult}const xp=Math.round(PARADOX.BASE_XP*Math.pow(PARADOX.XP_MULT,level-1));return {minutes:Math.round(neededMinutes),xp}}
function formatTime(sec){const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;if(h>0)return `${h}ч ${m}м`;if(m>0)return `${m}м ${s}с`;return `${s}с`}
let audioCtx=null;
function getAudioCtx(){if(!audioCtx){try{audioCtx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function playTone(freq,duration,type='sine',volume=0.15,delay=0){if(!state.uiSoundsEnabled)return;if(!state.soundEnabled)return;const ctx=getAudioCtx();if(!ctx)return;try{const now=ctx.currentTime+delay;const osc=ctx.createOscillator();const gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(0.001,now);gain.gain.exponentialRampToValueAtTime(volume,now+0.01);gain.gain.exponentialRampToValueAtTime(0.001,now+duration);osc.start(now);osc.stop(now+duration)}catch(e){}}
const SOUNDS={
click(){playTone(880,0.06,'sine',0.08)},
achievement(){playTone(659,0.15,'sine',0.15,0);playTone(880,0.15,'sine',0.15,0.08);playTone(1175,0.25,'sine',0.15,0.16)},
quest(){playTone(523,0.12,'sine',0.12,0);playTone(784,0.18,'sine',0.12,0.1)},
levelup(){playTone(523,0.15,'triangle',0.15,0);playTone(659,0.15,'triangle',0.15,0.12);playTone(784,0.15,'triangle',0.15,0.24);playTone(1047,0.4,'triangle',0.18,0.36)},
reward(){playTone(1047,0.1,'sine',0.15,0);playTone(1319,0.1,'sine',0.15,0.08);playTone(1568,0.3,'sine',0.15,0.16)},
caseOpen(){playTone(200,0.3,'sawtooth',0.1,0);playTone(400,0.3,'sawtooth',0.08,0.15);playTone(800,0.5,'sawtooth',0.05,0.3)},
error(){playTone(220,0.15,'square',0.1)}};
document.addEventListener('click',(e)=>{if(e.target.closest('button')||e.target.closest('.game-card')||e.target.closest('.tab-btn')||e.target.closest('.community-card')){SOUNDS.click()}},true);
const DAILY_REWARDS=[50,100,200,400,800,1500];
function getDailyRewardAmount(streakDay){const idx=Math.min(streakDay-1,DAILY_REWARDS.length-1);return DAILY_REWARDS[idx]}
function checkDailyReward(){
    const today=todayStr();
    if(state.lastDailyReward===today)return;
    const streakDay=state.streak.current||1;
    const xp=getDailyRewardAmount(streakDay);
    const streakBonus=streakDay>0&&streakDay%7===0?500:0;
    document.getElementById('dailyRewardTitle').textContent=`🔥 День ${streakDay}`;
    document.getElementById('dailyRewardSub').textContent=streakBonus>0?`🎉 Недельный бонус: ещё +${streakBonus} XP!`:'Ежедневная награда';
    document.getElementById('dailyRewardXp').textContent=`+${xp+streakBonus} XP`;
    const bar=document.getElementById('dailyRewardStreakBar');
    bar.innerHTML='';
    for(let i=1;i<=7;i++){const dot=document.createElement('div');dot.className='streak-dot';const dayInWeek=((streakDay-1)%7)+1;if(i<dayInWeek)dot.classList.add('active');else if(i===dayInWeek)dot.classList.add('active','today');dot.textContent=i;bar.appendChild(dot)}
    document.getElementById('dailyRewardModal').classList.add('show');
    SOUNDS.reward();
    state.lastDailyReward=today;
    state.dailyRewardsClaimed=(state.dailyRewardsClaimed||0)+1;
    state.totalXp+=xp+streakBonus;
    saveState();
    updateLevelDisplay();
    renderStats();
    const lvlInfo=getLevelFromTotalXp(state.totalXp);
    if(lvlInfo.level>state.level){state.level=lvlInfo.level;setTimeout(()=>{SOUNDS.levelup();showLevelUpToast(state.level)},800)}
    checkLevelAchievements()}
document.getElementById('dailyRewardClaimBtn').addEventListener('click',()=>{document.getElementById('dailyRewardModal').classList.remove('show');SOUNDS.click()});
const CASE_REWARDS={
common:[{icon:'💰',name:'+100 XP',type:'xp',value:100},{icon:'💵',name:'+150 XP',type:'xp',value:150},{icon:'💎',name:'+200 XP',type:'xp',value:200}],
rare:[{icon:'💠',name:'+400 XP',type:'xp',value:400},{icon:'🎯',name:'+500 XP',type:'xp',value:500},{icon:'📈',name:'+600 XP',type:'xp',value:600}],
epic:[{icon:'🌟',name:'+1000 XP',type:'xp',value:1000},{icon:'💫',name:'+1500 XP',type:'xp',value:1500},{icon:'🎆',name:'+2000 XP',type:'xp',value:2000}],
legendary:[{icon:'👑',name:'+3000 XP',type:'xp',value:3000},{icon:'🔥',name:'+4000 XP',type:'xp',value:4000},{icon:'💎',name:'+5000 XP',type:'xp',value:5000}]};
function getWeekStart(){const now=new Date();const dayOfWeek=(now.getDay()+6)%7;const monday=new Date(now);monday.setDate(now.getDate()-dayOfWeek);monday.setHours(0,0,0,0);return dateStr(monday)}
function canOpenDailyCase(){return state.lastDailyCase!==todayStr()}
function canOpenWeeklyCase(){return state.lastWeeklyCase!==getWeekStart()}
function openCase(type){
    if(type==='daily'&&!canOpenDailyCase()){SOUNDS.error();alert('📦 Ежедневный кейс уже открыт сегодня!\nВозвращайся завтра.');return}
    if(type==='weekly'&&!canOpenWeeklyCase()){SOUNDS.error();alert('🎁 Недельный кейс уже открыт на этой неделе!\nЖди следующий понедельник.');return}
    let rarity;
    if(type==='weekly'){rarity=Math.random()<0.6?'epic':'legendary'}
    else{const roll=Math.random();if(roll<0.6)rarity='common';else if(roll<0.9)rarity='rare';else if(roll<0.99)rarity='epic';else rarity='legendary'}
    const pool=CASE_REWARDS[rarity];
    const reward=pool[Math.floor(Math.random()*pool.length)];
    const modal=document.getElementById('caseOpenModal');
    const revealIcon=document.getElementById('caseRevealIcon');
    const revealTitle=document.getElementById('caseRevealTitle');
    const revealReward=document.getElementById('caseRevealReward');
    const revealRarity=document.getElementById('caseRevealRarity');
    modal.classList.add('show');
    revealIcon.textContent='📦';
    revealTitle.textContent='Открываем...';
    revealReward.textContent='';
    revealRarity.style.display='none';
    SOUNDS.caseOpen();
    setTimeout(()=>{
        revealIcon.textContent=reward.icon;
        revealTitle.textContent='Ты получил:';
        revealReward.textContent=reward.name;
        revealRarity.className='case-reveal-rarity '+rarity;
        revealRarity.textContent={common:'ОБЫЧНОЕ',rare:'РЕДКОЕ',epic:'ЭПИЧЕСКОЕ',legendary:'ЛЕГЕНДАРНОЕ'}[rarity];
        revealRarity.style.display='inline-block';
        if(reward.type==='xp')state.totalXp+=reward.value;
        state.caseItems=state.caseItems||[];
        state.caseItems.push({type:type,rarity:rarity,reward:reward.name,date:todayStr(),timestamp:Date.now()});
        if(type==='daily')state.lastDailyCase=todayStr();else state.lastWeeklyCase=getWeekStart();
        if(state.todayStats)state.todayStats.caseOpened=(state.todayStats.caseOpened||0)+1;
        saveState();
        unlockAch('case_first');
        if(state.caseItems.length>=10)unlockAch('case_10');
        if(rarity==='legendary')unlockAch('case_legendary');
        if(rarity==='legendary'){SOUNDS.levelup()}else if(rarity==='epic'){SOUNDS.reward()}else{SOUNDS.quest()}
        updateLevelDisplay();
        renderStats();
        updateQuestProgress();
        const lvlInfo=getLevelFromTotalXp(state.totalXp);
        if(lvlInfo.level>state.level){state.level=lvlInfo.level;setTimeout(()=>{SOUNDS.levelup();showLevelUpToast(state.level)},800)}
        checkLevelAchievements();
        renderCases();
    },1000)}
document.getElementById('caseRevealCloseBtn').addEventListener('click',()=>{document.getElementById('caseOpenModal').classList.remove('show');SOUNDS.click()});
document.getElementById('openDailyCaseBtn').addEventListener('click',()=>openCase('daily'));
document.getElementById('openWeeklyCaseBtn').addEventListener('click',()=>openCase('weekly'));
function renderCases(){
    const dailyBtn=document.getElementById('openDailyCaseBtn');
    const weeklyBtn=document.getElementById('openWeeklyCaseBtn');
    const dailyTimer=document.getElementById('dailyCaseTimer');
    const weeklyTimer=document.getElementById('weeklyCaseTimer');
    if(!dailyBtn)return;
    if(canOpenDailyCase()){dailyBtn.disabled=false;dailyBtn.textContent='✨ Открыть';dailyTimer.textContent='✅ Доступен'}
    else{dailyBtn.disabled=true;dailyBtn.textContent='❌ Открыт';dailyTimer.textContent='⏰ Завтра'}
    if(canOpenWeeklyCase()){weeklyBtn.disabled=false;weeklyBtn.textContent='✨ Открыть';weeklyTimer.textContent='✅ Доступен'}
    else{weeklyBtn.disabled=true;weeklyBtn.textContent='❌ Открыт';weeklyTimer.textContent='⏰ В понедельник'}}
function updateStreak(){
    const today=todayStr();const s=state.streak;
    if(s.lastLogin===today)return;
    const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
    const yStr=dateStr(yesterday);
    if(s.lastLogin===yStr)s.current+=1;else s.current=1;
    s.lastLogin=today;
    if(s.current>s.best)s.best=s.current;
    if(!s.history)s.history=[];
    if(!s.history.includes(today))s.history.push(today);
    if(s.history.length>365)s.history=s.history.slice(-365);
    if(s.current>=3)unlockAch('streak_3');
    if(s.current>=7)unlockAch('streak_7');
    if(s.current>=30)unlockAch('streak_30');
    if(s.current>=100)unlockAch('streak_100');
    renderStreak();
    saveState();
    setTimeout(()=>checkDailyReward(),1000);
    if(state.lastSubmittedNick&&typeof submitScore==='function')setTimeout(submitScore,2000);
}
function renderStreak(){const el=document.getElementById('streakCount');if(el)el.textContent=state.streak.current}
function renderCalendar(){
    const grid=document.getElementById('calendarGrid');
    if(!grid)return;
    grid.innerHTML='';
    const now=new Date();
    const today=todayStr();
    const year=now.getFullYear();
    const month=now.getMonth();
    const firstDay=new Date(year,month,1);
    const lastDay=new Date(year,month+1,0);
    let startWeekday=firstDay.getDay();
    if(startWeekday===0)startWeekday=7;
    startWeekday-=1;
    for(let i=0;i<startWeekday;i++){const empty=document.createElement('div');empty.className='calendar-day empty';grid.appendChild(empty)}
    const history=state.streak.history||[];
    for(let d=1;d<=lastDay.getDate();d++){
        const dateObj=new Date(year,month,d);
        const dStr=dateStr(dateObj);
        const cell=document.createElement('div');
        cell.className='calendar-day';
        cell.textContent=d;
        if(history.includes(dStr))cell.classList.add('active');
        if(dStr===today)cell.classList.add('today');
        if(dateObj>now&&dStr!==today)cell.classList.add('future');
        grid.appendChild(cell)}
    document.getElementById('calCurrent').textContent=state.streak.current;
    document.getElementById('calBest').textContent=state.streak.best}
function checkDailyQuests(){
    const today=todayStr();
    if(state.dailyQuests.date===today)return;
    const shuffled=[...QUEST_POOL].sort(()=>Math.random()-0.5);
    const quests=shuffled.slice(0,5);
    state.dailyQuests={date:today,quests:quests.map(q=>q.id),progress:{},completed:[]};
    state.todayStats={date:today,gamesPlayed:[],timeSpent:0,expPlayed:[],favPlayed:[],achEarned:0,favAdded:0,nickSet:false,themeChanged:false,fullscreenUsed:false,profileViewed:false,settingsViewed:false,questsViewed:false,communityViewed:false,communityPlayed:false,communityUploaded:false,favTimeSpent:0,caseOpened:0};
    saveState()}
function updateQuestProgress(){
    const today=todayStr();
    if(!state.todayStats||state.todayStats.date!==today){state.todayStats={date:today,gamesPlayed:[],timeSpent:0,expPlayed:[],favPlayed:[],achEarned:0,favAdded:0,nickSet:false,themeChanged:false,fullscreenUsed:false,profileViewed:false,settingsViewed:false,questsViewed:false,communityViewed:false,communityPlayed:false,communityUploaded:false,favTimeSpent:0,caseOpened:0}}
    let changed=false;
    state.dailyQuests.quests.forEach(qId=>{
        const quest=QUEST_POOL.find(q=>q.id===qId);
        if(!quest)return;
        if(state.dailyQuests.completed.includes(qId))return;
        let progress=0;
        switch(quest.type){
            case 'games_today':progress=state.todayStats.gamesPlayed.length;break;
            case 'time_today':progress=state.todayStats.timeSpent;break;
            case 'exp_today':progress=state.todayStats.expPlayed.length;break;
            case 'fav_today':progress=state.todayStats.favPlayed.length;break;
            case 'ach_today':progress=state.todayStats.achEarned;break;
            case 'fav_add_today':progress=state.todayStats.favAdded;break;
            case 'nick_set_today':progress=state.todayStats.nickSet?1:0;break;
            case 'theme_change_today':progress=state.todayStats.themeChanged?1:0;break;
            case 'fullscreen_today':progress=state.todayStats.fullscreenUsed?1:0;break;
            case 'profile_view_today':progress=state.todayStats.profileViewed?1:0;break;
            case 'settings_view_today':progress=state.todayStats.settingsViewed?1:0;break;
            case 'quests_view_today':progress=state.todayStats.questsViewed?1:0;break;
            case 'community_view_today':progress=state.todayStats.communityViewed?1:0;break;
            case 'community_play_today':progress=state.todayStats.communityPlayed?1:0;break;
            case 'community_upload_today':progress=state.todayStats.communityUploaded?1:0;break;
            case 'fav_time_today':progress=state.todayStats.favTimeSpent;break;
            case 'case_today':progress=state.todayStats.caseOpened||0;break;
            case 'mix_today':{
                if(quest.id==='q_mix_play_time'){const c1=state.todayStats.gamesPlayed.length>=3?1:0;const c2=state.todayStats.timeSpent>=600?1:0;progress=c1+c2}
                else if(quest.id==='q_mix_exp_ach'){const c1=state.todayStats.expPlayed.length>=1?1:0;const c2=state.todayStats.achEarned>=1?1:0;progress=c1+c2}
                break}}
        const oldProgress=state.dailyQuests.progress[qId]||0;
        if(oldProgress!==progress){state.dailyQuests.progress[qId]=progress;changed=true}
        if(progress>=quest.target){
            state.dailyQuests.completed.push(qId);
            state.totalXp+=quest.xp;
            state.questsCompletedTotal=(state.questsCompletedTotal||0)+1;
            unlockAch('quest_first');
            if(state.questsCompletedTotal>=10)unlockAch('quest_10');
            showQuestCompleteToast(quest);
            changed=true;
            if(state.dailyQuests.completed.length===state.dailyQuests.quests.length){setTimeout(()=>{state.totalXp+=200;unlockAch('quest_all_daily');showDailyBonusToast();saveState();checkVeteran()},1000)}}});
    if(changed){saveState();checkVeteran();const questsTab=document.getElementById('tab-quests');if(questsTab&&questsTab.classList.contains('active'))renderQuests()}}
function renderQuests(){
    const panel=document.getElementById('questsPanel');
    if(!panel)return;
    panel.innerHTML='';
    const today=todayStr();
    if(state.dailyQuests.date!==today)checkDailyQuests();
    state.dailyQuests.quests.forEach((qId)=>{
        const quest=QUEST_POOL.find(q=>q.id===qId);
        if(!quest)return;
        const completed=state.dailyQuests.completed.includes(qId);
        const progress=state.dailyQuests.progress[qId]||0;
        const percent=Math.min(100,(progress/quest.target)*100);
        const card=document.createElement('div');
        card.className='quest-card'+(completed?' completed':'');
        card.innerHTML=`<div class="quest-icon">${quest.icon}</div><div class="quest-info"><div class="quest-name">${quest.name}</div><div class="quest-desc">${quest.desc}</div><div class="quest-progress-bg"><div class="quest-progress-fill" style="width:${percent}%"></div></div></div><div class="quest-xp">+${quest.xp}</div>`;
        panel.appendChild(card)});
    document.getElementById('questsCompletedCount').textContent=state.dailyQuests.completed.length}
function renderQuestTimer(){
    const el=document.getElementById('questResetTimer');
    if(!el)return;
    const now=new Date();
    const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);tomorrow.setHours(0,0,0,0);
    const diff=Math.floor((tomorrow-now)/1000);
    const h=Math.floor(diff/3600),m=Math.floor((diff%3600)/60),s=diff%60;
    el.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
setInterval(renderQuestTimer,1000);
function showQuestCompleteToast(quest){
    SOUNDS.quest();
    const toast=document.createElement('div');
    toast.style.cssText=`position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:14px 28px;border-radius:22px;font-weight:800;font-family:'Manrope',sans-serif;z-index:99999;box-shadow:0 10px 40px rgba(34,197,94,0.5);display:flex;align-items:center;gap:12px;animation:toastIn 0.4s ease;border:2px solid rgba(255,255,255,0.3);`;
    toast.innerHTML=`<span style="font-size:32px">${quest.icon}</span><div><div style="font-size:11px;opacity:0.85;letter-spacing:1px;">📅 ЗАДАНИЕ ВЫПОЛНЕНО</div><div style="font-size:16px;margin-top:2px">${quest.name}</div><div style="font-size:11px;opacity:0.9;margin-top:2px">+${quest.xp} XP</div></div>`;
    document.body.appendChild(toast);
    setTimeout(()=>{toast.style.transition='all 0.4s ease';toast.style.opacity='0';setTimeout(()=>toast.remove(),400)},4000)}
function showDailyBonusToast(){
    SOUNDS.reward();
    const toast=document.createElement('div');
    toast.style.cssText=`position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#fbbf24,#f59e0b,#22c55e,#16a34a);color:#060a1a;padding:32px 56px;border-radius:28px;font-family:'Manrope',sans-serif;text-align:center;z-index:999999;box-shadow:0 0 80px rgba(251,191,36,0.8);border:4px solid #ffffff;animation:modalIn 0.6s ease;`;
    toast.innerHTML=`<div style="font-size:70px;">🎁</div><div style="font-size:28px;font-weight:900;margin:12px 0 6px;">ВСЕ ЗАДАНИЯ ВЫПОЛНЕНЫ!</div><div style="font-size:16px;font-weight:800;opacity:0.9;">+200 XP бонусом</div>`;
    document.body.appendChild(toast);
    setTimeout(()=>{toast.style.transition='all 0.5s ease';toast.style.opacity='0';setTimeout(()=>toast.remove(),500)},4000)}
function buildAnimatedLogo(){
    document.getElementById('logoLauncher').textContent='Лаунчер';
    document.getElementById('logoFireland').textContent='FireLand'}
function getSmartTheme(){const h=new Date().getHours();return (h>=7&&h<19)?'light':'default'}
function applyTheme(){
    let theme=state.theme;
    if(theme==='smart')theme=getSmartTheme();
    document.body.className='';
    if(theme==='system')document.body.classList.add('theme-system');
    else if(theme==='default')document.body.classList.add('theme-default');
    else document.body.classList.add('theme-'+theme);
    document.querySelectorAll('.theme-btn').forEach(btn=>{btn.classList.toggle('active',btn.dataset.theme===state.theme)});
    updateParticleColors();
    if(!state.themesUsed.includes(state.theme)){state.themesUsed.push(state.theme);saveState();if(state.themesUsed.length>=4)unlockAch('all_themes')}}
setInterval(()=>{if(state.theme==='smart')applyTheme()},60000);
function updateClock(){
    const now=new Date();
    document.getElementById('hours').textContent=String(now.getHours()).padStart(2,'0');
    document.getElementById('minutes').textContent=String(now.getMinutes()).padStart(2,'0')}
setInterval(updateClock,10000);
let tickInterval=null;
let lastTickTime=0;
function startTimeTicker(gameId){
    if(tickInterval)clearInterval(tickInterval);
    lastTickTime=Date.now();
    tickInterval=setInterval(()=>{
        const now=Date.now();
        const elapsed=Math.floor((now-lastTickTime)/1000);
        if(elapsed<1)return;
        const cappedElapsed=Math.min(elapsed,5);
        lastTickTime+=cappedElapsed*1000;
        state.totalTime+=cappedElapsed;
        if(!state.playTime[gameId])state.playTime[gameId]=0;
        state.playTime[gameId]+=cappedElapsed;
        state.temporalParadox.totalAccumulated+=cappedElapsed;
        checkParadox();
        const today=todayStr();
        if(!state.todayStats||state.todayStats.date!==today){state.todayStats={date:today,gamesPlayed:[],timeSpent:0,expPlayed:[],favPlayed:[],achEarned:0,favAdded:0,nickSet:false,themeChanged:false,fullscreenUsed:false,profileViewed:false,settingsViewed:false,questsViewed:false,communityViewed:false,communityPlayed:false,communityUploaded:false,favTimeSpent:0,caseOpened:0}}
        state.todayStats.timeSpent+=cappedElapsed;
        if(state.favorites.includes(gameId))state.todayStats.favTimeSpent=(state.todayStats.favTimeSpent||0)+cappedElapsed;
        const totalMin=Math.floor(state.totalTime/60);
        if(totalMin>=1)unlockAch('time_1min');
        if(totalMin>=10)unlockAch('time_10min');
        if(totalMin>=30)unlockAch('time_30min');
        if(totalMin>=60)unlockAch('time_1hour');
        if(totalMin>=300)unlockAch('time_5hours');
        const h=new Date().getHours();
        if(h>=0&&h<5)unlockAch('night_owl');
        if(h>=5&&h<7)unlockAch('early_bird');
        if(h>=12&&h<14)unlockAch('lunch_time');
        updateQuestProgress();
        updateLastGameBar();
        updateLevelDisplay();
        checkLevelAchievements();
        saveState();
    },1000)}
function stopTimeTicker(){if(tickInterval)clearInterval(tickInterval)}
function checkParadox(){
    let guard=0;const MAX_ITERATIONS=100;let changed=false;
    while(guard++<MAX_ITERATIONS){
        const p=state.temporalParadox;
        const info=getParadoxLevelInfo(p.level);
        const neededSeconds=info.minutes*60;
        if(p.totalAccumulated<neededSeconds)break;
        p.totalAccumulated-=neededSeconds;
        state.totalXp+=info.xp;
        p.level++;
        changed=true;
        const lvlInfo=getLevelFromTotalXp(state.totalXp);
        const oldLevel=state.level;
        state.level=lvlInfo.level;
        showParadoxToast(p.level-1,info.xp);
        if(state.level>oldLevel)setTimeout(()=>showLevelUpToast(state.level),800)}
    if(changed){const pm=document.getElementById('profileModal');if(pm&&pm.classList.contains('show'))renderAchievements()}}
function checkLevelAchievements(){
    if(state.level>=25)unlockAch('level_25');
    if(state.level>=50)unlockAch('level_50');
    if(state.level>=75)unlockAch('level_75');
    if(state.level>=100)unlockAch('level_100')}
function unlockAch(id){
    if(state.achievements.includes(id))return;
    if(id==='veteran'||id==='temporal_paradox')return;
    state.achievements.push(id);
    const ach=ACHIEVEMENTS.find(a=>a.id===id);
    if(ach&&ach.xp)state.totalXp+=ach.xp;
    const today=todayStr();
    if(state.todayStats&&state.todayStats.date===today){state.todayStats.achEarned=(state.todayStats.achEarned||0)+1}
    checkVeteran();
    const lvlInfo=getLevelFromTotalXp(state.totalXp);
    const oldLevel=state.level;
    state.level=lvlInfo.level;
    saveState();
    showAchToast(id);
    if(state.level>oldLevel)setTimeout(()=>showLevelUpToast(state.level),500);
    checkLevelAchievements();
    const pm=document.getElementById('profileModal');
    if(pm&&pm.classList.contains('show'))renderAchievements();
    renderStats();
    updateLevelDisplay();
    if(state.lastSubmittedNick&&typeof submitScore==='function')setTimeout(submitScore,1000);
}
function checkVeteran(){
    if(state.achievements.includes('veteran'))return;
    const allOthers=ACHIEVEMENTS.filter(a=>!a.isVeteran&&!a.isParadox);
    const allEarned=allOthers.every(a=>state.achievements.includes(a.id));
    if(allEarned){state.achievements.push('veteran');state.totalXp+=1000;setTimeout(()=>showVeteranToast(),1000)}}
function showAchToast(id){
    const ach=ACHIEVEMENTS.find(a=>a.id===id);
    if(!ach)return;
    SOUNDS.achievement();
    const rarity=ach.rarity||'common';
    const gradients={common:'linear-gradient(135deg,#6a8aff,#4a6aff)',rare:'linear-gradient(135deg,#22b8cf,#0c8599)',epic:'linear-gradient(135deg,#a855f7,#7e22ce)',legendary:'linear-gradient(135deg,#fbbf24,#f59e0b,#fbbf24)'};
    const bg=ach.isVeteran?'linear-gradient(135deg,#ff00ff,#ff8c00,#6a8aff)':(gradients[rarity]||gradients.common);
    const rarityText={common:'ОБЫЧНОЕ',rare:'РЕДКОЕ',epic:'ЭПИЧЕСКОЕ',legendary:'🌟 ЛЕГЕНДАРНОЕ'};
    const toast=document.createElement('div');
    toast.style.cssText=`position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:14px 28px;border-radius:22px;font-weight:800;font-family:'Manrope',sans-serif;z-index:99999;box-shadow:0 10px 40px rgba(0,0,0,0.5);display:flex;align-items:center;gap:12px;animation:toastIn 0.4s ease;border:2px solid rgba(255,255,255,0.3);max-width:400px;`;
    toast.innerHTML=`<span style="font-size:32px">${ach.icon}</span><div><div style="font-size:11px;opacity:0.85;letter-spacing:1px;font-weight:700">🏆 ${ach.isVeteran?'ЛЕГЕНДАРНОЕ':rarityText[rarity]} ДОСТИЖЕНИЕ</div><div style="font-size:16px;margin-top:2px">${ach.name}</div><div style="font-size:11px;opacity:0.85;margin-top:2px">${ach.desc} <span style="color:#fff;font-weight:900">+${ach.xp} XP</span></div></div>`;
    document.body.appendChild(toast);
    setTimeout(()=>{toast.style.transition='all 0.4s ease';toast.style.opacity='0';setTimeout(()=>toast.remove(),400)},ach.isVeteran?5000:3500)}
function showParadoxToast(level,xp){
    const toast=document.createElement('div');
    toast.style.cssText=`position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#ffffff;padding:16px 32px;border-radius:24px;font-weight:800;font-family:'Manrope',sans-serif;z-index:99999;box-shadow:0 10px 50px rgba(6,182,212,0.6);display:flex;align-items:center;gap:14px;border:2px solid rgba(255,255,255,0.4);animation:toastIn 0.4s ease;`;
    toast.innerHTML=`<span style="font-size:36px">🌀</span><div><div style="font-size:11px;opacity:0.85;letter-spacing:1.5px;font-weight:800">⏳ ВРЕМЕННОЙ ПАРАДОКС</div><div style="font-size:17px;margin-top:2px">Уровень ${level} пройден!</div><div style="font-size:12px;opacity:0.9;margin-top:2px">Награда: <span style="color:#fbbf24;font-weight:900">+${xp} XP</span></div></div>`;
    document.body.appendChild(toast);
    setTimeout(()=>{toast.style.transition='all 0.4s ease';toast.style.opacity='0';setTimeout(()=>toast.remove(),400)},5000)}
function showVeteranToast(){
    const toast=document.createElement('div');
    toast.style.cssText=`position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#ff00ff,#ff8c00,#fbbf24,#6a8aff);color:#060a1a;padding:40px 60px;border-radius:32px;font-family:'Manrope',sans-serif;text-align:center;z-index:999999;box-shadow:0 0 100px rgba(255,0,255,0.8);border:4px solid #ffffff;max-width:90vw;animation:modalIn 0.5s ease;`;
    toast.innerHTML=`<div style="font-size:80px;">🏅</div><div style="font-size:36px;font-weight:900;margin:16px 0 8px;letter-spacing:3px;">ВЕТЕРАН</div><div style="font-size:16px;font-weight:800;opacity:0.9;">Ты собрал ВСЕ достижения!</div><div style="font-size:22px;font-weight:900;margin-top:12px;">+1000 XP</div>`;
    document.body.appendChild(toast);
    setTimeout(()=>{toast.style.transition='all 0.5s ease';toast.style.opacity='0';setTimeout(()=>toast.remove(),500)},6000)}
function showLevelUpToast(level){
    const title=getTitleForLevel(level);
    SOUNDS.levelup();
    const toast=document.createElement('div');
    toast.style.cssText=`position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#fbbf24,#6a8aff);color:#060a1a;padding:24px 48px;border-radius:24px;font-family:'Manrope',sans-serif;text-align:center;z-index:999998;box-shadow:0 10px 60px rgba(251,191,36,0.6);border:3px solid rgba(255,255,255,0.4);animation:modalIn 0.5s ease;`;
    toast.innerHTML=`<div style="font-size:48px;">⭐</div><div style="font-size:14px;font-weight:700;opacity:0.8;letter-spacing:2px;">НОВЫЙ УРОВЕНЬ</div><div style="font-size:48px;font-weight:900;margin:8px 0;">${level}</div><div style="font-size:18px;font-weight:800;">${title}</div>`;
    document.body.appendChild(toast);
    setTimeout(()=>{toast.style.transition='all 0.4s ease';toast.style.opacity='0';setTimeout(()=>toast.remove(),400)},3000)}
function checkGameAchievements(gameId){
    const isExp=EXPERIMENTS.some(e=>e.id===gameId);
    const isCommunity=gameId && String(gameId).startsWith('community_');
    const today=todayStr();
    if(!state.todayStats||state.todayStats.date!==today){state.todayStats={date:today,gamesPlayed:[],timeSpent:0,expPlayed:[],favPlayed:[],achEarned:0,favAdded:0,nickSet:false,themeChanged:false,fullscreenUsed:false,profileViewed:false,settingsViewed:false,questsViewed:false,communityViewed:false,communityPlayed:false,communityUploaded:false,favTimeSpent:0,caseOpened:0}}
    if(isExp){
        unlockAch('first_exp');
        if(!state.todayStats.expPlayed.includes(gameId))state.todayStats.expPlayed.push(gameId);
        if(gameId==='pastrunner')unlockAch('speed_runner');
        if(gameId==='antcolony')unlockAch('ant_keeper')}
    if(isCommunity){
        unlockAch('play_community');
        state.todayStats.communityPlayed=true;
    }
    if(state.favorites.includes(gameId)){if(!state.todayStats.favPlayed.includes(gameId))state.todayStats.favPlayed.push(gameId)}
    if(!state.todayStats.gamesPlayed.includes(gameId))state.todayStats.gamesPlayed.push(gameId);
    if(!state.playedGames.includes(gameId)){
        state.playedGames.push(gameId);
        unlockAch('first_game');
        if(state.playedGames.length>=5)unlockAch('five_games');
        if(state.playedGames.length>=GAMES.length)unlockAch('all_games');
        const gameAch={proryv1:'proryv1_win',dom:'dom_escape',dom2:'dom2_burner',cooking:'cooking_chef',proryv2:'proryv2_win',kontrabandist:'cosmo_pilot',robo26:'robo_hunter',chest:'chest_opener',fight:'fighter',miner:'miner_pro',gd:'gd_master',musibox:'musibox_dj',lastfrontier:'zombie_survivor',proryv3:'proryv3_win'};
        if(gameAch[gameId])unlockAch(gameAch[gameId]);
        if(state.playedGames.includes('proryv1')&&state.playedGames.includes('proryv2')&&state.playedGames.includes('proryv3'))unlockAch('proryv_trilogy');
    }
    state.gamesOpened=(state.gamesOpened||0)+1;
    if(state.gamesOpened>=5)unlockAch('repeat_5');
    if(state.gamesOpened>=25)unlockAch('repeat_25');
    const now=Date.now();
    state.gameOpenTimes=(state.gameOpenTimes||[]).filter(t=>now-t<60000);
    state.gameOpenTimes.push(now);
    if(state.gameOpenTimes.length>=3)unlockAch('speedrun');
    updateQuestProgress();
    saveState()}
function createParticles(){
    const c=document.getElementById('bgParticles');
    c.innerHTML='';
    for(let i=0;i<12;i++){const s=Math.random()*4+2;const p=document.createElement('div');p.className='bg-particle';p.style.width=s+'px';p.style.height=s+'px';p.style.left=Math.random()*100+'%';p.style.animationDuration=(Math.random()*20+30)+'s';p.style.animationDelay=(Math.random()*30)+'s';c.appendChild(p)}}
function createStars(){
    const c=document.getElementById('starsBg');
    c.innerHTML='';
    for(let i=0;i<20;i++){const s=Math.random()*2+1;const st=document.createElement('div');st.className='star';st.style.width=s+'px';st.style.height=s+'px';st.style.left=Math.random()*100+'%';st.style.top=Math.random()*100+'%';st.style.animationDelay=(Math.random()*3)+'s';st.style.animationDuration=(Math.random()*2+4)+'s';c.appendChild(st)}}
function updateParticleColors(){
    const ps=document.querySelectorAll('.bg-particle');
    const isLight=document.body.classList.contains('theme-light')||(document.body.classList.contains('theme-system')&&window.matchMedia('(prefers-color-scheme: light)').matches);
    const color=isLight?'rgba(74,106,255,0.18)':'rgba(106,138,255,0.35)';
    ps.forEach(p=>{p.style.background=color})}
function toggleFavorite(gameId,event){
    if(event)event.stopPropagation();
    const idx=state.favorites.indexOf(gameId);
    if(idx>=0)state.favorites.splice(idx,1);
    else{state.favorites.push(gameId);unlockAch('favorite_add');if(state.todayStats)state.todayStats.favAdded=(state.todayStats.favAdded||0)+1;updateQuestProgress()}
    saveState();
    renderGames();
    renderExperiments();
    if(typeof renderCommunityGames==='function')renderCommunityGames();}
function selectGame(gameId){
    const game=GAMES.find(g=>g.id===gameId);
    if(!game)return;
    state.selectedGameId=gameId;
    saveState();
    document.querySelectorAll('#gameGrid .game-card').forEach(card=>{card.classList.toggle('selected',card.dataset.gameId===gameId)});
    document.getElementById('noGameSelected').style.display='none';
    const detailEl=document.getElementById('gameDetail');
    detailEl.style.display='flex';
    const stars='⭐'.repeat(game.difficulty)+'☆'.repeat(5-game.difficulty);
    const playedTime=state.playTime[gameId]||0;
    const timeStr=playedTime>0?formatTime(playedTime):'не играл';
    const isFav=state.favorites.includes(gameId);
    detailEl.innerHTML=`<div class="icon">${game.icon}</div><div class="name">${game.name}</div><div class="genre">🎭 ${game.genre}</div><div class="difficulty">${stars}</div><div class="description">${game.description}</div><div style="font-size:14px;color:var(--text-secondary);font-weight:600;margin-bottom:14px;">⏱️ Проведено времени: <span style="color:var(--accent-secondary)">${timeStr}</span></div><div style="display:flex;gap:10px;align-items:center;"><button class="play-btn" id="playFromDetail">🎮 Играть</button><button class="fav-btn-detail" id="favFromDetail" style="background:${isFav?'var(--accent-secondary)':'var(--bg-card)'};border:1px solid var(--border);color:${isFav?'#060a1a':'var(--text)'};padding:16px 20px;border-radius:40px;font-size:22px;cursor:pointer;">${isFav?'⭐':'☆'}</button></div>`;
    document.getElementById('playFromDetail').addEventListener('click',()=>openGame(gameId));
    document.getElementById('favFromDetail').addEventListener('click',(e)=>{toggleFavorite(gameId,e);selectGame(gameId)})}
function selectExperiment(expId){
    const exp=EXPERIMENTS.find(e=>e.id===expId);
    if(!exp)return;
    state.selectedExpId=expId;
    saveState();
    document.querySelectorAll('#expGrid .game-card').forEach(card=>{card.classList.toggle('selected',card.dataset.gameId===expId)});
    document.getElementById('noExpSelected').style.display='none';
    const detailEl=document.getElementById('expDetail');
    detailEl.style.display='flex';
    const stars='⭐'.repeat(exp.difficulty)+'☆'.repeat(5-exp.difficulty);
    const playedTime=state.playTime[expId]||0;
    const timeStr=playedTime>0?formatTime(playedTime):'не играл';
    const isFav=state.favorites.includes(expId);
    detailEl.innerHTML=`<div class="icon">${exp.icon}</div><div class="name">${exp.name}</div><div class="genre">🎭 ${exp.genre}</div><div class="difficulty">${stars}</div><div class="description">${exp.description}</div><div style="font-size:14px;color:var(--text-secondary);font-weight:600;margin-bottom:14px;">⏱️ Проведено времени: <span style="color:var(--accent-secondary)">${timeStr}</span></div><div style="display:flex;gap:10px;align-items:center;"><button class="play-btn exp-play-btn" id="playFromDetailExp">🧪 Запустить</button><button class="fav-btn-detail" id="favFromDetailExp" style="background:${isFav?'var(--accent-secondary)':'var(--bg-card)'};border:1px solid var(--border);color:${isFav?'#060a1a':'var(--text)'};padding:16px 20px;border-radius:40px;font-size:22px;cursor:pointer;">${isFav?'⭐':'☆'}</button></div>`;
    document.getElementById('playFromDetailExp').addEventListener('click',()=>openGame(expId));
    document.getElementById('favFromDetailExp').addEventListener('click',(e)=>{toggleFavorite(expId,e);selectExperiment(expId)})}
function clearSelection(){
    state.selectedGameId=null;
    state.selectedExpId=null;
    saveState();
    document.querySelectorAll('.game-card').forEach(card=>card.classList.remove('selected'));
    document.getElementById('noGameSelected').style.display='flex';
    document.getElementById('gameDetail').style.display='none';
    document.getElementById('noExpSelected').style.display='flex';
    document.getElementById('expDetail').style.display='none'}
function renderGames(){
    const grid=document.getElementById('gameGrid');
    grid.innerHTML='';
    const filtered=[...GAMES].sort((a,b)=>{const af=state.favorites.includes(a.id)?0:1;const bf=state.favorites.includes(b.id)?0:1;return af-bf});
    document.getElementById('gamesCount').textContent=filtered.length;
    filtered.forEach(game=>{grid.appendChild(createGameCard(game,false))})}
function renderExperiments(){
    const grid=document.getElementById('expGrid');
    grid.innerHTML='';
    const filtered=[...EXPERIMENTS].sort((a,b)=>{const af=state.favorites.includes(a.id)?0:1;const bf=state.favorites.includes(b.id)?0:1;return af-bf});
    document.getElementById('expCount').textContent=filtered.length;
    filtered.forEach(exp=>{grid.appendChild(createGameCard(exp,true))})}
function createGameCard(game,isExp){
    const card=document.createElement('div');
    card.className='game-card'+(isExp?' exp-card':'');
    card.dataset.gameId=game.id;
    const isSelected=isExp?(state.selectedExpId===game.id):(state.selectedGameId===game.id);
    if(isSelected)card.classList.add('selected');
    const isFav=state.favorites.includes(game.id);
    card.innerHTML=`${isExp?'<div class="exp-badge">ЭКСПЕРИМЕНТ</div>':''}<button class="fav-btn ${isFav?'active':''}" data-fav-id="${game.id}">${isFav?'⭐':'☆'}</button><div class="card-bg" style="background:${game.bg};"></div><div class="card-content"><span class="icon">${game.icon}</span><div class="name">${game.name}</div></div>`;
    card.addEventListener('click',(e)=>{if(e.target.closest('.fav-btn'))return;isExp?selectExperiment(game.id):selectGame(game.id)});
    card.querySelector('.fav-btn').addEventListener('click',(e)=>{toggleFavorite(game.id,e)});
    return card}
let hoverTimer=null,menuHideTimer=null,backBtnListenersAdded=false,isMenuVisible=false,isMenuOpen=false;
let currentGameStartTime=0,sessionXpStart=0,sessionAchEarned=[],sessionStartTotalTime=0;
let menuRafPending=false;
function checkGameMenuVisibility(e){
    if(!isGameOpen)return;
    if(menuRafPending)return;
    menuRafPending=true;
    requestAnimationFrame(()=>{
        menuRafPending=false;
        const wrapper=document.getElementById('gameMenuWrapper');
        const dropdown=document.getElementById('gameMenuDropdown');
        if(!wrapper||!dropdown)return;
        const isInTopZone=e.clientX<80&&e.clientY<80;
        if(isInTopZone){
            if(!isMenuVisible){isMenuVisible=true;wrapper.classList.add('visible')}
            clearTimeout(menuHideTimer)}
        else{
            if(isMenuOpen)return;
            clearTimeout(menuHideTimer);
            menuHideTimer=setTimeout(()=>{
                if(isMenuOpen)return;
                wrapper.classList.remove('visible');
                isMenuVisible=false;
            },5000)}
    })}
function addGameMenuListeners(){if(backBtnListenersAdded)return;document.addEventListener('mousemove',checkGameMenuVisibility);backBtnListenersAdded=true}
function removeGameMenuListeners(){
    document.removeEventListener('mousemove',checkGameMenuVisibility);
    backBtnListenersAdded=false;
    const wrapper=document.getElementById('gameMenuWrapper');
    const dropdown=document.getElementById('gameMenuDropdown');
    if(wrapper)wrapper.classList.remove('visible');
    if(dropdown)dropdown.classList.remove('open');
    isMenuVisible=false;isMenuOpen=false;
    clearTimeout(menuHideTimer)}
document.getElementById('gameMenuTrigger').addEventListener('click',(e)=>{
    e.stopPropagation();
    const dropdown=document.getElementById('gameMenuDropdown');
    const wrapper=document.getElementById('gameMenuWrapper');
    if(!isMenuVisible){isMenuVisible=true;wrapper.classList.add('visible')}
    isMenuOpen=!isMenuOpen;
    dropdown.classList.toggle('open',isMenuOpen);
    if(isMenuOpen)clearTimeout(menuHideTimer)});
document.getElementById('menuReloadBtn').addEventListener('click',()=>{
    if(!state.lastGameId)return;
    const iframe=document.getElementById('gameIframe');
    const file=GAME_FILES[state.lastGameId];
    if(!file)return;
    closeGameMenu();
    showGameSkeleton();
    currentGameStartTime=Date.now();
    sessionStartTotalTime=state.totalTime;
    sessionXpStart=state.totalXp;
    sessionAchEarned=[];
    try{iframe.src='about:blank'}catch(e){}
    requestAnimationFrame(()=>{iframe.src=file})});
document.getElementById('menuBackBtn').addEventListener('click',()=>{closeGameMenu();closeGame()});
document.getElementById('menuFullscreenBtn').addEventListener('click',()=>{
    const el=document.getElementById('gameFrameContainer');
    if(!document.fullscreenElement){
        (el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen).call(el);
        unlockAch('fullscreen');
        if(state.todayStats)state.todayStats.fullscreenUsed=true;
        updateQuestProgress()}
    else{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}});
document.getElementById('menuSettingsBtn').addEventListener('click',()=>{
    closeGameMenu();
    settingsModal.classList.add('show');
    renderStats();
    loadSettings();
    if(state.todayStats)state.todayStats.settingsViewed=true;
    updateQuestProgress()});
function closeGameMenu(){const dropdown=document.getElementById('gameMenuDropdown');if(dropdown)dropdown.classList.remove('open');isMenuOpen=false}
document.addEventListener('click',(e)=>{if(!isMenuOpen)return;const wrapper=document.getElementById('gameMenuWrapper');if(wrapper&&!wrapper.contains(e.target))closeGameMenu()});
document.addEventListener('fullscreenchange',()=>{const btn=document.getElementById('menuFullscreenBtn');if(!btn)return;const isFull=!!document.fullscreenElement;const menuText=btn.querySelector('.menu-text');if(menuText)menuText.textContent=isFull?'Выйти из полного экрана':'Полный экран'});
function showGameSkeleton(){const sk=document.getElementById('gameSkeleton');if(sk){sk.classList.remove('hidden');sk.style.display='flex'}}
function hideGameSkeleton(){const sk=document.getElementById('gameSkeleton');if(sk){sk.classList.add('hidden');setTimeout(()=>{sk.style.display='none'},400)}}
function openGame(gameId){
    const container=document.getElementById('gameFrameContainer');
    const iframe=document.getElementById('gameIframe');
    const file=GAME_FILES[gameId];
    if(!file){alert('❌ Файл игры не найден: '+gameId);return}
    state.lastGameId=gameId;
    state.lastGameTime=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    currentGameStartTime=Date.now();
    sessionStartTotalTime=state.totalTime;
    sessionXpStart=state.totalXp;
    sessionAchEarned=[];
    saveState();
    updateLastGameBar();
    checkGameAchievements(gameId);
    const achBefore=new Set(state.achievements);
    hideMascot();
    document.body.classList.add('game-active');
    showGameSkeleton();
    try{iframe.src='about:blank'}catch(e){}
    // FIX: сбрасываем старые обработчики
    iframe.onload=null;
    iframe.onerror=null;
    // FIX: снимаем sandbox для встроенных игр (они доверенные)
    iframe.removeAttribute('sandbox');
    let loadHandled=false;
    const onLoad=()=>{if(loadHandled)return;loadHandled=true;hideGameSkeleton()};
    iframe.onload=onLoad;
    iframe.onerror=onLoad;
    requestAnimationFrame(()=>{iframe.src=file});
    container.style.display='block';
    isGameOpen=true;
    setTimeout(()=>{if(isGameOpen)hideGameSkeleton()},4000);
    startTimeTicker(gameId);
    addGameMenuListeners();
    const achTrackInterval=setInterval(()=>{
        if(!isGameOpen){clearInterval(achTrackInterval);return}
        state.achievements.forEach(id=>{
            if(!achBefore.has(id)&&!sessionAchEarned.includes(id))sessionAchEarned.push(id)})},1000)}
function closeGame(){
    if(!isGameOpen)return;
    document.body.classList.remove('game-active');
    const container=document.getElementById('gameFrameContainer');
    const iframe=document.getElementById('gameIframe');
    const sessionTime=Math.floor((Date.now()-currentGameStartTime)/1000);
    const trackedSessionTime=Math.max(0,state.totalTime-(sessionStartTotalTime||0));
    const missedTime=Math.max(0,sessionTime-trackedSessionTime);
    if(missedTime>0&&missedTime<3600){
        state.totalTime+=missedTime;
        if(state.lastGameId&&state.playTime[state.lastGameId]){state.playTime[state.lastGameId]+=missedTime}}
    const sessionXp=state.totalXp-sessionXpStart;
    container.style.display='none';
    iframe.src='about:blank';
    isGameOpen=false;
    stopTimeTicker();
    removeGameMenuListeners();
    hideGameSkeleton();
    showMascot();
    if(sessionTime>=5)showPostGameScreen(state.lastGameId,sessionTime,sessionXp,sessionAchEarned);
    saveState(true)}
let lastPlayedGameId=null;
function showPostGameScreen(gameId,sessionTime,xpGained,achEarned){
    const ALL=[...GAMES,...EXPERIMENTS];
    let game=ALL.find(g=>g.id===gameId);
    if(!game && gameId && String(gameId).startsWith('community_')){
        game={icon:'🌍',name:'Игра из Сообщества'};
    }
    if(!game)return;
    lastPlayedGameId=gameId;
    document.getElementById('pgIcon').textContent=game.icon;
    document.getElementById('pgName').textContent=game.name;
    const mm=Math.floor(sessionTime/60),ss=sessionTime%60;
    document.getElementById('pgSessionTime').textContent=mm>0?`${mm}м ${ss}с`:`${ss}с`;
    document.getElementById('pgXpGained').textContent='+'+Math.max(0,xpGained);
    document.getElementById('pgAchGained').textContent=achEarned.length;
    const achInfo=document.getElementById('pgAchInfo');
    if(achEarned.length>0){
        const names=achEarned.map(id=>{const a=ACHIEVEMENTS.find(x=>x.id===id);return a?`${a.icon} ${a.name}`:''}).filter(Boolean);
        achInfo.innerHTML=`<b>🏆 Новые достижения:</b><br>${names.join('<br>')}`;
        achInfo.style.display='block'}
    else{achInfo.style.display='none'}
    document.getElementById('postGameModal').classList.add('show')}
function updateLastGameBar(){
    const bar=document.getElementById('lastGameBar');
    const icon=document.getElementById('lastGameIcon');
    const name=document.getElementById('lastGameName');
    const time=document.getElementById('lastGameTime');
    const playBtn=document.getElementById('lastGamePlayBtn');
    if(state.lastGameId){
        const ALL=[...GAMES,...EXPERIMENTS];
        let game=ALL.find(g=>g.id===state.lastGameId);
        if(!game && String(state.lastGameId).startsWith('community_')){
            game={icon:'🌍',name:'Игра из Сообщества',id:state.lastGameId};
        }
        if(game){icon.textContent=game.icon;name.textContent=game.name;time.textContent=state.lastGameTime?`⏱️ ${state.lastGameTime}`:'';bar.classList.add('show');playBtn.onclick=()=>openGame(game.id);return}}
    bar.classList.remove('show')}
function renderProfile(){
    const nick=state.nickname||'Игрок';
    document.getElementById('profileNickInput').value=nick;
    const avBig=document.getElementById('profileBigAvatar');
    if(state.avatar){avBig.innerHTML=`<img src="${state.avatar}" alt="">`}
    else{avBig.textContent='👤';avBig.style.background='linear-gradient(135deg, #6a8aff, #a78bfa)'}}
function updateLevelDisplay(){
    const lvlInfo=getLevelFromTotalXp(state.totalXp);
    const title=getTitleForLevel(lvlInfo.level);
    const percent=(lvlInfo.currentXp/lvlInfo.neededXp)*100;
    document.getElementById('levelNumHeader').textContent=lvlInfo.level;
    document.getElementById('levelTitleHeader').textContent=title;
    document.getElementById('levelXpHeader').textContent=`${lvlInfo.currentXp} / ${lvlInfo.neededXp} XP`;
    const badge=document.getElementById('levelHeaderBadge');
    if(badge)badge.style.setProperty('--xp-percent',percent+'%');
    document.getElementById('levelNumBig').textContent=lvlInfo.level;
    document.getElementById('levelTitleBig').textContent=title;
    document.getElementById('levelSubtitleBig').textContent=`Следующий уровень: ${lvlInfo.neededXp-lvlInfo.currentXp} XP`;
    document.getElementById('xpBarFill').style.width=percent+'%';
    document.getElementById('xpText').textContent=`${lvlInfo.currentXp} / ${lvlInfo.neededXp} XP • Всего: ${state.totalXp}`}
function renderAchievements(){
    const grid=document.getElementById('achievementsGrid');
    grid.innerHTML='';
    ACHIEVEMENTS.forEach(ach=>{
        if(ach.isParadox){renderParadoxCard(grid,ach);return}
        const earned=state.achievements.includes(ach.id);
        const el=document.createElement('div');
        el.className='achievement'+(earned?' earned':'')+(ach.isVeteran?' veteran':'');
        el.dataset.rarity=ach.rarity||'common';
        let progressHtml='';
        if(!earned&&ach.progress){
            const p=Math.min(1,ach.progress(state));
            const txt=ach.progressText?ach.progressText(state):'';
            progressHtml=`<div class="ach-progress"><div class="ach-progress-fill" style="width:${p*100}%"></div></div><div style="font-size:10px;color:var(--text-secondary);margin-top:2px;">${txt}</div>`}
        el.innerHTML=`<div class="ach-icon">${ach.icon}</div><div class="ach-info"><div class="ach-name">${ach.name}</div><div class="ach-desc">${ach.desc}</div>${progressHtml}</div><div class="ach-xp">+${ach.xp}</div>`;
        grid.appendChild(el)});
    const totalNormal=ACHIEVEMENTS.filter(a=>!a.isParadox).length;
    const earnedNormal=state.achievements.filter(id=>id!=='temporal_paradox').length;
    const text=earnedNormal+'/'+totalNormal;
    document.getElementById('achCount').textContent=text;
    document.getElementById('achCountHeader').textContent=text}
function renderParadoxCard(grid,ach){
    const p=state.temporalParadox;
    const info=getParadoxLevelInfo(p.level);
    const neededSeconds=info.minutes*60;
    const percent=Math.min(100,(p.totalAccumulated/neededSeconds)*100);
    const el=document.createElement('div');
    el.className='achievement paradox earned';
    el.dataset.rarity='legendary';
    el.innerHTML=`<div class="ach-icon">${ach.icon}</div><div class="ach-info"><div class="ach-name">${ach.name} — Уровень ${p.level}</div><div class="ach-desc">Прогресс: ${formatTime(p.totalAccumulated)} / ${formatTime(neededSeconds)}</div><div class="ach-progress"><div class="ach-progress-fill" style="width:${percent}%"></div></div></div><div class="ach-xp">+${info.xp}</div>`;
    grid.appendChild(el)}
function renderRecords(){
    const list=document.getElementById('recordsList');
    list.innerHTML='';
    const sorted=Object.entries(state.playTime).sort((a,b)=>b[1]-a[1]);
    if(sorted.length===0){list.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-secondary);font-weight:600;">Пока нет рекордов — сыграй в игру!</div>';return}
    const ALL=[...GAMES,...EXPERIMENTS];
    sorted.forEach(([gameId,seconds])=>{
        let game=ALL.find(g=>g.id===gameId);
        if(!game && String(gameId).startsWith('community_')){game={icon:'🌍',name:'Игра из Сообщества'}}
        if(!game)return;
        const row=document.createElement('div');
        row.className='record-row';
        row.innerHTML=`<div class="rec-game"><span class="rec-icon">${game.icon}</span><span class="rec-name">${game.name}</span></div><span class="rec-time">${formatTime(seconds)}</span>`;
        list.appendChild(row)})}
async function exportProfile(){
    const data={version:22,exportedAt:new Date().toISOString(),state:state};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`fireland_profile_${state.nickname||'player'}_${todayStr()}.json`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const toast=document.createElement('div');
    toast.style.cssText=`position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:14px 28px;border-radius:22px;font-weight:800;font-family:'Manrope';z-index:99999;animation:toastIn 0.4s ease;`;
    toast.textContent='💾 Профиль экспортирован!';
    document.body.appendChild(toast);
    setTimeout(()=>{toast.style.opacity='0';setTimeout(()=>toast.remove(),400)},2500)}
function importProfile(){document.getElementById('importProfileInput').click()}
document.getElementById('importProfileInput').addEventListener('change',async(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    try{
        const text=await file.text();
        const data=JSON.parse(text);
        if(!data.state)throw new Error('Неверный формат');
        if(!confirm(`📥 Импортировать профиль?\n\nТекущий прогресс будет ЗАМЕНЁН.`)){e.target.value='';return}
        state={...DEFAULT_STATE,...data.state};
        await idbSet(STATE_KEY,state);
        renderGames();renderExperiments();updateLastGameBar();renderProfile();
        renderAchievements();renderRecords();renderStats();renderQuests();
        renderStreak();updateLevelDisplay();applyTheme();renderCases();
        if(typeof updateChatBadge==='function')updateChatBadge();
        unlockAch('import_profile');
        const toast=document.createElement('div');
        toast.style.cssText=`position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;padding:14px 28px;border-radius:22px;font-weight:800;font-family:'Manrope';z-index:99999;animation:toastIn 0.4s ease;`;
        toast.textContent='📥 Профиль успешно импортирован!';
        document.body.appendChild(toast);
        setTimeout(()=>{toast.style.opacity='0';setTimeout(()=>toast.remove(),400)},2500)}
    catch(err){alert('❌ Ошибка импорта: '+err.message)}
    e.target.value=''});
const alarmModal=document.getElementById('alarmModal');
const alarmCloseBtn=document.getElementById('alarmCloseBtn');
const alarmToggleBtn=document.getElementById('alarmToggleBtn');
const alarmIndicator=document.getElementById('alarmIndicator');
const alarmSecondsSlider=document.getElementById('alarmSecondsSlider');
const alarmSecondsValue=document.getElementById('alarmSecondsValue');
const alarmMinutesSlider=document.getElementById('alarmMinutesSlider');
const alarmMinutesValue=document.getElementById('alarmMinutesValue');
const alarmHoursSlider=document.getElementById('alarmHoursSlider');
const alarmHoursValue=document.getElementById('alarmHoursValue');
const alarmStartBtn=document.getElementById('alarmStartBtn');
const alarmCancelBtn=document.getElementById('alarmCancelBtn');
const alarmStatus=document.getElementById('alarmStatus');
const alarmVolumeSlider=document.getElementById('alarmVolumeSlider');
const alarmVolumeValue=document.getElementById('alarmVolumeValue');
const alarmRepeatsSlider=document.getElementById('alarmRepeatsSlider');
const alarmRepeatsValue=document.getElementById('alarmRepeatsValue');
const alarmDelaySlider=document.getElementById('alarmDelaySlider');
const alarmDelayValue=document.getElementById('alarmDelayValue');
const vibrationToggle=document.getElementById('vibrationToggle');
let alarmEndTime=null,alarmIntervalId=null,alarmIsRinging=false;
function loadAlarmSettings(){
    alarmVolumeSlider.value=state.alarmVolume;
    alarmVolumeValue.textContent=Math.round(state.alarmVolume*100)+'%';
    alarmRepeatsSlider.value=state.alarmRepeats;
    alarmRepeatsValue.textContent=state.alarmRepeats;
    alarmDelaySlider.value=state.alarmDelay;
    alarmDelayValue.textContent=state.alarmDelay+'с';
    vibrationToggle.checked=state.vibrationEnabled}
alarmVolumeSlider.addEventListener('input',()=>{state.alarmVolume=parseFloat(alarmVolumeSlider.value);alarmVolumeValue.textContent=Math.round(state.alarmVolume*100)+'%';saveState()});
alarmRepeatsSlider.addEventListener('input',()=>{state.alarmRepeats=parseInt(alarmRepeatsSlider.value);alarmRepeatsValue.textContent=state.alarmRepeats;saveState()});
alarmDelaySlider.addEventListener('input',()=>{state.alarmDelay=parseInt(alarmDelaySlider.value);alarmDelayValue.textContent=state.alarmDelay+'с';saveState()});
vibrationToggle.addEventListener('change',()=>{state.vibrationEnabled=vibrationToggle.checked;saveState()});
alarmSecondsSlider.addEventListener('input',()=>{alarmSecondsValue.textContent=alarmSecondsSlider.value;updateAlarmDisplay()});
alarmMinutesSlider.addEventListener('input',()=>{alarmMinutesValue.textContent=alarmMinutesSlider.value;updateAlarmDisplay()});
alarmHoursSlider.addEventListener('input',()=>{alarmHoursValue.textContent=alarmHoursSlider.value;updateAlarmDisplay()});
alarmToggleBtn.addEventListener('click',()=>{
    alarmModal.classList.add('show');
    alarmHoursSlider.value=0;alarmMinutesSlider.value=0;alarmSecondsSlider.value=5;
    alarmHoursValue.textContent='0';alarmMinutesValue.textContent='0';alarmSecondsValue.textContent='5';
    updateAlarmDisplay();loadAlarmSettings()});
alarmCloseBtn.addEventListener('click',()=>alarmModal.classList.remove('show'));
alarmModal.addEventListener('click',(e)=>{if(e.target===alarmModal)alarmModal.classList.remove('show')});
function getAlarmTotalSeconds(){
    const h=parseInt(alarmHoursSlider.value)||0;
    const m=parseInt(alarmMinutesSlider.value)||0;
    const s=parseInt(alarmSecondsSlider.value)||0;
    return h*3600+m*60+s}
function playAlarmSound(){
    if(!state.soundEnabled)return;
    try{
        const ctx=new (window.AudioContext||window.webkitAudioContext)();
        const now=ctx.currentTime;
        [523,659,784].forEach((freq,i)=>{
            const osc=ctx.createOscillator();
            const gain=ctx.createGain();
            osc.connect(gain);gain.connect(ctx.destination);
            osc.type='sine';osc.frequency.value=freq;
            gain.gain.setValueAtTime(state.alarmVolume*0.3,now+i*0.15);
            gain.gain.exponentialRampToValueAtTime(0.001,now+i*0.15+0.2);
            osc.start(now+i*0.15);osc.stop(now+i*0.15+0.2)})
    }catch(e){}}
function vibrateDevice(){if(!state.vibrationEnabled)return;try{if(navigator.vibrate)navigator.vibrate(200)}catch(e){}}
function alarmRing(){
    if(alarmIsRinging)return;
    alarmIsRinging=true;
    alarmStatus.textContent='🔔 БУДИЛЬНИК!';
    alarmStatus.classList.add('alarm-status-ringing');
    alarmIndicator.classList.add('active');
    vibrateDevice();
    let ringCount=0;
    const totalRings=state.alarmRepeats;
    const delayMs=state.alarmDelay*1000;
    let ringInterval=null;
    function doRing(){
        if(ringCount>=totalRings){
            if(ringInterval)clearInterval(ringInterval);
            alarmStatus.classList.remove('alarm-status-ringing');
            alarmIsRinging=false;
            alarmIndicator.classList.remove('active');
            return}
        playAlarmSound();vibrateDevice();ringCount++}
    doRing();
    ringInterval=setInterval(doRing,delayMs)}
function updateAlarmDisplay(){
    if(!alarmEndTime){
        const total=getAlarmTotalSeconds();
        const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
        alarmStatus.textContent=`⏳ ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        return}
    const diff=Math.max(0,Math.floor((alarmEndTime-Date.now())/1000));
    if(diff<=0){
        alarmRing();
        alarmEndTime=null;
        clearInterval(alarmIntervalId);
        alarmIntervalId=null;
        alarmStatus.textContent='🔔 БУДИЛЬНИК!';
        return}
    const h=Math.floor(diff/3600),m=Math.floor((diff%3600)/60),s=diff%60;
    alarmStatus.textContent=`⏳ ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function startAlarm(){
    const totalSecs=getAlarmTotalSeconds();
    if(totalSecs<1){alert('❌ Минимум 1 секунда!');return}
    if(alarmIntervalId)clearInterval(alarmIntervalId);
    alarmEndTime=Date.now()+totalSecs*1000;
    alarmIsRinging=false;
    alarmStatus.classList.remove('alarm-status-ringing');
    alarmIndicator.classList.add('active');
    alarmStartBtn.style.display='none';
    alarmCancelBtn.style.display='inline-block';
    alarmIntervalId=setInterval(updateAlarmDisplay,1000);
    updateAlarmDisplay();
    if(!state.alarmUsed){state.alarmUsed=true;saveState();unlockAch('alarm_user')}}
function cancelAlarm(){
    if(alarmIntervalId)clearInterval(alarmIntervalId);
    alarmIntervalId=null;
    alarmEndTime=null;
    alarmIsRinging=false;
    alarmStatus.classList.remove('alarm-status-ringing');
    alarmIndicator.classList.remove('active');
    alarmStartBtn.style.display='inline-block';
    alarmCancelBtn.style.display='none';
    updateAlarmDisplay()}
alarmStartBtn.addEventListener('click',startAlarm);
alarmCancelBtn.addEventListener('click',cancelAlarm);
const settingsModal=document.getElementById('settingsModal');
const settingsGearBtn=document.getElementById('settingsGearBtn');
const settingsCloseBtn=document.getElementById('settingsCloseBtn');
const soundToggle=document.getElementById('soundToggle');
const uiSoundsToggle=document.getElementById('uiSoundsToggle');
function loadSettings(){
    soundToggle.checked=state.soundEnabled;
    if(uiSoundsToggle)uiSoundsToggle.checked=state.uiSoundsEnabled!==false;
    window.isSoundEnabled=state.soundEnabled;
    applyTheme();
    loadAlarmSettings()}
soundToggle.addEventListener('change',()=>{state.soundEnabled=soundToggle.checked;window.isSoundEnabled=state.soundEnabled;saveState()});
if(uiSoundsToggle){uiSoundsToggle.addEventListener('change',()=>{state.uiSoundsEnabled=uiSoundsToggle.checked;saveState();if(state.uiSoundsEnabled)SOUNDS.click()})}
document.querySelectorAll('.theme-btn').forEach(btn=>{btn.addEventListener('click',()=>{state.theme=btn.dataset.theme;applyTheme();if(state.todayStats)state.todayStats.themeChanged=true;updateQuestProgress();saveState()})});
settingsGearBtn.addEventListener('click',()=>{settingsModal.classList.add('show');renderStats();loadSettings();if(state.todayStats)state.todayStats.settingsViewed=true;updateQuestProgress()});
settingsCloseBtn.addEventListener('click',()=>settingsModal.classList.remove('show'));
settingsModal.addEventListener('click',(e)=>{if(e.target===settingsModal)settingsModal.classList.remove('show')});
const profileModal=document.getElementById('profileModal');
const profileCloseBtn=document.getElementById('profileCloseBtn');
const profileNickInput=document.getElementById('profileNickInput');
const profileBigAvatar=document.getElementById('profileBigAvatar');
const avatarFileInput=document.getElementById('avatarFileInput');
document.getElementById('levelHeaderBadge').addEventListener('click',()=>{renderProfile();renderAchievements();renderRecords();renderStats();updateLevelDisplay();renderCases();profileModal.classList.add('show');if(state.todayStats)state.todayStats.profileViewed=true;updateQuestProgress()});
profileCloseBtn.addEventListener('click',()=>profileModal.classList.remove('show'));
profileModal.addEventListener('click',(e)=>{if(e.target===profileModal)profileModal.classList.remove('show')});
profileNickInput.addEventListener('input',()=>{
    state.nickname=profileNickInput.value.trim()||'Игрок';
    saveState();
    if(state.nickname!=='Игрок'){
        unlockAch('set_nick');
        if(state.todayStats)state.todayStats.nickSet=true;
        updateQuestProgress();
    }
    if(typeof updateChatBadge==='function')updateChatBadge();
    if(typeof window.debouncedPresenceRefresh==='function')window.debouncedPresenceRefresh();
    const hint=document.getElementById('profileNickHint');
    if(hint){
        hint.classList.remove('saved','error');
        hint.textContent='Нажми 💾, чтобы сохранить ник в таблицу лидеров';
    }
});

// ============================================
// СОХРАНЕНИЕ НИКА С ПЕРЕНОСОМ
// ============================================
document.getElementById('profileNickSaveBtn').addEventListener('click',async()=>{
    const btn=document.getElementById('profileNickSaveBtn');
    const hint=document.getElementById('profileNickHint');
    const newNick=(state.nickname||'').trim();
    const oldNick=state.lastSubmittedNick;

    if(!newNick||newNick==='Игрок'){
        if(hint){hint.textContent='Сначала введи ник';hint.classList.add('error')}
        return;
    }

    btn.disabled=true;
    btn.textContent='⏳';

    let result;
    if(oldNick && oldNick!==newNick){
        // Переносим ник везде
        result=await renameNickEverywhere(oldNick,newNick,state.ownerToken);
    }else{
        // Просто сохраняем
        result=await saveNickname();
    }

    btn.disabled=false;
    btn.textContent='💾';

    if(result && result.ok){
        btn.classList.add('saved');
        if(hint){
            hint.textContent='✅ Ник сохранён'+(oldNick&&oldNick!==newNick?' (прогресс перенесён)':'');
            hint.classList.remove('error');
            hint.classList.add('saved');
        }
        setTimeout(()=>{
            if(hint){hint.textContent='Нажми 💾, чтобы сохранить ник в таблицу лидеров';hint.classList.remove('saved')}
            btn.classList.remove('saved');
        },4000);
        if(typeof window.reinitializePresenceWithNewNick==='function')window.reinitializePresenceWithNewNick();
    }else{
        btn.classList.add('error');
        const msg=result&&result.message?result.message:'Ошибка';
        if(hint){hint.textContent='❌ '+msg;hint.classList.remove('saved');hint.classList.add('error')}
        setTimeout(()=>btn.classList.remove('error'),4000);
    }
});

async function renameNickEverywhere(oldNick,newNick,token){
    try{
        const res=await fetch(`${SUPABASE_URL}/rest/v1/rpc/rename_nick_everywhere`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'apikey':SUPABASE_ANON_KEY,
                'Authorization':`Bearer ${SUPABASE_ANON_KEY}`,
            },
            body:JSON.stringify({
                p_old_nick:oldNick,
                p_new_nick:newNick,
                p_owner_token:token||'',
            }),
        });
        if(!res.ok){
            const err=await res.text();
            console.warn('[Rename] Ошибка:',res.status,err);
            return {ok:false,message:'Ошибка сервера'};
        }
        const data=await res.json();
        if(!data.ok){
            if(data.error==='NICK_TAKEN')return {ok:false,message:'Этот ник занят другим игроком'};
            if(data.error==='NOT_OWNER')return {ok:false,message:'Не твой ник'};
            if(data.error==='OLD_NOT_FOUND'){
                // старого нет — просто сохраняем новый
                return await saveNickname();
            }
            return {ok:false,message:data.error||'Ошибка'};
        }
        state.lastSubmittedNick=newNick;
        saveState(true);
        // Очищаем кеши чата, чтобы всё перерисовалось с новым ником
        if(typeof CHAT!=='undefined'){
            CHAT.dmList=[];
            CHAT.historyLoaded={};
            CHAT.reactions={};
            CHAT.subscribed={};
            // Если были в ЛС — переключаемся в general
            if(CHAT.currentRoom && CHAT.currentRoom.startsWith('dm_')){
                if(typeof switchRoom==='function')switchRoom('general');
            }else if(typeof renderDmList==='function'){
                renderDmList();
            }
        }
        // Перезагружаем лидерборд
        if(typeof refreshLeaderboard==='function')setTimeout(refreshLeaderboard,500);
        // Перезагружаем community
        if(typeof loadCommunityGames==='function')setTimeout(loadCommunityGames,500);
        return {ok:true};
    }catch(e){
        console.warn('[Rename] сеть:',e);
        return {ok:false,message:'Нет интернета'};
    }
}

profileBigAvatar.addEventListener('click',()=>avatarFileInput.click());
avatarFileInput.addEventListener('change',async(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    const compressed=await compressAvatar(file,256);
    if(compressed){
        state.avatar=compressed;
        saveState();
        renderProfile();
        unlockAch('set_avatar');
        if(typeof window.reinitializePresenceWithNewNick==='function')window.reinitializePresenceWithNewNick();
    }});
function compressAvatar(file,maxSize){
    return new Promise((resolve)=>{
        const reader=new FileReader();
        reader.onload=(ev)=>{
            const img=new Image();
            img.onload=()=>{
                try{
                    const canvas=document.createElement('canvas');
                    const ratio=Math.min(maxSize/img.width,maxSize/img.height,1);
                    canvas.width=Math.round(img.width*ratio);
                    canvas.height=Math.round(img.height*ratio);
                    const ctx=canvas.getContext('2d');
                    ctx.drawImage(img,0,0,canvas.width,canvas.height);
                    resolve(canvas.toDataURL('image/jpeg',0.7))
                }catch(e){resolve(ev.target.result)}
            };
            img.onerror=()=>resolve(null);
            img.src=ev.target.result};
        reader.onerror=()=>resolve(null);
        reader.readAsDataURL(file)})}
document.getElementById('profileExportBtn').addEventListener('click',exportProfile);
document.getElementById('profileImportBtn').addEventListener('click',importProfile);
const calendarModal=document.getElementById('calendarModal');
const calendarCloseBtn=document.getElementById('calendarCloseBtn');
document.getElementById('streakBadge').addEventListener('click',()=>{renderCalendar();calendarModal.classList.add('show')});
calendarCloseBtn.addEventListener('click',()=>calendarModal.classList.remove('show'));
calendarModal.addEventListener('click',(e)=>{if(e.target===calendarModal)calendarModal.classList.remove('show')});
async function resetAllData(){
    if(confirm('🗑️ Сбросить ВСЁ?\n\nВесь прогресс вернётся к заводским!')){
        try{await idbDelete(STATE_KEY)}catch(e){}
        localStorage.removeItem('fireland_light');
        localStorage.removeItem('abdulla_games_state_no_credits');
        state=JSON.parse(JSON.stringify(DEFAULT_STATE));
        state.ownerToken=generateOwnerToken();
        state.unreadChatCount=0;
        await idbSet(STATE_KEY,state);
        renderGames();renderExperiments();updateLastGameBar();loadSettings();
        renderProfile();renderStats();renderAchievements();renderRecords();
        renderQuests();renderStreak();updateLevelDisplay();cancelAlarm();clearSelection();renderCases();
        if(typeof updateChatBadge==='function')updateChatBadge();
        document.getElementById('profileNickInput').value='Игрок';
        const av=document.getElementById('profileBigAvatar');
        av.innerHTML='👤';
        av.style.background='linear-gradient(135deg, #6a8aff, #a78bfa)';
        document.querySelectorAll('.modal').forEach(m=>m.classList.remove('show'));
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="games"]').classList.add('active');
        document.getElementById('tab-games').classList.add('active');
        applyTheme();
        updateParticleColors();
        alert('🔄 ВСЁ сброшено!')}}
document.getElementById('resetProgressBtn').addEventListener('click',resetAllData);
document.getElementById('profileResetBtn').addEventListener('click',resetAllData);
function renderStats(){
    document.getElementById('totalGames').textContent=GAMES.length+EXPERIMENTS.length;
    document.getElementById('totalTime').textContent=Math.floor(state.totalTime/60)+' мин';
    const totalNormal=ACHIEVEMENTS.filter(a=>!a.isParadox).length;
    const earnedNormal=state.achievements.filter(id=>id!=='temporal_paradox').length;
    const text=earnedNormal+'/'+totalNormal;
    document.getElementById('achCount').textContent=text;
    const hdr=document.getElementById('achCountHeader');
    if(hdr)hdr.textContent=text}
document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'){
        if(isGameOpen){if(isMenuOpen)closeGameMenu();else closeGame()}
        else if(settingsModal.classList.contains('show'))settingsModal.classList.remove('show');
        else if(alarmModal.classList.contains('show'))alarmModal.classList.remove('show');
        else if(profileModal.classList.contains('show'))profileModal.classList.remove('show');
        else if(calendarModal.classList.contains('show'))calendarModal.classList.remove('show');
        else if(document.getElementById('dailyRewardModal').classList.contains('show'))document.getElementById('dailyRewardModal').classList.remove('show');
        else if(document.getElementById('caseOpenModal').classList.contains('show'))document.getElementById('caseOpenModal').classList.remove('show');
        else if(document.getElementById('postGameModal').classList.contains('show'))document.getElementById('postGameModal').classList.remove('show');
        else if(document.getElementById('userProfileModal').classList.contains('show'))document.getElementById('userProfileModal').classList.remove('show');
        else if(document.getElementById('roomCreateModal').classList.contains('show'))document.getElementById('roomCreateModal').classList.remove('show');
        else if(document.getElementById('uploadModal').classList.contains('show'))document.getElementById('uploadModal').classList.remove('show');
        else if(document.getElementById('gameDetailModal')&&document.getElementById('gameDetailModal').classList.contains('show'))document.getElementById('gameDetailModal').classList.remove('show');
        else if(typeof CHAT!=='undefined'&&CHAT.currentRoom&&CHAT.currentRoom!=='general'){
            if(typeof switchRoom==='function')switchRoom('general');
        }
    }
});
const mascotVideo=document.getElementById('mascotVideo');
const mascotContainer=document.getElementById('mascotContainer');
const mascotSource=mascotVideo.querySelector('source');
function showMascotFallback(){
    mascotContainer.innerHTML='<div class="mascot-fallback">🔥</div>';
    mascotContainer.style.background='linear-gradient(135deg, #1a0a00, #3a1a00)'}
mascotVideo.addEventListener('error',showMascotFallback);
if(mascotSource)mascotSource.addEventListener('error',showMascotFallback);
setTimeout(()=>{if(mascotVideo.readyState<2)showMascotFallback()},3000);
function hideMascot(){const w=document.getElementById('mascotWrapper');if(w)w.classList.add('hidden')}
function showMascot(){const w=document.getElementById('mascotWrapper');if(w)w.classList.remove('hidden')}
document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
        document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
        if(btn.dataset.tab==='quests'){
            renderQuests();
            if(state.todayStats)state.todayStats.questsViewed=true;
            updateQuestProgress();
        }
        if(btn.dataset.tab==='leaderboard'){
            if(typeof refreshLeaderboard==='function')refreshLeaderboard();
        }
        if(btn.dataset.tab==='chat'){
            if(typeof onChatTabOpen==='function')onChatTabOpen();
        }
        if(btn.dataset.tab==='community'){
            if(state.todayStats)state.todayStats.communityViewed=true;
            updateQuestProgress();
            if(typeof loadCommunityGames==='function')loadCommunityGames();
        }
    });
});
document.getElementById('pgCloseBtn').addEventListener('click',()=>{document.getElementById('postGameModal').classList.remove('show')});
document.getElementById('pgPlayAgainBtn').addEventListener('click',()=>{document.getElementById('postGameModal').classList.remove('show');if(lastPlayedGameId)openGame(lastPlayedGameId)});
document.getElementById('postGameModal').addEventListener('click',(e)=>{if(e.target.id==='postGameModal')document.getElementById('postGameModal').classList.remove('show')});
// ============================================
// DEVICE DETECTION · TV / Mobile / Desktop
// ============================================
function detectDevice() {
    const ua = navigator.userAgent;
    const isTV = /SmartTV|Tizen|WebOS|AppleTV|AndroidTV|HbbTV|NetCast|BRAVIA|VIDAA|Roku|Xbox|PlayStation/i.test(ua)
        || (window.innerWidth >= 1920 && window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) && !isTV;
    return isTV ? 'tv' : isMobile ? 'mobile' : 'desktop';
}
function applyDeviceMode() {
    const device = detectDevice();
    document.body.dataset.device = device;
    console.log('[Device] Режим:', device);
}
// ============================================
// TV NAVIGATION
// ============================================
let tvNavIndex = 0;
function setupTVNavigation() {
    if (document.body.dataset.device !== 'tv') return;
    setTimeout(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) activeTab.focus();
    }, 300);
    document.addEventListener('keydown', (e) => {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        const focusable = Array.from(document.querySelectorAll(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), .game-card, .community-card'
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
            if (isGameOpen) closeGame();
            else if (state.selectedGameId) openGame(state.selectedGameId);
        }
    });
    console.log('[TV] Навигация пультом активна');
}
// ============================================
// SWIPE NAVIGATION
// ============================================
function setupSwipeNavigation() {
    if (document.body.dataset.device === 'desktop') return;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    const SWIPE_THRESHOLD = 80;
    const SWIPE_TIME = 500;
    const tabsOrder = ['games', 'experiments', 'community', 'quests', 'leaderboard', 'chat'];
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
        if (e.target.closest('.lb-list, .games-list-panel, .chat-messages, .online-list, .dm-list, .rooms-list, .community-panel')) return;
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
window.addEventListener('orientationchange', () => {
    setTimeout(applyDeviceMode, 200);
});
let resizeTimer = null;
window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyDeviceMode, 300);
});
document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('chatMessages');
    if (box) {
        box.addEventListener('scroll', () => {
            if (typeof updateScrollDownBtn === 'function') updateScrollDownBtn();
        });
    }
});
// ============================================
// INIT
// ============================================
(async function init(){
    applyDeviceMode();
    await loadState();
    state.selectedGameId=null;
    state.selectedExpId=null;
    updateStreak();
    checkDailyQuests();
    createParticles();
    createStars();
    buildAnimatedLogo();
    renderGames();
    renderExperiments();
    loadSettings();
    renderStats();
    renderAchievements();
    renderProfile();
    renderQuests();
    renderStreak();
    renderQuestTimer();
    updateLevelDisplay();
    updateLastGameBar();
    updateClock();
    renderCases();
    console.log('🔥 Лаунчер FireLand v23.0 · Community+ · Игр: '+GAMES.length+' · Экспериментов: '+EXPERIMENTS.length);
    if(typeof initLeaderboard==='function')initLeaderboard();
    if(state.lastSubmittedNick){
        setTimeout(()=>{
            if(typeof submitScore==='function')submitScore();
        },5000);
    }
    setupTVNavigation();
    setupSwipeNavigation();
    if(typeof initCommunity==='function')initCommunity();
    if(typeof updateChatBadge==='function')setTimeout(updateChatBadge, 800);
})();

// ============================================
// ЭКСПОРТ В WINDOW для messenger.js / community.js / leaderboard.js
// ============================================
window.playTone = playTone;
window.saveState = saveState;
window.getLevelFromTotalXp = getLevelFromTotalXp;
window.getTitleForLevel = getTitleForLevel;
window.unlockAch = unlockAch;
window.updateQuestProgress = updateQuestProgress;
window.renderProfile = renderProfile;
window.renderAchievements = renderAchievements;
window.renderRecords = renderRecords;
window.updateLevelDisplay = updateLevelDisplay;
window.hideMascot = hideMascot;
window.showMascot = showMascot;
window.showGameSkeleton = showGameSkeleton;
window.hideGameSkeleton = hideGameSkeleton;
window.addGameMenuListeners = addGameMenuListeners;
window.removeGameMenuListeners = removeGameMenuListeners;
window.closeGame = closeGame;
window.startTimeTicker = startTimeTicker;
window.stopTimeTicker = stopTimeTicker;
window.updateLastGameBar = updateLastGameBar;
window.SOUNDS = SOUNDS;
window.showPostGameScreen = showPostGameScreen;
window.generateOwnerToken = generateOwnerToken;
window.renameNickEverywhere = renameNickEverywhere;
window.hasProfanity = hasProfanity;
window.censorProfanity = censorProfanity;
window.openGame = openGame;

// Синхронизируем window.isGameOpen с let-переменной isGameOpen
Object.defineProperty(window, 'isGameOpen', {
    get() { return isGameOpen; },
    set(v) { isGameOpen = v; },
    configurable: true
});