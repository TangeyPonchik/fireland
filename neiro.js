// ============================================
// FireLand · neiro.js · v1.1.0
// Нейросеть-собеседник на Pollinations AI
// Без бэкенда · без API-ключей · бесплатно
// Модель: openai-fast (gpt-oss-20b)
// ============================================

const NEIRO = {
  history: [],
  isSending: false,
  systemPrompt: 'Ты — дружелюбный помощник FireLand. Отвечай кратко, по-русски, с юмором.',
  lastRequestTime: 0,
  minInterval: 3000,
  maxHistoryLength: 20,
};

const NEIRO_MODELS = [
  { id: 'openai-fast', name: 'GPT-OSS 20B', icon: '🤖', desc: 'Работает бесплатно · reasoning · tools' },
];

// ============================================
// ХЕЛПЕРЫ
// ============================================
function neiroGetState() {
  return window.state || null;
}

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
// ЗАПРОС К POLLINATIONS
// ============================================
async function neiroAsk(prompt, options = {}) {
  if (!prompt || !prompt.trim()) {
    return { ok: false, error: 'Пустой запрос' };
  }

  if (NEIRO.isSending) {
    return { ok: false, error: 'Уже отвечаю, подожди...' };
  }

  const now = Date.now();
  if (now - NEIRO.lastRequestTime < NEIRO.minInterval) {
    const wait = Math.ceil((NEIRO.minInterval - (now - NEIRO.lastRequestTime)) / 1000);
    return { ok: false, error: `Подожди ещё ${wait}с` };
  }

  NEIRO.isSending = true;
  NEIRO.lastRequestTime = now;

  const systemPrompt = options.systemPrompt || NEIRO.systemPrompt;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...NEIRO.history.slice(-NEIRO.maxHistoryLength),
    { role: 'user', content: prompt.trim() },
  ];

  try {
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai-fast',
        messages,
        temperature: 0.8,
        max_tokens: 800,
        stream: false,
        private: true,
      }),
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      if (response.status === 500) {
        errorMsg = 'Сервер Pollinations перегружен. Попробуй через 10 секунд';
      } else if (response.status === 502) {
        errorMsg = 'Pollinations троттлит запросы. Подожди 15 секунд';
      } else if (response.status === 402) {
        errorMsg = 'Модель стала платной. Использую только openai-fast';
      } else if (response.status === 404) {
        errorMsg = 'Эндпоинт недоступен. Обнови страницу (Ctrl+Shift+R)';
      } else if (response.status === 429) {
        errorMsg = 'Слишком много запросов. Подожди 30 секунд';
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    let answer = '';

    if (data.choices && data.choices[0]?.message?.content) {
      answer = data.choices[0].message.content;
    } else if (typeof data === 'string') {
      answer = data;
    } else if (data.text) {
      answer = data.text;
    } else {
      answer = '(пустой ответ)';
    }

    NEIRO.history.push({ role: 'user', content: prompt.trim() });
    NEIRO.history.push({ role: 'assistant', content: answer });

    if (NEIRO.history.length > NEIRO.maxHistoryLength * 2) {
      NEIRO.history = NEIRO.history.slice(-NEIRO.maxHistoryLength);
    }

    return { ok: true, answer };

  } catch (e) {
    console.warn('[Neiro] Ошибка:', e);
    return { ok: false, error: e.message || 'Не удалось получить ответ' };
  } finally {
    NEIRO.isSending = false;
  }
}

// ============================================
// ОТРИСОВКА ИНТЕРФЕЙСА ЧАТА
// ============================================
function neiroRenderMessages() {
  const box = document.getElementById('neiroMessages');
  if (!box) return;

  if (NEIRO.history.length === 0) {
    box.innerHTML = `
      <div class="neiro-empty">
        <div style="font-size:64px;margin-bottom:16px;">🧠</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:8px;">Привет, ${neiroEscape(neiroGetNick())}!</div>
        <div style="color:var(--text-secondary);font-size:14px;">
          Я нейросеть на Pollinations AI. Спроси что-нибудь!
        </div>
      </div>`;
    return;
  }

  box.innerHTML = NEIRO.history.map((msg) => {
    const isUser = msg.role === 'user';
    const avatar = isUser ? '👤' : '🧠';
    return `
      <div class="neiro-message ${isUser ? 'me' : 'bot'}">
        <div class="neiro-avatar">${avatar}</div>
        <div class="neiro-bubble">
          <div class="neiro-text">${neiroEscape(msg.content)}</div>
        </div>
      </div>`;
  }).join('');

  box.scrollTop = box.scrollHeight;
}

function neiroShowThinking() {
  const box = document.getElementById('neiroMessages');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'neiro-message bot';
  el.id = 'neiroThinking';
  el.innerHTML = `
    <div class="neiro-avatar">🧠</div>
    <div class="neiro-bubble">
      <div class="neiro-typing">
        <span></span><span></span><span></span>
      </div>
    </div>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

function neiroHideThinking() {
  const el = document.getElementById('neiroThinking');
  if (el) el.remove();
}

// ============================================
// ОТПРАВКА СООБЩЕНИЯ
// ============================================
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
  if (input) {
    input.disabled = false;
    input.focus();
  }
}

// ============================================
// УПРАВЛЕНИЕ
// ============================================
function neiroClearHistory() {
  if (!confirm('Очистить всю историю диалога?')) return;
  NEIRO.history = [];
  neiroRenderMessages();
  neiroSafeSound('click');
}

function neiroRenderModelSelector() {
  const box = document.getElementById('neiroModels');
  if (!box) return;
  box.innerHTML = NEIRO_MODELS.map(m => `
    <button class="neiro-model-btn active"
            data-model="${m.id}"
            title="${neiroEscape(m.desc)}">
      <span class="neiro-model-icon">${m.icon}</span>
      <span class="neiro-model-name">${neiroEscape(m.name)}</span>
    </button>
  `).join('');
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ UI
// ============================================
function neiroInit() {
  const input = document.getElementById('neiroInput');
  const sendBtn = document.getElementById('neiroSendBtn');
  const clearBtn = document.getElementById('neiroClearBtn');
  const quickBtns = document.querySelectorAll('.neiro-quick-btn');

  if (sendBtn) sendBtn.addEventListener('click', neiroSend);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        neiroSend();
      }
    });
  }
  if (clearBtn) clearBtn.addEventListener('click', neiroClearHistory);

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!input) return;
      input.value = btn.dataset.prompt || btn.textContent.trim();
      input.focus();
    });
  });

  neiroRenderModelSelector();
  neiroRenderMessages();

  console.log('[Neiro] Pollinations AI · модель: openai-fast');
}

// ============================================
// ЭКСПОРТ В WINDOW
// ============================================
window.NEIRO = NEIRO;
window.NEIRO_MODELS = NEIRO_MODELS;
window.neiroAsk = neiroAsk;
window.neiroSend = neiroSend;
window.neiroClearHistory = neiroClearHistory;
window.neiroInit = neiroInit;
window.neiroRenderMessages = neiroRenderMessages;

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(neiroInit, 300);
} else {
  window.addEventListener('load', () => setTimeout(neiroInit, 300));
}

console.log('[neiro.js] Загружено v1.1.0 · openai-fast · бесплатно');