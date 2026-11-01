/* ==========================================================
   EUREKA DROP · minigames.js
   Minijuegos de habilidad (Educación Física):
   · runner  «Pista Turbo»: saltar vallas y agacharse a tiempo.
   · simon   «Calentamiento al ritmo»: repetir secuencias de movimientos.
   Devuelven una promesa { ok, score }.
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, ART = EZ.art;
  const MG = (EZ.minigames = {});

  function overlay(html) {
    const el = U.$('#mini');
    el.innerHTML = html;
    el.classList.add('show');
    return el;
  }
  function closeOverlay() { const el = U.$('#mini'); el.classList.remove('show'); el.innerHTML = ''; }

  function intro(el, title, text, keys) {
    return new Promise((res) => {
      const box = U.el('div', { class: 'mini-intro' }, `<h2>${title}</h2><p>${text}</p><p class="mini-keys">${keys}</p><button class="btn btn-go" type="button">¡A por ello!</button>`);
      el.appendChild(box);
      const b = U.$('button', box);
      const go = () => { box.remove(); document.removeEventListener('keydown', k, true); res(); };
      const k = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } };
      b.addEventListener('click', go);
      document.addEventListener('keydown', k, true);
      setTimeout(() => b.focus(), 50);
    });
  }

  /* ---------------- Pista Turbo ---------------- */
  MG.runner = function (lv, avatar) {
    return new Promise(async (resolve) => {
      const el = overlay(`<div class="mini-hud"><span class="mini-title">PISTA TURBO</span><span id="mg-info"></span></div>
        <canvas id="mg-cv" aria-label="Carrera de obstáculos"></canvas>
        <div class="mini-btns"><button class="btn btn-go" id="mg-jump" type="button">SALTA ↑</button>${lv >= 2 ? '<button class="btn btn-hint" id="mg-duck" type="button">AGÁCHATE ↓</button>' : ''}</div>`);
      await intro(el, 'Pista Turbo', `Corre ${[0, 25, 30, 35][lv]} segundos. Salta las vallas${lv >= 2 ? ' y agáchate bajo las barras voladoras' : ''}. Si chocas 3 veces, se acaba. Las estrellas dan puntos extra.`,
        `Teclado: ESPACIO / ↑ saltar${lv >= 2 ? ' · ↓ agacharse' : ''}. Táctil: botones de abajo.`);
      const cv = U.$('#mg-cv'), ctx = cv.getContext('2d'), info = U.$('#mg-info');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      let W = 0, H = 0;
      const resize = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
      resize(); window.addEventListener('resize', resize);
      const dur = [0, 25, 30, 35][lv];
      let speed = [0, 300, 350, 400][lv] * EZ.ease(), t = 0, hits = 0, stars = 0, inv = 0, spawn = 1.2, last = performance.now(), done = false, py = 0, vy = 0, duck = 0, walk = 0;
      const obs = [];
      const ground = () => H * 0.78;
      const jump = () => { if (py === 0 && duck <= 0) { vy = 760; EZ.audio.play('jump'); } };
      const doDuck = () => { if (lv >= 2 && py === 0) { duck = 0.65; EZ.audio.play('whoosh'); } };
      const key = (e) => {
        if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); jump(); }
        if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); doDuck(); }
      };
      document.addEventListener('keydown', key, true);
      U.$('#mg-jump').addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });
      if (U.$('#mg-duck')) U.$('#mg-duck').addEventListener('pointerdown', (e) => { e.preventDefault(); doDuck(); });
      cv.addEventListener('pointerdown', (e) => { if (e.offsetY < H * 0.6 || lv < 2) jump(); else doDuck(); });

      function frame(now) {
        if (done) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        t += dt; walk += dt; speed += dt * 6; inv = Math.max(0, inv - dt); duck = Math.max(0, duck - dt);
        // física
        if (py > 0 || vy > 0) { vy -= 2100 * dt; py = Math.max(0, py + vy * dt); if (py === 0) vy = 0; }
        spawn -= dt;
        if (spawn <= 0 && t < dur - 1.5) {
          const bar = lv >= 2 && Math.random() < 0.35;
          obs.push({ x: W + 40, kind: bar ? 'bar' : 'hurdle' });
          if (Math.random() < 0.6) obs.push({ x: W + 40 + U.rand(120, 220), kind: 'star', h: Math.random() < 0.5 ? 0 : 120 });
          spawn = U.rand(0.95, 1.5) * (300 / speed) * 1.25;
        }
        const px = W * 0.2, g = ground();
        const ph = duck > 0 ? 34 : 64;
        for (const o of obs) {
          o.x -= speed * dt;
          if (o.hit) continue;
          let box;
          if (o.kind === 'hurdle') box = { x: o.x - 16, y: g - 44, w: 32, h: 44 };
          else if (o.kind === 'bar') box = { x: o.x - 30, y: g - 110, w: 60, h: 64 };
          else box = { x: o.x - 14, y: g - 40 - o.h - 14, w: 28, h: 28 };
          const pb = { x: px - 14, y: g - py - ph, w: 28, h: ph };
          const hit = pb.x < box.x + box.w && pb.x + pb.w > box.x && pb.y < box.y + box.h && pb.y + pb.h > box.y;
          if (hit) {
            o.hit = true;
            if (o.kind === 'star') { stars++; EZ.audio.play('coin'); }
            else if (inv <= 0) { hits++; inv = 1; EZ.audio.play('hit'); }
          }
        }
        while (obs.length && obs[0].x < -80) obs.shift();
        // dibujo
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#2b1f7a'); sky.addColorStop(1, '#ff7a9c');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        for (let i = 0; i < 6; i++) { const x = (i * 260 - (t * 60) % 260); ctx.fillRect(x, H * 0.25, 180, H * 0.35); }
        ctx.fillStyle = '#c43a52'; ctx.fillRect(0, g, W, H - g);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 20; i++) { const x = (i * 90 - (t * speed) % 90); ctx.fillRect(x, g + 22, 50, 5); }
        obs.forEach((o) => {
          if (o.kind === 'hurdle') ART.drawProp(ctx, 'hurdle', o.x, g, t);
          else if (o.kind === 'bar') { ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3; ART.rr(ctx, o.x - 30, g - 108, 60, 16, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(o.x - 2, 0, 4, g - 108); }
          else if (!o.hit) { const y = g - 40 - o.h; ctx.save(); ctx.translate(o.x, y); ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#a86b00'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2, r = k % 2 ? 6 : 14; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
        });
        if (!(inv > 0 && Math.floor(t * 10) % 2)) {
          ctx.save();
          if (duck > 0) { ctx.translate(px, g); ctx.scale(1.15, 0.6); ctx.translate(-px, -g); }
          ART.drawPlayer(ctx, px, g, py, 'right', walk, avatar, { moving: py === 0, scale: 1.2 });
          ctx.restore();
        }
        info.textContent = `Tiempo ${Math.max(0, Math.ceil(dur - t))} s · Choques ${hits}/3 · Estrellas ${stars}`;
        if (hits >= 3 || t >= dur) { finish(hits < 3); return; }
        requestAnimationFrame(frame);
      }
      function finish(ok) {
        done = true;
        document.removeEventListener('keydown', key, true);
        window.removeEventListener('resize', resize);
        EZ.audio.play(ok ? 'achievement' : 'wrong');
        const box = U.el('div', { class: 'mini-intro' }, `<h2>${ok ? '¡Meta superada!' : '¡Tropiezo!'}</h2><p>${ok ? `Estrellas: ${stars}. Coordinación y reacción a tope.` : 'Tres choques. Mira la valla, calcula y salta un poco antes.'}</p><button class="btn btn-go" type="button">Continuar</button>`);
        U.$('#mini').appendChild(box);
        const b = U.$('button', box);
        const k2 = (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); b.click(); } };
        document.addEventListener('keydown', k2, true);
        b.addEventListener('click', () => { document.removeEventListener('keydown', k2, true); closeOverlay(); resolve({ ok, score: stars * 20 }); });
        setTimeout(() => b.focus(), 50);
      }
      last = performance.now();
      requestAnimationFrame(frame);
    });
  };

  /* ---------------- Calentamiento al ritmo ---------------- */
  MG.simon = function (lv, moves) {
    moves = moves && moves.length >= 4 ? moves : [
      { k: 'up', n: 'Brazos arriba' }, { k: 'down', n: 'Sentadilla' }, { k: 'left', n: 'Paso a la izquierda' }, { k: 'right', n: 'Paso a la derecha' }
    ];
    return new Promise(async (resolve) => {
      const arrows = { up: '↑', down: '↓', left: '←', right: '→' };
      const freqs = { up: 523, right: 659, down: 784, left: 440 };
      const el = overlay(`<div class="mini-hud"><span class="mini-title">CALENTAMIENTO AL RITMO</span><span id="mg-info" aria-live="polite"></span></div>
        <div class="simon">${moves.slice(0, 4).map((m) => `<button type="button" class="simon-pad pad-${m.k}" data-k="${m.k}"><span class="arrow">${arrows[m.k]}</span><span>${U.esc(m.n)}</span></button>`).join('')}</div>`);
      await intro(el, 'Calentamiento al ritmo', 'Observa la secuencia de movimientos y repítela en el mismo orden. Cada ronda añade un movimiento. Tienes 3 intentos.', 'Teclado: flechas. Táctil o ratón: pulsa los paneles.');
      const info = U.$('#mg-info');
      const target = [0, 4, 5, 6][lv];
      const seq = [];
      const keys = moves.slice(0, 4).map((m) => m.k);
      for (let i = 0; i < target; i++) seq.push(U.pick(keys));
      let len = 3, pos = 0, accepting = false, mistakes = 0, done = false;
      const pad = (k) => U.$(`.simon-pad[data-k="${k}"]`, el);
      const light = async (k, ms = 480) => {
        const p = pad(k); p.classList.add('lit');
        EZ.audio.play('tick');
        await U.wait(ms); p.classList.remove('lit'); await U.wait(140);
      };
      async function showSeq() {
        accepting = false; info.textContent = `Observa… (${len} movimientos)`;
        await U.wait(500);
        for (let i = 0; i < len; i++) await light(seq[i], lv === 3 ? 380 : 480);
        pos = 0; accepting = true; info.textContent = `¡Tu turno! ${len} movimientos · intentos ${3 - mistakes}`;
      }
      async function press(k) {
        if (!accepting || done) return;
        accepting = false;
        await light(k, 200);
        if (k === seq[pos]) {
          pos++;
          if (pos >= len) {
            if (len >= target) return end(true);
            len++; info.textContent = '¡Bien! Uno más…'; EZ.audio.play('correct');
            await U.wait(600); return showSeq();
          }
          accepting = true;
        } else {
          mistakes++; EZ.audio.play('wrong');
          if (mistakes >= 3) return end(false);
          info.textContent = `¡Uy! Era «${moves.find((m) => m.k === seq[pos]).n}». Otra vez.`;
          await U.wait(1100); showSeq();
        }
      }
      const key = (e) => {
        const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
        if (map[e.key] && keys.includes(map[e.key])) { e.preventDefault(); e.stopPropagation(); press(map[e.key]); }
      };
      document.addEventListener('keydown', key, true);
      U.$$('.simon-pad', el).forEach((b) => b.addEventListener('click', () => press(b.getAttribute('data-k'))));
      function end(ok) {
        done = true; document.removeEventListener('keydown', key, true);
        EZ.audio.play(ok ? 'achievement' : 'wrong');
        const box = U.el('div', { class: 'mini-intro' }, `<h2>${ok ? '¡Calentamiento perfecto!' : 'Se te ha escapado el ritmo'}</h2><p>${ok ? 'Memoria motriz y ritmo en marcha: tus músculos ya están listos.' : 'Prueba a decir los movimientos en voz baja mientras los ves.'}</p><button class="btn btn-go" type="button">Continuar</button>`);
        el.appendChild(box);
        const b = U.$('button', box);
        const k2 = (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); b.click(); } };
        document.addEventListener('keydown', k2, true);
        b.addEventListener('click', () => { document.removeEventListener('keydown', k2, true); closeOverlay(); resolve({ ok, score: ok ? 100 - mistakes * 25 : 0 }); });
        setTimeout(() => b.focus(), 50);
      }
      showSeq();
    });
  };
})(window.EZ);
