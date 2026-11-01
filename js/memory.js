/* ==========================================================
   EUREKA DROP · memory.js
   Minijuego «Memoria Eureka»: parejas de cartas (palabra ↔ significado,
   operación ↔ resultado…) con el contenido del curso del alumno.
   · Sin tiempo límite, jugable con teclado, ratón y táctil.
   · Las parejas salen de las preguntas de «relacionar» del curso
     (y, en Matemáticas, de operaciones generadas al momento).
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, I = EZ.icons;
  const $ = U.$;
  const header = (title) => `<header class="scr-head"><button class="btn btn-icon" type="button" data-go="menu" aria-label="Volver">${I.back}</button><h1 class="scr-title">${title}</h1><div class="wallet">${I.coin}<b>${EZ.save.wallet.coins}</b>${I.bulb}<b>${EZ.save.wallet.hints}</b></div></header>`;

  /** Número de parejas según el curso. */
  const pairsFor = (curso) => (curso <= 2 ? 3 : curso <= 4 ? 4 : 6);

  /** Reúne parejas del área y del curso (únicas por texto a ambos lados). */
  function collectPairs(area, n) {
    const curso = EZ.curso();
    const out = [], seenL = new Set(), seenR = new Set();
    const add = (l, r) => {
      const a = String(l), b = String(r);
      if (a === b || seenL.has(a) || seenR.has(b) || seenL.has(b) || seenR.has(a)) return;
      seenL.add(a); seenR.add(b); out.push([a, b]);
    };
    if (area === 'mat') {
      let guard = 0;
      while (out.length < n && guard++ < 80) {
        const q = EZ.questions.genMath(Math.min(curso, 5), U.clamp(1 + (guard % 2), 1, 3), Math.random);
        add(q.enunciado.replace(/^Calcula:? /, '').replace(/\.$/, ''), q.respuestas[0]);
      }
      return out;
    }
    // Primero parejas del curso; si no bastan, de cursos inferiores (nunca superiores).
    const all = EZ.questions.banks[area].preguntas.filter((q) => q.tipo === 'match' && EZ.questions.cursosDe(q)[0] <= curso);
    const own = U.shuffle(all.filter((q) => { const c = EZ.questions.cursosDe(q); return curso >= c[0] && curso <= c[1]; }));
    const lower = U.shuffle(all.filter((q) => EZ.questions.cursosDe(q)[1] < curso)).sort((x, y) => EZ.questions.cursosDe(y)[1] - EZ.questions.cursosDe(x)[1]);
    const pool = own.concat(lower);
    pool.forEach((q) => U.shuffle(q.pares.slice()).slice(0, 3).forEach((p) => { if (out.length < n * 3) add(p[0], p[1]); }));
    return U.shuffle(out.slice(0, Math.max(n * 2, 8))).slice(0, n);
  }

  EZ.ui.render.memoria = function (el, arg) {
    const st = EZ.ui._mem = EZ.ui._mem || { area: 'len' };
    if (arg && arg.area) st.area = arg.area;
    if (arg && arg.play) { play(el, st.area); return; }
    el.innerHTML = header('Memoria Eureka') + `<p class="lead">Encuentra las parejas: palabra y significado, operación y resultado… No hay prisa ni límite de tiempo. Ganas monedas al terminar.</p>
      <p class="muted small center">Tu curso: <b>${EZ.CURSO_NAMES[EZ.curso()]}</b> · ${pairsFor(EZ.curso())} parejas</p>
      <div class="area-grid mem-areas" role="radiogroup" aria-label="Materia">${EZ.AREAS.map((a) => `<button class="area-card" type="button" role="radio" data-a="${a.id}" style="--ac:${a.color}"><b>${a.subject}</b><small>${a.island}</small></button>`).join('')}</div>
      <button class="btn btn-play btn-xl" id="mem-go" type="button">${I.play}<span>¡A JUGAR!</span></button>`;
    el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { EZ.audio.play('click'); EZ.ui.go(b.getAttribute('data-go')); }));
    const sync = () => U.$$('.area-card', el).forEach((b) => { const on = b.getAttribute('data-a') === st.area; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    U.$$('.area-card', el).forEach((b) => b.addEventListener('click', () => { st.area = b.getAttribute('data-a'); EZ.audio.play('click'); sync(); }));
    $('#mem-go', el).addEventListener('click', () => { EZ.audio.play('click'); play(el, st.area); });
    sync();
  };

  function play(el, area) {
    const n = pairsFor(EZ.curso());
    const pairs = collectPairs(area, n);
    const ar = EZ.area(area);
    if (pairs.length < 3) {
      el.innerHTML = header('Memoria Eureka') + '<p class="lead">Todavía no hay suficientes parejas de esta materia para tu curso. ¡Prueba con otra!</p><button class="btn btn-go" id="mem-back" type="button">Elegir otra materia</button>';
      $('#mem-back', el).addEventListener('click', () => EZ.ui.go('memoria'));
      el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => EZ.ui.go(b.getAttribute('data-go'))));
      return;
    }
    const cards = U.shuffle(pairs.flatMap((p, i) => [{ id: i, side: 0, text: p[0] }, { id: i, side: 1, text: p[1] }]));
    let open = [], matched = 0, tries = 0, lock = false;
    el.innerHTML = header('Memoria · ' + ar.subject) + `<p class="center mem-status" id="mem-status" aria-live="polite">Parejas: 0/${pairs.length} · Intentos: 0</p>
      <div class="mem-grid" style="--cols:${cards.length <= 6 ? 3 : cards.length <= 8 ? 4 : 4}" role="group" aria-label="Cartas">${cards.map((c, k) => `<button type="button" class="mem-card" data-k="${k}" aria-label="Carta ${k + 1}, boca abajo"><span class="mem-front">?</span><span class="mem-back">${U.esc(c.text)}</span></button>`).join('')}</div>
      <div class="mem-end" id="mem-end" hidden></div>`;
    el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { EZ.audio.play('click'); EZ.ui.go(b.getAttribute('data-go')); }));
    const status = $('#mem-status', el);
    const btns = U.$$('.mem-card', el);
    const label = (b, k, state) => b.setAttribute('aria-label', `Carta ${k + 1}, ${state === 'down' ? 'boca abajo' : (state === 'ok' ? 'emparejada: ' : 'boca arriba: ') + cards[k].text}`);
    btns.forEach((b) => b.addEventListener('click', () => {
      const k = +b.getAttribute('data-k');
      if (lock || b.classList.contains('up') || b.classList.contains('done')) return;
      b.classList.add('up'); label(b, k, 'up'); EZ.audio.play('click');
      open.push(k);
      if (open.length < 2) return;
      tries++;
      const [x, y] = open; open = [];
      if (cards[x].id === cards[y].id && cards[x].side !== cards[y].side) {
        [x, y].forEach((i) => { btns[i].classList.remove('up'); btns[i].classList.add('done'); label(btns[i], i, 'ok'); });
        matched++; EZ.audio.play('coin');
        status.textContent = `¡Pareja! Parejas: ${matched}/${pairs.length} · Intentos: ${tries}`;
        if (matched === pairs.length) finish();
      } else {
        lock = true; EZ.audio.play('wrong');
        status.textContent = `Esas no son pareja. Parejas: ${matched}/${pairs.length} · Intentos: ${tries}`;
        setTimeout(() => { [x, y].forEach((i) => { btns[i].classList.remove('up'); label(btns[i], i, 'down'); }); lock = false; }, 1100);
      }
    }));
    function finish() {
      const bonus = tries <= pairs.length + 1 ? 20 : tries <= pairs.length * 2 ? 10 : 0;
      const coins = pairs.length * 8 + bonus;
      EZ.save.wallet.coins += coins; EZ.save.wallet.totalCoins += coins;
      EZ.store.log('star', `Memoria Eureka (${ar.subject}): ${pairs.length} parejas en ${tries} intentos, +${coins} monedas`);
      EZ.store.persist(); EZ.audio.play('chest');
      const end = $('#mem-end', el);
      end.hidden = false;
      end.innerHTML = `<h2>¡Lo conseguiste!</h2><p>${pairs.length} parejas en <b>${tries}</b> intentos. <b>+${coins}</b> monedas ${bonus ? '(con bonus de memoria)' : ''}</p>
        <button class="btn btn-go" id="mem-again" type="button">Otra partida</button> <button class="btn btn-ghost" id="mem-other" type="button">Cambiar de materia</button>`;
      $('#mem-again', end).addEventListener('click', () => { EZ.audio.play('click'); play(el, area); });
      $('#mem-other', end).addEventListener('click', () => { EZ.audio.play('click'); EZ.ui.go('memoria'); });
      $('#mem-again', end).focus();
    }
    setTimeout(() => { const f = btns[0]; if (f) f.focus({ preventScroll: true }); }, 60);
  }
})(window.EZ);
