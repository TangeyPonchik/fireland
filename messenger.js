// ============================================
// FireLand Messenger v22 · FIXED
// ============================================

const CHAT = {
  client: null,
  currentRoom: 'general',
  historyLoaded: {},
  subscribed: {},
  reactionsSubscribed: false,
  presenceChannel: null,
  onlineUsers: [],
  onlineAvatars: {},
  sending: false,
  typingTimeout: null,
  dmList: [],
  roomsList: [],
  lastDmFetch: 0,
  loadingRooms: {},
  replyTo: null,
  searchActive: false,
  searchQuery: '',
  reactions: {},
  emojiPanelOpen: false,
  presenceHeartbeat: null,
};

const CHAT_URL = SUPABASE_URL;
const CHAT_ANON_KEY = SUPABASE_ANON_KEY;

const EMOJI_LIST = [
  '😀','😂','🥰','😎','🤔','😢','😡','🥳','😴','🤯',
  '👍','👎','❤️','🔥','✨','🎉','💯','👀','🤝','💪',
  '🚀','⚡','🌟','🌈','🍕','🍔','☕','🎮','🎵','🎨',
  '😅','🙃','😇','🤩','😱','🤗','🤫','🙄','😬','💀',
];

// ===== Безопасные обёртки =====
function chatEscape(text) {
  return (window.escapeHtml || function(t){return t})(text);
}
function chatSafePlayTone(freq, duration, type, volume) {
  if (typeof playTone === 'function') {
    try { playTone(freq, duration, type, volume); } catch (e) {}
  }
}
function chatGetState() {
  if (typeof state !== 'undefined' && state) return state;
  return null;
}
function chatSaveState(immediate = false) {
  if (typeof saveState === 'function') {
    try { saveState(immediate); } catch (e) {}
  }
}

function chatHeaders(extra = {}) {
  return {
    'apikey': CHAT_ANON_KEY,
    'Authorization': `Bearer ${CHAT_ANON_KEY}`,
    ...extra,
  };
}

// ============================================
// ФИЛЬТР МАТА
// ============================================
const BAD_ROOTS = [
  'хуй','хуё','хуе','хер','пизд','блят','бляд',
  'ебал','ебан','ебат','ебу','ёбн','ебуч',
  'сука','суки','сучар','муд','манда','мандавош',
  'залуп','шлюх','гандон','гондон','дроч','педик',
  'пидор','пидар','уеб','уёб','долбоёб','долбоеб',
  'нахуй','нахуя','похуй','охуе','ахуе','гнид','мраз','твар',
];
const WHITELIST = new Set([]);

function hasProfanity(text) {
  const lower = text.toLowerCase().replace(/[^\wа-яё\s]/gi, ' ');
  const words = lower.split(/\s+/).filter(Boolean);
  return words.some(w => {
    if (WHITELIST.has(w)) return false;
    return BAD_ROOTS.some(root => w.includes(root));
  });
}

function censorProfanity(text) {
  let result = text;
  BAD_ROOTS.forEach(root => {
    const re = new RegExp(root, 'gi');
    result = result.replace(re, m => '*'.repeat(m.length));
  });
  return result;
}

// ============================================
// SMART DATE LABEL
// ============================================
function getDateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(); twoDaysAgo.setDate(today.getDate() - 2);
  const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 7);
  const monthAgo = new Date(); monthAgo.setDate(today.getDate() - 30);
  const yearAgo = new Date(); yearAgo.setDate(today.getDate() - 365);
  const centuryAgo = new Date(); centuryAgo.setFullYear(today.getFullYear() - 100);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Сегодня';
  if (sameDay(d, yesterday)) return 'Вчера';
  if (sameDay(d, twoDaysAgo)) return 'Два дня назад';
  if (d > weekAgo) return 'Неделю назад';
  if (d > monthAgo) return 'Месяц назад';
  if (d > yearAgo) return 'Год назад';
  if (d > centuryAgo) return 'Много лет назад';
  return 'Век назад';
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
function initMessenger() {
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.warn('[Chat] Supabase SDK не загружен');
    setChatStatus('SDK не загружен', 'error');
    return;
  }
  if (!CHAT_URL || !CHAT_ANON_KEY) {
    console.warn('[Chat] SUPABASE_URL / SUPABASE_ANON_KEY не найдены.');
    setChatStatus('Ошибка конфигурации', 'error');
    return;
  }

  CHAT.client = supabase.createClient(CHAT_URL, CHAT_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 10 } },
    global: {
      headers: {
        'apikey': CHAT_ANON_KEY,
        'Authorization': `Bearer ${CHAT_ANON_KEY}`,
      },
    },
  });

  bindChatUI();
  initEmojiPanel();
  loadMyRooms();
  console.log('[Chat] Мессенджер v22 · FIXED');
}

function bindChatUI() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const backBtn = document.getElementById('chatBackToGeneral');
  const newDmBtn = document.getElementById('chatNewDmBtn');
  const newRoomBtn = document.getElementById('chatNewRoomBtn');
  const searchBtn = document.getElementById('chatSearchBtn');
  const searchClose = document.getElementById('chatSearchClose');
  const searchInput = document.getElementById('chatSearchInput');
  const replyCancel = document.getElementById('chatReplyCancel');
  const emojiBtn = document.getElementById('chatEmojiBtn');

  if (sendBtn) sendBtn.addEventListener('click', handleSendClick);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendClick();
      }
    });
    input.addEventListener('input', handleTypingInput);
  }
  if (backBtn) backBtn.addEventListener('click', () => switchRoom('general'));
  if (newDmBtn) newDmBtn.addEventListener('click', openNewDmModal);
  if (newRoomBtn) newRoomBtn.addEventListener('click', openRoomCreateModal);
  if (searchBtn) searchBtn.addEventListener('click', toggleSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      CHAT.searchQuery = e.target.value.trim();
      filterMessagesBySearch();
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
    });
  }
  if (replyCancel) replyCancel.addEventListener('click', cancelReply);
  if (emojiBtn) emojiBtn.addEventListener('click', toggleEmojiPanel);

  const imageBtn = document.getElementById('chatImageBtn');
  const voiceBtn = document.getElementById('chatVoiceBtn');
  const imageInput = document.getElementById('chatImageInput');
  const recCancel = document.getElementById('chatRecordingCancel');
  const recSend = document.getElementById('chatRecordingSend');
  const lightbox = document.getElementById('chatLightbox');
  const lightboxClose = document.getElementById('chatLightboxClose');

  if (imageBtn && imageInput) {
    imageBtn.addEventListener('click', () => imageInput.click());
  }
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }
  if (voiceBtn) {
    voiceBtn.addEventListener('click', toggleVoiceRecording);
  }
  if (recCancel) recCancel.addEventListener('click', cancelVoiceRecording);
  if (recSend) recSend.addEventListener('click', sendVoiceRecording);
  if (lightbox && lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  const scrollBtn = document.getElementById('chatScrollDownBtn');
  if (scrollBtn) scrollBtn.addEventListener('click', scrollChatToBottom);

  const box = document.getElementById('chatMessages');
  if (box) {
    box.addEventListener('scroll', () => updateScrollDownBtn());
  }

  const roomCreateConfirm = document.getElementById('roomCreateConfirm');
  if (roomCreateConfirm) roomCreateConfirm.addEventListener('click', handleCreateRoom);
  const roomNameInput = document.getElementById('roomNameInput');
  if (roomNameInput) {
    roomNameInput.addEventListener('input', validateRoomName);
    roomNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCreateRoom();
    });
  }
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ КОМНАТ
// ============================================
function switchRoom(room) {
  if (!CHAT.client) return;
  const st = chatGetState();
  if (!st) return;
  if (CHAT.currentRoom === room && CHAT.historyLoaded[room]) {
    updateChatHeader();
    return;
  }
  const oldRoom = CHAT.currentRoom;
  if (CHAT.subscribed[oldRoom]) {
    try { CHAT.client.removeChannel(CHAT.subscribed[oldRoom]); } catch (e) {}
    delete CHAT.subscribed[oldRoom];
  }
  CHAT.currentRoom = room;
  CHAT.replyTo = null;
  CHAT.reactions = {};
  hideReplyPreview();

  const box = document.getElementById('chatMessages');
  if (box) {
    box.innerHTML = '<div class="chat-empty">💬 Загрузка...</div>';
    loadChatHistory(room, true);
  }
  if (!CHAT.subscribed[room]) subscribeToRoom(room);
  updateChatHeader();
  renderDmList();
  renderRoomsList();
  renderOnlineList();

  setTimeout(() => {
    const input = document.getElementById('chatInput');
    if (input && document.body.dataset.device !== 'tv') input.focus();
  }, 200);
}

function makeDmRoom(nickA, nickB) {
  const [a, b] = [nickA, nickB].sort();
  return `dm_${a}_${b}`;
}

function parseDmRoom(room) {
  if (!room.startsWith('dm_')) return null;
  const body = room.slice(3);
  const parts = body.split('_');
  if (parts.length < 2) return null;
  return { a: parts[0], b: parts[parts.length - 1] };
}

function getPeerNick(room) {
  const parsed = parseDmRoom(room);
  if (!parsed) return null;
  const st = chatGetState();
  if (!st) return null;
  return parsed.a === st.nickname ? parsed.b : parsed.a;
}

// ============================================
// ЗАГРУЗКА ИСТОРИИ
// ============================================
async function loadChatHistory(room, force = false) {
  if (CHAT.historyLoaded[room] && !force) return;
  if (CHAT.loadingRooms[room]) return;
  CHAT.loadingRooms[room] = true;

  if (!CHAT.historyLoaded[room]) {
    setChatStatus('Загрузка истории...', '');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${CHAT_URL}/rest/v1/chat_messages?room=eq.${encodeURIComponent(room)}&select=id,nickname,text,created_at,reply_to_id,image_url,voice_url,voice_duration&order=created_at.asc&limit=150`,
      {
        headers: chatHeaders(),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('[Chat] loadChatHistory HTTP:', res.status);
      setChatStatus('Ошибка загрузки', 'error');
      CHAT.loadingRooms[room] = false;
      return;
    }
    const data = await res.json();
    const box = document.getElementById('chatMessages');
    if (!box || CHAT.currentRoom !== room) {
      CHAT.loadingRooms[room] = false;
      return;
    }
    box.innerHTML = '';
    if (data.length === 0) {
      box.innerHTML = '<div class="chat-empty">💬 Пока нет сообщений. Будь первым!</div>';
    } else {
      const messagesById = {};
      data.forEach(m => { messagesById[m.id] = m; });
      const ids = data.map(m => m.id);
      if (ids.length > 0) await loadReactionsForMessages(ids);

      let lastDate = null;
      let lastNick = null;
      let lastTime = null;
      data.forEach(msg => {
        const d = new Date(msg.created_at).toDateString();
        if (d !== lastDate) {
          renderDateDivider(msg.created_at);
          lastDate = d;
          lastNick = null;
          lastTime = null;
        }
        const t = new Date(msg.created_at).getTime();
        const grouped = lastNick === msg.nickname && (t - lastTime) < 5 * 60 * 1000;
        const replyMsg = msg.reply_to_id ? messagesById[msg.reply_to_id] : null;
        renderMessage(msg, false, grouped, replyMsg);
        lastNick = msg.nickname;
        lastTime = t;
      });
    }
    CHAT.historyLoaded[room] = true;
    box.scrollTop = box.scrollHeight;
    setChatStatus('🟢 Онлайн', 'connected');
    updateScrollDownBtn();
  } catch (e) {
    console.warn('[Chat] История:', e);
    if (e.name === 'AbortError') setChatStatus('Таймаут загрузки', 'error');
    else setChatStatus('Нет соединения', 'error');
  } finally {
    CHAT.loadingRooms[room] = false;
  }
}

// ============================================
// ПОДПИСКА
// ============================================
function subscribeToRoom(room) {
  if (CHAT.subscribed[room]) return;
  const channel = CHAT.client
    .channel(`fireland-chat-${room}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room=eq.${room}`,
      },
      (payload) => {
        const st = chatGetState();
        if (!st) return;
        const msg = payload.new;
        if (msg.nickname === st.nickname && isRecentSelfMessage(msg)) return;
        const isCurrent = CHAT.currentRoom === room;
        const isHidden = document.hidden;
        if (msg.nickname !== st.nickname && (!isCurrent || isHidden)) {
          bumpUnread(room);
        }
        if (isCurrent) {
          const replyMsg = msg.reply_to_id ? findMessageById(msg.reply_to_id) : null;
          renderMessage(msg, true, false, replyMsg);
          if (CHAT.searchActive) filterMessagesBySearch();
        }
        if (msg.nickname !== st.nickname) {
          chatSafePlayTone(880, 0.08, 'sine', 0.06);
          setTimeout(() => chatSafePlayTone(1175, 0.12, 'sine', 0.06), 80);
        }
        if (document.hidden && msg.nickname !== st.nickname) {
          notifyNewMessage(msg);
        }
        if (room.startsWith('dm_')) refreshDmList();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages',
        filter: `room=eq.${room}`,
      },
      (payload) => {
        const old = payload.old;
        if (old && old.id) removeMessageFromUI(old.id);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (room === CHAT.currentRoom) setChatStatus('🟢 Онлайн', 'connected');
        CHAT.subscribed[room] = channel;
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        if (room === CHAT.currentRoom) setChatStatus('Ошибка соединения', 'error');
      }
    });
}

function subscribeToReactions() {
  if (CHAT.reactionsSubscribed) return;
  CHAT.reactionsSubscribed = true;
  CHAT.client
    .channel('fireland-reactions')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chat_reactions' },
      (payload) => {
        const r = payload.new || payload.old;
        if (!r || !r.message_id) return;
        if (payload.eventType === 'INSERT') {
          if (!CHAT.reactions[r.message_id]) CHAT.reactions[r.message_id] = [];
          const already = CHAT.reactions[r.message_id].find(
            x => x.emoji === r.emoji && x.nickname === r.nickname
          );
          if (!already) {
            CHAT.reactions[r.message_id].push({ emoji: r.emoji, nickname: r.nickname });
          }
        } else if (payload.eventType === 'DELETE') {
          if (CHAT.reactions[r.message_id]) {
            CHAT.reactions[r.message_id] = CHAT.reactions[r.message_id].filter(
              x => !(x.emoji === r.emoji && x.nickname === r.nickname)
            );
          }
        }
        updateMessageReactionsUI(r.message_id);
      }
    )
    .subscribe();
}

// ============================================
// PRESENCE
// ============================================
function trackPresence() {
  const st = chatGetState();
  if (!st) return;
  if (CHAT.presenceChannel) {
    try { CHAT.client.removeChannel(CHAT.presenceChannel); } catch (e) {}
    CHAT.presenceChannel = null;
  }
  if (CHAT.presenceHeartbeat) {
    clearInterval(CHAT.presenceHeartbeat);
    CHAT.presenceHeartbeat = null;
  }

  const myNick = st.nickname || 'Аноним';
  const uniqueKey = myNick;

  CHAT.presenceChannel = CHAT.client.channel('fireland-online', {
    config: { presence: { key: uniqueKey } },
  });

  CHAT.presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const stateMap = CHAT.presenceChannel.presenceState();
      const nicks = new Set();
      CHAT.onlineAvatars = {};
      Object.values(stateMap).flat().forEach(p => {
        if (!p.nickname) return;
        nicks.add(p.nickname);
        if (p.avatar && !CHAT.onlineAvatars[p.nickname]) {
          CHAT.onlineAvatars[p.nickname] = p.avatar;
        }
      });
      CHAT.onlineUsers = [...nicks];
      renderOnlineList();
      updateTypingIndicator(stateMap);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await CHAT.presenceChannel.track({
          nickname: myNick,
          avatar: st.avatar || null,
          typing: false,
          online_at: new Date().toISOString(),
        });
      }
    });

  CHAT.presenceHeartbeat = setInterval(async () => {
    if (!CHAT.presenceChannel) return;
    const s = chatGetState();
    if (!s) return;
    try {
      await CHAT.presenceChannel.track({
        nickname: s.nickname || 'Аноним',
        avatar: s.avatar || null,
        typing: false,
        online_at: new Date().toISOString(),
      });
    } catch (e) {}
  }, 20000);
}

function reinitializePresenceWithNewNick() {
  if (!CHAT.client) return;
  setTimeout(() => trackPresence(), 300);
  setTimeout(() => updateChatBadge(), 600);
}

function handleTypingInput() {
  if (!CHAT.presenceChannel) return;
  const st = chatGetState();
  if (!st) return;
  CHAT.presenceChannel.track({
    nickname: st.nickname,
    avatar: st.avatar || null,
    typing: true,
    room: CHAT.currentRoom,
    online_at: new Date().toISOString(),
  });
  clearTimeout(CHAT.typingTimeout);
  CHAT.typingTimeout = setTimeout(() => {
    const s = chatGetState();
    if (!s || !CHAT.presenceChannel) return;
    CHAT.presenceChannel.track({
      nickname: s.nickname,
      avatar: s.avatar || null,
      typing: false,
      room: CHAT.currentRoom,
      online_at: new Date().toISOString(),
    });
  }, 2000);
}

function updateTypingIndicator(stateMap) {
  const statusEl = document.getElementById('chatStatus');
  if (!statusEl) return;
  const st = chatGetState();
  if (!st) return;
  const typers = new Set();
  Object.values(stateMap).flat().forEach(p => {
    if (!p.typing) return;
    if (p.nickname === st.nickname) return;
    if (CHAT.currentRoom === 'general' && (!p.room || p.room === 'general')) {
      typers.add(p.nickname);
    } else if (p.room === CHAT.currentRoom) {
      typers.add(p.nickname);
    }
  });
  const list = [...typers];
  if (list.length > 0) {
    statusEl.textContent = list.length === 1
      ? `${list[0]} печатает...`
      : `${list.length} печатают...`;
    statusEl.className = 'chat-header-status typing';
  } else {
    statusEl.textContent = '🟢 Онлайн';
    statusEl.className = 'chat-header-status connected';
  }
}

// ============================================
// ОНЛАЙН-СПИСОК
// ============================================
function renderOnlineList() {
  const box = document.getElementById('onlineList');
  const count = document.getElementById('onlineCount');
  if (!box) return;
  const st = chatGetState();
  if (!st) return;
  const users = [...CHAT.onlineUsers].sort((a, b) => {
    if (a === st.nickname) return -1;
    if (b === st.nickname) return 1;
    return a.localeCompare(b);
  });
  if (count) count.textContent = users.length;
  if (users.length === 0) {
    box.innerHTML = '<div class="chat-empty" style="padding:20px 10px;">Никого нет</div>';
    return;
  }
  box.innerHTML = users.map(nick => {
    const isMe = nick === st.nickname;
    const avatar = getAvatarForNick(nick);
    return `
      <div class="online-user ${isMe ? 'me' : ''}" data-nick="${chatEscape(nick)}" ${!isMe ? 'role="button" tabindex="0"' : ''}>
        <div class="online-avatar">${avatar}</div>
        <span class="nick">${chatEscape(nick)}${isMe ? ' (ты)' : ''}</span>
      </div>
    `;
  }).join('');
  box.querySelectorAll('.online-user:not(.me)').forEach(el => {
    el.addEventListener('click', () => openDmWith(el.dataset.nick));
  });
}

// ============================================
// ЛС
// ============================================
function openDmWith(peerNick) {
  const st = chatGetState();
  if (!st) return;
  if (!peerNick || peerNick === st.nickname) return;
  const room = makeDmRoom(st.nickname, peerNick);
  const existing = CHAT.dmList.find(d => d.room === room);
  if (existing) existing.unread = 0;
  else CHAT.dmList.unshift({ room, peer: peerNick, lastMsg: null, unread: 0 });
  switchRoom(room);
  renderDmList();
}

function openNewDmModal() {
  const st = chatGetState();
  if (!st) return;
  const online = CHAT.onlineUsers.filter(n => n !== st.nickname);
  if (online.length === 0) {
    alert('Сейчас никого нет в сети');
    return;
  }
  const choice = prompt(
    'Кому написать?\n\n' + online.map((n, i) => `${i + 1}. ${n}`).join('\n') + '\n\nВведи номер или ник:'
  );
  if (!choice) return;
  let peer = choice.trim();
  const num = parseInt(peer);
  if (!isNaN(num) && num >= 1 && num <= online.length) peer = online[num - 1];
  if (!CHAT.onlineUsers.includes(peer)) {
    alert('Такого игрока нет в онлайне');
    return;
  }
  openDmWith(peer);
}

function renderDmList() {
  const box = document.getElementById('dmList');
  if (!box) return;
  const st = chatGetState();
  if (!st) return;
  const visible = CHAT.dmList.filter(d => d.lastMsg !== null || CHAT.currentRoom === d.room);
  if (visible.length === 0) {
    box.innerHTML = '<div class="chat-empty" style="padding:14px 10px;font-size:12px;">Нажми на игрока в онлайне →</div>';
    return;
  }
  box.innerHTML = visible.map(dm => {
    const isActive = CHAT.currentRoom === dm.room;
    const unread = dm.unread || 0;
    const avatar = getAvatarForNick(dm.peer);
    return `
      <div class="dm-item ${isActive ? 'active' : ''}" data-room="${chatEscape(dm.room)}">
        <div class="dm-avatar">${avatar}</div>
        <div class="dm-info">
          <div class="dm-peer">${chatEscape(dm.peer)}</div>
          <div class="dm-preview">${dm.lastMsg ? chatEscape(dm.lastMsg.slice(0, 30)) : 'Нет сообщений'}</div>
        </div>
        ${unread > 0 ? `<div class="dm-unread">${unread > 99 ? '99+' : unread}</div>` : ''}
      </div>
    `;
  }).join('');
  box.querySelectorAll('.dm-item').forEach(el => {
    el.addEventListener('click', () => {
      const room = el.dataset.room;
      const dm = CHAT.dmList.find(d => d.room === room);
      if (dm) dm.unread = 0;
      switchRoom(room);
      renderDmList();
      updateChatBadge();
    });
  });
}

async function refreshDmList() {
  const st = chatGetState();
  if (!st || !st.nickname || st.nickname === 'Игрок') return;
  if (Date.now() - CHAT.lastDmFetch < 3000) return;
  CHAT.lastDmFetch = Date.now();
  try {
    const myPrefix1 = `dm_${st.nickname}_`;
    const res = await fetch(
      `${CHAT_URL}/rest/v1/chat_messages?or=(room.like.${encodeURIComponent(myPrefix1)}*,room.like.*_${encodeURIComponent(st.nickname)})&select=room,nickname,text,created_at&order=created_at.desc&limit=100`,
      { headers: chatHeaders() }
    );
    if (!res.ok) return;
    const rows = await res.json();
    const map = new Map();
    rows.forEach(r => {
      if (!r.room.startsWith('dm_')) return;
      if (!map.has(r.room)) map.set(r.room, r);
    });
    const newList = [];
    map.forEach((lastMsg, room) => {
      const peer = getPeerNick(room);
      if (!peer) return;
      const existing = CHAT.dmList.find(d => d.room === room);
      newList.push({
        room, peer,
        lastMsg: lastMsg.text,
        lastAt: lastMsg.created_at,
        unread: existing ? existing.unread : 0,
      });
    });
    newList.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    const manuallyOpened = CHAT.dmList.filter(d => !newList.find(n => n.room === d.room) && CHAT.currentRoom === d.room);
    CHAT.dmList = [...newList, ...manuallyOpened];
    renderDmList();
  } catch (e) {
    console.warn('[Chat] refreshDmList:', e);
  }
}

// ============================================
// КОМНАТЫ
// ============================================
function openRoomCreateModal() {
  const modal = document.getElementById('roomCreateModal');
  if (!modal) return;
  const nameEl = document.getElementById('roomNameInput');
  const dispEl = document.getElementById('roomDisplayInput');
  if (nameEl) nameEl.value = '';
  if (dispEl) dispEl.value = '';
  const hint = document.getElementById('roomCreateHint');
  if (hint) {
    hint.textContent = 'Только латиница, цифры, дефис и подчёркивание';
    hint.classList.remove('error');
  }
  modal.classList.add('show');
  setTimeout(() => nameEl && nameEl.focus(), 200);
}

function validateRoomName() {
  const input = document.getElementById('roomNameInput');
  const hint = document.getElementById('roomCreateHint');
  if (!input || !hint) return false;
  const val = input.value.trim().toLowerCase();
  const re = /^[a-z0-9_-]{3,30}$/;
  if (val.length === 0) {
    hint.textContent = 'Только латиница, цифры, дефис и подчёркивание';
    hint.classList.remove('error');
    return false;
  }
  if (!re.test(val)) {
    hint.textContent = '❌ Только латиница, цифры, - и _, от 3 до 30 символов';
    hint.classList.add('error');
    return false;
  }
  hint.textContent = '✅ ' + val;
  hint.classList.remove('error');
  return true;
}

async function handleCreateRoom() {
  const st = chatGetState();
  if (!st) return;
  const nameInput = document.getElementById('roomNameInput');
  const displayInput = document.getElementById('roomDisplayInput');
  if (!nameInput) return;
  const name = nameInput.value.trim().toLowerCase();
  const display = (displayInput && displayInput.value.trim()) || name;
  if (!validateRoomName()) return;
  const room = `room_${name}`;
  if (!st.myRooms) st.myRooms = [];
  if (!st.myRooms.find(r => r.room === room)) {
    st.myRooms.push({ room, name, display, created: Date.now() });
    chatSaveState();
  }
  const modal = document.getElementById('roomCreateModal');
  if (modal) modal.classList.remove('show');
  await loadMyRooms();
  switchRoom(room);
  renderRoomsList();
}

function loadMyRooms() {
  const st = chatGetState();
  if (!st) return;
  if (!st.myRooms) st.myRooms = [];
  CHAT.roomsList = [...st.myRooms];
  renderRoomsList();
}

function renderRoomsList() {
  const box = document.getElementById('roomsList');
  if (!box) return;
  const list = CHAT.roomsList || [];
  if (list.length === 0) {
    box.innerHTML = '<div class="chat-empty" style="padding:14px 10px;font-size:12px;">Нет комнат — создай первую!</div>';
    return;
  }
  box.innerHTML = list.map(r => {
    const isActive = CHAT.currentRoom === r.room;
    const key = r.room.replace('room_', '');
    return `
      <div class="room-item ${isActive ? 'active' : ''}" data-room="${chatEscape(r.room)}">
        <div class="room-icon">🏠</div>
        <div class="room-info">
          <div class="room-name">${chatEscape(r.display || r.name)}</div>
          <div class="room-key">#${chatEscape(key)}</div>
        </div>
      </div>
    `;
  }).join('');
  box.querySelectorAll('.room-item').forEach(el => {
    el.addEventListener('click', () => switchRoom(el.dataset.room));
  });
}

// ============================================
// ОТПРАВКА
// ============================================
async function handleSendClick() {
  const st = chatGetState();
  if (!st) return;
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  if (!input || CHAT.sending) return;
  const raw = input.value.trim();
  if (!raw) return;
  const nick = st.nickname;
  if (!nick || nick === 'Игрок') {
    alert('Сначала установи ник в профиле');
    return;
  }
  if (hasProfanity(raw)) {
    alert('🚫 Сообщение содержит недопустимые слова');
    return;
  }
  const clean = censorProfanity(raw).slice(0, 500);
  CHAT.sending = true;
  if (sendBtn) sendBtn.disabled = true;
  input.disabled = true;

  try {
    const body = {
      room: CHAT.currentRoom,
      nickname: nick,
      text: clean,
    };
    if (CHAT.replyTo) body.reply_to_id = CHAT.replyTo.id;

    const res = await fetch(`${CHAT_URL}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: chatHeaders({
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('[Chat] Ошибка отправки:', res.status, err);
      alert('Не удалось отправить сообщение');
      return;
    }
    const [saved] = await res.json();
    markSelfMessage(saved);
    const replyMsg = CHAT.replyTo;
    renderMessage(saved, true, false, replyMsg);
    if (CHAT.searchActive) filterMessagesBySearch();
    input.value = '';
    cancelReply();

    if (CHAT.presenceChannel) {
      CHAT.presenceChannel.track({
        nickname: nick,
        avatar: st.avatar || null,
        typing: false,
        room: CHAT.currentRoom,
        online_at: new Date().toISOString(),
      });
    }
    if (CHAT.currentRoom.startsWith('dm_')) refreshDmList();
  } catch (e) {
    console.warn('[Chat] Сеть:', e);
    alert('Нет соединения');
  } finally {
    CHAT.sending = false;
    if (sendBtn) sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }
}

// ============================================
// УДАЛЕНИЕ
// ============================================
async function deleteMessage(messageId) {
  if (!confirm('Удалить сообщение?')) return;
  try {
    const res = await fetch(
      `${CHAT_URL}/rest/v1/chat_messages?id=eq.${messageId}`,
      { method: 'DELETE', headers: chatHeaders() }
    );
    if (!res.ok) {
      const err = await res.text();
      console.warn('[Chat] Ошибка удаления:', res.status, err);
      alert('Не удалось удалить');
      return;
    }
    removeMessageFromUI(messageId);
  } catch (e) {
    console.warn('[Chat] Сеть:', e);
    alert('Нет соединения');
  }
}

function removeMessageFromUI(messageId) {
  const el = document.querySelector(`[data-message-id="${messageId}"]`);
  if (el) {
    el.style.transition = 'opacity 0.2s, transform 0.2s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    setTimeout(() => el.remove(), 200);
  }
}

// ============================================
// REPLY
// ============================================
function startReply(messageId, nickname, text) {
  CHAT.replyTo = { id: messageId, nickname, text };
  const preview = document.getElementById('chatReplyPreview');
  if (!preview) return;
  const nickEl = document.getElementById('chatReplyNick');
  const textEl = document.getElementById('chatReplyText');
  if (nickEl) nickEl.textContent = nickname;
  if (textEl) textEl.textContent = (text || '').slice(0, 60);
  preview.style.display = 'flex';
  const input = document.getElementById('chatInput');
  if (input) input.focus();
}

function cancelReply() {
  CHAT.replyTo = null;
  hideReplyPreview();
}

function hideReplyPreview() {
  const preview = document.getElementById('chatReplyPreview');
  if (preview) preview.style.display = 'none';
}

// ============================================
// РЕАКЦИИ
// ============================================
async function loadReactionsForMessages(messageIds) {
  if (messageIds.length === 0) return;
  try {
    const ids = messageIds.join(',');
    const res = await fetch(
      `${CHAT_URL}/rest/v1/chat_reactions?message_id=in.(${ids})&select=message_id,emoji,nickname`,
      { headers: chatHeaders() }
    );
    if (!res.ok) return;
    const rows = await res.json();
    CHAT.reactions = {};
    rows.forEach(r => {
      if (!CHAT.reactions[r.message_id]) CHAT.reactions[r.message_id] = [];
      CHAT.reactions[r.message_id].push({ emoji: r.emoji, nickname: r.nickname });
    });
  } catch (e) {
    console.warn('[Chat] loadReactions:', e);
  }
}

async function toggleReaction(messageId, emoji) {
  const st = chatGetState();
  if (!st) return;
  const myNick = st.nickname;
  if (!myNick || myNick === 'Игрок') return;
  const list = CHAT.reactions[messageId] || [];
  const existing = list.find(r => r.emoji === emoji && r.nickname === myNick);
  try {
    if (existing) {
      const res = await fetch(
        `${CHAT_URL}/rest/v1/chat_reactions?message_id=eq.${messageId}&nickname=eq.${encodeURIComponent(myNick)}&emoji=eq.${encodeURIComponent(emoji)}`,
        { method: 'DELETE', headers: chatHeaders() }
      );
      if (!res.ok) return;
      CHAT.reactions[messageId] = list.filter(
        r => !(r.emoji === emoji && r.nickname === myNick)
      );
    } else {
      const res = await fetch(`${CHAT_URL}/rest/v1/chat_reactions`, {
        method: 'POST',
        headers: chatHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message_id: messageId, nickname: myNick, emoji }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.warn('[Chat] toggleReaction:', res.status, err);
        return;
      }
      if (!CHAT.reactions[messageId]) CHAT.reactions[messageId] = [];
      CHAT.reactions[messageId].push({ emoji, nickname: myNick });
    }
    updateMessageReactionsUI(messageId);
  } catch (e) {
    console.warn('[Chat] toggleReaction сеть:', e);
  }
}

function updateMessageReactionsUI(messageId) {
  const msgEl = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!msgEl) return;
  const st = chatGetState();
  const bubble = msgEl.querySelector('.chat-bubble');
  if (!bubble) return;
  let reactionsEl = bubble.querySelector('.chat-reactions');
  const list = CHAT.reactions[messageId] || [];
  if (list.length === 0) {
    if (reactionsEl) reactionsEl.remove();
    return;
  }
  const grouped = {};
  list.forEach(r => {
    grouped[r.emoji] = grouped[r.emoji] || [];
    grouped[r.emoji].push(r.nickname);
  });
  const html = Object.entries(grouped).map(([emoji, nicks]) => {
    const mine = st && nicks.includes(st.nickname);
    return `<div class="chat-reaction ${mine ? 'mine' : ''}" data-emoji="${emoji}">
      <span>${emoji}</span><span class="r-count">${nicks.length}</span>
    </div>`;
  }).join('');
  if (!reactionsEl) {
    reactionsEl = document.createElement('div');
    reactionsEl.className = 'chat-reactions';
    bubble.appendChild(reactionsEl);
  }
  reactionsEl.innerHTML = html;
  reactionsEl.querySelectorAll('.chat-reaction').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleReaction(messageId, el.dataset.emoji);
    });
  });
}

function showReactionPicker(messageId) {
  const emoji = prompt('Реакция (1 эмодзи):', '👍');
  if (!emoji) return;
  const trimmed = emoji.trim().slice(0, 4);
  if (!trimmed) return;
  toggleReaction(messageId, trimmed);
}

// ============================================
// ПОИСК
// ============================================
function toggleSearch() {
  if (CHAT.searchActive) closeSearch();
  else openSearch();
}

function openSearch() {
  CHAT.searchActive = true;
  const panel = document.getElementById('chatSearchPanel');
  const btn = document.getElementById('chatSearchBtn');
  if (panel) panel.classList.add('show');
  if (btn) btn.classList.add('active');
  const input = document.getElementById('chatSearchInput');
  if (input) { input.value = ''; input.focus(); }
  CHAT.searchQuery = '';
  filterMessagesBySearch();
}

function closeSearch() {
  CHAT.searchActive = false;
  CHAT.searchQuery = '';
  const panel = document.getElementById('chatSearchPanel');
  const btn = document.getElementById('chatSearchBtn');
  if (panel) panel.classList.remove('show');
  if (btn) btn.classList.remove('active');
  filterMessagesBySearch();
}

function filterMessagesBySearch() {
  const box = document.getElementById('chatMessages');
  const countEl = document.getElementById('chatSearchCount');
  if (!box) return;
  const q = CHAT.searchQuery.toLowerCase();
  const messages = box.querySelectorAll('.chat-message');
  let found = 0;
  messages.forEach(m => {
    const text = m.querySelector('.text')?.textContent?.toLowerCase() || '';
    const nick = m.querySelector('.chat-author')?.textContent?.toLowerCase() || '';
    const match = !q || text.includes(q) || nick.includes(q);
    m.style.display = match ? '' : 'none';
    if (match && q) found++;
  });
  if (countEl) {
    if (!q) countEl.textContent = '';
    else countEl.textContent = found > 0 ? `${found} найдено` : 'ничего';
  }
}

// ============================================
// ЭМОДЗИ
// ============================================
function initEmojiPanel() {
  const panel = document.getElementById('chatEmojiPanel');
  if (!panel) return;
  panel.innerHTML = EMOJI_LIST.map(e =>
    `<button class="chat-emoji-btn-pick" data-emoji="${e}">${e}</button>`
  ).join('');
  panel.querySelectorAll('.chat-emoji-btn-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('chatInput');
      if (!input) return;
      input.value += btn.dataset.emoji;
      input.focus();
    });
  });
}

function toggleEmojiPanel() {
  const panel = document.getElementById('chatEmojiPanel');
  const btn = document.getElementById('chatEmojiBtn');
  if (!panel) return;
  CHAT.emojiPanelOpen = !CHAT.emojiPanelOpen;
  panel.style.display = CHAT.emojiPanelOpen ? 'flex' : 'none';
  if (btn) btn.classList.toggle('active', CHAT.emojiPanelOpen);
}

// ============================================
// РЕНДЕР
// ============================================
const recentSelfMessages = new Set();
function isRecentSelfMessage(msg) {
  return recentSelfMessages.has(`${msg.nickname}|${msg.text}|${msg.created_at}`);
}
function markSelfMessage(msg) {
  const key = `${msg.nickname}|${msg.text}|${msg.created_at}`;
  recentSelfMessages.add(key);
  setTimeout(() => recentSelfMessages.delete(key), 10000);
}

function findMessageById(id) {
  const el = document.querySelector(`[data-message-id="${id}"]`);
  if (!el) return null;
  const nick = el.querySelector('.chat-author')?.textContent || '';
  const text = el.querySelector('.text')?.textContent || '';
  return { id, nickname: nick, text };
}

function renderDateDivider(iso, forceLabel = null) {
  const box = document.getElementById('chatMessages');
  if (!box) return;
  const label = forceLabel || getDateLabel(iso);
  const lastDivider = box.querySelector('.chat-date-divider:last-of-type');
  if (lastDivider && lastDivider.textContent.trim() === label) return;
  const el = document.createElement('div');
  el.className = 'chat-date-divider';
  el.innerHTML = `<span>${chatEscape(label)}</span>`;
  box.appendChild(el);
}

function renderMessage(msg, scroll, grouped, replyMsg) {
  const box = document.getElementById('chatMessages');
  if (!box) return;
  const st = chatGetState();
  if (!st) return;
  const empty = box.querySelector('.chat-empty');
  if (empty) empty.remove();
  const isMe = msg.nickname === st.nickname;
  const time = formatChatTime(msg.created_at);

  const lastMsg = box.querySelector('.chat-message:last-of-type');
  if (!lastMsg) {
    renderDateDivider(msg.created_at);
  } else {
    const lastCreatedAt = lastMsg.dataset.createdAt;
    if (lastCreatedAt) {
      const lastDay = new Date(lastCreatedAt).toDateString();
      const thisDay = new Date(msg.created_at).toDateString();
      if (lastDay !== thisDay) renderDateDivider(msg.created_at);
    } else {
      renderDateDivider(msg.created_at);
    }
  }

  const el = document.createElement('div');
  el.className = 'chat-message' + (isMe ? ' me' : '') + (grouped ? ' grouped' : '');
  el.dataset.nick = msg.nickname;
  el.dataset.messageId = msg.id;
  el.dataset.createdAt = msg.created_at;

  const avatar = getAvatarForNick(msg.nickname);

  let replyHtml = '';
  if (replyMsg) {
    replyHtml = `
      <div class="chat-reply-quote" data-reply-id="${replyMsg.id}">
        <div class="r-nick">${chatEscape(replyMsg.nickname)}</div>
        <div class="r-text">${chatEscape((replyMsg.text || '').slice(0, 80))}</div>
      </div>
    `;
  }

  let mediaHtml = '';
  if (msg.image_url) {
    mediaHtml = `
      <div class="chat-image-wrapper" data-image-url="${chatEscape(msg.image_url)}">
        <img src="${chatEscape(msg.image_url)}" alt="картинка" loading="lazy">
      </div>
    `;
  } else if (msg.voice_url) {
    const dur = msg.voice_duration || 0;
    const durStr = `${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')}`;
    const barsCount = 30;
    let barsHtml = '';
    for (let i = 0; i < barsCount; i++) {
      const h = 6 + Math.random() * 16;
      barsHtml += `<div class="bar" style="height:${h}px"></div>`;
    }
    mediaHtml = `
      <div class="chat-voice-wrapper" data-voice-url="${chatEscape(msg.voice_url)}" data-duration="${dur}">
        <button class="chat-voice-play" data-play>▶</button>
        <div class="chat-voice-waveform">${barsHtml}</div>
        <span class="chat-voice-duration">${durStr}</span>
        <audio preload="none" src="${chatEscape(msg.voice_url)}"></audio>
      </div>
    `;
  }

  const textOrMedia = mediaHtml || `<div class="text">${chatEscape(msg.text)}</div>`;

  el.innerHTML = `
    ${!isMe ? `<div class="chat-avatar" data-nick="${chatEscape(msg.nickname)}">${avatar}</div>` : ''}
    <div class="chat-bubble">
      ${replyHtml}
      <div class="chat-author" data-nick="${chatEscape(msg.nickname)}">${chatEscape(msg.nickname)}</div>
      ${textOrMedia}
      <div class="chat-time">${time}</div>
      <div class="chat-message-actions">
        <button class="chat-action-btn" data-action="reply" title="Ответить">↩️</button>
        <button class="chat-action-btn" data-action="react" title="Реакция">😀</button>
        ${isMe ? `<button class="chat-action-btn danger" data-action="delete" title="Удалить">🗑️</button>` : ''}
      </div>
    </div>
    ${isMe ? `<div class="chat-avatar me">${avatar}</div>` : ''}
  `;

  el.querySelectorAll('.chat-image-wrapper').forEach(w => {
    w.addEventListener('click', () => openLightbox(w.dataset.imageUrl));
  });

  el.querySelectorAll('.chat-voice-wrapper').forEach(w => {
    const btn = w.querySelector('[data-play]');
    const audio = w.querySelector('audio');
    const bars = w.querySelectorAll('.bar');
    if (!btn || !audio) return;
    const updateBars = () => {
      const dur = parseFloat(audio.duration) || 1;
      const progress = audio.currentTime / dur;
      const playedCount = Math.floor(bars.length * progress);
      bars.forEach((b, i) => b.classList.toggle('played', i < playedCount));
    };
    btn.addEventListener('click', () => {
      if (audio.paused) {
        document.querySelectorAll('.chat-voice-wrapper audio').forEach(a => {
          if (a !== audio) { a.pause(); a.currentTime = 0; }
        });
        audio.play();
        btn.textContent = '⏸';
        btn.classList.add('playing');
        w.classList.add('playing');
      } else {
        audio.pause();
        btn.textContent = '▶';
        btn.classList.remove('playing');
        w.classList.remove('playing');
      }
    });
    audio.addEventListener('timeupdate', updateBars);
    audio.addEventListener('ended', () => {
      btn.textContent = '▶';
      btn.classList.remove('playing');
      w.classList.remove('playing');
      bars.forEach(b => b.classList.remove('played'));
    });
  });

  el.querySelectorAll('[data-nick]').forEach(node => {
    if (node.classList.contains('chat-avatar') && isMe) return;
    if (node.classList.contains('chat-author') && isMe) return;
    node.addEventListener('click', () => showUserProfile(msg.nickname));
  });

  el.querySelectorAll('.chat-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'reply') startReply(msg.id, msg.nickname, msg.text);
      else if (action === 'react') showReactionPicker(msg.id);
      else if (action === 'delete') deleteMessage(msg.id);
    });
  });

  const replyQuote = el.querySelector('.chat-reply-quote');
  if (replyQuote && replyMsg) {
    replyQuote.addEventListener('click', () => {
      const orig = document.querySelector(`[data-message-id="${replyMsg.id}"]`);
      if (orig) {
        orig.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const origBubble = orig.querySelector('.text');
        if (origBubble) {
          origBubble.style.transition = 'background 0.5s';
          origBubble.style.background = 'rgba(106,138,255,0.3)';
          setTimeout(() => { origBubble.style.background = ''; }, 1000);
        }
      }
    });
  }

  box.appendChild(el);
  updateMessageReactionsUI(msg.id);
  updateScrollDownBtn();

  if (scroll) {
    const nearBottom = isNearBottom(box);
    if (nearBottom) box.scrollTop = box.scrollHeight;
    else showNewMessageHint();
  }
}

function isNearBottom(box, threshold = 120) {
  return box.scrollHeight - box.scrollTop - box.clientHeight < threshold;
}

function scrollChatToBottom() {
  const box = document.getElementById('chatMessages');
  if (!box) return;
  box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
  hideNewMessageHint();
}

function updateScrollDownBtn() {
  const box = document.getElementById('chatMessages');
  const btn = document.getElementById('chatScrollDownBtn');
  if (!box || !btn) return;
  if (isNearBottom(box)) {
    btn.classList.remove('show');
    hideNewMessageHint();
  } else btn.classList.add('show');
}

function showNewMessageHint() {
  const btn = document.getElementById('chatScrollDownBtn');
  if (btn) btn.classList.add('show', 'has-new');
}

function hideNewMessageHint() {
  const btn = document.getElementById('chatScrollDownBtn');
  if (btn) btn.classList.remove('has-new');
}

function formatChatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function setChatStatus(text, cls) {
  const el = document.getElementById('chatStatus');
  if (!el) return;
  el.textContent = text;
  el.className = 'chat-header-status' + (cls ? ' ' + cls : '');
}

// ============================================
// АВАТАРКИ
// ============================================
function getAvatarForNick(nick) {
  const st = chatGetState();
  if (st && nick === st.nickname && st.avatar) {
    return `<img src="${st.avatar}" alt="">`;
  }
  if (CHAT.onlineAvatars[nick]) {
    return `<img src="${CHAT.onlineAvatars[nick]}" alt="">`;
  }
  return chatEscape(nick.charAt(0).toUpperCase());
}

// ============================================
// ПРОФИЛЬ ИГРОКА
// ============================================
async function showUserProfile(nick) {
  const st = chatGetState();
  if (!st) return;
  if (nick === st.nickname) {
    if (typeof renderProfile === 'function') renderProfile();
    if (typeof renderAchievements === 'function') renderAchievements();
    if (typeof renderRecords === 'function') renderRecords();
    if (typeof updateLevelDisplay === 'function') updateLevelDisplay();
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.add('show');
    return;
  }
  const modal = document.getElementById('userProfileModal');
  if (!modal) return;
  const nickEl = document.getElementById('userProfileNick');
  const levelEl = document.getElementById('userProfileLevel');
  const xpEl = document.getElementById('userProfileXp');
  const achEl = document.getElementById('userProfileAch');
  const titleEl = document.getElementById('userProfileTitle');
  const avatarEl = document.getElementById('userProfileAvatar');
  if (nickEl) nickEl.textContent = nick;
  if (levelEl) levelEl.textContent = '...';
  if (xpEl) xpEl.textContent = '...';
  if (achEl) achEl.textContent = '...';
  if (titleEl) titleEl.textContent = '...';
  if (avatarEl) avatarEl.innerHTML = getAvatarForNick(nick);
  modal.classList.add('show');
  try {
    const res = await fetch(
      `${CHAT_URL}/rest/v1/leaderboard?nickname=eq.${encodeURIComponent(nick)}&select=nickname,level,total_xp,achievements_count&limit=1`,
      { headers: chatHeaders() }
    );
    if (!res.ok) throw new Error('fetch failed');
    const [row] = await res.json();
    if (!row) {
      if (levelEl) levelEl.textContent = '—';
      if (xpEl) xpEl.textContent = '—';
      if (achEl) achEl.textContent = '—';
      if (titleEl) titleEl.textContent = 'Нет в лидерборде';
      return;
    }
    const title = typeof getTitleForLevel === 'function'
      ? getTitleForLevel(row.level) : 'Игрок';
    if (levelEl) levelEl.textContent = row.level;
    if (xpEl) xpEl.textContent = (row.total_xp || 0).toLocaleString('ru-RU');
    if (achEl) achEl.textContent = row.achievements_count || 0;
    if (titleEl) titleEl.textContent = title;
  } catch (e) {
    console.warn('[Chat] Профиль:', e);
    if (titleEl) titleEl.textContent = 'Ошибка загрузки';
  }
}

// ============================================
// НЕПРОЧИТАННЫЕ
// ============================================
function bumpUnread(room) {
  const st = chatGetState();
  if (!st) return;
  if (room === 'general') {
    st.unreadChatCount = (st.unreadChatCount || 0) + 1;
  } else {
    const dm = CHAT.dmList.find(d => d.room === room);
    if (dm) dm.unread = (dm.unread || 0) + 1;
    else {
      const peer = getPeerNick(room);
      if (peer) CHAT.dmList.unshift({ room, peer, lastMsg: null, unread: 1 });
    }
    renderDmList();
  }
  updateChatBadge();
  chatSaveState();
}

function updateChatBadge() {
  const st = chatGetState();
  if (!st) return;
  const tab = document.querySelector('.tab-btn[data-tab="chat"]');
  if (!tab) return;
  const old = tab.querySelector('.tab-badge');
  if (old) old.remove();
  const generalCount = st.unreadChatCount || 0;
  const dmCount = CHAT.dmList.reduce((sum, d) => sum + (d.unread || 0), 0);
  const total = generalCount + dmCount;
  if (total > 0) {
    const badge = document.createElement('span');
    badge.className = 'tab-badge';
    badge.textContent = total > 99 ? '99+' : total;
    tab.appendChild(badge);
  }
}

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================
function notifyNewMessage(msg) {
  const base = 'Лаунчер FireLand';
  const text = msg.text.length > 30 ? msg.text.slice(0, 30) + '…' : msg.text;
  document.title = `💬 ${msg.nickname}: ${text} — ${base}`;
  clearTimeout(notifyNewMessage._t);
  notifyNewMessage._t = setTimeout(() => { document.title = base; }, 4000);
}

// ============================================
// ОТКРЫТИЕ ВКЛАДКИ
// ============================================
function onChatTabOpen() {
  const st = chatGetState();
  if (!st) return;
  if (!CHAT.client) return;
  if (!CHAT.presenceChannel) trackPresence();
  subscribeToReactions();

  const box = document.getElementById('chatMessages');
  const boxIsEmpty = !box || box.innerHTML.trim() === '' || box.querySelector('.chat-empty');
  if (!CHAT.historyLoaded[CHAT.currentRoom] || boxIsEmpty) {
    loadChatHistory(CHAT.currentRoom, true);
  }
  if (!CHAT.subscribed[CHAT.currentRoom]) subscribeToRoom(CHAT.currentRoom);
  refreshDmList();
  loadMyRooms();

  if (CHAT.currentRoom === 'general') st.unreadChatCount = 0;
  else {
    const dm = CHAT.dmList.find(d => d.room === CHAT.currentRoom);
    if (dm) dm.unread = 0;
  }
  updateChatBadge();
  hideNickOnboarding();
  if (box) box.scrollTop = box.scrollHeight;
  st.lastReadChatAt = new Date().toISOString();
  chatSaveState();
}

// ============================================
// HEADER
// ============================================
function updateChatHeader() {
  const title = document.getElementById('chatHeaderTitle');
  const backBtn = document.getElementById('chatBackToGeneral');
  if (!title) return;
  if (CHAT.currentRoom === 'general') {
    title.textContent = '💬 Общий чат FireLand';
    if (backBtn) backBtn.style.display = 'none';
  } else if (CHAT.currentRoom.startsWith('dm_')) {
    const peer = getPeerNick(CHAT.currentRoom);
    title.textContent = `💬 ${peer || 'ЛС'}`;
    if (backBtn) backBtn.style.display = 'inline-flex';
  } else if (CHAT.currentRoom.startsWith('room_')) {
    const r = (CHAT.roomsList || []).find(x => x.room === CHAT.currentRoom);
    const display = r?.display || CHAT.currentRoom.replace('room_', '');
    title.textContent = `🏠 ${display}`;
    if (backBtn) backBtn.style.display = 'inline-flex';
  }
}

// ============================================
// ОНБОРДИНГ
// ============================================
function showNickOnboarding() {
  const el = document.getElementById('nickOnboarding');
  if (!el) return;
  const st = chatGetState();
  if (st && st.nickname && st.nickname !== 'Игрок') {
    el.classList.remove('show');
    return;
  }
  el.classList.add('show');
}

function hideNickOnboarding() {
  const el = document.getElementById('nickOnboarding');
  if (el) el.classList.remove('show');
}

function initNickOnboarding() {
  const el = document.getElementById('nickOnboarding');
  if (!el) return;
  const input = document.getElementById('onboardingNickInput');
  const btn = document.getElementById('onboardingNickSaveBtn');
  const skip = document.getElementById('onboardingSkipBtn');
  const hint = document.getElementById('onboardingNickHint');

  if (input) {
    input.addEventListener('input', () => {
      const val = input.value.trim();
      if (val.length === 0) {
        hint.textContent = 'От 2 до 20 символов, без пробелов';
        hint.classList.remove('error');
        input.classList.remove('error');
      } else if (val.length < 2) {
        hint.textContent = '❌ Минимум 2 символа';
        hint.classList.add('error');
        input.classList.add('error');
      } else if (val.length > 20) {
        hint.textContent = '❌ Максимум 20 символов';
        hint.classList.add('error');
        input.classList.add('error');
      } else if (/\s/.test(val)) {
        hint.textContent = '❌ Без пробелов';
        hint.classList.add('error');
        input.classList.add('error');
      } else {
        hint.textContent = '✅ ' + val;
        hint.classList.remove('error');
        input.classList.remove('error');
      }
    });
  }

  if (btn) {
    btn.addEventListener('click', async () => {
      const st = chatGetState();
      if (!st || !input) return;
      const nick = (input.value || '').trim();
      if (!nick || nick.length < 2 || /\s/.test(nick)) {
        input.focus();
        return;
      }
      const oldNick = st.nickname;
      st.nickname = nick.slice(0, 20);
      chatSaveState();
      if (typeof saveNickname === 'function') {
        btn.disabled = true;
        btn.textContent = '⏳';
        try { await saveNickname(); } catch {}
        btn.disabled = false;
        btn.textContent = '🔥 Начать играть';
      }
      if (typeof renderProfile === 'function') renderProfile();
      if (typeof updateChatBadge === 'function') updateChatBadge();
      hideNickOnboarding();
      if (typeof SOUNDS !== 'undefined' && SOUNDS.quest) SOUNDS.quest();
      if (oldNick !== st.nickname) reinitializePresenceWithNewNick();
    });
  }
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && btn) { e.preventDefault(); btn.click(); }
    });
  }
  if (skip) skip.addEventListener('click', hideNickOnboarding);
  showNickOnboarding();
}

// ============================================
// КАРТИНКИ В ЧАТЕ
// ============================================
async function handleImageUpload(e) {
  const st = chatGetState();
  if (!st) return;
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = '';

  if (!st.nickname || st.nickname === 'Игрок') {
    alert('Сначала установи ник в профиле');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('❌ Максимум 2 МБ');
    return;
  }
  if (!file.type.startsWith('image/')) {
    alert('❌ Только изображения');
    return;
  }

  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  if (sendBtn) sendBtn.disabled = true;
  if (input) input.disabled = true;

  try {
    const compressed = await compressImage(file, 800, 0.8);
    const fileName = `${st.nickname}_${Date.now()}.jpg`;
    const uploadUrl = `${CHAT_URL}/storage/v1/object/chat-images/${fileName}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': CHAT_ANON_KEY,
        'Authorization': `Bearer ${CHAT_ANON_KEY}`,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true',
      },
      body: compressed,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.warn('[Chat] upload image:', uploadRes.status, err);
      alert('Не удалось загрузить картинку');
      return;
    }

    const publicUrl = `${CHAT_URL}/storage/v1/object/public/chat-images/${fileName}`;

    const body = {
      room: CHAT.currentRoom,
      nickname: st.nickname,
      text: '📷 Картинка',
      image_url: publicUrl,
    };
    if (CHAT.replyTo) body.reply_to_id = CHAT.replyTo.id;

    const res = await fetch(`${CHAT_URL}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: chatHeaders({
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn('[Chat] insert image:', res.status);
      alert('Не удалось отправить');
      return;
    }

    const [saved] = await res.json();
    markSelfMessage(saved);
    renderMessage(saved, true, false, CHAT.replyTo);
    cancelReply();
  } catch (err) {
    console.warn('[Chat] image error:', err);
    alert('Ошибка загрузки');
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.disabled = false;
  }
}

function compressImage(file, maxSize, quality) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function openLightbox(url) {
  const lb = document.getElementById('chatLightbox');
  const img = document.getElementById('chatLightboxImg');
  if (!lb || !img) return;
  img.src = url;
  lb.style.display = 'flex';
}
function closeLightbox() {
  const lb = document.getElementById('chatLightbox');
  if (lb) lb.style.display = 'none';
}

// ============================================
// ГОЛОСОВЫЕ СООБЩЕНИЯ · FIXED
// ============================================
let voiceRecorder = null;
let voiceChunks = [];
let voiceStartTime = 0;
let voiceTimerInterval = null;
let voiceStream = null;
let voiceSendAfterStop = false;

async function toggleVoiceRecording() {
  const st = chatGetState();
  if (!st) return;

  if (voiceRecorder && voiceRecorder.state === 'recording') {
    stopVoiceRecording(true);
    return;
  }

  if (!st.nickname || st.nickname === 'Игрок') {
    alert('Сначала установи ник в профиле');
    return;
  }

  try {
    voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceRecorder = new MediaRecorder(voiceStream);
    voiceChunks = [];
    voiceSendAfterStop = false;

    voiceRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) voiceChunks.push(e.data);
    };

    voiceRecorder.onstop = () => {
      if (voiceStream) {
        voiceStream.getTracks().forEach(t => t.stop());
        voiceStream = null;
      }
      if (voiceSendAfterStop) {
        voiceSendAfterStop = false;
        uploadVoiceMessage();
      }
      voiceRecorder = null;
    };

    voiceRecorder.start();
    voiceStartTime = Date.now();

    const bar = document.getElementById('chatRecordingBar');
    const timeEl = document.getElementById('chatRecordingTime');
    const voiceBtn = document.getElementById('chatVoiceBtn');
    if (bar) bar.style.display = 'flex';
    if (voiceBtn) voiceBtn.classList.add('recording');

    voiceTimerInterval = setInterval(() => {
      const sec = Math.floor((Date.now() - voiceStartTime) / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, '0');
      const ss = String(sec % 60).padStart(2, '0');
      if (timeEl) timeEl.textContent = `${mm}:${ss}`;
      if (sec >= 60) stopVoiceRecording(true);
    }, 200);
  } catch (e) {
    console.warn('[Chat] mic error:', e);
    alert('Не удалось получить доступ к микрофону');
  }
}

function stopVoiceRecording(send) {
  if (voiceRecorder && voiceRecorder.state === 'recording') {
    voiceSendAfterStop = !!send;
    try { voiceRecorder.stop(); } catch (e) {}
  }
  if (voiceTimerInterval) {
    clearInterval(voiceTimerInterval);
    voiceTimerInterval = null;
  }
  const bar = document.getElementById('chatRecordingBar');
  const voiceBtn = document.getElementById('chatVoiceBtn');
  if (bar) bar.style.display = 'none';
  if (voiceBtn) voiceBtn.classList.remove('recording');
}

function cancelVoiceRecording() {
  voiceChunks = [];
  voiceSendAfterStop = false;
  stopVoiceRecording(false);
}

async function sendVoiceRecording() {
  stopVoiceRecording(true);
}

async function uploadVoiceMessage() {
  const st = chatGetState();
  if (!st) return;
  if (!voiceChunks || voiceChunks.length === 0) return;
  const duration = Math.max(1, Math.floor((Date.now() - voiceStartTime) / 1000));

  const blob = new Blob(voiceChunks, { type: 'audio/webm' });
  voiceChunks = [];

  if (blob.size > 1024 * 1024) {
    alert('❌ Максимум 1 МБ (попробуй короче)');
    return;
  }

  const voiceBtn = document.getElementById('chatVoiceBtn');
  if (voiceBtn) voiceBtn.disabled = true;

  try {
    const fileName = `${st.nickname}_${Date.now()}.webm`;
    const uploadUrl = `${CHAT_URL}/storage/v1/object/chat-voice/${fileName}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': CHAT_ANON_KEY,
        'Authorization': `Bearer ${CHAT_ANON_KEY}`,
        'Content-Type': 'audio/webm',
        'x-upsert': 'true',
      },
      body: blob,
    });

    if (!uploadRes.ok) {
      console.warn('[Chat] upload voice:', uploadRes.status);
      alert('Не удалось загрузить голосовое');
      return;
    }

    const publicUrl = `${CHAT_URL}/storage/v1/object/public/chat-voice/${fileName}`;

    const body = {
      room: CHAT.currentRoom,
      nickname: st.nickname,
      text: '🎤 Голосовое',
      voice_url: publicUrl,
      voice_duration: duration,
    };
    if (CHAT.replyTo) body.reply_to_id = CHAT.replyTo.id;

    const res = await fetch(`${CHAT_URL}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: chatHeaders({
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn('[Chat] insert voice:', res.status);
      alert('Не удалось отправить');
      return;
    }

    const [saved] = await res.json();
    markSelfMessage(saved);
    renderMessage(saved, true, false, CHAT.replyTo);
    cancelReply();
  } catch (err) {
    console.warn('[Chat] voice error:', err);
    alert('Ошибка загрузки');
  } finally {
    if (voiceBtn) voiceBtn.disabled = false;
  }
}

// ============================================
// АВТОИНИЦИАЛИЗАЦИЯ · ждём state
// ============================================
function tryInitMessenger(attempt = 0) {
  if (typeof state !== 'undefined' && state) {
    initMessenger();
    initNickOnboarding();
    return;
  }
  if (attempt < 40) {
    setTimeout(() => tryInitMessenger(attempt + 1), 250);
  } else {
    console.warn('[Chat] state так и не появился — инициализирую без него');
    initMessenger();
    initNickOnboarding();
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => tryInitMessenger(), 300);
} else {
  window.addEventListener('load', () => setTimeout(() => tryInitMessenger(), 300));
}

let _presenceRefreshTimer = null;
window.debouncedPresenceRefresh = function() {
  clearTimeout(_presenceRefreshTimer);
  _presenceRefreshTimer = setTimeout(() => {
    const st = chatGetState();
    if (st && st.nickname && st.nickname !== 'Игрок') {
      reinitializePresenceWithNewNick();
    }
  }, 1500);
};

// ============================================
// ЭКСПОРТ
// ============================================
window.onChatTabOpen = onChatTabOpen;
window.updateChatBadge = updateChatBadge;
window.reinitializePresenceWithNewNick = reinitializePresenceWithNewNick;
window.openDmWith = openDmWith;
window.switchRoom = switchRoom;
window.showUserProfile = showUserProfile;