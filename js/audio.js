/* ==========================================================
   EUREKA DROP · audio.js
   Música y efectos 100 % originales sintetizados en tiempo real
   con Web Audio (sin archivos, sin derechos de terceros).
   Canales independientes de música y efectos + silencio global.
   ========================================================== */
(function (EZ) {
  'use strict';
  const A = (EZ.audio = {});
  let ctx = null, master, musicGain, sfxGain, noiseBuf;

  const MAJ = [0, 4, 7, 12, 16, 19, 24];
  const MIN = [0, 3, 7, 12, 15, 19, 24];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* ---------- Pistas: progresión + patrones (índices de nota del acorde) ---------- */
  const _ = -1;
  const TRACKS = {
    title: { bpm: 112, key: 60, wave: 'square', prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']],
      lead: [[2, _, 3, _, 4, _, 3, 2, _, 2, 3, _, 5, _, 4, _], [4, _, 3, _, 2, _, 1, _, 2, _, 3, 4, _, 3, _, _]],
      bass: 'x.x.o.x.x.x.o.x.', kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
    menu: { bpm: 96, key: 62, wave: 'triangle', prog: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']],
      lead: [[2, _, _, 3, _, _, 4, _, _, _, 3, _, 2, _, _, _], [1, _, _, 2, _, _, 3, _, 4, _, _, _, _, _, _, _]],
      bass: 'x...o...x...o...', kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
    avatar: { bpm: 118, key: 65, wave: 'square', prog: [[0, 'M'], [5, 'M'], [2, 'm'], [7, 'M']],
      lead: [[3, 2, 3, _, 4, _, 2, _, 3, 2, 3, _, 1, _, _, _], [2, 3, 4, _, 5, 4, 3, _, 2, _, 1, _, 2, _, _, _]],
      bass: 'x.xox.x.x.xox.x.', kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' },
    explore: { bpm: 112, key: 60, wave: 'square', prog: [[0, 'M'], [5, 'M'], [9, 'm'], [7, 'M']],
      lead: [[2, _, 3, 4, _, 3, 2, _, 1, _, 2, _, 3, _, _, _], [4, _, 5, 4, _, 3, 2, _, 3, _, 2, _, 1, _, _, _]],
      bass: 'x.x.x.o.x.x.x.o.', kick: 'x...x...x...x...', snare: '....x.......x..x', hat: 'x.xxx.xxx.xxx.xx' },
    challenge: { bpm: 92, key: 57, wave: 'triangle', prog: [[0, 'm'], [8, 'M'], [5, 'm'], [7, 'M']],
      lead: [[3, _, _, _, 2, _, _, _, 1, _, _, _, 2, _, _, _], [3, _, _, _, 4, _, _, _, 3, _, 2, _, _, _, _, _]],
      bass: 'x...x...x...x...', kick: 'x.......x.......', snare: '................', hat: 'x.x.x.x.x.x.x.x.', soft: true },
    boss: { bpm: 142, key: 52, wave: 'sawtooth', prog: [[0, 'm'], [10, 'M'], [8, 'M'], [7, 'M']],
      lead: [[3, 3, _, 4, _, 3, _, 2, 3, 3, _, 5, _, 4, _, 3], [2, 2, _, 3, _, 2, _, 1, 2, _, 3, _, 4, _, 5, _]],
      bass: 'xxoxxxoxxxoxxxox', kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x.xx', hat: 'xxxxxxxxxxxxxxxx' }
  };
  /** Variación de la música de exploración por territorio (tono y timbre). */
  const AREA_FLAVOR = {
    mat: { key: 60, wave: 'square', bpm: 116 }, len: { key: 62, wave: 'triangle', bpm: 104 },
    med: { key: 57, wave: 'sawtooth', bpm: 110 }, ing: { key: 64, wave: 'square', bpm: 120 },
    ef: { key: 59, wave: 'sawtooth', bpm: 128 }, mix: { key: 61, wave: 'square', bpm: 118 }
  };

  let current = null, step = 0, nextTime = 0, timer = null, currentName = '';

  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    A.applySettings();
    timer = setInterval(schedule, 25);
  };

  A.applySettings = function () {
    if (!ctx) return;
    const s = EZ.save.settings;
    master.gain.value = s.mute ? 0 : 1;
    musicGain.gain.value = s.music * 0.32;
    sfxGain.gain.value = s.sfx * 0.6;
  };

  function tone(dest, type, freq, t, dur, vol, slideTo) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dest, t, dur, vol, filterType, freq, freqTo) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = filterType; f.frequency.setValueAtTime(freq, t);
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t); s.stop(t + dur + 0.02);
  }

  function schedule() {
    if (!current || !ctx) return;
    const spb = 60 / current.bpm / 4;
    while (nextTime < ctx.currentTime + 0.12) {
      playStep(current, step, nextTime, spb);
      step++; nextTime += spb;
    }
  }
  function playStep(tr, st, t, spb) {
    const s = st % 16, bar = Math.floor(st / 16);
    const [root, q] = tr.prog[bar % tr.prog.length];
    const tones = q === 'm' ? MIN : MAJ;
    const base = tr.key + root;
    const pat = tr.lead[Math.floor(bar / 2) % tr.lead.length];
    const li = pat[s];
    const vol = tr.soft ? 0.06 : 0.09;
    if (li >= 0) tone(musicGain, tr.wave, mtof(base + 12 + tones[li]), t, spb * 1.8, vol);
    const b = tr.bass[s];
    if (b === 'x') tone(musicGain, 'triangle', mtof(base - 12), t, spb * 1.6, 0.22);
    if (b === 'o') tone(musicGain, 'triangle', mtof(base - 5), t, spb * 1.6, 0.18);
    if (s % 4 === 0 && !tr.soft) tone(musicGain, 'sine', mtof(base + tones[1]), t, spb * 3.5, 0.03);
    if (tr.kick[s] === 'x') tone(musicGain, 'sine', 140, t, 0.18, 0.5, 40);
    if (tr.snare[s] === 'x') noise(musicGain, t, 0.14, 0.25, 'bandpass', 1800);
    if (tr.hat[s] === 'x') noise(musicGain, t, 0.04, tr.soft ? 0.05 : 0.08, 'highpass', 7000);
  }

  /** Cambia la música. name: title|menu|avatar|explore|challenge|boss; flavor = área. */
  A.music = function (name, flavor) {
    const id = name + ':' + (flavor || '');
    if (id === currentName) return;
    currentName = id;
    if (!TRACKS[name]) { current = null; return; }
    current = Object.assign({}, TRACKS[name]);
    if (name === 'explore' && AREA_FLAVOR[flavor]) Object.assign(current, AREA_FLAVOR[flavor]);
    step = 0;
    nextTime = ctx ? ctx.currentTime + 0.08 : 0;
  };
  A.stopMusic = function () { current = null; currentName = ''; };

  /** Jingles de una sola vez (victoria / derrota). */
  function jingle(notes, wave, spb) {
    const t0 = ctx.currentTime + 0.05;
    notes.forEach((n, i) => { if (n) tone(musicGain, wave, mtof(n), t0 + i * spb, spb * 2.2, 0.12); });
  }

  /* ---------- Efectos ---------- */
  const SFX = {
    click: (t) => tone(sfxGain, 'square', 660, t, 0.05, 0.12),
    jump: (t) => tone(sfxGain, 'square', 280, t, 0.18, 0.15, 620),
    coin: (t) => { tone(sfxGain, 'square', 988, t, 0.07, 0.12); tone(sfxGain, 'square', 1319, t + 0.07, 0.16, 0.12); },
    pickup: (t) => { tone(sfxGain, 'triangle', 523, t, 0.08, 0.2); tone(sfxGain, 'triangle', 784, t + 0.08, 0.14, 0.2); },
    correct: (t) => [523, 659, 784, 1047].forEach((f, i) => tone(sfxGain, 'square', f, t + i * 0.07, 0.16, 0.13)),
    wrong: (t) => { tone(sfxGain, 'sawtooth', 220, t, 0.25, 0.15, 110); tone(sfxGain, 'sawtooth', 160, t + 0.12, 0.3, 0.12, 80); },
    door: (t) => { noise(sfxGain, t, 0.5, 0.35, 'lowpass', 1200, 200); tone(sfxGain, 'triangle', 110, t, 0.5, 0.25, 220); },
    chest: (t) => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(sfxGain, 'triangle', f, t + i * 0.06, 0.25, 0.12)),
    boom: (t) => { noise(sfxGain, t, 0.6, 0.6, 'lowpass', 900, 60); tone(sfxGain, 'sine', 90, t, 0.5, 0.5, 30); },
    hit: (t) => { tone(sfxGain, 'square', 300, t, 0.2, 0.18, 90); noise(sfxGain, t, 0.12, 0.2, 'bandpass', 900); },
    stomp: (t) => { tone(sfxGain, 'sine', 400, t, 0.12, 0.3, 120); noise(sfxGain, t, 0.15, 0.2, 'highpass', 3000); },
    whoosh: (t) => noise(sfxGain, t, 0.45, 0.3, 'bandpass', 400, 3000),
    achievement: (t) => [659, 784, 988, 1319].forEach((f, i) => tone(sfxGain, 'square', f, t + i * 0.1, 0.3, 0.12)),
    streak: (t) => [784, 988, 1175, 1568].forEach((f, i) => tone(sfxGain, 'sawtooth', f, t + i * 0.05, 0.12, 0.08)),
    fall: (t) => tone(sfxGain, 'triangle', 700, t, 0.6, 0.2, 80),
    crumble: (t) => noise(sfxGain, t, 0.3, 0.2, 'lowpass', 600, 150),
    switch: (t) => { tone(sfxGain, 'square', 440, t, 0.06, 0.15); tone(sfxGain, 'square', 330, t + 0.08, 0.1, 0.15); },
    shoot: (t) => tone(sfxGain, 'sawtooth', 900, t, 0.25, 0.1, 200),
    bossHit: (t) => { noise(sfxGain, t, 0.3, 0.4, 'bandpass', 600); tone(sfxGain, 'square', 200, t, 0.3, 0.2, 60); },
    victory: () => jingle([72, 76, 79, 84, null, 79, 84, 88, 91], 'square', 0.12),
    defeat: () => jingle([67, 66, 65, 64, null, 60, 55], 'triangle', 0.18),
    tick: (t) => tone(sfxGain, 'sine', 1200, t, 0.04, 0.1)
  };
  A.play = function (name) {
    if (!ctx || !SFX[name]) return;
    SFX[name](ctx.currentTime + 0.005);
  };

  /* ---------- Voz (para retos de Listening en inglés) ---------- */
  A.canSpeak = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  A.speak = function (text, lang = 'en-GB', rate = 0.85) {
    if (!A.canSpeak()) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = rate;
      const voices = speechSynthesis.getVoices();
      const v = voices.find((x) => x.lang === lang) || voices.find((x) => x.lang && x.lang.startsWith(lang.slice(0, 2)));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  };
})(window.EZ);
