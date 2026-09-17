// ============================================
// FireLand Leaderboard · Supabase v19 · TOKEN PROTECTED
// ============================================

const SUPABASE_URL = 'https://brqlmsbvwmycyhiluuui.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4l9kEORimlt8FthVCRb28w_wwhWbXEJ';

const LB = {
  cache: [],
  lastFetch: 0,
  autoRefreshTimer: null,
  isFetching: false,
  isSaving: false,
};

window.escapeHtml = window.escapeHtml || function (text) {
  const div = document.createElement('div');
  div.textContent = text == null ? '' : String(text);
  return div.innerHTML;
};
const escapeHtml = window.escapeHtml;

function lbSafeSaveState(immediate = false) {
  if (typeof saveState === 'function') {
    try { saveState(immediate); } catch (e) { console.warn('[LB] saveState:', e); }
  }
}
function lbGetState() {
  if (typeof state !== 'undefined' && state) return state;
  return null;
}
function lbGetLevelFromTotalXp(totalXp) {
  if (typeof getLevelFromTotalXp === 'function') return getLevelFromTotalXp(totalXp);
  return { level: 1, currentXp: 0, neededXp: 100 };
}
function lbGetTitleForLevel(level) {
  if (typeof getTitleForLevel === 'function') return getTitleForLevel(level);
  return '🌱 Новичок';
}

// ============================================
// ОТПРАВКА СЧЁТА
// ============================================
async function submitScore() {
  const st = lbGetState();
  if (!st || !st.nickname || st.nickname === 'Игрок') {
    console.log('[LB] Не отправляю: ник не установлен');
    return false;
  }
  if (typeof getLevelFromTotalXp !== 'function') {
    console.warn('[LB] getLevelFromTotalXp не определена');
    return false;
  }
  const lvlInfo = getLevelFromTotalXp(st.totalXp);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/upsert_score_secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        p_nickname: st.nickname,
        p_level: lvlInfo.level,
        p_total_xp: st.totalXp,
        p_achievements_count: st.achievements.length,
        p_owner_token: st.ownerToken || '',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('[LB] Ошибка отправки:', res.status, err);
      return false;
    }
    const data = await res.json();
    if (!data.ok) {
      console.warn('[LB] Отклонено:', data.error);
      return false;
    }
    st.lastSubmittedNick = st.nickname;
    lbSafeSaveState();
    console.log('[LB] ✅ Отправлено:', st.nickname, 'Lvl', lvlInfo.level, st.totalXp, 'XP');
    return true;
  } catch (e) {
    console.warn('[LB] Сеть недоступна:', e.message);
    return false;
  }
}

// ============================================
// СОХРАНЕНИЕ НИКА
// ============================================
async function saveNickname() {
  if (LB.isSaving) return { ok: false, message: 'Уже сохраняется' };
  const st = lbGetState();
  if (!st) return { ok: false, message: 'Состояние не загружено' };
  LB.isSaving = true;

  const newNick = st.nickname;
  if (!newNick || newNick === 'Игрок') {
    LB.isSaving = false;
    return { ok: false, message: 'Введи ник' };
  }

  const lvlInfo = lbGetLevelFromTotalXp(st.totalXp);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/upsert_score_secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        p_nickname: newNick,
        p_level: lvlInfo.level,
        p_total_xp: st.totalXp,
        p_achievements_count: st.achievements.length,
        p_owner_token: st.ownerToken || '',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('[LB] Ошибка сохранения:', res.status, err);
      LB.isSaving = false;
      return { ok: false, message: 'Ошибка сервера: ' + res.status };
    }
    const data = await res.json();
    if (!data.ok) {
      LB.isSaving = false;
      if (data.error === 'NICK_TAKEN') {
        return { ok: false, message: 'Этот ник занят другим игроком' };
      }
      return { ok: false, message: data.error || 'Ошибка' };
    }
    st.lastSubmittedNick = newNick;
    lbSafeSaveState(true);
    console.log('[LB] ✅ Ник сохранён:', newNick);
    LB.isSaving = false;
    return { ok: true, message: 'Ник сохранён!' };
  } catch (e) {
    console.warn('[LB] Сеть недоступна:', e.message);
    LB.isSaving = false;
    return { ok: false, message: 'Нет интернета' };
  }
}

// ============================================
// ЗАГРУЗКА ЛИДЕРБОРДА
// ============================================
async function fetchLeaderboard(force = false) {
  if (LB.isFetching) return LB.cache;
  if (!force && Date.now() - LB.lastFetch < 30000) return LB.cache;
  LB.isFetching = true;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/leaderboard?select=nickname,level,total_xp,achievements_count,updated_at&order=total_xp.desc&limit=100`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      console.warn('[LB] Ошибка загрузки:', res.status);
      LB.isFetching = false;
      return LB.cache;
    }
    const data = await res.json();
    LB.cache = data;
    LB.lastFetch = Date.now();
    LB.isFetching = false;
    return data;
  } catch (e) {
    console.warn('[LB] Сеть недоступна:', e.message);
    LB.isFetching = false;
    return LB.cache;
  }
}

// ============================================
// РЕНДЕР
// ============================================
function renderLeaderboard(data) {
  const container = document.getElementById('leaderboardContainer');
  if (!container) return;
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="lb-empty">
        <div style="font-size:64px;margin-bottom:16px;">🏆</div>
        <div style="font-size:20px;font-weight:800;margin-bottom:8px;">Пока пусто</div>
        <div style="color:var(--text-secondary);font-size:14px;">
          Сыграй в игру, получи XP — и стань первым в таблице!
        </div>
      </div>`;
    return;
  }
  const st = lbGetState();
  const myNick = (st && st.nickname) || 'Игрок';
  const myIndex = data.findIndex(r => r.nickname === myNick);

  const rows = data.map((row, i) => {
    const place = i + 1;
    const isMe = row.nickname === myNick;
    const medal = place === 1 ? '👑' : place === 2 ? '🥈' : place === 3 ? '🥉' : `#${place}`;
    const titleFull = lbGetTitleForLevel(row.level);
    const title = titleFull.replace(/^[^\s]+\s/, '');
    return `
      <div class="lb-row ${isMe ? 'lb-me' : ''} ${place <= 3 ? 'lb-top' : ''}">
        <div class="lb-place">${medal}</div>
        <div class="lb-info">
          <div class="lb-nick">${escapeHtml(row.nickname)}</div>
          <div class="lb-title">Lvl ${row.level} · ${escapeHtml(title)}</div>
        </div>
        <div class="lb-xp">${formatXp(row.total_xp)} XP</div>
      </div>`;
  }).join('');

  const myRow = myIndex >= 0 ? `
    <div class="lb-my-position">
      <div style="font-size:12px;opacity:0.7;font-weight:700;letter-spacing:1px;">ТВОЯ ПОЗИЦИЯ</div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:6px;">
        <div style="font-size:22px;font-weight:900;color:var(--accent-secondary);">#${myIndex + 1}</div>
        <div style="flex:1;">
          <div style="font-weight:800;">${escapeHtml(myNick)}</div>
          <div style="font-size:12px;color:var(--text-secondary);">Lvl ${data[myIndex].level} · ${data[myIndex].total_xp.toLocaleString('ru-RU')} XP</div>
        </div>
      </div>
    </div>` : `
    <div class="lb-my-position" style="text-align:center;">
      <div style="font-size:13px;opacity:0.7;">Тебя пока нет в топе — сохрани ник и заработай XP!</div>
    </div>`;

  container.innerHTML = `
    <div class="lb-header">
      <div class="lb-title-main">🏆 Топ-100 игроков</div>
      <div class="lb-meta">Обновлено: ${new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})}</div>
    </div>
    <div class="lb-list">${rows}</div>
    ${myRow}
    <div class="lb-footer">
      <button class="lb-refresh-btn" onclick="refreshLeaderboard()">🔄 Обновить</button>
      <label class="lb-auto-label">
        <input type="checkbox" id="lbAutoRefresh" ${LB.autoRefreshTimer ? 'checked' : ''}>
        Автообновление
      </label>
    </div>
  `;
  const autoCheckbox = document.getElementById('lbAutoRefresh');
  if (autoCheckbox) {
    autoCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) startLeaderboardAutoRefresh();
      else stopLeaderboardAutoRefresh();
    });
  }
}

// ============================================
// ОБНОВЛЕНИЕ
// ============================================
async function refreshLeaderboard() {
  const btn = document.querySelector('.lb-refresh-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Загрузка...'; }
  const data = await fetchLeaderboard(true);
  renderLeaderboard(data);
  if (btn) { btn.disabled = false; btn.textContent = '🔄 Обновить'; }
}

function startLeaderboardAutoRefresh() {
  stopLeaderboardAutoRefresh();
  LB.autoRefreshTimer = setInterval(async () => {
    const data = await fetchLeaderboard(true);
    renderLeaderboard(data);
  }, 60000);
  console.log('[LB] Автообновление включено');
}

function stopLeaderboardAutoRefresh() {
  if (LB.autoRefreshTimer) {
    clearInterval(LB.autoRefreshTimer);
    LB.autoRefreshTimer = null;
    console.log('[LB] Автообновление выключено');
  }
}

// ============================================
// ФОРМАТ
// ============================================
function formatXp(xp) {
  if (xp >= 1000000) return (xp / 1000000).toFixed(2) + 'M';
  if (xp >= 1000) return (xp / 1000).toFixed(1) + 'k';
  return xp.toLocaleString('ru-RU');
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
async function initLeaderboard() {
  const data = await fetchLeaderboard(true);
  renderLeaderboard(data);
  console.log('[LB] Лидерборд инициализирован, записей:', data.length);
}

// ============================================
// ЭКСПОРТ В WINDOW
// ============================================
window.submitScore = submitScore;
window.saveNickname = saveNickname;
window.fetchLeaderboard = fetchLeaderboard;
window.renderLeaderboard = renderLeaderboard;
window.refreshLeaderboard = refreshLeaderboard;
window.startLeaderboardAutoRefresh = startLeaderboardAutoRefresh;
window.stopLeaderboardAutoRefresh = stopLeaderboardAutoRefresh;
window.formatXp = formatXp;
window.initLeaderboard = initLeaderboard;