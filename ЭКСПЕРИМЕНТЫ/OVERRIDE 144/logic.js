'use strict';
/* ============================================================
   logic.js — OVERRIDE 144 (вся логика)
   Читает window.CS.Data / Textures / Audio
   ============================================================ */
(function () {
  const THREE = window.THREE;
  const D = window.CS.Data;
  const T = window.CS.Textures;
  const A = window.CS.Audio;
  const { WEAPONS, WEAPON_ORDER, NADE_ORDER, MAPS, ENEMY_TYPES, GAME_MODES, PICKUPS, PROGRESSION, SKIN_RARITIES, SKIN_PATTERNS, CASES, QUEST_TEMPLATES, WEAPON_SOUND_MAP } = D;

  const getEl = id => document.getElementById(id);
  const makeCanvas = T.makeCanvas;

  /* ============================================================
     ТАЙМЕРЫ
     ============================================================ */
  const Timers = {
    _ids: new Set(),
    add(fn, ms) { const id = setTimeout(() => { this._ids.delete(id); fn(); }, ms); this._ids.add(id); return id; },
    clearAll() { for (const id of this._ids) clearTimeout(id); this._ids.clear(); }
  };

  /* ============================================================
     FPS
     ============================================================ */
  const FPS = { frames: 0, last: performance.now(), el: getEl('fps-counter') };
  function updateFPS(now) {
    FPS.frames++;
    if (now - FPS.last >= 500) {
      const fps = Math.round((FPS.frames * 1000) / (now - FPS.last));
      FPS.frames = 0; FPS.last = now;
      if (FPS.el) {
        FPS.el.textContent = 'FPS: ' + fps;
        FPS.el.style.color = fps > 50 ? '#00ffc8' : fps > 30 ? '#ffcc00' : '#ff2266';
      }
    }
  }

  /* ============================================================
     ТЕКСТУРЫ (НОВЫЕ)
     ============================================================ */
  const scifiTex = T.createSciFiPanel(512);
  const rustTex = T.createRustMetal(512);
  const holoTex = T.createHoloFloor(512);
  const darkSandTex = T.createDarkSand(512);
  const neonCyanTex = T.createNeonGrid(512, 0x00ffc8);
  const neonPinkTex = T.createNeonGrid(512, 0xff2266);
  const plasmaTex = T.createPlasma(512, 'orange');
  const plasmaPurpleTex = T.createPlasma(512, 'purple');
  const bulletHoleTex = T.createBulletHoleTex();
  const flashTex = T.createMuzzleFlashTex();

  /* ============================================================
     СЦЕНА
     ============================================================ */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
  camera.rotation.order = 'YXZ';
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // SKY
  const skyMat = new THREE.ShaderMaterial({
    uniforms: { topColor: { value: new THREE.Color(0x0a1a2a) }, bottomColor: { value: new THREE.Color(0x050510) }, time: { value: 0 } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 topColor; uniform vec3 bottomColor; uniform float time; varying vec3 vP;
      float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
      float noise(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
      void main(){
        float h = vP.y;
        vec3 sky = mix(bottomColor, topColor, max(pow(max(h,0.0),0.7),0.0));
        vec3 cp = vP * 4.0 + vec3(time*0.03);
        float c = noise(cp)*0.7 + noise(cp*2.0)*0.3;
        c = smoothstep(0.35, 0.85, c) * smoothstep(0.0, 0.5, h);
        sky = mix(sky, vec3(0.0,0.9,0.8), c*0.5);
        gl_FragColor = vec4(sky, 1.0);
      }`,
    side: THREE.BackSide, depthWrite: false
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(260, 32, 16), skyMat);
  scene.add(sky);

  /* ============================================================
     СВЕТ
     ============================================================ */
  const hemi = new THREE.HemisphereLight(0x6688aa, 0x221122, 0.5); scene.add(hemi);
  const ambient = new THREE.AmbientLight(0x202030, 0.3); scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xaaccff, 1.6);
  sun.position.set(40, 60, 20); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 200 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xff2266, 0.3); fill.position.set(-40, 30, -40); scene.add(fill);

  /* ============================================================
     МАТЕРИАЛЫ
     ============================================================ */
  const wallMat = new THREE.MeshStandardMaterial({ map: scifiTex.map, normalMap: scifiTex.normalMap, roughnessMap: scifiTex.roughnessMap, roughness: 0.7, metalness: 0.4 });
  const wallDarkMat = new THREE.MeshStandardMaterial({ map: rustTex.map, normalMap: rustTex.normalMap, roughnessMap: rustTex.roughnessMap, roughness: 0.85, metalness: 0.3 });
  const metalMat = new THREE.MeshStandardMaterial({ map: scifiTex.map, normalMap: scifiTex.normalMap, roughness: 0.5, metalness: 0.8, color: 0x8899aa });
  const neonMat = new THREE.MeshStandardMaterial({ map: neonCyanTex.map, emissive: 0x00ffc8, emissiveIntensity: 1.2, emissiveMap: neonCyanTex.map, roughness: 0.3, metalness: 0.6 });
  const neonPinkMat = new THREE.MeshStandardMaterial({ map: neonPinkTex.map, emissive: 0xff2266, emissiveIntensity: 1.2, emissiveMap: neonPinkTex.map, roughness: 0.3, metalness: 0.6 });
  const sandMat = new THREE.MeshStandardMaterial({ map: darkSandTex.map, normalMap: darkSandTex.normalMap, roughness: 0.95 });
  const plasmaMat = new THREE.MeshStandardMaterial({ map: plasmaTex.map, emissive: 0xff4400, emissiveIntensity: 1.5, emissiveMap: plasmaTex.map });
  const plasmaPurpleMat = new THREE.MeshStandardMaterial({ map: plasmaPurpleTex.map, emissive: 0xaa44ff, emissiveIntensity: 1.5, emissiveMap: plasmaPurpleTex.map });
  const enemyMatT = new THREE.MeshStandardMaterial({ color: 0x8a2a2a, roughness: 0.8 });
  const enemyMatCT = new THREE.MeshStandardMaterial({ color: 0x2a4a8a, roughness: 0.8 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.8 });

  /* ============================================================
     ОРУЖИЕ В РУКАХ
     ============================================================ */
  const weaponGroup = new THREE.Group();
  camera.add(weaponGroup);
  scene.add(camera);

  const gunMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.35, metalness: 0.92 });
  const gunWood = new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 0.7, metalness: 0.1 });
  const gunPoly = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.5, metalness: 0.3 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 1 });

  function buildWeaponMesh(type) {
    const g = new THREE.Group();
    if (type === 'knife') {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.25), bladeMat); blade.position.set(0, 0, -0.15); g.add(blade);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.12), gunPoly); handle.position.set(0, 0, 0.05); g.add(handle);
      g.userData.muzzle = new THREE.Vector3(0, 0, -0.25);
    } else if (['glock','usp','p250','fiveseven','tec9','deagle'].includes(type)) {
      const s = type === 'deagle' ? 1.3 : type === 'p250' ? 1.1 : 1;
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.055 * s, 0.075 * s, 0.22 * s), gunMetal); g.add(slide);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05 * s, 0.15 * s, 0.065 * s), gunPoly); grip.position.set(0, -0.09 * s, 0.07 * s); grip.rotation.x = 0.35; g.add(grip);
      g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.17 * s);
    } else if (type === 'dual') {
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.075, 0.22), gunMetal); slide.position.set(-0.08, 0, 0); g.add(slide);
      const slide2 = slide.clone(); slide2.position.x = 0.08; g.add(slide2);
      g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.17);
    } else if (['ak47','m4a4','famas','aug','sg553'].includes(type)) {
      const wood = type === 'ak47';
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.55), gunMetal); g.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.55, 12), gunMetal); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.55); g.add(barrel);
      const hg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.25), wood ? gunWood : gunPoly); hg.position.set(0, 0.01, -0.38); g.add(hg);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.3), wood ? gunWood : gunPoly); stock.position.set(0, -0.01, 0.42); stock.rotation.x = -0.1; g.add(stock);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.08), gunMetal); mag.position.set(0, -0.13, -0.08); mag.rotation.x = 0.2; g.add(mag);
      g.userData.muzzle = new THREE.Vector3(0, 0.02, -0.85);
    } else if (['mp5','p90','ump','mac10','bizon'].includes(type)) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.35), gunMetal); g.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 10), gunMetal); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.01, -0.27); g.add(barrel);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.05), gunMetal); mag.position.set(0, -0.14, -0.02); g.add(mag);
      g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.4);
    } else if (type === 'awp' || type === 'ssg08') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.7), gunPoly); g.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 12), gunMetal); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.7); g.add(barrel);
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12), gunMetal); scope.rotation.x = Math.PI / 2; scope.position.set(0, 0.1, 0); g.add(scope);
      g.userData.muzzle = new THREE.Vector3(0, 0.02, -1.05);
    } else if (type === 'nova' || type === 'xm1014') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.4), gunMetal); g.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.6, 12), gunMetal); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.45); g.add(barrel);
      g.userData.muzzle = new THREE.Vector3(0, 0.02, -0.78);
    } else if (type === 'm249' || type === 'negev') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.7), gunMetal); g.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 12), gunMetal); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.75); g.add(barrel);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.12), gunMetal); mag.position.set(0, -0.14, -0.15); g.add(mag);
      g.userData.muzzle = new THREE.Vector3(0, 0.02, -1.1);
    } else if (['grenade','flash','smoke','molotov','decoy'].includes(type)) {
      const colors = { grenade:0x2a4a2a, flash:0xaaaaaa, smoke:0x555555, molotov:0xaa4400, decoy:0x444444 };
      const nade = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshStandardMaterial({ color: colors[type], roughness: 0.8 })); g.add(nade);
      g.userData.muzzle = new THREE.Vector3(0, 0, 0);
    }
    return g;
  }

  const VIEWMODEL_POS = {};
  WEAPON_ORDER.forEach(k => {
    const w = WEAPONS[k];
    if (w.cat === 'pistol' || w.cat === 'melee') VIEWMODEL_POS[k] = [0.16, -0.19, -0.35];
    else if (w.cat === 'smg') VIEWMODEL_POS[k] = [0.16, -0.20, -0.35];
    else if (w.cat === 'rifle') VIEWMODEL_POS[k] = [0.18, -0.22, -0.35];
    else if (w.cat === 'sniper') VIEWMODEL_POS[k] = [0.20, -0.24, -0.40];
    else if (w.cat === 'shotgun') VIEWMODEL_POS[k] = [0.20, -0.22, -0.38];
    else if (w.cat === 'lmg') VIEWMODEL_POS[k] = [0.22, -0.24, -0.42];
    else if (w.cat === 'nade') VIEWMODEL_POS[k] = [0.15, -0.18, -0.30];
    else VIEWMODEL_POS[k] = [0.15, -0.20, -0.35];
  });

  const weaponModels = {};
  for (const key in WEAPONS) { const m = buildWeaponMesh(key); m.visible = false; weaponModels[key] = m; weaponGroup.add(m); }

  const muzzleLight = new THREE.PointLight(0xffaa33, 0, 8, 2);
  const flashSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, depthTest: false, transparent: true }));
  flashSprite.scale.set(0.6, 0.6, 1); flashSprite.visible = false;

  /* ============================================================
     КАРТЫ — build функции
     ============================================================ */
  const collidables = [];
  const worldObjects = [];
  const decals = [];
  const mapLights = [];
  let currentMapData = null;

  function addBox(x, y, z, w, h, d, mat, collide = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z);
    m.castShadow = true; m.receiveShadow = true;
    scene.add(m); worldObjects.push(m);
    if (collide) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); m.userData.isWall = true; collidables.push(m); }
    return m;
  }
  function addLamp(x, y, z, color) {
    const light = new THREE.PointLight(color, 6, 18, 2);
    light.position.set(x, y, z); scene.add(light); mapLights.push(light);
    const lampMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
    lampMesh.position.set(x, y, z); scene.add(lampMesh); mapLights.push(lampMesh);
  }

  function buildFoundry() {
    const S = 100;
    const floorMat = new THREE.MeshStandardMaterial({ map: holoTex.map, roughness: 0.7, metalness: 0.5, color: 0x556677 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor); worldObjects.push(floor);
    addBox(0, 0, -50, 100, 10, 1, wallMat); addBox(0, 0, 50, 100, 10, 1, wallMat);
    addBox(-50, 0, 0, 1, 10, 100, wallMat); addBox(50, 0, 0, 1, 10, 100, wallMat);
    addBox(0, 0, 0, 20, 7, 1, metalMat); addBox(-10, 0, 10, 1, 7, 20, metalMat); addBox(10, 0, 10, 1, 7, 20, metalMat);
    for (let i = 0; i < 4; i++) addBox(-25 + i * 5, 0, -30, 2, 4, 2, metalMat);
    for (let i = 0; i < 4; i++) addBox(25 - i * 5, 0, 30, 2, 4, 2, metalMat);
    addBox(-30, 0, 0, 8, 1.5, 8, metalMat); addBox(30, 0, 0, 8, 1.5, 8, metalMat);
    [[-20,-15,1.5],[20,15,1.5],[-15,20,1.4],[15,-20,1.4]].forEach(([x,z,s]) => addBox(x, 0, z, s, s, s, neonMat));
    const pool = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 6), plasmaMat); pool.position.set(0, 0.05, -35); scene.add(pool);
    [[-30,6,-30,0x00ffc8],[30,6,30,0xff2266],[0,6,0,0x00ffc8]].forEach(([x,y,z,c]) => addLamp(x, y, z, c));
  }
  function buildCitadel() {
    const S = 110;
    const floorMat = new THREE.MeshStandardMaterial({ map: scifiTex.map, normalMap: scifiTex.normalMap, roughness: 0.8, color: 0x8899aa });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor); worldObjects.push(floor);
    addBox(0, 0, -55, 110, 11, 1, wallDarkMat); addBox(0, 0, 55, 110, 11, 1, wallDarkMat);
    addBox(-55, 0, 0, 1, 11, 110, wallDarkMat); addBox(55, 0, 0, 1, 11, 110, wallDarkMat);
    for (let i = -2; i <= 2; i++) { addBox(i * 12, 0, -40, 8, 8, 1, wallDarkMat); addBox(i * 12, 0, 40, 8, 8, 1, wallDarkMat); }
    addBox(-40, 0, -40, 8, 12, 8, neonMat); addBox(40, 0, 40, 8, 12, 8, neonMat);
    addBox(-40, 0, 40, 8, 12, 8, neonPinkMat); addBox(40, 0, -40, 8, 12, 8, neonPinkMat);
    addBox(0, 0, -25, 6, 2, 6, wallMat); addBox(0, 0, 25, 6, 2, 6, wallMat);
    for (let i = 0; i < 6; i++) addBox(-30 + i * 12, 0, 0, 1.5, 6, 1.5, neonMat);
    [[-30,6,0,0x00ffc8],[30,6,0,0xff2266]].forEach(([x,y,z,c]) => addLamp(x, y, z, c));
  }
  function buildRift() {
    const S = 95;
    const floorMat = new THREE.MeshStandardMaterial({ map: holoTex.map, roughness: 0.4, metalness: 0.7, color: 0x442266 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor); worldObjects.push(floor);
    addBox(0, 0, -47, 95, 9, 1, wallDarkMat); addBox(0, 0, 47, 95, 9, 1, wallDarkMat);
    addBox(-47, 0, 0, 1, 9, 95, wallDarkMat); addBox(47, 0, 0, 1, 9, 95, wallDarkMat);
    for (let i = 0; i < 8; i++) { const crack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 15 + Math.random() * 15), plasmaPurpleMat); crack.position.set(-40 + i * 10, 0.03, -35 + Math.random() * 70); crack.rotation.y = Math.random() * Math.PI; scene.add(crack); }
    addBox(-15, 0, 0, 1.5, 4, 40, neonPinkMat); addBox(15, 0, 0, 1.5, 4, 40, neonPinkMat);
    addBox(0, 0, -20, 30, 4, 1.5, metalMat); addBox(0, 0, 20, 30, 4, 1.5, metalMat);
    addBox(0, 0, 0, 10, 3, 10, wallDarkMat); addBox(0, 3, 0, 6, 0.5, 6, metalMat);
    for (let i = 0; i < 4; i++) { addBox(-20 + i * 13, 0, -10, 1.5, 6, 1.5, neonMat); addBox(-20 + i * 13, 0, 10, 1.5, 6, 1.5, neonMat); }
    [[-20,6,-30,0xaa66ff],[20,6,30,0xaa66ff],[0,6,0,0x66aaff],[-30,6,20,0xaa66ff],[30,6,-20,0xaa66ff]].forEach(([x,y,z,c]) => addLamp(x, y, z, c));
  }
  function buildColony() {
    const S = 105;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), sandMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor); worldObjects.push(floor);
    addBox(0, 0, -52, 105, 10, 1, wallMat); addBox(0, 0, 52, 105, 10, 1, wallMat);
    addBox(-52, 0, 0, 1, 10, 105, wallMat); addBox(52, 0, 0, 1, 10, 105, wallMat);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xd0d0e0, roughness: 0.4, metalness: 0.4 });
    [[-30,-30],[30,30],[-30,30],[30,-30]].forEach(([x,z]) => {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
      dome.position.set(x, 0, z); dome.castShadow = true; scene.add(dome);
      collidables.push(dome); dome.userData.isWall = true; if (!dome.geometry.boundingBox) dome.geometry.computeBoundingBox();
    });
    addBox(0, 0, 0, 20, 8, 20, metalMat); addBox(-10, 8, 0, 20, 1, 20, metalMat);
    addBox(-25, 0, -10, 6, 5, 6, metalMat); addBox(25, 0, 10, 6, 5, 6, metalMat);
    for (let i = -2; i <= 2; i++) { addBox(i * 8, 0, -30, 1.2, 7, 1.2, wallMat); addBox(i * 8, 0, 30, 1.2, 7, 1.2, wallMat); }
    [[-30,6,0,0xffaa55],[30,6,0,0xffaa55],[0,6,-30,0xff8844],[0,6,30,0xff8844],[-30,6,-30,0xffaa55],[30,6,30,0xffaa55]].forEach(([x,y,z,c]) => addLamp(x, y, z, c));
  }
  MAPS.FOUNDRY.build = buildFoundry;
  MAPS.CITADEL.build = buildCitadel;
  MAPS.RIFT.build = buildRift;
  MAPS.COLONY.build = buildColony;

  /* ============================================================
     БОМБА
     ============================================================ */
  let bombSitePos = new THREE.Vector3(30, 0, -30);
  const bombMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xff2266, emissiveIntensity: 0.5 }));
  bombMesh.position.copy(bombSitePos); bombMesh.position.y = 0.075; bombMesh.visible = false; scene.add(bombMesh);
  let bombSiteRing = null;
  function createBombRing() {
    if (bombSiteRing) scene.remove(bombSiteRing);
    bombSiteRing = new THREE.Mesh(new THREE.RingGeometry(2, 2.4, 48), new THREE.MeshBasicMaterial({ color: 0xff2266, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
    bombSiteRing.rotation.x = -Math.PI / 2; bombSiteRing.position.copy(bombSitePos); bombSiteRing.position.y = 0.02; scene.add(bombSiteRing);
  }

  /* ============================================================
     СОСТОЯНИЕ
     ============================================================ */
  const GAME = {
    state: 'LOBBY', mode: 'defusal', round: 1, timer: 0,
    money: 800, score: 0, kills: 0, headshots: 0,
    xp: 0, level: 1,
    bombPlanted: false, bombTimer: 0, bombSite: new THREE.Vector3(),
    defuseProgress: 0, currentMap: 'FOUNDRY', playerTeam: 'T',
    wave: 1, waveTimer: 0,
    scoreT: 0, scoreCT: 0,
    armsRaceIdx: 0,
    quests: [], questProgress: {},
    inventory: [], settings: { sens: 1.0, vol: 0.7, fov: 75 }
  };

  let bossStreak = 0;

  const player = {
    pos: new THREE.Vector3(0, 0, 30), vel: new THREE.Vector3(),
    yaw: Math.PI, pitch: 0, height: 1.7, radius: 0.35,
    health: 100, maxHealth: 100, armor: 0, helmet: false, alive: true, team: 'T',
    inventory: { primary: 'ak47', secondary: 'glock', knife: true, grenades: { grenade: 0, flash: 0, smoke: 0, molotov: 0, decoy: 0 } },
    currentSlot: 2, currentNade: 'grenade',
    ammo: 20, maxAmmo: 20, reserve: 120,
    ammoByWeapon: {},
    onGround: true, lastShot: 0, lastStep: 0, stepTimer: 0,
    recoilPitch: 0, recoilYaw: 0, aim: false, bob: 0, reloading: false,
    shake: 0, weaponKick: 0, lookVelY: 0, prevYaw: Math.PI, reloadKick: 0,
    lastDamageTime: 0, isPlanting: false, plantProgress: 0,
    targetFov: 75, currentFov: 75, _shotHeld: false,
    lastGrounded: 0, _spaceHeld: false,
    crouching: false, spraying: 0, sprayIdx: 0,
    flashed: 0, inspecting: 0
  };
  const keys = {};
  let locked = false, shooting = false, ctrlWBlocked = false;

  /* ============================================================
     ПРОФИЛЬ (localStorage)
     ============================================================ */
  function loadProfile() {
    try {
      const raw = localStorage.getItem('override144_profile');
      if (raw) {
        const p = JSON.parse(raw);
        Object.assign(GAME, {
          xp: p.xp || 0, level: p.level || 1,
          kills: p.kills || 0, headshots: p.headshots || 0,
          inventory: p.inventory || [],
          quests: p.quests || [],
          questProgress: p.questProgress || {},
          settings: p.settings || GAME.settings
        });
      }
    } catch (e) {}
    if (!GAME.quests.length) generateQuests();
    applySettings();
  }
  function saveProfile() {
    try {
      localStorage.setItem('override144_profile', JSON.stringify({
        xp: GAME.xp, level: GAME.level, kills: GAME.kills, headshots: GAME.headshots,
        inventory: GAME.inventory, quests: GAME.quests, questProgress: GAME.questProgress,
        settings: GAME.settings
      }));
    } catch (e) {}
  }
  function generateQuests() {
    const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
    GAME.quests = shuffled.map(q => ({ ...q, progress: 0, done: false }));
    GAME.questProgress = {};
    saveProfile();
  }
  function applySettings() {
    A.setMasterVolume(GAME.settings.vol);
  }
  function getRank() {
    let r = PROGRESSION.ranks[0];
    for (const rank of PROGRESSION.ranks) if (GAME.level >= rank.minLevel) r = rank;
    return r.name;
  }
  function addXP(amount) {
    GAME.xp += amount;
    const levels = PROGRESSION.levels;
    while (GAME.level < levels.length - 1 && GAME.xp >= levels[GAME.level]) {
      GAME.level++;
      addKillFeed(`LEVEL UP → ${GAME.level}`, 'levelup');
      A.sndLevelUp();
    }
    updateProfileMini();
    saveProfile();
  }
  function updateProfileMini() {
    getEl('pm-rank').textContent = getRank();
    getEl('pm-level').textContent = GAME.level;
    const levels = PROGRESSION.levels;
    const cur = levels[Math.min(GAME.level - 1, levels.length - 1)] || 0;
    const next = levels[Math.min(GAME.level, levels.length - 1)] || cur + 1;
    const pct = Math.max(0, Math.min(100, ((GAME.xp - cur) / (next - cur)) * 100));
    getEl('pm-xp-fill').style.width = pct + '%';
    getEl('pm-kills').textContent = GAME.kills;
    getEl('pm-hs').textContent = GAME.kills > 0 ? Math.round((GAME.headshots / GAME.kills) * 100) + '%' : '0%';
  }

  /* ============================================================
     ВРАГИ
     ============================================================ */
  const enemies = [];
  let SPAWNS_T = [], SPAWNS_CT = [];

  function buildEnemyModel(team, type) {
    const g = new THREE.Group();
    const mat = team === 'CT' ? enemyMatCT : enemyMatT;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.28), mat); torso.position.y = 1.15; torso.castShadow = true; g.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), skinMat); head.position.y = 1.65; head.castShadow = true; g.add(head);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: type && type.boss ? 0xaa22aa : (team === 'CT' ? 0x2a3a5a : 0x5a2a2a), roughness: 0.7 })); helmet.position.y = 1.68; g.add(helmet);
    const armGeo = new THREE.BoxGeometry(0.13, 0.55, 0.13);
    const lArm = new THREE.Mesh(armGeo, mat); lArm.position.set(-0.32, 1.15, 0); lArm.castShadow = true; g.add(lArm);
    const rArm = new THREE.Mesh(armGeo, mat); rArm.position.set(0.32, 1.15, 0); rArm.castShadow = true; g.add(rArm);
    const legGeo = new THREE.BoxGeometry(0.16, 0.8, 0.18);
    const lLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a })); lLeg.position.set(-0.15, 0.4, 0); lLeg.castShadow = true; g.add(lLeg);
    const rLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a })); rLeg.position.set(0.15, 0.4, 0); rLeg.castShadow = true; g.add(rLeg);
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.5), gunMetal); gun.position.set(0.3, 1.2, 0.25); g.add(gun);
    const headHB = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), new THREE.MeshBasicMaterial({ visible: false })); headHB.position.y = 1.65; headHB.userData.part = 'head'; g.add(headHB);
    const bodyHB = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.7), new THREE.MeshBasicMaterial({ visible: false })); bodyHB.position.y = 1.1; bodyHB.userData.part = 'body'; g.add(bodyHB);
    g.userData.hitboxes = [headHB, bodyHB];
    return g;
  }
  function spawnEnemy(team, typeKey) {
    const type = ENEMY_TYPES[typeKey || 'grunt'];
    const eTeam = team || (GAME.playerTeam === 'T' ? 'CT' : 'T');
    const spawns = eTeam === 'CT' ? SPAWNS_CT : SPAWNS_T;
    if (!spawns.length) return;
    const sp = spawns[Math.floor(Math.random() * spawns.length)];
    const model = buildEnemyModel(eTeam, type);
    model.scale.setScalar(type.scale);
    model.position.set(sp[0], 0, sp[2]); model.rotation.y = Math.random() * Math.PI * 2; scene.add(model);
    enemies.push({ model, type, health: type.hp, maxHealth: type.hp, armor: type.armor, alive: true, team: eTeam, state: 'patrol',
      patrolTarget: new THREE.Vector3(sp[0] + (Math.random() - 0.5) * 10, 0, sp[2] + (Math.random() - 0.5) * 10),
      patrolWait: 0, lastSeen: null, yaw: model.rotation.y, lastShot: 0, cooldown: type.fireRate + Math.random(), deathTime: 0, aimStart: 0 });
  }

  /* ============================================================
     ЭФФЕКТЫ
     ============================================================ */
  const bulletHoleMat = new THREE.MeshBasicMaterial({ map: bulletHoleTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const bulletHoles = [], tracers = [], impacts = [], casings = [], grenades = [], smokeClouds = [], fireAreas = [], dmgDirs = [], dustParticles = [];
  const casingGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6);
  const casingMat = new THREE.MeshStandardMaterial({ color: 0xd0a850, metalness: 1, roughness: 0.3, emissive: 0x221800 });

  function addBulletHole(p, n) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), bulletHoleMat); m.position.copy(p).addScaledVector(n, 0.008); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); scene.add(m); bulletHoles.push(m); if (bulletHoles.length > 80) scene.remove(bulletHoles.shift()); }
  function addTracer(a, b, color = 0xffcc44, life = 0.08) { const g = new THREE.BufferGeometry().setFromPoints([a, b]); const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 }); const l = new THREE.Line(g, mat); scene.add(l); tracers.push({ mesh: l, life, maxLife: life }); }
  function addImpact(p, n, color = 0xffaa44) { const count = 8; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(count * 3); const vel = []; for (let i = 0; i < count; i++) { pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z; vel.push(new THREE.Vector3(n.x + (Math.random() - 0.5) * 2, n.y + (Math.random() - 0.5) * 2 + 1, n.z + (Math.random() - 0.5) * 2).multiplyScalar(1.5 + Math.random() * 2.5)); } geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const mat = new THREE.PointsMaterial({ color, size: 0.08, transparent: true, blending: THREE.AdditiveBlending }); const pts = new THREE.Points(geo, mat); scene.add(pts); impacts.push({ mesh: pts, vel, life: 0.5, max: 0.5 }); }
  function addBlood(p) { const count = 14; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(count * 3); const vel = []; for (let i = 0; i < count; i++) { pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z; vel.push(new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3, (Math.random() - 0.5) * 4)); } geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const mat = new THREE.PointsMaterial({ color: 0xaa0000, size: 0.1, transparent: true }); const pts = new THREE.Points(geo, mat); scene.add(pts); impacts.push({ mesh: pts, vel, life: 0.7, max: 0.7 }); }
  function ejectCasing(muzzleWorld) { const mesh = new THREE.Mesh(casingGeo, casingMat); mesh.position.copy(muzzleWorld); scene.add(mesh); casings.push({ mesh, vel: new THREE.Vector3((Math.random() - 0.5) * 3 + 1.5, 2 + Math.random() * 1.5, (Math.random() - 0.5) * 2), rot: new THREE.Vector3(Math.random() * 15, Math.random() * 15, Math.random() * 15), life: 2 }); if (casings.length > 40) scene.remove(casings.shift().mesh); }

  /* ============================================================
     СТРЕЛЬБА
     ============================================================ */
  const raycaster = new THREE.Raycaster();
  function getCurrentWeaponKey() {
    if (player.currentSlot === 1) return player.inventory.primary;
    if (player.currentSlot === 2) return player.inventory.secondary;
    if (player.currentSlot === 3) return 'knife';
    if (player.currentSlot === 4) return player.currentNade;
    return null;
  }
  function worldMuzzle() { const m = weaponModels[getCurrentWeaponKey()]; const v = new THREE.Vector3(); if (m) m.localToWorld(v.copy(m.userData.muzzle)); return v; }
  function weaponSound(key) { if (WEAPON_SOUND_MAP[key]) return WEAPON_SOUND_MAP[key]; const w = WEAPONS[key]; if (!w) return 'rifle'; if (w.cat === 'smg') return 'smg'; if (w.cat === 'pistol') return 'pistol'; return 'rifle'; }

  function getInaccuracy(w) {
    if (!w) return 0;
    let mult = 1;
    if (player.crouching) mult *= 0.5;
    if (!player.onGround) mult *= 5;
    else if (player.vel.lengthSq() > 0.5) mult *= 3;
    mult *= 1 + player.spraying * 0.1;
    return w.spread * mult;
  }

  function fireWeapon() {
    const key = getCurrentWeaponKey(); if (!key) return;
    const w = WEAPONS[key]; const now = performance.now() / 1000;
    if (!player.alive || player.reloading) return;
    if (GAME.state !== 'LIVE' && GAME.state !== 'BUY') return;
    if (now - player.lastShot < w.rate) return;
    if (w.cat !== 'melee' && w.cat !== 'nade' && player.ammo <= 0) { A.sndEmpty(); player.lastShot = now; return; }
    if (w.cat === 'nade') { throwNade(key); return; }
    player.lastShot = now;
    if (w.cat !== 'melee') { player.ammo--; updateAmmoHUD(); }
    A.sndShot(weaponSound(key));
    const pattern = w.recoilPattern || [0, 0];
    const idx = Math.min(player.sprayIdx, 10);
    const rv = pattern[0] * (0.7 + Math.random() * 0.6) * (player.aim ? 0.4 : 1);
    const rh = pattern[1] * (Math.random() - 0.5) * 2 * (player.aim ? 0.4 : 1);
    player.recoilPitch += rv * 0.02;
    player.recoilYaw += rh * 0.02;
    player.spraying = Math.min(20, player.spraying + 1);
    player.sprayIdx++;
    player.shake = Math.min(1.5, player.shake + w.kick * 0.4);
    player.weaponKick = Math.min(1.5, player.weaponKick + w.kick);
    if (w.cat !== 'melee') { muzzleLight.intensity = w.kick > 2 ? 35 : 18; flashSprite.visible = true; flashSprite.material.rotation = Math.random() * Math.PI * 2; flashSprite.scale.setScalar(0.5 + Math.random() * 0.4); }
    const spread = getInaccuracy(w) * (player.aim ? 0.15 : 1);
    const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    if (w.pellets) { for (let i = 0; i < w.pellets; i++) { const dir = camDir.clone(); dir.x += (Math.random() - 0.5) * spread; dir.y += (Math.random() - 0.5) * spread; dir.normalize(); fireRay(dir, w); } }
    else { const dir = camDir.clone(); dir.x += (Math.random() - 0.5) * spread; dir.y += (Math.random() - 0.5) * spread; dir.normalize(); fireRay(dir, w); }
    if (w.cat !== 'melee') Timers.add(() => { if (player.alive) ejectCasing(worldMuzzle().add(new THREE.Vector3(0, -0.02, 0.02))); }, 30);
  }
  function fireRay(dir, w) {
    raycaster.set(camera.position, dir); raycaster.far = 600;
    const targets = [];
    for (const e of enemies) { if (!e.alive) continue; for (const hb of e.model.userData.hitboxes) targets.push(hb); }
    for (const o of worldObjects) if (o.visible) targets.push(o);
    const hits = raycaster.intersectObjects(targets, false);
    const start = worldMuzzle(); let end = start.clone().add(dir.clone().multiplyScalar(200));
    if (hits.length) {
      const h = hits[0]; end = h.point.clone();
      let hitEnemy = null, part = null;
      for (const e of enemies) { if (!e.alive) continue; if (e.model.userData.hitboxes.includes(h.object)) { hitEnemy = e; part = h.object.userData.part; break; } }
      if (hitEnemy) { const dist = h.distance; let falloff = 1; if (dist > 40) falloff = Math.max(0.6, 1 - (dist - 40) / 200); let dmg = (part === 'head' ? w.dmg * w.headMult : w.dmg) * falloff; if (hitEnemy.armor > 0) { const armorDmg = Math.min(hitEnemy.armor, dmg * 0.5); hitEnemy.armor -= armorDmg; dmg -= armorDmg * 0.5; } damageEnemy(hitEnemy, dmg, part === 'head'); addBlood(h.point); }
      else { const normal = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new THREE.Vector3(0, 1, 0); addBulletHole(h.point, normal); addImpact(h.point, normal); }
    }
    if (w.dmg > 0) addTracer(start, end, w.dmg > 100 ? 0x88ccff : 0xffcc44);
  }
  function throwNade(key) {
    if (player.inventory.grenades[key] <= 0) return;
    player.inventory.grenades[key]--;
    player.lastShot = performance.now() / 1000;
    const geo = new THREE.SphereGeometry(0.06, 12, 12);
    const colors = { grenade:0x2a4a2a, flash:0xaaaaaa, smoke:0x555555, molotov:0xaa4400, decoy:0x444444 };
    const mat = new THREE.MeshStandardMaterial({ color: colors[key], emissive: 0x110a00 });
    const nade = new THREE.Mesh(geo, mat); nade.position.copy(camera.position); nade.position.y -= 0.1; scene.add(nade);
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const vel = dir.multiplyScalar(15); vel.y += 3;
    grenades.push({ mesh: nade, vel, type: key, exploded: false, time: performance.now() / 1000 });
    updateAmmoHUD();
    if (player.inventory.grenades[key] <= 0) {
      const avail = NADE_ORDER.find(k => player.inventory.grenades[k] > 0);
      if (avail) player.currentNade = avail; else equipSlot(player.inventory.primary ? 1 : 2);
    }
  }
  function updateGrenades(dt) {
    for (let i = grenades.length - 1; i >= 0; i--) {
      const g = grenades[i]; if (g.exploded) continue;
      g.mesh.position.addScaledVector(g.vel, dt); g.vel.y -= 9.8 * dt;
      if (g.mesh.position.y < 0.06) { g.mesh.position.y = 0.06; g.vel.y *= -0.5; g.vel.x *= 0.8; g.vel.z *= 0.8; }
      resolveCollision(g.mesh.position, 0.1, 0.1);
      const elapsed = performance.now() / 1000 - g.time;
      if (elapsed > 2.5) {
        g.exploded = true;
        const pos = g.mesh.position.clone();
        scene.remove(g.mesh);
        grenades.splice(i, 1);
        if (g.type === 'grenade') {
          A.sndExplosion();
          const dist = player.pos.distanceTo(pos); if (dist < 8) damagePlayer(100 * (1 - dist / 8), pos);
          for (const e of enemies) { if (!e.alive) continue; const d = e.model.position.distanceTo(pos); if (d < 8) damageEnemy(e, 100 * (1 - d / 8), false); }
          addImpact(pos, new THREE.Vector3(0, 1, 0), 0xff6600);
          const light = new THREE.PointLight(0xff6600, 15, 18); light.position.copy(pos); scene.add(light);
          Timers.add(() => scene.remove(light), 250);
        } else if (g.type === 'flash') {
          A.sndFlash();
          const eyePos = player.pos.clone(); eyePos.y += 1.5;
          const dist = eyePos.distanceTo(pos);
          if (dist < 20) {
            const dirToNade = pos.clone().sub(eyePos).normalize();
            const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            const angle = dirToNade.angleTo(camDir);
            if (angle < Math.PI / 2) {
              const power = Math.max(0, 1 - dist / 20) * Math.max(0, 1 - angle / (Math.PI / 2));
              player.flashed = Math.max(player.flashed, power * 2.5);
              const el = getEl('flash-overlay'); el.style.opacity = Math.min(1, power * 1.5).toString();
              Timers.add(() => { el.style.opacity = '0'; }, 150 + power * 800);
            }
          }
        } else if (g.type === 'smoke') {
          const cloudGeo = new THREE.SphereGeometry(2.5, 12, 12);
          const cloudMat = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.85, depthWrite: false });
          const cloud = new THREE.Mesh(cloudGeo, cloudMat);
          cloud.position.copy(pos); cloud.position.y = 2; scene.add(cloud);
          smokeClouds.push({ mesh: cloud, life: 15, max: 15 });
        } else if (g.type === 'molotov') {
          const fireGeo = new THREE.CircleGeometry(2.5, 24);
          const fireMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
          const fire = new THREE.Mesh(fireGeo, fireMat);
          fire.rotation.x = -Math.PI / 2; fire.position.copy(pos); fire.position.y = 0.05; scene.add(fire);
          fireAreas.push({ mesh: fire, life: 7, max: 7 });
          A.sndExplosion();
        } else if (g.type === 'decoy') {
          A.sndShot3D('rifle', pos);
        }
      }
    }
    for (let i = smokeClouds.length - 1; i >= 0; i--) {
      const s = smokeClouds[i]; s.life -= dt; s.mesh.material.opacity = Math.max(0, s.life / s.max * 0.85);
      if (s.life <= 0) { scene.remove(s.mesh); smokeClouds.splice(i, 1); }
    }
    for (let i = fireAreas.length - 1; i >= 0; i--) {
      const f = fireAreas[i]; f.life -= dt;
      f.mesh.material.opacity = Math.max(0, f.life / f.max * 0.7);
      const dP = player.pos.distanceTo(f.mesh.position);
      if (dP < 2.5 && player.alive && Math.random() < 0.1) damagePlayer(8, f.mesh.position);
      for (const e of enemies) { if (e.alive && e.model.position.distanceTo(f.mesh.position) < 2.5 && Math.random() < 0.1) damageEnemy(e, 8, false); }
      if (f.life <= 0) { scene.remove(f.mesh); fireAreas.splice(i, 1); }
    }
  }
  function damageEnemy(e, dmg, head) { e.health -= dmg; A.sndHitmarker(); showHit(); e.state = 'chase'; e.lastSeen = player.pos.clone(); if (e.health <= 0 && e.alive) killEnemy(e, head); }
  function killEnemy(e, head) {
    e.alive = false; e.deathTime = performance.now() / 1000;
    A.sndEnemyDeath();
    const type = e.type || ENEMY_TYPES.grunt;
    player.kills++; GAME.kills++;
    if (head) { GAME.headshots++; player.headshots = (player.headshots || 0) + 1; }
    GAME.score += type.score + (head ? 50 : 0);
    GAME.money = Math.min(16000, GAME.money + type.money);
    addXP(PROGRESSION.xpPerKill + (head ? PROGRESSION.xpPerHeadshot : 0));
    updateHUD(); addKillFeed(head ? 'HEADSHOT' : 'KILL', head ? 'headshot' : '');
    if (type.boss) bossStreak++;
    updateQuests('kills', 1);
    if (head) updateQuests('headshots', 1);
    if (GAME.mode === 'armsrace') advanceArmsRace();
    if (GAME.mode === 'dm') Timers.add(() => { if (GAME.state === 'LIVE') spawnEnemy(null, pickRandomEnemyType()); }, 3000);
    saveProfile();
  }
  function advanceArmsRace() {
    GAME.armsRaceIdx++;
    const order = ['glock','usp','deagle','mp5','ak47','m4a4','awp','nova'];
    if (GAME.armsRaceIdx >= order.length) { endRound(true); return; }
    player.inventory.primary = order[GAME.armsRaceIdx];
    player.currentSlot = 1; equipSlot(1);
    addKillFeed(`ARMS RACE: ${WEAPONS[order[GAME.armsRaceIdx]].name}`, 'levelup');
  }
  function pickRandomEnemyType() { const keys = Object.keys(ENEMY_TYPES).filter(k => !ENEMY_TYPES[k].boss); return keys[Math.floor(Math.random() * keys.length)]; }
  function addKillFeed(msg, cls) { const e = document.createElement('div'); e.className = 'kf-entry ' + (cls || ''); e.textContent = `YOU ${msg}`; getEl('kill-feed').appendChild(e); Timers.add(() => e.remove(), 4000); }

  /* ============================================================
     HUD
     ============================================================ */
  function updateHUD() {
    getEl('health').textContent = Math.ceil(player.health);
    getEl('armor').textContent = `[${Math.ceil(player.armor)}]`;
    getEl('health').style.color = player.health > 50 ? '#00ffc8' : player.health > 25 ? '#ffcc00' : '#ff2266';
    getEl('money-hud').textContent = `$${GAME.money}`;
    getEl('round-num').textContent = GAME.round;
    getEl('score-t').textContent = GAME.scoreT;
    getEl('score-ct').textContent = GAME.scoreCT;
    const tb = getEl('team-badge');
    tb.textContent = player.team || 'T';
    tb.className = player.team === 'CT' ? 'ct' : '';
  }
  function updateHealthHUD() { getEl('health').textContent = Math.ceil(player.health); getEl('health').style.color = player.health > 50 ? '#00ffc8' : player.health > 25 ? '#ffcc00' : '#ff2266'; getEl('armor').textContent = `[${Math.ceil(player.armor)}]`; }
  function updateAmmoHUD() {
    const key = getCurrentWeaponKey(); if (!key) return;
    const w = WEAPONS[key];
    const ammoEl = getEl('ammo-current'); const resEl = getEl('ammo-reserve'); const wpEl = getEl('ammo-weapon');
    if (w.cat === 'melee') { ammoEl.textContent = '-'; resEl.textContent = ''; }
    else if (w.cat === 'nade') { ammoEl.textContent = player.inventory.grenades[key] || 0; resEl.textContent = ''; }
    else { ammoEl.textContent = player.ammo; resEl.textContent = '/ ' + player.reserve; ammoEl.style.color = player.ammo > 5 ? '#fff' : '#ff2266'; }
    wpEl.textContent = w.name;
    updateGrenadeHUD();
  }
  function updateGrenadeHUD() {
    const cont = getEl('grenade-slots');
    cont.innerHTML = '';
    NADE_ORDER.forEach(k => {
      const el = document.createElement('div');
      el.className = 'gslot' + (player.inventory.grenades[k] > 0 ? ' has' : '');
      el.textContent = player.inventory.grenades[k] > 0 ? player.inventory.grenades[k] : '';
      el.title = WEAPONS[k].name;
      cont.appendChild(el);
    });
  }
  const WEAPON_SLOTS = {};
  function updateSlotHUD() { for (const k in WEAPON_SLOTS) WEAPON_SLOTS[k].el.classList.toggle('active', +k === player.currentSlot); }
  let hitTimer = 0;
  function showHit() { getEl('hit-marker').style.opacity = '1'; hitTimer = 0.15; }
  function flashDamage() { const e = getEl('damage-overlay'); e.style.opacity = '1'; Timers.add(() => e.style.opacity = '0', 180); }
  function showDamageFrom(attackerPos) {
    const dx = attackerPos.x - player.pos.x, dz = attackerPos.z - player.pos.z;
    const ang = Math.atan2(dx * Math.cos(player.yaw) - dz * Math.sin(player.yaw), -dx * Math.sin(player.yaw) - dz * Math.cos(player.yaw));
    const e = document.createElement('div'); e.className = 'dmg-dir';
    e.style.transform = `translate(-50%,-50%) rotate(${ang}rad) translateY(-90px)`; e.style.opacity = '1';
    getEl('hud').appendChild(e); dmgDirs.push({ el: e, life: 1.2 });
  }

  // RETICLE
  const reticleCanvas = getEl('reticle-canvas');
  const rCtx = reticleCanvas.getContext('2d');
  function resizeReticle() { reticleCanvas.width = innerWidth; reticleCanvas.height = innerHeight; }
  resizeReticle();
  function drawReticle() {
    rCtx.clearRect(0, 0, reticleCanvas.width, reticleCanvas.height);
    if (!player.alive || GAME.state === 'LOBBY') return;
    if (getEl('buy-menu').style.display === 'flex') return;
    const key = getCurrentWeaponKey(); if (!key) return;
    const w = WEAPONS[key]; const cx = reticleCanvas.width / 2, cy = reticleCanvas.height / 2;
    if (player.aim && w.cat === 'sniper') {
      const R = Math.min(reticleCanvas.width, reticleCanvas.height) * 0.4;
      rCtx.save(); rCtx.fillStyle = 'rgba(0,0,0,0.98)';
      rCtx.beginPath(); rCtx.rect(0, 0, reticleCanvas.width, reticleCanvas.height); rCtx.arc(cx, cy, R, 0, Math.PI * 2, true); rCtx.fill();
      rCtx.strokeStyle = 'rgba(0,255,200,0.9)'; rCtx.lineWidth = 1.5;
      rCtx.beginPath(); rCtx.moveTo(cx - R, cy); rCtx.lineTo(cx + R, cy); rCtx.stroke();
      rCtx.beginPath(); rCtx.moveTo(cx, cy - R); rCtx.lineTo(cx, cy + R); rCtx.stroke();
      rCtx.fillStyle = 'rgba(255,34,102,0.95)'; rCtx.beginPath(); rCtx.arc(cx, cy, 2, 0, Math.PI * 2); rCtx.fill();
      rCtx.restore(); return;
    }
    const kick = player.weaponKick; const baseGap = 6 + kick * 6; const len = 8;
    rCtx.strokeStyle = 'rgba(0,255,200,0.95)';
    rCtx.lineWidth = 1.5; rCtx.shadowColor = 'rgba(0,0,0,0.9)'; rCtx.shadowBlur = 3;
    if (w.reticle === 'dot') { rCtx.fillStyle = 'rgba(0,255,200,1)'; rCtx.beginPath(); rCtx.arc(cx, cy, 2, 0, Math.PI * 2); rCtx.fill(); }
    else if (w.reticle === 'dot-arcs') { rCtx.fillStyle = 'rgba(255,34,102,1)'; rCtx.beginPath(); rCtx.arc(cx, cy, 2.5, 0, Math.PI * 2); rCtx.fill(); rCtx.strokeStyle = 'rgba(255,34,102,0.7)'; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; rCtx.beginPath(); rCtx.arc(cx, cy, 12, a - 0.35, a + 0.35); rCtx.stroke(); } }
    else if (w.reticle === 'wide') { rCtx.strokeStyle = 'rgba(255,204,0,0.9)'; rCtx.beginPath(); rCtx.arc(cx, cy, 30, 0, Math.PI * 2); rCtx.stroke(); rCtx.fillStyle = 'rgba(255,204,0,1)'; rCtx.beginPath(); rCtx.arc(cx, cy, 2, 0, Math.PI * 2); rCtx.fill(); }
    else { const gap = baseGap; rCtx.beginPath(); rCtx.moveTo(cx, cy - gap - len); rCtx.lineTo(cx, cy - gap); rCtx.stroke(); rCtx.beginPath(); rCtx.moveTo(cx, cy + gap); rCtx.lineTo(cx, cy + gap + len); rCtx.stroke(); rCtx.beginPath(); rCtx.moveTo(cx - gap - len, cy); rCtx.lineTo(cx - gap, cy); rCtx.stroke(); rCtx.beginPath(); rCtx.moveTo(cx + gap, cy); rCtx.lineTo(cx + gap + len, cy); rCtx.stroke(); rCtx.fillStyle = 'rgba(0,255,200,0.9)'; rCtx.beginPath(); rCtx.arc(cx, cy, 1.2, 0, Math.PI * 2); rCtx.fill(); }
    rCtx.shadowBlur = 0;
  }

  /* ============================================================
     РАДАР
     ============================================================ */
  const radarCanvas = getEl('radar-canvas');
  const radarCtx = radarCanvas.getContext('2d');
  function drawRadar() {
    if (GAME.state === 'LOBBY') return;
    const w = radarCanvas.width, h = radarCanvas.height, cx = w / 2, cy = h / 2;
    radarCtx.clearRect(0, 0, w, h);
    const range = 60;
    const scale = (w / 2) / range;
    radarCtx.fillStyle = 'rgba(0,0,0,0.3)';
    radarCtx.fillRect(0, 0, w, h);
    radarCtx.strokeStyle = 'rgba(0,255,200,0.15)';
    radarCtx.beginPath(); radarCtx.arc(cx, cy, w / 2 - 4, 0, Math.PI * 2); radarCtx.stroke();
    radarCtx.beginPath(); radarCtx.moveTo(cx, 4); radarCtx.lineTo(cx, h - 4); radarCtx.stroke();
    radarCtx.beginPath(); radarCtx.moveTo(4, cy); radarCtx.lineTo(w - 4, cy); radarCtx.stroke();
    // бомба
    if (GAME.bombSite) {
      const dx = (GAME.bombSite.x - player.pos.x) * scale, dz = (GAME.bombSite.z - player.pos.z) * scale;
      radarCtx.fillStyle = GAME.bombPlanted ? 'rgba(255,34,102,1)' : 'rgba(255,34,102,0.5)';
      radarCtx.beginPath(); radarCtx.arc(cx + dx, cy + dz, 5, 0, Math.PI * 2); radarCtx.fill();
    }
    // враги
    for (const e of enemies) {
      if (!e.alive) continue;
      const dist = e.model.position.distanceTo(player.pos);
      if (dist > range) continue;
      const dx = (e.model.position.x - player.pos.x) * scale, dz = (e.model.position.z - player.pos.z) * scale;
      const enemyAlpha = 0.3 + (1 - dist / range) * 0.7;
      radarCtx.fillStyle = `rgba(255,34,102,${enemyAlpha})`;
      radarCtx.beginPath(); radarCtx.arc(cx + dx, cy + dz, 3, 0, Math.PI * 2); radarCtx.fill();
    }
    // игрок
    radarCtx.save();
    radarCtx.translate(cx, cy);
    radarCtx.rotate(-player.yaw + Math.PI);
    radarCtx.fillStyle = 'rgba(0,255,200,1)';
    radarCtx.beginPath(); radarCtx.moveTo(0, -7); radarCtx.lineTo(-5, 5); radarCtx.lineTo(5, 5); radarCtx.closePath(); radarCtx.fill();
    radarCtx.restore();
  }

  /* ============================================================
     ЭКИПИРОВКА
     ============================================================ */
  function saveAmmoFor(key) { if (!key) return; player.ammoByWeapon[key] = { mag: player.ammo, reserve: player.reserve }; }
  function loadAmmoFor(key) {
    const w = WEAPONS[key]; if (!w) return;
    const saved = player.ammoByWeapon[key];
    if (saved) { player.ammo = saved.mag; player.reserve = saved.reserve; }
    else { player.ammo = w.mag; player.reserve = w.reserve; }
    player.maxAmmo = w.mag;
  }
  function equipSlot(slot) {
    if (slot === 1 && !player.inventory.primary) return;
    if (slot === 4 && !NADE_ORDER.some(k => player.inventory.grenades[k] > 0)) return;
    const prevKey = getCurrentWeaponKey();
    if (prevKey) saveAmmoFor(prevKey);
    player.currentSlot = slot;
    if (slot === 4) {
      const avail = NADE_ORDER.find(k => player.inventory.grenades[k] > 0);
      if (avail) player.currentNade = avail;
    }
    const key = getCurrentWeaponKey(); if (!key) return;
    for (const k in weaponModels) weaponModels[k].visible = k === key;
    const m = weaponModels[key];
    if (flashSprite.parent) flashSprite.parent.remove(flashSprite); flashSprite.position.copy(m.userData.muzzle); m.add(flashSprite);
    if (muzzleLight.parent) muzzleLight.parent.remove(muzzleLight); muzzleLight.position.copy(m.userData.muzzle); m.add(muzzleLight);
    loadAmmoFor(key);
    player.reloading = false; player._shotHeld = false; player.spraying = 0; player.sprayIdx = 0;
    updateAmmoHUD(); updateSlotHUD();
  }
  function doReload() {
    const key = getCurrentWeaponKey(); if (!key) return;
    const w = WEAPONS[key];
    if (player.reloading || player.ammo >= w.mag || player.reserve <= 0 || w.cat === 'melee' || w.cat === 'nade') return;
    player.reloading = true; player.reloadKick = 1; A.sndReload();
    Timers.add(() => { const need = w.mag - player.ammo; const avail = Math.min(need, player.reserve); player.ammo += avail; player.reserve -= avail; updateAmmoHUD(); player.reloading = false; }, 1500);
  }

  /* ============================================================
     КОЛЛИЗИИ
     ============================================================ */
  const STEP_UP_HEIGHT = 0.55;
  function resolveCollision(pos, radius, height) {
    let grounded = false;
    for (const obj of collidables) {
      if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
      const b = obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld);
      const pMinX = pos.x - radius, pMaxX = pos.x + radius;
      const pMinZ = pos.z - radius, pMaxZ = pos.z + radius;
      const pMinY = pos.y, pMaxY = pos.y + height;
      if (pMaxX <= b.min.x || pMinX >= b.max.x) continue;
      if (pMaxZ <= b.min.z || pMinZ >= b.max.z) continue;
      if (pMaxY <= b.min.y || pMinY >= b.max.y) continue;
      const obstacleTop = b.max.y; const feetToTop = obstacleTop - pos.y;
      if (feetToTop > 0 && feetToTop <= STEP_UP_HEIGHT + 0.05) { pos.y = obstacleTop + 0.001; grounded = true; continue; }
      const pT = b.max.y - pMinY, pB = pMaxY - b.min.y; const pL = pMaxX - b.min.x, pR = b.max.x - pMinX; const pBk = pMaxZ - b.min.z, pF = b.max.z - pMinZ;
      const m = Math.min(pT, pB, pL, pR, pBk, pF);
      if (m === pT) { pos.y = b.max.y; grounded = true; }
      else if (m === pB) { pos.y = b.min.y - height; }
      else if (m === pL) { pos.x = b.min.x - radius; }
      else if (m === pR) { pos.x = b.max.x + radius; }
      else if (m === pBk) { pos.z = b.min.z - radius; }
      else { pos.z = b.max.z + radius; }
    }
    if (pos.y < 0) { pos.y = 0; grounded = true; }
    return grounded;
  }

  /* ============================================================
     AI
     ============================================================ */
  function lineOfSight(from, to) {
    const d = to.clone().sub(from); const dist = d.length(); d.normalize();
    raycaster.set(from, d); raycaster.far = dist;
    const hits = raycaster.intersectObjects(worldObjects, false); raycaster.far = 600;
    if (!hits.length) return true;
    return hits[0].distance >= dist - 0.6;
  }
  function updateEnemy(e, dt) {
    if (!e.alive) {
      const t = performance.now() / 1000 - e.deathTime;
      if (t < 1.2) { e.model.rotation.z = Math.min(Math.PI / 2, t * Math.PI / 2); e.model.position.y = Math.max(0.15, 0 - t * 0.4); }
      if (t > 5) { scene.remove(e.model); const idx = enemies.indexOf(e); if (idx >= 0) enemies.splice(idx, 1); }
      return;
    }
    const now = performance.now() / 1000; const ePos = e.model.position;
    const pEye = player.pos.clone(); pEye.y += 1.5; const eEye = ePos.clone(); eEye.y += 1.6;
    const toP = player.pos.clone().sub(ePos); toP.y = 0; const dist = toP.length();
    const sees = player.alive && dist < 45 && lineOfSight(eEye, pEye);
    if (sees) { e.state = 'chase'; e.lastSeen = player.pos.clone(); }
    else if (e.state === 'chase' && (!e.lastSeen || ePos.distanceTo(e.lastSeen) < 1.5)) { e.state = 'patrol'; e.lastSeen = null; e.patrolTarget.set(ePos.x + (Math.random() - 0.5) * 25, 0, ePos.z + (Math.random() - 0.5) * 25); }
    let target = null, speed = 0;
    if (e.state === 'chase') { target = sees ? player.pos.clone() : e.lastSeen; speed = sees ? 4.5 : 2.5; if (sees && dist < 6) speed = 0; }
    else { target = e.patrolTarget; speed = e.type.speed * 0.5; if (ePos.distanceTo(e.patrolTarget) < 1) { e.patrolWait += dt; if (e.patrolWait > 2) { e.patrolWait = 0; e.patrolTarget.set(ePos.x + (Math.random() - 0.5) * 25, 0, ePos.z + (Math.random() - 0.5) * 25); } speed = 0; } }
    if (target && speed > 0) {
      const dir = target.clone().sub(ePos); dir.y = 0;
      if (dir.length() > 0.5) {
        dir.normalize(); const np = ePos.clone().add(dir.clone().multiplyScalar(speed * dt)); np.y = 0;
        resolveCollision(np, 0.4, 1.7); np.y = 0;
        e.model.position.copy(np);
        const tYaw = Math.atan2(-dir.x, -dir.z); let dy = tYaw - e.yaw;
        while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
        e.yaw += dy * Math.min(1, dt * 6); e.model.rotation.y = e.yaw;
      }
    }
    if (sees) { const tYaw = Math.atan2(-toP.x, -toP.z); let dy = tYaw - e.yaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2; e.yaw += dy * Math.min(1, dt * 8); e.model.rotation.y = e.yaw; }
    if (sees && dist < 30 && now - e.lastShot > e.cooldown) {
      if (!e.aimStart) e.aimStart = now;
      if (now - e.aimStart < 0.6) return;
      e.lastShot = now; e.cooldown = e.type.fireRate + Math.random() * 1.5;
      A.sndShot3D('rifle', ePos.clone().setY(ePos.y + 1.3));
      const hitChance = Math.max(0.05, e.type.accuracy - dist * 0.01);
      if (Math.random() < hitChance) damagePlayer(e.type.dmg + Math.random() * e.type.dmg * 0.5, ePos.clone());
      const mz = ePos.clone(); mz.y += 1.3; const tg = pEye.clone(); tg.x += (Math.random() - 0.5) * 1.5; tg.y += (Math.random() - 0.5) * 1.5; tg.z += (Math.random() - 0.5) * 1.5;
      addTracer(mz, tg, 0xff8844, 0.06);
    } else if (!sees) { e.aimStart = null; }
  }

  /* ============================================================
     ИГРОК
     ============================================================ */
  function updatePlayer(dt) {
    if (!player.alive || GAME.state === 'LOBBY') return;
    const key = getCurrentWeaponKey(); const w = key ? WEAPONS[key] : null;
    const sprint = keys['ShiftLeft']; const isAwp = key === 'awp' || key === 'ssg08';
    const crouch = keys['ControlLeft'] || keys['KeyC'];
    player.crouching = crouch;
    player.height = crouch ? 1.1 : 1.7;
    const aimSlow = player.aim ? 0.5 : 1; const speed = (sprint ? 2.6 : 5.5) * aimSlow * (crouch ? 0.4 : 1);
    const fwd = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    const rgt = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    const move = new THREE.Vector3();
    if (locked) { if (keys['KeyW']) move.add(fwd); if (keys['KeyS']) move.sub(fwd); if (keys['KeyD']) move.add(rgt); if (keys['KeyA']) move.sub(rgt); }
    const moving = move.lengthSq() > 0;
    if (moving) {
      move.normalize(); player.vel.x = move.x * speed; player.vel.z = move.z * speed;
      player.bob += dt * (sprint ? 5 : 9); player.stepTimer += dt;
      const stepTime = sprint ? 0.5 : 0.34;
      if (player.stepTimer > stepTime && player.onGround) { A.sndStep(sprint); player.stepTimer = 0; }
    } else { player.vel.x *= 0.82; player.vel.z *= 0.82; player.bob += dt * 2; }
    if (player.onGround) player.lastGrounded = performance.now();
    const coyoteTime = performance.now() - player.lastGrounded;
    const jumpBuffer = keys['Space'] && !player._spaceHeld;
    player._spaceHeld = keys['Space'];
    if (jumpBuffer && coyoteTime < 120) { player.vel.y = 7.5; player.onGround = false; player.lastGrounded = 0; }
    if (player.vel.y < 0) player.vel.y -= 22 * dt; else player.vel.y -= 18 * dt;
    const np = player.pos.clone(); np.x += player.vel.x * dt; np.y += player.vel.y * dt; np.z += player.vel.z * dt;
    const grounded = resolveCollision(np, player.radius, player.height);
    if (grounded) player.vel.y = 0;
    player.onGround = grounded; player.pos.copy(np);
    if (player.lastDamageTime && performance.now() / 1000 - player.lastDamageTime > 5 && player.health < player.maxHealth) { player.health += 2 * dt; updateHealthHUD(); }
    player.recoilPitch *= 0.86; player.recoilYaw *= 0.86; player.shake = Math.max(0, player.shake - dt * 6);
    if (!shooting) { player.spraying = Math.max(0, player.spraying - dt * 8); if (player.spraying < 0.1) player.sprayIdx = 0; }
    const bob = Math.sin(player.bob) * (moving ? 0.04 : 0.012);
    const shakeX = (Math.random() - 0.5) * player.shake * 0.06; const shakeY = (Math.random() - 0.5) * player.shake * 0.06;
    camera.position.set(player.pos.x + shakeX, player.pos.y + player.height + bob + shakeY, player.pos.z);
    camera.rotation.set(player.pitch + player.recoilPitch, player.yaw + player.recoilYaw, 0);
    let targetFov = GAME.settings.fov;
    if (player.aim) { if (isAwp) targetFov = 20; else if (w && w.cat === 'sniper') targetFov = 35; else if (w && (w.cat === 'melee' || w.cat === 'nade')) targetFov = GAME.settings.fov; else targetFov = 55; }
    player.targetFov = targetFov; player.currentFov += (player.targetFov - player.currentFov) * Math.min(1, dt * 10);
    camera.fov = player.currentFov; camera.updateProjectionMatrix();
    const vig = getEl('vignette');
    if (player.aim) vig.style.background = 'radial-gradient(ellipse at center,transparent 20%,rgba(0,0,0,0.85) 80%)';
    else vig.style.background = 'radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,0.65) 100%)';
    player.weaponKick *= Math.pow(0.0005, dt); player.reloadKick *= Math.pow(0.0001, dt);
    if (player.inspecting > 0) player.inspecting -= dt;
    const vm = VIEWMODEL_POS[key] || [0.15, -0.2, -0.35];
    const aimTarget = isAwp ? [0, -0.15, -0.2] : [0, -0.09, -0.28];
    const aimOff = player.aim ? 1 : 0;
    const basePos = new THREE.Vector3(vm[0] + (aimTarget[0] - vm[0]) * aimOff, vm[1] + (aimTarget[1] - vm[1]) * aimOff, vm[2] + (aimTarget[2] - vm[2]) * aimOff);
    const yawDelta = player.yaw - player.prevYaw; player.prevYaw = player.yaw;
    player.lookVelY = player.lookVelY * 0.85 + yawDelta * 0.15;
    const kickZ = player.weaponKick * 0.09; const kickRotX = player.weaponKick * 0.18; const reloadDrop = player.reloadKick * 0.15;
    const target = new THREE.Vector3(basePos.x, basePos.y - reloadDrop, basePos.z + kickZ);
    weaponGroup.position.lerp(target, Math.min(1, dt * 14));
    weaponGroup.position.x += Math.sin(player.bob * 0.5) * 0.008 - player.lookVelY * 1.2;
    weaponGroup.position.y += Math.abs(Math.cos(player.bob * 0.5)) * 0.006;
    weaponGroup.rotation.x = -kickRotX + player.reloadKick * 0.3;
    if (player.inspecting > 0) weaponGroup.rotation.y = Math.sin(player.inspecting * 6) * 0.5;
    else weaponGroup.rotation.y = (vm[1] || 0) - player.lookVelY * 6;
    weaponGroup.rotation.z = Math.sin(player.bob * 0.5) * 0.01;
    if (keys['KeyR']) { keys['KeyR'] = false; doReload(); }
    if (keys['KeyF']) { keys['KeyF'] = false; player.inspecting = 1.5; }
    if (shooting && locked && player.alive && (GAME.state === 'LIVE' || GAME.state === 'BUY')) { if (w && w.auto) fireWeapon(); else if (!player._shotHeld) { fireWeapon(); player._shotHeld = true; } }
    if (!shooting) player._shotHeld = false;
    if (keys['KeyE'] && GAME.state === 'LIVE' && !GAME.bombPlanted && (GAME.mode === 'defusal' || GAME.mode === 'wingman') && player.pos.distanceTo(GAME.bombSite) < 2.5) {
      player.isPlanting = true; player.plantProgress += dt;
      const bar = getEl('planting-bar'); bar.style.display = 'block';
      getEl('planting-fill').style.width = Math.min(100, (player.plantProgress / 3) * 100) + '%';
      if (player.plantProgress >= 3) { GAME.bombPlanted = true; GAME.bombTimer = 40; bombMesh.visible = true; bombMesh.position.copy(player.pos); bombMesh.position.y = 0.075; A.sndPlant(); getEl('bomb-status').style.display = 'block'; getEl('bomb-status').textContent = 'BOMB PLANTED'; bar.style.display = 'none'; player.isPlanting = false; player.plantProgress = 0; GAME.money += 300; }
    } else { if (player.isPlanting) { player.isPlanting = false; player.plantProgress = 0; getEl('planting-bar').style.display = 'none'; } }
  }
  function damagePlayer(dmg, attackerPos) {
    if (!player.alive) return;
    if (player.armor > 0) { const armorDmg = Math.min(player.armor, dmg * 0.5); player.armor -= armorDmg; dmg -= armorDmg * 0.5; }
    player.health -= dmg; player.lastDamageTime = performance.now() / 1000;
    updateHealthHUD(); flashDamage(); A.sndHurt(); player.shake = Math.min(1.5, player.shake + 0.8);
    if (attackerPos) showDamageFrom(attackerPos);
    if (player.health <= 0) {
      player.health = 0; player.alive = false; updateHealthHUD(); document.exitPointerLock();
      if (GAME.mode === 'dm' || GAME.mode === 'armsrace') { Timers.add(() => { player.alive = true; player.health = player.maxHealth; player.armor = 0; player.pos.set((Math.random() - 0.5) * 30, 0.2, (Math.random() - 0.5) * 30); resolveCollision(player.pos, player.radius, player.height); renderer.domElement.requestPointerLock(); }, 1500); return; }
      getEl('death-msg').textContent = GAME.bombPlanted ? 'BOMB WAS DEFUSED' : 'MISSION FAILED';
      getEl('final-score').textContent = `SCORE: ${GAME.score} · KILLS: ${GAME.kills} · LVL ${GAME.level}`;
      getEl('death-screen').style.display = 'flex';
      saveProfile();
    }
  }

  /* ============================================================
     РАУНДЫ
     ============================================================ */
  function startRound() {
    Timers.clearAll();
    GAME.round++;
    GAME.state = 'BUY'; GAME.timer = GAME.mode === 'survival' ? 10 : 15;
    GAME.bombPlanted = false; GAME.bombTimer = 0; bombMesh.visible = false; GAME.defuseProgress = 0;
    if (GAME.mode === 'survival') GAME.wave = 1;
    player.health = player.maxHealth; player.armor = 0; player.alive = true;
    player.ammoByWeapon = {};
    player.sprayIdx = 0; player.spraying = 0;
    const spawns = player.team === 'T' ? SPAWNS_T : SPAWNS_CT;
    if (spawns.length) { const sp = spawns[Math.floor(Math.random() * spawns.length)]; const startPos = new THREE.Vector3(sp[0], 0.2, sp[2]); resolveCollision(startPos, player.radius, player.height); player.pos.copy(startPos); }
    player.vel.set(0, 0, 0); player.yaw = Math.PI; player.pitch = 0;
    if (!player.inventory.primary) player.inventory.primary = 'ak47';
    player.inventory.grenades = { grenade: 0, flash: 0, smoke: 0, molotov: 0, decoy: 0 };
    player.inventory.secondary = 'glock';
    if (GAME.mode === 'armsrace') { GAME.armsRaceIdx = 0; player.inventory.primary = 'glock'; }
    equipSlot(2);
    for (const e of enemies) scene.remove(e.model);
    enemies.length = 0;
    getEl('death-screen').style.display = 'none';
    getEl('bomb-status').style.display = 'none';
    getEl('round-timer').textContent = '00:15';
    getEl('round-timer').style.color = '#00ffc8';
    updateHUD(); updateSlotHUD();
    renderer.domElement.requestPointerLock();
  }
  function startLive() {
    GAME.state = 'LIVE';
    const mode = GAME_MODES[GAME.mode];
    GAME.timer = mode.waves ? 0 : 115;
    if (GAME.mode === 'survival') spawnWave();
    else {
      for (let i = 0; i < mode.botsPerRound; i++) {
        const keys = Object.keys(ENEMY_TYPES).filter(k => !ENEMY_TYPES[k].boss);
        spawnEnemy(null, keys[i % keys.length]);
      }
    }
    getEl('wave-info').style.display = GAME.mode === 'survival' ? 'block' : 'none';
  }
  function spawnWave() {
    const count = 2 + GAME.wave;
    const types = ['grunt'];
    if (GAME.wave > 2) types.push('rifleman');
    if (GAME.wave > 4) types.push('shotgunner');
    if (GAME.wave > 6) types.push('sniper');
    for (let i = 0; i < count; i++) spawnEnemy(null, types[Math.floor(Math.random() * types.length)]);
    if (GAME.wave % 5 === 0) spawnEnemy(null, 'boss');
    getEl('wave-num').textContent = GAME.wave;
    GAME.wave++;
  }
  function endRound(win) {
    GAME.state = 'END'; GAME.timer = 5;
    if (win) { GAME.money = Math.min(16000, GAME.money + 3250); GAME.scoreT += player.team === 'T' ? 1 : 0; GAME.scoreCT += player.team === 'CT' ? 1 : 0; addXP(PROGRESSION.xpPerRoundWin); updateQuests('wins', 1); getEl('round-timer').textContent = 'YOU WIN'; }
    else { GAME.money = Math.min(16000, GAME.money + 1400); addXP(PROGRESSION.xpPerRoundLoss); getEl('round-timer').textContent = 'YOU LOSE'; }
    getEl('round-timer').style.color = win ? '#00ffc8' : '#ff2266';
    updateHUD();
    Timers.add(startRound, 5000);
  }
  function applyMode(modeKey) {
    GAME.mode = modeKey;
    const m = GAME_MODES[modeKey];
    getEl('mode-badge').textContent = m.modeBadge;
    getEl('mode-badge').className = 'mode ' + modeKey;
  }

  /* ============================================================
     МАГАЗИН
     ============================================================ */
  const buyMenuEl = getEl('buy-menu');
  const buyTabsEl = getEl('buy-tabs');
  const buyItemsEl = getEl('buy-items');
  let currentBuyCat = 'pistol';
  const BUY_CATEGORIES = [{ id: 'pistol', name: 'ПИСТОЛЕТЫ' }, { id: 'smg', name: 'ПП' }, { id: 'rifle', name: 'ВИНТОВКИ' }, { id: 'sniper', name: 'СНАЙПЕР' }, { id: 'shotgun', name: 'ДРОБОВИКИ' }, { id: 'lmg', name: 'ПУЛЕМЁТЫ' }, { id: 'nade', name: 'ГРАНАТЫ' }, { id: 'gear', name: 'ЭКИП' }];
  const BUY_ITEMS = {};
  WEAPON_ORDER.forEach(id => {
    const w = WEAPONS[id]; if (w.cat === 'melee') return;
    const cat = w.cat === 'nade' ? 'nade' : w.cat === 'pistol' ? 'pistol' : w.cat === 'smg' ? 'smg' : w.cat === 'rifle' ? 'rifle' : w.cat === 'sniper' ? 'sniper' : w.cat === 'shotgun' ? 'shotgun' : 'lmg';
    if (!BUY_ITEMS[cat]) BUY_ITEMS[cat] = [];
    BUY_ITEMS[cat].push({ id, name: w.name, price: w.price, desc: w.cat.toUpperCase(), type: w.cat });
  });
  BUY_ITEMS.gear = [{ id: 'armor', name: 'KEVLAR + HELMET', price: 1000, desc: 'Поглощает 50% урона', type: 'armor' }];
  function renderBuyTabs() { buyTabsEl.innerHTML = ''; BUY_CATEGORIES.forEach(cat => { if (!BUY_ITEMS[cat.id]) return; const e = document.createElement('div'); e.className = 'buy-tab' + (cat.id === currentBuyCat ? ' active' : ''); e.textContent = cat.name; e.onclick = () => { currentBuyCat = cat.id; renderBuyTabs(); renderBuyItems(); }; buyTabsEl.appendChild(e); }); }
  function isItemOwned(item) {
    if (item.type === 'armor') return player.armor >= 100;
    if (WEAPONS[item.id]) {
      const w = WEAPONS[item.id];
      if (w.slot === 1) return player.inventory.primary === item.id;
      if (w.slot === 2) return player.inventory.secondary === item.id;
      if (w.cat === 'nade') return false;
    }
    return false;
  }
  function renderBuyItems() { buyItemsEl.innerHTML = ''; const items = BUY_ITEMS[currentBuyCat] || []; items.forEach(item => { const e = document.createElement('div'); const owned = isItemOwned(item); e.className = 'buy-item' + (GAME.money < item.price || owned ? ' disabled' : ''); e.innerHTML = `<div class="name">${item.name}</div><div class="desc">${item.desc}</div><div class="price">$${item.price}</div>${owned ? '<div class="owned">В РУКАХ</div>' : ''}`; if (GAME.money >= item.price && !owned) e.onclick = () => buyItem(item); buyItemsEl.appendChild(e); }); }
  function buyItem(item) {
    GAME.money -= item.price;
    if (item.type === 'armor') { player.armor = 100; player.helmet = true; }
    else if (WEAPONS[item.id]) {
      const w = WEAPONS[item.id];
      if (w.cat === 'nade') { player.inventory.grenades[item.id] = (player.inventory.grenades[item.id] || 0) + 1; player.currentNade = item.id; equipSlot(4); }
      else if (w.slot === 1) { player.inventory.primary = item.id; equipSlot(1); }
      else if (w.slot === 2) { player.inventory.secondary = item.id; equipSlot(2); }
    }
    A.sndBuy(); getEl('buy-money').textContent = `$${GAME.money}`;
    updateHUD(); updateSlotHUD(); updateAmmoHUD(); renderBuyItems();
  }
  function openBuyMenu() { if (GAME.state !== 'BUY' && GAME.state !== 'LIVE') return; buyMenuEl.style.display = 'flex'; document.exitPointerLock(); getEl('buy-money').textContent = `$${GAME.money}`; if (!BUY_ITEMS[currentBuyCat]) currentBuyCat = 'pistol'; renderBuyTabs(); renderBuyItems(); }
  function closeBuyMenu() { buyMenuEl.style.display = 'none'; renderer.domElement.requestPointerLock(); }
  getEl('buy-close').addEventListener('click', (e) => { e.stopPropagation(); closeBuyMenu(); });

  /* ============================================================
     ВВОД
     ============================================================ */
  const pauseScreen = getEl('pause-screen');
  const lobbyEl = getEl('lobby');
  const deathScreen = getEl('death-screen');
  window.addEventListener('keydown', (e) => {
    if (GAME.state === 'LOBBY') return;
    if (e.ctrlKey || e.metaKey) { const blocked = ['KeyW','KeyA','KeyS','KeyD','KeyR','KeyQ','KeyE','KeyF','KeyC','KeyV','Space']; if (blocked.includes(e.code)) { e.preventDefault(); e.stopPropagation(); if (e.code === 'KeyW') { ctrlWBlocked = true; Timers.add(() => ctrlWBlocked = false, 150); } } }
    else if (e.code === 'Space') { e.preventDefault(); }
  }, true);
  window.addEventListener('keyup', e => { keys[e.code] = false; }, true);
  addEventListener('beforeunload', (e) => { if (!player.alive) return; if (!ctrlWBlocked && !locked) return; e.preventDefault(); e.returnValue = ''; return ''; });
  document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === renderer.domElement; if (locked) { pauseScreen.style.display = 'none'; A.ensureAudio(); } else { shooting = false; if (GAME.state !== 'LOBBY' && player.alive && buyMenuEl.style.display !== 'flex') pauseScreen.style.display = 'flex'; } });
  pauseScreen.addEventListener('click', () => renderer.domElement.requestPointerLock());
  document.addEventListener('mousemove', e => { if (!locked) return; const sens = (player.aim ? ((getCurrentWeaponKey() === 'awp' || getCurrentWeaponKey() === 'ssg08') ? 0.0007 : 0.0015) : 0.0022) * GAME.settings.sens; player.yaw -= e.movementX * sens; player.pitch -= e.movementY * sens; player.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, player.pitch)); });
  document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (!locked && buyMenuEl.style.display !== 'flex') return;
    if (e.code === 'KeyB') { if (buyMenuEl.style.display === 'flex') closeBuyMenu(); else openBuyMenu(); }
    if (e.code === 'Escape' && buyMenuEl.style.display === 'flex') closeBuyMenu();
    if (e.code === 'Digit1') equipSlot(1); if (e.code === 'Digit2') equipSlot(2); if (e.code === 'Digit3') equipSlot(3); if (e.code === 'Digit4') equipSlot(4);
    if (e.code === 'KeyG') { const avail = NADE_ORDER.find(k => player.inventory.grenades[k] > 0); if (avail) { player.currentNade = avail; equipSlot(4); } }
  });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('mousedown', e => {
    if (!locked) { if (GAME.state !== 'LOBBY' && player.alive && buyMenuEl.style.display !== 'flex') renderer.domElement.requestPointerLock(); return; }
    if (e.button === 0) { shooting = true; player._shotHeld = false; }
    if (e.button === 2) player.aim = true;
  });
  document.addEventListener('mouseup', e => { if (e.button === 0) shooting = false; if (e.button === 2) player.aim = false; });

  /* ============================================================
     ЛОББИ
     ============================================================ */
  const previewCanvas = getEl('preview');
  const previewRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias: true, alpha: true });
  previewRenderer.setSize(360, 270, false); previewRenderer.setPixelRatio(Math.min(devicePixelRatio, 2)); previewRenderer.outputEncoding = THREE.sRGBEncoding;
  const previewScene = new THREE.Scene();
  const previewCamera = new THREE.PerspectiveCamera(35, 360 / 270, 0.01, 10);
  previewCamera.position.set(0, 0.15, 1.7); previewCamera.lookAt(0, 0, 0);
  const pL1 = new THREE.DirectionalLight(0xffffff, 2.5); pL1.position.set(2, 3, 4); previewScene.add(pL1);
  const pL2 = new THREE.DirectionalLight(0x00ffc8, 1.2); pL2.position.set(-3, 1, -2); previewScene.add(pL2);
  previewScene.add(new THREE.AmbientLight(0x506070, 0.6));
  const previewWeaponGroup = new THREE.Group(); previewScene.add(previewWeaponGroup);
  let previewIndex = WEAPON_ORDER.indexOf('ak47');
  let selectedMap = 'FOUNDRY';
  let selectedTeam = 'T';
  let selectedMode = 'defusal';

  function showPreviewWeapon(idx) {
    previewIndex = ((idx % WEAPON_ORDER.length) + WEAPON_ORDER.length) % WEAPON_ORDER.length;
    previewWeaponGroup.clear();
    const type = WEAPON_ORDER[previewIndex];
    const m = buildWeaponMesh(type); m.scale.setScalar(2.0); m.position.set(0, -0.05, 0); m.rotation.set(0.1, 0.3, 0); previewWeaponGroup.add(m);
    const w = WEAPONS[type];
    getEl('wname').textContent = w.name;
    getEl('wcat').textContent = w.cat.toUpperCase();
    const setBar = (id, val, max, text) => { getEl(id).style.width = Math.min(100, val / max * 100) + '%'; getEl('v-' + id.split('-')[1]).textContent = text; };
    setBar('s-dmg', w.dmg * (w.pellets || 1), 300, w.pellets ? `${w.dmg}×${w.pellets}` : w.dmg);
    setBar('s-rate', 1 / w.rate, 15, Math.round(60 / w.rate) + 'rpm');
    setBar('s-acc', 0.1 - w.spread, 0.1, Math.round((1 - w.spread / 0.1) * 100) + '%');
    setBar('s-mag', w.mag, 150, w.mag);
  }
  getEl('prev-w').onclick = () => showPreviewWeapon(previewIndex - 1);
  getEl('next-w').onclick = () => showPreviewWeapon(previewIndex + 1);

  function buildMapSelector() {
    const ms = getEl('map-selector'); ms.innerHTML = '';
    Object.keys(MAPS).forEach(mapName => {
      const btn = document.createElement('button');
      btn.className = 'map-btn' + (mapName === selectedMap ? ' active' : '');
      btn.textContent = MAPS[mapName].name;
      btn.onclick = () => { selectedMap = mapName; document.querySelectorAll('.map-btn').forEach(b => b.classList.toggle('active', b.textContent === MAPS[mapName].name)); };
      ms.appendChild(btn);
    });
  }
  function buildModeSelector() {
    const ms = getEl('mode-selector'); ms.innerHTML = '';
    Object.keys(GAME_MODES).forEach(modeKey => {
      const btn = document.createElement('button');
      btn.className = 'mode-btn' + (modeKey === selectedMode ? ' active' : '');
      btn.textContent = GAME_MODES[modeKey].name;
      btn.title = GAME_MODES[modeKey].desc;
      btn.onclick = () => { selectedMode = modeKey; document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.textContent === GAME_MODES[modeKey].name)); };
      ms.appendChild(btn);
    });
  }
  document.querySelectorAll('.team-btn').forEach(btn => { btn.onclick = () => { selectedTeam = btn.dataset.team; document.querySelectorAll('.team-btn').forEach(b => b.classList.toggle('active', b === btn)); }; });

  // LOBBY PANELS
  document.querySelectorAll('.ltab').forEach(tab => {
    tab.onclick = () => {
      const t = tab.dataset.tab;
      document.querySelectorAll('.ltab').forEach(x => x.classList.toggle('active', x === tab));
      if (t === 'inventory') { renderInventory(); getEl('panel-inventory').style.display = 'flex'; }
      else if (t === 'cases') { getEl('panel-cases').style.display = 'flex'; }
      else if (t === 'quests') { renderQuests(); getEl('panel-quests').style.display = 'flex'; }
      else if (t === 'settings') { getEl('panel-settings').style.display = 'flex'; }
    };
  });
  document.querySelectorAll('.panel-close').forEach(b => { b.onclick = () => { getEl('panel-' + b.dataset.close).style.display = 'none'; document.querySelectorAll('.ltab').forEach(x => x.classList.toggle('active', x.dataset.tab === 'play')); }; });

  function renderInventory() {
    const grid = getEl('inv-grid'); grid.innerHTML = '';
    if (!GAME.inventory.length) { grid.innerHTML = '<div class="inv-empty">ИНВЕНТАРЬ ПУСТ — ОТКРОЙ КЕЙС</div>'; return; }
    GAME.inventory.forEach(skin => {
      const el = document.createElement('div');
      el.className = 'inv-item rarity-' + skin.rarity;
      el.innerHTML = `<div class="iname">${WEAPONS[skin.weapon] ? WEAPONS[skin.weapon].name : skin.weapon}</div><div class="irarity">${skin.pattern} · ${skin.rarity.toUpperCase()}</div>`;
      grid.appendChild(el);
    });
  }
  function renderQuests() {
    const list = getEl('quests-list'); list.innerHTML = '';
    GAME.quests.forEach(q => {
      const el = document.createElement('div');
      el.className = 'quest-item' + (q.done ? ' done' : '');
      el.innerHTML = `<div class="quest-text">${q.text} <span style="color:#00ffc8">(${q.progress}/${q.need})</span></div><div class="quest-reward">+${q.reward.xp} XP · +$${q.reward.money}</div>`;
      list.appendChild(el);
    });
  }
  function updateQuests(type, amt) {
    let changed = false;
    GAME.quests.forEach(q => {
      if (q.done) return;
      if (q.type === type) { q.progress += amt; if (q.progress >= q.need) { q.done = true; GAME.money += q.reward.money; addXP(q.reward.xp); addKillFeed(`QUEST COMPLETE: ${q.text}`, 'levelup'); } changed = true; }
    });
    if (changed) saveProfile();
  }

  // CASES
  document.querySelectorAll('.case-card').forEach(card => {
    card.querySelector('.case-open').onclick = () => {
      const caseId = card.dataset.case;
      const c = CASES[caseId];
      if (GAME.money < c.price) { getEl('case-result').textContent = 'НЕДОСТАТОЧНО ДЕНЕГ'; return; }
      GAME.money -= c.price;
      const rarityId = c.rarities[Math.floor(Math.random() * c.rarities.length)];
      const weaponIds = WEAPON_ORDER.filter(id => WEAPONS[id].cat !== 'nade' && WEAPONS[id].cat !== 'melee');
      const weapon = weaponIds[Math.floor(Math.random() * weaponIds.length)];
      const pattern = SKIN_PATTERNS[Math.floor(Math.random() * SKIN_PATTERNS.length)];
      const seed = Math.floor(Math.random() * 999999);
      const color = Math.floor(Math.random() * 0xffffff);
      const skin = { weapon, pattern, rarity: rarityId, seed, color };
      GAME.inventory.push(skin);
      getEl('case-result').innerHTML = `ВЫПАЛО: <b style="color:${SKIN_RARITIES.find(r => r.id === rarityId).color}">${pattern} ${WEAPONS[weapon].name}</b> (${rarityId.toUpperCase()})`;
      A.sndLevelUp();
      updateHUD(); saveProfile();
    };
  });

  // SETTINGS
  getEl('set-sens').oninput = (e) => { GAME.settings.sens = parseFloat(e.target.value); getEl('set-sens-v').textContent = GAME.settings.sens.toFixed(1); saveProfile(); };
  getEl('set-vol').oninput = (e) => { GAME.settings.vol = parseFloat(e.target.value); getEl('set-vol-v').textContent = GAME.settings.vol.toFixed(1); A.setMasterVolume(GAME.settings.vol); saveProfile(); };
  getEl('set-fov').oninput = (e) => { GAME.settings.fov = parseInt(e.target.value); getEl('set-fov-v').textContent = GAME.settings.fov; saveProfile(); };

  /* ============================================================
     ЗАГРУЗКА КАРТЫ
     ============================================================ */
  function loadMap(mapName) {
    for (const o of worldObjects) scene.remove(o);
    for (const o of collidables) scene.remove(o);
    for (const o of decals) scene.remove(o);
    for (const l of mapLights) scene.remove(l);
    for (const e of enemies) scene.remove(e.model);
    for (const d of dustParticles) scene.remove(d);
    dustParticles.length = 0; enemies.length = 0;
    worldObjects.length = 0; collidables.length = 0; decals.length = 0; mapLights.length = 0;
    const m = MAPS[mapName];
    GAME.currentMap = mapName; GAME.bombSite = new THREE.Vector3(...m.bombSite); bombSitePos = new THREE.Vector3(...m.bombSite);
    SPAWNS_T = m.spawnsT; SPAWNS_CT = m.spawnsCT;
    scene.fog = new THREE.Fog(m.fog, m.size * 0.8, m.size * 2.5);
    sun.color.setHex(m.sunColor); sun.intensity = m.sunIntensity;
    skyMat.uniforms.bottomColor.value.setHex(m.fog); skyMat.uniforms.topColor.value.setHex(m.bg);
    createBombRing(); m.build(); currentMapData = m;
    const dustGeo = new THREE.BufferGeometry(); const dustCount = 300; const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) { dustPos[i * 3] = (Math.random() - 0.5) * m.size; dustPos[i * 3 + 1] = Math.random() * 8; dustPos[i * 3 + 2] = (Math.random() - 0.5) * m.size; }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x88ddff, size: 0.08, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    const dust = new THREE.Points(dustGeo, dustMat); scene.add(dust); dustParticles.push(dust);
  }

  /* ============================================================
     DEPLOY
     ============================================================ */
  getEl('deploy').onclick = () => {
    A.ensureAudio();
    player.team = selectedTeam; GAME.playerTeam = selectedTeam;
    applyMode(selectedMode);
    GAME.state = 'BUY'; GAME.timer = 15; GAME.round = 1; GAME.money = 800; GAME.score = 0; GAME.kills = 0; GAME.headshots = 0; GAME.scoreT = 0; GAME.scoreCT = 0;
    lobbyEl.style.display = 'none';
    getEl('hud').style.display = 'block';
    getEl('reticle-canvas').style.display = 'block';
    loadMap(selectedMap);
    const selectedWeaponId = WEAPON_ORDER[previewIndex];
    const isPrimary = WEAPONS[selectedWeaponId] && WEAPONS[selectedWeaponId].slot === 1;
    player.inventory.primary = isPrimary ? selectedWeaponId : 'ak47';
    player.inventory.secondary = 'glock';
    player.inventory.grenades = { grenade: 0, flash: 0, smoke: 0, molotov: 0, decoy: 0 };
    player.health = player.maxHealth; player.alive = true;
    const spawns = player.team === 'T' ? SPAWNS_T : SPAWNS_CT;
    if (spawns.length) { const startPos = new THREE.Vector3(spawns[0][0], 0.2, spawns[0][2]); resolveCollision(startPos, player.radius, player.height); player.pos.copy(startPos); }
    equipSlot(2);
    const slotsContainer = getEl('weapon-slots');
    slotsContainer.innerHTML = '';
    [{ s: 1, label: 'PRI' }, { s: 2, label: 'SEC' }, { s: 3, label: 'KNF' }, { s: 4, label: 'NADE' }].forEach(sl => {
      const el = document.createElement('div'); el.className = 'slot'; el.innerHTML = `<div class="key">${sl.s}</div><div>${sl.label}</div>`;
      slotsContainer.appendChild(el); WEAPON_SLOTS[sl.s] = { el };
    });
    updateHUD(); updateSlotHUD(); updateAmmoHUD();
    renderer.domElement.requestPointerLock();
    document.documentElement.requestFullscreen?.().catch(() => {});
  };
  getEl('retry').onclick = () => { deathScreen.style.display = 'none'; startRound(); };
  getEl('main-menu').onclick = () => {
    GAME.state = 'LOBBY'; player.alive = true; player.health = player.maxHealth; player.armor = 0;
    for (const o of worldObjects) scene.remove(o);
    for (const o of collidables) scene.remove(o);
    for (const l of mapLights) scene.remove(l);
    for (const e of enemies) scene.remove(e.model);
    for (const d of dustParticles) scene.remove(d);
    dustParticles.length = 0; enemies.length = 0;
    worldObjects.length = 0; collidables.length = 0; mapLights.length = 0;
    Timers.clearAll();
    deathScreen.style.display = 'none';
    getEl('hud').style.display = 'none';
    getEl('reticle-canvas').style.display = 'none';
    pauseScreen.style.display = 'none';
    getEl('bomb-status').style.display = 'none';
    lobbyEl.style.display = 'flex';
    updateProfileMini();
    document.exitPointerLock();
  };

  /* ============================================================
     ЦИКЛ
     ============================================================ */
  let last = performance.now();
  let skyTime = 0;
  function loop() {
    requestAnimationFrame(loop);
    updateFPS(performance.now());
    if (GAME.state === 'LOBBY') { previewWeaponGroup.rotation.y += 0.008; previewRenderer.render(previewScene, previewCamera); return; }
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; skyTime += dt;
    skyMat.uniforms.time.value = skyTime;
    if (player.flashed > 0) player.flashed = Math.max(0, player.flashed - dt);
    if (GAME.state !== 'END' && locked) {
      if (GAME.timer > 0) {
        GAME.timer -= dt;
        const mins = Math.floor(GAME.timer / 60); const secs = Math.floor(GAME.timer % 60);
        getEl('round-timer').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (GAME.state === 'BUY' && GAME.timer <= 0) startLive();
        if (GAME.state === 'LIVE' && GAME.timer <= 0 && !GAME.bombPlanted) endRound(false);
      }
      if (GAME.bombPlanted && GAME.state === 'LIVE') {
        GAME.bombTimer -= dt;
        getEl('bomb-status').textContent = `BOMB: ${Math.ceil(GAME.bombTimer)}s`;
        if (GAME.bombTimer <= 0) { A.sndExplosion(); bombMesh.visible = false; endRound(true); if (player.pos.distanceTo(GAME.bombSite) < 10) damagePlayer(200, null); }
      }
      if (GAME.mode === 'survival' && GAME.state === 'LIVE' && enemies.filter(e => e.alive).length === 0) {
        if (!GAME.waveTimer) GAME.waveTimer = 5;
        GAME.waveTimer -= dt;
        if (GAME.waveTimer <= 0) { GAME.waveTimer = 0; spawnWave(); GAME.money += 500; updateHUD(); }
      }
      updatePlayer(dt);
      for (const e of enemies) updateEnemy(e, dt);
      updateGrenades(dt);
    }
    for (let i = tracers.length - 1; i >= 0; i--) { const t = tracers[i]; t.life -= dt; t.mesh.material.opacity = Math.max(0, t.life / t.maxLife); if (t.life <= 0) { scene.remove(t.mesh); tracers.splice(i, 1); } }
    for (let i = impacts.length - 1; i >= 0; i--) {
      const im = impacts[i]; im.life -= dt;
      const arr = im.mesh.geometry.attributes.position.array;
      for (let j = 0; j < im.vel.length; j++) { arr[j * 3] += im.vel[j].x * dt; arr[j * 3 + 1] += im.vel[j].y * dt; arr[j * 3 + 2] += im.vel[j].z * dt; im.vel[j].y -= 9.8 * dt; }
      im.mesh.geometry.attributes.position.needsUpdate = true;
      im.mesh.material.opacity = im.life / im.max;
      if (im.life <= 0) { scene.remove(im.mesh); impacts.splice(i, 1); }
    }
    for (let i = casings.length - 1; i >= 0; i--) {
      const c = casings[i]; c.life -= dt;
      c.mesh.position.addScaledVector(c.vel, dt); c.vel.y -= 12 * dt;
      c.mesh.rotation.x += c.rot.x * dt; c.mesh.rotation.y += c.rot.y * dt; c.mesh.rotation.z += c.rot.z * dt;
      if (c.mesh.position.y < 0.01) { c.mesh.position.y = 0.01; c.vel.multiplyScalar(0.3); c.vel.y = 0; }
      if (c.life <= 0) { scene.remove(c.mesh); casings.splice(i, 1); }
    }
    for (let i = dmgDirs.length - 1; i >= 0; i--) { const d = dmgDirs[i]; d.life -= dt; d.el.style.opacity = Math.max(0, d.life / 1.2); if (d.life <= 0) { d.el.remove(); dmgDirs.splice(i, 1); } }
    muzzleLight.intensity *= 0.7;
    if (muzzleLight.intensity < 0.1) { muzzleLight.intensity = 0; flashSprite.visible = false; }
    if (hitTimer > 0) { hitTimer -= dt; if (hitTimer <= 0) getEl('hit-marker').style.opacity = '0'; }
    sun.position.set(player.pos.x + 40, 60, player.pos.z + 20);
    sun.target.position.set(player.pos.x, 0, player.pos.z);
    A.updateListener(camera);
    drawReticle();
    drawRadar();
    renderer.render(scene, camera);
  }

  /* ============================================================
     СТАРТ
     ============================================================ */
  loadProfile();
  getEl('loading').style.display = 'none';
  lobbyEl.style.display = 'flex';
  getEl('hud').style.display = 'none';
  getEl('reticle-canvas').style.display = 'none';
  showPreviewWeapon(previewIndex);
  buildMapSelector();
  buildModeSelector();
  updateProfileMini();
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); resizeReticle(); });
  loop();
})();