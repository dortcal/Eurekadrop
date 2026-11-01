/* ==========================================================
   EUREKA DROP · main.js
   Arranque: carga de preguntas, audio (tras el primer gesto),
   indicador de conexión y registro del Service Worker (PWA).
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util;

  EZ.ui.render.stats = EZ.stats.render;
  EZ.ui.applyA11y();
  U.$('#legal-splash').innerHTML = EZ.ui.legalHTML();
  EZ.game.init();
  EZ.controls.setupTouch();
  EZ.ui.bg.start();

  // Indicador discreto de conexión
  const net = U.$('#net');
  function netStatus(evt) {
    if (navigator.onLine) {
      net.hidden = true;
      if (evt) EZ.ui.toast('Conexión recuperada.', 'good', 2000);
    } else {
      net.hidden = false;
      net.innerHTML = EZ.icons.wifiOff + '<span>Sin conexión · el juego sigue funcionando</span>';
    }
  }
  window.addEventListener('online', netStatus);
  window.addEventListener('offline', netStatus);
  netStatus();

  // Service Worker: solo en http(s) (GitHub Pages, servidor local). «?nosw» lo desactiva para desarrollo.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/nosw/.test(location.search)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* sin modo offline */ });
    });
  }

  const btn = U.$('#btn-start');
  EZ.questions.loadAll().then((ok) => {
    if (!ok) { btn.textContent = 'No se pudieron cargar las preguntas'; return; }
    btn.disabled = false;
    btn.innerHTML = EZ.icons.play + '<span>PULSA PARA EMPEZAR</span>';
    btn.focus();
  });
  btn.addEventListener('click', () => {
    EZ.audio.init();
    EZ.audio.play('achievement');
    EZ.ui.go('menu');
  });
  // Atajo de depuración para pruebas automáticas (no afecta al juego)
  EZ.debug = { start: (area, level, mode) => { EZ.audio.init(); EZ.game.start({ mode: mode || 'quick', area: area || 'mat', level: level || 1 }); } };
})(window.EZ);
