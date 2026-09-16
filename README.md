# 🔥 FireLand Launcher

<p align="center">
  <img src="fireek.mp4" alt="FireLand Mascot" width="200" />
</p>

<p align="center">
  <strong>Игровая платформа в браузере — без установки, без фреймворков, без сборки.</strong>
</p>

<p align="center">
  <a href="https://tangeyponchik.github.io/fireland/">
    <img src="https://img.shields.io/badge/🎮_Играть-tangeyponchik.github.io-6a8aff?style=for-the-badge" alt="Play" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/GitHub_Pages-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub Pages" />
</p>

---

## 🎮 Что это?

**FireLand Launcher** — это игровая платформа, которая работает **прямо в браузере**. Заходишь на сайт, выбираешь игру, играешь. **Ничего устанавливать не надо.**

**Стек:**
- **Frontend:** чистый HTML + CSS + JavaScript (без React/Vue/Svelte)
- **Сборка:** нет (без Webpack/Vite/npm)
- **База данных:** Supabase (Postgres + REST + Realtime)
- **Хостинг:** GitHub Pages
- **Реалтайм:** WebSocket через Supabase Realtime

**⚠️ VPN не нужен.** Сайт работает в России без VPN.

---

## ✨ Что внутри?

### 🎯 Игры
- **12 игр** в главной библиотеке: RPG, хоррор, симуляторы, кликеры, файтинги.
- **4 эксперимента** в отдельной вкладке — новые жанры, 3D-раннеры, ритм-платформеры.
- Запуск **в один клик**.
- **Полноэкранный режим** и **встроенное меню** (пауза, перезапуск, настройки).

### 🏆 Прогрессия
- **Уровни и XP** — 100 уровней с уникальными титулами от «🌱 Новичок» до «🔥🔥🔥 БОГ FireLand».
- **50+ достижений** — от первого запуска до легендарных (с редкостью: common / rare / epic / legendary).
- **Избранное** — любимые игры всегда сверху.

### 📅 Ежедневные задания
- **5 случайных заданий** каждый день.
- **Стрик (серия дней)** — заходишь ежедневно → получаешь бонусы.
- **Календарь активности** — видно, сколько дней подряд заходил.

### 💬 Мессенджер (полноценный чат)
- **Общий чат FireLand** — realtime, все сообщения в БД.
- **Личные сообщения** — клик по игроку → приватный чат.
- **Приватные комнаты** — создай комнату, позови друзей.
- **Список онлайн** — кто сейчас в сети.
- **«Печатает...»** — видишь, когда кто-то набирает сообщение.
- **Ответы (reply)** — цитируй сообщения.
- **Реакции** — 👍❤️🔥 на любое сообщение.
- **Поиск по чату** — находи любые сообщения.
- **Эмодзи-палитра** — 40+ эмодзи в один клик.
- **Удаление своих сообщений**.
- **Фильтр мата** — автоматически цензурирует.

### 🎨 Кастомизация
- **4 темы:** системная, тёмная, светлая, умная (по времени суток).
- **Аватарки** — загрузи своё фото (сжатие до 256px).
- **Экспорт/импорт профиля** — перенеси прогресс между устройствами.

### 🏆 Лидерборд
- **Топ-100 игроков** по XP.
- **Автообновление** каждую минуту.
- **Твоя позиция** отдельно выделена.

### 📱 Адаптив
- **Desktop** — полный функционал.
- **Mobile** — свайпы между вкладками, крупные тап-зоны.
- **TV** — навигация пультом (стрелки + Enter), крупный шрифт.

### ⏰ Прочее
- **Будильник** — с вибрацией и повторами.
- **Маскот** — 🔥 в углу экрана.
- **Звуки** — клики, достижения, уведомления.

---

## 🚀 Как играть?

1. Открой **[tangeyponchik.github.io/fireland](https://tangeyponchik.github.io/fireland/)**
2. Введи **ник** (онбординг при первом заходе).
3. Выбери игру → **Играть**.
4. Зарабатывай XP, выполняй задания, общайся в чате.

**Никаких регистраций, паролей, email.** Только ник.

---

## 🛠️ Как это работает?

### Архитектура

```
┌──────────────────────┐
│   Браузер            │
│   (index.html)       │
└──────────┬───────────┘
           │
           ├── script.js       ← логика лаунчера (игры, XP, задания)
           ├── messenger.js    ← чат (Realtime через WebSocket)
           ├── leaderboard.js  ← топ игроков (REST)
           ├── style.css       ← стили (темы, адаптив, TV)
           │
           ▼
┌──────────────────────┐
│   Supabase           │
│   (Postgres)         │
│                      │
│  • chat_messages     │ ← общий чат + ЛС + комнаты
│  • chat_reactions    │ ← реакции на сообщения
│  • leaderboard       │ ← XP и уровни игроков
└──────────────────────┘
```

### Без фреймворков

**Весь фронтенд — чистый HTML/CSS/JS.** Это значит:
- **Быстро загружается** — нет бандлов по 500 КБ.
- **Просто хостить** — GitHub Pages отдаёт статику.
- **Легко читать код** — открыл DevTools и разобрался.

### Realtime через Supabase

**Чат работает через WebSocket** (Supabase Realtime):
- Отправил сообщение → оно в БД.
- Supabase пушит событие **всем подписчикам**.
- Все видят сообщение **мгновенно**.

**Онлайн-список** работает через **Presence** — Supabase сам отслеживает, кто подключён.

---

## 📂 Структура проекта

```
FireLand/
├── index.html              ← главная страница
├── style.css               ← все стили (включая темы, адаптив, TV)
├── script.js               ← логика лаунчера
├── messenger.js            ← чат
├── leaderboard.js          ← топ игроков
├── .gitignore              ← игнор для Git
├── README.md               ← этот файл
├── fireek.mp4              ← маскот (видео)
│
├── ИГРЫ/                   ← основная библиотека
│   ├── Прорыв.html
│   ├── Прорыв 2.html
│   ├── Прорыв 3.html
│   ├── ДОМ.html
│   ├── ДОМ 2.html
│   ├── Великая кулинария.html
│   ├── Космический контробандист.html
│   ├── Robo-cleaner2.0.html
│   ├── БИТВА СИЛЬНЕЙШИХ.html
│   ├── Шахтер/
│   ├── Musibox.html
│   └── ПОСЛЕДНИЙ РУБЕЖ.html
│
└── ЭКСПЕРИМЕНТЫ/           ← экспериментальные игры
    ├── ПРОШЛОЕ НАСТУПАЕТ (пк).html
    ├── Ant Kolony.html
    ├── Кликер счастья.html
    └── ПРОШЛОЕ НАСТУПАЕТ (GD)/
```

---

## 🔧 Разработка

### Локальный запуск

**Просто открой `index.html` в браузере.** Всё работает без сборки.

**Или подними локальный сервер** (для теста чата через `localhost`):

```bash
# Python 3
python -m http.server 8000

# Или Node.js
npx serve
```

Затем открой: `http://localhost:8000`

### База данных

**Используется Supabase** (бесплатный тариф).

**Схема:**

```sql
-- Сообщения чата (общий + ЛС + комнаты)
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  room TEXT NOT NULL DEFAULT 'general',
  nickname TEXT NOT NULL,
  text TEXT NOT NULL,
  reply_to_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Реакции
CREATE TABLE chat_reactions (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL,
  nickname TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, nickname, emoji)
);

-- Лидерборд
CREATE TABLE leaderboard (
  nickname TEXT PRIMARY KEY,
  level INT DEFAULT 1,
  total_xp BIGINT DEFAULT 0,
  achievements_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS-политики:** чтение и запись разрешены всем (авторизация — по нику, без пароля).

---

## 🎯 Что дальше?

**Планы:**
- 📷 **Картинки в чате** — загрузка через Supabase Storage.
- 🎤 **Голосовые сообщения** — MediaRecorder API.
- 👥 **Друзья** — таблица friends, добавление по нику.
- 🔔 **Push-уведомления** — Service Worker.
- 🎮 **Мультиплеер** — realtime-игры (шахматы, крестики-нолики).

---

## 👥 Команда

- **Ronormav** — автор проекта, разработчик.
- **FireLand Studio** — команда.

---

## 📜 Лицензия

**MIT** — используй, форкай, изменяй.

---

## 🔗 Ссылки

- 🌐 **Сайт (без VPN):** [tangeyponchik.github.io/fireland](https://tangeyponchik.github.io/fireland/)
- 💻 **GitHub:** [github.com/TangeyPonchik/fireland](https://github.com/TangeyPonchik/fireland)
- 📧 **Email:** ronormav@gmail.com

---

<p align="center">
  <strong>🔥 FireLand — не просто лаунчер. FireLand — платформа. 🔥</strong>
</p>

<p align="center">
  Сделано с ❤️ на чистом HTML, CSS и JavaScript.
</p>