import * as THREE from 'three';

const canvas = document.querySelector('#home-scene');
const fallback = document.querySelector('.scene-fallback');
const sceneButtons = [...document.querySelectorAll('.scene-option')];
let sceneController = null;

function initHomeScene() {
  if (!canvas || !window.WebGLRenderingContext) return;
  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#c9d0c0');
    scene.fog = new THREE.Fog('#c9d0c0', 12, 24);
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    camera.position.set(8, 6.8, 10);
    camera.lookAt(0, 1.25, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    scene.add(new THREE.HemisphereLight('#f7f5e9', '#64715d', 2.0));
    const sun = new THREE.DirectionalLight('#fff0d4', 3.2);
    sun.position.set(-5, 9, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
    const ambientGlow = new THREE.PointLight('#d5f36a', 0, 8); ambientGlow.position.set(0,3,0); scene.add(ambientGlow);

    const mat = (color, roughness=.75, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
    const floorMat = mat('#c8cbbd'), wallMat = mat('#e8e5d9'), darkMat = mat('#343d35'), woodMat = mat('#a77d58'), fabricMat = mat('#d7d0bd');
    const glassMat = new THREE.MeshPhysicalMaterial({color:'#b6d2d0',roughness:.12,metalness:.05,transparent:true,opacity:.32});
    const warmMat = new THREE.MeshStandardMaterial({color:'#f2d79b',emissive:'#efb94d',emissiveIntensity:1.2});
    const house = new THREE.Group(); scene.add(house);
    function block(parent, name, size, position, material, cast=true) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.name=name; mesh.position.set(...position); mesh.castShadow=cast; mesh.receiveShadow=true; parent.add(mesh); return mesh;
    }
    // Floating architectural plinth and open-plan room shell.
    block(house,'foundation',[8.4,.25,6.2],[0,-.12,0],darkMat);
    block(house,'floor',[8.15,.12,5.95],[0,.06,0],floorMat);
    block(house,'rear wall',[8,.18,.18],[0,2.15,-2.88],wallMat);
    block(house,'left wall',[.18,2.15,5.8],[-3.95,1.12,0],wallMat);
    block(house,'right return',[.18,1.6,2.7],[3.95,.86,-1.45],wallMat);
    block(house,'front side wall',[.18,1.35,1.4],[3.95,.73,2.2],wallMat);
    // Window glazing, mullions and a thin roof frame.
    block(house,'panoramic glass',[.055,1.85,3.8],[3.82,1.18,.15],glassMat,false);
    for(let z=-1.65;z<=1.8;z+=1.75) block(house,'window mullion',[.08,1.95,.055],[3.78,1.18,z],darkMat,false);
    block(house,'roof beam',[8.1,.12,.16],[0,2.35,-2.82],darkMat);
    // Living zone: sofa, cushions, coffee table and rug.
    block(house,'rug',[3.2,.035,2.05],[-1.2,.15,.9],mat('#d6d0c1'));
    block(house,'sofa base',[2.5,.42,.82],[-1.45,.42,1.35],fabricMat);
    block(house,'sofa back',[2.5,.8,.2],[-1.45,.91,1.72],fabricMat);
    for(let x=-2.35;x<=-.55;x+=.9) block(house,'sofa cushion',[.78,.16,.68],[x,.72,1.32],mat('#aaa995'));
    block(house,'coffee table',[1.45,.12,.85],[-1.1,.55,-.05],woodMat);
    for(const x of [-1.7,-.5]) for(const z of [-.35,.35]) block(house,'table leg',[.07,.4,.07],[x,.32,z-.05],darkMat);
    // Dining zone and kitchen island.
    block(house,'island',[1.65,.88,.85],[1.55,.53,-1.45],mat('#e5e0d3'));
    block(house,'island top',[1.8,.08,1],[1.55,1.01,-1.45],mat('#777f70',.35));
    for(const x of [.8,2.2]) block(house,'stool seat',[.42,.12,.42],[x,.5,-.35],woodMat);
    for(const x of [.8,2.2]) block(house,'stool stem',[.06,.43,.06],[x,.25,-.35],darkMat);
    // Pendant lamps.
    for(const x of [-1.4,1.4]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.7,8),darkMat); cord.position.set(x,1.95,-1.8); house.add(cord);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.16,18,12),warmMat); lamp.position.set(x,1.55,-1.8); house.add(lamp);
    }
    // Motorized curtain panels, animate their positions per scene.
    const curtainL = block(house,'left curtain',[.16,1.95,1.55],[3.66,1.18,-1.1],mat('#8e9a82'));
    const curtainR = block(house,'right curtain',[.16,1.95,1.55],[3.66,1.18,1.15],mat('#8e9a82'));
    // Small indoor plant.
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(.19,.15,.32,16),mat('#a57c5c')); pot.position.set(-3.25,.3,-2.15); house.add(pot);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(.48,16,12),mat('#607c55')); leaves.position.set(-3.25,.9,-2.15); leaves.scale.set(.8,1.35,.8); house.add(leaves);
    // Warm floor wash strips.
    const stripMat = new THREE.MeshStandardMaterial({color:'#d5f36a',emissive:'#b6db4c',emissiveIntensity:.9});
    block(house,'light strip',[5.8,.025,.035],[0,.16,-2.72],stripMat,false);
    house.rotation.y=-.12;

    const state = { scene:'morning', targetX:0, targetY:0, curtains:0 };
    function applyScene(mode) {
      state.scene=mode;
      const presets = {
        morning:{bg:'#c9d0c0',ambient:2.0,sun:3.2,exposure:1.12,glow:0,curtain:0,light:'#fff0d4'},
        movie:{bg:'#29342f',ambient:.65,sun:.3,exposure:.9,glow:1.8,curtain:1,light:'#e6a85c'},
        away:{bg:'#a9b1a4',ambient:1.05,sun:1.2,exposure:1,glow:.25,curtain:.6,light:'#d5f36a'},
        evening:{bg:'#777e71',ambient:1.0,sun:.55,exposure:.95,glow:1.1,curtain:.25,light:'#f2b76b'}
      };
      const p=presets[mode]||presets.morning;
      scene.background.set(p.bg); scene.fog.color.set(p.bg);
      scene.children.find(o=>o.isHemisphereLight).intensity=p.ambient;
      sun.intensity=p.sun; ambientGlow.intensity=p.glow; renderer.toneMappingExposure=p.exposure;
      warmMat.emissive.set(p.light);
      curtainL.position.z=THREE.MathUtils.lerp(-1.1,-2.35,p.curtain);
      curtainR.position.z=THREE.MathUtils.lerp(1.15,2.35,p.curtain);
      sceneButtons.forEach(b=>{const active=b.dataset.scene===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    }
    sceneController={applyScene};
    sceneButtons.forEach(b=>b.addEventListener('click',()=>applyScene(b.dataset.scene)));
    applyScene('morning');

    const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
    let pointerX=0,pointerY=0;
    canvas.parentElement.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointerX=((e.clientX-r.left)/r.width-.5);pointerY=((e.clientY-r.top)/r.height-.5);});
    canvas.parentElement.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
    const clock=new THREE.Clock();
    function render(){const t=clock.getElapsedTime();house.rotation.y=-.12+Math.sin(t*.22)*.035+pointerX*.055;house.rotation.x=pointerY*-.025;camera.position.y=6.8+Math.sin(t*.3)*.08;camera.lookAt(0,1.05,0);renderer.render(scene,camera);requestAnimationFrame(render);}
    render();
    if(fallback) fallback.style.opacity='0';
  } catch(error) {
    console.warn('3D home preview unavailable; showing static fallback.',error);
  }
}
initHomeScene();

// Navigation, mobile menu and anchor close.
const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.desktop-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'×':'☰';});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');menuButton.textContent='☰';}));

// Reveal sections as they enter view.
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');revealObserver.unobserve(entry.target);}}),{threshold:.1});
document.querySelectorAll('.section-heading,.solution-card,.day-card,.product-card,.why-list>div,.process-grid article,.faq-list details').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el);});

// Lead capture retains the existing VMK process-lead.php endpoint and field names.
const leadForm=document.querySelector('#vmk-lead-form');
const feedback=document.querySelector('#form-feedback');
const submit=leadForm?.querySelector('button[type="submit"]');
leadForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!leadForm.reportValidity())return;
  submit.disabled=true;submit.querySelector('span').textContent='Sending your request…';
  feedback.textContent='';feedback.className='form-feedback';
  try{
    const response=await fetch(leadForm.getAttribute('action'),{method:'POST',body:new FormData(leadForm),headers:{'X-Requested-With':'XMLHttpRequest'}});
    const data=await response.json();
    feedback.textContent=data.message|| (data.success?'Thank you.':'Please try again.');
    feedback.classList.add(data.success?'success':'error');
    if(data.success)leadForm.reset();
  }catch(error){
    feedback.textContent='We could not send your enquiry right now. Please contact us on WhatsApp at +91 85270 87270.';
    feedback.classList.add('error');
  }finally{submit.disabled=false;submit.querySelector('span').textContent='Request my consultation';}
});
document.querySelector('#year').textContent=new Date().getFullYear();

// Capture Google Ads attribution parameters into hidden fields for the lead form.
const params=new URLSearchParams(location.search);
['gclid','gbraid','wbraid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(key=>{
  const value=params.get(key);if(!value)return;
  const input=document.createElement('input');input.type='hidden';input.name=key;input.value=value;leadForm?.appendChild(input);
});

// Track CTA clicks as dataLayer events if Google Tag Manager / gtag is installed.
document.querySelectorAll('a[href="#consultation"],a[href^="https://wa.me/"]').forEach(link=>{
  link.addEventListener('click',()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'vmk_lead_cta_click',cta_text:link.textContent.trim()});});
});
