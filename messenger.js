// ============================================
// FireLand Messenger v17 · Publishable key only
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
};

const CHAT_URL = SUPABASE_URL;
const CHAT_ANON_KEY = SUPABASE_ANON_KEY;

const EMOJI_LIST = [
  '😀','😂','🥰','😎','🤔','😢','😡','🥳','😴','🤯',
  '👍','👎','❤️','🔥','✨','🎉','💯','👀','🤝','💪',
  '🚀','⚡','🌟','🌈','🍕','🍔','☕','🎮','🎵','🎨',
  '😅','🙃','😇','🤩','😱','🤗','🤫','🙄','😬','💀',
];

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
  console.log('[Chat] Мессенджер v17 · publishable key only');
}

function chatHeaders(extra = {}) {
  return {
    'apikey': CHAT_ANON_KEY,
    'Authorization': `Bearer ${CHAT_ANON_KEY}`,
    ...extra,
  };
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

  const scrollBtn = document.getElementById('chatScrollDownBtn');
  if (scrollBtn) scrollBtn.addEventListener('click', scrollChatToBottom);

  const box = document.getElementById('chatMessages');
  if (box) box.addEventListener('scroll', () => updateScrollDownBtn());

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
  if (CHAT.currentRoom === room && CHAT.historyLoaded[room]) {
    updateChatHeader();
    return;
  }
  const oldRoom = CHAT.currentRoom;
  if (CHAT.subscribed[oldRoom]) {
    CHAT.client.removeChannel(CHAT.subscribed[oldRoom]);
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
  return parsed.a === state.nickname ? parsed.b : parsed.a;
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
      `${CHAT_URL}/rest/v1/chat_messages?room=eq.${encodeURIComponent(room)}&select=id,nickname,text,created_at,reply_to_id&order=created_at.asc&limit=150`,
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
        const msg = payload.new;
        if (msg.nickname === state.nickname && isRecentSelfMessage(msg)) return;
        const isCurrent = CHAT.currentRoom === room;
        const isHidden = document.hidden;
        if (msg.nickname !== state.nickname && (!isCurrent || isHidden)) {
          bumpUnread(room);
        }
        if (isCurrent) {
          const replyMsg = msg.reply_to_id ? findMessageById(msg.reply_to_id) : null;
          renderMessage(msg, true, false, replyMsg);
          if (CHAT.searchActive) filterMessagesBySearch();
        }
        if (msg.nickname !== state.nickname) {
          playTone(880, 0.08, 'sine', 0.06);
          setTimeout(() => playTone(1175, 0.12, 'sine', 0.06), 80);
        }
        if (document.hidden && msg.nickname !== state.nickname) {
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
  if (CHAT.presenceChannel) {
    try { CHAT.client.removeChannel(CHAT.presenceChannel); } catch (e) {}
    CHAT.presenceChannel = null;
  }
  const myNick = state.nickname || 'Аноним';
  const uniqueKey = `${myNick}__${Math.random().toString(36).slice(2, 8)}`;
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
          avatar: state.avatar || null,
          typing: false,
          online_at: new Date().toISOString(),
        });
      }
    });
}

function reinitializePresenceWithNewNick() {
  if (!CHAT.client) return;
  setTimeout(() => trackPresence(), 300);
  setTimeout(() => updateChatBadge(), 600);
}

function handleTypingInput() {
  if (!CHAT.presenceChannel) return;
  CHAT.presenceChannel.track({
    nickname: state.nickname,
    avatar: state.avatar || null,
    typing: true,
    room: CHAT.currentRoom,
    online_at: new Date().toISOString(),
  });
  clearTimeout(CHAT.typingTimeout);
  CHAT.typingTimeout = setTimeout(() => {
    CHAT.presenceChannel.track({
      nickname: state.nickname,
      avatar: state.avatar || null,
      typing: false,
      room: CHAT.currentRoom,
      online_at: new Date().toISOString(),
    });
  }, 2000);
}

function updateTypingIndicator(stateMap) {
  const statusEl = document.getElementById('chatStatus');
  if (!statusEl) return;
  const typers = new Set();
  Object.values(stateMap).flat().forEach(p => {
    if (!p.typing) return;
    if (p.nickname === state.nickname) return;
    if (CHAT.currentRoom === 'general' && (!p.room || p.room === 'general')) {
      typers.add(p.nickname);
    } else if (p.room === CHAT.currentRoom) {
      typers.add(p.nickname);
    }
  });
  const list = [...typers];
  if (list.length > 0) {
    statusEl.textContent = list.length === 1 ? `${list[0]} печатает...` : `${list.length} печатают...`;
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
  const users = [...CHAT.onlineUsers].sort((a, b) => {
    if (a === state.nickname) return -1;
    if (b === state.nickname) return 1;
    return a.localeCompare(b);
  });
  if (count) count.textContent = users.length;
  if (users.length === 0) {
    box.innerHTML = '<div class="chat-empty" style="padding:20px 10px;">Никого нет</div>';
    return;
  }
  box.innerHTML = users.map(nick => {
    const isMe = nick === state.nickname;
    const avatar = getAvatarForNick(nick);
    return `
      <div class="online-user ${isMe ? 'me' : ''}" data-nick="${escapeHtml(nick)}" ${!isMe ? 'role="button" tabindex="0"' : ''}>
        <div class="online-avatar">${avatar}</div>
        <span class="nick">${escapeHtml(nick)}${isMe ? ' (ты)' : ''}</span>
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
  if (!peerNick || peerNick === state.nickname) return;
  const room = makeDmRoom(state.nickname, peerNick);
  const existing = CHAT.dmList.find(d => d.room === room);
  if (existing) existing.unread = 0;
  else CHAT.dmList.unshift({ room, peer: peerNick, lastMsg: null, unread: 0 });
  switchRoom(room);
  renderDmList();
}

function openNewDmModal() {
  const online = CHAT.onlineUsers.filter(n => n !== state.nickname);
  if (online.length === 0) { alert('Сейчас никого нет в сети'); return; }
  const choice = prompt('Кому написать?\n\n' + online.map((n, i) => `${i + 1}. ${n}`).join('\n') + '\n\nВведи номер или ник:');
  if (!choice) return;
  let peer = choice.trim();
  const num = parseInt(peer);
  if (!isNaN(num) && num >= 1 && num <= online.length) peer = online[num - 1];
  if (!CHAT.onlineUsers.includes(peer)) { alert('Такого игрока нет в онлайне'); return; }
  openDmWith(peer);
}

function renderDmList() {
  const box = document.getElementById('dmList');
  if (!box) return;
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
      <div class="dm-item ${isActive ? 'active' : ''}" data-room="${escapeHtml(dm.room)}">
        <div class="dm-avatar">${avatar}</div>
        <div class="dm-info">
          <div class="dm-peer">${escapeHtml(dm.peer)}</div>
          <div class="dm-preview">${dm.lastMsg ? escapeHtml(dm.lastMsg.slice(0, 30)) : 'Нет сообщений'}</div>
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
  if (!state.nickname || state.nickname === 'Игрок') return;
  if (Date.now() - CHAT.lastDmFetch < 3000) return;
  CHAT.lastDmFetch = Date.now();
  try {
    const myPrefix1 = `dm_${state.nickname}_`;
    const res = await fetch(
      `${CHAT_URL}/rest/v1/chat_messages?or=(room.like.${encodeURIComponent(myPrefix1)}*,room.like.*_${encodeURIComponent(state.nickname)})&select=room,nickname,text,created_at&order=created_at.desc&limit=100`,
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
  document.getElementById('roomNameInput').value = '';
  document.getElementById('roomDisplayInput').value = '';
  const hint = document.getElementById('roomCreateHint');
  hint.textContent = 'Только латиница, цифры, дефис и подчёркивание';
  hint.classList.remove('error');
  modal.classList.add('show');
  setTimeout(() => document.getElementById('roomNameInput').focus(), 200);
}

function validateRoomName() {
  const val = document.getElementById('roomNameInput').value.trim().toLowerCase();
  const hint = document.getElementById('roomCreateHint');
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
  const nameInput = document.getElementById('roomNameInput');
  const displayInput = document.getElementById('roomDisplayInput');
  const name = nameInput.value.trim().toLowerCase();
  const display = displayInput.value.trim() || name;
  if (!validateRoomName()) return;
  const room = `room_${name}`;
  if (!state.myRooms) state.myRooms = [];
  if (!state.myRooms.find(r => r.room === room)) {
    state.myRooms.push({ room, name, display, created: Date.now() });
    saveState();
  }
  document.getElementById('roomCreateModal').classList.remove('show');
  await loadMyRooms();
  switchRoom(room);
  renderRoomsList();
}

function loadMyRooms() {
  if (!state.myRooms) state.myRooms = [];
  CHAT.roomsList = [...state.myRooms];
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
      <div class="room-item ${isActive ? 'active' : ''}" data-room="${escapeHtml(r.room)}">
        <div class="room-icon">🏠</div>
        <div class="room-info">
          <div class="room-name">${escapeHtml(r.display || r.name)}</div>
          <div class="room-key">#${escapeHtml(key)}</div>
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
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  if (!input || CHAT.sending) return;
  const raw = input.value.trim();
  if (!raw) return;
  const nick = state.nickname;
  if (!nick || nick === 'Игрок') { alert('Сначала установи ник в профиле'); return; }
  if (hasProfanity(raw)) { alert('🚫 Сообщение содержит недопустимые слова'); return; }
  const clean = censorProfanity(raw).slice(0, 500);
  CHAT.sending = true;
  if (sendBtn) sendBtn.disabled = true;
  input.disabled = true;

  try {
    const body = { room: CHAT.currentRoom, nickname: nick, text: clean };
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
        nickname: state.nickname,
        avatar: state.avatar || null,
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
  document.getElementById('chatReplyNick').textContent = nickname;
  document.getElementById('chatReplyText').textContent = text.slice(0, 60);
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
  const myNick = state.nickname;
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
      CHAT.reactions[messageId] = list.filter(r => !(r.emoji === emoji && r.nickname === myNick));
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
    const mine = nicks.includes(state.nickname);
    return `<div class="chat-reaction ${mine ? 'mine' : ''}" data-emoji="${emoji}"><span>${emoji}</span><span class="r-count">${nicks.length}</span></div>`;
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

function renderDateDivider(iso) {
  const box = document.getElementById('chatMessages');
  if (!box) return;
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  let label;
  if (sameDay(d, today)) label = 'Сегодня';
  else if (sameDay(d, yesterday)) label = 'Вчера';
  else label = d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
  const el = document.createElement('div');
  el.className = 'chat-date-divider';
  el.innerHTML = `<span>${label}</span>`;
  box.appendChild(el);
}

function renderMessage(msg, scroll, grouped, replyMsg) {
  const box = document.getElementById('chatMessages');
  if (!box) return;
  const empty = box.querySelector('.chat-empty');
  if (empty) empty.remove();
  const isMe = msg.nickname === state.nickname;
  const time = formatChatTime(msg.created_at);
  if (!box.querySelector('.chat-message:last-of-type')) {
    renderDateDivider(msg.created_at);
  }

  const el = document.createElement('div');
  el.className = 'chat-message' + (isMe ? ' me' : '') + (grouped ? ' grouped' : '');
  el.dataset.nick = msg.nickname;
  el.dataset.messageId = msg.id;

  const avatar = getAvatarForNick(msg.nickname);

  let replyHtml = '';
  if (replyMsg) {
    replyHtml = `
      <div class="chat-reply-quote" data-reply-id="${replyMsg.id}">
        <div class="r-nick">${escapeHtml(replyMsg.nickname)}</div>
        <div class="r-text">${escapeHtml(replyMsg.text.slice(0, 80))}</div>
      </div>
    `;
  }

  el.innerHTML = `
    ${!isMe ? `<div class="chat-avatar" data-nick="${escapeHtml(msg.nickname)}">${avatar}</div>` : ''}
    <div class="chat-bubble">
      ${replyHtml}
      <div class="chat-author" data-nick="${escapeHtml(msg.nickname)}">${escapeHtml(msg.nickname)}</div>
      <div class="text">${escapeHtml(msg.text)}</div>
      <div class="chat-time">${time}</div>
    </div>
    ${isMe ? `<div class="chat-avatar me">${avatar}</div>` : ''}
    <div class="chat-message-actions">
      <button class="chat-action-btn" data-action="reply" title="Ответить">↩️</button>
      <button class="chat-action-btn" data-action="react" title="Реакция">😀</button>
      ${isMe ? `<button class="chat-action-btn danger" data-action="delete" title="Удалить">🗑️</button>` : ''}
    </div>
  `;

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
  if (replyQuote) {
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
  if (nick === state.nickname && state.avatar) {
    return `<img src="${state.avatar}" alt="">`;
  }
  if (CHAT.onlineAvatars[nick]) {
    return `<img src="${CHAT.onlineAvatars[nick]}" alt="">`;
  }
  return escapeHtml(nick.charAt(0).toUpperCase());
}

// ============================================
// ПРОФИЛЬ ИГРОКА
// ============================================
async function showUserProfile(nick) {
  if (nick === state.nickname) {
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
  document.getElementById('userProfileNick').textContent = nick;
  document.getElementById('userProfileLevel').textContent = '...';
  document.getElementById('userProfileXp').textContent = '...';
  document.getElementById('userProfileAch').textContent = '...';
  document.getElementById('userProfileTitle').textContent = '...';
  const avatarEl = document.getElementById('userProfileAvatar');
  avatarEl.innerHTML = getAvatarForNick(nick);
  modal.classList.add('show');
  try {
    const res = await fetch(
      `${CHAT_URL}/rest/v1/leaderboard?nickname=eq.${encodeURIComponent(nick)}&select=nickname,level,total_xp,achievements_count&limit=1`,
      { headers: chatHeaders() }
    );
    if (!res.ok) throw new Error('fetch failed');
    const [row] = await res.json();
    if (!row) {
      document.getElementById('userProfileLevel').textContent = '—';
      document.getElementById('userProfileXp').textContent = '—';
      document.getElementById('userProfileAch').textContent = '—';
      document.getElementById('userProfileTitle').textContent = 'Нет в лидерборде';
      return;
    }
    const title = typeof getTitleForLevel === 'function' ? getTitleForLevel(row.level) : 'Игрок';
    document.getElementById('userProfileLevel').textContent = row.level;
    document.getElementById('userProfileXp').textContent = (row.total_xp || 0).toLocaleString('ru-RU');
    document.getElementById('userProfileAch').textContent = row.achievements_count || 0;
    document.getElementById('userProfileTitle').textContent = title;
  } catch (e) {
    console.warn('[Chat] Профиль:', e);
    document.getElementById('userProfileTitle').textContent = 'Ошибка загрузки';
  }
}

// ============================================
// НЕПРОЧИТАННЫЕ
// ============================================
function bumpUnread(room) {
  if (room === 'general') {
    state.unreadChatCount = (state.unreadChatCount || 0) + 1;
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
  saveState();
}

function updateChatBadge() {
  const tab = document.querySelector('.tab-btn[data-tab="chat"]');
  if (!tab) return;
  const old = tab.querySelector('.tab-badge');
  if (old) old.remove();
  const generalCount = state.unreadChatCount || 0;
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

  if (CHAT.currentRoom === 'general') state.unreadChatCount = 0;
  else {
    const dm = CHAT.dmList.find(d => d.room === CHAT.currentRoom);
    if (dm) dm.unread = 0;
  }
  updateChatBadge();
  hideNickOnboarding();
  if (box) box.scrollTop = box.scrollHeight;
  state.lastReadChatAt = new Date().toISOString();
  saveState();
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
  if (state.nickname && state.nickname !== 'Игрок') {
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
      const nick = (input.value || '').trim();
      if (!nick || nick.length < 2 || /\s/.test(nick)) {
        input.focus();
        return;
      }
      const oldNick = state.nickname;
      state.nickname = nick.slice(0, 20);
      saveState();
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
      if (oldNick !== state.nickname) reinitializePresenceWithNewNick();
    });
  }
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); btn.click(); }
    });
  }
  if (skip) skip.addEventListener('click', hideNickOnboarding);
  showNickOnboarding();
}

// ============================================
// ESCAPE HTML
// ============================================
if (typeof window.escapeHtml !== 'function') {
  window.escapeHtml = function (text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
}

// ============================================
// АВТОИНИЦИАЛИЗАЦИЯ
// ============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    initMessenger();
    initNickOnboarding();
  }, 500);
});

let _presenceRefreshTimer = null;
window.debouncedPresenceRefresh = function() {
  clearTimeout(_presenceRefreshTimer);
  _presenceRefreshTimer = setTimeout(() => {
    if (state.nickname && state.nickname !== 'Игрок') {
      reinitializePresenceWithNewNick();
    }
  }, 1500);
};

window.onChatTabOpen = onChatTabOpen;
window.updateChatBadge = updateChatBadge;
window.reinitializePresenceWithNewNick = reinitializePresenceWithNewNick;
window.openDmWith = openDmWith;
window.switchRoom = switchRoom;