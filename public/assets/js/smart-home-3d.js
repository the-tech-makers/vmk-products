import * as THREE from 'three';

const canvas = document.querySelector('#home-scene');
const fallback = document.querySelector('.scene-fallback');
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
    scene.background = new THREE.Color('#cdd7c6');
    scene.fog = new THREE.FogExp2('#cdd7c6', 0.045);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(9.2, 7.5, 11.2);
    camera.lookAt(0, 1.1, 0);

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
    renderer.toneMappingExposure = 1.18;

    // --- Lighting Rig ---
    const hemiLight = new THREE.HemisphereLight('#fdfbf7', '#2a3328', 2.2);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight('#fff7ed', 3.8);
    sun.position.set(-6, 11, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 30;
    sun.shadow.camera.left = -7;
    sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7;
    sun.shadow.camera.bottom = -7;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    // Ceiling linear cove light (Warm golden ambient backlight)
    const coveLight = new THREE.PointLight('#fffbeb', 0.3, 14, 1.2);
    coveLight.position.set(0, 2.5, -2.8);
    scene.add(coveLight);

    // Kitchen island pendant illumination
    const islandLight = new THREE.PointLight('#fff7ed', 0.4, 7, 1.5);
    islandLight.position.set(2.2, 2.1, -1.6);
    scene.add(islandLight);

    // OLED TV Dynamic Ambilight (Living Room Cinema)
    const tvLight = new THREE.PointLight('#38bdf8', 0, 9, 1.6);
    tvLight.position.set(0.8, 1.75, -2.4);
    scene.add(tvLight);

    // Security Indicator Light (Away Mode)
    const securityLight = new THREE.PointLight('#10b981', 0, 8, 2.0);
    securityLight.position.set(4.3, 0.4, 0);
    scene.add(securityLight);

    // --- Architectural Materials (PBR) ---
    const mat = (color, roughness = 0.5, metalness = 0.05) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });

    const wallMat = mat('#edece6', 0.88, 0.02);
    const accentWallMat = mat('#232a25', 0.75, 0.08); // Dark fluted feature wall
    const floorMat = mat('#ab8867', 0.42, 0.12);     // Warm oak hardwood
    const woodMat = mat('#694d36', 0.65, 0.05);      // Fluted walnut cabinetry
    const marbleMat = mat('#f5f4f0', 0.22, 0.05);    // Honed Calacatta marble
    const fabricMat = mat('#d1cec7', 0.94, 0.0);     // Textured bouclé sofa
    const darkMetal = mat('#181d19', 0.38, 0.7);     // Architectural anodized bronze
    const cushionMat = mat('#435044', 0.88, 0.0);    // Sage velvet accents
    const ochreMat = mat('#b88b4a', 0.85, 0.0);      // Warm ochre accents

    // Glass Facade (MeshPhysicalMaterial)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#e6f0ea',
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.52,
      thickness: 0.25
    });

    // TV Screen Emissive Material
    const tvScreenMat = new THREE.MeshStandardMaterial({
      color: '#0a0d0b',
      emissive: '#0a0d0b',
      emissiveIntensity: 0.05,
      roughness: 0.15
    });

    // Linear Cove LED Strip
    const ledStripMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#fffbeb',
      emissiveIntensity: 0.2,
      roughness: 0.3
    });

    // --- Geometry Construction: Architectural Cutaway Residence ---
    const house = new THREE.Group();
    scene.add(house);

    const createBox = (parent, name, size, pos, material, cast = true, receive = true) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.name = name;
      mesh.position.set(...pos);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      parent.add(mesh);
      return mesh;
    };

    // Concrete architectural plinth and hardwood floor
    createBox(house, 'exterior-plinth', [10.2, 0.25, 8.2], [0, -0.22, 0], mat('#808a7e', 0.9), false, true);
    createBox(house, 'patio-ledge', [9.5, 0.12, 7.4], [0, -0.04, 0], mat('#303732', 0.8));
    createBox(house, 'interior-floor', [9.1, 0.1, 6.9], [0, 0.06, 0], floorMat);

    // Architectural Perimeter Walls
    createBox(house, 'rear-wall', [9.1, 2.5, 0.22], [0, 1.35, -3.35], wallMat);
    createBox(house, 'left-wall', [0.22, 2.5, 6.9], [-4.44, 1.35, 0], wallMat);

    // Slatted feature acoustic divider
    createBox(house, 'interior-partition', [0.18, 2.5, 3.8], [-1.6, 1.35, 1.55], accentWallMat);
    for (let z = -0.1; z <= 3.2; z += 0.35) {
      createBox(house, 'acoustic-slat', [0.04, 2.45, 0.12], [-1.48, 1.35, z], woodMat, false, true);
    }

    // Right exterior corner pillars & floor-to-ceiling panoramic glass
    createBox(house, 'right-rear-pillar', [0.28, 2.5, 0.9], [4.41, 1.35, -2.9], wallMat);
    createBox(house, 'right-front-pillar', [0.28, 2.5, 0.9], [4.41, 1.35, 2.9], wallMat);
    createBox(house, 'panoramic-glass', [0.06, 2.3, 4.8], [4.4, 1.3, 0], glassMat, false, false);
    for (let z = -2.3; z <= 2.3; z += 1.55) {
      createBox(house, 'mullion', [0.12, 2.45, 0.08], [4.4, 1.3, z], darkMetal, false);
    }

    // Ceiling & Roof Beams
    createBox(house, 'roof-perimeter-beam', [9.2, 0.18, 0.3], [0, 2.6, -3.3], darkMetal, false);
    createBox(house, 'roof-front-beam', [9.2, 0.18, 0.3], [0, 2.6, 3.3], darkMetal, false);
    createBox(house, 'roof-cross-beam', [0.25, 0.18, 6.8], [1.3, 2.6, 0], darkMetal, false);

    // Cove LED strip running along ceiling
    createBox(house, 'cove-led-strip', [8.6, 0.04, 0.06], [0, 2.5, -3.18], ledStripMat, false, false);

    // --- Zone 1: Living & Home Cinema Area ---
    createBox(house, 'living-rug', [3.6, 0.03, 2.6], [0.8, 0.12, 1.1], mat('#c8c2b3', 0.92));
    createBox(house, 'sofa-base', [2.8, 0.44, 0.95], [0.7, 0.33, 1.95], fabricMat);
    createBox(house, 'sofa-back', [2.8, 0.45, 0.22], [0.7, 0.72, 2.35], fabricMat);
    createBox(house, 'sofa-chaise', [0.95, 0.44, 1.3], [-0.22, 0.33, 0.85], fabricMat);
    createBox(house, 'sofa-chaise-back', [0.22, 0.45, 1.3], [-0.59, 0.72, 0.85], fabricMat);

    // Pillows
    createBox(house, 'cushion-1', [0.45, 0.32, 0.14], [0.35, 0.65, 2.15], cushionMat);
    createBox(house, 'cushion-2', [0.45, 0.32, 0.14], [1.2, 0.65, 2.15], ochreMat);
    createBox(house, 'cushion-3', [0.45, 0.32, 0.14], [-0.48, 0.65, 1.25], cushionMat);

    // Honed marble coffee table
    createBox(house, 'coffee-table-top', [1.5, 0.08, 0.8], [0.9, 0.42, 0.75], marbleMat);
    createBox(house, 'table-leg-1', [0.08, 0.3, 0.6], [0.35, 0.22, 0.75], darkMetal);
    createBox(house, 'table-leg-2', [0.08, 0.3, 0.6], [1.45, 0.22, 0.75], darkMetal);
    createBox(house, 'art-book', [0.32, 0.04, 0.25], [0.65, 0.48, 0.7], mat('#2b332c', 0.5));
    const vaseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.22, 12), mat('#dedad1', 0.4));
    vaseMesh.position.set(1.25, 0.55, 0.78);
    house.add(vaseMesh);

    // Fluted media console & wall-mounted OLED TV
    createBox(house, 'media-console', [2.6, 0.38, 0.42], [0.8, 0.3, -3.05], woodMat);
    createBox(house, 'tv-frame', [2.3, 1.3, 0.05], [0.8, 1.72, -3.22], darkMetal);
    createBox(house, 'tv-screen', [2.22, 1.22, 0.02], [0.8, 1.72, -3.19], tvScreenMat, false, false);

    // Smart Wall Switch Panel
    createBox(house, 'smart-switch', [0.12, 0.22, 0.03], [3.9, 1.2, 2.4], darkMetal);
    createBox(house, 'switch-led', [0.03, 0.03, 0.01], [3.9, 1.26, 2.42], mat('#c8ea53', 0.2), false, false);

    // --- Zone 2: Kitchen Island & Dining Bar ---
    createBox(house, 'island-body', [2.1, 0.88, 0.9], [2.2, 0.52, -1.6], woodMat);
    createBox(house, 'island-marble-top', [2.22, 0.08, 1.02], [2.2, 0.98, -1.6], marbleMat);
    createBox(house, 'island-waterfall-l', [0.08, 0.94, 1.02], [1.13, 0.51, -1.6], marbleMat);
    createBox(house, 'island-waterfall-r', [0.08, 0.94, 1.02], [3.27, 0.51, -1.6], marbleMat);

    // Suspended conical brass pendants
    const pendantMat = mat('#d4af37', 0.3, 0.8);
    for (const px of [1.6, 2.2, 2.8]) {
      const rod = createBox(house, 'pendant-rod', [0.02, 0.6, 0.02], [px, 2.3, -1.6], darkMetal, false);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.2, 16), pendantMat);
      cone.position.set(px, 1.95, -1.6);
      cone.rotation.x = Math.PI;
      house.add(cone);
    }

    // Bar stools
    for (const sx of [1.6, 2.3, 2.9]) {
      createBox(house, 'stool-seat', [0.38, 0.06, 0.38], [sx, 0.65, -0.9], mat('#2b332c', 0.7));
      createBox(house, 'stool-legs', [0.3, 0.6, 0.3], [sx, 0.32, -0.9], darkMetal);
    }

    // --- Zone 3: Master Bedroom Suite ---
    createBox(house, 'bed-headboard', [2.4, 1.15, 0.16], [-3.1, 0.7, -3.2], mat('#374239', 0.9));
    createBox(house, 'bed-platform', [2.1, 0.32, 2.3], [-3.1, 0.22, -2.0], woodMat);
    createBox(house, 'mattress', [1.9, 0.3, 2.1], [-3.1, 0.48, -2.05], mat('#faf9f6', 0.95));
    createBox(house, 'duvet', [1.94, 0.18, 1.5], [-3.1, 0.58, -1.75], mat('#e2dfd7', 0.9));
    createBox(house, 'pillow-1', [0.65, 0.14, 0.4], [-3.6, 0.68, -2.8], mat('#ffffff', 0.9));
    createBox(house, 'pillow-2', [0.65, 0.14, 0.4], [-2.6, 0.68, -2.8], mat('#ffffff', 0.9));
    createBox(house, 'nightstand-l', [0.55, 0.36, 0.4], [-4.25, 0.26, -2.9], woodMat);
    createBox(house, 'nightstand-r', [0.55, 0.36, 0.4], [-1.95, 0.26, -2.9], woodMat);
    createBox(house, 'sconce-l', [0.1, 0.2, 0.1], [-4.25, 1.3, -3.2], darkMetal, false);
    createBox(house, 'sconce-r', [0.1, 0.2, 0.1], [-1.95, 1.3, -3.2], darkMetal, false);

    // Wall-mounted smart thermostat
    createBox(house, 'thermostat', [0.14, 0.14, 0.04], [-1.75, 1.4, 0.5], darkMetal);
    createBox(house, 'thermostat-screen', [0.1, 0.1, 0.01], [-1.73, 1.4, 0.5], mat('#0ea5e9', 0.2), false, false);

    // --- Motorized Smart Drapes (Panels Left & Right) ---
    const drapeMat = mat('#8a9885', 0.85, 0.0);
    const curtainL = createBox(house, 'curtain-left', [0.18, 2.35, 1.8], [4.26, 1.28, -1.3], drapeMat);
    const curtainR = createBox(house, 'curtain-right', [0.18, 2.35, 1.8], [4.26, 1.28, 1.3], drapeMat);

    // --- Security Perimeter Visualization (Away Mode) ---
    const securityGroup = new THREE.Group();
    securityGroup.visible = false;
    house.add(securityGroup);

    // Doorway radar ring
    const securityRing1 = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.32, 32),
      new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    securityRing1.rotation.x = Math.PI / 2;
    securityRing1.position.set(4.25, 0.12, 0);
    securityGroup.add(securityRing1);

    const securityRing2 = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.55, 32),
      new THREE.MeshBasicMaterial({ color: '#06b6d4', side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    );
    securityRing2.rotation.x = Math.PI / 2;
    securityRing2.position.set(4.25, 0.12, 0);
    securityGroup.add(securityRing2);

    // Patio beam line
    const securityBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 2.3, 0.04),
      new THREE.MeshBasicMaterial({ color: '#10b981', transparent: true, opacity: 0.75 })
    );
    securityBeam.position.set(4.25, 1.25, 0);
    securityGroup.add(securityBeam);

    // Ambient floating dust particles
    const motesGroup = new THREE.Group();
    scene.add(motesGroup);
    const moteMat = new THREE.MeshBasicMaterial({ color: '#fef3c7', transparent: true, opacity: 0.55 });
    for (let i = 0; i < 40; i++) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), moteMat);
      mote.position.set(
        (Math.random() - 0.5) * 8.5,
        Math.random() * 2.4 + 0.3,
        (Math.random() - 0.5) * 6.2
      );
      mote.userData = { speed: Math.random() * 0.4 + 0.2, phase: Math.random() * Math.PI * 2 };
      motesGroup.add(mote);
    }

    // --- State & Scene Presets ---
    const state = {
      scene: 'morning',
      targetCameraX: 9.2,
      targetCameraY: 7.5,
      targetCameraZ: 11.2,
      targetLookX: 0,
      targetLookY: 1.1,
      targetLookZ: 0,
      curtainProgress: 0,
      targetCurtainProgress: 0,
      tvActive: false,
      securityActive: false
    };

    const presets = {
      morning: {
        bg: '#cdd7c6',
        ambient: 2.2,
        sun: 3.8,
        sunColor: '#fff7ed',
        sunPos: [-6, 11, 7],
        exposure: 1.18,
        coveIntensity: 0.3,
        coveColor: '#ffffff',
        islandIntensity: 0.4,
        islandColor: '#fff7ed',
        tvIntensity: 0,
        tvColor: '#0a0d0b',
        curtainTarget: 0.0, // Fully open
        security: false,
        cameraPos: [9.2, 7.5, 11.2],
        lookAt: [0, 1.1, 0],
        status: 'Morning Awakening',
        statusDetail: 'Curtains open • 100% natural sunlight',
        temp: '22° Comfort',
        captionL: '01 / MORNING AWAKENING',
        captionR: 'DAYLIGHT SYNCHRONIZATION'
      },
      cinema: {
        bg: '#111713',
        ambient: 0.45,
        sun: 0.04,
        sunColor: '#38bdf8',
        sunPos: [-4, 6, 4],
        exposure: 0.95,
        coveIntensity: 2.2,
        coveColor: '#f59e0b', // Deep warm amber cove glow
        islandIntensity: 0.15,
        islandColor: '#38bdf8',
        tvIntensity: 4.8,     // Brilliant animated ambilight
        tvColor: '#38bdf8',
        curtainTarget: 1.0,   // Full blackout
        security: false,
        cameraPos: [6.4, 4.2, 7.6], // Dramatic close zoom on entertainment lounge
        lookAt: [0.4, 1.3, -0.4],
        status: 'Cinema Sanctuary',
        statusDetail: 'Blackout drapes closed • 4K Ambilight active',
        temp: '21° Cinema Chill',
        captionL: '02 / CINEMA SANCTUARY',
        captionR: 'AMBIENT ENTERTAINMENT MODE'
      },
      away: {
        bg: '#7b8577',
        ambient: 0.85,
        sun: 1.5,
        sunColor: '#e2e8f0',
        sunPos: [-2, 12, 5],
        exposure: 1.0,
        coveIntensity: 0,
        coveColor: '#94a3b8',
        islandIntensity: 0,
        islandColor: '#ffffff',
        tvIntensity: 0,
        tvColor: '#000000',
        curtainTarget: 0.55,  // Privacy shade
        security: true,       // Perimeter shields active
        cameraPos: [13.0, 12.0, 14.0], // High-altitude security perspective
        lookAt: [0, 0.8, 0],
        status: 'Away & Protected',
        statusDetail: 'Perimeter armed • Energy save active',
        temp: '26° Eco Standby',
        captionL: '03 / AWAY & PROTECTED',
        captionR: '24/7 PERIMETER VIGILANCE'
      },
      evening: {
        bg: '#373f35',
        ambient: 1.25,
        sun: 0.8,
        sunColor: '#ea580c',  // Warm sunset orange
        sunPos: [-7, 3.8, 2.5],
        exposure: 1.05,
        coveIntensity: 2.6,
        coveColor: '#fbbf24', // 2700K golden candlelight
        islandIntensity: 2.4,
        islandColor: '#fef3c7',
        tvIntensity: 0.6,
        tvColor: '#fef3c7',
        curtainTarget: 0.85,  // Cosy closed
        security: false,
        cameraPos: [8.4, 6.2, 10.2],
        lookAt: [0.2, 1.1, 0.1],
        status: 'Evening Unwind',
        statusDetail: 'Warm 2700K scenes • Curtains closed',
        temp: '23° Cosy Evening',
        captionL: '04 / EVENING COMFORT',
        captionR: 'BESPOKE ARCHITECTURAL SCENES'
      }
    };
    // Support movie as alias for cinema
    presets.movie = presets.cinema;

    function applyScene(requestedMode) {
      let mode = (requestedMode || 'morning').toLowerCase();
      if (mode === 'movie') mode = 'cinema';
      const p = presets[mode] || presets.morning;

      state.scene = mode;
      state.targetCurtainProgress = p.curtainTarget;
      state.securityActive = p.security;
      state.tvActive = (mode === 'cinema');

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
      ledStripMat.emissiveIntensity = p.coveIntensity > 0 ? 1.5 : 0.05;

      islandLight.intensity = p.islandIntensity;
      islandLight.color.set(p.islandColor || '#ffffff');

      tvLight.intensity = p.tvIntensity;
      tvLight.color.set(p.tvColor);
      tvScreenMat.emissive.set(p.tvColor);
      tvScreenMat.emissiveIntensity = p.tvIntensity > 0 ? 2.5 : 0.05;

      securityLight.intensity = p.security ? 2.5 : 0;
      securityGroup.visible = p.security;

      // Update UI HUD Cards & Pills
      if (statusPill) {
        statusPill.innerHTML = `${p.status}<br><small style="font-weight:400;color:#6b7280;letter-spacing:0">${p.statusDetail}</small>`;
      }
      if (tempPill) {
        tempPill.innerHTML = `${p.temp}`;
      }
      if (captionLeft) captionLeft.textContent = p.captionL;
      if (captionRight) captionRight.textContent = p.captionR;

      // Sync all buttons/chips across the page
      document.querySelectorAll('[data-scene], .preset-pill, .scene-option, [data-scene-trigger]').forEach(btn => {
        const btnScene = (btn.dataset.scene || btn.getAttribute('data-scene-trigger') || '').toLowerCase();
        const isMatch = (btnScene === mode || 
                         (mode === 'cinema' && (btnScene === 'movie' || btnScene === 'cinema')) ||
                         (mode === 'movie' && (btnScene === 'cinema' || btnScene === 'movie')));
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-pressed', String(isMatch));
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

    // Mouse & Pointer Parallax + Drag Orbit
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

    // --- Mouse Wheel Zoom Interaction ---
    let zoomLevel = 1.0;
    let targetZoom = 1.0;

    frameEl.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY * 0.0016;
      targetZoom = THREE.MathUtils.clamp(targetZoom + delta, 0.55, 1.75);
    }, { passive: false });

    // Render loop
    const clock = new THREE.Clock();
    let currentCamX = camera.position.x;
    let currentCamY = camera.position.y;
    let currentCamZ = camera.position.z;
    let currentLookX = 0;
    let currentLookY = 1.1;
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

      // Gentle breathing idle rotation if not manually dragging
      if (!isDragging) {
        house.rotation.y = THREE.MathUtils.damp(house.rotation.y, -0.15 + pointerX * 0.25 + Math.sin(t * 0.25) * 0.025, 1.8, 1 / 60);
        house.rotation.x = THREE.MathUtils.damp(house.rotation.x, pointerY * -0.06, 2.0, 1 / 60);
      }
      house.position.y = Math.sin(t * 0.8) * 0.025;

      // Smooth curtain glide animation
      state.curtainProgress = THREE.MathUtils.damp(state.curtainProgress, state.targetCurtainProgress, 2.5, 1 / 60);
      curtainL.position.z = THREE.MathUtils.lerp(-2.15, -0.9, state.curtainProgress);
      curtainR.position.z = THREE.MathUtils.lerp(2.15, 0.9, state.curtainProgress);
      curtainL.scale.z = THREE.MathUtils.lerp(0.55, 1.15, state.curtainProgress);
      curtainR.scale.z = THREE.MathUtils.lerp(0.55, 1.15, state.curtainProgress);

      // Interpolate smooth zoom
      zoomLevel = THREE.MathUtils.damp(zoomLevel, targetZoom, 3.2, 1 / 60);

      // Camera position interpolation with parallax and wheel zoom
      const desiredCamX = (state.targetCameraX + pointerX * 0.8) * zoomLevel;
      const desiredCamY = (state.targetCameraY + pointerY * -0.4) * zoomLevel;
      const desiredCamZ = (state.targetCameraZ + pointerX * 0.4) * zoomLevel;

      currentCamX = THREE.MathUtils.damp(currentCamX, desiredCamX, 1.8, 1 / 60);
      currentCamY = THREE.MathUtils.damp(currentCamY, desiredCamY, 1.8, 1 / 60);
      currentCamZ = THREE.MathUtils.damp(currentCamZ, desiredCamZ, 1.8, 1 / 60);
      camera.position.set(currentCamX, currentCamY, currentCamZ);

      currentLookX = THREE.MathUtils.damp(currentLookX, state.targetLookX + pointerX * 0.2, 2.0, 1 / 60);
      currentLookY = THREE.MathUtils.damp(currentLookY, state.targetLookY, 2.0, 1 / 60);
      currentLookZ = THREE.MathUtils.damp(currentLookZ, state.targetLookZ, 2.0, 1 / 60);
      camera.lookAt(currentLookX, currentLookY, currentLookZ);

      // Dynamic movie TV flickering & color shifts
      if (state.tvActive) {
        const tvHue = (Math.sin(t * 1.6) * 0.16 + 0.58) % 1;
        tvLight.color.setHSL(tvHue, 0.88, 0.6);
        tvScreenMat.emissive.setHSL(tvHue, 0.92, 0.6 + Math.sin(t * 4.5) * 0.1);
      }

      // Security pulse animation (Away Mode)
      if (state.securityActive) {
        const secPulse = Math.sin(t * 3.8) * 0.5 + 0.5;
        securityRing1.scale.set(1 + secPulse * 0.4, 1 + secPulse * 0.4, 1);
        securityRing2.scale.set(1 + (1 - secPulse) * 0.35, 1 + (1 - secPulse) * 0.35, 1);
        securityRing1.material.opacity = 0.5 + secPulse * 0.45;
        securityRing2.material.opacity = 0.3 + (1 - secPulse) * 0.45;
        securityBeam.material.opacity = 0.4 + secPulse * 0.4;
      }

      // Dust motes drift
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

// Global Delegated Click Listener for Scene Chips & Options
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-scene], .preset-pill, .scene-option, [data-scene-trigger]');
  if (trigger) {
    const sceneName = trigger.dataset.scene || trigger.getAttribute('data-scene-trigger');
    if (sceneName && sceneController) {
      sceneController.applyScene(sceneName);
    }
  }
});

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

// --- 3D Card Hover Interaction & Tilt ---
document.querySelectorAll('.solution-card, .scenario-card, .step-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -4.5;
    const rotY = ((x - centerX) / centerX) * 4.5;
    card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-8px) scale(1.015)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

// --- Lead Form & Attribution Preservation ---
const leadForm = document.querySelector('#lead-form');
const feedback = document.querySelector('#form-feedback');
const submit = document.querySelector('#form-submit');

// Parse and preserve Google Ads click IDs and UTM campaign parameters
const searchParams = new URLSearchParams(window.location.search);
const attributionFields = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

attributionFields.forEach(field => {
  const val = searchParams.get(field);
  if (val && leadForm) {
    let input = leadForm.querySelector(`input[name="${field}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = field;
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

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'vmk_lead_form_submit_attempt'
  });

  const formData = new FormData(leadForm);
  let formAction = leadForm.getAttribute('action') || 'api/process-lead';

  try {
    let response;
    try {
      response = await fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
    } catch (fetchErr) {
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
      feedback.textContent = 'Thank you! Your consultation request has been received. Our team will contact you shortly.';
      feedback.classList.add('success');
      leadForm.reset();
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
      window.dataLayer.push({
        event: 'vmk_lead_form_success',
        lead_service: formData.get('interest') || 'General Home Automation'
      });
    } else {
      feedback.textContent = data.message || 'Please check the information entered and try again.';
      feedback.classList.add('error');
    }
  } catch (error) {
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
