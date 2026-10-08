// ============================================
// FireLand · backup.js · бэкап проекта (ZIP)
// Запуск: .scripts\backup.bat
// Требует: npm install archiver@8
// Автоочистка: 7д / 30д / 365д / вечно
// ============================================

const fs = require('fs');
const path = require('path');
const readline = require('readline');
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
// ХЕЛПЕРЫ
// ============================================
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

function getCurrentVersion() {
  try {
    const p = path.join(ROOT, 'script.js');
    const content = fs.readFileSync(p, 'utf8');
    const m = content.match(/const APP_VERSION = '([^']+)'/);
    return m ? m[1] : 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

function getGitCommit() {
  try {
    const { execSync } = require('child_process');
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
    const { execSync } = require('child_process');
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
  // Имя: v27.2.1_67_2026-10-07_23-55-03.zip
  const m = filename.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [_, year, month, day, hour, min, sec] = m;
  return new Date(
    parseInt(year), parseInt(month) - 1, parseInt(day),
    parseInt(hour), parseInt(min), parseInt(sec)
  );
}

function getWeekKey(date) {
  // ISO week: год-неделя
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

  // Собираем только ZIP-файлы
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

  // Сортируем по дате (новые сверху)
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

    // 1. Последние 7 дней — оставляем всё
    if (ageDays <= CLEANUP.keepAllDays) {
      toKeep.add(b.name);
      seenDays.add(getDayKey(b.date));
      seenWeeks.add(getWeekKey(b.date));
      seenMonths.add(getMonthKey(b.date));
      continue;
    }

    // 2. 7–30 дней — по 1 в день
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

    // 3. 30–365 дней — по 1 в неделю
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

    // 4. Старше 365 дней — по 1 в месяц
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
      // Удаляем .txt рядом
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
async function makeBackup(label = null) {
  console.log('');
  console.log('💾 Бэкап (ZIP)...');

  if (!fs.existsSync('C:\\Users\\chagi\\Мой диск\\')) {
    console.log('  ❌ Папка "Мой диск" не найдена!');
    console.log('     Проверь, что Google Drive запущен');
    return false;
  }

  const version = getCurrentVersion();
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
// MAIN
// ============================================
(async function main() {
  console.log('============================================');
  console.log('   FireLand · бэкап проекта (ZIP)');
  console.log('============================================');
  console.log('');

  const version = getCurrentVersion();
  const commit = getGitCommit();

  console.log(`📝 Текущая версия: v${version}`);
  console.log(`🌿 Git commit: ${commit}`);
  console.log(`📁 Источник: ${ROOT}`);
  console.log(`💾 Назначение: ${BACKUP_ROOT}`);
  console.log('');

  const label = (await ask('Метка бэкапа (Enter — без метки): ')).trim();

  console.log('');
  const confirm = (await ask('Сделать ZIP-бэкап? (y/n): ')).trim().toLowerCase();
  if (confirm !== 'y') {
    console.log('Отмена.');
    rl.close();
    process.exit(0);
  }

  const ok = await makeBackup(label || null);

  console.log('');
  console.log('============================================');
  console.log(ok ? '   ✅ Готово!' : '   ❌ Ошибка');
  console.log('============================================');

  rl.close();
})();