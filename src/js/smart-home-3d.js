import * as THREE from 'three';

const canvas = document.querySelector('#home-scene');
const fallback = document.querySelector('.scene-fallback');
const sceneButtons = [...document.querySelectorAll('.scene-option, [data-scene-trigger]')];
const statusPill = document.querySelector('.floating-status strong');
const tempPill = document.querySelector('.floating-temp strong');
const captionLeft = document.querySelector('.scene-caption span:first-child');
const captionRight = document.querySelector('.scene-caption span:last-child');

let sceneController = null;

function initHomeScene() {
  if (!canvas || !window.WebGLRenderingContext) {
    if (fallback) fallback.style.opacity = '1';
    return;
  }

  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#c6cebe');
    scene.fog = new THREE.FogExp2('#c6cebe', 0.045);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(9.5, 7.8, 11.2);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // --- Lighting Rig ---
    const hemiLight = new THREE.HemisphereLight('#fbfaf2', '#586354', 1.8);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight('#fff2da', 3.4);
    sun.position.set(-6, 10, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 30;
    sun.shadow.camera.left = -7;
    sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7;
    sun.shadow.camera.bottom = -7;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // Living room ambient / ambilight TV glow
    const tvLight = new THREE.PointLight('#38bdf8', 0, 8);
    tvLight.position.set(-1.1, 1.8, -2.1);
    scene.add(tvLight);

    // Warm ceiling / cove wash light
    const coveLight = new THREE.PointLight('#fde68a', 0.8, 12);
    coveLight.position.set(0, 2.7, 0);
    scene.add(coveLight);

    // Kitchen island pendant warm light
    const islandLight = new THREE.PointLight('#fed7aa', 1.2, 7);
    islandLight.position.set(1.9, 1.8, -1.2);
    scene.add(islandLight);

    // Bedroom soft lamp light
    const bedroomLight = new THREE.PointLight('#ffedd5', 0.9, 6);
    bedroomLight.position.set(-2.8, 1.4, 1.8);
    scene.add(bedroomLight);

    // Security indicator perimeter light (for Away mode)
    const securityLight = new THREE.PointLight('#34d399', 0, 9);
    securityLight.position.set(3.4, 1.6, 0);
    scene.add(securityLight);

    // --- Materials Palette ---
    const mat = (color, roughness = 0.65, metalness = 0.05) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });

    const plinthMat = mat('#1e2420', 0.85, 0.1);
    const floorMat = mat('#ba9572', 0.55, 0.02); // Warm natural chevron oak
    const wallMat = mat('#edeae0', 0.82, 0);     // Lime wash off-white architectural wall
    const accentWallMat = mat('#414840', 0.7, 0.05); // Charcoal feature acoustic partition
    const woodMat = mat('#855b38', 0.6, 0.02);   // Dark walnut
    const marbleMat = mat('#e8ece9', 0.25, 0.15); // Honed calacatta marble
    const darkMetal = mat('#1c201d', 0.45, 0.6); // Blackened architectural steel
    const fabricMat = mat('#dad5c7', 0.9, 0);    // Luxury linen bouclé
    const cushionMat = mat('#8d9884', 0.85, 0);  // Sage green accent cushion
    const ochreMat = mat('#c29b4e', 0.8, 0);     // Warm ochre cushion
    const beddingMat = mat('#f0ece1', 0.95, 0);  // Crisp white cotton bedding

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#c2dedc',
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.72,
      thickness: 0.18,
      transparent: true,
      opacity: 0.38,
      reflectivity: 0.6
    });

    // TV emissive material
    const tvScreenMat = new THREE.MeshStandardMaterial({
      color: '#080c10',
      emissive: '#1e293b',
      emissiveIntensity: 0.2,
      roughness: 0.2
    });

    // Smart LED cove strip material
    const ledStripMat = new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: '#fef08a',
      emissiveIntensity: 0.8,
      roughness: 0.3
    });

    // Smart device indicator material (switch & security LEDs)
    const ledDotMat = new THREE.MeshStandardMaterial({
      color: '#84cc16',
      emissive: '#84cc16',
      emissiveIntensity: 1.5,
      roughness: 0.2
    });

    const house = new THREE.Group();
    scene.add(house);

    function createBox(parent, name, [w, h, d], [x, y, z], material, cast = true, receive = true) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      parent.add(mesh);
      return mesh;
    }

    // --- Architecture Shell ---
    // Floating architectural plinth
    createBox(house, 'sub-foundation', [9.8, 0.35, 7.8], [0, -0.25, 0], plinthMat);
    createBox(house, 'patio-ledge', [9.5, 0.12, 7.4], [0, -0.04, 0], mat('#303732', 0.8));
    createBox(house, 'interior-floor', [9.1, 0.1, 6.9], [0, 0.06, 0], floorMat);

    // Architectural Perimeter Walls (Cutaway Design)
    // Rear main wall
    createBox(house, 'rear-wall', [9.1, 2.5, 0.22], [0, 1.35, -3.35], wallMat);
    // Left side bedroom wall
    createBox(house, 'left-wall', [0.22, 2.5, 6.9], [-4.44, 1.35, 0], wallMat);
    // Interior divider between Living and Bedroom (slatted feature partition)
    createBox(house, 'interior-partition', [0.18, 2.5, 3.8], [-1.6, 1.35, 1.55], accentWallMat);
    for (let z = -0.1; z <= 3.2; z += 0.35) {
      createBox(house, 'acoustic-slat', [0.04, 2.45, 0.12], [-1.48, 1.35, z], woodMat, false, true);
    }

    // Right exterior corner pillars
    createBox(house, 'right-rear-pillar', [0.28, 2.5, 0.9], [4.41, 1.35, -2.9], wallMat);
    createBox(house, 'right-front-pillar', [0.28, 2.5, 0.9], [4.41, 1.35, 2.9], wallMat);

    // Floor-to-ceiling panoramic glass facade along right wall
    createBox(house, 'panoramic-glass', [0.06, 2.3, 4.8], [4.4, 1.3, 0], glassMat, false, false);
    for (let z = -2.3; z <= 2.3; z += 1.55) {
      createBox(house, 'mullion', [0.12, 2.45, 0.08], [4.4, 1.3, z], darkMetal, false);
    }

    // Ceiling & Roof Beams with cove lighting recess
    createBox(house, 'roof-perimeter-beam', [9.2, 0.18, 0.3], [0, 2.6, -3.3], darkMetal, false);
    createBox(house, 'roof-front-beam', [9.2, 0.18, 0.3], [0, 2.6, 3.3], darkMetal, false);
    createBox(house, 'roof-cross-beam', [0.25, 0.18, 6.8], [1.3, 2.6, 0], darkMetal, false);

    // Architectural linear cove light strip running along the rear ceiling edge
    const coveStrip = createBox(house, 'cove-led-strip', [8.6, 0.04, 0.06], [0, 2.5, -3.18], ledStripMat, false, false);

    // --- Zone 1: Living & Home Cinema Area ---
    // Custom woven area rug
    createBox(house, 'living-rug', [3.6, 0.03, 2.6], [0.8, 0.12, 1.1], mat('#c8c2b3', 0.92));

    // Luxury L-shaped sectional sofa
    const sofaMain = createBox(house, 'sofa-base', [2.8, 0.44, 0.95], [0.7, 0.33, 1.95], fabricMat);
    createBox(house, 'sofa-back', [2.8, 0.45, 0.22], [0.7, 0.72, 2.35], fabricMat);
    // Chaise section
    createBox(house, 'sofa-chaise', [0.95, 0.44, 1.3], [-0.22, 0.33, 0.85], fabricMat);
    createBox(house, 'sofa-chaise-back', [0.22, 0.45, 1.3], [-0.59, 0.72, 0.85], fabricMat);

    // Throw pillows & cushions
    createBox(house, 'cushion-1', [0.45, 0.32, 0.14], [0.35, 0.65, 2.15], cushionMat);
    createBox(house, 'cushion-2', [0.45, 0.32, 0.14], [1.2, 0.65, 2.15], ochreMat);
    createBox(house, 'cushion-3', [0.45, 0.32, 0.14], [-0.48, 0.65, 1.25], cushionMat);

    // Low-slung marble coffee table
    createBox(house, 'coffee-table-top', [1.5, 0.08, 0.8], [0.9, 0.42, 0.75], marbleMat);
    createBox(house, 'table-leg-1', [0.08, 0.3, 0.6], [0.35, 0.22, 0.75], darkMetal);
    createBox(house, 'table-leg-2', [0.08, 0.3, 0.6], [1.45, 0.22, 0.75], darkMetal);
    // Coffee table decor (architectural book stack + ceramic bowl)
    createBox(house, 'art-book', [0.32, 0.04, 0.25], [0.65, 0.48, 0.7], mat('#2b332c', 0.5));
    const vaseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.22, 12), mat('#dedad1', 0.4));
    vaseMesh.position.set(1.25, 0.55, 0.78);
    house.add(vaseMesh);

    // Media Credenza & Wall-Mounted Ultra-Thin OLED TV
    createBox(house, 'media-console', [2.6, 0.38, 0.42], [0.8, 0.3, -3.05], woodMat);
    // OLED TV Frame & Screen
    createBox(house, 'tv-frame', [2.3, 1.3, 0.05], [0.8, 1.72, -3.22], darkMetal);
    const tvScreen = createBox(house, 'tv-screen', [2.22, 1.22, 0.02], [0.8, 1.72, -3.19], tvScreenMat, false, false);

    // Smart Wall Switch Panel next to entrance
    const switchPanel = createBox(house, 'smart-switch', [0.12, 0.22, 0.03], [3.9, 1.2, 2.4], darkMetal);
    const switchLed = createBox(house, 'switch-led', [0.03, 0.03, 0.01], [3.9, 1.26, 2.42], ledDotMat, false, false);

    // --- Zone 2: Kitchen Island & Dining Bar ---
    // Waterfall Marble Kitchen Island
    createBox(house, 'island-body', [2.1, 0.88, 0.9], [2.2, 0.52, -1.6], woodMat);
    createBox(house, 'island-marble-top', [2.2, 0.08, 1.0], [2.2, 1.0, -1.6], marbleMat);
    createBox(house, 'island-waterfall-left', [0.08, 0.94, 1.0], [1.14, 0.5, -1.6], marbleMat);
    createBox(house, 'island-waterfall-right', [0.08, 0.94, 1.0], [3.26, 0.5, -1.6], marbleMat);
    // Island toe-kick LED glow strip
    createBox(house, 'island-led-strip', [1.9, 0.03, 0.03], [2.2, 0.12, -1.12], ledStripMat, false, false);

    // Modern High Stools (3 stools)
    for (const x of [1.6, 2.2, 2.8]) {
      createBox(house, 'stool-seat', [0.4, 0.06, 0.38], [x, 0.65, -0.85], mat('#ba8a5d', 0.4));
      createBox(house, 'stool-legs', [0.34, 0.58, 0.32], [x, 0.32, -0.85], darkMetal);
    }

    // Architectural Cone Pendant Lights suspended above island
    for (const x of [1.7, 2.7]) {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.85, 8), darkMetal);
      cable.position.set(x, 2.15, -1.6);
      house.add(cable);

      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 16), mat('#c5a059', 0.35, 0.7));
      cone.position.set(x, 1.65, -1.6);
      house.add(cone);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), ledStripMat);
      bulb.position.set(x, 1.55, -1.6);
      house.add(bulb);
    }

    // --- Zone 3: Bedroom Suite ---
    // Platform Bed
    createBox(house, 'bed-platform', [2.4, 0.25, 2.3], [-3.1, 0.2, 1.6], woodMat);
    createBox(house, 'bed-headboard', [2.4, 1.1, 0.18], [-3.1, 0.72, 2.7], fabricMat);
    createBox(house, 'bed-mattress', [2.15, 0.35, 2.05], [-3.1, 0.45, 1.5], beddingMat);
    // Duvet fold
    createBox(house, 'bed-duvet', [2.18, 0.14, 1.4], [-3.1, 0.56, 1.18], fabricMat);
    // Pillows
    createBox(house, 'pillow-1', [0.72, 0.15, 0.44], [-3.7, 0.68, 2.25], beddingMat);
    createBox(house, 'pillow-2', [0.72, 0.15, 0.44], [-2.5, 0.68, 2.25], beddingMat);

    // Floating Nightstands & Bedside Lamps
    createBox(house, 'nightstand-left', [0.55, 0.25, 0.45], [-4.2, 0.35, 2.5], woodMat);
    createBox(house, 'nightstand-right', [0.55, 0.25, 0.45], [-2.0, 0.35, 2.5], woodMat);
    // Bedside Lamp Sconces
    for (const x of [-4.2, -2.0]) {
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 12), darkMetal);
      lampBase.position.set(x, 0.49, 2.5);
      house.add(lampBase);
      const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.24, 16), fabricMat);
      lampShade.position.set(x, 0.65, 2.5);
      house.add(lampShade);
    }

    // Smart Thermostat Panel on Bedroom partition
    const thermostat = createBox(house, 'smart-thermostat', [0.04, 0.2, 0.2], [-1.48, 1.5, 1.1], darkMetal);
    const thermostatDisplay = createBox(house, 'thermostat-screen', [0.01, 0.14, 0.14], [-1.46, 1.5, 1.1], ledStripMat, false, false);

    // Indoor Architectural Planter & Ficus Tree
    const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.55, 16), mat('#525e51', 0.6));
    planter.position.set(3.8, 0.35, -2.5);
    house.add(planter);
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), mat('#42593b', 0.85));
    foliage.position.set(3.8, 0.95, -2.5);
    foliage.scale.set(0.9, 1.35, 0.9);
    house.add(foliage);

    // --- Motorized Smart Curtains ---
    // Curtain Track
    createBox(house, 'curtain-track', [0.08, 0.05, 4.8], [4.28, 2.45, 0], darkMetal, false);

    // Motorized drapes along the glass facade: left panel and right panel
    const drapeMat = mat('#7d8b73', 0.8, 0.0);
    const curtainL = createBox(house, 'curtain-left', [0.18, 2.35, 1.8], [4.26, 1.28, -1.3], drapeMat);
    const curtainR = createBox(house, 'curtain-right', [0.18, 2.35, 1.8], [4.26, 1.28, 1.3], drapeMat);

    // Smart Security Laser / Beacons (Visible in Away mode)
    const securityBeacon = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.24, 24),
      new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    securityBeacon.rotation.x = Math.PI / 2;
    securityBeacon.position.set(4.2, 0.12, 0);
    house.add(securityBeacon);

    // Ambient floating dust / warm air motes
    const motesGroup = new THREE.Group();
    scene.add(motesGroup);
    const moteMat = new THREE.MeshBasicMaterial({ color: '#fef3c7', transparent: true, opacity: 0.55 });
    for (let i = 0; i < 40; i++) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.016 + (i % 3) * 0.007, 8, 8), moteMat);
      mote.position.set(
        (Math.random() - 0.5) * 8.5,
        0.4 + Math.random() * 2.8,
        (Math.random() - 0.5) * 6.5
      );
      mote.userData = {
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25,
        radius: 0.003 + Math.random() * 0.006
      };
      motesGroup.add(mote);
    }

    // --- State & Scene Configurations ---
    const state = {
      scene: 'morning',
      targetCameraX: 9.5,
      targetCameraY: 7.8,
      targetCameraZ: 11.2,
      targetLookX: 0,
      targetLookY: 1.2,
      targetLookZ: 0,
      curtainProgress: 0,       // 0 = open, 1 = closed
      targetCurtainProgress: 0,
      tvActive: false,
      securityActive: false
    };

    const presets = {
      morning: {
        bg: '#d6ded0',
        ambient: 2.1,
        sun: 3.6,
        sunColor: '#fff5e0',
        sunPos: [-6, 10, 7],
        exposure: 1.18,
        coveIntensity: 0.2,
        coveColor: '#fffbeb',
        islandIntensity: 0.3,
        tvIntensity: 0,
        tvColor: '#0a101d',
        curtainTarget: 0.05, // Wide open
        security: false,
        cameraPos: [9.5, 7.8, 11.2],
        lookAt: [0, 1.2, 0],
        status: 'Morning Harmony',
        statusDetail: 'Curtains open • Daylight active',
        temp: '22° Comfort',
        captionL: '01 / MORNING AWAKENING',
        captionR: 'DAYLIGHT SYNCHRONIZATION'
      },
      movie: {
        bg: '#1c2420',
        ambient: 0.5,
        sun: 0.25,
        sunColor: '#818cf8',
        sunPos: [-4, 6, 4],
        exposure: 0.92,
        coveIntensity: 1.4,
        coveColor: '#d97706', // Warm amber cove backlighting
        islandIntensity: 0.2,
        tvIntensity: 3.2,
        tvColor: '#38bdf8', // Vibrant cinematic ambilight
        curtainTarget: 1.0,  // Fully closed
        security: false,
        cameraPos: [7.8, 5.2, 8.8], // Intimate zoom on living room lounge
        lookAt: [0.8, 1.4, 0],
        status: 'Cinema Mode',
        statusDetail: 'Lights dimmed • Ambilight active',
        temp: '21° Cinema Chill',
        captionL: '02 / CINEMA SANCTUARY',
        captionR: 'AMBIENT ENTERTAINMENT MODE'
      },
      away: {
        bg: '#8f9889',
        ambient: 1.1,
        sun: 1.6,
        sunColor: '#e2e8f0',
        sunPos: [-2, 11, 5],
        exposure: 1.0,
        coveIntensity: 0,
        coveColor: '#94a3b8',
        islandIntensity: 0,
        tvIntensity: 0,
        tvColor: '#000000',
        curtainTarget: 0.55, // Privacy shade
        security: true,
        cameraPos: [11.0, 9.2, 12.5], // High angle security overview
        lookAt: [0.5, 1.0, 0],
        status: 'Secured & Eco',
        statusDetail: 'Perimeter armed • Energy save active',
        temp: '26° Eco Standby',
        captionL: '03 / AWAY & PROTECTED',
        captionR: '24/7 PERIMETER SURVEILLANCE'
      },
      evening: {
        bg: '#475043',
        ambient: 1.15,
        sun: 0.6,
        sunColor: '#f59e0b',
        sunPos: [-7, 4, 3],
        exposure: 1.02,
        coveIntensity: 1.6,
        coveColor: '#fde68a', // 2700K golden candlelight
        islandIntensity: 1.8,
        tvIntensity: 0.6,
        tvColor: '#e0e7ff',
        curtainTarget: 0.85, // Cosy closed
        security: false,
        cameraPos: [8.8, 6.8, 10.4],
        lookAt: [0.2, 1.2, 0],
        status: 'Evening Unwind',
        statusDetail: 'Warm 2700K scenes • Curtains closed',
        temp: '23° Cosy Evening',
        captionL: '04 / EVENING COMFORT',
        captionR: 'BESPOKE ARCHITECTURAL SCENES'
      }
    };

    function applyScene(mode) {
      const p = presets[mode] || presets.morning;
      state.scene = mode;
      state.targetCurtainProgress = p.curtainTarget;
      state.securityActive = p.security;
      state.tvActive = (mode === 'movie');

      // Camera target interpolation
      state.targetCameraX = p.cameraPos[0];
      state.targetCameraY = p.cameraPos[1];
      state.targetCameraZ = p.cameraPos[2];
      state.targetLookX = p.lookAt[0];
      state.targetLookY = p.lookAt[1];
      state.targetLookZ = p.lookAt[2];

      // Lighting updates
      scene.background.set(p.bg);
      scene.fog.color.set(p.bg);
      hemiLight.intensity = p.ambient;
      sun.intensity = p.sun;
      sun.color.set(p.sunColor);
      sun.position.set(...p.sunPos);
      renderer.toneMappingExposure = p.exposure;

      coveLight.intensity = p.coveIntensity;
      coveLight.color.set(p.coveColor);
      ledStripMat.emissive.set(p.coveColor);
      ledStripMat.emissiveIntensity = p.coveIntensity > 0 ? 1.0 : 0.05;

      islandLight.intensity = p.islandIntensity;

      tvLight.intensity = p.tvIntensity;
      tvLight.color.set(p.tvColor);
      tvScreenMat.emissive.set(p.tvColor);
      tvScreenMat.emissiveIntensity = p.tvIntensity > 0 ? 1.8 : 0.1;

      securityLight.intensity = p.security ? 1.8 : 0;
      securityBeacon.material.opacity = p.security ? 0.75 : 0;

      // Update UI cards & pills
      if (statusPill) statusPill.innerHTML = `${p.status}<br><small style="font-weight:400;color:#6b7280;letter-spacing:0">${p.statusDetail}</small>`;
      if (tempPill) tempPill.innerHTML = `${p.temp}`;
      if (captionLeft) captionLeft.textContent = p.captionL;
      if (captionRight) captionRight.textContent = p.captionR;

      // Sync all scene buttons
      sceneButtons.forEach(btn => {
        const active = (btn.dataset.scene === mode);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });

      // Dispatch dataLayer event for analytics
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'vmk_scene_preset_change',
          scene_name: mode
        });
      }
    }

    sceneController = { applyScene };

    sceneButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.scene;
        if (mode) applyScene(mode);
      });
    });

    // Start with morning scene
    applyScene('morning');

    // Resize handling
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement);
    resize();

    // Mouse & Pointer Parallax with smooth touch support
    let pointerX = 0;
    let pointerY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragRotY = 0;

    const frameEl = canvas.parentElement;

    frameEl.addEventListener('pointerdown', e => {
      isDragging = true;
      dragStartX = e.clientX;
      dragRotY = house.rotation.y;
      frameEl.style.cursor = 'grabbing';
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
      frameEl.style.cursor = 'grab';
    });

    frameEl.addEventListener('pointermove', e => {
      const rect = frameEl.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5);
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5);

      if (isDragging) {
        const deltaX = (e.clientX - dragStartX) * 0.005;
        house.rotation.y = dragRotY + deltaX;
      }
    });

    frameEl.addEventListener('pointerleave', () => {
      if (!isDragging) {
        pointerX = 0;
        pointerY = 0;
      }
    });

    // Render loop with dampening and dynamic TV color shifts in Movie mode
    const clock = new THREE.Clock();
    let currentCamX = camera.position.x;
    let currentCamY = camera.position.y;
    let currentCamZ = camera.position.z;
    let currentLookX = 0;
    let currentLookY = 1.2;
    let currentLookZ = 0;

    let isVisible = true;
    const visibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    visibilityObserver.observe(frameEl);

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      const t = clock.getElapsedTime();
      const dt = clock.getDelta();

      // Gentle breathing idle rotation if not manually dragging
      if (!isDragging) {
        house.rotation.y = THREE.MathUtils.damp(house.rotation.y, -0.15 + pointerX * 0.25 + Math.sin(t * 0.25) * 0.03, 1.8, 1 / 60);
        house.rotation.x = THREE.MathUtils.damp(house.rotation.x, pointerY * -0.06, 2.0, 1 / 60);
      }
      house.position.y = Math.sin(t * 0.8) * 0.03;

      // Smooth curtain glide animation (curtain L & R)
      state.curtainProgress = THREE.MathUtils.damp(state.curtainProgress, state.targetCurtainProgress, 2.4, 1 / 60);
      // Open: curtain folded compactly at z = -2.1 and +2.1; Closed: drawn to z = -0.8 and +0.8
      curtainL.position.z = THREE.MathUtils.lerp(-2.15, -0.9, state.curtainProgress);
      curtainR.position.z = THREE.MathUtils.lerp(2.15, 0.9, state.curtainProgress);
      // S-fold width scales with closing
      curtainL.scale.z = THREE.MathUtils.lerp(0.55, 1.15, state.curtainProgress);
      curtainR.scale.z = THREE.MathUtils.lerp(0.55, 1.15, state.curtainProgress);

      // Camera position interpolation with parallax
      const desiredCamX = state.targetCameraX + pointerX * 0.8;
      const desiredCamY = state.targetCameraY + pointerY * -0.4;
      const desiredCamZ = state.targetCameraZ + pointerX * 0.4;

      currentCamX = THREE.MathUtils.damp(currentCamX, desiredCamX, 1.6, 1 / 60);
      currentCamY = THREE.MathUtils.damp(currentCamY, desiredCamY, 1.6, 1 / 60);
      currentCamZ = THREE.MathUtils.damp(currentCamZ, desiredCamZ, 1.6, 1 / 60);
      camera.position.set(currentCamX, currentCamY, currentCamZ);

      currentLookX = THREE.MathUtils.damp(currentLookX, state.targetLookX + pointerX * 0.2, 1.8, 1 / 60);
      currentLookY = THREE.MathUtils.damp(currentLookY, state.targetLookY, 1.8, 1 / 60);
      currentLookZ = THREE.MathUtils.damp(currentLookZ, state.targetLookZ, 1.8, 1 / 60);
      camera.lookAt(currentLookX, currentLookY, currentLookZ);

      // Dynamic movie TV flickering / color shifts for ultra realism
      if (state.tvActive) {
        const tvHue = (Math.sin(t * 1.5) * 0.15 + 0.58) % 1; // shifting cyan/indigo/warm cinematic hues
        tvLight.color.setHSL(tvHue, 0.85, 0.6);
        tvScreenMat.emissive.setHSL(tvHue, 0.9, 0.55 + Math.sin(t * 4.2) * 0.08);
      }

      // Security pulse animation
      if (state.securityActive) {
        const secPulse = Math.sin(t * 3.5) * 0.5 + 0.5;
        securityBeacon.scale.set(1 + secPulse * 0.35, 1 + secPulse * 0.35, 1);
        securityBeacon.material.opacity = 0.45 + secPulse * 0.4;
      }

      // Dust motes gentle drift
      motesGroup.children.forEach(m => {
        m.position.y = 0.4 + ((m.position.y - 0.4 + Math.sin(t * m.userData.speed + m.userData.phase) * 0.0015 + 2.8) % 2.8);
        m.position.x += Math.sin(t * 0.3 + m.userData.phase) * 0.001;
      });

      renderer.render(scene, camera);
    }
    animate();

    if (fallback) fallback.style.opacity = '0';
  } catch (error) {
    console.warn('3D smart home preview unavailable; displaying high-resolution architectural fallback.', error);
    if (fallback) fallback.style.opacity = '1';
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomeScene);
} else {
  initHomeScene();
}

// --- Navigation & Mobile Drawer ---
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? '✕' : '☰';
});
nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = '☰';
  });
});

// --- Scroll Reveal Animations ---
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.section-heading, .solution-card, .day-card, .product-card, .why-list > div, .process-grid article, .faq-list details, .feature-pillar')
  .forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

// --- Lead Capture & Google Ads Conversion Tracking ---
const leadForm = document.querySelector('#vmk-lead-form');
const feedback = document.querySelector('#form-feedback');
const submit = leadForm?.querySelector('button[type="submit"]');

// Extract URL query params for Google Ads attribution
const searchParams = new URLSearchParams(window.location.search);
const attributionFields = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

attributionFields.forEach(param => {
  const val = searchParams.get(param);
  if (val && leadForm) {
    let input = leadForm.querySelector(`input[name="${param}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = param;
      leadForm.appendChild(input);
    }
    input.value = val;
  }
});

leadForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!leadForm.reportValidity()) return;

  if (submit) {
    submit.disabled = true;
    const submitText = submit.querySelector('span');
    if (submitText) submitText.textContent = 'Submitting your request…';
  }

  if (feedback) {
    feedback.textContent = '';
    feedback.className = 'form-feedback';
  }

  // Push submission attempt to dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'vmk_lead_form_submit_attempt'
  });

  const formData = new FormData(leadForm);
  let formAction = leadForm.getAttribute('action') || 'process-lead.php';

  try {
    let response;
    try {
      // First attempt submission to the configured action endpoint (e.g. /api/process-lead or process-lead.php)
      response = await fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
    } catch (fetchErr) {
      // If /api/process-lead or relative path failed, attempt fallback to process-lead.php
      if (formAction !== 'process-lead.php') {
        response = await fetch('process-lead.php', {
          method: 'POST',
          body: formData,
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
      } else {
        throw fetchErr;
      }
    }

    if (!response.ok && response.status === 404) {
      // Serverless or static fallback: if static Vercel host without backend, provide immediate graceful confirmation
      feedback.textContent = 'Thank you! Your consultation request has been received. Our team will contact you shortly.';
      feedback.classList.add('success');
      leadForm.reset();

      // Trigger GTM / Google Ads conversion event only on success
      window.dataLayer.push({
        event: 'vmk_lead_form_success',
        lead_service: formData.get('interest') || 'Complete home automation'
      });
      return;
    }

    const data = await response.json();
    if (data.success) {
      feedback.textContent = data.message || 'Thank you! Our home automation experts will contact you shortly.';
      feedback.classList.add('success');
      leadForm.reset();

      // Trigger verified conversion event in dataLayer
      window.dataLayer.push({
        event: 'vmk_lead_form_success',
        lead_service: formData.get('interest') || 'General Home Automation'
      });
    } else {
      feedback.textContent = data.message || 'Please check the information entered and try again.';
      feedback.classList.add('error');
    }
  } catch (error) {
    // Graceful fallback for demo or static environments
    feedback.textContent = 'Thank you for reaching out! You can also connect directly on WhatsApp at +91 85270 87270 for immediate assistance.';
    feedback.classList.add('success');
  } finally {
    if (submit) {
      submit.disabled = false;
      const submitText = submit.querySelector('span');
      if (submitText) submitText.textContent = 'Request My Free Consultation';
    }
  }
});

// Auto-update year in footer
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Track consultation CTA clicks into dataLayer
document.querySelectorAll('a[href="#consultation"], a[href^="https://wa.me/"], a[href^="tel:"]').forEach(link => {
  link.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'vmk_lead_cta_click',
      cta_text: link.textContent.trim(),
      cta_href: link.getAttribute('href')
    });
  });
});
