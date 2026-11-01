/* ==========================================================
   EUREKA DROP · controls.js
   Teclado (flechas/WASD, Espacio, Enter, Esc), ratón y controles
   táctiles (cruceta analógica + botones SALTO y ACCIÓN).
   ========================================================== */
(function (EZ) {
  'use strict';
  const U = EZ.util;
  const C = (EZ.controls = {
    keys: { up: false, down: false, left: false, right: false },
    stick: { x: 0, y: 0, active: false },
    jump: false, action: false, active: false, onPause: null
  });
  const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };

  const blocked = () => U.$('#modal.show, #mini.show, #dialog.show, #pause.show');

  document.addEventListener('keydown', (e) => {
    if (!C.active) return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (blocked()) return;
    const k = KEYMAP[e.code];
    if (k) { C.keys[k] = true; e.preventDefault(); return; }
    if (e.code === 'Space') { if (!e.repeat) C.jump = true; e.preventDefault(); return; }
    if (e.key === 'Enter') { if (!e.repeat) C.action = true; e.preventDefault(); return; }
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { e.preventDefault(); if (C.onPause) C.onPause(); }
  });
  document.addEventListener('keyup', (e) => {
    const k = KEYMAP[e.code];
    if (k) C.keys[k] = false;
  });
  window.addEventListener('blur', () => C.reset());

  C.reset = function () {
    C.keys.up = C.keys.down = C.keys.left = C.keys.right = false;
    C.stick.x = C.stick.y = 0; C.stick.active = false;
    C.jump = C.action = false;
    const knob = U.$('#stick-knob'); if (knob) knob.style.transform = 'translate(-50%,-50%)';
  };

  /** Vector de movimiento normalizado (teclado + cruceta). */
  C.axis = function () {
    let x = (C.keys.right ? 1 : 0) - (C.keys.left ? 1 : 0);
    let y = (C.keys.down ? 1 : 0) - (C.keys.up ? 1 : 0);
    if (C.stick.active) { x = C.stick.x; y = C.stick.y; }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return { x, y };
  };
  C.consumeJump = () => { const j = C.jump; C.jump = false; return j; };
  C.consumeAction = () => { const a = C.action; C.action = false; return a; };

  /** Controles táctiles: se muestran según Ajustes (auto/siempre/nunca). */
  C.setupTouch = function () {
    const zone = U.$('#stick-zone'), base = U.$('#stick-base'), knob = U.$('#stick-knob');
    let id = null, cx = 0, cy = 0;
    const R = 50;
    const move = (px, py) => {
      let dx = px - cx, dy = py - cy;
      const m = Math.hypot(dx, dy);
      if (m > R) { dx = (dx / m) * R; dy = (dy / m) * R; }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      const nx = dx / R, ny = dy / R;
      const dead = Math.hypot(nx, ny) < 0.2;
      C.stick.x = dead ? 0 : nx; C.stick.y = dead ? 0 : ny;
    };
    zone.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      id = e.pointerId; zone.setPointerCapture(id);
      const r = base.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      C.stick.active = true; move(e.clientX, e.clientY);
    });
    zone.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e.clientX, e.clientY); });
    const end = (e) => { if (e.pointerId !== id) return; id = null; C.stick.active = false; C.stick.x = C.stick.y = 0; knob.style.transform = 'translate(-50%,-50%)'; };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
    U.$('#btn-jump').addEventListener('pointerdown', (e) => { e.preventDefault(); C.jump = true; });
    U.$('#btn-act').addEventListener('pointerdown', (e) => { e.preventDefault(); C.action = true; });
    C.applyTouchSetting();
  };
  C.applyTouchSetting = function () {
    const mode = EZ.save.settings.touch;
    const show = mode === 'always' || (mode === 'auto' && (U.isTouch() || matchMedia('(pointer: coarse)').matches));
    document.body.classList.toggle('touch-on', !!show);
  };
})(window.EZ);
