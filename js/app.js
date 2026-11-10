'use strict';
/* ═══════════════════════════════════════════════════════════════════════════════
   Nitin & Amulya — invitation behaviour.
   Motion (vendor/motion.js, the library behind Framer Motion) drives springs, staggers,
   in-view reveals and scroll-linked camera moves. Everything 3D degrades gracefully:
   no Motion / reduced-motion → the content is simply shown, flat.
   Depends on: Motion, CONFIG + I18N (config-i18n.js), Music (music.js).
   ═══════════════════════════════════════════════════════════════════════════════ */
(() => {

const root = document.documentElement;
root.classList.add('has-env');                 // first action: lets the CSS show the intro overlay

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const M = window.Motion || null;
const { animate, scroll, inView, stagger, press } = M || {};
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
const fx = !!M && !reduce;                      // true → run the 3D / motion layer
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const safe = (name, fn) => { try { fn(); } catch (e) { console.error('[invite:' + name + ']', e); } };
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const EASE = [.2, .75, .2, 1];

/* ─────────────────────────────  Language  ───────────────────────────── */
let lang = store.get('invite-lang') === 'en' ? 'en' : 'kn';   // Kannada is the default
const t = key => I18N[lang][key] ?? I18N.en[key] ?? '';

function applyLang() {
  root.lang = lang === 'kn' ? 'kn' : 'en';
  document.body.classList.toggle('lang-kn', lang === 'kn');
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('[data-i18n-alt]').forEach(el => el.setAttribute('alt', t(el.dataset.i18nAlt)));
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#rsvpBtn').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(t('rsvpMsg'));
}
function setLang(next) {
  if (next === lang) return;
  lang = next;
  store.set('invite-lang', lang);
  if (reduce) { applyLang(); return; }
  document.body.classList.add('swapping');
  setTimeout(() => { applyLang(); document.body.classList.remove('swapping'); }, 200);
}
$$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
applyLang();

/* ─────────────────────────────  Calendar link  ───────────────────────────── */
safe('calendar', () => {
  const start = new Date(CONFIG.weddingStart);
  const end = new Date(start.getTime() + CONFIG.weddingHours * 3600e3);
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  $('#calBtn').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(CONFIG.calendarTitle)
    + '&dates=' + fmt(start) + '/' + fmt(end)
    + '&location=' + encodeURIComponent(CONFIG.calendarPlace);
});

/* ─────────────────────────────  Decorative SVG  ───────────────────────────── */
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

function buildMandala(svg) {
  const g = svgEl('g', { transform: 'translate(300 300)' });
  // [petal count, inner radius, petal length, petal half-width]
  [[10, 34, 26, 9], [16, 70, 40, 13], [24, 118, 48, 15], [32, 175, 56, 16], [48, 238, 44, 10]].forEach(([n, r, len, w], k) => {
    g.appendChild(svgEl('circle', { cx: 0, cy: 0, r }));
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i + (k % 2 ? 180 / n : 0);
      g.appendChild(svgEl('path', {
        d: `M0 ${-r}C${w} ${-r - len * .35} ${w * .6} ${-r - len * .85} 0 ${-r - len}C${-w * .6} ${-r - len * .85} ${-w} ${-r - len * .35} 0 ${-r}`,
        transform: `rotate(${a})`
      }));
      if (k > 1) g.appendChild(svgEl('circle', { class: 'dot', cx: 0, cy: -(r + len + 7), r: 1.8, transform: `rotate(${a + 180 / n})` }));
    }
  });
  g.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 290, 'stroke-dasharray': '2 6' }));
  svg.appendChild(g);
}
safe('mandala', () => { buildMandala($('#mandala')); buildMandala($('#worldMandala')); });

safe('toran', () => {
  const svg = $('#toran');
  const y = tt => (1 - tt) ** 2 * 6 + 2 * (1 - tt) * tt * 64 + tt * tt * 6;
  const leaves = svgEl('g', {}), flowers = svgEl('g', {}), strands = svgEl('g', {});
  svg.appendChild(svgEl('path', { d: 'M0 6Q600 64 1200 6', fill: 'none', stroke: '#C9A84C', 'stroke-width': 1.5 }));
  const N = 60;
  const marigold = (x, yy, r, c1, c2) => {
    const g = svgEl('g', {});
    g.appendChild(svgEl('circle', { cx: x, cy: yy, r, fill: c1 }));
    g.appendChild(svgEl('circle', { cx: x, cy: yy, r: r * .62, fill: c2 }));
    g.appendChild(svgEl('circle', { cx: x - r * .25, cy: yy - r * .3, r: r * .22, fill: '#FFD27A', opacity: .7 }));
    return g;
  };
  for (let i = 0; i <= N; i++) {
    const tt = i / N, x = 1200 * tt, yy = y(tt);
    if (i % 2 === 0) {
      const rot = (i % 4 ? -1 : 1) * 10;
      leaves.appendChild(svgEl('path', {
        d: `M${x} ${yy}c7 8 8 22 0 34c-8-12-7-26 0-34z`, fill: '#2C6A3D', stroke: '#1C4A2A', 'stroke-width': .8,
        transform: `rotate(${rot} ${x} ${yy})`
      }));
    }
    flowers.appendChild(marigold(x, yy, 9, i % 3 ? '#F2A21B' : '#E8771E', i % 3 ? '#E07B12' : '#C85A10'));
    if (i % 6 === 3) {
      const s = svgEl('g', { class: 'strand' });
      s.style.animationDelay = (-(i % 5) * .6) + 's';
      const len = 34 + (i % 4) * 8;
      s.appendChild(svgEl('path', { d: `M${x} ${yy}V${yy + len}`, stroke: '#C9A84C', 'stroke-width': 1 }));
      for (let k = 1; k <= 3; k++) s.appendChild(marigold(x, yy + (len / 3) * k - 4, 7, k % 2 ? '#E8771E' : '#F2A21B', k % 2 ? '#C85A10' : '#E07B12'));
      s.appendChild(svgEl('path', { d: `M${x - 6} ${yy + len + 14}q6-14 12 0z`, fill: '#C9A84C' }));
      s.appendChild(svgEl('circle', { cx: x, cy: yy + len + 16, r: 2, fill: '#EBD592' }));
      strands.appendChild(s);
    }
  }
  svg.append(leaves, strands, flowers);
});

/* ─────────────────────────────  Tilt input: mouse, or phone gyro  ─────────────────────────────
   One shared normalised (-1..1) signal that the envelope, the hero stage and the petals all read. */
const Tilt = (() => {
  const s = { x: 0, y: 0, t: 0 };
  let g0 = null, b0 = null, gyroOn = false;
  const set = (x, y) => { s.x = clamp(x, -1, 1); s.y = clamp(y, -1, 1); s.t = performance.now(); };
  if (!coarse) addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') set((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2);
  }, { passive: true });
  function enableGyro() {
    if (gyroOn) return; gyroOn = true;
    addEventListener('deviceorientation', e => {
      if (e.gamma == null || e.beta == null) return;
      if (g0 === null) { g0 = e.gamma; b0 = e.beta; }          // calibrate to however the phone is held
      set((e.gamma - g0) / 20, (e.beta - b0) / 20);
    }, { passive: true });
  }
  // must be called from a tap: iOS only shows its motion-permission prompt inside a user gesture
  function request() {
    const D = window.DeviceOrientationEvent;
    if (!D) return;
    if (typeof D.requestPermission === 'function') D.requestPermission().then(r => { if (r === 'granted') enableGyro(); }).catch(() => {});
    else enableGyro();
  }
  return { s, request };
})();

/* ─────────────────────────────  Hero: names, depth stage  ───────────────────────────── */
const hero = $('#home'), stage = $('#heroStage'), names = $('.names'), heroInner = $('.hero-inner');
const heroState = { cx: 0, cy: 0 };

// Solid gold lettering: copies of the name stacked back along Z, darker the deeper they sit,
// plus three orbiting gold rings around it (an armillary sphere).
safe('names3d', () => {
  const N = coarse ? 9 : 14, DEPTH = coarse ? 24 : 28;      // fewer layers on phones (each one is its own GPU texture)
  const from = [128, 90, 22], to = [44, 29, 5];
  const shade = k => 'rgb(' + from.map((c, i) => Math.round(c + (to[i] - c) * k)).join(',') + ')';
  $$('.front', names).forEach(face => {
    for (let i = N; i >= 1; i--) {
      const c = face.cloneNode(true);
      c.classList.remove('front'); c.classList.add('ext');
      c.setAttribute('aria-hidden', 'true');
      c.style.setProperty('--ez', (-i * DEPTH / N).toFixed(2) + 'px');
      c.style.setProperty('--ec', shade(i / N));
      names.insertBefore(c, face);
    }
  });
  const orbit = document.createElement('div');
  orbit.className = 'h-orbit';
  orbit.setAttribute('aria-hidden', 'true');
  orbit.innerHTML = ['r1', 'r2', 'r3'].map(c =>
    `<span class="ring-wrap ${c}"><svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="98.5" fill="none" stroke="url(#gRing)" stroke-width="1.3"/><circle cx="100" cy="1.5" r="3.4" fill="url(#gBead)"/></svg></span>`
  ).join('');
  names.appendChild(orbit);
});

// Stage + names ease toward the tilt signal (own rAF lerp: cheap, and no allocation per frame);
// when nobody is touching or moving, they sway gently by themselves.
safe('heroStage', () => {
  if (!fx) return;
  let visible = true, raf = 0;
  const loop = now => {
    raf = 0;
    if (!visible || document.hidden) return;
    const s = Tilt.s;
    let tx = s.x, ty = s.y;
    if (now - s.t > 2600) { tx = Math.sin(now / 2700) * .55; ty = Math.cos(now / 3400) * .38; }
    heroState.cx += (tx - heroState.cx) * .06;
    heroState.cy += (ty - heroState.cy) * .06;
    stage.style.transform = `rotateX(${(-heroState.cy * 5).toFixed(2)}deg) rotateY(${(heroState.cx * 7).toFixed(2)}deg)`;
    names.style.transform = `rotateX(${(-heroState.cy * 10).toFixed(2)}deg) rotateY(${(heroState.cx * 17).toFixed(2)}deg)`;
    raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (visible && !raf) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  kick();
});

// start state for the entrance (set here, never in CSS, so a script failure can't hide the page)
const heroItems = $$('.h-anim');
const nameLayers = $$('.names > .ext, .names > .front');
if (fx) { heroItems.forEach(el => { el.style.opacity = '0'; }); nameLayers.forEach(el => { el.style.opacity = '0'; }); }

let flipReady = false;
function playHero() {
  if (!fx) { flipReady = true; return; }
  heroState.cx = -1.5; heroState.cy = .9;       // the names swing into place in 3D (lerp eases it to rest)
  animate(hero, { scale: [1.22, 1] }, { duration: 1.6, ease: [.16, 1, .3, 1] });
  animate(nameLayers, { opacity: [0, 1] }, { duration: .9, delay: stagger(.014, { startDelay: .25 }) });
  animate(heroItems, { opacity: [0, 1], y: [34, 0] }, { duration: .9, ease: EASE, delay: stagger(.11, { startDelay: .45 }) });
  setTimeout(() => { flipReady = true; }, 1800);
}

/* ─────────────────────────────  Countdown (digits flip)  ───────────────────────────── */
safe('countdown', () => {
  const target = new Date(CONFIG.weddingStart).getTime();
  const cells = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  const pad = n => String(n).padStart(2, '0');
  const put = (el, v) => {
    if (el.textContent === v) return;
    el.textContent = v;
    if (fx && flipReady) animate(el, { rotateX: [-90, 0], opacity: [0, 1], transformPerspective: [420, 420] }, { duration: .38, ease: EASE });
  };
  let timer;
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { $('#countdown').hidden = true; $('#cdDone').hidden = false; clearInterval(timer); return; }
    const s = Math.floor(diff / 1000);
    put(cells.d, pad(Math.floor(s / 86400)));
    put(cells.h, pad(Math.floor(s % 86400 / 3600)));
    put(cells.m, pad(Math.floor(s % 3600 / 60)));
    put(cells.s, pad(s % 60));
  }
  tick();
  timer = setInterval(tick, 1000);
});

/* ─────────────────────────────  Music UI (engine is in music.js)  ───────────────────────────── */
const player = $('#player'), playBtn = $('#playBtn'), prompt = $('#musicPrompt');
let promptTimer, userPaused = false;
function hidePrompt() { prompt.classList.remove('show'); clearTimeout(promptTimer); }
function showPrompt() {
  if (Music.playing) return;
  prompt.classList.add('show');
  promptTimer = setTimeout(hidePrompt, 10000);
}
safe('music', () => {
  Music.on(isPlaying => {
    player.classList.toggle('playing', isPlaying);
    playBtn.setAttribute('aria-pressed', String(isPlaying));
    playBtn.dataset.i18nAria = isPlaying ? 'musicPause' : 'musicPlay';
    playBtn.setAttribute('aria-label', t(playBtn.dataset.i18nAria));
    if (isPlaying) hidePrompt();
  });
  playBtn.addEventListener('click', () => { userPaused = Music.playing; Music.toggle(); });
  prompt.addEventListener('click', () => { userPaused = false; Music.play(); });

  // Autoplay: try right away; browsers that block sound until a gesture get it on the first tap/click/key anywhere
  const UNLOCK = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
  const unlock = e => {
    if (e.target.closest && e.target.closest('#player, #musicPrompt')) return;   // these handle music themselves
    if (!Music.playing && !userPaused && !document.hidden) Music.play();
  };
  UNLOCK.forEach(ev => document.addEventListener(ev, unlock, true));
  Music.play();

  // Stop when the guest leaves (app switch, tab change, closing); resume when they come back
  let resumeOnShow = false;
  const leave = () => { if (Music.playing) { resumeOnShow = true; Music.pause(); } };
  const back = () => { if (resumeOnShow && !userPaused) { resumeOnShow = false; Music.play(); } };
  document.addEventListener('visibilitychange', () => { document.hidden ? leave() : back(); });
  addEventListener('pagehide', leave);
  addEventListener('pageshow', e => { if (e.persisted) back(); });
});

/* ─────────────────────────────  Petals + gold dust (canvas, with depth)  ───────────────────────────── */
const Petals = (() => {
  const cv = $('#petals'), cx = cv.getContext('2d');
  let W = 0, H = 0, items = [], sparks = [], raf = 0, last = 0, running = false, lastY = 0;
  const ROSE = ['#B83A4B', '#C94F62', '#9E2A3A'];
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function petal(anywhere) {
    const rose = Math.random() < .55;
    return {
      k: 'p', x: Math.random() * W, y: anywhere ? Math.random() * H : -20 - Math.random() * 60,
      s: rose ? 5 + Math.random() * 5 : 3.5 + Math.random() * 3.5,
      vy: .35 + Math.random() * .55, vx: -.15 + Math.random() * .3,
      sway: Math.random() * 6.28, sw: .008 + Math.random() * .014,
      rot: Math.random() * 6.28, vr: -.02 + Math.random() * .04,
      flip: Math.random() * 6.28, vf: .015 + Math.random() * .03,
      rose, col: rose ? ROSE[Math.floor(Math.random() * 3)] : (Math.random() < .5 ? '#F2A21B' : '#E8771E'), z: .5
    };
  }
  // gold dust: z = depth (small/dim/slow = far, big/bright/fast = near). Near motes slide against the scroll.
  function mote(anywhere) {
    const z = .25 + Math.random();
    return { k: 'm', x: Math.random() * W, y: anywhere ? Math.random() * H : H + 12, z,
      s: .7 + z * 2.1, vy: -(.1 + z * .26), vx: (Math.random() - .5) * .16, tw: Math.random() * 6.28, ts: .02 + Math.random() * .035 };
  }
  function drawPetal(p, ox) {
    cx.save();
    cx.translate(p.x + Math.sin(p.sway) * 14 + ox, p.y);
    cx.rotate(p.rot);
    cx.scale(Math.cos(p.flip), 1);
    cx.globalAlpha = p.life != null ? Math.min(.8, p.life) : .72;
    cx.fillStyle = p.col;
    cx.beginPath();
    if (p.rose) {
      const s = p.s;
      cx.moveTo(0, -s);
      cx.bezierCurveTo(s * 1.1, -s * 1.1, s * .9, s * .7, 0, s);
      cx.bezierCurveTo(-s * .9, s * .7, -s * 1.1, -s * 1.1, 0, -s);
      cx.fill();
    } else {
      cx.arc(0, 0, p.s, 0, 6.283); cx.fill();
      cx.fillStyle = 'rgba(140,50,10,.45)';
      cx.beginPath(); cx.arc(0, 0, p.s * .45, 0, 6.283); cx.fill();
    }
    cx.restore();
  }
  function drawMote(p, ox) {
    const a = (.35 + .35 * Math.sin(p.tw)) * (.35 + .65 * Math.min(1, p.z));
    const x = p.x + ox, g = p.life != null ? Math.min(1, p.life) : 1;
    cx.globalAlpha = a * g; cx.fillStyle = '#C99A33';
    cx.beginPath(); cx.arc(x, p.y, p.s, 0, 6.283); cx.fill();
    cx.globalAlpha = a * g * .3; cx.fillStyle = '#F3DC92';
    cx.beginPath(); cx.arc(x, p.y, p.s * 2.8, 0, 6.283); cx.fill();
  }
  function frame(now) {
    const dt = Math.min(2.5, (now - last) / 16.67 || 1); last = now;
    const dy = scrollY - lastY; lastY = scrollY;           // scroll speed → near dust slides the other way (parallax)
    cx.clearRect(0, 0, W, H);
    for (const p of items) {
      if (p.k === 'p') {
        p.y += p.vy * dt - dy * .12; p.x += p.vx * dt; p.sway += p.sw * dt; p.rot += p.vr * dt; p.flip += p.vf * dt;
        if (p.y > H + 20 || p.y < -80 || p.x < -40 || p.x > W + 40) Object.assign(p, petal(false));
        drawPetal(p, Tilt.s.x * 10);
      } else {
        p.y += p.vy * dt - dy * p.z * .5; p.x += p.vx * dt; p.tw += p.ts * dt;
        if (p.y < -20 || p.y > H + 40) Object.assign(p, mote(false));
        drawMote(p, Tilt.s.x * p.z * 22);
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {           // burst particles: ballistic, fade out
      const p = sparks[i];
      p.vy += .05 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .992; p.life -= .011 * dt;
      p.rot += p.vr * dt; p.flip += p.vf * dt; p.tw += p.ts * dt; p.sway += p.sw * dt;
      if (p.life <= 0 || p.y > H + 30) { sparks.splice(i, 1); continue; }
      p.k === 'p' ? drawPetal(p, 0) : drawMote(p, 0);
    }
    cx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (reduce || running) return;
    running = true; size(); lastY = scrollY;
    const np = W < 640 ? 12 : 22, nm = W < 640 ? 30 : 52;
    items = [...Array.from({ length: np }, () => petal(true)), ...Array.from({ length: nm }, () => mote(true))];
    last = performance.now(); raf = requestAnimationFrame(frame);
  }
  // a shower of petals and gold dust from a point (RSVP card, etc.)
  function burst(x, y, n = 46) {
    if (!running) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, v = 2 + Math.random() * 5.5;
      const p = Math.random() < .55 ? petal(false) : mote(false);
      Object.assign(p, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, life: 1 + Math.random() * .6 });
      if (p.k === 'm') Object.assign(p, { z: 1 + Math.random() * .6, s: 1.2 + Math.random() * 2.4 });
      sparks.push(p);
    }
  }
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => running && size(), 150); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  return { start, burst };
})();

/* ─────────────────────────────  Envelope intro  ─────────────────────────────
   Drifts, tilts with the pointer/gyro, and cracks open (CSS stages handle the flap/seal);
   then you fly through the card into the hero. A Skip button jumps straight in. */
safe('envelope', () => {
  const overlay = $('#envelope'), btn = $('#envBtn'), tiltEl = $('#envTilt'), floatEl = $('#envFloat');
  let opened = false;
  root.classList.add('locked');

  if (fx) {
    animate(floatEl, { y: [0, -12, 0], rotateZ: [-.7, .7, -.7] }, { duration: 6, ease: 'easeInOut', repeat: Infinity });
    let ex = 0, ey = 0, raf = 0;
    const loop = now => {
      if (!overlay.isConnected) return;
      const s = Tilt.s; let tx = s.x, ty = s.y;
      if (now - s.t > 2400) { tx = Math.sin(now / 2300) * .5; ty = Math.cos(now / 2900) * .35; }
      ex += (tx - ex) * .07; ey += (ty - ey) * .07;
      tiltEl.style.transform = `rotateX(${(-ey * 11).toFixed(2)}deg) rotateY(${(ex * 16).toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function finish() {
    root.classList.remove('locked');
    document.body.classList.add('play');
    overlay.remove();
    $('#main').setAttribute('tabindex', '-1');
    $('#main').focus({ preventScroll: true });
    Petals.start();
    setTimeout(showPrompt, reduce ? 300 : 1600);
  }
  function open(byTap, skip) {
    if (opened) return;
    opened = true;
    if (byTap) { Tilt.request(); if (!userPaused) Music.play(); }   // a tap is a user gesture: audio + iOS motion permission
    if (reduce) { overlay.classList.add('s-done'); playHero(); setTimeout(finish, 350); return; }
    if (skip) { overlay.classList.add('s-done'); playHero(); setTimeout(finish, 900); return; }
    const steps = [[0, 's-crack'], [800, 's-open'], [1650, 's-rise'], [2900, 's-done']];
    steps.forEach(([ms, cls]) => setTimeout(() => overlay.classList.add(cls), ms));
    setTimeout(playHero, 2700);                    // the hero starts arriving while the card is still flying past
    setTimeout(finish, 3900);
  }
  // Opening waits for a tap anywhere on the intro screen: that tap is what lets the music start on phones
  overlay.addEventListener('click', () => open(true));
  $('#envSkip').addEventListener('click', e => { e.stopPropagation(); open(true, true); });
});

/* ─────────────────────────────  Scroll-linked camera  ───────────────────────────── */
safe('scrollFx', () => {
  const bar = $('#progress span'), fill = $('#tlFill'), tl = $('#timeline');
  const orbs = $$('.orb'), wm = $('#worldMandala');
  if (!fx) { fill.style.transform = 'scaleY(1)'; return; }

  // page progress → top bar, drifting colour orbs, slowly turning backdrop mandala
  scroll(p => {
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    const dh = document.documentElement.scrollHeight;
    orbs.forEach(o => { o.style.transform = `translate3d(0,${(-p * dh * parseFloat(o.dataset.drift)).toFixed(1)}px,0)`; });
    wm.style.transform = `rotate(${(p * 260).toFixed(2)}deg)`;
  });

  // hero content glides back into the scene as you leave it
  scroll(p => { heroInner.style.transform = `translate3d(0,${(p * 90).toFixed(1)}px,${(-p * 280).toFixed(1)}px)`; },
    { target: hero, offset: ['start start', 'end start'] });

  // the gold line that fills down the timeline
  scroll(p => { fill.style.transform = `scaleY(${p.toFixed(3)})`; }, { target: tl, offset: ['start 0.72', 'end 0.72'] });
});

/* ─────────────────────────────  Venue: the palace gates open as you scroll  ───────────────────────────── */
safe('gates', () => {
  const sec = $('.gates'), gate = $('#gate'), L = $('#doorL'), R = $('#doorR'), hint = $('#gateHint');
  const canStick = !!(window.CSS && CSS.supports && CSS.supports('overflow-x', 'clip'));
  if (!fx || !canStick) { sec.classList.add(canStick ? 'static' : 'no-sticky'); gate.style.setProperty('--open', '1'); return; }
  const ease = k => 1 - Math.pow(1 - k, 3);
  scroll(p => {
    const o = ease(clamp((p - .06) / .6));                       // doors: 6% → 66% of the pinned scroll
    const a = o * 102;
    L.style.transform = `rotateY(${(-a).toFixed(2)}deg)`;
    R.style.transform = `rotateY(${a.toFixed(2)}deg)`;
    const sh = (o * .6).toFixed(3);
    L.style.setProperty('--shade', sh); R.style.setProperty('--shade', sh);
    gate.style.setProperty('--open', o.toFixed(3));
    gate.style.transform = `scale(${(1 + .1 * ease(clamp((p - .25) / .75))).toFixed(4)})`;   // slow camera push-in
    hint.style.opacity = (1 - clamp(p * 6)).toFixed(2);
  }, { target: sec, offset: ['start start', 'end end'] });
});

/* ─────────────────────────────  Reveals  ───────────────────────────── */
safe('reveals', () => {
  if (!fx) return;
  const els = $$('[data-rv]');
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transformOrigin = el.dataset.rv === 'title' ? '50% 100%' : '50% 80%';
  });
  const P = [900, 900];                                          // constant keyframe: animating perspective from 0 would distort
  const kinds = {
    up:    () => ({ opacity: [0, 1], y: [60, 0], rotateX: [-18, 0], transformPerspective: P }),
    title: () => ({ opacity: [0, 1], y: [28, 0], rotateX: [-70, 0], transformPerspective: P }),
    pop:   () => ({ opacity: [0, 1], scale: [.8, 1], rotateX: [-24, 0], transformPerspective: P }),
    side:  el => {
      const i = $$('[data-rv="side"]').indexOf(el), wide = innerWidth >= 1024;
      const dir = wide ? (i % 2 === 0 ? -1 : 1) : 1;
      return { opacity: [0, 1], x: [dir * 90, 0], rotateY: [-dir * 26, 0], transformPerspective: P };
    }
  };
  inView(els, el => {
    const d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
    animate(el, (kinds[el.dataset.rv] || kinds.up)(el), { duration: .95, delay: d, ease: EASE });
  }, { amount: .18, margin: '0px 0px -6% 0px' });

  // a shower of petals the moment the RSVP card arrives
  inView('#rsvpCard', el => {
    const r = el.getBoundingClientRect();
    setTimeout(() => Petals.burst(r.left + r.width / 2, r.top + r.height * .45), 500);
  }, { amount: .5 });
});

/* ─────────────────────────────  Tilt cards (springs)  ───────────────────────────── */
safe('tiltCards', () => {
  if (!fx) return;
  $$('[data-tilt]').forEach(el => {
    const max = parseFloat(el.dataset.tilt) || 11;
    let live = false, pending = null, raf = 0;
    const apply = () => {
      raf = 0; const e = pending; if (!e) return;
      const r = el.getBoundingClientRect();
      const px = clamp((e.clientX - r.left) / r.width), py = clamp((e.clientY - r.top) / r.height);
      animate(el, { rotateY: (px - .5) * 2 * max, rotateX: -(py - .5) * 2 * max }, { type: 'spring', stiffness: 170, damping: 17, mass: .7 });
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    };
    el.addEventListener('pointermove', e => {
      pending = e;
      if (!live) { live = true; el.classList.add('live'); }
      if (!raf) raf = requestAnimationFrame(apply);
    });
    const rest = () => {
      live = false; pending = null; el.classList.remove('live');
      animate(el, { rotateX: 0, rotateY: 0 }, { type: 'spring', stiffness: 110, damping: 13 });
    };
    el.addEventListener('pointerleave', rest);
    el.addEventListener('pointercancel', rest);
  });
});

/* tactile press feedback on every button */
safe('press', () => {
  if (!fx || !press) return;
  press('.btn, .btn-seal, .g-btn, .lb-btn, .p-btn', el => {
    animate(el, { scale: .94 }, { duration: .12 });
    return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 420, damping: 16 });
  });
});

/* ─────────────────────────────  Gallery: 3D coverflow + lightbox  ───────────────────────────── */
safe('gallery', () => {
  const cf = $('#cf'), stageEl = $('#cfStage'), items = $$('.cf-item', stageEl), N = items.length;
  const dots = $$('#cfDots i'), prev = $('#gPrev'), next = $('#gNext');
  let pos = 0, anim = null, drag = null, hold = false, visible = false, lbOpen = false, autoT = 0, resumeT = 0, cw = 0;
  const norm = i => ((i % N) + N) % N;
  const measure = () => { cw = items[0].offsetWidth || 260; };

  function render() {
    items.forEach((it, i) => {
      let d = norm(i - pos);                           // shortest signed distance around the ring
      if (d > N / 2) d -= N;
      const a = Math.abs(d), s = Math.sign(d);
      const x = s * (Math.min(a, 1) * .64 + Math.max(0, a - 1) * .2) * cw;
      const rot = -s * Math.min(a, 1) * 48;
      const z = -Math.min(a, 2) * 170;
      const sc = 1 - Math.min(a, 1.6) * .07;
      it.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      it.style.opacity = clamp(1.75 - a * .95).toFixed(3);
      it.style.zIndex = String(20 - Math.round(a * 4));
      const far = a > 1.4;
      it.style.pointerEvents = far ? 'none' : 'auto';
      if (it._far !== far) {                          // hidden photos must not be reachable by keyboard or screen reader
        it._far = far;
        it.setAttribute('aria-hidden', String(far));
        it.firstElementChild.tabIndex = far ? -1 : 0;
      }
    });
    const c = norm(Math.round(pos));
    dots.forEach((el, i) => el.classList.toggle('on', i === c));
  }
  function go(to, instant) {
    if (anim) anim.stop();
    if (instant || !fx) { pos = to; render(); return; }
    anim = animate(pos, to, { type: 'spring', stiffness: 130, damping: 19, mass: .95, onUpdate: v => { pos = v; render(); } });
  }
  const step = dir => { hold = true; clearTimeout(resumeT); go(Math.round(pos) + dir); resumeT = setTimeout(() => { hold = false; }, 4500); };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  cf.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  // drag / swipe (vertical scrolling is left to the browser via touch-action: pan-y)
  cf.addEventListener('pointerdown', e => {
    if (e.button) return;
    if (anim) anim.stop();
    drag = { x: e.clientX, pos0: pos, moved: false, lastX: e.clientX, lastT: performance.now(), v: 0 };
    hold = true; clearTimeout(resumeT);
  });
  cf.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 8) { drag.moved = true; cf.classList.add('drag'); try { cf.setPointerCapture(e.pointerId); } catch (x) {} }
    if (!drag.moved) return;
    const now = performance.now(), dtm = Math.max(1, now - drag.lastT);
    drag.v = .8 * drag.v + .2 * ((e.clientX - drag.lastX) / dtm); drag.lastX = e.clientX; drag.lastT = now;
    pos = drag.pos0 - dx / (cw * .64);
    render();
  });
  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null; cf.classList.remove('drag');
    if (d.moved) go(Math.round(pos - d.v * 1.2));            // flick momentum
    resumeT = setTimeout(() => { hold = false; }, 4500);
    d.moved && setTimeout(() => { suppressClick = false; }, 0);
  };
  let suppressClick = false;
  cf.addEventListener('pointerup', () => { if (drag && drag.moved) suppressClick = true; endDrag(); });
  cf.addEventListener('pointercancel', endDrag);
  cf.addEventListener('mouseenter', () => { hold = true; clearTimeout(resumeT); });
  cf.addEventListener('mouseleave', () => { resumeT = setTimeout(() => { hold = false; }, 1200); });

  // slow autoplay while it's on screen and untouched
  function auto() {
    clearInterval(autoT);
    if (!fx || !visible || lbOpen) return;
    autoT = setInterval(() => { if (!hold && !document.hidden) go(Math.round(pos) + 1); }, 3800);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; auto(); }).observe(cf);
  else visible = true;
  addEventListener('resize', () => { measure(); render(); });
  measure(); render();
  const imgs = $$('img', stageEl);
  imgs.forEach(img => img.addEventListener('load', () => { measure(); render(); }, { once: true }));

  /* Lightbox */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount'), lbStage = $('#lbStage');
  const photos = items.map(f => { const i = $('img', f); return { src: i.currentSrc || i.src, alt: i.alt }; });
  let cur = 0, swapT;
  function show(i) {
    cur = norm(i);
    const p = photos[cur];
    lbCount.textContent = (cur + 1) + ' / ' + N;
    if (!lb.open || reduce) { lbImg.src = p.src; lbImg.alt = p.alt; return; }
    lbImg.classList.add('swap');
    clearTimeout(swapT);
    swapT = setTimeout(() => { lbImg.src = p.src; lbImg.alt = p.alt; if (lbImg.complete) lbImg.classList.remove('swap'); }, 160);
  }
  ['load', 'error'].forEach(e => lbImg.addEventListener(e, () => lbImg.classList.remove('swap')));
  function openAt(i) {
    show(i);
    lbOpen = true; auto();
    root.classList.add('lb-lock');
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  }
  function closeLb() { if (lb.close) lb.close(); else { lb.removeAttribute('open'); onClosed(); } }
  function onClosed() {
    lbOpen = false; root.classList.remove('lb-lock'); auto();
    let d = norm(cur - Math.round(pos)); if (d > N / 2) d -= N;   // bring the viewed photo to centre the short way round
    go(Math.round(pos) + d);
  }
  lb.addEventListener('close', onClosed);

  // tap the centre photo to open it; tap a side photo to bring it to the centre
  stageEl.addEventListener('click', e => {
    if (suppressClick) { suppressClick = false; return; }
    const b = e.target.closest('.g-open'); if (!b) return;
    const i = +b.dataset.i;
    let d = norm(i - Math.round(pos)); if (d > N / 2) d -= N;
    if (d === 0) { hold = true; openAt(i); } else step(d);
  });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => show(cur - 1));
  $('#lbNext').addEventListener('click', () => show(cur + 1));
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
  });
  // swipe in the viewer to change photo; tap the margin to close
  let sx = 0, sy = 0, swiped = false;
  lbStage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; swiped = false; });
  lbStage.addEventListener('pointerup', e => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { swiped = true; show(cur + (dx < 0 ? 1 : -1)); }
  });
  lbStage.addEventListener('click', e => {
    if (swiped) { swiped = false; return; }
    if (e.target === lbStage) closeLb();
  });
});

})();
