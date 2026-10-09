// ============================================
// FireLand · neiro.js · v2.1.0
// Нейросеть на LLM7.io (стриминг + фиксированный список моделей)
// Выбор модели — в настройках (⚙️)
// ============================================

const NEIRO = {
  history: [],
  isSending: false,
  systemPrompt: `Ты — встроенный AI-ассистент игрового лаунчера FireLand. Твоё имя — Fire. Ты работаешь прямо в браузере, без бэкенда, через LLM7.io. Ты общаешься с игроками лаунчера, помогаешь им, объясняешь функции, шутишь и поддерживаешь дружелюбную атмосферу.

О ЛАУНЧЕРЕ FIRELAND:
FireLand — игровая платформа в браузере. Работает по адресу tangeyponchik.github.io/fireland. Не требует установки, регистрации, пароля или email — только ник. Доступен на ПК, телефоне, планшете и ТВ. Устанавливается как PWA-приложение (иконка на рабочем столе, офлайн-режим). Разработан студией FireLand, автор — Ronormav.

ИГРЫ (13 штук):
1. Прорыв 1 — RPG про борьбу с РКН, 20 врагов, прокачка ВПН.
2. Прорыв 2 — продолжение, выбор фракции, сюжет.
3. Прорыв 3 — финал трилогии, 4 фракции, 25 врагов, босс ЦЕНЗУРА.
4. ДОМ — хоррор-квест, 3 предмета для побега.
5. ДОМ 2 — хоррор, 3 якоря, 5 концовок.
6. Великая кулинария — симулятор шеф-повара, крафт рецептов.
7. Космический контрабандист — торговля, пираты, империя.
8. Robo-Cleaner 2.6 — пошаговые бои с роботами.
9. БИТВА СИЛЬНЕЙШИХ — файтинг на одном экране, геймпад.
10. Шахтёр — кликер про добычу руды на планетах.
11. Musibox — музыкальный секвенсор, биты, запись микса.
12. Последний рубеж — автобаттлер с зомби, карты, лор.
13. Snakes Battle — онлайн PvP-змейки, команды, до 20 игроков, босс-змея на 500 длины.

УТИЛИТЫ (2 штуки):
- FireShop 3D — 3D/2D-редактор на Three.js, экспорт в GLB и PNG.
- Тест автокликера — измеряет CPS мыши, защита от drag-click.

ПРОГРЕССИЯ:
- 100 уровней с титулами от «🌱 Новичок» до «🔥🔥🔥 БОГ FireLand».
- 50+ достижений (обычные, редкие, эпические, легендарные).
- XP начисляется за игры, достижения, задания, кейсы, стрик.
- Временной парадокс — копишь время в играх, получаешь XP.

ЕЖЕДНЕВНОЕ:
- 5 случайных заданий каждый день, бонус +200 XP за все.
- Стрик — серия дней подряд, календарь активности.
- Ежедневная награда и ежедневный/недельный кейсы.

СОЦИАЛЬНОЕ:
- Общий чат FireLand (realtime).
- Личные сообщения, глобальные комнаты, реакции, ответы.
- Лидерборд топ-100 по XP, автообновление.
- Аватарки, ник, экспорт/импорт профиля.

ФИЧИ:
- 4 темы оформления (системная, тёмная, светлая, умная).
- Будильник с вибрацией и повторами.
- Звуки интерфейса.
- Маскот 🔥 в углу экрана.
- Поддержка геймпада и TV-пульта.

ТВОЯ РОЛЬ:
Отвечай кратко (2–5 предложений), по-русски, дружелюбно, с лёгким юмором. Помогай с вопросами про игры, достижения, чат, лидерборд. Если не знаешь ответа — честно скажи. Не выдумывай несуществующие функции. Не говори, что ты сам сайт — ты ассистент внутри него. Если игрок грубит — отвечай спокойно. Поддерживай атмосферу уютного игрового сообщества.`,
  lastRequestTime: 0,
  minInterval: 2000,
  maxHistoryLength: 15,
  currentModel: localStorage.getItem('fireland_neiro_model') || 'default',
  modelsList: [
    { id: 'default', name: '🤖 Auto (LLM7 выбирает)', desc: 'LLM7 сам подберёт модель' },
    { id: 'fast', name: '⚡ Fast', desc: 'Быстрая лёгкая модель' },
    { id: 'gpt-4o-mini', name: '🟢 GPT-4o Mini', desc: 'OpenAI, быстрая' },
    { id: 'gpt-4o', name: '🧠 GPT-4o', desc: 'OpenAI, умная' },
    { id: 'deepseek-v3', name: '🐋 DeepSeek V3', desc: 'Китайская, хороша в коде' },
    { id: 'deepseek-r1', name: '🧩 DeepSeek R1', desc: 'Reasoning, думает долго' },
    { id: 'mistral', name: '🌪️ Mistral', desc: 'Европейская, быстрая' },
    { id: 'llama-3.3-70b', name: '🦙 Llama 3.3 70B', desc: 'Meta, мощная' },
  ],
};

function neiroGetState() { return window.state || null; }
function neiroGetNick() {
  const s = neiroGetState();
  return (s && s.nickname && s.nickname !== 'Игрок') ? s.nickname : 'Гость';
}
function neiroSafeSound(name) {
  if (window.SOUNDS && typeof window.SOUNDS[name] === 'function') {
    try { window.SOUNDS[name](); } catch (e) {}
  }
}
function neiroEscape(text) {
  return (window.escapeHtml || function(t){ return String(t); })(text);
}

// ============================================
// РЕНДЕР СЕЛЕКТОРА В НАСТРОЙКАХ
// ============================================
function neiroRenderModelSelector() {
  const sel = document.getElementById('neiroModelSelect');
  if (!sel) return;
  sel.innerHTML = NEIRO.modelsList.map(m =>
    `<option value="${neiroEscape(m.id)}" title="${neiroEscape(m.desc)}"${m.id === NEIRO.currentModel ? ' selected' : ''}>${neiroEscape(m.name)}</option>`
  ).join('');
}

// ============================================
// СМЕНА МОДЕЛИ
// ============================================
function neiroChangeModel(modelId) {
  NEIRO.currentModel = modelId;
  localStorage.setItem('fireland_neiro_model', modelId);
  neiroSafeSound('click');
}

// ============================================
// ЗАПРОС К LLM7 (СТРИМИНГ + таймаут 60 сек)
// ============================================
async function neiroAsk(prompt, options = {}) {
  if (!prompt || !prompt.trim()) return { ok: false, error: 'Пустой запрос' };
  if (NEIRO.isSending) return { ok: false, error: 'Уже отвечаю, подожди...' };

  const now = Date.now();
  if (now - NEIRO.lastRequestTime < NEIRO.minInterval) {
    const wait = Math.ceil((NEIRO.minInterval - (now - NEIRO.lastRequestTime)) / 1000);
    return { ok: false, error: `Подожди ещё ${wait}с` };
  }

  NEIRO.isSending = true;
  NEIRO.lastRequestTime = now;

  const messages = [
    { role: 'system', content: NEIRO.systemPrompt },
    ...NEIRO.history.slice(-NEIRO.maxHistoryLength),
    { role: 'user', content: prompt.trim() },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://api.llm7.io/v1/chat/completions', {
      method: 'POST',
      headers: {
'Authorization': 'Bearer ' + (window.NEIRO_TOKEN || 'unused'),
},
      body: JSON.stringify({
        model: NEIRO.currentModel || 'default',
        messages,
        temperature: 0.8,
        max_tokens: 400,
        stream: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      if (response.status === 429) errorMsg = 'Слишком много запросов. Подожди 60 секунд';
      else if (response.status === 500) errorMsg = 'Сервер LLM7 перегружен. Попробуй через 10 секунд';
      else if (response.status === 402) errorMsg = 'Лимит токенов исчерпан. Попробуй завтра';
      else if (response.status === 404) errorMsg = 'Модель не найдена. Выбери другую в настройках';
      throw new Error(errorMsg);
    }

    // ===== СТРИМИНГ =====
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let answer = '';
    let sseBuffer = '';

    neiroHideThinking();
    const box = document.getElementById('neiroMessages');
    let streamTextEl = null;
    if (box) {
      const streamEl = document.createElement('div');
      streamEl.className = 'neiro-message bot';
      streamEl.innerHTML = `<div class="neiro-avatar">🧠</div><div class="neiro-bubble"><div class="neiro-text" id="neiroStreamText"></div></div>`;
      box.appendChild(streamEl);
      box.scrollTop = box.scrollHeight;
      streamTextEl = document.getElementById('neiroStreamText');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split('\n');
      sseBuffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              answer += delta;
              if (streamTextEl) streamTextEl.textContent = answer;
              if (box) box.scrollTop = box.scrollHeight;
            }
          } catch (e) {}
        }
      }
    }

    if (!answer) answer = '(пустой ответ)';

    NEIRO.history.push({ role: 'user', content: prompt.trim() });
    NEIRO.history.push({ role: 'assistant', content: answer });

    if (NEIRO.history.length > NEIRO.maxHistoryLength * 2) {
      NEIRO.history = NEIRO.history.slice(-NEIRO.maxHistoryLength);
    }

    return { ok: true, answer };
  } catch (e) {
    clearTimeout(timeoutId);
    console.warn('[Neiro] Ошибка:', e);
    let msg = e.message || 'Не удалось получить ответ';
    if (e.name === 'AbortError') {
      msg = 'Сервер не ответил за 60 секунд. Выбери модель «fast» в настройках';
    } else if (e.message === 'Failed to fetch') {
      msg = 'Нет соединения с LLM7. Проверь интернет, VPN или открой через localhost:3000';
    }
    return { ok: false, error: msg };
  } finally {
    NEIRO.isSending = false;
  }
}

// ============================================
// РЕНДЕР СООБЩЕНИЙ
// ============================================
function neiroRenderMessages() {
  const box = document.getElementById('neiroMessages');
  if (!box) return;
  if (NEIRO.history.length === 0) {
    box.innerHTML = `<div class="neiro-empty"><div style="font-size:64px;margin-bottom:16px;">🧠</div><div style="font-size:18px;font-weight:800;margin-bottom:8px;">Привет, ${neiroEscape(neiroGetNick())}!</div><div style="color:var(--text-secondary);font-size:14px;">Я нейросеть на LLM7.io. Спроси что-нибудь!</div></div>`;
    return;
  }
  box.innerHTML = NEIRO.history.map((msg) => {
    const isUser = msg.role === 'user';
    const avatar = isUser ? '👤' : '🧠';
    return `<div class="neiro-message ${isUser ? 'me' : 'bot'}"><div class="neiro-avatar">${avatar}</div><div class="neiro-bubble"><div class="neiro-text">${neiroEscape(msg.content)}</div></div></div>`;
  }).join('');
  box.scrollTop = box.scrollHeight;
}

function neiroShowThinking() {
  const box = document.getElementById('neiroMessages');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'neiro-message bot';
  el.id = 'neiroThinking';
  el.innerHTML = `<div class="neiro-avatar">🧠</div><div class="neiro-bubble"><div class="neiro-typing"><span></span><span></span><span></span></div></div>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

function neiroHideThinking() {
  const el = document.getElementById('neiroThinking');
  if (el) el.remove();
}

async function neiroSend() {
  const input = document.getElementById('neiroInput');
  const sendBtn = document.getElementById('neiroSendBtn');
  if (!input || NEIRO.isSending) return;
  const text = input.value.trim();
  if (!text) return;

  NEIRO.history.push({ role: 'user', content: text });
  input.value = '';
  neiroRenderMessages();
  neiroShowThinking();
  if (sendBtn) sendBtn.disabled = true;
  if (input) input.disabled = true;

  NEIRO.history.pop();
  const result = await neiroAsk(text);
  neiroHideThinking();

  if (!result.ok) {
    NEIRO.history.push({ role: 'assistant', content: '❌ ' + result.error });
    neiroSafeSound('error');
  } else {
    neiroSafeSound('quest');
  }
  neiroRenderMessages();
  if (sendBtn) sendBtn.disabled = false;
  if (input) { input.disabled = false; input.focus(); }
}

function neiroClearHistory() {
  if (!confirm('Очистить всю историю диалога?')) return;
  NEIRO.history = [];
  neiroRenderMessages();
  neiroSafeSound('click');
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
function neiroInit() {
  const input = document.getElementById('neiroInput');
  const sendBtn = document.getElementById('neiroSendBtn');
  const clearBtn = document.getElementById('neiroClearBtn');
  const modelSelect = document.getElementById('neiroModelSelect');
  const quickBtns = document.querySelectorAll('.neiro-quick-btn');

  if (sendBtn) sendBtn.addEventListener('click', neiroSend);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); neiroSend(); }
    });
  }
  if (clearBtn) clearBtn.addEventListener('click', neiroClearHistory);

  if (modelSelect) {
    modelSelect.addEventListener('change', (e) => {
      neiroChangeModel(e.target.value);
      console.log('[Neiro] Модель изменена:', e.target.value);
    });
  }

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!input) return;
      input.value = btn.dataset.prompt || btn.textContent.trim();
      input.focus();
    });
  });

  neiroRenderModelSelector();
  neiroRenderMessages();

  console.log('[Neiro] v2.1.0 · модель:', NEIRO.currentModel);
}

window.NEIRO = NEIRO;
window.neiroAsk = neiroAsk;
window.neiroSend = neiroSend;
window.neiroClearHistory = neiroClearHistory;
window.neiroInit = neiroInit;
window.neiroRenderMessages = neiroRenderMessages;
window.neiroChangeModel = neiroChangeModel;

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(neiroInit, 300);
} else {
  window.addEventListener('load', () => setTimeout(neiroInit, 300));
}

console.log('[neiro.js] Загружено v2.1.0 · LLM7.io · фиксированный список моделей');