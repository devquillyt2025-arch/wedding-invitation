'use strict';
/* ═══════════════════════════════════════════════════════════════════════════════
   Chapters (second half of the page): the sky portal, the two-hearts save-the-date, the venue scene,
   the polaroid deck + lightbox, the finale lanterns. Ends by applying the language, which runs every hook.
   ═══════════════════════════════════════════════════════════════════════════════ */
(() => {
const { $, $$, animate, scroll, inView, stagger, press, reduce, fx, clamp, lerp, ease3, smooth, sleep, safe, svgEl, EASE,
  root, t, Petals, langHooks, defsGradient, gopuram, palm, musicState } = IV;

/* ─────────────────────────────  Sky portal: dusk → night → dawn  ───────────────────────────── */
safe('portal', () => {
  const sec = $('#events'), sky = $('#orbSky'), orb = $('#orb'), moon = $('#oMoon'), sun = $('#oSun'), stars = $$('.o-stars');
  const hills = $('#oHills'), ring = $('#orbRing'), evs = [$('.ev-0'), $('.ev-1')], tabs = $$('#evTabs button');

  // silhouettes at the foot of the window: two ridges and a tiny temple tower
  svgEl('path', { d: 'M0 58 C30 38 62 56 92 44 C122 32 152 54 200 40 V90 H0Z', fill: '#1A5568' }, hills);
  gopuram(hills, { cx: 150, base: 50, w: 17, tiers: 4, th: 5.2, fill: '#0F3D4A', win: '#FFE9AE', ws: .34 });
  svgEl('path', { d: 'M0 76 C40 62 80 78 120 66 C150 58 180 72 200 66 V90 H0Z', fill: '#0F3D4A' }, hills);

  // the brass-and-gold ring around the window: minute ticks, a progress arc, a travelling dot
  const C = 110, R = 103, pt = (r, deg) => [C + r * Math.cos(deg * Math.PI / 180), C + r * Math.sin(deg * Math.PI / 180)];
  svgEl('circle', { cx: C, cy: C, r: R, class: 'r-main' }, ring);
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0, [x0, y0] = pt(big ? 97.5 : 98.5, i * 6), [x1, y1] = pt(big ? 102 : 101, i * 6);
    svgEl('line', { x1: x0, y1: y0, x2: x1, y2: y1, class: 'r-tick' + (big ? ' big' : '') }, ring);
  }
  const [ax, ay] = pt(R, 135), [bx, by] = pt(R, 405 - 360);           // 135° (bottom-left) clockwise over the top to 45° (bottom-right)
  const prog = svgEl('path', { d: `M${ax} ${ay} A${R} ${R} 0 1 1 ${bx} ${by}`, class: 'r-prog' }, ring);
  const dot = svgEl('circle', { cx: ax, cy: ay, r: 4.2, class: 'r-dot' }, ring);
  const PL = prog.getTotalLength();
  prog.style.strokeDasharray = String(PL);

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return 'rgb(' + A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',') + ')'; };
  const KF = [
    [0,   ['#7E79B8', '#E9A0B6', '#FBC98F']],       // dusk
    [.2,  ['#34407F', '#8A6AA8', '#E49AA6']],       // blue hour
    [.36, ['#0B1B33', '#14305A', '#2F4F7C']],       // night
    [.62, ['#0E2340', '#1C3C62', '#3C5F86']],       // deep night
    [.78, ['#46568C', '#C58EB2', '#F7B78F']],       // first light
    [1,   ['#8FC4E4', '#FBE0C2', '#FFF0CC']]        // morning
  ];
  const skyAt = p => {
    let i = 0; while (i < KF.length - 2 && p > KF[i + 1][0]) i++;
    const [p0, c0] = KF[i], [p1, c1] = KF[i + 1], k = clamp((p - p0) / (p1 - p0));
    return c0.map((c, j) => mix(c, c1[j], k));
  };

  let cur = -1;
  function paint(p) {
    const [top, mid, bot] = skyAt(p);
    sky.style.background = `linear-gradient(180deg,${top} 0%,${mid} 58%,${bot} 100%)`;
    const S = orb.clientWidth || 300;
    // sun: sets on the right, rises on the left
    let sx, sy;
    if (p < .3) { const k = p / .3; sx = lerp(.7, .9, k); sy = lerp(.5, 1.18, ease3(k)); }
    else if (p < .58) { sx = .9; sy = 1.3; }
    else { const k = (p - .58) / .42; sx = lerp(.1, .38, k); sy = lerp(1.14, .4, ease3(k)); }
    sun.style.transform = `translate3d(${(sx * S).toFixed(1)}px,${(sy * S).toFixed(1)}px,0)`;
    // moon: climbs from the left, crosses, sets on the right
    const mk = clamp((p - .12) / .58);
    moon.style.transform = `translate3d(${(lerp(.14, .86, mk) * S).toFixed(1)}px,${((.66 - .56 * Math.sin(Math.PI * mk)) * S).toFixed(1)}px,0)`;
    moon.style.opacity = (smooth(.12, .26, p) * (1 - smooth(.68, .8, p))).toFixed(2);
    const so = (smooth(.1, .34, p) * (1 - smooth(.66, .84, p))).toFixed(2);
    stars.forEach(s => { s.style.opacity = so; });
    // ring progress
    prog.style.strokeDashoffset = String(PL * (1 - p));
    const [dx, dy] = pt(R, 135 + 270 * p); dot.setAttribute('cx', dx.toFixed(1)); dot.setAttribute('cy', dy.toFixed(1));
    // event details cross-fade
    const a = 1 - smooth(.36, .5, p), b = smooth(.5, .64, p);
    evs[0].style.opacity = a.toFixed(3); evs[0].style.transform = `translateY(${((1 - a) * -16).toFixed(1)}px)`;
    evs[1].style.opacity = b.toFixed(3); evs[1].style.transform = `translateY(${((1 - b) * 16).toFixed(1)}px)`;
    evs[0].style.pointerEvents = a > .5 ? 'auto' : 'none'; evs[1].style.pointerEvents = b > .5 ? 'auto' : 'none';
    const idx = p < .5 ? 0 : 1;
    if (idx !== cur) { cur = idx; tabs.forEach((x, i) => x.setAttribute('aria-pressed', String(i === idx))); evs.forEach((e, i) => e.setAttribute('aria-hidden', String(i !== idx))); }
  }

  const canStick = !!(window.CSS && CSS.supports && CSS.supports('overflow-x', 'clip'));
  if (!fx || !canStick) return;                    // static: two plain cards
  sec.classList.add('on');
  paint(0);
  scroll(p => paint(p), { target: sec, offset: ['start start', 'end end'] });
  addEventListener('resize', () => paint(cur === 1 ? .9 : .05));
  tabs.forEach(b => b.addEventListener('click', () => {            // a plain alternative to scrolling through it
    const top = sec.getBoundingClientRect().top + scrollY, range = sec.offsetHeight - innerHeight;
    scrollTo({ top: top + range * (b.dataset.i === '0' ? .04 : .92), behavior: 'smooth' });
  }));
});

/* ─────────────────────────────  Save the Date: two hearts become one  ─────────────────────────────
   A teal heart (Nitin) and a lotus-pink heart (Amulya) drift together as you scroll. Where they overlap a gold lens grows;
   at the moment they coincide they flash, send out a ring and sparkles, and become one gold heart that beats lub-dub
   with the dates inside. Tiny hearts rise from it. The Save button fades in at the end. */
safe('hearts', () => {
  const svg = $('#heartsSvg'), sec = $('#savedate'), stage = $('#heartsStage'), info = $('#heartsInfo'), hint = $('#heartsHint');
  const T = (tag, a, p) => svgEl(tag, a, p);
  const H = 'M0 46C-8 38 -50 14 -50 -14C-50 -32 -37 -42 -24 -42C-12 -42 -4 -35 0 -26C4 -35 12 -42 24 -42C37 -42 50 -32 50 -14C50 14 8 38 0 46Z';
  const S = 1.9;

  const defs = T('defs', {}, svg);
  const radial = (id, stops) => {
    const g = T('radialGradient', { id, cx: '36%', cy: '28%', r: '82%' }, defs);
    stops.forEach(([o, c, a]) => T('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, g));
  };
  radial('hA', [[0, '#4DB0C0'], [.55, '#17707F'], [1, '#0A3A48']]);
  radial('hB', [[0, '#FFD9E4'], [.55, '#F29BB5'], [1, '#D2557F']]);
  radial('hC', [[0, '#FFF8D4'], [.32, '#F6D777'], [.7, '#DAAA3C'], [1, '#98701F']]);
  const glowG = T('radialGradient', { id: 'hGlow' }, defs);
  [[0, '#FFF1BE', .95], [.5, '#FFD98A', .45], [1, '#FFD98A', 0]].forEach(([o, c, a]) => T('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, glowG));
  const clipPath = T('path', { d: H }, T('clipPath', { id: 'hClipA' }, defs));

  const glow = T('circle', { cx: 0, cy: 0, r: 160, fill: 'url(#hGlow)' }, svg);
  const ring = T('circle', { cx: 0, cy: 0, r: 50, fill: 'none', stroke: '#F2D88A' }, svg);
  const sparks = Array.from({ length: 16 }, (_, i) => {
    const el = T('path', { d: 'M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8Z', class: 'spark' }, svg);
    return { el, a: i / 16 * Math.PI * 2 + (i % 2) * .18, d: 150 + (i * 37 % 100), s: .6 + (i * 13 % 7) / 7, lag: i * .004 };
  });

  const sheen = g => T('path', { d: 'M-34 -20C-35 -31 -27 -37 -19 -35', fill: 'none', stroke: 'rgba(255,255,255,.75)', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g);
  const label = (g, cls, en, kn) => {
    const grp = T('g', { class: cls }, g);
    const a = T('text', { class: 'h-nm only-en', y: 2 }, grp); a.textContent = en;
    const b = T('text', { class: 'h-nm kn only-kn', lang: 'kn', y: 4 }, grp); b.textContent = kn;
    return grp;
  };
  const gA = T('g', { class: 'hA' }, svg); T('path', { d: H, fill: 'url(#hA)', stroke: '#F2D88A', 'stroke-width': 1.5 }, gA); sheen(gA);
  const namesA = label(gA, 'nmA', 'NITIN', 'ನಿತಿನ್');
  const gB = T('g', { class: 'hB' }, svg); T('path', { d: H, fill: 'url(#hB)', stroke: '#F2D88A', 'stroke-width': 1.5 }, gB); sheen(gB);
  const namesB = label(gB, 'nmB', 'AMULYA', 'ಅಮೂಲ್ಯ');
  const lensClip = T('g', { 'clip-path': 'url(#hClipA)' }, svg);                 // B's heart, clipped to A's = the shared part
  const lens = T('path', { d: H, fill: 'url(#hC)' }, lensClip);

  const gC = T('g', { class: 'hC' }, svg);
  T('path', { d: H, fill: 'url(#hC)', stroke: '#FFF3C8', 'stroke-width': 1.6 }, gC);
  T('path', { d: H, fill: 'none', stroke: 'rgba(143,111,36,.45)', 'stroke-width': 1, transform: 'scale(.9)' }, gC);
  sheen(gC);
  const gDate = T('g', {}, gC);
  const d1 = T('text', { class: 'h-date', y: 5 }, gDate); d1.textContent = '18–19';
  const d2 = T('text', { class: 'h-mon', y: 21 }, gDate);
  const t1 = T('tspan', { 'data-i18n': 'heroDay' }, d2); t1.textContent = 'Nov';
  d2.appendChild(document.createTextNode(' '));
  const t2 = T('tspan', { 'data-i18n': 'heroMonth' }, d2); t2.textContent = '2026';

  const minis = Array.from({ length: 6 }, (_, i) => T('path', { d: H, fill: i % 2 ? '#F29BB5' : '#E6C262' }, svg));

  const bump = (x, a, b) => (x <= a || x >= b) ? 0 : Math.sin(Math.PI * (x - a) / (b - a));
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const beat = now => { const t = (now / 1100) % 1; return .07 * bump(t, 0, .2) + .05 * bump(t, .24, .44); };   // lub-dub

  let live = false;
  function paint(p, now) {
    const m = ease(smooth(.1, .58, p));                          // 0 = far apart … 1 = on top of each other
    const bob = (1 - m) * Math.sin(now / 780) * 6;
    const dx = lerp(112, 0, m), dy = lerp(84, 0, m), ra = lerp(22, 0, m);   // they start diagonally apart and converge
    const tA = `translate(${(-dx).toFixed(2)} ${(-dy + bob).toFixed(2)}) rotate(${ra.toFixed(2)}) scale(${S})`;
    const tB = `translate(${dx.toFixed(2)} ${(dy - bob).toFixed(2)}) rotate(${(-ra).toFixed(2)}) scale(${S})`;
    gA.setAttribute('transform', tA); gB.setAttribute('transform', tB);
    clipPath.setAttribute('transform', tA); lens.setAttribute('transform', tB);

    const cO = smooth(.56, .64, p);                              // the merged heart takes over
    gA.style.opacity = gB.style.opacity = (1 - cO).toFixed(3);
    lensClip.style.opacity = (smooth(.12, .42, m) * (1 - cO)).toFixed(3);
    namesA.style.opacity = namesB.style.opacity = (1 - smooth(.28, .5, m)).toFixed(3);

    const settled = smooth(.7, .78, p);
    const pop = (.9 + .1 * cO) * (1 + .14 * bump(p, .58, .72)) * (1 + settled * beat(now));
    gC.setAttribute('transform', `scale(${(S * pop).toFixed(4)})`);
    gC.style.opacity = cO.toFixed(3);
    gDate.style.opacity = smooth(.62, .74, p).toFixed(3);

    glow.style.opacity = Math.min(1, .95 * bump(p, .48, .72) + .5 * smooth(.66, .8, p) * (.82 + .18 * Math.sin(now / 520))).toFixed(3);
    glow.setAttribute('r', (140 + 80 * bump(p, .5, .75)).toFixed(1));

    const rk = clamp((p - .57) / .22);                           // shockwave ring
    ring.setAttribute('r', lerp(70, 300, ease3(rk)).toFixed(1));
    ring.setAttribute('stroke-width', lerp(5, .8, rk).toFixed(2));
    ring.style.opacity = (rk > 0 && rk < 1 ? (1 - rk) * .9 : 0).toFixed(3);

    sparks.forEach(s => {                                        // sparkles burst outward
      const k = clamp((p - .58 - s.lag) / .3), r = lerp(30, s.d, ease3(k));
      s.el.setAttribute('transform', `translate(${(Math.cos(s.a) * r).toFixed(1)} ${(Math.sin(s.a) * r * .85).toFixed(1)}) scale(${(s.s * (.3 + Math.sin(Math.PI * k))).toFixed(2)})`);
      s.el.style.opacity = (Math.sin(Math.PI * k) * .95).toFixed(2);
    });

    minis.forEach((mh, i) => {                                   // little hearts float up from the big one
      const ph = ((now / 3600) + i / 6) % 1;
      const x = (i % 2 ? 1 : -1) * (14 + (i * 17) % 46) + Math.sin(ph * 7 + i) * 8;
      mh.setAttribute('transform', `translate(${x.toFixed(1)} ${(-74 - ph * 140).toFixed(1)}) scale(${(.12 + .06 * ((i * 7) % 3)).toFixed(3)})`);
      mh.style.opacity = (live ? Math.sin(Math.PI * ph) * settled * .85 : 0).toFixed(3);
    });

    if (live) {
      const k = smooth(.74, .86, p);
      info.style.opacity = k.toFixed(3); info.style.transform = `translateY(${((1 - k) * 14).toFixed(1)}px)`;
      hint.style.opacity = (1 - smooth(.03, .12, p)).toFixed(3);
    }
  }

  const canStick = !!(window.CSS && CSS.supports && CSS.supports('overflow-x', 'clip'));
  if (!fx || !canStick) { paint(1, 0); }                       // static: just the merged heart
  else {
    live = true;
    sec.classList.add('on');
    let progress = 0, visible = false, raf = 0;
    const tick = now => { raf = 0; paint(progress, now); if (visible) raf = requestAnimationFrame(tick); };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    scroll(p => { progress = p; kick(); }, { target: sec, offset: ['start start', 'end end'] });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(sec);
    paint(0, 0);

    // dock / hint / tapping the hearts jump straight to the merged state (a plain alternative to scrolling through it)
    const goMerged = () => {
      const top = sec.getBoundingClientRect().top + scrollY, range = sec.offsetHeight - innerHeight;
      scrollTo({ top: top + range * .9, behavior: 'smooth' });
    };
    $$('a[href="#savedate"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); goMerged(); }));
    stage.addEventListener('click', () => { if (progress < .5) goMerged(); });
  }

  // after tapping Save the Date (the browser downloads the .ics), say what to do with it
  const note = $('#calNote'), icsBtn = $('#icsBtn');
  icsBtn.addEventListener('click', () => {
    const s = $('span', note); s.dataset.i18n = 'icsHint'; s.textContent = t('icsHint');
    if (fx) { const r = icsBtn.getBoundingClientRect(); Petals.burst(r.left + r.width / 2, r.top + r.height / 2, 34); }
  });
});

/* ─────────────────────────────  Venue: golden hour at the temple  ───────────────────────────── */
safe('scene', () => {
  const svg = $('#sceneSvg'), scene = $('#scene'), sun = $('.sc-sun', scene);
  defsGradient(svg, 'gVFar', [[0, '#D798A8'], [1, '#F3BBA2']]);
  defsGradient(svg, 'gVMid', [[0, '#6F8BA2'], [1, '#A9BFC6']]);
  defsGradient(svg, 'gPond', [[0, '#86B7B8'], [1, '#E2EEEA']]);
  svgEl('path', { d: 'M0 332 C140 270 300 312 480 282 C660 252 800 322 1000 290 C1180 262 1320 310 1440 282 V560 H0Z', fill: 'url(#gVFar)', opacity: .9 }, svg);
  svgEl('path', { d: 'M0 394 C180 342 360 384 560 352 C760 320 940 390 1140 354 C1280 332 1380 368 1440 352 V560 H0Z', fill: 'url(#gVMid)' }, svg);

  const BASE = 424, FILL = '#1C5666', temple = (g, glow) => {
    gopuram(g, { cx: 720, base: BASE, w: 250, tiers: 7, th: 44, fill: FILL, win: '#FFE7A2', glow });
    [[470, 112, 4, 30], [970, 112, 4, 30], [330, 64, 3, 22], [1110, 64, 3, 22]].forEach(([cx, w, tiers, th]) =>
      gopuram(g, { cx, base: BASE, w, tiers, th, fill: '#2A6676', win: '#FFE7A2', glow, ws: .8 }));
    svgEl('rect', { x: 280, y: BASE - 12, width: 880, height: 14, fill: FILL }, g);                  // the long base wall
  };
  const ground = svgEl('g', {}, svg);
  svgEl('rect', { x: 0, y: BASE, width: 1440, height: 160, fill: 'url(#gPond)' }, ground);
  // reflection: the temple flipped across the waterline, soft
  const refl = svgEl('g', { transform: `translate(0 ${BASE * 2}) scale(1 -1)`, opacity: .26 }, svg);
  temple(refl, false);
  svgEl('rect', { x: 0, y: BASE, width: 1440, height: 140, fill: 'url(#gPond)', opacity: .55 }, svg);   // veil over the reflection
  const main = svgEl('g', {}, svg);
  temple(main, true);
  [[120, 190], [186, 140], [1256, 176], [1330, 214], [1392, 132]].forEach(([x, h]) => palm(main, x, BASE + 6, h, '#124452'));
  for (let i = 0; i < 7; i++) {                                                                       // ripples
    const y = BASE + 26 + i * 18;
    svgEl('path', { d: `M${200 + i * 70} ${y} h${360 - i * 20}`, stroke: '#FFFFFF', 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: .4, class: 'wave', style: `animation-delay:${i * -.7}s` }, svg);
  }
  for (let i = 0; i < 16; i++) {                                                                      // fireflies
    const c = svgEl('circle', { cx: 160 + Math.random() * 1120, cy: 250 + Math.random() * 190, r: 2 + Math.random() * 1.6, fill: '#FFE9A8', class: 'ff' }, svg);
    c.style.setProperty('--fx', (Math.random() * 40 - 20).toFixed(0) + 'px'); c.style.setProperty('--fy', (-10 - Math.random() * 34).toFixed(0) + 'px');
    c.style.animationDelay = (-Math.random() * 7).toFixed(1) + 's'; c.style.animationDuration = (5 + Math.random() * 5).toFixed(1) + 's';
  }
  if (fx) scroll(p => {
    svg.style.transform = `translate3d(0,${((.5 - p) * 40).toFixed(1)}px,0) scale(${(1 + p * .05).toFixed(4)})`;
    sun.style.transform = `translate3d(-50%,${((p - .5) * -60).toFixed(1)}px,0)`;
  }, { target: scene, offset: ['start end', 'end start'] });
});

/* ─────────────────────────────  Moments: flick the polaroids  ───────────────────────────── */
safe('deck', () => {
  const deck = $('#deck'), cards = $$('.pol', deck), N = cards.length, count = $('#gCount');
  const REST = [-3.5, 4, -5, 2.5, -2.5];                         // each photo's own resting tilt
  let order = cards.map((_, i) => i), drag = null, suppress = false, busy = false, lbOpen = false;
  const top = () => cards[order[0]];
  const SPRING = { type: 'spring', stiffness: 210, damping: 24, mass: .8 };

  function place(i, depth, instant) {
    const el = cards[i];
    el.style.zIndex = String(N - depth);
    const to = { x: 0, y: depth * 14, scale: 1 - depth * .045, rotate: REST[i % REST.length] * (depth ? 1 : .8), opacity: depth < 3 ? 1 : 0 };
    if (!fx) { Object.assign(el.style, { transform: `translateY(${to.y}px) scale(${to.scale}) rotate(${to.rotate}deg)`, opacity: String(to.opacity) }); return; }
    animate(el, to, instant ? { duration: 0 } : SPRING);
  }
  function layout(instant) {
    order.forEach((i, depth) => place(i, depth, instant));
    count.textContent = (order[0] + 1) + ' / ' + N;
    cards.forEach((c, i) => { const isTop = i === order[0]; c.setAttribute('aria-hidden', String(!isTop)); c.firstElementChild.tabIndex = isTop ? 0 : -1; });
  }
  async function flick(dir) {
    if (busy) return; busy = true;
    const el = top();
    if (fx) await animate(el, { x: dir * innerWidth * .95, y: (drag ? drag.dy : 0) * .35 - 30, rotate: dir * 32, opacity: 0 }, { duration: .42, ease: [.5, 0, .8, .6] });
    order.push(order.shift());
    place(order[N - 1], N - 1, true);                            // the flicked card goes to the bottom of the pile
    layout(false);
    busy = false;
  }
  async function back() {
    if (busy) return; busy = true;
    const i = order[N - 1], el = cards[i];
    order.unshift(order.pop());
    if (fx) animate(el, { x: -innerWidth * .9, rotate: -24, opacity: 0 }, { duration: 0 });
    layout(false);
    busy = false;
  }
  const next = () => flick(1), prev = back;
  $('#gNext').addEventListener('click', () => next());
  $('#gPrev').addEventListener('click', () => prev());
  deck.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  deck.addEventListener('pointerdown', e => {
    if (e.button || busy) return;
    drag = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false, v: 0, lastX: e.clientX, lastT: performance.now() };
  });
  deck.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 9) { drag.moved = true; top().classList.add('drag'); try { deck.setPointerCapture(e.pointerId); } catch (x) {} }
    if (!drag.moved) return;
    const now = performance.now(), dtm = Math.max(1, now - drag.lastT);
    drag.v = .75 * drag.v + .25 * ((e.clientX - drag.lastX) / dtm); drag.lastX = e.clientX; drag.lastT = now;
    drag.dx = dx; drag.dy = dy;
    if (fx) animate(top(), { x: dx, y: dy * .4, rotate: REST[order[0] % REST.length] * .8 + dx * .06 }, { duration: 0 });
  });
  const end = () => {
    if (!drag) return;
    const d = drag, el = top();
    el.classList.remove('drag');
    if (d.moved) {
      suppress = true; setTimeout(() => { suppress = false; }, 60);
      if (Math.abs(d.dx) > 90 || Math.abs(d.v) > .55) { drag = d; flick(d.dx > 0 || d.v > .55 ? 1 : -1).then(() => { drag = null; }); return; }
      layout(false);                                             // not far enough: spring back
    }
    drag = null;
  };
  deck.addEventListener('pointerup', end);
  deck.addEventListener('pointercancel', end);

  layout(true);
  if (fx) inView(deck, () => {                                    // a small nudge hints that it can be flicked
    setTimeout(() => animate(top(), { x: [0, 26, -10, 0], rotate: [REST[order[0] % REST.length] * .8, 5, -3, REST[order[0] % REST.length] * .8] }, { duration: 1, ease: 'easeInOut' }), 600);
  }, { amount: .7 });

  /* Lightbox */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount'), lbStage = $('#lbStage');
  const photos = cards.map(f => { const i = $('img', f); return { src: i.currentSrc || i.src, alt: i.alt }; });
  const norm = i => ((i % N) + N) % N;
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
    show(i); lbOpen = true;
    root.classList.add('lb-lock');
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  }
  function closeLb() { if (lb.close) lb.close(); else { lb.removeAttribute('open'); onClosed(); } }
  function onClosed() {
    lbOpen = false; root.classList.remove('lb-lock');
    while (order[0] !== cur) { order.push(order.shift()); }      // the deck shows the photo you were just looking at
    layout(true);
  }
  lb.addEventListener('close', onClosed);
  deck.addEventListener('click', e => {
    if (suppress) return;
    const b = e.target.closest('.g-open'); if (b) openAt(+b.dataset.i);
  });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => show(cur - 1));
  $('#lbNext').addEventListener('click', () => show(cur + 1));
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
  });
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
  void lbOpen;
});

/* ─────────────────────────────  Finale: lanterns rise, the RSVP lamp sends more  ───────────────────────────── */
safe('lanterns', () => {
  const box = $('#lanterns'), sec = $('#rsvp'), lamp = $('#rsvpBtn');
  const n = innerWidth < 640 ? 8 : 14;
  const sizeBox = () => box.style.setProperty('--h', (sec.offsetHeight + 180) + 'px');
  sizeBox(); addEventListener('resize', sizeBox);
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i'); el.className = 'lantern';
    const w = 22 + Math.random() * 26;
    el.style.setProperty('--x', (4 + Math.random() * 90).toFixed(1) + '%');
    el.style.setProperty('--w', w.toFixed(0) + 'px');
    el.style.setProperty('--d', (20 + Math.random() * 16).toFixed(1) + 's');
    el.style.setProperty('--dl', (-Math.random() * 34).toFixed(1) + 's');
    el.style.setProperty('--sway', ((Math.random() - .5) * 90).toFixed(0) + 'px');
    el.style.setProperty('--i', String(i));
    box.appendChild(el);
  }
  // tapping the lamp releases a flight of lanterns from the button itself, then WhatsApp opens as usual
  lamp.addEventListener('click', () => {
    if (!fx) return;
    const r = lamp.getBoundingClientRect(), s = sec.getBoundingClientRect();
    const left = r.left - s.left + r.width / 2, topY = r.top - s.top;
    for (let i = 0; i < 9; i++) {
      const el = document.createElement('i'); el.className = 'lantern';
      el.style.cssText = `animation:none;opacity:0;left:${(left + (Math.random() - .5) * r.width * .8).toFixed(0)}px;top:${topY.toFixed(0)}px;bottom:auto;--w:${(20 + Math.random() * 20).toFixed(0)}px`;
      box.appendChild(el);
      animate(el, { y: [0, -(topY + 200)], x: [0, (Math.random() - .5) * 120], opacity: [0, 1, 1, 0], scale: [.5, 1] },
        { duration: 3.2 + Math.random() * 2.2, delay: i * .12, ease: 'easeOut' }).then(() => el.remove());
    }
    Petals.burst(r.left + r.width / 2, r.top + r.height / 2, 28);
  });
});

/* tactile press feedback on every button */
safe('press', () => {
  if (!fx || !press) return;
  press('.btn, .lamp, .g-btn, .lb-btn, .d-btn, .chip, .ev-tabs button', el => {
    animate(el, { scale: .94 }, { duration: .12 });
    return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 420, damping: 16 });
  });
});

/* everything registered its language hook; now render the language (this also runs those hooks) */
IV.applyLang();
})();
