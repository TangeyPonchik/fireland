// ============================================
// FireLand · version.js · управление версиями
// Запуск: node .scripts/version.js
// Бэкап в ZIP + метка + автоочистка
// Требует: npm install archiver@8 (в .scripts/)
// ============================================

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { ZipArchive } = require('archiver');

const ROOT = path.join(__dirname, '..');
const BACKUP_ROOT = 'C:\\Users\\chagi\\Мой диск\\FireLand_Backups\\';

// Что НЕ копировать в бэкап
const BACKUP_SKIP = new Set([
  'node_modules',
  '.scripts/node_modules',
  '.git',
  '.env.local',
  '.env',
  'FireLand_Backups'
]);

// Настройки автоочистки
const CLEANUP = {
  enabled: true,
  keepAllDays: 7,          // все бэкапы за 7 дней
  keepDailyDays: 30,       // по 1 в день за 30 дней
  keepWeeklyDays: 365,     // по 1 в неделю за 365 дней
  keepMonthlyForever: true // по 1 в месяц — вечно
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

// ============================================
// ХЕЛПЕРЫ БЭКАПА
// ============================================
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: 'pipe',
      cwd: ROOT
    }).toString().trim();
  } catch (e) {
    return '(нет git)';
  }
}

function getGitStatus() {
  try {
    const out = execSync('git status --porcelain', {
      stdio: 'pipe',
      cwd: ROOT
    }).toString().trim();
    return out ? 'есть изменения' : 'чисто';
  } catch (e) {
    return '(нет git)';
  }
}

// ============================================
// ZIP-АРХИВ
// ============================================
function createZipBackup(zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = new ZipArchive({
      zlib: { level: 9 }
    });

    output.on('close', () => resolve(archive.pointer()));
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.log('  ⚠️', err.message);
      } else {
        reject(err);
      }
    });

    archive.pipe(output);
    archive.directory(ROOT, false, (entry) => {
      const name = entry.name;
      for (const skip of BACKUP_SKIP) {
        if (name === skip || name.startsWith(skip + '/') || name.startsWith(skip + '\\')) {
          return false;
        }
      }
      return entry;
    });

    archive.finalize();
  });
}

// ============================================
// АВТООЧИСТКА
// ============================================
function parseBackupDate(filename) {
  const m = filename.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [_, year, month, day, hour, min, sec] = m;
  return new Date(
    parseInt(year), parseInt(month) - 1, parseInt(day),
    parseInt(hour), parseInt(min), parseInt(sec)
  );
}

function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const year = d.getFullYear();
  const week = Math.floor(((d - new Date(year, 0, 4)) / 86400000 + 4) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function cleanOldBackups() {
  if (!CLEANUP.enabled) return;
  if (!fs.existsSync(BACKUP_ROOT)) return;

  console.log('');
  console.log('🧹 Автоочистка старых бэкапов...');

  let entries;
  try {
    entries = fs.readdirSync(BACKUP_ROOT);
  } catch (e) {
    console.log('  ⚠️ Не удалось прочитать папку бэкапов');
    return;
  }

  const backups = [];
  for (const name of entries) {
    if (!name.endsWith('.zip')) continue;
    const date = parseBackupDate(name);
    if (!date) continue;
    let size = 0;
    try {
      size = fs.statSync(path.join(BACKUP_ROOT, name)).size;
    } catch (e) {}
    backups.push({ name, date, size });
  }

  if (backups.length === 0) {
    console.log('  Нет бэкапов');
    return;
  }

  backups.sort((a, b) => b.date - a.date);

  const now = new Date();
  const MS_DAY = 86400000;
  const seenDays = new Set();
  const seenWeeks = new Set();
  const seenMonths = new Set();

  const toKeep = new Set();
  const toDelete = [];

  for (const b of backups) {
    const ageDays = (now - b.date) / MS_DAY;

    if (ageDays <= CLEANUP.keepAllDays) {
      toKeep.add(b.name);
      seenDays.add(getDayKey(b.date));
      seenWeeks.add(getWeekKey(b.date));
      seenMonths.add(getMonthKey(b.date));
      continue;
    }

    if (ageDays <= CLEANUP.keepDailyDays) {
      const dayKey = getDayKey(b.date);
      if (!seenDays.has(dayKey)) {
        seenDays.add(dayKey);
        toKeep.add(b.name);
        seenWeeks.add(getWeekKey(b.date));
        seenMonths.add(getMonthKey(b.date));
      } else {
        toDelete.push(b);
      }
      continue;
    }

    if (ageDays <= CLEANUP.keepWeeklyDays) {
      const weekKey = getWeekKey(b.date);
      if (!seenWeeks.has(weekKey)) {
        seenWeeks.add(weekKey);
        toKeep.add(b.name);
        seenMonths.add(getMonthKey(b.date));
      } else {
        toDelete.push(b);
      }
      continue;
    }

    if (CLEANUP.keepMonthlyForever) {
      const monthKey = getMonthKey(b.date);
      if (!seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        toKeep.add(b.name);
      } else {
        toDelete.push(b);
      }
    } else {
      toDelete.push(b);
    }
  }

  if (toDelete.length === 0) {
    console.log(`  ✓ Нечего удалять (всего бэкапов: ${backups.length})`);
    return;
  }

  let freedBytes = 0;
  let deletedCount = 0;
  for (const b of toDelete) {
    try {
      fs.unlinkSync(path.join(BACKUP_ROOT, b.name));
      const txtPath = path.join(BACKUP_ROOT, b.name.replace(/\.zip$/, '.txt'));
      if (fs.existsSync(txtPath)) {
        try { fs.unlinkSync(txtPath); } catch (e) {}
      }
      freedBytes += b.size;
      deletedCount++;
    } catch (e) {
      console.log(`  ⚠️ Не удалось удалить ${b.name}: ${e.message}`);
    }
  }

  console.log(`  ✓ Удалено: ${deletedCount} бэкапов (${formatBytes(freedBytes)})`);
  console.log(`  ✓ Осталось: ${backups.length - deletedCount} бэкапов`);
}

// ============================================
// БЭКАП
// ============================================
async function makeBackup(version, label = null) {
  console.log('');
  console.log('💾 Бэкап (ZIP)...');

  if (!fs.existsSync('C:\\Users\\chagi\\Мой диск\\')) {
    console.log('  ❌ Папка "Мой диск" не найдена!');
    console.log('     Проверь, что Google Drive запущен');
    return false;
  }

  const commit = getGitCommit();
  const gitStatus = getGitStatus();

  const now = new Date();
  const dateStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  const timeStr = String(now.getHours()).padStart(2, '0') + '-' +
    String(now.getMinutes()).padStart(2, '0') + '-' +
    String(now.getSeconds()).padStart(2, '0');

  const labelPart = label ? `_${label}` : '';
  const zipName = `v${version}${labelPart}_${dateStr}_${timeStr}.zip`;
  const zipPath = path.join(BACKUP_ROOT, zipName);

  console.log(`  📝 Версия: v${version}`);
  console.log(`  🌿 Git: ${commit} (${gitStatus})`);
  console.log(`  📁 Куда: ${zipPath}`);
  console.log('');
  console.log('  📦 Создаю архив...');

  try {
    if (!fs.existsSync(BACKUP_ROOT)) {
      fs.mkdirSync(BACKUP_ROOT, { recursive: true });
    }
  } catch (e) {
    console.log(`  ❌ Не удалось создать папку: ${e.message}`);
    return false;
  }

  let zipSize = 0;
  try {
    zipSize = await createZipBackup(zipPath);
  } catch (e) {
    console.log(`  ❌ Ошибка создания ZIP: ${e.message}`);
    return false;
  }

  const info = [
    `FireLand Backup (ZIP)`,
    `=====================`,
    `Версия: ${version}`,
    `Метка: ${label || '(нет)'}`,
    `Дата: ${now.toLocaleString('ru-RU')}`,
    `Git commit: ${commit}`,
    `Git status: ${gitStatus}`,
    `Источник: ${ROOT}`,
    `ZIP-файл: ${zipName}`,
    `Размер архива: ${formatBytes(zipSize)}`,
    ``,
    `Исключено из бэкапа:`,
    `  - node_modules/`,
    `  - .scripts/node_modules/`,
    `  - .git/`,
    `  - .env.local (service_role ключ)`,
    `  - .env`,
    `  - FireLand_Backups`
  ].join('\n');
  try {
    fs.writeFileSync(zipPath.replace(/\.zip$/, '.txt'), info, 'utf8');
  } catch (e) {}

  console.log(`  ✅ Готово!`);
  console.log(`     Архив: ${formatBytes(zipSize)}`);
  console.log(`     Путь: ${zipPath}`);

  // Автоочистка
  cleanOldBackups();

  return true;
}

// ============================================
// ЧТЕНИЕ / ПАРСИНГ ВЕРСИЙ
// ============================================
function readVersion() {
  const scriptPath = path.join(ROOT, 'script.js');
  const content = fs.readFileSync(scriptPath, 'utf8');
  const m = content.match(/const APP_VERSION = '([^']+)'/);
  if (!m) throw new Error('APP_VERSION не найден в script.js');
  return m[1];
}

function parseVersion(v) {
  const parts = v.split('.').map(Number);
  return { major: parts[0], minor: parts[1], patch: parts[2] };
}

function buildVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function buildLabel({ major, minor, patch }) {
  return `${major}.${minor}:${patch}`;
}

function bumpVersion(cur, type) {
  const v = parseVersion(cur);
  if (type === 'm') {
    return { major: v.major + 1, minor: 0, patch: 0 };
  }
  if (type === 'n') {
    return { major: v.major, minor: v.minor + 1, patch: 0 };
  }
  if (type === 'f') {
    return { major: v.major, minor: v.minor, patch: v.patch + 1 };
  }
  throw new Error('Тип должен быть m / n / f');
}

// ============================================
// ОБНОВЛЕНИЕ ФАЙЛОВ
// ============================================
function updateScript(newVer, newLabel) {
  const p = path.join(ROOT, 'script.js');
  const old = fs.readFileSync(p, 'utf8');
  let c = old;

  c = c.replace(
    /const APP_VERSION = '[^']+'/,
    `const APP_VERSION = '${newVer}'`
  );
  c = c.replace(
    /const APP_VERSION_LABEL = '[^']+'/,
    `const APP_VERSION_LABEL = '${newLabel}'`
  );

  if (!/const APP_VERSION = '[^']*'/.test(c) || c === old) {
    console.log(`  ⚠️ script.js: APP_VERSION НЕ заменён — проверь формат строки!`);
    return false;
  }

  fs.writeFileSync(p, c, 'utf8');
  console.log(`  ✅ script.js: APP_VERSION = ${newVer}, APP_VERSION_LABEL = ${newLabel}`);
  return true;
}

function findCurrentV() {
  const p = path.join(ROOT, 'index.html');
  const c = fs.readFileSync(p, 'utf8');
  const m = c.match(/style\.css\?v=(\d+)/);
  if (!m) return 34;
  return parseInt(m[1], 10);
}

function updateIndex(newVer, newLabel, newV) {
  const p = path.join(ROOT, 'index.html');
  const old = fs.readFileSync(p, 'utf8');
  let c = old;

  c = c.replace(
    /(<span class="version" id="appVersion">)[^<]*(<\/span>)/,
    `$1v${newLabel}$2`
  );
  c = c.replace(/\?v=\d+/g, `?v=${newV}`);

  if (c === old) {
    console.log(`  ⚠️ index.html: НИЧЕГО НЕ ЗАМЕНЕНО — проверь appVersion и ?v=`);
    return false;
  }

  if (!/<\/html>\s*$/.test(c.trim())) {
    console.log(`  ❌ index.html: повреждена структура (нет </html> в конце)! Откат.`);
    return false;
  }

  fs.writeFileSync(p, c, 'utf8');
  console.log(`  ✅ index.html: appVersion = v${newLabel}, ?v= → ?v=${newV}`);
  return true;
}

function updateSw(newVer, newV) {
  const p = path.join(ROOT, 'sw.js');
  const old = fs.readFileSync(p, 'utf8');
  let c = old;

  c = c.replace(
    /const CACHE_NAME = '[^']+'/,
    `const CACHE_NAME = 'fireland-v${newVer}'`
  );
  c = c.replace(
    /const CACHE_VERSION = '[^']+'/,
    `const CACHE_VERSION = '${newVer}'`
  );
  c = c.replace(/\?v=\d+/g, `?v=${newV}`);

  if (c === old) {
    console.log(`  ⚠️ sw.js: НИЧЕГО НЕ ЗАМЕНЕНО`);
    return false;
  }

  const tmp = p.replace(/\.js$/, '.__check__.js');
  fs.writeFileSync(tmp, c, 'utf8');
  try {
    execSync(`node --check "${tmp}"`, { stdio: 'pipe' });
    fs.unlinkSync(tmp);
  } catch (e) {
    fs.unlinkSync(tmp);
    console.log(`  ❌ sw.js: СИНТАКСИЧЕСКАЯ ОШИБКА после замены!`);
    const errLine = (e.stderr?.toString() || e.message || '').split('\n').slice(0, 3).join('\n');
    console.log(`     ${errLine}`);
    console.log(`  ↩️ Откатил sw.js к предыдущей версии`);
    return false;
  }

  fs.writeFileSync(p, c, 'utf8');
  console.log(`  ✅ sw.js: CACHE_NAME = fireland-v${newVer}, CACHE_VERSION = ${newVer}, ?v= → ?v=${newV}`);
  return true;
}

// ============================================
// MAIN
// ============================================
(async function main() {
  console.log('============================================');
  console.log('   FireLand · обновление версии');
  console.log('============================================');
  console.log('');

  // Проверка archiver
  try {
    require.resolve('archiver');
  } catch (e) {
    console.error('❌ Модуль archiver не установлен!');
    console.error('');
    console.error('Установи один раз:');
    console.error('  cd ' + path.join(ROOT, '.scripts'));
    console.error('  npm install archiver@8');
    console.error('');
    rl.close();
    process.exit(1);
  }

  console.log('Введите тип обновления:');
  console.log('  m - мажор   (гигантское)');
  console.log('  n - минор   (новая игра)');
  console.log('  f - фикс    (исправление)');
  console.log('');

  const type = (await ask('Тип (m/n/f): ')).trim().toLowerCase();
  if (!['m', 'n', 'f'].includes(type)) {
    console.log('❌ Неверный тип. Нужно m / n / f.');
    rl.close();
    process.exit(1);
  }

  const cur = readVersion();
  const parsed = parseVersion(cur);
  const next = bumpVersion(cur, type);
  const newVer = buildVersion(next);
  const newLabel = buildLabel(next);
  const oldV = findCurrentV();
  const newV = oldV + 1;

  console.log('');
  console.log(`Текущая версия: ${cur}`);
  console.log(`Мажор: ${parsed.major}`);
  console.log(`Минор: ${parsed.minor}`);
  console.log(`Фикс: ${parsed.patch}`);
  console.log('');
  console.log(`Новая версия: ${newVer}`);
  console.log(`В UI: v${newLabel}`);
  console.log(`?v=${oldV} → ?v=${newV}`);
  console.log('');

  const confirm = (await ask('Подтвердить? (y/n): ')).trim().toLowerCase();
  if (confirm !== 'y') {
    console.log('Отмена.');
    rl.close();
    process.exit(0);
  }

  console.log('');
  console.log('[1/3] script.js...');
  const okScript = updateScript(newVer, newLabel);

  console.log('[2/3] index.html...');
  const okIndex = updateIndex(newVer, newLabel, newV);

  console.log('[3/3] sw.js...');
  const okSw = updateSw(newVer, newV);

  if (!okScript || !okIndex || !okSw) {
    console.log('');
    console.log('============================================');
    console.log('   ❌ НЕ ВСЁ ОБНОВИЛОСЬ — проверь warnings выше');
    console.log('============================================');
    rl.close();
    process.exit(1);
  }

  console.log('');
  console.log('============================================');
  console.log(`   ✅ Готово! Версия: v${newLabel}`);
  console.log('============================================');
  console.log('');
  console.log('Что дальше:');
  console.log('  1. Проверь файлы (git diff)');
  console.log('  2. git add .');
  console.log(`  3. git commit -m "v${newVer} - [что изменил]"`);
  console.log('  4. git push');
  console.log('');

  // ==========================================
  // БЭКАП (ZIP + метка + автоочистка)
  // ==========================================
  const backupNow = (await ask('💾 Сделать ZIP-бэкап? (y/n): ')).trim().toLowerCase();
  if (backupNow === 'y') {
    const label = (await ask('Метка бэкапа (Enter — без метки): ')).trim();
    await makeBackup(newVer, label || null);
  } else {
    console.log('Бэкап пропущен.');
  }

  // ==========================================
  // GIT PUSH
  // ==========================================
  console.log('');
  const pushNow = (await ask('Сделать git push сейчас? (y/n): ')).trim().toLowerCase();
  if (pushNow === 'y') {
    const msg = await ask('Commit message: ');
    try {
      console.log('');
      console.log('git add .');
      execSync('git add .', { stdio: 'inherit', cwd: ROOT });
      console.log(`git commit -m "v${newVer}: ${msg}"`);
      execSync(`git commit -m "v${newVer}: ${msg}"`, { stdio: 'inherit', cwd: ROOT });
      console.log('git push');
      execSync('git push', { stdio: 'inherit', cwd: ROOT });
      console.log('');
      console.log('✅ Push выполнен!');
    } catch (e) {
      console.log('');
      console.log('❌ Ошибка при push:', e.message);
    }
  }

  rl.close();
})();