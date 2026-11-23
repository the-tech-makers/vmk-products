/**
 * VMK Products — Premium Smart Home Cinematic Video Stage & Interactive Logic
 * High-definition architectural video stage, seamless crossfades, 3D perspective parallax,
 * interactive hotspots, Google Ads attribution preservation & lead conversion tracking.
 */

// --- DOM References ---
const sceneFrame = document.querySelector('#scene-frame');
const cinematicStage = document.querySelector('#cinematic-stage');
const ambientGlow = document.querySelector('#hero-ambient-glow');
const hotspotsLayer = document.querySelector('#hotspots-layer');
const statusPill = document.querySelector('#hero-status-pill');
const tempPill = document.querySelector('#hero-temp-pill');
const statusCard = document.querySelector('#hero-status-card');
const tempCard = document.querySelector('#hero-temp-card');
const captionLeft = document.querySelector('#hero-caption-left');
const captionRight = document.querySelector('#hero-caption-right');

// --- Scene Configurations & Telemetry ---
const scenes = {
  morning: {
    name: 'morning',
    title: 'Morning Awakening',
    statusDetail: 'Curtains open • 100% natural sunlight',
    temp: '22° Comfort',
    captionL: '01 / MORNING AWAKENING',
    captionR: 'DAYLIGHT & MOTORIZED SHADING SYNCHRONIZATION',
    glow: 'radial-gradient(circle at 65% 35%, rgba(255, 230, 180, 0.45) 0%, transparent 65%)',
    hotspots: [
      { top: '35%', left: '76%', name: 'Motorized Drapery', desc: 'Circadian sync • Whisper-quiet Somfy motor' },
      { top: '56%', left: '42%', name: 'Natural Daylight Sync', desc: 'Circadian lighting balanced with exterior sun' }
    ]
  },
  cinema: {
    name: 'cinema',
    title: 'Cinema Sanctuary',
    statusDetail: 'Blackout drapes closed • 4K Ambilight active',
    temp: '21° Cinema Chill',
    captionL: '02 / CINEMA SANCTUARY',
    captionR: 'AMBIENT ENTERTAINMENT & 4K AMBILIGHT MODE',
    glow: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.35) 0%, rgba(245, 158, 11, 0.2) 60%, transparent 80%)',
    hotspots: [
      { top: '38%', left: '68%', name: '4K OLED Display & Ambilight', desc: 'Dynamic bias illumination • Lounge dimmed to 15%' },
      { top: '28%', left: '20%', name: 'Acoustic Blackout Drapery', desc: 'Motorized light-blocking seals engaged' }
    ]
  },
  away: {
    name: 'away',
    title: 'Away & Protected',
    statusDetail: 'Perimeter armed • Energy save active',
    temp: '26° Eco Standby',
    captionL: '03 / AWAY & PROTECTED',
    captionR: '24/7 BIOMETRIC & PERIMETER VIGILANCE',
    glow: 'radial-gradient(circle at 65% 45%, rgba(16, 185, 129, 0.3) 0%, transparent 65%)',
    hotspots: [
      { top: '48%', left: '64%', name: 'Biometric Smart Lock', desc: 'Encrypted fingerprint/RFID • Perimeter armed' },
      { top: '82%', left: '42%', name: 'Architectural Step Lights', desc: 'Automated dusk-to-dawn presence lighting' }
    ]
  },
  evening: {
    name: 'evening',
    title: 'Evening Unwind',
    statusDetail: 'Warm 2700K scenes • Fireplace ambiance',
    temp: '23° Cosy Evening',
    captionL: '04 / EVENING COMFORT',
    captionR: 'BESPOKE 2700K CANDLELIT ARCHITECTURAL SCENES',
    glow: 'radial-gradient(circle at 35% 65%, rgba(245, 158, 11, 0.4) 0%, transparent 70%)',
    hotspots: [
      { top: '50%', left: '22%', name: 'Linear Fireplace Ambiance', desc: 'Soft flame glow & climate warm-up' },
      { top: '24%', left: '46%', name: '2700K Architectural Downlights', desc: 'Warm recessed wash for relaxed dining & lounge' }
    ]
  }
};
scenes.movie = scenes.cinema;

let currentScene = 'morning';

function renderHotspots(hotspotsList) {
  if (!hotspotsLayer) return;
  hotspotsLayer.innerHTML = '';
  
  hotspotsList.forEach((h, idx) => {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.style.top = h.top;
    el.style.left = h.left;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `${h.name}: ${h.desc}`);

    el.innerHTML = `
      <div class="hotspot-trigger">
        <span class="hotspot-pulse"></span>
        <span>✦</span>
      </div>
      <div class="hotspot-tooltip">
        <strong>${h.name}</strong>
        <small>${h.desc}</small>
      </div>
    `;

    // Click/touch to toggle tooltip on mobile
    el.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.hotspot.pinned').forEach(p => {
        if (p !== el) p.classList.remove('pinned');
      });
      el.classList.toggle('pinned');
    });

    hotspotsLayer.appendChild(el);
  });
}

function applyScene(requestedMode) {
  let mode = (requestedMode || 'morning').toLowerCase();
  if (mode === 'movie') mode = 'cinema';
  const data = scenes[mode] || scenes.morning;
  currentScene = mode;

  // 1. Cross-fade video layers
  const videoWraps = document.querySelectorAll('.cinematic-video-wrap');
  videoWraps.forEach(wrap => {
    const wrapScene = (wrap.dataset.scene || '').toLowerCase();
    const isMatch = (wrapScene === mode || (mode === 'cinema' && wrapScene === 'movie'));
    wrap.classList.toggle('active', isMatch);

    const video = wrap.querySelector('video');
    if (video) {
      if (isMatch) {
        video.play().catch(() => {});
      }
    }
  });

  // 2. Ambient glow overlay
  if (ambientGlow) {
    ambientGlow.style.background = data.glow;
  }

  // 3. Update Status Card & Climate Card
  if (statusPill) {
    statusPill.innerHTML = `${data.title}<br><small style="font-weight:400;color:#6b7280;letter-spacing:0">${data.statusDetail}</small>`;
  }
  if (tempPill) {
    tempPill.innerHTML = `${data.temp}`;
  }

  // 4. Captions
  if (captionLeft) captionLeft.textContent = data.captionL;
  if (captionRight) captionRight.textContent = data.captionR;

  // 5. Render Hotspots
  renderHotspots(data.hotspots);

  // 6. Update all preset pills and trigger buttons
  document.querySelectorAll('[data-scene], .preset-pill, .scene-option, [data-scene-trigger]').forEach(btn => {
    const btnScene = (btn.dataset.scene || btn.getAttribute('data-scene-trigger') || '').toLowerCase();
    const isMatch = (btnScene === mode || 
                     (mode === 'cinema' && (btnScene === 'movie' || btnScene === 'cinema')) ||
                     (mode === 'movie' && (btnScene === 'cinema' || btnScene === 'movie')));
    btn.classList.toggle('active', isMatch);
    btn.setAttribute('aria-pressed', String(isMatch));
  });

  // 7. Synchronize Section 2 (A home that moves with your daily rhythm)
  updateExperienceSection(mode);

  // 8. Track scene change in Google Tag Manager dataLayer
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'vmk_scene_preset_change',
      scene_name: mode
    });
  }
}

// Close pinned hotspots on outside click
document.addEventListener('click', () => {
  document.querySelectorAll('.hotspot.pinned').forEach(p => p.classList.remove('pinned'));
});

// --- Interactive 3D Perspective Parallax on Cinematic Stage ---
if (sceneFrame && cinematicStage) {
  let isHovered = false;

  sceneFrame.addEventListener('pointerenter', () => {
    isHovered = true;
  });

  sceneFrame.addEventListener('pointermove', e => {
    const rect = sceneFrame.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -4.5;
    const rotY = ((x - centerX) / centerX) * 4.5;

    cinematicStage.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.015)`;

    // Parallax depth on floating HUD cards
    if (statusCard) {
      statusCard.style.transform = `translate3d(${(rotY * 1.8).toFixed(1)}px, ${(rotX * 1.8).toFixed(1)}px, 20px)`;
    }
    if (tempCard) {
      tempCard.style.transform = `translate3d(${(rotY * -1.8).toFixed(1)}px, ${(rotX * -1.8).toFixed(1)}px, 20px)`;
    }
  });

  sceneFrame.addEventListener('pointerleave', () => {
    isHovered = false;
    cinematicStage.style.transform = '';
    if (statusCard) statusCard.style.transform = '';
    if (tempCard) tempCard.style.transform = '';
  });
}

// --- Card 3D Tilt on Hover for Solution Cards ---
document.querySelectorAll('.solution-card, .process-step').forEach(card => {
  card.addEventListener('pointermove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -4.0;
    const rotY = ((x - centerX) / centerX) * 4.0;
    card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-8px) scale(1.015)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

// --- Section 2: Experience Intelligent Living Data Matrix ---
const rhythmScenarios = {
  morning: {
    index: '01 / 04',
    time: '07:00 AM',
    profile: 'CIRCADIAN DAWN',
    overline: 'NATURAL RESIDENTIAL RHYTHM',
    title: 'Soft sunlight fills the room.<br>Daylight begins effortlessly.',
    climate: '22.0°C • Fresh Air',
    lighting: '6500K Daylight (85%)',
    drapery: '100% Fully Open',
    acoustics: 'Gentle Acoustic Wake',
    glow: 'radial-gradient(circle at 70% 30%, rgba(255, 235, 180, 0.45) 0%, transparent 65%)',
    pillarIndex: 1
  },
  cinema: {
    index: '02 / 04',
    time: '08:45 PM',
    profile: 'MEDIA SANCTUARY',
    overline: 'IMMERSIVE ENTERTAINMENT',
    title: 'Lights dim to 15%.<br>Home theatre comes to life.',
    climate: '21.0°C • Cinema Chill',
    lighting: 'Warm Ambient Ambilight (15%)',
    drapery: 'Blackout Drapes Sealed',
    acoustics: 'Dolby Atmos Surround',
    glow: 'radial-gradient(circle at 40% 60%, rgba(56, 189, 248, 0.3) 0%, rgba(245, 158, 11, 0.25) 50%, transparent 75%)',
    pillarIndex: 3
  },
  away: {
    index: '03 / 04',
    time: '10:00 AM',
    profile: 'AUTONOMOUS GUARD',
    overline: 'WHOLE-ESTATE ECO DEFENSE',
    title: 'All circuits secured.<br>Intelligent perimeter eco guard.',
    climate: '26.0°C • Eco Standby',
    lighting: 'All Circuits Off (0%)',
    drapery: '50% Solar Heat Rejection',
    acoustics: 'Silent Standby',
    glow: 'radial-gradient(circle at 50% 30%, rgba(30, 70, 50, 0.45) 0%, transparent 70%)',
    pillarIndex: 2
  },
  evening: {
    index: '04 / 04',
    time: '06:30 PM',
    profile: 'DUSK TRANQUILLITY',
    overline: 'WARM SANCTUARY WELCOME',
    title: 'Warm 2700K candlelit glow.<br>Unwind in bespoke comfort.',
    climate: '23.0°C • Restful Warmth',
    lighting: '2700K Warm Wash (60%)',
    drapery: '85% Privacy Sheers',
    acoustics: 'Gentle Lounge Jazz',
    glow: 'radial-gradient(circle at 30% 70%, rgba(255, 175, 75, 0.35) 0%, transparent 65%)',
    pillarIndex: 0
  }
};
rhythmScenarios.movie = rhythmScenarios.cinema;

function updateExperienceSection(modeName) {
  let mode = (modeName || 'morning').toLowerCase();
  if (mode === 'movie') mode = 'cinema';
  const data = rhythmScenarios[mode] || rhythmScenarios.morning;

  // Cross-fade scenario slides
  const slides = document.querySelectorAll('.experience-slide');
  slides.forEach(slide => {
    const slideScene = (slide.dataset.scene || '').toLowerCase();
    const isMatch = (slideScene === mode || (mode === 'cinema' && slideScene === 'movie'));
    slide.classList.toggle('active', isMatch);
  });

  // Ambient glow
  const glow = document.querySelector('#experience-glow');
  if (glow) glow.style.background = data.glow;

  // HUD top tags
  const timeEl = document.querySelector('#showcase-time-text');
  if (timeEl) timeEl.textContent = data.time;
  const profileEl = document.querySelector('#showcase-profile-text');
  if (profileEl) profileEl.textContent = data.profile;
  const indexEl = document.querySelector('#showcase-index');
  if (indexEl) indexEl.textContent = data.index;

  // Showcase texts
  const overlineEl = document.querySelector('#showcase-overline');
  if (overlineEl) overlineEl.textContent = data.overline;
  const titleEl = document.querySelector('#showcase-title');
  if (titleEl) titleEl.innerHTML = data.title;

  // Bottom Telemetry Matrix
  const telClimate = document.querySelector('#tel-climate');
  if (telClimate) telClimate.textContent = data.climate;
  const telLighting = document.querySelector('#tel-lighting');
  if (telLighting) telLighting.textContent = data.lighting;
  const telDrapery = document.querySelector('#tel-drapery');
  if (telDrapery) telDrapery.textContent = data.drapery;
  const telAcoustics = document.querySelector('#tel-acoustics');
  if (telAcoustics) telAcoustics.textContent = data.acoustics;

  // Update scene option pills
  document.querySelectorAll('.scene-option').forEach(opt => {
    const optScene = (opt.dataset.scene || '').toLowerCase();
    const isMatch = (optScene === mode || (mode === 'cinema' && optScene === 'movie'));
    opt.classList.toggle('active', isMatch);
    opt.setAttribute('aria-pressed', String(isMatch));
    const pill = opt.querySelector('.scene-active-pill');
    if (pill) {
      pill.textContent = isMatch ? 'ACTIVE' : 'SELECT';
    }
  });

  // Highlight matching feature pillar
  document.querySelectorAll('.feature-pillar').forEach(pillar => {
    const pIdx = parseInt(pillar.dataset.pillar, 10);
    pillar.classList.toggle('active', pIdx === data.pillarIndex);
  });
}

// Global click delegation for all scene controls across hero & sections
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-scene], .preset-pill, .scene-option, [data-scene-trigger]');
  if (trigger) {
    const sceneName = trigger.dataset.scene || trigger.getAttribute('data-scene-trigger');
    if (sceneName) {
      applyScene(sceneName);
    }
  }
});

// Initialize first scene
applyScene('morning');

// --- Lead Form & Google Ads Attribution Preservation ---
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

    if (response && response.ok) {
      const data = await response.json();
      if (data.success) {
        feedback.textContent = data.message || 'Thank you! Our home automation experts will contact you shortly.';
        feedback.className = 'form-feedback success';
        leadForm.reset();
        window.dataLayer.push({
          event: 'vmk_lead_form_success',
          lead_service: formData.get('interest') || 'General Home Automation'
        });
        return;
      } else {
        feedback.textContent = data.message || 'Please check the information entered and try again.';
        feedback.className = 'form-feedback error';
        window.dataLayer.push({
          event: 'vmk_lead_form_error',
          error_message: data.message || 'Validation error'
        });
        return;
      }
    }

    // Handled failure: do not record false success conversion
    feedback.textContent = 'Unable to submit directly online. Please reach our team via WhatsApp at +91 85270 87270 or call +91 85270 87270.';
    feedback.className = 'form-feedback error';
    window.dataLayer.push({
      event: 'vmk_lead_form_failure',
      status: response ? response.status : 0
    });
  } catch (error) {
    feedback.textContent = 'Unable to connect to the booking server. Please call or message us on WhatsApp at +91 85270 87270.';
    feedback.className = 'form-feedback error';
    window.dataLayer.push({
      event: 'vmk_lead_form_network_error'
    });
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
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
