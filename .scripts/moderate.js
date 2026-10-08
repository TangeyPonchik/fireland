// ============================================
// FireLand · moderate.js · v3
// Модерация чата через Supabase REST API
// Использует service_role (полный доступ, обходит RLS)
// Запуск: .scripts\moderate.bat
// ============================================

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ============================================
// ЗАГРУЗКА SERVICE_ROLE КЛЮЧА
// ============================================
function loadServiceKey() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/SUPABASE_SERVICE_KEY\s*=\s*(.+)/);
    if (match) return match[1].trim();
  }

  if (process.env.SUPABASE_SERVICE_KEY) {
    return process.env.SUPABASE_SERVICE_KEY;
  }

  console.error('❌ Не найден service_role ключ.');
  console.error('');
  console.error('Создай файл .scripts/.env.local со строкой:');
  console.error('  SUPABASE_SERVICE_KEY=eyJ...service_role...');
  console.error('');
  console.error('Или задай переменную окружения SUPABASE_SERVICE_KEY.');
  console.error('');
  console.error('Где взять:');
  console.error('  Supabase Dashboard → Settings → API → service_role secret');
  console.error('');
  console.error('⚠️  НИКОГДА не коммить этот ключ в GitHub!');
  process.exit(1);
}

const SUPABASE_URL = 'https://brqlmsbvwmycyhiluuui.supabase.co';
const SUPABASE_KEY = loadServiceKey();

// Проверка, что это действительно service_role, а не anon
try {
  const payload = JSON.parse(
    Buffer.from(SUPABASE_KEY.split('.')[1], 'base64').toString('utf8')
  );
  if (payload.role !== 'service_role') {
    console.error('❌ Это НЕ service_role ключ!');
    console.error(`   Роль в ключе: ${payload.role}`);
    console.error('');
    console.error('Возьми ключ здесь:');
    console.error('  Supabase Dashboard → Settings → API → service_role secret');
    process.exit(1);
  }
  console.log(`🔑 Ключ: service_role (проект ${payload.ref})`);
} catch (e) {
  console.error('❌ Не удалось распарсить ключ:', e.message);
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

function headers(extra = {}) {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    ...extra
  };
}

// ============================================
// БАЗОВЫЕ ФУНКЦИИ
// ============================================

async function deleteFromTable(table, filter, label) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${filter}`,
    {
      method: 'DELETE',
      headers: headers({ 'Prefer': 'return=representation' })
    }
  );
  if (!res.ok) {
    const err = await res.text();
    console.log(`❌ ${label}: ${res.status} ${err}`);
    return 0;
  }
  const data = await res.json();
  const count = Array.isArray(data) ? data.length : 0;
  if (count === 0) {
    console.log(`⚠️  ${label}: 0 удалено (нечего удалять)`);
  } else {
    console.log(`✅ ${label}: удалено ${count}`);
  }
  return count;
}

async function deleteByNick(nick) {
  console.log(`Удаляю все сообщения от "${nick}"...`);
  console.log('');
  await deleteFromTable('chat_messages', `nickname=eq.${encodeURIComponent(nick)}`, 'Сообщения');
}

async function deleteByWord(word) {
  console.log(`Удаляю все сообщения со словом "${word}"...`);
  console.log('');
  await deleteFromTable('chat_messages', `text=ilike.*${encodeURIComponent(word)}*`, 'Сообщения');
}

async function banUser(nick) {
  const enc = encodeURIComponent(nick);
  console.log(`Удаляю ВСЁ от "${nick}"...`);
  console.log('');
  await deleteFromTable('chat_messages', `nickname=eq.${enc}`, 'Сообщения');
  await deleteFromTable('chat_reactions', `nickname=eq.${enc}`, 'Реакции');
  await deleteFromTable('rooms', `author_nick=eq.${enc}`, 'Комнаты');
  await deleteFromTable('leaderboard', `nickname=eq.${enc}`, 'Лидерборд');
}

async function deleteAllExcept(keepList) {
  const keep = keepList.map(n => `"${n}"`).join(',');
  console.log(`Удаляю всё, кроме: ${keepList.join(', ')}`);
  console.log('');
  await deleteFromTable('chat_messages', `nickname=not.in.(${keep})`, 'Сообщения');
  await deleteFromTable('chat_reactions', `nickname=not.in.(${keep})`, 'Реакции');
  await deleteFromTable('rooms', `author_nick=not.in.(${keep})`, 'Комнаты');
  await deleteFromTable('leaderboard', `nickname=not.in.(${keep})`, 'Лидерборд');
}

async function showStats() {
  console.log('📊 Статистика базы:');
  console.log('');

  const tables = [
    { name: 'chat_messages', label: 'Сообщений' },
    { name: 'chat_reactions', label: 'Реакций' },
    { name: 'rooms', label: 'Комнат' },
    { name: 'leaderboard', label: 'Игроков в лидерборде' }
  ];

  for (const t of tables) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${t.name}?select=nickname`,
      { headers: headers() }
    );
    if (res.ok) {
      const data = await res.json();
      console.log(`  ${t.label}: ${data.length}`);
    } else {
      console.log(`  ${t.label}: ошибка ${res.status}`);
    }
  }

  console.log('');
  console.log('👥 Уникальные ники в чате:');
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/chat_messages?select=nickname`,
    { headers: headers() }
  );
  if (res.ok) {
    const data = await res.json();
    const nicks = [...new Set(data.map(m => m.nickname))].sort();
    console.log(`  ${nicks.join(', ') || '(пусто)'}`);
  }

  console.log('');
  console.log('🏆 Уникальные ники в лидерборде:');
  const res2 = await fetch(
    `${SUPABASE_URL}/rest/v1/leaderboard?select=nickname,level,total_xp&order=total_xp.desc`,
    { headers: headers() }
  );
  if (res2.ok) {
    const data = await res2.json();
    data.forEach(r => console.log(`  • ${r.nickname} — Lvl ${r.level}, ${r.total_xp} XP`));
  }
}

// ============================================
// МЕНЮ
// ============================================

(async function main() {
  console.log('============================================');
  console.log('   FireLand · модерация чата v3');
  console.log('   🔐 service_role (полный доступ)');
  console.log('============================================');
  console.log('');
  console.log('Что делаем?');
  console.log('  1 - удалить все сообщения от ника');
  console.log('  2 - удалить все сообщения со словом');
  console.log('  3 - забанить юзера (сообщения + реакции + комнаты + лидерборд)');
  console.log('  4 - удалить ВСЁ, КРОМЕ списка ников');
  console.log('  5 - показать статистику базы');
  console.log('  0 - выход');
  console.log('');

  const choice = (await ask('Выбор (0-5): ')).trim();

  if (choice === '0') {
    console.log('Выход.');
    rl.close();
    return;
  }

  if (choice === '1') {
    const nick = await ask('Ник: ');
    await deleteByNick(nick.trim());
  } else if (choice === '2') {
    const word = await ask('Слово: ');
    await deleteByWord(word.trim());
  } else if (choice === '3') {
    const nick = await ask('Ник: ');
    const confirm = (await ask(`Забанить "${nick}"? (y/n): `)).trim().toLowerCase();
    if (confirm === 'y') {
      await banUser(nick.trim());
    } else {
      console.log('Отмена.');
    }
  } else if (choice === '4') {
    const input = await ask('Кого оставить (через запятую): ');
    const keep = input.split(',').map(s => s.trim()).filter(Boolean);
    if (keep.length === 0) {
      console.log('❌ Список пуст.');
      rl.close();
      return;
    }
    console.log(`Оставить: ${keep.join(', ')}`);
    const confirm = (await ask(`Точно удалить всех, кроме этих ${keep.length} ников? (y/n): `)).trim().toLowerCase();
    if (confirm !== 'y') {
      console.log('Отмена.');
      rl.close();
      return;
    }
    await deleteAllExcept(keep);
  } else if (choice === '5') {
    await showStats();
  } else {
    console.log('❌ Неверный выбор.');
  }

  console.log('');
  console.log('============================================');
  console.log('   Готово!');
  console.log('============================================');

  rl.close();
})();