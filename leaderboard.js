// ============================================
// FireLand Leaderboard · Supabase v17
// Только Publishable key
// ============================================

const SUPABASE_URL = 'https://syfkmrjdrxphtxcpwgyy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aDqkosVM7drGfLHRLtgmog_TwVwd-MS';

const LB = {
  cache: [],
  lastFetch: 0,
  autoRefreshTimer: null,
  isFetching: false,
  isSaving: false,
};

async function submitScore() {
  if (!state.nickname || state.nickname === 'Игрок') {
    console.log('[LB] Не отправляю: ник не установлен');
    return false;
  }
  const lvlInfo = getLevelFromTotalXp(state.totalXp);
  const payload = {
    p_nickname: state.nickname,
    p_level: lvlInfo.level,
    p_total_xp: state.totalXp,
    p_achievements_count: state.achievements.length,
  };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/upsert_score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('[LB] Ошибка отправки:', res.status, err);
      return false;
    }
    state.lastSubmittedNick = state.nickname;
    console.log('[LB] ✅ Отправлено:', state.nickname, 'Lvl', lvlInfo.level, state.totalXp, 'XP');
    return true;
  } catch (e) {
    console.warn('[LB] Сеть недоступна:', e.message);
    return false;
  }
}

async function saveNickname() {
  if (LB.isSaving) return { ok: false, message: 'Уже сохраняется' };
  LB.isSaving = true;
  const newNick = state.nickname;
  const oldNick = state.lastSubmittedNick;
  if (!newNick || newNick === 'Игрок') {
    LB.isSaving = false;
    return { ok: false, message: 'Введи ник' };
  }
  const lvlInfo = getLevelFromTotalXp(state.totalXp);
  const payload = {
    p_nickname: newNick,
    p_level: lvlInfo.level,
    p_total_xp: state.totalXp,
    p_achievements_count: state.achievements.length,
  };
  try {
    if (oldNick && oldNick !== newNick) {
      console.log('[LB] Переименование:', oldNick, '→', newNick);
      const renameRes = await fetch(
        `${SUPABASE_URL}/rest/v1/leaderboard?nickname=eq.${encodeURIComponent(oldNick)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            nickname: newNick,
            level: lvlInfo.level,
            total_xp: state.totalXp,
            achievements_count: state.achievements.length,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (!renameRes.ok) {
        const err = await renameRes.text();
        console.warn('[LB] Ошибка переименования:', renameRes.status, err);
      }
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/upsert_score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('[LB] Ошибка сохранения:', res.status, err);
      LB.isSaving = false;
      return { ok: false, message: 'Ошибка сервера: ' + res.status };
    }
    state.lastSubmittedNick = newNick;
    saveState(true);
    console.log('[LB] ✅ Ник сохранён:', newNick);
    LB.isSaving = false;
    return { ok: true, message: 'Ник сохранён!' };
  } catch (e) {
    console.warn('[LB] Сеть недоступна:', e.message);
    LB.isSaving = false;
    return { ok: false, message: 'Нет интернета' };
  }
}

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
  const myNick = state.nickname || 'Игрок';
  const myIndex = data.findIndex(r => r.nickname === myNick);
  const rows = data.map((row, i) => {
    const place = i + 1;
    const isMe = row.nickname === myNick;
    const medal = place === 1 ? '👑' : place === 2 ? '🥈' : place === 3 ? '🥉' : `#${place}`;
    const titleFull = getTitleForLevel(row.level);
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

function formatXp(xp) {
  if (xp >= 1000000) return (xp / 1000000).toFixed(2) + 'M';
  if (xp >= 1000) return (xp / 1000).toFixed(1) + 'k';
  return xp.toLocaleString('ru-RU');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function initLeaderboard() {
  const data = await fetchLeaderboard(true);
  renderLeaderboard(data);
  console.log('[LB] Лидерборд инициализирован, записей:', data.length);
}