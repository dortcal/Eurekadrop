/* ==========================================================
   EUREKA DROP · game-engine.js
   Bucle de juego, física, colisiones, cámara, enemigos, jefes,
   eventos sorpresa, retos integrados en el mundo y HUD.
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, ART = EZ.art, T = ART.T, CT = EZ.controls, SC = EZ.scoring;
  const G = (EZ.game = { running: false, paused: false });
  let cv, ctx, dpr = 1, W = 0, H = 0, scale = 1, last = 0;
  const ids = () => EZ.AREAS.map((a) => a.id);

  /* ================= Inicialización ================= */
  G.init = function () {
    cv = U.$('#game'); ctx = cv.getContext('2d');
    window.addEventListener('resize', resize); resize();
    cv.addEventListener('click', () => { if (G.running && !G.paused && !G.ended) CT.action = true; });
    U.$('#hud-obj').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (b && G.mech && G.mech.hudAction) { G.mech.hudAction(b.getAttribute('data-act')); G._obj = ''; }
    });
    U.$('#btn-pause').addEventListener('click', () => G.pause());
    CT.onPause = () => G.pause();
    document.addEventListener('visibilitychange', () => { if (document.hidden) G.pause(); });
    requestAnimationFrame(frame);
  };
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    scale = U.clamp(Math.min(W / (13 * T), H / (8.6 * T)), 0.55, 1.4);
  }

  /* ================= Inicio de partida ================= */
  G.start = async function (cfg) {
    const S = EZ.save;
    const mixed = cfg.mode === 'daily' || cfg.mode === 'final';
    const rng = U.seeded(cfg.mode === 'daily' ? 'eureka-' + U.todayStr() : (Date.now() % 1e9) + 7);
    G.cfg = cfg; G.rng = rng; G.level = cfg.level;
    G.theme = mixed ? 'mix' : cfg.area;
    const gateAreas = mixed ? U.shuffle(ids(), rng) : [cfg.area];
    G.mechArea = mixed ? U.pick(ids(), rng) : cfg.area;
    G.bossArea = cfg.mode === 'final' ? 'final' : cfg.mode === 'daily' ? 'mix' : cfg.area;
    G.questKind = mixed ? 'mix' : cfg.area;
    const L = (G.L = EZ.levelGen.generate({ theme: G.theme, level: cfg.level, rng, gateAreas, mechArea: G.mechArea, bossArea: G.bossArea }));
    G.mapCanvas = ART.renderMap(L.map, G.theme, rng);
    G.player = { x: L.spawn.x, y: L.spawn.y, z: 0, jumpT: -1, dir: 'right', walk: 0, moving: false, runT: 0, inv: 0, safe: { x: L.spawn.x, y: L.spawn.y }, fall: 0, carry: null };
    G.chispa = { x: L.spawn.x - 30, y: L.spawn.y - 60 };
    G.run = {
      mode: cfg.mode, area: mixed ? (cfg.mode === 'daily' ? 'mix' : 'final') : cfg.area, level: cfg.level,
      score: 0, lives: S.settings.lives, maxLives: S.settings.lives, coins: 0, streak: 0, bestStreak: 0, ok: 0, ko: 0,
      wrong: [], items: 0, relics: [], stomps: 0, secret: false, quest: false, time: 0, won: false, bossNoDamage: false, liveAch: [], chests: 0
    };
    G.qs = EZ.questions.newSession();
    G.mechRoom = L.rooms.find((r) => r.role === 'mech');
    G.mech = EZ.mechanics.create(G.mechArea, G, G.mechRoom, L, rng, cfg.level);
    G.particles = []; G.floaters = []; G.projectiles = []; G.warnings = []; G.orbs = []; G.bolts = [];
    G.boss = null; G.t = 0; G.shakeT = 0; G.shakeA = 0;
    G.cam = { x: G.player.x, y: G.player.y };
    updateCamera(1);
    G.events = planEvents(rng, cfg.level); G.activeEvent = null;
    G.roomIdx = 0; G.flags = {}; G.nearest = null; G._obj = ''; G._hud = '';
    G.quest = { state: 'new', got: 0 };
    G.running = true; G.paused = true; G.ended = false;
    CT.active = true; CT.reset();
    EZ.ui.showGameScreen();
    EZ.audio.music('explore', mixed ? 'mix' : cfg.area);
    updateHUD(true);
    const area = EZ.area(cfg.area);
    const head = cfg.mode === 'story' ? `${area.island} · Fase ${cfg.level}` : cfg.mode === 'daily' ? 'Desafío del Día' : cfg.mode === 'final' ? 'La nube del Borrón' : `${area.island} · ${EZ.LEVEL_NAMES[cfg.level]}`;
    EZ.ui.banner(head);
    await U.wait(300);
    await EZ.ui.dialog([{ who: 'chispa', text: EZ.story.arrive[cfg.mode === 'daily' ? 'mix' : cfg.mode === 'final' ? 'final' : cfg.area] }]);
    G.paused = false;
    CT.reset();
    last = performance.now();
  };

  function planEvents(rng, lv) {
    const types = U.shuffle(['storm', 'goldChest', 'flash', 'coinRain'], rng);
    const ev = [{ at: U.rand(35, 60, rng), type: types[0] }];
    if (lv >= 2) ev.push({ at: U.rand(100, 140, rng), type: types[1] });
    return ev;
  }

  G.stop = function () {
    G.running = false; G.ended = true; CT.active = false; CT.reset();
    U.$('#hud').hidden = true; document.body.classList.remove('in-game');
  };
  G.pause = function () {
    if (!G.running || G.ended || G.paused) return;
    if (U.$('#modal.show, #mini.show, #dialog.show')) return;
    G.paused = true; CT.reset();
    EZ.ui.showPause(() => { G.paused = false; CT.reset(); last = performance.now(); }, () => { G.stop(); EZ.ui.go('menu'); });
  };
  G.resetInput = () => CT.reset();

  /* ================= Ayudas para otros módulos ================= */
  G.toast = (txt, kind, ms) => EZ.ui.toast(txt, kind, ms);
  G.shake = (a) => { if (EZ.save.settings.reduceMotion) return; G.shakeT = 0.3; G.shakeA = a || 6; };
  G.floater = (txt, x, y, col) => G.floaters.push({ txt, x, y, col: col || '#fff', t: 1 });
  G.addPoints = function (n, x, y) {
    G.run.score = Math.max(0, G.run.score + n);
    if (x != null) G.floater((n > 0 ? '+' : '') + n, x, y, n > 0 ? '#ffd23f' : '#ff6b9a');
  };
  G.burst = function (x, y, col, n = 16) {
    const k = EZ.save.settings.reduceMotion ? Math.ceil(n / 3) : n;
    const cols = col === 'confetti' ? ['#ffd23f', '#ff4f8b', '#4cc9f0', '#3ddc97', '#b98bff'] : [col];
    for (let i = 0; i < k; i++) {
      const a = Math.random() * Math.PI * 2, s = U.rand(80, 260);
      G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, t: U.rand(0.5, 1), c: U.pick(cols), r: U.rand(3, 6) });
    }
  };
  G.mechDone = function () {
    G.addPoints(SC.MECH, G.player.x, G.player.y - 80);
    const g = G.L.gates.find((x) => x.kind === 'mech');
    if (g) openGate(g);
    EZ.ui.banner('¡MECANISMO RESTAURADO!');
    G.toast('Chispa: «¡La puerta se ha abierto! Sigue hacia el este.»', 'good');
  };

  /* ================= Bucle ================= */
  function frame(now) {
    requestAnimationFrame(frame);
    if (!G.running || !G.L) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!G.paused && !G.ended) update(dt);
    else if (G.ended) updateFx(dt);
    G.t += dt;
    draw();
  }

  const tileAt = (x, y) => {
    const c = Math.floor(x / T), r = Math.floor(y / T), m = G.L.map;
    if (c < 0 || r < 0 || c >= m.w || r >= m.h) return { t: 1, i: -1 };
    const i = r * m.w + c;
    return { t: m.t[i], i };
  };
  const hazardActive = (i) => {
    if (!ART.THEMES[G.theme].toggle) return true;
    const h = G.L.hazards.find((x) => x.i === i);
    return ((G.t + (h ? h.phase : 0)) % 3) < 1.7;
  };
  let solidsCache = [];
  function buildSolids() {
    const L = G.L, s = [];
    L.gates.forEach((g) => { if (!g.open) s.push({ x: g.c * T, y: g.y - 1.5 * T, w: T, h: 3 * T }); });
    L.props.forEach((p) => s.push({ x: p.x - 18, y: p.y - 12, w: 36, h: 18 }));
    L.chests.forEach((c) => { if (!c.gone) s.push({ x: c.x - 22, y: c.y - 16, w: 44, h: 16 }); });
    L.npcs.forEach((n) => s.push({ x: n.x - 12, y: n.y - 12, w: 24, h: 14 }));
    L.signs.forEach((n) => s.push({ x: n.x - 8, y: n.y - 10, w: 16, h: 12 }));
    L.switches.forEach((n) => s.push({ x: n.x - 14, y: n.y - 12, w: 28, h: 12 }));
    L.barriers.forEach((b) => { if (!b.down) s.push({ x: b.c * T + 4, y: b.r * T + 4, w: T - 8, h: T - 8 }); });
    G.mech.solids().forEach((r) => s.push(r));
    solidsCache = s;
  }
  function blocked(x, y) {
    const hw = 11, top = y - 10, bot = y + 3;
    const pts = [[x - hw, top], [x + hw, top], [x - hw, bot], [x + hw, bot]];
    for (const [px, py] of pts) if (tileAt(px, py).t === 1) return true;
    for (const r of solidsCache) if (x + hw > r.x && x - hw < r.x + r.w && bot > r.y && top < r.y + r.h) return true;
    return false;
  }
  function tryMove(p, dx, dy) {
    if (!dx && !dy) return;
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 8);
    for (let k = 0; k < steps; k++) {
      const nx = p.x + dx / steps, ny = p.y + dy / steps;
      if (blocked(nx, ny)) return;
      p.x = nx; p.y = ny;
    }
  }
  const nearVoid = (x, y) => [[-20, 0], [20, 0], [0, -14], [0, 14]].some(([a, b]) => { const tt = tileAt(x + a, y + b).t; return tt === 2 || tt === 5 || tt === 3; });

  /* ================= Actualización ================= */
  function update(dt) {
    const p = G.player, L = G.L, run = G.run;
    run.time += dt;
    p.inv = Math.max(0, p.inv - dt);
    buildSolids();
    updateCrumbles(dt);
    if (p.fall > 0) {
      p.fall -= dt;
      if (p.fall <= 0) { p.x = p.safe.x; p.y = p.safe.y; p.z = 0; p.jumpT = -1; p.inv = 1.5; loseLife('fall'); }
      updateFx(dt); updateCamera(dt); updateHUD();
      return;
    }
    // Movimiento
    const ax = CT.axis();
    const moving = Math.abs(ax.x) > 0.05 || Math.abs(ax.y) > 0.05;
    if (moving) {
      p.runT += dt;
      if (Math.abs(ax.x) > Math.abs(ax.y)) p.dir = ax.x > 0 ? 'right' : 'left'; else p.dir = ax.y > 0 ? 'down' : 'up';
    } else p.runT = 0;
    const running = p.runT > 0.7;
    const sp = (running ? 250 : 180) * (p.carry ? 0.9 : 1);
    p.moving = moving;
    p.walk += dt * (moving ? (running ? 1.4 : 1) : 0.4);
    tryMove(p, ax.x * sp * dt, 0);
    tryMove(p, 0, ax.y * sp * dt);
    if (moving && running && Math.random() < 0.3 && p.z === 0 && !EZ.save.settings.reduceMotion) G.particles.push({ x: p.x - ax.x * 12, y: p.y, vx: -ax.x * 30, vy: -20, t: 0.4, c: 'rgba(255,255,255,0.6)', r: 3 });
    // Salto
    if (CT.consumeJump() && p.jumpT < 0) { p.jumpT = 0; EZ.audio.play('jump'); }
    if (p.jumpT >= 0) {
      p.jumpT += dt;
      const D = 0.55;
      if (p.jumpT >= D) { p.jumpT = -1; p.z = 0; onLand(); }
      else p.z = Math.sin((Math.PI * p.jumpT) / D) * 30;
    }
    // Suelo bajo los pies
    if (p.z < 4) {
      const ti = tileAt(p.x, p.y);
      const cr = L.crumbles[ti.i];
      if (ti.t === 2 || (ti.t === 5 && cr && cr.state === 'gone')) startFall();
      else {
        if (ti.t === 5 && cr && cr.state === 'solid') { cr.state = 'shake'; cr.k = 0.55; EZ.audio.play('crumble'); }
        if (ti.t === 3 && hazardActive(ti.i)) hurt('hazard');
        if (ti.t === 0 && !nearVoid(p.x, p.y)) { p.safe.x = p.x; p.safe.y = p.y; }
      }
    }
    // Objetos
    L.coins.forEach((c) => {
      if (!c.got && U.dist(c.x, c.y, p.x, p.y) < 28) { c.got = true; run.coins++; run.score += SC.COIN; EZ.audio.play('coin'); G.burst(c.x, c.y - 16, '#ffd23f', 5); }
    });
    L.pickups.forEach((k) => {
      if (k.got || U.dist(k.x, k.y, p.x, p.y) > 28) return;
      k.got = true; EZ.audio.play('pickup');
      if (k.kind === 'heart') { if (run.lives < run.maxLives) { run.lives++; G.floater('+1 vida', k.x, k.y - 40, '#ff6b9a'); } else G.addPoints(50, k.x, k.y - 40); }
      if (k.kind === 'bulb') { EZ.save.wallet.hints++; G.floater('+1 pista', k.x, k.y - 40, '#fff27a'); }
    });
    L.questItems.forEach((q) => {
      if (q.got || U.dist(q.x, q.y, p.x, p.y) > 28) return;
      q.got = true; G.quest.got++; run.items++; EZ.audio.play('pickup');
      const info = EZ.story.quest[G.questKind];
      G.floater(`${G.quest.got}/3 ${info.item}`, q.x, q.y - 40, '#7df9ff');
      if (G.quest.got >= 3) completeQuest();
    });
    updateEnemies(dt);
    G.mech.update(dt);
    updateBoss(dt);
    updateRooms();
    updateEvents(dt);
    // Puertas que se abren
    L.gates.forEach((g) => { if (g.opening) { g.anim = Math.min(1, (g.anim || 0) + dt * 1.6); if (g.anim >= 1) { g.opening = false; g.open = true; } } });
    // Interacción
    G.nearest = findNearest();
    if (CT.consumeAction() && G.nearest) G.nearest.act();
    updateFx(dt);
    updateCamera(dt);
    updateHUD();
  }

  function updateCrumbles(dt) {
    const L = G.L, p = G.player;
    for (const i in L.crumbles) {
      const c = L.crumbles[i];
      if (c.state === 'shake') { c.k -= dt; if (c.k <= 0) { c.state = 'gone'; c.k = 2.6; } }
      else if (c.state === 'gone') {
        c.k -= dt;
        if (c.k <= 0) { const on = tileAt(p.x, p.y).i === +i; if (!on) c.state = 'solid'; }
      }
    }
  }
  function startFall() {
    const p = G.player;
    if (p.fall > 0) return;
    p.fall = 0.6; EZ.audio.play('fall'); p.carry && dropCarry();
  }
  function dropCarry() { const it = G.player.carry; if (it) { it.state = 'ground'; it.x = it.hx; it.y = it.hy; G.player.carry = null; } }

  function onLand() {
    const p = G.player;
    G.L.enemies.forEach((e) => {
      if (e.alive && U.dist(e.x, e.y, p.x, p.y) < 32) {
        e.alive = false; e.pop = 0.45; G.run.stomps++; EZ.audio.play('stomp');
        G.addPoints(SC.STOMP, e.x, e.y - 40); G.burst(e.x, e.y - 14, 'confetti', 18); G.shake(3);
      }
    });
    if (!EZ.save.settings.reduceMotion) for (let i = 0; i < 5; i++) G.particles.push({ x: p.x + U.rand(-12, 12), y: p.y, vx: U.rand(-40, 40), vy: -30, t: 0.3, c: 'rgba(255,255,255,0.5)', r: 3 });
    G.mech.onLand(p.x, p.y);
  }

  function updateEnemies(dt) {
    const p = G.player, L = G.L;
    L.enemies.forEach((e) => {
      if (!e.alive) { e.pop -= dt; return; }
      e.t += dt;
      const room = L.rooms[e.room];
      const minX = (room.x0 + 1.5) * T, maxX = (room.x0 + room.w - 1.5) * T, minY = (room.y0 + 1.5) * T, maxY = (room.y0 + room.h - 1.2) * T;
      const bad = (x, y) => { const tt = tileAt(x, y).t; return tt === 1 || tt === 2 || tt === 4 || tt === 5; };
      const near = U.dist(e.x, e.y, p.x, p.y);
      if (e.kind === 'chaser' && near < 240 && G.roomIdx === e.room) {
        const a = Math.atan2(p.y - e.y, p.x - e.x);
        const nx = e.x + Math.cos(a) * e.speed * dt, ny = e.y + Math.sin(a) * e.speed * dt;
        if (!bad(nx, ny)) { e.x = U.clamp(nx, minX, maxX); e.y = U.clamp(ny, minY, maxY); }
      } else if (e.horiz) {
        const nx = e.x + e.dir * e.speed * dt;
        if (Math.abs(nx - e.ox) > e.span / 2 || bad(nx + e.dir * 16, e.y) || nx < minX || nx > maxX) e.dir *= -1; else e.x = nx;
      } else {
        const ny = e.y + e.dir * e.speed * dt;
        if (Math.abs(ny - e.oy) > e.span / 2 || bad(e.x, ny + e.dir * 16) || ny < minY || ny > maxY) e.dir *= -1; else e.y = ny;
      }
      if (near < 26 && p.z < 12) hurt('enemy', e);
    });
  }

  /* ================= Daño y vidas ================= */
  function hurt(src, from) {
    const p = G.player;
    if (p.inv > 0 || G.ended || p.fall > 0) return;
    p.inv = 1.6;
    if (from) { const a = Math.atan2(p.y - from.y, p.x - from.x); tryMove(p, Math.cos(a) * 30, Math.sin(a) * 30); }
    EZ.audio.play('hit'); G.shake(10);
    if (Math.random() < 0.4) G.toast('Chispa: «' + U.pick(EZ.phrases.chispaHurt) + '»', 'bad', 1800);
    loseLife(src);
  }
  function loseLife() {
    const run = G.run;
    if (G.ended) return;
    run.lives--;
    G.floater('-1', G.player.x, G.player.y - 70, '#ff4f6d');
    if (G.boss && !G.boss.freed) run.bossNoDamage = false;
    updateHUD(true);
    if (run.lives <= 0) lose();
  }

  /* ================= Retos ================= */
  G.ask = async function (area, o = {}) {
    const run = G.run;
    G.paused = true; CT.reset();
    EZ.audio.music('challenge');
    const q = EZ.questions.pick(area, G.level, G.qs);
    const res = await EZ.challenge.ask(q, {
      title: o.title, icon: o.icon, theme: area, canRetreat: o.canRetreat,
      hintCost: () => ({ label: EZ.save.wallet.hints > 0 ? `usar 1 de ${EZ.save.wallet.hints}` : '25 monedas' }),
      spendHint: () => {
        if (EZ.save.wallet.hints > 0) { EZ.save.wallet.hints--; return true; }
        if (run.coins >= 25) { run.coins -= 25; return true; }
        return false;
      },
      onResult: (correct, qq, secs, usedHint, answer) => {
        EZ.questions.adapt(G.qs, correct);
        EZ.progression.recordAnswer(area, qq.bloque, correct);
        if (correct) {
          run.streak++; run.bestStreak = Math.max(run.bestStreak, run.streak); run.ok++;
          const pts = SC.answer(qq, secs, run.streak, usedHint) * (o.mult || 1);
          run.score += pts;
          const lines = [`<b class="pts">+${U.fmtNum(pts)} puntos</b>${SC.multiplier(run.streak) > 1 ? ` · racha ×${SC.multiplier(run.streak)}` : ''}`];
          const msg = EZ.phrases.streak[run.streak];
          if (msg) { lines.push(`<span class="streak-msg">${msg}</span>`); G._streakMsg = msg; }
          run.liveAch.push(...EZ.progression.liveCheck(run));
          return { title: U.pick(EZ.phrases.correct), lines };
        }
        run.streak = 0; run.ko++;
        run.wrong.push({ q: qq, answer });
        return { title: U.pick(EZ.phrases.wrong), lines: [o.penalty ? `${EZ.icons.heart} Pierdes 1 vida.` : 'Reto opcional: no pierdes vidas.', U.pick(EZ.phrases.chispaWrong)] };
      }
    });
    EZ.audio.music(G.boss && !G.boss.freed ? 'boss' : 'explore', G.theme);
    if (G._streakMsg) { EZ.ui.banner(G._streakMsg); EZ.audio.play('streak'); G._streakMsg = null; }
    while (run.liveAch.length > (G._achShown || 0)) { const a = run.liveAch[G._achShown || 0]; G._achShown = (G._achShown || 0) + 1; EZ.ui.achievementToast(a); }
    G.paused = false; CT.reset(); last = performance.now();
    if (!res.correct && !res.retreat && o.penalty) loseLife('wrong');
    return res;
  };

  async function gateChallenge(g) {
    const title = g.need > 1 ? `Puerta doble · reto ${g.progress + 1} de ${g.need}` : 'Puerta sellada por el Borrón';
    const res = await G.ask(g.area, { title, penalty: true, icon: EZ.icons.lock });
    if (G.ended) return;
    if (res.correct) {
      g.progress++;
      if (g.progress >= g.need) openGate(g); else G.toast('¡Bien! Esta puerta tiene un segundo cerrojo.', 'good');
    }
  }
  function openGate(g) {
    if (g.open || g.opening) return;
    g.opening = true; g.anim = 0; EZ.audio.play('door'); G.shake(4);
    G.burst(g.x, g.y, '#ffd23f', 20);
  }
  async function openChest(c) {
    if (c.gold) {
      c.open = true; EZ.audio.play('chest'); G.burst(c.x, c.y - 30, 'confetti', 30);
      if (c.secret) {
        const list = EZ.story.relics[G.questKind] || EZ.story.relics.mix;
        const name = list[G.level - 1];
        if (!EZ.save.collectibles.includes(name) && !G.run.relics.includes(name)) { G.run.relics.push(name); EZ.ui.banner('RELIQUIA: ' + name.toUpperCase()); }
        else G.addPoints(200, c.x, c.y - 70);
        G.run.coins += 30; G.floater('+30 monedas', c.x, c.y - 50, '#ffd23f');
      } else if (c.timed) {
        // cofre dorado contrarreloj: necesita un reto
        c.open = false;
        const res = await G.ask(U.pick(ids()), { title: 'Cofre dorado contrarreloj', canRetreat: true, icon: EZ.icons.star });
        if (res.correct) { c.open = true; G.addPoints(400, c.x, c.y - 70); G.run.coins += 30; EZ.audio.play('chest'); G.burst(c.x, c.y - 30, 'confetti', 30); G.activeEvent = null; }
      }
      return;
    }
    const res = await G.ask(c.area || G.cfg.area || U.pick(ids()), { title: 'Cofre misterioso (opcional)', canRetreat: true, icon: EZ.icons.coin });
    if (res.retreat) return;
    if (res.correct) {
      c.open = true; G.run.chests++; EZ.audio.play('chest'); G.burst(c.x, c.y - 30, '#ffd23f', 24);
      G.addPoints(SC.CHEST, c.x, c.y - 70); G.run.coins += 25; G.floater('+25 monedas', c.x, c.y - 50, '#ffd23f');
      if (Math.random() < 0.4) { EZ.save.wallet.hints++; G.toast('¡El cofre tenía una pista extra!', 'good'); }
    } else { c.locked = true; G.toast('El cofre se ha cerrado con un candado burlón. ¡Otra vez será!', 'bad'); }
  }
  function completeQuest() {
    if (G.run.quest) return;
    G.run.quest = true; G.quest.state = 'done';
    const info = EZ.story.quest[G.questKind];
    G.addPoints(SC.QUEST, G.player.x, G.player.y - 90);
    EZ.save.wallet.hints++; G.run.coins += 40;
    EZ.ui.banner('¡MISIÓN SECUNDARIA COMPLETADA!');
    G.toast(`${info.name}: «¡Gracias! Toma una pista y 40 monedas.»`, 'good');
    EZ.audio.play('achievement');
  }

  /* ================= Interacción ================= */
  function findNearest() {
    const p = G.player, L = G.L, list = [];
    L.gates.forEach((g) => { if (!g.open && !g.opening && g.kind === 'q') list.push({ x: g.x, y: g.y, r: 82, label: 'Resolver reto', act: () => gateChallenge(g) }); });
    L.gates.forEach((g) => { if (!g.open && !g.opening && g.kind === 'mech') list.push({ x: g.x, y: g.y, r: 82, label: 'Mecanismo bloqueado', act: () => G.toast(G.mech.intro, null, 6000) }); });
    L.chests.forEach((c) => { if (!c.open && !c.locked && !c.gone) list.push({ x: c.x, y: c.y, r: 62, label: c.gold ? 'Abrir cofre dorado' : 'Abrir cofre', act: () => openChest(c) }); });
    L.npcs.forEach((n) => list.push({ x: n.x, y: n.y, r: 62, label: 'Hablar', act: () => talkNPC(n) }));
    L.signs.forEach((s) => list.push({ x: s.x, y: s.y, r: 60, label: 'Leer', act: () => G.toast(s.text, null, 6000) }));
    L.switches.forEach((s) => list.push({ x: s.x, y: s.y, r: 58, label: s.on ? 'Subir barreras' : 'Bajar barreras', act: () => toggleSwitch(s) }));
    G.mech.interactables().forEach((m) => list.push(Object.assign({ r: 60 }, m)));
    let best = null, bd = 1e9;
    list.forEach((it) => { const d = U.dist(it.x, it.y, p.x, p.y); if (d < it.r && d < bd) { bd = d; best = it; } });
    return best;
  }
  async function talkNPC(n) {
    const info = EZ.story.quest[G.questKind];
    G.paused = true;
    if (G.quest.state === 'new') {
      await EZ.ui.dialog([{ who: 'npc', name: info.name, look: n, text: info.text }, { who: 'chispa', text: `Misión secundaria aceptada: encuentra ${3} ${info.item} repartidos por las salas.` }]);
      G.quest.state = 'active';
    } else if (G.quest.state === 'active') await EZ.ui.dialog([{ who: 'npc', name: info.name, look: n, text: `¡Te faltan ${3 - G.quest.got}! Mira bien en cada sala.` }]);
    else await EZ.ui.dialog([{ who: 'npc', name: info.name, look: n, text: '¡Eres increíble! Te debo una.' }]);
    G.paused = false; CT.reset(); last = performance.now();
  }
  function toggleSwitch(s) {
    s.on = !s.on; EZ.audio.play('switch');
    G.L.barriers.forEach((b) => (b.down = s.on));
    if (s.on) G.toast('¡Barreras abajo! Algo brilla en la esquina…', 'good');
  }

  /* ================= Salas, secretos y jefe ================= */
  function updateRooms() {
    const p = G.player, L = G.L;
    const idx = L.rooms.findIndex((r) => p.x >= r.x0 * T && p.x < (r.x0 + r.w) * T);
    if (idx >= 0) G.roomIdx = idx;
    const room = L.rooms[G.roomIdx];
    if (room.role === 'mech' && !G.flags.mechIntro && p.x > (room.x0 + 1.5) * T) {
      G.flags.mechIntro = true;
      G.paused = true;
      EZ.ui.dialog([{ who: 'chispa', text: `${G.mech.title.toUpperCase()}: ${G.mech.intro}` }]).then(() => { G.paused = false; CT.reset(); last = performance.now(); });
    }
    if (room.role === 'mech' && !L.secret.found && !G.flags.secretHint && Math.abs(p.x - L.secret.px) < 80 && p.y < (room.y0 + 3) * T) {
      G.flags.secretHint = true; G.toast('Chispa: «Esa pared tiene una grieta sospechosa… ¿y si caminas hacia ella?»', null, 4000);
    }
    if (!L.secret.found && p.y < (EZ.levelGen.RH - 1) * T) {
      L.secret.found = true; G.run.secret = true;
      G.addPoints(SC.SECRET, p.x, p.y - 80); EZ.audio.play('achievement'); EZ.ui.banner('¡ZONA SECRETA!');
    }
    if (room.role === 'boss' && !G.boss && p.x > (room.x0 + 2.5) * T) startBoss(room);
  }

  async function startBoss(room) {
    const L = G.L, p = G.player, lv = G.level;
    const g = L.gates[L.gates.length - 1];
    g.open = false; g.opening = false; g.anim = 0; g.kind = 'boss';
    if (p.x < (g.c + 1) * T + 16) p.x = (g.c + 1) * T + 16;
    const final = G.bossArea === 'final';
    const hp = final ? 8 : [0, 4, 5, 6][lv];
    G.boss = { area: G.bossArea, x: room.cx, y: (room.y0 + 3) * T, baseY: (room.y0 + 3) * T, hp, max: hp, t: 0, fire: 2.5, orbT: 0.8, flash: 0, dash: null, dashT: 4, freed: false, room, cycle: 0, livesAtStart: G.run.lives, scale: G.bossArea === 'mix' ? 0.8 : 1 };
    G.run.bossNoDamage = true;
    G.paused = true;
    EZ.audio.music('boss');
    const info = EZ.story.boss[G.bossArea];
    await EZ.ui.dialog([
      { who: 'boss', area: G.bossArea, name: info.name, text: info.taunt },
      { who: 'chispa', text: 'Coge los ORBES DEL SABER y responde bien para lanzárselos. ¡Esquiva sus ataques y salta lo que vuele bajo!' }
    ]);
    G.paused = false; CT.reset(); last = performance.now();
    U.$('#boss-bar').hidden = false;
  }

  const PATTERN = { mat: 'radial', len: 'rain', med: 'rocks', ing: 'aimed', ef: 'charge', mix: 'mixed', final: 'mixed' };
  function updateBoss(dt) {
    const b = G.boss, p = G.player;
    if (!b) return;
    b.t += dt; b.flash = Math.max(0, b.flash - dt);
    const room = b.room;
    if (b.freed) return;
    // movimiento
    if (b.dash) {
      b.dash.t -= dt; b.x += b.dash.vx * dt; b.y += b.dash.vy * dt;
      b.x = U.clamp(b.x, (room.x0 + 2) * T, (room.x0 + room.w - 2) * T); b.y = U.clamp(b.y, (room.y0 + 2.5) * T, (room.y0 + room.h - 1.5) * T);
      if (b.dash.t <= 0) b.dash = null;
    } else {
      const tx = room.cx + Math.sin(b.t * 0.6) * (room.w * T / 2 - 3.5 * T), ty = b.baseY + Math.sin(b.t * 1.1) * 18;
      b.x += (tx - b.x) * Math.min(1, dt * 2); b.y += (ty - b.y) * Math.min(1, dt * 2);
    }
    // ataques
    const rate = [0, 0.8, 1, 1.2][G.level] * (b.hp <= b.max / 2 ? 1.3 : 1);
    b.fire -= dt * rate;
    if (b.fire <= 0) {
      let pat = PATTERN[b.area];
      if (pat === 'mixed') { pat = ['radial', 'aimed', 'rain', 'charge'][b.cycle % 4]; b.cycle++; }
      attack(b, pat);
      b.fire = pat === 'charge' ? 3.2 : pat === 'aimed' ? 1.7 : 2.6;
    }
    // contacto
    if (U.dist(b.x, b.y - 30, p.x, p.y) < 56 * b.scale && p.z < 30) hurt('boss', b);
    // orbes
    if (!G.orbs.length) {
      b.orbT -= dt;
      if (b.orbT <= 0) {
        for (let k = 0; k < 30; k++) {
          const c = U.randInt(room.x0 + 2, room.x0 + room.w - 3), r = U.randInt(room.y0 + 4, room.y0 + room.h - 2);
          const x = (c + 0.5) * T, y = (r + 0.5) * T + 10;
          if (tileAt(x, y).t !== 0 || G.L.props.some((pp) => U.dist(pp.x, pp.y, x, y) < 50) || U.dist(x, y, p.x, p.y) < 90) continue;
          G.orbs.push({ x, y }); break;
        }
        b.orbT = 1.6;
      }
    }
    G.orbs = G.orbs.filter((o) => {
      if (U.dist(o.x, o.y, p.x, p.y) < 30) { askOrb(); return false; }
      return true;
    });
  }
  function attack(b, pat) {
    const p = G.player, th = ART.THEMES[G.theme];
    const glyph = () => U.pick(th.glyphs);
    EZ.audio.play('shoot');
    if (pat === 'radial') {
      const n = G.level === 3 ? 12 : 9, off = b.t;
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + off; G.projectiles.push({ x: b.x, y: b.y - 50, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, g: glyph(), t: 5 }); }
    } else if (pat === 'aimed') {
      const n = G.level;
      for (let i = 0; i < n; i++) { const a = Math.atan2(p.y - 20 - (b.y - 50), p.x - b.x) + (i - (n - 1) / 2) * 0.25; G.projectiles.push({ x: b.x, y: b.y - 50, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, g: G.theme === 'ing' ? '✈' : glyph(), t: 4 }); }
    } else if (pat === 'rain' || pat === 'rocks') {
      const n = 2 + G.level;
      for (let i = 0; i < n; i++) {
        const x = i === 0 ? p.x : p.x + U.rand(-150, 150), y = i === 0 ? p.y : p.y + U.rand(-110, 110);
        G.warnings.push({ x, y, t: 1.05, r: pat === 'rocks' ? 38 : 30, g: pat === 'rocks' ? '●' : glyph(), kind: pat });
      }
    } else if (pat === 'charge') {
      const a = Math.atan2(p.y - b.y, p.x - b.x);
      G.warnings.push({ x: b.x, y: b.y, t: 0.5, r: 0, kind: 'charge-tell' });
      setTimeout(() => { if (G.boss && !G.boss.freed) b.dash = { vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, t: 0.8 }; }, 450);
    }
  }
  async function askOrb() {
    const b = G.boss;
    const area = G.bossArea === 'final' || G.bossArea === 'mix' ? U.pick(ids()) : G.bossArea;
    G.projectiles = []; G.warnings = [];
    const res = await G.ask(area, { title: 'Orbe del saber · ' + (EZ.story.boss[G.bossArea] || {}).name, penalty: true, icon: EZ.icons.bolt });
    if (G.ended || !b || b.freed) return;
    if (res.correct) G.bolts.push({ x: G.player.x, y: G.player.y - 40 });
    b.fire = Math.max(b.fire, 1.2);
  }
  function bossHit() {
    const b = G.boss;
    b.hp--; b.flash = 0.3; EZ.audio.play('bossHit'); G.shake(12); G.burst(b.x, b.y - 70, '#7df9ff', 26);
    if (b.hp <= 0) bossDefeated();
  }
  async function bossDefeated() {
    const b = G.boss;
    b.freed = true; G.projectiles = []; G.warnings = []; G.orbs = [];
    U.$('#boss-bar').hidden = true;
    G.addPoints(SC.BOSS, b.x, b.y - 120);
    if (G.run.lives < b.livesAtStart) G.run.bossNoDamage = false;
    EZ.audio.play('boom'); G.burst(b.x, b.y - 60, 'confetti', 80); G.shake(16);
    await U.wait(1200);
    if (G.ended) return;
    G.paused = true;
    const info = EZ.story.boss[G.bossArea];
    const lines = [{ who: 'boss', area: G.bossArea, freed: true, name: info.name, text: info.freed }];
    if (G.cfg.mode === 'final') lines.push(...EZ.story.ending);
    await EZ.ui.dialog(lines);
    win();
  }

  /* ================= Eventos sorpresa ================= */
  function updateEvents(dt) {
    const ev = G.activeEvent, p = G.player;
    if (ev) {
      ev.t -= dt;
      if (ev.type === 'storm') {
        ev.spawn -= dt;
        if (ev.spawn <= 0 && ev.t > 1) { ev.spawn = 0.7; G.warnings.push({ x: p.x + U.rand(-60, 60), y: p.y + U.rand(-50, 50), t: 1.0, r: 28, kind: 'ink' }); }
        if (ev.t <= 0) { G.activeEvent = null; G.addPoints(150, p.x, p.y - 80); G.toast('¡Tormenta superada! +150', 'good'); }
      } else if (ev.type === 'goldChest') {
        if (ev.chest.open) G.activeEvent = null;
        else if (ev.t <= 0) { ev.chest.gone = true; ev.chest.open = true; G.burst(ev.chest.x, ev.chest.y, '#ffd23f', 16); G.toast('¡El cofre dorado se ha esfumado!', 'bad'); G.activeEvent = null; }
      } else G.activeEvent = null;
      return;
    }
    const next = G.events[0];
    if (!next || G.boss || G.run.time < next.at || G.L.rooms[G.roomIdx].role === 'boss') return;
    G.events.shift();
    startEvent(next.type);
  }
  function freeSpotNear(cx, cy, minD, maxD) {
    const room = G.L.rooms[G.roomIdx];
    for (let k = 0; k < 60; k++) {
      const a = Math.random() * Math.PI * 2, d = U.rand(minD, maxD);
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      if (x < (room.x0 + 1.5) * T || x > (room.x0 + room.w - 1.5) * T || y < (room.y0 + 1.6) * T || y > (room.y0 + room.h - 1.3) * T) continue;
      if (tileAt(x, y).t !== 0 || blocked(x, y)) continue;
      return { x, y };
    }
    return null;
  }
  function startEvent(type) {
    const p = G.player;
    if (type === 'storm') { G.activeEvent = { type, t: 12, spawn: 1 }; EZ.ui.banner('¡TORMENTA DE TINTA!'); G.toast('¡Esquiva las gotas de tinta durante 12 segundos!', 'bad'); }
    else if (type === 'goldChest') {
      const s = freeSpotNear(p.x, p.y, 140, 280);
      if (!s) return;
      const chest = { x: s.x, y: s.y, gold: true, timed: true, open: false };
      G.L.chests.push(chest);
      G.activeEvent = { type, t: 20, chest };
      EZ.ui.banner('¡COFRE DORADO CONTRARRELOJ!'); G.toast('Tienes 20 segundos para llegar y abrirlo.', 'good');
    } else if (type === 'flash') {
      EZ.ui.banner('¡PREGUNTA RELÁMPAGO!');
      setTimeout(() => { if (!G.ended && !G.paused) G.ask(U.pick(ids()), { title: 'Pregunta relámpago · puntos ×2', mult: 2, canRetreat: true, icon: EZ.icons.bolt }); }, 900);
    } else if (type === 'coinRain') {
      EZ.ui.banner('¡LLUVIA DE MONEDAS!');
      for (let i = 0; i < 14; i++) { const s = freeSpotNear(p.x, p.y, 40, 220); if (s) G.L.coins.push({ x: s.x, y: s.y, drop: 1 }); }
    }
  }

  /* ================= Efectos ================= */
  function updateFx(dt) {
    const p = G.player;
    G.particles.forEach((q) => { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 500 * dt; });
    G.particles = G.particles.filter((q) => q.t > 0);
    G.floaters.forEach((f) => { f.t -= dt; f.y -= 40 * dt; });
    G.floaters = G.floaters.filter((f) => f.t > 0);
    G.L.coins.forEach((c) => { if (c.drop > 0) c.drop = Math.max(0, c.drop - dt * 2); });
    if (G.ended) return;
    G.projectiles.forEach((q) => {
      q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (tileAt(q.x, q.y).t === 1) q.t = 0;
      if (q.t > 0 && U.dist(q.x, q.y, p.x, p.y - 20) < 20 && p.z < 14) { q.t = 0; hurt('shot', q); }
    });
    G.projectiles = G.projectiles.filter((q) => q.t > 0);
    G.warnings.forEach((w) => {
      w.t -= dt;
      if (w.t <= 0 && w.kind !== 'charge-tell') {
        G.burst(w.x, w.y, w.kind === 'rocks' ? '#ff8a1f' : '#5b48b5', 10);
        if (U.dist(w.x, w.y, p.x, p.y) < w.r + 6 && p.z < 20) hurt('drop', w);
      }
    });
    G.warnings = G.warnings.filter((w) => w.t > 0);
    G.bolts.forEach((bo) => {
      const b = G.boss;
      if (!b) { bo.done = true; return; }
      const a = Math.atan2(b.y - 70 - bo.y, b.x - bo.x);
      bo.x += Math.cos(a) * 620 * dt; bo.y += Math.sin(a) * 620 * dt;
      if (Math.random() < 0.8) G.particles.push({ x: bo.x, y: bo.y, vx: 0, vy: 0, t: 0.3, c: '#7df9ff', r: 4 });
      if (U.dist(bo.x, bo.y, b.x, b.y - 70) < 30) { bo.done = true; bossHit(); }
    });
    G.bolts = G.bolts.filter((b) => !b.done);
    if (G.shakeT > 0) G.shakeT -= dt;
    // Chispa sigue al jugador
    const c = G.chispa, tx = p.x + (p.dir === 'left' ? 34 : -34), ty = p.y - 64;
    c.x += (tx - c.x) * Math.min(1, dt * 4); c.y += (ty - c.y) * Math.min(1, dt * 4);
  }
  function updateCamera(dt) {
    const p = G.player, m = G.L.map;
    const vw = W / scale, vh = H / scale;
    let tx = p.x, ty = p.y - 20;
    tx = U.clamp(tx, vw / 2, Math.max(vw / 2, m.w * T - vw / 2));
    ty = U.clamp(ty, vh / 2, Math.max(vh / 2, m.h * T - vh / 2));
    G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 6);
    G.cam.y += (ty - G.cam.y) * Math.min(1, dt * 6);
  }

  /* ================= Fin de partida ================= */
  function win() {
    if (G.ended) return;
    const run = G.run;
    G.ended = true; run.won = true;
    run.score += run.lives * SC.LIFE_BONUS;
    EZ.audio.stopMusic(); EZ.audio.play('victory');
    finish();
  }
  function lose() {
    if (G.ended) return;
    G.ended = true; G.run.won = false;
    EZ.audio.stopMusic(); EZ.audio.play('defeat');
    setTimeout(finish, 1300);
  }
  function finish() {
    const run = G.run;
    run.score = Math.round(run.score);
    const summary = EZ.progression.finish(run);
    G.running = false; CT.active = false; CT.reset();
    U.$('#hud').hidden = true; U.$('#boss-bar').hidden = true;
    document.body.classList.remove('in-game');
    EZ.ui.showResults(run, summary);
  }

  /* ================= HUD ================= */
  function updateHUD(force) {
    const run = G.run, I = EZ.icons;
    let hearts = '';
    for (let i = 0; i < run.maxLives; i++) hearts += i < run.lives ? I.heart : I.heartEmpty;
    const mult = SC.multiplier(run.streak);
    const key = [run.lives, run.score, run.coins, EZ.save.wallet.hints, run.streak].join('|');
    if (force || key !== G._hud) {
      G._hud = key;
      U.$('#hud-lives').innerHTML = hearts;
      U.$('#hud-lives').setAttribute('aria-label', `Vidas: ${run.lives} de ${run.maxLives}`);
      U.$('#hud-score').textContent = U.fmtNum(run.score);
      U.$('#hud-coins').innerHTML = I.coin + '<span>' + run.coins + '</span>';
      U.$('#hud-hints').innerHTML = I.bulb + '<span>' + EZ.save.wallet.hints + '</span>';
      const st = U.$('#hud-streak');
      st.textContent = run.streak >= 3 ? `Racha ${run.streak} · ×${mult}` : run.streak > 0 ? `Racha ${run.streak}` : '';
      st.classList.toggle('hot', mult > 1);
    }
    // objetivo
    let obj;
    const room = G.L.rooms[G.roomIdx];
    if (G.boss && !G.boss.freed) obj = `${I.bolt} Derrota a <b>${EZ.story.boss[G.bossArea].name}</b>: coge los orbes <b>?</b> y acierta para lanzarlos`;
    else if (room.role === 'mech' && !G.mech.done) obj = G.mech.hud();
    else {
      const g = G.L.gates.find((x) => !x.open && x.room >= G.roomIdx);
      obj = g ? (g.kind === 'mech' ? `${I.bolt} Supera la prueba de la sala para abrir la puerta` : `${I.lock} Llega a la puerta y pulsa <b>ENTER</b> para resolver su reto`) : `${I.star} ¡Adelante, hacia el guardián!`;
    }
    if (G.quest.state === 'active') obj += ` <span class="obj-q">· Misión: ${G.quest.got}/3 ${EZ.story.quest[G.questKind].item}</span>`;
    if (G.activeEvent && G.activeEvent.type !== 'flash') obj += ` <span class="obj-ev">· ${G.activeEvent.type === 'storm' ? 'Tormenta' : 'Cofre dorado'}: ${Math.ceil(G.activeEvent.t)} s</span>`;
    if (obj !== G._obj) { G._obj = obj; U.$('#hud-obj').innerHTML = obj; }
    // progreso de salas
    const dots = G.L.rooms.map((r, i) => `<i class="${i < G.roomIdx ? 'done' : i === G.roomIdx ? 'here' : ''}${r.role === 'boss' ? ' boss' : ''}"></i>`).join('');
    if (dots !== G._dots) { G._dots = dots; U.$('#hud-rooms').innerHTML = dots; }
    if (G.boss && !G.boss.freed) {
      const pct = (G.boss.hp / G.boss.max) * 100;
      U.$('#boss-fill').style.width = pct + '%';
      U.$('#boss-name').textContent = EZ.story.boss[G.bossArea].name + ' · ' + G.boss.hp + '/' + G.boss.max;
    }
  }

  /* ================= Dibujo ================= */
  function draw() {
    const L = G.L, th = ART.THEMES[G.theme], p = G.player, t = G.t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = th.void; ctx.fillRect(0, 0, W, H);
    let sx = 0, sy = 0;
    if (G.shakeT > 0) { sx = U.rand(-G.shakeA, G.shakeA); sy = U.rand(-G.shakeA, G.shakeA); }
    ctx.save();
    ctx.translate(Math.round(W / 2), Math.round(H / 2));
    ctx.scale(scale, scale);
    ctx.translate(Math.round(-G.cam.x + sx), Math.round(-G.cam.y + sy));
    const vw = W / scale, vh = H / scale;
    const x0 = Math.max(0, Math.floor((G.cam.x - vw / 2) / T) - 1), x1 = Math.min(L.map.w, Math.ceil((G.cam.x + vw / 2) / T) + 1);
    const y0 = Math.max(0, Math.floor((G.cam.y - vh / 2) / T) - 1), y1 = Math.min(L.map.h, Math.ceil((G.cam.y + vh / 2) / T) + 1);
    const px0 = x0 * T, py0 = y0 * T, pw = (x1 - x0) * T, ph = (y1 - y0) * T;
    ctx.drawImage(G.mapCanvas, px0, py0, pw, ph, px0, py0, pw, ph);
    // baldosas dinámicas
    for (let r = y0; r < y1; r++) for (let c = x0; c < x1; c++) {
      const i = r * L.map.w + c, tt = L.map.t[i];
      if (tt === 2) ART.drawVoid(ctx, th, c * T, r * T, t);
      else if (tt === 3) ART.drawHazard(ctx, th, G.theme, c * T, r * T, t, hazardActive(i));
      else if (tt === 5) { ART.drawVoid(ctx, th, c * T, r * T, t); const cr = L.crumbles[i]; ART.drawCrumble(ctx, th, c * T, r * T, cr.state, cr.k); }
    }
    // niebla de la zona secreta
    if (!L.secret.found) { ctx.fillStyle = 'rgba(5,3,20,0.92)'; ctx.fillRect(L.secret.x0 * T, 0, L.secret.w * T, (EZ.levelGen.RH - 1) * T); }
    G.mech.drawFloor(ctx, t);
    // avisos de impacto
    G.warnings.forEach((w) => {
      if (w.kind === 'charge-tell') { ART.text(ctx, '!', G.boss ? G.boss.x : w.x, (G.boss ? G.boss.y : w.y) - 170, 34, '#ff4f6d'); return; }
      const k = 1 - w.t / 1.05;
      ctx.strokeStyle = '#ff4f6d'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.5, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,79,109,0.25)'; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * k, w.r * 0.5 * k, 0, 0, 7); ctx.fill();
      const fy = w.y - (1 - k) * 260;
      if (w.kind === 'ink') ART.blob(ctx, w.x, fy, 9, '#2e1f66', '#1b1446', 2); else ART.text(ctx, w.g, w.x, fy, w.kind === 'rocks' ? 28 : 22, w.kind === 'rocks' ? '#5b4a45' : '#fff');
    });
    L.gates.forEach((g) => ART.drawGate(ctx, g, G.theme, t));
    // entidades ordenadas por profundidad
    const ents = [];
    L.props.forEach((q) => ents.push([q.y, () => ART.drawProp(ctx, q.kind, q.x, q.y, t)]));
    L.chests.forEach((c) => { if (!c.gone) ents.push([c.y, () => { ART.drawChest(ctx, c.x, c.y, c.open, c.gold, t); if (c.locked) ART.text(ctx, 'X', c.x, c.y - 52, 18, '#ff6b9a'); }]); });
    L.npcs.forEach((n) => ents.push([n.y, () => ART.drawNPC(ctx, n.x, n.y, t, n.look, n.hat, G.quest.state === 'new' ? '!' : G.quest.state === 'active' ? '…' : '✓')]));
    L.signs.forEach((s) => ents.push([s.y, () => ART.drawSign(ctx, s.x, s.y)]));
    L.switches.forEach((s) => ents.push([s.y, () => ART.drawSwitch(ctx, s.x, s.y, s.on)]));
    L.barriers.forEach((b) => ents.push([b.y, () => ART.drawBarrier(ctx, b.x, b.y, b.down, th)]));
    L.coins.forEach((c) => { if (!c.got) ents.push([c.y, () => ART.drawCoin(ctx, c.x, c.y - (c.drop || 0) * 200, t + c.x * 0.01)]); });
    L.pickups.forEach((k) => { if (!k.got) ents.push([k.y, () => ART.drawPickup(ctx, k.kind, k.x, k.y, t)]); });
    L.questItems.forEach((q) => { if (!q.got) ents.push([q.y, () => ART.drawPickup(ctx, G.questKind, q.x, q.y, t)]); });
    G.orbs.forEach((o) => ents.push([o.y, () => ART.drawPickup(ctx, 'orb', o.x, o.y, t)]));
    L.enemies.forEach((e) => {
      if (e.alive) ents.push([e.y, () => ART.drawBlob(ctx, e.x, e.y, e.t, e.kind)]);
      else if (e.pop > 0) ents.push([e.y, () => { ctx.globalAlpha = e.pop / 0.45; ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1.5 - e.pop, e.pop * 2); ART.drawBlob(ctx, 0, 0, e.t, e.kind, true); ctx.restore(); ctx.globalAlpha = 1; }]);
    });
    if (G.boss) { const b = G.boss; ents.push([b.y, () => ART.drawBoss(ctx, b.area === 'mix' ? 'final' : b.area, b.x, b.y, b.t, { freed: b.freed, flash: b.flash > 0, scale: b.scale })]); }
    if (p.fall > 0) ents.push([p.y, () => { ctx.save(); ctx.translate(p.x, p.y); const s = p.fall / 0.6; ctx.scale(s, s); ctx.translate(-p.x, -p.y); ART.drawPlayer(ctx, p.x, p.y, 0, p.dir, p.walk, EZ.save.profile.avatar, { sad: true }); ctx.restore(); }]);
    else ents.push([p.y, () => ART.drawPlayer(ctx, p.x, p.y, p.z, p.dir, p.walk, EZ.save.profile.avatar, { moving: p.moving, flash: p.inv > 0 && Math.floor(t * 12) % 2 === 0, sad: G.ended && !G.run.won, blink: (t % 4) < 0.12 })]);
    ents.push([G.chispa.y + 70, () => ART.drawChispa(ctx, G.chispa.x, G.chispa.y, t)]);
    ents.sort((a, b) => a[0] - b[0]).forEach((e) => e[1]());
    // proyectiles
    G.projectiles.forEach((q) => {
      ART.shadow(ctx, q.x, q.y + 24, 8, 3, 0.2);
      ART.blob(ctx, q.x, q.y, 13, G.theme === 'med' ? '#ff8a1f' : '#2e1f66', '#1b1446', 2.5);
      ART.text(ctx, q.g, q.x, q.y + 1, 13, '#fff', 'center', null);
    });
    G.bolts.forEach((b) => ART.blob(ctx, b.x, b.y, 10, '#7df9ff', '#fff', 2));
    G.mech.drawOver(ctx, t);
    // partículas y textos
    G.particles.forEach((q) => { ctx.globalAlpha = Math.min(1, q.t * 2); ctx.fillStyle = q.c; ctx.fillRect(q.x - q.r / 2, q.y - q.r / 2, q.r, q.r); });
    ctx.globalAlpha = 1;
    G.floaters.forEach((f) => { ctx.globalAlpha = Math.min(1, f.t * 2); ART.text(ctx, f.txt, f.x, f.y, 18, f.col); });
    ctx.globalAlpha = 1;
    // indicador de interacción
    if (G.nearest && !G.paused && !G.ended) {
      const it = G.nearest, bx = it.x, by = it.y - 92 + Math.sin(t * 5) * 3;
      const key = document.body.classList.contains('touch-on') ? 'A' : 'ENTER';
      ctx.font = `900 13px ${ART.FONT}`;
      const w = ctx.measureText(it.label).width + 70;
      ctx.fillStyle = 'rgba(27,20,70,0.92)'; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2.5;
      ART.rr(ctx, bx - w / 2, by - 16, w, 32, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd23f'; ART.rr(ctx, bx - w / 2 + 6, by - 11, key.length * 9 + 12, 22, 8); ctx.fill();
      ART.text(ctx, key, bx - w / 2 + 12 + key.length * 4.5, by, 11, '#1b1446', 'center', null);
      ART.text(ctx, it.label, bx + (key.length * 9 + 12) / 2, by, 13, '#fff', 'center', null);
    }
    ctx.restore();
  }
})(window.EZ);
