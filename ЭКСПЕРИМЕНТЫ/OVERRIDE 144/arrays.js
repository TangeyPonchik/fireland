'use strict';
/* ============================================================
   arrays.js — ДАННЫЕ OVERRIDE 144
   window.CS.Data — единая точка доступа
   ============================================================ */
(function () {
  /* ---------- ОРУЖИЕ ---------- */
  const WEAPONS = {
    knife:   { name:'COMBAT KNIFE', cat:'melee',  slot:3, dmg:22, headMult:1.8, rate:0.9,  mag:0,   reserve:0,   auto:false, price:0,    kick:0.5, spread:0,     recoil:0,     range:1.6,  reticle:'none',     unlockLevel:1, buyable:false, recoilPattern:[0,0] },
    glock:   { name:'GLOCK-18',     cat:'pistol', slot:2, dmg:26, headMult:3.5, rate:0.16, mag:20,  reserve:120, auto:false, price:200,  kick:0.6, spread:0.006, recoil:0.010, range:80,   reticle:'dot',      unlockLevel:1, buyable:true,  recoilPattern:[0.6,0.3] },
    usp:     { name:'USP-S',        cat:'pistol', slot:2, dmg:35, headMult:4,   rate:0.22, mag:12,  reserve:24,  auto:false, price:200,  kick:0.7, spread:0.004, recoil:0.012, range:100,  reticle:'classic',  unlockLevel:1, buyable:true,  recoilPattern:[0.7,0.2] },
    p250:    { name:'P250',         cat:'pistol', slot:2, dmg:38, headMult:4,   rate:0.20, mag:13,  reserve:26,  auto:false, price:300,  kick:0.8, spread:0.008, recoil:0.015, range:90,   reticle:'classic',  unlockLevel:1, buyable:true,  recoilPattern:[0.8,0.3] },
    fiveseven:{name:'FIVE-SEVEN',   cat:'pistol', slot:2, dmg:32, headMult:4,   rate:0.15, mag:20,  reserve:100, auto:false, price:500,  kick:0.6, spread:0.006, recoil:0.012, range:90,   reticle:'dot',      unlockLevel:2, buyable:true,  recoilPattern:[0.6,0.2] },
    tec9:    { name:'TEC-9',        cat:'pistol', slot:2, dmg:33, headMult:4,   rate:0.12, mag:18,  reserve:90,  auto:false, price:500,  kick:0.9, spread:0.015, recoil:0.02,  range:80,   reticle:'dot',      unlockLevel:2, buyable:true,  recoilPattern:[0.9,0.5] },
    dual:    { name:'DUAL BERETTAS',cat:'pistol', slot:2, dmg:24, headMult:3.5, rate:0.08, mag:30,  reserve:120, auto:true,  price:400,  kick:0.5, spread:0.02,  recoil:0.012, range:70,   reticle:'dot',      unlockLevel:3, buyable:true,  recoilPattern:[0.5,0.6] },
    deagle:  { name:'DESERT EAGLE', cat:'pistol', slot:2, dmg:65, headMult:4,   rate:0.35, mag:7,   reserve:35,  auto:false, price:700,  kick:1.8, spread:0.010, recoil:0.04,  range:130,  reticle:'dot-arcs', unlockLevel:4, buyable:true,  recoilPattern:[1.8,0.4] },
    mp5:     { name:'MP5-SD',       cat:'smg',    slot:1, dmg:22, headMult:3,   rate:0.075,mag:30,  reserve:120, auto:true,  price:1250, kick:0.7, spread:0.012, recoil:0.013, range:120,  reticle:'classic',  unlockLevel:1, buyable:true,  recoilPattern:[0.7,0.4] },
    p90:     { name:'P90',          cat:'smg',    slot:1, dmg:26, headMult:2.5, rate:0.07, mag:50,  reserve:100, auto:true,  price:2350, kick:0.8, spread:0.014, recoil:0.015, range:130,  reticle:'classic',  unlockLevel:5, buyable:true,  recoilPattern:[0.8,0.5] },
    ump:     { name:'UMP-45',       cat:'smg',    slot:1, dmg:30, headMult:3,   rate:0.10, mag:25,  reserve:100, auto:true,  price:1200, kick:0.9, spread:0.015, recoil:0.018, range:110,  reticle:'classic',  unlockLevel:1, buyable:true,  recoilPattern:[0.9,0.4] },
    mac10:   { name:'MAC-10',       cat:'smg',    slot:1, dmg:28, headMult:3,   rate:0.06, mag:30,  reserve:100, auto:true,  price:1050, kick:0.75,spread:0.02,  recoil:0.015, range:100,  reticle:'classic',  unlockLevel:2, buyable:true,  recoilPattern:[0.75,0.7] },
    bizon:   { name:'PP-BIZON',     cat:'smg',    slot:1, dmg:20, headMult:2.5, rate:0.08, mag:64,  reserve:120, auto:true,  price:1400, kick:0.6, spread:0.018, recoil:0.012, range:100,  reticle:'classic',  unlockLevel:3, buyable:true,  recoilPattern:[0.6,0.3] },
    ak47:    { name:'AK-47',        cat:'rifle',  slot:1, dmg:36, headMult:4,   rate:0.095,mag:30,  reserve:90,  auto:true,  price:2700, kick:1.0, spread:0.018, recoil:0.024, range:180,  reticle:'classic',  unlockLevel:1, buyable:true,  recoilPattern:[1.2,0.5] },
    m4a4:    { name:'M4A4',         cat:'rifle',  slot:1, dmg:33, headMult:4,   rate:0.09, mag:30,  reserve:90,  auto:true,  price:3100, kick:0.9, spread:0.015, recoil:0.02,  range:180,  reticle:'classic',  unlockLevel:1, buyable:true,  recoilPattern:[0.9,0.8] },
    famas:   { name:'FAMAS',        cat:'rifle',  slot:1, dmg:30, headMult:3.5, rate:0.09, mag:25,  reserve:90,  auto:true,  price:2050, kick:0.85,spread:0.016, recoil:0.02,  range:160,  reticle:'classic',  unlockLevel:4, buyable:true,  recoilPattern:[0.85,0.5] },
    aug:     { name:'AUG',          cat:'rifle',  slot:1, dmg:32, headMult:4,   rate:0.10, mag:30,  reserve:90,  auto:true,  price:3300, kick:0.85,spread:0.012, recoil:0.018, range:190,  reticle:'classic',  unlockLevel:6, buyable:true,  recoilPattern:[0.85,0.4] },
    sg553:   { name:'SG 553',       cat:'rifle',  slot:1, dmg:34, headMult:4,   rate:0.10, mag:30,  reserve:90,  auto:true,  price:3000, kick:0.9, spread:0.014, recoil:0.02,  range:190,  reticle:'classic',  unlockLevel:6, buyable:true,  recoilPattern:[0.9,0.6] },
    awp:     { name:'AWP',          cat:'sniper', slot:1, dmg:115,headMult:1.5, rate:1.45, mag:10,  reserve:30,  auto:false, price:4750, kick:3.5, spread:0.08,  recoil:0.10,  range:300,  reticle:'scope',    unlockLevel:5, buyable:true,  recoilPattern:[3.5,0] },
    ssg08:   { name:'SSG 08',       cat:'sniper', slot:1, dmg:88, headMult:2.5, rate:1.0,  mag:10,  reserve:40,  auto:false, price:1700, kick:2.0, spread:0.05,  recoil:0.06,  range:260,  reticle:'scope',    unlockLevel:3, buyable:true,  recoilPattern:[2.0,0] },
    nova:    { name:'NOVA',         cat:'shotgun',slot:1, dmg:11, headMult:2,   rate:0.85, mag:8,   reserve:32,  auto:false, price:1050, kick:1.8, spread:0.06,  recoil:0.065, range:50,   reticle:'wide',     unlockLevel:1, buyable:true,  recoilPattern:[1.8,0.2], pellets:8 },
    xm1014:  { name:'XM1014',       cat:'shotgun',slot:1, dmg:10, headMult:2,   rate:0.3,  mag:7,   reserve:32,  auto:false, price:2000, kick:1.5, spread:0.05,  recoil:0.05,  range:50,   reticle:'wide',     unlockLevel:4, buyable:true,  recoilPattern:[1.5,0.3], pellets:6 },
    m249:    { name:'M249',         cat:'lmg',    slot:1, dmg:32, headMult:3,   rate:0.08, mag:100, reserve:200, auto:true,  price:5200, kick:1.2, spread:0.025, recoil:0.03,  range:170,  reticle:'classic',  unlockLevel:7, buyable:true,  recoilPattern:[1.2,0.6] },
    negev:   { name:'NEGEV',        cat:'lmg',    slot:1, dmg:35, headMult:3,   rate:0.06, mag:150, reserve:200, auto:true,  price:5700, kick:1.4, spread:0.03,  recoil:0.035, range:160,  reticle:'classic',  unlockLevel:8, buyable:true,  recoilPattern:[1.4,0.8] },
    grenade: { name:'HE GRENADE',   cat:'nade',   slot:4, dmg:98, headMult:1,   rate:1.0,  mag:1,   reserve:0,   auto:false, price:300,  kick:0.5, spread:0,     recoil:0,     range:0,    reticle:'none',     unlockLevel:1, buyable:true,  recoilPattern:[0,0] },
    flash:   { name:'FLASHBANG',    cat:'nade',   slot:4, dmg:0,  headMult:1,   rate:1.0,  mag:1,   reserve:0,   auto:false, price:200,  kick:0.5, spread:0,     recoil:0,     range:0,    reticle:'none',     unlockLevel:1, buyable:true,  recoilPattern:[0,0] },
    smoke:   { name:'SMOKE',        cat:'nade',   slot:4, dmg:0,  headMult:1,   rate:1.0,  mag:1,   reserve:0,   auto:false, price:300,  kick:0.5, spread:0,     recoil:0,     range:0,    reticle:'none',     unlockLevel:1, buyable:true,  recoilPattern:[0,0] },
    molotov: { name:'MOLOTOV',      cat:'nade',   slot:4, dmg:0,  headMult:1,   rate:1.0,  mag:1,   reserve:0,   auto:false, price:400,  kick:0.5, spread:0,     recoil:0,     range:0,    reticle:'none',     unlockLevel:2, buyable:true,  recoilPattern:[0,0] },
    decoy:   { name:'DECOY',        cat:'nade',   slot:4, dmg:0,  headMult:1,   rate:1.0,  mag:1,   reserve:0,   auto:false, price:50,   kick:0.5, spread:0,     recoil:0,     range:0,    reticle:'none',     unlockLevel:1, buyable:true,  recoilPattern:[0,0] }
  };

  const WEAPON_ORDER = [
    'glock','usp','p250','fiveseven','tec9','dual','deagle',
    'mp5','p90','ump','mac10','bizon',
    'famas','ak47','m4a4','aug','sg553',
    'ssg08','awp','nova','xm1014','m249','negev',
    'grenade','flash','smoke','molotov','decoy'
  ];

  const NADE_ORDER = ['grenade','flash','smoke','molotov','decoy'];

  /* ---------- КАРТЫ ---------- */
  const MAPS = {
    FOUNDRY: { name:'FOUNDRY', fog:0x1a0a05, bg:0x0a0505, sunColor:0xff8844, sunIntensity:1.8, size:100,
               spawnsT:[[-35,0,-35],[-35,0,-25],[-25,0,-35]], spawnsCT:[[35,0,35],[35,0,25],[25,0,35]], bombSite:[35,0,-35], build:null },
    CITADEL: { name:'CITADEL', fog:0x506070, bg:0x203040, sunColor:0xfff0cc, sunIntensity:2.2, size:110,
               spawnsT:[[-40,0,40],[-40,0,30],[-30,0,40]], spawnsCT:[[40,0,-40],[40,0,-30],[30,0,-40]], bombSite:[40,0,40], build:null },
    RIFT:    { name:'RIFT',    fog:0x0a0015, bg:0x050008, sunColor:0x8866ff, sunIntensity:1.6, size:95,
               spawnsT:[[-35,0,0],[-35,0,10],[-35,0,-10]], spawnsCT:[[35,0,0],[35,0,10],[35,0,-10]], bombSite:[0,0,-35], build:null },
    COLONY:  { name:'COLONY',  fog:0x804020, bg:0x401810, sunColor:0xffccaa, sunIntensity:2.0, size:105,
               spawnsT:[[-40,0,0],[-40,0,10],[-40,0,-10]], spawnsCT:[[40,0,0],[40,0,10],[40,0,-10]], bombSite:[0,0,40], build:null }
  };

  /* ---------- ТИПЫ ВРАГОВ ---------- */
  const ENEMY_TYPES = {
    grunt:     { name:'GRUNT',      hp:80,  armor:0,   speed:2.8, fireRate:2.0, dmg:7,  accuracy:0.35, color:0x8a2a2a, scale:0.95, score:100, money:120, boss:false },
    rifleman:  { name:'RIFLEMAN',   hp:100, armor:50,  speed:3.2, fireRate:1.4, dmg:10, accuracy:0.45, color:0x6a2a3a, scale:1.0,  score:150, money:200, boss:false },
    shotgunner:{ name:'SHOTGUNNER', hp:90,  armor:25,  speed:3.6, fireRate:1.0, dmg:22, accuracy:0.30, color:0x9a3a1a, scale:1.0,  score:140, money:180, boss:false },
    sniper:    { name:'SNIPER',     hp:70,  armor:20,  speed:2.2, fireRate:3.5, dmg:40, accuracy:0.65, color:0x4a2a5a, scale:1.0,  score:200, money:250, boss:false },
    boss:      { name:'BOSS',       hp:600, armor:150, speed:2.4, fireRate:0.8, dmg:25, accuracy:0.55, color:0x5a1a5a, scale:1.5,  score:1000,money:1500,boss:true  }
  };

  /* ---------- РЕЖИМЫ ---------- */
  const GAME_MODES = {
    defusal:  { name:'DEFUSAL',    desc:'Классика: убить всех или посадить бомбу', botsPerRound:3, modeBadge:'DEFUSAL',  respawn:false, waves:false },
    wingman:  { name:'WINGMAN',    desc:'2v2, одна точка, короткие раунды',        botsPerRound:1, modeBadge:'WINGMAN',  respawn:false, waves:false },
    armsrace: { name:'ARMS RACE',  desc:'Каждый фраг — новое оружие',              botsPerRound:3, modeBadge:'ARMS RACE', respawn:true,  waves:false },
    survival: { name:'SURVIVAL',   desc:'Волны врагов, апгрейды',                  botsPerRound:3, modeBadge:'SURVIVAL',  respawn:false, waves:true  },
    dm:       { name:'DEATHMATCH', desc:'Бесконечный бой, респавн',                botsPerRound:4, modeBadge:'DEATHMATCH',respawn:true,  waves:false }
  };

  /* ---------- ЛУТ ---------- */
  const PICKUPS = {
    health: { name:'MEDKIT',   color:0x00ff88, amount:25, respawn:20, mesh:'sphere' },
    armor:  { name:'ARMOR',    color:0x4488ff, amount:50, respawn:20, mesh:'sphere' },
    ammo:   { name:'AMMO BOX', color:0xffcc00, amount:1,  respawn:15, mesh:'box'    }
  };

  /* ---------- ПРОГРЕССИЯ ---------- */
  const PROGRESSION = {
    xpPerKill: 25, xpPerHeadshot: 40, xpPerRoundWin: 200, xpPerRoundLoss: 75,
    levels: [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6200,7600,9200,11000,13000,15200,17600,20200,23000],
    ranks: [
      { minLevel:1,  name:'SILVER I' }, { minLevel:3,  name:'SILVER II' }, { minLevel:5, name:'SILVER III' },
      { minLevel:7,  name:'GOLD NOVA I' }, { minLevel:9, name:'GOLD NOVA II' }, { minLevel:11, name:'GOLD NOVA III' },
      { minLevel:13, name:'MG I' }, { minLevel:15, name:'MG II' }, { minLevel:17, name:'DMG' },
      { minLevel:19, name:'LE' }, { minLevel:21, name:'LEM' }, { minLevel:23, name:'SUPREME' }, { minLevel:25, name:'GLOBAL' }
    ]
  };

  /* ---------- СКИНЫ ---------- */
  const SKIN_RARITIES = [
    { id:'common',    name:'COMMON',    weight:80, color:'#888888' },
    { id:'uncommon',  name:'UNCOMMON',  weight:15, color:'#66aaff' },
    { id:'rare',      name:'RARE',      weight:4,  color:'#aa66ff' },
    { id:'mythic',    name:'MYTHIC',    weight:0.9,color:'#ff2266' },
    { id:'legendary', name:'LEGENDARY', weight:0.1,color:'#ffcc00' }
  ];
  const SKIN_PATTERNS = ['SOLID','STRIPES','CAMO','NEON','GALAXY','FRACTURE','TIGER','HEX'];

  /* ---------- КЕЙСЫ ---------- */
  const CASES = {
    standard: { name:'STANDARD CASE', price:1000, rarities:['common','common','common','uncommon','uncommon','rare'] },
    premium:  { name:'PREMIUM CASE',  price:3000, rarities:['uncommon','uncommon','rare','rare','mythic','legendary'] }
  };

  /* ---------- ЗАДАНИЯ ---------- */
  const QUEST_TEMPLATES = [
    { id:'kill_10',   text:'Убей 10 врагов',            type:'kills',    need:10, reward:{ xp:100, money:300 } },
    { id:'hs_5',      text:'Сделай 5 хедшотов',          type:'headshots',need:5,  reward:{ xp:150, money:400 } },
    { id:'win_2',     text:'Выиграй 2 раунда',           type:'wins',     need:2,  reward:{ xp:200, money:500 } },
    { id:'kill_rifle',text:'Убей 5 врагов из винтовки',  type:'rifle',    need:5,  reward:{ xp:120, money:350 } }
  ];

  /* ---------- АУДИО ---------- */
  const WEAPON_SOUND_MAP = {
    awp:'sniper', ssg08:'sniper', nova:'shotgun', xm1014:'shotgun',
    m249:'lmg', negev:'lmg', knife:'knife'
  };

  /* ---------- ЭКСПОРТ ---------- */
  window.CS = window.CS || {};
  window.CS.Data = {
    WEAPONS, WEAPON_ORDER, NADE_ORDER, MAPS, ENEMY_TYPES, GAME_MODES,
    PICKUPS, PROGRESSION, SKIN_RARITIES, SKIN_PATTERNS, CASES,
    QUEST_TEMPLATES, WEAPON_SOUND_MAP
  };
})();