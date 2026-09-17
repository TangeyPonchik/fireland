// ============================================
// FireLand Community v4 · Cache-busting + Comments + Fav + Edit
// ============================================

const COMM = {
  games: [],
  loading: false,
  comments: {},
  editingGameId: null,
};

const COMMUNITY_BUCKET = 'games';
const COMMUNITY_URL = SUPABASE_URL;
const COMMUNITY_KEY = SUPABASE_ANON_KEY;

function commHeaders(extra = {}) {
  return {
    'apikey': COMMUNITY_KEY,
    'Authorization': `Bearer ${COMMUNITY_KEY}`,
    ...extra,
  };
}
function commEscape(text) {
  return (window.escapeHtml || function(t){return t})(text);
}
function commGetState() {
  if (typeof state !== 'undefined' && state) return state;
  return null;
}
function commSaveState(immediate = false) {
  if (typeof saveState === 'function') {
    try { saveState(immediate); } catch (e) {}
  }
}
function commFavKey(gameId) { return 'community_' + gameId; }
function isFav(gameId) {
  const st = commGetState();
  return st && st.favorites && st.favorites.includes(commFavKey(gameId));
}

// ============================================
// СПИСОК ИГР
// ============================================
async function loadCommunityGames() {
  if (COMM.loading) return;
  COMM.loading = true;
  const panel = document.getElementById('communityPanel');
  if (!panel) { COMM.loading = false; return; }
  panel.innerHTML = '<div class="community-empty">⏳ Загрузка...</div>';
  try {
    const res = await fetch(
      `${COMMUNITY_URL}/rest/v1/games?approved=eq.true&select=*&order=created_at.desc&limit=100`,
      { headers: commHeaders() }
    );
    if (!res.ok) {
      panel.innerHTML = '<div class="community-empty">❌ Ошибка загрузки</div>';
      return;
    }
    COMM.games = await res.json();
    await loadAllCommentCounts();
    renderCommunityGames();
  } catch (e) {
    console.warn('[Community] load:', e);
    panel.innerHTML = '<div class="community-empty">❌ Нет соединения</div>';
  } finally {
    COMM.loading = false;
  }
}

async function loadAllCommentCounts() {
  if (COMM.games.length === 0) return;
  try {
    const ids = COMM.games.map(g => g.id).join(',');
    const res = await fetch(
      `${COMMUNITY_URL}/rest/v1/game_comments?game_id=in.(${ids})&select=game_id`,
      { headers: commHeaders() }
    );
    if (!res.ok) return;
    const rows = await res.json();
    COMM.comments = {};
    rows.forEach(r => {
      if (!COMM.comments[r.game_id]) COMM.comments[r.game_id] = [];
      COMM.comments[r.game_id].push({});
    });
  } catch (e) {}
}

function renderCommunityGames() {
  const panel = document.getElementById('communityPanel');
  const count = document.getElementById('communityCount');
  if (!panel) return;
  const st = commGetState();
  if (count) count.textContent = COMM.games.length + ' игр';

  if (COMM.games.length === 0) {
    panel.innerHTML = `
      <div class="community-empty">
        <div style="font-size:80px;margin-bottom:16px;">🌍</div>
        <div style="font-size:22px;font-weight:800;margin-bottom:8px;">Пока нет игр от сообщества</div>
        <div style="color:var(--text-secondary);font-size:14px;">Стань первым! Загрузи свою игру.</div>
      </div>`;
    return;
  }

  panel.innerHTML = COMM.games.map(g => {
    const isMine = st && g.author_nick === st.nickname;
    const bg = g.bg && g.bg.trim() ? g.bg : '';
    const fav = isFav(g.id);
    const commentCount = (COMM.comments[g.id] || []).length;
    return `
      <div class="community-card" data-game-id="${g.id}">
        ${bg ? `<div class="community-card-bg" style="background:${commEscape(bg)};"></div>` : ''}
        ${isMine ? `
          <button class="community-card-delete" data-delete-id="${g.id}" title="Удалить">✕</button>
          <button class="community-card-edit" data-edit-id="${g.id}" title="Редактировать">✏️</button>
        ` : ''}
        <button class="community-card-fav ${fav ? 'active' : ''}" data-fav-id="${g.id}">${fav ? '⭐' : '☆'}</button>
        <div class="community-card-icon">${commEscape(g.icon || '🎮')}</div>
        <div class="community-card-name">${commEscape(g.name)}</div>
        <div class="community-card-genre">${commEscape(g.genre || 'Разное')}</div>
        <div class="community-card-author">от <b>${commEscape(g.author_nick)}</b></div>
        <div class="community-card-plays">▶ ${g.plays || 0} · 💬 ${commentCount}</div>
      </div>`;
  }).join('');

  panel.querySelectorAll('.community-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.community-card-delete')) return;
      if (e.target.closest('.community-card-edit')) return;
      if (e.target.closest('.community-card-fav')) return;
      const id = card.dataset.gameId;
      const game = COMM.games.find(g => String(g.id) === id);
      if (game) openCommunityGame(game);
    });
  });

  panel.querySelectorAll('.community-card-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      const game = COMM.games.find(g => String(g.id) === id);
      if (game) deleteCommunityGame(game);
    });
  });

  panel.querySelectorAll('.community-card-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.editId;
      const game = COMM.games.find(g => String(g.id) === id);
      if (game) openEditModal(game);
    });
  });

  panel.querySelectorAll('.community-card-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.favId;
      const key = commFavKey(id);
      const st2 = commGetState();
      if (!st2) return;
      if (!st2.favorites) st2.favorites = [];
      const idx = st2.favorites.indexOf(key);
      if (idx >= 0) st2.favorites.splice(idx, 1);
      else st2.favorites.push(key);
      commSaveState();
      renderCommunityGames();
    });
  });
}

// ============================================
// ЗАПУСК ИГРЫ + МОДАЛКА ДЕТАЛЕЙ
// ============================================
async function openCommunityGame(game) {
  const st = commGetState();
  if (!st) return;

  if (!game.url || (!game.url.includes('.html') && !game.url.includes('.htm'))) {
    if (!confirm('⚠️ Это не HTML-файл. Возможно, игра не запустится. Продолжить?')) return;
  }

  await showGameDetailModal(game);
}

async function showGameDetailModal(game) {
  let modal = document.getElementById('gameDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gameDetailModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content game-detail-modal-content">
        <button class="modal-close" id="gameDetailClose">✕</button>
        <div class="game-detail-header">
          <div class="game-detail-icon" id="gameDetailIcon">🎮</div>
          <div class="game-detail-info">
            <div class="game-detail-name" id="gameDetailName">—</div>
            <div class="game-detail-genre" id="gameDetailGenre">—</div>
            <div class="game-detail-author" id="gameDetailAuthor">—</div>
          </div>
        </div>
        <div class="game-detail-desc" id="gameDetailDesc"></div>
        <div class="game-detail-stats" id="gameDetailStats"></div>
        <div class="game-detail-actions">
          <button class="game-detail-play" id="gameDetailPlayBtn">▶ Играть</button>
          <button class="game-detail-fav" id="gameDetailFavBtn">☆</button>
        </div>
        <div class="modal-subtitle">💬 Комментарии</div>
        <div class="comments-list" id="commentsList"></div>
        <div class="comment-input-row">
          <input type="text" id="commentInput" class="chat-input" placeholder="Написать комментарий..." maxlength="300">
          <button class="chat-send-btn" id="commentSendBtn">➤</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });
    document.getElementById('gameDetailClose').addEventListener('click', () => modal.classList.remove('show'));
  }

  const st = commGetState();
  const fav = isFav(game.id);

  document.getElementById('gameDetailIcon').textContent = game.icon || '🎮';
  document.getElementById('gameDetailName').textContent = game.name;
  document.getElementById('gameDetailGenre').textContent = game.genre || 'Разное';
  document.getElementById('gameDetailAuthor').innerHTML = `от <b>${commEscape(game.author_nick)}</b>`;
  document.getElementById('gameDetailDesc').textContent = game.description || 'Без описания';
  document.getElementById('gameDetailStats').innerHTML = `▶ ${game.plays || 0} игр`;

  const favBtn = document.getElementById('gameDetailFavBtn');
  favBtn.textContent = fav ? '⭐' : '☆';
  favBtn.classList.toggle('active', fav);
  favBtn.onclick = () => {
    const s = commGetState();
    if (!s) return;
    if (!s.favorites) s.favorites = [];
    const key = commFavKey(game.id);
    const idx = s.favorites.indexOf(key);
    if (idx >= 0) s.favorites.splice(idx, 1);
    else s.favorites.push(key);
    commSaveState();
    const nowFav = s.favorites.includes(key);
    favBtn.textContent = nowFav ? '⭐' : '☆';
    favBtn.classList.toggle('active', nowFav);
    renderCommunityGames();
  };

  document.getElementById('gameDetailPlayBtn').onclick = () => {
    modal.classList.remove('show');
    launchCommunityGame(game);
  };

  const sendBtn = document.getElementById('commentSendBtn');
  const input = document.getElementById('commentInput');
  if (sendBtn && input) {
    sendBtn.onclick = () => submitComment(game.id);
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitComment(game.id);
      }
    };
  }

  modal.classList.add('show');
  await loadComments(game.id);
}

// ============================================
// ЗАПУСК (IFRAME) — с обходом кеша
// ============================================
async function launchCommunityGame(game) {
  const st = commGetState();
  if (!st) return;

  try {
    await fetch(`${COMMUNITY_URL}/rest/v1/rpc/increment_plays`, {
      method: 'POST',
      headers: commHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ p_game_id: game.id }),
    });
    game.plays = (game.plays || 0) + 1;
  } catch (e) {}

  const container = document.getElementById('gameFrameContainer');
  const iframe = document.getElementById('gameIframe');
  if (!container || !iframe) return;

  if (typeof hideMascot === 'function') hideMascot();
  document.body.classList.add('game-active');
  if (typeof showGameSkeleton === 'function') showGameSkeleton();
  try { iframe.src = 'about:blank'; } catch (e) {}

  iframe.onload = null;
  iframe.onerror = null;
  iframe.setAttribute('sandbox', 'allow-scripts allow-pointer-lock allow-popups allow-forms allow-modals');

  let loadHandled = false;
  const onLoad = () => {
    if (loadHandled) return;
    loadHandled = true;
    if (typeof hideGameSkeleton === 'function') hideGameSkeleton();
  };
  iframe.onload = onLoad;
  iframe.onerror = onLoad;

  // ============================================
  // ФИКС: добавляем ?t=timestamp чтобы обойти кеш iframe
  // ============================================
  const cacheBustedUrl = game.url + (game.url.includes('?') ? '&' : '?') + 't=' + Date.now();
  console.log('[Community] Запуск с обходом кеша:', cacheBustedUrl);

  requestAnimationFrame(() => { iframe.src = cacheBustedUrl; });
  container.style.display = 'block';

  if (typeof window.isGameOpen !== 'undefined') window.isGameOpen = true;
  setTimeout(() => { if (typeof hideGameSkeleton === 'function') hideGameSkeleton(); }, 4000);

  if (typeof startTimeTicker === 'function') {
    try { startTimeTicker('community_' + game.id); } catch (e) {}
  }
  if (typeof addGameMenuListeners === 'function') {
    try { addGameMenuListeners(); } catch (e) {}
  }

  st.lastGameId = 'community_' + game.id;
  st.lastGameTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  commSaveState();
  if (typeof updateLastGameBar === 'function') {
    try { updateLastGameBar(); } catch (e) {}
  }
}

// ============================================
// КОММЕНТАРИИ
// ============================================
async function loadComments(gameId) {
  const list = document.getElementById('commentsList');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">Загрузка...</div>';
  try {
    const res = await fetch(
      `${COMMUNITY_URL}/rest/v1/game_comments?game_id=eq.${gameId}&select=*&order=created_at.desc&limit=100`,
      { headers: commHeaders() }
    );
    if (!res.ok) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">Ошибка загрузки</div>';
      return;
    }
    const comments = await res.json();
    COMM.comments[gameId] = comments;
    renderComments(gameId);
  } catch (e) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">Нет соединения</div>';
  }
}

function renderComments(gameId) {
  const list = document.getElementById('commentsList');
  if (!list) return;
  const comments = COMM.comments[gameId] || [];
  const st = commGetState();
  if (comments.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">Пока нет комментариев. Будь первым!</div>';
    return;
  }
  list.innerHTML = comments.map(c => {
    const isMine = st && c.nickname === st.nickname;
    const date = new Date(c.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `
      <div class="comment-item" data-comment-id="${c.id}">
        <div class="comment-avatar">${commEscape(c.nickname.charAt(0).toUpperCase())}</div>
        <div class="comment-body">
          <div class="comment-head">
            <span class="comment-nick">${commEscape(c.nickname)}</span>
            <span class="comment-date">${date}</span>
            ${isMine ? `<button class="comment-del" data-del-id="${c.id}" title="Удалить">✕</button>` : ''}
          </div>
          <div class="comment-text">${commEscape(c.text)}</div>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.comment-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteComment(btn.dataset.delId, gameId);
    });
  });
}

async function submitComment(gameId) {
  const st = commGetState();
  if (!st) return;
  const input = document.getElementById('commentInput');
  const sendBtn = document.getElementById('commentSendBtn');
  if (!input || !sendBtn) return;
  const text = input.value.trim();
  if (!text) return;
  if (!st.nickname || st.nickname === 'Игрок') {
    alert('Сначала установи ник');
    return;
  }
  if (text.length > 300) {
    alert('Максимум 300 символов');
    return;
  }
  if (typeof hasProfanity === 'function' && hasProfanity(text)) {
    alert('🚫 Недопустимые слова');
    return;
  }
  const clean = typeof censorProfanity === 'function' ? censorProfanity(text) : text;

  sendBtn.disabled = true;
  try {
    const res = await fetch(`${COMMUNITY_URL}/rest/v1/game_comments`, {
      method: 'POST',
      headers: commHeaders({
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }),
      body: JSON.stringify({
        game_id: gameId,
        nickname: st.nickname,
        text: clean,
        owner_token: st.ownerToken || '',
      }),
    });
    if (!res.ok) {
      alert('Не удалось отправить');
      return;
    }
    const [saved] = await res.json();
    if (!COMM.comments[gameId]) COMM.comments[gameId] = [];
    COMM.comments[gameId].unshift(saved);
    input.value = '';
    renderComments(gameId);
    renderCommunityGames();
  } catch (e) {
    alert('Нет соединения');
  } finally {
    sendBtn.disabled = false;
  }
}

async function deleteComment(commentId, gameId) {
  if (!confirm('Удалить комментарий?')) return;
  try {
    const res = await fetch(`${COMMUNITY_URL}/rest/v1/game_comments?id=eq.${commentId}`, {
      method: 'DELETE',
      headers: commHeaders(),
    });
    if (!res.ok) return;
    COMM.comments[gameId] = (COMM.comments[gameId] || []).filter(c => String(c.id) !== String(commentId));
    renderComments(gameId);
    renderCommunityGames();
  } catch (e) {}
}

// ============================================
// ЗАГРУЗКА / РЕДАКТИРОВАНИЕ ИГРЫ
// ============================================
function openUploadModal() {
  const modal = document.getElementById('uploadModal');
  if (!modal) return;
  COMM.editingGameId = null;
  const title = modal.querySelector('.modal-title');
  if (title) title.textContent = '🚀 Загрузить игру';
  document.getElementById('uploadName').value = '';
  document.getElementById('uploadIcon').value = '🎮';
  document.getElementById('uploadGenre').value = 'Разное';
  document.getElementById('uploadDescription').value = '';
  document.getElementById('uploadFile').value = '';
  document.getElementById('uploadFileName').textContent = 'Файл не выбран';
  const fileRow = document.getElementById('uploadFileRow');
  if (fileRow) fileRow.style.display = '';
  const bgEl = document.getElementById('uploadBg');
  if (bgEl) bgEl.value = '';
  const hint = document.getElementById('uploadHint');
  hint.textContent = '';
  hint.className = 'upload-hint';
  modal.classList.add('show');
}

function openEditModal(game) {
  const modal = document.getElementById('uploadModal');
  if (!modal) return;
  COMM.editingGameId = game.id;
  const title = modal.querySelector('.modal-title');
  if (title) title.textContent = '✏️ Редактировать игру';
  document.getElementById('uploadName').value = game.name || '';
  document.getElementById('uploadIcon').value = game.icon || '🎮';
  document.getElementById('uploadGenre').value = game.genre || 'Разное';
  document.getElementById('uploadDescription').value = game.description || '';
  const bgEl = document.getElementById('uploadBg');
  if (bgEl) bgEl.value = game.bg || '';
  const fileRow = document.getElementById('uploadFileRow');
  if (fileRow) fileRow.style.display = 'none';
  document.getElementById('uploadFile').value = '';
  const hint = document.getElementById('uploadHint');
  hint.textContent = 'Файл менять нельзя. Удали и загрузи заново, если нужно.';
  hint.className = 'upload-hint';
  modal.classList.add('show');
}

async function handleUploadSubmit() {
  const st = commGetState();
  if (!st) return;

  const nameEl = document.getElementById('uploadName');
  const iconEl = document.getElementById('uploadIcon');
  const genreEl = document.getElementById('uploadGenre');
  const descEl = document.getElementById('uploadDescription');
  const fileEl = document.getElementById('uploadFile');
  const bgEl = document.getElementById('uploadBg');
  const hint = document.getElementById('uploadHint');
  const btn = document.getElementById('uploadSubmitBtn');

  const name = nameEl.value.trim();
  const icon = iconEl.value.trim() || '🎮';
  const genre = genreEl.value;
  const description = descEl.value.trim();
  const bg = bgEl ? bgEl.value.trim() : '';

  if (name.length < 3) {
    hint.textContent = '❌ Название минимум 3 символа';
    hint.className = 'upload-hint error';
    return;
  }
  if (!st.nickname || st.nickname === 'Игрок') {
    hint.textContent = '❌ Установи ник';
    hint.className = 'upload-hint error';
    return;
  }

  if (bg && !/^(linear-gradient|radial-gradient|conic-gradient|#[0-9a-f]{3,8}|rgb|hsl)/i.test(bg)) {
    hint.textContent = '❌ Неверный формат. Пример: linear-gradient(135deg, #ff6b35, #e83040)';
    hint.className = 'upload-hint error';
    return;
  }
  if (bg && /url\s*\(|javascript:|expression\s*\(/i.test(bg)) {
    hint.textContent = '❌ Запрещённые символы в градиенте';
    hint.className = 'upload-hint error';
    return;
  }

  // РЕДАКТИРОВАНИЕ
  if (COMM.editingGameId) {
    btn.disabled = true;
    btn.textContent = '⏳ Сохранение...';
    try {
      const res = await fetch(`${COMMUNITY_URL}/rest/v1/rpc/update_game_secure`, {
        method: 'POST',
        headers: commHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          p_game_id: COMM.editingGameId,
          p_owner_token: st.ownerToken || '',
          p_name: name,
          p_icon: icon,
          p_genre: genre,
          p_description: description,
          p_bg: bg,
        }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.ok) {
        hint.textContent = '❌ ' + (data.error === 'NOT_OWNER' ? 'Не твоя игра' : data.error);
        hint.className = 'upload-hint error';
        return;
      }
      hint.textContent = '✅ Обновлено!';
      hint.className = 'upload-hint success';
      setTimeout(() => {
        document.getElementById('uploadModal').classList.remove('show');
        btn.disabled = false;
        btn.textContent = '🚀 Загрузить';
        COMM.editingGameId = null;
        loadCommunityGames();
      }, 800);
    } catch (e) {
      hint.textContent = '❌ Ошибка сохранения';
      hint.className = 'upload-hint error';
      btn.disabled = false;
      btn.textContent = '🚀 Загрузить';
    }
    return;
  }

  // ЗАГРУЗКА
  const file = fileEl.files[0];
  if (!file) {
    hint.textContent = '❌ Выбери HTML-файл';
    hint.className = 'upload-hint error';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    hint.textContent = '❌ Файл больше 10 МБ';
    hint.className = 'upload-hint error';
    return;
  }
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext !== 'html' && ext !== 'htm') {
    hint.textContent = '❌ Только .html или .htm';
    hint.className = 'upload-hint error';
    return;
  }
  try {
    const head = await file.slice(0, 500).text();
    const lower = head.toLowerCase();
    if (!lower.includes('<html') && !lower.includes('<!doctype')) {
      hint.textContent = '❌ Файл не похож на HTML';
      hint.className = 'upload-hint error';
      return;
    }
  } catch (e) {}

  btn.disabled = true;
  btn.textContent = '⏳ Загрузка...';
  hint.textContent = 'Загружаем файл...';
  hint.className = 'upload-hint';

  try {
    // Очищаем имя: убираем кириллицу и лишние символы
    const safeName = file.name
      .replace(/[а-яё]/gi, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(-50) || 'game.html';

    const fileName = `${st.nickname}_${Date.now()}_${safeName}`;
    const uploadUrl = `${COMMUNITY_URL}/storage/v1/object/${COMMUNITY_BUCKET}/${fileName}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: commHeaders({
        'Content-Type': 'text/html',           // ← жёстко text/html
        'Cache-Control': 'no-cache',
        'x-upsert': 'true',
      }),
      body: file,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.warn('[Community] upload:', uploadRes.status, err);
      hint.textContent = '❌ Ошибка загрузки файла';
      hint.className = 'upload-hint error';
      btn.disabled = false;
      btn.textContent = '🚀 Загрузить';
      return;
    }

    const publicUrl = `${COMMUNITY_URL}/storage/v1/object/public/${COMMUNITY_BUCKET}/${fileName}`;

    hint.textContent = 'Сохраняем в базу...';
    const insertRes = await fetch(`${COMMUNITY_URL}/rest/v1/games`, {
      method: 'POST',
      headers: commHeaders({
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }),
      body: JSON.stringify({
        name, icon, genre,
        description,
        url: publicUrl,
        author_nick: st.nickname,
        owner_token: st.ownerToken || '',
        bg,
        approved: true,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.warn('[Community] insert:', insertRes.status, err);
      hint.textContent = '❌ Ошибка сохранения';
      hint.className = 'upload-hint error';
      btn.disabled = false;
      btn.textContent = '🚀 Загрузить';
      return;
    }

    hint.textContent = '✅ Игра загружена!';
    hint.className = 'upload-hint success';
    btn.textContent = '✅ Готово';

    if (st) {
      st.myCommunityGames = (st.myCommunityGames || 0) + 1;
      if (st.todayStats) st.todayStats.communityUploaded = true;
      if (typeof unlockAch === 'function') {
        unlockAch('first_community');
        if (st.myCommunityGames >= 5) unlockAch('community_5');
      }
      if (typeof updateQuestProgress === 'function') updateQuestProgress();
      commSaveState();
    }

    setTimeout(() => {
      document.getElementById('uploadModal').classList.remove('show');
      btn.disabled = false;
      btn.textContent = '🚀 Загрузить';
      loadCommunityGames();
    }, 1000);

  } catch (e) {
    console.warn('[Community] error:', e);
    hint.textContent = '❌ Сеть недоступна';
    hint.className = 'upload-hint error';
    btn.disabled = false;
    btn.textContent = '🚀 Загрузить';
  }
}

// ============================================
// УДАЛЕНИЕ
// ============================================
async function deleteCommunityGame(game) {
  const st = commGetState();
  if (!st) return;
  if (game.author_nick !== st.nickname) return;
  if (!confirm(`Удалить игру "${game.name}"?`)) return;

  try {
    const res = await fetch(`${COMMUNITY_URL}/rest/v1/rpc/delete_game_secure`, {
      method: 'POST',
      headers: commHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        p_game_id: game.id,
        p_owner_token: st.ownerToken || '',
      }),
    });
    if (!res.ok) {
      alert('Не удалось удалить');
      return;
    }
    const data = await res.json();
    if (!data.ok) {
      alert(data.error === 'NOT_OWNER' ? 'Не твоя игра' : 'Ошибка: ' + data.error);
      return;
    }
    COMM.games = COMM.games.filter(g => g.id !== game.id);
    renderCommunityGames();
  } catch (e) {
    console.warn('[Community] delete:', e);
    alert('Нет соединения');
  }
}

// ============================================
// UI BIND
// ============================================
function initCommunity() {
  const uploadBtn = document.getElementById('communityUploadBtn');
  const uploadFileBtn = document.getElementById('uploadFileBtn');
  const uploadFile = document.getElementById('uploadFile');
  const uploadSubmit = document.getElementById('uploadSubmitBtn');

  if (uploadBtn) uploadBtn.addEventListener('click', openUploadModal);
  if (uploadFileBtn && uploadFile) {
    uploadFileBtn.addEventListener('click', () => uploadFile.click());
  }
  if (uploadFile) {
    uploadFile.addEventListener('change', (e) => {
      const f = e.target.files[0];
      const nameEl = document.getElementById('uploadFileName');
      const hint = document.getElementById('uploadHint');
      if (f) {
        nameEl.textContent = f.name;
        if (f.size > 10 * 1024 * 1024) {
          hint.textContent = '❌ Файл больше 10 МБ';
          hint.className = 'upload-hint error';
        } else {
          const ext = (f.name.split('.').pop() || '').toLowerCase();
          if (ext !== 'html' && ext !== 'htm') {
            hint.textContent = '❌ Только .html или .htm';
            hint.className = 'upload-hint error';
          } else {
            hint.textContent = '';
            hint.className = 'upload-hint';
          }
        }
      } else {
        nameEl.textContent = 'Файл не выбран';
      }
    });
  }
  if (uploadSubmit) uploadSubmit.addEventListener('click', handleUploadSubmit);
}

window.initCommunity = initCommunity;
window.loadCommunityGames = loadCommunityGames;
window.openCommunityGame = openCommunityGame;
window.renderCommunityGames = renderCommunityGames;