/* ==========================================================
   EUREKA DROP · ui.js
   Pantallas y menús: portada, mapa de historia, modo rápido,
   desafío del día, personaje y taquilla, diario, ajustes,
   resultados, revisión de errores, diálogos, pausa y avisos.
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util, I = EZ.icons, ART = EZ.art;
  const UI = (EZ.ui = { current: 'splash' });
  const $ = U.$;

  /* ================= Navegación ================= */
  UI.go = function (name, arg) {
    U.$$('.screen').forEach((s) => s.classList.remove('show'));
    const el = $('#scr-' + name);
    UI.current = name;
    if (UI.render[name]) UI.render[name](el, arg);
    el.classList.add('show');
    el.scrollTop = 0;
    document.body.classList.remove('in-game');
    $('#game').classList.remove('show');
    UI.bg.start();
    EZ.audio.music(name === 'avatar' ? 'avatar' : name === 'splash' ? 'title' : 'menu');
    EZ.audio.play('whoosh');
    setTimeout(() => { const f = el.querySelector('[data-autofocus]') || el.querySelector('button, [tabindex="0"]'); if (f) f.focus({ preventScroll: true }); }, 60);
  };
  UI.showGameScreen = function () {
    U.$$('.screen').forEach((s) => s.classList.remove('show'));
    UI.current = 'game';
    UI.bg.stop();
    $('#game').classList.add('show');
    $('#hud').hidden = false; $('#boss-bar').hidden = true;
    document.body.classList.add('in-game');
    EZ.controls.applyTouchSetting();
  };
  const header = (title, back = 'menu') => `<header class="scr-head"><button class="btn btn-icon" type="button" data-go="${back}" aria-label="Volver">${I.back}</button><h1 class="scr-title">${title}</h1><div class="wallet">${I.coin}<b>${EZ.save.wallet.coins}</b>${I.bulb}<b>${EZ.save.wallet.hints}</b></div></header>`;
  function bindGo(el) { U.$$('[data-go]', el).forEach((b) => b.addEventListener('click', () => { EZ.audio.play('click'); UI.go(b.getAttribute('data-go')); })); }

  UI.render = {};

  /** Autoría y licencia (se muestra bajo la portada, en créditos y en el menú). */
  UI.legalHTML = function () {
    return `<div class="legal"><a class="cc-badges" href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es" target="_blank" rel="license noopener" aria-label="Licencia Creative Commons Reconocimiento, NoComercial, SinObraDerivada 4.0">${I.ccCC}${I.ccBY}${I.ccNC}${I.ccND}</a>
      <p><b>Diseñado por David OZC</b> · David 2026 · CC BY-NC-ND 4.0 (Reconocimiento · NoComercial · SinObraDerivada)<br>Uso gratuito en centros educativos.</p></div>`;
  };

  /* ================= Créditos ================= */
  UI.render.credits = function (el) {
    el.innerHTML = header('Créditos') + `<div class="panel credits">
      <div class="logo"><span class="logo-eureka">EUREKA</span><span class="logo-drop">DROP</span></div>
      <h2>Diseñado por David OZC</h2>
      <p>Idea, diseño del juego, programación, gráficos, música, efectos, textos y bancos de preguntas: <b>David OZC</b> (2026).</p>
      <p class="muted">Todos los gráficos y sonidos se generan por código. No se usan personajes, nombres, música ni recursos de ninguna otra franquicia.</p>
      ${UI.legalHTML()}
      <h3>Qué significa la licencia</h3>
      <ul class="lic-list"><li><b>Reconocimiento (BY):</b> hay que citar a David OZC como autor.</li><li><b>NoComercial (NC):</b> no se puede usar con fines comerciales. El uso en centros educativos es gratuito.</li><li><b>SinObraDerivada (ND):</b> se puede compartir el juego tal cual, pero no publicar versiones modificadas.</li></ul>
      <h3>Tus datos personales</h3>
      <p>El juego no envía nada a internet. El progreso se guarda solo en este dispositivo. Para proteger la <b>privacidad de los datos personales</b>, el nombre del jugador son <b>solo 6 letras como máximo</b> (unas iniciales o un apodo): no escribas tu nombre real ni tus apellidos.</p>
      <p class="muted small">Inspirado de forma general en los videojuegos cartoon de aventuras. Versión 1.1.</p></div>`;
    bindGo(el);
  };

  /* ================= Menú principal ================= */
  UI.render.menu = function (el) {
    const S = EZ.save;
    const dailyNew = !EZ.progression.dailyDone();
    el.innerHTML = `
      <div class="menu-wrap">
        <div class="menu-left">
          <div class="logo" aria-label="Eureka Drop"><span class="logo-eureka">EUREKA</span><span class="logo-drop">DROP</span></div>
          <p class="menu-tag">${S.profile.name ? '¡Hola, ' + U.esc(S.profile.name) + '! ' : ''}El Borrón sigue suelto. Historia completada: <b>${EZ.progression.storyPercent()} %</b></p>
          <button class="btn btn-ghost curso-chip" id="m-curso" type="button" aria-label="Cambiar de curso">${I.star}<span>${S.settings.curso ? 'Curso: ' + EZ.CURSO_NAMES[S.settings.curso] : 'Elige tu curso'}</span></button>
          <button class="btn btn-play btn-xl" id="m-play" type="button" data-autofocus>${I.play}<span>${S.story.introSeen ? 'CONTINUAR AVENTURA' : 'JUGAR'}</span></button>
          <div class="menu-grid">
            <button class="mbtn" data-go="map" type="button">${I.map}<span>Modo Historia</span></button>
            <button class="mbtn" data-go="quick" type="button">${I.bolt}<span>Modo Rápido</span></button>
            <button class="mbtn" data-go="daily" type="button">${I.calendar}<span>Desafío del Día</span>${dailyNew ? '<em class="badge-new">¡NUEVO!</em>' : ''}</button>
            <button class="mbtn" data-go="memoria" type="button">${I.star}<span>Memoria Eureka</span></button>
            <button class="mbtn" data-go="avatar" type="button">${I.user}<span>Personaje</span></button>
            <button class="mbtn" data-go="stats" type="button">${I.chart}<span>Estadísticas</span></button>
            <button class="mbtn" data-go="diary" type="button">${I.book}<span>Diario</span></button>
          </div>
          <div class="menu-foot">
            <span class="foot-btns"><button class="btn btn-ghost" data-go="settings" type="button">${I.gear}<span>Ajustes</span></button><button class="btn btn-ghost" data-go="credits" type="button">${I.star}<span>Créditos</span></button></span>
            <span class="wallet">${I.coin}<b>${S.wallet.coins}</b>${I.bulb}<b>${S.wallet.hints}</b>${I.flame}<b>${EZ.progression.dailyStreak()}</b></span>
          </div>
          <p class="menu-author">Diseñado por <b>David OZC</b> · CC BY-NC-ND 4.0</p>
        </div>
        <div class="menu-right"><canvas id="menu-hero" width="360" height="420" aria-hidden="true"></canvas></div>
      </div>`;
    bindGo(el);
    $('#m-curso', el).addEventListener('click', () => { EZ.audio.play('click'); UI.go('curso'); });
    $('#m-play', el).addEventListener('click', async () => {
      EZ.audio.play('click');
      if (!EZ.save.settings.curso) { UI.go('curso', { play: true }); return; }
      if (!EZ.save.story.introSeen) {
        await UI.dialog(EZ.story.intro);
        EZ.save.story.introSeen = true; EZ.store.persist();
        UI.go('avatar', { then: 'map' });
      } else UI.go('map');
    });
    UI.heroCanvas($('#menu-hero', el), 1.9);
  };

  /* ================= Elegir curso ================= */
  const CURSO_INFO = [
    '', 'Números hasta 99, palabras sencillas y animales. Todo se puede escuchar.',
    'Sumas y restas, frases cortas y el cuerpo humano. Todo se puede escuchar.',
    'Tablas, lectura y la naturaleza. Muchas ayudas.',
    'Multiplicar y dividir, textos y el entorno. Algunas ayudas.',
    'Fracciones, gramática y la historia.', 'Decimales, porcentajes y retos más largos.'
  ];
  UI.render.curso = function (el, arg) {
    const cur = EZ.save.settings.curso || 0;
    el.innerHTML = header('¿En qué curso estás?') + `<p class="lead">Las preguntas y la dificultad se ajustan a tu curso. Puedes cambiarlo cuando quieras. Si te resulta fácil o difícil, prueba el curso de arriba o de abajo.</p>
      <div class="curso-grid" role="radiogroup" aria-label="Curso">${[1, 2, 3, 4, 5, 6].map((c) => `<button type="button" role="radio" class="curso-btn ${c === cur ? 'sel' : ''}" aria-checked="${c === cur}" data-c="${c}"><b>${c}.º</b><span>Primaria</span><small>${CURSO_INFO[c]}</small></button>`).join('')}</div>
      <p class="muted small center">Cursos 1.º a 3.º: más vidas, pistas gratis, enemigos más lentos, sin prisas y lectura en voz alta activada.</p>`;
    bindGo(el);
    U.$$('.curso-btn', el).forEach((b) => b.addEventListener('click', async () => {
      const c = +b.getAttribute('data-c');
      EZ.save.settings.curso = c;
      EZ.save.settings.readAloud = c <= 2;
      EZ.store.persist(); EZ.audio.play('coin');
      UI.toast('Curso elegido: ' + EZ.CURSO_NAMES[c], 'good', 1800);
      if (arg && arg.play) {
        if (!EZ.save.story.introSeen) { await UI.dialog(EZ.story.intro); EZ.save.story.introSeen = true; EZ.store.persist(); UI.go('avatar', { then: 'map' }); }
        else UI.go('map');
      } else UI.go('menu');
    }));
  };

  /** Personaje animado en un lienzo (menú y editor). */
  UI.heroCanvas = function (cv, sc) {
    const ctx = cv.getContext('2d');
    let t = 0, lastT = performance.now();
    const loop = (now) => {
      if (!cv.isConnected) return;
      t += (now - lastT) / 1000; lastT = now;
      ctx.clearRect(0, 0, cv.width, cv.height);
      const cx = cv.width / 2, cy = cv.height * 0.78;
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 150);
      g.addColorStop(0, 'rgba(125,249,255,0.35)'); g.addColorStop(1, 'rgba(125,249,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#3ddc97'; ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(cx, cy + 6, 120, 30, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6e5c56'; ctx.beginPath(); ctx.moveTo(cx - 118, cy + 10); ctx.quadraticCurveTo(cx, cy + 140, cx + 118, cy + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
      const dir = ['down', 'right', 'down', 'left'][Math.floor(t / 2.5) % 4];
      ART.drawPlayer(ctx, 0, 0, Math.max(0, Math.sin(t * 2.2) * 16 - 10), dir, t, EZ.save.profile.avatar, { moving: false, blink: (t % 3.5) < 0.12 });
      ctx.restore();
      ART.drawChispa(ctx, cx + 100, cy - 170, t, 1.6);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  /* ================= Mapa del Modo Historia ================= */
  const ISLE_POS = [[150, 150], [420, 110], [640, 210], [520, 400], [230, 380]];
  UI.render.map = function (el, sel) {
    const S = EZ.save, PR = EZ.progression;
    const selected = sel && sel.area ? sel.area : (UI._mapSel || EZ.AREAS.find((a, i) => PR.islandUnlocked(i) && S.story.islands[a.id] < 3)?.id || 'mat');
    UI._mapSel = selected;
    let svg = `<svg class="map-svg" viewBox="0 0 800 520" role="group" aria-label="Archipiélago Eureka">
      <defs><radialGradient id="sea" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#2b78c2"/><stop offset="1" stop-color="#14306b"/></radialGradient></defs>
      <rect width="800" height="520" rx="26" fill="url(#sea)"/>`;
    for (let i = 0; i < 5; i++) { const [x1, y1] = ISLE_POS[i], [x2, y2] = ISLE_POS[(i + 1) % 5]; svg += `<path d="M${x1} ${y1} Q400 260 ${x2} ${y2}" stroke="rgba(255,255,255,.25)" stroke-width="4" stroke-dasharray="10 10" fill="none"/>`; }
    EZ.AREAS.forEach((a, i) => {
      const [x, y] = ISLE_POS[i], open = PR.islandUnlocked(i), ph = S.story.islands[a.id];
      svg += `<g class="isle ${open ? '' : 'locked'} ${selected === a.id ? 'sel' : ''}" data-area="${a.id}" tabindex="0" role="button" aria-label="${a.island}, ${a.subject}. ${open ? 'Fases superadas: ' + ph + ' de 3' : 'Bloqueada'}">
        <ellipse cx="${x}" cy="${y + 26}" rx="92" ry="34" fill="rgba(0,0,0,.25)"/>
        <ellipse cx="${x}" cy="${y + 10}" rx="86" ry="40" fill="#e2c98c" stroke="#1b1446" stroke-width="4"/>
        <ellipse cx="${x}" cy="${y}" rx="76" ry="34" fill="${open ? a.color : '#59507f'}" stroke="#1b1446" stroke-width="4"/>
        <text x="${x}" y="${y + 6}" text-anchor="middle" class="isle-name">${a.island}</text>
        <g transform="translate(${x - 36} ${y + 26})">${[0, 1, 2].map((k) => `<path transform="translate(${k * 26} 0) scale(.9)" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="${k < ph ? '#ffd23f' : '#2a2350'}" stroke="#1b1446" stroke-width="1.5"/>`).join('')}</g>
        ${open ? '' : `<g transform="translate(${x - 14} ${y - 70}) scale(1.2)">${I.lock.replace('<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">', '').replace('</svg>', '')}</g>`}
      </g>`;
    });
    const fin = PR.finalUnlocked();
    svg += `<g class="isle final ${fin ? '' : 'locked'} ${selected === 'final' ? 'sel' : ''}" data-area="final" tabindex="0" role="button" aria-label="Nube del Borrón. ${fin ? 'Disponible' : 'Bloqueada: libera las cinco islas'}">
      <circle cx="400" cy="270" r="50" fill="${S.story.final ? '#c9d2ff' : '#22164f'}" stroke="#1b1446" stroke-width="4"/>
      <circle cx="370" cy="250" r="30" fill="${S.story.final ? '#c9d2ff' : '#22164f'}"/><circle cx="430" cy="252" r="32" fill="${S.story.final ? '#c9d2ff' : '#22164f'}"/>
      <circle cx="385" cy="262" r="7" fill="#ff4f8b"/><circle cx="415" cy="262" r="7" fill="#ff4f8b"/>
      <text x="400" y="340" text-anchor="middle" class="isle-name">Nube del Borrón</text></g>`;
    svg += '</svg>';
    el.innerHTML = header('Modo Historia') + `<div class="map-wrap"><div class="map-box">${svg}</div><aside class="map-panel" id="map-panel" aria-live="polite"></aside></div>
      <div class="frag-row">${EZ.AREAS.map((a) => `<span class="frag ${S.story.islands[a.id] >= 3 ? 'got' : ''}" title="${a.fragment}">${I.gem}<small>${a.fragment}</small></span>`).join('')}</div>`;
    bindGo(el);
    const panel = $('#map-panel', el);
    const showPanel = (id) => {
      UI._mapSel = id;
      U.$$('.isle', el).forEach((g) => g.classList.toggle('sel', g.getAttribute('data-area') === id));
      if (id === 'final') {
        panel.innerHTML = `<h2>Nube del Borrón</h2><p>El enemigo final. Necesitas los cinco Fragmentos Eureka (fase 3 de cada isla).</p>
          ${fin ? `<button class="btn btn-play" type="button" id="p-final">${I.play}<span>¡Combate final!</span></button>` : `<p class="locked-msg">${I.lock} Fragmentos: ${EZ.AREAS.filter((a) => S.story.islands[a.id] >= 3).length}/5</p>`}`;
        if (fin) $('#p-final', panel).addEventListener('click', () => EZ.game.start({ mode: 'final', area: 'final', level: 3 }));
        return;
      }
      const i = EZ.AREAS.findIndex((a) => a.id === id), a = EZ.AREAS[i], open = PR.islandUnlocked(i), ph = S.story.islands[id];
      let html = `<h2 style="color:${a.color}">${a.island}</h2><p class="muted">${a.subject} · Guardián: <b>${a.guardian}</b></p>`;
      if (!open) html += `<p class="locked-msg">${I.lock} Supera la fase 1 de ${EZ.AREAS[i - 1].island} para desbloquearla.</p>`;
      else {
        html += '<div class="phase-list">';
        for (let lv = 1; lv <= 3; lv++) {
          const can = lv <= ph + 1, done = lv <= ph;
          html += `<button class="phase ${done ? 'done' : ''}" type="button" data-lv="${lv}" ${can ? '' : 'disabled'}>
            <span class="ph-n">Fase ${lv}</span><span class="ph-name">${EZ.LEVEL_NAMES[lv]}</span>
            <span class="ph-st">${done ? I.star : can ? I.play : I.lock}</span></button>`;
        }
        html += '</div>';
        const best = [1, 2, 3].map((lv) => S.best[id + '-' + lv] || 0);
        html += `<p class="muted small">Récords: ${best.map((b, k) => EZ.LEVEL_NAMES[k + 1] + ' ' + U.fmtNum(b)).join(' · ')}</p>`;
      }
      panel.innerHTML = html;
      U.$$('.phase', panel).forEach((b) => b.addEventListener('click', () => { EZ.audio.play('click'); EZ.game.start({ mode: 'story', area: id, level: +b.getAttribute('data-lv') }); }));
    };
    U.$$('.isle', el).forEach((g) => {
      const go = () => { EZ.audio.play('click'); showPanel(g.getAttribute('data-area')); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    showPanel(selected);
  };

  /* ================= Modo Rápido ================= */
  UI.render.quick = function (el) {
    let area = UI._qa || 'mat', lv = UI._ql || 1;
    el.innerHTML = header('Modo Rápido') + `<p class="lead">Elige un territorio y un nivel. Partida de 5-10 minutos.</p>
      <div class="area-grid" role="radiogroup" aria-label="Territorio">${EZ.AREAS.map((a) => `<button class="area-card" type="button" role="radio" data-a="${a.id}" style="--ac:${a.color}">
        <canvas width="160" height="110" data-art="${a.id}" aria-hidden="true"></canvas><b>${a.subject}</b><small>${a.island}</small><small class="q-count">${EZ.questions.countCurso(a.id, EZ.curso())} retos de tu curso</small></button>`).join('')}</div>
      <div class="lv-row" role="radiogroup" aria-label="Nivel">${[1, 2, 3].map((k) => `<button class="lv-btn" type="button" role="radio" data-l="${k}"><b>${k}</b> ${EZ.LEVEL_NAMES[k]}</button>`).join('')}</div>
      <button class="btn btn-play btn-xl" id="q-go" type="button">${I.play}<span>¡DROP!</span></button>
      <p class="muted small center" id="q-best"></p>`;
    bindGo(el);
    const sync = () => {
      U.$$('.area-card', el).forEach((b) => { const on = b.getAttribute('data-a') === area; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
      U.$$('.lv-btn', el).forEach((b) => { const on = +b.getAttribute('data-l') === lv; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
      $('#q-best', el).textContent = 'Tu récord aquí: ' + U.fmtNum(EZ.save.best[area + '-' + lv] || 0) + ' · Récord de Rayo: ' + U.fmtNum(EZ.story.rival(area, lv));
      UI._qa = area; UI._ql = lv;
    };
    U.$$('.area-card', el).forEach((b) => b.addEventListener('click', () => { area = b.getAttribute('data-a'); EZ.audio.play('click'); sync(); }));
    U.$$('.lv-btn', el).forEach((b) => b.addEventListener('click', () => { lv = +b.getAttribute('data-l'); EZ.audio.play('click'); sync(); }));
    $('#q-go', el).addEventListener('click', () => EZ.game.start({ mode: 'quick', area, level: lv }));
    U.$$('canvas[data-art]', el).forEach((c) => drawAreaThumb(c, c.getAttribute('data-art')));
    sync();
  };
  function drawAreaThumb(cv, id) {
    const ctx = cv.getContext('2d'), th = ART.THEMES[id];
    ctx.fillStyle = th.floorA; ctx.fillRect(0, 0, 160, 110);
    ctx.fillStyle = th.wallTop; ctx.fillRect(0, 0, 160, 26); ctx.fillStyle = th.wallFace; ctx.fillRect(0, 26, 160, 10);
    th.props.slice(0, 3).forEach((p, i) => ART.drawProp(ctx, p, 30 + i * 50, 92, 0));
  }

  /* ================= Desafío del Día ================= */
  UI.render.daily = function (el) {
    const d = EZ.save.daily, done = EZ.progression.dailyDone();
    const days = [];
    for (let k = 6; k >= 0; k--) { const dt = new Date(); dt.setDate(dt.getDate() - k); const s = U.dateStr(dt); days.push({ s, ok: d.done.includes(s), label: ['D', 'L', 'M', 'X', 'J', 'V', 'S'][dt.getDay()] }); }
    el.innerHTML = header('Desafío del Día') + `<div class="panel daily-panel">
      <div class="daily-date">${I.calendar}<b>${U.prettyDate(U.todayStr())}</b></div>
      <p>Una misión especial que mezcla retos de <b>las cinco áreas</b>. Cambia cada día (según la fecha de este dispositivo).</p>
      <div class="week">${days.map((x) => `<span class="day ${x.ok ? 'ok' : ''}" title="${x.s}"><small>${x.label}</small>${x.ok ? I.check : '<i></i>'}</span>`).join('')}</div>
      <div class="kpis"><div><b>${EZ.progression.dailyStreak()}</b><small>días seguidos</small></div><div><b>${d.bestStreak}</b><small>mejor racha</small></div><div><b>${U.fmtNum(d.bestScore)}</b><small>mejor puntuación</small></div><div><b>${d.done.length}</b><small>completados</small></div></div>
      <p class="${done ? 'ok-msg' : 'muted'}">${done ? I.check + ' Recompensa de hoy conseguida. Puedes seguir practicando.' : 'Recompensa: +150 monedas, +1 pista y la racha diaria.'}</p>
      <div class="lv-row" role="radiogroup" aria-label="Nivel">${[1, 2, 3].map((k) => `<button class="lv-btn ${k === (UI._dl || 2) ? 'sel' : ''}" type="button" data-l="${k}"><b>${k}</b> ${EZ.LEVEL_NAMES[k]}</button>`).join('')}</div>
      <button class="btn btn-play btn-xl" id="d-go" type="button">${I.play}<span>${done ? 'PRACTICAR' : '¡JUGAR EL DESAFÍO!'}</span></button></div>`;
    bindGo(el);
    U.$$('.lv-btn', el).forEach((b) => b.addEventListener('click', () => { UI._dl = +b.getAttribute('data-l'); U.$$('.lv-btn', el).forEach((x) => x.classList.toggle('sel', x === b)); }));
    $('#d-go', el).addEventListener('click', () => EZ.game.start({ mode: 'daily', area: 'mix', level: UI._dl || 2 }));
  };

  /* ================= Personaje y taquilla ================= */
  UI.render.avatar = function (el, arg) {
    const S = EZ.save, av = S.profile.avatar;
    const swatches = (key, list) => list.map((c, i) => `<button class="sw ${av[key] === i ? 'sel' : ''}" type="button" data-k="${key}" data-v="${i}" style="--c:${c}" aria-label="${key} ${i + 1}" aria-pressed="${av[key] === i}"></button>`).join('');
    const accs = ART.ACCS.map((a) => {
      const owned = S.owned.includes(a.id);
      return `<button class="acc ${av.acc === a.id ? 'sel' : ''} ${owned ? '' : 'locked'}" type="button" data-acc="${a.id}" aria-pressed="${av.acc === a.id}">
        <span>${U.esc(a.name)}</span>${owned ? '' : `<small>${a.price ? I.coin + a.price : I.lock + ' ' + U.esc(a.how)}</small>`}</button>`;
    }).join('');
    el.innerHTML = header('Tu personaje', arg && arg.then ? arg.then : 'menu') + `<div class="avatar-wrap">
      <div class="avatar-preview"><canvas id="av-cv" width="300" height="360" aria-label="Vista previa del personaje"></canvas></div>
      <div class="avatar-opts">
        <label class="field"><span>Tu nombre o apodo, hasta 6 letras (opcional, para el diploma)</span><input id="av-name" class="name3" type="text" maxlength="6" value="${U.esc(S.profile.name)}" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="DAVID" aria-describedby="av-priv"></label>
        <p class="privacy" id="av-priv">${I.lock} Solo hasta 6 letras (iniciales o un apodo) para proteger la privacidad de tus datos personales. No escribas tu nombre real ni apellidos.</p>
        <div class="opt-row"><h3>Piel</h3><div class="sws">${swatches('skin', ART.SKINS)}</div></div>
        <div class="opt-row"><h3>Peinado</h3><div class="chips-row">${ART.HAIRS.map((h, i) => `<button class="chipbtn ${av.hair === i ? 'sel' : ''}" type="button" data-hair="${i}" aria-pressed="${av.hair === i}">${h}</button>`).join('')}</div></div>
        <div class="opt-row"><h3>Color de pelo</h3><div class="sws">${swatches('hairColor', ART.HAIR_COLORS)}</div></div>
        <div class="opt-row"><h3>Traje</h3><div class="sws">${swatches('outfit', ART.OUTFITS)}</div></div>
        <div class="opt-row"><h3>Accesorio · Taquilla</h3><p class="muted small">Los accesorios se ganan con logros o con monedas del juego. Nada se compra con dinero real.</p><div class="acc-grid">${accs}</div></div>
        <button class="btn btn-play" id="av-ok" type="button">${I.check}<span>${arg && arg.then ? '¡Listo, a la aventura!' : 'Guardar'}</span></button>
      </div></div>`;
    bindGo(el);
    UI.heroCanvas($('#av-cv', el), 2.6);
    const save = () => { EZ.store.persist(); };
    U.$$('.sw', el).forEach((b) => b.addEventListener('click', () => { av[b.getAttribute('data-k')] = +b.getAttribute('data-v'); EZ.audio.play('click'); save(); refresh(); }));
    U.$$('[data-hair]', el).forEach((b) => b.addEventListener('click', () => { av.hair = +b.getAttribute('data-hair'); EZ.audio.play('click'); save(); refresh(); }));
    U.$$('[data-acc]', el).forEach((b) => b.addEventListener('click', async () => {
      const id = b.getAttribute('data-acc'), a = ART.ACCS.find((x) => x.id === id);
      if (!S.owned.includes(id)) {
        if (!a.price) { UI.toast('Se desbloquea con un logro: ' + a.how, 'bad'); return; }
        if (S.wallet.coins < a.price) { UI.toast(`Te faltan ${a.price - S.wallet.coins} monedas.`, 'bad'); return; }
        const ok = await UI.confirm(`¿Canjear ${a.price} monedas del juego por «${a.name}»?`);
        if (!ok) return;
        S.wallet.coins -= a.price; S.owned.push(id); EZ.audio.play('chest');
      }
      av.acc = id; EZ.audio.play('click'); save(); refresh();
    }));
    $('#av-name', el).addEventListener('input', (e) => { S.profile.name = U.initials(e.target.value); e.target.value = S.profile.name; save(); });
    $('#av-ok', el).addEventListener('click', () => { save(); UI.go(arg && arg.then ? arg.then : 'menu'); });
    function refresh() { const y = el.scrollTop; UI.render.avatar(el, arg); el.scrollTop = y; }
  };

  /* ================= Diario de aventuras ================= */
  UI.render.diary = function (el, tab) {
    const S = EZ.save;
    tab = tab || UI._dtab || 'terr';
    UI._dtab = tab;
    const tabs = [['terr', 'Territorios'], ['logros', 'Logros'], ['obj', 'Objetos'], ['punt', 'Puntuaciones'], ['hist', 'Bitácora']];
    let body = '';
    if (tab === 'terr') {
      body = `<div class="terr-list">${EZ.AREAS.map((a) => `<div class="terr ${S.story.visited.includes(a.id) ? '' : 'dim'}" style="--ac:${a.color}"><b>${a.island}</b><span>${a.subject}</span>
        <span class="stars">${[1, 2, 3].map((k) => (k <= S.story.islands[a.id] ? I.star : I.starEmpty)).join('')}</span><small>${S.story.islands[a.id] >= 3 ? a.fragment + ' recuperado' : S.story.visited.includes(a.id) ? 'Visitada' : 'Sin explorar'}</small></div>`).join('')}</div>
        <p class="center">Historia: <b>${EZ.progression.storyPercent()} %</b> ${S.story.final ? '· ¡Borrón derrotado!' : ''}</p>`;
    } else if (tab === 'logros') {
      body = `<p class="center">${Object.keys(S.achievements).length} de ${EZ.progression.ACH.length} logros</p><div class="ach-grid">${EZ.progression.ACH.map((a) => { const got = S.achievements[a.id]; return `<div class="ach ${got ? 'got' : ''}">${got ? I.trophy : I.lock}<b>${a.name}</b><small>${a.desc}</small>${got ? `<em>${U.prettyDate(got)}</em>` : ''}</div>`; }).join('')}</div>`;
    } else if (tab === 'obj') {
      const all = Object.keys(EZ.story.relics).flatMap((k) => EZ.story.relics[k]);
      body = `<p class="center">Reliquias: ${S.collectibles.length} de ${all.length}. Están en los cofres dorados de las zonas secretas.</p><div class="ach-grid">${all.map((r) => `<div class="ach ${S.collectibles.includes(r) ? 'got' : ''}">${S.collectibles.includes(r) ? I.medal : I.lock}<b>${S.collectibles.includes(r) ? r : '???'}</b></div>`).join('')}</div>`;
    } else if (tab === 'punt') {
      body = `<table class="tbl"><thead><tr><th>Territorio</th><th>Explorador</th><th>Aventurero</th><th>Leyenda</th></tr></thead><tbody>${EZ.AREAS.map((a) => `<tr><th>${a.subject}</th>${[1, 2, 3].map((k) => `<td>${U.fmtNum(S.best[a.id + '-' + k] || 0)}</td>`).join('')}</tr>`).join('')}
        <tr><th>Desafío del Día</th><td colspan="3">${U.fmtNum(S.best.daily || 0)}</td></tr><tr><th>Combate final</th><td colspan="3">${U.fmtNum(S.best['final-3'] || 0)}</td></tr></tbody></table>`;
    } else {
      body = S.diary.length ? `<ul class="log">${S.diary.slice(0, 60).map((d) => `<li><small>${U.prettyDate(d.d)}</small> ${U.esc(d.text)}</li>`).join('')}</ul>` : '<p class="center muted">Todavía no hay entradas. ¡Empieza tu aventura!</p>';
    }
    el.innerHTML = header('Diario de aventuras') + `<div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" type="button" class="tab ${k === tab ? 'sel' : ''}" aria-selected="${k === tab}" data-tab="${k}">${n}</button>`).join('')}</div><div class="panel">${body}</div>`;
    bindGo(el);
    U.$$('.tab', el).forEach((b) => b.addEventListener('click', () => { EZ.audio.play('click'); UI.render.diary(el, b.getAttribute('data-tab')); }));
  };

  /* ================= Ajustes ================= */
  UI.render.settings = function (el) {
    const s = EZ.save.settings;
    el.innerHTML = header('Ajustes') + `<div class="panel settings">
      <label class="field"><span>Música: <b id="v-music">${Math.round(s.music * 100)}%</b></span><input type="range" min="0" max="1" step="0.05" value="${s.music}" id="s-music"></label>
      <label class="field"><span>Efectos: <b id="v-sfx">${Math.round(s.sfx * 100)}%</b></span><input type="range" min="0" max="1" step="0.05" value="${s.sfx}" id="s-sfx"></label>
      <label class="toggle"><input type="checkbox" id="s-mute" ${s.mute ? 'checked' : ''}><span>Silenciar todo</span></label>
      <label class="toggle"><input type="checkbox" id="s-motion" ${s.reduceMotion ? 'checked' : ''}><span>Reducir animaciones intensas (sin temblores ni destellos)</span></label>
      <label class="toggle"><input type="checkbox" id="s-big" ${s.bigText ? 'checked' : ''}><span>Letra más grande</span></label>
      <label class="toggle"><input type="checkbox" id="s-speed" ${s.speedBonus ? 'checked' : ''}><span>Bonus por rapidez (nunca resta puntos)</span></label>
      <label class="field"><span>Curso</span><select id="s-curso">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${EZ.curso() === n ? 'selected' : ''}>${EZ.CURSO_NAMES[n]}</option>`).join('')}</select></label>
      <label class="toggle"><input type="checkbox" id="s-read" ${s.readAloud ? 'checked' : ''}><span>Leer las preguntas en voz alta automáticamente</span></label>
      <label class="field"><span>Vidas iniciales (en 1.º-5.º se suman vidas de apoyo)</span><select id="s-lives">${[3, 5, 7].map((n) => `<option value="${n}" ${s.lives === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="field"><span>Controles táctiles</span><select id="s-touch"><option value="auto" ${s.touch === 'auto' ? 'selected' : ''}>Automático</option><option value="always" ${s.touch === 'always' ? 'selected' : ''}>Mostrar siempre</option><option value="never" ${s.touch === 'never' ? 'selected' : ''}>Ocultar</option></select></label>
      <div class="danger-zone">
        <h3>Datos guardados en este navegador</h3>
        <p class="muted small">${EZ.store.isAvailable() ? 'El progreso se guarda solo en este dispositivo y este navegador.' : 'Tu navegador no permite guardar datos (¿modo privado?). Podrás jugar, pero no se recordará el progreso.'}</p>
        <button class="btn btn-ghost" type="button" id="s-rstats">Reiniciar estadísticas</button>
        <button class="btn btn-danger" type="button" id="s-reset">Reiniciar todo el progreso</button>
      </div>
      <p class="muted small">Eureka Drop v1.2 · Música y gráficos originales generados por código · Preguntas totales: ${EZ.AREAS.map((a) => a.subject + ' ' + EZ.questions.count(a.id)).join(', ')}.</p></div>`;
    bindGo(el);
    const apply = () => { EZ.store.persist(); EZ.audio.applySettings(); UI.applyA11y(); };
    $('#s-music', el).addEventListener('input', (e) => { s.music = +e.target.value; $('#v-music', el).textContent = Math.round(s.music * 100) + '%'; apply(); });
    $('#s-sfx', el).addEventListener('input', (e) => { s.sfx = +e.target.value; $('#v-sfx', el).textContent = Math.round(s.sfx * 100) + '%'; apply(); });
    $('#s-sfx', el).addEventListener('change', () => EZ.audio.play('coin'));
    $('#s-mute', el).addEventListener('change', (e) => { s.mute = e.target.checked; apply(); });
    $('#s-motion', el).addEventListener('change', (e) => { s.reduceMotion = e.target.checked; apply(); });
    $('#s-big', el).addEventListener('change', (e) => { s.bigText = e.target.checked; apply(); });
    $('#s-speed', el).addEventListener('change', (e) => { s.speedBonus = e.target.checked; apply(); });
    $('#s-curso', el).addEventListener('change', (e) => { s.curso = +e.target.value; apply(); });
    $('#s-read', el).addEventListener('change', (e) => { s.readAloud = e.target.checked; apply(); });
    $('#s-lives', el).addEventListener('change', (e) => { s.lives = +e.target.value; apply(); });
    $('#s-touch', el).addEventListener('change', (e) => { s.touch = e.target.value; apply(); EZ.controls.applyTouchSetting(); });
    $('#s-rstats', el).addEventListener('click', async () => { if (await UI.confirm('¿Borrar todas las estadísticas y récords?')) { EZ.store.resetStats(); UI.toast('Estadísticas reiniciadas.'); } });
    $('#s-reset', el).addEventListener('click', async () => {
      if (await UI.confirm('¿Seguro? Se borrará TODO: historia, monedas, logros, personaje y estadísticas. No se puede deshacer.')) { EZ.store.resetProgress(); UI.toast('Progreso reiniciado.'); UI.go('menu'); }
    });
  };
  UI.applyA11y = function () {
    document.body.classList.toggle('big-text', !!EZ.save.settings.bigText);
    document.body.classList.toggle('reduce-motion', !!EZ.save.settings.reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  /* ================= Resultados ================= */
  UI.showResults = function (run, sum) {
    UI._lastRun = run;
    UI.go('results', { run, sum });
    if (run.won) UI.confetti();
  };
  UI.render.results = function (el, arg) {
    const run = arg.run, sum = arg.sum;
    const total = run.ok + run.ko, pct = total ? Math.round((run.ok / total) * 100) : 0;
    const phrase = EZ.phrases.pick(run.won ? 'win' : 'lose');
    EZ.store.persist();
    const rival = EZ.story.rival(run.area, run.level);
    const area = EZ.area(run.area);
    const title = run.mode === 'daily' ? 'Desafío del Día' : run.mode === 'final' ? 'La nube del Borrón' : `${area.island} · ${EZ.LEVEL_NAMES[run.level]}`;
    const next = run.mode === 'story' && run.won && run.level < 3 ? run.level + 1 : null;
    el.innerHTML = `<div class="results ${run.won ? 'win' : 'lose'}">
      <div class="res-head"><span class="res-kicker">${run.won ? '¡VICTORIA!' : 'FIN DE LA PARTIDA'}</span><h1 class="res-title">${U.esc(phrase)}</h1><p class="muted">${U.esc(title)}</p></div>
      <canvas id="res-hero" width="260" height="240" aria-hidden="true"></canvas>
      <div class="res-score"><small>Puntuación</small><b>${U.fmtNum(run.score)}</b>${run.score > rival ? `<em class="beat">¡Has superado a Rayo (${U.fmtNum(rival)})!</em>` : `<em>Récord de Rayo: ${U.fmtNum(rival)}</em>`}</div>
      <div class="res-grid">
        <div><b>${run.ok}</b><small>${I.check} acertadas</small></div>
        <div><b>${run.ko}</b><small>${I.cross} falladas</small></div>
        <div><b>${pct}%</b><small>aciertos</small><span class="bar"><i style="width:${pct}%"></i></span></div>
        <div><b>${run.bestStreak}</b><small>mejor racha</small></div>
        <div><b>${run.coins}</b><small>${I.coin} monedas</small></div>
        <div><b>${run.items + run.relics.length + run.chests}</b><small>objetos</small></div>
        <div><b>${U.fmtTime(run.time)}</b><small>tiempo</small></div>
        <div><b>${run.stomps}</b><small>Borroncitos</small></div>
      </div>
      ${sum.notes.concat(sum.daily ? [sum.daily] : []).map((n) => `<p class="res-note">${U.esc(n)}</p>`).join('')}
      ${run.relics.length ? `<p class="res-note">${I.medal} Reliquia: <b>${run.relics.map(U.esc).join(', ')}</b></p>` : ''}
      ${sum.achievements.length ? `<div class="res-ach"><h3>Logros nuevos</h3>${sum.achievements.map((a) => `<span class="ach got">${I.trophy}<b>${U.esc(a.name)}</b></span>`).join('')}</div>` : ''}
      <div class="res-btns">
        ${run.wrong.length ? `<button class="btn btn-hint" id="r-review" type="button">${I.book}<span>Revisar errores (${run.wrong.length})</span></button>` : ''}
        ${run.won ? `<button class="btn btn-go" id="r-diploma" type="button">${I.medal}<span>Diploma</span></button>` : ''}
        ${next ? `<button class="btn btn-play" id="r-next" type="button" data-autofocus>${I.play}<span>Fase ${next}</span></button>` : ''}
        <button class="btn btn-play" id="r-retry" type="button" ${next ? '' : 'data-autofocus'}>${I.play}<span>Reintentar</span></button>
        <button class="btn btn-ghost" id="r-menu" type="button">Menú</button>
      </div><p class="menu-author">Eureka Drop · Diseñado por <b>David OZC</b> · CC BY-NC-ND 4.0</p></div>`;
    const cv = $('#res-hero', el), ctx = cv.getContext('2d');
    let t = 0;
    const loop = () => {
      if (!cv.isConnected) return;
      t += 1 / 60; ctx.clearRect(0, 0, 260, 240);
      ctx.save(); ctx.translate(130, 200); ctx.scale(2.2, 2.2);
      const z = run.won ? Math.abs(Math.sin(t * 4)) * 14 : 0;
      ART.drawPlayer(ctx, 0, 0, z, 'down', t, EZ.save.profile.avatar, { sad: !run.won, moving: run.won });
      ctx.restore();
      ART.drawChispa(ctx, 210, 70, t, 1.4);
      requestAnimationFrame(loop);
    };
    loop();
    const cfg = { mode: run.mode, area: run.mode === 'daily' ? 'mix' : run.mode === 'final' ? 'final' : run.area, level: run.level };
    if ($('#r-review', el)) $('#r-review', el).addEventListener('click', () => UI.go('review', run));
    if ($('#r-diploma', el)) $('#r-diploma', el).addEventListener('click', () => EZ.diploma.open(run, title));
    if ($('#r-next', el)) $('#r-next', el).addEventListener('click', () => EZ.game.start(Object.assign({}, cfg, { level: next })));
    $('#r-retry', el).addEventListener('click', () => EZ.game.start(cfg));
    $('#r-menu', el).addEventListener('click', () => UI.go(run.mode === 'story' ? 'map' : 'menu'));
  };

  /* ================= Revisión de errores ================= */
  UI.render.review = function (el, run) {
    run = run || UI._lastRun;
    el.innerHTML = `<header class="scr-head"><button class="btn btn-icon" type="button" id="rv-back" aria-label="Volver">${I.back}</button><h1 class="scr-title">Aprende de tus errores</h1></header>
      <div class="review-list">${run.wrong.map((w, i) => `<article class="rv">
        <header><span class="rv-n">${i + 1}</span><span class="rv-tag">${U.esc(EZ.area(w.q.area) ? EZ.area(w.q.area).subject : '')} · ${U.esc(w.q.bloque || '')}</span></header>
        <p class="rv-q">${U.esc(w.q.enunciado)}</p>
        ${w.q.visual ? `<div class="rv-vis">${EZ.challenge.renderVisual(w.q.visual, false)}</div>` : ''}
        ${w.q.tipo === 'listen' ? `<p class="muted">Audio: «${U.esc(w.q.audio)}»</p>` : ''}
        <p class="rv-yours">${I.cross} Tu respuesta: ${U.esc(EZ.questions.answerText(w.q, w.answer))}</p>
        <p class="rv-ok">${I.check} Correcta: <b>${U.esc(EZ.questions.correctText(w.q))}</b></p>
        ${w.q.explicacion ? `<p class="rv-exp">${I.bulb} ${U.esc(w.q.explicacion)}</p>` : ''}
      </article>`).join('')}</div>`;
    $('#rv-back', el).addEventListener('click', () => { U.$$('.screen').forEach((s) => s.classList.remove('show')); $('#scr-results').classList.add('show'); UI.current = 'results'; });
  };

  /* ================= Diálogos ================= */
  UI.dialog = function (lines) {
    return new Promise((resolve) => {
      const box = $('#dialog');
      let i = 0, typing = null, full = false;
      box.innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-live="polite"><canvas class="dlg-portrait" width="120" height="120" aria-hidden="true"></canvas>
        <div class="dlg-body"><b class="dlg-name"></b><p class="dlg-text"></p></div>
        <div class="dlg-btns"><button class="btn btn-ghost dlg-skip" type="button">Saltar</button><button class="btn btn-go dlg-next" type="button">Siguiente ▶</button></div></div>`;
      box.classList.add('show');
      const pc = $('.dlg-portrait', box), pctx = pc.getContext('2d');
      const txt = $('.dlg-text', box), nm = $('.dlg-name', box), next = $('.dlg-next', box);
      let t = 0, raf;
      const drawP = () => {
        const L = lines[i]; if (!L) return;
        t += 1 / 60; pctx.clearRect(0, 0, 120, 120);
        if (L.who === 'chispa') ART.drawChispa(pctx, 60, 64, t, 2.6);
        else if (L.who === 'borron') ART.drawBoss(pctx, 'final', 60, 118, t, { scale: 0.5 });
        else if (L.who === 'boss') ART.drawBoss(pctx, L.area === 'mix' ? 'final' : L.area, 60, 116, t, { scale: 0.5, freed: L.freed });
        else if (L.who === 'rayo') ART.drawPlayer(pctx, 60, 112, 0, 'down', t, { skin: 2, hair: 1, hairColor: 6, outfit: 6, acc: 'glasses' }, { scale: 1.6 });
        else if (L.who === 'npc') { const n = L.look || {}; ART.drawPlayer(pctx, 60, 112, 0, 'down', t, Object.assign({ acc: n.hat || 'none' }, n.look || { skin: 1, hair: 0, hairColor: 0, outfit: 2 }), { scale: 1.6 }); }
        raf = requestAnimationFrame(drawP);
      };
      const names = { chispa: 'Chispa', borron: 'El Borrón', rayo: 'Rayo (rival)' };
      const show = () => {
        const L = lines[i];
        nm.textContent = L.name || names[L.who] || '';
        full = false; clearInterval(typing);
        if (EZ.save.settings.reduceMotion) { txt.textContent = L.text; full = true; return; }
        let k = 0; txt.textContent = '';
        typing = setInterval(() => { k += 2; txt.textContent = L.text.slice(0, k); if (k >= L.text.length) { clearInterval(typing); full = true; } }, 18);
        EZ.audio.play('tick');
      };
      const adv = () => {
        if (!full) { clearInterval(typing); txt.textContent = lines[i].text; full = true; return; }
        i++;
        if (i >= lines.length) return end();
        show();
      };
      const end = () => { clearInterval(typing); cancelAnimationFrame(raf); document.removeEventListener('keydown', key, true); box.classList.remove('show'); box.innerHTML = ''; resolve(); };
      const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); adv(); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); end(); } };
      document.addEventListener('keydown', key, true);
      next.addEventListener('click', adv);
      $('.dlg-skip', box).addEventListener('click', end);
      show(); drawP();
      setTimeout(() => next.focus({ preventScroll: true }), 50);
    });
  };

  /* ================= Pausa, confirmación, avisos ================= */
  UI.showPause = function (onResume, onQuit) {
    const box = $('#pause'), s = EZ.save.settings;
    box.innerHTML = `<div class="pause-card" role="dialog" aria-modal="true" aria-labelledby="pz-t"><h2 id="pz-t">Pausa</h2>
      <button class="btn btn-play" type="button" id="pz-go">${I.play}<span>Continuar</span></button>
      <label class="field"><span>Música</span><input type="range" min="0" max="1" step="0.05" value="${s.music}" id="pz-m"></label>
      <label class="field"><span>Efectos</span><input type="range" min="0" max="1" step="0.05" value="${s.sfx}" id="pz-s"></label>
      <label class="toggle"><input type="checkbox" id="pz-mute" ${s.mute ? 'checked' : ''}><span>Silencio</span></label>
      <p class="muted small">Controles: flechas para moverte (corres si mantienes), ESPACIO salta, ENTER o clic interactúa, ESC pausa.</p>
      <p class="muted small">Eureka Drop · Diseñado por <b>David OZC</b> · CC BY-NC-ND 4.0</p>
      <button class="btn btn-ghost" type="button" id="pz-quit">Salir al menú</button></div>`;
    box.classList.add('show');
    const close = () => { document.removeEventListener('keydown', key, true); box.classList.remove('show'); box.innerHTML = ''; };
    const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); onResume(); } };
    document.addEventListener('keydown', key, true);
    $('#pz-go', box).addEventListener('click', () => { close(); onResume(); });
    $('#pz-m', box).addEventListener('input', (e) => { s.music = +e.target.value; EZ.audio.applySettings(); EZ.store.persist(); });
    $('#pz-s', box).addEventListener('input', (e) => { s.sfx = +e.target.value; EZ.audio.applySettings(); EZ.store.persist(); });
    $('#pz-mute', box).addEventListener('change', (e) => { s.mute = e.target.checked; EZ.audio.applySettings(); EZ.store.persist(); });
    $('#pz-quit', box).addEventListener('click', async () => { if (await UI.confirm('¿Salir? Perderás el progreso de esta partida.')) { close(); onQuit(); } });
    setTimeout(() => $('#pz-go', box).focus(), 50);
  };
  UI.confirm = function (text) {
    return new Promise((resolve) => {
      const box = $('#popup');
      box.innerHTML = `<div class="pop-card" role="alertdialog" aria-modal="true"><p>${U.esc(text)}</p><div class="row"><button class="btn btn-ghost" type="button" id="c-no">Cancelar</button><button class="btn btn-danger" type="button" id="c-yes">Sí</button></div></div>`;
      box.classList.add('show');
      const done = (v) => { document.removeEventListener('keydown', key, true); box.classList.remove('show'); box.innerHTML = ''; resolve(v); };
      const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); } };
      document.addEventListener('keydown', key, true);
      $('#c-no', box).addEventListener('click', () => done(false));
      $('#c-yes', box).addEventListener('click', () => done(true));
      setTimeout(() => $('#c-no', box).focus(), 50);
    });
  };
  UI.toast = function (text, kind, ms = 3600) {
    const wrap = $('#toasts');
    const t = U.el('div', { class: 'toast ' + (kind || '') }, U.esc(text));
    wrap.appendChild(t);
    while (wrap.children.length > 3) wrap.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms);
  };
  UI.achievementToast = function (a) {
    EZ.audio.play('achievement');
    const wrap = $('#toasts');
    const t = U.el('div', { class: 'toast ach-toast' }, `${I.trophy}<span><small>¡LOGRO DESBLOQUEADO!</small><b>${U.esc(a.name)}</b></span>`);
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 4200);
  };
  UI.banner = function (text) {
    const b = $('#banner');
    b.textContent = text;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(UI._bt); UI._bt = setTimeout(() => b.classList.remove('show'), 1900);
  };

  /** Confeti de celebración (respeta «reducir animaciones»). */
  UI.confetti = function () {
    if (EZ.save.settings.reduceMotion) return;
    const cv = U.el('canvas', { class: 'confetti', 'aria-hidden': 'true' });
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d'); cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#ffd23f', '#ff4f8b', '#4cc9f0', '#3ddc97', '#b98bff'];
    const ps = Array.from({ length: 160 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height, vy: U.rand(120, 280), vx: U.rand(-60, 60), r: U.rand(0, 6), c: U.pick(cols), w: U.rand(6, 12) }));
    let last = performance.now(), life = 4;
    const loop = (now) => {
      const dt = (now - last) / 1000; last = now; life -= dt;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => { p.y += p.vy * dt; p.x += p.vx * dt; p.r += dt * 5; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -3, p.w, 6); ctx.restore(); });
      if (life > 0) requestAnimationFrame(loop); else cv.remove();
    };
    requestAnimationFrame(loop);
  };

  /* ================= Fondo animado de los menús ================= */
  UI.bg = (function () {
    const cv = $('#bg'), ctx = cv.getContext('2d');
    let on = false, t = 0, last = 0;
    const clouds = Array.from({ length: 7 }, (_, i) => ({ x: Math.random(), y: 0.08 + Math.random() * 0.5, s: 0.6 + Math.random() * 0.9, v: 0.006 + Math.random() * 0.01 }));
    const isles = [[0.12, 0.72, 'mat'], [0.32, 0.86, 'len'], [0.55, 0.8, 'med'], [0.76, 0.88, 'ing'], [0.92, 0.7, 'ef']];
    const resize = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    window.addEventListener('resize', resize); resize();
    function frame(now) {
      if (!on) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const still = document.body.classList.contains('reduce-motion');
      t += still ? 0 : dt;
      const W = innerWidth, H = innerHeight;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1b1446'); g.addColorStop(0.55, '#3a2a8c'); g.addColorStop(1, '#ff7a9c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const sun = ctx.createRadialGradient(W * 0.8, H * 0.2, 10, W * 0.8, H * 0.2, 220);
      sun.addColorStop(0, 'rgba(255,230,140,0.55)'); sun.addColorStop(1, 'rgba(255,230,140,0)');
      ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 40; i++) { const sx = (i * 97) % W, sy = (i * 53) % (H * 0.5); ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t * 2 + i); ctx.fillRect(sx, sy, 2, 2); }
      ctx.globalAlpha = 1;
      clouds.forEach((c) => {
        c.x += c.v * (still ? 0 : dt); if (c.x > 1.2) c.x = -0.2;
        const x = c.x * W, y = c.y * H, s = c.s * 40;
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.arc(x + s, y + 6, s * 0.8, 0, 7); ctx.arc(x - s, y + 8, s * 0.7, 0, 7); ctx.fill();
      });
      isles.forEach(([fx, fy, id], i) => {
        const x = fx * W, y = fy * H + Math.sin(t * 1.2 + i) * 8, th = ART.THEMES[id];
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(x, y + 60, 80, 14, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#6e5c56'; ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - 70, y); ctx.quadraticCurveTo(x, y + 90, x + 70, y); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = th.floorA; ctx.beginPath(); ctx.ellipse(x, y, 72, 20, 0, 0, 7); ctx.fill(); ctx.stroke();
        ART.drawProp(ctx, th.props[0], x - 26, y + 4, t); ART.drawProp(ctx, th.props[1], x + 24, y + 6, t);
      });
      // globo
      const bx = W * 0.5 + Math.sin(t * 0.4) * W * 0.25, by = H * 0.32 + Math.sin(t * 1.3) * 12;
      ctx.strokeStyle = '#1b1446'; ctx.lineWidth = 3;
      ctx.fillStyle = '#ff4f8b'; ctx.beginPath(); ctx.arc(bx, by, 34, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(bx, by, 12, 34, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 20, by + 26); ctx.lineTo(bx - 10, by + 56); ctx.moveTo(bx + 20, by + 26); ctx.lineTo(bx + 10, by + 56); ctx.stroke();
      ctx.fillStyle = '#b5651d'; ART.rr(ctx, bx - 14, by + 54, 28, 18, 4); ctx.fill(); ctx.stroke();
      ART.drawChispa(ctx, bx + 52, by + 10, t, 1);
      requestAnimationFrame(frame);
    }
    return {
      start() { if (on) return; on = true; cv.style.display = 'block'; last = performance.now(); requestAnimationFrame(frame); },
      stop() { on = false; cv.style.display = 'none'; }
    };
  })();
})(window.EZ);
