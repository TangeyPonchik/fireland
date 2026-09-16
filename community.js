// ============================================
// FireLand Community Games
// ============================================

const COMM = {
  games: [],
  loading: false,
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

// ============================================
// ЗАГРУЗКА СПИСКА ИГР
// ============================================
async function loadCommunityGames() {
  if (COMM.loading) return;
  COMM.loading = true;
  const panel = document.getElementById('communityPanel');
  if (!panel) return;
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
    const games = await res.json();
    COMM.games = games;
    renderCommunityGames();
  } catch (e) {
    console.warn('[Community] load:', e);
    panel.innerHTML = '<div class="community-empty">❌ Нет соединения</div>';
  } finally {
    COMM.loading = false;
  }
}

function renderCommunityGames() {
  const panel = document.getElementById('communityPanel');
  const count = document.getElementById('communityCount');
  if (!panel) return;
  if (count) count.textContent = COMM.games.length + ' игр';

  if (COMM.games.length === 0) {
    panel.innerHTML = `
      <div class="community-empty">
        <div style="font-size:80px;margin-bottom:16px;">🌍</div>
        <div style="font-size:22px;font-weight:800;margin-bottom:8px;">Пока нет игр от сообщества</div>
        <div style="color:var(--text-secondary);font-size:14px;">Стань первым! Загрузи свою игру.</div>
      </div>
    `;
    return;
  }

  panel.innerHTML = COMM.games.map(g => {
    const isMine = g.author_nick === state.nickname;
    return `
      <div class="community-card" data-game-id="${g.id}">
        ${isMine ? `<button class="community-card-delete" data-delete-id="${g.id}" title="Удалить">✕</button>` : ''}
        <div class="community-card-icon">${escapeHtml(g.icon || '🎮')}</div>
        <div class="community-card-name">${escapeHtml(g.name)}</div>
        <div class="community-card-genre">${escapeHtml(g.genre || 'Разное')}</div>
        <div class="community-card-author">от <b>${escapeHtml(g.author_nick)}</b></div>
        <div class="community-card-plays">▶ ${g.plays || 0} игр</div>
      </div>
    `;
  }).join('');

  panel.querySelectorAll('.community-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.community-card-delete')) return;
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
}

// ============================================
// ЗАПУСК ИГРЫ ИЗ СООБЩЕСТВА
// ============================================
async function openCommunityGame(game) {
  try {
    await fetch(`${COMMUNITY_URL}/rest/v1/games?id=eq.${game.id}`, {
      method: 'PATCH',
      headers: commHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ plays: (game.plays || 0) + 1 }),
    });
    game.plays = (game.plays || 0) + 1;
  } catch (e) {}

  const container = document.getElementById('gameFrameContainer');
  const iframe = document.getElementById('gameIframe');
  if (!container || !iframe) return;

  hideMascot();
  document.body.classList.add('game-active');
  showGameSkeleton();
  try { iframe.src = 'about:blank'; } catch (e) {}
  requestAnimationFrame(() => { iframe.src = game.url; });
  container.style.display = 'block';
  isGameOpen = true;

  let loadHandled = false;
  const onLoad = () => {
    if (loadHandled) return;
    loadHandled = true;
    hideGameSkeleton();
  };
  iframe.onload = onLoad;
  iframe.onerror = onLoad;
  setTimeout(() => { if (isGameOpen) hideGameSkeleton(); }, 4000);

  currentGameStartTime = Date.now();
  sessionStartTotalTime = state.totalTime;
  sessionXpStart = state.totalXp;
  sessionAchEarned = [];
  addGameMenuListeners();

  // Сохраняем название игры для post-game
  state.lastGameId = 'community_' + game.id;
  state.lastGameTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  saveState();
}

// ============================================
// ЗАГРУЗКА ИГРЫ
// ============================================
function openUploadModal() {
  const modal = document.getElementById('uploadModal');
  if (!modal) return;
  document.getElementById('uploadName').value = '';
  document.getElementById('uploadIcon').value = '🎮';
  document.getElementById('uploadGenre').value = 'Разное';
  document.getElementById('uploadDescription').value = '';
  document.getElementById('uploadFile').value = '';
  document.getElementById('uploadFileName').textContent = 'Файл не выбран';
  document.getElementById('uploadHint').textContent = '';
  document.getElementById('uploadHint').className = 'upload-hint';
  modal.classList.add('show');
}

async function handleUploadSubmit() {
  const nameEl = document.getElementById('uploadName');
  const iconEl = document.getElementById('uploadIcon');
  const genreEl = document.getElementById('uploadGenre');
  const descEl = document.getElementById('uploadDescription');
  const fileEl = document.getElementById('uploadFile');
  const hint = document.getElementById('uploadHint');
  const btn = document.getElementById('uploadSubmitBtn');

  const name = nameEl.value.trim();
  const icon = iconEl.value.trim() || '🎮';
  const genre = genreEl.value;
  const description = descEl.value.trim();
  const file = fileEl.files[0];

  if (name.length < 3) {
    hint.textContent = '❌ Название минимум 3 символа';
    hint.className = 'upload-hint error';
    return;
  }
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
  if (!state.nickname || state.nickname === 'Игрок') {
    hint.textContent = '❌ Установи ник в профиле';
    hint.className = 'upload-hint error';
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Загрузка...';
  hint.textContent = 'Загружаем файл...';
  hint.className = 'upload-hint';

  try {
    const fileName = `${state.nickname}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const uploadUrl = `${COMMUNITY_URL}/storage/v1/object/${COMMUNITY_BUCKET}/${fileName}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: commHeaders({
        'Content-Type': file.type || 'text/html',
        'x-upsert': 'true',
      }),
      body: file,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.warn('[Community] upload error:', uploadRes.status, err);
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
        name,
        icon,
        genre,
        description,
        url: publicUrl,
        author_nick: state.nickname,
        approved: true,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.warn('[Community] insert error:', insertRes.status, err);
      hint.textContent = '❌ Ошибка сохранения';
      hint.className = 'upload-hint error';
      btn.disabled = false;
      btn.textContent = '🚀 Загрузить';
      return;
    }

    hint.textContent = '✅ Игра загружена!';
    hint.className = 'upload-hint success';
    btn.textContent = '✅ Готово';

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
// УДАЛЕНИЕ ИГРЫ
// ============================================
async function deleteCommunityGame(game) {
  if (game.author_nick !== state.nickname) return;
  if (!confirm(`Удалить игру "${game.name}"?`)) return;

  try {
    const res = await fetch(`${COMMUNITY_URL}/rest/v1/games?id=eq.${game.id}`, {
      method: 'DELETE',
      headers: commHeaders(),
    });
    if (!res.ok) {
      alert('Не удалось удалить');
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
// ПРИВЯЗКА UI
// ============================================
function initCommunity() {
  const uploadBtn = document.getElementById('communityUploadBtn');
  const uploadFileBtn = document.getElementById('uploadFileBtn');
  const uploadFile = document.getElementById('uploadFile');
  const uploadSubmit = document.getElementById('uploadSubmitBtn');

  if (uploadBtn) uploadBtn.addEventListener('click', openUploadModal);
  if (uploadFileBtn) {
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
          hint.textContent = '';
          hint.className = 'upload-hint';
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