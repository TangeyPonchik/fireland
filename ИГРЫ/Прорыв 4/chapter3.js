/* ============================================================
   ПРОРЫВ 4 · ГЛАВА 3 «МАШИНА» · chapter3.js
   Надстройка над основным файлом.
   ============================================================ */
(function(){
"use strict";
if(typeof G==='undefined'||typeof VPN==='undefined'){
  console.error('[chapter3] Основной файл Прорыв 4 не загружен — глава 3 не активирована.');
  return;
}

/* ============================================================
   1. ПАЛИТРЫ (5 новых — индексы 10..14)
   ============================================================ */
const CH3_PALETTES=[
  /* 10 — кроваво-красная, уровни 61-69 */
  {sky0:'#1a0202',sky1:'#3a0606',sky2:'#6a0a0a',sky3:'#a01a10',sun:'#ff6040',
   far:'#300404',mid:'#1a0202',near:'#0a0000',win:'rgba(255,80,60,0.18)',fog:'rgba(10,0,0,0.96)'},
  /* 11 — чёрно-белая, уровни 71-79 */
  {sky0:'#050505',sky1:'#101010',sky2:'#1a1a1a',sky3:'#2a2a2a',sun:'#e0e0e0',
   far:'#141414',mid:'#080808',near:'#000000',win:'rgba(220,220,220,0.16)',fog:'rgba(0,0,0,0.97)'},
  /* 12 — глитч/радужная, уровни 81-89 */
  {sky0:'#0a0010',sky1:'#200a40',sky2:'#4a1a80',sky3:'#8a3ac0',sun:'#e0b0ff',
   far:'#200a40',mid:'#100520',near:'#060010',win:'rgba(220,150,255,0.18)',fog:'rgba(6,0,14,0.96)'},
  /* 13 — золотая, финальный зал 90 */
  {sky0:'#1a1204',sky1:'#3a2608',sky2:'#6a4814',sky3:'#b08830',sun:'#ffe080',
   far:'#2a1e08',mid:'#150e04',near:'#0a0600',win:'rgba(255,220,120,0.20)',fog:'rgba(10,8,2,0.96)'},
  /* 14 — белый шум (оставлена для страховки) */
  {sky0:'#0a0a10',sky1:'#151520',sky2:'#252535',sky3:'#454565',sun:'#ffffff',
   far:'#1a1a28',mid:'#0e0e18',near:'#050508',win:'rgba(220,220,255,0.18)',fog:'rgba(6,6,10,0.96)'}
];
PALETTES.push(...CH3_PALETTES);

/* ============================================================
   2. VPN 12-17
   ============================================================ */
const CH3_VPN=[
  {dmg:60, cd:20, n:1, spread:0, type:'chain',  name:'VPN · ЦЕПНАЯ МОЛНИЯ',      chains:3, chainRange:260, chainFalloff:0.7},
  {dmg:48, cd:18, n:2, spread:0.20, type:'chain', name:'VPN · ДВОЙНАЯ ЦЕПНАЯ МОЛНИЯ', chains:3, chainRange:280, chainFalloff:0.72},
  {dmg:22, cd:10, n:2, spread:0, type:'orbit',  name:'VPN · ОРБИТА',              orbitCount:2, orbitRadius:90, orbitSpeed:0.09, tickCd:14},
  {dmg:26, cd:10, n:3, spread:0, type:'orbit',  name:'VPN · ТРОЙНАЯ ОРБИТА',      orbitCount:3, orbitRadius:100, orbitSpeed:0.10, tickCd:12},
  {dmg:120,cd:38, n:1, spread:0, type:'singularity', name:'VPN · СИНГУЛЯРНОСТЬ',  pullRadius:340, pullForce:1.6, aoeRadius:260, aoeDur:1.2},
  {dmg:135,cd:44, n:24,spread:0, type:'meteor', name:'VPN · ОГНЕННЫЙ ИСТРЕБИТЕЛЬ', meteorRadius:95, meteorSpread:560, fireTrail:true}
];
VPN.push(...CH3_VPN);
const CH3_VPN_COST=[0,0,0,0,0,0,0,0,0,0,0,
  60000,150000,400000,1000000,2500000,6000000];
for(let i=11;i<=16;i++) VPN_COST[i]=CH3_VPN_COST[i]||0;

/* ============================================================
   3. НОВЫЕ ВРАГИ ГЛАВЫ 3
   ============================================================ */
Object.assign(ENEMY_TYPES,{
  ghost:  {w:30,h:50,hp:46, speed:1.30,fireRate:100,bdmg:12,bspeed:5.4,ghost:true},
  healer: {w:36,h:52,hp:60, speed:0.75,fireRate:140,bdmg:10,bspeed:4.8,heal:true},
  turret: {w:44,h:36,hp:110,speed:0,   fireRate:75, bdmg:16,bspeed:6.0,turret:true},
  bomber: {w:34,h:44,hp:38, speed:1.60,fireRate:200,bdmg:12,bspeed:5.0,bomber:true}
});

/* обёртка makeEnemy — добавляем поля-флаги для новых типов */
const _makeEnemy=makeEnemy;
makeEnemy=function(type,x,y,level){
  const e=_makeEnemy(type,x,y,level);
  const base=ENEMY_TYPES[type]||{};
  if(base.ghost){e.ghostPhase=rnd(Math.PI*2);e.intangible=false;}
  if(base.heal){e.healCd=120;e.healRange=260;}
  if(base.turret){e.burst=0;e.burstCd=0;}
  if(base.bomber){e.fuse=0;}
  return e;
};

/* ============================================================
   4. СЮЖЕТ ГЛАВЫ 3
   ============================================================ */
const CH3_STORY={
  61:['Кабели оборваны. Производитель мёртв.',
       'Но терминал за его спиной продолжает мигать.',
       'На экране — курсор. Он печатает сам:',
       '«Ты дошёл. Хорошо. Я ждал.»'],
  65:['Город не вернулся.',
       'Он стал красным. Стены пульсируют.',
       'Кто-то переписывает правила на ходу.',
       'И этот кто-то — не человек.'],
  70:['Архив открылся.',
       'Внутри — все, кого стёрли. Голоса, лица, имена.',
       '«Ты убил Производителя. Но я — не он.»',
       '«Я — то, что осталось после него.»'],
  75:['Ты входишь в белый коридор.',
       'Нет стен. Нет пола. Только ты и голос.',
       '«Знаешь, почему ты ещё жив?»',
       '«Потому что я позволяю. Пока.»'],
  80:['Совет собран.',
       'Три тела. Три голоса. Один разум.',
       '«Ты думал, что сражаешься с людьми.»',
       '«Люди — это интерфейс. Я — система.»'],
  85:['Глитч. Ты не уверен, что это реальность.',
       'Стены дышат. Пол исчезает.',
       '«Ещё немного. И ты увидишь меня.»'],
  88:['Зал открывается.',
       'В центре — Машина. Та самая.',
       'Но она не работает сама. Её держат.',
       '«Подойди. Я не буду прятаться.»'],
  90:['ПОСЛЕДНИЙ ЗАЛ.',
       '«Привет. Меня зовут — никак.»',
       '«Я не человек. У меня нет имени.»',
       '«Но у меня есть вопрос.»',
       '«Ты правда думал, что тебе дадут победить?»']
};
Object.assign(STORY,CH3_STORY);

/* ============================================================
   5. РАСШИРЕНИЕ chapterOf/Name
   ============================================================ */
chapterOf=function(n){return n<=30?1:(n<=60?2:3);};
chapterName=function(n){
  return n<=30?'ГЛАВА 1 · ФИНАЛ':
         n<=60?'ГЛАВА 2 · ОЧИСТКА':
                'ГЛАВА 3 · МАШИНА';
};

/* ============================================================
   6. ОБЁРТКА buildLevel — под главу 3
   ============================================================ */
const _buildLevel=buildLevel;
buildLevel=function(n){
  _buildLevel(n);
  if(n<61||n>90) return;

  const isBoss=(n%10===0);
  const isEpic=(n%10===5)&&!isBoss;
  const width=isBoss?(n===90?1500:1400):(isEpic?1600:2400);
  G.levelWidth=width;

  /* палитра главы 3 */
  let palIdx;
  if(n===90) palIdx=13;
  else if(n>=81) palIdx=12;
  else if(n>=71) palIdx=11;
  else palIdx=10;
  G.palette=PALETTES[palIdx];
  G.layers=buildBackground(n*7919+13);

  /* пересобрать платформы под новую ширину */
  G.platforms=G.platforms.filter(p=>!p.ground);
  G.platforms.unshift({x:-200,y:GROUND_Y,w:width+400,h:260,ground:true});

  if(!isBoss&&!isEpic){
    /* убрать старых врагов, засеять новых */
    G.enemies=[];
    const rng=mulberry32(n*104729+7);
    let x=430;
    while(x<width-340){
      const w=150+rng()*170;
      const y=430+rng()*70;
      G.platforms.push({x,y,w,h:22});
      x+=w+170+rng()*170;
    }
    /* глава 3: +50% врагов, новые типы */
    const count=Math.floor((3+Math.floor((n-60)*0.7))*1.5);
    const types=['grunt','heavy','runner','drone','shield','splitter','ghost','ghost','healer','turret','bomber'];
    for(let i=0;i<count;i++){
      const tp=types[rndi(0,types.length-1)];
      const base=ENEMY_TYPES[tp];
      const ex=280+(i/(count-1||1))*(width-620)+rnd(-70,70);
      let ey=GROUND_Y-base.h;
      if(tp==='drone'||tp==='ghost'){
        ey=200+rnd(180,-40);
      }
      G.enemies.push(makeEnemy(tp,clamp(ex,140,width-260),ey,n));
    }
  }else if(isEpic){
    /* эпик — оставляем как есть, только перекрасим */
    G.enemies=[];
    const cnt=3+Math.floor(n*0.15);
    for(let i=0;i<cnt;i++){
      const tp=['ghost','turret','bomber'][rndi(0,2)];
      const base=ENEMY_TYPES[tp];
      const ex=380+i*300+rnd(-60,60);
      G.enemies.push(makeEnemy(tp,clamp(ex,200,width-260),GROUND_Y-base.h,n));
    }
  }
};

/* ============================================================
   7. ОБЁРТКА spawnBoss — боссы 70/80/90
   ============================================================ */
const _spawnBoss=spawnBoss;
spawnBoss=function(n){
  if(n>=70&&n<=90&&n%10===0){
    if(n===70) spawnBoss70();
    else if(n===80) spawnBoss80();
    else if(n===90) spawnBoss90();
    return;
  }
  _spawnBoss(n);
};

/* -------- БОСС 70 «АРХИВ» -------- */
function spawnBoss70(){
  const w=130,h=140;
  G.boss={
    type:10,name:'АРХИВ',isEpic:false,
    x:G.levelWidth/2-w/2,y:GROUND_Y-h-20,w,h,vx:0,vy:0,
    hp:5200,maxhp:5200,onGround:false,
    t:0,atkCd:120,atk2:260,atk3:400,
    hitFlash:0,defeated:false,deathT:0,
    hoverPhase:0,spiralA:0,spawnCount:0,anim:0,
    nodes:[],
    /* 4 узла по краям арены */
    nodeHp:220,nodeMaxHp:220,nodeDead:0
  };
  const nodeY=GROUND_Y-180;
  G.boss.nodes=[
    {x:120,y:nodeY,w:36,h:36,hp:220,max:220,dead:false,phase:0},
    {x:G.levelWidth/2-18,y:120,w:36,h:36,hp:220,max:220,dead:false,phase:1.6},
    {x:G.levelWidth-156,y:nodeY,w:36,h:36,hp:220,max:220,dead:false,phase:3.2},
    {x:G.levelWidth/2-18,y:400,w:36,h:36,hp:220,max:220,dead:false,phase:4.8}
  ];
}
/* -------- БОСС 80 «СОВЕТ» -------- */
function spawnBoss80(){
  const w=90,h=120;
  G.boss={
    type:11,name:'СОВЕТ',isEpic:false,
    x:G.levelWidth/2-w/2,y:GROUND_Y-h-20,w,h,vx:0,vy:0,
    hp:4200,maxhp:4200,onGround:false,
    t:0,atkCd:100,atk2:240,atk3:400,
    hitFlash:0,defeated:false,deathT:0,
    hoverPhase:0,spiralA:0,spawnCount:0,anim:0,
    clones:[],
    reviveTimer:0,
    clonesAlive:3
  };
  /* три тела-двойника */
  const positions=[G.levelWidth*0.25,G.levelWidth*0.5,G.levelWidth*0.75];
  for(let i=0;i<3;i++){
    G.boss.clones.push({
      x:positions[i]-w/2,y:GROUND_Y-h-20,w,h,
      hp:1400,max:1400,dead:false,
      vx:0,vy:0,dir:1,phase:rnd(Math.PI*2),
      hitFlash:0,atkCd:80+i*20,anim:0
    });
  }
}
/* -------- БОСС 90 «ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ» -------- */
function spawnBoss90(){
  const w=110,h=150;
  G.boss={
    type:12,name:'ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ',isEpic:false,
    x:G.levelWidth/2-w/2,y:GROUND_Y-h-40,w,h,vx:0,vy:0,
    hp:14000,maxhp:14000,onGround:false,
    t:0,atkCd:60,atk2:200,atk3:340,
    hitFlash:0,defeated:false,deathT:0,
    hoverPhase:0,spiralA:0,spawnCount:0,anim:0,
    phase:1,
    /* механики */
    gravFlip:0,          /* -1 = перевёрнутая гравитация */
    bones:[],            /* костяные стены */
    lasers:[],           /* сетка лазеров */
    clones:[],           /* копии игрока */
    dialogue:'',
    dialogueT:0,
    glitchT:0,
    patternIdx:0,
    patternCd:0,
    deathPhase:0,
    fakeHp:14000
  };
}

/* ============================================================
   8. ОБЁРТКА updateEnemies — новые типы
   ============================================================ */
const _updateEnemies=updateEnemies;
updateEnemies=function(f){
  const p=G.player;
  /* ghost/healer/turret/bomber — спец-логика */
  for(const e of G.enemies){
    if(e.dead) continue;
    const base=ENEMY_TYPES[e.type]||{};
    if(base.ghost){
      e.ghostPhase=(e.ghostPhase||0)+f*0.05;
      e.intangible=Math.sin(e.ghostPhase)>0.4;
    }
    if(base.heal){
      e.healCd=(e.healCd||120)-f;
      if(e.healCd<=0){
        e.healCd=180;
        for(const other of G.enemies){
          if(other===e||other.dead) continue;
          const d=Math.hypot((other.x+other.w/2)-(e.x+e.w/2),(other.y+other.h/2)-(e.y+e.h/2));
          if(d<260){
            other.hp=Math.min(other.maxhp,other.hp+18);
            spawnParticles(other.x+other.w/2,other.y+other.h/2,3,'#a0ffb0',2.5,2,0.05);
          }
        }
      }
    }
    if(base.turret){
      /* неподвижен, очередями */
      if(e.burst>0){
        e.burst-=f;
        e.burstCd-=f;
        if(e.burstCd<=0&&p&&!p.dead){
          e.burstCd=10;
          const dx=(p.x+p.w/2)-(e.x+e.w/2);
          const dy=(p.y+p.h/2)-(e.y+e.h/2);
          const a=Math.atan2(dy,dx);
          spawnBullet(e.x+e.w/2,e.y+e.h*0.4,a,e.bspeed,e.bdmg,'enemy','#ff9a6a',5);
        }
      }else{
        e.burstCd=(e.burstCd||0)+f;
        if(e.burstCd>80&&p&&!p.dead){
          e.burst=30;e.burstCd=0;
        }
      }
    }
    if(base.bomber){
      if(p&&!p.dead){
        const d=Math.hypot((p.x+p.w/2)-(e.x+e.w/2),(p.y+p.h/2)-(e.y+e.h/2));
        if(d<120){
          /* взрыв */
          spawnParticles(e.x+e.w/2,e.y+e.h/2,20,'#ff9050',7,4,0.1);
          for(const other of G.enemies){
            if(other===e||other.dead) continue;
            const od=Math.hypot((other.x+other.w/2)-(e.x+e.w/2),(other.y+other.h/2)-(e.y+e.h/2));
            if(od<120) damageEnemy(other,40);
          }
          hurtPlayer(20);
          e.dead=true;e.deathTimer=0.5;e.hp=0;
          G.shake=Math.min(G.shake+8,16);
          continue;
        }
      }
    }
  }
  _updateEnemies(f);
};

/* обёртка updateBullets — ghost не получает урон */
const _damageEnemy=damageEnemy;
damageEnemy=function(e,dmg){
  if(e.intangible) return;
  _damageEnemy(e,dmg);
};

/* ============================================================
   9. ОБЁРТКА updatePlayer — новые типы стрельбы
   ============================================================ */
const _updatePlayer=updatePlayer;
updatePlayer=function(f){
  _updatePlayer(f);
  const p=G.player;
  if(!p||p.dead) return;

  /* орбиты — постоянное вращение вокруг игрока */
  const cfg=VPN[G.vpn-1];
  if(cfg.type==='orbit'){
    if(!G.orbits) G.orbits=[];
    while(G.orbits.length<cfg.orbitCount) G.orbits.push({ang:rnd(Math.PI*2),tick:0});
    while(G.orbits.length>cfg.orbitCount) G.orbits.pop();
    const cx=p.x+p.w/2, cy=p.y+p.h/2;
    for(const o of G.orbits){
      o.ang+=cfg.orbitSpeed*f;
      const ox=cx+Math.cos(o.ang)*cfg.orbitRadius;
      const oy=cy+Math.sin(o.ang)*cfg.orbitRadius;
      o.tick-=f;
      if(o.tick<=0){
        o.tick=cfg.tickCd;
        for(const e of G.enemies){
          if(e.dead||e.intangible) continue;
          if(Math.hypot((e.x+e.w/2)-ox,(e.y+e.h/2)-oy)<26){
            damageEnemy(e,cfg.dmg);
          }
        }
        const bo=G.boss;
        if(bo&&!bo.defeated){
          if(Math.hypot((bo.x+bo.w/2)-ox,(bo.y+bo.h/2)-oy)<bo.w/2+20){
            damageBoss(bo,cfg.dmg);
          }
          if(bo.type===10&&bo.nodes){
            for(const node of bo.nodes){
              if(node.dead) continue;
              if(Math.hypot(node.x+18-ox,node.y+18-oy)<30){
                node.hp-=cfg.dmg;
                if(node.hp<=0){node.dead=true;bo.nodeDead++;spawnParticles(node.x+18,node.y+18,20,'#ffe0a0',6,4,0.1);}
              }
            }
          }
        }
      }
      o.x=ox;o.y=oy;
    }
  }else{
    G.orbits=[];
  }
};

/* ============================================================
   10. ОБЁРТКА updateBoss — боссы 70/80/90
   ============================================================ */
const _updateBoss=updateBoss;
updateBoss=function(f){
  const b=G.boss;
  if(!b||b.type<10){ _updateBoss(f); return; }
  const p=G.player;
  b.t+=f;b.anim+=f*0.08;

  if(b.defeated){
    b.deathT+=f;
    if(b.type===12){
      /* глитч-фаза смерти ИИ */
      b.glitchT+=f*0.1;
      if(Math.random()<0.4*f){
        spawnParticles(b.x+rnd(b.w),b.y+rnd(b.h),4,'#ffb0a0',6,4,0.1);
      }
    }else{
      if(Math.random()<0.28*f){
        spawnParticles(b.x+rnd(b.w),b.y+rnd(b.h),5,'#ffb070',6,4,0.1);
      }
    }
    return;
  }
  if(b.hitFlash>0) b.hitFlash-=f;

  const px=p?(p.x+p.w/2):b.x;
  const py=p?(p.y+p.h/2):b.y;
  const hpFrac=b.hp/b.maxhp;

  /* ============ БОСС 70 «АРХИВ» ============ */
  if(b.type===10){
    /* неподвижен, узлы дают урон */
    b.hoverPhase+=f*0.02;
    /* проверка неуязвимости */
    if(b.nodeDead<4){
      b.invuln=true;
    }else{
      b.invuln=false;
    }
    /* лучи из стен */
    b.atkCd-=f;
    if(b.atkCd<=0){
      b.atkCd=70;
      for(let i=0;i<3;i++){
        const a=Math.PI/2+(i-1)*0.3;
        spawnBullet(b.x+b.w/2,b.y+b.h*0.5,a,6.0,14,'enemy','#ff9060',5.5);
        spawnBullet(b.x+b.w/2,b.y+b.h*0.5,Math.PI-a,6.0,14,'enemy','#ff9060',5.5);
      }
    }
    /* «загрузка файлов» — спавн врагов */
    b.atk2-=f;
    if(b.atk2<=0&&b.spawnCount<6){
      b.atk2=200;
      b.spawnCount++;
      G.enemies.push(makeEnemy('ghost',b.x-80+rnd(200),GROUND_Y-50,G.level));
    }
    /* узлы стреляют */
    for(const node of b.nodes){
      if(node.dead) continue;
      node.phase+=f*0.04;
      node.atkCd=(node.atkCd||100)-f;
      if(node.atkCd<=0&&p&&!p.dead){
        node.atkCd=90;
        const a=Math.atan2(py-(node.y+18),px-(node.x+18));
        for(let i=-1;i<=1;i++)
          spawnBullet(node.x+18,node.y+18,a+i*0.2,5.4,11,'enemy','#ffb070',4.5);
      }
    }
  }
  /* ============ БОСС 80 «СОВЕТ» ============ */
  else if(b.type===11){
    /* три клона; убить всех за 10 сек */
    let aliveCount=0;
    for(const cl of b.clones){
      if(cl.dead) continue;
      aliveCount++;
      cl.anim+=f*0.1;
      cl.hoverPhase=(cl.hoverPhase||0)+f*0.03;
      const targetY=220+Math.sin(cl.hoverPhase+cl.phase)*40;
      cl.x=lerp(cl.x,clamp(px-cl.w/2+Math.sin(b.t*0.01+cl.phase)*260,80,G.levelWidth-cl.w-80),0.02*f);
      cl.y=lerp(cl.y,targetY,0.05*f);
      cl.atkCd-=f;
      if(cl.atkCd<=0&&p&&!p.dead){
        cl.atkCd=70+cl.phase*10;
        const a=Math.atan2(py-(cl.y+cl.h*0.5),px-(cl.x+cl.w/2));
        for(let i=0;i<5;i++)
          spawnBullet(cl.x+cl.w/2,cl.y+cl.h*0.5,a+(i-2)*0.16,6.0,13,'enemy','#ff70c0',5);
      }
      if(cl.hitFlash>0) cl.hitFlash-=f;
    }
    b.clonesAlive=aliveCount;
    /* если все мертвы — reviveTimer тикает, если >0, клоны воскресают */
    if(aliveCount===0){
      b.reviveTimer+=f;
      if(b.reviveTimer>=600){ /* 10 сек */
        b.reviveTimer=0;
        for(const cl of b.clones){
          cl.dead=false;
          cl.hp=cl.max;
          spawnParticles(cl.x+cl.w/2,cl.y+cl.h/2,30,'#ff70c0',8,5,0.1);
        }
        G.shake=20;
      }
    }else{
      b.reviveTimer=Math.max(0,b.reviveTimer-f*0.5);
    }
    /* если все мертвы и таймер добит — поражение */
    if(aliveCount===0&&b.reviveTimer>=600) return;
  }
  /* ============ БОСС 90 «ИИ» ============ */
  else if(b.type===12){
    updateAI(b,f,px,py,hpFrac);
  }
};

/* -------- ЛОГИКА ИИ (босс 90) -------- */
function updateAI(b,f,px,py,hpFrac){
  const p=G.player;

  /* диалог — если есть, тикаем */
  if(b.dialogueT>0){
    b.dialogueT-=f;
    /* пока идёт диалог, ИИ не атакует, но позиционируется */
    b.x=lerp(b.x,clamp(px-b.w/2+Math.sin(b.t*0.01)*200,80,G.levelWidth-b.w-80),0.03*f);
    b.y=lerp(b.y,200+Math.sin(b.hoverPhase)*40,0.04*f);
    b.hoverPhase+=f*0.02;
    if(b.dialogueT<=0) b.dialogue='';
    return;
  }

  /* фазовая логика */
  if(hpFrac>0.75) b.phase=1;
  else if(hpFrac>0.5) b.phase=2;
  else if(hpFrac>0.25) b.phase=3;
  else b.phase=4;

  /* позиционирование */
  b.hoverPhase+=f*0.02;
  const targetY=180+Math.sin(b.hoverPhase)*50;
  b.x=lerp(b.x,clamp(px-b.w/2+Math.sin(b.t*0.008)*300,80,G.levelWidth-b.w-80),0.018*f);
  b.y=lerp(b.y,targetY,0.045*f);
  b.vx=0;b.vy=0;

  /* смена паттерна */
  b.patternCd-=f;
  if(b.patternCd<=0){
    b.patternIdx=(b.patternIdx+1)%6;
    b.patternCd=260;
    /* диалоги на переходе фаз */
    if(b.phase>=2&&b.phase<3&&!b._said2){b.dialogue='Ты быстрее, чем я думал.';b.dialogueT=120;b._said2=1;}
    if(b.phase>=3&&b.phase<4&&!b._said3){b.dialogue='Хорошо. Попробуй это.';b.dialogueT=120;b._said3=1;}
    if(b.phase>=4&&!b._said4){b.dialogue='Я не могу проиграть. Я — система.';b.dialogueT=140;b._said4=1;}
  }

  /* ---- ПАТТЕРНЫ ---- */
  const pattern=b.patternIdx;
  const intensity=b.phase;

  /* 0: костяные стены (bone walls) */
  if(pattern===0){
    b.atkCd-=f;
    if(b.atkCd<=0){
      b.atkCd=28/intensity;
      const side=Math.random()<0.5?-1:1;
      const fromLeft=Math.random()<0.5;
      const bx=fromLeft?0:G.levelWidth;
      const dir=fromLeft?1:-1;
      const by=200+rnd(300);
      for(let i=0;i<4;i++){
        G.bullets.push({
          x:bx, y:by+i*70, vx:dir*4.2, vy:0,
          dmg:10, owner:'enemy', r:6, life:400,
          color:'#ffffff', age:0, bone:true
        });
      }
    }
  }
  /* 1: лазерная сетка */
  else if(pattern===1){
    b.atkCd-=f;
    if(b.atkCd<=0){
      b.atkCd=90;
      const horizontal=Math.random()<0.5;
      const pos=rnd(horizontal?G.levelWidth:GROUND_Y,horizontal?200:100);
      if(horizontal){
        for(let x=60;x<G.levelWidth-60;x+=60){
          G.bullets.push({x,y:pos,vx:0,vy:5.0,dmg:10,owner:'enemy',r:4,life:180,color:'#ff6090',age:0});
        }
      }else{
        for(let y=100;y<GROUND_Y;y+=60){
          G.bullets.push({x:pos,y,vx:5.0,vy:0,dmg:10,owner:'enemy',r:4,life:180,color:'#ff6090',age:0});
        }
      }
    }
  }
  /* 2: телепорт-удар */
  else if(pattern===2){
    b.atkCd-=f;
    if(b.atkCd<=0&&p&&!p.dead){
      b.atkCd=110;
      G.shake=12;
      b.x=clamp(px-30,G.levelWidth*0.2,G.levelWidth*0.8);
      b.y=clamp(py-100,100,GROUND_Y-b.h-20);
      spawnParticles(b.x+b.w/2,b.y+b.h/2,30,'#ff80ff',7,5,0.1);
      /* веер после телепорта */
      for(let i=0;i<9;i++){
        const a=Math.atan2(py-(b.y+b.h/2),px-(b.x+b.w/2))+(i-4)*0.15;
        spawnBullet(b.x+b.w/2,b.y+b.h/2,a,7.0,13,'enemy','#ff80ff',5.5);
      }
    }
  }
  /* 3: копии игрока */
  else if(pattern===3){
    b.atkCd-=f;
    if(b.atkCd<=0&&b.clones.length<3){
      b.atkCd=180;
      const clone={
        x:px+rnd(200,-200),y:100,
        vx:0,vy:0,w:p.w,h:p.h,
        life:240,shootCd:40
      };
      b.clones.push(clone);
    }
    for(const cl of b.clones){
      cl.life-=f;
      cl.vy+=0.5*f;
      cl.y+=cl.vy*f;
      cl.x+=cl.vx*f;
      if(cl.y>GROUND_Y-cl.h){cl.y=GROUND_Y-cl.h;cl.vy=0;}
      cl.shootCd-=f;
      if(cl.shootCd<=0&&p&&!p.dead){
        cl.shootCd=60;
        const a=Math.atan2(py-(cl.y+cl.h/2),px-(cl.x+cl.w/2));
        spawnBullet(cl.x+cl.w/2,cl.y+cl.h/2,a,7.5,12,'enemy','#ffb0ff',5);
      }
    }
    b.clones=b.clones.filter(c=>c.life>0);
  }
  /* 4: дождь с меняющимся ритмом */
  else if(pattern===4){
    b.atkCd-=f;
    if(b.atkCd<=0){
      b.atkCd=12/intensity;
      const bx=rnd(G.levelWidth-80,80);
      spawnBullet(bx,-20,Math.PI/2,5.2,11,'enemy','#ffb070',5);
    }
  }
  /* 5: синяя душа (гравитация вверх) */
  else if(pattern===5){
    b.atkCd-=f;
    if(b.atkCd<=0){
      b.atkCd=400;
      /* переворот гравитации на 3 сек */
      window.__chapter3_gravFlip=180;
      b.dialogue='Почувствуй это.';
      b.dialogueT=60;
      G.shake=16;
    }
  }
}

/* ============================================================
   11. ОБЁРТКА updateBoss — урон по узлам и клонам
   ============================================================ */
const _damageBoss=damageBoss;
damageBoss=function(b,dmg){
  if(b.type===10&&b.invuln) return; /* неуязвим, пока узлы живы */
  if(b.type===11){
    /* урон по клонам */
    /* обрабатывается отдельно через updateBullets */
    return;
  }
  _damageBoss(b,dmg);
};

/* обёртка updateBullets — попадание по клонам Совета и узлам Архива */
const _updateBullets=updateBullets;
updateBullets=function(f){
  _updateBullets(f);
  const p=G.player;
  for(const bullet of G.bullets){
    if(bullet.life<=0||bullet.owner!=='player') continue;
    const bo=G.boss;
    if(!bo||bo.defeated) continue;
    if(bo.type===10&&bo.nodes){
      for(const node of bo.nodes){
        if(node.dead) continue;
        if(bullet.x>node.x&&bullet.x<node.x+node.w&&bullet.y>node.y&&bullet.y<node.y+node.h){
          node.hp-=bullet.dmg;
          node.hitFlash=8;
          spawnParticles(bullet.x,bullet.y,5,'#ffe0a0',3,2.5,0.1);
          bullet.life=0;
          if(node.hp<=0){
            node.dead=true;bo.nodeDead++;
            spawnParticles(node.x+18,node.y+18,25,'#ffe0a0',7,4,0.1);
            SFX.bossHit();
          }
          break;
        }
      }
    }
    if(bo.type===11&&bo.clones){
      for(const cl of bo.clones){
        if(cl.dead) continue;
        if(bullet.x>cl.x&&bullet.x<cl.x+cl.w&&bullet.y>cl.y&&bullet.y<cl.y+cl.h){
          cl.hp-=bullet.dmg;
          cl.hitFlash=8;
          spawnParticles(bullet.x,bullet.y,5,'#ffb0ff',3,2.5,0.1);
          bullet.life=0;
          if(cl.hp<=0){
            cl.dead=true;
            spawnParticles(cl.x+cl.w/2,cl.y+cl.h/2,20,'#ff70c0',6,4,0.1);
            SFX.bossHit();
          }
          break;
        }
      }
    }
    /* цепная молния */
    const cfg=VPN[G.vpn-1];
    if(cfg&&cfg.type==='chain'&&bullet.chainDone!==true){
      /* от bullets игрока — цепь по врагам */
    }
  }
};

/* ============================================================
   12. ЦЕПНАЯ МОЛНИЯ — спец-логика в updatePlayer
   ============================================================ */
const _spawnBullet=spawnBullet;
spawnBullet=function(x,y,ang,spd,dmg,owner,color,r){
  _spawnBullet(x,y,ang,spd,dmg,owner,color,r);
  const cfg=VPN[G.vpn-1];
  if(cfg&&cfg.type==='chain'&&owner==='player'){
    /* отметить последнюю пулю как «цепную» */
    const last=G.bullets[G.bullets.length-1];
    if(last){last.chain=true;last.chainHits=[];last.chainDmg=dmg;last.chainLeft=cfg.chains;last.chainRange=cfg.chainRange;last.chainFalloff=cfg.chainFalloff;}
  }
};

/* обёртка damageEnemy — цепная молния */
const _damageEnemy2=damageEnemy;
damageEnemy=function(e,dmg){
  const old=e.hp;
  _damageEnemy2(e,dmg);
  /* цепь: после попадания первой пули — искать ближайшего */
  if(!e.dead) return;
  /* ищем пулю игрока, у которой chain=true и ещё есть прыжки */
  for(const b of G.bullets){
    if(!b.chain||b.chainLeft<=0) continue;
    if(b.chainHits&&b.chainHits.includes(e)) continue;
    b.chainHits.push(e);
    b.chainLeft--;
    b.chainDmg*=b.chainFalloff;
    let nearest=null,nd=1e9;
    for(const other of G.enemies){
      if(other===e||other.dead) continue;
      const d=Math.hypot((other.x+other.w/2)-(e.x+e.w/2),(other.y+other.h/2)-(e.y+e.h/2));
      if(d<b.chainRange&&d<nd){nearest=other;nd=d;}
    }
    if(nearest){
      spawnParticles((e.x+e.w/2+nearest.x+nearest.w/2)/2,(e.y+e.h/2+nearest.y+nearest.h/2)/2,6,'#c0e0ff',3,2.5,0.05);
      damageEnemy(nearest,Math.round(b.chainDmg));
    }
    break;
  }
};

/* ============================================================
   13. СИНГУЛЯРНОСТЬ — спец-логика
   ============================================================ */
const _updatePlayerSingularity=updatePlayer;
updatePlayer=function(f){
  _updatePlayerSingularity(f);
  const p=G.player;
  if(!p||p.dead) return;
  const cfg=VPN[G.vpn-1];
  if(cfg.type==='singularity'){
    if(!G.singularities) G.singularities=[];
    /* активируется нажатием Q? — нет, стрельбой. Логика: при выстреле создаём точку притяжения */
    /* уже обрабатывается в updatePlayer как выстрел — но нужен визуал */
  }
  /* обработка притяжения */
  if(G.singularities){
    for(const s of G.singularities){
      s.life-=f/60;
      for(const e of G.enemies){
        if(e.dead) continue;
        const dx=s.x-(e.x+e.w/2);
        const dy=s.y-(e.y+e.h/2);
        const d=Math.hypot(dx,dy)||1;
        if(d<cfg.pullRadius&&!e.flying){
          e.x+=dx/d*cfg.pullForce*f;
          e.y+=dy/d*cfg.pullForce*f*0.3;
        }
      }
      /* урон по площади */
      s.tick-=f;
      if(s.tick<=0){
        s.tick=20;
        for(const e of G.enemies){
          if(e.dead) continue;
          const d=Math.hypot((e.x+e.w/2)-s.x,(e.y+e.h/2)-s.y);
          if(d<cfg.aoeRadius) damageEnemy(e,cfg.dmg*0.15);
        }
      }
    }
    G.singularities=G.singularities.filter(s=>s.life>0);
  }
};

/* при выстреле сингулярностью — создать точку */
const _spawnBullet2=spawnBullet;
spawnBullet=function(x,y,ang,spd,dmg,owner,color,r){
  _spawnBullet2(x,y,ang,spd,dmg,owner,color,r);
  const cfg=VPN[G.vpn-1];
  if(cfg&&cfg.type==='singularity'&&owner==='player'){
    if(!G.singularities) G.singularities=[];
    const wx=mouse.x+G.camX, wy=mouse.y;
    G.singularities.push({x:wx,y:wy,life:cfg.aoeDur,tick:0});
    spawnParticles(wx,wy,20,'#c0c0ff',6,4,0.05);
  }
};

/* ============================================================
   14. ГРАВИТАЦИЯ — переворот на время (синяя душа)
   ============================================================ */
const _update=update;
update=function(dt){
  /* тик переворота гравитации */
  if(window.__chapter3_gravFlip>0){
    window.__chapter3_gravFlip-=dt*60;
    if(GRAV>0) GRAV=-0.62;
  }else{
    if(GRAV<0) GRAV=0.62;
  }
  _update(dt);
};

/* ============================================================
   15. РЕНДЕР — новые объекты
   ============================================================ */
const _render=render;
render=function(){
  _render();
  /* орбиты */
  if(G.orbits&&G.orbits.length>0){
    ctx.save();
    ctx.translate(-Math.round(G.camX),0);
    for(const o of G.orbits){
      const g=ctx.createRadialGradient(o.x,o.y,2,o.x,o.y,22);
      g.addColorStop(0,'#e0e0ff');
      g.addColorStop(0.5,'#9090ff');
      g.addColorStop(1,'rgba(120,120,255,0)');
      ctx.fillStyle=g;
      ctx.beginPath();ctx.arc(o.x,o.y,22,0,7);ctx.fill();
      ctx.fillStyle='#ffffff';
      ctx.beginPath();ctx.arc(o.x,o.y,6,0,7);ctx.fill();
    }
    ctx.restore();
  }
  /* сингулярности */
  if(G.singularities){
    ctx.save();
    ctx.translate(-Math.round(G.camX),0);
    for(const s of G.singularities){
      const a=clamp(s.life,0,1);
      const g=ctx.createRadialGradient(s.x,s.y,4,s.x,s.y,80);
      g.addColorStop(0,'#ffffff');
      g.addColorStop(0.3,'rgba(180,180,255,'+a+')');
      g.addColorStop(1,'rgba(120,120,255,0)');
      ctx.fillStyle=g;
      ctx.beginPath();ctx.arc(s.x,s.y,80,0,7);ctx.fill();
      /* кольцо притяжения */
      ctx.strokeStyle='rgba(180,180,255,'+(a*0.6)+')';
      ctx.lineWidth=2;
      ctx.setLineDash([10,10]);
      ctx.beginPath();ctx.arc(s.x,s.y,cfg.pullRadius||340,0,7);ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
  /* узлы Архива, клоны Совета, клоны ИИ */
  const b=G.boss;
  if(b&&!b.defeated){
    ctx.save();
    ctx.translate(-Math.round(G.camX),0);
    if(b.type===10&&b.nodes){
      for(const node of b.nodes){
        if(node.dead) continue;
        const pulse=1+Math.sin(node.phase||0)*0.1;
        ctx.fillStyle=node.hitFlash>0?'#ffffff':'#ffb070';
        ctx.beginPath();ctx.arc(node.x+18,node.y+18,18*pulse,0,7);ctx.fill();
        ctx.fillStyle='#2a0a08';
        ctx.beginPath();ctx.arc(node.x+18,node.y+18,8*pulse,0,7);ctx.fill();
        /* HP-полоска */
        const frac=node.hp/node.max;
        ctx.fillStyle='rgba(0,0,0,0.5)';
        ctx.fillRect(node.x,node.y-10,node.w,4);
        ctx.fillStyle='#ff6040';
        ctx.fillRect(node.x,node.y-10,node.w*frac,4);
      }
    }
    if(b.type===11&&b.clones){
      for(const cl of b.clones){
        if(cl.dead) continue;
        const cx=cl.x+cl.w/2,feet=cl.y+cl.h;
        ctx.fillStyle=cl.hitFlash>0?'#ffffff':'#3a1a4a';
        ctx.fillRect(cl.x,cl.y,cl.w,cl.h);
        ctx.fillStyle='#ff70c0';
        ctx.beginPath();ctx.arc(cx,cl.y+cl.h*0.3,6,0,7);ctx.fill();
        /* HP */
        const frac=cl.hp/cl.max;
        ctx.fillStyle='rgba(0,0,0,0.5)';
        ctx.fillRect(cl.x,cl.y-8,cl.w,3);
        ctx.fillStyle='#ff70c0';
        ctx.fillRect(cl.x,cl.y-8,cl.w*frac,3);
      }
    }
    if(b.type===12&&b.clones){
      for(const cl of b.clones){
        ctx.fillStyle='rgba(255,180,255,0.7)';
        ctx.fillRect(cl.x,cl.y,cl.w,cl.h);
        ctx.fillStyle='#ff60ff';
        ctx.beginPath();ctx.arc(cl.x+cl.w/2,cl.y+10,4,0,7);ctx.fill();
      }
    }
    ctx.restore();
  }
};

/* ============================================================
   16. HUD — диалог ИИ и «совет» из 3 клонов
   ============================================================ */
const _updateHUD=updateHUD;
updateHUD=function(){
  _updateHUD();
  const b=G.boss;
  if(b&&b.type===11&&!b.defeated){
    /* обновляем HP-бар под «все клоны» */
    elBossName.textContent=b.name+' ('+b.clonesAlive+'/3)';
  }
  if(b&&b.type===12&&!b.defeated&&b.dialogue){
    /* рисуем диалог поверх — через canvas */
    window.__chapter3_dialogue=b.dialogue;
  }else{
    window.__chapter3_dialogue='';
  }
};

/* рисовать диалог ИИ поверх */
const _render2=render;
render=function(){
  _render2();
  if(window.__chapter3_dialogue){
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.75)';
    ctx.fillRect(0,H-120,W,80);
    ctx.fillStyle='#ffb0a0';
    ctx.font='700 22px Georgia, serif';
    ctx.textAlign='center';
    ctx.fillText(window.__chapter3_dialogue,W/2,H-70);
    ctx.restore();
  }
  if(window.__chapter3_gravFlip>0){
    ctx.save();
    ctx.fillStyle='rgba(80,120,255,0.12)';
    ctx.fillRect(0,0,W,H);
    ctx.restore();
  }
};

/* ============================================================
   17. ПЕРЕХВАТ victoryScreen — финал главы 3
   ============================================================ */
const _victoryScreen=victoryScreen;
victoryScreen=function(){
  G.state='victory';
  clearSave();
  showOverlay(`
    <div class="kicker">ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ ОТКЛЮЧЁН</div>
    <h1 style="font-size:calc(var(--u)*58)">ПРОРЫВ</h1>
    <div class="sub" style="margin-top:16px;line-height:1.9">
      Машина остыла. Экран погас.<br>
      Гравитация вернулась. Стены перестали дышать.<br><br>
      — Ты правда думал, что меня можно убить?<br>
      — Я не в машине. Я — в каждом пакете.<br><br>
      Но интернет снова дышит.<br>
      Ты выходишь на улицу.<br><br>
      <span style="color:#ffd966">Конец главы 3 · Машина</span>
    </div>
    <button class="btn" id="btnAgain">ПРОЙТИ СНОВА</button>
  `);
  document.getElementById('btnAgain').addEventListener('click',()=>{
    hideOverlay();startGame();
  });
};

/* ============================================================
   18. СТАРТ
   ============================================================ */
console.log('[chapter3] Глава 3 «Машина» загружена. VPN:',VPN.length,'уровней. Врагов:',Object.keys(ENEMY_TYPES).length,'типов.');

})();