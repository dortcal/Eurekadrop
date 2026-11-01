/* ==========================================================
   EUREKA DROP · tools/test-bot.js  (solo para desarrollo)
   Pruebas automáticas en el navegador. No lo carga el juego.
   Uso: abre index.html?nosw, pega en la consola:
     const s=document.createElement('script'); s.src='tools/test-bot.js'; document.body.appendChild(s);
   y después:
     await EZTest.questions()                       // todas las preguntas
     await EZTest.play({mode:'quick', area:'mat', level:1})   // una fase completa
   ========================================================== */
window.EZTest = (function () {
  'use strict';
  const w = (ms) => new Promise((r) => setTimeout(r, ms));
  const sol = (q) => { switch (q.tipo) { case 'input': return q.respuestas[0]; case 'order': return q.elementos; case 'place': return q.huecos; case 'match': return q.pares; default: return q.correcta; } };
  if (window.speechSynthesis) speechSynthesis.speak = () => {};

  /** Muestra cada pregunta, la responde bien y comprueba que se acepta. */
  async function questions() {
    const errs = []; let n = 0;
    for (const a of EZ.AREAS) for (const raw of EZ.questions.banks[a.id].preguntas) {
      const q = Object.assign({ area: a.id }, raw);
      try {
        const p = EZ.challenge.ask(q, { title: 'Test' }); await w(5);
        const card = document.querySelector('.ch-card');
        if (q.visual && !card.querySelector('.ch-visual svg, .ch-visual table')) errs.push(q.id + ' sin visual');
        if (q.tipo === 'hotspot' && !card.querySelector('.hot[data-id="' + q.correcta + '"]')) errs.push(q.id + ' sin zona correcta');
        EZ.challenge._test.answer(sol(q)); await w(5);
        if (!card.classList.contains('is-correct')) errs.push(q.id + ' respuesta correcta rechazada');
        EZ.challenge._test.next(); await p;
        // y una incorrecta debe rechazarse
        const p2 = EZ.challenge.ask(q, { title: 'Test' }); await w(5);
        EZ.challenge._test.answer(q.tipo === 'tf' ? !q.correcta : q.tipo === 'mc' || q.tipo === 'listen' ? (q.correcta + 1) % q.opciones.length : '__mal__'); await w(5);
        if (!document.querySelector('.ch-card').classList.contains('is-wrong')) errs.push(q.id + ' respuesta incorrecta aceptada');
        EZ.challenge._test.next(); await p2;
        n++;
      } catch (e) { errs.push(q.id + ' EXC ' + e.message); }
    }
    return { probadas: n, errores: errs };
  }

  /** Juega una fase completa: puertas, mecánica, jefe. opts.wrong = prob. de fallar. */
  async function play(cfg, opts = {}) {
    const G = EZ.game, T = 48, log = [];
    EZ.save.settings.lives = opts.lives || 7;
    EZ.audio.init(); G.start(cfg); await w(600);
    const tp = (x, y) => { G.player.x = x; G.player.y = y; };
    const t0 = performance.now();
    while (performance.now() - t0 < (opts.timeout || 120000)) {
      await w(110);
      if (EZ.ui.current === 'results') { log.push('RESULTADOS'); break; }
      const sk = document.querySelector('.dlg-skip'); if (sk) { sk.click(); continue; }
      if (document.querySelector('#modal.show')) {
        const fb = document.querySelector('.ch-feedback:not([hidden]) .btn-go'); if (fb) { fb.click(); continue; }
        const t = EZ.challenge._test, bad = opts.wrong && Math.random() < opts.wrong;
        t.answer(bad ? '__mal__' : sol(t.q)); log.push((bad ? 'X ' : 'ok ') + t.q.id); continue;
      }
      if (document.querySelector('#mini.show')) { log.push('minijuego abierto'); break; }
      if (G.paused || G.ended) continue;
      const L = G.L, m = G.mech;
      if (G.boss) { if (!G.boss.freed && G.orbs.length) tp(G.orbs[0].x, G.orbs[0].y); continue; }
      const g = L.gates.find((x) => !x.open && !x.opening);
      if (!g) { const br = L.rooms[L.rooms.length - 1]; tp((br.x0 + 5) * T, (br.y0 + 5.5) * T); continue; }
      if (g.kind === 'q') { tp(g.x - 60, g.y + 12); await w(60); EZ.controls.action = true; continue; }
      const mr = G.mechRoom;
      if (G.roomIdx !== mr.i) { tp((mr.x0 + 2) * T, (mr.mid + 0.5) * T + 12); continue; }
      const d = m.dbg();
      if (m.area === 'mat') {
        const left = d.crystals.filter((c) => !c.got), need = Math.round((d.target - d.total) * 100) / 100;
        let pick = null;
        for (let mask = 1; mask < (1 << left.length) && !pick; mask++) { let s = 0; const arr = []; left.forEach((c, i) => { if (mask & (1 << i)) { s += c.v; arr.push(c); } }); if (Math.abs(s - need) < 1e-6) pick = arr; }
        if (!pick) { log.push('sin combinación'); continue; }
        pick.sort((a, b) => b.v - a.v);
        for (const c of pick) { tp(c.x, c.y); await w(90); }
      } else if (m.area === 'len') {
        const tl = d.tiles.find((t) => !t.used && t.ch === d.letters[d.prog]);
        if (tl) { tp(tl.x, tl.y); await w(60); m.onLand(); } else log.push('falta letra ' + d.letters[d.prog]);
      } else if (m.area === 'med') {
        const it = d.items.find((i) => i.state === 'ground');
        if (it) { tp(it.x, it.y); await w(120); const z = d.zones[it.z]; tp(z.x + z.w / 2, z.y + z.h / 2); await w(120); }
      } else if (m.area === 'ing') {
        const b = d.builds[d.target]; tp(b.x, b.y + 34); await w(80); EZ.controls.action = true;
      } else { G.mechDone(); m.done = true; log.push('EF: minijuegos saltados'); }
    }
    return { log: log.slice(-6), pasos: log.length, puntos: G.run.score, vidas: G.run.lives, gana: G.run.won, ok: G.run.ok, ko: G.run.ko, seg: Math.round(G.run.time) };
  }
  return { questions, play, sol };
})();
