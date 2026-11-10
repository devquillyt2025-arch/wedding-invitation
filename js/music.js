'use strict';
/* Background music: plays Madarangi-Kannada.mp3, or a synthesised instrumental if the file is missing. */

/* ─── Music: optional MP3, otherwise a Web-Audio instrumental (Canon in D, public domain) ─── */
const Music = (() => {
  const DUR = 2.4;
  // [bass, chord tones…] as MIDI note numbers — D A Bm F#m G D G A
  const CH = [[38, 62, 66, 69], [45, 61, 64, 69], [47, 62, 66, 71], [42, 61, 66, 69], [43, 62, 67, 71], [38, 62, 66, 69], [43, 62, 67, 71], [45, 61, 64, 69]];
  const MEL = [78, 76, 74, 73, 71, 69, 71, 73];
  const ARP = [0, 1, 2, 3, 2, 1, 2, 1];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let ctx, master, bus, delay, timer, nextT = 0, idx = 0, playing = false;
  let audio = null, fadeRaf = 0, useFile = !!CONFIG.musicUrl;
  if (useFile) {
    audio = new Audio(CONFIG.musicUrl);
    audio.loop = true; audio.preload = 'auto';
    audio.addEventListener('error', () => {
      useFile = false;
      if (playing) { playing = false; play(); }
    });
  }
  const listeners = [];

  function initSynth() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    bus = ctx.createBiquadFilter(); bus.type = 'lowpass'; bus.frequency.value = 3200; bus.connect(master);
    delay = ctx.createDelay(1); delay.delayTime.value = .36;
    const fb = ctx.createGain(); fb.gain.value = .38;
    const damp = ctx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 2000;
    const wet = ctx.createGain(); wet.gain.value = .32;
    delay.connect(damp); damp.connect(fb); fb.connect(delay); damp.connect(wet); wet.connect(master);
    return true;
  }
  function tone(type, midi, t, len, peak, att, send, detune = 0, vib = false) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = hz(midi); o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(bus);
    if (send) { const s = ctx.createGain(); s.gain.value = send; g.connect(s); s.connect(delay); }
    if (vib) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = 5; lg.gain.value = 9; l.connect(lg); lg.connect(o.detune);
      l.start(t); l.stop(t + len + .05);
    }
    o.start(t); o.stop(t + len + .05);
  }
  function chord(i, t) {
    const c = CH[i % 8], cyc = Math.floor(i / 8);
    for (let k = 1; k < 4; k++) {
      tone('sine', c[k], t, DUR + 1.4, .042, .9, .3);
      tone('triangle', c[k], t, DUR + 1.2, .016, 1.1, .2, 7);
    }
    tone('sine', c[0], t, DUR * .95, .15, .03, .08);
    if (cyc >= 1) {
      const notes = [c[1], c[2], c[3], c[1] + 12], step = DUR / 8;
      ARP.forEach((n, j) => tone('triangle', notes[n], t + j * step, 1.1, .045, .008, .5));
    }
    if (cyc >= 2 && cyc % 6 !== 5) tone('sine', MEL[i % 8], t, DUR * 1.05, .065, .25, .6, 0, true);
  }
  function schedule() {
    while (nextT < ctx.currentTime + .6) { chord(idx, nextT); nextT += DUR; idx++; }
  }
  function fadeFile(target, ms, done) {
    cancelAnimationFrame(fadeRaf);
    const from = audio.volume, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, Math.max(0, (now - t0) / ms));
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * k));
      if (k < 1) fadeRaf = requestAnimationFrame(step); else if (done) done();
    };
    fadeRaf = requestAnimationFrame(step);
  }
  function emit() { listeners.forEach(fn => fn(playing)); }

  function play() {
    if (playing) return;
    if (useFile) {
      audio.volume = 0;
      const p = audio.play();
      playing = true; emit();
      fadeFile(.85, 3000);
      if (p && p.catch) p.catch(err => {
        playing = false; emit();
        // Autoplay blocked → wait for a tap; anything else means the file is unusable → use the synth
        if (err && err.name !== 'NotAllowedError') { useFile = false; play(); }
      });
      return;
    }
    if (!ctx && !initSynth()) return;
    ctx.resume();
    playing = true;
    if (nextT < ctx.currentTime) nextT = ctx.currentTime + .08;
    schedule();
    timer = setInterval(schedule, 150);
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(.6, now + 3.5);
    emit();
    // Without a user gesture the context stays suspended → report not playing so the first tap retries
    setTimeout(() => { if (playing && ctx.state !== 'running') { clearInterval(timer); playing = false; emit(); } }, 400);
  }
  function pause() {
    if (!playing) return;
    playing = false; emit();
    // Hidden tabs don't run animation frames, so a fade would never finish there: stop at once
    if (useFile && audio) {
      if (document.hidden) { cancelAnimationFrame(fadeRaf); audio.pause(); }
      else fadeFile(0, 600, () => { if (!playing) audio.pause(); });
      return;
    }
    clearInterval(timer);
    if (document.hidden) { ctx.suspend(); return; }
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + .6);
    setTimeout(() => { if (!playing) ctx.suspend(); }, 700);
  }
  return {
    play, pause,
    toggle() { playing ? pause() : play(); },
    get playing() { return playing; },
    on(fn) { listeners.push(fn); }
  };
})();
