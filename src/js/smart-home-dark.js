/* ==========================================================================
   VMK Products — Ultra-Luxury Architectural Dark Edition
   Interactive Spatial Engine & Conversion Tracker
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMasthead();
  initAtmosphereConsole();
  initSpatialBlueprint();
  initHeroParallax();
  initGoogleAdsAttribution();
  initLeadForm();
});

/* ==========================================================================
   1. Masthead Scroll Physics
   ========================================================================== */
function initMasthead() {
  const masthead = document.querySelector('.spatial-masthead');
  if (!masthead) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      masthead.classList.add('scrolled');
    } else {
      masthead.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. Atmosphere Command Console (Tactile Interactive Experience)
   ========================================================================== */
const ATMOSPHERE_PRESETS = {
  dawn: {
    name: 'Dawn Awakening',
    sub: 'CIRCADIAN DAYLIGHT & MOTORIZED DRAPERY',
    kelvin: 6200,
    kelvinColor: '#d6ecff',
    shading: 100,
    climate: '22.0°C',
    video: 'assets/videos/scene-morning.mp4',
    poster: 'assets/images/scene-morning.webp'
  },
  golden: {
    name: 'Golden Hour Social',
    sub: 'WARM TUNGSTEN COVE & AMBIENT HARMONY',
    kelvin: 2800,
    kelvinColor: '#ffd8a8',
    shading: 45,
    climate: '23.5°C',
    video: 'assets/videos/scene-evening.mp4',
    poster: 'assets/images/scene-evening.webp'
  },
  cinema: {
    name: 'Cinema Dolby Immersion',
    sub: 'INDIGO BIAS LIGHTING & MOTORIZED BLACKOUT',
    kelvin: 2200,
    kelvinColor: '#818cf8',
    shading: 0,
    climate: '21.5°C',
    video: 'assets/videos/scene-cinema.mp4',
    poster: 'assets/images/scene-cinema.webp'
  },
  night: {
    name: 'Deep Night Sanctuary',
    sub: 'STEALTH SECURITY RADAR & MOONLIGHT PATH',
    kelvin: 2000,
    kelvinColor: '#34d399',
    shading: 0,
    climate: '22.5°C',
    video: 'assets/videos/scene-away.mp4',
    poster: 'assets/images/scene-away.webp'
  }
};

function initAtmosphereConsole() {
  const buttons = document.querySelectorAll('.preset-trigger-btn');
  const captionTitle = document.getElementById('console-caption-title');
  const captionSub = document.getElementById('console-caption-sub');
  const kelvinSlider = document.getElementById('slider-kelvin');
  const kelvinReading = document.getElementById('reading-kelvin');
  const shadingSlider = document.getElementById('slider-shading');
  const shadingReading = document.getElementById('reading-shading');
  const videoElem = document.getElementById('console-projection-video');

  const applyPreset = (key) => {
    const data = ATMOSPHERE_PRESETS[key];
    if (!data) return;

    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === key);
    });

    if (captionTitle) captionTitle.textContent = data.name;
    if (captionSub) captionSub.textContent = data.sub;

    if (kelvinSlider && kelvinReading) {
      kelvinSlider.value = data.kelvin;
      kelvinReading.textContent = `${data.kelvin}K`;
    }

    if (shadingSlider && shadingReading) {
      shadingSlider.value = data.shading;
      shadingReading.textContent = `${data.shading}% Open`;
    }

    // Update global CSS variables for ambient light wash
    document.documentElement.style.setProperty('--ambient-kelvin-color', data.kelvinColor);

    if (videoElem) {
      videoElem.style.opacity = '0';
      setTimeout(() => {
        videoElem.src = data.video;
        videoElem.poster = data.poster;
        videoElem.load();
        videoElem.play().catch(() => {});
        videoElem.style.opacity = '1';
      }, 300);
    }
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      applyPreset(presetKey);
    });
  });

  if (kelvinSlider && kelvinReading) {
    kelvinSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      kelvinReading.textContent = `${val}K`;
      
      // Compute smooth color tint from warm amber (2200K) to sky white (6500K)
      let tint = '#ffd8a8';
      if (val < 3000) tint = '#ffb76b';
      else if (val < 4500) tint = '#fff0d6';
      else tint = '#d6ecff';

      document.documentElement.style.setProperty('--ambient-kelvin-color', tint);
    });
  }

  if (shadingSlider && shadingReading) {
    shadingSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      shadingReading.textContent = `${val}% Open`;
    });
  }
}

/* ==========================================================================
   3. Spatial Blueprint Room Navigator
   ========================================================================== */
const ROOM_DATABASE = {
  salon: {
    code: '01 / ZONE',
    headline: 'Grand Living & Architectural Salon',
    narrative: 'Effortless transition from bright afternoon natural light into intimate evening entertaining. Motorized sheer curtains glide smoothly along concealed architectural pockets while cove and art lighting elevate every architectural finish.',
    image: 'assets/images/dark-master-lounge.webp',
    specs: [
      { title: 'Circadian Tunable Lighting', sub: 'CRI 98+ full-spectrum architectural linear cove' },
      { title: 'Concealed Motorized Drapery', sub: 'Ultra-silent Somfy/Dooya dual track motors' },
      { title: 'Acoustic Soundstage', sub: 'Multi-room discrete architectural audio integration' },
      { title: 'Air Quality & Comfort Loop', sub: 'Automated HEPA filtering & VRV climate balancing' }
    ]
  },
  lighting: {
    code: '02 / SYSTEM',
    headline: 'Architectural Smart Lighting & Scenes',
    narrative: 'Beyond simply on or off. Our lighting automation coordinates magnetic track lights, cove profiles, and step illumination into cohesive architectural scenes tuned to your daily circadian rhythm.',
    image: 'assets/images/smart-lighting.webp',
    specs: [
      { title: 'Zero-Flicker DALI-2 & Phase Dimming', sub: 'Smooth dimming down to 0.1% true darkness' },
      { title: 'Occupancy & Presence Sensing', sub: 'Millimeter-wave radar detects breathing presence' },
      { title: 'Keypad Engraving & Backlit Touch', sub: 'Solid anodized aluminum and Italian glass plates' },
      { title: 'Local Mesh Reliability', sub: 'Instantaneous response with zero internet reliance' }
    ]
  },
  curtains: {
    code: '03 / MOTION',
    headline: 'Motorized Drapery, Blinds & Skylights',
    narrative: 'Whisper-quiet motorized tracks engineered for heavy blackout drapes, sheer curtains, and motorized Roman blinds. Synchronized automated opening at sunrise and private blackout closure at sunset.',
    image: 'assets/images/gallery-curtain-control.webp',
    specs: [
      { title: 'Whisper Motor Technology', sub: 'Operates under 30dB for completely silent glide' },
      { title: 'Manual Touch-Motion Pull', sub: 'Gentle hand tug triggers full automated glide' },
      { title: 'Solar Angle & Lux Tracking', sub: 'Auto-adjusts during Delhi peak heat to save energy' },
      { title: 'Curved & Bay Window Tracks', sub: 'Custom architectural bending to exact room geometries' }
    ]
  },
  climate: {
    code: '04 / CLIMATE',
    headline: 'Intelligent Multi-Zone Climate Management',
    narrative: 'Smart VRV/VRF air conditioning and fresh-air ventilation integration. Every suite and bedroom maintains its personal micro-climate while conserving up to 35% on seasonal electricity consumption.',
    image: 'assets/images/dark-villa-cutaway.webp',
    specs: [
      { title: 'VRV / VRF HVAC Gateways', sub: 'Direct Daikin, Mitsubishi, O General integration' },
      { title: 'Continuous IAQ Monitoring', sub: 'PM2.5, CO2, and humidity real-time filtration' },
      { title: 'Occupancy Cooling Setbacks', sub: 'Disengages empty zones automatically when unoccupied' },
      { title: 'Pre-Arrival Cooling', sub: 'Geofenced cool-down before you step through the door' }
    ]
  },
  switches: {
    code: '05 / INTERFACE',
    headline: 'Luxury Touch Modular Smart Keypads',
    narrative: 'Replace messy multi-gang switchboards with minimal, high-end Italian glass and CNC-machined metallic touch panels. Programmable capacitive touch feedback with custom icons and LED status rings.',
    image: 'assets/images/modular-switches.webp',
    specs: [
      { title: 'Architectural Flush Finishes', sub: 'Matte obsidian, brushed bronze, and smoked glass' },
      { title: 'One-Touch Master Shutdown', sub: 'Single tap by the main door arms away mode' },
      { title: 'Direct Retrofit Compatibility', sub: 'Fits standard Indian electrical back boxes' },
      { title: 'Capacitive Haptic Feedback', sub: 'Crisp micro-haptic confirmation on every press' }
    ]
  },
  security: {
    code: '06 / DEFENSE',
    headline: 'Biometric Access & Perimeter Protection',
    narrative: 'Multi-layered perimeter defense combining 3D facial recognition door access, biometric mortise locks, smart video doorbells, and AI-enabled perimeter intrusion analytics with instant smartphone alerting.',
    image: 'assets/images/security-automation.webp',
    specs: [
      { title: '3D Structured Light Facial ID', sub: 'Sub-second biometric unlock with anti-spoofing' },
      { title: 'Remote Temporary Passcodes', sub: 'Generate time-bound keys for guests and staff' },
      { title: '24/7 AI Intrusion Detection', sub: 'Differentiates humans, vehicles, and pets accurately' },
      { title: 'Tamper Alarm & Encrypted Bus', sub: 'Bank-grade AES-128 localized encryption protocol' }
    ]
  },
  cinema: {
    code: '07 / IMMERSION',
    headline: 'Private Dolby Atmos Screening Automation',
    narrative: 'Transform your lounge into a private cinema with a single voice command or keypad touch. Motorized projector drops down, blackout blinds seal the room, and architectural acoustic lighting dims to black.',
    image: 'assets/images/scene-cinema.webp',
    specs: [
      { title: 'Automated Screen & Lift Systems', sub: 'Concealed motorized ceiling drops and masking' },
      { title: 'AV Receiver & Processor Control', sub: 'Seamless HDMI CEC and IP control for all gear' },
      { title: 'Pathway & Step Lighting', sub: 'Subtle low-lux floor guides for effortless movement' },
      { title: 'One-Tap Movie Macro', sub: 'Coordinates sound, display, drapes and light at once' }
    ]
  }
};

function initSpatialBlueprint() {
  const navItems = document.querySelectorAll('.spatial-nav-item');
  const codeElem = document.getElementById('blueprint-code');
  const headlineElem = document.getElementById('blueprint-headline');
  const narrativeElem = document.getElementById('blueprint-narrative');
  const imageElem = document.getElementById('blueprint-img');
  const matrixContainer = document.getElementById('blueprint-hardware-matrix');

  if (!navItems.length) return;

  const renderRoom = (key) => {
    const room = ROOM_DATABASE[key];
    if (!room) return;

    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.room === key);
    });

    if (codeElem) codeElem.textContent = room.code;
    if (headlineElem) headlineElem.textContent = room.headline;
    if (narrativeElem) narrativeElem.textContent = room.narrative;

    if (imageElem) {
      imageElem.style.opacity = '0';
      imageElem.style.transform = 'scale(0.98)';
      setTimeout(() => {
        imageElem.src = room.image;
        imageElem.style.opacity = '1';
        imageElem.style.transform = 'scale(1)';
      }, 250);
    }

    if (matrixContainer) {
      matrixContainer.innerHTML = room.specs.map(spec => `
        <div class="hardware-pill">
          <div class="hardware-check">✦</div>
          <div>
            <div class="hardware-title">${spec.title}</div>
            <div class="hardware-sub">${spec.sub}</div>
          </div>
        </div>
      `).join('');
    }
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const roomKey = item.dataset.room;
      renderRoom(roomKey);
    });
  });
}

/* ==========================================================================
   4. Hero Hotspots & Perspective Parallax
   ========================================================================== */
function initHeroParallax() {
  const stage = document.querySelector('.spatial-stage-viewport');
  const img = document.querySelector('.spatial-stage-img');
  const badges = document.querySelectorAll('.hud-telemetry-badge');

  if (!stage || !img) return;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    img.style.transform = `scale(1.04) translate(${x * 12}px, ${y * 12}px)`;
    badges.forEach(b => {
      b.style.transform = `translate(${x * -8}px, ${y * -8}px)`;
    });
  });

  stage.addEventListener('mouseleave', () => {
    img.style.transform = 'scale(1) translate(0px, 0px)';
    badges.forEach(b => {
      b.style.transform = 'translate(0px, 0px)';
    });
  });
}

/* ==========================================================================
   5. Google Ads Attribution (gclid, gbraid, wbraid, utm_*)
   ========================================================================== */
function initGoogleAdsAttribution() {
  const params = new URLSearchParams(window.location.search);
  const keys = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const attributionData = {};

  keys.forEach(key => {
    const val = params.get(key);
    if (val) {
      sessionStorage.setItem(`vmk_${key}`, val);
      attributionData[key] = val;
    } else {
      const stored = sessionStorage.getItem(`vmk_${key}`);
      if (stored) attributionData[key] = stored;
    }
  });

  const form = document.getElementById('dark-consult-form');
  if (form) {
    Object.keys(attributionData).forEach(key => {
      let input = form.querySelector(`input[name="${key}"]`);
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        form.appendChild(input);
      }
      input.value = attributionData[key];
    });
  }
}

/* ==========================================================================
   6. Lead Form Validation & Verified API Submission
   ========================================================================== */
function initLeadForm() {
  const form = document.getElementById('dark-consult-form');
  const feedback = document.getElementById('form-feedback-dark');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit-btn');
    const origBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

    // Honeypot spam trap
    const honey = form.querySelector('input[name="website"]');
    if (honey && honey.value.trim() !== '') {
      console.warn('Spam detected via honeypot.');
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (!payload.name || !payload.phone) {
      if (feedback) {
        feedback.className = 'form-status-feedback error';
        feedback.textContent = 'Please provide your full name and phone number.';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Verifying & Scheduling…</span>';
    }

    try {
      const response = await fetch('api/process-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && (result.success !== false)) {
        if (feedback) {
          feedback.className = 'form-status-feedback success';
          feedback.textContent = 'Thank you! Your architectural consultation request has been received. Our senior engineer will contact you shortly.';
        }
        form.reset();

        // Push verified conversion event to Google Tag Manager dataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'lead_submission_success',
          lead_type: 'architectural_dark_consultation',
          property_type: payload.property_type || 'unspecified',
          city: payload.city || 'unspecified'
        });
      } else {
        throw new Error(result.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Lead error:', err);
      if (feedback) {
        feedback.className = 'form-status-feedback error';
        feedback.textContent = 'Unable to send inquiry automatically. Please connect directly via WhatsApp at +91 85270 87270.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnText;
      }
    }
  });
}
