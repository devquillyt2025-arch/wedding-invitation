'use strict';
/* ═══════════════════════════════════════════════════════════════════════════════
   Core: shared helpers, language, the "light" signal (pointer / phone tilt), countdown dials,
   calendar links, music UI, and the petals + pollen canvas.
   Everything is published on the global IV object for scenes.js and chapters.js.
   Depends on: Motion, CONFIG + I18N (config-i18n.js), Music (music.js).
   ═══════════════════════════════════════════════════════════════════════════════ */
const IV = (() => {

const root = document.documentElement;
root.classList.add('has-env');                  // first action: lets the CSS show the intro overlay

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const M = window.Motion || null;
const { animate, scroll, inView, stagger, press } = M || {};
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
const fx = !!M && !reduce;                       // true → run the motion layer
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease3 = k => 1 - Math.pow(1 - k, 3);
const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const safe = (name, fn) => { try { fn(); } catch (e) { console.error('[invite:' + name + ']', e); } };
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const EASE = [.2, .75, .2, 1];

/* ─────────────────────────────  Language  ───────────────────────────── */
let lang = store.get('invite-lang') === 'en' ? 'en' : 'kn';   // Kannada is the default
const t = key => I18N[lang][key] ?? I18N.en[key] ?? '';
const langHooks = [];                           // modules with text that isn't plain data-i18n re-render here

function applyLang() {
  root.lang = lang === 'kn' ? 'kn' : 'en';
  document.body.classList.toggle('lang-kn', lang === 'kn');
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('[data-i18n-alt]').forEach(el => el.setAttribute('alt', t(el.dataset.i18nAlt)));
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#rsvpBtn').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(t('rsvpMsg'));
  langHooks.forEach(fn => { try { fn(); } catch (e) { console.error('[invite:lang]', e); } });
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

/* ─────────────────────────────  Light signal  ─────────────────────────────
   One shared (-1..1) signal from the mouse or the phone's tilt. It steers the highlight on the gold lettering
   (CSS vars --lx/--ly on <html>), and scenes read it for parallax. */
const Tilt = (() => {
  const s = { x: 0, y: 0, t: 0 };
  let g0 = null, b0 = null, gyroOn = false, raf = 0, cx = 0, cy = 0;
  const set = (x, y) => { s.x = clamp(x, -1, 1); s.y = clamp(y, -1, 1); s.t = performance.now(); kick(); };
  const loop = () => {
    raf = 0;
    cx += (s.x - cx) * .1; cy += (s.y - cy) * .1;
    root.style.setProperty('--lx', cx.toFixed(3));
    root.style.setProperty('--ly', cy.toFixed(3));
    if (Math.abs(s.x - cx) > .002 || Math.abs(s.y - cy) > .002) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf && !reduce) raf = requestAnimationFrame(loop); };
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

/* ─────────────────────────────  Calendar links (Google) + save-date wiring  ───────────────────────────── */
safe('calendar', () => {
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const gcal = (title, startISO, hours, details) => {
    const s = new Date(startISO), e = new Date(s.getTime() + hours * 3600e3);
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent(title)
      + '&dates=' + fmt(s) + '/' + fmt(e)
      + '&details=' + encodeURIComponent(details + '\nInvitation: ' + CONFIG.siteUrl)
      + '&location=' + encodeURIComponent(CONFIG.calendarPlace);
  };
  const muhurtha = gcal(CONFIG.calendarTitle, CONFIG.weddingStart, CONFIG.weddingHours, 'Dhaaraa Muhurtha (Dhanur Lagna), 9:30 AM – 10:30 AM');
  $('#calBtn').href = muhurtha;
  $('#gcalMu').href = muhurtha;
  $('#gcalRc').href = gcal(CONFIG.receptionTitle, CONFIG.receptionStart, CONFIG.receptionHours, 'Reception, 7:30 PM');
});

/* "N days to go" under the hearts (re-rendered on language change) */
safe('daysToGo', () => {
  const count = $('#calCount');
  const relang = () => {
    const left = Math.ceil((new Date(CONFIG.weddingStart).getTime() - Date.now()) / 864e5);
    count.hidden = left <= 0;
    if (left > 0) count.textContent = t(left === 1 ? 'daysToGoOne' : 'daysToGo').replace('{n}', left);
  };
  langHooks.push(relang);
});

/* ─────────────────────────────  Countdown: four filling dials  ───────────────────────────── */
safe('countdown', () => {
  const target = new Date(CONFIG.weddingStart).getTime();
  const dials = $$('.cd').map(el => ({ el, num: $('.cd-num', el), bar: $('.bar', el), max: +el.dataset.max, last: -1 }));
  const C = 220;                                                 // circle circumference (2πr, r=35)
  const pad = n => String(n).padStart(2, '0');
  const put = (d, v) => {
    if (v === d.last) return;
    const wrapped = d.last >= 0 && v > d.last;                  // 59 → 0: jump back without sweeping the whole ring in reverse
    d.num.textContent = pad(v);
    d.bar.classList.toggle('snap', wrapped);
    d.bar.style.strokeDashoffset = String(C * (1 - clamp(v / d.max)));
    d.last = v;
  };
  let timer;
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { $('#countdown').hidden = true; $('#cdDone').hidden = false; clearInterval(timer); return; }
    const s = Math.floor(diff / 1000);
    [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60].forEach((v, i) => put(dials[i], v));
  }
  tick();
  timer = setInterval(tick, 1000);
});

/* ─────────────────────────────  Music UI (engine is in music.js)  ───────────────────────────── */
const player = $('#player'), playBtn = $('#playBtn'), prompt = $('#musicPrompt');
const musicState = { userPaused: false };
let promptTimer;
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
  playBtn.addEventListener('click', () => { musicState.userPaused = Music.playing; Music.toggle(); });
  prompt.addEventListener('click', () => { musicState.userPaused = false; Music.play(); });

  // Autoplay: try right away; browsers that block sound until a gesture get it on the first tap/click/key anywhere
  const UNLOCK = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
  const unlock = e => {
    if (e.target.closest && e.target.closest('#player, #musicPrompt')) return;   // these handle music themselves
    if (!Music.playing && !musicState.userPaused && !document.hidden) Music.play();
  };
  UNLOCK.forEach(ev => document.addEventListener(ev, unlock, true));
  Music.play();

  // Stop when the guest leaves (app switch, tab change, closing); resume when they come back
  let resumeOnShow = false;
  const leave = () => { if (Music.playing) { resumeOnShow = true; Music.pause(); } };
  const back = () => { if (resumeOnShow && !musicState.userPaused) { resumeOnShow = false; Music.play(); } };
  document.addEventListener('visibilitychange', () => { document.hidden ? leave() : back(); });
  addEventListener('pagehide', leave);
  addEventListener('pageshow', e => { if (e.persisted) back(); });
});

/* ─────────────────────────────  Petals + pollen (canvas, with depth)  ───────────────────────────── */
const Petals = (() => {
  const cv = $('#petals'), cx = cv.getContext('2d');
  let W = 0, H = 0, items = [], sparks = [], raf = 0, last = 0, running = false, lastY = 0;
  const PINK = ['#E48CA8', '#EFA3B8', '#D9758F'];
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  // soft lotus-pink petals drifting down
  function petal(anywhere) {
    return {
      k: 'p', x: Math.random() * W, y: anywhere ? Math.random() * H : -20 - Math.random() * 60,
      s: 4.5 + Math.random() * 5, vy: .32 + Math.random() * .5, vx: -.15 + Math.random() * .3,
      sway: Math.random() * 6.28, sw: .008 + Math.random() * .014,
      rot: Math.random() * 6.28, vr: -.02 + Math.random() * .04,
      flip: Math.random() * 6.28, vf: .015 + Math.random() * .03,
      col: PINK[Math.floor(Math.random() * 3)]
    };
  }
  // gold pollen: z = depth (small/dim/slow = far, big/bright/fast = near). Near motes slide against the scroll.
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
    cx.globalAlpha = p.life != null ? Math.min(.85, p.life) : .72;
    cx.fillStyle = p.col;
    cx.beginPath();
    const s = p.s;
    cx.moveTo(0, -s);
    cx.bezierCurveTo(s * 1.1, -s * 1.1, s * .9, s * .7, 0, s);
    cx.bezierCurveTo(-s * .9, s * .7, -s * 1.1, -s * 1.1, 0, -s);
    cx.fill();
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
    const dy = scrollY - lastY; lastY = scrollY;
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
    for (let i = sparks.length - 1; i >= 0; i--) {
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
    const np = W < 640 ? 8 : 15, nm = W < 640 ? 30 : 52;
    items = [...Array.from({ length: np }, () => petal(true)), ...Array.from({ length: nm }, () => mote(true))];
    last = performance.now(); raf = requestAnimationFrame(frame);
  }
  // a shower of petals and pollen from a point
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

/* ─────────────────────────────  Hill + temple drawing helpers (used by hero, portal and venue)  ───────────────────────────── */
function defsGradient(svg, id, stops, vertical = true) {
  const defs = svg.querySelector('defs') || svgEl('defs', {}, svg);
  const g = svgEl('linearGradient', { id, x1: 0, y1: 0, x2: vertical ? 0 : 1, y2: vertical ? 1 : 0 }, defs);
  stops.forEach(([o, c, a]) => svgEl('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, g));
  return g;
}
// A gopuram (south-Indian temple tower): stacked tiers narrowing upward, rows of lit windows, a barrel roof and kalasha finials.
function gopuram(parent, { cx, base, w, tiers = 6, th = 30, fill, win = '#FFE8A8', glow = true, ws = 1 }) {
  const g = svgEl('g', {}, parent);                                    // ws = scale of the small details (windows, finials)
  svgEl('path', { d: `M${cx - w * .09} ${base} v${-th * .9} a${w * .09} ${w * .09} 0 0 1 ${w * .18} 0 v${th * .9}z`, fill: '#0B2E3A' }, g);
  for (let i = 0; i < tiers; i++) {
    const wi = w * (1 - i * .115), y = base - th * (i + 1);
    svgEl('path', { d: `M${cx - wi / 2} ${y + th} L${cx - wi / 2 + wi * .03} ${y + 3 * ws} L${cx + wi / 2 - wi * .03} ${y + 3 * ws} L${cx + wi / 2} ${y + th}z`, fill }, g);
    svgEl('rect', { x: cx - wi / 2 - 2 * ws, y: y + ws, width: wi + 4 * ws, height: 4 * ws, rx: 1.5 * ws, fill }, g);   // cornice
    const n = Math.max(1, Math.round(wi / (26 * ws)));
    for (let k = 0; k < n; k++) {
      const wx = cx - wi / 2 + wi * ((k + .5) / n);
      const wnd = svgEl('rect', { x: wx - 2.2 * ws, y: y + th * .38, width: 4.4 * ws, height: th * .34, rx: 2 * ws, fill: win, opacity: .9 }, g);
      if (glow) { wnd.setAttribute('class', 'win'); wnd.style.animationDelay = ((i * 7 + k * 3) % 11) * .3 + 's'; }
    }
  }
  const top = base - th * tiers, wt = w * (1 - tiers * .115) * .9;
  svgEl('path', { d: `M${cx - wt / 2} ${top + 2 * ws} Q${cx} ${top - th * .95} ${cx + wt / 2} ${top + 2 * ws}z`, fill }, g);   // barrel-vault roof
  [-1, 0, 1].forEach(d => {                                                                                                 // three kalasha
    const x = cx + d * wt * .3, y0 = top - th * .35;
    svgEl('path', { d: `M${x - 3 * ws} ${y0} q${3 * ws} ${-7 * ws} ${6 * ws} 0z M${x} ${y0 - 4 * ws} v${-th * .28}`, fill, stroke: fill, 'stroke-width': 1.4 * ws }, g);
    svgEl('circle', { cx: x, cy: y0 - 4 * ws - th * .3, r: 2.2 * ws, fill }, g);
  });
  return g;
}
function palm(parent, x, base, h, fill) {
  const g = svgEl('g', {}, parent);
  const lean = (x % 2 ? 1 : -1) * h * .12;
  svgEl('path', { d: `M${x} ${base} Q${x + lean * .4} ${base - h * .5} ${x + lean} ${base - h}`, fill: 'none', stroke: fill, 'stroke-width': Math.max(3, h * .035), 'stroke-linecap': 'round' }, g);
  for (let i = 0; i < 7; i++) {
    const a = -150 + i * 50, r = h * .34, ex = x + lean + Math.cos(a * Math.PI / 180) * r, ey = base - h + Math.sin(a * Math.PI / 180) * r * .7;
    svgEl('path', { d: `M${x + lean} ${base - h} Q${(x + lean + ex) / 2} ${(base - h + ey) / 2 - r * .28} ${ex} ${ey + r * .22}`, fill: 'none', stroke: fill, 'stroke-width': Math.max(2, h * .028), 'stroke-linecap': 'round' }, g);
  }
  return g;
}

return {
  root, $, $$, M, animate, scroll, inView, stagger, press, reduce, coarse, fx, clamp, lerp, ease3, smooth, sleep, safe, store, NS, svgEl, EASE,
  t, applyLang, langHooks, Tilt, Petals, defsGradient, gopuram, palm,
  musicState, showPrompt, getLang: () => lang
};
})();
