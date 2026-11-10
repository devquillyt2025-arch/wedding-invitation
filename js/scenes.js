'use strict';
/* ═══════════════════════════════════════════════════════════════════════════════
   Scenes (first half of the page): the lotus intro, the sunrise hero, the verse, the couple + garland.
   ═══════════════════════════════════════════════════════════════════════════════ */
(() => {
const { $, $$, animate, scroll, inView, stagger, reduce, fx, clamp, lerp, ease3, smooth, sleep, safe, svgEl, EASE,
  root, Tilt, Petals, langHooks, defsGradient, gopuram, palm, musicState, showPrompt } = IV;

/* ─────────────────────────────  Hero scene drawing  ───────────────────────────── */
safe('hills', () => {
  // far → near; each layer fades into the page's pearl at its foot so the hero melts into the next section
  const far = $('#hillFar'), mid = $('#hillMid'), near = $('#hillNear');
  [far, mid, near].forEach(s => s.setAttribute('preserveAspectRatio', 'xMidYMax slice'));
  defsGradient(far, 'gFar', [[0, '#B4C9DA'], [.72, '#D3DFE7'], [1, '#FBF7F1']]);
  svgEl('path', { d: 'M0 250 C120 190 260 232 400 196 C560 154 700 236 880 200 C1040 168 1220 232 1440 190 V400 H0Z', fill: 'url(#gFar)' }, far);

  defsGradient(mid, 'gMid', [[0, '#7FA9B6'], [.62, '#AFCBD0'], [1, '#FBF7F1']]);
  svgEl('path', { d: 'M0 300 C160 236 330 286 540 246 C760 206 900 292 1100 254 C1250 226 1360 270 1440 250 V400 H0Z', fill: 'url(#gMid)' }, mid);
  gopuram(mid, { cx: 850, base: 284, w: 90, tiers: 5, th: 23, fill: '#4A8593', win: '#FFE9AE' });
  gopuram(mid, { cx: 700, base: 262, w: 40, tiers: 3, th: 17, fill: '#5A92A0', win: '#FFE9AE', glow: false });

  defsGradient(near, 'gNear', [[0, '#1E6877'], [.5, '#2E7E8B'], [1, '#FBF7F1']]);
  svgEl('path', { d: 'M0 352 C200 312 420 352 650 330 C860 310 1040 356 1230 336 C1330 326 1400 340 1440 336 V400 H0Z', fill: 'url(#gNear)' }, near);
  [[430, 128], [492, 92], [988, 104], [1046, 132], [1100, 84]].forEach(([x, h]) => palm(near, x, 346, h, '#17505E'));

  // a few birds crossing the dawn
  const birds = $('#birds');
  [[10, 26, '34s', '0s'], [34, 44, '38s', '-9s'], [-6, 60, '42s', '-18s'], [20, 12, '36s', '-26s']].forEach(([x, y, t, dl]) => {
    const g = svgEl('g', { class: 'bird' }, birds);
    g.style.setProperty('--y', y + 'px'); g.style.setProperty('--t', t); g.style.setProperty('--dl', dl);
    svgEl('path', { d: `M${x} 0 q5 -7 10 0 q5 -7 10 0` }, g);
  });
});

/* ─────────────────────────────  Hero: entrance + parallax loop  ───────────────────────────── */
const hero = $('#home'), sunIn = $('#sunIn'), nameFoils = $$('.nm .foil'), ampFoils = $$('.amp .foil'), heroItems = $$('.h-in');
if (fx) {
  heroItems.forEach(el => { el.style.opacity = '0'; });
  ampFoils.forEach(el => { el.style.opacity = '0'; });
  nameFoils.forEach(el => { animate(el, { y: '118%' }, { duration: 0 }); });
  animate(sunIn, { y: '48vh', opacity: 0 }, { duration: 0 });
  $$('.hill').forEach(el => { el.style.opacity = '0'; });
}

let scrollP = 0;
safe('heroLoop', () => {
  if (!fx) return;
  const sun = $('#sun'), clouds = $('#clouds'), inner = $('#heroInner'), [far, mid, near] = $$('.hill');
  let visible = true, raf = 0;
  scroll(p => { scrollP = p; kick(); }, { target: hero, offset: ['start start', 'end start'] });
  const loop = now => {
    raf = 0;
    if (!visible || document.hidden) return;
    const s = Tilt.s;
    let tx = s.x, ty = s.y;
    if (now - s.t > 2600) { tx = Math.sin(now / 3100) * .5; ty = Math.cos(now / 3900) * .3; }
    const p = scrollP;
    sun.style.transform = `translate3d(${(tx * -14).toFixed(1)}px,${(p * 150 + ty * -8).toFixed(1)}px,0)`;
    clouds.style.transform = `translate3d(${(tx * -26).toFixed(1)}px,${(p * 70).toFixed(1)}px,0)`;
    far.style.transform = `translate3d(${(tx * -10).toFixed(1)}px,${(p * 36).toFixed(1)}px,0)`;
    mid.style.transform = `translate3d(${(tx * -22).toFixed(1)}px,${(p * 6).toFixed(1)}px,0)`;
    near.style.transform = `translate3d(${(tx * -38).toFixed(1)}px,${(p * -34).toFixed(1)}px,0)`;
    inner.style.transform = `translate3d(0,${(p * 46).toFixed(1)}px,0)`;
    raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (visible && !raf) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  kick();
});

let heroPlayed = false;
function playHero() {
  if (heroPlayed) return; heroPlayed = true;
  if (!fx) return;
  animate(sunIn, { y: ['48vh', '0vh'], opacity: [0, 1] }, { duration: 2.4, ease: [.16, 1, .3, 1] });
  animate($$('.hill'), { opacity: [0, 1] }, { duration: 1.6, delay: stagger(.15) });
  animate(nameFoils, { y: ['118%', '0%'] }, { duration: 1.25, ease: EASE, delay: stagger(.15, { startDelay: .5 }) });
  animate(ampFoils, { opacity: [0, 1], scale: [.5, 1], rotate: [-14, 0] }, { duration: 1, delay: .95, ease: [.2, 1.2, .3, 1] });
  animate(heroItems, { opacity: [0, 1], y: [26, 0] }, { duration: .9, ease: EASE, delay: stagger(.13, { startDelay: .8 }) });
}

/* ─────────────────────────────  Intro: the lotus  ───────────────────────────── */
const lotusRings = [];
safe('lotus', () => {
  const lotus = $('#lotus');
  const spec = [
    { n: 9, spread: 160, scale: 1,   grad: 'gLotusOuter' },
    { n: 7, spread: 120, scale: .84, grad: 'gLotusMid' },
    { n: 5, spread: 78,  scale: .66, grad: 'gLotusInner' },
    { n: 3, spread: 36,  scale: .46, grad: 'gLotusInner' }
  ];
  spec.forEach(r => {
    const ring = document.createElement('div'); ring.className = 'lr';
    const petals = [];
    for (let i = 0; i < r.n; i++) {
      const open = (i - (r.n - 1) / 2) * (r.spread / (r.n - 1)), closed = open * .1;
      const el = document.createElement('div'); el.className = 'pt';
      el.innerHTML = `<svg viewBox="0 0 60 160" preserveAspectRatio="none"><path d="M30 160C5 122 3 58 30 3c27 55 25 119 0 157z" fill="url(#${r.grad})"/><path d="M30 148C30 100 30 52 30 16" stroke="rgba(255,255,255,.55)" stroke-width="1.2" fill="none"/><path d="M30 160C5 122 3 58 30 3c27 55 25 119 0 157z" fill="none" stroke="rgba(196,92,126,.28)" stroke-width="1"/></svg>`;
      ring.appendChild(el);
      petals.push({ el, open, closed });
      if (fx) animate(el, { rotate: closed, scale: r.scale * .93 }, { duration: 0 });
    }
    lotus.appendChild(ring);
    lotusRings.push({ ...r, petals });
  });
  const core = document.createElement('span'); core.className = 'lcore'; lotus.appendChild(core);
  lotusRings.core = core;
  if (!fx) {                                    // static fallback: lotus fully open
    lotusRings.forEach(r => r.petals.forEach(p => { p.el.style.transform = `rotate(${p.open}deg) scale(${r.scale})`; }));
  }
});

safe('intro', () => {
  const overlay = $('#envelope'), btn = $('#lotusBtn'), lotus = $('#lotus'), flash = $('#flash');
  let opened = false;
  root.classList.add('locked');
  if (fx) {
    animate(lotus, { scale: [1, 1.025, 1] }, { duration: 4.6, ease: 'easeInOut', repeat: Infinity });
    // the bud tilts toward the pointer / gyro a touch
    let ex = 0, raf = 0;
    const loop = now => {
      if (!overlay.isConnected || opened) return;
      const s = Tilt.s; let tx = s.x;
      if (now - s.t > 2400) tx = Math.sin(now / 2600) * .4;
      ex += (tx - ex) * .06;
      btn.style.transform = `rotate(${(ex * 2.2).toFixed(2)}deg)`;
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
  function bloom() {
    lotusRings.forEach((r, ri) => r.petals.forEach((p, i) =>
      animate(p.el, { rotate: [p.closed, p.open], scale: [r.scale * .93, r.scale] }, { duration: 1.6, delay: ri * .17 + i * .03, ease: [.22, .9, .28, 1] })));
    animate(lotusRings.core, { scale: [.6, 1.6], opacity: [.7, 1] }, { duration: 1.5, ease: EASE });
  }
  async function open(byTap, skip) {
    if (opened) return;
    opened = true;
    if (byTap) { Tilt.request(); if (!musicState.userPaused) Music.play(); }   // a tap is a user gesture: audio + iOS motion permission
    if (reduce || !fx) { overlay.style.display = 'none'; playHero(); finish(); return; }
    overlay.classList.add('opening');
    if (skip) {
      animate(overlay, { opacity: [1, 0] }, { duration: .55 });
      playHero();
      await sleep(750); finish(); return;
    }
    bloom();
    await sleep(2000);                                           // let the petals open fully before the light floods in
    animate(flash, { opacity: [0, .9, .9], scale: [.15, 1, 3.2] }, { duration: 1.15, times: [0, .42, 1], ease: 'easeOut' });
    await sleep(700);
    playHero();
    animate(overlay, { opacity: [1, 0] }, { duration: .95, ease: 'easeInOut' });
    await sleep(1050);
    finish();
  }
  // Opening waits for a tap anywhere on the intro screen: that tap is what lets the music start on phones
  overlay.addEventListener('click', () => open(true));
  $('#envSkip').addEventListener('click', e => { e.stopPropagation(); open(true, true); });
});

/* ─────────────────────────────  Verse: words ink in as you scroll  ───────────────────────────── */
safe('verse', () => {
  const vt = $('#verseText'), sec = $('#verse');
  let words = [], progress = 0;
  const paint = () => {
    const n = words.length;
    words.forEach((w, i) => { w.style.opacity = (.17 + .83 * clamp(progress * (n + 5) - i)).toFixed(3); });
  };
  const split = () => {
    const txt = vt.textContent;
    vt.textContent = '';
    txt.split('\n').forEach((line, li) => {
      if (li) vt.appendChild(document.createElement('br'));
      line.split(/\s+/).filter(Boolean).forEach(word => {
        const s = document.createElement('span'); s.className = 'w'; s.textContent = word;
        vt.appendChild(s); vt.appendChild(document.createTextNode(' '));
      });
    });
    words = $$('.w', vt);
    if (!fx) words.forEach(w => { w.style.opacity = '1'; }); else paint();
  };
  langHooks.push(split);
  if (fx) scroll(p => { progress = p; paint(); }, { target: sec, offset: ['start 0.82', 'end 0.5'] });
});

/* ─────────────────────────────  Couple: arch parallax + the garland of seven beads  ───────────────────────────── */
safe('couple', () => {
  const pair = $('#pair'), svg = $('#garland');
  if (fx) $$('.arch', pair).forEach(arch => {
    const img = $('img', arch);
    scroll(p => { img.style.transform = `translate3d(0,${((p - .5) * 64).toFixed(1)}px,0)`; }, { target: arch, offset: ['start end', 'end start'] });
  });

  const rel = el => { let x = 0, y = 0, e = el; while (e && e !== pair) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
  let beads = [], pathEl = null, L = 0, progress = fx ? 0 : 1;
  const paintGarland = () => {
    if (!pathEl) return;
    const p = clamp(progress);
    pathEl.style.strokeDashoffset = String(L * (1 - p));
    beads.forEach(b => {
      const k = smooth(b.f - .06, b.f + .02, p);
      b.el.style.opacity = k.toFixed(2);
      b.el.setAttribute('r', (b.r * (.3 + .7 * k)).toFixed(2));
    });
  };
  function layout() {
    svg.textContent = '';
    const [ga, gb] = $$('.arch', pair);
    const a = rel(ga), b = rel(gb), W = pair.offsetWidth, H = pair.offsetHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const wide = matchMedia('(min-width:820px)').matches;
    let d;
    if (wide) {                                       // apex to apex, a garland sagging between the two arches
      const x0 = a.x + a.w / 2, y0 = a.y - 10, x1 = b.x + b.w / 2, y1 = b.y - 10;
      const sag = Math.max(110, Math.abs(x1 - x0) * .3);
      d = `M${x0} ${y0} C${x0 + (x1 - x0) * .22} ${y0 - 34 + sag} ${x0 + (x1 - x0) * .78} ${y1 - 34 + sag} ${x1} ${y1}`;
    } else {                                          // stacked: a swaying strand from the groom's text down to the bride's arch
      const gt = ga.closest('.who'), tx = gt.offsetLeft + gt.offsetWidth / 2, ty = gt.offsetTop + gt.offsetHeight + 10;
      const x1 = b.x + b.w / 2, y1 = b.y - 12;
      d = `M${tx} ${ty} C${tx + 56} ${ty + (y1 - ty) * .3} ${x1 - 56} ${ty + (y1 - ty) * .7} ${x1} ${y1}`;
    }
    svgEl('path', { d, class: 'gl-soft' }, svg);
    pathEl = svgEl('path', { d, class: 'gl' }, svg);
    L = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = String(L);
    beads = [];
    for (let i = 1; i <= 7; i++) {                    // seven beads: the seven steps (the middle one is the knot)
      const f = i / 8, pt = pathEl.getPointAtLength(L * f), mid = i === 4;
      const el = svgEl('circle', { cx: pt.x.toFixed(1), cy: pt.y.toFixed(1), r: mid ? 6.5 : 4, class: mid ? 'knot' : 'bead' }, svg);
      beads.push({ el, f, r: mid ? 6.5 : 4 });
    }
    paintGarland();
  }
  layout();
  if (fx) scroll(p => { progress = p; paintGarland(); }, { target: pair, offset: ['start 0.72', 'end 0.5'] });
  let rt; const relayout = () => { clearTimeout(rt); rt = setTimeout(layout, 120); };
  addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  $$('img', pair).forEach(img => img.addEventListener('load', relayout, { once: true }));
});

/* ─────────────────────────────  Scroll reveals ([data-rv])  ───────────────────────────── */
safe('reveals', () => {
  if (!fx) return;
  const els = $$('[data-rv]');
  els.forEach(el => { el.style.opacity = '0'; });
  inView(els, el => {
    const d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
    const big = el.classList.contains('arch');
    animate(el, big ? { opacity: [0, 1], y: [80, 0], scale: [.94, 1] } : { opacity: [0, 1], y: [34, 0] },
      { duration: big ? 1.15 : .9, delay: d, ease: EASE });
  }, { amount: .16, margin: '0px 0px -6% 0px' });
});

/* page progress → the rail on the right edge */
safe('rail', () => {
  if (!fx) return;
  const bar = $('#rail span');
  scroll(p => { bar.style.transform = `scaleY(${p.toFixed(4)})`; });
});

})();
