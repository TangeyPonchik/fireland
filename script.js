<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Snakes Battle</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0e17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #fff; }
  #game-container { position: relative; width: 100vw; height: 100vh; }
  canvas#gameCanvas { display: block; width: 100%; height: 100%; touch-action: none; }

  #hud {
    position: absolute; top: 0; left: 0; right: 0; padding: 12px 16px;
    display: flex; justify-content: space-between; align-items: flex-start;
    pointer-events: none; z-index: 5;
  }
  .team-score { display: flex; gap: 16px; }
  .team-badge {
    padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 14px;
    background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1);
  }
  .team-badge.red { color: #ff4d5e; border-color: rgba(255,77,94,0.4); }
  .team-badge.blue { color: #4d9eff; border-color: rgba(77,158,255,0.4); }
  #player-stats { text-align: right; font-size: 13px; opacity: 0.85; }
  #player-stats div { margin-bottom: 4px; }
  #player-stats b { font-size: 16px; color: #7dffb0; }

  #miniMap {
    position: absolute; bottom: 16px; right: 16px; width: 120px; height: 120px;
    border-radius: 12px; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15); z-index: 5;
  }

  #lobby {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 50% 40%, #1a2332 0%, #0a0e17 70%);
    z-index: 20; transition: opacity 0.4s;
  }
  #lobby.hidden { opacity: 0; pointer-events: none; }
  .lobby-card {
    width: 90%; max-width: 420px; padding: 32px 28px; border-radius: 20px;
    background: rgba(20, 28, 42, 0.85); backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    text-align: center;
  }
  .lobby-card h1 {
    font-size: 32px; margin-bottom: 8px; letter-spacing: -1px;
    background: linear-gradient(90deg, #ff4d5e, #4d9eff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .lobby-card p { font-size: 14px; opacity: 0.6; margin-bottom: 24px; }
  .btn {
    width: 100%; padding: 16px; border: none; border-radius: 12px; font-size: 16px;
    font-weight: 700; cursor: pointer; transition: all 0.2s;
    background: linear-gradient(135deg, #4d9eff, #7d5eff); color: #fff;
    margin-bottom: 10px;
  }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(77,158,255,0.4); }
  .btn:active { transform: translateY(0); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn.secondary { background: rgba(255,255,255,0.08); font-size: 14px; padding: 12px; }

  #match-status { margin-top: 16px; font-size: 14px; opacity: 0.7; min-height: 20px; }
  #timer-bar {
    width: 100%; height: 4px; background: rgba(255,255,255,0.1);
    border-radius: 2px; margin-top: 10px; overflow: hidden; display: none;
  }
  #timer-bar.show { display: block; }
  #timer-fill { height: 100%; background: linear-gradient(90deg, #4d9eff, #7d5eff); width: 0%; transition: width 0.1s linear; }
  #players-list { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .player-chip {
    padding: 6px 12px; border-radius: 16px; font-size: 13px; font-weight: 600;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
  }
  .player-chip.red { background: rgba(255,77,94,0.2); border-color: rgba(255,77,94,0.4); }
  .player-chip.blue { background: rgba(77,158,255,0.2); border-color: rgba(77,158,255,0.4); }

  #death-screen {
    position: absolute; inset: 0; display: none; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 15;
  }
  #death-screen.show { display: flex; }
  .death-card { text-align: center; padding: 32px; }
  .death-card h2 { font-size: 28px; margin-bottom: 12px; color: #ff4d5e; }
  .death-card p { opacity: 0.7; margin-bottom: 24px; }

  #joystick {
    position: absolute; display: none; width: 120px; height: 120px; border-radius: 50%;
    background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.2);
    pointer-events: none; z-index: 6; transform: translate(-50%, -50%);
  }
  #joystick-knob {
    position: absolute; top: 50%; left: 50%; width: 50px; height: 50px; border-radius: 50%;
    background: rgba(255,255,255,0.35); transform: translate(-50%, -50%);
  }
  @media (pointer: coarse) { #joystick { display: block; } }

  #boost-btn {
    position: absolute; bottom: 30px; left: 30px; width: 80px; height: 80px; border-radius: 50%;
    background: rgba(125,255,176,0.15); border: 2px solid rgba(125,255,176,0.4);
    color: #7dffb0; font-size: 12px; font-weight: 700; display: none;
    align-items: center; justify-content: center; z-index: 6; touch-action: none;
  }
  @media (pointer: coarse) { #boost-btn { display: flex; } }
</style>
</head>
<body>
<div id="game-container">
  <canvas id="gameCanvas"></canvas>

  <div id="hud">
    <div class="team-score">
      <div class="team-badge red">🔴 <span id="red-score">0</span></div>
      <div class="team-badge blue">🔵 <span id="blue-score">0</span></div>
    </div>
    <div id="player-stats">
      <div>Длина: <b id="stat-length">10</b></div>
      <div>Убийств: <b id="stat-kills">0</b></div>
      <div>Тиммейтов: <b id="stat-allies">0</b></div>
    </div>
  </div>

  <canvas id="miniMap" width="120" height="120"></canvas>
  <div id="joystick"><div id="joystick-knob"></div></div>
  <button id="boost-btn">BOOST</button>

  <div id="lobby">
    <div class="lobby-card">
      <h1>Snakes Battle</h1>
      <p>Командные бои · до 10 игроков</p>
      <button class="btn" id="play-btn">Найти матч</button>
      <button class="btn secondary" id="bots-btn">🤖 Играть с ботами (1 vs 5)</button>
      <div id="match-status">Нажми «Найти матч», чтобы начать</div>
      <div id="timer-bar"><div id="timer-fill"></div></div>
      <div id="players-list"></div>
    </div>
  </div>

  <div id="death-screen">
    <div class="death-card">
      <h2>Вы погибли</h2>
      <p id="death-reason">Столкновение с врагом</p>
      <button class="btn" id="respawn-btn">Респавн</button>
      <button class="btn secondary" id="leave-btn">Выйти в лобби</button>
    </div>
  </div>
</div>

<script type="module">
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/* ============================================================
   1. КОНФИГ SUPABASE
   ============================================================ */
const SUPABASE_URL = 'https://brqlmsbvwmycyhiluuui.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWxtc2J2d215Y3loaWx1dXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODQwMDYsImV4cCI6MjEwNTA2MDAwNn0.mIW8zji9P67qIFm8V8dFcMV2wzoI6GnRYg9prxKAxj8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: { params: { eventsPerSecond: 30 } }
});

/* ============================================================
   2. КОНСТАНТЫ
   ============================================================ */
const WORLD_SIZE = 3000;
const MAX_PLAYERS = 10;
const MATCH_WINDOW = 20000;   // автостарт через 20 сек после первого игрока
const BASE_SPEED = 2.4;
const BOOST_MULTIPLIER = 2.0;
const BOOST_LENGTH_COST = 0.15;
const SEGMENT_SPACING = 6;
const START_LENGTH = 10;
const FOOD_COUNT = 400;
const TICK_RATE = 33;
const TURN_SPEED = 0.15;
const BOT_COUNT = 5;

const TEAM_RED = 'red';
const TEAM_BLUE = 'blue';

/* ============================================================
   3. СОСТОЯНИЕ
   ============================================================ */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const miniMap = document.getElementById('miniMap');
const mmCtx = miniMap.getContext('2d');

let myId = Math.random().toString(36).substring(2, 10);
let myName = 'Игрок' + Math.floor(Math.random() * 1000);
let myTeam = TEAM_RED;
let roomId = null;
let channel = null;
let gameState = 'lobby';
let hostId = null;
let matchStartAt = 0;
let isBotMode = false;

let players = new Map();
let bots = [];
let foods = [];
let camera = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };
let mySnake = null;
let kills = 0;
let lastBroadcast = 0;
let timerInterval = null;

let input = { targetAngle: 0, boosting: false, hasInput: false };

/* ============================================================
   4. УТИЛИТЫ
   ============================================================ */
function rand(min, max) { return Math.random() * (max - min) + min; }
function dist(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx*dx + dy*dy); }
function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/* ============================================================
   5. КЛАСС ЗМЕЙКИ
   ============================================================ */
class Snake {
  constructor(id, name, team, x, y, isLocal = false, isBot = false) {
    this.id = id; this.name = name; this.team = team;
    this.isLocal = isLocal; this.isBot = isBot;
    this.x = x; this.y = y;
    this.angle = rand(0, Math.PI * 2);
    this.targetAngle = this.angle;
    this.speed = BASE_SPEED;
    this.boosting = false;
    this.length = START_LENGTH;
    this.alive = true;
    this.segments = [];
    this.kills = 0;
    this.color = team === TEAM_RED ? '#ff4d5e' : '#4d9eff';
    this.glowColor = team === TEAM_RED ? 'rgba(255,77,94,0.5)' : 'rgba(77,158,255,0.5)';
    for (let i = 0; i < this.length; i++) {
      this.segments.push({ x: x - i * SEGMENT_SPACING, y });
    }
  }

  update() {
    if (!this.alive) return;
    this.angle = lerpAngle(this.angle, this.targetAngle, TURN_SPEED);
    let spd = BASE_SPEED;
    if (this.boosting && this.length > 5) {
      spd *= BOOST_MULTIPLIER;
      this.length -= BOOST_LENGTH_COST;
    }
    this.speed = spd;
    this.x += Math.cos(this.angle) * spd;
    this.y += Math.sin(this.angle) * spd;
    if (this.x < 0) this.x = WORLD_SIZE;
    if (this.x > WORLD_SIZE) this.x = 0;
    if (this.y < 0) this.y = WORLD_SIZE;
    if (this.y > WORLD_SIZE) this.y = 0;
    this.updateSegments();
  }

  updateSegments() {
    this.segments.unshift({ x: this.x, y: this.y });
    const maxSegments = Math.floor(this.length);
    while (this.segments.length > maxSegments) this.segments.pop();
    for (let i = 1; i < this.segments.length; i++) {
      const prev = this.segments[i-1], cur = this.segments[i];
      const d = dist(prev, cur);
      if (d > SEGMENT_SPACING) {
        const ratio = SEGMENT_SPACING / d;
        cur.x = prev.x + (cur.x - prev.x) * ratio;
        cur.y = prev.y + (cur.y - prev.y) * ratio;
      }
    }
  }

  draw(ctx) {
    if (!this.alive || this.segments.length === 0) return;
    ctx.save();
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = this.boosting ? 25 : 12;
    const step = this.segments.length > 100 ? 2 : 1;
    for (let i = this.segments.length - 1; i >= 0; i -= step) {
      const seg = this.segments[i];
      if (!seg) continue;
      const r = Math.max(3, 10 * (1 - i / this.segments.length / 2));
      const alpha = 1 - (i / this.segments.length) * 0.4;
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, r, 0, Math.PI * 2);
      ctx.fillStyle = this.hexWithAlpha(this.color, alpha);
      ctx.fill();
    }
    const head = this.segments[0];
    ctx.beginPath();
    ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    const eyeOffset = 5, perpAngle = this.angle + Math.PI / 2;
    for (const side of [-1, 1]) {
      const ex = head.x + Math.cos(this.angle) * 4 + Math.cos(perpAngle) * eyeOffset * side;
      const ey = head.y + Math.sin(this.angle) * 4 + Math.sin(perpAngle) * eyeOffset * side;
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0e17';
      ctx.fill();
    }
    if (!this.isLocal) {
      ctx.shadowBlur = 0;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(this.name, head.x, head.y - 22);
    }
    ctx.restore();
  }

  hexWithAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  grow(a) { this.length += a; }

  toNet() {
    return {
      id: this.id, name: this.name, team: this.team,
      x: Math.round(this.x), y: Math.round(this.y),
      a: Math.round(this.angle * 100) / 100,
      l: Math.round(this.length), b: this.boosting, k: this.kills
    };
  }

  applyNet(data) {
    const dx = data.x - this.x, dy = data.y - this.y;
    if (Math.abs(dx) < 500 && Math.abs(dy) < 500) {
      this.x += dx * 0.35; this.y += dy * 0.35;
    } else { this.x = data.x; this.y = data.y; }
    this.targetAngle = data.a;
    this.length = data.l;
    this.boosting = data.b;
    this.kills = data.k;
    this.updateSegments();
  }
}

/* ============================================================
   6. БОТЫ
   ============================================================ */
class Bot extends Snake {
  constructor(id, x, y, team) {
    super(id, 'Бот' + id.slice(-3), team, x, y, false, true);
    this.aiTimer = 0;
    this.targetFood = null;
  }

  update() {
    if (!this.alive) return;

    // Простой ИИ: ищем ближайшую еду и цель — врага рядом
    this.aiTimer--;
    if (this.aiTimer <= 0) {
      this.aiTimer = 20 + Math.floor(rand(0, 20));
      this.targetFood = this.findNearestFood();
    }

    // Угроза: проверяем врагов впереди
    const threat = this.findThreat();
    if (threat) {
      // Уворачиваемся — поворачиваем от врага
      const dx = this.x - threat.x;
      const dy = this.y - threat.y;
      this.targetAngle = Math.atan2(dy, dx);
    } else if (this.targetFood) {
      const dx = this.targetFood.x - this.x;
      const dy = this.targetFood.y - this.y;
      this.targetAngle = Math.atan2(dy, dx);
    } else {
      this.targetAngle += rand(-0.1, 0.1);
    }

    // Избегание стен
    const margin = 150;
    if (this.x < margin) this.targetAngle = 0;
    else if (this.x > WORLD_SIZE - margin) this.targetAngle = Math.PI;
    if (this.y < margin) this.targetAngle = Math.PI / 2;
    else if (this.y > WORLD_SIZE - margin) this.targetAngle = -Math.PI / 2;

    super.update();
  }

  findNearestFood() {
    let best = null, bestD = Infinity;
    for (const f of foods) {
      const d = dist(this, f);
      if (d < bestD && d < 600) { bestD = d; best = f; }
    }
    return best;
  }

  findThreat() {
    // Своих игнорим
    for (const p of players.values()) {
      if (!p.alive || p.id === this.id) continue;
      if (p.team === this.team) continue;
      const head = p.segments[0];
      if (!head) continue;
      const dx = head.x - this.x;
      const dy = head.y - this.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 200) {
        // Проверяем, движется ли враг в нашу сторону
        const enemyDir = p.angle;
        const toMe = Math.atan2(-dy, -dx);
        let angleDiff = Math.abs(enemyDir - toMe);
        while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);
        if (angleDiff < Math.PI / 3) return p;
      }
    }
    return null;
  }
}

/* ============================================================
   7. ЕДА
   ============================================================ */
function spawnFood() {
  foods = [];
  for (let i = 0; i < FOOD_COUNT; i++) {
    foods.push({
      x: rand(50, WORLD_SIZE - 50), y: rand(50, WORLD_SIZE - 50),
      r: rand(3, 5), color: `hsl(${rand(0, 360)}, 70%, 60%)`, value: 1
    });
  }
}

function spawnDeathFood(x, y, team) {
  for (let i = 0; i < 30; i++) {
    const angle = rand(0, Math.PI * 2), r = rand(0, 40);
    foods.push({
      x: x + Math.cos(angle) * r, y: y + Math.sin(angle) * r,
      r: rand(4, 7), color: team === TEAM_RED ? '#ff4d5e' : '#4d9eff', value: 3
    });
  }
}

/* ============================================================
   8. КОЛЛИЗИИ
   ============================================================ */
function checkCollisions() {
  if (!mySnake || !mySnake.alive) return;
  const head = mySnake.segments[0];
  if (!head) return;

  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    if (dist(head, f) < 15) {
      mySnake.grow(f.value);
      foods.splice(i, 1);
      foods.push({
        x: rand(50, WORLD_SIZE - 50), y: rand(50, WORLD_SIZE - 50),
        r: rand(3, 5), color: `hsl(${rand(0, 360)}, 70%, 60%)`, value: 1
      });
    }
  }

  for (const p of players.values()) {
    if (p.id === mySnake.id || !p.alive) continue;
    if (p.team === mySnake.team) continue;
    for (let i = 0; i < p.segments.length; i += 2) {
      const seg = p.segments[i];
      if (!seg) continue;
      if (dist(head, seg) < 14) { die('Столкновение с врагом', p.id); return; }
    }
  }
}

function checkBotCollisions() {
  for (const bot of bots) {
    if (!bot.alive) continue;
    const head = bot.segments[0];
    if (!head) continue;

    // Еда
    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      if (dist(head, f) < 15) {
        bot.grow(f.value);
        foods.splice(i, 1);
        foods.push({
          x: rand(50, WORLD_SIZE - 50), y: rand(50, WORLD_SIZE - 50),
          r: rand(3, 5), color: `hsl(${rand(0, 360)}, 70%, 60%)`, value: 1
        });
      }
    }

    // Столкновения с врагами
    for (const p of players.values()) {
      if (p.id === bot.id || !p.alive) continue;
      if (p.team === bot.team) continue;
      for (let i = 0; i < p.segments.length; i += 2) {
        const seg = p.segments[i];
        if (!seg) continue;
        if (dist(head, seg) < 14) {
          killBot(bot, p.id);
          break;
        }
      }
      if (!bot.alive) break;
    }

    // Столкновения с другими ботами
    if (bot.alive) {
      for (const other of bots) {
        if (other.id === bot.id || !other.alive) continue;
        if (other.team === bot.team) continue;
        for (let i = 0; i < other.segments.length; i += 2) {
          const seg = other.segments[i];
          if (!seg) continue;
          if (dist(head, seg) < 14) { killBot(bot, other.id); break; }
        }
        if (!bot.alive) break;
      }
    }

    // Столкновение с игроком (если игрок жив)
    if (bot.alive && mySnake && mySnake.alive && mySnake.team !== bot.team) {
      const myHead = mySnake.segments[0];
      if (myHead && dist(myHead, head) < 14) {
        // Игрок убил бота
        killBot(bot, myId);
        kills++;
      }
    }
  }
}

function killBot(bot, killerId) {
  bot.alive = false;
  spawnDeathFood(bot.x, bot.y, bot.team);
  if (killerId === myId) kills++;
}

/* ============================================================
   9. ВВОД
   ============================================================ */
function setupInput() {
  canvas.addEventListener('mousemove', (e) => {
    if (!mySnake || !mySnake.alive) return;
    const rect = canvas.getBoundingClientRect();
    const dx = (e.clientX - rect.left) - canvas.width / 2;
    const dy = (e.clientY - rect.top) - canvas.height / 2;
    input.targetAngle = Math.atan2(dy, dx);
    input.hasInput = true;
  });

  const joystick = document.getElementById('joystick');
  const knob = document.getElementById('joystick-knob');
  let touchId = null, jx = 0, jy = 0;

  canvas.addEventListener('touchstart', (e) => {
    if (!mySnake || !mySnake.alive) return;
    e.preventDefault();
    const t = e.changedTouches[0];
    touchId = t.identifier; jx = t.clientX; jy = t.clientY;
    joystick.style.left = jx + 'px'; joystick.style.top = jy + 'px';
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (!mySnake || !mySnake.alive) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === touchId) {
        const dx = t.clientX - jx, dy = t.clientY - jy;
        const d = Math.sqrt(dx*dx + dy*dy);
        const maxD = 50, clampedD = Math.min(d, maxD);
        const nx = d > 0 ? dx / d : 0, ny = d > 0 ? dy / d : 0;
        knob.style.left = (50 + nx * clampedD / 60 * 50) + '%';
        knob.style.top = (50 + ny * clampedD / 60 * 50) + '%';
        if (d > 8) { input.targetAngle = Math.atan2(dy, dx); input.hasInput = true; }
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === touchId) { touchId = null; joystick.style.left = '-9999px'; }
    }
  });

  const boostBtn = document.getElementById('boost-btn');
  boostBtn.addEventListener('touchstart', (e) => { e.preventDefault(); input.boosting = true; }, { passive: false });
  boostBtn.addEventListener('touchend', (e) => { e.preventDefault(); input.boosting = false; }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ShiftLeft') input.boosting = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ShiftLeft') input.boosting = false;
  });
}

/* ============================================================
   10. РЕНДЕР
   ============================================================ */
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

function drawGrid() {
  const gridSize = 100;
  const startX = Math.floor((camera.x - canvas.width/2) / gridSize) * gridSize;
  const startY = Math.floor((camera.y - canvas.height/2) / gridSize) * gridSize;
  const endX = camera.x + canvas.width/2, endY = camera.y + canvas.height/2;
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = startX; x < endX; x += gridSize) {
    ctx.moveTo(x - camera.x + canvas.width/2, 0);
    ctx.lineTo(x - camera.x + canvas.width/2, canvas.height);
  }
  for (let y = startY; y < endY; y += gridSize) {
    ctx.moveTo(0, y - camera.y + canvas.height/2);
    ctx.lineTo(canvas.width, y - camera.y + canvas.height/2);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,77,94,0.5)';
  ctx.lineWidth = 4;
  ctx.strokeRect(-camera.x + canvas.width/2, -camera.y + canvas.height/2, WORLD_SIZE, WORLD_SIZE);
}

function render() {
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width/2 - camera.x, canvas.height/2 - camera.y);
  drawGrid();
  for (const f of foods) {
    if (Math.abs(f.x - camera.x) > canvas.width || Math.abs(f.y - camera.y) > canvas.height) continue;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fillStyle = f.color;
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 8;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Боты
  for (const b of bots) {
    if (!b.alive) continue;
    if (Math.abs(b.x - camera.x) > canvas.width || Math.abs(b.y - camera.y) > canvas.height) continue;
    b.draw(ctx);
  }

  // Другие игроки
  for (const p of players.values()) {
    if (p.id === mySnake?.id) continue;
    if (Math.abs(p.x - camera.x) > canvas.width || Math.abs(p.y - camera.y) > canvas.height) continue;
    p.draw(ctx);
  }
  if (mySnake) mySnake.draw(ctx);
  ctx.restore();
  renderMiniMap();
}

function renderMiniMap() {
  mmCtx.clearRect(0, 0, miniMap.width, miniMap.height);
  mmCtx.fillStyle = 'rgba(0,0,0,0.4)';
  mmCtx.fillRect(0, 0, miniMap.width, miniMap.height);
  const scale = miniMap.width / WORLD_SIZE;
  for (const b of bots) {
    if (!b.alive) continue;
    mmCtx.beginPath();
    mmCtx.arc(b.x * scale, b.y * scale, 2, 0, Math.PI * 2);
    mmCtx.fillStyle = b.team === TEAM_RED ? '#ff4d5e' : '#4d9eff';
    mmCtx.fill();
  }
  for (const p of players.values()) {
    if (!p.alive) continue;
    mmCtx.beginPath();
    mmCtx.arc(p.x * scale, p.y * scale, p.id === mySnake?.id ? 4 : 2.5, 0, Math.PI * 2);
    mmCtx.fillStyle = p.team === TEAM_RED ? '#ff4d5e' : '#4d9eff';
    mmCtx.fill();
    if (p.id === mySnake?.id) {
      mmCtx.strokeStyle = '#fff';
      mmCtx.lineWidth = 1.5;
      mmCtx.stroke();
    }
  }
}

/* ============================================================
   11. СЕТЬ
   ============================================================ */
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

async function findMatch() {
  isBotMode = false;
  gameState = 'searching';
  document.getElementById('match-status').textContent = 'Поиск игроков...';
  document.getElementById('play-btn').disabled = true;
  document.getElementById('bots-btn').disabled = true;

  const slot = Math.floor(Date.now() / MATCH_WINDOW);
  roomId = `match_${slot}`;
  matchStartAt = (slot + 1) * MATCH_WINDOW; // старт в конце окна

  startCountdown();
  await joinRoom(roomId);
}

function startCountdown() {
  document.getElementById('timer-bar').classList.add('show');
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const left = Math.max(0, matchStartAt - Date.now());
    const total = MATCH_WINDOW;
    const pct = 100 - (left / total) * 100;
    document.getElementById('timer-fill').style.width = pct + '%';
    if (left <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      // Если мы хост — стартуем
      if (hostId === myId && gameState === 'searching') {
        channel.send({ type: 'broadcast', event: 'game_start', payload: { host: myId } });
      }
    }
  }, 100);
}

async function joinRoom(rid) {
  if (channel) await channel.unsubscribe();
  players.clear();

  channel = supabase.channel(rid, {
    config: {
      broadcast: { self: false },
      presence: { key: myId }
    }
  });

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const list = [];
    for (const key in state) {
      const p = state[key][0];
      if (p) list.push(p);
    }

    // Сортируем и определяем хоста
    list.sort((a, b) => a.id.localeCompare(b.id));
    hostId = list[0]?.id || null;
    updatePlayersList(list);

    const count = list.length;
    if (count > MAX_PLAYERS) {
      // Мы лишние — выходим
      document.getElementById('match-status').textContent = 'Комната заполнена';
      leaveRoom();
      resetLobbyUI();
      return;
    }

    if (count < 2) {
      document.getElementById('match-status').textContent =
        `Ожидание игроков: ${count}/2 (старт через ${Math.ceil((matchStartAt - Date.now())/1000)}с)`;
    } else {
      document.getElementById('match-status').textContent =
        `Игроков: ${count}/${MAX_PLAYERS}. Старт через ${Math.ceil((matchStartAt - Date.now())/1000)}с`;
    }
  });

  channel.on('broadcast', { event: 'game_start' }, () => {
    if (gameState === 'searching' || gameState === 'lobby') {
      startGame();
    }
  });

  channel.on('broadcast', { event: 'state' }, ({ payload }) => {
    if (payload.id === myId) return;
    let p = players.get(payload.id);
    if (!p) {
      p = new Snake(payload.id, payload.name, payload.team, payload.x, payload.y, false);
      p.segments = [];
      players.set(payload.id, p);
    }
    p.applyNet(payload);
  });

  channel.on('broadcast', { event: 'player_died' }, ({ payload }) => {
    const p = players.get(payload.id);
    if (p) {
      p.alive = false;
      spawnDeathFood(payload.x, payload.y, payload.team);
    }
    if (payload.killer === myId) {
      kills++;
      document.getElementById('stat-kills').textContent = kills;
    }
  });

  channel.on('broadcast', { event: 'player_joined' }, ({ payload }) => {
    if (payload.id === myId) return;
    if (!players.has(payload.id)) {
      const p = new Snake(payload.id, payload.name, payload.team, payload.x || 0, payload.y || 0, false);
      p.segments = [];
      players.set(payload.id, p);
    }
  });

  channel.subscribe(async (status) => {
    console.log('[Realtime] Status:', status);
    if (status === 'SUBSCRIBED') {
      reconnectAttempts = 0;
      await channel.track({ id: myId, name: myName, team: myTeam });
      channel.send({
        type: 'broadcast', event: 'player_joined',
        payload: { id: myId, name: myName, team: myTeam, x: 0, y: 0 }
      });
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.error('[Realtime] Ошибка:', status);
      scheduleReconnect();
    } else if (status === 'CLOSED') {
      if (gameState === 'searching' || gameState === 'playing') {
        scheduleReconnect();
      }
    }
  });
}

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT) {
    document.getElementById('match-status').textContent = 'Не удалось подключиться. Обнови страницу.';
    return;
  }
  reconnectAttempts++;
  const delay = 2000 * reconnectAttempts;
  document.getElementById('match-status').textContent = `Переподключение (${reconnectAttempts}/${MAX_RECONNECT})...`;
  setTimeout(() => {
    if (roomId) joinRoom(roomId);
  }, delay);
}

function leaveRoom() {
  if (channel) { channel.unsubscribe(); channel = null; }
  players.clear();
  mySnake = null;
  roomId = null;
  hostId = null;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  document.getElementById('timer-bar').classList.remove('show');
}

/* ============================================================
   12. ИГРА
   ============================================================ */
function startGame() {
  gameState = 'playing';
  document.getElementById('lobby').classList.add('hidden');
  document.getElementById('death-screen').classList.remove('show');

  // Балансировка команд
  let red = 0, blue = 0;
  for (const p of players.values()) {
    if (p.team === TEAM_RED) red++;
    else blue++;
  }
  myTeam = red <= blue ? TEAM_RED : TEAM_BLUE;

  spawnMySnake();
  spawnFood();
  kills = 0;
  updateHUD();

  channel.send({
    type: 'broadcast', event: 'player_joined',
    payload: { id: myId, name: myName, team: myTeam, x: mySnake.x, y: mySnake.y }
  });
}

function startBotGame() {
  isBotMode = true;
  gameState = 'playing';
  document.getElementById('lobby').classList.add('hidden');
  document.getElementById('death-screen').classList.remove('show');

  myTeam = TEAM_RED;
  spawnMySnake();

  // 5 ботов — все синие
  bots = [];
  for (let i = 0; i < BOT_COUNT; i++) {
    const botId = 'bot_' + i + '_' + Math.random().toString(36).slice(2, 6);
    const x = rand(WORLD_SIZE - 800, WORLD_SIZE - 200);
    const y = rand(200, WORLD_SIZE - 200);
    bots.push(new Bot(botId, x, y, TEAM_BLUE));
  }

  spawnFood();
  kills = 0;
  updateHUD();
}

function spawnMySnake() {
  const spawnX = myTeam === TEAM_RED ? rand(200, 800) : rand(WORLD_SIZE - 800, WORLD_SIZE - 200);
  const spawnY = rand(200, WORLD_SIZE - 200);
  mySnake = new Snake(myId, myName, myTeam, spawnX, spawnY, true);
  players.set(myId, mySnake);
  camera.x = mySnake.x;
  camera.y = mySnake.y;
}

function respawn() {
  document.getElementById('death-screen').classList.remove('show');
  gameState = 'playing';
  kills = 0;
  spawnMySnake();
  updateHUD();
  if (!isBotMode && channel) {
    channel.send({
      type: 'broadcast', event: 'player_joined',
      payload: { id: myId, name: myName, team: myTeam, x: mySnake.x, y: mySnake.y }
    });
  }
}

function updateHUD() {
  if (!mySnake) return;
  document.getElementById('stat-length').textContent = Math.floor(mySnake.length);
  document.getElementById('stat-kills').textContent = kills;
  let redCount = 0, blueCount = 0, allies = 0;
  for (const p of players.values()) {
    if (!p.alive) continue;
    if (p.team === TEAM_RED) redCount++;
    else blueCount++;
    if (p.team === myTeam && p.id !== myId) allies++;
  }
  for (const b of bots) {
    if (!b.alive) continue;
    if (b.team === TEAM_RED) redCount++;
    else blueCount++;
    if (b.team === myTeam) allies++;
  }
  document.getElementById('red-score').textContent = redCount;
  document.getElementById('blue-score').textContent = blueCount;
  document.getElementById('stat-allies').textContent = allies;
}

function gameLoop(now) {
  requestAnimationFrame(gameLoop);
  if (gameState === 'playing') {
    // Боты
    if (isBotMode) {
      for (const b of bots) b.update();
      checkBotCollisions();
    }

    if (mySnake && mySnake.alive) {
      if (input.hasInput) mySnake.targetAngle = input.targetAngle;
      mySnake.boosting = input.boosting;
      mySnake.update();
      camera.x += (mySnake.x - camera.x) * 0.12;
      camera.y += (mySnake.y - camera.y) * 0.12;
      checkCollisions();
      updateHUD();
    }

    if (!isBotMode && now - lastBroadcast > TICK_RATE) {
      lastBroadcast = now;
      if (mySnake && mySnake.alive && channel) {
        channel.send({ type: 'broadcast', event: 'state', payload: mySnake.toNet() });
      }
    }
    render();
  } else if (gameState === 'dead') {
    render();
  }
}

/* ============================================================
   13. UI
   ============================================================ */
function updatePlayersList(list) {
  const el = document.getElementById('players-list');
  el.innerHTML = '';
  list.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'player-chip ' + (p.team === TEAM_RED ? 'red' : 'blue');
    chip.textContent = p.name + (p.id === myId ? ' (вы)' : '');
    el.appendChild(chip);
  });
}

function resetLobbyUI() {
  document.getElementById('play-btn').disabled = false;
  document.getElementById('bots-btn').disabled = false;
  document.getElementById('match-status').textContent = 'Нажми «Найти матч», чтобы начать';
  document.getElementById('players-list').innerHTML = '';
  document.getElementById('timer-bar').classList.remove('show');
}

document.getElementById('play-btn').addEventListener('click', findMatch);
document.getElementById('bots-btn').addEventListener('click', startBotGame);
document.getElementById('respawn-btn').addEventListener('click', respawn);
document.getElementById('leave-btn').addEventListener('click', () => {
  document.getElementById('death-screen').classList.remove('show');
  document.getElementById('lobby').classList.remove('hidden');
  gameState = 'lobby';
  bots = [];
  leaveRoom();
  resetLobbyUI();
});
window.addEventListener('beforeunload', leaveRoom);

/* ============================================================
   14. СТАРТ
   ============================================================ */
setupInput();
requestAnimationFrame(gameLoop);
console.log('[Snakes Battle] Инициализировано. ID:', myId);
</script>
</body>
</html>