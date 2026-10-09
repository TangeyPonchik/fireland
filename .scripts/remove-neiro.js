// ============================================
// FireLand · remove-neiro.js
// Удаляет вкладку «Нейро» из проекта
// Запуск: node .scripts/remove-neiro.js
// ============================================

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');

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
let totalChanges = 0;
const report = [];

function backup(filePath) {
  const bak = filePath + '.bak-neiro';
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(filePath, bak);
  }
  return bak;
}

function save(filePath, content, label) {
  fs.writeFileSync(filePath, content, 'utf8');
  totalChanges++;
  report.push(`  ✅ ${label}`);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// ============================================
// 1. index.html
// ============================================
function processIndexHtml() {
  const p = path.join(ROOT, 'index.html');
  if (!fs.existsSync(p)) return;
  const old = read(p);
  let c = old;

  // Кнопка вкладки
  c = c.replace(
    /\s*<button class="tab-btn neiro-tab" data-tab="neiro">🧠 Нейро<\/button>\s*/,
    '\n'
  );

  // Блок tab-neiro целиком (от <div id="tab-neiro" до соответствующего закрытия)
  // Ищем по маркерам: от <div id="tab-neiro" до следующего <div id="tab-chat" ИЛИ до конца блока
  const neiroStart = c.indexOf('<div id="tab-neiro"');
  if (neiroStart !== -1) {
    // Находим следующий tab-content после neiro
    const after = c.indexOf('<div id="tab-chat"', neiroStart);
    if (after !== -1) {
      c = c.slice(0, neiroStart) + c.slice(after);
    } else {
      // Fallback: до конца </div> перед <div class="modal user-profile-modal"
      const fallback = c.indexOf('<div class="modal user-profile-modal"', neiroStart);
      if (fallback !== -1) {
        c = c.slice(0, neiroStart) + c.slice(fallback);
      }
    }
  }

  // Скрипт neiro.js
  c = c.replace(/\s*<script src="neiro\.js\?v=\d+"><\/script>\s*/, '\n');

  // Селектор модели в настройках
  c = c.replace(
    /\s*<div class="setting-row">\s*<div class="setting-info"><span class="setting-label">🧠 Модель нейросети<\/span>[\s\S]*?<\/div>\s*<\/div>\s*/,
    '\n'
  );

  if (c !== old) {
    backup(p);
    save(p, c, 'index.html: удалены вкладка, блок, скрипт, селектор модели');
  } else {
    report.push('  ⚠️ index.html: ничего не найдено (проверь вручную)');
  }
}

// ============================================
// 2. games.js — initTabs
// ============================================
function processGamesJs() {
  const p = path.join(ROOT, 'games.js');
  if (!fs.existsSync(p)) return;
  const old = read(p);
  let c = old;

  // Блок if (btn.dataset.tab === 'neiro') { ... }
  c = c.replace(
    /\s*if \(btn\.dataset\.tab === 'neiro'\) \{[\s\S]*?\}\s*/,
    '\n'
  );

  if (c !== old) {
    backup(p);
    save(p, "games.js: удалён блок if (btn.dataset.tab === 'neiro')");
  } else {
    report.push('  ⚠️ games.js: блок neiro не найден');
  }
}

// ============================================
// 3. device.js — tabsOrder + селектор
// ============================================
function processDeviceJs() {
  const p = path.join(ROOT, 'device.js');
  if (!fs.existsSync(p)) return;
  const old = read(p);
  let c = old;

  // tabsOrder — убираем 'neiro'
  c = c.replace(
    /const tabsOrder = \[([^\]]*)\];/,
    (m, inner) => {
      const items = inner
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== "'neiro'");
      return `const tabsOrder = [${items.join(', ')}];`;
    }
  );

  // Убираем .neiro-messages из игнорируемых селекторов
  c = c.replace(
    /\.lb-list, \.games-list-panel, \.chat-messages, \.online-list, \.dm-list, \.rooms-list, \.neiro-messages/,
    '.lb-list, .games-list-panel, .chat-messages, .online-list, .dm-list, .rooms-list'
  );
  c = c.replace(
    /, \.neiro-messages'/g,
    "'"
  );

  if (c !== old) {
    backup(p);
    save(p, "device.js: убран 'neiro' из tabsOrder и селекторов");
  } else {
    report.push('  ⚠️ device.js: neiro не найден');
  }
}

// ============================================
// 4. sw.js — PRECACHE_URLS
// ============================================
function processSwJs() {
  const p = path.join(ROOT, 'sw.js');
  if (!fs.existsSync(p)) return;
  const old = read(p);
  let c = old;

  c = c.replace(/\s*'\.\/neiro\.js\?v=\d+',\s*\n/, '\n');
  c = c.replace(/\s*'\.\/neiro\.js',\s*\n/, '\n');

  if (c !== old) {
    backup(p);
    save(p, 'sw.js: удалён neiro.js из PRECACHE_URLS');
  } else {
    report.push('  ⚠️ sw.js: neiro.js не найден в PRECACHE_URLS');
  }
}

// ============================================
// 5. style.css — секция NEIRO
// ============================================
function processStyleCss() {
  const p = path.join(ROOT, 'style.css');
  if (!fs.existsSync(p)) return;
  const old = read(p);
  let c = old;

  // Находим начало секции NEIRO
  const markerStart = c.indexOf('/* ============================================\n   NEIRO · Pollinations AI');
  if (markerStart !== -1) {
    // Конец: до .neiro-model-select option { ... } и закрывающей }
    // Ищем после markerStart последний .neiro-model-select option
    const optionIdx = c.indexOf('.neiro-model-select option', markerStart);
    if (optionIdx !== -1) {
      const closeIdx = c.indexOf('}', c.indexOf('{', optionIdx));
      if (closeIdx !== -1) {
        c = c.slice(0, markerStart) + c.slice(closeIdx + 1);
      }
    }
  }

  if (c !== old) {
    backup(p);
    save(p, `style.css: удалена секция NEIRO (${(old.length - c.length)} символов)`);
  } else {
    report.push('  ⚠️ style.css: секция NEIRO не найдена');
  }
}

// ============================================
// 6. Проверка «остатков»
// ============================================
function findLeftovers() {
  const files = [
    'index.html', 'style.css', 'script.js', 'games.js',
    'device.js', 'sw.js', 'profile.js', 'leaderboard.js',
    'messenger.js', 'storage.js', 'sound.js', 'streak.js'
  ];
  const leftovers = [];
  for (const f of files) {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) continue;
    const c = read(fp).toLowerCase();
    if (c.includes('neiro') || c.includes('нейро')) {
      const lines = c.split('\n');
      const hits = [];
      lines.forEach((line, i) => {
        if (line.toLowerCase().includes('neiro') || line.includes('Нейро')) {
          hits.push(`     строка ${i + 1}: ${line.trim().slice(0, 80)}`);
        }
      });
      if (hits.length > 0) {
        leftovers.push(`  ${f}:\n${hits.slice(0, 5).join('\n')}`);
      }
    }
  }
  return leftovers;
}

// ============================================
// MAIN
// ============================================
(async function main() {
  console.log('============================================');
  console.log('   FireLand · удаление вкладки «Нейро»');
  console.log('============================================');
  console.log('');
  console.log('Будет изменено:');
  console.log('  - index.html  (вкладка, блок, скрипт, селектор)');
  console.log('  - games.js    (initTabs)');
  console.log('  - device.js   (tabsOrder + селектор)');
  console.log('  - sw.js       (PRECACHE_URLS)');
  console.log('  - style.css   (секция NEIRO)');
  console.log('');
  console.log('НЕ трогается: neiro.js (удалишь сам)');
  console.log('Бэкапы: *.bak-neiro (рядом с каждым файлом)');
  console.log('');

  const confirm = (await ask('Продолжить? (y/n): ')).trim().toLowerCase();
  if (confirm !== 'y') {
    console.log('Отмена.');
    rl.close();
    process.exit(0);
  }

  console.log('');
  console.log('🔄 Обработка...');
  console.log('');

  processIndexHtml();
  processGamesJs();
  processDeviceJs();
  processSwJs();
  processStyleCss();

  console.log('📋 Отчёт:');
  report.forEach(line => console.log(line));
  console.log('');
  console.log(`✅ Изменено файлов: ${totalChanges}`);
  console.log('');

  // Проверка остатков
  const leftovers = findLeftovers();
  if (leftovers.length > 0) {
    console.log('⚠️ Найдены упоминания «neiro» в других файлах:');
    leftovers.forEach(l => console.log(l));
    console.log('');
    console.log('Проверь вручную — возможно, нужно удалить.');
  } else {
    console.log('🎉 Упоминаний «neiro» больше не найдено.');
  }

  console.log('');
  console.log('Дальше:');
  console.log('  1. Открой index.html в браузере, проверь 5 вкладок');
  console.log('  2. Удали neiro.js вручную (или: del neiro.js)');
  console.log('  3. Прогони version.js → bump версии');
  console.log('  4. git add . && git commit -m "Удалена вкладка Нейро"');
  console.log('');
  console.log('Откат: переименуй *.bak-neiro обратно в *.js / *.html / *.css');
  console.log('');

  const delNeiro = (await ask('Удалить neiro.js сейчас? (y/n): ')).trim().toLowerCase();
  if (delNeiro === 'y') {
    const np = path.join(ROOT, 'neiro.js');
    if (fs.existsSync(np)) {
      fs.unlinkSync(np);
      console.log('  ✅ neiro.js удалён');
    } else {
      console.log('  ⚠️ neiro.js не найден');
    }
  } else {
    console.log('  ⏭️ neiro.js оставлен (удалишь сам)');
  }

  console.log('');
  console.log('============================================');
  console.log('   ✅ Готово!');
  console.log('============================================');

  rl.close();
})();