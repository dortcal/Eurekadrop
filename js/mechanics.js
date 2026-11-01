/* ==========================================================
   EUREKA DROP · mechanics.js
   Mecánica jugable EXCLUSIVA de cada territorio (no son preguntas):
   · mat  Cristales de energía (sumar exacto, decimales, negativos)
   · len  Letras perdidas (ortografía saltando sobre letras)
   · med  Restaura el ecosistema (clasificar llevando objetos)
   · ing  Follow directions (indicaciones en inglés con voz)
   · ef   Pista Turbo + Calentamiento al ritmo (minijuegos)
   Los datos (palabras, clasificaciones, lugares...) están en data/*.json.
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, ART = EZ.art, T = ART.T;
  const M = (EZ.mechanics = {});
  const fmt = (v) => (Math.round(v * 100) / 100).toLocaleString('es-ES');

  M.create = function (area, G, room, L, rng, lv) {
    const data = EZ.questions.mechanic(area) || {};
    const f = { mat: mathMech, len: letterMech, med: sortMech, ing: englishMech, ef: sportMech }[area];
    const m = f(G, room, L, rng, lv, data);
    m.area = area;
    m.done = false;
    m.solids = m.solids || (() => []);
    m.interactables = m.interactables || (() => []);
    m.onLand = m.onLand || (() => {});
    m.update = m.update || (() => {});
    m.drawFloor = m.drawFloor || (() => {});
    m.drawOver = m.drawOver || (() => {});
    return m;
  };

  /* ================= MATEMÁTICAS ================= */
  function mathMech(G, room, L, rng, lv) {
    const spots = [];
    for (let k = 0; k < 9; k++) { const p = L.free(room, { avoidPath: false, margin: 2 }); if (p) spots.push(p); }
    const gen = L.tileXY(room.x0 + 7, room.y0 + 2);
    const rounds = lv === 3 ? 3 : 2;
    let round = 0, target = 0, total = 0, crystals = [], cooldown = 0;
    const r = (a, b) => U.randInt(a, b, rng);
    function setup() {
      let sol, dist;
      if (lv === 1) { sol = [r(2, 9), r(2, 9), r(3, 9)]; dist = [r(1, 12), r(1, 12), r(1, 12), r(4, 12), r(6, 12), r(2, 7)]; }
      else if (lv === 2) { const h = () => r(3, 15) / 2; sol = [h(), h(), r(2, 8)]; dist = [h(), h(), r(1, 9), h(), r(2, 10), h()]; }
      else { sol = [r(4, 12), r(3, 10), -r(2, 6), r(3, 15) / 2]; dist = [-r(1, 5), r(2, 12), r(3, 15) / 2, r(1, 9), -r(1, 4)]; }
      target = Math.round(sol.reduce((a, b) => a + b, 0) * 100) / 100;
      const vals = sol.concat(dist).slice(0, spots.length);
      const pos = U.shuffle(spots, rng);
      crystals = vals.map((v, i) => ({ x: pos[i].x, y: pos[i].y, v, got: false }));
      total = 0;
    }
    function reset(msg) {
      crystals.forEach((c) => (c.got = false)); total = 0;
      if (msg) { G.toast(msg, 'bad'); EZ.audio.play('wrong'); G.shake(6); }
    }
    setup();
    return {
      dbg: () => ({ crystals, target, total, round }),
      title: 'Cristales de energía',
      intro: 'Este generador necesita una carga EXACTA. Recoge cristales hasta sumar el número del panel. ¡Si te pasas, sobrecarga!',
      hud: () => `${EZ.icons.bolt} Carga <b>${fmt(total)}</b> / <b>${fmt(target)}</b> · ronda ${Math.min(round + 1, rounds)}/${rounds}`,
      solids: () => [{ x: gen.x - 30, y: gen.y - 30, w: 60, h: 30 }],
      interactables: () => [{ x: gen.x, y: gen.y, label: 'Vaciar carga', act: () => { reset(); G.toast('Carga a cero. ¡Piensa la combinación!'); EZ.audio.play('switch'); } }],
      update(dt) {
        if (this.done) return;
        if (cooldown > 0) { cooldown -= dt; return; }
        const p = G.player;
        for (const c of crystals) {
          if (c.got || U.dist(c.x, c.y, p.x, p.y) > 26) continue;
          c.got = true; total = Math.round((total + c.v) * 100) / 100;
          EZ.audio.play('pickup'); G.floater((c.v > 0 ? '+' : '') + fmt(c.v), c.x, c.y - 30, c.v < 0 ? '#ff9fc0' : '#7df9ff');
          if (Math.abs(total - target) < 1e-6) {
            round++; G.addPoints(150, gen.x, gen.y - 60); G.burst(gen.x, gen.y - 30, '#7df9ff', 30); EZ.audio.play('chest');
            if (round >= rounds) { this.done = true; G.mechDone(); }
            else { G.toast('¡Carga exacta! Siguiente generador…', 'good'); cooldown = 0.8; setup(); }
            return;
          }
          if (total > target + 1e-6 && !crystals.some((k) => !k.got && k.v < 0)) { reset(`¡Sobrecarga! ${fmt(total)} supera ${fmt(target)}. Vuelve a empezar.`); cooldown = 0.8; return; }
          if (crystals.every((k) => k.got)) { reset('Te has quedado sin cristales. ¡Reinicio!'); cooldown = 0.8; return; }
        }
      },
      drawFloor(ctx, t) {
        for (const c of crystals) {
          if (c.got) continue;
          const by = c.y - 18 + Math.sin(t * 3 + c.x) * 3;
          ART.shadow(ctx, c.x, c.y, 12, 4);
          const col = c.v < 0 ? '#ff6b9a' : Number.isInteger(c.v) ? '#7df9ff' : '#3ddc97';
          ctx.fillStyle = col; ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(c.x, by - 22); ctx.lineTo(c.x + 16, by - 6); ctx.lineTo(c.x + 10, by + 10); ctx.lineTo(c.x - 10, by + 10); ctx.lineTo(c.x - 16, by - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(c.x, by - 22); ctx.lineTo(c.x - 16, by - 6); ctx.lineTo(c.x - 4, by - 4); ctx.closePath(); ctx.fill();
          ART.text(ctx, fmt(c.v), c.x, by - 2, fmt(c.v).length > 3 ? 11 : 14, '#fff');
        }
        // generador
        ART.shadow(ctx, gen.x, gen.y, 34, 9);
        ctx.fillStyle = '#3a43b0'; ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3;
        ART.rr(ctx, gen.x - 32, gen.y - 64, 64, 64, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#0d1033'; ART.rr(ctx, gen.x - 26, gen.y - 58, 52, 30, 6); ctx.fill();
        ART.text(ctx, fmt(total) + '/' + fmt(target), gen.x, gen.y - 43, 13, total > target ? '#ff6b9a' : '#7df9ff', 'center', null);
        const fill = Math.max(0, Math.min(1, total / target));
        ctx.fillStyle = '#1b1446'; ctx.fillRect(gen.x - 24, gen.y - 20, 48, 10);
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(gen.x - 24, gen.y - 20, 48 * fill, 10);
      }
    };
  }

  /* ================= LENGUA ================= */
  function letterMech(G, room, L, rng, lv, data) {
    const words = U.shuffle((data.palabras || []).filter((w) => (w.nivel || 1) <= lv), rng).slice(0, lv === 3 ? 3 : 2);
    const spots = [];
    for (let k = 0; k < 15; k++) { const p = L.free(room, { avoidPath: false, margin: 2 }); if (p) spots.push(p); }
    let wi = 0, letters = [], prog = 0, tiles = [];
    function setup() {
      const w = words[wi];
      letters = Array.from(w.palabra.toUpperCase());
      prog = 0;
      const traps = Array.from((w.trampas || '').toUpperCase());
      const all = letters.concat(traps).slice(0, spots.length);
      const pos = U.shuffle(spots, rng);
      tiles = all.map((ch, i) => ({ ch, x: pos[i].x, y: pos[i].y, used: false, shake: 0 }));
    }
    function select(tile) {
      if (!tile || tile.used || this_.done) return;
      if (tile.ch === letters[prog]) {
        tile.used = true; prog++; EZ.audio.play('pickup'); G.burst(tile.x, tile.y - 20, '#ffd23f', 10);
        if (prog >= letters.length) {
          G.addPoints(150, G.player.x, G.player.y - 70); EZ.audio.play('chest');
          G.toast(`¡${words[wi].palabra.toUpperCase()}! Palabra recuperada.`, 'good');
          wi++;
          if (wi >= words.length) { this_.done = true; G.mechDone(); } else setup();
        }
      } else {
        tile.shake = 0.5; EZ.audio.play('wrong'); G.addPoints(-10);
        G.toast(words[wi].aviso || '¡Esa letra no va ahí! Revisa la ortografía.', 'bad');
      }
    }
    const nearest = () => {
      let best = null, bd = 30;
      tiles.forEach((tl) => { if (tl.used) return; const d = U.dist(tl.x, tl.y, G.player.x, G.player.y); if (d < bd) { bd = d; best = tl; } });
      return best;
    };
    if (!words.length) words.push({ palabra: 'EUREKA', pista: 'Lo que se grita al descubrir algo', trampas: 'IU' });
    setup();
    const this_ = {
      dbg: () => ({ tiles, letters, prog, wi }),
      title: 'Letras perdidas',
      intro: 'Doña Tilde ha perdido sus palabras. Lee la pista y SALTA sobre las letras en orden (o pulsa ENTER encima). ¡Cuidado con las letras trampa!',
      hud: () => {
        const shown = letters.map((ch, i) => (i < prog ? ch : '_')).join(' ');
        return `${EZ.icons.book} <b>${U.esc(words[wi] ? words[wi].pista : '')}</b> <span class="mono">${shown}</span> · ${Math.min(wi + 1, words.length)}/${words.length}`;
      },
      onLand(x, y) { select(nearest()); },
      interactables: () => { const n = nearest(); return n ? [{ x: n.x, y: n.y, label: 'Letra ' + n.ch, act: () => select(n), r: 30 }] : []; },
      update(dt) { tiles.forEach((tl) => { if (tl.shake > 0) tl.shake -= dt; }); },
      drawFloor(ctx, t) {
        tiles.forEach((tl) => {
          if (tl.used) return;
          const sx = tl.shake > 0 ? Math.sin(tl.shake * 60) * 4 : 0;
          const x = tl.x + sx, y = tl.y - 6;
          ART.shadow(ctx, x, y + 6, 20, 6);
          ctx.fillStyle = '#fff6e0'; ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3;
          ART.rr(ctx, x - 19, y - 34, 38, 36, 8); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#e8d3a8'; ctx.fillRect(x - 17, y - 6, 34, 6);
          ART.text(ctx, tl.ch, x, y - 17, 22, '#1b1446', 'center', null);
        });
      }
    };
    return this_;
  }

  /* ================= CONOCIMIENTO DEL MEDIO ================= */
  function sortMech(G, room, L, rng, lv, data) {
    let sets = U.shuffle((data.clasificaciones || []).filter((s) => (s.nivel || 1) <= lv), rng).slice(0, lv === 1 ? 1 : 2);
    if (!sets.length) sets = [{ titulo: 'Energías', zonas: ['Renovable', 'No renovable'], elementos: [{ t: 'Sol', z: 0 }, { t: 'Carbón', z: 1 }] }];
    let si = 0, items = [], zones = [], placed = 0;
    const spots = [];
    const padRow = room.y0 + 1;
    for (let k = 0; k < 7; k++) {
      let p = null;
      for (let tries = 0; tries < 20 && !p; tries++) { const q = L.free(room, { avoidPath: false, margin: 2 }); if (q && q.r > padRow + 1) p = q; }
      if (p) spots.push(p);
    }
    function setup() {
      const s = sets[si];
      const n = s.zonas.length;
      const cols = n === 2 ? [room.x0 + 3, room.x0 + 9] : [room.x0 + 2, room.x0 + 6, room.x0 + 10];
      zones = s.zonas.map((name, i) => ({ name, x: cols[i] * T, y: padRow * T, w: 3 * T, h: 2 * T - 8 }));
      let els = U.shuffle(s.elementos, rng);
      const pick = [];
      s.zonas.forEach((_, zi) => { const e = els.find((x) => x.z === zi && !pick.includes(x)); if (e) pick.push(e); });
      els.forEach((e) => { if (pick.length < Math.min(6, spots.length) && !pick.includes(e)) pick.push(e); });
      const pos = U.shuffle(spots, rng);
      items = pick.map((e, i) => ({ t: e.t, z: e.z, por: e.por, x: pos[i].x, y: pos[i].y, hx: pos[i].x, hy: pos[i].y, state: 'ground' }));
      placed = 0; G.player.carry = null;
    }
    setup();
    const pal = ['#4cc9f0', '#ffb547', '#ff6b9a'];
    const self = {
      dbg: () => ({ items, zones }),
      title: 'Restaura el ecosistema',
      intro: 'Magmo ha mezclado todo. Coge cada elemento (pasa por encima) y llévalo a su zona correcta.',
      hud: () => `${EZ.icons.map} <b>${U.esc(sets[si].titulo)}</b>: lleva cada elemento a su zona (${placed}/${items.length}) · ${si + 1}/${sets.length}`,
      update(dt) {
        if (self.done) return;
        const p = G.player;
        if (!p.carry) {
          for (const it of items) if (it.state === 'ground' && U.dist(it.x, it.y, p.x, p.y) < 26 && p.z < 8) { it.state = 'carried'; p.carry = it; EZ.audio.play('pickup'); break; }
        } else {
          const it = p.carry;
          const zi = zones.findIndex((z) => p.x > z.x && p.x < z.x + z.w && p.y > z.y && p.y < z.y + z.h + 20);
          if (zi >= 0) {
            p.carry = null;
            if (zi === it.z) {
              it.state = 'placed'; placed++; G.addPoints(60, p.x, p.y - 70); G.burst(p.x, p.y - 40, '#3ddc97', 14); EZ.audio.play('coin');
              if (placed >= items.length) {
                G.addPoints(150, p.x, p.y - 90); EZ.audio.play('chest');
                si++;
                if (si >= sets.length) { self.done = true; G.mechDone(); } else { G.toast('¡Zona restaurada! Ahora otra…', 'good'); setup(); }
              }
            } else {
              it.state = 'ground'; it.x = it.hx; it.y = it.hy; EZ.audio.play('wrong'); G.addPoints(-10);
              G.toast(it.por ? it.por : `«${it.t}» no va en «${zones[zi].name}».`, 'bad');
            }
          }
        }
      },
      drawFloor(ctx, t) {
        zones.forEach((z, i) => {
          ctx.globalAlpha = 0.85; ctx.fillStyle = pal[i];
          ART.rr(ctx, z.x + 4, z.y + 4, z.w - 8, z.h - 8, 14); ctx.fill();
          ctx.globalAlpha = 1; ctx.setLineDash([10, 6]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
          ART.text(ctx, z.name, z.x + z.w / 2, z.y + z.h / 2, z.name.length > 14 ? 12 : 15, '#fff');
        });
        items.forEach((it) => { if (it.state === 'ground') drawToken(ctx, it.t, it.x, it.y - 16 + Math.sin(t * 3 + it.x) * 2); });
      },
      drawOver(ctx) {
        const p = G.player;
        if (p.carry) drawToken(ctx, p.carry.t, p.x, p.y - p.z - 84);
      }
    };
    function drawToken(ctx, txt, x, y) {
      ctx.font = `900 13px ${ART.FONT}`;
      const w = Math.max(44, ctx.measureText(txt).width + 18);
      ART.shadow(ctx, x, y + 18, w / 2.5, 5, 0.2);
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3;
      ART.rr(ctx, x - w / 2, y - 13, w, 26, 13); ctx.fill(); ctx.stroke();
      ART.text(ctx, txt, x, y, 13, '#1b1446', 'center', null);
    }
    return self;
  }

  /* ================= INGLÉS ================= */
  const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  function englishMech(G, room, L, rng, lv, data) {
    const places = U.shuffle(data.lugares || [], rng).slice(0, 6);
    const cols = [1, 3, 5, 8, 10, 12];
    const builds = places.map((p, i) => {
      const c = room.x0 + cols[i];
      return Object.assign({}, p, { c, x: (c + 1) * T, y: (room.y0 + 2) * T, i, hue: ['#ffb547', '#4cc9f0', '#ff6b9a', '#3ddc97', '#b98bff', '#ff8a3d'][i] });
    });
    const tour = L.tileXY(room.x0 + 7, room.y0 + 7);
    const rounds = 3;
    let round = 0, target = 0, text = '', revealed = lv < 3;
    const kinds = lv === 1 ? ['name', 'name', 'need'] : lv === 2 ? ['name', 'need', 'next'] : ['between', 'next', 'need', 'ordinal'];
    function setup() {
      const k = kinds[round % kinds.length];
      if (k === 'name') { target = U.randInt(0, 5, rng); text = `Go to the ${builds[target].en}, please.`; }
      else if (k === 'need') { target = U.randInt(0, 5, rng); text = builds[target].necesidad + ' Where can I go?'; }
      else if (k === 'between') { target = U.randInt(1, 4, rng); text = `Go to the building between the ${builds[target - 1].en} and the ${builds[target + 1].en}.`; }
      else if (k === 'next') {
        const right = rng() < 0.5;
        target = right ? U.randInt(1, 5, rng) : U.randInt(0, 4, rng);
        const ref = right ? target - 1 : target + 1;
        text = `Go to the building on the ${right ? 'right' : 'left'} of the ${builds[ref].en}.`;
      } else { target = U.randInt(0, 5, rng); text = `Go to the ${ORD[target]} building from the left.`; }
      revealed = lv < 3 || !EZ.audio.canSpeak();
      setTimeout(() => EZ.audio.speak(text), 300);
    }
    setup();
    const self = {
      dbg: () => ({ builds, target, round, text }),
      title: 'Follow directions',
      intro: 'Captain Polyglot ha perdido la brújula. Un turista te dará indicaciones EN INGLÉS: camina hasta el edificio correcto y pulsa ENTER en su puerta.',
      hud: () => `${EZ.icons.speaker} ${revealed ? '<b>«' + U.esc(text) + '»</b>' : '<b>Listen to the tourist!</b> <button type="button" class="hud-mini" data-act="reveal">Ver texto</button>'} <button type="button" class="hud-mini" data-act="listen">Repetir</button> · ${round + 1}/${rounds}`,
      hudAction(act) { if (act === 'reveal') revealed = true; if (act === 'listen') EZ.audio.speak(text); },
      solids: () => builds.map((b) => ({ x: b.c * T + 2, y: (room.y0 + 1) * T, w: 2 * T - 4, h: T - 6 })).concat([{ x: tour.x - 14, y: tour.y - 14, w: 28, h: 18 }]),
      interactables: () => builds.map((b) => ({ x: b.x, y: b.y + 10, label: lv === 1 ? 'Entrar' : 'Enter', r: 52, act: () => choose(b) }))
        .concat([{ x: tour.x, y: tour.y, label: 'Repetir indicación', act: () => { EZ.audio.speak(text); G.toast('«' + text + '»'); } }]),
      drawFloor(ctx, t) {
        builds.forEach((b) => drawBuilding(ctx, b, room, lv, t));
        ART.drawNPC(ctx, tour.x, tour.y, t, { skin: 0, hair: 5, hairColor: 2, outfit: 5 }, 'cap', '?');
      }
    };
    function choose(b) {
      if (self.done) return;
      if (b.i === target) {
        round++; G.addPoints(150, b.x, b.y - 60); G.burst(b.x, b.y, '#ffd23f', 20); EZ.audio.play('chest');
        G.toast(`Yes! The ${b.en}. Well done!`, 'good');
        if (round >= rounds) { self.done = true; G.mechDone(); } else setup();
      } else {
        EZ.audio.play('wrong'); G.addPoints(-10);
        G.toast(`Oops! That's the ${b.en}. Listen again.`, 'bad');
      }
    }
    return self;
  }
  function drawBuilding(ctx, b, room, lv, t) {
    const x = b.c * T, top = (room.y0 - 0.6) * T, w = 2 * T, bottom = (room.y0 + 2) * T - 4;
    ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3;
    ctx.fillStyle = b.hue; ART.rr(ctx, x + 3, top, w - 6, bottom - top, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = ART.shade(b.hue, -40); ctx.fillRect(x + 3, top, w - 6, 10);
    ctx.fillStyle = '#7df9ff'; ctx.fillRect(x + 12, top + 46, 18, 16); ctx.fillRect(x + w - 30, top + 46, 18, 16);
    ctx.strokeRect(x + 12, top + 46, 18, 16); ctx.strokeRect(x + w - 30, top + 46, 18, 16);
    ctx.fillStyle = '#5a3a22'; ART.rr(ctx, x + w / 2 - 12, bottom - 34, 24, 34, 4); ctx.fill(); ctx.stroke();
    // cartel
    ctx.fillStyle = '#fff'; ART.rr(ctx, x + 8, top + 8, w - 16, 32, 6); ctx.fill(); ctx.stroke();
    drawPlaceIcon(ctx, b.id, x + (lv >= 2 ? 22 : w / 2), top + 24);
    if (lv >= 2) { ctx.font = `900 9px ${ART.FONT}`; ctx.fillStyle = '#1b1446'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; const label = b.en.toUpperCase(); ctx.fillText(label.length > 9 ? label.slice(0, 9) + '.' : label, x + 34, top + 24); }
  }
  /** Pictogramas originales de cada lugar. */
  function drawPlaceIcon(ctx, id, x, y) {
    ctx.save(); ctx.translate(x, y); ctx.lineWidth = 2; ctx.strokeStyle = '#1b1446';
    const fillC = (c) => { ctx.fillStyle = c; ctx.fill(); ctx.stroke(); };
    switch (id) {
      case 'bakery': ctx.beginPath(); ctx.ellipse(0, 0, 12, 7, 0, 0, 7); fillC('#d9a066'); ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(-2, 4); ctx.moveTo(1, -6); ctx.lineTo(4, 4); ctx.stroke(); break;
      case 'bank': ART.text(ctx, '€', 0, 1, 18, '#2fae5b', 'center', null); break;
      case 'library': ctx.beginPath(); ctx.moveTo(-12, -7); ctx.lineTo(0, -4); ctx.lineTo(12, -7); ctx.lineTo(12, 8); ctx.lineTo(0, 10); ctx.lineTo(-12, 8); ctx.closePath(); fillC('#ffb547'); ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, 10); ctx.stroke(); break;
      case 'hospital': ctx.fillStyle = '#e63946'; ctx.fillRect(-4, -11, 8, 22); ctx.fillRect(-11, -4, 22, 8); break;
      case 'pharmacy': ctx.fillStyle = '#2fae5b'; ctx.fillRect(-4, -11, 8, 22); ctx.fillRect(-11, -4, 22, 8); break;
      case 'cinema': ctx.beginPath(); ctx.rect(-12, -8, 24, 16); fillC('#2b2d42'); ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { ctx.fillRect(-10 + i * 6, -7, 3, 3); ctx.fillRect(-10 + i * 6, 4, 3, 3); } break;
      case 'school': ART.text(ctx, 'ABC', 0, 1, 11, '#e63946', 'center', null); break;
      case 'post-office': ctx.beginPath(); ctx.rect(-12, -8, 24, 16); fillC('#ffd23f'); ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(0, 2); ctx.lineTo(12, -8); ctx.stroke(); break;
      case 'cafe': ctx.beginPath(); ctx.rect(-9, -6, 14, 14); fillC('#fff'); ctx.beginPath(); ctx.arc(7, 1, 4, -1.5, 1.5); ctx.stroke(); ctx.fillStyle = '#8a5a3c'; ctx.fillRect(-7, -4, 10, 4); break;
      case 'supermarket': ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(-8, -8); ctx.lineTo(-5, 5); ctx.lineTo(9, 5); ctx.lineTo(11, -4); ctx.lineTo(-7, -4); ctx.stroke(); ctx.beginPath(); ctx.arc(-3, 9, 2, 0, 7); ctx.arc(7, 9, 2, 0, 7); fillC('#1b1446'); break;
      case 'police-station': ART.text(ctx, '★', 0, 1, 20, '#1d6fd1', 'center', null); break;
      case 'museum': ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(0, -11); ctx.lineTo(12, -4); ctx.closePath(); fillC('#c9d2ff'); ctx.fillStyle = '#c9d2ff'; [-9, -3, 3, 9].forEach((cx) => { ctx.fillRect(cx - 1.5, -3, 3, 11); ctx.strokeRect(cx - 1.5, -3, 3, 11); }); break;
      case 'sports-centre': ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); fillC('#fff'); ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); fillC('#1b1446'); break;
      case 'zoo': ctx.beginPath(); ctx.arc(0, 2, 8, 0, 7); fillC('#ffb547'); ctx.beginPath(); ctx.arc(-6, -6, 3.5, 0, 7); ctx.arc(6, -6, 3.5, 0, 7); fillC('#ffb547'); break;
      default: ART.text(ctx, '?', 0, 0, 16, '#1b1446', 'center', null);
    }
    ctx.restore();
  }

  /* ================= EDUCACIÓN FÍSICA ================= */
  function sportMech(G, room, L, rng, lv, data) {
    const st = [
      { id: 'run', name: 'Pista Turbo', x: (room.x0 + 4) * T, y: (room.y0 + 3) * T, done: false },
      { id: 'simon', name: 'Calentamiento al ritmo', x: (room.x0 + 11) * T, y: (room.y0 + 3) * T, done: false }
    ];
    const tips = data.consejos || [];
    const self = {
      dbg: () => ({ st }),
      title: 'Pruebas Turbo',
      intro: 'Rinoturbo ha cerrado el estadio. Supera las dos pruebas: la carrera de obstáculos (coordinación y reacción) y el calentamiento al ritmo (secuencias de movimiento).',
      hud: () => `${EZ.icons.flame} ${st.map((s) => (s.done ? '✔ ' : '○ ') + s.name).join(' · ')}`,
      solids: () => st.map((s) => ({ x: s.x - 30, y: s.y - 24, w: 60, h: 24 })),
      interactables: () => st.filter((s) => !s.done).map((s) => ({ x: s.x, y: s.y + 10, label: s.name, r: 64, act: () => play(s) })),
      drawFloor(ctx, t) {
        st.forEach((s) => {
          ART.shadow(ctx, s.x, s.y, 36, 9);
          ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3;
          if (s.id === 'run') {
            ctx.fillStyle = s.done ? '#3ddc97' : '#ff8a3d';
            ART.rr(ctx, s.x - 34, s.y - 80, 12, 80, 4); ctx.fill(); ctx.stroke(); ART.rr(ctx, s.x + 22, s.y - 80, 12, 80, 4); ctx.fill(); ctx.stroke();
            ART.rr(ctx, s.x - 40, s.y - 96, 80, 22, 8); ctx.fill(); ctx.stroke();
            ART.text(ctx, 'TURBO', s.x, s.y - 85, 13, '#fff');
          } else {
            const cols = ['#ff6b9a', '#4cc9f0', '#ffd23f', '#3ddc97'];
            cols.forEach((c, i) => { ctx.fillStyle = c; ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(t * 3 + i)); ART.rr(ctx, s.x - 34 + (i % 2) * 36, s.y - 70 + Math.floor(i / 2) * 34, 32, 30, 6); ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); });
            ART.text(ctx, '♪', s.x, s.y - 88 + Math.sin(t * 4) * 3, 18, '#fff');
          }
          if (s.done) ART.text(ctx, '✔', s.x, s.y - 110, 22, '#3ddc97');
        });
      }
    };
    async function play(s) {
      G.paused = true;
      const res = s.id === 'run' ? await EZ.minigames.runner(lv, EZ.save.profile.avatar) : await EZ.minigames.simon(lv, data.movimientos);
      G.paused = false;
      G.resetInput();
      if (res.ok) {
        s.done = true; G.addPoints(150 + res.score, s.x, s.y - 80); EZ.audio.play('chest');
        const tip = tips.length ? U.pick(tips, rng) : '';
        G.toast('¡Prueba superada! ' + tip, 'good', 6000);
        if (st.every((x) => x.done)) { self.done = true; G.mechDone(); }
      } else {
        G.toast('¡Casi! Respira, concéntrate y vuelve a intentarlo cuando quieras.', 'bad');
      }
    }
    return self;
  }
})(window.EZ);
