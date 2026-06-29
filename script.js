/* ══════════════════════════════════════════
   Abood & Loge — Interactive Experience
   Premium vanilla JS implementation
══════════════════════════════════════════ */

'use strict';

// ─── Global state ────────────────────────
const state = {
  introComplete: false,
  musicPlaying: false,
  matterEngine: null,
  lenis: null,
  secrets: { starsLongPress: false, heartHold: false },
  orientation: { x: 0, y: 0 }
};

const IMG_COUNT = 13;
const CAPTIONS = [
  'That moment','Still smiling','Worth it','Just us','Felt real',
  'Coming into focus','First spark','Pure joy','So warm','Side by side',
  'Every time','Deeper still','Always'
];

// ─── DOM refs ────────────────────────────
const bgCanvas    = document.getElementById('bg-canvas');
const cursorGlow  = document.getElementById('cursor-glow');
const cursorDot   = document.getElementById('cursor-dot');
const musicBtn    = document.getElementById('music-btn');
const audio       = document.getElementById('bg-audio');
const introEl     = document.getElementById('intro');
const mainEl      = document.getElementById('main-experience');
const heartEl     = document.getElementById('heart');
const heartContainer = document.getElementById('heart-container');
const introText   = document.getElementById('intro-text');
const toast       = document.getElementById('toast');

/* ═══════════════════════════════════════════
   1. BACKGROUND CANVAS — particles + orbs
═══════════════════════════════════════════ */
(function initBgCanvas() {
  const ctx  = bgCanvas.getContext('2d');
  const dpr  = Math.min(window.devicePixelRatio || 1, 2);
  const particles = [];
  const orbs = [];
  let W, H, raf;
  let mouse = { x: 0, y: 0 };

  function resize() {
    W = bgCanvas.width  = window.innerWidth * dpr;
    H = bgCanvas.height = window.innerHeight * dpr;
    bgCanvas.style.width  = window.innerWidth  + 'px';
    bgCanvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  }

  function createParticles() {
    particles.length = 0;
    const count = Math.min(Math.floor((W/dpr) * (H/dpr) / 14000), 90);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * (W/dpr),
        y: Math.random() * (H/dpr),
        r: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.25 + 0.05,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.7 ? 'gold' : 'white',
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  function createOrbs() {
    orbs.length = 0;
    const configs = [
      { x: 0.2, y: 0.3, r: 0.28, color: 'rgba(201,169,110,', speed: 0.00015 },
      { x: 0.8, y: 0.6, r: 0.22, color: 'rgba(244,194,194,', speed: 0.0002 },
      { x: 0.5, y: 0.8, r: 0.18, color: 'rgba(201,169,110,', speed: 0.00018 },
      { x: 0.15, y: 0.75, r: 0.16, color: 'rgba(255,255,255,', speed: 0.00012 },
    ];
    configs.forEach(c => {
      orbs.push({ ...c, phase: Math.random() * Math.PI * 2, cx: c.x, cy: c.y });
    });
  }

  function tick(t) {
    ctx.clearRect(0, 0, W/dpr, H/dpr);
    const vw = W/dpr, vh = H/dpr;

    // Draw orbs
    orbs.forEach(o => {
      const px = (o.cx + Math.sin(t * o.speed + o.phase) * 0.08) * vw;
      const py = (o.cy + Math.cos(t * o.speed * 0.7 + o.phase) * 0.06) * vh;
      const radius = o.r * Math.min(vw, vh) * 0.5;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0, o.color + '0.04)');
      grad.addColorStop(0.5, o.color + '0.02)');
      grad.addColorStop(1, o.color + '0)');
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI*2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Draw particles
    particles.forEach(p => {
      p.twinklePhase += p.twinkleSpeed;
      const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.twinklePhase));
      // Drift toward mouse slightly
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 200) {
        p.x += dx * 0.0003;
        p.y += dy * 0.0003;
      }
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed * 0.5;
      p.angle += (Math.random() - 0.5) * 0.02;
      if (p.x < 0) p.x = vw; if (p.x > vw) p.x = 0;
      if (p.y < 0) p.y = vh; if (p.y > vh) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.hue === 'gold'
        ? `rgba(201,169,110,${alpha})`
        : `rgba(240,235,224,${alpha})`;
      ctx.fill();
    });

    raf = requestAnimationFrame(tick);
  }

  resize();
  createParticles();
  createOrbs();
  raf = requestAnimationFrame(tick);

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); createParticles(); createOrbs(); }, 200);
  });
})();

/* ═══════════════════════════════════════════
   2. STARS IN INTRO
═══════════════════════════════════════════ */
(function createStars() {
  const container = document.getElementById('stars-container');
  const count = 120;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      --dur:${(Math.random()*3+2).toFixed(1)}s;
      --delay:${(Math.random()*4).toFixed(1)}s;
      --max-op:${(Math.random()*0.5+0.1).toFixed(2)};
    `;
    container.appendChild(s);
  }
})();

/* ═══════════════════════════════════════════
   3. CUSTOM CURSOR
═══════════════════════════════════════════ */
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  let cx = -200, cy = -200, gx = -200, gy = -200;

  window.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

  function animateCursor() {
    gx += (cx - gx) * 0.08;
    gy += (cy - gy) * 0.08;
    cursorGlow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
    cursorDot.style.transform  = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, [role=button], .t-node, .photo-inner').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.transform += ' scale(2.5)';
      cursorDot.style.background = 'var(--pink)';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.background = 'var(--gold)';
    });
  });
})();

/* ═══════════════════════════════════════════
   4. TOUCH RIPPLE + PARTICLES
═══════════════════════════════════════════ */
function spawnRipple(x, y, color = 'rgba(201,169,110,0.35)', size = 80) {
  const rc = document.getElementById('ripple-container');
  const r  = document.createElement('div');
  r.className = 'ripple';
  r.style.cssText = `
    left:${x}px;top:${y}px;
    width:${size}px;height:${size}px;
    background:radial-gradient(circle,${color} 0%,transparent 70%);
    border:1px solid ${color};
  `;
  rc.appendChild(r);
  setTimeout(() => r.remove(), 750);
}

function spawnParticles(x, y) {
  const count = 8;
  for (let i = 0; i < count; i++) {
    const p  = document.createElement('div');
    p.className = 'touch-particle';
    const angle = (i / count) * Math.PI * 2;
    const dist  = 30 + Math.random() * 40;
    const size  = Math.random() * 4 + 2;
    const colors = ['rgba(201,169,110,0.7)', 'rgba(244,194,194,0.6)', 'rgba(255,255,255,0.5)'];
    p.style.cssText = `
      left:${x}px;top:${y}px;
      width:${size}px;height:${size}px;
      background:${colors[i % colors.length]};
      --tx:${Math.cos(angle)*dist}px;
      --ty:${Math.sin(angle)*dist}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 850);
  }
}

document.addEventListener('click', e => {
  spawnRipple(e.clientX, e.clientY);
  spawnParticles(e.clientX, e.clientY);
});

document.addEventListener('touchstart', e => {
  Array.from(e.touches).forEach(t => {
    spawnRipple(t.clientX, t.clientY, 'rgba(244,194,194,0.3)', 60);
    spawnParticles(t.clientX, t.clientY);
  });
}, { passive: true });

/* ═══════════════════════════════════════════
   5. MUSIC
═══════════════════════════════════════════ */
musicBtn.addEventListener('click', () => {
  if (!audio.src || audio.networkState === HTMLMediaElement.NETWORK_EMPTY) return;
  if (state.musicPlaying) {
    audio.pause();
    musicBtn.classList.remove('playing');
    state.musicPlaying = false;
  } else {
    audio.volume = 0;
    audio.play().then(() => {
      state.musicPlaying = true;
      musicBtn.classList.add('playing');
      let vol = 0;
      const fade = setInterval(() => {
        vol = Math.min(vol + 0.02, 0.55);
        audio.volume = vol;
        if (vol >= 0.55) clearInterval(fade);
      }, 80);
    }).catch(() => {});
  }
});

/* ═══════════════════════════════════════════
   6. INTRO SEQUENCE
═══════════════════════════════════════════ */
function startIntroSequence() {
  // Phase 1: fade in text
  setTimeout(() => {
    gsap.to(introText, { opacity: 1, duration: 1.8, ease: 'power2.out' });
  }, 800);

  // Phase 2: fade out text, show heart
  setTimeout(() => {
    gsap.to(introText, {
      opacity: 0, y: -20, duration: 1.2, ease: 'power2.in',
      onComplete: () => {
        introText.style.display = 'none';
        gsap.to(heartContainer, { opacity: 1, duration: 1.2, ease: 'power2.out' });
      }
    });
  }, 3800);
}

startIntroSequence();

// Heart tap → begin
function beginExperience() {
  if (state.introComplete) return;
  state.introComplete = true;

  // Big heart burst
  const heartRect = heartEl.getBoundingClientRect();
  const hx = heartRect.left + heartRect.width / 2;
  const hy = heartRect.top  + heartRect.height / 2;
  for (let i = 0; i < 3; i++) {
    setTimeout(() => spawnRipple(hx, hy, 'rgba(201,169,110,0.5)', 120 + i * 80), i * 120);
  }
  spawnParticles(hx, hy);

  // Spawn floating hearts
  for (let i = 0; i < 12; i++) {
    const h = document.createElement('div');
    h.style.cssText = `
      position:fixed;left:${hx}px;top:${hy}px;font-size:${12 + Math.random()*14}px;
      color:rgba(244,194,194,0.8);pointer-events:none;z-index:9500;
    `;
    h.textContent = '♡';
    document.body.appendChild(h);
    const angle = (Math.random() * 2 - 1) * 2;
    const dist  = 100 + Math.random() * 200;
    gsap.to(h, {
      x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 150,
      opacity: 0, scale: 0.3, duration: 1.5 + Math.random(),
      ease: 'power2.out', delay: Math.random() * 0.3,
      onComplete: () => h.remove()
    });
  }

  // Transition out intro
  gsap.to(introEl, {
    opacity: 0, scale: 1.05, duration: 1, ease: 'power2.inOut',
    onComplete: () => {
      introEl.style.display = 'none';
      mainEl.classList.remove('hidden');
      mainEl.style.opacity = '0';
      initMainExperience();
      gsap.to(mainEl, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    }
  });
}

heartEl.addEventListener('click', beginExperience);
heartEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') beginExperience(); });

// Secret: hold heart for 2s
let heartHoldTimer;
heartEl.addEventListener('mousedown', () => {
  heartHoldTimer = setTimeout(() => {
    if (!state.secrets.heartHold) {
      state.secrets.heartHold = true;
      showToast('✦ Hidden moment unlocked');
      heartEl.style.filter = 'hue-rotate(180deg) drop-shadow(0 0 30px rgba(244,194,194,0.8))';
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const rect = heartEl.getBoundingClientRect();
          spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2);
        }, i * 80);
      }
    }
  }, 2000);
});
heartEl.addEventListener('mouseup', () => clearTimeout(heartHoldTimer));
heartEl.addEventListener('touchstart', () => {
  heartHoldTimer = setTimeout(() => {
    if (!state.secrets.heartHold) {
      state.secrets.heartHold = true;
      showToast('✦ Hidden moment unlocked');
    }
  }, 2000);
}, { passive: true });
heartEl.addEventListener('touchend', () => clearTimeout(heartHoldTimer));

/* ═══════════════════════════════════════════
   7. MAIN EXPERIENCE — ScrollTrigger animations
═══════════════════════════════════════════ */
function initMainExperience() {
  gsap.registerPlugin(ScrollTrigger);

  // ─── Lenis smooth scroll ───
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  state.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ─── Hero ───
  const nameA = document.querySelector('.name-a');
  const nameB = document.querySelector('.name-b');
  const amp   = document.querySelector('.amp');
  const subLine = document.querySelector('.sub-line');
  const scrollHint = document.querySelector('.scroll-hint');

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to(nameA, { opacity: 1, y: 0, duration: 1.2 }, 0.2)
    .to(amp,   { opacity: 1, duration: 0.8 }, 0.5)
    .to(nameB, { opacity: 1, y: 0, duration: 1.2 }, 0.4)
    .to(subLine, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 0.9)
    .to(scrollHint, { opacity: 1, duration: 0.8 }, 1.4);

  // ─── Photo 1: Fade Scale ───
  ScrollTrigger.create({
    trigger: '#photo-1',
    start: 'top 70%',
    onEnter: () => {
      gsap.to('.fade-scale-frame', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' });
    }
  });

  // ─── Story text blocks ───
  document.querySelectorAll('.story-text').forEach(block => {
    ScrollTrigger.create({
      trigger: block,
      start: 'top 75%',
      onEnter: () => {
        gsap.to(block.querySelectorAll('.story-line'), {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.25, ease: 'power2.out'
        });
      }
    });
  });

  // ─── Photo 2: 3D Card ───
  ScrollTrigger.create({
    trigger: '#photo-2',
    start: 'top 70%',
    onEnter: () => {
      gsap.to('.photo-card-3d', {
        opacity: 1, rotateY: 0, scale: 1,
        duration: 1.4, ease: 'power3.out'
      });
    }
  });

  // Tilt on mousemove
  const card3d = document.querySelector('.photo-card-3d');
  if (card3d && window.matchMedia('(hover: hover)').matches) {
    card3d.addEventListener('mousemove', e => {
      const rect = card3d.getBoundingClientRect();
      const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * -14;
      const ry = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
      gsap.to(card3d, { rotateX: rx, rotateY: ry, duration: 0.3, ease: 'power2.out', transformPerspective: 800 });
    });
    card3d.addEventListener('mouseleave', () => {
      gsap.to(card3d, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    });
  }

  // Double tap photo 2 secret
  let lastTap = 0;
  if (card3d) {
    card3d.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastTap < 350) {
        showToast('✦ You found a secret');
        gsap.to(card3d, { scale: 1.06, boxShadow: '0 0 60px rgba(201,169,110,0.4)', duration: 0.4, yoyo: true, repeat: 1 });
      }
      lastTap = now;
    });
  }

  // ─── Photo 3: Masked reveal ───
  ScrollTrigger.create({
    trigger: '#photo-3',
    start: 'top 65%',
    onEnter: () => {
      gsap.to('.mask-reveal', { clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: 'power4.inOut' });
      gsap.to('.mask-reveal img', { scale: 1, duration: 1.5, ease: 'power4.out', delay: 0.1 });
    }
  });

  // ─── Photo 4: Glass float ───
  ScrollTrigger.create({
    trigger: '#photo-4',
    start: 'top 70%',
    onEnter: () => {
      gsap.to('.glass-float-frame', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });
    }
  });
  gsap.set('.glass-float-frame', { y: 40 });

  // ─── Photo 5: Parallax ───
  ScrollTrigger.create({
    trigger: '#photo-5',
    start: 'top 70%',
    onEnter: () => {
      gsap.to('.parallax-img-container', { opacity: 1, duration: 1, ease: 'power2.out' });
    }
  });

  ScrollTrigger.create({
    trigger: '#photo-5',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: self => {
      const img = document.querySelector('.parallax-img');
      if (img) img.style.transform = `translateY(${-15 + self.progress * 30}%)`;
    }
  });

  // ─── Photo 6: Blur reveal ───
  ScrollTrigger.create({
    trigger: '#photo-6',
    start: 'top 65%',
    onEnter: () => {
      const blurPhoto = document.querySelector('.blur-photo');
      gsap.to(blurPhoto, { opacity: 1, duration: 0.6, ease: 'power2.out' });
      setTimeout(() => { if (blurPhoto) blurPhoto.classList.add('revealed'); }, 400);
    }
  });

  // ─── Timeline ───
  ScrollTrigger.create({
    trigger: '#scene-timeline',
    start: 'top 60%',
    onEnter: initTimeline
  });

  // ─── Photo 7: Depth reveal ───
  ScrollTrigger.create({
    trigger: '#photo-7',
    start: 'top 65%',
    onEnter: () => {
      gsap.to('.depth-bg', { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' });
      gsap.to('.depth-frame', { opacity: 1, scale: 1, duration: 1.6, ease: 'power3.out', delay: 0.3 });
    }
  });

  // ─── Physics Polaroids ───
  ScrollTrigger.create({
    trigger: '#scene-polaroids',
    start: 'top 60%',
    once: true,
    onEnter: initPolaroids
  });

  // ─── Appreciation ───
  ScrollTrigger.create({
    trigger: '#scene-appreciation',
    start: 'top 60%',
    onEnter: initAppreciation
  });

  // ─── Finale ───
  ScrollTrigger.create({
    trigger: '#scene-finale',
    start: 'top 60%',
    once: true,
    onEnter: initFinale
  });

  // ─── Scroll label hide ───
  ScrollTrigger.create({
    trigger: '#scene-hero',
    start: 'bottom 70%',
    onEnter: () => gsap.to(scrollHint, { opacity: 0, duration: 0.4 })
  });
}

/* ═══════════════════════════════════════════
   8. TIMELINE
═══════════════════════════════════════════ */
function initTimeline() {
  const nodes    = document.querySelectorAll('.t-node');
  const contents = document.querySelectorAll('.t-content');
  const bar      = document.querySelector('#timeline-progress-bar::after') || document.getElementById('timeline-progress-bar');
  let current    = 0;
  let isDragging = false;
  let dragStart  = 0;

  function goTo(idx) {
    if (idx === current) return;
    nodes[current].classList.remove('active');
    contents[current].classList.remove('active');
    current = Math.max(0, Math.min(idx, nodes.length - 1));
    nodes[current].classList.add('active');
    contents[current].classList.add('active');
    // Update progress bar via inline style
    bar.style.setProperty('--progress', `${(current / (nodes.length - 1)) * 100}%`);
    bar.setAttribute('data-progress', current);
    // Reflow hack for ::after width
    updateProgressBar(current);
  }

  function updateProgressBar(idx) {
    const pct = (idx / (nodes.length - 1)) * 100;
    // Inject dynamic style
    let styleTag = document.getElementById('timeline-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'timeline-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `#timeline-progress-bar::after { width: ${pct}% !important; }`;
  }

  updateProgressBar(0);

  nodes.forEach((node, i) => {
    node.addEventListener('click', () => goTo(i));
  });

  // Drag on track
  const track = document.getElementById('timeline-track');
  const handleDrag = e => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = track.getBoundingClientRect();
    const pct  = (clientX - rect.left) / rect.width;
    const idx  = Math.round(pct * (nodes.length - 1));
    goTo(Math.max(0, Math.min(idx, nodes.length - 1)));
  };

  track.addEventListener('mousedown', e => { isDragging = true; dragStart = e.clientX; handleDrag(e); });
  track.addEventListener('touchstart', e => { isDragging = true; handleDrag(e); }, { passive: true });
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('touchmove', handleDrag, { passive: true });
  window.addEventListener('mouseup',  () => { isDragging = false; });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Keyboard nav
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
  });

  // Animate in
  gsap.from('#scene-timeline .section-label', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' });
  gsap.from('#timeline-track', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: 0.2 });
}

/* ═══════════════════════════════════════════
   9. PHYSICS POLAROIDS (Matter.js)
═══════════════════════════════════════════ */
function initPolaroids() {
  const section  = document.getElementById('scene-polaroids');
  const canvas   = document.getElementById('matter-canvas');
  const W = section.offsetWidth;
  const H = section.offsetHeight;
  canvas.width  = W;
  canvas.height = H;

  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events } = Matter;

  const engine   = Engine.create({ gravity: { y: 0.6 } });
  const renderer = Render.create({
    canvas,
    engine,
    options: {
      width: W, height: H,
      wireframes: false,
      background: 'transparent'
    }
  });

  state.matterEngine = engine;

  // Walls
  const walls = [
    Bodies.rectangle(W/2, H + 30, W * 2, 60, { isStatic: true, render: { fillStyle: 'transparent' } }),
    Bodies.rectangle(-30, H/2, 60, H * 2,    { isStatic: true, render: { fillStyle: 'transparent' } }),
    Bodies.rectangle(W+30, H/2, 60, H * 2,   { isStatic: true, render: { fillStyle: 'transparent' } }),
  ];
  World.add(engine.world, walls);

  // Polaroid images: use imgs 1,2,3 for physics
  const polaroidImgs = ['1 Medium.jpeg', '2 Medium.jpeg', '3 Medium.jpeg'];
  const bodies = [];

  polaroidImgs.forEach((src, i) => {
    const x = 80 + Math.random() * (W - 160);
    const y = -100 - i * 160;
    const angle = (Math.random() - 0.5) * 0.6;
    const pw = Math.min(160, W * 0.35);
    const ph = pw * 1.1; // polaroid ratio

    const img = new Image();
    img.src = `Imgs/${src}`;

    const body = Bodies.rectangle(x, y, pw, ph, {
      restitution: 0.3,
      friction: 0.8,
      frictionAir: 0.04,
      angle,
      render: {
        sprite: {
          texture: img.src,
          xScale: pw / 300,
          yScale: ph / 300
        },
        fillStyle: '#1a1a22',
        strokeStyle: 'rgba(201,169,110,0.3)',
        lineWidth: 1
      },
      label: `polaroid-${i}`
    });

    bodies.push(body);
    World.add(engine.world, body);
  });

  // Mouse constraint
  const mouse = Mouse.create(canvas);
  const mc    = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
  });
  World.add(engine.world, mc);
  renderer.mouse = mouse;

  // Custom render: draw polaroid frame + image
  Events.on(renderer, 'afterRender', () => {
    const ctx = renderer.context;
    bodies.forEach(body => {
      const { x, y } = body.position;
      const pw = Math.min(160, W * 0.35);
      const ph = pw * 1.1;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(body.angle);

      // Polaroid white border
      ctx.fillStyle = '#f0ebe0';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.fillRect(-pw/2, -ph/2, pw, ph);

      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      // Image area
      const padding = pw * 0.06;
      const imgH = ph * 0.72;
      ctx.fillStyle = '#888';
      ctx.fillRect(-pw/2 + padding, -ph/2 + padding, pw - padding*2, imgH);

      // Caption area
      ctx.fillStyle = '#1a1a22';
      ctx.font = `${Math.max(8, pw*0.07)}px 'Cormorant Garamond', Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✦', 0, ph/2 - padding * 1.2);

      ctx.restore();
    });
  });

  Render.run(renderer);
  const runner = Runner.create();
  Runner.run(runner, engine);

  // Show label
  gsap.from('#scene-polaroids .section-label', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' });

  // Secret: swipe down to "throw" all polaroids
  let touchStartY = 0;
  section.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  section.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (dy > 80) {
      showToast('✦ Physics unlocked!');
      bodies.forEach(b => Body.setVelocity(b, { x: (Math.random()-0.5)*15, y: -Math.random()*10 }));
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════
   10. APPRECIATION
═══════════════════════════════════════════ */
function initAppreciation() {
  const heartsField = document.getElementById('hearts-field');

  // Animate in
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('#scene-appreciation .section-label', { opacity: 0.7, y: 0, duration: 0.8 })
    .to('.thanks-title', { opacity: 1, y: 0, duration: 1 }, 0.3)
    .to('.thanks-divider', { opacity: 1, duration: 0.6 }, 0.7)
    .to('#thanks-jana span', { opacity: 1, duration: 1.1 }, 0.5)
    .to('#thanks-kinda span', { opacity: 1, duration: 1.1 }, 0.7)
    .to('.thanks-sub', { opacity: 1, y: 0, duration: 0.8 }, 1.0);

  gsap.set(['#scene-appreciation .section-label', '.thanks-title', '.thanks-sub'], { y: 30 });

  // Glow rings
  setTimeout(() => {
    gsap.to('.name-glow-ring', { opacity: 1, duration: 1.5, stagger: 0.3, ease: 'power2.inOut',
      repeat: -1, yoyo: true });
  }, 1000);

  // Floating hearts
  function spawnFloatingHeart() {
    const h = document.createElement('div');
    h.className = 'floating-heart';
    h.textContent = Math.random() > 0.5 ? '♡' : '✦';
    h.style.cssText = `
      left:${10 + Math.random() * 80}%;
      bottom: 0;
      --dur:${(3 + Math.random()*3).toFixed(1)}s;
      --delay:0s;
      font-size:${0.7 + Math.random()*0.8}rem;
    `;
    heartsField.appendChild(h);
    setTimeout(() => h.remove(), 7000);
  }

  const heartInterval = setInterval(spawnFloatingHeart, 600);
  ScrollTrigger.create({
    trigger: '#scene-finale',
    start: 'top bottom',
    onEnter: () => clearInterval(heartInterval)
  });

  // Secret: long press on Jana/Kinda names
  ['thanks-jana', 'thanks-kinda'].forEach(id => {
    let timer;
    const el = document.getElementById(id);
    el.addEventListener('mousedown', () => {
      timer = setTimeout(() => {
        showToast('✦ Thank you Jana & Kinda 💫');
        for (let i = 0; i < 5; i++) setTimeout(spawnFloatingHeart, i * 100);
      }, 1500);
    });
    el.addEventListener('mouseup', () => clearTimeout(timer));
    el.addEventListener('touchstart', () => {
      timer = setTimeout(() => {
        showToast('✦ Thank you Jana & Kinda 💫');
      }, 1500);
    }, { passive: true });
    el.addEventListener('touchend', () => clearTimeout(timer));
  });
}

/* ═══════════════════════════════════════════
   11. FINALE — Canvas Collage
═══════════════════════════════════════════ */
function initFinale() {
  const canvas = document.getElementById('collage-canvas');
  const ctx    = canvas.getContext('2d');
  const section = document.getElementById('scene-finale');

  let W = section.offsetWidth;
  let H = section.offsetHeight;
  canvas.width  = W;
  canvas.height = H;

  const images = [];
  const positions = [];
  let loaded = 0;
  let animPhase = 0; // 0=gather, 1=hold, 2=text
  let startTime = null;
  let rafId;

  const finalText = document.getElementById('finale-text');

  const FINALE_COUNT = 12; // exactly 12 photos placed around the name

  // Layout: a ring of 12 equal squares around the centered name/text
  function calcLayout() {
    const cols = W < 700 ? 3 : 4;
    const rows = 4;
    const cellW = W / cols;
    const cellH = H / rows;
    // Match the square photo size used elsewhere on the site, capped to fit the screen
    const matchSize = Math.min(420, W * 0.8);
    const size = Math.min(cellW, cellH, matchSize) * 0.86;

    const centerCols = cols === 3 ? [1] : [1, 2];
    const centerRows = [1, 2];

    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (centerRows.includes(r) && centerCols.includes(c)) continue; // reserved for #finale-text
        slots.push({
          tx: cellW * (c + 0.5),
          ty: cellH * (r + 0.5)
        });
      }
    }

    positions.length = 0;
    for (let i = 0; i < FINALE_COUNT; i++) {
      const slot = slots[i % slots.length];
      positions.push({
        tx: slot.tx,
        ty: slot.ty,
        sx: (Math.random() - 0.5) * W * 2,
        sy: (Math.random() - 0.5) * H * 2,
        w: size, h: size,
        rot: (Math.random() - 0.5) * 0.04,
        scale: 1
      });
    }
  }

  // Load images
  for (let i = 1; i <= FINALE_COUNT; i++) {
    const img = new Image();
    img.src = `Imgs/${i} Medium.jpeg`;
    img.onload = () => { loaded++; if (loaded === FINALE_COUNT) startCollageAnim(); };
    img.onerror = () => { loaded++; if (loaded === FINALE_COUNT) startCollageAnim(); };
    images.push(img);
  }

  calcLayout();

  function startCollageAnim() {
    animPhase = 0;
    startTime = null;
    rafId = requestAnimationFrame(drawFrame);
  }

  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function lerp(a, b, t)  { return a + (b - a) * t; }

  function drawFrame(now) {
    if (!startTime) startTime = now;
    const elapsed = (now - startTime) / 1000;
    const dur = 2.2;
    const progress = Math.min(elapsed / dur, 1);
    const t = easeOutExpo(progress);

    ctx.clearRect(0, 0, W, H);

    // Slight zoom out over time
    const zoom = 1 + (1 - progress) * 0.06;
    ctx.save();
    ctx.translate(W/2, H/2);
    ctx.scale(zoom, zoom);
    ctx.translate(-W/2, -H/2);

    positions.forEach((pos, i) => {
      const img = images[i];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cx = lerp(pos.sx + W/2, pos.tx, t);
      const cy = lerp(pos.sy + H/2, pos.ty, t);
      const rot = lerp(pos.rot * 3, pos.rot * 0.2, t);
      const alpha = Math.min(1, t * 1.5);
      const scale = lerp(0.3, pos.scale, t);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      const dw = pos.w * scale, dh = pos.h * scale;

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;

      // Rounded rect clip
      const rr = 10;
      ctx.beginPath();
      ctx.moveTo(-dw/2 + rr, -dh/2);
      ctx.arcTo(dw/2, -dh/2, dw/2, dh/2, rr);
      ctx.arcTo(dw/2, dh/2, -dw/2, dh/2, rr);
      ctx.arcTo(-dw/2, dh/2, -dw/2, -dh/2, rr);
      ctx.arcTo(-dw/2, -dh/2, dw/2, -dh/2, rr);
      ctx.closePath();
      ctx.clip();
      ctx.shadowBlur = 0;

      // Center-crop the source image to a square so it never stretches
      const iw2 = img.naturalWidth, ih2 = img.naturalHeight;
      const srcSize = Math.min(iw2, ih2);
      const sx0 = (iw2 - srcSize) / 2;
      const sy0 = (ih2 - srcSize) / 2;
      ctx.drawImage(img, sx0, sy0, srcSize, srcSize, -dw/2, -dh/2, dw, dh);

      // Gold overlay shimmer
      const shimmer = ctx.createLinearGradient(-dw/2, -dh/2, dw/2, dh/2);
      shimmer.addColorStop(0, 'rgba(201,169,110,0.0)');
      shimmer.addColorStop(0.5, 'rgba(201,169,110,0.06)');
      shimmer.addColorStop(1, 'rgba(201,169,110,0.0)');
      ctx.fillStyle = shimmer;
      ctx.fillRect(-dw/2, -dh/2, dw, dh);

      ctx.restore();
    });

    ctx.restore();

    if (progress < 1) {
      rafId = requestAnimationFrame(drawFrame);
    } else {
      // Show finale text
      gsap.to(finalText, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' });
      gsap.set(finalText, { y: 20 });
    }
  }

  // Keep bg particles visible
  section.style.position = 'relative';
}

/* ═══════════════════════════════════════════
   12. DEVICE ORIENTATION
═══════════════════════════════════════════ */
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', e => {
    state.orientation.x = e.beta  ? e.beta  / 90 : 0;  // -1 to 1
    state.orientation.y = e.gamma ? e.gamma / 90 : 0;  // -1 to 1

    // Subtle parallax on hero names
    const nameA = document.querySelector('.name-a');
    const nameB = document.querySelector('.name-b');
    if (nameA && state.introComplete) {
      gsap.to(nameA, { x: state.orientation.y * -8, y: state.orientation.x * 4, duration: 0.5, ease: 'power2.out' });
      gsap.to(nameB, { x: state.orientation.y *  8, y: state.orientation.x * 4, duration: 0.5, ease: 'power2.out' });
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════
   13. MAGNETIC BUTTONS
═══════════════════════════════════════════ */
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('#music-btn, .t-node').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width/2)  * 0.3;
      const dy = (e.clientY - rect.top  - rect.height/2) * 0.3;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    });
  });
}

/* ═══════════════════════════════════════════
   14. TOAST
═══════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ═══════════════════════════════════════════
   15. SECRET — STAR LONG PRESS
═══════════════════════════════════════════ */
let starPressTimer;
document.getElementById('stars-container').addEventListener('mousedown', () => {
  starPressTimer = setTimeout(() => {
    if (!state.secrets.starsLongPress) {
      state.secrets.starsLongPress = true;
      showToast('✦ The stars remember too');
      // Rainbow stars for 3s
      document.querySelectorAll('.star').forEach(s => {
        gsap.to(s, { background: `hsl(${Math.random()*360},80%,80%)`, duration: 0.5, yoyo: true, repeat: 5 });
      });
    }
  }, 2000);
});
document.addEventListener('mouseup', () => clearTimeout(starPressTimer));

/* ═══════════════════════════════════════════
   16. VISIBILITY / CLEANUP
═══════════════════════════════════════════ */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.musicPlaying) {
    // Don't pause — user may want BG music
  }
});

/* ═══════════════════════════════════════════
   16b. QUOTE CARDS — tap to flip
═══════════════════════════════════════════ */
(function initQuoteCards() {
  const cards = document.querySelectorAll('.quote-card');
  cards.forEach(card => {
    function flip() {
      card.classList.toggle('flipped');
      const rect = card.getBoundingClientRect();
      spawnRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    card.addEventListener('click', flip);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });
})();

// Preload first image immediately
const preloadFirst = new Image();
preloadFirst.src = 'Imgs/1 Medium.jpeg';